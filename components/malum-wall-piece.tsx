"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AtelierImage } from "./atelier-image";
import styles from "./malum-wall-piece.module.css";

const motionQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const spring = { duration: 0.5, bounce: 0.2 };
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const readMotion = () => window.matchMedia(motionQuery).matches;
const noMotion = () => false;

type Props = {
  src: string;
  alt: string;
  sizes: string;
  active?: boolean;
  interactive?: boolean;
  priority?: boolean;
  retryable?: boolean;
  cutout?: boolean;
};

/** One alpha cutout, with lighting and silhouette shadows rendered by the browser. */
export function MalumWallPiece({ src, alt, sizes, active = false, interactive = false, priority = false, retryable = false, cutout = true }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const enabled = useSyncExternalStore(subscribeMotion, readMotion, noMotion) && interactive;
  const lift = useSpring(0, spring);
  const pointerX = useSpring(0, spring);
  const pointerY = useSpring(0, spring);
  const magnification = useMotionValue(1.9);

  useEffect(() => {
    const node = root.current;
    const trigger = node?.closest("button");
    const piece = trigger?.parentElement;
    const reset = (immediate = false) => {
      for (const value of [lift, pointerX, pointerY]) {
        if (immediate) value.jump(0);
        else value.set(0);
      }
    };
    if (!enabled || !trigger || !piece || !active) {
      reset(!enabled);
      return;
    }

    // Measure the stationary trigger, never the moving image: no cursor feedback loop.
    let bounds = trigger.getBoundingClientRect();
    const measure = () => {
      bounds = trigger.getBoundingClientRect();
      magnification.set(window.innerWidth <= 1100 ? 1.65 : 1.9);
    };
    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const control = (event.target as HTMLElement).closest("button");
      if (control && control !== trigger) { releasePointer(); return; }
      lift.set(1);
      if (!cutout) return;
      pointerX.set(Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1)));
      pointerY.set(Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1)));
    };
    // The image picker keeps the piece lifted, but the cursor attraction recenters.
    const releasePointer = () => { pointerX.set(0); pointerY.set(0); };
    const suspend = () => reset(true);
    const onVisibility = () => { if (document.hidden) suspend(); };
    measure();
    pointerX.set(0);
    pointerY.set(0);
    lift.set(1);
    piece.addEventListener("pointermove", follow);
    piece.addEventListener("pointerleave", releasePointer);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("blur", suspend);
    window.addEventListener("keydown", suspend);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      piece.removeEventListener("pointermove", follow);
      piece.removeEventListener("pointerleave", releasePointer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("keydown", suspend);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, enabled, cutout, lift, pointerX, pointerY, magnification]);

  const bodyTransform = useTransform(() => {
    const z = lift.get(), x = cutout ? pointerX.get() : 0, y = cutout ? pointerY.get() : 0;
    return `translate(${x * 18}px, ${y * 10 - (cutout ? z * 8 : 0)}px) rotate(${x * 1.5}deg) scale(${1 + z * (magnification.get() - 1)})`;
  });
  const shadowTransform = useTransform(() => {
    const z = lift.get(), x = pointerX.get(), y = pointerY.get();
    return `translate3d(${5 + z * 18 + x * 9}px, ${7 + z * 22 + y * 7}px, 0) rotate(${x * 1.5}deg) scale(${1 + z * (magnification.get() - 1)})`;
  });
  const contactOpacity = useTransform(lift, [0, 1], [0.17, 0]);
  const castOpacity = useTransform(lift, [0, 1], [0, 0.19]);
  const lightOpacity = useTransform(lift, [0, 1], [0, 0.1]);
  const wallLightOpacity = useTransform(lift, [0, 1], [0, 0.55]);
  const lightTransform = useTransform(() => `translate3d(${pointerX.get() * 20}%, ${pointerY.get() * 12}%, 0)`);
  const mask = { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` } as CSSProperties;

  return (
    <span ref={root} className={styles.scene} data-wall-piece data-cutout={cutout} data-detached={enabled && active}>
      {cutout && <>
        <motion.span aria-hidden="true" className={styles.wallLight} style={{ opacity: wallLightOpacity, transform: lightTransform }} />
        <motion.span aria-hidden="true" className={styles.contact} style={{ opacity: contactOpacity }}><span className={styles.silhouette} style={mask} /></motion.span>
        <motion.span aria-hidden="true" className={styles.cast} style={{ opacity: castOpacity, transform: shadowTransform }}><span className={styles.silhouette} style={mask} /></motion.span>
      </>}
      <motion.span className={styles.body} style={{ transform: bodyTransform }} data-garment-body>
        <AtelierImage src={src} alt={alt} className={styles.photo} fill sizes={sizes} priority={priority} retryable={retryable} unoptimized />
        {cutout && <span aria-hidden="true" className={styles.lightMask} style={mask}>
          <motion.span className={styles.light} style={{ transform: lightTransform, opacity: lightOpacity }} />
        </span>}
      </motion.span>
    </span>
  );
}
