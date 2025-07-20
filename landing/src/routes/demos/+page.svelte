<script lang="ts">
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    MessageSquare,
    Calendar,
    BarChart3,
    Bot,
    Zap,
    Users,
    FileText,
    Play,
    Clock,
    Star,
    Sparkles,
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  const demos = [
    {
      id: "chatbot",
      title: "AI Chatbot Demo",
      description:
        "Intelligent customer support chatbot that handles inquiries 24/7",
      icon: MessageSquare,
      category: "Customer Service",
      duration: "5-10 min",
      difficulty: "Easy",
      benefits: [
        "Reduce support tickets",
        "24/7 availability",
        "Instant responses",
      ],
      color: "bg-blue-500",
      status: "available",
    },
    {
      id: "scheduling",
      title: "Smart Scheduling Demo",
      description:
        "Automated appointment booking and calendar management system",
      icon: Calendar,
      category: "Operations",
      duration: "8-12 min",
      difficulty: "Medium",
      benefits: ["No double bookings", "Automatic reminders", "Calendar sync"],
      color: "bg-green-500",
      status: "available",
    },
    {
      id: "analytics",
      title: "Data Insights Demo",
      description: "AI-powered analytics dashboard for business intelligence",
      icon: BarChart3,
      category: "Analytics",
      duration: "10-15 min",
      difficulty: "Medium",
      benefits: [
        "Real-time insights",
        "Predictive analytics",
        "Custom reports",
      ],
      color: "bg-purple-500",
      status: "available",
    },
    {
      id: "automation",
      title: "Workflow Automation",
      description: "Automate repetitive tasks and business processes",
      icon: Zap,
      category: "Automation",
      duration: "12-18 min",
      difficulty: "Hard",
      benefits: ["Save time", "Reduce errors", "Scale operations"],
      color: "bg-orange-500",
      status: "coming-soon",
    },
    {
      id: "training",
      title: "AI Training Assistant",
      description: "Personalized training and onboarding system",
      icon: Users,
      category: "HR",
      duration: "6-10 min",
      difficulty: "Easy",
      benefits: [
        "Faster onboarding",
        "Consistent training",
        "Progress tracking",
      ],
      color: "bg-indigo-500",
      status: "coming-soon",
    },
    {
      id: "documentation",
      title: "Smart Documentation",
      description: "AI-powered document generation and management",
      icon: FileText,
      category: "Documentation",
      duration: "8-12 min",
      difficulty: "Medium",
      benefits: ["Auto-generate docs", "Version control", "Easy search"],
      color: "bg-teal-500",
      status: "coming-soon",
    },
  ];

  function startDemo(demoId: string) {
    if (demoId === "chatbot" || demoId === "scheduling" || demoId === "analytics") {
      goto(`/demos/${demoId}`);
    } else {
      console.log(`Demo ${demoId} coming soon`);
    }
  }
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <!-- Header -->
  <div class="text-left mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="text-gray-900 font-medium">Demos</span>
        <span class="text-gray-400">/</span>
        <span class="text-gray-600">Available Demos</span>
      </div>
    </div>
    <p class="text-lg text-gray-600 max-w-2xl">
      Explore our AI automation solutions designed specifically for local
      businesses.
    </p>
  </div>

  <!-- Demos Grid -->
  <div class="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each demos as demo}
      <Card class="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div class="flex items-center justify-between mb-2">
            <div class={`p-3 rounded-lg ${demo.color} text-white`}>
              <svelte:component this={demo.icon} class="w-6 h-6" />
            </div>
            <Badge
              variant={demo.status === "available" ? "default" : "secondary"}
            >
              {demo.status === "available" ? "Available" : "Coming Soon"}
            </Badge>
          </div>
          <CardTitle class="text-lg font-semibold text-gray-900">
            {demo.title}
          </CardTitle>
          <CardDescription class="text-gray-600">
            {demo.description}
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-4">
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center gap-1">
              <Clock class="w-4 h-4" />
              {demo.duration}
            </div>
            <div class="flex items-center gap-1">
              <Star class="w-4 h-4" />
              {demo.difficulty}
            </div>
          </div>

          <div class="space-y-2">
            <h4 class="font-medium text-gray-900 text-sm">Key Benefits:</h4>
            <ul class="space-y-1">
              {#each demo.benefits as benefit}
                <li class="text-sm text-gray-600 flex items-center gap-2">
                  <div class="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  {benefit}
                </li>
              {/each}
            </ul>
          </div>

          <Button
            class="w-full"
            variant={demo.status === "available" ? "default" : "outline"}
            disabled={demo.status !== "available"}
            onclick={() => startDemo(demo.id)}
          >
            {#if demo.status === "available"}
              <Play class="w-4 h-4 mr-2" />
              Start Demo
            {:else}
              <Clock class="w-4 h-4 mr-2" />
              Coming Soon
            {/if}
          </Button>
        </CardContent>
      </Card>
    {/each}
  </div>

  <!-- Footer CTA -->
  <div class="text-center mt-8">
    <Card
      class="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
    >
      <CardContent class="py-8">
        <div class="flex items-center justify-center gap-3 mb-4">
          <Bot class="w-6 h-6 text-blue-600" />
          <h3 class="text-2xl font-bold text-gray-900">
            Ready to Transform Your Business?
          </h3>
        </div>
        <p class="text-gray-600 mb-6">
          These demos showcase just a fraction of what's possible. Let's discuss
          how AI automation can work for your specific needs.
        </p>
        <Button size="lg" class="bg-blue-600 hover:bg-blue-700">
          <Sparkles class="w-5 h-5 mr-2" />
          Schedule Consultation
        </Button>
      </CardContent>
    </Card>
  </div>
</div>
