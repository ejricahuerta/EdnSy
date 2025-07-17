<script lang="ts">
// Unified chat for all solutions
import { onMount } from 'svelte';
let prompt = '';
let loading = false;
let userTyping = false;
let demoActive = true;
let chatWindow: HTMLDivElement | null = null;

type ChatMsg = { role: 'user' | 'ai'; type: 'text' | 'table'; content: string | { labels: string[]; data: number[]; title: string; colLabel: string } };

const chartData = {
  services: {
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
  sales: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    data: [30, 45, 62, 70, 55, 80, 75, 90],
    title: 'Monthly Sales Data ($K)',
    colLabel: 'Sales ($K)'
  },
  leads: {
    labels: ['Website', 'Referral', 'Social Media', 'Ads', 'Events', 'Partnerships'],
    data: [50, 75, 40, 60, 35, 48],
    title: 'Lead Generation by Source',
    colLabel: 'Leads'
  },
  expenses: {
    labels: ['Rent', 'Salaries', 'Utilities', 'Marketing', 'Supplies', 'Misc'],
    data: [1200, 3500, 400, 800, 600, 250],
    title: 'Monthly Expenses ($)',
    colLabel: 'Amount ($)'
  },
  products: {
    labels: [
      'Handmade Scarf',
      'Leather Wallet',
      'Scented Candle',
      'Artisan Mug',
      'Silk Headband'
    ],
    data: [65, 59, 80, 81, 72],
    title: 'Sample Data: Units Sold',
    colLabel: 'Units Sold'
  }
};

const demoQueue: ChatMsg[] = [
  // Example 1: Data Insights
  { role: 'user', type: 'text', content: 'What are my top selling products?' },
  { role: 'ai', type: 'table', content: chartData.products },
  { role: 'ai', type: 'text', content: getInsightText('products') },
  // Example 2: Daily Task Automation
  { role: 'user', type: 'text', content: 'Process this invoice: New invoice from Silk Road for $120, due 2025-08-01. Item: 20 Silk Headbands.' },
  { role: 'ai', type: 'text', content: 'Invoice Processed!\n• Supplier: Silk Road\n• Amount: $120\n• Due Date: 2025-08-01\n• Item: 20 Silk Headbands\nAction: Payment scheduled and inventory updated in Local Boutique system.' }
];

let chatHistory: ChatMsg[] = [
  { role: 'ai', type: 'text', content: 'Hi! I can help with customer chat, data insights, or daily task automation. Ask me anything!' }
];

function scrollToBottom() {
  if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
}

function stopDemo() {
  demoActive = false;
  userTyping = false;
  loading = false;
}

function sendPrompt() {
  if (!prompt.trim()) return;
  stopDemo();
  chatHistory = [...chatHistory, { role: 'user', type: 'text', content: prompt }];
  loading = true;
  const text = prompt.toLowerCase();
  setTimeout(() => {
    // Data Insights
    if (/sales|revenue|product|data|insight|leads|expenses|table|report/.test(text)) {
      let type: keyof typeof chartData = 'products';
      if (/sales/.test(text)) type = 'sales';
      else if (/leads?/.test(text)) type = 'leads';
      else if (/expenses?/.test(text)) type = 'expenses';
      const data = chartData[type];
      chatHistory = [
        ...chatHistory,
        { role: 'ai', type: 'table', content: data },
        { role: 'ai', type: 'text', content: getInsightText(type) }
      ];
    }
    // Daily Task Automation
    else if (/invoice|feedback|restock|order|delivery|quality/.test(text)) {
      let output = '';
      if (text.includes('invoice')) {
        const amountMatch = prompt.match(/\$([\d,]+\.?\d*)/);
        const dateMatch = prompt.match(/\d{4}-\d{2}-\d{2}/);
        const supplierMatch = prompt.match(/from\s+([A-Za-z\s]+?)(?=\sfor|\sItem|\.|$)/i);
        const itemMatch = prompt.match(/item:?\s*([\w\s]+)\./i);
        const amount = amountMatch ? amountMatch[1] : 'N/A';
        const date = dateMatch ? dateMatch[0] : 'N/A';
        const supplier = supplierMatch ? supplierMatch[1].trim() : 'N/A';
        const item = itemMatch ? itemMatch[1].trim() : 'N/A';
        output = `Invoice Processed!\n• Supplier: ${supplier}\n• Amount: $${amount}\n• Due Date: ${date}\n• Item: ${item}\nAction: Payment scheduled and inventory updated in Local Boutique system.`;
      } else if (text.includes('feedback') || text.includes('delivery') || text.includes('quality')) {
        const sentiment = text.includes('late') && text.includes('great') ? 'Mixed' :
                          (text.includes('great') || text.includes('amazing') || text.includes('good') ? 'Positive' : 'Neutral');
        output = `Customer Feedback Processed!\n• Sentiment: ${sentiment}\n• Key words: ${prompt.split(' ').filter(word => word.length > 3).slice(0, 3).join(', ')}...\nAction: Feedback logged and, if needed, follow-up task created for the team.`;
      } else if (text.includes('restock') || text.includes('order')) {
        output = `Restock Request Processed!\n• Item: ${prompt.split(' ').slice(-3).join(' ')}\nAction: Restock order created and supplier notified.`;
      } else {
        output = `AI processed your input.\nExtracted keywords: ${prompt.split(' ').filter(word => word.length > 3).slice(0, 5).join(', ')}...\nAction: Task created based on your request.`;
      }
      chatHistory = [...chatHistory, { role: 'ai', type: 'text', content: output }];
    }
    // Chatbot (default)
    else {
      chatHistory = [...chatHistory, { role: 'ai', type: 'text', content: getChatbotReply(prompt) }];
    }
    loading = false;
    prompt = '';
    scrollToBottom();
  }, 1200);
}

