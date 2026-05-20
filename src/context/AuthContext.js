"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLoading(false);
        return;
      }

      setUser(data.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", data.user.id)
        .single();

      setProfile(profileData);

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", currentUser.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        setProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}