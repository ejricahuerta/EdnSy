<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { 
    Calendar, 
    Clock, 
    User, 
    MessageSquare, 
    Video, 
    Phone,
    CheckCircle,
    AlertCircle,
    Star,
    MapPin,
    Zap
  } from 'lucide-svelte';

  let selectedService = '';
  let selectedDate = '';
  let selectedTime = '';
  let consultantName = '';
  let showBookingModal = false;
  let bookingConfirmed = false;
  let currentConsultation: any = null;

  const services = [
    {
      id: 'ai-assistant',
      name: 'AI Assistant Implementation',
      description: 'Set up intelligent customer support chatbot',
      duration: '30 min',
      price: 'Free',
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      id: 'automation-tasks',
      name: 'Task Automation Setup',
      description: 'Automate lead capture and follow-up processes',
      duration: '45 min',
      price: 'Free',
      icon: Zap,
      color: 'bg-green-500'
    },
    {
      id: 'data-insights',
      name: 'Data Analytics Integration',
      description: 'Implement AI-powered business intelligence',
      duration: '60 min',
      price: 'Free',
      icon: Star,
      color: 'bg-purple-500'
    },
    {
      id: 'business-operations',
      name: 'Business Operations Platform',
      description: 'Complete field service management solution',
      duration: '90 min',
      price: 'Free',
      icon: Calendar,
      color: 'bg-orange-500'
    }
  ];

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const consultants = [
    {
      id: 'sarah',
      name: 'Sarah Chen',
      role: 'AI Implementation Specialist',
      rating: 4.9,
      reviews: 127,
      specialties: ['Home Services', 'Automation', 'CRM Integration'],
      avatar: '👩‍💼'
    },
    {
      id: 'mike',
      name: 'Mike Rodriguez',
      role: 'Business Operations Expert',
      rating: 4.8,
      reviews: 89,
      specialties: ['Field Service', 'Workflow Optimization', 'Team Management'],
      avatar: '👨‍💼'
    },
    {
      id: 'emma',
      name: 'Emma Thompson',
      role: 'Data Analytics Consultant',
      rating: 4.9,
      reviews: 156,
      specialties: ['Business Intelligence', 'KPI Tracking', 'Performance Optimization'],
      avatar: '👩‍🔬'
    }
  ];

  function selectService(serviceId: string) {
    selectedService = serviceId;
  }

  function selectConsultant(consultantId: string) {
    consultantName = consultantId;
  }

  function openBookingModal() {
    if (selectedService && consultantName) {
      showBookingModal = true;
    }
  }

  function confirmBooking() {
    const service = services.find(s => s.id === selectedService);
    const consultant = consultants.find(c => c.id === consultantName);
    
    currentConsultation = {
      id: 'CONS-' + Date.now().toString().slice(-6),
      service: service?.name,
      consultant: consultant?.name,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmed',
      meetingLink: 'https://calendly.com/ednsy/consultation',
      duration: service?.duration
    };

    bookingConfirmed = true;
    showBookingModal = false;
  }

  function getServiceIcon(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    return service?.icon || Calendar;
  }

  function getServiceColor(serviceId: string) {
    const service = services.find(s => s.id === serviceId);
    return service?.color || 'bg-gray-500';
  }
</script>

