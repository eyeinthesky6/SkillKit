import fs from 'fs';
import path from 'path';

import type { Skill, RunOptions, RunResult } from '../types';

import { AuditLogger, createAuditLog } from './audit';
import { Sandbox, createSandbox, CommandResult } from './sandbox';
import { createValidator } from './validator';

/**
 * Options for running a skill
 */
export interface RunnerOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: NodeJS.ProcessEnv;
  /** Whether to perform a dry run */
  dryRun?: boolean;
  /** Whether to generate an audit log */
  audit?: boolean;
  /** Whether to automatically apply changes */
  autoApply?: boolean;
  /** Custom audit logger */
  auditLogger?: AuditLogger;
  /** Maximum number of retries on validation failure */
  maxRetries?: number;
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Default runner options
 */
const DEFAULT_RUNNER_OPTIONS: Required<RunnerOptions> = {
  cwd: process.cwd(),
  env: {},
  dryRun: false,
  audit: true,
  autoApply: false,
  auditLogger: new AuditLogger(),
  maxRetries: 1,
  timeout: 30000, // 30 seconds
};

/**
 * Result of a skill execution
 */
export interface ExecutionResult<T = unknown> extends RunResult<T> {
  /** Audit log ID if audit was enabled */
  auditId?: string;
  /** File operations performed */
  fileOps: Array<{ type: 'read' | 'write' | 'delete'; path: string; content?: string }>;
  /** Commands executed */
  commands: Array<CommandResult & { command: string; args: string[]; cwd: string }>;
  /** Validation results */
  validations: Array<{
    type: 'input' | 'output' | 'path' | 'command';
    valid: boolean;
    message: string;
    details?: unknown;
  }>;
}

/**
 * Run a skill with the given input
 */
export async function runSkill<T = unknown>(
  skill: Skill,
  options: RunOptions & { skillPath?: string },
): Promise<ExecutionResult<T>> {
  const runnerOptions: RunnerOptions = {
    ...DEFAULT_RUNNER_OPTIONS,
    dryRun: options.dryRun,
    audit: options.audit,
    autoApply: options.autoApply,
  };

  const runner = new SkillRunner(runnerOptions);
  return runner.run(skill, options.input, { skillPath: options.skillPath });
}

/**
 * Skill runner that manages the execution of skills in a sandboxed environment
 */
export class SkillRunner {
  private sandbox: (Sandbox & { getSkill?: () => Skill; getLastInput?: () => unknown }) | null = null;
  private options: Required<RunnerOptions>;
  private validations: Array<{
    type: 'input' | 'output' | 'path' | 'command';
    valid: boolean;
    message: string;
    details?: unknown;
  }> = [];

  constructor(options: RunnerOptions = {}) {
    this.options = { ...DEFAULT_RUNNER_OPTIONS, ...options };
  }

