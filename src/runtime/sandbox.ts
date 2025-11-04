import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { isMatch } from 'picomatch';
import type { Skill } from '../types';

/**
 * Sandbox events
 */
export enum SandboxEvent {
  FileRead = 'file:read',
  FileWrite = 'file:write',
  FileDelete = 'file:delete',
  CommandStart = 'command:start',
  CommandEnd = 'command:end',
  ResourceLimitExceeded = 'resource:limit',
  Error = 'error',
}

/**
 * Sandbox resource limits
 */
export interface ResourceLimits {
  /** Maximum CPU usage in milliseconds */
  maxCpuTime?: number;
  /** Maximum memory usage in bytes */
  maxMemory?: number;
  /** Maximum number of file descriptors */
  maxFileDescriptors?: number;
  /** Maximum number of child processes */
  maxChildProcesses?: number;
  /** Maximum stack size in bytes */
  maxStackSize?: number;
  /** Maximum output size in bytes */
  maxOutputSize?: number;
}

// Keep execAsync for future use
// const execAsync = promisify(exec);

/**
 * Options for the sandbox
 */
export interface SandboxOptions {
  /** Working directory */
  cwd?: string;
  /** Environment variables */
  env?: NodeJS.ProcessEnv;
  /** Whether to simulate file operations */
  dryRun?: boolean;
  /** Resource limits */
  limits?: ResourceLimits;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Callback for file operations */
  onFileOp?: (op: 'read' | 'write' | 'delete', path: string, content?: string) => void;
  /** Callback for command execution */
  onCommand?: (command: string, args: string[], cwd: string) => void;
  /** Callback for resource limit exceeded */
  onResourceLimit?: (limit: keyof ResourceLimits, value: number) => void;
}

/**
 * Result of a command execution
 */
export interface CommandResult {
  /** Exit code */
  exitCode: number | null;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Duration in milliseconds */
  duration: number;
}

/**
 * A sandboxed environment for running skills
 */
/**
 * Default resource limits
 */
const DEFAULT_RESOURCE_LIMITS: Required<ResourceLimits> = {
  maxCpuTime: 30 * 1000, // 30 seconds
  maxMemory: 256 * 1024 * 1024, // 256MB
  maxFileDescriptors: 1024,
  maxChildProcesses: 10,
  maxStackSize: 8 * 1024 * 1024, // 8MB
  maxOutputSize: 10 * 1024 * 1024, // 10MB
};

export function createSandbox(skill: Skill, options: SandboxOptions = {}): Sandbox {
  return new Sandbox(skill, options);
}

