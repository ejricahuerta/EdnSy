<script lang="ts">
  import { onMount } from 'svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <div class="container mx-auto px-4 py-8 h-full">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Book a Consultation</h1>
        <p class="text-lg text-gray-600">Schedule a free consultation to discuss your AI automation needs</p>
      </div>
      
      <!-- Cal inline embed code begins -->
      <div style="width:100%;height:100%;overflow:scroll" id="my-cal-inline-enable-ai"></div>
      <script type="text/javascript">
        (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
        Cal("init", "enable-ai", {origin:"https://app.cal.com"});

        Cal.ns["enable-ai"]("inline", {
          elementOrSelector:"#my-cal-inline-enable-ai",
          config: {"layout":"month_view"},
          calLink: "edmel-ednsy/enable-ai",
        });

        Cal.ns["enable-ai"]("ui", {"cssVarsPerTheme":{"light":{"cal-brand":"#2b7fff"}},"hideEventTypeDetails":true,"layout":"month_view"});
      </script>
      <!-- Cal inline embed code ends -->
    </div>
  </div>
</div> 