<div class="flex flex-1 flex-col gap-4 p-4">
  <!-- Header -->
  <div class="text-left mb-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="text-gray-900 font-medium">Consultation</span>
      </div>
    </div>
    <h1 class="text-2xl font-bold text-gray-900 mb-2">Schedule Your Consultation</h1>
    <p class="text-lg text-gray-600 max-w-2xl">
      Book a free consultation with our AI automation experts. We'll discuss your specific needs and show you how to transform your business operations.
    </p>
  </div>

  {#if !bookingConfirmed}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Service Selection -->
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              Choose Your Service
            </CardTitle>
            <CardDescription>Select the automation solution you're interested in</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            {#each services as service}
              <div 
                class="p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md {selectedService === service.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                onclick={() => selectService(service.id)}
              >
                <div class="flex items-center gap-3">
                  <div class={`p-2 rounded-lg ${service.color} text-white`}>
                    <svelte:component this={service.icon} class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{service.name}</h3>
                    <p class="text-sm text-gray-600">{service.description}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span class="flex items-center gap-1">
                        <Clock class="w-3 h-3" />
                        {service.duration}
                      </span>
                      <span class="text-green-600 font-medium">{service.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </CardContent>
        </Card>

        <!-- Consultant Selection -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="w-5 h-5" />
              Choose Your Consultant
            </CardTitle>
            <CardDescription>Select an expert who specializes in your needs</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            {#each consultants as consultant}
              <div 
                class="p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md {consultantName === consultant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}"
                onclick={() => selectConsultant(consultant.id)}
              >
                <div class="flex items-center gap-3">
                  <div class="text-2xl">{consultant.avatar}</div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">{consultant.name}</h3>
                    <p class="text-sm text-gray-600">{consultant.role}</p>
                    <div class="flex items-center gap-2 mt-2">
                      <div class="flex items-center gap-1">
                        <Star class="w-3 h-3 text-yellow-500 fill-current" />
                        <span class="text-sm font-medium">{consultant.rating}</span>
                      </div>
                      <span class="text-xs text-gray-500">({consultant.reviews} reviews)</span>
                    </div>
                    <div class="flex flex-wrap gap-1 mt-2">
                      {#each consultant.specialties as specialty}
                        <Badge variant="outline" class="text-xs">{specialty}</Badge>
                      {/each}
                    </div>
                  </div>
                </div>
              </div>
            {/each}
          </CardContent>
        </Card>
      </div>

      <!-- Booking Details -->
      <div class="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Clock class="w-5 h-5" />
              Schedule Your Session
            </CardTitle>
            <CardDescription>Pick a date and time that works for you</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <!-- Date Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input 
                type="date" 
                bind:value={selectedDate}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <!-- Time Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <div class="grid grid-cols-2 gap-2">
                {#each timeSlots as time}
                  <button
                    class="p-2 text-sm border rounded-md transition-colors {selectedTime === time ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 hover:border-gray-400'}"
                    onclick={() => selectedTime = time}
                  >
                    {time}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Booking Summary -->
            {#if selectedService && consultantName && selectedDate && selectedTime}
              <div class="p-4 bg-gray-50 rounded-lg">
                <h4 class="font-medium text-gray-900 mb-2">Booking Summary</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Service:</span>
                    <span class="font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Consultant:</span>
                    <span class="font-medium">{consultants.find(c => c.id === consultantName)?.name}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Date:</span>
                    <span class="font-medium">{selectedDate}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Time:</span>
                    <span class="font-medium">{selectedTime}</span>
                  </div>
                </div>
              </div>

              <Button 
                class="w-full" 
                onclick={openBookingModal}
                disabled={!selectedService || !consultantName || !selectedDate || !selectedTime}
              >
                <Calendar class="w-4 h-4 mr-2" />
                Confirm Booking
              </Button>
            {/if}
          </CardContent>
        </Card>

        <!-- What to Expect -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <MessageSquare class="w-5 h-5" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-medium text-sm">Free Consultation</h4>
                <p class="text-xs text-gray-600">No cost, no obligation - just expert advice</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-medium text-sm">Custom Demo</h4>
                <p class="text-xs text-gray-600">See automation tailored to your business</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 class="font-medium text-sm">Implementation Plan</h4>
                <p class="text-xs text-gray-600">Step-by-step roadmap for your success</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  {:else}
    <!-- Booking Confirmation -->
    <div class="max-w-2xl mx-auto">
      <Card class="text-center">
        <CardHeader>
          <div class="flex justify-center mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle class="w-8 h-8 text-green-600" />
            </div>
          </div>
          <CardTitle class="text-2xl text-gray-900">Booking Confirmed!</CardTitle>
          <CardDescription>Your consultation has been scheduled successfully</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <!-- Booking Details -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Consultation Details</h3>
            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Booking ID:</span>
                <span class="font-medium">{currentConsultation.id}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Service:</span>
                <span class="font-medium">{currentConsultation.service}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Consultant:</span>
                <span class="font-medium">{currentConsultation.consultant}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Date:</span>
                <span class="font-medium">{currentConsultation.date}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Time:</span>
                <span class="font-medium">{currentConsultation.time}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-medium">{currentConsultation.duration}</span>
              </div>
            </div>
          </div>

          <!-- Next Steps -->
          <div class="space-y-4">
            <h3 class="font-semibold text-gray-900">Next Steps</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-medium text-blue-600">1</span>
                </div>
                <span class="text-sm">You'll receive a calendar invitation via email</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-medium text-blue-600">2</span>
                </div>
                <span class="text-sm">Prepare any questions about your business operations</span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span class="text-xs font-medium text-blue-600">3</span>
                </div>
                <span class="text-sm">Join the video call at your scheduled time</span>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <Button variant="outline" class="flex-1">
              <Calendar class="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button class="flex-1">
              <MessageSquare class="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  {/if}

  <!-- Booking Modal -->
  {#if showBookingModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center gap-3 mb-4">
          <Calendar class="w-6 h-6 text-blue-500" />
          <h3 class="text-lg font-semibold">Confirm Booking</h3>
        </div>
        <p class="text-gray-600 mb-4">
          Please confirm your consultation booking. You'll receive a calendar invitation and meeting link via email.
        </p>
        <div class="space-y-3 mb-6">
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Service:</span>
            <span class="text-sm font-medium">{services.find(s => s.id === selectedService)?.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Consultant:</span>
            <span class="text-sm font-medium">{consultants.find(c => c.id === consultantName)?.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm text-gray-600">Date & Time:</span>
            <span class="text-sm font-medium">{selectedDate} at {selectedTime}</span>
          </div>
        </div>
        <div class="flex gap-3">
          <Button variant="outline" onclick={() => showBookingModal = false}>
            Cancel
          </Button>
          <Button onclick={confirmBooking}>
            <CheckCircle class="w-4 h-4 mr-2" />
            Confirm Booking
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div> 