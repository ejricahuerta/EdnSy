<script lang="ts">
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Select, SelectTrigger, SelectContent, SelectItem } from '$lib/components/ui/select';
  import { Textarea } from '$lib/components/ui/textarea';
  import { closeConsultationPopup } from '$lib/stores/consultation';
  
  let { isOpen = $bindable(false) } = $props();
  
  let consultationType = $state('ai-strategy');
  let companySize = $state('11-50');
  let industry = $state('services');
  let message = $state('');
  
  const consultationTypes = [
    { value: 'ai-strategy', label: 'AI Strategy Session (30 min)' },
    { value: 'demo-walkthrough', label: 'Demo Walkthrough (45 min)' },
    { value: 'implementation-planning', label: 'Implementation Planning (60 min)' }
  ];
  
  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '200+', label: '200+ employees' }
  ];
  
  const industries = [
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'services', label: 'Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance & Banking' },
    { value: 'technology', label: 'Technology' },
    { value: 'other', label: 'Other' }
  ];
  
  function handleSubmit() {
    if (!consultationType || !companySize || !industry) {
      alert('Please fill in all required fields');
      return;
    }
    
    // TODO: Integrate with actual booking system
    window.open(`https://calendly.com/ednsy/${consultationType}`, '_blank');
    closeConsultationPopup();
  }
  
  function handleClose() {
    closeConsultationPopup();
  }
</script>

<Dialog bind:open={isOpen} onOpenChange={handleClose}>
  <DialogContent class="max-w-md">
    <DialogHeader>
      <DialogTitle>What's Your Biggest Pain Point?</DialogTitle>
      <DialogDescription>
        We want to be your long-term AI partner, not just another vendor.
      </DialogDescription>
    </DialogHeader>
    
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="consultation-type">What would you like help with? *</Label>
        <Select bind:value={consultationType as any}>
          <SelectTrigger>
            <span class="block truncate">
              {#if consultationType}
                {consultationTypes.find(t => t.value === consultationType)?.label || 'What would you like help with?'}
              {:else}
                What would you like help with?
              {/if}
            </span>
          </SelectTrigger>
          <SelectContent>
            {#each consultationTypes as type}
              <SelectItem value={type.value}>{type.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label for="company-size">How many people work with you? *</Label>
        <Select bind:value={companySize as any}>
          <SelectTrigger>
            <span class="block truncate">
              {#if companySize}
                {companySizes.find(s => s.value === companySize)?.label || 'How many people work with you?'}
              {:else}
                How many people work with you?
              {/if}
            </span>
          </SelectTrigger>
          <SelectContent>
            {#each companySizes as size}
              <SelectItem value={size.value}>{size.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label for="industry">What type of business do you run? *</Label>
        <Select bind:value={industry as any}>
          <SelectTrigger>
            <span class="block truncate">
              {#if industry}
                {industries.find(i => i.value === industry)?.label || 'What type of business do you run?'}
              {:else}
                What type of business do you run?
              {/if}
            </span>
          </SelectTrigger>
          <SelectContent>
            {#each industries as ind}
              <SelectItem value={ind.value}>{ind.label}</SelectItem>
            {/each}
          </SelectContent>
        </Select>
      </div>
      
      <div class="space-y-2">
        <Label for="message">Additional information (optional)</Label>
        <Textarea
          id="message"
          placeholder="Tell us about your specific needs or questions..."
          bind:value={message}
          rows={3}
        />
      </div>
      
      <Button class="w-full" onclick={handleSubmit}>
        Book for a Free Coffee
      </Button>
      
      <p class="text-xs text-gray-500 text-center">
        Free, no-obligation phone call. We'll help you find ways to save time and work more efficiently as your AI partner.
      </p>
    </div>
  </DialogContent>
</Dialog> 