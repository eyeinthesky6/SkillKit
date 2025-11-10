/**
 * Output Formatter
 * Format execution results for humans and AI agents
 */

import chalk from 'chalk';
import type { ExecutionResult } from './executor.js';

export class OutputFormatter {
  /**
   * Format execution result based on options
   */
  format(result: ExecutionResult, options: { json?: boolean } = {}): string {
    if (options.json) {
      return this.formatJSON(result);
    }

    return this.formatHuman(result);
  }

  /**
   * Format as JSON for AI consumption
   */
  private formatJSON(result: ExecutionResult): string {
    return JSON.stringify(
      {
        success: result.success,
        output: result.output,
        stdout: result.stdout,
        stderr: result.stderr,
        error: result.error,
        duration: result.duration,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  /**
   * Format for human readability
   */
  private formatHuman(result: ExecutionResult): string {
    const lines: string[] = [];

    // Header
    if (result.success) {
      lines.push(chalk.green('✔') + chalk.bold(' Skill executed successfully'));
    } else {
      lines.push(chalk.red('✖') + chalk.bold(' Skill execution failed'));
    }

    lines.push(chalk.gray(`Duration: ${result.duration}ms`));
    lines.push('');

    // Output
    if (result.output !== undefined && result.output !== null) {
      if (typeof result.output === 'object') {
        const outputObj = result.output as Record<string, unknown>;
        // Check if it's an instructional skill
        if (outputObj['mode'] === 'instructional') {
          lines.push(this.formatInstructionalOutput(outputObj));
        } else {
          lines.push(chalk.bold('Output:'));
          lines.push(this.formatObject(outputObj as Record<string, unknown> | unknown[]));
        }
      } else {
        lines.push(chalk.bold('Output:'));
        lines.push(String(result.output));
      }
      lines.push('');
    }

    // Stdout
    if (result.stdout) {
      lines.push(chalk.bold('Standard Output:'));
      lines.push(result.stdout);
      lines.push('');
    }

    // Stderr
    if (result.stderr) {
      lines.push(chalk.yellow.bold('Standard Error:'));
      lines.push(chalk.yellow(result.stderr));
      lines.push('');
    }

    // Error
    if (result.error) {
      lines.push(chalk.red.bold('Error:'));
      lines.push(chalk.red(result.error));
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format instructional skill output
   */
  private formatInstructionalOutput(output: Record<string, unknown>): string {
    const lines: string[] = [];

    const skillName = typeof output['skill'] === 'string' ? output['skill'] : 'Unknown';
    const description = typeof output['description'] === 'string' ? output['description'] : '';
    lines.push(chalk.cyan.bold(`📚 ${skillName} (Instructional Mode)`));
    lines.push('');
    lines.push(chalk.gray(description));
    lines.push('');

    // Instructions
    lines.push(chalk.bold('Instructions:'));
    lines.push('');
    const instructions = typeof output['instructions'] === 'string' ? output['instructions'] : '';
    lines.push(instructions);
    lines.push('');

    // Resources
    if (output['resources']) {
      const resources = output['resources'] as Record<string, unknown>;
      const scripts = (resources['scripts'] as unknown[]) || [];
      const references = (resources['references'] as unknown[]) || [];
      const assets = (resources['assets'] as unknown[]) || [];

      if (scripts.length > 0) {
        lines.push(chalk.bold('📜 Bundled Scripts:'));
        scripts.forEach((script: unknown) => {
          const scriptStr = typeof script === 'string' ? script : String(script);
          lines.push(chalk.cyan(`  • ${scriptStr}`));
        });
        lines.push('');
      }

      if (references.length > 0) {
        lines.push(chalk.bold('📖 References:'));
        references.forEach((ref: unknown) => {
          const refStr = typeof ref === 'string' ? ref : String(ref);
          lines.push(chalk.cyan(`  • ${refStr}`));
        });
        lines.push('');
      }

      if (assets.length > 0) {
        lines.push(chalk.bold('🎨 Assets:'));
        assets.forEach((asset: unknown) => {
          const assetStr = typeof asset === 'string' ? asset : String(asset);
          lines.push(chalk.cyan(`  • ${assetStr}`));
        });
        lines.push('');
      }
    }

    // Base directory
    const baseDir = typeof output['baseDir'] === 'string' ? output['baseDir'] : '';
    lines.push(chalk.gray(`Base directory: ${baseDir}`));
    lines.push('');

    // Note
    const note = typeof output['note'] === 'string' ? output['note'] : '';
    lines.push(chalk.yellow('⚠️  ' + note));

    return lines.join('\n');
  }

  /**
   * Format object for display
   */
  private formatObject(obj: Record<string, unknown> | unknown[], indent = 0): string {
    const lines: string[] = [];
    const prefix = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          lines.push(`${prefix}[${index}]:`);
          lines.push(this.formatObject(item as Record<string, unknown> | unknown[], indent + 1));
        } else {
          lines.push(`${prefix}[${index}]: ${this.formatValue(item)}`);
        }
      });
    } else {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          lines.push(`${prefix}${chalk.cyan(key)}:`);
          lines.push(this.formatObject(value as Record<string, unknown> | unknown[], indent + 1));
        } else {
          lines.push(`${prefix}${chalk.cyan(key)}: ${this.formatValue(value)}`);
        }
      }
    }

    return lines.join('\n');
  }

  /**
   * Format individual value
   */
  private formatValue(value: unknown): string {
    if (value === null) return chalk.gray('null');
    if (value === undefined) return chalk.gray('undefined');
    if (typeof value === 'string') return chalk.green(`"${value}"`);
    if (typeof value === 'number') return chalk.yellow(String(value));
    if (typeof value === 'boolean') return chalk.blue(String(value));
    return String(value);
  }

  /**
   * Format error message
   */
  formatError(error: Error | string): string {
    const message = error instanceof Error ? error.message : error;
    return chalk.red('✖') + chalk.bold(' Error: ') + chalk.red(message);
  }

  /**
   * Format success message
   */
  formatSuccess(message: string): string {
    return chalk.green('✔') + chalk.bold(' ' + message);
  }

  /**
   * Format info message
   */
  formatInfo(message: string): string {
    return chalk.blue('ℹ') + ' ' + message;
  }

  /**
   * Format warning message
   */
  formatWarning(message: string): string {
    return chalk.yellow('⚠') + ' ' + chalk.yellow(message);
  }
}

