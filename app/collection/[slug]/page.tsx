import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MALUM_DESCRIPTION } from "@/lib/sharing";
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

  const shareTitle = `${collection.name} | LEMARQUE`;
  const description = slug === "malum" ? MALUM_DESCRIPTION : collection.description;
  const url = `/collection/${slug}`;

  return {
    title: collection.name,
    alternates: { canonical: url },
    description,
    openGraph: {
      type: "website",
      siteName: "LEMARQUE",
      url,
      title: shareTitle,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
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
