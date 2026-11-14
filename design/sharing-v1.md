# Sharing presets — 14 November 2026

MALUM and product previews follow the light collection design: original black crest, near-white background, Montserrat regular, garment photography and restrained text. The homepage preview introduces MALUM under the LEMARQUE name. Other collection imagery remains unchanged; MALUM Classic has its own original campaign card.

`lib/sharing.tsx` is the common image composition. Open Graph and Twitter image routes use the same renderer. Product cards use original product photography without cropping; the bomber uses the same fifth photograph as the product cover.

Downloadable PNG presets:

- `/sharing/landscape`: 1200 × 630, five garments in a row.
- `/sharing/square`: 1080 × 1080, staggered garment composition.
- `/sharing/story`: 1080 × 1920, vertical composition with space for platform overlays.

Titles, descriptions, canonical links and Open Graph URLs are specific to the collection, shop, classic or product route. Twitter uses explicit image routes rather than an inherited homepage image.

`public/fonts/montserrat-regular.ttf` is a static weight-400 instance of the existing Montserrat WOFF2, converted with fontTools for ImageResponse compatibility. The existing `Montserrat-OFL.txt` license applies. No external font or image request is needed for the light previews.

Validation: production build and TypeScript, ESLint on changed source files, rendered metadata inspection, PNG dimensions, visual checks for landscape/square/story and long product names. All 21 product preview endpoints and collection/product/classic Twitter endpoints checked.
