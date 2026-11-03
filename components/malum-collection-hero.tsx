"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { Collection } from "@/lib/collections";
import { campaignAsset, campaignLooks } from "@/lib/malum-campaign";
import { MalumDepthLight } from "./malum-depth-light";
import styles from "./malum-collection-hero.module.css";

const imageCache = new Map<string, Promise<void>>();
function preload(src: string) {
  let promise = imageCache.get(src);
  if (!promise) {
    const img = new window.Image();
    img.src = src;
    promise = img.decode().catch((error) => { imageCache.delete(src); throw error; });
    imageCache.set(src, promise);
  }
  return promise;
}
function preloadLook(index: number) {
  return Promise.all([preload(campaignAsset(campaignLooks[index].id, "scene")), preload(campaignAsset(campaignLooks[index].id, "subject"))]);
}

export function MalumCollectionHero({ collection }: { collection: Collection }) {
  const [active, setActive] = useState(0);
  const [orbit, setOrbit] = useState(0);
  const [pending, setPending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const runway = useRef<HTMLDivElement>(null);
  const scrollIndex = useRef(0);
  const snapUntil = useRef(0);
  const skipUntil = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const request = useRef(0);
  const mounted = useRef(true);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const look = campaignLooks[active];

  useEffect(() => {
    mounted.current = true;
    // Warm images sequentially, after the initial page has settled.
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      for (let i = 0; i < campaignLooks.length && !cancelled; i++) {
        try { await preloadLook(i); } catch { /* A click retries a failed request. */ }
      }
    }, 1200);
    return () => { mounted.current = false; cancelled = true; clearTimeout(timer); };
  }, []);

  const select = useCallback(async (index: number, fromScroll = false) => {
    if (!fromScroll && runway.current && matchMedia("(min-width: 768px) and (min-height: 720px)").matches) {
      const bounds = runway.current.getBoundingClientRect();
      const distance = runway.current.offsetHeight - window.innerHeight;
      snapUntil.current = performance.now() + 850;
      window.scrollTo({ top: window.scrollY + bounds.top + distance * index / (campaignLooks.length - 1), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    }
    if (!fromScroll) setOrbit(index);
    scrollIndex.current = index;
    const token = ++request.current;
    setError("");
    setPending(index);
    try {
      await preloadLook(index);
      if (!mounted.current || token !== request.current) return;
      setActive(index);
      setPending(null);
    } catch {
      if (!mounted.current || token !== request.current) return;
      setPending(null);
      setError("This look could not load. Select it again to retry.");
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (performance.now() < snapUntil.current || performance.now() < skipUntil.current) return;
      if (!runway.current || !matchMedia("(min-width: 768px) and (min-height: 720px)").matches) return;
      const bounds = runway.current.getBoundingClientRect();
      const distance = runway.current.offsetHeight - window.innerHeight;
      const progress = Math.max(0, Math.min(1, -bounds.top / distance));
      const index = Math.round(progress * (campaignLooks.length - 1));
      if (index !== scrollIndex.current) { setOrbit(index); void select(index, true); }
    };
    let lastWheel = 0;
    let accumulated = 0;
    let gestureUsed = false;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !runway.current || performance.now() < skipUntil.current) return;
      if (!matchMedia("(min-width: 768px) and (min-height: 720px)").matches) return;
      const bounds = runway.current.getBoundingClientRect();
      if (bounds.top > 2 || bounds.bottom < innerHeight - 2) return;
      const now = performance.now();
      if (now - lastWheel > 200) { gestureUsed = false; accumulated = 0; }
      lastWheel = now;
      const direction = Math.sign(event.deltaY);
      const next = scrollIndex.current + direction;
      if (!gestureUsed && now >= snapUntil.current && (next < 0 || next >= campaignLooks.length)) return;
      event.preventDefault();
      if (gestureUsed || now < snapUntil.current) return;
      accumulated += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (Math.abs(accumulated) < 18) return;
      gestureUsed = true;
      void select(Math.max(0, Math.min(campaignLooks.length - 1, scrollIndex.current + Math.sign(accumulated))));
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("wheel", onWheel); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [select]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    // Approximate crown, sole and body-center anchors aligned against each master.
    const anchors = [[0.315, 0.05, 0.95], [0.34, 0.05, 0.96], [0.303, 0.039, 0.955], [0.25, 0.038, 0.97]];
    const observer = new ResizeObserver(() => {
      const { width, height } = element.getBoundingClientRect();
      element.querySelectorAll<HTMLElement>("[data-campaign-background]").forEach((layer, index) => {
        const [center, crown, sole] = anchors[index];
        const imageHeight = Math.max(height * 0.90 / (sole - crown), width / 1.6);
        const imageWidth = imageHeight * 1.6;
        const targetX = width < 768 ? 0.38 : 0.32;
        layer.style.setProperty("--scene-width", `${imageWidth}px`);
        layer.style.setProperty("--scene-height", `${imageHeight}px`);
        layer.style.setProperty("--scene-left", `${width * targetX - imageWidth * center}px`);
        layer.style.setProperty("--scene-top", `${height * 0.04 - imageHeight * crown}px`);
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if ((event.key === "ArrowRight" || event.key === "ArrowDown")) next = (index + 1) % campaignLooks.length;
    else if ((event.key === "ArrowLeft" || event.key === "ArrowUp")) next = (index - 1 + campaignLooks.length) % campaignLooks.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = campaignLooks.length - 1;
    else return;
    event.preventDefault();
    buttons.current[next]?.focus();
    void select(next);
  }

  return (
    <div ref={runway} className={styles.runway} style={{ "--look-count": campaignLooks.length } as CSSProperties}>
    <section className={styles.hero} aria-labelledby="malum-title">
      <div ref={stage} className={styles.stage} aria-hidden="true">
        {/* Subjects retain the master photograph pixels, with locally segmented alpha.
            The same alignment keeps the frame and silhouette light registered. */}
        {campaignLooks.map((item, index) => (
          <div key={`${item.id}-background`} data-campaign-background={item.id} data-active={index === active} className={styles.background}>
            <Image src={campaignAsset(item.id, "scene")} alt="" fill unoptimized priority={index === 0} className={styles.sceneImage} />
            <svg className={styles.editorialFrame} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path d="M 94 10 H 14 V 68 H 47" />
            </svg>
            <Image src={campaignAsset(item.id, "subject")} alt="" fill unoptimized className={`${styles.sceneImage} ${styles.frameOccluder}`} />
            <MalumDepthLight id={item.id} active={index === active} className={`${styles.sceneImage} ${styles.depthLight}`} />
          </div>
        ))}
      </div>
      <div className={styles.copy}>
        <p className={styles["caption-1"]}>{collection.season} {collection.year}</p>
        <h1 id="malum-title" className={styles["heading-1"]}>MALUM</h1>
        <div className={styles.selectedLook} aria-live="polite" aria-atomic="true">
          <Link className={styles["title-4"]} href={`/product/${look.slug}`}>{look.name}</Link>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
      <a className={styles.collectionLink} href="#malum-looks" onClick={(event) => {
        const destination = document.getElementById("malum-looks");
        if (!destination) return;
        event.preventDefault();
        skipUntil.current = performance.now() + 1800;
        destination.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
      }}>View all 16 looks</a>
      <div className={styles.lookNavigation}>
        <span className={styles.orbitTrack} aria-hidden="true" />
        <div className={styles.thumbnails} role="group" aria-label="Choose a campaign look" aria-busy={pending !== null}>
          {campaignLooks.map((item, index) => {
            const count = campaignLooks.length;
            const delta = ((index - orbit + count * 1.5) % count) - count / 2;
            const angle = delta * .52;
            const visible = Math.abs(delta) < 1.5;
            return (
            <button style={{ "--orbit-x": `${310 * (1 - Math.cos(angle))}px`, "--orbit-y": `${310 * Math.sin(angle)}px`, "--orbit-scale": 1 - Math.min(Math.abs(delta), 2) * .13, "--orbit-opacity": Math.max(0, Math.min(1, (1.5 - Math.abs(delta)) * 2)) } as CSSProperties} data-visible={visible} tabIndex={index === active ? 0 : -1} key={item.id} ref={(button) => { buttons.current[index] = button; }} type="button" title={item.name} data-look={item.id} aria-label={`Show ${item.name}`} aria-pressed={index === active} data-pending={pending === index} onClick={() => void select(index)} onKeyDown={(event) => navigate(event, index)} className={styles.thumbnail}>
              <span className={styles.thumbImage}><Image src={campaignAsset(item.id, "scene")} alt="" fill sizes="460px" className={styles.thumbPhoto} /></span>
              <span aria-hidden="true" className={styles.lookNumber}>{String(index + 1).padStart(2, "0")}</span>
            </button>
          );})}
        </div>
        {pending !== null && <p className={styles.loading} role="status">Loading {campaignLooks[pending].name}…</p>}
      </div>
    </section>
    </div>
  );
}
