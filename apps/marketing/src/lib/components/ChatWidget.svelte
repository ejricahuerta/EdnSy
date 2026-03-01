<script lang="ts">
	import { tick } from 'svelte';
	import { CAL_COM_LINK, CHAT_DAILY_LIMIT } from '$lib/constants';
	import { formatChatMessage } from '$lib/formatChatMessage';
	import { trackDemoEvent } from '$lib/demoTracking';
	import CallbackDialog from '$lib/components/demo/CallbackDialog.svelte';
	import { MessageCircle, X, Send, Calendar, Phone } from 'lucide-svelte';

	let {
		industrySlug = 'healthcare',
		displayName = '',
		prospectId = ''
	}: {
		industrySlug: string;
		displayName?: string;
		prospectId?: string;
	} = $props();

	let open = $state(false);
	let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
	let input = $state('');
	let loading = $state(false);
	let locked = $state(false);
	let lockedMessage = $state('');
	let messagesEnd: HTMLDivElement | null = $state(null);
	let scrollArea: HTMLDivElement | null = $state(null);
	let callbackDialogOpen = $state(false);
	let chatOpenedTracked = $state(false);
	let callbackOpenedTracked = $state(false);

	$effect(() => {
		if (!open) return;
		const _ = [messages.length, loading];
		tick().then(() => {
			messagesEnd?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
	});

	$effect(() => {
		if (open && prospectId && !chatOpenedTracked) {
			chatOpenedTracked = true;
			trackDemoEvent(prospectId, 'chat_opened');
		}
	});

	$effect(() => {
		if (callbackDialogOpen && prospectId && !callbackOpenedTracked) {
			callbackOpenedTracked = true;
			trackDemoEvent(prospectId, 'callback_opened');
		}
		if (!callbackDialogOpen) callbackOpenedTracked = false;
	});

	async function send() {
		const text = input.trim();
		if (!text || loading || locked) return;

		input = '';
		messages = [...messages, { role: 'user', content: text }];
		loading = true;

		try {
			const history = messages.map((m) => ({ role: m.role, content: m.content }));
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: history,
					industrySlug,
					displayName: displayName || undefined
				})
			});

			const data = await res.json();

			if ((res.status === 429 || res.status === 503) && data.locked) {
				locked = true;
				lockedMessage =
					data.message ??
					`You've reached the daily limit of ${CHAT_DAILY_LIMIT} messages.`;
				loading = false;
				return;
			}

			if (!res.ok) {
				messages = [...messages, { role: 'assistant', content: data.error ?? 'Something went wrong. Try again.' }];
				loading = false;
				return;
			}

			messages = [...messages, { role: 'assistant', content: data.content ?? '' }];
			if (prospectId) {
				trackDemoEvent(prospectId, 'chat_message_sent', { message_count: messages.length });
			}
		} catch {
			messages = [...messages, { role: 'assistant', content: 'Unable to send. Check your connection and try again.' }];
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}
</script>

