"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { getMe, login, register } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: register,
    onSuccess: (response) => {
      setAuth(response.data.user, response.data.token);
    },
  });
}

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60 * 1000,
  });
}
