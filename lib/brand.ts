export const BRAND_TAGLINE = "Manufactured Attire";
export const BRAND_OG_TITLE = `LEMARQUE | ${BRAND_TAGLINE}`;
export const CONTACT_HREF = "https://le-marque.com/contacts/";

// Public inquiry address verified on https://le-marque.com/contacts/.
export const CONTACT_EMAIL = "contact@le-marque.com";

export function pieceInquiryHref(name: string, slug: string) {
  const subject = `LEMARQUE — ${name}`;
  const body = `Hello LEMARQUE,\n\nI would like to inquire about ${name}.\nhttps://lemarque-next.vercel.app/product/${slug}\n\n`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