  /**
   * Check for potentially dangerous skill permissions and warn user
   */
  private checkSecurityWarnings(skill: Skill): void {
    const warnings: string[] = [];
    
    // Check for broad file access
    const readPaths = skill.allowedPaths?.read || [];
    const writePaths = skill.allowedPaths?.write || [];
    
    const hasBroadRead = readPaths.some((p: string) => 
      p === '/' || p === '.' || p === './' || p === '**' || p.includes('/**')
    );
    const hasBroadWrite = writePaths.some((p: string) => 
      p === '/' || p === '.' || p === './' || p === '**' || p.includes('/**')
    );
    
    if (hasBroadRead) {
      warnings.push('⚠️  Skill has broad READ access to file system');
    }
    if (hasBroadWrite) {
      warnings.push('⚠️  Skill has broad WRITE access to file system');
    }
    
    // Check for unrestricted command access
    const allowedCommands = skill.allowedCommands || [];
    if (allowedCommands.length === 0 || allowedCommands.includes('*')) {
      warnings.push('⚠️  Skill can execute ANY command');
    }
    
    // Check for dangerous commands
    const dangerousCommands = ['rm', 'del', 'format', 'dd', 'mkfs', 'shutdown', 'reboot'];
    const hasDangerous = allowedCommands.some((cmd: string) => 
      dangerousCommands.some(d => cmd.toLowerCase().includes(d))
    );
    if (hasDangerous) {
      warnings.push('⚠️  Skill can execute DANGEROUS commands');
    }
    
    // Display warnings
    if (warnings.length > 0) {
      // Read version from package.json
      const packageJsonPath = path.join(__dirname, '../../package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const version = packageJson.version;

      console.warn('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn(`🚨 SECURITY WARNINGS - SkillKit v${version}`);
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.warn(`\nSkill: ${skill.name}`);
      warnings.forEach(w => console.warn(w));
      console.warn(`\n⚠️  SkillKit v${version} has known security limitations:`);
      console.warn('   • Resource limits NOT enforced');
      console.warn('   • Path validation has bypass opportunities');
      console.warn('   • Command execution not fully sandboxed');
      console.warn('\n✅ Only run skills from TRUSTED sources');
      console.warn('❌ DO NOT run untrusted skills in production');
      console.warn('\n📖 See SECURITY.md for details\n');
      console.warn('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }
  }

  /**
   * Run a skill with the given input
   */
  async run<T = unknown>(
    skill: Skill,
    input: unknown,
    context: { skillPath?: string } = {},
  ): Promise<ExecutionResult<T>> {
    const startTime = Date.now();
    const { dryRun, audit, autoApply, maxRetries } = this.options;
    const applied = autoApply || !dryRun;

    // Security warning for broad permissions
    this.checkSecurityWarnings(skill);

    // Create a new sandbox for this execution
    this.sandbox = createSandbox(skill, {
      cwd: this.options.cwd,
      env: this.options.env,
      dryRun: this.options.dryRun,
      onFileOp: this.handleFileOp.bind(this),
      onCommand: this.handleCommand.bind(this),
    });

    // Initialize the validator
    const validator = createValidator(skill);

    // Validate input
    const inputValidation = validator.validateInput(input);
    if (!inputValidation.success) {
      this.recordValidation('input', false, 'Input validation failed', inputValidation.details);
      return this.createErrorResult('Input validation failed', inputValidation.error, startTime, {
        applied,
        audit,
      }) as ExecutionResult<T>;
    }
    this.recordValidation('input', true, 'Input is valid');

    // Execute the skill with retries
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt <= maxRetries) {
      try {
        // Execute the skill's main function
        const skillModule = await this.loadSkillModule(skill, context.skillPath);
        const output = await skillModule.default(input, this.sandbox, {
          cwd: this.options.cwd,
          env: this.options.env,
          dryRun,
        });

        // Validate output
        const outputValidation = validator.validateOutput(output);
        if (!outputValidation.success) {
          this.recordValidation(
            'output',
            false,
            'Output validation failed',
            outputValidation.details,
          );

          if (attempt < maxRetries) {
            attempt++;
            continue; // Retry on validation failure
          }

          return this.createErrorResult(
            'Output validation failed after maximum retries',
            outputValidation.error,
            startTime,
            { applied, audit, output },
          ) as ExecutionResult<T>;
        }

        this.recordValidation('output', true, 'Output is valid');

        // Create success result
        const result: ExecutionResult<T> = {
          success: true,
          output: output as T,
          auditId: undefined,
          fileOps: this.sandbox?.getFileOperations() || [],
          commands: (this.sandbox?.getCommandHistory() || []).map((cmd) => ({
            ...(cmd.result || { exitCode: null, stdout: '', stderr: '', duration: 0 }),
            command: cmd.command,
            args: cmd.args,
            cwd: cmd.cwd,
          })),
          validations: [...this.validations],
          duration: Date.now() - startTime,
          dryRun,
        };

        // Create audit log if enabled
        if (audit) {
          const auditLog = createAuditLog(skill, {
            input,
            output,
            dryRun,
            applied,
            duration: result.duration,
            fileOps: result.fileOps,
            commands: result.commands,
            validations: result.validations,
          });

          await this.options.auditLogger.log(auditLog);
          result.auditId = auditLog.id;
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          attempt++;
          continue; // Retry on error
        }

        return this.createErrorResult(
          'Skill execution failed after maximum retries',
          lastError,
          startTime,
          { applied, audit },
        ) as ExecutionResult<T>;
      }
    }

    // This should never be reached, but TypeScript needs it
    throw new Error('Unexpected error in skill execution');
  }

  /**
   * Load a skill module
   */
  private async loadSkillModule(
    skill: Skill,
    skillPath?: string,
  ): Promise<{ default: SkillFunction }> {
    const modulePath = skillPath
      ? path.resolve(skillPath, 'index.js')
      : skill.sourcePath
        ? path.join(skill.sourcePath, 'index.js')
        : null;

    if (!modulePath || !fs.existsSync(modulePath)) {
      throw new Error(`Could not find skill module for '${skill.name}'`);
    }

    try {
      // Use dynamic import to load the module
      const module = await import(modulePath);

      if (typeof module.default !== 'function') {
        throw new Error('Skill module must export a default function');
      }

      return module as { default: SkillFunction };
    } catch (error) {
      throw new Error(`Failed to load skill module: ${error}`);
    }
  }

  /**
   * Handle a file operation
   */
  private handleFileOp(
    type: 'read' | 'write' | 'delete',
    filePath: string,
    content?: string,
  ): void {
    // We could add additional logging or validation here
    console.debug(`[${type}] ${filePath}`, content ? `(${content.length} bytes)` : '');
  }

  /**
   * Handle a command execution
   */
  private handleCommand(command: string, args: string[], cwd: string): void {
    console.debug(`[exec] ${command} ${args.join(' ')} (in ${cwd})`);
  }

  /**
   * Record a validation result
   */
  private recordValidation(
    type: 'input' | 'output' | 'path' | 'command',
    valid: boolean,
    message: string,
    details?: unknown,
  ): void {
    this.validations.push({ type, valid, message, details });
  }

  /**
   * Create an error result
   */
  private createErrorResult(
    _message: string,
    error: Error | string | undefined,
    startTime: number,
    {
      applied = false,
      audit = false,
      output,
    }: { applied?: boolean; audit?: boolean; output?: unknown } = {},
  ): ExecutionResult<unknown> {
    const errorMessage = error instanceof Error ? error.message : error || 'Unknown error';
    const duration = Date.now() - startTime;
    const fileOps = this.sandbox?.getFileOperations() || [];
    const commands = (this.sandbox?.getCommandHistory() || []).map((cmd) => ({
      ...(cmd.result || { exitCode: null, stdout: '', stderr: '', duration: 0 }),
      command: cmd.command,
      args: cmd.args,
      cwd: cmd.cwd,
    }));

    const result: ExecutionResult<unknown> = {
      success: false,
      error: errorMessage,
      output,
      duration,
      dryRun: this.options.dryRun,
      fileOps,
      commands,
      validations: [...this.validations],
    };

    // Create audit log if enabled and we have a sandbox
    if (audit && this.sandbox) {
      try {
        // Get the skill from the sandbox or create a minimal valid skill
        const skill: Skill = this.sandbox.getSkill?.() || {
          name: 'unknown',
          version: '0.0.0',
          description: 'Unknown skill',
          tags: [],
          inputs: { type: 'object', properties: {} },
          outputs: { type: 'object', properties: {} },
          allowedPaths: {
            read: [],
            write: [],
          },
          allowedCommands: [],
          steps: ['Unknown skill execution'],
          retries: 0,
          dryRunSupported: true,
          dependencies: [],
        };

        const auditLog = createAuditLog(skill, {
          input: this.sandbox.getLastInput?.() || {},
          output,
          error: errorMessage,
          dryRun: this.options.dryRun,
          applied,
          duration,
          fileOps,
          commands,
          validations: this.validations,
        });

        this.options.auditLogger.log(auditLog).catch(console.error);
        result.auditId = auditLog.id;
      } catch (logError) {
        console.error('Failed to create audit log:', logError);
      }
    }

    return result;
  }
}

/**
 * Type for the default export of a skill module
 */
export type SkillFunction<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  sandbox: Sandbox,
  context: {
    cwd: string;
    env: NodeJS.ProcessEnv;
    dryRun: boolean;
  },
) => Promise<TOutput> | TOutput;
