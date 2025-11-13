/**
 * Version Checker Utility
 * Handles version comparison, update detection, and customization tracking
 */

import fs from 'fs-extra';
import path from 'path';

export interface VersionInfo {
  installed: string;
  current: string;
  skippedVersions: string[];
  hasBreakingChanges: boolean;
}

export interface CustomizedFile {
  file: string;
  customizedAt: string;
  originalHash: string;
  currentHash?: string;
  originalVersion: string;
  intentional?: boolean; // true if customized via META_CUSTOMIZE (expected, not a conflict)
  customizedVia?: 'META_CUSTOMIZE' | 'manual' | 'unknown'; // How it was customized
}

export interface VersionMetadata {
  version: string;
  installedAt: string;
  projectRoot: string;
  workflowsInstalled: string[];
  customizations: CustomizedFile[];
}

/**
 * Get current SkillKit version from package.json
 */
export function getCurrentVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * Get installed version from .skillkit/version.json
 */
export function getInstalledVersion(projectRoot: string): string | null {
  try {
    const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
    if (!fs.existsSync(versionFile)) {
      return null;
    }
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf-8')) as VersionMetadata;
    return versionData.version;
  } catch {
    return null;
  }
}

/**
 * Parse semantic version
 */
function parseVersion(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split('.').map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
}

/**
 * Compare two versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);

  if (parsed1.major !== parsed2.major) {
    return parsed1.major - parsed2.major;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor - parsed2.minor;
  }
  return parsed1.patch - parsed2.patch;
}

/**
 * Check if versions were skipped (non-linear update)
 */
export function detectSkippedVersions(installed: string, current: string): {
  skipped: boolean;
  skippedVersions: string[];
  hasBreakingChanges: boolean;
} {
  const installedParsed = parseVersion(installed);
  const currentParsed = parseVersion(current);

  // Check if major version changed (any major version increase is considered skipped)
  const majorChanged = currentParsed.major > installedParsed.major;
  
  // Check if minor version skipped (same major, minor jumped by more than 1)
  const minorSkipped = 
    currentParsed.major === installedParsed.major && 
    currentParsed.minor > installedParsed.minor + 1;
  
  // Check if patch version skipped (same major and minor, patch jumped by more than 1)
  const patchSkipped = 
    currentParsed.major === installedParsed.major &&
    currentParsed.minor === installedParsed.minor &&
    currentParsed.patch > installedParsed.patch + 1;

  // Any non-sequential update is considered skipped (major changes, or jumps in minor/patch)
  const skipped = majorChanged || minorSkipped || patchSkipped;
  const hasBreakingChanges = currentParsed.major > installedParsed.major;

  // Generate list of skipped versions by parsing CHANGELOG.md
  const skippedVersions: string[] = [];
  if (skipped) {
    try {
      // Try to parse CHANGELOG.md for actual versions
      // Try multiple possible paths (works in both source and compiled code)
      const possiblePaths = [
        path.join(__dirname, '..', '..', 'CHANGELOG.md'),
        path.join(process.cwd(), 'CHANGELOG.md'),
        path.join(process.cwd(), '..', 'CHANGELOG.md'),
      ];
      
      let changelogPath: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          changelogPath = p;
          break;
        }
      }
      
      if (changelogPath) {
        const changelogContent = fs.readFileSync(changelogPath, 'utf-8');
        // Match version headers like "## [0.0.1] - 2025-11-07" or "## [0.0.1]"
        const versionRegex = /^##\s*\[([\d.]+)\]/gm;
        const matches = changelogContent.matchAll(versionRegex);
        const allVersions: string[] = [];
        
        for (const match of matches) {
          const version = match[1];
          if (version) {
            allVersions.push(version);
          }
        }
        
        // Filter versions between installed and current
        const installedVersion = installedParsed.major * 10000 + installedParsed.minor * 100 + installedParsed.patch;
        const currentVersion = currentParsed.major * 10000 + currentParsed.minor * 100 + currentParsed.patch;
        
        for (const version of allVersions) {
          const parsed = parseVersion(version);
          const versionNum = parsed.major * 10000 + parsed.minor * 100 + parsed.patch;
          if (versionNum > installedVersion && versionNum < currentVersion) {
            skippedVersions.push(version);
          }
        }
        
        // Sort versions (newest first)
        skippedVersions.sort((a, b) => compareVersions(b, a));
      }
    } catch {
      // Fallback to estimation if CHANGELOG.md parsing fails
      for (let major = installedParsed.major; major < currentParsed.major; major++) {
        skippedVersions.push(`${major + 1}.0.0`);
      }
    }
    
    // If no versions found from CHANGELOG, fallback to estimation
    if (skippedVersions.length === 0) {
      for (let major = installedParsed.major; major < currentParsed.major; major++) {
        skippedVersions.push(`${major + 1}.0.0`);
      }
    }
  }

  return { skipped, skippedVersions, hasBreakingChanges };
}

/**
 * Get version comparison info
 */
export function getVersionInfo(projectRoot: string): VersionInfo | null {
  const installed = getInstalledVersion(projectRoot);
  if (!installed) {
    return null;
  }

  const current = getCurrentVersion();
  const comparison = compareVersions(installed, current);

  if (comparison >= 0) {
    // Already up to date or ahead
    return {
      installed,
      current,
      skippedVersions: [],
      hasBreakingChanges: false,
    };
  }

  const skipped = detectSkippedVersions(installed, current);

  return {
    installed,
    current,
    skippedVersions: skipped.skippedVersions,
    hasBreakingChanges: skipped.hasBreakingChanges,
  };
}

/**
 * Get customized files from version metadata
 */
export function getCustomizedFiles(projectRoot: string): CustomizedFile[] {
  try {
    const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
    if (!fs.existsSync(versionFile)) {
      return [];
    }
    const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf-8')) as VersionMetadata;
    return versionData.customizations || [];
  } catch {
    return [];
  }
}

/**
 * Check if file is customized
 */
export function isFileCustomized(filePath: string, projectRoot: string): boolean {
  const customizations = getCustomizedFiles(projectRoot);
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  return customizations.some(c => {
    const normalizedCustomFile = c.file.replace(/\\/g, '/');
    return normalizedCustomFile === relativePath;
  });
}

/**
 * Get customization info for a file
 */
export function getCustomizationInfo(filePath: string, projectRoot: string): CustomizedFile | null {
  const customizations = getCustomizedFiles(projectRoot);
  const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
  return customizations.find(c => {
    const normalizedCustomFile = c.file.replace(/\\/g, '/');
    return normalizedCustomFile === relativePath;
  }) || null;
}

