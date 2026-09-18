import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  rememberMe: boolean;
  hasHydrated: boolean;
  setAuth: (user: User, token?: string | null, rememberMe?: boolean) => void;
  clearAuth: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const authStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;

    return window.localStorage.getItem(name) ?? window.sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;

    const parsedValue = JSON.parse(value) as {
      state?: { token?: string | null; rememberMe?: boolean };
    };

    if (!parsedValue.state?.token) {
      window.localStorage.removeItem(name);
      window.sessionStorage.removeItem(name);
      return;
    }

    const storage = parsedValue.state.rememberMe ? window.localStorage : window.sessionStorage;
    const otherStorage = parsedValue.state.rememberMe ? window.sessionStorage : window.localStorage;

    storage.setItem(name, value);
    otherStorage.removeItem(name);
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(name);
    window.sessionStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      rememberMe: true,
      hasHydrated: false,

      setAuth: (user, token = null, rememberMe = true) => {
        set({
          user,
          token,
          rememberMe,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },
    }),
    {
      name: "ventureiq-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
      }),
      storage: createJSONStorage(() => authStorage),
    },
  ),
);
