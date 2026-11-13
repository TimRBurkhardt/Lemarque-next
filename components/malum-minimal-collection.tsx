"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, X } from "lucide-react";
import { CONTACT_HREF } from "@/lib/brand";
import styles from "./malum-minimal-collection.module.css";
import { AtelierHeader } from "./atelier-header";

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

// Only model-free images participate in the single entrance pass.
const entranceViews = [3, 3, 2, 3, 1];

function PieceImage({ index, view = 0, sizes, priority = false }: { index: number; view?: number; sizes: string; priority?: boolean }) {
  return <>{galleries[index].map((photo, photoIndex) => <Image key={photo.src} src={photo.src} alt={photoIndex === view ? photo.alt : ""} aria-hidden={photoIndex !== view} className={styles.photo} data-active={photoIndex === view} fill sizes={sizes} priority={priority && photoIndex === view} unoptimized />)}</>;
}

function ImageControls({ index, view, onChange, className = "", previewOnHover = false }: { index: number; view: number; onChange: (view: number) => void; className?: string; previewOnHover?: boolean }) {
  const piece = pieces[index];
  return (
    <div className={`${styles.imageControls} ${className}`} role="group" aria-label={`${piece.name} images`}>
      <div className={styles.viewStatus}><span>{galleries[index][view].label}</span><span aria-live="polite">0{view + 1} / 0{galleries[index].length}</span></div>
      <div className={styles.thumbnails}>
        {galleries[index].map((photo, photoIndex) => (
          <button key={photo.src} onPointerEnter={event => {
            if (previewOnHover && event.pointerType === "mouse") onChange(photoIndex);
          }} onClick={() => onChange(photoIndex)} aria-label={`Show ${photo.label.toLowerCase()} of ${piece.name}`} aria-pressed={photoIndex === view}>
            <Image src={photo.src} alt="" width={48} height={60} unoptimized />
          </button>
        ))}
      </div>
    </div>
  );
}

