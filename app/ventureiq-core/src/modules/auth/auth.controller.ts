
import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { loginUser, registerUser } from "./auth.service.js";

export async function register(req: Request, res: Response) {
  const validation = registerSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  try {
    const authResult = await registerUser(validation.data);

    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: authResult,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_ALREADY_EXISTS") {
      return res.status(409).json({
        status: "error",
        message: "Email is already registered",
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response) {
  const validation = loginSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  try {
    const authResult = await loginUser(validation.data);

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: authResult,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    console.error("Login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}
