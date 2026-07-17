import { ZKConfigProvider } from '@midnight-ntwrk/midnight-js-types';
import type { ZKIR, ProverKey, VerifierKey } from '@midnight-ntwrk/midnight-js-types';

export class BrowserZkConfigProvider extends ZKConfigProvider<string> {
  private readonly basePath: string;

  constructor(basePath: string) {
    super();
    this.basePath = basePath;
  }

  async getZKIR(circuitId: string): Promise<ZKIR> {
    const config = await this.fetchConfig(`zkir/${circuitId}.zkir`);
    return config as any as ZKIR;
  }
  
  async getProverKey(circuitId: string): Promise<ProverKey> {
    const config = await this.fetchConfig(`keys/${circuitId}.prover`);
    return config as any as ProverKey;
  }
  
  async getVerifierKey(circuitId: string): Promise<VerifierKey> {
    const config = await this.fetchConfig(`keys/${circuitId}.verifier`);
    return config as any as VerifierKey;
  }

  private async fetchConfig(configName: string): Promise<Uint8Array> {
    const url = `${this.basePath}/${configName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ZK config from ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
