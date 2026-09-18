import type { PaymentCondition, PaymentEngine, ConditionResult } from './types';

export class ConditionalPaymentEngine implements PaymentEngine {
  private conditions: Map<string, PaymentCondition> = new Map();
  private executionHistory: ConditionResult[] = [];

  registerCondition(id: string, condition: PaymentCondition): void {
    this.conditions.set(id, condition);
  }

  async evaluateCondition(conditionId: string): Promise<ConditionResult> {
    const condition = this.conditions.get(conditionId);
    if (!condition) {
      throw new Error(`Condition ${conditionId} not found`);
    }

    const result = await condition.evaluate();
    this.executionHistory.push(result);
    return result;
  }

  async executePayment(conditionId: string, amount: bigint): Promise<boolean> {
    const result = await this.evaluateCondition(conditionId);
    return result.satisfied && result.amount >= amount;
  }

  getExecutionHistory(): ConditionResult[] {
    return [...this.executionHistory];
  }

  clearHistory(): void {
    this.executionHistory = [];
  }
}
