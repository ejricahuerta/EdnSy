<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Select, SelectContent, SelectItem, SelectTrigger } from "$lib/components/ui/select";
  import { 
    Calendar, 
    ArrowLeft, 
    Clock,
    Star,
    CheckCircle,
    Zap,
    Users,
    CalendarDays,
    Phone,
    Mail,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Settings,
    Play,
    RotateCcw,
    MessageSquare
  } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  let selectedDate = new Date();
  let selectedTime = "";
  let selectedService = "";
  let customerName = "";
  let customerEmail = "";
  let customerPhone = "";
  let bookingConfirmed = false;
  let isDemoRunning = false;
  let showMobileSetup = false;

  const availableTimes = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM"
  ];

  const services = [
    { id: "consultation", name: "Business Consultation", duration: "60 min", price: "$150" },
    { id: "strategy", name: "Strategy Session", duration: "90 min", price: "$200" },
    { id: "implementation", name: "Implementation Planning", duration: "120 min", price: "$300" },
    { id: "review", name: "Progress Review", duration: "45 min", price: "$100" }
  ];

  const demoFeatures = [
    {
      icon: CalendarDays,
      title: "Smart Calendar",
      description: "Automatically syncs with your existing calendar systems"
    },
    {
      icon: Clock,
      title: "No Double Bookings",
      description: "Prevents scheduling conflicts and overlapping appointments"
    },
    {
      icon: Zap,
      title: "Automatic Reminders",
      description: "Sends SMS and email reminders to reduce no-shows"
    },
    {
      icon: Users,
      title: "Multi-staff Support",
      description: "Manage multiple team members and their availability"
    }
  ];

  const benefits = [
    "Reduce no-shows by 80% with automated reminders",
    "Eliminate double bookings and scheduling conflicts",
    "Save 5+ hours per week on manual scheduling",
    "Improve customer satisfaction with self-service booking",
    "Integrate with existing CRM and calendar systems"
  ];

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  }

  function getCalendarDays() {
    const { daysInMonth, startingDay } = getDaysInMonth(selectedDate);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  }

  function changeMonth(direction: number) {
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1);
  }

  function selectDate(day: number) {
    if (day) {
      selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    }
  }

  function confirmBooking() {
    if (selectedService && selectedTime && customerName && customerEmail) {
      bookingConfirmed = true;
    }
  }

  function resetBooking() {
    bookingConfirmed = false;
    selectedTime = "";
    selectedService = "";
    customerName = "";
    customerEmail = "";
    customerPhone = "";
  }

  function startDemo() {
    isDemoRunning = true;
    resetBooking();
  }

  function resetDemo() {
    isDemoRunning = false;
    resetBooking();
  }
</script>

