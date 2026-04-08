/**
 * Minimal CSV parse for prospect import (one line per record; quoted commas supported).
 */

import { createHash } from 'node:crypto';
import { gbpCategoriesToIndustryLabel } from '$lib/industries';
import { insertProspectIfAbsent } from '$lib/server/prospects';

const MAX_ROWS = 500;

function parseCsvLine(line: string): string[] {
	const out: string[] = [];
	let cur = '';
	let inQ = false;
	for (let i = 0; i < line.length; i++) {
		const c = line[i];
		if (c === '"') {
			inQ = !inQ;
		} else if (c === ',' && !inQ) {
			out.push(cur.trim());
			cur = '';
		} else {
			cur += c;
		}
	}
	out.push(cur.trim());
	return out.map((s) => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

const norm = (s: string) => s.replace(/^\uFEFF/, '').trim().toLowerCase();

function colIndex(headers: string[], aliases: string[]): number {
	const h = headers.map((x) => norm(x));
	for (const a of aliases) {
		const i = h.indexOf(a);
		if (i >= 0) return i;
	}
	return -1;
}

export type CsvImportRow = {
	companyName: string;
	email: string;
	website?: string;
	phone?: string;
	industry?: string;
};

export function parseCsvToMatrix(text: string): string[][] {
	const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
	return lines.map(parseCsvLine);
}

function rowToFields(headers: string[], cells: string[]): CsvImportRow | null {
	const ci = colIndex(headers, ['company', 'company name', 'name', 'client', 'business']);
	const ei = colIndex(headers, ['email', 'e-mail', 'mail']);
	const wi = colIndex(headers, ['website', 'url', 'site', 'web']);
	const pi = colIndex(headers, ['phone', 'telephone', 'mobile', 'tel']);
	const ii = colIndex(headers, ['industry', 'vertical', 'sector']);
	const companyName = (ci >= 0 ? cells[ci] : '')?.trim() ?? '';
	const email = (ei >= 0 ? cells[ei] : '')?.trim() ?? '';
	if (!companyName && !email) return null;
	if (!email || !companyName) return null;
	const rawIndustry =
		ii >= 0 && cells[ii]?.trim() ? cells[ii].trim().slice(0, 200) : undefined;
	const industry =
		rawIndustry != null
			? gbpCategoriesToIndustryLabel(rawIndustry) ?? rawIndustry
			: undefined;
	return {
		companyName: companyName.slice(0, 500),
		email: email.slice(0, 500),
		website: wi >= 0 && cells[wi]?.trim() ? cells[wi].trim().slice(0, 500) : undefined,
		phone: pi >= 0 && cells[pi]?.trim() ? cells[pi].trim().slice(0, 100) : undefined,
		industry
	};
}

/** Stable id per user + row so re-import skips duplicates (insert-only). */
export function buildCsvProviderRowId(userId: string, email: string, companyName: string, rowIndex: number): string {
	const base = `${userId}|${rowIndex}|${email.trim().toLowerCase()}|${companyName.trim().toLowerCase()}`;
	return `csv:${createHash('sha256').update(base).digest('hex').slice(0, 40)}`;
}

export type ImportCsvResult = {
	inserted: number;
	skipped: number;
	failed: number;
	errors: string[];
};

export async function importProspectsFromCsv(userId: string, text: string): Promise<ImportCsvResult> {
	const matrix = parseCsvToMatrix(text);
	if (matrix.length < 2) {
		return { inserted: 0, skipped: 0, failed: 0, errors: ['Add a header row and at least one data row.'] };
	}
	const headers = matrix[0]!;
	const hasCompany =
		colIndex(headers, ['company', 'company name', 'name', 'client', 'business']) >= 0;
	const hasEmail = colIndex(headers, ['email', 'e-mail', 'mail']) >= 0;
	if (!hasCompany || !hasEmail) {
		return {
			inserted: 0,
			skipped: 0,
			failed: 0,
			errors: ['CSV must include header columns for company (e.g. company, name) and email.']
		};
	}
	const dataRows = matrix.slice(1).slice(0, MAX_ROWS);
	const errors: string[] = [];
	let inserted = 0;
	let skipped = 0;
	let failed = 0;
	for (let i = 0; i < dataRows.length; i++) {
		const cells = dataRows[i]!;
		const lineNo = i + 2;
		const fields = rowToFields(headers, cells);
		if (!fields) {
			skipped++;
			continue;
		}
		const providerRowId = buildCsvProviderRowId(userId, fields.email, fields.companyName, i + 1);
		const r = await insertProspectIfAbsent(userId, 'manual', providerRowId, fields);
		if (r.error) {
			failed++;
			errors.push(`Row ${lineNo}: ${r.error}`);
			if (errors.length >= 8) break;
		} else if (r.inserted) {
			inserted++;
		} else {
			skipped++;
		}
	}
	return { inserted, skipped, failed, errors };
}
