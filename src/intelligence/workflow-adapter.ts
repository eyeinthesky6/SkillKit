/**
 * Workflow Adapter
 * 
 * Adapts workflow templates to match detected project languages and tools
 * Replaces placeholders with actual commands based on project analysis
 */

import path from 'path';
import { MultiLanguageProject, LanguageStack } from './multi-language-analyzer';

export interface CommandMapping {
  install: string;
  lint: string;
  format: string;
  typecheck: string;
  test: string;
  build: string;
  qualityGate: string;
  diagnose?: string;
}

export class WorkflowAdapter {
  private project: MultiLanguageProject;

  constructor(project: MultiLanguageProject) {
    this.project = project;
  }

  /**
   * Generate command mappings for all detected languages
   */
  generateCommandMappings(): Map<string, CommandMapping> {
    const mappings = new Map<string, CommandMapping>();

    for (const lang of this.project.languages) {
      mappings.set(lang.rootPath, this.generateCommandsForStack(lang));
    }

    // Add root-level mapping if monorepo
    if (this.project.isMonorepo) {
      mappings.set(this.project.rootPath, this.generateRootCommands());
    }

    return mappings;
  }

  /**
   * Generate commands for a specific language stack
   */
  private generateCommandsForStack(stack: LanguageStack): CommandMapping {
    const commands: CommandMapping = {
      install: this.getInstallCommand(stack),
      lint: this.getLintCommand(stack),
      format: this.getFormatCommand(stack),
      typecheck: this.getTypecheckCommand(stack),
      test: this.getTestCommand(stack),
      build: this.getBuildCommand(stack),
      qualityGate: this.getQualityGateCommand(stack),
    };

    // Add SkillKit diagnose if available
    if (this.hasSkillKit()) {
      commands.diagnose = 'tsk diagnose';
    }

    return commands;
  }

  /**
   * Generate root-level commands for monorepo
   */
  private generateRootCommands(): CommandMapping {
    const commands: string[] = [];

    // Collect commands from all languages
    for (const lang of this.project.languages) {
      const stackCommands = this.generateCommandsForStack(lang);
      commands.push(`# ${lang.language} (${lang.rootPath})`);
      commands.push(`cd ${lang.rootPath}`);
      commands.push(stackCommands.install);
      commands.push(stackCommands.lint);
      commands.push(stackCommands.test);
      commands.push('cd -');
      commands.push('');
    }

    return {
      install: commands.join('\n'),
      lint: commands.join('\n'),
      format: commands.join('\n'),
      typecheck: commands.join('\n'),
      test: commands.join('\n'),
      build: commands.join('\n'),
      qualityGate: commands.join('\n'),
    };
  }

  private getInstallCommand(stack: LanguageStack): string {
    switch (stack.packageManager) {
      case 'pnpm':
        return 'pnpm install';
      case 'yarn':
        return 'yarn install';
      case 'npm':
        return 'npm install';
      case 'poetry':
        return 'poetry install';
      case 'pip':
        return 'pip install -r requirements.txt';
      case 'maven':
        return 'mvn install';
      case 'gradle':
        return './gradlew build';
      case 'go':
        return 'go mod download';
      default:
        return '# Install dependencies';
    }
  }

  private getLintCommand(stack: LanguageStack): string {
    // PRIORITY 1: Use project scripts if available (from pyproject.toml [tool.poetry.scripts] or package.json)
    if (stack.scripts?.lint) {
      if (stack.packageManager === 'poetry') {
        return `poetry run lint`;
      }
      const pm = stack.packageManager || 'npm';
      return `${pm} run lint`;
    }

    // PRIORITY 2: Use detected linter with correct package manager
    if (stack.linter) {
      if (stack.packageManager === 'poetry') {
        // ALWAYS use Poetry when Poetry is detected
        if (stack.linter === 'ruff') {
          return `poetry run ruff check .`;
        }
        if (stack.linter === 'flake8') {
          return `poetry run flake8 .`;
        }
        if (stack.linter === 'pylint') {
          return `poetry run pylint .`;
        }
        if (stack.linter === 'eslint') {
          return `poetry run eslint .`;
        }
        // Generic Poetry linter command
        return `poetry run ${stack.linter} .`;
      }
      
      // Non-Poetry package managers
      if (stack.linter === 'eslint') {
        const pm = stack.packageManager || 'npm';
        return `${pm} run lint || npx eslint .`;
      }
      if (stack.linter === 'ruff') {
        return 'ruff check .';
      }
      if (stack.linter === 'flake8') {
        return 'flake8 .';
      }
      if (stack.linter === 'pylint') {
        return 'pylint .';
      }
      if (stack.linter === 'golangci-lint') {
        return 'golangci-lint run';
      }
      // Generic linter command
      return `${stack.linter} .`;
    }

    // PRIORITY 3: Generic instruction if nothing detected
    if (stack.packageManager === 'poetry') {
      return '# Run linter: poetry run lint (or check pyproject.toml for available scripts)';
    }
    const pm = stack.packageManager || 'npm';
    return `# Run linter: ${pm} run lint (or check package.json for available scripts)`;
  }

