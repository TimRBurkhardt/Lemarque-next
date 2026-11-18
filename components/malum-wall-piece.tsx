"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore, type CSSProperties } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { AtelierImage } from "./atelier-image";
import styles from "./malum-wall-piece.module.css";

const motionQuery = "(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";
const liftSpring = { type: "spring", duration: 0.5, bounce: 0.2 } as const;
// Map a 0.4 s response to physical coefficients. In Motion 12.34's useSpring
// path, duration bypasses the seconds conversion used by animate(). Physical
// coefficients also preserve velocity when the pointer reverses direction.
const frequency = 2 * Math.PI / .4;
const followSpring = { stiffness: frequency ** 2, damping: 2 * frequency, mass: 1, restDelta: .001, restSpeed: .01 };
const swingSpring = { ...followSpring, damping: 2 * .8 * frequency };
const snap = { type: "tween", duration: 0.2, ease: [0.23, 1, 0.32, 1] } as const;

// The mounting stud sits near the top of the cutouts. Compensating for this
// origin preserves the centered zoom while letting the hem settle around it.
const attachmentOrigin = "50% 3.5%";
function hangingTransform(x: number, y: number, scale: number, angle: number, cutout = true) {
  return `translate(${x}px, ${y}px) translateY(${cutout ? (1 - scale) * 46.5 : 0}%) scale(${scale}) rotate(${angle}deg)`;
}
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
  const lift = useMotionValue(0);
  const zoom = useMotionValue(1);
  const freedom = useMotionValue(0);
  const pointerX = useSpring(0, followSpring);
  const pointerY = useSpring(0, followSpring);
  const swing = useSpring(0, swingSpring);
  const phase = useRef<"rest" | "mouse" | "press" | "drag" | "return">("rest");

  const releasePointer = useCallback(() => {
    pointerX.set(0); pointerY.set(0); swing.set(0);
  }, [pointerX, pointerY, swing]);

  const suspend = useCallback(() => {
    phase.current = "rest";
    for (const value of [lift, freedom, pointerX, pointerY, swing]) value.jump(0);
    zoom.jump(1);
    root.current?.removeAttribute("data-touch-dragging");
  }, [lift, freedom, pointerX, pointerY, swing, zoom]);

  const detach = useCallback((mode: "mouse" | "press" | "drag", scale: number, depth: number) => {
    if (phase.current === mode) return;
    phase.current = mode;
    animate(zoom, scale, liftSpring);
    animate(lift, depth, { ...followSpring, type: "spring" });
    animate(freedom, 1, snap);
  }, [zoom, lift, freedom]);

  const dock = useCallback(() => {
    if (phase.current === "rest" || phase.current === "return") return;
    phase.current = "return";
    // The mount catches in 200 ms. Only rotation retains a small spring tail;
    // scale never rebounds through the wall and a delayed preview close cannot
    // restart the return. Re-entry can interrupt every value at its live pose.
    animate(zoom, 1, snap);
    animate(lift, 0, snap);
    animate(freedom, 0, snap);
    releasePointer();
    root.current?.removeAttribute("data-touch-dragging");
  }, [zoom, lift, freedom, releasePointer]);

  useEffect(() => {
    const node = root.current;
    const trigger = node?.closest("button");
    const piece = trigger?.parentElement;
    if (!enabled || !trigger || !piece || !active) {
      if (!enabled) suspend();
      else dock();
      return;
    }

    // Measure the stationary trigger, never the moving image: no cursor feedback loop.
    let bounds = trigger.getBoundingClientRect();
    const measure = () => {
      bounds = trigger.getBoundingClientRect();
    };
    const resize = () => {
      measure();
      if (phase.current === "mouse") animate(zoom, window.innerWidth <= 1100 ? 1.65 : 1.9, liftSpring);
    };
    const raise = () => detach("mouse", window.innerWidth <= 1100 ? 1.65 : 1.9, 1);
    const follow = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const control = (event.target as HTMLElement).closest("button");
      if (control && control !== trigger) { releasePointer(); return; }
      raise();
      if (!cutout) return;
      const x = attraction(event.clientX - bounds.left - bounds.width / 2, bounds.width * .34);
      pointerX.set(x * 36);
      pointerY.set(attraction(event.clientY - bounds.top - bounds.height / 2, bounds.height * .34) * 22);
      // Pull right: the hem trails right around the mounting stud, not the waist.
      swing.set(-x * 3);
    };
    // The image picker keeps the piece lifted, but the cursor attraction recenters.
    const onVisibility = () => { if (document.hidden) suspend(); };
    measure();
    releasePointer();
    raise();
    piece.addEventListener("pointermove", follow);
    piece.addEventListener("pointerenter", follow);
    piece.addEventListener("pointerleave", dock);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("blur", suspend);
    window.addEventListener("keydown", suspend);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      piece.removeEventListener("pointermove", follow);
      piece.removeEventListener("pointerenter", follow);
      piece.removeEventListener("pointerleave", dock);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("blur", suspend);
      window.removeEventListener("keydown", suspend);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, enabled, cutout, zoom, pointerX, pointerY, swing, detach, dock, suspend, releasePointer]);

  useEffect(() => {
    const trigger = root.current?.closest("button");
    if (!touchEnabled || !trigger) return;
    let touch: { id: number; x: number; y: number; offsetX: number; offsetY: number; dragged: boolean } | null = null;
    let suppressClickUntil = 0;
    const down = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      if (touch || !event.isPrimary) { cancel(); return; }
      suppressClickUntil = 0;
      // Catch the current pose when a returning piece is grabbed again. The
      // inverse resistance keeps the next move continuous at the grab position.
      pointerX.jump(pointerX.get() * freedom.get());
      pointerY.jump(pointerY.get() * freedom.get());
      freedom.jump(1);
      swing.jump(swing.get());
      touch = {
        id: event.pointerId, x: event.clientX, y: event.clientY, dragged: false,
        offsetX: Math.atanh(Math.max(-.98, Math.min(.98, pointerX.get() / 32))) * 70,
        offsetY: Math.atanh(Math.max(-.98, Math.min(.98, pointerY.get() / 8))) * 90,
      };
      detach("press", Math.max(zoom.get(), 1.014), Math.max(lift.get(), .18));
    };
    const move = (event: PointerEvent) => {
      if (!touch || touch.id !== event.pointerId) return;
      const x = event.clientX - touch.x, y = event.clientY - touch.y;
      // Vertical intent belongs to native page scrolling, including pointer cancellation.
      if (!touch.dragged && Math.abs(y) > 8 && Math.abs(y) > Math.abs(x)) { cancel(); return; }
      if (!touch.dragged && Math.abs(x) > 8 && Math.abs(x) > Math.abs(y) * 1.2) {
        touch.dragged = true;
        trigger.setPointerCapture(event.pointerId);
        root.current?.setAttribute("data-touch-dragging", "true");
      }
      if (!touch.dragged) return;
      if (event.cancelable) event.preventDefault();
      detach("drag", 1.055, .55);
      const pull = Math.tanh((touch.offsetX + x) / 70);
      pointerX.set(pull * 32);
      pointerY.set(Math.tanh((touch.offsetY + y) / 90) * 8);
      swing.set(-pull * 3);
    };
    const up = (event: PointerEvent) => {
      if (!touch || touch.id !== event.pointerId) return;
      if (touch.dragged) suppressClickUntil = performance.now() + 500;
      touch = null;
      if (trigger.hasPointerCapture(event.pointerId)) trigger.releasePointerCapture(event.pointerId);
      dock();
    };
    const cancel = () => {
      if (!touch) return;
      const id = touch.id;
      touch = null;
      suppressClickUntil = performance.now() + 500;
      if (trigger.hasPointerCapture(id)) trigger.releasePointerCapture(id);
      dock();
    };
    const onVisibility = () => { if (document.hidden) { cancel(); suspend(); } };
    const lostCapture = (event: PointerEvent) => {
      // Moving implicit capture from the image to its button also emits this
      // event. Cancel only when the button actually lost the active pointer.
      if (touch?.id === event.pointerId && !trigger.hasPointerCapture(event.pointerId)) cancel();
    };
    const click = (event: MouseEvent) => {
      if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); }
    };
    trigger.addEventListener("pointerdown", down);
    trigger.addEventListener("pointermove", move, { passive: false });
    trigger.addEventListener("pointerup", up);
    trigger.addEventListener("pointercancel", cancel);
    trigger.addEventListener("lostpointercapture", lostCapture);
    trigger.addEventListener("click", click, true);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      trigger.removeEventListener("pointerdown", down);
      trigger.removeEventListener("pointermove", move);
      trigger.removeEventListener("pointerup", up);
      trigger.removeEventListener("pointercancel", cancel);
      trigger.removeEventListener("lostpointercapture", lostCapture);
      trigger.removeEventListener("click", click, true);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
      suspend();
    };
  }, [touchEnabled, lift, zoom, freedom, pointerX, pointerY, swing, detach, dock, suspend]);

  const bodyTransform = useTransform(() => {
    const x = cutout ? pointerX.get() * freedom.get() : 0;
    const y = cutout ? pointerY.get() * freedom.get() - lift.get() * 10 : 0;
    return hangingTransform(x, y, zoom.get(), cutout ? swing.get() : 0, cutout);
  });
  const shadowTransform = useTransform(() => {
    const z = lift.get(), x = pointerX.get() * freedom.get(), y = pointerY.get() * freedom.get() - z * 10;
    return hangingTransform(x + 2 + z * 20, y + 3 + z * 26, zoom.get(), swing.get());
  });
  const contactTransform = useTransform(() => hangingTransform(2, 3, 1, swing.get()));
  const contactOpacity = useTransform(lift, [0, .2, 1], [0.17, .04, 0]);
  const castOpacity = useTransform(lift, [0, .2, 1], [0, .12, .19]);
  const lightOpacity = useTransform(lift, [0, 1], [0, 0.1]);
  const wallLightOpacity = useTransform(lift, [0, 1], [0, 0.55]);
  const lightTransform = useTransform(() => `translate3d(${pointerX.get() * freedom.get() * .55}%, ${pointerY.get() * freedom.get() * .55}%, 0)`);
  const mask = { maskImage: `url("${src}")`, WebkitMaskImage: `url("${src}")` } as CSSProperties;

  return (
    <span ref={root} className={styles.scene} data-wall-piece data-cutout={cutout} data-detached={enabled && active}>
      <span className={styles.frame}>
        {cutout && <>
          <motion.span aria-hidden="true" className={styles.wallLight} style={{ opacity: wallLightOpacity, transform: lightTransform }} />
          <motion.span aria-hidden="true" className={styles.contact} style={{ opacity: contactOpacity, transform: contactTransform, transformOrigin: attachmentOrigin }}><span className={styles.silhouette} style={mask} /></motion.span>
          <motion.span aria-hidden="true" className={styles.cast} style={{ opacity: castOpacity, transform: shadowTransform, transformOrigin: attachmentOrigin }}><span className={styles.silhouette} style={mask} /></motion.span>
        </>}
        <motion.span className={styles.body} style={{ transform: bodyTransform, transformOrigin: cutout ? attachmentOrigin : "50% 50%", viewTransitionName: transitionName }} data-garment-body>
          <AtelierImage src={src} alt={alt} className={styles.photo} fill sizes={sizes} priority={priority} retryable={retryable} draggable={false} unoptimized />
          {cutout && <span aria-hidden="true" className={styles.lightMask} style={mask}>
            <motion.span className={styles.light} style={{ transform: lightTransform, opacity: lightOpacity }} />
          </span>}
        </motion.span>
      </span>
    </span>
  );
}
