<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabase';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import * as Alert from '$lib/components/ui/alert';
  import { Badge } from '$lib/components/ui/badge';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import { AlertCircle, CheckCircle, ExternalLink, Unplug } from 'lucide-svelte';

  interface IntegrationStatus {
    service_name: 'gmail' | 'google-calendar' | 'google-drive' | 'google-sheets' | 'notion' | 'slack' | 'telegram' | 'whatsapp' | 'stripe';
    connected_at: string;
    expires_at: string | null;
    scope: string | null;
    status: {
      valid: boolean;
      expires_at: string | null;
      needs_refresh: boolean;
    };
  }

  interface IntegrationsData {
    user_id: string;
    connected_services: IntegrationStatus[];
    total_connected: number;
  }

  // Available services configuration
  const availableServices = [
    {
      name: 'gmail' as const,
      displayName: 'Gmail',
      description: 'Send and manage emails through Gmail API',
      logo: '/logos/icons8-gmail.svg',
      color: 'bg-red-500'
    },
    {
      name: 'google-calendar' as const,
      displayName: 'Google Calendar',
      description: 'Create and manage calendar events',
      logo: '/logos/icons8-google-calendar.svg',
      color: 'bg-blue-500'
    },
    {
      name: 'google-drive' as const,
      displayName: 'Google Drive',
      description: 'Access and manage files in Google Drive',
      logo: '/logos/icons8-google-drive.svg',
      color: 'bg-yellow-500'
    },
    {
      name: 'google-sheets' as const,
      displayName: 'Google Sheets',
      description: 'Read and write spreadsheet data',
      logo: '/logos/icons8-google-sheets.svg',
      color: 'bg-green-500'
    },
    {
      name: 'notion' as const,
      displayName: 'Notion',
      description: 'Access your Notion databases and pages',
      logo: '/logos/icons8-notion.svg',
      color: 'bg-gray-800'
    },
    {
      name: 'slack' as const,
      displayName: 'Slack',
      description: 'Send and receive messages in Slack channels',
      logo: '/logos/slack-logo.svg',
      color: 'bg-purple-500'
    },
    {
      name: 'telegram' as const,
      displayName: 'Telegram',
      description: 'Send and receive messages via Telegram Bot API',
      logo: '/logos/icons8-telegram-app.svg',
      color: 'bg-blue-400'
    },
    {
      name: 'whatsapp' as const,
      displayName: 'WhatsApp Business',
      description: 'Send and receive messages via WhatsApp Business API',
      logo: '/logos/icons8-whatsapp.svg',
      color: 'bg-green-500'
    },
    {
      name: 'stripe' as const,
      displayName: 'Stripe',
      description: 'Access payment and customer data',
      logo: '/logos/stripe.png',
      color: 'bg-indigo-500',
      comingSoon: true
    },
  ];

  let integrationsData: IntegrationsData | null = null;
  let loading = true;
  let error = '';
  let success = '';
  let connectingService: string | null = null;
  let user: any = null;
  let authLoading = true;

  onMount(async () => {
    // Check authentication first
    await checkAuth();
    
    // If no user after auth check, redirect will happen in checkAuth
    if (!user) {
      return;
    }

    // Check for URL parameters (success/error messages)
    const urlError = $page.url.searchParams.get('error');
    const urlSuccess = $page.url.searchParams.get('success');
    
    if (urlError) {
      error = urlError;
    }
    
    if (urlSuccess) {
      success = urlSuccess;
    }

    // Load integration status
    await loadIntegrations();
  });

  async function checkAuth() {
    try {
      authLoading = true;
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        redirectToLogin();
        return;
      }
      
      if (!session) {
        redirectToLogin();
        return;
      }
      
      user = session.user;
      
      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            redirectToLogin();
          } else {
            user = session.user;
          }
        }
      );
      
      // Cleanup subscription on component unmount
      return () => subscription.unsubscribe();
      
    } catch (err) {
      console.error('Error checking auth:', err);
      redirectToLogin();
    } finally {
      authLoading = false;
    }
  }

  function redirectToLogin() {
    goto('/login?redirect=/integrations');
  }

  async function loadIntegrations() {
    try {
      loading = true;
      error = '';

      const response = await fetch('/api/integrations/status');
      
      if (!response.ok) {
        throw new Error('Failed to load integrations');
      }

      integrationsData = await response.json();
    } catch (err) {
      console.error('Error loading integrations:', err);
      error = err instanceof Error ? err.message : 'Failed to load integrations';
    } finally {
      loading = false;
    }
  }

  async function connectService(serviceName: string) {
    try {
      connectingService = serviceName;
      error = '';
      success = '';

      const response = await fetch('/api/integrations/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName,
          returnUrl: '/integrations',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const data = await response.json();
      
      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    } catch (err) {
      console.error('Error connecting service:', err);
      error = err instanceof Error ? err.message : 'Failed to connect service';
      connectingService = null;
    }
  }

  async function disconnectService(serviceName: string) {
    try {
      error = '';
      success = '';

      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect service');
      }

      success = `${serviceName} disconnected successfully`;
      
      // Reload integrations
      await loadIntegrations();
    } catch (err) {
      console.error('Error disconnecting service:', err);
      error = err instanceof Error ? err.message : 'Failed to disconnect service';
    }
  }

  function getServiceStatus(serviceName: string): IntegrationStatus | null {
    if (!integrationsData) return null;
    return integrationsData.connected_services.find(s => s.service_name === serviceName) || null;
  }

  function isServiceConnected(serviceName: string): boolean {
    const status = getServiceStatus(serviceName);
    return status ? status.status.valid : false;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Validation functions
  function hasInputOutputChannel(): boolean {
    return ['slack', 'telegram', 'whatsapp'].some(service => isServiceConnected(service));
  }

  function hasService(): boolean {
    return ['gmail', 'google-calendar', 'google-drive', 'google-sheets', 'notion'].some(service => isServiceConnected(service));
  }

  function getValidationStatus() {
    const hasChannel = hasInputOutputChannel();
    const hasServiceConnected = hasService();
    const isValid = hasChannel && hasServiceConnected;
    
    // Sequential validation messaging
    let message = '';
    let step = 0;
    
    if (!hasChannel) {
      step = 1;
      message = 'Step 1: Connect an input/output channel (Slack, Telegram, or WhatsApp) to receive and send messages.';
    } else if (!hasService) {
      step = 2;
      message = 'Step 2: Connect a service (Gmail, Calendar, Drive, Sheets, or Notion) to enable AI automation.';
    } else {
      step = 3;
      message = 'All requirements met! You can now use AI-powered automation.';
    }
    
    return {
      hasChannel,
      hasService: hasServiceConnected,
      isValid,
      step,
      message
    };
  }
</script>

<svelte:head>
  <title>Integrations - EdnSy</title>
  <meta name="description" content="Connect your favorite services to EdnSy for seamless automation" />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-6xl">
  {#if !user}
    <!-- This should only show briefly before redirect -->
    <div class="flex items-center justify-center min-h-[400px]">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  {:else}
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold mb-2">Integrations</h1>
          <p class="text-muted-foreground">
            Set up your integrations in sequence: first connect a communication channel, then connect your services.
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted-foreground">Welcome, {user.email}</p>
          <Button variant="outline" size="sm" onclick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    {#if error}
      <Alert.Root variant="destructive" class="mb-6">
        <AlertCircle class="h-4 w-4" />
        <Alert.Title>Error</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    {/if}

    {#if success}
      <Alert.Root class="mb-6">
        <CheckCircle class="h-4 w-4" />
        <Alert.Title>Success</Alert.Title>
        <Alert.Description>{success}</Alert.Description>
      </Alert.Root>
    {/if}

    <!-- Connected Services Summary -->
    {#if !loading && integrationsData}
      <div class="mb-8">
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <CheckCircle class="h-5 w-5 text-green-500" />
              Connected Services
            </Card.Title>
            <Card.Description>
              You have {integrationsData.total_connected} service{integrationsData.total_connected !== 1 ? 's' : ''} connected
            </Card.Description>
          </Card.Header>
          {#if integrationsData.total_connected > 0}
            <Card.Content>
              <div class="flex flex-wrap gap-2">
                {#each integrationsData.connected_services as service}
                  {@const serviceConfig = availableServices.find(s => s.name === service.service_name)}
                  {#if serviceConfig}
                    <Badge variant={service.status.valid ? 'default' : 'destructive'} class="gap-2">
                      <img 
                        src={serviceConfig.logo} 
                        alt="{serviceConfig.displayName} logo" 
                        class="h-4 w-4 object-contain"
                      />
                      {serviceConfig.displayName}
                      {#if service.status.needs_refresh}
                        <AlertCircle class="h-3 w-3" />
                      {/if}
                    </Badge>
                  {/if}
                {/each}
              </div>
            </Card.Content>
          {/if}
        </Card.Root>
      </div>

      <!-- Validation Status -->
      {@const validation = getValidationStatus()}
      <div class="mb-8">
        <Card.Root class={validation.isValid ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              {#if validation.isValid}
                <CheckCircle class="h-5 w-5 text-green-600" />
                Setup Complete
              {:else}
                <AlertCircle class="h-5 w-5 text-amber-600" />
                Setup Required - Step {validation.step} of 2
              {/if}
            </Card.Title>
            <Card.Description>
              {validation.message}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div class="space-y-4">
              <!-- Step 1: Input/Output Channel -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full {validation.hasChannel ? 'bg-green-500' : 'bg-amber-500'} text-white flex items-center justify-center text-xs font-medium">
                    {validation.hasChannel ? '✓' : '1'}
                  </div>
                  <span class="text-sm font-medium">Input/Output Channel</span>
                  {#if validation.hasChannel}
                    <Badge variant="outline" class="text-xs">✓ Connected</Badge>
                  {:else}
                    <Badge variant="outline" class="text-xs text-amber-700">Required First</Badge>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground ml-8">
                  Connect Slack, Telegram, or WhatsApp to receive and send messages
                </p>
              </div>
              
              <!-- Step 2: Service Integration -->
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full {validation.hasService ? 'bg-green-500' : (validation.hasChannel ? 'bg-amber-500' : 'bg-gray-300')} text-white flex items-center justify-center text-xs font-medium">
                    {validation.hasService ? '✓' : (validation.hasChannel ? '2' : '—')}
                  </div>
                  <span class="text-sm font-medium">Service Integration</span>
                  {#if validation.hasService}
                    <Badge variant="outline" class="text-xs">✓ Connected</Badge>
                  {:else if validation.hasChannel}
                    <Badge variant="outline" class="text-xs text-amber-700">Required Next</Badge>
                  {:else}
                    <Badge variant="outline" class="text-xs text-gray-500">Waiting for Step 1</Badge>
                  {/if}
                </div>
                <p class="text-xs text-muted-foreground ml-8">
                  Connect Gmail, Calendar, Drive, Sheets, or Notion for AI automation
                </p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    {/if}

    <!-- Service Categories -->
    <div class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Available Services</h2>
      
      <!-- Communication Channels (Step 1) -->
      <div class="mb-8">
        <h3 class="text-lg font-medium mb-3 text-purple-600">Communication Channels - Step 1</h3>
        <p class="text-sm text-muted-foreground mb-3">Connect one of these first to receive and send messages</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each availableServices.filter(s => ['slack', 'telegram', 'whatsapp'].includes(s.name)) as service}
            <Card.Root class="relative">
              <Card.Header>
                <Card.Title class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
                    <img 
                      src={service.logo} 
                      alt="{service.displayName} logo" 
                      class="h-8 w-8 object-contain"
                    />
                  </div>
                  {service.displayName}
                </Card.Title>
                <Card.Description>
                  {service.description}
                </Card.Description>
              </Card.Header>

              <Card.Content>
                <div class="space-y-4">
                  <!-- Connection Status -->
                  {#if loading}
                    <Skeleton class="h-4 w-full" />
                  {:else if isServiceConnected(service.name)}
                    {@const status = getServiceStatus(service.name)}
                    {#if status}
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle class="h-4 w-4" />
                          Connected on {formatDate(status.connected_at)}
                        </div>
                        
                        {#if status.status.needs_refresh}
                          <div class="flex items-center gap-2 text-sm text-amber-600">
                            <AlertCircle class="h-4 w-4" />
                            Token needs refresh
                          </div>
                        {/if}

                        {#if status.expires_at}
                          <div class="text-xs text-muted-foreground">
                            Expires: {formatDate(status.expires_at)}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  {:else}
                    <div class="text-sm text-muted-foreground">
                      Not connected
                    </div>
                  {/if}
                </div>
              </Card.Content>

              <Card.Footer>
                {#if loading}
                  <Skeleton class="h-10 w-full" />
                {:else if isServiceConnected(service.name)}
                  <div class="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex-1"
                      onclick={() => connectService(service.name)}
                      disabled={connectingService === service.name}
                    >
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      class="flex-1"
                      onclick={() => disconnectService(service.name)}
                    >
                      <Unplug class="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                {:else}
                  <Button
                    class="w-full"
                    onclick={() => connectService(service.name)}
                    disabled={connectingService === service.name}
                  >
                    {#if connectingService === service.name}
                      Connecting...
                    {:else}
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Connect {service.displayName}
                    {/if}
                  </Button>
                {/if}
              </Card.Footer>
            </Card.Root>
          {/each}
        </div>
      </div>

      <!-- Google Workspace Services (Step 2) -->
      <div class="mb-8">
        <h3 class="text-lg font-medium mb-3 text-blue-600">Google Workspace Services - Step 2</h3>
        <p class="text-sm text-muted-foreground mb-3">Connect these after setting up a communication channel</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each availableServices.filter(s => s.name.startsWith('google')) as service}
            <Card.Root class="relative">
              <Card.Header>
                <Card.Title class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
                    <img 
                      src={service.logo} 
                      alt="{service.displayName} logo" 
                      class="h-8 w-8 object-contain"
                    />
                  </div>
                  {service.displayName}
                </Card.Title>
                <Card.Description>
                  {service.description}
                </Card.Description>
              </Card.Header>

              <Card.Content>
                <div class="space-y-4">
                  <!-- Connection Status -->
                  {#if loading}
                    <Skeleton class="h-4 w-full" />
                  {:else if isServiceConnected(service.name)}
                    {@const status = getServiceStatus(service.name)}
                    {#if status}
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle class="h-4 w-4" />
                          Connected on {formatDate(status.connected_at)}
                        </div>
                        
                        {#if status.status.needs_refresh}
                          <div class="flex items-center gap-2 text-sm text-amber-600">
                            <AlertCircle class="h-4 w-4" />
                            Token needs refresh
                          </div>
                        {/if}

                        {#if status.expires_at}
                          <div class="text-xs text-muted-foreground">
                            Expires: {formatDate(status.expires_at)}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  {:else}
                    <div class="text-sm text-muted-foreground">
                      Not connected
                    </div>
                  {/if}
                </div>
              </Card.Content>

              <Card.Footer>
                {#if loading}
                  <Skeleton class="h-10 w-full" />
                {:else if isServiceConnected(service.name)}
                  <div class="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex-1"
                      onclick={() => connectService(service.name)}
                      disabled={connectingService === service.name}
                    >
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      class="flex-1"
                      onclick={() => disconnectService(service.name)}
                    >
                      <Unplug class="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                {:else}
                  <Button
                    class="w-full"
                    onclick={() => connectService(service.name)}
                    disabled={connectingService === service.name}
                  >
                    {#if connectingService === service.name}
                      Connecting...
                    {:else}
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Connect {service.displayName}
                    {/if}
                  </Button>
                {/if}
              </Card.Footer>
            </Card.Root>
          {/each}
        </div>
      </div>

      <!-- Other Services (Step 2) -->
      <div class="mb-8">
        <h3 class="text-lg font-medium mb-3 text-gray-600">Other Services - Step 2</h3>
        <p class="text-sm text-muted-foreground mb-3">Connect these after setting up a communication channel</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          {#each availableServices.filter(s => !s.name.startsWith('google') && !['slack', 'telegram', 'whatsapp'].includes(s.name)) as service}
            <Card.Root class="relative">
              {#if service.comingSoon}
                <div class="absolute top-4 right-4">
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              {/if}
              
              <Card.Header>
                <Card.Title class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white border-2 border-gray-200 flex items-center justify-center">
                    <img 
                      src={service.logo} 
                      alt="{service.displayName} logo" 
                      class="h-8 w-8 object-contain"
                    />
                  </div>
                  {service.displayName}
                </Card.Title>
                <Card.Description>
                  {service.description}
                </Card.Description>
              </Card.Header>

              <Card.Content>
                <div class="space-y-4">
                  <!-- Connection Status -->
                  {#if loading}
                    <Skeleton class="h-4 w-full" />
                  {:else if isServiceConnected(service.name)}
                    {@const status = getServiceStatus(service.name)}
                    {#if status}
                      <div class="space-y-2">
                        <div class="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle class="h-4 w-4" />
                          Connected on {formatDate(status.connected_at)}
                        </div>
                        
                        {#if status.status.needs_refresh}
                          <div class="flex items-center gap-2 text-sm text-amber-600">
                            <AlertCircle class="h-4 w-4" />
                            Token needs refresh
                          </div>
                        {/if}

                        {#if status.expires_at}
                          <div class="text-xs text-muted-foreground">
                            Expires: {formatDate(status.expires_at)}
                          </div>
                        {/if}
                      </div>
                    {/if}
                  {:else}
                    <div class="text-sm text-muted-foreground">
                      Not connected
                    </div>
                  {/if}
                </div>
              </Card.Content>

              <Card.Footer>
                {#if service.comingSoon}
                  <Button disabled class="w-full">
                    Coming Soon
                  </Button>
                {:else if loading}
                  <Skeleton class="h-10 w-full" />
                {:else if isServiceConnected(service.name)}
                  <div class="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      class="flex-1"
                      onclick={() => connectService(service.name)}
                      disabled={connectingService === service.name}
                    >
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      class="flex-1"
                      onclick={() => disconnectService(service.name)}
                    >
                      <Unplug class="h-4 w-4 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                {:else}
                  <Button
                    class="w-full"
                    onclick={() => connectService(service.name)}
                    disabled={connectingService === service.name}
                  >
                    {#if connectingService === service.name}
                      Connecting...
                    {:else}
                      <ExternalLink class="h-4 w-4 mr-2" />
                      Connect {service.displayName}
                    {/if}
                  </Button>
                {/if}
              </Card.Footer>
            </Card.Root>
          {/each}
        </div>
      </div>
    </div>

    <!-- Information Section -->
    <div class="mt-12">
      <Card.Root>
        <Card.Header>
          <Card.Title>How It Works</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div class="space-y-2">
              <div class="font-medium flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</div>
                Connect Channel
              </div>
              <p class="text-muted-foreground">
                First, connect Slack, Telegram, or WhatsApp to receive and send messages.
              </p>
            </div>
            
            <div class="space-y-2">
              <div class="font-medium flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</div>
                Connect Service
              </div>
              <p class="text-muted-foreground">
                Then connect Gmail, Calendar, Drive, Sheets, or Notion for AI automation.
              </p>
            </div>
            
            <div class="space-y-2">
              <div class="font-medium flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</div>
                Start Automating
              </div>
              <p class="text-muted-foreground">
                AI agents can now access your services through your communication channel.
              </p>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  {/if}
</div>

