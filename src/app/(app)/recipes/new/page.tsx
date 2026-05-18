import RecipeForm from "../RecipeForm";

export const dynamic = "force-dynamic";

export default function NewRecipePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New recipe</h1>
      <RecipeForm />
    </div>
  );
}
