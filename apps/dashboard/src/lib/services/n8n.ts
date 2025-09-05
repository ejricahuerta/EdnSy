export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  executions: N8nExecution[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  workflowName?: string;
  folder?: string;
  category?: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  duration: number;
  error?: string;
  data: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface N8nMetrics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  errorRate: number;
  recentExecutions: N8nExecution[];
  workflowDetails?: Array<{
    id: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    description: string;
    folder: string;
    category: string;
  }>;
  isRealData?: boolean;
  error?: string;
}

class N8nService {
  async getMetrics(): Promise<N8nMetrics> {
    try {
      const response = await fetch('/api/n8n');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch n8n metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching n8n metrics:', error);
      throw new Error('Failed to fetch n8n metrics');
    }
  }

  async getWorkflowAnalytics(): Promise<{
    workflows: N8nWorkflow[];
    executionTrends: any[];
    performanceMetrics: any;
  }> {
    try {
      // Mock data for now
      return {
        workflows: [],
        executionTrends: [],
        performanceMetrics: {
          averageExecutionTime: 2.3,
          fastestExecution: 0.5,
          slowestExecution: 8.2,
          totalExecutionTime: 2875
        }
      };
    } catch (error) {
      console.error('Error fetching workflow analytics:', error);
      throw new Error('Failed to fetch workflow analytics');
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<{
    workflow: N8nWorkflow;
    recentExecutions: N8nExecution[];
    status: 'healthy' | 'warning' | 'error';
  }> {
    try {
      // Mock data for now
      return {
        workflow: {
          id: workflowId,
          name: 'Sample Workflow',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          executions: []
        },
        recentExecutions: [],
        status: 'healthy'
      };
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      throw new Error('Failed to fetch workflow status');
    }
  }
}

export const n8nService = new N8nService(); 