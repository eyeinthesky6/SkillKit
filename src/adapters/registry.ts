import { AdapterRegistry, FrameworkAdapter } from './types';

/**
 * In-memory adapter registry
 */
export class InMemoryAdapterRegistry implements AdapterRegistry {
  private adapters: Map<string, FrameworkAdapter> = new Map();

  register(adapter: FrameworkAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  get(name: string): FrameworkAdapter | undefined {
    return this.adapters.get(name);
  }

  list(): FrameworkAdapter[] {
    return Array.from(this.adapters.values());
  }

  async detect(projectRoot: string): Promise<FrameworkAdapter | undefined> {
    // Try each adapter's detect method
    for (const adapter of this.adapters.values()) {
      try {
        if (await adapter.detect(projectRoot)) {
          return adapter;
        }
      } catch {
        // Continue to next adapter
        continue;
      }
    }
    
    return undefined;
  }
}

/**
 * Default adapter registry instance
 */
export const defaultAdapterRegistry = new InMemoryAdapterRegistry();

