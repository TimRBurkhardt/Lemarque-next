"use client";

import { useRef } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import styles from "./malum-navigation.module.css";

export function MalumNavigation() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { dialog.current?.close(); }
  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav} aria-label="Main navigation">
          <BrandLogo crestOnly size="sm" priority className={styles.crest} />
          <button ref={trigger} className={styles.toggle} aria-label="Open menu" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
            <span /><span /><span />
          </button>
        </nav>
      </header>
      <dialog ref={dialog} className={styles.dialog} aria-label="Main menu" onClose={() => trigger.current?.focus()}>
        <div className={styles.menuTop}>
          <BrandLogo crestOnly size="sm" className={styles.crest} />
          <button className={`${styles.toggle} ${styles.close}`} aria-label="Close menu" onClick={close}><span /><span /></button>
        </div>
        <nav className={styles.links} aria-label="Collections and information">
          {[
            { href: "/", label: "Home" },
            { href: "/collection/malum", label: "Malum" },
            { href: "/collections", label: "Collections" },
            { href: "/about", label: "About" },
          ].map((item) => <Link key={item.href} href={item.href} aria-current={item.href === "/collection/malum" ? "page" : undefined} onClick={close}>{item.label}</Link>)}
        </nav>
      </dialog>
    </>
  );
}
