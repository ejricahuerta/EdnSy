/**
 * Shared rules for scraped contact emails (avoid JS bundle artifacts and placeholders).
 */

const JUNK_LOCAL_PREFIXES = [
	"splide",
	"fancybox",
	"webpack",
	"babel",
	"chunk",
	"gulp",
	"grunt",
	"swiper",
	"slick",
];

/** Hosts that are not business-owned sites; do not scrape for email. */
export const SKIP_SCRAPE_HOSTS = new Set([
	"m.facebook.com",
	"facebook.com",
	"instagram.com",
	"sites.google.com",
	"maps.google.com",
	"google.com",
	"g.page",
	"youtube.com",
	"linkedin.com",
]);

export function isUnusableScrapedEmail(email) {
	if (!email || typeof email !== "string") return true;
	const e = email.trim().toLowerCase();
	if (!e.includes("@")) return true;

	const [local, host] = e.split("@");
	if (!local || !host) return true;

	// Version strings like splide@4.1.4
	if (/^\d+\.\d+/.test(host) || /^\d+(\.\d+)+$/.test(host)) return true;

	if (
		host === "domain.com" ||
		host === "mail.com" ||
		host === "example.com" ||
		host === "yourdomain.com" ||
		host === "company.com"
	) {
		return true;
	}

	if (e === "example@mail.com" || e === "user@domain.com" || e === "support@domain.com") {
		return true;
	}

	if (JUNK_LOCAL_PREFIXES.some((p) => local === p || local.startsWith(`${p}.`))) return true;

	if (
		e.includes("noreply") ||
		e.includes("no-reply") ||
		e.includes("donotreply") ||
		e.includes("mailer-daemon") ||
		local === "postmaster" ||
		local === "abuse" ||
		e.includes("@sentry.") ||
		e.includes("wixpress.com") ||
		e.includes("@schema.org") ||
		e.endsWith(".png") ||
		e.endsWith(".jpg") ||
		e.endsWith(".gif") ||
		e.endsWith(".webp") ||
		e.includes("@example.")
	) {
		return true;
	}

	return false;
}
