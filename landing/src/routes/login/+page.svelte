<script lang="ts">
  import GoogleLogin from '$lib/components/GoogleLogin.svelte';
</script>

<div class="min-h-screen flex">
  <!-- Left: Background image/art and logo -->
  <div class="hidden md:flex w-1/2 h-screen bg-[var(--background)] relative items-start justify-start">
    <img src="/logo.png" alt="Logo" class="absolute top-8 left-8 h-10 w-10 drop-shadow-lg" style="filter: drop-shadow(0 2px 8px var(--primary));" />
    <div class="w-full h-full bg-cover bg-center" style="background-image: url('/imgs/login.jpg'); filter: grayscale(1) contrast(1.1) blur(1.5px) brightness(0.8); opacity: 0.85;"></div>
  </div>

  <!-- Right: Auth form, centered, no card -->
  <div class="flex flex-col justify-center items-center w-full md:w-1/2 h-screen bg-[var(--background)] text-[var(--foreground)] relative">
    <div class="flex flex-col items-center w-full max-w-sm px-6 mx-auto">
      <h1 class="text-xl font-semibold mb-2 mt-8 md:mt-0 text-center">Welcome to <span class="text-[var(--primary)]">Ed & Sy</span></h1>
      <p class="text-sm text-[var(--muted-foreground)] mb-2 text-center">Sign in or sign up with Google</p>
      <GoogleLogin class="w-full mb-4" label="Continue with Google" />
      <p class="text-xs text-[var(--muted-foreground)] text-center mt-2">First time? You’ll be signed up automatically.</p>
    </div>
    <div class="absolute bottom-8 left-0 w-full flex flex-col items-center">
      <p class="text-xs text-[var(--muted-foreground)] text-center">
        By signing in you agree to our
        <a href="/terms" class="underline hover:text-[var(--primary)]">Terms of service</a>
        &amp;
        <a href="/privacy" class="underline hover:text-[var(--primary)]">Privacy policy</a>
      </p>
    </div>
  </div>
</div> 