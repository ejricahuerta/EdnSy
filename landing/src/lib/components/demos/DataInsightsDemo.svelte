<script lang="ts">
let prompt = '';
let insights = '';
let loading = false;

type DataType = 'initial' | 'jobs' | 'leads' | 'expenses';
type ChatMsg = { role: 'user' | 'ai'; type: 'text' | 'table'; content: string | { labels: string[]; data: number[]; title: string; colLabel: string } };

const chartData = {
  initial: {
    labels: [
      'Drain Cleaning',
      'AC Repair',
      'Water Heater Install',
      'Furnace Maintenance',
      'Leak Detection'
    ],
    data: [120, 95, 80, 60, 55],
    title: 'Top Requested Services (This Year)',
    colLabel: 'Jobs Completed'
  },
  jobs: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    data: [40, 55, 62, 70, 65, 80, 75, 90],
    title: 'Monthly Jobs Completed',
    colLabel: 'Jobs'
  },
  leads: {
    labels: ['Website', 'Referral', 'Social Media', 'Ads', 'Phone'],
    data: [60, 85, 50, 40, 30],
    title: 'Lead Sources',
    colLabel: 'Leads'
  },
  expenses: {
    labels: ['Payroll', 'Parts', 'Fuel', 'Marketing', 'Insurance', 'Misc'],
    data: [3200, 1500, 600, 800, 400, 250],
    title: 'Monthly Expenses ($)',
    colLabel: 'Amount ($)'
  }
};
let currentType: DataType = 'initial';
let chatHistory: ChatMsg[] = [
  { role: 'ai', type: 'text', content: 'Hi! Ask me about your service business data, e.g., "Show me top requested services".' }
];
let chatWindow: HTMLDivElement | null = null;

function scrollToBottom() {
  if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function sendPrompt() {
  if (!prompt.trim()) return;
  chatHistory = [...chatHistory, { role: 'user', type: 'text', content: prompt }];
  loading = true;
  let type: DataType = 'initial';
  if (/jobs|monthly/i.test(prompt)) type = 'jobs';
  else if (/leads?/i.test(prompt)) type = 'leads';
  else if (/expenses?/i.test(prompt)) type = 'expenses';
  currentType = type;
  const data = chartData[type];
  setTimeout(() => {
    chatHistory = [
      ...chatHistory,
      { role: 'ai', type: 'table', content: data },
      { role: 'ai', type: 'text', content: getInsightText(type) }
    ];
    loading = false;
    prompt = '';
    scrollToBottom();
  }, 1200);
}

function getInsightText(type: DataType) {
  if (type === 'jobs') {
    return 'Job volume is highest in August. Consider adding more technicians for peak season.';
  } else if (type === 'leads') {
    return 'Referrals and website are your strongest lead sources. Invest more in these channels for growth.';
  } else if (type === 'expenses') {
    return 'Payroll and parts are the largest expenses. Review staffing and supplier contracts to improve margins.';
  } else {
    return 'Drain Cleaning and AC Repair are your most requested services. Consider promoting these for seasonal campaigns.';
  }
}
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">🛠️</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">Data Insights Assistant</span>
      <span class="text-xs text-[#d9fdd3]">data insights</span>
    </div>
  </div>
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
                      <th class="px-4 py-3 font-semibold">{msg.content.colLabel === 'Amount ($)' ? 'Category' : msg.content.colLabel === 'Leads' ? 'Source' : msg.content.colLabel === 'Jobs' ? 'Month' : 'Service'}</th>
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
      {#if loading}
        <div class="flex justify-start">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-white text-gray-900 border border-gray-200 shadow animate-pulse">AI is typing...</div>
        </div>
      {/if}
    </div>
    <!-- Input bar -->
    <form class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10" on:submit|preventDefault={sendPrompt}>
      <input
        type="text"
        placeholder="e.g., Show me top requested services"
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white text-gray-900"
        bind:value={prompt}
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

<!-- Chart.js CDN for demo (user can switch to npm if desired) -->
<svelte:head>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</svelte:head> 