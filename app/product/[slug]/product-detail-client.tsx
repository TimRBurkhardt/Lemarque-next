"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { AtelierHeader, AtelierFooter } from "@/components/atelier-header";
import { CONTACT_HREF } from "@/lib/brand";
import type { Collection } from "@/lib/collections";
import { type Product, getLookSiblings, getRelatedProducts } from "@/lib/products";
import styles from "./product-detail.module.css";

// Prefer the existing garment-only studio photograph where one is available.
function productPhotos(product: Product) {
  const cover = product.slug === "malum-bomber-jacket" ? product.images.find(image => image.src.endsWith("/05.webp")) : product.images[0];
  return cover ? [cover, ...product.images.filter(image => image.src !== cover.src)] : product.images;
}

function PieceRail({ label, pieces }: { label: string; pieces: Product[] }) {
  if (!pieces.length) return null;
  return <section className={styles.related}>
    <div className={styles.sectionHeading}><h2>{label}</h2><Link href="/collection/malum/shop">All pieces <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
    <ul>{pieces.map(piece => <li key={piece.slug}><Link href={`/product/${piece.slug}`}>
      <div className={styles.relatedImage}><Image src={productPhotos(piece)[0].src} alt={productPhotos(piece)[0].alt} fill sizes="(max-width: 767px) 44vw, 23vw" /></div>
      <span>{piece.category}</span><h3>{piece.name}</h3>
    </Link></li>)}</ul>
  </section>;
}

export function ProductDetailClient({ product, collection }: { product: Product; collection: Collection | undefined }) {
  // A product-keyed gallery resets the selected image on client-side navigation.
  return <ProductPageContent key={product.slug} product={product} collection={collection} />;
}

function ProductPageContent({ product, collection }: { product: Product; collection: Collection | undefined }) {
  const photos = productPhotos(product);
  const [active, setActive] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const collectionHref = collection ? `/collection/${collection.slug}` : "/collections";
  const change = (index: number) => {
    const next = Math.max(0, Math.min(photos.length - 1, index));
    setActive(next);
    const thumbnail = thumbnails.current[next];
    const strip = thumbnail?.parentElement;
    if (thumbnail && strip) {
      const offset = thumbnail.offsetLeft - strip.offsetLeft;
      if (offset < strip.scrollLeft || offset + thumbnail.offsetWidth > strip.scrollLeft + strip.clientWidth) strip.scrollTo({ left: offset - strip.clientWidth / 2 + thumbnail.offsetWidth / 2, behavior: "instant" });
    }
  };
  return <div className={styles.page}>
    <a href="#piece-information" className={styles.skip}>Skip to piece information</a>
    <AtelierHeader />
    <main>
      <article className={styles.product}>
        <section className={styles.gallery} aria-label={`${product.name} photographs`} onKeyDown={event => {
          if (event.key === "ArrowRight") { event.preventDefault(); change(active + 1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); change(active - 1); }
        }}>
          <div className={styles.mainImage} onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
            if (!touchStart.current) return;
            const dx = event.changedTouches[0].clientX - touchStart.current.x;
            const dy = event.changedTouches[0].clientY - touchStart.current.y;
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) change(active + (dx < 0 ? 1 : -1));
            touchStart.current = null;
          }}>
            <Image key={photos[active].src} src={photos[active].src} alt={photos[active].alt} fill priority={active === 0} sizes="(max-width: 767px) 100vw, 61vw" />
          </div>
          <div className={styles.galleryBar}>
            <span aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, "0")} <span>/ {String(photos.length).padStart(2, "0")}</span></span>
            <div><button disabled={active === 0} onClick={() => change(active - 1)} aria-label="Previous photograph"><ArrowLeft size={16} /></button><button disabled={active === photos.length - 1} onClick={() => change(active + 1)} aria-label="Next photograph"><ArrowRight size={16} /></button></div>
          </div>
          <div className={styles.thumbnails} role="group" aria-label="Choose a photograph">
            {photos.map((photo, index) => <button key={photo.src} ref={element => { thumbnails.current[index] = element; }} aria-label={`Show photograph ${index + 1}`} aria-pressed={active === index} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(index); }} onClick={() => change(index)}><Image src={photo.src} alt="" width={60} height={80} sizes="60px" /></button>)}
          </div>
        </section>
        <div className={styles.information} id="piece-information" tabIndex={-1}>
          <Link className={styles.back} href={collectionHref}><ArrowLeft size={12} aria-hidden="true" /> Back to collection</Link>
          <p className={styles.eyebrow}>{collection?.name ?? "LEMARQUE"} <span>/ {product.category}</span></p>
          <h1>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <div className={styles.inquiry}><p>{product.price}</p><a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" aria-label={`Inquire about ${product.name}`}>Inquire about this piece <ArrowUpRight size={18} aria-hidden="true" /></a></div>
          <dl className={styles.facts}><div><dt>Collection</dt><dd>{collection?.name ?? "LEMARQUE"}{collection?.year ? ` · ${collection.year}` : ""}</dd></div><div><dt>Category</dt><dd>{product.category}</dd></div></dl>
        </div>
      </article>
      {photos.length > 1 && <section className={styles.details} aria-label="A closer look">
        <div className={styles.sectionHeading}><h2>A closer look</h2><span>{collection?.name ?? "LEMARQUE"}</span></div>
        <div className={styles.detailPair}>{[photos[1], photos[Math.min(photos.length - 1, Math.ceil(photos.length / 2))]].filter((photo, index, list) => list.findIndex(item => item.src === photo.src) === index).map(photo => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes="(max-width: 767px) 100vw, 48vw" /></figure>)}</div>
      </section>}
      <PieceRail label="From the same look" pieces={getLookSiblings(product)} />
      <PieceRail label="Continue exploring" pieces={getRelatedProducts(product, 4)} />
    </main>
    <AtelierFooter />
  </div>;
}
