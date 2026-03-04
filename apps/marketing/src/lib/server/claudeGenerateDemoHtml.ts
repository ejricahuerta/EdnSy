/**
 * Generate a single-file HTML demo using Claude (Anthropic).
 * Same structure and style as v0 prompt; output is raw HTML saved to demo-html storage and rendered in the demo page iframe.
 */

import { env } from '$env/dynamic/private';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import { TONE_LABELS, TONE_DESCRIPTIONS, type ToneSlug } from '$lib/tones';
import { industryDisplayToSlug } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { getSmbReferenceForIndustry } from '$lib/server/smbLandingReferences';
import { getDemoImageUrls } from '$lib/server/unsplash';

const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';

export type ClaudeGenerateDemoHtmlResult =
	| { ok: true; html: string }
	| { ok: false; error: string };

function getStyleForTone(tone: ToneSlug): {
	mode: string;
	palette: string;
	headingFont: string;
	bodyFont: string;
	borderRadius: string;
	feel: string;
	referenceVibes: string;
} {
	const map: Record<
		ToneSlug,
		{ mode: string; palette: string; headingFont: string; bodyFont: string; borderRadius: string; feel: string; referenceVibes: string }
	> = {
		luxury: {
			mode: 'dark',
			palette: 'bg [#0f0f0f], surface [#1a1a1a], text [#f5f5f5], accent [#c9a962]',
			headingFont: 'Playfair Display',
			bodyFont: 'Lato',
			borderRadius: 'rounded',
			feel: 'editorial',
			referenceVibes: 'high-end brand'
		},
		rugged: {
			mode: 'light',
			palette: 'bg [#faf8f5], surface [#ffffff], text [#1c1917], accent [#b45309]',
			headingFont: 'Bebas Neue',
			bodyFont: 'Open Sans',
			borderRadius: 'sharp',
			feel: 'bold',
			referenceVibes: 'outdoor / trades'
		},
		'soft-calm': {
			mode: 'light',
			palette: 'bg [#faf9f7], surface [#ffffff], text [#374151], accent [#7c3aed]',
			headingFont: 'Cormorant Garamond',
			bodyFont: 'Source Sans 3',
			borderRadius: 'rounded',
			feel: 'minimal',
			referenceVibes: 'wellness / spa'
		},
		professional: {
			mode: 'light',
			palette: 'bg [#f8fafc], surface [#ffffff], text [#0f172a], accent [#0369a1]',
			headingFont: 'Inter',
			bodyFont: 'Inter',
			borderRadius: 'rounded',
			feel: 'corporate clean',
			referenceVibes: 'B2B SaaS'
		},
		friendly: {
			mode: 'light',
			palette: 'bg [#fffbeb], surface [#ffffff], text [#1f2937], accent [#059669]',
			headingFont: 'Nunito',
			bodyFont: 'Nunito',
			borderRadius: 'pill',
			feel: 'minimal',
			referenceVibes: 'local business'
		},
		minimal: {
			mode: 'light',
			palette: 'bg [#ffffff], surface [#f9fafb], text [#111827], accent [#111827]',
			headingFont: 'Space Grotesk',
			bodyFont: 'Inter',
			borderRadius: 'sharp',
			feel: 'minimal',
			referenceVibes: 'modern startup'
		}
	};
	return map[tone] ?? map.professional;
}

