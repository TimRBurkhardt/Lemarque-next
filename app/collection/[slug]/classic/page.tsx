import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { CollectionDetailClient } from "../collection-detail-client";

export const metadata: Metadata = {
  title: "MALUM — Classic",
  description: "The original MALUM collection experience by LEMARQUE.",
  robots: { index: false, follow: true },
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: "malum" }];
}

export default async function ClassicCollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "malum") notFound();
  const collection = getCollection(slug);
  if (!collection) notFound();
  return <CollectionDetailClient collection={collection} />;
}
