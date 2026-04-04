/**
 * Fetches public pages for each place website and extracts contact emails.
 * Output CSV columns start with Company, Email (then Account Website, address fields, Phone, Industry).
 * Usage: node scripts/scrape-places-emails.mjs [input.json] [output.csv]
 *        node scripts/scrape-places-emails.mjs --migrate-csv-only [output.csv]
 * Defaults: Downloads dataset JSON -> apps/admin/docs/data/google-places_apollo-accounts-import.csv
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isUnusableScrapedEmail, SKIP_SCRAPE_HOSTS } from "./email-scrape-validate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_INPUT = path.join(
	process.env.USERPROFILE || process.env.HOME || "",
	"Downloads/dataset_crawler-google-places_2026-04-04_02-56-05-501.json"
);
const DEFAULT_OUTPUT = path.join(
	repoRoot,
	"apps/admin/docs/data/google-places_apollo-accounts-import.csv"
);

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const PATHS_TO_TRY = [
	"/",
	"/contact",
	"/contact-us",
	"/contactus",
	"/about",
	"/about-us",
	"/en/contact",
	"/contact.html",
];

const FETCH_TIMEOUT_MS = 12_000;
const DELAY_MS = 400;

const EMAIL_IN_TEXT =
	/\b([a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)\b/gi;

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

function domainFromUrl(url) {
	if (!url || typeof url !== "string") return "";
	try {
		let u = url.trim();
		if (!u) return "";
		if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
		const parsed = new URL(u);
		let host = parsed.hostname.toLowerCase();
		if (host.startsWith("www.")) host = host.slice(4);
		return host;
	} catch {
		return "";
	}
}

function countryName(code) {
	if (!code) return "";
	const m = { CA: "Canada", US: "United States" };
	return m[code] || code;
}

function escapeCsvField(val) {
	if (val == null || val === undefined) return "";
	const s = String(val);
	if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
	return s;
}

function emailDomainMatchesSite(email, siteDomain) {
	if (!siteDomain) return false;
	const at = email.lastIndexOf("@");
	if (at < 0) return false;
	const host = email.slice(at + 1).toLowerCase();
	const s = siteDomain.toLowerCase();
	return host === s || host.endsWith(`.${s}`);
}

function pickBestEmail(candidates, siteDomain) {
	const list = [...new Set(candidates.map((c) => c.toLowerCase()))].filter((e) => !isUnusableScrapedEmail(e));
	if (list.length === 0) return "";

	const onDomain = list.filter((e) => emailDomainMatchesSite(e, siteDomain));
	const pool = onDomain.length > 0 ? onDomain : list;

	const preferredLocals = ["info", "contact", "office", "hello", "reception", "appointments", "admin"];
	for (const pl of preferredLocals) {
		const hit = pool.find((e) => (e.split("@")[0] || "") === pl);
		if (hit) return hit;
	}
	return pool[0] || "";
}

function extractEmailsFromHtml(html, siteDomain) {
	const found = [];

	for (const m of html.matchAll(/mailto:([a-zA-Z0-9._%+-]+@[^"'>\s&]+)/gi)) {
		const raw = m[1].split("?")[0].trim();
		const cleaned = raw.replace(/%40/gi, "@");
		if (cleaned.includes("@")) found.push(cleaned);
	}

	for (const m of html.matchAll(EMAIL_IN_TEXT)) {
		found.push(m[1]);
	}

	const picked = pickBestEmail(found, siteDomain);
	return isUnusableScrapedEmail(picked) ? "" : picked;
}

async function fetchText(url) {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			signal: ctrl.signal,
			headers: {
				"User-Agent": USER_AGENT,
				Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "en-CA,en;q=0.9",
			},
			redirect: "follow",
		});
		if (!res.ok) return "";
		const ct = res.headers.get("content-type") || "";
		if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
			return "";
		}
		const buf = await res.arrayBuffer();
		const text = new TextDecoder("utf-8", { fatal: false }).decode(buf);
		return text.slice(0, 1_500_000);
	} catch {
		return "";
	} finally {
		clearTimeout(t);
	}
}

async function scrapeEmailForDomain(siteDomain) {
	if (!siteDomain) return "";
	if (SKIP_SCRAPE_HOSTS.has(siteDomain)) return "";

	const bases = [`https://${siteDomain}`, `https://www.${siteDomain}`];

	for (const base of bases) {
		for (const p of PATHS_TO_TRY) {
			const url = base.replace(/\/$/, "") + (p === "/" ? "/" : p);
			const html = await fetchText(url);
			if (!html) continue;
			const email = extractEmailsFromHtml(html, siteDomain);
			if (email) return email;
		}
	}

	// HTTP fallback for sites without HTTPS
	for (const p of PATHS_TO_TRY) {
		const url = `http://${siteDomain}${p === "/" ? "/" : p}`;
		const html = await fetchText(url);
		if (!html) continue;
		const email = extractEmailsFromHtml(html, siteDomain);
		if (email) return email;
	}

	return "";
}

function buildCsvRow(r, contactEmail) {
	const domain = domainFromUrl(r.website);
	const city = r.city || r.neighborhood || "";
	const country = countryName(r.countryCode);
	const street = r.address || "";
	const accountLocation =
		street || [city, r.state, r.postalCode, country].filter(Boolean).join(", ");
	const categories = Array.isArray(r.categories)
		? r.categories.join("; ")
		: r.categoryName || "";

	return [
		r.title || "",
		contactEmail,
		domain,
		accountLocation,
		street,
		city,
		r.state || "",
		country,
		r.postalCode || "",
		r.phone || r.phoneUnformatted || "",
		categories,
	].map(escapeCsvField);
}

function parseCsvLine(line) {
	const out = [];
	let cur = "";
	let inQ = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (inQ) {
			if (c === '"') {
				if (line[i + 1] === '"') {
					cur += '"';
					i++;
				} else {
					inQ = false;
				}
			} else {
				cur += c;
			}
		} else if (c === '"') {
			inQ = true;
		} else if (c === ",") {
			out.push(cur);
			cur = "";
		} else {
			cur += c;
		}
	}
	out.push(cur);
	return out;
}

/** Reuse valid emails from a previous CSV run to avoid redundant HTTP. */
function loadExistingValidEmails(csvPath) {
	if (!fs.existsSync(csvPath)) return new Map();
	const map = new Map();
	const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/);
	const header = lines[0] || "";
	const legacy =
		header.includes("Account Name") &&
		header.includes("Contact Email") &&
		!header.startsWith("Company,");
	for (let i = 1; i < lines.length; i++) {
		if (!lines[i].trim()) continue;
		const cols = parseCsvLine(lines[i]);
		if (cols.length < 3) continue;
		let dom;
		let em;
		if (legacy) {
			dom = (cols[1] || "").trim().toLowerCase();
			em = (cols[2] || "").trim();
		} else {
			dom = (cols[2] || "").trim().toLowerCase();
			em = (cols[1] || "").trim();
		}
		if (dom && em && !isUnusableScrapedEmail(em)) map.set(dom, em);
	}
	return map;
}