<div class="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 h-full">
  <!-- Background Pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0); background-size: 20px 20px;"></div>
  </div>

  <div class="relative z-10 flex h-full">
    <!-- Scheduling Interface (Left - Takes remaining space) -->
    <div class="flex-1 flex flex-col min-h-0 lg:mr-80">
      <!-- Scheduling Area -->
      <div class="flex-1 p-3 lg:p-6 min-h-0">
        <!-- Mobile: Single Unified Card -->
        <div class="lg:hidden">
          <Card class="h-full bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0 p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-green-500 text-white">
                    <Calendar class="w-4 h-4" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 text-sm">Smart Scheduling</h3>
                    <p class="text-xs text-gray-600">
                      {isDemoRunning ? "Live - Booking appointments" : "Offline - Start demo to begin"}
                    </p>
                  </div>
                </div>
                <!-- Mobile Setup Toggle -->
                <Button 
                  variant="ghost" 
                  size="sm" 
                  class="text-gray-600 hover:text-gray-900"
                  on:click={() => showMobileSetup = !showMobileSetup}
                >
                  <Settings class="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Mobile Setup Section -->
              {#if showMobileSetup}
                <div class="border-b border-gray-200 p-4 bg-gray-50">
                  <div class="space-y-4">
                    <!-- Service Selection -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Select Service</Label>
                      <Select bind:value={selectedService}>
                        <SelectTrigger class="w-full text-sm">
                          <span>{services.find(s => s.id === selectedService)?.name || "Choose a service"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {#each services as service}
                            <SelectItem value={service.id}>{service.name} - {service.price}</SelectItem>
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Time Selection -->
                    <div class="space-y-2">
                      <Label class="text-sm font-medium">Select Time</Label>
                      <Select bind:value={selectedTime}>
                        <SelectTrigger class="w-full text-sm">
                          <span>{selectedTime || "Choose a time"}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {#each availableTimes as time}
                            <SelectItem value={time}>{time}</SelectItem>
                          {/each}
                        </SelectContent>
                      </Select>
                    </div>

                    <!-- Demo Controls -->
                    <div class="space-y-3 pt-4 border-t border-gray-200">
                      <Button 
                        variant={isDemoRunning ? "outline" : "default"}
                        on:click={startDemo}
                        disabled={isDemoRunning}
                        class="w-full flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <Play class="w-4 h-4" />
                        Start Demo
                      </Button>
                      <Button 
                        variant="outline"
                        on:click={resetDemo}
                        disabled={!isDemoRunning}
                        class="w-full flex items-center gap-2 text-sm"
                        size="sm"
                      >
                        <RotateCcw class="w-4 h-4" />
                        Reset Demo
                      </Button>
                    </div>
                  </div>
                </div>
              {/if}

              <!-- Scheduling Content -->
              <div class="flex-1 p-3 space-y-3 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-6 text-gray-500">
                    <Calendar class="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p class="text-base font-medium">Welcome to Smart Scheduling</p>
                    <p class="text-xs">Configure your demo and click Start to book appointments</p>
                  </div>
                {:else}
                  <!-- Scheduling Dashboard Content -->
                  <div class="space-y-4">
                    <!-- Calendar -->
                    <Card class="border-green-200">
                      <CardHeader class="pb-3">
                        <div class="flex items-center justify-between">
                          <CardTitle class="text-base">Select Date</CardTitle>
                          <div class="flex items-center gap-2">
                            <Button variant="ghost" size="sm" on:click={() => changeMonth(-1)}>
                              <ChevronLeft class="w-4 h-4" />
                            </Button>
                            <span class="text-sm font-medium">
                              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <Button variant="ghost" size="sm" on:click={() => changeMonth(1)}>
                              <ChevronRight class="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent class="p-4">
                        <div class="grid grid-cols-7 gap-1 text-xs">
                          {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
                            <div class="p-2 text-center text-gray-500 font-medium">{day}</div>
                          {/each}
                          {#each getCalendarDays() as day}
                            <button
                              class="p-2 text-center rounded hover:bg-gray-100 {day === selectedDate.getDate() ? 'bg-green-500 text-white' : day ? 'text-gray-900' : 'text-gray-300'}"
                              on:click={() => selectDate(day)}
                              disabled={!day}
                            >
                              {day || ''}
                            </button>
                          {/each}
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Booking Form -->
                    {#if selectedDate && selectedService && selectedTime}
                      <Card class="border-green-200">
                        <CardHeader class="pb-3">
                          <CardTitle class="text-base">Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent class="p-4 space-y-3">
                          <div class="space-y-2">
                            <Label for="name" class="text-sm">Name</Label>
                            <Input id="name" bind:value={customerName} placeholder="Your name" class="text-sm" />
                          </div>
                          <div class="space-y-2">
                            <Label for="email" class="text-sm">Email</Label>
                            <Input id="email" type="email" bind:value={customerEmail} placeholder="your@email.com" class="text-sm" />
                          </div>
                          <div class="space-y-2">
                            <Label for="phone" class="text-sm">Phone (optional)</Label>
                            <Input id="phone" type="tel" bind:value={customerPhone} placeholder="+1 (555) 123-4567" class="text-sm" />
                          </div>
                          <Button 
                            on:click={confirmBooking}
                            disabled={!customerName || !customerEmail}
                            class="w-full text-sm"
                            size="sm"
                          >
                            Confirm Booking
                          </Button>
                        </CardContent>
                      </Card>
                    {/if}

                    <!-- Confirmation -->
                    {#if bookingConfirmed}
                      <Card class="border-green-200 bg-green-50">
                        <CardContent class="p-4">
                          <div class="flex items-center gap-3">
                            <CheckCircle class="w-5 h-5 text-green-600" />
                            <div>
                              <h4 class="font-medium text-green-900">Booking Confirmed!</h4>
                              <p class="text-sm text-green-700">
                                {selectedService} on {selectedDate.toLocaleDateString()} at {selectedTime}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    {/if}
                  </div>
                {/if}
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Desktop: Separate Scheduling Card -->
        <div class="hidden lg:block">
          <Card class="h-full bg-white/90 backdrop-blur-sm shadow-xl flex flex-col">
            <CardHeader class="border-b border-gray-200 flex-shrink-0">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-green-500 text-white">
                  <Calendar class="w-5 h-5" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-base">Smart Scheduling</h3>
                  <p class="text-sm text-gray-600">
                    {isDemoRunning ? "Live - Booking appointments" : "Offline - Start demo to begin"}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 mt-2 flex-wrap ">
                <Badge variant="outline">
                  <Calendar class="w-4 h-4" />
                  <span>Google Calendar</span>
                </Badge>
                <Badge variant="outline">
                  <Calendar class="w-4 h-4" />
                  <span>Outlook Calendar</span>
                </Badge>
                <Badge variant="outline">
                  <Calendar class="w-4 h-4" />
                  <span>iCal</span>
                </Badge>
                <Badge variant="outline">
                  <Mail class="w-4 h-4" />
                  <span>Gmail</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>WhatsApp</span>
                </Badge>
                <Badge variant="outline">
                  <MessageSquare class="w-4 h-4" />
                  <span>SMS</span>
                </Badge>
              </div>
            </CardHeader>

            <CardContent class="p-0 flex-1 flex flex-col min-h-0">
              <!-- Scheduling Content -->
              <div class="flex-1 p-4 space-y-4 overflow-y-auto min-h-0">
                {#if !isDemoRunning}
                  <div class="text-center py-8 text-gray-500">
                    <Calendar class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p class="text-lg font-medium">Welcome to Smart Scheduling</p>
                    <p class="text-sm">Configure your demo and click Start to book appointments</p>
                  </div>
                {:else}
                  <!-- Scheduling Dashboard Content -->
                  <div class="space-y-6">
                    <!-- Calendar -->
                    <Card class="border-green-200">
                      <CardHeader class="pb-4">
                        <div class="flex items-center justify-between">
                          <CardTitle class="text-lg">Select Date</CardTitle>
                          <div class="flex items-center gap-3">
                            <Button variant="ghost" size="sm" on:click={() => changeMonth(-1)}>
                              <ChevronLeft class="w-5 h-5" />
                            </Button>
                            <span class="text-base font-medium">
                              {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <Button variant="ghost" size="sm" on:click={() => changeMonth(1)}>
                              <ChevronRight class="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent class="p-6">
                        <div class="grid grid-cols-7 gap-2 text-sm">
                          {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
                            <div class="p-3 text-center text-gray-500 font-medium">{day}</div>
                          {/each}
                          {#each getCalendarDays() as day}
                            <button
                              class="p-3 text-center rounded hover:bg-gray-100 {day === selectedDate.getDate() ? 'bg-green-500 text-white' : day ? 'text-gray-900' : 'text-gray-300'}"
                              on:click={() => selectDate(day)}
                              disabled={!day}
                            >
                              {day || ''}
                            </button>
                          {/each}
                        </div>
                      </CardContent>
                    </Card>

                    <!-- Booking Form -->
                    {#if selectedDate && selectedService && selectedTime}
                      <Card class="border-green-200">
                        <CardHeader class="pb-4">
                          <CardTitle class="text-lg">Booking Details</CardTitle>
                        </CardHeader>
                        <CardContent class="p-6 space-y-4">
                          <div class="space-y-2">
                            <Label for="name-desktop" class="text-base">Name</Label>
                            <Input id="name-desktop" bind:value={customerName} placeholder="Your name" class="text-base" />
                          </div>
                          <div class="space-y-2">
                            <Label for="email-desktop" class="text-base">Email</Label>
                            <Input id="email-desktop" type="email" bind:value={customerEmail} placeholder="your@email.com" class="text-base" />
                          </div>
                          <div class="space-y-2">
                            <Label for="phone-desktop" class="text-base">Phone (optional)</Label>
                            <Input id="phone-desktop" type="tel" bind:value={customerPhone} placeholder="+1 (555) 123-4567" class="text-base" />
                          </div>
                          <Button 
                            on:click={confirmBooking}
                            disabled={!customerName || !customerEmail}
                            class="w-full text-base"
                          >
                            Confirm Booking
                          </Button>
                        </CardContent>
                      </Card>
                    {/if}

                    <!-- Confirmation -->
                    {#if bookingConfirmed}
                      <Card class="border-green-200 bg-green-50">
                        <CardContent class="p-6">
                          <div class="flex items-center gap-4">
                            <CheckCircle class="w-6 h-6 text-green-600" />
                            <div>
                              <h4 class="text-lg font-medium text-green-900">Booking Confirmed!</h4>
                              <p class="text-base text-green-700">
                                {selectedService} on {selectedDate.toLocaleDateString()} at {selectedTime}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    {/if}
                  </div>
                {/if}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Desktop Sidebar (Right) -->
    <div class="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 absolute right-0 top-0 h-full overflow-y-auto">
      <div class="p-6 space-y-6">
        <!-- Service Selection -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Select Service</Label>
          <Select bind:value={selectedService}>
            <SelectTrigger class="w-full text-base">
              <span>{services.find(s => s.id === selectedService)?.name || "Choose a service"}</span>
            </SelectTrigger>
            <SelectContent>
              {#each services as service}
                <SelectItem value={service.id}>{service.name} - {service.price}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <!-- Time Selection -->
        <div class="space-y-3">
          <Label class="text-sm font-medium">Select Time</Label>
          <Select bind:value={selectedTime}>
            <SelectTrigger class="w-full text-base">
              <span>{selectedTime || "Choose a time"}</span>
            </SelectTrigger>
            <SelectContent>
              {#each availableTimes as time}
                <SelectItem value={time}>{time}</SelectItem>
              {/each}
            </SelectContent>
          </Select>
        </div>

        <!-- Demo Information -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Clock class="w-4 h-4" />
            <span>Duration: 8-12 minutes</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <Star class="w-4 h-4" />
            <span>Difficulty: Easy</span>
          </div>
        </div>

        <!-- Key Features -->
        <div class="space-y-3">
          <h4 class="font-medium text-gray-900">Key Features</h4>
          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays class="w-4 h-4 text-green-600" />
              <span>Smart calendar</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Clock class="w-4 h-4 text-green-600" />
              <span>No double bookings</span>
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <Zap class="w-4 h-4 text-green-600" />
              <span>Automatic reminders</span>
            </div>
          </div>
        </div>

        <!-- Demo Controls -->
        <div class="space-y-3 pt-4 border-t border-gray-200">
          <Button 
            variant={isDemoRunning ? "outline" : "default"}
            on:click={startDemo}
            disabled={isDemoRunning}
            class="w-full flex items-center gap-2 text-base"
          >
            <Play class="w-4 h-4" />
            Start Demo
          </Button>
          <Button 
            variant="outline"
            on:click={resetDemo}
            disabled={!isDemoRunning}
            class="w-full flex items-center gap-2 text-base"
          >
            <RotateCcw class="w-4 h-4" />
            Reset Demo
          </Button>
        </div>
      </div>
    </div>
  </div>
</div> 