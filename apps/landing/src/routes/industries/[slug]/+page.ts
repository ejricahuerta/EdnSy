import { getIndustryBySlug, industrySlugs } from "$lib/content/industries";
import { error } from "@sveltejs/kit";

export function load({ params }) {
  const slug = params.slug;
  const industry = getIndustryBySlug(slug);
  if (!industry) {
    throw error(404, `Industry "${slug}" not found`);
  }
  return { industry };
}

export function entries() {
  return industrySlugs.map((slug) => ({ slug }));
}
