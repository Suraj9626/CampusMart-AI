"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Profile, UserRole } from "@/types/database";
import { MOCK_PROFILES } from "./store/mock-data";
import { isCollegeEmailApproved, isValidStudentEmail, parseSjcemStudentEmail } from "./constants";
import { createClient } from "./supabase/client";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  pendingVerificationEmail: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    displayName: string;
    email: string;
    password: string;
    department: string;
    academicYear: Profile['academic_year'];
  }) => Promise<{ success: boolean; error?: string; verificationPending?: boolean }>;
  logout: () => Promise<void>;
  switchMockUser: (userId: string) => void;
  resendVerification: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      try {
        const supabase = createClient();
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser(profile);
              setIsEmailVerified(Boolean(session.user.email_confirmed_at));
              localStorage.setItem("cm_current_user", JSON.stringify(profile));
              setIsLoading(false);
              return;
            }
          }
        }

        // Check if user is stored in localStorage AND has an active session cookie
        const hasSessionCookie = typeof document !== 'undefined' && document.cookie.includes("cm_session");
        const savedUser = localStorage.getItem("cm_current_user");
        const savedVerified = localStorage.getItem("cm_email_verified");
        const savedPending = localStorage.getItem("cm_pending_email");

        if (savedUser && hasSessionCookie) {
          try {
            const parsed = JSON.parse(savedUser);
            // Legacy mock user auto-login purge
            if (!parsed || parsed.id === 'usr-alex-chen' || parsed.id === 'usr-1') {
              localStorage.removeItem("cm_current_user");
              if (typeof document !== 'undefined') {
                document.cookie = "cm_session=; path=/; max-age=0";
              }
              setUser(null);
            } else {
              setUser(parsed);
              setIsEmailVerified(savedVerified !== "false");
              setPendingVerificationEmail(savedPending || null);
            }
          } catch {
            setUser(null);
          }
        } else {
          // If no active session cookie, wipe legacy localStorage and keep unauthenticated
          if (typeof window !== 'undefined') {
            localStorage.removeItem("cm_current_user");
          }
          setUser(null);
          setIsEmailVerified(false);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Check student college email or Gmail
      if (!isValidStudentEmail(cleanEmail)) {
        setIsLoading(false);
        return { 
          success: false, 
          error: "Invalid email ID or password." 
        };
      }

      // 1. Check live Supabase Auth first if configured
      const supabase = createClient();
      if (supabase) {
        // Try password with prefix for 4-digit PIN or raw
        const candidatePasswords = [password];
        if (password.length === 4 && /^\d{4}$/.test(password)) {
          candidatePasswords.unshift(`sjcem_${password}`);
        }

        let data: any = null;
        let error: any = null;

        for (const candidate of candidatePasswords) {
          const attempt = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: candidate,
          });
          data = attempt.data;
          error = attempt.error;

          // If unconfirmed, automatically auto-confirm with admin API and retry immediately
          if (error && (error.message?.toLowerCase().includes("email not confirmed") || (error as any).code === "email_not_confirmed")) {
            try {
              const confirmRes = await fetch('/api/auth/auto-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: cleanEmail }),
              });
              if (confirmRes.ok) {
                const retry = await supabase.auth.signInWithPassword({
                  email: cleanEmail,
                  password: candidate,
                });
                data = retry.data;
                error = retry.error;
              }
            } catch (confirmErr) {
              console.error("Auto-confirm error during login:", confirmErr);
            }
          }

          if (!error && data?.user) break;
        }

        if (!error && data?.user) {
          // Fetch or self-heal profile
          let { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (!profile) {
            const newProf: Profile = {
              id: data.user.id,
              display_name: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
              college_email: cleanEmail,
              department: data.user.user_metadata?.department || 'Computer Science & Engineering',
              academic_year: data.user.user_metadata?.academic_year || 'Freshman',
              role: 'student',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            await supabase.from("profiles").upsert(newProf);
            profile = newProf;
          }

          setUser(profile);
          setIsEmailVerified(true);
          if (typeof document !== 'undefined') {
            document.cookie = `cm_session=${encodeURIComponent(cleanEmail)}; path=/; max-age=604800; SameSite=Lax`;
          }
          localStorage.setItem("cm_current_user", JSON.stringify(profile));
          localStorage.setItem("cm_email_verified", "true");
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Check locally registered credentials cache
      if (typeof window !== 'undefined') {
        try {
          const registeredCreds = localStorage.getItem("cm_registered_credentials");
          if (registeredCreds) {
            const accounts = JSON.parse(registeredCreds);
            const matched = accounts.find((a: any) => a.email.toLowerCase() === cleanEmail && a.password === password);
            if (matched) {
              setUser(matched.profile);
              setIsEmailVerified(true);
              if (typeof document !== 'undefined') {
                document.cookie = `cm_session=${encodeURIComponent(cleanEmail)}; path=/; max-age=604800; SameSite=Lax`;
              }
              localStorage.setItem("cm_current_user", JSON.stringify(matched.profile));
              localStorage.setItem("cm_email_verified", "true");
              setIsLoading(false);
              return { success: true };
            }
          }
        } catch (e) {
          console.warn("Local credentials lookup:", e);
        }
      }

      setIsLoading(false);
      return { success: false, error: "Invalid email ID or password." };
    } catch {
      setIsLoading(false);
      return { success: false, error: "Invalid email ID or password." };
    }
  };

  const register = async (data: {
    displayName: string;
    email: string;
    password: string;
    department: string;
    academicYear: Profile['academic_year'];
  }): Promise<{ success: boolean; error?: string; verificationPending?: boolean }> => {
    setIsLoading(true);
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanPassword = data.password.trim();

    const sjcem = parseSjcemStudentEmail(cleanEmail);
    if (!sjcem.isValid || !sjcem.expectedPin) {
      setIsLoading(false);
      return { 
        success: false, 
        error: "Registration is restricted to college emails in the format 125[name][4-digit]@sjcem.edu.in (e.g. 125suraj6041@sjcem.edu.in)." 
      };
    }

    if (cleanPassword !== sjcem.expectedPin) {
      setIsLoading(false);
      return { 
        success: false, 
        error: `Registration failed: Password must be the exact 4-digit number from your college email (${sjcem.expectedPin}).` 
      };
    }

    try {
      // 1. Register through our server API for guaranteed auto-confirmed account creation in Supabase
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: data.password,
          displayName: data.displayName,
          department: data.department,
          academicYear: data.academicYear,
        }),
      });

      const regData = await regRes.json();

      if (!regRes.ok || !regData.success) {
        setIsLoading(false);
        return { success: false, error: regData.error || "Registration failed. Please try again." };
      }

      const newProfile: Profile = regData.user || {
        id: `u-${Date.now().toString(36)}`,
        display_name: data.displayName,
        college_email: cleanEmail,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
        department: data.department,
        academic_year: data.academicYear,
        role: "student",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Also cache locally for instant fast recovery
      if (typeof window !== 'undefined') {
        try {
          const registeredCreds = localStorage.getItem("cm_registered_credentials");
          let accounts: any[] = [];
          if (registeredCreds) {
            try {
              accounts = JSON.parse(registeredCreds);
            } catch {}
          }
          accounts.push({
            email: cleanEmail,
            password: data.password,
            profile: newProfile,
          });
          localStorage.setItem("cm_registered_credentials", JSON.stringify(accounts));
        } catch (e) {
          console.warn("Failed caching credentials:", e);
        }
      }

      // Try automatic sign in immediately so user is ready
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: `sjcem_${cleanPassword}`,
        });
      }

      setPendingVerificationEmail(null);
      setIsEmailVerified(true);
      setIsLoading(false);
      return { success: true, verificationPending: false };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to complete registration." };
    }
  };

  const logout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof document !== 'undefined') {
      document.cookie = "cm_session=; path=/; max-age=0; SameSite=Lax";
    }
    setUser(null);
    setIsEmailVerified(false);
    localStorage.removeItem("cm_current_user");
    localStorage.removeItem("cm_email_verified");
    localStorage.removeItem("cm_pending_email");
  };

  const switchMockUser = (_userId: string) => {
    console.warn("Account switching without credentials is disabled. Please sign out to log in as another student.");
  };

  const resendVerification = async (email: string) => {
    // Simulate or execute resend
    setPendingVerificationEmail(email);
    return true;
  };

  const resetPassword = async (email: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, message: "Please enter a valid college email address." };
    }
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
      if (error) {
        return { success: false, message: error.message };
      }
    }
    return { 
      success: true, 
      message: "If an account matches this student address, a password reset link has been dispatched." 
    };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem("cm_current_user", JSON.stringify(updated));
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isEmailVerified,
        pendingVerificationEmail,
        login,
        register,
        logout,
        switchMockUser,
        resendVerification,
        resetPassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
