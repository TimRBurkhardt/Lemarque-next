import { OG_CONTENT_TYPE, OG_SIZE, fallbackOgCard } from "@/lib/og";
import { getProduct } from "@/lib/products";
import { renderMinimalShare } from "@/lib/sharing";

export const alt = "LEMARQUE — original product photograph and piece name";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  return product ? renderMinimalShare({ product }) : fallbackOgCard();
}