function buildHtmlLandingPagePrompt(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug,
	imageUrls: { hero: string; about: string }
): string {
	const name = gbpRaw.name || prospect.companyName?.trim() || 'This business';
	const address = gbpRaw.address || prospect.address || '';
	const phone = gbpRaw.phone || prospect.phone || '';
	const website = gbpRaw.website || prospect.website || '';
	const rating = gbpRaw.ratingValue ?? null;
	const reviewCount = gbpRaw.ratingCount ?? 0;
	const city = prospect.city || (address.match(/,?\s*([A-Za-z\s]+),\s*[A-Z]{2}\s*(?:\d|$)/)?.[1]?.trim() ?? '');
	const oneLiner = `${industryLabel} services${city ? ` in ${city}` : ''} — quality and trust.`;

	const style = getStyleForTone(tone);
	const toneLabel = TONE_LABELS[tone];
	const toneDesc = TONE_DESCRIPTIONS[tone];

	const industrySlug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const smbRef = getSmbReferenceForIndustry(industrySlug);

	return `Build a single-file HTML landing page for ${name} — ${oneLiner}.

---

STYLE
Reference: ${smbRef.reference}
Key elements for this industry: ${smbRef.keyElements}
Mode: ${style.mode}
Palette: ${style.palette}
Font: Google Fonts — ${style.headingFont} for headings, ${style.bodyFont} for body
Border radius: ${style.borderRadius}
Overall feel: ${style.feel}
Tone: ${toneLabel}. ${toneDesc}. Use Canadian spelling where relevant.

---

SECTIONS (in order)

1. NAV
   - Logo (text-based) left: "${name}"
   - Links center: Services, About, Contact (smooth scroll to #features, #how-it-works, #contact)
   - Right: "Get in touch" or "Book now" in accent color
   - Sticky, background blurs after 60px scroll

2. HERO
   - Full-bleed background image (use the Hero URL below) with 40% dark overlay
   - Centered layout
   - Badge/pill above headline: "${industryLabel}" or "Welcome"
   - H1: Compelling headline for ${name}${city ? ` in ${city}` : ''}
   - Subheadline: 1-2 sentences about their value (use: ${oneLiner})
   - Two buttons: "Get in touch" (accent filled) + "Learn more" (ghost/outline)
   - Scroll-down arrow indicator at bottom

3. SOCIAL PROOF — LOGOS
   - Label: "Trusted by local businesses" or "Serving the community"
   - 6 placeholder company/area names in greyscale styled pills
   - Subtle horizontal fade on edges

4. FEATURES
   - Section label + headline + subheadline centered above
   - 3-column card grid (stacks to 1 on mobile)
   - Each card: image top (use the Feature/About URL below for all three cards), icon overlay, title, 2-line description — use ${industryLabel}-relevant features
   - Cards lift on hover with box-shadow transition

5. HOW IT WORKS
   - 3 numbered steps, horizontal on desktop, vertical on mobile
   - Each step: large number, title, description (e.g. Contact us, We deliver, You're satisfied)
   - Connecting line/arrow between steps on desktop
   - Step image (use the Feature/About URL below) beside or below text

6. TESTIMONIALS
   - 3-column card grid
   - Each card: avatar (pravatar.cc), name, role/location, star rating, quote — use plausible local testimonials or "${rating ?? '5'} star" and "${reviewCount ?? '50'}+ reviews" if available
   - Slightly offset or staggered layout

7. FAQ
   - Accordion-style, click to expand/collapse
   - 5-6 questions relevant to ${name} and ${industryLabel} (hours, area served, what to expect, etc.)
   - Smooth open/close animation

8. FINAL CTA BANNER
   - Full-width section, gradient background using accent color
   - Big centered headline: "Ready to get started?" or similar
   - Subtext + "Contact us" or "Book now"
   - Optional: Unsplash background image with overlay instead of gradient

9. FOOTER
   - Logo + 1-line description left (${name} — ${oneLiner})
   - 3 columns of links: Services, About, Contact (or Product, Company, Legal)
   - Bottom bar: copyright "${new Date().getFullYear()} ${name}" left, phone ${phone || '[phone]'} and optional social icons right

---

INTERACTIONS
- Smooth scroll between sections
- Sticky nav with JS blur after 60px scroll
- Cards: lift on hover (transform + box-shadow transition)
- CTA buttons: shimmer or glow effect on hover
- FAQ accordion: animated expand/collapse
- Fade-in-up animation on scroll for each section (IntersectionObserver)
- Mobile hamburger menu for nav

---

IMAGES (use these exact URLs in <img> tags; they are industry-matched and must not be replaced)
- Hero bg: ${imageUrls.hero}
- Feature cards and How it works: ${imageUrls.about} (use this same URL for all three feature cards and for the how-it-works step image)
- Testimonial avatars: https://i.pravatar.cc/80?img=1, https://i.pravatar.cc/80?img=2, https://i.pravatar.cc/80?img=3
- Use loading="lazy" for below-fold images; object-fit: cover via Tailwind (object-cover)

---

REQUIREMENTS
- Output ONE complete HTML file only. No markdown code fence; output the raw HTML document.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script> in the document.
- Use Google Fonts via <link href="https://fonts.googleapis.com/css2?family=..."> for ${style.headingFont} and ${style.bodyFont}.
- All styling with Tailwind utility classes; minimal or no inline style.
- Semantic HTML: <header>, <main>, <section>, <footer>. Use <img> for all images with the URLs above.
- Fully mobile responsive (hamburger nav, stacked grids).
- No lorem ipsum — use real placeholder copy that fits ${name} and ${industryLabel}.
- Include a short <script> at the end for: sticky nav blur, smooth scroll, FAQ accordion, optional scroll-in animations. Vanilla JS only.
- Do not wrap the HTML in a markdown code block; respond with the HTML document starting with <!DOCTYPE html>.

---

Business context (use for copy and details):
- Address: ${address || '[address]'}
- Phone: ${phone || '[phone]'}
- Website: ${website || '[website]'}
- Google rating: ${rating ?? 'N/A'}; Review count: ${reviewCount ?? 0}`;
}

