<script>
  import { Button } from "$lib/components/ui/button";
  import { Star, Wrench, Calendar, MessageSquare } from "lucide-svelte";
  import * as Avatar from "$lib/components/ui/avatar";
  import { AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";

  export let title = "What Our Client Says";
  export let subtitle = "Real results from a Toronto business we've helped.";
  export let testimonial = {
    name: "Maria Rodriguez",
    role: "Owner & Operator",
    company: "Rodriguez Plumbing & HVAC",
    image: "/testimonials/maria.jpg",
    fallback: "MR",
    quote: "EdnSy's AI automation saved us 15+ hours per week on scheduling and customer follow-ups. The n8n-powered workflows are so reliable, I can focus on growing my business instead of paperwork. Our customer satisfaction went up 40% because we respond instantly now!",
    rating: 5,
    metrics: [
      { value: "15+", label: "Hours Saved Weekly" },
      { value: "40%", label: "Customer Satisfaction Increase" },
      { value: "3x", label: "Faster Response Time" }
    ]
  };
</script>

<section class="relative py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-emerald-900 overflow-hidden">
  <!-- Background decorative elements -->
  <div class="absolute inset-0">
    <div class="absolute top-0 right-0 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl"></div>
  </div>
  
  <div class="relative z-10 max-w-6xl mx-auto px-8 sm:px-16">
    <div class="text-center mb-20">
      <!-- Home Services Badge -->
      <div class="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-blue-400/30">
        <Wrench class="w-4 h-4" />
        Home Services Success
      </div>
      
      <!-- Large quotation mark -->
      <div class="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-full mb-8 shadow-2xl">
        <span class="text-white text-5xl font-serif">"</span>
      </div>
      
      <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
        {title}
      </h2>
      
      <p class="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
        {subtitle}
      </p>
      
    </div>
    
    <!-- Testimonial Card -->
    <div class="max-w-5xl mx-auto mb-16">
      <div class="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-3xl p-16 text-center border border-slate-700/50 shadow-2xl">
        <!-- Rating -->
        <div class="flex justify-center gap-1 mb-8">
          {#each Array(testimonial.rating) as _, index}
            <Star class="w-6 h-6 text-yellow-400 fill-current" />
          {/each}
        </div>
        
        <div class="flex items-center justify-center mb-10">
          <Avatar.Root class="w-20 h-20 ring-4 ring-slate-600/50">
            <AvatarImage src={testimonial.image} alt={testimonial.name} />
            <AvatarFallback class="bg-gradient-to-br from-blue-600 to-emerald-600 text-white text-2xl font-semibold">
              {testimonial.fallback}
            </AvatarFallback>
          </Avatar.Root>
        </div>
        
        <blockquote class="text-2xl text-white/90 leading-relaxed mb-8 italic font-light">
          "{testimonial.quote}"
        </blockquote>
        
        <div class="text-center mb-8">
          <div class="font-semibold text-white text-xl mb-2">
            {testimonial.name}
          </div>
          <div class="text-slate-400 text-lg mb-1">
            {testimonial.role}
          </div>
          <div class="text-slate-500 text-sm">
            {testimonial.company}
          </div>
        </div>
        
        <!-- Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
          {#each testimonial.metrics as metric, index}
            <div class="text-center p-4 bg-white/5 rounded-2xl border border-white/10">
              <div class="font-display text-2xl font-bold text-white mb-1">
                {metric.value}
              </div>
              <div class="text-slate-400 text-sm">
                {metric.label}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- n8n Workflow Preview -->
    <div class="text-center">
      <h3 class="font-display text-3xl font-bold text-white mb-8">
        See the n8n Workflow Behind This Success
      </h3>
      
      <div class="max-w-4xl mx-auto">
        <div class="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-600/30">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar class="w-8 h-8 text-blue-400" />
              </div>
              <h4 class="font-semibold text-white mb-2">Customer Inquiry</h4>
              <p class="text-slate-400 text-sm">AI receives and processes requests</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare class="w-8 h-8 text-emerald-400" />
              </div>
              <h4 class="font-semibold text-white mb-2">Smart Scheduling</h4>
              <p class="text-slate-400 text-sm">AI finds best available times</p>
            </div>
            
            <div class="text-center">
              <div class="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Wrench class="w-8 h-8 text-purple-400" />
              </div>
              <h4 class="font-semibold text-white mb-2">Job Assignment</h4>
              <p class="text-slate-400 text-sm">AI assigns to best technician</p>
            </div>
          </div>
          
          <div class="text-center">
            <p class="text-slate-300 text-lg mb-6">
              This is just one example of our n8n-powered AI workflows. Every automation is built specifically for home services businesses.
            </p>
            
            <Button 
              size="lg" 
              class="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold"
            >
              Try This Workflow in Our Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
