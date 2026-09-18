import { db } from "../../prisma/db.js";

import { getOrSetCache, invalidateCache } from "../../utils/cache.js";

import { AppError } from "../../utils/AppError.js";

import {
  indexDocument,
  removeDocumentIndex,
} from "../search/search.service.js";

import { searchResultCache } from "../search/searchCache.js";

import type {
  CreateResearchInput,
  UpdateResearchInput,
  ListResearchQuery,
} from "./research.schema.js";

const Research = db.orm.public!.Research!;

const MarketCategory = db.orm.public!.MarketCategory!;

const User = db.orm.public!.User!;

const UploadedFile = db.orm.public!.UploadedFile!;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

// CREATE

export async function createResearch(
  input: CreateResearchInput,
  authorId: string,
) {
  const title = normalizeText(input.title);
  const summary = input.summary.trim();
  const content = input.content.trim();
  const slug = slugify(title);

  if (!title || !slug) {
    throw new AppError("Invalid research title", 400);
  }

  if (!summary) {
    throw new AppError("Research summary is required", 400);
  }

  if (!content) {
    throw new AppError("Research content is required", 400);
  }

  const author = await User.where({
    id: authorId,
  })
    .all()
    .first();

  if (!author) {
    throw new AppError("Author not found", 404);
  }

  if (input.categoryId) {
    const category = await MarketCategory.where({
      id: input.categoryId,
    })
      .all()
      .first();

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  const existing = await Research.where({
    slug,
  })
    .all()
    .first();

  if (existing) {
    throw new AppError("Research with this title already exists", 409);
  }

  const research = await Research.create({
    title,
    slug,
    summary,
    content,
    type: input.type ?? "ARTICLE",
    status: input.status ?? "DRAFT",
    categoryId: input.categoryId ?? null,
    authorId,
  });

  /*
   * Add Research to the BM25 search index.
   *
   * The title, summary, and content are all searchable.
   */
  await indexDocument(
    research.id,
    "RESEARCH",
    `${research.title} ${research.summary} ${research.content}`,
  );

  /*
   * A new searchable document may change existing search results.
   */
  searchResultCache.clear();

  await invalidateCache("research:list:*");

  await invalidateCache(`research:detail:${research.id}`);

  return research;
}

// LIST

export async function listResearch(
  query: ListResearchQuery,
  publicOnly: boolean,
) {
  const { page, limit, type, categoryId } = query;

  const cacheKey =
    `research:list:${publicOnly}:` +
    `${page}:${limit}:` +
    `${type || "all"}:` +
    `${categoryId || "all"}`;

  return getOrSetCache(cacheKey, 60, async () => {
    const skip = (page - 1) * limit;

    let researchQuery = Research;

    if (publicOnly) {
      researchQuery = researchQuery.where({
        status: "PUBLISHED",
      });
    }

    if (type) {
      researchQuery = researchQuery.where({
        type,
      });
    }

    if (categoryId) {
      researchQuery = researchQuery.where({
        categoryId,
      });
    }

    const research = await researchQuery
      .orderBy((item) => item.createdAt.desc())
      .limit(skip + limit)
      .all();

    const paginatedResearch = research.slice(skip, skip + limit);

    return {
      research: paginatedResearch,
      pagination: {
        page,
        limit,
        count: paginatedResearch.length,
      },
    };
  });
}

// GET ONE

export async function getResearchById(id: string, publicOnly: boolean) {
  const cacheKey = `research:detail:${id}:${publicOnly}`;

  return getOrSetCache(cacheKey, 300, async () => {
    const research = await Research.where({
      id,
    })
      .all()
      .first();

    if (!research) {
      throw new AppError("Research not found", 404);
    }

    if (publicOnly && research.status !== "PUBLISHED") {
      throw new AppError("Research not found", 404);
    }

    const category = research.categoryId
      ? await MarketCategory.where({
          id: research.categoryId,
        })
          .all()
          .first()
      : null;

    const author = await User.where({
      id: research.authorId,
    })
      .all()
      .first();

    const files = await UploadedFile.where({
      researchId: research.id,
    }).all();

    return {
      ...research,
      category,
      author,
      files: files.map((file) => ({
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        path: file.path,
        createdAt: file.createdAt,
      })),
    };
  });
}

// UPDATE

export async function updateResearch(id: string, input: UpdateResearchInput) {
  const existingResearch = await Research.where({
    id,
  })
    .all()
    .first();

  if (!existingResearch) {
    throw new AppError("Research not found", 404);
  }

  const updateData: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    type?: "ARTICLE" | "CASE_STUDY" | "WHITEPAPER" | "COMMENTARY";
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    categoryId?: string | null;
  } = {};

  if (input.title !== undefined) {
    const title = normalizeText(input.title);
    const slug = slugify(title);

    if (!title || !slug) {
      throw new AppError("Invalid research title", 400);
    }

    const existingSlug = await Research.where({
      slug,
    })
      .all()
      .first();

    if (existingSlug && existingSlug.id !== id) {
      throw new AppError("Research with this title already exists", 409);
    }

    updateData.title = title;
    updateData.slug = slug;
  }

  if (input.summary !== undefined) {
    const summary = input.summary.trim();

    if (!summary) {
      throw new AppError("Research summary is required", 400);
    }

    updateData.summary = summary;
  }

  if (input.content !== undefined) {
    const content = input.content.trim();

    if (!content) {
      throw new AppError("Research content is required", 400);
    }

    updateData.content = content;
  }

  if (input.type !== undefined) {
    updateData.type = input.type;
  }

  if (input.status !== undefined) {
    updateData.status = input.status;
  }

  if (input.categoryId !== undefined) {
    if (input.categoryId === null) {
      updateData.categoryId = null;
    } else {
      const category = await MarketCategory.where({
        id: input.categoryId,
      })
        .all()
        .first();

      if (!category) {
        throw new AppError("Category not found", 404);
      }

      updateData.categoryId = input.categoryId;
    }
  }

  /*
   * If nothing changed, return the existing Research
   * without unnecessarily rebuilding the search index.
   */
  if (Object.keys(updateData).length === 0) {
    return getResearchById(id, false);
  }

  const updatedResearch = await Research.where({
    id,
  }).update(updateData);

  if (!updatedResearch) {
    throw new AppError("Research not found", 404);
  }

  /*
   * Fetch the final Research record so the search index
   * contains the latest title, summary, and content.
   */
  const finalResearch = await Research.where({
    id,
  })
    .all()
    .first();

  if (!finalResearch) {
    throw new AppError("Research not found", 404);
  }

  /*
   * Rebuild the BM25 search index.
   */
  await indexDocument(
    finalResearch.id,
    "RESEARCH",
    `${finalResearch.title} ${finalResearch.summary} ${finalResearch.content}`,
  );

  /*
   * Existing search results may contain the old version.
   */
  searchResultCache.clear();

  await invalidateCache("research:list:*");

  await invalidateCache(`research:detail:${id}:*`);

  return getResearchById(id, false);
}

// DELETE

export async function deleteResearch(id: string) {
  const research = await Research.where({
    id,
  })
    .all()
    .first();

  if (!research) {
    throw new AppError("Research not found", 404);
  }

  /*
   * Remove Research from the BM25 search index first.
   */
  await removeDocumentIndex(id, "RESEARCH");

  /*
   * Remove stale search results from the L1 cache.
   */
  searchResultCache.clear();

  await Research.where({
    id,
  }).delete();

  await invalidateCache("research:list:*");

  await invalidateCache(`research:detail:${id}:*`);

  return research;
}