/** Rewrite file from Account Name, Domain, Email,... to Company, Email, Domain,... */
function migrateLegacyCsvColumnOrder(csvPath) {
	if (!fs.existsSync(csvPath)) return;
	const lines = fs.readFileSync(csvPath, "utf8").split(/\r?\n/);
	const header = lines[0] || "";
	if (!header.includes("Account Name") || header.startsWith("Company,")) return;

	const newHeader = [
		"Company",
		"Email",
		"Account Website (Domain)",
		"Account location",
		"Street Address",
		"City",
		"State",
		"Country",
		"Postal Code",
		"Phone",
		"Industry",
	];
	const out = [newHeader.map(escapeCsvField).join(",")];
	for (let i = 1; i < lines.length; i++) {
		if (!lines[i].trim()) continue;
		const c = parseCsvLine(lines[i]);
		if (c.length < 11) continue;
		const row = [c[0], c[2], c[1], ...c.slice(3)];
		out.push(row.map(escapeCsvField).join(","));
	}
	fs.writeFileSync(csvPath, out.join("\n"), "utf8");
}

async function main() {
	const inputPath = path.resolve(process.argv[2] || DEFAULT_INPUT);
	const outputPath = path.resolve(process.argv[3] || DEFAULT_OUTPUT);

	if (!fs.existsSync(inputPath)) {
		console.error("Input not found:", inputPath);
		process.exit(1);
	}

	const rows = JSON.parse(fs.readFileSync(inputPath, "utf8"));

	migrateLegacyCsvColumnOrder(outputPath);

	const headers = [
		"Company",
		"Email",
		"Account Website (Domain)",
		"Account location",
		"Street Address",
		"City",
		"State",
		"Country",
		"Postal Code",
		"Phone",
		"Industry",
	];

	const emailByDomain = new Map();
	const uniqueDomains = [
		...new Set(rows.map((r) => domainFromUrl(r.website)).filter(Boolean)),
	];

	const existing = loadExistingValidEmails(outputPath);
	let skipped = 0;

	console.log("Domains:", uniqueDomains.length, "| reusing valid from CSV:", existing.size);

	for (let i = 0; i < uniqueDomains.length; i++) {
		const d = uniqueDomains[i];
		process.stdout.write(`\r[${i + 1}/${uniqueDomains.length}] ${d}`.padEnd(70));
		if (existing.has(d)) {
			emailByDomain.set(d, existing.get(d));
			skipped++;
			await sleep(50);
			continue;
		}
		if (SKIP_SCRAPE_HOSTS.has(d)) {
			emailByDomain.set(d, "");
			await sleep(50);
			continue;
		}
		const email = await scrapeEmailForDomain(d);
		const clean = email && !isUnusableScrapedEmail(email) ? email : "";
		emailByDomain.set(d, clean);
		if (clean) console.log(`\n  -> ${clean}`);
		await sleep(DELAY_MS);
	}
	console.log(`\nSkipped ${skipped} domains (already had valid email in output CSV).`);

	console.log("\n");

	const lines = [headers.map(escapeCsvField).join(",")];
	for (const r of rows) {
		const d = domainFromUrl(r.website);
		const contactEmail = d ? emailByDomain.get(d) || "" : "";
		lines.push(buildCsvRow(r, contactEmail).join(","));
	}

	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, lines.join("\n"), "utf8");

	const filled = [...emailByDomain.values()].filter(Boolean).length;
	console.log("Wrote:", outputPath);
	console.log("Emails found for", filled, "of", uniqueDomains.length, "domains with websites");
}

if (process.argv.includes("--migrate-csv-only")) {
	const idx = process.argv.indexOf("--migrate-csv-only");
	const outPath = path.resolve(process.argv[idx + 1] || DEFAULT_OUTPUT);
	migrateLegacyCsvColumnOrder(outPath);
	console.log("Migrated column order:", outPath);
} else {
	main().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}
