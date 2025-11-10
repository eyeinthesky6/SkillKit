import { JSONSchema7 } from 'json-schema';
import { z } from 'zod';

/**
 * Represents a skill that can be executed by the runtime
 */
export interface Skill {
  /** Unique identifier (kebab-case) */
  name: string;
  /** Semantic version */
  version: string;
  /** Short description of what the skill does */
  description: string;
  /** Tags for categorization and filtering */
  tags: string[];
  /** Input schema in JSON Schema format */
  inputs: JSONSchema7;
  /** Output schema in JSON Schema format */
  outputs: JSONSchema7;
  /** Allowed file system paths (minimatch patterns) */
  allowedPaths: {
    read: string[];
    write: string[];
  };
  /** Allowed shell commands (exact matches or safe regex patterns) */
  allowedCommands: string[];
  /** Step-by-step description of what the skill does */
  steps: string[];
  /** Number of retries on failure */
  retries: number;
  /** Whether the skill supports dry-run mode */
  dryRunSupported: boolean;
  /** Dependencies on other skills */
  dependencies: string[];
  /** Optional path to the skill's source directory */
  sourcePath?: string;
  /** Markdown instructions (for SKILL.md format, instructional/hybrid modes) */
  instructions?: string;
}

/** Registry of available skills */
export interface SkillRegistry {
  /** Get a skill by name */
  get(name: string): Skill | undefined;
  /** List all available skills */
  list(): Skill[];
  /** Add a skill to the registry */
  add(skill: Skill): void;
  /** Remove a skill from the registry */
  remove(name: string): void;
  /** Check if a skill exists */
  has(name: string): boolean;
}

/** Plan for executing a skill */
export interface Plan {
  /** Selected skill */
  skill: string;
  /** Reason for selection */
  why: string;
  /** Expected output schema */
  expectedOutputs: JSONSchema7;
  /** Confidence score (0-1) */
  confidence: number;
  /** Any warnings or notes */
  warnings?: string[];
}

/** Options for running a skill */
export interface RunOptions {
  /** Input data for the skill */
  input: unknown;
  /** Whether to perform a dry run */
  dryRun?: boolean;
  /** Whether to generate an audit log */
  audit?: boolean;
  /** Whether to automatically apply changes */
  autoApply?: boolean;
  /** Additional context for the run */
  context?: Record<string, unknown>;
}

/** Result of running a skill */
export interface RunResult<T = unknown> {
  /** Whether the run was successful */
  success: boolean;
  /** Output data (if successful) */
  output?: T;
  /** Error message (if failed) */
  error?: string;
  /** Path to the audit log (if audit was enabled) */
  auditPath?: string;
  /** Duration in milliseconds */
  duration: number;
  /** Whether this was a dry run */
  dryRun: boolean;
}

/** Audit log entry */
export interface AuditLog {
  /** Unique identifier */
  id: string;
  /** Timestamp in ISO format */
  timestamp: string;
  /** Skill that was executed */
  skill: string;
  /** Version of the skill */
  version: string;
  /** Input data */
  input: unknown;
  /** Output data (if successful) */
  output?: unknown;
  /** Error (if failed) */
  error?: string;
  /** Whether this was a dry run */
  dryRun: boolean;
  /** Whether changes were applied */
  applied: boolean;
  /** Duration in milliseconds */
  duration: number;
  /** Environment information */
  environment: {
    node: string;
    os: string;
    arch: string;
    cwd: string;
  };
  /** File operations performed */
  fileOps: Array<{
    type: 'read' | 'write' | 'delete';
    path: string;
    content?: string;
  }>;
  /** Commands executed */
  commands: Array<{
    command: string;
    args: string[];
    cwd: string;
    exitCode: number | null;
    stdout: string;
    stderr: string;
    duration: number;
  }>;
  /** Validation results */
  validations: Array<{
    type: 'input' | 'output' | 'path' | 'command';
    valid: boolean;
    message: string;
    details?: unknown;
  }>;
}

/** Schema for skill metadata (YAML frontmatter) */
export const skillMetadataSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Must be kebab-case'),
  version: z.string().min(1),
  description: z.string().min(10).max(200),
  tags: z.array(z.string().min(1)).min(1),
  inputs: z.union([z.record(z.any()), z.string()]),
  outputs: z.union([z.record(z.any()), z.string()]),
  allowedPaths: z.object({
    read: z.array(z.string().min(1)).default([]),
    write: z.array(z.string().min(1)).default([]),
  }),
  allowedCommands: z.array(z.string().min(1)).default([]),
  steps: z.array(z.string().min(10)).min(1).max(10),
  retries: z.number().int().min(0).max(3).default(1),
  dryRunSupported: z.boolean().default(true),
  dependencies: z.array(z.string().min(1)).default([]),
});

export type SkillMetadata = z.infer<typeof skillMetadataSchema>;
