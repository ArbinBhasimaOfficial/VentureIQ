"use client";

import { isAxiosError } from "axios";
import { Eye, EyeOff, Loader2, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useTranslation } from "@/context/languageContext";
import { useRegister } from "@/hooks/use.auth";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim();

    if (normalizedName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid business email address.");
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/\d/.test(password)
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase, lowercase, and a number.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerMutation.mutateAsync({
        name: normalizedName,
        email: normalizedEmail,
        password,
      });
      router.replace("/login");
    } catch (requestError) {
      if (isAxiosError<{ message?: string; error?: string }>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            requestError.response?.data?.error ??
            "Unable to create account. Check your details and try again.",
        );
      } else {
        setError("Unable to complete registration right now. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400"
        >
          {error}
        </div>
      )}

      <form className="space-y-5" onSubmit={handleRegister}>
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-semibold tracking-wide text-gray-400">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/[0.06] bg-[#0a0f11] px-4 py-3.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#1DE4EC]/40 focus:bg-[#0c1315]"
            />
            <User className="absolute right-3.5 top-4 h-4 w-4 text-gray-600" aria-hidden="true" />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold tracking-wide text-gray-400">
            {t("emailLabel")}
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.06] bg-[#0a0f11] px-4 py-3.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#1DE4EC]/40 focus:bg-[#0c1315]"
            />
            <Mail className="absolute right-3.5 top-4 h-4 w-4 text-gray-600" aria-hidden="true" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-semibold tracking-wide text-gray-400">
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/[0.06] bg-[#0a0f11] px-4 py-3.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#1DE4EC]/40 focus:bg-[#0c1315]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-4 text-gray-600 transition-colors hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold tracking-wide text-gray-400"
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full rounded-xl border border-white/[0.06] bg-[#0a0f11] px-4 py-3.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#1DE4EC]/40 focus:bg-[#0c1315]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3.5 top-4 text-gray-600 transition-colors hover:text-gray-300"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-cyan-400 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-400 hover:bg-zinc-950 hover:text-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("registerTab")}
        </button>
      </form>
    </>
  );
}
