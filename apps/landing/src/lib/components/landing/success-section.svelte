<script>
  import { Button } from "$lib/components/ui/button";
  import { Paperclip, MessageCircle, ArrowRight, Wrench, Calendar, Users, Zap } from "lucide-svelte";

  export let title = "Real Business Owners, Real Results";
  export let subtitle = "See How We Help Different Businesses";
  export let description = "Meet some of the business owners we've helped get their time back. Different industries, same problem: too much manual work, not enough hours in the day.";
  
  const heroStories = [
    {
      name: "Sarah",
      role: "Restaurant Owner",
      problem: "Spent 15 hours/week on reservations and customer calls",
      solution: "Voice AI now handles bookings and questions 24/7",
      icon: Calendar,
      color: "blue"
    },
    {
      name: "Marcus", 
      role: "E-commerce Store Owner",
      problem: "Drowning in order updates and customer support",
      solution: "Automated workflows handle 80% of routine tasks",
      icon: Zap,
      color: "emerald"
    },
    {
      name: "Dr. Lisa",
      role: "Dental Practice Owner",
      problem: "Lost appointments due to manual scheduling chaos",
      solution: "AI handles appointment booking and patient reminders",
      icon: Users,
      color: "purple"
    }
  ];
</script>

<section class="py-24 bg-gradient-to-br from-slate-50 to-white">
  <div class="max-w-7xl mx-auto px-8 sm:px-16">
    <!-- Header -->
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
        <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
        Success Stories
      </div>
      
      <h2 class="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
        {title}
      </h2>
      
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    </div>
    
    <!-- Hero Stories Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
      {#each heroStories as story, index}
        <div class="group">
          <div class="bg-white rounded-3xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <!-- Icon -->
            <div class="w-16 h-16 bg-gradient-to-br from-{story.color}-500 to-{story.color === 'blue' ? 'emerald' : story.color === 'emerald' ? 'blue' : 'emerald'}-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <svelte:component this={story.icon} class="w-8 h-8 text-white" />
            </div>
            
            <!-- Content -->
            <h3 class="font-display text-2xl font-bold text-slate-900 mb-2">
              {story.name}
            </h3>
            <p class="text-slate-600 font-medium mb-4">
              {story.role}
            </p>
            
            <!-- Problem -->
            <div class="mb-4">
              <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">The Problem</h4>
              <p class="text-slate-700 leading-relaxed">
                {story.problem}
              </p>
            </div>
            
            <!-- Solution -->
            <div class="mb-6">
              <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Our AI Solution</h4>
              <p class="text-slate-700 leading-relaxed">
                {story.solution}
              </p>
            </div>
            
            <!-- CTA -->
            <Button 
              variant="outline" 
              size="sm" 
              class="w-full border-slate-200 text-slate-700 hover:bg-slate-50 group-hover:border-{story.color}-300 group-hover:text-{story.color}-700 transition-all duration-300"
            >
              See {story.name}'s Demo
              <ArrowRight class="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Why It Works Section -->
    <div class="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center text-white">
      <div class="max-w-4xl mx-auto">
        <h3 class="font-display text-3xl font-bold mb-6">
          Why Our Solutions Actually Work
        </h3>
        
        <p class="text-xl text-slate-300 mb-8 leading-relaxed">
          We don't just build fancy tech. We solve real problems for real businesses. Every solution is designed to save you time from day one.
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div class="text-center">
            <div class="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar class="w-6 h-6 text-blue-400" />
            </div>
            <h4 class="font-semibold text-white mb-2">No Learning Curve</h4>
            <p class="text-slate-400 text-sm">Works with tools you already use</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle class="w-6 h-6 text-emerald-400" />
            </div>
            <h4 class="font-semibold text-white mb-2">Quick Setup</h4>
            <p class="text-slate-400 text-sm">Running in days, not months</p>
          </div>
          
          <div class="text-center">
            <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users class="w-6 h-6 text-purple-400" />
            </div>
            <h4 class="font-semibold text-white mb-2">Real Support</h4>
            <p class="text-slate-400 text-sm">Toronto team, not a chatbot</p>
          </div>
        </div>
        
        <Button 
          size="lg" 
          class="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <Calendar class="w-5 h-5 mr-2" />
          Book Your Free Consultation
          <ArrowRight class="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  </div>
</section>
