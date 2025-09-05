<script lang="ts">
	import { onMount } from 'svelte';
	import { n8nService } from '$lib/services/n8n';
	import type { N8nMetrics } from '$lib/services/n8n';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
	IconPlayerPlay,
	IconClock,
	IconCheck,
	IconX,
	IconAlertTriangle,
	IconActivity,
	IconBolt,
	IconFolder,
	IconSortAscending,
	IconSortDescending,
	IconExternalLink
} from '@tabler/icons-svelte';

	let metrics: N8nMetrics = {
		totalWorkflows: 0,
		activeWorkflows: 0,
		totalExecutions: 0,
		successfulExecutions: 0,
		failedExecutions: 0,
		averageExecutionTime: 0,
		errorRate: 0,
		recentExecutions: [],
		workflowDetails: [],
		isRealData: false
	};

	let loading = true;
	let error = '';
	let sortBy = 'startedAt';
	let sortOrder = 'desc';

	onMount(async () => {
		try {
			const response = await n8nService.getMetrics();
			if (response.error) {
				error = response.error;
			} else {
				metrics = response;
			}
		} catch (err) {
			error = 'Failed to load n8n metrics';
			console.error('Error loading n8n metrics:', err);
		} finally {
			loading = false;
		}
	});

	function sortExecutions(executions: any[]) {
		return executions.sort((a, b) => {
			let aValue = a[sortBy];
			let bValue = b[sortBy];
			
			if (sortBy === 'startedAt' || sortBy === 'finishedAt') {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			} else if (sortBy === 'duration') {
				aValue = aValue || 0;
				bValue = bValue || 0;
			}
			
			if (sortOrder === 'asc') {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});
	}

	function handleSort(field: string) {
		if (sortBy === field) {
			sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = field;
			sortOrder = 'desc';
		}
	}

	function getWorkflowCategories(workflows: any[]) {
		const categories: { [key: string]: any[] } = {};
		
		workflows.forEach(workflow => {
			const category = workflow.category || 'Other';
			if (!categories[category]) {
				categories[category] = [];
			}
			categories[category].push(workflow);
		});
		
		return Object.entries(categories).map(([name, workflows]) => ({
			name,
			count: workflows.length,
			workflows: workflows.sort((a, b) => b.active - a.active) // Active workflows first
		})).sort((a, b) => b.count - a.count); // Sort by count
	}

	function formatDuration(seconds: number): string {
		if (seconds < 60) return `${seconds.toFixed(1)}s`;
		if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
		return `${(seconds / 3600).toFixed(1)}h`;
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'success':
				return IconCheck;
			case 'error':
				return IconX;
			case 'running':
				return IconActivity;
			default:
				return IconClock;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'success':
				return 'text-green-600';
			case 'error':
				return 'text-red-600';
			case 'running':
				return 'text-blue-600';
			default:
				return 'text-gray-600';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}

	function getStatusBadgeVariant(status: string) {
		switch (status) {
			case 'success':
				return 'default';
			case 'error':
				return 'destructive';
			case 'running':
				return 'secondary';
			case 'pending':
				return 'outline';
			default:
				return 'outline';
		}
	}

	function getN8nExecutionUrl(execution: any): string {
		const baseUrl = 'https://n8n.ednsy.com';
		// For n8n, we'll link to the workflow itself since most executions don't have finishedAt
		// This allows users to see the workflow and its execution history
		return `${baseUrl}/workflow/${execution.workflowId}`;
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">n8n Workflow Executions</h2>
			<p class="text-muted-foreground">
				Monitor workflow executions with detailed performance metrics
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="flex items-center gap-2">
				<IconPlayerPlay class="h-4 w-4" />
				n8n Integration
			</Badge>
			{#if metrics && 'isRealData' in metrics}
				<Badge variant={metrics.isRealData ? 'default' : 'secondary'} class="flex items-center gap-2">
					<IconBolt class="h-4 w-4" />
					{metrics.isRealData ? 'Live Data' : 'Demo Data'}
				</Badge>
			{/if}
		</div>
	</div>

	{#if loading}
		<div class="flex items-center justify-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
		</div>
	{:else if error}
		<div class="flex items-center justify-center h-64">
			<div class="text-center">
				<IconAlertTriangle class="h-12 w-12 text-destructive mx-auto mb-4" />
				<p class="text-destructive font-medium">{error}</p>
				<p class="text-muted-foreground text-sm mt-2">
					Please check your n8n API configuration
				</p>
			</div>
		</div>
	{:else if metrics && metrics.recentExecutions && metrics.recentExecutions.length > 0}
		<!-- Executions Table -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Workflow Executions</Card.Title>
				<Card.Description>
					Detailed view of all workflow executions with performance metrics
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[300px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('workflowName')}
									>
										Workflow Name
										{#if sortBy === 'workflowName'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[150px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('folder')}
									>
										Folder
										{#if sortBy === 'folder'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[100px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('status')}
									>
										Status
										{#if sortBy === 'status'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[120px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('duration')}
									>
										Duration
										{#if sortBy === 'duration'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[180px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('startedAt')}
									>
										Started
										{#if sortBy === 'startedAt'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[180px]">
									<button 
										class="flex items-center gap-2 hover:text-primary transition-colors"
										onclick={() => handleSort('finishedAt')}
									>
										Finished
										{#if sortBy === 'finishedAt'}
											{#if sortOrder === 'asc'}
												<IconSortAscending class="h-4 w-4" />
											{:else}
												<IconSortDescending class="h-4 w-4" />
											{/if}
										{/if}
									</button>
								</Table.Head>
								<Table.Head class="w-[100px]">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sortExecutions(metrics.recentExecutions) as execution}
								<Table.Row>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-2">
											{#if execution.status === 'success'}
												<IconCheck class="h-4 w-4 text-green-600" />
											{:else if execution.status === 'error'}
												<IconX class="h-4 w-4 text-red-600" />
											{:else if execution.status === 'running'}
												<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
											{:else if execution.status === 'pending'}
												<IconClock class="h-4 w-4 text-yellow-600" />
											{:else}
												<IconClock class="h-4 w-4 text-gray-600" />
											{/if}
											{execution.workflowName || `Workflow ${execution.workflowId}`}
										</div>
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-2">
											<IconFolder class="h-4 w-4 text-muted-foreground" />
											{execution.folder || 'Uncategorized'}
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge variant={getStatusBadgeVariant(execution.status)}>
											{execution.status}
										</Badge>
									</Table.Cell>
									<Table.Cell>
										{#if execution.duration && execution.duration > 0}
											<span class="font-mono text-sm">
												{formatDuration(execution.duration)}
											</span>
										{:else if execution.status === 'running'}
											<span class="text-blue-600 text-sm">Running</span>
										{:else if execution.status === 'pending'}
											<span class="text-yellow-600 text-sm">Pending</span>
										{:else}
											<span class="text-muted-foreground text-sm">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<span class="text-sm text-muted-foreground">
											{formatDate(execution.startedAt)}
										</span>
									</Table.Cell>
									<Table.Cell>
										{#if execution.finishedAt}
											<span class="text-sm text-muted-foreground">
												{formatDate(execution.finishedAt)}
											</span>
										{:else}
											<span class="text-muted-foreground text-sm">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<a 
											href={getN8nExecutionUrl(execution)}
											target="_blank"
											rel="noopener noreferrer"
											class="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
											title="View workflow in n8n"
										>
											<IconExternalLink class="h-4 w-4" />
											Workflow
										</a>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="flex items-center justify-center h-64">
			<div class="text-center">
				<IconAlertTriangle class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p class="text-muted-foreground font-medium">No executions found</p>
				<p class="text-muted-foreground text-sm mt-2">
					No workflow executions are available to display
				</p>
			</div>
		</div>
	{/if}
</div> 