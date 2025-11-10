/**
 * Project Analyzer - Understands project architecture
 * 
 * Reads project files to understand:
 * - Architecture patterns (contracts-first, types-first, etc.)
 * - Tech stack (Zod, tRPC, Prisma, etc.)
 * - Quality rules (ESLint configs, testing patterns)
 * - Project conventions (file structure, naming)
 * 
 * Then adapts workflows based on what it finds.
 */

import fs from 'fs';
import path from 'path';

export interface ProjectArchitecture {
  language: 'typescript' | 'python' | 'java' | 'go' | 'unknown';
  framework?: string;
  patterns: {
    contractsFirst?: boolean;      // Uses Zod/JSON Schema contracts
    typeFirst?: boolean;            // Types defined before implementation
    testDriven?: boolean;           // Tests before implementation
    domainDriven?: boolean;         // DDD structure
    microservices?: boolean;        // Microservices architecture
    eventDriven?: boolean;          // Event-driven patterns
    layered?: boolean;              // Layered architecture (controllers/services/repos)
  };
  tools: {
    validation?: 'zod' | 'yup' | 'joi' | 'pydantic';
    testing?: 'jest' | 'vitest' | 'pytest' | 'junit';
    orm?: 'prisma' | 'typeorm' | 'sequelize' | 'sqlalchemy';
    api?: 'trpc' | 'graphql' | 'rest';
    linting?: {
      tool: 'eslint' | 'flake8' | 'checkstyle';
      rules: string[];
      strictness: 'strict' | 'moderate' | 'loose';
    };
  };
  structure: {
    monorepo?: boolean;
    hasTests?: boolean;
    hasContracts?: boolean;
    hasDocs?: boolean;
    hasAudit?: boolean;
  };
  conventions: {
    fileNaming?: 'kebab-case' | 'camelCase' | 'PascalCase';
    importStyle?: 'named' | 'default' | 'namespace';
    asyncStyle?: 'async-await' | 'promises' | 'callbacks';
  };
}

export class ProjectAnalyzer {
  private projectRoot: string;
  private cache: Map<string, ProjectArchitecture> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps: Map<string, number> = new Map();

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Clear cache for a specific project or all projects
   */
  public clearCache(projectPath?: string): void {
    if (projectPath) {
      this.cache.delete(projectPath);
      this.cacheTimestamps.delete(projectPath);
    } else {
      this.cache.clear();
      this.cacheTimestamps.clear();
    }
  }

  /**
   * Check if cache is valid for a project
   */
  private isCacheValid(projectPath: string): boolean {
    const timestamp = this.cacheTimestamps.get(projectPath);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.cacheTimeout;
  }

  /**
   * Analyze project architecture (with caching)
   */
  async analyze(): Promise<ProjectArchitecture> {
    // Check cache first
    if (this.isCacheValid(this.projectRoot)) {
      const cached = this.cache.get(this.projectRoot);
      if (cached) {
        return cached;
      }
    }

    // Perform analysis
    const arch: ProjectArchitecture = {
      language: await this.detectLanguage(),
      patterns: {},
      tools: {},
      structure: {},
      conventions: {}
    };

    // Detect framework
    arch.framework = await this.detectFramework(arch.language);

    // Detect patterns
    arch.patterns = await this.detectPatterns();

    // Detect tools
    arch.tools = await this.detectTools(arch.language);

    // Detect structure
    arch.structure = await this.detectStructure();

    // Detect conventions
    arch.conventions = await this.detectConventions();

    // Cache the result
    this.cache.set(this.projectRoot, arch);
    this.cacheTimestamps.set(this.projectRoot, Date.now());

    return arch;
  }

  /**
   * Detect primary language
   */
  private async detectLanguage(): Promise<ProjectArchitecture['language']> {
    if (this.fileExists('package.json')) {
      const pkg = this.readJSON('package.json') as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      if (pkg['dependencies']?.['typescript'] || pkg['devDependencies']?.['typescript'] || this.fileExists('tsconfig.json')) {
        return 'typescript';
      }
      return 'typescript'; // Assume TS if has package.json
    }
    if (this.fileExists('pyproject.toml') || this.fileExists('setup.py') || this.fileExists('requirements.txt')) {
      return 'python';
    }
    if (this.fileExists('pom.xml') || this.fileExists('build.gradle')) {
      return 'java';
    }
    if (this.fileExists('go.mod')) {
      return 'go';
    }
    return 'unknown';
  }

