# MALUM mobile gallery

18 November 2026

## Direction

Replace the mobile circle with five garments in a staggered vertical sequence: coat upper left, dress lower right, then alternating sides. The image areas overlap vertically by exactly 20%. They occupy 72% of the lineup width and sit 8 px beyond its shared gutters, giving the silhouettes a stronger left/right arrangement. Keep the centered crest, small MALUM heading, light surface and normal page scrolling. Names remain hidden at rest.

The creator rejected the intermediate dark-screen focus and the mobile enlargement/repositioning. Neither is part of this version.

## Interaction

- First tap reveals a compact name and image picker at the bottom. The garment stays at its original position and size; neighboring garments remain fully visible.
- Second tap opens the existing large collection view. An explicit Open gallery arrow and a close control remain available.
- Scrolling more than 72 px dismisses the picker without preventing native scrolling. Keyboard focus and Escape remain supported.
- Returning from the large view restores the entry scroll position and focus. Direct gallery entry falls back to the selected piece on return.
- Desktop keeps its five-column lineup, centered 1.9 hover scale, neighbor separation and 250 ms exit delay. The classic route is retained.

## Image direction

Five new image edits were made with the built-in image_gen tool, using the existing garment photographs as edit targets. The direction is empty, lightly suspended clothing with relaxed fabric rather than a body-filled ghost mannequin. Signature materials, colors and details are retained as references; the original product photographs remain available for inspection.

All five outputs have genuine alpha transparency. WebP copies preserve alpha and original resolution at quality 94. Source PNGs remain in the generator's output folder. The website uses `public/collections/malum/campaign/suspended-v1/{otodus,latex,bomber,suit,siren}.webp` as the first collection views.

Exact prompts and method: `design/malum-suspended-prompts.json`.

## Verification

Passed at 320 × 568, 390 × 844 and 430 × 932: measured 20% overlap, alternating horizontal positions, all five new images loading, hidden names, unchanged image bounds and white surface on tap, thumbnails, two taps, close, native scrolling, back-position restoration and no horizontal overflow. Desktop 1.9 hover, absence of mouse-hover activation on mobile widths, keyboard dismissal and Reduced Motion also passed. Component ESLint, production build and whitespace checks passed. These checks use browser device emulation, not physical phones.
