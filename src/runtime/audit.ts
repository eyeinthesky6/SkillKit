import fs from 'fs';
import path from 'path';

import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { AuditLog, Skill } from '../types';

/**
 * Options for audit logging
 */
export interface AuditOptions {
  /** Directory to store audit logs */
  logDir?: string;
  /** Whether to enable audit logging */
  enabled?: boolean;
  /** Custom logger function */
  logger?: (log: AuditLog) => void | Promise<void>;
  /** Whether to pretty-print JSON logs */
  pretty?: boolean;
}

/**
 * Default audit options
 */
const DEFAULT_AUDIT_OPTIONS: Required<AuditOptions> = {
  logDir: path.join(process.cwd(), 'logs', 'audit'),
  enabled: true,
  logger: defaultLogger,
  pretty: process.env['NODE_ENV'] !== 'production',
};

/**
 * Default logger that writes to files
 */
async function defaultLogger(log: AuditLog): Promise<void> {
  const options = { ...DEFAULT_AUDIT_OPTIONS };
  const logDir = options.logDir || path.join(process.cwd(), 'logs', 'audit');
  const timestamp = format(new Date(log.timestamp), 'yyyy-MM-dd');
  const logFile = path.join(logDir, `${timestamp}.jsonl`);

  // Ensure log directory exists
  await fs.promises.mkdir(path.dirname(logFile), { recursive: true });

  // Append to log file
  await fs.promises.appendFile(
    logFile,
    `${JSON.stringify(log, null, options.pretty ? 2 : undefined)}\n`,
    'utf8',
  );
}

/**
 * Create an audit log entry
 */
export function createAuditLog(
  skill: Skill,
  options: {
    input?: unknown;
    output?: unknown;
    error?: Error | string;
    dryRun?: boolean;
    applied?: boolean;
    duration: number;
    fileOps?: Array<{ type: 'read' | 'write' | 'delete'; path: string; content?: string }>;
    commands?: Array<{
      command: string;
      args: string[];
      cwd: string;
      exitCode: number | null;
      stdout: string;
      stderr: string;
      duration: number;
    }>;
    validations?: Array<{
      type: 'input' | 'output' | 'path' | 'command';
      valid: boolean;
      message: string;
      details?: unknown;
    }>;
  },
): AuditLog {
  const {
    input,
    output,
    error,
    dryRun = false,
    applied = false,
    duration,
    fileOps = [],
    commands = [],
    validations = [],
  } = options;

  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : error;

  return {
    id: uuidv4(),
    timestamp,
    skill: skill.name,
    version: skill.version,
    input,
    output: !error ? output : undefined,
    error: errorMessage,
    dryRun,
    applied,
    duration,
    environment: {
      node: process.version,
      os: process.platform,
      arch: process.arch,
      cwd: process.cwd(),
    },
    fileOps: fileOps.map((op) => ({
      type: op.type,
      path: path.relative(process.cwd(), op.path) || '.',
      content: op.content ? truncate(op.content, 1000) : undefined,
    })),
    commands: commands.map((cmd) => ({
      ...cmd,
      cwd: path.relative(process.cwd(), cmd.cwd) || '.',
      stdout: truncate(cmd.stdout, 1000),
      stderr: truncate(cmd.stderr, 1000),
    })),
    validations,
  };
}

/**
 * Truncate a string to a maximum length
 */
function truncate(str: string, maxLength: number): string {
  if (typeof str !== 'string') return String(str);
  return str.length <= maxLength ? str : `${str.substring(0, maxLength)}... [truncated]`;
}

/**
 * Audit logger for tracking skill executions
 */
export class AuditLogger {
  private options: Required<AuditOptions>;
  private logs: AuditLog[] = [];

  constructor(options: AuditOptions = {}) {
    this.options = { ...DEFAULT_AUDIT_OPTIONS, ...options };
  }

  /**
   * Log an audit entry
   */
  async log(entry: AuditLog): Promise<void> {
    if (!this.options.enabled) return;

    this.logs.push(entry);

    try {
      if (this.options.logger) {
        await Promise.resolve(this.options.logger(entry));
      }
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }

  /**
   * Get all logged entries
   */
  getLogs(): AuditLog[] {
    return [...this.logs];
  }

  /**
   * Clear all in-memory logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Create a new audit log entry
   */
  async createLog(skill: Skill, options: Parameters<typeof createAuditLog>[1]): Promise<AuditLog> {
    const log = createAuditLog(skill, options);
    await this.log(log);
    return log;
  }
}

/**
 * Create a new audit logger
 */
export function createAuditLogger(options: AuditOptions = {}): AuditLogger {
  return new AuditLogger(options);
}

/**
 * Default audit logger instance
 */
const defaultAuditLogger = createAuditLogger();

export default defaultAuditLogger;
