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
function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: no-preference)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
const readReducedMotion = () => window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

// A quiet capture zone at the attachment point, then progressively firmer resistance.
function attraction(distance: number, reach: number) {
  const outside = Math.max(0, Math.abs(distance) - 16);
  return Math.sign(distance) * Math.tanh(outside / reach);
}

type Props = {
  src: string;
  alt: string;
  sizes: string;
  active?: boolean;
  interactive?: boolean;
  priority?: boolean;
  retryable?: boolean;
  cutout?: boolean;
  transitionName?: string;
};

/** One alpha cutout, with lighting and silhouette shadows rendered by the browser. */
export function MalumWallPiece({ src, alt, sizes, active = false, interactive = false, priority = false, retryable = false, cutout = true, transitionName }: Props) {
  const root = useRef<HTMLSpanElement>(null);
  const enabled = useSyncExternalStore(subscribeMotion, readMotion, noMotion) && interactive;
  const touchEnabled = useSyncExternalStore(subscribeReducedMotion, readReducedMotion, noMotion) && interactive;
  const lift = useSpring(0, spring);
  const pointerX = useSpring(0, spring);
  const pointerY = useSpring(0, spring);
  const magnification = useMotionValue(1.9);
  const reachX = useMotionValue(36);
  const reachY = useMotionValue(22);

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
      reachX.set(36);
      reachY.set(22);
    };
    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const control = (event.target as HTMLElement).closest("button");
      if (control && control !== trigger) { releasePointer(); return; }
      lift.set(1);
      if (!cutout) return;
      pointerX.set(attraction(event.clientX - bounds.left - bounds.width / 2, bounds.width * .34));
      pointerY.set(attraction(event.clientY - bounds.top - bounds.height / 2, bounds.height * .34));
    };
    // The image picker keeps the piece lifted, but the cursor attraction recenters.
    const releasePointer = () => { pointerX.set(0); pointerY.set(0); };
    const dock = () => { releasePointer(); lift.set(0); };
    const suspend = () => reset(true);
    const onVisibility = () => { if (document.hidden) suspend(); };
    measure();
    pointerX.set(0);
    pointerY.set(0);
    lift.set(1);
    piece.addEventListener("pointermove", follow);
    piece.addEventListener("pointerenter", follow);
    piece.addEventListener("pointerleave", dock);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("blur", suspend);
    window.addEventListener("keydown", suspend);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      piece.removeEventListener("pointermove", follow);
      piece.removeEventListener("pointerenter", follow);
      piece.removeEventListener("pointerleave", dock);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("keydown", suspend);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, enabled, cutout, lift, pointerX, pointerY, magnification, reachX, reachY]);

  useEffect(() => {
    const trigger = root.current?.closest("button");
    if (!touchEnabled || !trigger) return;
    let touch: { id: number; x: number; y: number; dragged: boolean } | null = null;
    let suppressClickUntil = 0;
    const dock = () => {
      lift.set(0); pointerX.set(0); pointerY.set(0);
      root.current?.removeAttribute("data-touch-dragging");
    };
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      suppressClickUntil = 0;
      touch = { id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false };
      magnification.set(1.08); reachX.set(26); reachY.set(8);
      pointerX.jump(0); pointerY.jump(0); lift.jump(0); lift.set(.18);
    };
    const move = (event: PointerEvent) => {
      if (!touch || touch.id !== event.pointerId) return;
      const x = event.clientX - touch.x, y = event.clientY - touch.y;
      // Vertical intent belongs to native page scrolling, including pointer cancellation.
      if (!touch.dragged && Math.abs(y) > 8 && Math.abs(y) > Math.abs(x)) { touch = null; dock(); return; }
      if (!touch.dragged && Math.abs(x) > 8 && Math.abs(x) > Math.abs(y) * 1.2) {
        touch.dragged = true;
        trigger.setPointerCapture(event.pointerId);
        root.current?.setAttribute("data-touch-dragging", "true");
      }
      if (!touch.dragged) return;
      if (event.cancelable) event.preventDefault();
      lift.set(.55);
      pointerX.set(Math.tanh(x / 70));
      pointerY.set(Math.tanh(y / 90));
    };
    const up = (event: PointerEvent) => {
      if (!touch || touch.id !== event.pointerId) return;
      if (touch.dragged) suppressClickUntil = performance.now() + 500;
      touch = null;
      if (trigger.hasPointerCapture(event.pointerId)) trigger.releasePointerCapture(event.pointerId);
      dock();
    };
    const cancel = () => { touch = null; dock(); };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    trigger.addEventListener("pointerdown", down);
    trigger.addEventListener("pointermove", move, { passive: false });
    trigger.addEventListener("pointerup", up);
    trigger.addEventListener("pointercancel", cancel);
    trigger.addEventListener("click", click, true);
    window.addEventListener("blur", cancel);
    return () => {
      trigger.removeEventListener("pointerdown", down);
      trigger.removeEventListener("pointermove", move);
      trigger.removeEventListener("pointerup", up);
      trigger.removeEventListener("pointercancel", cancel);
      trigger.removeEventListener("click", click, true);
      window.removeEventListener("blur", cancel);
      lift.jump(0); pointerX.jump(0); pointerY.jump(0);
    };
  }, [touchEnabled, lift, pointerX, pointerY, magnification, reachX, reachY]);

  const bodyTransform = useTransform(() => {
    const z = lift.get(), x = cutout ? pointerX.get() : 0, y = cutout ? pointerY.get() : 0;
    return `translate(${x * reachX.get()}px, ${y * reachY.get() - (cutout ? z * 10 : 0)}px) rotate(${x * 2}deg) scale(${1 + z * (magnification.get() - 1)})`;
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
      <span className={styles.frame}>
        {cutout && <>
          <motion.span aria-hidden="true" className={styles.wallLight} style={{ opacity: wallLightOpacity, transform: lightTransform }} />
          <motion.span aria-hidden="true" className={styles.contact} style={{ opacity: contactOpacity }}><span className={styles.silhouette} style={mask} /></motion.span>
          <motion.span aria-hidden="true" className={styles.cast} style={{ opacity: castOpacity, transform: shadowTransform }}><span className={styles.silhouette} style={mask} /></motion.span>
        </>}
        <motion.span className={styles.body} style={{ transform: bodyTransform, viewTransitionName: transitionName }} data-garment-body>
          <AtelierImage src={src} alt={alt} className={styles.photo} fill sizes={sizes} priority={priority} retryable={retryable} draggable={false} unoptimized />
          {cutout && <span aria-hidden="true" className={styles.lightMask} style={mask}>
            <motion.span className={styles.light} style={{ transform: lightTransform, opacity: lightOpacity }} />
          </span>}
        </motion.span>
      </span>
    </span>
  );
}
