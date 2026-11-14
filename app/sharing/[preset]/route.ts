import { renderMinimalShare, SHARE_PRESETS } from "@/lib/sharing";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(SHARE_PRESETS).map((preset) => ({ preset }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ preset: string }> }) {
  const { preset } = await params;
  if (!Object.hasOwn(SHARE_PRESETS, preset)) return new Response("Not found", { status: 404 });
  const image = await renderMinimalShare({ preset: preset as keyof typeof SHARE_PRESETS });
  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="lemarque-malum-${preset}.png"`,
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
