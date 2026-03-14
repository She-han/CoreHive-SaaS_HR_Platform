import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/src/services/api/auth";
import { storage } from "@/src/services/storage";
import { registerUnauthorizedHandler } from "@/src/services/api/client";
import type { LoginResponse } from "@/src/types/models";

type AuthContextValue = {
  user: LoginResponse | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const signOut = async () => {
    setUser(null);
    await storage.clearAuth();
  };

  const bootstrap = useCallback(async () => {
    setIsBootstrapping(true);
    try {
      const token = await storage.getToken();
      const localUser = await storage.getUser<LoginResponse>();
      if (!token || !localUser) {
        await signOut();
        return;
      }

      const me = await authApi.me();
      setUser(me);
      await storage.saveUser(me);
    } catch {
      await signOut();
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    const login = await authApi.login({ email, password });
    await storage.saveToken(login.token);
    await storage.saveUser(login);
    setUser(login);
  };

  useEffect(() => {
    registerUnauthorizedHandler(async () => {
      await signOut();
    });
    bootstrap();
    return () => {
      registerUnauthorizedHandler(null);
    };
  }, [bootstrap]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      signIn,
      signOut
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
