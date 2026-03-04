/**
 * Generate a demo using the v0 Platform API (v0.chats.create).
 * v0 builds and hosts the UI; we store the demo URL and iframe it on the demo page.
 * Uses a structured landing page prompt for Next.js + Tailwind CSS (style, sections, interactions, images, requirements).
 */

import { env } from '$env/dynamic/private';
import { createClient } from 'v0-sdk';
import type { Prospect } from '$lib/server/prospects';
import type { GbpData } from '$lib/server/gbp';
import { TONE_LABELS, TONE_DESCRIPTIONS, type ToneSlug } from '$lib/tones';
import { industryDisplayToSlug } from '$lib/industries';
import type { IndustrySlug } from '$lib/industries';
import { getSmbReferenceForIndustry } from '$lib/server/smbLandingReferences';
import { serverWarn, serverError } from '$lib/server/logger';

/** v0 build typically takes 3–5 minutes. Wait 4 min then check once (no polling). */
const WAIT_BEFORE_CHECK_MS = 4 * 60 * 1000; // 4 minutes
const GET_BY_ID_RETRIES = 2;
const GET_BY_ID_RETRY_DELAY_MS = 2000;

export type V0GenerateDemoResult =
	| { ok: true; demoUrl: string; chatId?: string }
	| { ok: false; error: string };

/** Style defaults by tone for the landing page prompt. */
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

