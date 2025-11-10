/**
 * Enhanced error class with actionable suggestions
 * Based on Rust's error message philosophy: explain what, why, and how to fix
 */

export interface ErrorSuggestion {
  title: string;
  command?: string;
  description?: string;
}

export class SkillKitError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly suggestions: ErrorSuggestion[] = [],
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'SkillKitError';
    Error.captureStackTrace?.(this, SkillKitError);
  }

  /**
   * Format error with helpful context and suggestions
   */
  format(): string {
    const lines: string[] = [];
    
    lines.push(`\n❌ ${this.message}`);
    
    if (this.code) {
      lines.push(`   Error Code: ${this.code}`);
    }
    
    if (this.context && Object.keys(this.context).length > 0) {
      lines.push('\n📋 Context:');
      for (const [key, value] of Object.entries(this.context)) {
        lines.push(`   ${key}: ${JSON.stringify(value)}`);
      }
    }
    
    if (this.suggestions.length > 0) {
      lines.push('\n💡 Suggestions:');
      this.suggestions.forEach((suggestion, index) => {
        lines.push(`   ${index + 1}. ${suggestion.title}`);
        if (suggestion.command) {
          lines.push(`      $ ${suggestion.command}`);
        }
        if (suggestion.description) {
          lines.push(`      ${suggestion.description}`);
        }
      });
    }
    
    return lines.join('\n') + '\n';
  }
}

/**
 * Pre-defined error creators for common scenarios
 */
export class ErrorFactory {
  static skillNotFound(nameOrPath: string, searchedPaths: string[]): SkillKitError {
    return new SkillKitError(
      `Skill not found: ${nameOrPath}`,
      'SKILL_NOT_FOUND',
      [
        {
          title: 'Create a new skill',
          command: 'tsk gen-skill my-skill',
          description: 'Generates a new skill scaffold in the current directory',
        },
        {
          title: 'List available skills',
          command: 'tsk list-skills',
          description: 'Shows all discoverable skills',
        },
        {
          title: 'Check your path',
          description: 'Skills should be in current directory or examples/skills/',
        },
      ],
      { searchedPaths },
    );
  }

  static noSkillMetadata(directory: string): SkillKitError {
    return new SkillKitError(
      'No skill metadata found',
      'MISSING_SKILL_METADATA',
      [
        {
          title: 'Generate a new skill',
          command: 'tsk gen-skill my-skill',
          description: 'Creates SKILL.yaml and index.js',
        },
        {
          title: 'Check required files',
          description: 'Skills need either SKILL.yaml or SKILL.md + index.js',
        },
      ],
      { directory, expectedFiles: ['SKILL.yaml', 'SKILL.md', 'index.js'] },
    );
  }

  static inputValidationFailed(
    skillName: string,
    errors: Array<{ path: string; message: string }>,
    expectedSchema: unknown,
  ): SkillKitError {
    return new SkillKitError(
      `Input validation failed for skill '${skillName}'`,
      'INVALID_INPUT',
      [
        {
          title: 'Check your input data',
          description: 'Review the errors below and fix your input JSON',
        },
        {
          title: 'View skill schema',
          command: `tsk explain ${skillName}`,
          description: 'Shows expected input/output schemas',
        },
      ],
      { skillName, validationErrors: errors, expectedSchema },
    );
  }

  static fileOverwriteWarning(path: string): SkillKitError {
    return new SkillKitError(
      `File or directory already exists: ${path}`,
      'FILE_EXISTS',
      [
        {
          title: 'Use a different name',
          command: 'tsk gen-skill my-other-skill',
        },
        {
          title: 'Remove existing directory',
          command: `rm -rf ${path}`,
          description: '⚠️ This will delete the existing skill',
        },
        {
          title: 'Rename existing directory',
          command: `mv ${path} ${path}.backup`,
        },
      ],
      { path },
    );
  }

  static commandFailed(
    command: string,
    exitCode: number,
    stderr: string,
  ): SkillKitError {
    return new SkillKitError(
      `Command failed: ${command}`,
      'COMMAND_FAILED',
      [
        {
          title: 'Check if command is installed',
          command: `which ${command.split(' ')[0]} || where ${command.split(' ')[0]}`,
        },
        {
          title: 'Review the error output',
          description: 'See stderr below for details',
        },
      ],
      { command, exitCode, stderr: stderr.substring(0, 500) },
    );
  }

  static pathNotAllowed(path: string, allowedPaths: string[]): SkillKitError {
    return new SkillKitError(
      `Path access denied: ${path}`,
      'PATH_NOT_ALLOWED',
      [
        {
          title: 'Update skill permissions',
          description: 'Add the path to allowedPaths.read or allowedPaths.write in SKILL.yaml',
        },
        {
          title: 'Review security policy',
          command: 'cat SECURITY.md',
          description: 'Understand path validation and security model',
        },
      ],
      { path, allowedPaths },
    );
  }

  static timeoutExceeded(skillName: string, timeout: number): SkillKitError {
    return new SkillKitError(
      `Skill execution timed out after ${timeout}ms`,
      'TIMEOUT',
      [
        {
          title: 'Increase timeout',
          command: `tsk run ${skillName} --timeout 60000`,
          description: 'Set timeout to 60 seconds',
        },
        {
          title: 'Optimize skill performance',
          description: 'Review skill implementation for performance issues',
        },
      ],
      { skillName, timeout },
    );
  }
}

