"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CONTACT_HREF } from "@/lib/brand";
import styles from "./atelier-header.module.css";

export function AtelierHeader({ onCollection, collectionHref = "/collection/malum", collectionName = "MALUM" }: { onCollection?: () => void; collectionHref?: string; collectionName?: string }) {
  const id = useId();
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = () => menu.current?.hidePopover();
  return <>
    <header className={styles.header}>
      <button className={styles.trigger} popoverTarget={id} aria-expanded={open} aria-controls={id}>
        <span className={styles.glyph} data-open={open} aria-hidden="true"><span /><span /></span>{open ? "Close" : "Menu"}
      </button>
      <Link href="/" aria-label="LEMARQUE home" className={styles.crest}><Image src="/brand/crest.webp" alt="LEMARQUE crest" width={40} height={40} priority /></Link>
      {onCollection ? <button className={styles.collection} onClick={onCollection}>Collection</button> : pathname === collectionHref ? <Link className={styles.collection} href={`${collectionHref}/shop`}>All pieces <ArrowUpRight size={14} aria-hidden="true" /></Link> : <Link className={styles.collection} href={collectionHref}>{collectionName}</Link>}
    </header>
    <div id={id} ref={menu} popover="auto" className={styles.menu} onToggle={event => setOpen(event.currentTarget.matches(":popover-open"))}>
      <div className={styles.menuBody}>
        <nav className={styles.primary} aria-label="Main navigation">
          <span className={styles.label}>LEMARQUE</span>
          <Link href="/collections" onClick={close} aria-current={pathname === "/collections" ? "page" : undefined}>Collections <ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/collection/malum/shop" onClick={close} aria-current={pathname === "/collection/malum/shop" ? "page" : undefined}>All pieces <ArrowUpRight aria-hidden="true" /></Link>
          <Link href="/about" onClick={close} aria-current={pathname === "/about" ? "page" : undefined}>The house <ArrowUpRight aria-hidden="true" /></Link>
        </nav>
        <Link href="/collection/malum" className={styles.feature} onClick={close}>
          <div className={styles.featureImage}><Image src="/collections/malum/products/malum-bomber-jacket/05.webp" alt="MALUM black bomber jacket" fill sizes="(max-width: 767px) 110px, 36vw" /></div>
          <div><span className={styles.label}>Current collection</span><p>MALUM <ArrowUpRight size={18} aria-hidden="true" /></p><span className={styles.featureLink}>View collection</span></div>
        </Link>
      </div>
      <div className={styles.menuBottom}><p>LEMARQUE © 2026</p><nav aria-label="Further information"><Link href="/" onClick={close}>Home</Link><a href={CONTACT_HREF}>Contact <ArrowUpRight size={14} aria-hidden="true" /></a></nav></div>
    </div>
  </>;
}

export function AtelierFooter() {
  return <footer className={styles.footer}><Link href="/collections">Collections</Link><Link href="/about">The house</Link><span>LEMARQUE © 2026</span><a href={CONTACT_HREF}>Contact <ArrowUpRight size={12} aria-hidden="true" /></a></footer>;
}
