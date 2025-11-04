/**
 * Default configuration values for the SkillKit
 */

export const DEFAULT_SKILL_CONFIG = {
  // Default allowed file operations (empty array means no access)
  allowedPaths: {
    read: [],
    write: [],
  },
  
  // Default allowed commands (empty array means no commands allowed)
  allowedCommands: [],
  
  // Default resource limits
  resourceLimits: {
    maxCpuTime: 30 * 1000, // 30 seconds
    maxMemory: 256 * 1024 * 1024, // 256MB
    maxFileDescriptors: 1024,
    maxChildProcesses: 10,
    maxStackSize: 8 * 1024 * 1024, // 8MB
    maxOutputSize: 10 * 1024 * 1024, // 10MB
  },
  
  // Default timeout for operations
  timeout: 30 * 1000, // 30 seconds
  
  // Default retry settings
  retries: 3,
  retryDelay: 1000, // 1 second
  
  // Default environment variables
  env: {
    NODE_ENV: 'production',
  },
  
  // Default logging settings
  logging: {
    level: 'info',
    format: 'json',
  },
} as const;

/**
 * Default skill metadata schema
 */
export const DEFAULT_SKILL_SCHEMA = {
  name: '',
  version: '0.1.0',
  description: '',
  tags: [],
  inputs: {
    type: 'object',
    properties: {},
    required: [],
  },
  outputs: {
    type: 'object',
    properties: {},
    required: [],
  },
  allowedPaths: {
    read: [],
    write: [],
  },
  allowedCommands: [],
  steps: [],
  retries: 3,
  dryRunSupported: true,
  dependencies: [],
} as const;

/**
 * Default sandbox options
 */
export const DEFAULT_SANDBOX_OPTIONS = {
  cwd: process.cwd(),
  env: {},
  dryRun: false,
  timeout: 30 * 1000, // 30 seconds
} as const;