function buildLandingPagePrompt(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug
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

	// Unsplash keywords derived from industry
	const heroKeyword = industryLabel.toLowerCase().replace(/\s+/g, '-') || 'professional';
	const featureKeyword = `${industryLabel} service`.replace(/\s+/g, '');
	const workflowKeyword = `${industryLabel} work`.replace(/\s+/g, '');

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
   - Full-bleed background image from Unsplash (keyword: "${heroKeyword}") with 40% dark overlay
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
   - Each card: Unsplash image top (keyword: "${featureKeyword}"), icon overlay, title, 2-line description — use ${industryLabel}-relevant features
   - Cards lift on hover with box-shadow transition

5. HOW IT WORKS
   - 3 numbered steps, horizontal on desktop, vertical on mobile
   - Each step: large number, title, description (e.g. Contact us, We deliver, You're satisfied)
   - Connecting line/arrow between steps on desktop
   - Step image from Unsplash (keyword: "${workflowKeyword}") beside or below text

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

IMAGES
- Hero bg: https://source.unsplash.com/1600x900/?${heroKeyword}
- Feature cards: https://source.unsplash.com/800x450/?${featureKeyword}
- How it works: https://source.unsplash.com/1200x600/?${workflowKeyword}
- Use Next.js Image with priority for hero, loading="lazy" for below-fold; object-fit: cover via Tailwind (object-cover)
- Testimonial avatars: https://i.pravatar.cc/80?img=1, https://i.pravatar.cc/80?img=2, https://i.pravatar.cc/80?img=3

---

REQUIREMENTS
- Next.js (App Router) with Tailwind CSS for all styling
- Use React components and Tailwind utility classes; no inline <style> or separate CSS files
- Google Fonts via next/font or <link> in layout
- Fully mobile responsive (hamburger nav, stacked grids)
- Use Next.js Image for images; sources: Unsplash + Pravatar only
- No lorem ipsum — use real placeholder copy that fits ${name} and ${industryLabel}
- Clean semantic HTML (header, main, section, footer) in JSX
- No other frameworks or build tools — Next.js and Tailwind only

---

Business context (use for copy and details):
- Address: ${address || '[address]'}
- Phone: ${phone || '[phone]'}
- Website: ${website || '[website]'}
- Google rating: ${rating ?? 'N/A'}; Review count: ${reviewCount ?? 0}`;
}

/**
 * Generate a demo via v0 Platform API. v0 builds the page and returns a demo URL we can iframe.
 */
export async function generateDemoWithV0(
	prospect: Prospect,
	gbpRaw: GbpData,
	industryLabel: string,
	tone: ToneSlug
): Promise<V0GenerateDemoResult> {
	const apiKey = (env.V0_API_KEY ?? '').trim();
	if (!apiKey) {
		return { ok: false, error: 'V0_API_KEY not configured' };
	}

	/** Optional v0 folder ID (e.g. "demos") so new chats are created in that folder. Set V0_DEMOS_FOLDER_ID in env. */
	const demosFolderId = (env.V0_DEMOS_FOLDER_ID ?? '').trim() || undefined;

	const message = buildLandingPagePrompt(prospect, gbpRaw, industryLabel, tone);

	const system = `You are an expert at building landing pages with Next.js and Tailwind CSS. Follow the user's prompt exactly: STYLE, SECTIONS, INTERACTIONS, IMAGES, and REQUIREMENTS. Output a Next.js app using the App Router, Tailwind CSS for all styling, and Google Fonts. Use React components, Next.js Image where appropriate, and Tailwind utility classes. No other CSS frameworks or build tools beyond Next.js and Tailwind.`;

	try {
		const v0 = createClient({ apiKey });
		let chat: { id: string };
		if (demosFolderId) {
			// v0-sdk does not send folderId; call API directly so new chats go into the demos folder
			const res = await fetch('https://api.v0.dev/v1/chats', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					system,
					responseMode: 'sync',
					chatPrivacy: 'private',
					folderId: demosFolderId
				})
			});
			if (!res.ok) {
				const err = await res.text();
				throw new Error(`v0 create failed: ${res.status} ${err}`);
			}
			const data = (await res.json()) as { id?: string };
			if (!data?.id) throw new Error('Invalid response from v0');
			chat = { id: data.id };
		} else {
			const created = await v0.chats.create({
				message,
				system,
				responseMode: 'sync',
				chatPrivacy: 'private'
			});
			if (!created || typeof created !== 'object' || !('id' in created)) {
				return { ok: false, error: 'Invalid response from v0' };
			}
			chat = created as { id: string };
		}

		if (!chat || typeof chat !== 'object' || !('id' in chat)) {
			return { ok: false, error: 'Invalid response from v0' };
		}

		const chatId = (chat as { id: string }).id;
		// Build runs async; wait 4 min then check once (no polling).
		await new Promise((r) => setTimeout(r, WAIT_BEFORE_CHECK_MS));

		let updated: unknown = null;
		for (let r = 0; r <= GET_BY_ID_RETRIES; r++) {
			try {
				updated = await v0.chats.getById({ chatId });
				break;
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				if (r < GET_BY_ID_RETRIES) {
					serverWarn('v0GenerateDemo', `getById failed (retry ${r + 1}/${GET_BY_ID_RETRIES}): ${msg}`);
					await new Promise((res) => setTimeout(res, GET_BY_ID_RETRY_DELAY_MS));
				} else {
					serverError('v0GenerateDemo', 'getById failed after retries', msg);
					return { ok: false, error: msg };
				}
			}
		}

		if (updated == null) {
			return { ok: false, error: 'Could not fetch v0 chat status. Try again.' };
		}

		const raw = updated as { latestVersion?: { demoUrl?: string; status?: string }; demo?: string };
		const version = raw?.latestVersion;
		const demoUrl = version?.demoUrl ?? (typeof raw?.demo === 'string' ? raw.demo : undefined);

		if (version?.status === 'failed') {
			return { ok: false, error: 'v0 build failed' };
		}
		if (!demoUrl) {
			return { ok: false, error: 'Demo not ready after 4 minutes. Try again.' };
		}

		return { ok: true, demoUrl, chatId };
	} catch (e) {
		const msg = e instanceof Error ? e.message : String(e);
		serverError('v0GenerateDemo', msg);
		return { ok: false, error: msg };
	}
}