  private getFormatCommand(stack: LanguageStack): string {
    // PRIORITY 1: Use project scripts if available
    if (stack.scripts?.format) {
      if (stack.packageManager === 'poetry') {
        return `poetry run format`;
      }
      const pm = stack.packageManager || 'npm';
      return `${pm} run format`;
    }

    // PRIORITY 2: Use detected formatter with correct package manager
    if (stack.formatter) {
      if (stack.packageManager === 'poetry') {
        // ALWAYS use Poetry when Poetry is detected
        if (stack.formatter === 'ruff format') {
          return `poetry run ruff format .`;
        }
        if (stack.formatter === 'black') {
          return `poetry run black .`;
        }
        // Generic Poetry formatter command
        return `poetry run ${stack.formatter.replace(' ', ' ')} .`;
      }
      
      // Non-Poetry package managers
      if (stack.formatter === 'prettier') {
        const pm = stack.packageManager || 'npm';
        return `${pm} run format || npx prettier --write .`;
      }
      if (stack.formatter === 'black') {
        return 'black .';
      }
      if (stack.formatter === 'ruff format') {
        return 'ruff format .';
      }
      // Generic formatter command
      return `${stack.formatter} .`;
    }

    // Language-specific defaults
    if (stack.language === 'go') {
      return 'gofmt -w .';
    }

    // PRIORITY 3: Generic instruction if nothing detected
    if (stack.packageManager === 'poetry') {
      return '# Format code: poetry run format (or check pyproject.toml for available scripts)';
    }
    const pm = stack.packageManager || 'npm';
    return `# Format code: ${pm} run format (or check package.json for available scripts)`;
  }

  private getTypecheckCommand(stack: LanguageStack): string {
    // PRIORITY 1: Use project scripts if available
    if (stack.scripts?.typecheck || stack.scripts?.['type-check']) {
      if (stack.packageManager === 'poetry') {
        const scriptName = stack.scripts.typecheck ? 'typecheck' : 'type-check';
        return `poetry run ${scriptName}`;
      }
      const pm = stack.packageManager || 'npm';
      const scriptName = stack.scripts.typecheck ? 'typecheck' : 'type-check';
      return `${pm} run ${scriptName}`;
    }

    // PRIORITY 2: Use detected type checker with correct package manager
    if (stack.typeChecker) {
      if (stack.packageManager === 'poetry') {
        // ALWAYS use Poetry when Poetry is detected
        if (stack.typeChecker === 'mypy') {
          return `poetry run mypy .`;
        }
        if (stack.typeChecker === 'pyright') {
          return `poetry run pyright .`;
        }
        // Generic Poetry type checker command
        return `poetry run ${stack.typeChecker} .`;
      }
      
      // Non-Poetry package managers
      if (stack.typeChecker === 'typescript') {
        const pm = stack.packageManager || 'npm';
        return `${pm} run type-check || npx tsc --noEmit`;
      }
      if (stack.typeChecker === 'mypy') {
        return 'mypy .';
      }
      if (stack.typeChecker === 'pyright') {
        return 'pyright .';
      }
      // Generic type checker command
      return `${stack.typeChecker} .`;
    }

    // PRIORITY 3: Generic instruction if nothing detected
    if (stack.packageManager === 'poetry') {
      return '# Type check: poetry run type-check (or check pyproject.toml for available scripts)';
    }
    const pm = stack.packageManager || 'npm';
    return `# Type check: ${pm} run type-check (or check package.json for available scripts)`;
  }

