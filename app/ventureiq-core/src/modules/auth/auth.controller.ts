import type { Request, Response } from "express";

import {
  loginSchema,
  registerSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "./auth.schema.js";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "./auth.service.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";

export const register = asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError("Validation failed", 400);
  }

  const authResult = await registerUser(validation.data);

  return res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: authResult,
  });
});

export const login = asyncHandler(async (req, res) => {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    throw new AppError("Validation failed", 400);
  }

  const authResult = await loginUser(validation.data);

  return res.status(200).json({
    status: "success",
    message: "Login successful",
    data: authResult,
  });
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const user = await getCurrentUser(req.user.userId);

  return res.status(200).json({
    status: "ok",
    data: user,
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const parsed = updateProfileSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Validation failed", 400);
  }

  const user = await updateProfile(req.user.userId, parsed.data);

  return res.status(200).json({
    status: "ok",
    data: user,
  });
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new AppError("Not authenticated", 401);
  }

  const parsed = changePasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError("Validation failed", 400);
  }

  await changePassword(req.user.userId, parsed.data);

  return res.status(200).json({
    status: "ok",
    message: "Password updated successfully",
  });
});
