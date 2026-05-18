"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

// ---------- Jar sizes ----------

export async function createSize(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const sortOrder = Math.trunc(n(formData.get("sortOrder")));
  await prisma.jarSize.create({ data: { userId: user.id, name, sortOrder } });
  revalidatePath("/setup/sizes");
}

export async function updateSize(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const sortOrder = Math.trunc(n(formData.get("sortOrder")));
  const existing = await prisma.jarSize.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Size not found.");
  if (!name) throw new Error("Name required.");
  await prisma.jarSize.update({ where: { id: existing.id }, data: { name, sortOrder } });
  revalidatePath("/setup/sizes");
}

export async function deleteSize(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const existing = await prisma.jarSize.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Size not found.");

  const [jarsUsed, stickersUsed, recipesUsed] = await Promise.all([
    prisma.jar.count({ where: { sizeId: existing.id, OR: [{ stockQty: { gt: 0 } }, { unitCost: { gt: 0 } }] } }),
    prisma.sticker.count({ where: { sizeId: existing.id, OR: [{ stockQty: { gt: 0 } }, { unitCost: { gt: 0 } }] } }),
    prisma.candleRecipe.count({ where: { sizeId: existing.id } }),
  ]);

  if (recipesUsed > 0) throw new Error("Size is used by a recipe.");
  if (jarsUsed > 0)    throw new Error("Size has jar inventory with stock or cost set. Clear it first.");
  if (stickersUsed > 0)throw new Error("Size has sticker inventory with stock or cost set. Clear it first.");

  await prisma.$transaction(async (tx) => {
    await tx.jar.deleteMany({ where: { sizeId: existing.id } });
    await tx.sticker.deleteMany({ where: { sizeId: existing.id } });
    await tx.jarSize.delete({ where: { id: existing.id } });
  });
  revalidatePath("/setup/sizes");
}

// ---------- Jar colors ----------

export async function createColor(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const hex = String(formData.get("hex") || "#888888");
  const scentLine = String(formData.get("scentLine") || "").trim() || null;
  await prisma.jarColor.create({ data: { userId: user.id, name, hex, scentLine } });
  revalidatePath("/setup/colors");
}

export async function updateColor(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const hex = String(formData.get("hex") || "#888888");
  const scentLine = String(formData.get("scentLine") || "").trim() || null;
  const existing = await prisma.jarColor.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Color not found.");
  if (!name) throw new Error("Name required.");
  await prisma.jarColor.update({ where: { id: existing.id }, data: { name, hex, scentLine } });
  revalidatePath("/setup/colors");
}

export async function deleteColor(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const existing = await prisma.jarColor.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Color not found.");

  const [jarsUsed, stickersUsed, recipesUsed] = await Promise.all([
    prisma.jar.count({ where: { colorId: existing.id, OR: [{ stockQty: { gt: 0 } }, { unitCost: { gt: 0 } }] } }),
    prisma.sticker.count({ where: { colorId: existing.id, OR: [{ stockQty: { gt: 0 } }, { unitCost: { gt: 0 } }] } }),
    prisma.candleRecipe.count({ where: { colorId: existing.id } }),
  ]);
  if (recipesUsed > 0) throw new Error("Color is used by a recipe.");
  if (jarsUsed > 0)    throw new Error("Color has jar inventory with stock or cost set. Clear it first.");
  if (stickersUsed > 0)throw new Error("Color has sticker inventory with stock or cost set. Clear it first.");

  await prisma.$transaction(async (tx) => {
    await tx.jar.deleteMany({ where: { colorId: existing.id } });
    await tx.sticker.deleteMany({ where: { colorId: existing.id } });
    await tx.jarColor.delete({ where: { id: existing.id } });
  });
  revalidatePath("/setup/colors");
}

