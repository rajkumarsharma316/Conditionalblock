export interface PaymentCondition {
  evaluate(): Promise<ConditionResult>;
}

export interface ConditionResult {
  satisfied: boolean;
  amount: bigint;
  timestamp: number;
}

export interface PaymentEngine {
  registerCondition(id: string, condition: PaymentCondition): void;
  evaluateCondition(conditionId: string): Promise<ConditionResult>;
  executePayment(conditionId: string, amount: bigint): Promise<boolean>;
  getExecutionHistory(): ConditionResult[];
  clearHistory(): void;
}

export interface MidnightPaymentConfig {
  network: string;
  contractAddress: string;
  gasLimit: bigint;
}
