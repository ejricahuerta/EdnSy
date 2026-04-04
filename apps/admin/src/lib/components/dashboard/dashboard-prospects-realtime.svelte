<script lang="ts">
	import { browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import { get } from 'svelte/store';
	import { createSupabaseBrowserClient } from '$lib/supabase/browserClient';
	import {
		subscribeProspectsJobsRealtime,
		type ProspectsJobRealtimeEvent
	} from '$lib/client/prospectsJobsRealtime';
	import { maybeToastProspectsJobChange } from '$lib/client/prospectsJobRealtimeToast';
	import { prospectJobLabelResolver } from '$lib/notificationHistory';
	import { visibilityInvalidateEffect } from '$lib/client/visibilityInvalidate';

	let {
		userId,
		supabasePublic
	}: {
		userId: string;
		supabasePublic: { url: string; anonKey: string };
	} = $props();

	$effect(() => {
		if (!browser) return;
		if (!userId) return;
		const supabase = createSupabaseBrowserClient(supabasePublic);
		const onJobEvent = async (ev: ProspectsJobRealtimeEvent) => {
			maybeToastProspectsJobChange(ev, (pid) => get(prospectJobLabelResolver)(pid));
			await invalidateAll();
		};
		let stopRt = subscribeProspectsJobsRealtime(supabase, userId, onJobEvent);
		const {
			data: { subscription: authSub }
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === 'TOKEN_REFRESHED') {
				stopRt();
				stopRt = subscribeProspectsJobsRealtime(supabase, userId, onJobEvent);
			}
			if (event === 'SIGNED_OUT') {
				stopRt();
				stopRt = () => {};
			}
		});
		const stopVis = visibilityInvalidateEffect(() => true);
		return () => {
			authSub.unsubscribe();
			stopRt();
			stopVis();
		};
	});
</script>
