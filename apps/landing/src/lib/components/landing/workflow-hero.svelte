<script lang="ts">
  /* Pure CSS workflow hero - no JS. Uses CSS custom properties for colors/timings. */
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<section class="workflow-hero" aria-label="AI automation workflow visualization">
  <div class="wf-container">
    <!-- LEFT: Chaos -->
    <div class="wf-column wf-column-chaos">
      <div class="wf-stack wf-stack-chaos">
        <div class="wf-icon-wrap wf-chaos" style="--wf-delay: 0">
          <span class="wf-icon" aria-hidden="true">
            <!-- phone -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
        </div>
        <div class="wf-icon-wrap wf-chaos" style="--wf-delay: 0.15s">
          <span class="wf-icon" aria-hidden="true">
            <!-- email -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </span>
        </div>
        <div class="wf-icon-wrap wf-chaos" style="--wf-delay: 0.3s">
          <span class="wf-icon" aria-hidden="true">
            <!-- calendar -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </span>
        </div>
        <div class="wf-icon-wrap wf-chaos" style="--wf-delay: 0.45s">
          <span class="wf-icon" aria-hidden="true">
            <!-- invoice / document -->
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </span>
        </div>
      </div>
    </div>

    <!-- Connecting lines: SVG dashes + CSS offset-path traveling dots -->
    <div class="wf-lines" aria-hidden="true">
      <div class="wf-lines-inner">
        <svg class="wf-lines-svg" viewBox="0 0 400 200">
          <path class="wf-line-stroke" style="--wf-line-delay: 0s" d="M 80 50 Q 200 50 200 100 Q 200 150 320 50" />
          <path class="wf-line-stroke" style="--wf-line-delay: 0.4s" d="M 80 80 Q 200 80 200 100 Q 200 120 320 80" />
          <path class="wf-line-stroke" style="--wf-line-delay: 0.8s" d="M 80 110 Q 200 110 200 100 Q 200 90 320 110" />
          <path class="wf-line-stroke" style="--wf-line-delay: 1.2s" d="M 80 140 Q 200 140 200 100 Q 200 60 320 140" />
        </svg>
        <div class="wf-dot wf-dot-1" style="--wf-dot-delay: 0s"></div>
        <div class="wf-dot wf-dot-2" style="--wf-dot-delay: 0.4s"></div>
        <div class="wf-dot wf-dot-3" style="--wf-dot-delay: 0.8s"></div>
        <div class="wf-dot wf-dot-4" style="--wf-dot-delay: 1.2s"></div>
      </div>
    </div>

    <!-- CENTER: AI Hub -->
    <div class="wf-column wf-column-hub">
      <div class="wf-hub">
        <div class="wf-hub-ripple" style="--ripple-n: 0"></div>
        <div class="wf-hub-ripple" style="--ripple-n: 1"></div>
        <div class="wf-hub-ripple" style="--ripple-n: 2"></div>
        <div class="wf-hub-ring"></div>
        <div class="wf-hub-core"></div>
      </div>
    </div>

    <!-- RIGHT: Resolved -->
    <div class="wf-column wf-column-resolved">
      <div class="wf-stack wf-stack-resolved">
        <div class="wf-icon-wrap wf-resolved" style="--wf-delay: 0">
          <span class="wf-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>
          <span class="wf-check"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>
        <div class="wf-icon-wrap wf-resolved" style="--wf-delay: 0.15s">
          <span class="wf-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
          <span class="wf-check"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>
        <div class="wf-icon-wrap wf-resolved" style="--wf-delay: 0.3s">
          <span class="wf-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
          <span class="wf-check"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>
        <div class="wf-icon-wrap wf-resolved" style="--wf-delay: 0.45s">
          <span class="wf-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
          <span class="wf-check"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg></span>
        </div>
      </div>
      <div class="wf-stat">
        <span class="wf-stat-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </span>
        <span class="wf-stat-value">+15 hrs/week</span>
      </div>
    </div>
  </div>
</section>

