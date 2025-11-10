/**
 * Tests for version-checker utility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {
  getCurrentVersion,
  getInstalledVersion,
  getVersionInfo,
  getCustomizedFiles,
  detectSkippedVersions,
  isFileCustomized,
  getCustomizationInfo,
} from '../utils/version-checker.js';

describe('version-checker', () => {
  const testDir = path.join(process.cwd(), 'test-temp-version-checker');
  
  beforeEach(async () => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
    await fs.ensureDir(testDir);
    await fs.ensureDir(path.join(testDir, '.skillkit'));
  });
  
  afterEach(async () => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      await fs.remove(testDir);
    }
  });
  
  describe('getCurrentVersion', () => {
    it('should return current version from package.json', () => {
      const version = getCurrentVersion();
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
  
  describe('getInstalledVersion', () => {
    it('should return null if version.json does not exist', () => {
      const version = getInstalledVersion(testDir);
      expect(version).toBeNull();
    });
    
    it('should return installed version from version.json', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const version = getInstalledVersion(testDir);
      expect(version).toBe('0.0.1');
    });
  });
  
  describe('detectSkippedVersions', () => {
    it('should detect skipped minor versions', () => {
      const result = detectSkippedVersions('0.0.1', '0.0.5');
      expect(result.skipped).toBe(true);
      expect(result.hasBreakingChanges).toBe(false);
    });
    
    it('should detect major version changes', () => {
      const result = detectSkippedVersions('0.0.5', '1.0.0');
      expect(result.skipped).toBe(true);
      expect(result.hasBreakingChanges).toBe(true);
    });
    
    it('should not detect skipped versions for sequential updates', () => {
      const result = detectSkippedVersions('0.0.4', '0.0.5');
      expect(result.skipped).toBe(false);
      expect(result.hasBreakingChanges).toBe(false);
    });
  });
  
  describe('getVersionInfo', () => {
    it('should return null if not installed', () => {
      const info = getVersionInfo(testDir);
      expect(info).toBeNull();
    });
    
    it('should return version info if installed', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const info = getVersionInfo(testDir);
      expect(info).not.toBeNull();
      expect(info?.installed).toBe('0.0.1');
    });
  });
  
  describe('getCustomizedFiles', () => {
    it('should return empty array if no customizations', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const customizations = getCustomizedFiles(testDir);
      expect(customizations).toEqual([]);
    });
    
    it('should return customized files from version.json', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [
          {
            file: '.cursor/commands/BEGIN_SESSION.md',
            customizedAt: new Date().toISOString(),
            originalHash: 'abc123',
            originalVersion: '0.0.1',
            intentional: true,
            customizedVia: 'META_CUSTOMIZE',
          },
        ],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const customizations = getCustomizedFiles(testDir);
      expect(customizations).toHaveLength(1);
      expect(customizations[0].file).toBe('.cursor/commands/BEGIN_SESSION.md');
      expect(customizations[0].intentional).toBe(true);
      expect(customizations[0].customizedVia).toBe('META_CUSTOMIZE');
    });
  });
  
  describe('isFileCustomized', () => {
    it('should return false if file is not customized', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const isCustomized = isFileCustomized(
        path.join(testDir, '.cursor', 'commands', 'BEGIN_SESSION.md'),
        testDir
      );
      expect(isCustomized).toBe(false);
    });
    
    it('should return true if file is customized', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [
          {
            file: '.cursor/commands/BEGIN_SESSION.md',
            customizedAt: new Date().toISOString(),
            originalHash: 'abc123',
            originalVersion: '0.0.1',
            intentional: true,
            customizedVia: 'META_CUSTOMIZE',
          },
        ],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const isCustomized = isFileCustomized(
        path.join(testDir, '.cursor', 'commands', 'BEGIN_SESSION.md'),
        testDir
      );
      expect(isCustomized).toBe(true);
    });
  });
  
  describe('getCustomizationInfo', () => {
    it('should return null if file is not customized', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const info = getCustomizationInfo(
        path.join(testDir, '.cursor', 'commands', 'BEGIN_SESSION.md'),
        testDir
      );
      expect(info).toBeNull();
    });
    
    it('should return customization info if file is customized', async () => {
      const versionData = {
        version: '0.0.1',
        installedAt: new Date().toISOString(),
        projectRoot: testDir,
        workflowsInstalled: [],
        customizations: [
          {
            file: '.cursor/commands/BEGIN_SESSION.md',
            customizedAt: new Date().toISOString(),
            originalHash: 'abc123',
            originalVersion: '0.0.1',
            intentional: true,
            customizedVia: 'manual',
          },
        ],
      };
      
      await fs.writeFile(
        path.join(testDir, '.skillkit', 'version.json'),
        JSON.stringify(versionData, null, 2)
      );
      
      const info = getCustomizationInfo(
        path.join(testDir, '.cursor', 'commands', 'BEGIN_SESSION.md'),
        testDir
      );
      expect(info).not.toBeNull();
      expect(info?.file).toBe('.cursor/commands/BEGIN_SESSION.md');
      expect(info?.intentional).toBe(true);
      expect(info?.customizedVia).toBe('manual');
    });
  });
});

