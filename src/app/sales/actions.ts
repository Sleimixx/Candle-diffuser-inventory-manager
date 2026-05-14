"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function n(v: FormDataEntryValue | null, fallback = 0) {
  const x = parseFloat(String(v ?? ""));
  return Number.isFinite(x) ? x : fallback;
}

export async function recordSale(formData: FormData) {
  const productionId = String(formData.get("productionId"));
  const quantity     = Math.max(1, Math.trunc(n(formData.get("quantity"))));
  const unitPrice    = n(formData.get("unitPrice"));

  if (!productionId || !quantity) throw new Error("Missing fields.");

  await prisma.$transaction(async (tx) => {
    const run = await tx.productionRun.findUnique({
      where: { id: productionId },
      include: { sales: true },
    });
    if (!run) throw new Error("Production run not found");
    const sold = run.sales.reduce((s, x) => s + x.quantity, 0);
    const avail = run.quantity - sold;
    if (quantity > avail) throw new Error(`Only ${avail} available in this run.`);

    await tx.sale.create({
      data: {
        productionId,
        quantity,
        unitPrice,
        cogsPerUnit: run.cogsPerUnit,
      },
    });
  });

  revalidatePath("/sales");
  revalidatePath("/produce");
  revalidatePath("/");
}