<style>
  /* ========== CSS custom properties ========== */
  .workflow-hero {
    --wf-bg: #0a0f1e;
    --wf-amber: #f5a623;
    --wf-cyan: #00d4ff;
    --wf-green: #22c55e;
    --wf-chaos-glow: #f97316;
    --wf-chaos-glow-soft: rgba(249, 115, 22, 0.4);
    --wf-resolved-glow: rgba(34, 197, 94, 0.5);
    --wf-duration-slow: 4s;
    --wf-duration-medium: 2.5s;
    --wf-duration-fast: 1.5s;
    --wf-ease: cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ========== Section ========== */
  .workflow-hero {
    font-family: 'Outfit', system-ui, sans-serif;
    background: var(--wf-bg);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5rem 1rem 3rem;
    overflow: hidden;
  }

  .wf-container {
    position: relative;
    width: 100%;
    max-width: 1100px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0;
    align-items: center;
    justify-items: center;
  }

  @media (max-width: 768px) {
    .wf-container {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      gap: 2rem;
      max-width: 320px;
    }
  }

  /* ========== Columns ========== */
  .wf-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    z-index: 1;
  }

  .wf-column-chaos { justify-self: end; }
  .wf-column-hub { justify-self: center; }
  .wf-column-resolved { justify-self: start; }

  @media (max-width: 768px) {
    .wf-column-chaos { justify-self: center; }
    .wf-column-resolved { justify-self: center; }
  }

  /* ========== Icon stacks ========== */
  .wf-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .wf-icon-wrap {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
  }

  .wf-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0.95;
  }

  /* Chaos: pulse + shake + red/orange glow */
  .wf-stack-chaos .wf-icon-wrap {
    box-shadow: 0 0 20px var(--wf-chaos-glow-soft), 0 0 40px var(--wf-chaos-glow-soft);
    background: rgba(249, 115, 22, 0.15);
    border: 1px solid rgba(249, 115, 22, 0.4);
  }

  .wf-stack-chaos .wf-icon { color: #fbbf24; }

  /* Resolved: calm + check + green glow */
  .wf-stack-resolved .wf-icon-wrap {
    box-shadow: 0 0 16px var(--wf-resolved-glow);
    background: rgba(34, 197, 94, 0.12);
    border: 1px solid rgba(34, 197, 94, 0.35);
  }

  .wf-stack-resolved .wf-icon { color: #86efac; }

  .wf-check {
    position: absolute;
    bottom: -2px;
    right: -2px;
    color: var(--wf-green);
    filter: drop-shadow(0 0 4px var(--wf-green));
  }

  /* ========== Connecting lines ========== */
  .wf-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .wf-lines-svg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .wf-lines-inner {
    position: absolute;
    width: 400px;
    height: 200px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  @media (min-width: 769px) and (max-width: 900px) {
    .wf-lines-inner {
      transform: translate(-50%, -50%) scale(0.85);
    }
  }

  .wf-lines-svg {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .wf-line-stroke {
    fill: none;
    stroke: var(--wf-cyan);
    stroke-width: 1.5;
    stroke-dasharray: 8 6;
    stroke-linecap: round;
    opacity: 0.6;
  }

  .wf-dot {
    position: absolute;
    left: 0;
    top: 0;
    width: 8px;
    height: 8px;
    margin-left: -4px;
    margin-top: -4px;
    border-radius: 50%;
    background: var(--wf-cyan);
    box-shadow: 0 0 8px var(--wf-cyan);
    offset-distance: 40%;
    offset-rotate: 0deg;
  }

  .wf-dot-1 { offset-path: path("M 80 50 Q 200 50 200 100 Q 200 150 320 50"); }
  .wf-dot-2 { offset-path: path("M 80 80 Q 200 80 200 100 Q 200 120 320 80"); }
  .wf-dot-3 { offset-path: path("M 80 110 Q 200 110 200 100 Q 200 90 320 110"); }
  .wf-dot-4 { offset-path: path("M 80 140 Q 200 140 200 100 Q 200 60 320 140"); }

  @media (max-width: 768px) {
    .wf-lines { display: none; }
  }

  /* ========== Hub ========== */
  .wf-hub {
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wf-hub-ring {
    position: absolute;
    width: 88px;
    height: 88px;
    border-radius: 50%;
    border: 2px dashed var(--wf-amber);
    opacity: 0.8;
  }

  .wf-hub-core {
    position: absolute;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, rgba(245, 166, 35, 0.5), rgba(245, 166, 35, 0.2));
    box-shadow: 0 0 30px var(--wf-amber), 0 0 60px rgba(245, 166, 35, 0.4), inset 0 0 20px rgba(245, 166, 35, 0.3);
  }

  .wf-hub-ripple {
    display: none;
  }

  /* ========== Stat (right column) ========== */
  .wf-stat {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    box-shadow: 0 0 12px var(--wf-resolved-glow);
  }

  .wf-stat-icon {
    color: var(--wf-green);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wf-stat-value {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 600;
    font-size: 1rem;
    color: var(--wf-green);
    letter-spacing: 0.02em;
  }
</style>
