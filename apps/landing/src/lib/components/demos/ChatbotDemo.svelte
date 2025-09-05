<script lang="ts">
  import { onMount, tick } from 'svelte';
  let chatInput = '';
  type ChatMsg = { role: 'user' | 'ai'; text: string };
  let chatHistory: ChatMsg[] = [
    { role: 'ai', text: 'Hi! I can help with your Plumbing/HVAC service business. Ask about jobs, scheduling, or customer questions.' }
  ];
  let loading = false;
  let chatWindow: HTMLDivElement | null = null;
  let isListening = false;
  let isSpeaking = false;
  let recognition: any = null;
  let synthesis: any = null;

  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  function startVoiceRecognition() {
    if (!recognition) return;
    
    isListening = true;
    recognition.start();
  }

  function stopVoiceRecognition() {
    if (!recognition) return;
    
    isListening = false;
    recognition.stop();
  }

  function speakText(text: string) {
    if (!synthesis) return;
    
    isSpeaking = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      isSpeaking = false;
    };
    synthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (!synthesis) return;
    
    synthesis.cancel();
    isSpeaking = false;
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
      
      // Auto-speak the response
      speakText(reply);
    }, 1200);
  }

  function rowClass(role: 'user' | 'ai') {
    return 'flex ' + (role === 'user' ? 'justify-end' : 'justify-start');
  }
  function bubbleClass(role: 'user' | 'ai') {
    return (
      'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow ' +
      (role === 'user'
        ? 'bg-primary text-primary-foreground rounded-br-md'
        : 'bg-white text-gray-900 rounded-bl-md border border-gray-200')
    );
  }

  onMount(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        chatInput = transcript;
        isListening = false;
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        isListening = false;
      };

      recognition.onend = () => {
        isListening = false;
      };
    }

    if ('speechSynthesis' in window) {
      synthesis = window.speechSynthesis;
    }
  });
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-xl">🤖</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">AI Assistant</span>
      <span class="text-xs opacity-80">voice enabled</span>
    </div>
  </div>
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        <div class={rowClass(msg.role)}>
          <div class={msg.role === 'user'
            ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-primary text-primary-foreground rounded-br-md'
            : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200'}>
            {msg.text}
          </div>
        </div>
      {/each}
      {#if loading}
        <div class="flex justify-start">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-white text-gray-900 border border-gray-200 shadow animate-pulse">AI is processing...</div>
        </div>
      {/if}
    </div>
    <!-- Input bar with voice controls -->
    <form class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10" onsubmit={(e) => { e.preventDefault(); sendChatMessage(); }}>
      <input
        type="text"
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
        placeholder="Type your message or use voice..."
        bind:value={chatInput}
        autocomplete="off"
      />
      <!-- Voice Input Button -->
      <button 
        type="button" 
        class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-150 {isListening ? 'animate-pulse' : ''}" 
        onclick={isListening ? stopVoiceRecognition : startVoiceRecognition}
        aria-label="Voice input"
        disabled={!recognition}
      >
        {#if isListening}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        {:else}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
          </svg>
        {/if}
      </button>
      <!-- Send Button -->
      <button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-150" aria-label="Send message">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/>
          <path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/>
        </svg>
      </button>
    </form>
  </div>
  
  <!-- Voice Status Indicator -->
  {#if isListening || isSpeaking}
    <div class="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg">
      {#if isListening}
        <div class="flex items-center gap-2 text-red-500">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-medium">Listening...</span>
        </div>
      {:else if isSpeaking}
        <div class="flex items-center gap-2 text-primary">
          <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span class="text-xs font-medium">Speaking...</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style> 