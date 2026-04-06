import type { LandingPageContext } from "@/lib/prompts/landing-page";

const META_KEYS = new Set([
  "callbackUrl",
  "callbackToken",
  "jobId",
  "prospectId",
  "userId",
  "id",
  "styleId",
  "dentalStyleId",
  "leadRosettaLayout",
]);

/** Remove async job / render-hint fields before mapping to Stitch context. */
export function stripAsyncDemoMeta(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (!META_KEYS.has(k)) out[k] = v;
  }
  return out;
}

function asRecord(v: unknown): Record<string, unknown> | undefined {
  return v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : undefined;
}

function formatHours(hours: unknown): string | undefined {
  if (hours === null || hours === undefined) return undefined;
  if (typeof hours === "string") return hours;
  if (typeof hours === "object" && !Array.isArray(hours)) {
    return Object.entries(hours as Record<string, string>)
      .map(([day, h]) => `${day}: ${h}`)
      .join("\n");
  }
  return undefined;
}

/**
 * Map admin WebsiteTemplate-shaped JSON (any industry) to LandingPageContext for Stitch.
 */
export function websiteTemplatePayloadToLandingPageContext(
  data: Record<string, unknown>,
): LandingPageContext {
  const business = asRecord(data.business);
  const hero = asRecord(data.hero);
  const heroCta = asRecord(hero?.cta);
  const images = asRecord(data.images);
  const about = asRecord(data.about);
  const contact = asRecord(data.contact);
  const theme = asRecord(data.theme);
  const seo = asRecord(data.seo);

  const servicesRaw = data.services;
  const servicesList: string[] = [];
  if (Array.isArray(servicesRaw)) {
    for (const s of servicesRaw) {
      const row = asRecord(s);
      if (!row) continue;
      const name = typeof row.name === "string" ? row.name : "";
      const desc =
        typeof row.description === "string" ? row.description : "";
      const extra =
        typeof row.coverage === "string"
          ? row.coverage
          : typeof row.price === "string"
            ? row.price
            : "";
      const line = [name, desc, extra].filter(Boolean).join(" — ");
      if (line) servicesList.push(line);
    }
  }

  const testimonialsRaw = data.testimonials;
  const testimonials: NonNullable<
    LandingPageContext["socialProof"]
  >["testimonials"] = [];
  if (Array.isArray(testimonialsRaw)) {
    for (const t of testimonialsRaw) {
      const row = asRecord(t);
      if (!row) continue;
      testimonials.push({
        quote: typeof row.quote === "string" ? row.quote : undefined,
        author: typeof row.author === "string" ? row.author : undefined,
        role: typeof row.role === "string" ? row.role : undefined,
      });
    }
  }

  const insurance = asRecord(data.insurance);
  const insuranceLines: string[] = [];
  if (insurance) {
    if (typeof insurance.accepted === "string")
      insuranceLines.push(`Insurance: ${insurance.accepted}`);
    if (typeof insurance.payment === "string")
      insuranceLines.push(`Payment: ${insurance.payment}`);
  }

  const statsRaw = data.stats;
  const statLines: string[] = [];
  if (Array.isArray(statsRaw)) {
    for (const st of statsRaw) {
      const row = asRecord(st);
      if (!row) continue;
      const v = row.value;
      const l = row.label;
      if (typeof v === "string" && typeof l === "string")
        statLines.push(`${v} ${l}`);
    }
  }

  const social = business?.social;
  const socialLines: string[] = [];
  if (social && typeof social === "object" && !Array.isArray(social)) {
    for (const [k, v] of Object.entries(social as Record<string, string>)) {
      if (typeof v === "string" && v.trim()) socialLines.push(`${k}: ${v}`);
    }
  }

  const contactBits: string[] = [];
  if (typeof business?.phone === "string") contactBits.push(business.phone);
  if (typeof business?.email === "string") contactBits.push(business.email);
  if (contactBits.length === 0 && contact) {
    if (typeof contact.headline === "string")
      contactBits.push(contact.headline);
  }

  const aboutStoryParts: string[] = [];
  if (typeof about?.headline === "string")
    aboutStoryParts.push(about.headline);
  if (typeof about?.body === "string") aboutStoryParts.push(about.body);
  if (insuranceLines.length) aboutStoryParts.push(...insuranceLines);

  const differentiators: string[] = [];
  if (Array.isArray(about?.values)) {
    for (const v of about!.values as unknown[]) {
      if (typeof v === "string") differentiators.push(v);
    }
  }
  if (statLines.length) differentiators.push(...statLines);
  if (Array.isArray(data.gallery) && data.gallery.length) {
    differentiators.push(`Gallery: ${(data.gallery as string[]).join(", ")}`);
  }

  const sectionTitles: Record<string, string> = {};
  if (contact && typeof contact.headline === "string") {
    sectionTitles.contact = contact.headline;
  }

  const marketing: NonNullable<LandingPageContext["marketing"]> = {
    heading:
      typeof hero?.headline === "string" ? hero.headline : undefined,
    subheading:
      typeof hero?.subheadline === "string" ? hero.subheadline : undefined,
    ctaPrimary:
      typeof heroCta?.label === "string" ? heroCta.label : undefined,
    sectionTitles:
      Object.keys(sectionTitles).length > 0 ? sectionTitles : undefined,
    footer:
      typeof seo?.description === "string" ? seo.description : undefined,
  };

  const ctx: LandingPageContext = {
    business: {
      name: typeof business?.name === "string" ? business.name : undefined,
      tagline:
        typeof business?.tagline === "string" ? business.tagline : undefined,
      contact:
        contactBits.length > 0
          ? contactBits.join(" · ")
          : undefined,
      address:
        typeof business?.address === "string" ? business.address : undefined,
      hours: formatHours(business?.hours),
      serviceArea:
        typeof images?.unsplashKeywords !== "undefined"
          ? Array.isArray(images.unsplashKeywords)
            ? (images.unsplashKeywords as string[]).join(", ")
            : undefined
          : undefined,
    },
    offerings:
      servicesList.length > 0 ? { services: servicesList } : undefined,
    socialProof:
      testimonials.length > 0 ? { testimonials } : undefined,
    about:
      aboutStoryParts.length > 0 || differentiators.length > 0
        ? {
            story: aboutStoryParts.join("\n\n") || undefined,
            differentiators:
              differentiators.length > 0 ? differentiators : undefined,
          }
        : undefined,
    marketing,
  };

  if (socialLines.length) {
    ctx.socialProof = {
      ...ctx.socialProof,
      logos: socialLines,
    };
  }

  if (theme && typeof theme.style === "string") {
    ctx.marketing = {
      ...ctx.marketing,
      sectionTitles: {
        ...ctx.marketing?.sectionTitles,
        themeStyle: theme.style,
      },
    };
  }

  if (seo && Array.isArray(seo.keywords)) {
    const kw = (seo.keywords as string[]).filter(Boolean).join(", ");
    if (kw) {
      ctx.marketing = {
        ...ctx.marketing,
        subheading: [ctx.marketing?.subheading, `Keywords: ${kw}`]
          .filter(Boolean)
          .join("\n"),
      };
    }
  }

  return ctx;
}
