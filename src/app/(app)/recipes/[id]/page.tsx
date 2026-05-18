import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecipeForm from "../RecipeForm";
import { computeCogsForRecipe } from "@/lib/cogs";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.candleRecipe.findUnique({
    where: { id },
    include: { waxes: true, scents: true },
  });
  if (!r) return notFound();
  const cost = await computeCogsForRecipe(r.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Edit recipe</h1>
      <div className="text-sm text-gray-600">
        Live material cost: <span className="font-medium text-black">{money(cost)}</span>
      </div>
      <RecipeForm
        existing={{
          id: r.id,
          name: r.name,
          jarSize: r.jarSize,
          color: r.color,
          salePrice: r.salePrice,
          notes: r.notes,
          waxes:  r.waxes.map((w) => ({ waxId: w.waxId, grams: w.grams })),
          scents: r.scents.map((s) => ({ scentId: s.scentId, ml: s.ml })),
        }}
      />
    </div>
  );
}
