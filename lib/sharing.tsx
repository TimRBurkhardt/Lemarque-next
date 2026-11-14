import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import type { Product } from "@/lib/products";

export const SITE_URL = "https://lemarque-next.vercel.app";
export const MALUM_DESCRIPTION = "MALUM by LEMARQUE. Sculptural outerwear, precise tailoring and flowing gowns.";
export const SHARE_PRESETS = {
  landscape: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
} as const;

const garments = ["otodus", "latex", "bomber", "suit", "siren"];
const surface = "#fefefe";

async function imageData(src: string, width: number, height: number, crest = false) {
  const input = await readFile(join(process.cwd(), "public", src));
  let image = sharp(input).rotate().resize(width, height, { fit: "contain", background: surface });
  if (crest) {
    // Preserve the original crest's alpha channel while turning its white ink black.
    image = sharp(input).linear([0, 0, 0], [0, 0, 0]).resize(width, height);
  }
  const png = await image.png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Shared composition for link previews and downloadable social formats. */
export async function renderMinimalShare({
  preset = "landscape", product, brand = false,
}: { preset?: keyof typeof SHARE_PRESETS; product?: Product; brand?: boolean } = {}) {
  const { width, height } = SHARE_PRESETS[preset];
  const portrait = preset !== "landscape";
  const story = preset === "story";
  const [font, crest] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/montserrat-regular.ttf")),
    imageData("brand/crest.webp", 52, 52, true),
  ]);
  const photos = product ? [await imageData(
    product.slug === "malum-bomber-jacket" ? product.images[4].src : product.images[0].src,
    510, 470,
  )] : await Promise.all(garments.map((id) => imageData(`collections/malum/campaign/white-v18/${id}.webp`, 360, 540)));
  const placements = portrait
    ? [{ x: 160, y: story ? 480 : 250 }, { x: 620, y: story ? 480 : 250 },
      { x: 390, y: story ? 840 : 505 }, { x: 160, y: story ? 1260 : 760 }, { x: 620, y: story ? 1260 : 760 }]
    : garments.map((_, i) => ({ x: 40 + i * 228, y: 190 }));
  const garmentWidth = portrait ? 300 : 208;
  const garmentHeight = portrait ? (story ? 400 : 250) : 312;

  return new ImageResponse(
    <div style={{ width, height, display: "flex", background: surface, color: "#151515", fontFamily: "Montserrat", position: "relative" }}>
      {product ? [
        // eslint-disable-next-line @next/next/no-img-element
        <img key="product-image" src={photos[0]} alt="" width={510} height={470} style={{ position: "absolute", left: 70, top: 118 }} />,
        <div key="product-info" style={{ display: "flex", flexDirection: "column", position: "absolute", left: 670, top: 248, width: 450 }}>
          <div style={{ fontSize: 15, letterSpacing: "0.12em", color: "#666", marginBottom: 25 }}>{product.collectionSlug.toUpperCase()}</div>
          <div style={{ fontSize: product.name.length > 28 ? 34 : 40, lineHeight: 1.15, letterSpacing: "-0.035em" }}>{product.name}</div>
          <div style={{ fontSize: 14, marginTop: 28, color: "#666" }}>{product.category}</div>
        </div>,
      ] : [
        <div key="title" style={{ position: "absolute", top: story ? 315 : portrait ? 158 : 128, left: 0, width, display: "flex", justifyContent: "center", fontSize: 28, letterSpacing: "0.12em" }}>{brand ? "LEMARQUE" : "MALUM"}</div>,
        ...photos.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={garments[i]} src={src} alt="" width={garmentWidth} height={garmentHeight} style={{ position: "absolute", left: placements[i].x, top: placements[i].y, objectFit: "contain" }} />
        )),
      ]}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crest} alt="" width={52} height={52} style={{ position: "absolute", left: (width - 52) / 2, top: story ? 200 : 42 }} />
      <div style={{ position: "absolute", bottom: story ? 190 : 35, left: 0, width, display: "flex", justifyContent: "center", fontSize: 12, letterSpacing: "0.22em", color: "#555" }}>{brand ? "MALUM" : "LEMARQUE"}</div>
    </div>,
    { width, height, fonts: [{ name: "Montserrat", data: font, weight: 400, style: "normal" }] },
  );
}
