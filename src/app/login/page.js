'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function checkUser() {
        const { data } =
        await supabase.auth.getUser();

        if (data.user) {
        router.replace("/");
        }
    }

  checkUser();
}, [router]);
  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-sm rounded border p-6">
        <h1 className="mb-6 text-2xl font-bold">
          Log in
        </h1>

        <form
          onSubmit={handleLogin}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={e =>
                setEmail(e.target.value)
              }
              className="w-full rounded border p-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={e =>
                setPassword(e.target.value)
              }
              className="w-full rounded border p-2"
              required
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {loading
              ? "Logging in..."
              : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}