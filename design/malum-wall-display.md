# MALUM — wall-mounted garment direction

18 November 2026

The creator rejected the floating packshots and CSS tilts as artificial. The new brief is a physical display: garments on clothes hangers or modern mounts, refined dark wood behind their tops, and a white wall. Gravity, support points and material drape must explain the pose.

## Working art direction

- Matte white wall with clean white edges, shared soft daylight from upper left and a restrained wall shadow.
- The creator supplied `public/collections/malum/products/malum-ao-dai-gown/06.webp` as the jewelry reference: dark antique-gold filigree, a ruby-red oval stone, a smaller black stone and a pearl drop. Translate that vocabulary into compact structural wall hardware paired with dark walnut hangers. The supplied portrait is a style reference for the earrings only; do not include its model in the collection imagery.
- Show a believable continuous support chain from wall to mount to hanger to garment. Jackets rest on the hanger's shoulders; halter dresses use a compatible support at the neck strap.
- Full garment and mounting hardware within frame. Preserve the source garment's material, color, construction and signature details.
- No filled mannequin volume, unsupported levitation, CSS rotation, wind effects or looping movement.
- Keep the higher mobile start, alternating outside alignment, 20% overlap, hidden idle captions and quiet two-tap image selection.

## Production approach

Use the original `white-v18` garment images as edit targets. Establish the coat installation first, then use it as the display-system reference for the other four garments. Save selected outputs separately so the original photography and previous variants remain available.

## Delivered assets and implementation

- Five final 1024 × 1536 WebP images live in `public/collections/malum/campaign/wall-v1/`. Built-in `image_gen` produced each installation, corrected the Siren train to hang vertically, then extracted the wall with actual alpha while retaining local soft shadows. The originals remain in the image-generation output directory.
- The alpha edges let all five installations share the page surface without rectangular photograph boundaries. WebP encoding preserves alpha and uses quality 94; total transfer size is approximately 700 KB.
- `components/malum-minimal-collection.tsx` uses the new series as the first view of each piece. The older generated ghost side views were removed from the picker; original studio views remain.
- Mobile CSS rotations are removed. The established alternating composition, 20% vertical overlap, two-tap selection and native scroll remain.
- Exact initial, drape-correction and background-extraction prompts are stored in `design/malum-wall-prompts.json`.

## Validation

- ESLint for the changed collection component, `git diff --check`, and production build pass.
- Browser checks at 320 × 568, 390 × 844 and 430 × 932: all five new images load; alternating outside alignment and 20% overlap; no image movement or dark surface on first tap; thumbnail selection, second-tap gallery, Back, explicit close and native scroll dismissal work; no horizontal overflow or page errors.
- Desktop 1440 × 900: centered 1.9 hover enlargement works. Keyboard dismissal, disabled mobile mouse-hover preview and Reduced Motion were also checked.
- Final mobile and desktop screenshots reviewed for complete garments, visible hardware, natural vertical drape and clean background blending.
