import { renderMinimalShare } from "@/lib/sharing";
import { getCollection, getShopLooks } from "@/lib/collections";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  fallbackOgCard,
  loadOgImageSrc,
  renderOgCard,
} from "@/lib/og";

export const alt = "Shop LEMARQUE";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return fallbackOgCard();
  }

  if (slug === "malum") return renderMinimalShare();

  const firstLook = getShopLooks(collection)[0];
  const imageSrc = await loadOgImageSrc(
    firstLook?.image.src ?? collection.browseImage?.src ?? collection.heroImage.src
  );

  return renderOgCard({
    imageSrc,
    eyebrow: `${collection.season} ${collection.year}`,
    title: collection.name,
    subtitle: "Shop the collection",
  });
}
