"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { CONTACT_HREF } from "@/lib/brand";
import styles from "./malum-minimal-collection.module.css";
import { AtelierHeader } from "./atelier-header";
import { AtelierImage } from "./atelier-image";
import system from "./atelier-system.module.css";

const pieces = [
  { id: "otodus", slug: "malum-otodus-cashmere-coat", name: "Otodus Cashmere Coat", category: "Outerwear", alt: "Black Otodus cashmere coat with silver shark-tooth fasteners, isolated in a still front view", shape: "long" },
  { id: "latex", slug: "malum-black-latex-dress", name: "Latex Slit Dress", category: "Eveningwear", alt: "Black halter-neck latex dress with asymmetric ruffles, isolated in a still front view", shape: "long" },
  { id: "bomber", slug: "malum-bomber-jacket", name: "MALUM Bomber Jacket", category: "Outerwear", alt: "Black technical bomber jacket with a high collar, isolated in a still front view", shape: "short" },
  { id: "suit", slug: "malum-cashmere-barathea-suit", name: "Cashmere Barathea Suit", category: "Tailoring", alt: "Black cashmere barathea suit jacket, isolated in a still front view", shape: "short" },
  { id: "siren", slug: "malum-siren-gown", name: "Siren Gown", category: "Eveningwear", alt: "Blush and pale mint lace Siren gown in its original freestanding product photograph", shape: "long" },
];

const additionalViews = [
  [{ file: "08", label: "Hardware" }, { file: "06", label: "Back · studio" }],
  [{ file: "02", label: "Side · studio" }, { file: "05", label: "Back · studio" }],
  [{ file: "05", label: "Front" }, { file: "06", label: "Side" }],
  [{ file: "02", label: "Side · studio" }, { file: "04", label: "Back · studio" }],
  [{ file: "02", label: "Side" }, { file: "09", label: "Three-quarter" }],
];

const galleries = pieces.map((piece, index) => [
  { src: `/collections/malum/campaign/white-v18/${piece.id}.webp`, label: "Garment", alt: piece.alt },
  ...additionalViews[index].map(view => ({ src: `/collections/malum/products/${piece.slug}/${view.file}.webp`, label: view.label, alt: `${piece.name}, ${view.label.toLowerCase()}` })),
  ...(["otodus", "latex", "suit"].includes(piece.id) ? [{ src: `/collections/malum/campaign/white-v21/${piece.id}-side.webp`, label: "Side · garment", alt: `${piece.name}, isolated three-quarter side view` }] : []),
]);

// Reading order follows the garments’ on-screen positions on mobile.
const mobileEntranceOrder = [2, 0, 1, 3, 4];

function subscribeGallery(callback: () => void) {
  window.addEventListener("hashchange", callback);
  window.addEventListener("popstate", callback);
  window.addEventListener("malum:gallery", callback);
  return () => {
    window.removeEventListener("hashchange", callback);
    window.removeEventListener("popstate", callback);
    window.removeEventListener("malum:gallery", callback);
  };
}

function readGallery(hash: string) {
  const params = new URLSearchParams(hash.slice(1));
  const index = pieces.findIndex(piece => piece.slug === params.get("piece"));
  const requested = Number(params.get("view") ?? 1) - 1;
  return { index: index < 0 ? null : index, view: index < 0 || !Number.isInteger(requested) ? 0 : Math.max(0, Math.min(galleries[index].length - 1, requested)) };
}

function writeGallery(index: number | null, view = 0, replace = false) {
  const url = new URL(window.location.href);
  url.hash = index === null ? "" : new URLSearchParams({ piece: pieces[index].slug, view: String(view + 1) }).toString();
  const state = { ...window.history.state, malumGalleryFromOverview: replace ? window.history.state?.malumGalleryFromOverview : index !== null };
  window.history[replace ? "replaceState" : "pushState"](state, "", url);
  window.dispatchEvent(new Event("malum:gallery"));
}

function closeGallery() {
  if (window.history.state?.malumGalleryFromOverview) window.history.back();
  else writeGallery(null, 0, true);
}

function PieceImage({ index, view = 0, sizes, priority = false, retryable = false }: { index: number; view?: number; sizes: string; priority?: boolean; retryable?: boolean }) {
  const photo = galleries[index][view];
  return <AtelierImage key={photo.src} src={photo.src} alt={photo.alt} className={styles.photo} fill sizes={sizes} priority={priority} retryable={retryable} unoptimized />;
}

