import { getCaseStudyBySlug, caseStudySlugs } from "$lib/content/case-studies";
import { error } from "@sveltejs/kit";

export function load({ params }) {
  const slug = params.slug;
  const study = getCaseStudyBySlug(slug);
  if (!study) {
    throw error(404, `Case study "${slug}" not found`);
  }
  return { study };
}

export function entries() {
  return caseStudySlugs.map((slug) => ({ slug }));
}
