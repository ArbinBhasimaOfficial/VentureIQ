
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

import { db } from "../../prisma/db.js";

import type {
  ListUsersQuery,
  UpdateUserRoleInput,
  CreateReportInput,
} from "./admin.schema.js";

const User = db.orm.public!.User!;
const MarketReport = db.orm.public!.MarketReport!;
const MarketCategory = db.orm.public!.MarketCategory!;
const UploadedFile = db.orm.public!.UploadedFile!;

function safeUser(user: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: unknown;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

/*
 * ---------------------------------------------------------
 * USER MANAGEMENT
 * ---------------------------------------------------------
 */

export async function listUsers(
  query: ListUsersQuery,
) {
  const {
    page,
    limit,
    role,
    search,
  } = query;

  const skip = (page - 1) * limit;

  let usersQuery = User;

  if (role) {
    usersQuery = usersQuery.where({
      role,
    });
  }

  if (search) {
    const normalizedSearch =
      search.trim().toLowerCase();

    if (normalizedSearch) {
      const users = await usersQuery
        .orderBy((user) =>
          user.createdAt.desc(),
        )
        .all();

      const filteredUsers = users.filter(
        (user) =>
          user.name
            .toLowerCase()
            .includes(normalizedSearch) ||
          user.email
            .toLowerCase()
            .includes(normalizedSearch),
      );

      const paginatedUsers =
        filteredUsers.slice(
          skip,
          skip + limit,
        );

      return {
        users: paginatedUsers.map(safeUser),
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          totalPages: Math.ceil(
            filteredUsers.length / limit,
          ),
        },
      };
    }
  }

  const users = await usersQuery
    .orderBy((user) =>
      user.createdAt.desc(),
    )
    .limit(skip + limit)
    .all();

  const paginatedUsers = users.slice(
    skip,
    skip + limit,
  );

  return {
    users: paginatedUsers.map(safeUser),
    pagination: {
      page,
      limit,
      total: users.length,
      totalPages:
        users.length < skip + limit
          ? Math.ceil(
              (skip + paginatedUsers.length) /
                limit,
            )
          : page + 1,
    },
  };
}

export async function updateUserRole(
  targetUserId: string,
  requesterId: string,
  input: UpdateUserRoleInput,
) {
  if (targetUserId === requesterId) {
    throw new Error(
      "CANNOT_MODIFY_SELF",
    );
  }

  const user = await User
    .where({
      id: targetUserId,
    })
    .all()
    .first();

  if (!user) {
    throw new Error(
      "USER_NOT_FOUND",
    );
  }

  const updatedUser =
    await User
      .where({
        id: targetUserId,
      })
      .update({
        role: input.role,
      });

  if (!updatedUser) {
    throw new Error(
      "USER_NOT_FOUND",
    );
  }

  return safeUser(updatedUser);
}

export async function setUserActiveStatus(
  targetUserId: string,
  requesterId: string,
  isActive: boolean,
) {
  if (targetUserId === requesterId) {
    throw new Error(
      "CANNOT_MODIFY_SELF",
    );
  }

  const user = await User
    .where({
      id: targetUserId,
    })
    .all()
    .first();

  if (!user) {
    throw new Error(
      "USER_NOT_FOUND",
    );
  }

  const updatedUser =
    await User
      .where({
        id: targetUserId,
      })
      .update({
        isActive,
      });

  if (!updatedUser) {
    throw new Error(
      "USER_NOT_FOUND",
    );
  }

  return safeUser(updatedUser);
}

/*
 * ---------------------------------------------------------
 * REPORT MANAGEMENT
 * ---------------------------------------------------------
 */

function safeReport(report: {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: string;
  industry: string;
  region: string | null;
  categoryId: string;
  authorId: string;
  createdAt: unknown;
  updatedAt: unknown;
}) {
  return {
    id: report.id,
    title: report.title,
    slug: report.slug,
    summary: report.summary,
    content: report.content,
    status: report.status,
    industry: report.industry,
    region: report.region,
    categoryId: report.categoryId,
    authorId: report.authorId,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };
}

/**
 * Create a new MarketReport
 */
