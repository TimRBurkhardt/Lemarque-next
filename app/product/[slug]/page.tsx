import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollection } from "@/lib/collections";
import { getProduct, products } from "@/lib/products";
import { ProductDetailClient } from "./product-detail-client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return { title: "Piece Not Found" };
  }

  return {
    alternates: { canonical: `/product/${slug}` },
    title: product.name,
    description: product.description,
    openGraph: {
      type: "website",
      siteName: "LEMARQUE",
      url: `/product/${slug}`,
      title: `${product.name} | LEMARQUE`,
      description: product.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | LEMARQUE`,
      description: product.description,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const collection = getCollection(product.collectionSlug);

  return <ProductDetailClient product={product} collection={collection} />;
}
