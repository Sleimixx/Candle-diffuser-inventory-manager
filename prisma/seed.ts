import { PrismaClient, JarSize, LineColor, WickType } from "@prisma/client";

const prisma = new PrismaClient();

const COLORS: LineColor[] = [
  "PURPLE", "LIGHT_BLUE", "RED", "GREEN", "YELLOW", "GREY", "PINK",
];
const SIZES: JarSize[] = ["SMALL", "MEDIUM", "LARGE"];

async function main() {
  // 5 wax types. Paraffin is optional in recipes.
  const waxes = [
    { name: "Beeswax",       isOptional: false },
    { name: "Soy Wax",       isOptional: false },
    { name: "Stearic Acid",  isOptional: false },
    { name: "Coconut Wax",   isOptional: false },
    { name: "Paraffin",      isOptional: true },
  ];
  for (const w of waxes) {
    await prisma.waxType.upsert({
      where: { name: w.name },
      update: { isOptional: w.isOptional },
      create: w,
    });
  }

  // Wicks: 2 types
  for (const t of ["TYPE_1", "TYPE_2"] as WickType[]) {
    await prisma.wick.upsert({
      where: { type: t },
      update: {},
      create: { type: t },
    });
  }

  // Wick sticker: single row
  const wsCount = await prisma.wickSticker.count();
  if (wsCount === 0) {
    await prisma.wickSticker.create({ data: {} });
  }

  // Jars: 3 sizes x 7 colors = 21
  for (const size of SIZES) {
    for (const color of COLORS) {
      await prisma.jar.upsert({
        where: { size_color: { size, color } },
        update: {},
        create: { size, color },
      });
    }
  }

  // Stickers: 3 sizes x 7 colors = 21
  for (const size of SIZES) {
    for (const color of COLORS) {
      await prisma.sticker.upsert({
        where: { size_color: { size, color } },
        update: {},
        create: { size, color },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
