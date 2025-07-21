<script lang="ts">
  export let error;
  console.log(error);
</script>

<div class="flex flex-col items-center justify-center h-screen">
  <h1 class="text-3xl font-bold text-red-600 mb-4">Authentication Error</h1>
  <p class="text-lg text-gray-700 mb-6">We couldn't complete your login. This may be due to an expired or invalid authentication code.</p>
  <a href="/login" class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Return to Login</a>
</div> 