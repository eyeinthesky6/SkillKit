import fs from 'fs';
import path from 'path';

/**
 * Command Mapper - Maps generic intents to project-specific commands
 * 
 * Instead of hardcoding "pnpm lint", we discover what commands
 * the project actually uses and map generic intents to them.
 */

export interface CommandMapping {
  intent: string;
  command: string;
  source: string;
}

export class CommandMapper {
  private projectRoot: string;
  private cache: Map<string, CommandMapping> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Discover all available commands in the project
   */
  async discover(): Promise<CommandMapping[]> {
    const mappings: CommandMapping[] = [];

    // TypeScript/JavaScript - package.json
    const pkgPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const scripts = pkg.scripts || {};
      
      // Detect package manager
      const hasYarnLock = fs.existsSync(path.join(this.projectRoot, 'yarn.lock'));
      const hasPnpmLock = fs.existsSync(path.join(this.projectRoot, 'pnpm-lock.yaml'));
      const pm = hasPnpmLock ? 'pnpm' : hasYarnLock ? 'yarn' : 'npm';
      
      for (const [scriptName, scriptCmd] of Object.entries(scripts)) {
        mappings.push({
          intent: this.inferIntent(scriptName, scriptCmd as string),
          command: `${pm} run ${scriptName}`,
          source: 'package.json'
        });
      }
    }

    // Python - multiple sources
    const pythonMappings = await this.discoverPython();
    mappings.push(...pythonMappings);

    // Java - pom.xml or build.gradle
    const javaMappings = await this.discoverJava();
    mappings.push(...javaMappings);

    // Go - Makefile or direct commands
    const goMappings = await this.discoverGo();
    mappings.push(...goMappings);

    // Cache for quick lookup
    mappings.forEach(m => this.cache.set(m.intent, m));

