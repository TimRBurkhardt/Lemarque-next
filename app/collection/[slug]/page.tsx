import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BRAND_TAGLINE } from "@/lib/brand";
import { collections, getCollection } from "@/lib/collections";
import { CollectionDetailClient } from "./collection-detail-client";
import { MalumMinimalCollection } from "@/components/malum-minimal-collection";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return collections.map((collection) => ({
    slug: collection.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  // Matches the root layout OG title so the brand line carries into every
  // shared collection link, not just the homepage. The share image itself
  // is generated per collection by opengraph-image.tsx.
  const shareTitle = `${collection.name} | LEMARQUE | ${BRAND_TAGLINE}`;

  return {
    title: `${collection.name} | ${collection.season} ${collection.year}`,
    description: slug === "malum" ? "MALUM by LEMARQUE. Sculptural outerwear, tailoring and gowns. Discover five selected pieces from the collection." : collection.description,
    openGraph: {
      title: shareTitle,
      description: collection.description,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: collection.description,
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    notFound();
  }

  if (slug === "malum") return <MalumMinimalCollection />;

  return <CollectionDetailClient collection={collection} />;
}
