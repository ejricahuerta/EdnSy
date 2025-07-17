<script lang="ts">
  export let label: string = 'Sign in with Google';

  async function startGoogleLogin() {
    try {
      const res = await fetch("http://localhost:5235/user/connect/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redirectUri: "http://localhost:5173/oauth-callback"
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        alert("Login failed: " + text);
        return;
      }
      const data = await res.json();
      window.location.href = data.oauthUrl;
    } catch (err) {
      console.warn("Backend not available, using mock login flow");
      // Mock login flow for development
      window.location.href = "/login";
    }
  }
</script>

<button class="btn btn-outline btn-primary btn-sm" on:click={startGoogleLogin}>{label}</button> 