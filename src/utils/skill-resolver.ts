/**
 * Skill path resolution with intelligent auto-discovery
 * Prioritizes: current dir > examples/skills > absolute path
 */

import fs from 'fs';
import path from 'path';

export interface SkillResolutionResult {
  found: boolean;
  path?: string;
  searchedPaths: string[];
}

/**
 * Resolve a skill name or path to an absolute directory path
 * 
 * Search order:
 * 1. Exact path if it exists (absolute or relative)
 * 2. Current directory / <name>
 * 3. examples/skills/<name>
 * 4. Current directory (if name is '.')
 */
export function resolveSkillPath(nameOrPath: string, cwd: string = process.cwd()): SkillResolutionResult {
  const searchedPaths: string[] = [];
  
  // Normalize the input
  const normalized = nameOrPath.trim();
  
  // Case 1: Check if it's an exact path (absolute or relative)
  const absolutePath = path.isAbsolute(normalized)
    ? normalized
    : path.resolve(cwd, normalized);
  
  if (fs.existsSync(absolutePath) && fs.statSync(absolutePath).isDirectory()) {
    // Verify it's actually a skill directory
    if (isSkillDirectory(absolutePath)) {
      return { found: true, path: absolutePath, searchedPaths: [absolutePath] };
    }
  }
  searchedPaths.push(absolutePath);
  
  // Case 2: Check current directory / <name>
  const currentDirPath = path.join(cwd, normalized);
  if (fs.existsSync(currentDirPath) && fs.statSync(currentDirPath).isDirectory()) {
    if (isSkillDirectory(currentDirPath)) {
      return { found: true, path: currentDirPath, searchedPaths };
    }
  }
  searchedPaths.push(currentDirPath);
  
  // Case 3: Check examples/skills/<name>
  const examplesPath = path.join(cwd, 'examples', 'skills', normalized);
  if (fs.existsSync(examplesPath) && fs.statSync(examplesPath).isDirectory()) {
    if (isSkillDirectory(examplesPath)) {
      return { found: true, path: examplesPath, searchedPaths };
    }
  }
  searchedPaths.push(examplesPath);
  
  // Case 4: If name is just '.', check if current directory is a skill
  if (normalized === '.' && isSkillDirectory(cwd)) {
    return { found: true, path: cwd, searchedPaths };
  }
  
  // Not found
  return { found: false, searchedPaths };
}

/**
 * Check if a directory contains skill metadata files
 */
export function isSkillDirectory(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    
    // Must have SKILL.yaml OR SKILL.md
    const hasMetadata = files.includes('SKILL.yaml') || files.includes('SKILL.md');
    
    // Must have index.js (or index.ts in dev mode)
    const hasImplementation = files.includes('index.js') || files.includes('index.ts');
    
    return hasMetadata && hasImplementation;
  } catch {
    return false;
  }
}

/**
 * Discover all skill directories in a given root
 * Used by list-skills command
 */
export function discoverSkills(rootDir: string, maxDepth: number = 3): string[] {
  const skills: string[] = [];
  
  function search(dir: string, depth: number) {
    if (depth > maxDepth) return;
    
    try {
      if (isSkillDirectory(dir)) {
        skills.push(dir);
        return; // Don't recurse into skill directories
      }
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          search(path.join(dir, entry.name), depth + 1);
        }
      }
    } catch {
      // Ignore permission errors, etc.
    }
  }
  
  search(rootDir, 0);
  return skills;
}

/**
 * Get default skill search paths
 */
export function getDefaultSkillPaths(cwd: string = process.cwd()): string[] {
  return [
    cwd, // Current directory
    path.join(cwd, 'examples', 'skills'), // Examples directory
    path.join(cwd, 'skills'), // Skills directory
  ].filter(p => fs.existsSync(p));
}

