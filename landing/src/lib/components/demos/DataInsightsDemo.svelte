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
  sales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    data: [2800, 3200, 4100, 3800, 5200, 4800, 6100, 6800, 5900, 7200, 8900, 12500],
    title: 'Monthly Sales 2024 ($)',
    colLabel: 'Sales ($)'
  },
  expenses: {
    labels: ['Rent', 'Utilities', 'Inventory', 'Marketing', 'Staff Wages', 'Insurance', 'Misc'],
    data: [2400, 450, 1800, 600, 3200, 280, 350],
    title: 'Monthly Operating Expenses ($)',
    colLabel: 'Amount ($)'
  },
  products: {
    labels: [
      'Winter Coats',
      'Scarves & Gloves',
      'Boots',
      'Hats',
      'Thermal Underwear'
    ],
    data: [45, 78, 32, 56, 23],
    title: 'Top Winter Products Sold',
    colLabel: 'Units Sold'
  }
};

const demoMessages: ChatMsg[] = [
  { role: 'user', type: 'text', content: 'How did we do this month compared to last year?' },
  { role: 'ai', type: 'table', content: chartData.sales },
  { role: 'ai', type: 'text', content: 'Great news! December sales are up 40% from last year at $12,500. Your holiday marketing campaign is working well. Consider extending your Boxing Week sale to capitalize on this momentum.' },
  { role: 'user', type: 'text', content: 'Where is most of our money going?' },
  { role: 'ai', type: 'table', content: chartData.expenses },
  { role: 'ai', type: 'text', content: 'Staff wages ($3,200) and rent ($2,400) are your biggest expenses. Consider cross-training staff to handle multiple roles during peak periods. Your marketing spend ($600) is generating good returns.' }
];

let chatHistory: ChatMsg[] = $state([
  { role: 'ai', type: 'text', content: 'Hi! I\'m your business health checker. I can analyze your data and provide insights.' }
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
        { role: 'ai', type: 'text', content: 'Hi! I\'m your business health checker. I can analyze your data and provide insights.' }
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
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">📊</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">Business Health Checker</span>
      <span class="text-xs text-[#d9fdd3]">assistant</span>
    </div>
  </div>
  
  {#if showSignupPrompt}
    <SignupPrompt on:close={closeSignupPrompt} />
  {/if}
  
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        {#if msg.type === 'text'}
          <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div class={msg.role === 'user'
              ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-[#25d366] text-white rounded-br-md'
              : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200'}>
              {msg.content}
            </div>
          </div>
        {:else if msg.type === 'table'}
          <div class="flex justify-start">
            <div class="rounded-2xl px-0 py-0 max-w-[90%] shadow bg-white text-gray-900 border border-gray-200 overflow-x-auto">
              {#if typeof msg.content === 'object'}
                <div class="text-base font-semibold text-[#075e54] px-4 pt-3">{msg.content.title}</div>
                <table class="min-w-full text-base text-left rounded-xl overflow-hidden mb-2">
                  <thead class="bg-[#25d366] text-white">
                    <tr>
                      <th class="px-4 py-3 font-semibold">{msg.content.colLabel === 'Amount ($)' ? 'Category' : msg.content.colLabel === 'Sales ($)' ? 'Month' : 'Product'}</th>
                      <th class="px-4 py-3 font-semibold">{msg.content.colLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each msg.content.labels as label, i}
                      <tr class="odd:bg-white even:bg-[#f7f7f7]">
                        <td class="px-4 py-3 font-medium text-gray-900">{label}</td>
                        <td class="px-4 py-3 text-gray-700">{msg.content.data[i]}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>
          </div>
        {/if}
      {/each}
    </div>
    
    <!-- Input bar -->
    <div class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10">
      <input
        type="text"
        placeholder="Ask about your business data..."
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

<style>
  @keyframes pop-in {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
</style>

<!-- Chart.js CDN for demo (user can switch to npm if desired) -->
<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head> 