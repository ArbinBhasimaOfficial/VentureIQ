"use client";

import React, { createContext, useContext, useState } from "react";

// 1. Define a strict interface for the user data to eliminate 'any'
interface UserData {
  id: string;
  email: string;
}

interface AuthContextType {
  pendingEmail: string;
  setPendingEmail: (email: string) => void;
  userSession: UserData | null;
  setUserSession: (session: UserData | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 2. Use state initializer functions to read from localStorage synchronously on initialization.
  // This completely eliminates the need for a useEffect on mount and prevents cascading renders!
  const [pendingEmail, setPendingEmailState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nexus_pending_email") || "";
    }
    return "";
  });

  const [userSession, setUserSessionState] = useState<UserData | null>(() => {
    if (typeof window !== "undefined") {
      const savedSession = localStorage.getItem("nexus_session_user");
      return savedSession ? JSON.parse(savedSession) : null;
    }
    return null;
  });

  const setPendingEmail = (email: string) => {
    setPendingEmailState(email);
    if (email) {
      localStorage.setItem("nexus_pending_email", email);
    } else {
      localStorage.removeItem("nexus_pending_email");
    }
  };

  const setUserSession = (session: UserData | null) => {
    setUserSessionState(session);
    if (session) {
      localStorage.setItem("nexus_session_user", JSON.stringify(session));
    } else {
      localStorage.removeItem("nexus_session_user");
    }
  };

  const logout = () => {
    setUserSessionState(null);
    setPendingEmailState("");
    localStorage.removeItem("nexus_session_user");
    localStorage.removeItem("nexus_pending_email");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        pendingEmail,
        setPendingEmail,
        userSession,
        setUserSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be nested inside an AuthProvider element structure");
  return context;
}
