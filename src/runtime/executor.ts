/**
 * Skill Executor
 * Executes skills with SKILL.md instructions and bundled resources
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';
import type { Skill } from '../types.js';

const execAsync = promisify(exec);

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  stdout?: string;
  stderr?: string;
  error?: string;
  duration: number;
}

export interface ExecutionOptions {
  input?: unknown;
  json?: boolean;
  cwd?: string;
}

export class SkillExecutor {
  private skillPath: string;
  private skill: Skill;

  constructor(skillPath: string, skill: Skill) {
    this.skillPath = skillPath;
    this.skill = skill;
  }

  /**
   * Execute skill with given input
   */
  async execute(options: ExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Check if skill has implementation
      const indexPath = path.join(this.skillPath, 'index.js');
      if (!fs.existsSync(indexPath)) {
        // No implementation - this is an instructional-only skill
        return this.executeInstructionalSkill(options);
      }

      // Has implementation - execute it
      return await this.executeNativeSkill(options);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute skill with native implementation (index.js)
   */
  private async executeNativeSkill(options: ExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      // Load and execute the skill module
      const indexPath = path.join(this.skillPath, 'index.js');
      // FIX: Convert Windows absolute paths to file:// URLs for ESM loader
      const indexURL = pathToFileURL(indexPath).href;
      const skillModule = await import(indexURL);

      // Call the skill function
      const result = await skillModule.default(options.input || {}, {
        skillPath: this.skillPath,
        baseDir: this.skillPath,
        workingDir: options.cwd || process.cwd(),
        ...options,
      });

      return {
        success: true,
        output: result,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute instructional-only skill (no index.js)
   * Returns the instructions for the AI agent to follow
   */
  private executeInstructionalSkill(_options: ExecutionOptions): ExecutionResult {
    const startTime = Date.now();

    try {
      // Get skill instructions
      const instructions = this.getInstructions();

      // Get bundled resources
      const resources = this.getBundledResources();

      return {
        success: true,
        output: {
          mode: 'instructional',
          skill: this.skill.name,
          description: this.skill.description,
          instructions,
          resources,
          baseDir: this.skillPath,
          note: 'This is an instructional skill. Follow the instructions above to complete the task.',
        },
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get skill instructions from SKILL.md
   */
  private getInstructions(): string {
    const skillMdPath = path.join(this.skillPath, 'SKILL.md');

    if (fs.existsSync(skillMdPath)) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const parsed = matter(content);
      return parsed.content.trim();
    }

    return 'No instructions available';
  }

  /**
   * Get bundled resources (scripts, references, assets)
   */
  private getBundledResources(): {
    scripts: string[];
    references: string[];
    assets: string[];
  } {
    return {
      scripts: this.listFiles('scripts'),
      references: this.listFiles('references'),
      assets: this.listFiles('assets'),
    };
  }

  /**
   * List files in a subdirectory
   */
  private listFiles(subDir: string): string[] {
    const targetDir = path.join(this.skillPath, subDir);
    if (!fs.existsSync(targetDir)) return [];

    try {
      return fs.readdirSync(targetDir).map((file) => path.join(subDir, file));
    } catch {
      return [];
    }
  }

  /**
   * Execute a bundled script
   */
  async executeScript(
    scriptPath: string,
    args: string[] = [],
  ): Promise<{ stdout: string; stderr: string }> {
    const fullPath = path.join(this.skillPath, scriptPath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Script not found: ${scriptPath}`);
    }

    // Determine how to execute based on file extension
    const ext = path.extname(fullPath);
    let command: string;

    switch (ext) {
      case '.js':
        command = `node "${fullPath}" ${args.join(' ')}`;
        break;
      case '.py':
        command = `python "${fullPath}" ${args.join(' ')}`;
        break;
      case '.sh':
        command = `bash "${fullPath}" ${args.join(' ')}`;
        break;
      case '.ps1':
        command = `powershell -File "${fullPath}" ${args.join(' ')}`;
        break;
      default:
        throw new Error(`Unsupported script type: ${ext}`);
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: this.skillPath,
    });

    return { stdout, stderr };
  }
}