  private getTestCommand(stack: LanguageStack): string {
    // PRIORITY 1: Use project scripts if available
    if (stack.scripts?.test) {
      if (stack.packageManager === 'poetry') {
        return `poetry run test`;
      }
      const pm = stack.packageManager || 'npm';
      return `${pm} run test`;
    }

    // PRIORITY 2: Use detected test framework with correct package manager
    if (stack.testFramework) {
      if (stack.packageManager === 'poetry') {
        // ALWAYS use Poetry when Poetry is detected
        if (stack.testFramework === 'pytest') {
          return `poetry run pytest`;
        }
        if (stack.testFramework === 'unittest') {
          return `poetry run python -m unittest discover`;
        }
        // Generic Poetry test command
        return `poetry run ${stack.testFramework}`;
      }
      
      // Non-Poetry package managers
      if (stack.testFramework === 'jest') {
        const pm = stack.packageManager || 'npm';
        return `${pm} run test || npx jest`;
      }
      if (stack.testFramework === 'vitest') {
        const pm = stack.packageManager || 'npm';
        return `${pm} run test || npx vitest run`;
      }
      if (stack.testFramework === 'pytest') {
        return 'pytest';
      }
      if (stack.testFramework === 'unittest') {
        return 'python -m unittest discover';
      }
      if (stack.testFramework === 'go test') {
        return 'go test ./...';
      }
      // Generic test framework command
      return `${stack.testFramework}`;
    }

    // PRIORITY 3: Generic instruction if nothing detected
    if (stack.packageManager === 'poetry') {
      return '# Run tests: poetry run test (or check pyproject.toml for available scripts)';
    }
    const pm = stack.packageManager || 'npm';
    return `# Run tests: ${pm} run test (or check package.json for available scripts)`;
  }

  private getBuildCommand(stack: LanguageStack): string {
    // PRIORITY 1: Use project scripts if available
    if (stack.scripts?.build) {
      if (stack.packageManager === 'poetry') {
        return `poetry run build`;
      }
      const pm = stack.packageManager || 'npm';
      return `${pm} run build`;
    }

    // PRIORITY 2: Language-specific defaults
    if (stack.language === 'typescript' || stack.language === 'javascript') {
      const pm = stack.packageManager || 'npm';
      return `${pm} run build || echo "No build script"`;
    }
    if (stack.language === 'python' && stack.packageManager === 'poetry') {
      return 'poetry build';
    }
    if (stack.language === 'go') {
      return 'go build ./...';
    }

    // PRIORITY 3: Generic instruction if nothing detected
    if (stack.packageManager === 'poetry') {
      return '# Build project: poetry build (or check pyproject.toml for available scripts)';
    }
    const pm = stack.packageManager || 'npm';
    return `# Build project: ${pm} run build (or check package.json for available scripts)`;
  }

  private getQualityGateCommand(stack: LanguageStack): string {
    const commands: string[] = [];

    // Run all quality checks
    commands.push(`# Quality Gate for ${stack.language}`);
    commands.push(this.getLintCommand(stack));
    commands.push(this.getTypecheckCommand(stack));
    commands.push(this.getTestCommand(stack));
    commands.push(this.getBuildCommand(stack));

    return commands.join('\n');
  }

  private hasSkillKit(): boolean {
    // Check if SkillKit is available (tsk command exists)
    return true; // Assume available if we're running this
  }

