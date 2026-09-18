"use client";

import { isAxiosError } from "axios";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useTranslation } from "@/context/languageContext";
import { useLogin } from "@/hooks/use.auth";

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginMutation.mutateAsync({ email, password, rememberMe });
      router.replace("/dashboard");
    } catch (requestError) {
      if (isAxiosError<{ message?: string; error?: string }>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            requestError.response?.data?.error ??
            "Unable to sign in. Check your details and try again.",
        );
      } else {
        setError("Unable to sign in right now. Please try again.");
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

      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="space-y-2.5">
          <label htmlFor="email" className="text-xs font-semibold tracking-wide text-gray-400">
            {t("emailLabel")}
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              className="w-full rounded-xl border border-white/[0.06] bg-[#0a0f11] px-4 py-3.5 pr-10 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-[#1DE4EC]/40 focus:bg-[#0c1315]"
            />
            <Mail className="absolute right-3.5 top-4 h-4 w-4 text-gray-600" aria-hidden="true" />
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="password" className="text-xs font-semibold tracking-wide text-gray-400">
              {t("passwordLabel")}
            </label>
            <Link
              href="/forgot-password"
              className="text-[#1DE4EC] transition-colors hover:text-[#2ff4fc]"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
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

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-medium text-gray-400 hover:text-gray-300">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[#1DE4EC]"
          />
          {t("rememberMe")}
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-transparent bg-cyan-400 px-6 py-3.5 text-xs font-bold uppercase tracking-widest text-zinc-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-400 hover:bg-zinc-950 hover:text-cyan-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("signInBtn")}
        </button>
      </form>
    </>
  );
}
