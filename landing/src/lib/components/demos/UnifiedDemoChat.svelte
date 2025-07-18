<script lang="ts">
import { onMount, tick } from 'svelte';
import SignupPrompt from '../SignupPrompt.svelte';
import { user } from '$lib/stores/user';
import { get } from 'svelte/store';

let demoActive = true;
let chatWindow: HTMLDivElement | null = null;
let showSignupPrompt = $state(false);

type ChatMsg = { role: 'user' | 'ai'; type: 'text' | 'table'; content: string | { labels: string[]; data: number[]; title: string; colLabel: string } };

const chartData = {
  services: {
    labels: [
      'Heating System Repair',
      'Plumbing Emergencies',
      'Electrical Issues',
      'Air Conditioning',
      'Drain Cleaning'
    ],
    data: [85, 72, 68, 45, 38],
    title: 'Service Calls This Month',
    colLabel: 'Calls'
  },
  sales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [4200, 3800, 5200, 4800, 6100, 6800, 7200, 8900, 7600, 8200, 9500, 11200],
    title: 'Monthly Revenue 2024 ($)',
    colLabel: 'Revenue ($)'
  }
};

const demoMessages: ChatMsg[] = [
  { role: 'user', type: 'text', content: 'What are our busiest services this month?' },
  { role: 'ai', type: 'table', content: chartData.services },
  { role: 'ai', type: 'text', content: 'Heating system repairs (85 calls) and plumbing emergencies (72 calls) are your busiest services this month. Consider scheduling extra technicians for these services during peak winter months.' },
  { role: 'user', type: 'text', content: 'Schedule a service call: Heating system not working at 123 Queen St, apartment 4B. Customer: Mrs. Johnson, phone: 416-555-0123. Priority: High - no heat in winter.' },
  { role: 'ai', type: 'text', content: 'Service Call Scheduled!\n• Service: Heating System Repair\n• Address: 123 Queen St, Apt 4B\n• Customer: Mrs. Johnson\n• Phone: 416-555-0123\n• Priority: High (No heat in winter)\nAction: Technician Mike assigned for tomorrow 9am. Customer notified via SMS.' }
];

let chatHistory: ChatMsg[] = $state([
  { role: 'ai', type: 'text', content: 'Hi! I can help with customer chat, data insights, or daily task automation. Ask me anything!' }
]);

async function scrollToBottom() {
  await tick();
  if (chatWindow) {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

function stopDemo() {
  demoActive = false;
}

function openSignupPrompt() {
  if (!get(user)) {
    showSignupPrompt = true;
  }
}

function closeSignupPrompt() {
  showSignupPrompt = false;
}

onMount(() => {
  const runDemo = async () => {
    while (demoActive) {
      // Reset chat to welcome message
      chatHistory = [
        { role: 'ai', type: 'text', content: 'Hi! I can help with customer chat, data insights, or daily task automation. Ask me anything!' }
      ];
      
      await new Promise(r => setTimeout(r, 1000));
      await scrollToBottom();
      
      // Display each message one by one
      for (let i = 0; i < demoMessages.length && demoActive; i++) {
        await new Promise(r => setTimeout(r, 1500));
        if (!demoActive) break;
        
        chatHistory = [...chatHistory, demoMessages[i]];
        await scrollToBottom();
      }
      
      if (!demoActive) break;
      
      // Pause before restarting the loop
      await new Promise(r => setTimeout(r, 3000));
    }
  };
  
  runDemo();
});
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">🤖</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">Business Problem Solver</span>
      <span class="text-xs text-[#d9fdd3]">assistant</span>
    </div>
  </div>
  
  {#if showSignupPrompt}
    <SignupPrompt on:close={closeSignupPrompt} />
  {/if}
  
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
          <div class={msg.role === 'user'
            ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-[#25d366] text-white rounded-br-md'
            : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200'}>
            {msg.content}
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Input bar -->
    <div class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10">
      <input
        type="text"
        placeholder="Ask about your business problems..."
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white text-gray-900"
        on:input={stopDemo}
        on:focus={stopDemo}
        on:keydown={(e) => e.key === 'Enter' && openSignupPrompt()}
      />
      <button 
        type="button" 
        aria-label="Send message" 
        class="bg-[#25d366] hover:bg-[#128c7e] text-white rounded-full p-2 transition-colors duration-150"
        on:click={openSignupPrompt}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
  </div>
</div> 