<div class="chat-widget fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
	{#if open}
		<div
			class="bg-base-100 border border-base-300 rounded-2xl shadow-xl flex flex-col w-[min(100vw-2rem,22rem)] h-[min(80vh,28rem)] max-h-[min(80vh,28rem)] overflow-hidden"
			aria-label="Chat"
		>
			<div class="flex shrink-0 items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200/50">
				<div class="flex flex-col gap-0.5">
					<span class="font-semibold text-base-content">Ask Ed & Sy</span>
					<span class="text-xs text-base-content/60">AI powered by Ed and Sy Inc.</span>
				</div>
				<button
					type="button"
					class="btn btn-ghost btn-sm btn-square"
					onclick={() => (open = false)}
					aria-label="Close chat"
				>
					<X class="w-5 h-5" />
				</button>
			</div>

			<div
				bind:this={scrollArea}
				class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 space-y-3"
				role="log"
				aria-live="polite"
				aria-label="Chat messages"
			>
				{#if messages.length === 0}
					<div class="space-y-2 text-sm text-base-content/70">
						<p>Ask about services, hours, or how we can help. Answers are tailored to this page.</p>
						<p class="text-xs text-base-content/50">Powered by Ed and Sy Inc.</p>
					</div>
				{:else}
					{#each messages as msg}
						<div
							class="flex flex-col gap-1 {msg.role === 'user' ? 'items-end' : 'items-start'}">
							<span class="text-xs font-medium text-base-content/60">{msg.role === 'user' ? 'You' : 'Assistant'}</span>
							<div
								class="rounded-2xl px-4 py-2 max-w-[90%] text-sm break-words {msg.role === 'user'
									? 'bg-primary text-primary-content'
									: 'bg-base-200 text-base-content'}">
								{#if msg.role === 'assistant'}
									{@html formatChatMessage(msg.content)}
								{:else}
									{msg.content}
								{/if}
							</div>
						</div>
					{/each}
				{/if}
				{#if loading}
					<div class="flex items-center gap-2 text-sm text-base-content/70">
						<span class="loading loading-dots loading-sm"></span>
						Thinking…
					</div>
				{/if}
				<div bind:this={messagesEnd} class="h-0 w-full shrink-0" aria-hidden="true"></div>
			</div>

			{#if locked}
				<div class="p-4 border-t border-base-300 bg-base-200/50 space-y-3">
					<p class="text-sm text-base-content">{lockedMessage}</p>
					<a
						href={CAL_COM_LINK}
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary w-full gap-2"
					>
						<Calendar class="w-4 h-4" aria-hidden="true" />
						Book a call with Ed & Sy
					</a>
				</div>
			{:else}
				<div class="chat-widget-footer">
					<div class="chat-widget-input-row">
						<textarea
							class="chat-widget-textarea"
							placeholder="Type a message…"
							bind:value={input}
							onkeydown={handleKeydown}
							disabled={loading}
							rows="1"
							aria-label="Chat message"
						></textarea>
						<button
							type="button"
							class="chat-widget-send"
							onclick={send}
							disabled={loading || !input.trim()}
							aria-label="Send message"
						>
							<Send class="w-4 h-4" />
							Send
						</button>
					</div>
					<button
						type="button"
						class="chat-widget-callback-btn"
						onclick={() => (callbackDialogOpen = true)}
						aria-label="Request a callback"
					>
						<Phone class="w-4 h-4" aria-hidden="true" />
						Request a callback
					</button>
				</div>
			{/if}
		</div>
	{/if}

	<button
		type="button"
		class="btn btn-primary btn-circle shadow-lg size-14"
		onclick={() => (open = !open)}
		aria-label={open ? 'Close chat' : 'Open chat'}
	>
		<MessageCircle class="w-7 h-7" aria-hidden="true" />
	</button>
</div>

<CallbackDialog
	open={callbackDialogOpen}
	prospectId={prospectId}
	termsUrl="/terms"
	onClose={() => (callbackDialogOpen = false)}
/>

<style>
	.chat-widget-footer {
		padding: 0.75rem;
		border-top: 1px solid var(--color-base-300, #44403c);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		background: var(--color-base-100, #1c1917);
	}
	.chat-widget-input-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
	}
	.chat-widget-textarea {
		flex: 1;
		min-height: 2.5rem;
		max-height: 8rem;
		resize: none;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-base-300, #44403c);
		background: var(--color-base-200, #292524);
		color: var(--color-base-content, #e7e5e4);
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.chat-widget-textarea::placeholder {
		color: var(--color-base-content);
		opacity: 0.5;
	}
	.chat-widget-textarea:focus {
		outline: none;
		border-color: var(--color-primary, #2D6A4F);
		box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.25);
	}
	.chat-widget-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.chat-widget-send {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		height: 2.5rem;
		padding: 0 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 0.5rem;
		border: none;
		background: var(--color-primary, #2D6A4F);
		color: var(--color-primary-content, #fafaf9);
		cursor: pointer;
		transition: filter 0.15s;
	}
	.chat-widget-send:hover:not(:disabled) {
		filter: brightness(1.1);
	}
	.chat-widget-send:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.chat-widget-callback-btn {
		width: 100%;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.8125rem;
		border-radius: 0.5rem;
		border: 1px solid var(--color-base-300, #44403c);
		background: transparent;
		color: var(--color-base-content, #e7e5e4);
		opacity: 0.9;
		cursor: pointer;
		transition: background 0.15s, opacity 0.15s;
	}
	.chat-widget-callback-btn:hover {
		background: var(--color-base-200, #292524);
		opacity: 1;
	}
</style>
