import { OG_CONTENT_TYPE, OG_SIZE } from "@/lib/og";
import { renderMinimalShare } from "@/lib/sharing";

export const alt = "LEMARQUE — MALUM, sculptural garments on white";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderMinimalShare({ brand: true });
}