export async function createReport(
  authorId: string,
  input: CreateReportInput,
) {
  /*
   * Verify category exists
   */
  const category = await MarketCategory
    .where({
      id: input.categoryId,
    })
    .all()
    .first();

  if (!category) {
    throw new Error(
      "CATEGORY_NOT_FOUND",
    );
  }

  /*
   * Prevent duplicate slugs
   */
  const existingReport =
    await MarketReport
      .where({
        slug: input.slug,
      })
      .all()
      .first();

  if (existingReport) {
    throw new Error(
      "REPORT_SLUG_EXISTS",
    );
  }

  /*
   * Create report
   */
  const report =
    await MarketReport.create({
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      content: input.content,
      status: input.status,
      industry: input.industry,
      region: input.region ?? null,
      categoryId: input.categoryId,
      authorId,
    });

  return safeReport(report);
}

/**
 * Upload a PDF and attach it to a report
 */
export async function uploadReportPdf(
  reportId: string,
  uploadedById: string,
  file: Express.Multer.File,
) {
  /*
   * Verify report exists
   */
  const report = await MarketReport
    .where({
      id: reportId,
    })
    .all()
    .first();

  if (!report) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  /*
   * Validate MIME type
   */
  if (file.mimetype !== "application/pdf") {
    throw new Error(
      "INVALID_FILE_TYPE",
    );
  }

  /*
   * 20 MB maximum
   */
  const MAX_FILE_SIZE =
    20 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "FILE_TOO_LARGE",
    );
  }

  /*
   * Generate secure filename
   */
  const randomName =
    crypto.randomUUID();

  const storedName =
    `${randomName}.pdf`;

  /*
   * Storage directory
   */
  const uploadDirectory =
    path.resolve(
      process.cwd(),
      "uploads",
      "reports",
    );

  await fs.mkdir(
    uploadDirectory,
    {
      recursive: true,
    },
  );

  const filePath =
    path.join(
      uploadDirectory,
      storedName,
    );

  /*
   * Move/write uploaded file
   *
   * Multer can provide either buffer
   * or a temporary path depending on
   * the configured storage engine.
   */
  if (file.buffer) {
    await fs.writeFile(
      filePath,
      file.buffer,
    );
  } else if (file.path) {
    await fs.rename(
      file.path,
      filePath,
    );
  } else {
    throw new Error(
      "FILE_STORAGE_ERROR",
    );
  }

  /*
   * Store metadata in UploadedFile
   */
  try {
    const uploadedFile =
      await UploadedFile.create({
        originalName:
          file.originalname,
        storedName,
        mimeType:
          file.mimetype,
        size: file.size,
        path: filePath,
        reportId,
        uploadedById,
      });

    return {
      id: uploadedFile.id,
      originalName:
        uploadedFile.originalName,
      storedName:
        uploadedFile.storedName,
      mimeType:
        uploadedFile.mimeType,
      size:
        uploadedFile.size,
      path:
        uploadedFile.path,
      reportId:
        uploadedFile.reportId,
      createdAt:
        uploadedFile.createdAt,
    };
  } catch (error) {
    /*
     * Remove physical file if
     * database insertion fails.
     */
    await fs.unlink(filePath).catch(
      () => undefined,
    );

    throw error;
  }
}

/**
 * Delete a MarketReport
 */
export async function deleteReport(
  reportId: string,
  requesterId: string,
) {
  const report = await MarketReport
    .where({
      id: reportId,
    })
    .all()
    .first();

  if (!report) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  /*
   * Find files attached to this report
   * before deleting the database records.
   */
  const files = await UploadedFile
    .where({
      reportId,
    })
    .all();

  /*
   * Delete the report.
   *
   * Prisma schema uses onDelete: Cascade
   * for Dataset, Alert, UploadedFile and
   * TrendReport relationships where defined.
   */
  const deleted =
    await MarketReport
      .where({
        id: reportId,
      })
      .delete();

  if (!deleted) {
    throw new Error(
      "REPORT_NOT_FOUND",
    );
  }

  /*
   * Delete physical PDF files.
   */
  for (const file of files) {
    if (file.path) {
      await fs.unlink(
        file.path,
      ).catch(
        () => undefined,
      );
    }
  }

  return {
    id: reportId,
    deletedBy: requesterId,
  };
}