export function MalumMinimalCollection() {
  const [selected, setSelected] = useState<number | null>(null);
  const [views, setViews] = useState([0, 0, 0, 0, 0]);
  const [introActive, setIntroActive] = useState<number | null>(null);
  const [introRunning, setIntroRunning] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [touchPreview, setTouchPreview] = useState(false);
  const inputMode = useRef("mouse");
  const introInterrupted = useRef(false);
  const introTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const pieceButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const piece = selected === null ? null : pieces[selected];

  const stopIntro = useCallback(() => {
    introInterrupted.current = true;
    introTimers.current.forEach(clearTimeout);
    introTimers.current = [];
    setIntroActive(null);
    setIntroRunning(false);
  }, []);

  useEffect(() => {
    let disposed = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || introInterrupted.current) return;
    const onVisibility = () => { if (document.hidden) stopIntro(); };
    const onScroll = () => { if (window.scrollY > 60) stopIntro(); };
    const onPreference = () => { if (reduced.matches) stopIntro(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    reduced.addEventListener("change", onPreference);
    const later = (callback: () => void, delay: number) => introTimers.current.push(setTimeout(() => { if (!disposed && !introInterrupted.current) callback(); }, delay));

    // Decode both sides before crossfading so a slow request cannot flash white.
    Promise.all(pieces.flatMap((_, index) => [0, entranceViews[index]].map(view => {
      const image = new window.Image();
      image.src = galleries[index][view].src;
      return image.decode();
    }))).then(() => {
      if (disposed || introInterrupted.current || document.hidden) return;
      later(() => {
        setIntroRunning(true);
        const order = pieces.map((_, index) => index).sort((a, b) => (pieceButtons.current[b]?.getBoundingClientRect().x ?? b) - (pieceButtons.current[a]?.getBoundingClientRect().x ?? a));
        order.forEach((index, step) => {
          later(() => setIntroActive(index), step * 1350);
          later(() => setViews(current => current.map((view, i) => i === index ? entranceViews[index] : view)), step * 1350 + 300);
        });
        later(() => { setIntroActive(null); setIntroRunning(false); }, order.length * 1350);
      }, 1100);
    }).catch(() => { /* Keep the still collection if an entrance image fails. */ });

    return () => {
      disposed = true;
      introTimers.current.forEach(clearTimeout);
      introTimers.current = [];
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", onPreference);
    };
  }, [stopIntro]);

  function select(index: number) {
    stopIntro();
    setPreview(null);
    setTouchPreview(false);
    setSelected(index);
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function showCollection() {
    const previous = selected;
    setSelected(null);
    if (previous !== null) requestAnimationFrame(() => pieceButtons.current[previous]?.focus({ preventScroll: true }));
  }
  function changeView(index: number, view: number) { setViews(current => current.map((value, i) => i === index ? view : value)); }
  function activatePiece(index: number) {
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
    <div className={styles.page} onPointerDownCapture={event => { inputMode.current = event.pointerType; stopIntro(); }} onKeyDownCapture={event => {
      inputMode.current = "keyboard";
      stopIntro();
      if (event.key === "Escape") { setPreview(null); setTouchPreview(false); }
    }}>
      <a className={styles.skip} href="#malum-pieces">Skip to pieces</a>
      <AtelierHeader onCollection={showCollection} />

      <main>
        <section className={`${styles.stage} ${piece ? styles.detailStage : ""}`} aria-labelledby="malum-title">
          <div className={`${styles.information} ${piece ? styles.pieceInformation : ""}`}>
            {piece && <button className={styles.back} onClick={showCollection}><ArrowLeft size={12} aria-hidden="true" /> Back to collection</button>}
            <p className={styles.eyebrow}>{piece ? `MALUM / 0${selected! + 1}` : "Collection / 2026"}</p>
            <h1 id="malum-title" ref={heading} tabIndex={-1}>{piece?.name ?? "MALUM"}</h1>
            <p className={styles.specification}>{piece?.category ?? "Five selected pieces"}</p>
            {selected !== null && piece && <>
              <ImageControls index={selected} view={views[selected]} onChange={view => changeView(selected, view)} className={styles.detailControls} />
              <Link className={styles.pieceLink} href={`/product/${piece.slug}`}>View piece <ArrowUpRight size={16} aria-hidden="true" /></Link>
              <div className={styles.pieceNavigation}>
                <button disabled={selected === 0} onClick={() => select(selected - 1)} aria-label="Previous piece"><ArrowLeft size={16} /></button>
                <span aria-live="polite">0{selected + 1} <span>/ 05</span></span>
                <button disabled={selected === pieces.length - 1} onClick={() => select(selected + 1)} aria-label="Next piece"><ArrowRight size={16} /></button>
              </div>
            </>}
          </div>

          {selected === null ? (
            <div id="malum-pieces" className={styles.lineup} data-intro-running={introRunning} data-previewing={preview !== null} role="group" aria-label="Five selected MALUM pieces">
              {pieces.map((item, index) => (
                <div key={item.id} data-intro-active={introActive === index} data-piece={item.id} data-preview-active={preview === index} data-touch-preview={touchPreview} style={{ "--piece-shift": preview === null || preview === index ? "0px" : `${Math.sign(index - preview) * 28}px` } as CSSProperties} className={`${styles.piece} ${item.shape === "short" ? styles.short : ""}`} onPointerEnter={event => {
                  stopIntro();
                  if (event.pointerType === "mouse") { setPreview(index); setTouchPreview(false); }
                }} onPointerLeave={event => { if (event.pointerType === "mouse") setPreview(null); }} onFocusCapture={() => {
                  stopIntro();
                  if (inputMode.current === "keyboard") { setPreview(index); setTouchPreview(window.matchMedia("(max-width: 767px), (hover: none)").matches); }
                }} onBlurCapture={event => {
                  if (inputMode.current === "keyboard" && !event.currentTarget.contains(event.relatedTarget)) setPreview(null);
                }}>
                  <button ref={element => { pieceButtons.current[index] = element; }} className={styles.pieceTrigger} onClick={() => activatePiece(index)} aria-label={`Explore ${item.name}`} aria-expanded={preview === index}>
                    <span className={styles.image}><PieceImage index={index} view={views[index]} sizes="(max-width: 767px) 28vw, 220px" priority /></span>
                  </button>
                  <div className={styles.hoverPanel}>
                    <p className={styles.caption}>{item.name}</p>
                    <ImageControls index={index} view={views[index]} onChange={view => changeView(index, view)} previewOnHover />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div id="malum-pieces" className={styles.detail}>
              <div className={styles.detailImage}><PieceImage index={selected} view={views[selected]} sizes="(max-width: 767px) 80vw, 45vw" priority /></div>
            </div>
          )}

          {selected === null && <div className={styles.touchPreview} data-visible={touchPreview && preview !== null} aria-live="polite">
            {touchPreview && preview !== null && <>
              <div className={styles.touchPreviewHeading}><p>{pieces[preview].name}</p><button aria-label="Close image preview" onClick={() => { setPreview(null); setTouchPreview(false); }}><X size={14} /></button></div>
              <ImageControls index={preview} view={views[preview]} onChange={view => changeView(preview, view)} />
              <button className={styles.openPreview} onClick={() => select(preview)}>Explore piece <ArrowUpRight size={14} /></button>
            </>}
          </div>}

          {!piece && <div className={styles.discover}>
            <div className={styles.signatureGroup}><span className={styles.collectionSignature}>Manufactured attire.</span>{introRunning && <button className={styles.pauseIntro} onClick={stopIntro} aria-label="Pause entrance animation"><Pause size={11} aria-hidden="true" /> Pause</button>}</div>
            <button onClick={() => select(0)}>Explore pieces <ArrowRight size={16} aria-hidden="true" /></button>
          </div>}
        </section>

        <section className={styles.statement} aria-label="About MALUM">
          <h2>Made to stand apart.</h2>
          <p>Sculptural outerwear, precise tailoring and gowns cut like armor. Discover the MALUM collection.</p>
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
