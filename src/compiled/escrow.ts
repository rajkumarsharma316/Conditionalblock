// This is a mocked interface of the compiled Compact ZK circuit for the Escrow contract.
// In a real Midnight development workflow, running `compactc` will generate this file automatically
// containing the actual ZK proofs, state verifiers, and transaction bindings.

export const Escrow = {
  Contract: 'MOCKED_ESCROW_ZK_CIRCUIT_BYTECODE' as any,
  ledger: (stateData: any) => {
    return {
      depositor: stateData.depositor || '0x...',
      beneficiary: stateData.beneficiary || '0x...',
      amount: stateData.amount || 0n,
      isLocked: stateData.isLocked ?? true,
    };
  }
};
