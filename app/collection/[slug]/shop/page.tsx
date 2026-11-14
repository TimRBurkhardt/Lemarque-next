import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollection, hasShoppableLooks } from "@/lib/collections";
import { buildShopGroups } from "@/lib/shop-groups";
import { LookShopClient } from "./look-shop-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function buildPreloadUrl(src: string, width = 1920): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export async function generateStaticParams() {
  return collections
    .filter((collection) => hasShoppableLooks(collection))
    .map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) {
    return { title: "Collection Not Found" };
  }

  return {
    alternates: { canonical: `/collection/${slug}/shop` },
    title: `Shop ${collection.name}`,
    description: `Browse every look and piece from the ${collection.name} collection.`,
    openGraph: {
      type: "website",
      siteName: "LEMARQUE",
      url: `/collection/${slug}/shop`,
      title: `Shop ${collection.name} | LEMARQUE`,
      description: `Browse every look and piece from the ${collection.name} collection.`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop ${collection.name} | LEMARQUE`,
      description: `Browse every look and piece from the ${collection.name} collection.`,
    },
  };
}

export default async function CollectionShopPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection || !hasShoppableLooks(collection)) {
    notFound();
  }

  // Preload the first couple of images that render immediately, the same
  // way app/collections/page.tsx does for the collections feed, so opening
  // the shop feels just as instant as opening /collections.
  const groups = buildShopGroups(collection);
  const firstGroup = groups[0];
  const preloadSrcs = [
    firstGroup?.media.src,
    ...(firstGroup?.items.slice(0, 3).map((item) => item.media.src) ?? []),
    groups[1]?.media.src,
  ].filter((src): src is string => Boolean(src));

  return (
    <>
      {preloadSrcs.map((src) => (
        <link
          key={src}
          rel="preload"
          as="image"
          href={buildPreloadUrl(src)}
          fetchPriority="high"
        />
      ))}
      <LookShopClient collection={collection} />
    </>
  );
}
