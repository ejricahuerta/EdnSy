/**
 * Lucide icons for each industry slug. Used on industry cards (home, /industries) and industry detail pages.
 */
import type { Component } from "svelte";
import {
  HeartPulse,
  Smile,
  HardHat,
  Sparkles,
  UserCircle,
  Building2,
  Scale,
  Dumbbell,
  HelpCircle,
} from "lucide-svelte";

export const industryIcons: Record<string, Component> = {
  healthcare: HeartPulse,
  dental: Smile,
  construction: HardHat,
  salons: Sparkles,
  "solo-professionals": UserCircle,
  "real-estate": Building2,
  legal: Scale,
  fitness: Dumbbell,
};

/** Icon for the "Don't see your industry?" card. */
export const industryFallbackIcon = HelpCircle;

export function getIndustryIcon(slug: string): Component | undefined {
  return industryIcons[slug];
}
