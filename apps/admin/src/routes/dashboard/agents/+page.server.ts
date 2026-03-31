import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getDashboardSessionUser } from '$lib/server/authDashboard';
import { isEdnsyUser } from '$lib/plans';
import {
	getResolvedContent,
	saveAgentContent,
	AGENT_CONTENT_KEYS,
	type AgentId
} from '$lib/server/agentContent';
import { DEFAULT_TONE_PROMPT_TEMPLATE } from '$lib/server/generateTone';
import { DEFAULT_CHAT_SYSTEM_INSTRUCTION } from '$lib/server/chatContext';
import {
	DEFAULT_AUDIT_PROMPT_TEMPLATE,
	DEFAULT_AUDIT_MODAL_COPY_PROMPT_TEMPLATE
} from '$lib/server/generateAudit';
import { DEFAULT_EMAIL_COPY_PROMPT } from '$lib/server/generateEmailCopy';
import { DEFAULT_GBP_GRADE_PROMPT } from '$lib/ai-agents/gbp-agent/gradeGbp';

const DEFAULTS: Record<AgentId, Record<string, Record<string, string>>> = {
	design: {
		prompt: { tone_selection: DEFAULT_TONE_PROMPT_TEMPLATE },
		knowledge_base: { tone_guidance: '' }
	},
	'demo-chat': {
		prompt: { system_instruction: DEFAULT_CHAT_SYSTEM_INSTRUCTION },
		knowledge_base: {}
	},
	'demo-creation': {
		prompt: {
			audit: DEFAULT_AUDIT_PROMPT_TEMPLATE,
			audit_modal_copy: DEFAULT_AUDIT_MODAL_COPY_PROMPT_TEMPLATE
		},
		knowledge_base: { demo_kb: '' }
	},
	email: {
		prompt: { email_copy_prompt: DEFAULT_EMAIL_COPY_PROMPT },
		knowledge_base: {}
	},
	gbp: {
		prompt: { grade_prompt: DEFAULT_GBP_GRADE_PROMPT },
		knowledge_base: {}
	}
};

const KEY_LABELS: Record<string, string> = {
	tone_selection: 'Tone selection',
	tone_guidance: 'Tone guidance',
	system_instruction: 'System instruction',
	audit: 'Audit prompt',
	audit_modal_copy: 'Audit modal copy',
	demo_kb: 'Demo knowledge base',
	email_copy_prompt: 'Email copy prompt',
	grade_prompt: 'GBP grade prompt'
};

/** Agent IDs shown and editable on the dashboard. */
const EDITABLE_AGENT_IDS: AgentId[] = ['email', 'gbp', 'demo-chat'];

export type ContentSlot = {
	agentId: AgentId;
	contentType: 'prompt' | 'knowledge_base';
	key: string;
	label: string;
	body: string;
	source: 'override' | 'default';
	version?: number;
};

async function loadSlots(): Promise<ContentSlot[]> {
	const slots: ContentSlot[] = [];
	for (const agentId of EDITABLE_AGENT_IDS) {
		const keys = AGENT_CONTENT_KEYS[agentId];
		const defaults = DEFAULTS[agentId];
		for (const contentType of ['prompt', 'knowledge_base'] as const) {
			const keyList = keys[contentType];
			for (const key of keyList) {
				const defaultBody = defaults[contentType][key] ?? '';
				const resolved = await getResolvedContent(agentId, contentType, key, defaultBody);
				slots.push({
					agentId,
					contentType,
					key,
					label: KEY_LABELS[key] ?? key,
					body: resolved.body,
					source: resolved.source,
					version: resolved.version
				});
			}
		}
	}
	return slots;
}

export const load: PageServerLoad = async (event) => {
	const user = await getDashboardSessionUser(event);
	if (!user) {
		throw redirect(303, '/auth/login');
	}
	if (!isEdnsyUser(user)) {
		throw redirect(303, '/dashboard');
	}
	const slots = await loadSlots();
	return { slots };
};

export const actions: Actions = {
	save: async (event) => {
		const { request, cookies } = event;
		const user = await getDashboardSessionUser(event);
		if (!user || !isEdnsyUser(user)) {
			return { success: false, error: 'Unauthorized' };
		}
		const formData = await request.formData();
		const agentId = formData.get('agentId') as string;
		const contentType = formData.get('contentType') as string;
		const key = formData.get('key') as string;
		const body = formData.get('body') as string;
		if (
			!agentId ||
			!contentType ||
			!key ||
			body == null ||
			!EDITABLE_AGENT_IDS.includes(agentId as AgentId) ||
			!['prompt', 'knowledge_base'].includes(contentType)
		) {
			return { success: false, error: 'Invalid request' };
		}
		const keys = AGENT_CONTENT_KEYS[agentId as AgentId];
		if (!keys?.[contentType as 'prompt' | 'knowledge_base']?.includes(key)) {
			return { success: false, error: 'Invalid key' };
		}
		const result = await saveAgentContent(
			agentId as AgentId,
			contentType as 'prompt' | 'knowledge_base',
			key,
			body ?? ''
		);
		if (!result.ok) return { success: false, error: result.error };
		return { success: true, version: result.version };
	}
};
