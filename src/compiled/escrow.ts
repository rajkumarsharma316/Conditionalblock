// This is a mocked interface of the compiled Compact ZK circuit for the Escrow contract.
// In a real Midnight development workflow, running `compactc` will generate this file automatically
// containing the actual ZK proofs, state verifiers, and transaction bindings.

export type EscrowStatus =
  | 'pending'
  | 'locked'
  | 'ready'
  | 'released'
  | 'cancelled'
  | 'refunded';

export const Escrow = {
  Contract: 'MOCKED_ESCROW_ZK_CIRCUIT_BYTECODE' as any,
  ledger: (stateData: any) => {
    const status = stateData.status ?? 'locked';
    const isLocked = status === 'pending' || status === 'locked' || status === 'ready';

    return {
      depositor: stateData.depositor || '0x...',
      beneficiary: stateData.beneficiary || '0x...',
      amount: stateData.amount ?? 0n,
      deadline: stateData.deadline ?? 0n,
      requiredApprovals: stateData.requiredApprovals ?? 1,
      approvals: stateData.approvals ?? 0,
      status,
      createdAt: stateData.createdAt ?? 0n,
      releasedAt: stateData.releasedAt ?? 0n,
      isLocked,
    };
  },
};
