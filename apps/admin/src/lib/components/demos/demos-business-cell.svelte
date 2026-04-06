<script lang="ts">
	let { companyName, email }: { companyName: string; email: string } = $props();
	const label = $derived(companyName.trim() || email.trim() || '—');
</script>

<span class="font-medium">{label}</span>