/** Strip markdown code block wrapper if present. */
function extractHtmlFromResponse(text: string): string {
	let out = text.trim();
	const htmlMatch = out.match(/^```(?:html)?\s*([\s\S]*?)```$/m);
	if (htmlMatch) {
		out = htmlMatch[1].trim();
	}
	// Allow any response that looks like HTML (starts with <)
	if (!out.startsWith('<')) {
		return '';
	}
	return out;
}

/**
 * Generate a single-file HTML demo via Claude. Returns raw HTML to be saved to demo-html storage.
 */
export async function generateDemoHtmlWithClaude(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug
): Promise<ClaudeGenerateDemoHtmlResult> {
	const apiKey = (env.ANTHROPIC_API_KEY ?? env.CLAUDE_API_KEY ?? '').trim();
	if (!apiKey) {
		return { ok: false, error: 'ANTHROPIC_API_KEY or CLAUDE_API_KEY not configured' };
	}

	const industrySlug = industryDisplayToSlug(industryLabel) as IndustrySlug;
	const imageUrls = await getDemoImageUrls(industrySlug, prospect.industry, {
		companyName: prospect.companyName ?? undefined
	});
	const userPrompt = buildHtmlLandingPagePrompt(prospect, gbpRaw, industryLabel, tone, imageUrls);
	const systemPrompt = `You are an expert at building single-file HTML landing pages with Tailwind CSS. Follow the user's prompt exactly: STYLE, SECTIONS, INTERACTIONS, IMAGES, and REQUIREMENTS. Output only the complete HTML document, starting with <!DOCTYPE html>. No explanations, no markdown code fence. Use Tailwind CDN and Google Fonts.`;

	try {
		const res = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
				'anthropic-version': '2023-06-01'
			},
			body: JSON.stringify({
				model: ANTHROPIC_MODEL,
				max_tokens: 16384,
				system: systemPrompt,
				messages: [{ role: 'user', content: userPrompt }]
			})
		});

		if (!res.ok) {
			const errText = await res.text();
			let errMessage: string;
			try {
				const errJson = JSON.parse(errText) as { error?: { message?: string } };
				errMessage = errJson?.error?.message ?? errText;
			} catch {
				errMessage = errText || `HTTP ${res.status}`;
			}
			return { ok: false, error: errMessage };
		}

		const data = (await res.json()) as {
			content?: Array<{ type: string; text?: string }>;
		};
		const block = data?.content?.find((c) => c.type === 'text');
		const text = block?.text ?? '';
		const html = extractHtmlFromResponse(text);
		if (!html) {
			return { ok: false, error: 'Claude did not return valid HTML' };
		}

		return { ok: true, html };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		console.error('[claudeGenerateDemoHtml]', msg);
		return { ok: false, error: msg };
	}
}
