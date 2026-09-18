import type { Request, Response } from "express";

import { listUsersQuerySchema, updateUserRoleSchema } from "./admin.schema.js";

import {
  listUsers,
  updateUserRole,
  setUserActiveStatus,
} from "./admin.service.js";

export async function getAllUsers(req: Request, res: Response) {
  const parsed = listUsersQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  const result = await listUsers(parsed.data);

  return res.status(200).json({
    status: "ok",
    ...result,
  });
}

export async function changeUserRole(req: Request, res: Response) {
  const parsed = updateUserRoleSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    });
  }

  try {
    const user = await updateUserRole(
      req.params.id as string,
      req.user!.userId,
      parsed.data,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "CANNOT_MODIFY_SELF") {
      return res.status(400).json({
        status: "error",
        message: "You cannot change your own role",
      });
    }

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Change user role error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

export async function deactivateUser(req: Request, res: Response) {
  try {
    const user = await setUserActiveStatus(
      req.params.id as string,
      req.user!.userId,
      false,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "CANNOT_MODIFY_SELF") {
      return res.status(400).json({
        status: "error",
        message: "You cannot deactivate your own account",
      });
    }

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Deactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

export async function reactivateUser(req: Request, res: Response) {
  try {
    const user = await setUserActiveStatus(
      req.params.id as string,
      req.user!.userId,
      true,
    );

    return res.status(200).json({
      status: "ok",
      data: user,
    });
  } catch (error) {
    const message = (error as Error).message;

    if (message === "USER_NOT_FOUND") {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    console.error("Reactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
