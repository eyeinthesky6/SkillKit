/**
 * Multi-Language Project Analyzer
 * 
 * Detects all languages, frameworks, and tools in a project (including monorepos)
 * Returns structured data for workflow adaptation
 */

import fs from 'fs';
import path from 'path';

export interface LanguageStack {
  language: 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust' | 'php' | 'ruby' | 'unknown';
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'poetry' | 'pip' | 'maven' | 'gradle' | 'cargo' | 'composer' | 'bundler' | 'go';
  buildTool?: string;
  testFramework?: 'jest' | 'vitest' | 'mocha' | 'pytest' | 'unittest' | 'junit' | 'go test' | 'cargo test';
  linter?: 'eslint' | 'tslint' | 'ruff' | 'black' | 'flake8' | 'pylint' | 'mypy' | 'checkstyle' | 'golangci-lint';
  formatter?: 'prettier' | 'black' | 'ruff format' | 'gofmt';
  typeChecker?: 'typescript' | 'mypy' | 'pyright' | 'pylance';
  framework?: string;
  rootPath: string;
  configFiles: string[];
  scripts?: {
    lint?: string;
    test?: string;
    typecheck?: string;
    build?: string;
    format?: string;
    [key: string]: string | undefined;
  };
}

export interface MultiLanguageProject {
  languages: LanguageStack[];
  isMonorepo: boolean;
  rootPath: string;
  structure: {
    hasPython?: boolean;
    hasTypeScript?: boolean;
    hasJavaScript?: boolean;
    hasJava?: boolean;
    hasGo?: boolean;
    packageManagers: string[];
  };
}

