"use client";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function AccountPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const { user, profile, setProfile } = useAuth();

  async function saveUsername(e) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      username,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProfile({
      ...profile,
      username,
    });

    setMessage("Username saved.");
  }

  async function changePassword(e) {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setMessage("Password changed successfully.");
  }

  if (!user) {
    return <main className="p-6">You need to log in.</main>;
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Account</h1>

      <section>
        <p className="text-sm text-gray-600">Email</p>
        <p>{user.email}</p>
      </section>

      <form onSubmit={saveUsername} className="space-y-4">
        <h2 className="text-xl font-semibold">Profile</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border p-2"
        />

        <button className="rounded bg-black px-4 py-2 text-white">
          Save username
        </button>
      </form>

      <form onSubmit={changePassword} className="space-y-4">
        <h2 className="text-xl font-semibold">Change password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border p-2"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border p-2"
        />

        <button className="rounded bg-black px-4 py-2 text-white">
          Change password
        </button>
      </form>

      {message && <p className="text-sm">{message}</p>}
    </main>
  );
}