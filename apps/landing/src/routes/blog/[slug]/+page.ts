import { blogPostSlugs, getBlogPostBySlug } from "$lib/content/blog-posts";
import { error } from "@sveltejs/kit";

export function load({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    throw error(404, `Blog post "${params.slug}" not found`);
  }

  return { post };
}

export function entries() {
  return blogPostSlugs.map((slug) => ({ slug }));
}