function ImageControls({ index, view, onChange, className = "", previewOnHover = false }: { index: number; view: number; onChange: (view: number) => void; className?: string; previewOnHover?: boolean }) {
  const piece = pieces[index];
  return (
    <div className={`${styles.imageControls} ${className}`} role="group" aria-label={`${piece.name} images`} onKeyDown={event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      onChange(Math.max(0, Math.min(galleries[index].length - 1, view + (event.key === "ArrowRight" ? 1 : -1))));
    }}>
      <div className={styles.viewStatus}><span>{galleries[index][view].label}</span><span aria-live="polite">0{view + 1} / 0{galleries[index].length}</span></div>
      <div className={styles.thumbnails}>
        {galleries[index].map((photo, photoIndex) => (
          <button key={photo.src} onPointerEnter={event => {
            if (previewOnHover && event.pointerType === "mouse") onChange(photoIndex);
          }} onClick={() => onChange(photoIndex)} aria-label={`Show ${photo.label.toLowerCase()} of ${piece.name}`} aria-pressed={photoIndex === view}>
            <Image src={photo.src} alt="" width={60} height={76} sizes="72px" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MalumMinimalCollection() {
  const hash = useSyncExternalStore(subscribeGallery, () => window.location.hash, () => "");
  const gallery = readGallery(hash);
  const selected = gallery.index;
  const [previewViews, setViews] = useState([0, 0, 0, 0, 0]);
  const views = previewViews.map((view, index) => index === selected ? gallery.view : view);
  const [entering, setEntering] = useState(true);
  const [preview, setPreview] = useState<number | null>(null);
  const [touchPreview, setTouchPreview] = useState(false);
  const inputMode = useRef("mouse");
  const previewCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const pieceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const piece = selected === null ? null : pieces[selected];
  const previousSelection = useRef<number | null>(null);

  useEffect(() => {
    if (selected !== null) {
      window.scrollTo({ top: 0, behavior: "instant" });
      heading.current?.focus({ preventScroll: true });
    }
    else if (previousSelection.current !== null) pieceButtons.current[previousSelection.current]?.focus({ preventScroll: true });
    previousSelection.current = selected;
  }, [selected]);

  const stopIntro = useCallback(() => setEntering(false), []);
  const cancelPreviewClose = useCallback(() => {
    if (previewCloseTimer.current !== null) clearTimeout(previewCloseTimer.current);
    previewCloseTimer.current = null;
  }, []);

  useEffect(() => {
    const dismissPreview = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (document.querySelector(":popover-open")) return;
      cancelPreviewClose();
      setPreview(null);
      setTouchPreview(false);
      if (readGallery(window.location.hash).index !== null) closeGallery();
    };
    document.addEventListener("keydown", dismissPreview);
    return () => {
      document.removeEventListener("keydown", dismissPreview);
      cancelPreviewClose();
    };
  }, [cancelPreviewClose]);

  function schedulePreviewClose(index: number) {
    cancelPreviewClose();
    previewCloseTimer.current = setTimeout(() => {
      setPreview(current => current === index ? null : current);
      previewCloseTimer.current = null;
    }, 250);
  }

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onVisibility = () => { if (document.hidden) stopIntro(); };
    const onScroll = () => { if (window.scrollY > 60) stopIntro(); };
    const onPreference = () => { if (reduced.matches) stopIntro(); };
    // CSS starts with the first paint; never wait for alternate photo downloads.
    // Remove the entrance state after the last garment settles so it cannot replay.
    const end = window.setTimeout(stopIntro, 1200);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    reduced.addEventListener("change", onPreference);
    return () => {
      window.clearTimeout(end);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", onPreference);
    };
  }, [stopIntro]);

  function select(index: number) {
    cancelPreviewClose();
    stopIntro();
    setPreview(null);
    setTouchPreview(false);
    writeGallery(index, views[index], selected !== null);
  }
  function showCollection() {
    cancelPreviewClose();
    setPreview(null);
    setTouchPreview(false);
    closeGallery();
  }
  function changeView(index: number, view: number) {
    setViews(current => current.map((value, i) => i === index ? view : value));
    if (selected === index) writeGallery(index, view, true);
  }
  function activatePiece(index: number) {
    cancelPreviewClose();
    if (inputMode.current === "touch" || inputMode.current === "pen") {
      if (preview !== index) {
        setPreview(index);
        setTouchPreview(true);
        return;
      }
    }
    select(index);
  }

  return (
    <div className={`${system.surface} ${styles.page}`} onPointerDownCapture={event => { inputMode.current = event.pointerType; stopIntro(); }} onKeyDownCapture={() => {
      cancelPreviewClose();
      inputMode.current = "keyboard";
      stopIntro();
    }}>
      <a className={styles.skip} href="#malum-pieces">Skip to pieces</a>
      <AtelierHeader onCollection={selected !== null ? showCollection : undefined} />

      <main>
        <section className={`${styles.stage} ${piece ? styles.detailStage : ""}`} aria-labelledby="malum-title">
          <div className={`${styles.information} ${piece ? styles.pieceInformation : styles.overviewInformation}`}>
            {piece && <button className={styles.back} onClick={showCollection}><ArrowLeft size={12} aria-hidden="true" /> Back to collection</button>}
            {piece && <p className={styles.eyebrow}>{`MALUM / 0${selected! + 1}`}</p>}
            <h1 id="malum-title" ref={heading} tabIndex={-1}>{piece?.name ?? "MALUM"}</h1>
            {piece && <p className={styles.specification}>{piece.category}</p>}
            {selected !== null && piece && <>
              <ImageControls index={selected} view={views[selected]} onChange={view => changeView(selected, view)} className={styles.detailControls} previewOnHover />
              <Link className={styles.pieceLink} href={`/product/${piece.slug}`}>Details &amp; inquiry <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <div className={styles.pieceNavigation}>
                <button disabled={selected === 0} onClick={() => select(selected - 1)} aria-label="Previous piece"><ArrowLeft size={16} /></button>
                <span aria-live="polite">0{selected + 1} <span>/ 05</span></span>
                <button disabled={selected === pieces.length - 1} onClick={() => select(selected + 1)} aria-label="Next piece"><ArrowRight size={16} /></button>
              </div>
            </>}
          </div>

          {selected === null ? (
            <div id="malum-pieces" className={styles.lineup} data-entering={entering} data-previewing={preview !== null} role="group" aria-label="Five selected MALUM pieces">
              {pieces.map((item, index) => (
                <div key={item.id} data-piece={item.id} data-preview-active={preview === index} data-touch-preview={touchPreview} style={{ "--entrance-order": pieces.length - 1 - index, "--entrance-mobile-order": mobileEntranceOrder[index], "--piece-shift": preview === null || preview === index ? 0 : Math.sign(index - preview) } as CSSProperties} className={`${styles.piece} ${item.shape === "short" ? styles.short : ""}`} onPointerEnter={event => {
                  stopIntro();
                  if (event.pointerType === "mouse") { cancelPreviewClose(); setPreview(index); setTouchPreview(false); }
                }} onPointerLeave={event => { if (event.pointerType === "mouse") schedulePreviewClose(index); }} onFocusCapture={() => {
                  cancelPreviewClose();
                  stopIntro();
                  if (inputMode.current === "keyboard") { setPreview(index); setTouchPreview(window.matchMedia("(max-width: 767px), (hover: none)").matches); }
                }} onBlurCapture={event => {
                  if (inputMode.current === "keyboard" && !event.currentTarget.contains(event.relatedTarget)) setPreview(null);
                }}>
                  <button ref={element => { pieceButtons.current[index] = element; }} className={styles.pieceTrigger} onClick={() => activatePiece(index)} aria-label={`Explore ${item.name}`} aria-expanded={preview === index}>
                    <span className={styles.image}><PieceImage index={index} view={views[index]} sizes="(max-width: 767px) 28vw, 220px" priority /></span>
                  </button>
                  <div className={styles.hoverPanel}>
                    <p className={styles.caption}><span aria-hidden="true">0{index + 1}</span><span>{item.name}</span></p>
                    {preview === index && <>
                      {galleries[index].map(photo => <link key={photo.src} rel="preload" as="image" href={photo.src} />)}
                      <ImageControls index={index} view={views[index]} onChange={view => changeView(index, view)} previewOnHover />
                    </>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div id="malum-pieces" className={styles.detail}>
              <div className={styles.detailImage}><PieceImage index={selected} view={views[selected]} sizes="(max-width: 767px) 80vw, 45vw" priority retryable /></div>
            </div>
          )}

          {selected === null && <div className={styles.touchPreview} data-visible={touchPreview && preview !== null} aria-live="polite">
            {touchPreview && preview !== null && <>
              <div className={styles.touchPreviewHeading}><p>{pieces[preview].name}</p><button aria-label="Close image preview" onClick={() => { setPreview(null); setTouchPreview(false); }}><X size={14} /></button></div>
              <ImageControls index={preview} view={views[preview]} onChange={view => changeView(preview, view)} />
              <button className={styles.openPreview} onClick={() => select(preview)}>Open gallery <ArrowUpRight size={16} aria-hidden="true" /></button>
            </>}
          </div>}

          {!piece && !(touchPreview && preview !== null) && <div className={styles.discover}>
            <Link href="/collection/malum/shop">All pieces <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>}
        </section>

        <section className={styles.statement} aria-label="About MALUM">
          <p>Sculptural outerwear, tailoring and eveningwear.</p>
        </section>
      </main>

      <footer className={styles.footer}>
        <nav aria-label="More from LEMARQUE"><Link href="/collections">Collections</Link><Link href="/about">The house</Link></nav>
        <span>LEMARQUE © 2026</span>
        <a href={CONTACT_HREF}>Contact <ArrowUpRight size={12} aria-hidden="true" /></a>
      </footer>


    </div>
  );
}
