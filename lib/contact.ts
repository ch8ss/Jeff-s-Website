import { ARTIST_EMAIL, SITE_URL } from "./site";

export function buildArtEnquiry(
  art: { title: string; slug: string; price: number | null; currency: string; code: string },
  email: string = ARTIST_EMAIL,
) {
  const url = `${SITE_URL}/art/${art.slug}`;
  const subject = `Enquiry: "${art.title}" (${art.code})`;
  const body = `Hi Jeff,

I'm interested in your artwork "${art.title}".
Listed price: ${art.price ? `${art.currency} ${art.price}` : "on request"}
Link: ${url}

My name:
My city:
Questions:

Thanks!`;
  return {
    mailto: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    gmail: `https://mail.google.com/mail/?view=cm&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    email,
  };
}