  /**
   * Detect framework
   */
  private async detectFramework(language: string): Promise<string | undefined> {
    if (language === 'typescript') {
      const pkg = this.readJSON('package.json') as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const deps = { ...(pkg['dependencies'] || {}), ...(pkg['devDependencies'] || {}) } as Record<string, string>;
      
      if (deps['next']) return 'Next.js';
      if (deps['@nestjs/core']) return 'NestJS';
      if (deps['express']) return 'Express';
      if (deps['react']) return 'React';
      if (deps['vue']) return 'Vue';
    }
    
    if (language === 'python') {
      const reqPath = path.join(this.projectRoot, 'requirements.txt');
      if (fs.existsSync(reqPath)) {
        const content = fs.readFileSync(reqPath, 'utf8');
        if (content.includes('django')) return 'Django';
        if (content.includes('flask')) return 'Flask';
        if (content.includes('fastapi')) return 'FastAPI';
      }
    }
    
    return undefined;
  }

  /**
   * Detect architecture patterns
   */
  private async detectPatterns(): Promise<ProjectArchitecture['patterns']> {
    const patterns: ProjectArchitecture['patterns'] = {};

    // Contracts-first: Look for Zod schemas, JSON schemas
    const hasZod = this.searchInFiles(['**/*.ts'], 'z\\.object\\(|z\\.string\\(|import.*zod');
    const hasJsonSchema = this.fileExists('schemas/') || this.searchInFiles(['**/*.json'], '"\\$schema"');
    patterns.contractsFirst = hasZod || hasJsonSchema;

    // Type-first: TypeScript with strict mode
    if (this.fileExists('tsconfig.json')) {
      const tsconfig = this.readJSON('tsconfig.json') as { compilerOptions?: { strict?: boolean } };
      patterns.typeFirst = tsconfig['compilerOptions']?.['strict'] === true;
    }

    // Test-driven: Tests directory exists and has many tests
    const testFiles = this.findFiles(['**/*.test.ts', '**/*.spec.ts', '**/test_*.py']);
    patterns.testDriven = testFiles.length > 5;

    // Domain-driven: Has domain/entities/services structure
    const hasDomainStructure = 
      this.fileExists('src/domain/') || 
      this.fileExists('src/entities/') ||
      this.fileExists('src/services/');
    patterns.domainDriven = hasDomainStructure;

    // Microservices: Multiple services in separate directories
    const hasServicesDir = this.fileExists('services/') || this.fileExists('apps/');
    patterns.microservices = hasServicesDir;

    // Event-driven: Event bus, message queue, event handlers
    const hasEventHandlers = 
      this.searchInFiles(['**/*.ts'], 'EventEmitter|@Subscribe|@EventHandler') ||
      this.searchInFiles(['**/*.py'], '@event|event_handler|subscribe');
    patterns.eventDriven = hasEventHandlers;

    // Layered: Controllers/Services/Repositories pattern
    const hasLayeredStructure =
      (this.fileExists('src/controllers/') && this.fileExists('src/services/')) ||
      (this.fileExists('src/api/') && this.fileExists('src/services/')) ||
      this.searchInFiles(['**/*.ts'], 'export class.*Controller|export class.*Service');
    patterns.layered = hasLayeredStructure;

    return patterns;
  }

  /**
   * Detect tools and their configurations
   */
  private async detectTools(language: string): Promise<ProjectArchitecture['tools']> {
    const tools: ProjectArchitecture['tools'] = {};

    if (language === 'typescript') {
      const pkg = this.readJSON('package.json') as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
      const deps = { ...(pkg['dependencies'] || {}), ...(pkg['devDependencies'] || {}) } as Record<string, string>;

      // Validation
      if (deps['zod']) tools.validation = 'zod';
      else if (deps['yup']) tools.validation = 'yup';
      else if (deps['joi']) tools.validation = 'joi';

      // Testing
      if (deps['vitest']) tools.testing = 'vitest';
      else if (deps['jest']) tools.testing = 'jest';

      // ORM
      if (deps['prisma'] || deps['@prisma/client']) tools.orm = 'prisma';
      else if (deps['typeorm']) tools.orm = 'typeorm';
      else if (deps['sequelize']) tools.orm = 'sequelize';

      // API
      if (deps['@trpc/server']) tools.api = 'trpc';
      else if (deps['graphql']) tools.api = 'graphql';

      // Linting
      if (this.fileExists('.eslintrc.js') || this.fileExists('.eslintrc.json') || this.fileExists('eslint.config.js')) {
        tools.linting = await this.analyzeESLintConfig();
      }
    }

    if (language === 'python') {
      const reqPath = path.join(this.projectRoot, 'requirements.txt');
      if (fs.existsSync(reqPath)) {
        const content = fs.readFileSync(reqPath, 'utf8');
        
        if (content.includes('pydantic')) tools.validation = 'pydantic';
        if (content.includes('pytest')) tools.testing = 'pytest';
        if (content.includes('sqlalchemy')) tools.orm = 'sqlalchemy';
      }
    }

    return tools;
  }

