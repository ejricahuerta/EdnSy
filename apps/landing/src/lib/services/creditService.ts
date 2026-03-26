export type ServiceInfo = {
  training_cost: number;
  response_cost: number;
  action_cost: number;
};

/**
 * Minimal stub used by `DemoCard` to keep the landing app typecheckable.
 * Demo pages were removed from the landing app, so this can be replaced with
 * the real implementation later.
 */
export const CreditService = {
  async getServiceInfo(_demoId: string): Promise<ServiceInfo> {
    return {
      training_cost: 0,
      response_cost: 0,
      action_cost: 0,
    };
  },
};

