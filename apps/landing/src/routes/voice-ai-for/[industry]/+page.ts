import {
  getVoiceAiIndustryPageBySlug,
  voiceAiIndustrySlugs,
} from "$lib/content/voice-ai-industry-pages";
import { error } from "@sveltejs/kit";

export function load({ params }) {
  const industry = getVoiceAiIndustryPageBySlug(params.industry);
  if (!industry) {
    throw error(404, `Industry "${params.industry}" not found`);
  }

  return { industry };
}

export function entries() {
  return voiceAiIndustrySlugs.map((industry) => ({ industry }));
}
