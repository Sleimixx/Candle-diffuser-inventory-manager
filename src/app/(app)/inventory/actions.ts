"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

// ---------- Categories ----------

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") || "").trim();
  const unit = String(formData.get("unit") || "pcs").trim() || "pcs";
  if (!name) return;
  await prisma.category.create({ data: { userId: user.id, name, unit } });
  revalidatePath("/inventory");
}

export async function updateCategory(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const unit = String(formData.get("unit") || "pcs").trim() || "pcs";
  if (!name) throw new Error("Name required.");
  const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Category not found.");
  await prisma.category.update({ where: { id: existing.id }, data: { name, unit } });
  revalidatePath("/inventory");
  revalidatePath(`/inventory/${id}`);
}

export async function deleteCategory(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const existing = await prisma.category.findFirst({ where: { id, userId: user.id } });
  if (!existing) throw new Error("Category not found.");
  const itemCount = await prisma.item.count({ where: { categoryId: existing.id } });
  if (itemCount > 0) throw new Error("Category has items. Delete or move them first.");
  await prisma.category.delete({ where: { id: existing.id } });
  revalidatePath("/inventory");
  redirect("/inventory");
}

// ---------- Items ----------

export async function createItem(formData: FormData) {
  const user = await requireUser();
  const categoryId = String(formData.get("categoryId"));
  const name = String(formData.get("name") || "").trim();
  if (!name) return;
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId: user.id } });
  if (!category) throw new Error("Category not found.");
  await prisma.item.create({
    data: {
      userId: user.id,
      categoryId,
      name,
      unitCost: n(formData.get("unitCost")),
      stock: n(formData.get("stock")),
    },
  });
  revalidatePath(`/inventory/${categoryId}`);
}

export async function updateItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const cost = n(formData.get("unitCost"));
  const add  = n(formData.get("addStock"));
  await prisma.$transaction(async (tx) => {
    const existing = await tx.item.findFirst({ where: { id, userId: user.id } });
    if (!existing) throw new Error("Item not found.");
    await tx.item.update({ where: { id: existing.id }, data: { unitCost: cost } });
    if (add !== 0) {
      await tx.item.update({ where: { id: existing.id }, data: { stock: { increment: add } } });
      await tx.stockAdjustment.create({ data: { userId: user.id, itemId: existing.id, delta: add, reason: "restock" } });
    }
  });
  const item = await prisma.item.findUnique({ where: { id } });
  if (item) revalidatePath(`/inventory/${item.categoryId}`);
}

export async function deleteItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const item = await prisma.item.findFirst({ where: { id, userId: user.id } });
  if (!item) throw new Error("Item not found.");
  const used = await prisma.recipeItem.count({ where: { itemId: item.id } });
  if (used > 0) throw new Error("Item is used by a recipe.");
  await prisma.item.delete({ where: { id: item.id } });
  revalidatePath(`/inventory/${item.categoryId}`);
}
