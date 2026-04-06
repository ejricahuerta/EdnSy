<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { homeLeadQuiz, site } from "$lib/content/site";

  const form = $derived(page.form);

  type StepId = (typeof homeLeadQuiz.steps)[number]["id"];

  let phase = $state(0);
  let answers = $state<Partial<Record<StepId, string>>>({});
  let labels = $state<Partial<Record<StepId, string>>>({});
  let name = $state("");
  let email = $state("");

  const totalPhases = homeLeadQuiz.steps.length + 1;

  const problemSummary = $derived.by(() => {
    const segments: string[] = [];
    for (const step of homeLeadQuiz.steps) {
      const v = answers[step.id];
      const l = labels[step.id];
      if (!v || !l) return "";
      segments.push(`${step.shortLabel}: ${l} (${v})`);
    }
    return `Home hero quiz — ${segments.join(" · ")}`;
  });

  function pickOption(stepId: StepId, value: string, label: string) {
    answers = { ...answers, [stepId]: value };
    labels = { ...labels, [stepId]: label };
    phase += 1;
  }

  function goBack() {
    if (phase > 0) phase -= 1;
  }

  function restart() {
    phase = 0;
    answers = {};
    labels = {};
    name = "";
    email = "";
  }
</script>

<div id="lead-capture" class="flex min-h-[240px] flex-col bg-white sm:min-h-[260px] lg:min-h-[280px]">
  <div class="flex flex-1 flex-col px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
    {#if form?.leadLeakSuccess}
      <div class="flex flex-1 flex-col justify-center text-center" role="status">
        <p class="text-lg font-semibold text-zinc-900">{homeLeadQuiz.successTitle}</p>
        <p class="mt-2 text-sm leading-relaxed text-zinc-600">
          {homeLeadQuiz.successBody}
          <a href="mailto:{site.email}" class="font-semibold text-primary underline">{site.email}</a>.
        </p>
        <Button
          type="button"
          variant="outline"
          size="lg"
          class="mt-6 h-11 w-full border-zinc-300 text-sm font-semibold"
          onclick={restart}
        >
          {homeLeadQuiz.restart}
        </Button>
      </div>
    {:else if phase < homeLeadQuiz.steps.length}
      {@const step = homeLeadQuiz.steps[phase]}
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
        Step {phase + 1} of {totalPhases}
      </p>
      <h3 class="mt-3 text-base font-semibold leading-snug text-zinc-900 sm:text-lg">
        {step.question}
      </h3>
      <div class="mt-4 flex flex-1 flex-col gap-2.5">
        {#each step.options as opt (opt.value)}
          <button
            type="button"
            class="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-left text-sm font-semibold leading-snug text-zinc-900 shadow-sm transition-all hover:border-primary/35 hover:bg-primary/[0.06] hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            onclick={() => pickOption(step.id, opt.value, opt.label)}
          >
            {opt.label}
          </button>
        {/each}
      </div>
      {#if phase > 0}
        <button
          type="button"
          class="mt-3 w-full rounded-lg border border-transparent py-2.5 text-center text-sm font-semibold text-zinc-600 transition-colors hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          onclick={goBack}
        >
          ← {homeLeadQuiz.back}
        </button>
      {/if}
    {:else}
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Last step</p>
      <h3 class="mt-3 text-base font-semibold leading-snug text-zinc-900 sm:text-lg">
        {homeLeadQuiz.contactTitle}
      </h3>
      <p class="mt-1 text-sm text-zinc-600">{homeLeadQuiz.contactSub}</p>

      <form
        method="POST"
        action="?/leadLeak"
        class="mt-4 flex flex-1 flex-col gap-3"
        use:enhance={(submitInput) => {
          submitInput.formData.set("problem", problemSummary);
          return async ({ result, update }) => {
            await applyAction(result);
            await update({ reset: false });
          };
        }}
      >
        <input type="hidden" name="problem" value={problemSummary} />

        <div class="space-y-1.5">
          <label for="quiz-name" class="text-xs font-medium text-zinc-700">{homeLeadQuiz.nameLabel}</label>
          <input
            id="quiz-name"
            name="name"
            type="text"
            required
            autocomplete="name"
            bind:value={name}
            class="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          />
        </div>
        <div class="space-y-1.5">
          <label for="quiz-email" class="text-xs font-medium text-zinc-700">{homeLeadQuiz.emailLabel}</label>
          <input
            id="quiz-email"
            name="email"
            type="email"
            required
            autocomplete="email"
            bind:value={email}
            class="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          />
        </div>

        {#if form?.leadLeakError === "missing_fields"}
          <p class="text-xs text-destructive">Please fill in every field.</p>
        {:else if form?.leadLeakError === "invalid_email"}
          <p class="text-xs text-destructive">Enter a valid email address.</p>
        {:else if form?.leadLeakError === "not_configured"}
          <p class="text-xs text-destructive">
            Not connected yet — email
            <a href="mailto:{site.email}" class="underline">{site.email}</a>.
          </p>
        {:else if form?.leadLeakError === "webhook_failed" || form?.leadLeakError === "resend_failed"}
          <p class="text-xs text-destructive">
            Something went wrong. Try again or email
            <a href="mailto:{site.email}" class="underline">{site.email}</a>.
          </p>
        {/if}

        <div class="mt-auto flex w-full flex-col gap-2 pt-3">
          <Button
            type="submit"
            size="lg"
            class="h-11 w-full text-sm font-semibold shadow-md shadow-primary/15 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {homeLeadQuiz.submit}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            class="h-11 w-full border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
            onclick={goBack}
          >
            {homeLeadQuiz.back}
          </Button>
        </div>
      </form>
    {/if}
  </div>
</div>
