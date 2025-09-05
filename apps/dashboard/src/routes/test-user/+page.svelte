<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<div class="p-6 space-y-4">
	<h1 class="text-2xl font-bold">User Debug Information</h1>
	
	<div class="space-y-4">
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">Raw User Object:</h2>
			<pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(data.user, null, 2)}</pre>
		</div>
		
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">Session Object:</h2>
			<pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(data.session, null, 2)}</pre>
		</div>
		
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">User Metadata:</h2>
			<pre class="bg-gray-100 p-4 rounded text-sm overflow-auto">{JSON.stringify(data.user?.user_metadata, null, 2)}</pre>
		</div>
		
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">User Email:</h2>
			<p class="text-lg">{data.user?.email || 'No email'}</p>
		</div>
		
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">User Full Name:</h2>
			<p class="text-lg">{data.user?.user_metadata?.full_name || 'No full name'}</p>
		</div>
		
		<div class="p-4 border rounded-lg">
			<h2 class="text-lg font-semibold mb-2">User Avatar URL:</h2>
			<p class="text-lg">{data.user?.user_metadata?.avatar_url || 'No avatar'}</p>
		</div>
	</div>
</div> 