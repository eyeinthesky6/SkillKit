/**
 * Framework Adapter System
 * 
 * Provides abstraction for language/framework-specific commands
 * (lint, type-check, test, build, etc.)
 */

export interface AdapterCommandResult {
  /** Exit code (0 = success) */
  exitCode: number;
  /** Standard output */
  stdout: string;
  /** Standard error */
  stderr: string;
  /** Execution duration in ms */
  duration: number;
  /** Whether command succeeded */
  success: boolean;
}

export interface ProjectInfo {
  /** Project root directory */
  rootDir: string;
  /** Detected language(s) */
  languages: string[];
  /** Detected framework (if any) */
  framework?: string;
  /** Build tool */
  buildTool?: string;
  /** Package manager */
  packageManager?: string;
}

/**
 * Framework Adapter Interface
 * 
 * Implement this for each language/framework to provide
 * consistent command abstraction across different tech stacks
 */
export interface FrameworkAdapter {
  /** Adapter name (e.g., "typescript", "python", "java") */
  readonly name: string;
  
  /** Adapter version */
  readonly version: string;
  
  /**
   * Detect if this adapter can handle the project
   * @param projectRoot - Root directory of the project
   * @returns true if this adapter is suitable for the project
   */
  detect(projectRoot: string): Promise<boolean>;
  
  /**
   * Get project information
   * @param projectRoot - Root directory of the project
   * @returns Project metadata
   */
  getProjectInfo(projectRoot: string): Promise<ProjectInfo>;
  
  /**
   * Run linter
   * @returns Command result with lint errors
   */
  lint(): Promise<AdapterCommandResult>;
  
  /**
   * Run type checker
   * @returns Command result with type errors
   */
  typeCheck(): Promise<AdapterCommandResult>;
  
  /**
   * Run tests
   * @param pattern - Optional test pattern/filter
   * @returns Command result with test results
   */
  test(pattern?: string): Promise<AdapterCommandResult>;
  
  /**
   * Run build
   * @returns Command result with build output
   */
  build(): Promise<AdapterCommandResult>;
  
  /**
   * Find TODO/FIXME/HACK comments
   * @returns Array of file paths with TODOs
   */
  findTodos(): Promise<string[]>;
  
  /**
   * Find circular dependencies (if supported)
   * @returns Array of circular dependency paths
   */
  findCircularDeps?(): Promise<string[]>;
  
  /**
   * Format code
   * @returns Command result
   */
  format?(): Promise<AdapterCommandResult>;
  
  /**
   * Install dependencies
   * @returns Command result
   */
  install?(): Promise<AdapterCommandResult>;
}

/**
 * Adapter Registry
 * Manages available framework adapters
 */
export interface AdapterRegistry {
  /**
   * Register an adapter
   */
  register(adapter: FrameworkAdapter): void;
  
  /**
   * Get adapter by name
   */
  get(name: string): FrameworkAdapter | undefined;
  
  /**
   * List all registered adapters
   */
  list(): FrameworkAdapter[];
  
  /**
   * Auto-detect best adapter for a project
   * @param projectRoot - Root directory of the project
   * @returns Best matching adapter or undefined
   */
  detect(projectRoot: string): Promise<FrameworkAdapter | undefined>;
}

