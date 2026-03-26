<script lang="ts">
  /** Interactive right-column dashboard card (Midday-style): tabs + list that updates on tab change. */
  type TabId = "calls" | "leads" | "flow";

  let activeTab = $state<TabId>("calls");

  const tabs: { id: TabId; label: string }[] = [
    { id: "calls", label: "Calls" },
    { id: "leads", label: "Leads" },
    { id: "flow", label: "Flow" },
  ];

  const callsRows = [
    { time: "Just now", desc: "Incoming call", status: "Answered", dot: "bg-emerald-500" },
    { time: "2m ago", desc: "Missed → callback", status: "Scheduled", dot: "bg-primary" },
    { time: "5m ago", desc: "Incoming call", status: "Answered", dot: "bg-emerald-500" },
    { time: "12m ago", desc: "After-hours call", status: "Captured", dot: "bg-amber-500" },
  ];

  const leadsRows = [
    { source: "Website form", action: "Contact request", status: "New" },
    { source: "Cal.com", action: "Strategy call booked", status: "Confirmed" },
    { source: "Voice AI", action: "Lead qualified", status: "Follow-up" },
    { source: "Google", action: "Site visit", status: "Nurture" },
  ];

  const flowRows = [
    { step: 1, title: "Answer every call", done: true },
    { step: 2, title: "Capture every lead", done: true },
    { step: 3, title: "Keep follow-up moving", done: false },
  ];
</script>

<div
  class="rounded-2xl border border-white/10 bg-white/[0.06] shadow-xl backdrop-blur"
  role="region"
  aria-label="Live activity"
>
  <div class="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
    <span class="text-sm font-medium text-white/70">Live</span>
    <div class="flex gap-1 rounded-lg bg-white/5 p-1">
      {#each tabs as tab}
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors {activeTab === tab.id
            ? 'bg-primary text-white'
            : 'text-white/60 hover:text-white/80'}"
          onclick={() => (activeTab = tab.id)}
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  <div class="p-4 sm:p-5">
    {#if activeTab === "calls"}
      <div class="space-y-2">
        {#each callsRows as row}
          <div
            class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span class="h-2 w-2 shrink-0 rounded-full {row.dot}" aria-hidden="true"></span>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-white">{row.desc}</p>
                <p class="text-xs text-white/50">{row.time}</p>
              </div>
            </div>
            <span class="shrink-0 text-xs font-medium text-white/70">{row.status}</span>
          </div>
        {/each}
      </div>
    {:else if activeTab === "leads"}
      <div class="space-y-2">
        {#each leadsRows as row}
          <div
            class="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-white">{row.source}</p>
              <p class="text-xs text-white/50">{row.action}</p>
            </div>
            <span class="shrink-0 rounded-full border border-primary/40 bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">{row.status}</span>
          </div>
        {/each}
      </div>
    {:else}
      <div class="space-y-2">
        {#each flowRows as row}
          <div
            class="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <span
              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold {row.done
                ? 'bg-primary/30 text-white'
                : 'bg-white/10 text-white/70'}"
            >
              {row.done ? "✓" : row.step}
            </span>
            <p class="text-sm font-medium text-white">{row.title}</p>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
