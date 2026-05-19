"use server";

import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export type SignupState = { error?: string };

const USERNAME_RE = /^[a-z0-9._]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const email    = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const shopName = String(formData.get("shopName") || "").trim();

  if (!USERNAME_RE.test(username)) return { error: "Username must be 3–32 lowercase letters, digits, dots or underscores." };
  if (!EMAIL_RE.test(email))       return { error: "Enter a valid email address." };
  if (password.length < 8)         return { error: "Password must be at least 8 characters." };
  if (!shopName)                   return { error: "Shop name is required." };

  const [existingU, existingE] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);
  if (existingU) return { error: "Username is taken." };
  if (existingE) return { error: "Email is already registered." };

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { username, email, passwordHash, shopName },
  });

  await createSession(user.id);
  redirect("/");
}
