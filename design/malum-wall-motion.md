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

## Distance, touch and gallery refinement

The creator requested more noticeable magnetic capture and docking, a mobile touch equivalent, and a cleaner single-image opening.

- Mouse attraction now uses a 16 px center capture zone and a saturating `tanh` response outside it. Maximum targets are ±36 px horizontally, ±22 px vertically and ±2° rotation. All springs retain duration 0.5 s / bounce 0.2; return starts immediately on actual pointer exit. The picker remains available for 120 ms near an edge, or closes immediately beyond 80 px. Hovering its controls recenters the attraction.
- Touch presses add a very small lift; a horizontal pull passes an 8 px intent threshold, follows with elastic resistance (up to 26 px) and returns on release. Drag release suppresses its synthetic click. A subsequent intentional touch starts normally. Vertical intent is handed to native scrolling, with `touch-action: pan-y pinch-zoom`; cancellation and blur release the piece. Two taps still open the large view.
- The large view accepts horizontal swipes between photographs. Its title is smaller, the back control precedes the image on mobile, and redundant MALUM labeling and divider lines were removed.
- Every image now has a real 2:3 frame, preserving photograph proportions with `object-fit: contain`. Supported browsers use a 350 ms native view transition for the selected image; other browsers switch directly. Reduced Motion and keyboard opening skip the transition. Wall shadows are hidden during the image's journey and return at its destination, preventing a detached shadow from appearing early.
- Preview photo choices are separate from the URL-backed large view. Closing a preview, switching hover targets, scrolling, Escape, the app's Back control and native browser Back restore the cutouts in the wall overview.
- Native image dragging and mobile image callouts are disabled on the interactive photographs.

Verification: desktop attraction, center capture, docking, thumbnail reset, shared-image open/close, native Back, preserved selected view, portrait proportions and Reduced Motion passed. Native touch-event checks at 320 × 568 and 390 × 844 passed horizontal pull/release, no accidental click, two taps, large-image swipe and uninterrupted vertical scrolling. Desktop and mobile layouts were also inspected in the user's browser.

## Attachment-point snap refinement

The creator requested a distinctly stronger return to the hanging point. This supersedes the shared spring and return timings above.

- Separate the magnification, depth, translation and pendulum response. On release, a 200 ms strong ease-out (`.23, 1, .32, 1`) seats the mounting point and restores scale 1. Rotation alone finishes with a small damped tail. There is no scale undershoot through the wall. The delayed picker close cannot restart docking.
- The cutout pivots at the ornamental mounting stud (50% / 3.5%). A compensating percentage translation preserves the established centered 1.9 / 1.65 zoom. After docking, the mounting point stays still as the hem settles. Studio photographs retain their centered origin and no tilt.
- Use physical spring coefficients derived from a 0.4 s response: frequency `2π / .4`, stiffness `frequency²`, mass 1. Pointer following is critically damped; rotation uses damping ratio .8. This is also a compatibility fix: Motion 12.34.2's `useSpring` path passes duration straight to the millisecond-based generator, unlike `animate()`. The previous duration `.5` therefore completed practically immediately. Do not reintroduce duration-based options on these follow springs.
- The cast silhouette now matches the garment's translation, centered zoom and hanging pivot, offset only by the light direction and depth. Contact shadow rotates with the settling garment. Depth and highlights fade during the same docking interval; blur radii remain fixed.
- Touch pull is bounded at ±32 px / ±8 px with up to 3° pendulum rotation and 1.055 magnification. Re-grabbing an unfinished return catches the visible pose; inverse resistance preserves the next move's starting point. Additional pointers, cancellation and lost capture release cleanly. Transferring implicit capture from the image to the button is explicitly allowed. Native vertical scrolling, pinch zoom, two taps and suppression of drag clicks remain.
- No idle animation, extra graphics dependency or new UI was added. Reduced Motion, keyboard interaction, window blur and hidden tabs retain their non-flight behavior.

Validation on the production build: ESLint, TypeScript and the full Next.js build pass. Browser checks passed for all five attachment pivots, 200 ms docking, residual pendulum movement, rapid exit/re-entry, tablet/desktop zoom targets and hydration without console errors. Native touch-event checks at 320 and 390 px passed pull/release, no accidental opening, two taps, image swipes and vertical scrolling. A separate re-grab/reversal/multitouch test passed. Gallery view persistence, app/native Back, thumbnail reset and Reduced Motion also pass. Touch was tested with browser emulation, not on physical phone hardware.
