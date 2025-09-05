<script lang="ts">
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Coins, AlertCircle, Calendar } from "lucide-svelte";
  import { goto } from "$app/navigation";

  let { open, currentCredits } = $props();

  function handleClose() {
    open = false;
  }

  function handleBookConsultation() {
    open = false; // Close the dialog first
    // Cal.com will handle opening the calendar automatically via the data attributes
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full bg-primary/10">
          <Coins class="h-5 w-5 text-primary" />
        </div>
        <div>
          <DialogTitle class="text-lg font-semibold">No Credits Available</DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            You need credits to use this demo feature.
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
    
    <div class="space-y-4">
      <div class="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
        <AlertCircle class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm text-muted-foreground flex items-center gap-2 w-full">
          Current balance: <span class="font-medium ml-auto">{currentCredits ?? 0} credits</span>
        </span>
      </div>
      
      <div class="text-sm text-muted-foreground">
        <p>To continue using our AI automation demos, you'll need to book a consultation with our team.</p>
      </div>
    </div>

    <DialogFooter class="flex gap-2">
      <Button variant="outline" onclick={handleClose}>
        Cancel
      </Button>
      <Button 
        data-cal-link="edmel-ednsy/enable-ai"
        data-cal-namespace="enable-ai"
        data-cal-config={JSON.stringify({layout: "month_view"})}
        class="flex items-center gap-2"
        onclick={handleBookConsultation}
      >
        <Calendar class="h-4 w-4" />
        Book Consultation
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog> 