<script>
  import * as Avatar from "$lib/components/ui/avatar";
  import { AvatarImage, AvatarFallback } from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";

  export let name = "Team Member";
  export let role = "Role";
  export let image = "/team/member.jpg";
  export let fallback = "TM";
  export let description = "Description";
  export let skills = ["Skill 1", "Skill 2", "Skill 3"];
</script>

<div class="group">
  <div class="relative">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500"></div>
    
    <div class="relative bg-white border border-slate-200/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      <div class="flex items-center gap-6 mb-6">
        <Avatar.Root class="w-20 h-20 ring-4 ring-blue-100">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback class="bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-2xl font-bold">
            {fallback}
          </AvatarFallback>
        </Avatar.Root>
        <div>
          <h3 class="font-display text-2xl font-bold text-slate-900 mb-2">
            {name}
          </h3>
          <p class="text-slate-600 font-medium mb-3">{role}</p>
        </div>
      </div>
      
      <p class="text-slate-700 leading-relaxed mb-6">
        {description}
      </p>
      
      <div class="flex flex-wrap gap-2">
        {#each skills as skill}
          <Badge variant="secondary" class="bg-blue-50 text-blue-700 hover:bg-blue-100">
            {skill}
          </Badge>
        {/each}
      </div>
    </div>
  </div>
</div>
