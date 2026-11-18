# MALUM mobile gallery

18 November 2026

## Direction

Replace the mobile circle with a single column of five large garments. Keep the existing imagery, neutral surface, centered crest and small MALUM title. Align names and image controls to the shared page gutter. Use normal vertical page scrolling.

The current [Lemaire coats page](https://www.lemaire.fr/collections/men-coats) was inspected at 390 × 844: it uses a two-column product grid with names beneath the images. MALUM is a small, curated collection rather than a broad shopping catalogue; the chosen single-column layout gives its five pieces more visual space. This is our design decision, not a claim that the reference uses this layout.

## Interaction

- First touch selects a piece and reveals its own thumbnails. A second touch opens the existing large collection view. Open gallery is also available as an explicit action.
- Names remain visible before selection. Picker space is reserved so opening, closing and moving between selections do not change the positions of the garments.
- Switching thumbnails changes the photograph in place. Only the selected garment scales slightly (1.04) around its own center; adjacent pieces stay fully opaque.
- Back to collection and browser Back restore the entry scroll position and focus. A directly opened gallery falls back to showing the selected piece on return.
- Mobile entrance is limited to the first garment. The other four are visible without waiting for a sequence. Reduced Motion removes the entrance and scale.
- Desktop retains the existing five-column overview, larger hover zoom and 250 ms exit delay. The classic collection route is retained.

## Verification

Passed browser verification at 320 × 568, 390 × 844 and 430 × 932: two taps, thumbnail changes, stable layout, close action, overview scroll restoration after both gallery navigation and browser Back, and no horizontal overflow. Additional responsive checks passed at 767 × 900, 768 × 1024 and 844 × 390.

Desktop hover scale, thumbnail hover and delayed exit passed at 1440 × 900. Keyboard opening/closing and restored focus, Escape, Reduced Motion, and native touch scrolling without accidental selection also passed. Production build, component ESLint and whitespace checks passed. These checks use browser device emulation, not physical phones.
