import { getCollection } from "@/lib/collections";
import {
  OG_CONTENT_TYPE,
  OG_SIZE,
  loadOgImageSrc,
  renderOgCard,
  fallbackOgCard,
} from "@/lib/og";

export const alt = "LEMARQUE collection";
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

  const imageSrc = await loadOgImageSrc(collection.heroImage.src);

  return renderOgCard({
    imageSrc,
    eyebrow: `${collection.season} ${collection.year}`,
    title: `${collection.name} — Classic`,
    subtitle: "LEMARQUE",
  });
}
