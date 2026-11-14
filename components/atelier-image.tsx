"use client";

import { useState } from "react";
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
  const src = attempt && typeof props.src === "string"
    ? `${props.src}${props.src.includes("?") ? "&" : "?"}retry=${attempt}`
    : props.src;

  if (failed) return <span className={styles.fallback} role="status">
    <span>Image unavailable</span>
    {retryable && <button type="button" onClick={() => { setAttempt(value => value + 1); setFailed(false); }}>Retry image</button>}
  </span>;

  return <Image {...props} alt={props.alt} src={src} onError={() => setFailed(true)} />;
}
