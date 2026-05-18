"use server";

import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  if (!username || !password) return { error: "Username and password are required." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Invalid credentials." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid credentials." };

  await createSession(user.id);
  redirect("/");
}