export class MultiLanguageAnalyzer {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze entire project for all languages and tools
   */
  async analyze(): Promise<MultiLanguageProject> {
    const languages: LanguageStack[] = [];
    const detectedManagers = new Set<string>();

    // Check root level
    const rootStack = await this.detectStack(this.projectRoot);
    if (rootStack.language !== 'unknown') {
      languages.push(rootStack);
      if (rootStack.packageManager) {
        detectedManagers.add(rootStack.packageManager);
      }
    }

    // Check for monorepo structure
    const isMonorepo = this.detectMonorepo();
    
    if (isMonorepo) {
      // Check common monorepo patterns
      const appsDir = path.join(this.projectRoot, 'apps');
      const packagesDir = path.join(this.projectRoot, 'packages');
      const servicesDir = path.join(this.projectRoot, 'services');

      for (const dir of [appsDir, packagesDir, servicesDir]) {
        if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
          const subdirs = fs.readdirSync(dir).filter(item => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory();
          });

          for (const subdir of subdirs) {
            const subPath = path.join(dir, subdir);
            const stack = await this.detectStack(subPath);
            if (stack.language !== 'unknown') {
              languages.push(stack);
              if (stack.packageManager) {
                detectedManagers.add(stack.packageManager);
              }
            }
          }
        }
      }
    }

    return {
      languages: this.deduplicateLanguages(languages),
      isMonorepo,
      rootPath: this.projectRoot,
      structure: {
        hasPython: languages.some(l => l.language === 'python'),
        hasTypeScript: languages.some(l => l.language === 'typescript'),
        hasJavaScript: languages.some(l => l.language === 'javascript'),
        hasJava: languages.some(l => l.language === 'java'),
        hasGo: languages.some(l => l.language === 'go'),
        packageManagers: Array.from(detectedManagers),
      },
    };
  }

  /**
   * Detect language stack for a specific directory
   */
  private async detectStack(dirPath: string): Promise<LanguageStack> {
    const stack: LanguageStack = {
      language: 'unknown',
      rootPath: dirPath,
      configFiles: [],
    };

    // Python detection (check first - pyproject.toml is more specific than package.json)
    if (
      this.fileExists(dirPath, 'pyproject.toml') ||
      this.fileExists(dirPath, 'setup.py') ||
      this.fileExists(dirPath, 'requirements.txt')
    ) {
      stack.language = 'python';

      if (this.fileExists(dirPath, 'pyproject.toml')) {
        stack.configFiles.push('pyproject.toml');
        const pyprojectContent = fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8');
        if (pyprojectContent.includes('[tool.poetry]') || pyprojectContent.includes('[project]')) {
          stack.packageManager = 'poetry';
        } else {
          stack.packageManager = 'pip';
        }
      } else if (this.fileExists(dirPath, 'Pipfile')) {
        stack.packageManager = 'pip';
        stack.configFiles.push('Pipfile');
      } else if (this.fileExists(dirPath, 'requirements.txt')) {
        stack.packageManager = 'pip';
        stack.configFiles.push('requirements.txt');
      }

      // Detect test framework
      if (this.fileExists(dirPath, 'pytest.ini') || this.searchInFiles(dirPath, ['**/test_*.py', '**/*_test.py'], 'pytest')) {
        stack.testFramework = 'pytest';
      } else if (this.searchInFiles(dirPath, ['**/test_*.py'], 'unittest')) {
        stack.testFramework = 'unittest';
      }

      // Detect linter - check pyproject.toml first for ruff configuration
      let detectedLinter = false;
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        try {
          const pyprojectContent = fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8');
          // Check for ruff in pyproject.toml
          if (pyprojectContent.includes('[tool.ruff]') || pyprojectContent.includes('tool.ruff')) {
            stack.linter = 'ruff';
            stack.configFiles.push('pyproject.toml');
            detectedLinter = true;
          }
          // Check for poetry scripts that might indicate linter
          if (!detectedLinter && pyprojectContent.includes('[tool.poetry.scripts]')) {
            if (pyprojectContent.includes('lint') && pyprojectContent.includes('ruff')) {
              stack.linter = 'ruff';
              detectedLinter = true;
            }
          }
        } catch {
          // Continue to file-based detection
        }
      }
      
      // Fall back to file-based detection
      if (!detectedLinter) {
        if (this.fileExists(dirPath, '.ruff.toml') || this.fileExists(dirPath, 'ruff.toml')) {
          stack.linter = 'ruff';
          stack.configFiles.push('.ruff.toml', 'ruff.toml');
        } else if (this.fileExists(dirPath, '.flake8') || this.fileExists(dirPath, 'setup.cfg')) {
          stack.linter = 'flake8';
        } else if (this.fileExists(dirPath, '.pylintrc')) {
          stack.linter = 'pylint';
        }
      }

      // Detect formatter
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        const pyproject = this.readTOML(dirPath, 'pyproject.toml');
        const tool = pyproject['tool'] as Record<string, unknown> | undefined;
        if (tool && typeof tool === 'object') {
          if ('ruff' in tool || 'black' in tool) {
            stack.formatter = 'ruff' in tool ? 'ruff format' : 'black';
          }
        }
      }

      // Detect type checker
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        const pyproject = this.readTOML(dirPath, 'pyproject.toml');
        const tool = pyproject['tool'] as Record<string, unknown> | undefined;
        if (tool && typeof tool === 'object' && 'mypy' in tool) {
          stack.typeChecker = 'mypy';
        } else if (this.fileExists(dirPath, 'pyrightconfig.json')) {
          stack.typeChecker = 'pyright';
        }
      }

      // Detect framework
      if (this.fileExists(dirPath, 'requirements.txt')) {
        const content = fs.readFileSync(path.join(dirPath, 'requirements.txt'), 'utf8');
        if (content.includes('django')) stack.framework = 'Django';
        else if (content.includes('flask')) stack.framework = 'Flask';
        else if (content.includes('fastapi')) stack.framework = 'FastAPI';
      }

      // Detect project scripts from pyproject.toml [tool.poetry.scripts]
      if (this.fileExists(dirPath, 'pyproject.toml') && stack.packageManager === 'poetry') {
        try {
          const pyprojectContent = fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8');
          const scripts: Record<string, string> = {};
          
          // Parse [tool.poetry.scripts] section
          const scriptsMatch = pyprojectContent.match(/\[tool\.poetry\.scripts\]([\s\S]*?)(?=\[|$)/);
          if (scriptsMatch) {
            const scriptsSection = scriptsMatch[1];
            // Extract script definitions: name = "command" or name = 'command'
            // Support both single and double quotes, and handle kebab-case names
            const scriptLines = scriptsSection.split('\n');
            for (const line of scriptLines) {
              // Match: name = "command" or name = 'command'
              // Also handle names with dashes: my-script = "command"
              const match = line.match(/([\w-]+)\s*=\s*["']([^"']+)["']/);
              if (match) {
                const [, name, command] = match;
                scripts[name] = command;
              }
            }
          }
          
          if (Object.keys(scripts).length > 0) {
            stack.scripts = scripts;
          }
        } catch {
          // Continue without scripts
        }
      }
    }

    // TypeScript/JavaScript detection (check after Python)
    else if (this.fileExists(dirPath, 'package.json')) {
      const pkg = this.readJSON(dirPath, 'package.json') as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        scripts?: Record<string, string>;
      };

      // Detect TypeScript
      if (
        pkg.dependencies?.['typescript'] ||
        pkg.devDependencies?.['typescript'] ||
        this.fileExists(dirPath, 'tsconfig.json')
      ) {
        stack.language = 'typescript';
        stack.configFiles.push('package.json', 'tsconfig.json');
      } else {
        stack.language = 'javascript';
        stack.configFiles.push('package.json');
      }

      // Detect package manager
      if (this.fileExists(dirPath, 'pnpm-lock.yaml')) {
        stack.packageManager = 'pnpm';
      } else if (this.fileExists(dirPath, 'yarn.lock')) {
        stack.packageManager = 'yarn';
      } else if (this.fileExists(dirPath, 'package-lock.json')) {
        stack.packageManager = 'npm';
      }

      // Detect test framework
      if (pkg.dependencies?.['vitest'] || pkg.devDependencies?.['vitest']) {
        stack.testFramework = 'vitest';
      } else if (pkg.dependencies?.['jest'] || pkg.devDependencies?.['jest']) {
        stack.testFramework = 'jest';
      } else if (pkg.dependencies?.['mocha'] || pkg.devDependencies?.['mocha']) {
        stack.testFramework = 'mocha';
      }

      // Detect linter
      if (this.fileExists(dirPath, '.eslintrc.js') || this.fileExists(dirPath, '.eslintrc.json') || this.fileExists(dirPath, 'eslint.config.js')) {
        stack.linter = 'eslint';
        stack.configFiles.push('.eslintrc.js', '.eslintrc.json', 'eslint.config.js');
      }

      // Detect formatter
      if (pkg.dependencies?.['prettier'] || pkg.devDependencies?.['prettier'] || this.fileExists(dirPath, '.prettierrc')) {
        stack.formatter = 'prettier';
      }

      // Detect type checker
      if (stack.language === 'typescript') {
        stack.typeChecker = 'typescript';
      }

      // Detect framework
      if (pkg.dependencies?.['next']) {
        stack.framework = 'Next.js';
      } else if (pkg.dependencies?.['@nestjs/core']) {
        stack.framework = 'NestJS';
      } else if (pkg.dependencies?.['express']) {
        stack.framework = 'Express';
      } else if (pkg.dependencies?.['react']) {
        stack.framework = 'React';
      }

      // Detect project scripts from package.json
      if (pkg.scripts && typeof pkg.scripts === 'object') {
        stack.scripts = pkg.scripts as Record<string, string>;
      }
    }

    // Python detection
    else if (
      this.fileExists(dirPath, 'pyproject.toml') ||
      this.fileExists(dirPath, 'setup.py') ||
      this.fileExists(dirPath, 'requirements.txt') ||
      this.fileExists(dirPath, 'Pipfile')
    ) {
      stack.language = 'python';

      if (this.fileExists(dirPath, 'pyproject.toml')) {
        stack.configFiles.push('pyproject.toml');
        stack.packageManager = 'poetry';
      } else if (this.fileExists(dirPath, 'Pipfile')) {
        stack.packageManager = 'pip';
        stack.configFiles.push('Pipfile');
      } else if (this.fileExists(dirPath, 'requirements.txt')) {
        stack.packageManager = 'pip';
        stack.configFiles.push('requirements.txt');
      }

      // Detect test framework
      if (this.fileExists(dirPath, 'pytest.ini') || this.searchInFiles(dirPath, ['**/test_*.py', '**/*_test.py'], 'pytest')) {
        stack.testFramework = 'pytest';
      } else if (this.searchInFiles(dirPath, ['**/test_*.py'], 'unittest')) {
        stack.testFramework = 'unittest';
      }

      // Detect linter - check pyproject.toml first for ruff configuration
      let detectedLinter = false;
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        try {
          const pyprojectContent = fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8');
          // Check for ruff in pyproject.toml
          if (pyprojectContent.includes('[tool.ruff]') || pyprojectContent.includes('tool.ruff')) {
            stack.linter = 'ruff';
            stack.configFiles.push('pyproject.toml');
            detectedLinter = true;
          }
          // Check for poetry scripts that might indicate linter
          if (!detectedLinter && pyprojectContent.includes('[tool.poetry.scripts]')) {
            if (pyprojectContent.includes('lint') && pyprojectContent.includes('ruff')) {
              stack.linter = 'ruff';
              detectedLinter = true;
            }
          }
        } catch {
          // Continue to file-based detection
        }
      }
      
      // Fall back to file-based detection
      if (!detectedLinter) {
        if (this.fileExists(dirPath, '.ruff.toml') || this.fileExists(dirPath, 'ruff.toml')) {
          stack.linter = 'ruff';
          stack.configFiles.push('.ruff.toml', 'ruff.toml');
        } else if (this.fileExists(dirPath, '.flake8') || this.fileExists(dirPath, 'setup.cfg')) {
          stack.linter = 'flake8';
        } else if (this.fileExists(dirPath, '.pylintrc')) {
          stack.linter = 'pylint';
        }
      }

      // Detect formatter
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        const pyproject = this.readTOML(dirPath, 'pyproject.toml');
        const tool = pyproject['tool'] as Record<string, unknown> | undefined;
        if (tool && typeof tool === 'object') {
          if ('ruff' in tool || 'black' in tool) {
            stack.formatter = 'ruff' in tool ? 'ruff format' : 'black';
          }
        }
      }

      // Detect type checker
      if (this.fileExists(dirPath, 'pyproject.toml')) {
        const pyproject = this.readTOML(dirPath, 'pyproject.toml');
        const tool = pyproject['tool'] as Record<string, unknown> | undefined;
        if (tool && typeof tool === 'object' && 'mypy' in tool) {
          stack.typeChecker = 'mypy';
        } else if (this.fileExists(dirPath, 'pyrightconfig.json')) {
          stack.typeChecker = 'pyright';
        }
      }

      // Detect framework
      if (this.fileExists(dirPath, 'requirements.txt')) {
        const content = fs.readFileSync(path.join(dirPath, 'requirements.txt'), 'utf8');
        if (content.includes('django')) stack.framework = 'Django';
        else if (content.includes('flask')) stack.framework = 'Flask';
        else if (content.includes('fastapi')) stack.framework = 'FastAPI';
      }

      // Detect project scripts from pyproject.toml [tool.poetry.scripts]
      if (this.fileExists(dirPath, 'pyproject.toml') && stack.packageManager === 'poetry') {
        try {
          const pyprojectContent = fs.readFileSync(path.join(dirPath, 'pyproject.toml'), 'utf8');
          const scripts: Record<string, string> = {};
          
          // Parse [tool.poetry.scripts] section
          const scriptsMatch = pyprojectContent.match(/\[tool\.poetry\.scripts\]([\s\S]*?)(?=\[|$)/);
          if (scriptsMatch) {
            const scriptsSection = scriptsMatch[1];
            // Extract script definitions: name = "command" or name = 'command'
            // Support both single and double quotes, and handle kebab-case names
            const scriptLines = scriptsSection.split('\n');
            for (const line of scriptLines) {
              // Match: name = "command" or name = 'command'
              // Also handle names with dashes: my-script = "command"
              const match = line.match(/([\w-]+)\s*=\s*["']([^"']+)["']/);
              if (match) {
                const [, name, command] = match;
                scripts[name] = command;
              }
            }
          }
          
          if (Object.keys(scripts).length > 0) {
            stack.scripts = scripts;
          }
        } catch {
          // Continue without scripts
        }
      }
    }

    // Java detection
    else if (this.fileExists(dirPath, 'pom.xml') || this.fileExists(dirPath, 'build.gradle')) {
      stack.language = 'java';
      if (this.fileExists(dirPath, 'pom.xml')) {
        stack.packageManager = 'maven';
        stack.configFiles.push('pom.xml');
      } else {
        stack.packageManager = 'gradle';
        stack.configFiles.push('build.gradle');
      }
      stack.testFramework = 'junit';
    }

    // Go detection
    else if (this.fileExists(dirPath, 'go.mod')) {
      stack.language = 'go';
      stack.packageManager = 'go';
      stack.testFramework = 'go test';
      stack.linter = 'golangci-lint';
      stack.configFiles.push('go.mod');
    }

    return stack;
  }

  /**
   * Detect if project is a monorepo
   */
  private detectMonorepo(): boolean {
    // Check for common monorepo indicators
    return (
      this.fileExists(this.projectRoot, 'pnpm-workspace.yaml') ||
      this.fileExists(this.projectRoot, 'lerna.json') ||
      this.fileExists(this.projectRoot, 'turbo.json') ||
      this.fileExists(this.projectRoot, 'nx.json') ||
      (this.fileExists(this.projectRoot, 'package.json') &&
        (this.readJSON(this.projectRoot, 'package.json') as { workspaces?: string[] })?.workspaces) !== undefined
    );
  }

  /**
   * Deduplicate languages (merge similar stacks)
   */
  private deduplicateLanguages(languages: LanguageStack[]): LanguageStack[] {
    const seen = new Map<string, LanguageStack>();

    for (const lang of languages) {
      const key = `${lang.language}-${lang.packageManager || 'none'}`;
      if (!seen.has(key) || lang.rootPath === this.projectRoot) {
        seen.set(key, lang);
      }
    }

    return Array.from(seen.values());
  }

  // Helper methods
  private fileExists(dirPath: string, filename: string): boolean {
    try {
      return fs.existsSync(path.join(dirPath, filename));
    } catch {
      return false;
    }
  }

  private readJSON(dirPath: string, filename: string): unknown {
    try {
      const content = fs.readFileSync(path.join(dirPath, filename), 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private readTOML(dirPath: string, filename: string): Record<string, unknown> {
    try {
      // Simple TOML parsing for pyproject.toml
      const content = fs.readFileSync(path.join(dirPath, filename), 'utf8');
      // This is a simplified parser - in production, use a proper TOML library
      const result: Record<string, unknown> = {};
      const toolMatch = content.match(/\[tool\.(\w+)\]/);
      if (toolMatch) {
        result['tool'] = { [toolMatch[1]]: {} };
      }
      return result;
    } catch {
      return {};
    }
  }

  private searchInFiles(dirPath: string, patterns: string[], searchTerm: string): boolean {
    try {
      // Simplified search - in production, use glob
      const allFiles = fs.readdirSync(dirPath, { recursive: true });
      const testFiles = allFiles.filter((file): file is string =>
        typeof file === 'string' && patterns.some(pattern => file.includes(pattern.replace('**/', '')))
      );

      for (const file of testFiles.slice(0, 5)) {
        try {
          const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
          if (content.includes(searchTerm)) return true;
        } catch {
          // Continue
        }
      }
      return false;
    } catch {
      return false;
    }
  }
}

