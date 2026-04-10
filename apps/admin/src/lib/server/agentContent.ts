/**
 * Versioned prompts and knowledge base for AI agents (Design, Demo Chat, Demo Creation).
 * Resolve: use DB override when present, else code default. Save: insert new version row.
 */

import { getSupabaseAdmin } from '$lib/server/supabase';

export type AgentId = 'design' | 'demo-chat' | 'demo-creation' | 'email' | 'gbp';
export type ContentType = 'prompt' | 'knowledge_base';

/** Dashboard Email AI Agent; must match `agent_content_versions` rows and `generateEmailCopy`. */
export const EMAIL_AI_AGENT_ID: AgentId = 'email';
/** Prompt key saved on Agents → Email AI; same key `getResolvedContent` uses for outreach copy. */
export const EMAIL_AI_COPY_PROMPT_KEY = 'email_copy_prompt';

export type AgentContentRow = {
	id: string;
	agent_id: string;
	content_type: string;
	key: string;
	body: string;
	version: number;
	created_at: string;
};

export type ResolvedContent = {
	body: string;
	source: 'override' | 'default';
	version?: number;
};

/**
 * Get the latest override for (agent_id, content_type, key), or null if none.
 */
export async function getLatestAgentContent(
	agentId: AgentId,
	contentType: ContentType,
	key: string
): Promise<AgentContentRow | null> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return null;
	const { data, error } = await supabase
		.from('agent_content_versions')
		.select('id, agent_id, content_type, key, body, version, created_at')
		.eq('agent_id', agentId)
		.eq('content_type', contentType)
		.eq('key', key)
		.order('version', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error || !data) return null;
	return data as AgentContentRow;
}

/**
 * Resolve content: DB override if present, else default. Use when calling an agent.
 */
export async function getResolvedContent(
	agentId: AgentId,
	contentType: ContentType,
	key: string,
	defaultBody: string
): Promise<ResolvedContent> {
	const row = await getLatestAgentContent(agentId, contentType, key);
	if (row?.body != null && row.body.trim() !== '') {
		return { body: row.body, source: 'override', version: row.version };
	}
	return { body: defaultBody, source: 'default' };
}

/**
 * Save a new version (append). Returns new version number or error.
 */
export async function saveAgentContent(
	agentId: AgentId,
	contentType: ContentType,
	key: string,
	body: string
): Promise<{ ok: true; version: number } | { ok: false; error: string }> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return { ok: false, error: 'Database not configured' };

	const latest = await getLatestAgentContent(agentId, contentType, key);
	const nextVersion = (latest?.version ?? 0) + 1;

	const { error } = await supabase.from('agent_content_versions').insert({
		agent_id: agentId,
		content_type: contentType,
		key,
		body,
		version: nextVersion
	});

	if (error) {
		const lowerError = error.message.toLowerCase();
		if (lowerError.includes('agent_content_versions_agent')) {
			return {
				ok: false,
				error:
					'Database migration is out of date for AI agent prompts. Run migration 20260313120000_agent_content_versions_add_email_gbp.sql.'
			};
		}
		if (lowerError.includes('relation') && lowerError.includes('agent_content_versions')) {
			return {
				ok: false,
				error:
					'Missing database table for AI agent prompts. Run migration 20260310120000_agent_content_versions.sql.'
			};
		}
		return { ok: false, error: error.message };
	}
	return { ok: true, version: nextVersion };
}

/**
 * List all versions for (agent_id, content_type, key) for the UI.
 */
export async function listAgentContentVersions(
	agentId: AgentId,
	contentType: ContentType,
	key: string
): Promise<AgentContentRow[]> {
	const supabase = getSupabaseAdmin();
	if (!supabase) return [];
	const { data, error } = await supabase
		.from('agent_content_versions')
		.select('id, agent_id, content_type, key, body, version, created_at')
		.eq('agent_id', agentId)
		.eq('content_type', contentType)
		.eq('key', key)
		.order('version', { ascending: false });
	if (error || !data) return [];
	return data as AgentContentRow[];
}

/**
 * Keys we use per agent for the dashboard and resolution.
 */
export const AGENT_CONTENT_KEYS = {
	design: {
		prompt: ['tone_selection'],
		knowledge_base: ['tone_guidance']
	},
	'demo-chat': {
		prompt: ['system_instruction'],
		knowledge_base: []
	},
	'demo-creation': {
		prompt: ['audit', 'audit_modal_copy'],
		knowledge_base: ['demo_kb']
	},
	email: {
		prompt: [EMAIL_AI_COPY_PROMPT_KEY],
		knowledge_base: []
	},
	gbp: {
		prompt: ['grade_prompt'],
		knowledge_base: []
	}
} as const;