  /**
   * Adapt workflow template content with detected commands
   */
  adaptTemplate(templateContent: string, rootPath: string = this.project.rootPath): string {
    const mappings = this.generateCommandMappings();
    const mapping = mappings.get(rootPath) || mappings.values().next().value;

    if (!mapping) {
      return templateContent;
    }

    let adapted = templateContent;

    // Replace common placeholders
    adapted = adapted.replace(/\{\{INSTALL_COMMAND\}\}/g, mapping.install);
    adapted = adapted.replace(/\{\{LINT_COMMAND\}\}/g, mapping.lint);
    adapted = adapted.replace(/\{\{FORMAT_COMMAND\}\}/g, mapping.format);
    adapted = adapted.replace(/\{\{TYPECHECK_COMMAND\}\}/g, mapping.typecheck);
    adapted = adapted.replace(/\{\{TEST_COMMAND\}\}/g, mapping.test);
    adapted = adapted.replace(/\{\{BUILD_COMMAND\}\}/g, mapping.build);
    adapted = adapted.replace(/\{\{QUALITY_GATE_COMMAND\}\}/g, mapping.qualityGate);

    // Replace SkillKit-specific commands (if available)
    if (mapping.diagnose) {
      adapted = adapted.replace(/\{\{DIAGNOSE_COMMAND\}\}/g, mapping.diagnose);
      adapted = adapted.replace(/tsk diagnose/g, mapping.diagnose);
    }

    // Add language-specific sections for mixed codebases FIRST
    // (so we can replace commands in them)
    if (this.project.languages.length > 1) {
      adapted = this.addMultiLanguageSections(adapted);
    }

    // Replace ALL generic commands with language-specific ones
    adapted = this.replaceGenericCommands(adapted, mappings);

    // Final pass: Replace any remaining placeholders in language sections
    // This handles cases where sections were added but placeholders weren't replaced
    for (const lang of this.project.languages) {
      const mapping = mappings.get(lang.rootPath) || this.generateCommandsForStack(lang);
      const installCmd = mapping.install;
      const langName = lang.language.toUpperCase();
      const pm = lang.packageManager || 'npm';
      
      // Replace in language-specific sections only
      // Match from ### LANGNAME to next ### or end of code block
      const langSectionPattern = `(###\\s+${langName}\\s*\\([^)]+\\)[\\s\\S]*?)(?=###|$)`;
      const langSectionRegex = new RegExp(langSectionPattern, 'gi');
      
      adapted = adapted.replace(langSectionRegex, (match) => {
        let sectionContent = match;
        // Fix any "ppnpm" typos first (shouldn't happen, but just in case)
        sectionContent = sectionContent.replace(/ppnpm/g, 'pnpm');
        // Remove corrupted lines (lines starting with just "p#")
        sectionContent = sectionContent.replace(/^p#\s+/gm, '# ');
        // Remove duplicate section headers that got corrupted
        sectionContent = sectionContent.replace(/^p#\s*typescript/gi, '# typescript');
        
        // Replace install placeholders (MUST happen before cleaning)
        // Replace ALL instances of "# Install dependencies" in this section
        // This is the most important replacement - do it first
        sectionContent = sectionContent.replace(/# Install dependencies/g, installCmd);
        
        // Replace npm commands with correct package manager for this language
        if (pm !== 'npm') {
          sectionContent = sectionContent.replace(/npm install/g, installCmd);
          sectionContent = sectionContent.replace(/npm run (lint|test|type-check|typecheck|build)/g, `${pm} run $1`);
          sectionContent = sectionContent.replace(/npm test/g, `${pm} run test`);
        }
        
        return sectionContent;
      });
    }

    // Final pass: Replace any remaining "# Install dependencies" placeholders globally
    // This catches any that weren't replaced in language sections
    // Do this BEFORE cleanup so we don't lose the context
    for (const lang of this.project.languages) {
      const mapping = mappings.get(lang.rootPath) || this.generateCommandsForStack(lang);
      const langName = lang.language.toUpperCase();
      
      // Replace in language sections only - use a more flexible pattern
      // Match from ### LANGNAME to next ### or ## (next major section)
      const langSectionPattern = new RegExp(`(###\\s+${langName}\\s*\\([^)]+\\)[\\s\\S]*?)(?=###\\s+[A-Z]+|##\\s+[A-Z]|$)`, 'gi');
      let lastIndex = 0;
      let match;
      
      while ((match = langSectionPattern.exec(adapted)) !== null) {
        const sectionStart = match.index;
        const sectionEnd = sectionStart + match[0].length;
        let sectionContent = match[0];
        
        // Replace all instances in this section
        sectionContent = sectionContent.replace(/# Install dependencies/g, mapping.install);
        
        // Update the adapted content
        adapted = adapted.substring(0, sectionStart) + sectionContent + adapted.substring(sectionEnd);
        
        // Reset regex lastIndex since we modified the string
        lastIndex = sectionStart + sectionContent.length;
        langSectionPattern.lastIndex = lastIndex;
      }
    }
    
    // Final cleanup: Remove any remaining corruption patterns
    adapted = adapted.replace(/^p#\s+/gm, '# ');
    adapted = adapted.replace(/ppnpm/g, 'pnpm');
    // Remove duplicate cd commands
    adapted = adapted.replace(/cd -\ncd -/g, 'cd -');
    // Remove orphaned cd - commands
    adapted = adapted.replace(/\ncd -\n```/g, '\n```');
    
    // Remove duplicate language sections
    adapted = this.removeDuplicateSections(adapted);
    
    // Clean up mixed content in sections (remove commands from wrong language)
    adapted = this.cleanSectionContent(adapted, mappings);
    
    // ABSOLUTE FINAL PASS: Replace any remaining "# Install dependencies" 
    // This is a last resort catch-all for any that slipped through
    for (const lang of this.project.languages) {
      const mapping = mappings.get(lang.rootPath) || this.generateCommandsForStack(lang);
      const langName = lang.language.toUpperCase();
      
      // Find all sections for this language and replace placeholders
      const sectionHeader = `### ${langName}`;
      const sections = adapted.split(new RegExp(`(${sectionHeader}[^#]*)`, 'gi'));
      
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].includes(sectionHeader)) {
          sections[i] = sections[i].replace(/# Install dependencies/g, mapping.install);
        }
      }
      
      adapted = sections.join('');
    }

    return adapted;
  }

  /**
   * Remove duplicate language sections
   */
  private removeDuplicateSections(content: string): string {
    const seenSections = new Set<string>();
    const lines = content.split('\n');
    const result: string[] = [];
    let inSection = false;
    let currentSection = '';
    let sectionKey = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a language section header
      const sectionMatch = line.match(/^###\s+([A-Z]+)\s*\(([^)]+)\)/);
      if (sectionMatch) {
        const [, langName, path] = sectionMatch;
        const key = `${langName}:${path}`;
        
        if (seenSections.has(key)) {
          // Skip this duplicate section
          inSection = true;
          currentSection = '';
          sectionKey = key;
          // Skip until we find the end of this section
          continue;
        } else {
          // New unique section
          if (inSection && currentSection) {
            result.push(currentSection);
            currentSection = '';
          }
          seenSections.add(key);
          inSection = true;
          sectionKey = key;
          result.push(line);
          continue;
        }
      }
      
      // Check if we're ending a section (next ### or closing ```)
      if (inSection) {
        if (line.match(/^###\s+[A-Z]+/) || (line.trim() === '```' && currentSection.includes('```'))) {
          if (currentSection && !seenSections.has(sectionKey + ':duplicate')) {
            result.push(currentSection);
            currentSection = '';
          }
          inSection = false;
          if (line.match(/^###\s+[A-Z]+/)) {
            // This is the next section, process it
            i--; // Back up to process this line
            continue;
          }
        } else {
          if (!seenSections.has(sectionKey + ':duplicate')) {
            currentSection += line + '\n';
          }
          continue;
        }
      }
      
      result.push(line);
    }
    
    if (currentSection && !seenSections.has(sectionKey + ':duplicate')) {
      result.push(currentSection);
    }
    
    return result.join('\n');
  }

  /**
   * Clean section content - remove commands from wrong languages
   */
  private cleanSectionContent(content: string, mappings: Map<string, CommandMapping>): string {
    let cleaned = content;
    
    // For each language section, remove commands that belong to other languages
    for (const lang of this.project.languages) {
      const langName = lang.language.toUpperCase();
      const langMapping = mappings.get(lang.rootPath) || this.generateCommandsForStack(lang);
      const langPm = lang.packageManager || 'npm';
      
      // Find this language's sections
      const sectionRegex = new RegExp(`(###\\s+${langName}\\s*\\([^)]+\\)[\\s\\S]*?)(?=###|$)`, 'gi');
      
      cleaned = cleaned.replace(sectionRegex, (match) => {
        let sectionContent = match;
        
        // Remove commands from other languages
        for (const otherLang of this.project.languages) {
          if (otherLang.language !== lang.language) {
            const otherMapping = mappings.get(otherLang.rootPath) || this.generateCommandsForStack(otherLang);
            const otherPm = otherLang.packageManager || 'npm';
            
            // Remove install commands from other package managers
            if (otherPm !== langPm) {
              const otherInstall = this.getInstallCommand(otherLang);
              if (otherInstall !== langMapping.install) {
                // Remove lines containing other language's install command (entire line)
                const otherInstallEscaped = otherInstall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                sectionContent = sectionContent.replace(new RegExp(`^[^\\n]*${otherInstallEscaped}[^\\n]*$`, 'gm'), '');
              }
            }
            
            // Remove lint/test/typecheck commands from other languages
            if (otherMapping.lint && otherMapping.lint !== langMapping.lint) {
              const otherLintEscaped = otherMapping.lint.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              sectionContent = sectionContent.replace(new RegExp(`^[^\\n]*${otherLintEscaped}[^\\n]*$`, 'gm'), '');
            }
            if (otherMapping.test && otherMapping.test !== langMapping.test) {
              const otherTestEscaped = otherMapping.test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              sectionContent = sectionContent.replace(new RegExp(`^[^\\n]*${otherTestEscaped}[^\\n]*$`, 'gm'), '');
            }
            if (otherMapping.typecheck && otherMapping.typecheck !== langMapping.typecheck) {
              const otherTypecheckEscaped = otherMapping.typecheck.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              sectionContent = sectionContent.replace(new RegExp(`^[^\\n]*${otherTypecheckEscaped}[^\\n]*$`, 'gm'), '');
            }
            
            // Remove package manager commands from other languages
            if (otherPm !== langPm) {
              // Remove lines with other package manager
              sectionContent = sectionContent.replace(new RegExp(`^[^\\n]*${otherPm}\\s+(install|run)\\s+[^\\n]*$`, 'gm'), '');
            }
          }
        }
        
        // Remove empty comment lines that might be left
        sectionContent = sectionContent.replace(/^#\s*typescript.*$/gmi, '');
        sectionContent = sectionContent.replace(/^#\s*python.*$/gmi, '');
        sectionContent = sectionContent.replace(/^#\s*$/gm, '');
        
        // Remove duplicate blank lines
        sectionContent = sectionContent.replace(/\n{3,}/g, '\n\n');
        
        return sectionContent;
      });
    }
    
    return cleaned;
  }

  /**
   * Replace generic commands (tsk exec, npm run, etc.) with language-specific commands
   * Only replaces commands in context of the correct language section
   */
  private replaceGenericCommands(content: string, mappings: Map<string, CommandMapping>): string {
    let adapted = content;

    // First, find and isolate language sections properly
    const sections: Array<{ lang: LanguageStack; start: number; end: number; header: string }> = [];
    
    // Find language-specific sections with better boundary detection
    for (const lang of this.project.languages) {
      const langName = lang.language.toUpperCase();
      const regex = new RegExp(`###\\s+${langName}\\s*\\([^)]+\\)`, 'gi');
      let match;
      const tempContent = adapted;
      
      while ((match = regex.exec(tempContent)) !== null) {
        const sectionStart = match.index;
        const header = match[0];
        
        // Find the end of this section - look for next ### header or closing ```
        const afterHeader = tempContent.substring(sectionStart + header.length);
        const nextHeaderMatch = afterHeader.match(/###\s+[A-Z]+\s*\(/);
        const codeBlockEnd = afterHeader.indexOf('```');
        
        let sectionEnd: number;
        if (nextHeaderMatch && codeBlockEnd >= 0) {
          sectionEnd = sectionStart + header.length + Math.min(nextHeaderMatch.index!, codeBlockEnd);
        } else if (nextHeaderMatch) {
          sectionEnd = sectionStart + header.length + nextHeaderMatch.index!;
        } else if (codeBlockEnd >= 0) {
          sectionEnd = sectionStart + header.length + codeBlockEnd;
        } else {
          // Find next markdown header (##) as fallback
          const nextMarkdownHeader = afterHeader.match(/^##\s+/m);
          sectionEnd = nextMarkdownHeader 
            ? sectionStart + header.length + nextMarkdownHeader.index!
            : sectionStart + header.length + afterHeader.length;
        }
        
        sections.push({ lang, start: sectionStart, end: sectionEnd, header });
      }
    }

    // Sort sections by start position (reverse order for safe replacement)
    sections.sort((a, b) => b.start - a.start);

    // Replace commands within each language section (working backwards to preserve indices)
    for (const section of sections) {
      const mapping = mappings.get(section.lang.rootPath) || this.generateCommandsForStack(section.lang);
      const relativePath = path.relative(this.project.rootPath, section.lang.rootPath) || '.';
      const isRoot = relativePath === '.' || relativePath === '';
      
      // Extract section content
      if (section.start >= 0 && section.end > section.start && section.end <= adapted.length) {
        let sectionContent = adapted.substring(section.start, section.end);

        // Replace tsk exec commands with language-specific ones
        if (mapping.lint) {
          const lintCmd = isRoot ? mapping.lint : `${mapping.lint}`;
          sectionContent = sectionContent.replace(/tsk exec lint\s*(#.*)?$/gm, lintCmd);
          sectionContent = sectionContent.replace(/tsk exec lint\s*(#.*)?/g, lintCmd);
        }
        if (mapping.test) {
          const testCmd = isRoot ? mapping.test : `${mapping.test}`;
          sectionContent = sectionContent.replace(/tsk exec test\s*(#.*)?$/gm, testCmd);
          sectionContent = sectionContent.replace(/tsk exec test\s*(#.*)?/g, testCmd);
        }
        if (mapping.typecheck) {
          const typecheckCmd = isRoot ? mapping.typecheck : `${mapping.typecheck}`;
          sectionContent = sectionContent.replace(/tsk exec typecheck\s*(#.*)?$/gm, typecheckCmd);
          sectionContent = sectionContent.replace(/tsk exec typecheck\s*(#.*)?/g, typecheckCmd);
        }

        // Replace generic npm/pnpm/yarn commands with detected package manager for this language
        if (section.lang.packageManager) {
          const pm = section.lang.packageManager;
          // Replace npm run with detected package manager
          sectionContent = sectionContent.replace(/npm run (lint|test|type-check|typecheck|build)/g, `${pm} run $1`);
          // Replace npm test with detected package manager
          sectionContent = sectionContent.replace(/npm test/g, `${pm} run test`);
          // Replace "# Install dependencies" with actual install command
          if (mapping.install) {
            sectionContent = sectionContent.replace(/# Install dependencies/g, mapping.install);
          }
          // Replace any remaining npm references in this section
          if (pm !== 'npm') {
            sectionContent = sectionContent.replace(/npm install/g, mapping.install);
          }
        }

        // Remove any cross-language contamination (commands from other languages)
        const pm = section.lang.packageManager || 'npm';
        for (const otherLang of this.project.languages) {
          if (otherLang.language !== section.lang.language) {
            const otherPm = otherLang.packageManager || 'npm';
            
            // Remove commands from other languages that shouldn't be in this section
            if (otherPm !== pm) {
              // Remove install commands from other package managers
              const otherInstall = this.getInstallCommand(otherLang);
              if (otherInstall !== mapping.install) {
                sectionContent = sectionContent.replace(new RegExp(otherInstall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), mapping.install);
              }
            }
          }
        }

        // Update the adapted content
        adapted = adapted.substring(0, section.start) + sectionContent + adapted.substring(section.end);
      }
    }

    // Replace generic commands outside of language sections (fallback)
    // Use the primary language for non-section commands
    const primaryLang = this.project.languages[0];
    if (primaryLang) {
      const mapping = mappings.get(primaryLang.rootPath) || this.generateCommandsForStack(primaryLang);
      const pm = primaryLang.packageManager || 'npm';
      
      // Replace tsk exec commands outside sections (more aggressive)
      if (mapping.lint) {
        adapted = adapted.replace(/tsk exec lint\s*(#.*)?$/gm, mapping.lint);
        adapted = adapted.replace(/tsk exec lint\s*(#.*)?/g, mapping.lint);
        // Also replace in code blocks
        adapted = adapted.replace(/```bash\n[^\n]*tsk exec lint[^\n]*\n```/g, `\`\`\`bash\n${mapping.lint}\n\`\`\``);
      }
      if (mapping.test) {
        adapted = adapted.replace(/tsk exec test\s*(#.*)?$/gm, mapping.test);
        adapted = adapted.replace(/tsk exec test\s*(#.*)?/g, mapping.test);
        adapted = adapted.replace(/```bash\n[^\n]*tsk exec test[^\n]*\n```/g, `\`\`\`bash\n${mapping.test}\n\`\`\``);
      }
      if (mapping.typecheck) {
        adapted = adapted.replace(/tsk exec typecheck\s*(#.*)?$/gm, mapping.typecheck);
        adapted = adapted.replace(/tsk exec typecheck\s*(#.*)?/g, mapping.typecheck);
        adapted = adapted.replace(/```bash\n[^\n]*tsk exec typecheck[^\n]*\n```/g, `\`\`\`bash\n${mapping.typecheck}\n\`\`\``);
      }
      
      // Replace tsk exec quality-gate and build
      if (mapping.qualityGate) {
        adapted = adapted.replace(/tsk exec quality-gate\s*(#.*)?$/gm, mapping.qualityGate);
        adapted = adapted.replace(/tsk exec quality-gate\s*(#.*)?/g, mapping.qualityGate);
      }
      if (mapping.build) {
        adapted = adapted.replace(/tsk exec build\s*(#.*)?$/gm, mapping.build);
        adapted = adapted.replace(/tsk exec build\s*(#.*)?/g, mapping.build);
      }
      
      // Replace npm commands with primary package manager (more aggressive)
      if (pm !== 'npm') {
        adapted = adapted.replace(/npm run (lint|test|type-check|typecheck|build)/g, `${pm} run $1`);
        adapted = adapted.replace(/npm test/g, `${pm} run test`);
        adapted = adapted.replace(/npm install/g, mapping.install);
        // Also in code blocks
        adapted = adapted.replace(new RegExp(`\`\`\`bash\\n[^\\n]*npm (run|install|test)[^\\n]*\\n\`\`\``, 'g'), (match) => {
          return match.replace(/npm (run|install|test)/g, (_m, cmd) => {
            if (cmd === 'run') return `${pm} run`;
            if (cmd === 'test') return `${pm} run test`;
            return mapping.install;
          });
        });
      }
    }

    // Replace generic commands in comments or fallbacks
    for (const lang of this.project.languages) {
      if (lang.packageManager && lang.packageManager !== 'npm') {
        const pm = lang.packageManager;
        adapted = adapted.replace(/# Or: npm run/g, `# Or: ${pm} run`);
        adapted = adapted.replace(/# Or: npm test/g, `# Or: ${pm} run test`);
        adapted = adapted.replace(/# Or: npx tsc/g, `# Or: ${pm} run type-check`);
      }
    }

    return adapted;
  }

  /**
   * Add sections for each language in mixed codebase
   */
  private addMultiLanguageSections(template: string): string {
    // Check if sections already exist to avoid duplicates
    if (template.includes('## Phase 2.1: Language-Specific Setup')) {
      return template;
    }

    let adapted = template;

    // Find Phase sections and add language-specific subsections
    const languages = this.project.languages.map(l => {
      const relativePath = path.relative(this.project.rootPath, l.rootPath) || '.';
      const displayPath = relativePath === '.' ? '.' : relativePath.replace(/\\/g, '\\\\');
      const commands = this.generateCommandsForStack(l);
      return {
        name: l.language,
        path: displayPath,
        relativePath,
        commands,
        install: commands.install, // Store install command separately
      };
    });

    // Add a section after Phase 2 (Check Dependencies)
    const langSection = `
## Phase 2.1: Language-Specific Setup

**This project uses multiple languages. Run setup for each:**

${languages.map(lang => `
### ${lang.name.toUpperCase()} (${lang.path})

\`\`\`bash
cd ${lang.path}
${lang.install}
cd -
\`\`\`
`).join('\n')}
`;

    adapted = adapted.replace(/## Phase 3:/, langSection + '\n## Phase 3:');

    return adapted;
  }
}
