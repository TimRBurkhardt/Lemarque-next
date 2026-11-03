export const campaignLooks = [
  { id: "latex", name: "Latex Slit Dress", slug: "malum-black-latex-dress", material: "Sculpted latex", rim: 0.24 },
  { id: "otodus-shelter", name: "Otodus Cashmere Coat", slug: "malum-otodus-cashmere-coat", material: "Cashmere · Shark tooth closures", rim: 0.14 },
  { id: "bomber-passage", name: "Bomber Jacket", slug: "malum-bomber-jacket", material: "Matte technical fabric · Funnel collar", rim: 0.14 },
  { id: "suit-quay", name: "Cashmere Barathea Suit", slug: "malum-cashmere-barathea-suit", material: "Cashmere barathea · Tailored wool", rim: 0.14 },
] as const;

export const hasHybridLight = (id: string) => ["latex", "otodus-shelter", "suit-quay"].includes(id);

export const hasCleanLeftRim = (id: string) => ["otodus-shelter", "bomber-passage"].includes(id);

export const campaignAsset = (id: string, layer: "model" | "background" | "scene" | "subject") =>
  id === "latex" && layer === "subject" ? "/collections/malum/hero/interactive/latex-hair-clean-subject.webp" :
  id === "latex" && layer === "scene" ? "/collections/malum/hero/interactive/latex-cove-background-v2.webp" :
  `/collections/malum/hero/interactive/${id}-${layer === "subject" && hasCleanLeftRim(id) ? "left-clean-subject" : hasHybridLight(id) && layer === "subject" ? "hybrid-subject" : layer}.webp${layer === "subject" ? (hasHybridLight(id) ? "?v=5" : "?v=3") : ""}`;
