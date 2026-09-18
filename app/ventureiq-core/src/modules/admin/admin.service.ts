
import { db } from "../../prisma/db.js";

import type {
  ListUsersQuery,
  UpdateUserRoleInput,
} from "./admin.schema.js";

const User = db.orm.public!.User!;

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

  /*
   * This project currently uses the Prisma 8
   * contract ORM rather than Prisma Client's
   * findMany/count API.
   *
   * Therefore pagination metadata is derived
   * from the retrieved records here.
   */
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
