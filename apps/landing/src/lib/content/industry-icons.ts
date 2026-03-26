/**
 * Lucide icons for each industry slug. Used on industry cards (home, /industries) and industry detail pages.
 */
import type { Component } from "svelte";
import Building2 from "@lucide/svelte/icons/building-2";
import CircleUser from "@lucide/svelte/icons/circle-user";
import Dumbbell from "@lucide/svelte/icons/dumbbell";
import HardHat from "@lucide/svelte/icons/hard-hat";
import HeartPulse from "@lucide/svelte/icons/heart-pulse";
import HelpCircle from "@lucide/svelte/icons/help-circle";
import Scale from "@lucide/svelte/icons/scale";
import Smile from "@lucide/svelte/icons/smile";
import Sparkles from "@lucide/svelte/icons/sparkles";

export const industryIcons: Record<string, Component> = {
  healthcare: HeartPulse,
  dental: Smile,
  construction: HardHat,
  salons: Sparkles,
  "solo-professionals": CircleUser,
  "real-estate": Building2,
  legal: Scale,
  fitness: Dumbbell,
};

/** Icon for the "Don't see your industry?" card. */
export const industryFallbackIcon = HelpCircle;

export function getIndustryIcon(slug: string): Component | undefined {
  return industryIcons[slug];
}
