"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "../lib/credentials";
import { setSessionCookie } from "../lib/session";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Email atau password tidak sesuai." };
  }

  if (!verifyCredentials(username, password)) {
    return { error: "Email atau password tidak sesuai." };
  }

  await setSessionCookie(username);
  redirect("/tasks");
}
