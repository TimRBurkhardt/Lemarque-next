# MALUM — detachable wall pieces

18 November 2026

The creator wants the gray wall to stay, but the garment installations must be independent from it. Hover lifts an installation toward the viewer, attracts it slightly to the mouse, and releases it back to its original attachment position. Generated wall pixels and external shadows are removed from the images.

## Assets

Five clean 1024 × 1536 RGBA cutouts are saved as WebP in `public/collections/malum/campaign/detached-v2/`. They preserve the garments, walnut hangers and ornamental hardware. Built-in ImageGen edit prompts and original generated-file paths are saved in `design/malum-detached-prompts.json`. Images retain natural shading within the material; the browser creates all external contact and cast shadows. Outer-edge alpha is zero or at most 1/255 after encoding.

## Motion and rendering

- Purpose: spatial consistency and feedback on a collection landing page. No idle animation loop or motion on every scroll.
- Use the existing `framer-motion` dependency. Spring: duration 0.5 s, bounce 0.2. Springs carry velocity through direction changes and re-entry. Keep the established 250 ms pointer-exit hold.
- Centered scale: 1 → 1.9 on desktop, 1 → 1.65 on tablet. Maximum pointer targets: ±18 px horizontal, ±10 px vertical, ±1.5° rotation. Lift adds 8 px upward displacement. The return resolves to scale 1, zero displacement and zero rotation.
- Native pointer listeners update Motion values without React state updates per move. Measure the stationary button on activation, resize and scroll, never the transformed image. Listen across the piece and its hover bridge so the lower garment keeps tracking; actual thumbnail controls recenter attraction.
- Real-time shadows use the asset alpha as a CSS mask. The fixed contact blur is 2 px; the detached cast blur is 10 px. Shadow translation/scale and opacity animate, but blur radii do not. A masked subtle highlight follows the same spring values; a soft light patch affects the gray page behind it.
- Only transform and opacity animate. The silhouette filters and masks remain static. Two-dimensional transforms keep the photographs sharp; depth is communicated by magnification, light and shadow separation.
- Studio images retain the current magnification while changing views; mouse attraction and the silhouette effects apply only to the cutouts.
- Touch, small screens and Reduced Motion do not activate flight. Keyboard navigation exposes controls without decorative movement. Resize, tab hiding and window blur clear active motion. No new graphics library, canvas loop or WebGL dependency is introduced.

## Validation

Production build and ESLint pass. Final interaction checks and visual review cover bounded pointer movement, reversible spring return, thumbnail handoff, mobile two-tap selection, native scrolling, keyboard interaction and Reduced Motion.
