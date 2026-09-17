import { Temporal as PolyfillTemporal, Temporal } from "@js-temporal/polyfill";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

(globalThis as any).Temporal = PolyfillTemporal;

const { db } = await import("../../prisma/db.js");

import type { RegisterInput, LoginInput } from "./auth.schema.js";

const SALT_ROUNDS = 10;

const User = db.orm.public!.User!;

export async function registerUser(input: RegisterInput) {
  const existingUser = await User
    .where({ email: input.email })
    .all()
    .first();

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(
    input.password,
    SALT_ROUNDS,
  );

  const now =
    PolyfillTemporal.Now.instant() as unknown as Temporal.Instant;

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
  const user = await User
    .where({ email: input.email })
    .all()
    .first();

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isPasswordValid = await bcrypt.compare(
    input.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
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

function generateToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
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