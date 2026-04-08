/**
 * Prospect ↔ Stitch project mapping (see `stitch_projects` table).
 */

import { getSupabaseAdmin } from '$lib/server/supabase';

export async function getStitchProjectId(prospectId: string): Promise<string | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('stitch_projects')
		.select('stitch_project_id')
		.eq('prospect_id', prospectId)
		.maybeSingle();
	if (error || !data?.stitch_project_id || typeof data.stitch_project_id !== 'string') return null;
	const id = data.stitch_project_id.trim();
	return id || null;
}

export async function setStitchProjectId(
	prospectId: string,
	stitchProjectId: string,
	projectTitle?: string
): Promise<{ ok: boolean; error?: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };
	const sid = stitchProjectId.trim();
	if (!sid) return { ok: false, error: 'stitchProjectId is empty' };

	const { data: existing } = await supabase
		.from('stitch_projects')
		.select('project_title')
		.eq('prospect_id', prospectId)
		.maybeSingle();

	const resolvedTitle =
		projectTitle != null && projectTitle.trim() !== ''
			? projectTitle.trim().slice(0, 500)
			: (existing?.project_title as string | undefined) ?? null;

	const row: Record<string, unknown> = {
		prospect_id: prospectId,
		stitch_project_id: sid,
		updated_at: new Date().toISOString()
	};
	if (resolvedTitle) row.project_title = resolvedTitle;

	const { error } = await supabase.from('stitch_projects').upsert(row, {
		onConflict: 'prospect_id'
	});
	if (error) return { ok: false, error: error.message };
	return { ok: true };
}
