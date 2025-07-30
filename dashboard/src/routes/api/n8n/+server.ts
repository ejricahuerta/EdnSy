import { json } from '@sveltejs/kit';
import { N8N_API_KEY, N8N_BASE_URL } from '$env/static/private';

export async function GET() {
  try {
    // Check if n8n is configured
    if (!N8N_API_KEY) {
      throw new Error('n8n API key not configured');
    }

    const baseUrl = N8N_BASE_URL || 'https://n8n.ednsy.com';
    const headers = {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    };

    console.log(`Attempting to connect to n8n at: ${baseUrl}`);

    // Test connection first with a simple health check
    try {
      const healthResponse = await fetch(`${baseUrl}/healthz`, {
        headers,
        method: 'GET'
      });
      
      console.log(`n8n health check status: ${healthResponse.status}`);
      
      if (!healthResponse.ok) {
        console.log('n8n health check failed, trying alternative endpoints...');
        
        // Try alternative health endpoints
        const altHealthResponse = await fetch(`${baseUrl}/api/v1/health`, {
          headers,
          method: 'GET'
        });
        
        if (!altHealthResponse.ok) {
          throw new Error('n8n server is not accessible');
        }
      }
    } catch (error) {
      throw new Error(`n8n connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Get workflows
    let workflowsData = [];
    try {
      console.log('Fetching workflows from n8n...');
      const workflowsResponse = await fetch(`${baseUrl}/api/v1/workflows`, {
        headers,
        method: 'GET'
      });
      
      console.log(`Workflows response status: ${workflowsResponse.status}`);
      
      if (workflowsResponse.ok) {
        const workflowsResponseData = await workflowsResponse.json();
        console.log('Workflows response data:', JSON.stringify(workflowsResponseData, null, 2));
        
        // Handle different response formats
        if (Array.isArray(workflowsResponseData)) {
          workflowsData = workflowsResponseData;
        } else if (workflowsResponseData.data && Array.isArray(workflowsResponseData.data)) {
          workflowsData = workflowsResponseData.data;
        } else if (workflowsResponseData.workflows && Array.isArray(workflowsResponseData.workflows)) {
          workflowsData = workflowsResponseData.workflows;
        } else {
          throw new Error('Unexpected workflows response format');
        }
        
        console.log(`Found ${workflowsData.length} workflows`);
      } else {
        console.log('Failed to fetch workflows, trying alternative endpoint...');
        
        // Try alternative workflow endpoint
        const altWorkflowsResponse = await fetch(`${baseUrl}/api/workflows`, {
          headers,
          method: 'GET'
        });
        
        if (altWorkflowsResponse.ok) {
          const altWorkflowsData = await altWorkflowsResponse.json();
          
          if (Array.isArray(altWorkflowsData)) {
            workflowsData = altWorkflowsData;
          } else if (altWorkflowsData.data && Array.isArray(altWorkflowsData.data)) {
            workflowsData = altWorkflowsData.data;
          } else {
            throw new Error('Alternative workflows endpoint also has unexpected format');
          }
          
          console.log(`Found ${workflowsData.length} workflows via alternative endpoint`);
        } else {
          throw new Error('Failed to fetch workflows from n8n');
        }
      }
    } catch (error) {
      throw new Error(`Error fetching workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Get executions
    let executionsData = [];
    try {
      console.log('Fetching executions from n8n...');
      const executionsResponse = await fetch(`${baseUrl}/api/v1/executions?limit=100`, {
        headers,
        method: 'GET'
      });
      
      console.log(`Executions response status: ${executionsResponse.status}`);
      
      if (executionsResponse.ok) {
        const executionsResponseData = await executionsResponse.json();
        console.log('Executions response data:', JSON.stringify(executionsResponseData, null, 2));
        
        // Handle different response formats
        if (Array.isArray(executionsResponseData)) {
          executionsData = executionsResponseData;
        } else if (executionsResponseData.data && Array.isArray(executionsResponseData.data)) {
          executionsData = executionsResponseData.data;
        } else if (executionsResponseData.executions && Array.isArray(executionsResponseData.executions)) {
          executionsData = executionsResponseData.executions;
        } else {
          throw new Error('Unexpected executions response format');
        }
        
        console.log(`Found ${executionsData.length} executions`);
      } else {
        console.log('Failed to fetch executions, trying alternative endpoint...');
        
        // Try alternative executions endpoint
        const altExecutionsResponse = await fetch(`${baseUrl}/api/executions?limit=100`, {
          headers,
          method: 'GET'
        });
        
        if (altExecutionsResponse.ok) {
          const altExecutionsData = await altExecutionsResponse.json();
          
          if (Array.isArray(altExecutionsData)) {
            executionsData = altExecutionsData;
          } else if (altExecutionsData.data && Array.isArray(altExecutionsData.data)) {
            executionsData = altExecutionsData.data;
          } else {
            throw new Error('Alternative executions endpoint also has unexpected format');
          }
          
          console.log(`Found ${executionsData.length} executions via alternative endpoint`);
        } else {
          throw new Error('Failed to fetch executions from n8n');
        }
      }
    } catch (error) {
      throw new Error(`Error fetching executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Calculate metrics from real data
    const totalWorkflows = workflowsData.length || 0;
    const activeWorkflows = workflowsData.filter((wf: any) => wf.active).length || 0;
    const totalExecutions = executionsData.length || 0;
    
    let successfulExecutions = 0;
    let failedExecutions = 0;
    let totalExecutionTime = 0;
    let executionCount = 0;

    if (executionsData.length > 0) {
      executionsData.forEach((exec: any) => {
        // Count all executions for total
        executionCount++;
        
        // Check for successful status (handle different possible status values)
        const status = exec.status?.toLowerCase() || '';
        if (status === 'success' || status === 'completed' || status === 'finished') {
          successfulExecutions++;
        } else if (status === 'error' || status === 'failed' || status === 'cancelled') {
          failedExecutions++;
        } else if (status === 'running' || status === 'waiting' || status === 'pending') {
          // Running executions - don't count as success or failure
        } else {
          // For unknown statuses, count as failed if there's an error, otherwise successful
          if (exec.error) {
            failedExecutions++;
          } else {
            successfulExecutions++;
          }
        }
        
        // Calculate duration if both timestamps exist
        if (exec.startedAt && exec.finishedAt) {
          const duration = new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime();
          totalExecutionTime += duration / 1000; // Convert to seconds
        }
      });
    }

    const averageExecutionTime = executionCount > 0 ? totalExecutionTime / executionCount : 0;
    const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

    // Get workflow details from real data
    const workflowDetails = workflowsData.map((wf: any) => ({
      id: wf.id,
      name: wf.name || 'Unnamed Workflow',
      active: wf.active,
      createdAt: wf.createdAt,
      updatedAt: wf.updatedAt,
      tags: wf.tags || [],
      description: wf.description || 'No description',
      folder: wf.folder || 'Uncategorized',
      category: getWorkflowCategory(wf.name, wf.tags || [])
    }));

    // Get recent executions with workflow names and folders from real data
    const recentExecutions = executionsData.slice(0, 10).map((exec: any) => {
      const workflow = workflowsData.find((wf: any) => wf.id === exec.workflowId);
      
      // Calculate duration properly - handle cases where finishedAt might not exist
      let duration = 0;
      let finishedAt = null;
      
      if (exec.startedAt) {
        if (exec.finishedAt) {
          // Execution has finished
          finishedAt = exec.finishedAt;
          duration = (new Date(exec.finishedAt).getTime() - new Date(exec.startedAt).getTime()) / 1000;
        } else {
          // Execution is still running or pending
          duration = 0;
        }
      }
      
      // Normalize status for better display
      let normalizedStatus = 'pending'; // Default to pending
      if (exec.status) {
        const statusLower = exec.status.toLowerCase();
        if (['success', 'completed', 'finished'].includes(statusLower)) {
          normalizedStatus = 'success';
        } else if (['error', 'failed', 'cancelled'].includes(statusLower)) {
          normalizedStatus = 'error';
        } else if (['running', 'active'].includes(statusLower)) {
          normalizedStatus = 'running';
        } else if (['pending', 'waiting'].includes(statusLower)) {
          normalizedStatus = 'pending';
        }
      }
      
      return {
        id: exec.id,
        workflowId: exec.workflowId,
        workflowName: workflow?.name || 'Unknown Workflow',
        folder: workflow?.folder || 'Uncategorized',
        category: workflow ? getWorkflowCategory(workflow.name, workflow.tags || []) : 'Other',
        status: normalizedStatus,
        startedAt: exec.startedAt,
        finishedAt: finishedAt,
        duration: duration,
        error: exec.error || undefined,
        data: exec.data || {},
        // Add additional metadata for better display
        createdAt: exec.createdAt || exec.startedAt,
        updatedAt: exec.updatedAt || exec.finishedAt
      };
    });

    const metrics = {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime: Math.round(averageExecutionTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      recentExecutions,
      workflowDetails,
      isRealData: true
    };

    console.log('Real n8n metrics:', metrics);
    return json(metrics);
  } catch (error) {
    console.error('Error fetching n8n metrics:', error);
    return json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch n8n data',
      isRealData: false 
    }, { status: 500 });
  }
}

function getWorkflowCategory(name: string, tags: any[]): string {
  const nameLower = name.toLowerCase();
  const tagsLower = tags.map(tag => {
    // Handle different tag formats
    if (typeof tag === 'string') {
      return tag.toLowerCase();
    } else if (tag && typeof tag === 'object' && 'name' in tag) {
      return (tag as any).name.toLowerCase();
    }
    return '';
  }).filter(tag => tag.length > 0);
  
  // Check for AI/ML related workflows
  if (nameLower.includes('ai') || nameLower.includes('agent') || nameLower.includes('rag') || 
      tagsLower.some(tag => tag.includes('ai') || tag.includes('agent') || tag.includes('rag'))) {
    return 'AI & Automation';
  }
  
  // Check for CRM related workflows
  if (nameLower.includes('crm') || nameLower.includes('lead') || nameLower.includes('customer') ||
      tagsLower.some(tag => tag.includes('crm') || tag.includes('lead') || tag.includes('customer'))) {
    return 'CRM & Sales';
  }
  
  // Check for marketing related workflows
  if (nameLower.includes('marketing') || nameLower.includes('email') || nameLower.includes('campaign') ||
      tagsLower.some(tag => tag.includes('marketing') || tag.includes('email') || tag.includes('campaign'))) {
    return 'Marketing';
  }
  
  // Check for data related workflows
  if (nameLower.includes('data') || nameLower.includes('migration') || nameLower.includes('sync') ||
      tagsLower.some(tag => tag.includes('data') || tag.includes('migration') || tag.includes('sync'))) {
    return 'Data Management';
  }
  
  // Check for billing/financial workflows
  if (nameLower.includes('billing') || nameLower.includes('invoice') || nameLower.includes('payment') ||
      tagsLower.some(tag => tag.includes('billing') || tag.includes('invoice') || tag.includes('payment'))) {
    return 'Billing & Finance';
  }
  
  // Check for personal assistant workflows
  if (nameLower.includes('personal') || nameLower.includes('assistant') || nameLower.includes('va') ||
      tagsLower.some(tag => tag.includes('personal') || tag.includes('assistant') || tag.includes('va'))) {
    return 'Personal Assistant';
  }
  
  // Check for base/template workflows
  if (nameLower.includes('base') || nameLower.includes('template') || nameLower.includes('setup') ||
      tagsLower.some(tag => tag.includes('base') || tag.includes('template') || tag.includes('setup'))) {
    return 'Base Templates';
  }
  
  // Check for development workflows
  if (nameLower.includes('dev') || nameLower.includes('development') || nameLower.includes('test') ||
      tagsLower.some(tag => tag.includes('dev') || tag.includes('development') || tag.includes('test'))) {
    return 'Development';
  }
  
  return 'Other';
} 