function getInsightText(type: keyof typeof chartData) {
  if (type === 'services') {
    return 'Drain Cleaning and AC Repair are your most requested services. Consider promoting these for seasonal campaigns.';
  } else if (type === 'sales') {
    return 'Sales are trending upward, with the highest in August. Consider increasing inventory for peak months.';
  } else if (type === 'leads') {
    return 'Referrals and website are your strongest lead sources. Invest more in these channels for growth.';
  } else if (type === 'expenses') {
    return 'Salaries are the largest expense. Review staffing or optimize other costs to improve margins.';
  } else {
    return 'Scented Candles and Artisan Mugs are top performers. Focus marketing on these products to maximize sales.';
  }
}

function getChatbotReply(input: string) {
  // Simulate a friendly, helpful AI
  if (/hello|hi|hey|good morning|good afternoon|good evening/.test(input.toLowerCase())) {
    return 'Hello! How can I help you today?';
  }
  if (/hours|open|close|location/.test(input.toLowerCase())) {
    return 'We are open Mon-Sat, 10am-7pm, at 123 Main St. Let me know if you need directions!';
  }
  if (/price|cost|how much/.test(input.toLowerCase())) {
    return 'Our prices vary by product. Ask about a specific item for details!';
  }
  return 'I am here to help with anything related to your boutique. Try asking about sales, invoices, or daily tasks!';
}

onMount(async () => {
  // Define demo sessions: each is [user message, ...AI responses]
  const demoSessions = [
    [
      { role: 'user', type: 'text', content: 'What are my most requested services?' },
      { role: 'ai', type: 'table', content: chartData.services },
      { role: 'ai', type: 'text', content: getInsightText('services') }
    ],
    [
      { role: 'user', type: 'text', content: 'Process this work order: New job for AC Repair at 123 Main St., scheduled for 2025-08-01. Customer: John Doe.' },
      { role: 'ai', type: 'text', content: 'Work Order Processed!\n• Service: AC Repair\n• Address: 123 Main St.\n• Date: 2025-08-01\n• Customer: John Doe\nAction: Job scheduled and technician assigned in Service Company system.' }
    ]
  ];
  while (demoActive) {
    for (let session of demoSessions) {
      if (!demoActive) break;
      // Clear chat except welcome message before each session
      chatHistory = [
        { role: 'ai', type: 'text', content: 'Hi! I can help with customer chat, data insights, or daily task automation. Ask me anything!' }
      ];
      await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < session.length && demoActive; i++) {
        const msg = session[i];
        if (!demoActive) break;
        if (msg.role === 'user') {
          userTyping = true;
          await new Promise(r => setTimeout(r, 900));
          userTyping = false;
        } else if (msg.role === 'ai') {
          loading = true;
          await new Promise(r => setTimeout(r, msg.type === 'table' ? 1200 : 900));
          loading = false;
        }
        chatHistory = [...chatHistory, msg as ChatMsg];
        scrollToBottom();
        await new Promise(r => setTimeout(r, 300));
      }
      userTyping = false;
      loading = false;
      if (!demoActive) break;
      await new Promise(r => setTimeout(r, 4000)); // Pause before next session
    }
  }
});
</script>

<div class="w-full max-w-md mx-auto rounded-2xl shadow-lg overflow-hidden bg-white border border-gray-200" style="font-family: 'Segoe UI', 'Inter', sans-serif;">
  <!-- WhatsApp-style header -->
  <div class="flex items-center gap-3 px-4 py-3 bg-[#075e54] text-white">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25d366] text-xl">🛠️</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">Handyman Pro Assistant</span>
      <span class="text-xs text-[#d9fdd3]">online</span>
    </div>
  </div>
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        {#if msg.type === 'text'}
          <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div class={msg.role === 'user'
              ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-[#25d366] text-white rounded-br-md'
              : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200 whitespace-pre-line'}>
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
                      <th class="px-4 py-3 font-semibold">{msg.content.colLabel === 'Amount ($)' ? 'Category' : msg.content.colLabel === 'Leads' ? 'Source' : msg.content.colLabel === 'Sales ($K)' ? 'Month' : 'Product'}</th>
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
      {#if userTyping}
        <div class="flex justify-end">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-[#25d366] text-white rounded-br-md shadow animate-pulse">User is typing...</div>
        </div>
      {/if}
      {#if loading}
        <div class="flex justify-start">
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-white text-gray-900 border border-gray-200 shadow animate-pulse">AI is typing...</div>
        </div>
      {/if}
    </div>
    <!-- Input bar -->
    <div class="flex items-center gap-2 px-3 py-2 bg-[#f7f7f7] border-t border-gray-200 sticky bottom-0 left-0 right-0 z-10">
      <input
        type="text"
        placeholder="Ask about sales, invoices, or daily tasks..."
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#25d366] bg-white text-gray-900"
        bind:value={prompt}
        autocomplete="off"
        oninput={stopDemo}
        onfocus={stopDemo}
        onkeydown={(e) => e.key === 'Enter' && sendPrompt()}
      />
      <button 
        type="button" 
        aria-label="Send message" 
        class="bg-[#25d366] hover:bg-[#128c7e] text-white rounded-full p-2 transition-colors duration-150"
        onclick={sendPrompt}
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
  </div>
</div> 