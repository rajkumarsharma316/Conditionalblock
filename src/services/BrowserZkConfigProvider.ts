import { ZkConfigProvider } from '@midnight-ntwrk/midnight-js-types';

export class BrowserZkConfigProvider implements ZkConfigProvider {
  constructor(private readonly basePath: string) {}

  async getZkConfig(configName: string): Promise<Uint8Array> {
    const url = `${this.basePath}/${configName}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ZK config from ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
