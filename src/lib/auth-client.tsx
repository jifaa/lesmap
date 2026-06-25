"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/auth-types";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserProfile | null;
}) {
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();
        if (profileError) {
          console.error("Error fetching profile on refresh:", profileError);
        } else if (profile) {
          setUser(profile);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setUser(null);
    // Call server route to clear server-side session cookies (HttpOnly cookies)
    try {
      await fetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore fetch errors
    }
    // Also sign out on client side to clear local storage/non-HttpOnly cookies
    await supabase.auth.signOut();
    // Force full page navigation so middleware re-evaluates with cleared cookies
    window.location.replace("/");
  };

  // Listen for auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (profileError) {
            console.error("Error fetching profile on auth change:", profileError);
          } else if (profile) {
            setUser(profile);
          }
        } catch (err) {
          console.error("Unexpected profile fetch error on auth change:", err);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isAuthenticated,
        refreshUser,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
