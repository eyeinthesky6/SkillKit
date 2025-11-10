/**
 * Package Manager Types
 * Layer 1: Universal Package Management
 */

export interface InstallOptions {
  /** Install to global location (~/.claude/skills or ~/.agent/skills) */
  global?: boolean;
  /** Use universal mode (.agent instead of .claude) */
  universal?: boolean;
  /** Install all skills without prompting */
  all?: boolean;
  /** Skills to install (if not interactive) */
  skills?: string[];
  /** Force overwrite existing skills */
  force?: boolean;
}

export interface SyncOptions {
  /** Output file path (default: ./AGENTS.md) */
  output?: string;
  /** Auto-include all installed skills */
  auto?: boolean;
  /** Skills to include (if not interactive) */
  skills?: string[];
}

export interface SkillLocation {
  /** Skill name */
  name: string;
  /** Full path to skill directory */
  path: string;
  /** Location type */
  type: 'project-universal' | 'global-universal' | 'project' | 'global';
  /** Priority (lower = higher priority) */
  priority: number;
}

export interface DiscoveredSkill {
  /** Skill name */
  name: string;
  /** Skill description */
  description: string;
  /** Skill version */
  version?: string;
  /** Source (github repo) */
  source?: string;
  /** Has SKILL.md */
  hasSKILLmd: boolean;
  /** Has SKILL.yaml */
  hasSKILLyaml: boolean;
  /** Has index.js */
  hasImplementation: boolean;
  /** Path to skill directory */
  path: string;
  /** Bundled resources */
  resources?: {
    scripts: string[];
    references: string[];
    assets: string[];
  };
}

export interface GitHubRepo {
  /** Repository URL or shorthand (user/repo) */
  repo: string;
  /** Specific path within repo (e.g., 'skills/pdf') */
  path?: string;
  /** Branch to clone */
  branch?: string;
}

export interface StorageLocation {
  /** Base directory */
  base: string;
  /** Type */
  type: 'project-universal' | 'global-universal' | 'project' | 'global';
  /** Priority (1-4) */
  priority: number;
  /** Whether location exists */
  exists: boolean;
}

export interface AGENTSMDSkill {
  name: string;
  description: string;
  location?: 'project' | 'plugin';
}

