import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RecipeForm from "../RecipeForm";
import { computeCogsForRecipe } from "@/lib/cogs";
import { money } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const r = await prisma.recipe.findFirst({
    where: { id, userId: user.id },
    include: { items: true },
  });
  if (!r) return notFound();
  const cost = await computeCogsForRecipe(user.id, r.id);

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
          salePrice: r.salePrice,
          notes: r.notes,
          items: r.items.map((x) => ({ itemId: x.itemId, qty: x.qty })),
        }}
      />
    </div>
  );
}