export class Sandbox extends EventEmitter {
  // ID is kept for future tracking (will be used for logging and debugging)
  // @ts-ignore - Unused but kept for future use
  private readonly id: string;
  private allowedReadPaths: string[] = [];
  private allowedWritePaths: string[] = [];
  private allowedCommands: Array<string | RegExp> = [];
  private readonly cwd: string;
  private readonly env: NodeJS.ProcessEnv;
  // dryRun will be used to simulate file operations without actual writes
  private readonly dryRun: boolean;
  private readonly limits: Required<ResourceLimits>;
  private readonly timeout: number;
  private readonly onFileOp: NonNullable<SandboxOptions['onFileOp']>;
  // onResourceLimit will be called when resource limits are exceeded
  // @ts-ignore - Unused but kept for future use
  private readonly onResourceLimit: NonNullable<SandboxOptions['onResourceLimit']>;
  private readonly activeProcesses: Set<number> = new Set();
  // startTime will be used for tracking execution duration
  // private readonly startTime: number = Date.now(); // Unused but kept for future use
  // memoryUsage will track memory consumption of the sandbox
  // private memoryUsage: number = 0; // Unused but kept for future use
  private outputSize: number = 0;
  private onCommand: NonNullable<SandboxOptions['onCommand']> = () => {};
  private fileOps: Array<{ type: 'read' | 'write' | 'delete'; path: string; content?: string }> =
    [];
  private commandHistory: Array<{
    command: string;
    args: string[];
    cwd: string;
    result?: CommandResult;
  }> = [];
  // timeoutId is used internally for cleanup
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Set up resource limits for the sandbox
   */
  private setProcessLimits(): void {
    try {
      // Set memory limit
      if (this.limits.maxMemory) {
        const maxOldSpaceSize = Math.floor(this.limits.maxMemory / (1024 * 1024));
        // Use bracket notation for NODE_OPTIONS to avoid TypeScript error
        this.env['NODE_OPTIONS'] = `--max-old-space-size=${maxOldSpaceSize}`;
      }

      // Set stack size limit
      if (this.limits.maxStackSize) {
        try {
          process.setuid?.(process.getuid?.() || 0);
          process.setgid?.(process.getgid?.() || 0);
          process.umask(0o077);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.emit(SandboxEvent.Error, new Error(`Failed to set process limits: ${errorMessage}`));
        }
      }

      // Set file descriptor limit (Unix-like systems only)
      if (this.limits.maxFileDescriptors && process.platform !== 'win32') {
        try {
          // This might require root privileges
          const result = execSync(`ulimit -n ${this.limits.maxFileDescriptors}`, {
            stdio: ['pipe', 'pipe', 'pipe'],
          });

          // Check for errors in stderr (which is actually in the result buffer)
          const stderr = result.toString();
          if (stderr && stderr.trim()) {
            throw new Error(stderr);
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.emit(
            SandboxEvent.Error,
            new Error(`Failed to set file descriptor limit: ${errorMessage}`),
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.emit(SandboxEvent.Error, new Error(`Failed to set process limits: ${errorMessage}`));
    }
  }

  /**
   * Set up execution timeout
   */
  private setupTimeout(): void {
    if (this.timeout > 0) {
      this.timeoutId = setTimeout(() => {
        this.emit(SandboxEvent.ResourceLimitExceeded, 'timeout', this.timeout);
        this.cleanup();
      }, this.timeout);
    }
  }

  /**
   * Terminate all active child processes
   */
  private terminateActiveProcesses(): void {
    this.activeProcesses.forEach((pid) => {
      try {
        if (pid) {
          process.kill(pid, 'SIGTERM');
        }
      } catch (error) {
        // Process might have already terminated
      }
    });
    this.activeProcesses.clear();
    
    // Clear any pending timeouts
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Normalize a path to ensure it's within the sandbox
   */
  /**
   * Normalize and validate a path within the sandbox
   * @param filePath Path to normalize
   * @returns Normalized absolute path
   * @throws {Error} If path is invalid or attempts to escape the sandbox
   */
  private normalizePath(filePath: string): string {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('Invalid path: Path must be a non-empty string');
    }

    // Resolve the path relative to the sandbox root
    const resolvedPath = path.resolve(this.cwd, filePath);
    
    // Convert both paths to the same format for comparison
    const normalizedCwd = path.normalize(this.cwd).replace(/\\/g, '/');
    const normalizedPath = path.normalize(resolvedPath).replace(/\\/g, '/');

    // Check for path traversal attempts
    if (!normalizedPath.startsWith(normalizedCwd)) {
      throw new Error(`Security violation: Path traversal attempt detected: ${filePath}`);
    }

    // Check for null bytes (potential injection)
    if (filePath.includes('\0')) {
      throw new Error('Security violation: Path contains null bytes');
    }

    // Check for control characters
    if (/[\x00-\x1F\x7F-\x9F]/.test(filePath)) {
      throw new Error('Security violation: Path contains control characters');
    }

    // Prevent symlink attacks by resolving the real path
    try {
      const realPath = fs.realpathSync(resolvedPath);
      if (!realPath.startsWith(this.cwd)) {
        throw new Error(`Security violation: Symlink attack detected: ${filePath}`);
      }
    } catch (error: unknown) {
      // Ignore if path doesn't exist (will be created)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        // Path doesn't exist, which is fine for our use case
        return resolvedPath;
      }
      // Re-throw other errors
      throw error;
    }

    return resolvedPath;
  }

  constructor(
    // @ts-ignore - skill is used for allowedPaths and allowedCommands initialization
    private readonly skill: Skill,
    options: SandboxOptions = {},
  ) {
    // Initialize parent class
    super();

    if (!skill) {
      throw new Error('Skill is required');
    }

    this.cwd = options.cwd ? path.resolve(options.cwd) : process.cwd();
    
    // Initialize environment variables
    this.env = {
      ...process.env,
      ...options.env,
      ['NODE_OPTIONS']: undefined,
      NODE_ENV: 'production',
      NODE_DEBUG: undefined,
      DEBUG: undefined,
    } as NodeJS.ProcessEnv;

    this.dryRun = options.dryRun || false;
    this.limits = { ...DEFAULT_RESOURCE_LIMITS, ...(options.limits || {}) };
    this.timeout = options.timeout || this.limits.maxCpuTime;
    this.onFileOp = options.onFileOp || (() => {});
    this.onResourceLimit = options.onResourceLimit || (() => {});
    this.id = uuidv4();

    // Normalize and validate paths
    this.cwd = path.normalize(this.cwd);

    // Ensure cwd exists and is a directory
    if (!fs.existsSync(this.cwd)) {
      fs.mkdirSync(this.cwd, { recursive: true, mode: 0o700 });
    } else if (!fs.statSync(this.cwd).isDirectory()) {
      throw new Error(`Path is not a directory: ${this.cwd}`);
    }

    // Set process limits
    this.setProcessLimits();

    // Cleanup on process exit
    process.once('exit', () => this.cleanup());

    // Set up timeout
    this.setupTimeout();

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      this.emit(SandboxEvent.Error, err);
    });

    // Initialize command handler if provided
    if (options.onCommand) {
      this.onCommand = options.onCommand;
    }

    // Normalize and set allowed paths
    this.allowedReadPaths = Array.isArray(skill.allowedPaths?.read) 
      ? skill.allowedPaths.read.map(p => path.resolve(this.cwd, p))
      : [];
    
    this.allowedWritePaths = Array.isArray(skill.allowedPaths?.write)
      ? skill.allowedPaths.write.map(p => path.resolve(this.cwd, p))
      : [];

    // Compile allowed command patterns
    this.allowedCommands = (skill.allowedCommands || [])
      .map((cmd) => {
        try {
          if (cmd.startsWith('/') && cmd.endsWith('/') && cmd.length > 2) {
            return new RegExp(cmd.slice(1, -1));
          }
          return cmd;
        } catch (error) {
          console.warn(`Invalid command pattern '${cmd}': ${error}`);
          return null;
        }
      })
      .filter(Boolean) as Array<string | RegExp>;
  }

  /**
   * Check if a command is allowed
   * @param command The command to check
   * @param args Command arguments
   * @returns true if the command is allowed, false otherwise
   */
  /**
   * Check if a command is allowed based on the sandbox's allowed commands
   * @param command The command to check
   * @param args Command arguments
   * @returns true if the command is allowed, false otherwise
   */
  private isCommandAllowed(command: string, args: string[] = []): boolean {
    if (!command || typeof command !== 'string') {
      return false;
    }

    // Sanitize command and arguments
    const sanitizedCommand = command.trim();
    const sanitizedArgs = args.map(arg => arg.trim()).filter(Boolean);
    const fullCommand = [sanitizedCommand, ...sanitizedArgs].join(' ');

    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /[;&|`$(){}[\]<>]/,
      /\$\{/,
      /\$\(/,
      /\|\s*\w+\s*=/,
      /\|\s*\w+\s*;/,
      /;\s*\w+\s*\|/,
      /\|\|/,
      /&&/,
      /\$\{/,
      /`/,
      /\(\s*\)/,
      /\$\{IFS\}/,
      /\$IFS/,
      /\$IFS/,
    ];

    if (dangerousPatterns.some(pattern => pattern.test(fullCommand))) {
      return false;
    }

    // Check against allowed commands
    return this.allowedCommands.some((pattern) => {
      try {
        if (typeof pattern === 'string') {
          // Exact match or prefix match with space
          return pattern === sanitizedCommand || 
                 (fullCommand.startsWith(pattern) && 
                  (fullCommand.length === pattern.length || 
                   fullCommand[pattern.length] === ' '));
        }
        return pattern.test(fullCommand);
      } catch (error) {
        this.emit(SandboxEvent.Error, new Error(`Error checking command pattern: ${error}`));
        return false;
      }
    });
  }

  /**
   * Check if a path is allowed for reading
   * @param filePath Path to check
   * @returns true if the path can be read, false otherwise
   */
  private isPathAllowedForRead(filePath: string): boolean {
    try {
      const normalizedPath = this.normalizePath(filePath);
      return this.allowedReadPaths.some((pattern) =>
        isMatch(normalizedPath, pattern, { dot: true })
      );
    } catch (error) {
      this.emit(SandboxEvent.Error, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Check if a path is allowed for writing
   * @param filePath Path to check
   * @returns true if the path can be written to, false otherwise
   */
  private isPathAllowedForWrite(filePath: string): boolean {
    try {
      const normalizedPath = this.normalizePath(filePath);
      return this.allowedWritePaths.some((pattern) =>
        isMatch(normalizedPath, pattern, { dot: true })
      );
    } catch (error) {
      this.emit(SandboxEvent.Error, error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Execute a command in the sandbox
   * @param command Command to execute
   * @param args Command arguments
   * @param options Execution options
   * @returns Command execution result
   */
  public async executeCommand(
    command: string,
    args: string[] = [],
    options: {
      cwd?: string;
      env?: NodeJS.ProcessEnv;
      input?: string;
      timeout?: number;
    } = {},
  ): Promise<CommandResult> {
    const startTime = Date.now();
    const commandStr = [command, ...args].join(' ');

    // Validate command
    if (!this.isCommandAllowed(command, args)) {
      throw new Error(`Command not allowed: ${commandStr}`);
    }

    // Set up execution options
    const cwd = options.cwd ? this.normalizePath(options.cwd) : this.cwd;
    const env = { ...this.env, ...options.env };
    const timeout = options.timeout || this.timeout;

    // Notify command start
    this.onCommand?.(command, args, cwd);
    this.emit(SandboxEvent.CommandStart, { command, args, cwd });

    // Execute command
    try {
      const child = spawn(command, args, {
        cwd,
        env,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: false,
        timeout, // Type assertion since we provide a default value
      });

      // Track child process
      if (child.pid != null) {
        this.activeProcesses.add(child.pid);
        child.on('exit', () => this.activeProcesses.delete(child.pid!));
      }

      // Handle input if provided
      if (options.input && child.stdin) {
        child.stdin.write(options.input);
        child.stdin.end();
      }

      // Collect output
      let stdout = '';
      let stderr = '';

      if (child.stdout) {
        for await (const chunk of child.stdout) {
          const chunkStr = chunk.toString();
          stdout += chunkStr;
          this.outputSize += Buffer.byteLength(chunkStr);

          // Check output size limit
          if (this.outputSize > this.limits.maxOutputSize) {
            child.kill('SIGTERM');
            throw new Error(
              `Output size limit exceeded: ${this.outputSize} > ${this.limits.maxOutputSize}`,
            );
          }
        }
      }

      if (child.stderr) {
        for await (const chunk of child.stderr) {
          const chunkStr = chunk.toString();
          stderr += chunkStr;
          this.outputSize += Buffer.byteLength(chunkStr);

          // Check output size limit
          if (this.outputSize > this.limits.maxOutputSize) {
            child.kill('SIGTERM');
            throw new Error(
              `Output size limit exceeded: ${this.outputSize} > ${this.limits.maxOutputSize}`,
            );
          }
        }
      }

      // Wait for process to exit
      const exitCode = await new Promise<number | null>((resolve) => {
        child.on('exit', (code) => {
          resolve(code);
        });
      });

      const duration = Date.now() - startTime;

      // Create result object
      const result: CommandResult = {
        exitCode,
        stdout,
        stderr,
        duration,
      };

      // Record command execution
      this.recordCommand(command, args, cwd, result);

      // Notify command end
      this.emit(SandboxEvent.CommandEnd, { command, args, cwd, result });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Create error result
      const result: CommandResult = {
        exitCode: null,
        stdout: '',
        stderr: errorMessage,
        duration,
      };

      // Record failed command
      this.recordCommand(command, args, cwd, result);

      // Notify error
      this.emit(SandboxEvent.Error, error);

      // This should never be reached, but TypeScript needs it
      throw new Error('Unexpected error in skill execution');
    }
  }

  /**
   * Get the list of file operations performed in this sandbox
   * @returns Array of file operations
   */
  public getFileOperations() {
    return [...this.fileOps];
  }

  /**
   * Get the command history for this sandbox
   * @returns Array of command history entries
   */
  public getCommandHistory() {
    return [...this.commandHistory];
  }

  /**
   * Read a file from the sandbox
   * @param filePath Path to the file to read
   * @param encoding File encoding (default: 'utf8')
   * @returns File content as string or Buffer if encoding is not specified
   */
  public readFile(filePath: string, encoding: BufferEncoding = 'utf8'): string | Buffer {
    const normalizedPath = this.normalizePath(filePath);
    if (!this.isPathAllowedForRead(normalizedPath)) {
      throw new Error(`Read access to ${normalizedPath} is not allowed`);
    }
    
    const content = fs.readFileSync(normalizedPath, { encoding });
    this.recordFileOp('read', normalizedPath, typeof content === 'string' ? content : undefined);
    return content;
  }

  /**
   * Write content to a file in the sandbox
   * @param filePath Path to the file to write
   * @param content Content to write to the file
   * @param encoding File encoding (default: 'utf8')
   */
  public writeFile(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): void {
    const normalizedPath = this.normalizePath(filePath);
    if (!this.isPathAllowedForWrite(normalizedPath)) {
      throw new Error(`Write access to ${normalizedPath} is not allowed`);
    }
    
    if (!this.dryRun) {
      fs.writeFileSync(normalizedPath, content, { encoding });
    }
    this.recordFileOp('write', normalizedPath, content);
  }

  /**
   * Delete a file or directory from the sandbox
   * @param filePath Path to the file or directory to delete
   */
  public deletePath(filePath: string): void {
    const normalizedPath = this.normalizePath(filePath);
    if (!this.isPathAllowedForWrite(normalizedPath)) {
      throw new Error(`Delete access to ${normalizedPath} is not allowed`);
    }
    
    if (!this.dryRun) {
      if (fs.existsSync(normalizedPath)) {
        fs.rmSync(normalizedPath, { recursive: true, force: true });
      }
    }
    this.recordFileOp('delete', normalizedPath);
  }

  /**
   * Record a file operation
   * @param type Type of file operation
   * @param filePath Path of the file
   * @param content Optional file content
   */
  private recordFileOp(type: 'read' | 'write' | 'delete', filePath: string, content?: string) {
    const op = { type, path: filePath, content };
    this.fileOps.push(op);
    this.onFileOp?.(type, filePath, content);
    this.emit(
      type === 'read'
        ? SandboxEvent.FileRead
        : type === 'write'
          ? SandboxEvent.FileWrite
          : SandboxEvent.FileDelete,
      op,
    );
  }
  
  /**
   * Clean up resources when the sandbox is no longer needed
   */
  private cleanup(): void {
    this.terminateActiveProcesses();
  }

  /**
   * Record a command execution
   * @param command The command that was executed
   * @param args Command arguments
   * @param cwd Current working directory
   * @param result Command execution result
   */
  private recordCommand(command: string, args: string[], cwd: string, result?: CommandResult) {
    const entry = { command, args, cwd, result };
    this.commandHistory.push(entry);
    this.emit(SandboxEvent.CommandEnd, entry);
  }

  /**
   * Create a new sandbox for a skill
   * @param skill The skill to run in the sandbox
   * @param options Sandbox options
   * @returns A new Sandbox instance
   */
  static create(skill: Skill, options: SandboxOptions = {}): Sandbox {
    return new Sandbox(skill, options);
  }
}
