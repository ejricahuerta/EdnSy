<script lang="ts">
	import { tick } from 'svelte';
	import { CAL_COM_LINK, CHAT_DAILY_LIMIT } from '$lib/constants';
	import { formatChatMessage } from '$lib/formatChatMessage';
	import { MessageCircle, X, Send, Calendar } from 'lucide-svelte';

	let {
		industrySlug = 'healthcare',
		displayName = ''
	}: {
		industrySlug: string;
		displayName?: string;
	} = $props();

	let open = $state(false);
	let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
	let input = $state('');
	let loading = $state(false);
	let locked = $state(false);
	let lockedMessage = $state('');
	let messagesEnd: HTMLDivElement | null = $state(null);
	let scrollArea: HTMLDivElement | null = $state(null);

	$effect(() => {
		if (!open) return;
		const _ = [messages.length, loading];
		tick().then(() => {
			messagesEnd?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		});
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
				<div class="p-3 border-t border-base-300">
					<div class="flex gap-2">
						<input
							type="text"
							class="input input-bordered input-sm flex-1"
							placeholder="Type a message…"
							bind:value={input}
							onkeydown={handleKeydown}
							disabled={loading}
							aria-label="Chat message"
						/>
						<button
							type="button"
							class="btn btn-primary btn-sm gap-1"
							onclick={send}
							disabled={loading || !input.trim()}
							aria-label="Send message"
						>
							<Send class="w-4 h-4" />
							Send
						</button>
					</div>
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
