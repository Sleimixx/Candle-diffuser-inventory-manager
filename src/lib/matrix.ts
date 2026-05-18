import { prisma } from "@/lib/prisma";

export async function ensureJarMatrix(userId: string) {
  const [sizes, colors, jars] = await Promise.all([
    prisma.jarSize.findMany({ where: { userId } }),
    prisma.jarColor.findMany({ where: { userId } }),
    prisma.jar.findMany({ where: { userId } }),
  ]);
  const have = new Set(jars.map((j) => `${j.sizeId}|${j.colorId}`));
  const missing: { userId: string; sizeId: string; colorId: string }[] = [];
  for (const s of sizes) {
    for (const c of colors) {
      if (!have.has(`${s.id}|${c.id}`)) missing.push({ userId, sizeId: s.id, colorId: c.id });
    }
  }
  if (missing.length) {
    await prisma.jar.createMany({ data: missing, skipDuplicates: true });
  }
}

export async function ensureStickerMatrix(userId: string) {
  const [sizes, colors, stickers] = await Promise.all([
    prisma.jarSize.findMany({ where: { userId } }),
    prisma.jarColor.findMany({ where: { userId } }),
    prisma.sticker.findMany({ where: { userId } }),
  ]);
  const have = new Set(stickers.map((s) => `${s.sizeId}|${s.colorId}`));
  const missing: { userId: string; sizeId: string; colorId: string }[] = [];
  for (const s of sizes) {
    for (const c of colors) {
      if (!have.has(`${s.id}|${c.id}`)) missing.push({ userId, sizeId: s.id, colorId: c.id });
    }
  }
  if (missing.length) {
    await prisma.sticker.createMany({ data: missing, skipDuplicates: true });
  }
}
