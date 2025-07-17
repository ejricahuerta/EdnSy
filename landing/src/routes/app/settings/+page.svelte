<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Badge } from '$lib/components/ui/badge';
  import { User, Building, Bell, Shield, Calendar, MessageSquare } from '@lucide/svelte';
  import { onMount } from 'svelte';
  
  let currentUser = $derived($page.data.user);
  let promptsUsed = $state(0);
  
  onMount(() => {
    // Load prompts used from localStorage
    const savedPrompts = localStorage.getItem('ednsy_prompts_used');
    if (savedPrompts) {
      promptsUsed = parseInt(savedPrompts);
    }
  });
  
  let accountSettings = $state({
    email: '',
    name: '',
    organization: ''
  });
  
  $effect(() => {
    if (currentUser) {
      accountSettings.email = currentUser.email || '';
      accountSettings.name = currentUser.name || '';
      accountSettings.organization = currentUser.organization?.name || '';
    }
  });
  
  let notificationSettings = $state({
    emailNotifications: true,
    demoAlerts: true,
    creditWarnings: true
  });
  
  function handleAccountSave() {
    // TODO: Implement account settings save
    alert('Account settings saved!');
  }
  
  function handleNotificationSave() {
    // TODO: Implement notification settings save
    alert('Notification settings saved!');
  }
</script>

<div class="px-4 lg:px-6 max-w-4xl mx-auto">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
    <p class="text-gray-600">
      Manage your account settings and preferences
    </p>
  </div>
  
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Account Settings -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <User class="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your personal and workspace information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email Address</Label>
          <Input 
            id="email" 
            type="email" 
            bind:value={accountSettings.email}
            disabled
          />
          <p class="text-xs text-gray-500">Email cannot be changed</p>
        </div>
        
        <div class="space-y-2">
          <Label for="name">Display Name</Label>
          <Input 
            id="name" 
            type="text" 
            bind:value={accountSettings.name}
            placeholder="Enter your display name"
          />
        </div>
        
        <div class="space-y-2">
          <Label for="organization">Workspace Name</Label>
          <Input 
            id="organization" 
            type="text" 
            bind:value={accountSettings.organization}
            placeholder="Enter workspace name"
          />
        </div>
        
        <Button class="w-full" onclick={handleAccountSave}>
          Save Changes
        </Button>
      </CardContent>
    </Card>
    
    <!-- Notification Settings -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <Bell class="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure your notification preferences
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Email Notifications</p>
              <p class="text-sm text-gray-500">Receive updates via email</p>
            </div>
            <input 
              type="checkbox" 
              bind:checked={notificationSettings.emailNotifications}
              class="rounded border-gray-300"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Demo Alerts</p>
              <p class="text-sm text-gray-500">Get notified about new demos</p>
            </div>
            <input 
              type="checkbox" 
              bind:checked={notificationSettings.demoAlerts}
              class="rounded border-gray-300"
            />
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Demo Notifications</p>
              <p class="text-sm text-gray-500">Get notified about new demo features</p>
            </div>
            <input 
              type="checkbox" 
              bind:checked={notificationSettings.creditWarnings}
              class="rounded border-gray-300"
            />
          </div>
        </div>
        
        <Button class="w-full" onclick={handleNotificationSave}>
          Save Preferences
        </Button>
      </CardContent>
    </Card>
    
    <!-- Security Settings -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <Shield class="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium">Two-Factor Authentication</p>
              <p class="text-sm text-gray-500">Add an extra layer of security</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
          
          <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p class="font-medium">Session Management</p>
              <p class="text-sm text-gray-500">Manage active sessions</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
    
    <!-- Partnership & Consultation -->
    <Card>
      <CardHeader>
        <div class="flex items-center gap-3">
          <Calendar class="h-5 w-5 text-slate-600" />
          <div>
            <CardTitle>Partnership & Consultation</CardTitle>
            <CardDescription>
              Ready to partner with us? Book a consultation
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p class="font-medium text-slate-900">Free Prompts Used</p>
              <p class="text-2xl font-bold text-slate-600">{promptsUsed || 0}/10</p>
            </div>
            <MessageSquare class="h-8 w-8 text-slate-600" />
          </div>
          
          <div class="space-y-2">
            <a href="/app/consultation">
              <Button class="w-full">
                Book Free Consultation
              </Button>
            </a>
            <Button variant="outline" class="w-full">
              Contact Sales Team
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</div> 