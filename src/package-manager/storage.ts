/**
 * Storage Manager
 * Handles multi-location skill storage with priority lookup
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import type { StorageLocation, SkillLocation, InstallOptions } from './types.js';

export class StorageManager {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Get all storage locations in priority order
   * Priority: 1. .agent (project), 2. .agent (global), 3. .claude (project), 4. .claude (global)
   */
  getStorageLocations(): StorageLocation[] {
    const homeDir = os.homedir();

    return [
      {
        base: path.join(this.projectRoot, '.agent', 'skills'),
        type: 'project-universal',
        priority: 1,
        exists: fs.existsSync(path.join(this.projectRoot, '.agent', 'skills')),
      },
      {
        base: path.join(homeDir, '.agent', 'skills'),
        type: 'global-universal',
        priority: 2,
        exists: fs.existsSync(path.join(homeDir, '.agent', 'skills')),
      },
      {
        base: path.join(this.projectRoot, '.claude', 'skills'),
        type: 'project',
        priority: 3,
        exists: fs.existsSync(path.join(this.projectRoot, '.claude', 'skills')),
      },
      {
        base: path.join(homeDir, '.claude', 'skills'),
        type: 'global',
        priority: 4,
        exists: fs.existsSync(path.join(homeDir, '.claude', 'skills')),
      },
    ];
  }

  /**
   * Get target installation location based on options
   */
  getInstallLocation(options: InstallOptions = {}): StorageLocation {
    const { global = false, universal = false } = options;
    const homeDir = os.homedir();

    if (global && universal) {
      return {
        base: path.join(homeDir, '.agent', 'skills'),
        type: 'global-universal',
        priority: 2,
        exists: fs.existsSync(path.join(homeDir, '.agent', 'skills')),
      };
    }

    if (global) {
      return {
        base: path.join(homeDir, '.claude', 'skills'),
        type: 'global',
        priority: 4,
        exists: fs.existsSync(path.join(homeDir, '.claude', 'skills')),
      };
    }

    if (universal) {
      return {
        base: path.join(this.projectRoot, '.agent', 'skills'),
        type: 'project-universal',
        priority: 1,
        exists: fs.existsSync(path.join(this.projectRoot, '.agent', 'skills')),
      };
    }

    // Default: project .claude
    return {
      base: path.join(this.projectRoot, '.claude', 'skills'),
      type: 'project',
      priority: 3,
      exists: fs.existsSync(path.join(this.projectRoot, '.claude', 'skills')),
    };
  }

  /**
   * Find skill across all storage locations
   * Returns highest priority location where skill exists
   */
  findSkill(skillName: string): SkillLocation | null {
    const locations = this.getStorageLocations();

    for (const location of locations) {
      if (!location.exists) continue;

      const skillPath = path.join(location.base, skillName);
      if (fs.existsSync(skillPath)) {
        return {
          name: skillName,
          path: skillPath,
          type: location.type,
          priority: location.priority,
        };
      }
    }

    return null;
  }

  /**
   * List all installed skills across all locations
   * Deduplicates by name, keeping highest priority
   */
  listAllSkills(): SkillLocation[] {
    const locations = this.getStorageLocations();
    const skillMap = new Map<string, SkillLocation>();

    for (const location of locations) {
      if (!location.exists) continue;

      try {
        const entries = fs.readdirSync(location.base, { withFileTypes: true });

        for (const entry of entries) {
          if (!entry.isDirectory()) continue;

          const skillName = entry.name;
          const skillPath = path.join(location.base, skillName);

          // Only add if not already found (higher priority)
          if (!skillMap.has(skillName)) {
            // Verify it's actually a skill
            if (this.isSkillDirectory(skillPath)) {
              skillMap.set(skillName, {
                name: skillName,
                path: skillPath,
                type: location.type,
                priority: location.priority,
              });
            }
          }
        }
      } catch {
        // Skip locations that can't be read
        continue;
      }
    }

    return Array.from(skillMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Check if directory contains a valid skill
   */
  private isSkillDirectory(dir: string): boolean {
    const hasSKILLmd = fs.existsSync(path.join(dir, 'SKILL.md'));
    const hasSKILLyaml = fs.existsSync(path.join(dir, 'SKILL.yaml'));
    const hasIndex = fs.existsSync(path.join(dir, 'index.js'));

    return (hasSKILLmd || hasSKILLyaml) && hasIndex;
  }

  /**
   * Ensure storage location exists
   */
  ensureLocation(location: StorageLocation): void {
    if (!fs.existsSync(location.base)) {
      fs.mkdirSync(location.base, { recursive: true });
    }
  }

  /**
   * Check if skill exists at target location
   */
  skillExists(skillName: string, location: StorageLocation): boolean {
    const skillPath = path.join(location.base, skillName);
    return fs.existsSync(skillPath);
  }

  /**
   * Remove skill from storage
   */
  removeSkill(skillLocation: SkillLocation): void {
    if (fs.existsSync(skillLocation.path)) {
      fs.rmSync(skillLocation.path, { recursive: true, force: true });
    }
  }
}

