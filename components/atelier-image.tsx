"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";
import styles from "./atelier-image.module.css";

type Props = ImageProps & { retryable?: boolean };

export function AtelierImage(props: Props) {
  const key = typeof props.src === "string" ? props.src : JSON.stringify(props.src);
  return <RecoverableImage key={key} {...props} />;
}

function RecoverableImage({ retryable = true, ...props }: Props) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Recover brief loading failures, including images mounted inside another button.
  useEffect(() => {
    if (!failed || attempt >= 2) return;
    const timer = window.setTimeout(() => {
      setAttempt(current => current + 1);
      setFailed(false);
    }, 600 * (attempt + 1));
    return () => window.clearTimeout(timer);
  }, [failed, attempt]);

  const src = attempt && typeof props.src === "string"
    ? `${props.src}${props.src.includes("?") ? "&" : "?"}retry=${attempt}`
    : props.src;

  if (failed) return <span className={styles.fallback} role="status">
    <span>{attempt < 2 ? "Loading image" : "Image unavailable"}</span>
    {retryable && attempt >= 2 && <button type="button" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>Retry image</button>}
  </span>;

  return <Image {...props} alt={props.alt} src={src} onError={() => setFailed(true)} />;
}
