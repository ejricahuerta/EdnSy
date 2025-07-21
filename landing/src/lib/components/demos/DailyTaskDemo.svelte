<script lang="ts">
import { onMount } from 'svelte';
let input = '';
let loading = false;
type ChatMsg = { role: 'user' | 'ai'; type: 'text'; content: string };
let chatHistory: ChatMsg[] = [
  { role: 'ai', type: 'text', content: 'Hi! I can help automate your daily service tasks. Paste a work order, customer feedback, or restock request to get started.' }
];
let chatWindow: HTMLDivElement | null = null;

function scrollToBottom() {
  if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function processTask() {
  if (!input.trim()) {
    chatHistory = [...chatHistory, { role: 'user', type: 'text', content: '' }];
    chatHistory = [...chatHistory, { role: 'ai', type: 'text', content: 'Please enter a task or message to process.' }];
    input = '';
    scrollToBottom();
    return;
  }
  chatHistory = [...chatHistory, { role: 'user', type: 'text', content: input }];
  loading = true;
  let output = '';
  setTimeout(() => {
    const text = input.toLowerCase();
    if (text.includes('work order') || text.includes('job')) {
      const serviceMatch = input.match(/(drain cleaning|ac repair|water heater install|furnace maintenance|leak detection)/i);
      const addressMatch = input.match(/at ([\w\s\d]+),?/i);
      const dateMatch = input.match(/\d{4}-\d{2}-\d{2}/);
      const customerMatch = input.match(/customer:?\s*([\w\s]+)/i);
      const service = serviceMatch ? serviceMatch[1] : 'N/A';
      const address = addressMatch ? addressMatch[1].trim() : 'N/A';
      const date = dateMatch ? dateMatch[0] : 'N/A';
      const customer = customerMatch ? customerMatch[1].trim() : 'N/A';
      output = `Work Order Processed!\n• Service: ${service}\n• Address: ${address}\n• Date: ${date}\n• Customer: ${customer}\nAction: Job scheduled and technician assigned in Service Company system.`;
    } else if (text.includes('feedback') || text.includes('review') || text.includes('service')) {
      const sentiment = text.includes('late') && text.includes('great') ? 'Mixed' :
                        (text.includes('great') || text.includes('amazing') || text.includes('good') ? 'Positive' : 'Neutral');
      output = `Customer Feedback Processed!\n• Sentiment: ${sentiment}\n• Key words: ${input.split(' ').filter(word => word.length > 3).slice(0, 3).join(', ')}...\nAction: Feedback logged and, if needed, follow-up task created for the team.`;
    } else if (text.includes('restock') || text.includes('order parts')) {
      output = `Restock Request Processed!\n• Item: ${input.split(' ').slice(-3).join(' ')}\nAction: Restock order created and supplier notified.`;
    } else {
      output = `AI processed your input.\nExtracted keywords: ${input.split(' ').filter(word => word.length > 3).slice(0, 5).join(', ')}...\nAction: Task created based on your request.`;
    }
    chatHistory = [...chatHistory, { role: 'ai', type: 'text', content: output }];
    loading = false;
    input = '';
    scrollToBottom();
  }, 1200);
}
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">🛠️</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">ServicePro Automation</span>
      <span class="text-xs text-[#d9fdd3]">automation bot</span>
    </div>
  </div>
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
          <div class={msg.role === 'user'
            ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-[#25d366] text-white rounded-br-md'
            : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200 whitespace-pre-line'}>
            {msg.content}
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="flex justify-start">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-white text-gray-900 border border-gray-200 shadow animate-pulse">AI is processing...</div>
        </div>
      {/if}
    </div>
    <!-- Input bar -->
    <form class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10" on:submit|preventDefault={processTask}>
      <input
        type="text"
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white text-gray-900"
        placeholder="Paste a work order, feedback, or restock request..."
        bind:value={input}
        autocomplete="off"
      />
      <button type="submit" class="bg-[#25d366] hover:bg-[#128c7e] text-white rounded-full p-2 transition-colors duration-150" aria-label="Send message">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </form>
  </div>
</div>

<style>
</style> 