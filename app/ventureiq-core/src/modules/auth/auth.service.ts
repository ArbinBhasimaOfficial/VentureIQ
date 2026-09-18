import { Temporal as PolyfillTemporal, Temporal } from "@js-temporal/polyfill";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { AppError } from "../../utils/AppError.js";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("../../prisma/db.js");

import type {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
  ChangePasswordInput,
} from "./auth.schema.js";

const SALT_ROUNDS = 10;

const User = db.orm.public!.User!;

export async function registerUser(input: RegisterInput) {
  const existingUser = await User.where({ email: input.email }).all().first();

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const now = PolyfillTemporal.Now.instant() as unknown as Temporal.Instant;

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: hashedPassword,
    role: "USER",
    createdAt: now,
    updatedAt: now,
  });

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await User.where({ email: input.email }).all().first();

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  const isPasswordValid = await bcrypt.compare(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user.id, user.role);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const existingUser = await User.where({ id: userId }).all().first();

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (input.email && input.email !== existingUser.email) {
    const emailUser = await User.where({ email: input.email }).all().first();

    if (emailUser && emailUser.id !== userId) {
      throw new AppError("Email already in use", 409);
    }
  }

  const updateData: {
    name?: string;
    email?: string;
  } = {};

  if (input.name !== undefined) {
    updateData.name = input.name;
  }

  if (input.email !== undefined) {
    updateData.email = input.email;
  }

  const updatedUser = await User.where({ id: userId }).update(updateData);

  if (!updatedUser) {
    throw new AppError("User not found", 404);
  }

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    createdAt: updatedUser.createdAt,
  };
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await User.where({ id: userId }).all().first();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const isValid = await bcrypt.compare(input.currentPassword, user.password);

  if (!isValid) {
    throw new AppError("Current password is incorrect", 401);
  }

  const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS);

  await User.where({ id: userId }).update({
    password: hashedPassword,
  });
}

export async function getCurrentUser(userId: string) {
  const user = await User.where({ id: userId }).all().first();

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function generateToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }

  return jwt.sign(
    {
      userId,
      role,
    },
    secret,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    } as jwt.SignOptions,
  );
}
