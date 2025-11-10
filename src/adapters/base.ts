import { exec } from 'child_process';
import { promisify } from 'util';

import { AdapterCommandResult } from './types';

const execAsync = promisify(exec);

/**
 * Base adapter with common utility methods
 */
export abstract class BaseAdapter {
  protected projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Execute a shell command
   * @param command - Command to execute
   * @param options - Execution options
   * @returns Command result
   */
  protected async executeCommand(
    command: string,
    options: { cwd?: string; timeout?: number } = {}
  ): Promise<AdapterCommandResult> {
    const startTime = Date.now();
    const cwd = options.cwd || this.projectRoot;

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout: options.timeout || 60000, // 60s default
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });

      return {
        exitCode: 0,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        duration: Date.now() - startTime,
        success: true,
      };
    } catch (error: unknown) {
      const err = error as { code?: number; stdout?: Buffer; stderr?: Buffer; message?: string };
      return {
        exitCode: err.code || 1,
        stdout: err.stdout?.toString().trim() || '',
        stderr: err.stderr?.toString().trim() || err.message || '',
        duration: Date.now() - startTime,
        success: false,
      };
    }
  }

  /**
   * Check if a file exists
   */
  protected async fileExists(filePath: string): Promise<boolean> {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Read a file
   */
  protected async readFile(filePath: string): Promise<string> {
    const fs = await import('fs');
    const path = await import('path');
    const fullPath = path.join(this.projectRoot, filePath);
    return fs.readFileSync(fullPath, 'utf8');
  }

  /**
   * Find files matching a pattern using grep
   */
  protected async findFiles(pattern: string, extensions: string[]): Promise<string[]> {
    const extPattern = extensions.length === 1 
      ? `*.${extensions[0]}`
      : `*.{${extensions.join(',')}}`;
    
    // Use find command (cross-platform)
    const command = process.platform === 'win32'
      ? `powershell -Command "Get-ChildItem -Recurse -Include ${extPattern} | Select-String -Pattern '${pattern}' | Select-Object -ExpandProperty Path -Unique"`
      : `grep -r "${pattern}" --include="${extPattern}" . || true`;

    const result = await this.executeCommand(command);
    
    if (!result.stdout) return [];
    
    return result.stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => line.trim());
  }
}

