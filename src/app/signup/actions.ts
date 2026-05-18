"use server";

import { prisma } from "@/lib/prisma";
import { createSession, hashPassword } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  DEFAULT_SIZES,
  DEFAULT_COLORS,
  DEFAULT_WICKS,
  DEFAULT_WICK_RULES,
} from "@/lib/constants";

export type SignupState = { error?: string };

const USERNAME_RE = /^[a-z0-9_]{3,32}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const email    = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!USERNAME_RE.test(username)) return { error: "Username must be 3–32 lowercase letters, digits or underscores." };
  if (!EMAIL_RE.test(email))       return { error: "Enter a valid email address." };
  if (password.length < 8)         return { error: "Password must be at least 8 characters." };

  const [existingU, existingE] = await Promise.all([
    prisma.user.findUnique({ where: { username } }),
    prisma.user.findUnique({ where: { email } }),
  ]);
  if (existingU) return { error: "Username is taken." };
  if (existingE) return { error: "Email is already registered." };

  const passwordHash = await hashPassword(password);

  const userId = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { username, email, passwordHash },
    });

    const sizes = await Promise.all(
      DEFAULT_SIZES.map((s) =>
        tx.jarSize.create({ data: { userId: user.id, name: s.name, sortOrder: s.sortOrder } })
      )
    );
    await Promise.all(
      DEFAULT_COLORS.map((c) =>
        tx.jarColor.create({ data: { userId: user.id, name: c.name, hex: c.hex, scentLine: c.scentLine } })
      )
    );
    const wicks = await Promise.all(
      DEFAULT_WICKS.map((w) =>
        tx.wick.create({ data: { userId: user.id, name: w.name } })
      )
    );
    const sizeByName = new Map(sizes.map((s) => [s.name, s.id]));
    const wickByName = new Map(wicks.map((w) => [w.name, w.id]));
    for (const r of DEFAULT_WICK_RULES) {
      await tx.wickRule.create({
        data: {
          userId: user.id,
          sizeId: sizeByName.get(r.sizeName)!,
          wickId: wickByName.get(r.wickName)!,
          qty: r.qty,
        },
      });
    }
    await tx.wickSticker.create({ data: { userId: user.id } });

    return user.id;
  });

  await createSession(userId);
  redirect("/");
}
