<script lang="ts">
  import { onMount, tick } from 'svelte';
  let chatInput = '';
  type ChatMsg = { role: 'user' | 'ai'; text: string };
  let chatHistory: ChatMsg[] = [
    { role: 'ai', text: 'Hi! I can help with your Plumbing/HVAC service business. Ask about jobs, scheduling, or customer questions.' }
  ];
  let loading = false;
  let chatWindow: HTMLDivElement | null = null;

  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;
    chatHistory = [...chatHistory, { role: 'user', text: chatInput }];
    loading = true;
    await tick();
    scrollToBottom();
    setTimeout(() => {
      const text = chatInput.toLowerCase();
      let reply = '';
      if (/job|schedule|work order/.test(text)) {
        reply = 'I can help you schedule jobs, assign technicians, and keep your service calendar organized.';
      } else if (/hours|open|close|emergency/.test(text)) {
        reply = 'We are open Mon-Sat, 8am-6pm. Emergency service is available 24/7!';
      } else if (/price|cost|estimate/.test(text)) {
        reply = 'For a price estimate, please provide the service type and address.';
      } else if (/feedback|review/.test(text)) {
        reply = 'We value your feedback! Please let us know about your recent service experience.';
      } else {
        reply = 'I am here to help with anything related to your Plumbing/HVAC service business. Try asking about jobs, scheduling, or customer questions!';
      }
      chatHistory = [...chatHistory, { role: 'ai', text: reply }];
      loading = false;
      chatInput = '';
      scrollToBottom();
    }, 1200);
  }

  function rowClass(role: 'user' | 'ai') {
    return 'flex ' + (role === 'user' ? 'justify-end' : 'justify-start');
  }
  function bubbleClass(role: 'user' | 'ai') {
    return (
      'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow ' +
      (role === 'user'
        ? 'bg-[#25d366] text-white rounded-br-md'
        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200')
    );
  }

  onMount(scrollToBottom);
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">🛠️</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">ServicePro Chat</span>
      <span class="text-xs text-[#d9fdd3]">chatbot</span>
    </div>
  </div>
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
          <div class={msg.role === 'user'
            ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-[#25d366] text-white rounded-br-md'
            : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200'}>
            {msg.text}
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="flex justify-start">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-white text-gray-900 border border-gray-200 shadow animate-pulse">AI is typing...</div>
        </div>
      {/if}
    </div>
    <!-- Input bar -->
    <form class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10" on:submit|preventDefault={sendChatMessage}>
      <input
        type="text"
        placeholder="Type your message about jobs, scheduling, or service..."
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white text-gray-900"
        bind:value={chatInput}
        autocomplete="off"
      />
      <button type="submit" class="bg-[#25d366] hover:bg-[#128c7e] text-white rounded-full p-2 transition-colors duration-150" aria-label="Send message">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </form>
  </div>
</div>

<style>
  /* WhatsApp-like chat bubble animation */
</style> 