<script lang="ts">
	import { tick } from 'svelte';
	import { CAL_COM_LINK, CHAT_DAILY_LIMIT } from '$lib/constants';
	import { formatChatMessage } from '$lib/formatChatMessage';
	import { trackDemoEvent } from '$lib/demo';
	import RetellCallbackDialog from '$lib/components/RetellCallbackDialog.svelte';
	import { MessageCircle, X, Send, Calendar, Phone } from 'lucide-svelte';

	let {
		industrySlug = 'healthcare',
		displayName = '',
		prospectId = '',
		onOpenCallback = undefined as (() => void) | undefined,
		/** When set (e.g. 5000), chat opens automatically after this many ms with a subtle ding. */
		autoOpenAfterMs = undefined as number | undefined
	}: {
		industrySlug: string;
		displayName?: string;
		prospectId?: string;
		onOpenCallback?: () => void;
		autoOpenAfterMs?: number;
	} = $props();

	let open = $state(false);
	let callbackDialogOpen = $state(false);
	let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
	let input = $state('');
	let loading = $state(false);
	let locked = $state(false);
	let lockedMessage = $state('');
	let messagesEnd: HTMLDivElement | null = $state(null);
	let scrollArea: HTMLDivElement | null = $state(null);
	let chatOpenedTracked = $state(false);
	let callbackOpenedTracked = $state(false);
	let autoOpened = $state(false);

	function playDing() {
		try {
			const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
			if (ctx.state === 'suspended') ctx.resume();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.frequency.value = 640;
			osc.type = 'sine';
			gain.gain.setValueAtTime(0.12, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.18);
		} catch (_) {
			/* ignore if audio not allowed */
		}
	}

	$effect(() => {
		const delay = autoOpenAfterMs;
		if (delay == null || delay < 0 || autoOpened) return;
		const id = setTimeout(() => {
			autoOpened = true;
			playDing();
			open = true;
		}, delay);
		return () => clearTimeout(id);
	});

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

	function openCallbackAndTrack() {
		if (prospectId && !callbackOpenedTracked) {
			callbackOpenedTracked = true;
			trackDemoEvent(prospectId, 'callback_opened');
		}
		if (onOpenCallback) {
			onOpenCallback();
		} else {
			callbackDialogOpen = true;
		}
	}

	function onCallbackError(event: CustomEvent<{ notConfigured?: boolean }>) {
		if (event.detail?.notConfigured) {
			window.open(CAL_COM_LINK, '_blank', 'noopener,noreferrer');
		}
	}

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

			if (res.status === 429 || res.status === 503) {
				locked = true;
				lockedMessage = data.error ?? `You've reached the daily limit of ${CHAT_DAILY_LIMIT} messages.`;
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

<div class="chat-widget fixed bottom-4 right-8 z-50 flex flex-col items-end gap-2">
	{#if open}
		<div
			class="chat-widget-panel"
			aria-label="Chat"
		>
			<div class="chat-widget-header">
				<span class="chat-widget-title">Chat</span>
				<button
					type="button"
					class="chat-widget-close"
					onclick={() => (open = false)}
					aria-label="Close chat"
				>
					<X class="chat-widget-close-icon" />
				</button>
			</div>

			<div
				bind:this={scrollArea}
				class="chat-widget-messages"
				role="log"
				aria-live="polite"
				aria-label="Chat messages"
			>
				{#if messages.length === 0}
					<div class="chat-widget-empty">
						<p>Ask about services, hours, or how we can help.</p>
						<p class="chat-widget-powered">Powered by Ed & Sy Inc.</p>
					</div>
				{:else}
					{#each messages as msg}
						<div
							class="chat-widget-bubble-wrap {msg.role === 'user' ? 'chat-widget-bubble-user' : 'chat-widget-bubble-assistant'}">
							<div class="chat-widget-bubble {msg.role === 'user' ? 'chat-widget-bubble-user' : 'chat-widget-bubble-assistant'}">
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
					<div class="chat-widget-loading">
						<span class="chat-widget-dots"></span>
						Thinking…
					</div>
				{/if}
				<div bind:this={messagesEnd} class="h-0 w-full shrink-0" aria-hidden="true"></div>
			</div>

			{#if locked}
				<div class="chat-widget-locked">
					<p class="chat-widget-locked-text">{lockedMessage}</p>
					<a
						href={CAL_COM_LINK}
						target="_blank"
						rel="noopener noreferrer"
						class="chat-widget-cta-primary"
					>
						<Calendar class="w-4 h-4" aria-hidden="true" />
						Book a call
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
						</button>
					</div>
					<button
						type="button"
						class="chat-widget-callback-btn"
						onclick={openCallbackAndTrack}
						aria-label="Request AI callback"
					>
						<Phone class="w-4 h-4" aria-hidden="true" />
						Request AI callback
					</button>
					<p class="chat-widget-powered-footer">Powered by Ed & Sy Inc.</p>
				</div>
			{/if}
		</div>
	{/if}

	{#if !onOpenCallback}
		<RetellCallbackDialog
			bind:open={callbackDialogOpen}
			prospectId={prospectId}
			onerror={onCallbackError}
		/>
	{/if}

	<button
		type="button"
		class="chat-widget-fab"
		onclick={() => (open = !open)}
		aria-label={open ? 'Close chat' : 'Open chat'}
	>
		<MessageCircle class="w-6 h-6" aria-hidden="true" />
	</button>
</div>

<style>
	/* Lead Rosetta brand: #2D6A4F primary, #1A1A14 text, #FFFFFF card, #D8D0BF border, #F5F0E8 muted */
	.chat-widget-panel {
		display: flex;
		flex-direction: column;
		width: min(100vw - 2rem, 22rem);
		height: min(80vh, 28rem);
		max-height: min(80vh, 28rem);
		overflow: hidden;
		background: #ffffff;
		border: 1px solid #d8d0bf;
		border-radius: 12px;
		box-shadow: 0 4px 24px rgba(26, 26, 20, 0.08);
	}
	.chat-widget-header {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 14px;
		border-bottom: 1px solid #d8d0bf;
		background: #f5f0e8;
	}
	.chat-widget-title {
		font-size: 0.9375rem;
		font-weight: 600;
		color: #1a1a14;
	}
	.chat-widget-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid #d8d0bf;
		border-radius: 8px;
		background: #ffffff;
		color: #1a1a14;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.chat-widget-close:hover {
		background: #eeebe0;
		border-color: #7a7566;
	}
	.chat-widget-close-icon {
		width: 18px;
		height: 18px;
	}
	.chat-widget-messages {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		background: #ffffff;
	}
	.chat-widget-empty {
		font-size: 0.875rem;
		color: #7a7566;
		padding: 4px 0;
	}
	.chat-widget-powered {
		font-size: 0.75rem;
		color: #7a7566;
		opacity: 0.85;
		margin: 8px 0 0 0;
	}
	.chat-widget-powered-footer {
		font-size: 0.6875rem;
		color: #7a7566;
		opacity: 0.8;
		margin: 4px 0 0 0;
		text-align: center;
	}
	.chat-widget-bubble-wrap {
		display: flex;
		flex-direction: column;
		max-width: 90%;
	}
	.chat-widget-bubble-wrap.chat-widget-bubble-user {
		align-self: flex-end;
	}
	.chat-widget-bubble-wrap.chat-widget-bubble-assistant {
		align-self: flex-start;
	}
	.chat-widget-bubble {
		padding: 10px 14px;
		font-size: 0.875rem;
		line-height: 1.4;
		border-radius: 12px;
		word-break: break-word;
	}
	.chat-widget-bubble-user {
		background: #2d6a4f;
		color: #fafaf9;
		border-bottom-right-radius: 4px;
	}
	.chat-widget-bubble-assistant {
		background: #f5f0e8;
		color: #1a1a14;
		border-bottom-left-radius: 4px;
	}
	.chat-widget-loading {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: #7a7566;
	}
	.chat-widget-dots {
		display: inline-block;
		width: 20px;
		height: 8px;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 8'%3E%3Ccircle cx='4' cy='4' r='2.5' fill='%237a7566' opacity='0.4'/%3E%3Ccircle cx='12' cy='4' r='2.5' fill='%237a7566' opacity='0.7'/%3E%3Ccircle cx='20' cy='4' r='2.5' fill='%237a7566'/%3E%3C/svg%3E") no-repeat center;
		animation: chat-widget-dots 0.8s ease-in-out infinite;
	}
	@keyframes chat-widget-dots {
		50% { opacity: 0.5; }
	}
	.chat-widget-locked {
		padding: 12px 14px;
		border-top: 1px solid #d8d0bf;
		background: #f5f0e8;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.chat-widget-locked-text {
		font-size: 0.875rem;
		color: #1a1a14;
		margin: 0;
	}
	.chat-widget-cta-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 14px;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: 8px;
		border: none;
		background: #2d6a4f;
		color: #fafaf9;
		text-decoration: none;
		cursor: pointer;
		transition: filter 0.15s;
	}
	.chat-widget-cta-primary:hover {
		filter: brightness(1.08);
	}
	.chat-widget-footer {
		padding: 10px 14px;
		border-top: 1px solid #d8d0bf;
		display: flex;
		flex-direction: column;
		gap: 8px;
		background: #ffffff;
	}
	.chat-widget-input-row {
		display: flex;
		gap: 8px;
		align-items: flex-end;
	}
	.chat-widget-textarea {
		flex: 1;
		min-height: 40px;
		max-height: 8rem;
		resize: none;
		padding: 10px 12px;
		font-size: 0.875rem;
		line-height: 1.35;
		border-radius: 8px;
		border: 1px solid #d8d0bf;
		background: #ffffff;
		color: #1a1a14;
		transition: border-color 0.15s, box-shadow 0.15s;
	}
	.chat-widget-textarea::placeholder {
		color: #7a7566;
	}
	.chat-widget-textarea:focus {
		outline: none;
		border-color: #2d6a4f;
		box-shadow: 0 0 0 2px rgba(45, 106, 79, 0.2);
	}
	.chat-widget-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.chat-widget-send {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		border: none;
		background: #2d6a4f;
		color: #fafaf9;
		cursor: pointer;
		transition: filter 0.15s;
	}
	.chat-widget-send:hover:not(:disabled) {
		filter: brightness(1.08);
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
		gap: 8px;
		padding: 8px 12px;
		font-size: 0.8125rem;
		border-radius: 8px;
		border: 1px solid #d8d0bf;
		background: #f5f0e8;
		color: #1a1a14;
		cursor: pointer;
		transition: background 0.15s, border-color 0.15s;
	}
	.chat-widget-callback-btn:hover {
		background: #eeebe0;
		border-color: #7a7566;
	}
	.chat-widget-fab {
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		border: none;
		background: #2d6a4f;
		color: #fafaf9;
		box-shadow: 0 4px 14px rgba(45, 106, 79, 0.35);
		cursor: pointer;
		transition: filter 0.15s, box-shadow 0.15s;
	}
	.chat-widget-fab:hover {
		filter: brightness(1.08);
		box-shadow: 0 6px 18px rgba(45, 106, 79, 0.4);
	}
</style>
