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
  technicians: {
    labels: [
      'Mike (Plumbing)',
      'Sarah (HVAC)',
      'John (Electrical)',
      'Lisa (Landscaping)',
      'Tom (General)'
    ],
    data: [85, 92, 78, 88, 82],
    title: 'Technician Performance (Jobs/Month)',
    colLabel: 'Jobs Completed'
  }
};

const demoQueue: ChatMsg[] = [
  // Example 1: Data Insights
  { role: 'user', type: 'text', content: 'What are my top performing technicians?' },
  { role: 'ai', type: 'table', content: chartData.technicians },
  { role: 'ai', type: 'text', content: getInsightText('technicians') },
  // Example 2: Daily Task Automation
  { role: 'user', type: 'text', content: 'Process this work order: New job for AC Repair at 123 Main St., scheduled for 2025-08-01. Customer: John Doe.' },
  { role: 'ai', type: 'text', content: 'Work Order Processed!\n• Service: AC Repair\n• Address: 123 Main St.\n• Date: 2025-08-01\n• Customer: John Doe\nAction: Job scheduled and technician assigned in Service Company system.' }
];

let chatHistory: ChatMsg[] = [
  { role: 'ai', type: 'text', content: 'Hi! I can help with scheduling, service requests, technician management, or business insights. Ask me anything!' }
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
    if (/sales|revenue|technician|data|insight|leads|expenses|table|report|performance/.test(text)) {
      let type: keyof typeof chartData = 'technicians';
      if (/sales/.test(text)) type = 'sales';
      else if (/leads?/.test(text)) type = 'leads';
      else if (/expenses?/.test(text)) type = 'expenses';
      else if (/technician|performance/.test(text)) type = 'technicians';
      const data = chartData[type];
      chatHistory = [
        ...chatHistory,
        { role: 'ai', type: 'table', content: data },
        { role: 'ai', type: 'text', content: getInsightText(type) }
      ];
    }
    // Daily Task Automation
    else if (/work.?order|job|service|appointment|schedule|dispatch/.test(text)) {
      let output = '';
      if (text.includes('work order') || text.includes('job')) {
        const serviceMatch = prompt.match(/(?:for|service:?)\s+([A-Za-z\s]+?)(?=\s+at|\s+scheduled|\.|$)/i);
        const addressMatch = prompt.match(/at\s+([A-Za-z0-9\s]+?)(?=\s*,|\s+scheduled|\.|$)/i);
        const dateMatch = prompt.match(/\d{4}-\d{2}-\d{2}/);
        const customerMatch = prompt.match(/customer:?\s*([A-Za-z\s]+?)(?=\s*\.|$)/i);
        const service = serviceMatch ? serviceMatch[1].trim() : 'N/A';
        const address = addressMatch ? addressMatch[1].trim() : 'N/A';
        const date = dateMatch ? dateMatch[0] : 'N/A';
        const customer = customerMatch ? customerMatch[1].trim() : 'N/A';
        output = `Work Order Processed!\n• Service: ${service}\n• Address: ${address}\n• Date: ${date}\n• Customer: ${customer}\nAction: Job scheduled and technician assigned in Service Company system.`;
      } else if (text.includes('appointment') || text.includes('schedule')) {
        output = `Appointment Scheduled!\n• Service: ${prompt.split(' ').filter(word => word.length > 3).slice(0, 2).join(' ')}\n• Customer: ${prompt.split(' ').slice(-2).join(' ')}\nAction: Appointment confirmed and reminder sent.`;
      } else if (text.includes('dispatch')) {
        output = `Dispatch Processed!\n• Technician: ${prompt.split(' ').filter(word => word.length > 3).slice(0, 1).join(' ')}\n• Priority: ${text.includes('urgent') ? 'High' : 'Normal'}\nAction: Technician notified and ETA sent to customer.`;
      } else {
        output = `Service Request Processed!\nExtracted keywords: ${prompt.split(' ').filter(word => word.length > 3).slice(0, 5).join(', ')}...\nAction: Service request created and assigned to appropriate technician.`;
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
  } else if (type === 'technicians') {
    return 'Sarah (HVAC) and Lisa (Landscaping) are your top performers. Consider cross-training opportunities and reward high performers.';
  } else {
    return 'Sarah (HVAC) and Lisa (Landscaping) are your top performers. Focus on their best practices to improve team performance.';
  }
}

function getChatbotReply(input: string) {
  // Simulate a friendly, helpful AI for home services
  if (/hello|hi|hey|good morning|good afternoon|good evening/.test(input.toLowerCase())) {
    return 'Hello! I\'m your AI assistant for Reliable Home Services. How can I help you today?';
  }
  if (/hours|open|close|location/.test(input.toLowerCase())) {
    return 'We are open Mon-Sat, 7am-7pm, and offer 24/7 emergency services. Located at 123 Main St. Need directions?';
  }
  if (/price|cost|how much|quote/.test(input.toLowerCase())) {
    return 'Our service prices vary by job type and complexity. I can help you get a quote - what service do you need?';
  }
  if (/schedule|appointment|book/.test(input.toLowerCase())) {
    return 'I can help you schedule a service appointment. What type of service do you need and when would you prefer?';
  }
  if (/emergency|urgent|broken|leak/.test(input.toLowerCase())) {
    return 'For emergencies, I can dispatch a technician immediately. What\'s the issue and your address?';
  }
  return 'I am here to help with scheduling, quotes, emergency services, and general questions. What can I assist you with today?';
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
    ],
    [
      { role: 'user', type: 'text', content: 'Show me technician performance data' },
      { role: 'ai', type: 'table', content: chartData.technicians },
      { role: 'ai', type: 'text', content: getInsightText('technicians') }
    ]
  ];
  while (demoActive) {
    for (let session of demoSessions) {
      if (!demoActive) break;
      // Clear chat except welcome message before each session
      chatHistory = [
        { role: 'ai', type: 'text', content: 'Hi! I can help with scheduling, service requests, technician management, or business insights. Ask me anything!' }
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
  <div class="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground">
    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-xl">🛠️</span>
    <div class="flex flex-col">
      <span class="font-semibold text-base leading-tight">Reliable Home Services</span>
      <span class="text-xs opacity-80">online</span>
    </div>
  </div>
  <div class="relative bg-[#ece5dd] flex flex-col h-[520px] sm:h-[520px] md:h-[520px] lg:h-[520px] xl:h-[520px]" style="height:520px;">
    <div bind:this={chatWindow} class="flex-1 overflow-y-auto px-3 py-4 space-y-2" style="min-height:0;">
      {#each chatHistory as msg}
        {#if msg.type === 'text'}
          <div class={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div class={msg.role === 'user'
              ? 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-primary text-primary-foreground rounded-br-md'
              : 'rounded-2xl px-4 py-2 max-w-[75%] break-words shadow bg-white text-gray-900 rounded-bl-md border border-gray-200 whitespace-pre-line'}>
              {msg.content}
            </div>
          </div>
        {:else if msg.type === 'table'}
          <div class="flex justify-start">
            <div class="rounded-2xl px-0 py-0 max-w-[90%] shadow bg-white text-gray-900 border border-gray-200 overflow-x-auto">
              {#if typeof msg.content === 'object'}
                <div class="text-base font-semibold text-primary px-4 pt-3">{msg.content.title}</div>
                <table class="min-w-full text-base text-left rounded-xl overflow-hidden mb-2">
                  <thead class="bg-primary text-primary-foreground">
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
          <div class="rounded-2xl px-4 py-2 max-w-[75%] bg-primary text-primary-foreground rounded-br-md shadow animate-pulse">User is typing...</div>
        </div>
      {/if}
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
        placeholder="Ask about scheduling, quotes, or service requests..."
        class="flex-1 rounded-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
        bind:value={prompt}
        autocomplete="off"
        on:input={stopDemo}
        on:focus={stopDemo}
      />
      <button type="submit" class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 transition-colors duration-150" aria-label="Send message">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13"/><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
      </button>
    </form>
  </div>
</div> 