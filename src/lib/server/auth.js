import "server-only";

import { createClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase authentication environment variables."
    );
  }

  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

function getAccessToken(request) {
  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorization
    .slice("Bearer ".length)
    .trim();

  return accessToken || null;
}

export async function getAuthenticatedUser(
  request
) {
  const accessToken = getAccessToken(request);

  if (!accessToken) {
    return null;
  }

  const authClient = createAuthClient();

  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(accessToken);

  if (error || !user) {
    if (
      error &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "Authentication failed:",
        error
      );
    }

    return null;
  }

  return user;
}

export async function getAuthenticatedUserId(
  request
) {
  const user =
    await getAuthenticatedUser(request);

  return user?.id ?? null;
}

export async function getProfileData(userId) {
  if (!userId) {
    return {
      isAdmin: false,
      username: null,
    };
  }

  const { data: profile, error } =
    await supabaseAdmin
      .from("profiles")
      .select("is_admin, username")
      .eq("id", userId)
      .maybeSingle();

  if (error) {
    console.error(
      "Profile lookup failed:",
      error
    );

    return {
      isAdmin: false,
      username: null,
    };
  }

  const username =
    typeof profile?.username === "string" &&
    profile.username.trim()
      ? profile.username.trim().slice(0, 255)
      : null;

  return {
    isAdmin: profile?.is_admin === true,
    username,
  };
}

export async function requireAdmin(request) {
  const user =
    await getAuthenticatedUser(request);

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Authentication required",
      user: null,
      profile: null,
    };
  }

  const profile = await getProfileData(user.id);

  if (!profile.isAdmin) {
    return {
      authorized: false,
      status: 403,
      error: "Administrator access required",
      user,
      profile,
    };
  }

  return {
    authorized: true,
    status: 200,
    error: null,
    user,
    profile,
  };
}