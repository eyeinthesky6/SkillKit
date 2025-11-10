/**
 * Framework Adapter System
 * 
 * Provides abstraction for language/framework-specific commands.
 * This enables workflows to work across TypeScript, Python, Java, etc.
 */

export * from './types';
export * from './base';
export * from './registry';
export * from './typescript';

// Re-export default registry
export { defaultAdapterRegistry as adapterRegistry } from './registry';