    return mappings;
  }

  /**
   * Get command for a generic intent
   */
  async getCommand(intent: string): Promise<string | null> {
    if (this.cache.size === 0) {
      await this.discover();
    }
    
    const mapping = this.cache.get(intent);
    return mapping ? mapping.command : null;
  }

  /**
   * Execute a command by intent
   */
  async execute(intent: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const command = await this.getCommand(intent);
    if (!command) {
      throw new Error(`No command found for intent: ${intent}`);
    }

    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    try {
      const { stdout, stderr } = await execAsync(command, { cwd: this.projectRoot });
      return { stdout, stderr, exitCode: 0 };
    } catch (error: unknown) {
      const err = error as { stdout?: string; stderr?: string; message?: string; code?: number };
      return {
        stdout: err.stdout || '',
        stderr: err.stderr || err.message || '',
        exitCode: err.code || 1
      };
    }
  }

  /**
   * Infer intent from script name and command
   */
  private inferIntent(name: string, cmd: string): string {
    const nameLower = name.toLowerCase();
    const cmdLower = cmd.toLowerCase();
    
    // Exact matches
    if (nameLower === 'lint' || nameLower === 'eslint') return 'lint';
    if (nameLower === 'test' || nameLower === 'jest' || nameLower === 'vitest') return 'test';
    if (nameLower === 'build' || nameLower === 'compile') return 'build';
    if (nameLower === 'format' || nameLower === 'prettier') return 'format';
    if (nameLower === 'dev' || nameLower === 'start') return 'dev';
    
    // TypeScript specific - check package.json has typescript
    if (nameLower.includes('type') || cmdLower.includes('tsc')) return 'typecheck';
    
    // Fuzzy matches
    if (nameLower.includes('lint')) return 'lint';
    if (nameLower.includes('test') || nameLower.includes('coverage')) return 'test';
    if (nameLower.includes('build')) return 'build';
    if (nameLower.includes('format')) return 'format';
    
    // Command-based inference
    if (cmdLower.includes('eslint')) return 'lint';
    if (cmdLower.includes('tsc')) return 'typecheck';
    if (cmdLower.includes('jest') || cmdLower.includes('vitest') || cmdLower.includes('mocha')) return 'test';
    if (cmdLower.includes('webpack') || cmdLower.includes('vite') || cmdLower.includes('rollup')) return 'build';
    if (cmdLower.includes('prettier')) return 'format';
    
    return nameLower; // Fallback to script name
  }

  /**
   * Discover Python commands
   */
  private async discoverPython(): Promise<CommandMapping[]> {
    const mappings: CommandMapping[] = [];

    // pyproject.toml (Poetry, Black, etc.)
    const pyprojectPath = path.join(this.projectRoot, 'pyproject.toml');
    if (fs.existsSync(pyprojectPath)) {
      const content = fs.readFileSync(pyprojectPath, 'utf8');
      
      // Check for Poetry
      if (content.includes('[tool.poetry]')) {
        mappings.push(
          { intent: 'install', command: 'poetry install', source: 'pyproject.toml' },
          { intent: 'test', command: 'poetry run pytest', source: 'pyproject.toml' },
          { intent: 'lint', command: 'poetry run flake8', source: 'pyproject.toml' }
        );
      }
      
      // Check for Black
      if (content.includes('[tool.black]')) {
        mappings.push({ intent: 'format', command: 'black .', source: 'pyproject.toml' });
      }
      
      // Check for mypy
      if (content.includes('[tool.mypy]')) {
        mappings.push({ intent: 'typecheck', command: 'mypy .', source: 'pyproject.toml' });
      }
    }

    // requirements.txt (pip)
    const reqPath = path.join(this.projectRoot, 'requirements.txt');
    if (fs.existsSync(reqPath)) {
      mappings.push({ intent: 'install', command: 'pip install -r requirements.txt', source: 'requirements.txt' });
    }

    // setup.py
    const setupPath = path.join(this.projectRoot, 'setup.py');
    if (fs.existsSync(setupPath)) {
      mappings.push(
        { intent: 'install', command: 'pip install -e .', source: 'setup.py' },
        { intent: 'test', command: 'python setup.py test', source: 'setup.py' }
      );
    }

    // Makefile (common in Python projects)
    const makefilePath = path.join(this.projectRoot, 'Makefile');
    if (fs.existsSync(makefilePath)) {
      const content = fs.readFileSync(makefilePath, 'utf8');
      const targets = content.match(/^([a-z_-]+):/gm)?.map(t => t.slice(0, -1)) || [];
      
      targets.forEach(target => {
        mappings.push({
          intent: this.inferIntent(target, target),
          command: `make ${target}`,
          source: 'Makefile'
        });
      });
    }

    return mappings;
  }

  /**
   * Discover Java commands
   */
  private async discoverJava(): Promise<CommandMapping[]> {
    const mappings: CommandMapping[] = [];

    // Maven - pom.xml
    const pomPath = path.join(this.projectRoot, 'pom.xml');
    if (fs.existsSync(pomPath)) {
      mappings.push(
        { intent: 'build', command: 'mvn compile', source: 'pom.xml' },
        { intent: 'test', command: 'mvn test', source: 'pom.xml' },
        { intent: 'package', command: 'mvn package', source: 'pom.xml' },
        { intent: 'install', command: 'mvn install', source: 'pom.xml' },
        { intent: 'clean', command: 'mvn clean', source: 'pom.xml' }
      );
    }

    // Gradle - build.gradle or build.gradle.kts
    const gradlePath = path.join(this.projectRoot, 'build.gradle');
    const gradleKtsPath = path.join(this.projectRoot, 'build.gradle.kts');
    if (fs.existsSync(gradlePath) || fs.existsSync(gradleKtsPath)) {
      const wrapper = fs.existsSync(path.join(this.projectRoot, 'gradlew')) ? './gradlew' : 'gradle';
      mappings.push(
        { intent: 'build', command: `${wrapper} build`, source: 'build.gradle' },
        { intent: 'test', command: `${wrapper} test`, source: 'build.gradle' },
        { intent: 'clean', command: `${wrapper} clean`, source: 'build.gradle' }
      );
    }

    return mappings;
  }

  /**
   * Discover Go commands
   */
  private async discoverGo(): Promise<CommandMapping[]> {
    const mappings: CommandMapping[] = [];

    // go.mod
    const goModPath = path.join(this.projectRoot, 'go.mod');
    if (fs.existsSync(goModPath)) {
      mappings.push(
        { intent: 'build', command: 'go build', source: 'go.mod' },
        { intent: 'test', command: 'go test ./...', source: 'go.mod' },
        { intent: 'install', command: 'go mod download', source: 'go.mod' },
        { intent: 'format', command: 'go fmt ./...', source: 'go.mod' },
        { intent: 'lint', command: 'golangci-lint run', source: 'go.mod' }
      );
    }

    // Makefile
    const makefilePath = path.join(this.projectRoot, 'Makefile');
    if (fs.existsSync(makefilePath)) {
      const content = fs.readFileSync(makefilePath, 'utf8');
      const targets = content.match(/^([a-z_-]+):/gm)?.map(t => t.slice(0, -1)) || [];
      
      targets.forEach(target => {
        mappings.push({
          intent: this.inferIntent(target, target),
          command: `make ${target}`,
          source: 'Makefile'
        });
      });
    }

    return mappings;
  }
}

