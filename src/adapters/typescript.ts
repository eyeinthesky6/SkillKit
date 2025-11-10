import { BaseAdapter } from './base';
import { AdapterCommandResult, FrameworkAdapter, ProjectInfo } from './types';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/**
 * TypeScript/JavaScript Adapter
 * 
 * Supports:
 * - Package managers: npm, pnpm, yarn
 * - Linters: eslint
 * - Type checkers: tsc
 * - Test frameworks: vitest, jest, mocha
 * - Build tools: tsc, vite, webpack, esbuild
 */
export class TypeScriptAdapter extends BaseAdapter implements FrameworkAdapter {
  readonly name = 'typescript';
  readonly version = '1.0.0';

  private packageManager?: 'npm' | 'pnpm' | 'yarn';
  private scripts?: Record<string, string>;

  async detect(projectRoot: string): Promise<boolean> {
    this.projectRoot = projectRoot;
    
    // Check for package.json
    if (!(await this.fileExists('package.json'))) {
      return false;
    }

    // Parse package.json to check for TypeScript
    try {
      const packageJson = JSON.parse(await this.readFile('package.json'));
      this.scripts = packageJson.scripts || {};
      
      // Check for TypeScript in dependencies or devDependencies
      const hasTsSomewhere =
        packageJson.dependencies?.typescript ||
        packageJson.devDependencies?.typescript ||
        (await this.fileExists('tsconfig.json'));

      return hasTsSomewhere;
    } catch {
      return false;
    }
  }

  async getProjectInfo(projectRoot: string): Promise<ProjectInfo> {
    this.projectRoot = projectRoot;
    
    // Detect package manager
    this.packageManager = await this.detectPackageManager();
    
    // Parse package.json
    const packageJson = JSON.parse(await this.readFile('package.json'));
    this.scripts = packageJson.scripts || {};
    
    // Detect framework
    const framework = this.detectFramework(packageJson);
    
    return {
      rootDir: projectRoot,
      languages: ['typescript', 'javascript'],
      framework,
      buildTool: this.detectBuildTool(packageJson),
      packageManager: this.packageManager,
    };
  }

  async lint(): Promise<AdapterCommandResult> {
    // Try package.json script first
    if (this.scripts && this.scripts['lint']) {
      return this.runScript('lint');
    }
    
    // Try eslint directly
    if (await this.fileExists('.eslintrc.js') || await this.fileExists('.eslintrc.json')) {
      return this.executeCommand(`${this.packageManager} exec eslint .`);
    }
    
    return {
      exitCode: 0,
      stdout: 'No linter configured',
      stderr: '',
      duration: 0,
      success: true,
    };
  }

  async typeCheck(): Promise<AdapterCommandResult> {
    // Try package.json script first
    if (this.scripts && (this.scripts['type-check'] || this.scripts['typecheck'])) {
      return this.runScript(this.scripts['type-check'] ? 'type-check' : 'typecheck');
    }
    
    // Try tsc directly
    if (await this.fileExists('tsconfig.json')) {
      return this.executeCommand(`${this.packageManager} exec tsc --noEmit`);
    }
    
    return {
      exitCode: 0,
      stdout: 'No type checking configured',
      stderr: '',
      duration: 0,
      success: true,
    };
  }

  async test(pattern?: string): Promise<AdapterCommandResult> {
    const testCmd = (this.scripts && this.scripts['test']) || 'test';
    const patternArg = pattern ? ` ${pattern}` : '';
    
    return this.runScript(testCmd + patternArg);
  }

  async build(): Promise<AdapterCommandResult> {
    if (this.scripts && this.scripts['build']) {
      return this.runScript('build');
    }
    
    // Try tsc directly
    if (await this.fileExists('tsconfig.json')) {
      return this.executeCommand(`${this.packageManager} exec tsc`);
    }
    
    return {
      exitCode: 1,
      stdout: '',
      stderr: 'No build command configured',
      duration: 0,
      success: false,
    };
  }

  async findTodos(): Promise<string[]> {
    const extensions = ['ts', 'tsx', 'js', 'jsx'];
    return this.findFiles('TODO|FIXME|HACK|XXX', extensions);
  }

  async findCircularDeps(): Promise<string[]> {
    // Try madge if available
    const result = await this.executeCommand(
      `${this.packageManager} exec madge --circular src`
    );
    
    if (!result.success) return [];
    
    // Parse madge output
    const lines = result.stdout.split('\n').filter(line => line.includes('→'));
    return lines;
  }

  async format(): Promise<AdapterCommandResult> {
    if (this.scripts && this.scripts['format']) {
      return this.runScript('format');
    }
    
    // Try prettier directly
    if (await this.fileExists('.prettierrc') || await this.fileExists('prettier.config.js')) {
      return this.executeCommand(`${this.packageManager} exec prettier --write .`);
    }
    
    return {
      exitCode: 0,
      stdout: 'No formatter configured',
      stderr: '',
      duration: 0,
      success: true,
    };
  }

  async install(): Promise<AdapterCommandResult> {
    return this.executeCommand(`${this.packageManager} install`);
  }

  /**
   * Detect package manager
   */
  private async detectPackageManager(): Promise<'npm' | 'pnpm' | 'yarn'> {
    if (await this.fileExists('pnpm-lock.yaml')) return 'pnpm';
    if (await this.fileExists('yarn.lock')) return 'yarn';
    return 'npm';
  }

  /**
   * Detect framework
   */
  private detectFramework(packageJson: PackageJson): string | undefined {
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    } as Record<string, string>;

    if (deps['next']) return 'Next.js';
    if (deps['react']) return 'React';
    if (deps['vue']) return 'Vue';
    if (deps['@angular/core']) return 'Angular';
    if (deps['express']) return 'Express';
    if (deps['nestjs']) return 'NestJS';
    
    return undefined;
  }

  /**
   * Detect build tool
   */
  private detectBuildTool(packageJson: PackageJson): string | undefined {
    const deps = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    } as Record<string, string>;

    if (deps['vite']) return 'vite';
    if (deps['webpack']) return 'webpack';
    if (deps['esbuild']) return 'esbuild';
    if (deps['rollup']) return 'rollup';
    if (deps['typescript']) return 'tsc';
    
    return undefined;
  }

  /**
   * Run npm script
   */
  private async runScript(script: string): Promise<AdapterCommandResult> {
    const cmd = this.packageManager === 'npm'
      ? `npm run ${script}`
      : `${this.packageManager} run ${script}`;
    
    return this.executeCommand(cmd);
  }
}