  /**
   * Analyze ESLint configuration strictness
   */
  private async analyzeESLintConfig(): Promise<ProjectArchitecture['tools']['linting']> {
    let config: Record<string, unknown> = {};
    
    if (this.fileExists('.eslintrc.json')) {
      config = this.readJSON('.eslintrc.json');
    } else if (this.fileExists('.eslintrc.js')) {
      // Can't easily parse JS config, assume moderate
      return { tool: 'eslint', rules: [], strictness: 'moderate' };
    }

    const rules = (config['rules'] as Record<string, unknown>) || {};
    const ruleNames = Object.keys(rules);
    
    // Count strict rules (errors)
    const errorCount = ruleNames.filter(r => {
      const rule = rules[r];
      return rule === 'error' || (Array.isArray(rule) && rule[0] === 'error');
    }).length;
    const strictness = errorCount > 20 ? 'strict' : errorCount > 10 ? 'moderate' : 'loose';

    return {
      tool: 'eslint',
      rules: ruleNames,
      strictness
    };
  }

  /**
   * Detect project structure
   */
  private async detectStructure(): Promise<ProjectArchitecture['structure']> {
    return {
      monorepo: this.fileExists('pnpm-workspace.yaml') || this.fileExists('lerna.json'),
      hasTests: this.fileExists('tests/') || this.fileExists('__tests__/') || this.fileExists('test/'),
      hasContracts: this.fileExists('contracts/') || this.fileExists('schemas/'),
      hasDocs: this.fileExists('docs/'),
      hasAudit: this.fileExists('docs/audit/') || this.fileExists('docs/AITracking/')
    };
  }

  /**
   * Detect coding conventions
   */
  private async detectConventions(): Promise<ProjectArchitecture['conventions']> {
    const files = this.findFiles(['src/**/*.ts', 'src/**/*.js', 'src/**/*.py']);
    
    // Analyze file naming
    const kebabCount = files.filter(f => /[a-z-]+\.(ts|js|py)$/.test(f)).length;
    const camelCount = files.filter(f => /[a-z][A-Z].*\.(ts|js|py)$/.test(f)).length;
    const pascalCount = files.filter(f => /^[A-Z][a-z].*\.(ts|js|py)$/.test(path.basename(f))).length;
    
    let fileNaming: ProjectArchitecture['conventions']['fileNaming'] = 'kebab-case';
    if (camelCount > kebabCount && camelCount > pascalCount) fileNaming = 'camelCase';
    if (pascalCount > kebabCount && pascalCount > camelCount) fileNaming = 'PascalCase';

    return { fileNaming };
  }

  // Utility methods
  private fileExists(relPath: string): boolean {
    return fs.existsSync(path.join(this.projectRoot, relPath));
  }

  private readJSON(relPath: string): Record<string, unknown> {
    try {
      const fullPath = path.join(this.projectRoot, relPath);
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch {
      return {};
    }
  }

  private findFiles(_patterns: string[]): string[] {
    // Simplified file finding (patterns unused - scans all files)
    const files: string[] = [];
    const scan = (dir: string) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scan(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    };
    scan(this.projectRoot);
    return files;
  }

  private searchInFiles(patterns: string[], searchTerm: string): boolean {
    const files = this.findFiles(patterns);
    for (const file of files.slice(0, 50)) { // Limit search
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (new RegExp(searchTerm).test(content)) return true;
      } catch {
        continue;
      }
    }
    return false;
  }
}

