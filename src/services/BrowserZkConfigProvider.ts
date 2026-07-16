import { ZKConfigProvider } from '@midnight-ntwrk/midnight-js-types';

export class BrowserZkConfigProvider extends ZKConfigProvider<string> {
  constructor(private readonly basePath: string) {
    super();
  }

  async getZKIR(circuitId: string): Promise<Uint8Array> {
    return this.fetchConfig(`zkir/${circuitId}.zkir`);
  }
  
  async getProverKey(circuitId: string): Promise<Uint8Array> {
    return this.fetchConfig(`keys/${circuitId}.pk`);
  }
  
  async getVerifierKey(circuitId: string): Promise<Uint8Array> {
    return this.fetchConfig(`keys/${circuitId}.vk`);
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
