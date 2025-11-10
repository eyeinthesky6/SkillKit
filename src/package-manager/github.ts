/**
 * GitHub Integration
 * Clone repositories and discover skills
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import matter from 'gray-matter';
import YAML from 'yaml';
import type { GitHubRepo, DiscoveredSkill } from './types.js';

const execAsync = promisify(exec);

export class GitHubIntegration {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), '.skillkit', 'temp');
  }

  /**
   * Parse GitHub repo string
   * Examples: "anthropics/skills", "https://github.com/anthropics/skills", "user/repo/path/to/skill"
   */
  parseRepo(repoString: string): GitHubRepo {
    // Remove github.com URL if present
    const cleaned = repoString
      .replace(/^https?:\/\/github\.com\//, '')
      .replace(/\.git$/, '');

    // Split by /
    const parts = cleaned.split('/');

    if (parts.length < 2) {
      throw new Error(`Invalid repository format: ${repoString}. Expected: user/repo or user/repo/path`);
    }

    const repo = `${parts[0]}/${parts[1]}`;
    const skillPath = parts.length > 2 ? parts.slice(2).join('/') : undefined;

    return { repo, path: skillPath };
  }

  /**
   * Clone repository to temp directory
   */
  async cloneRepo(githubRepo: GitHubRepo): Promise<string> {
    const { repo, branch = 'main' } = githubRepo;
    const repoName = repo.replace('/', '_');
    const targetDir = path.join(this.tempDir, repoName);

    // Clean up existing
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    // Ensure temp dir exists
    fs.mkdirSync(this.tempDir, { recursive: true });

    // Clone with depth=1 for speed
    const repoUrl = `https://github.com/${repo}.git`;
    try {
      await execAsync(`git clone --depth 1 --branch ${branch} ${repoUrl} "${targetDir}"`);
    } catch (error) {
      // Try without branch if main doesn't exist
      if (branch === 'main') {
        try {
          await execAsync(`git clone --depth 1 ${repoUrl} "${targetDir}"`);
        } catch (retryError) {
          throw new Error(`Failed to clone repository ${repo}: ${retryError}`);
        }
      } else {
        throw new Error(`Failed to clone repository ${repo} (branch: ${branch}): ${error}`);
      }
    }

    return targetDir;
  }

  /**
   * Discover all skills in a directory
   */
  async discoverSkills(directory: string, githubRepo?: GitHubRepo): Promise<DiscoveredSkill[]> {
    const skills: DiscoveredSkill[] = [];

    // If path specified, only scan that subdirectory
    const scanDir = githubRepo?.path
      ? path.join(directory, githubRepo.path)
      : directory;

    if (!fs.existsSync(scanDir)) {
      throw new Error(`Directory not found: ${scanDir}`);
    }

    const entries = fs.readdirSync(scanDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const skillDir = path.join(scanDir, entry.name);
      const skill = await this.parseSkillDirectory(skillDir, githubRepo);

      if (skill) {
        skills.push(skill);
      }
    }

    return skills;
  }

  /**
   * Parse a skill directory and extract metadata
   */
  private async parseSkillDirectory(
    skillDir: string,
    githubRepo?: GitHubRepo,
  ): Promise<DiscoveredSkill | null> {
    const skillName = path.basename(skillDir);
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    const skillYamlPath = path.join(skillDir, 'SKILL.yaml');
    const indexPath = path.join(skillDir, 'index.js');

    const hasSKILLmd = fs.existsSync(skillMdPath);
    const hasSKILLyaml = fs.existsSync(skillYamlPath);
    const hasImplementation = fs.existsSync(indexPath);

    // Must have metadata (SKILL.md or SKILL.yaml)
    if (!hasSKILLmd && !hasSKILLyaml) {
      return null;
    }

    // Parse metadata
    let metadata: Record<string, unknown> = {};

    if (hasSKILLmd) {
      const content = fs.readFileSync(skillMdPath, 'utf-8');
      const parsed = matter(content);
      metadata = parsed.data;
    } else if (hasSKILLyaml) {
      const content = fs.readFileSync(skillYamlPath, 'utf-8');
      metadata = YAML.parse(content);
    }

    // Discover bundled resources
    const resources = {
      scripts: this.findFiles(skillDir, 'scripts'),
      references: this.findFiles(skillDir, 'references'),
      assets: this.findFiles(skillDir, 'assets'),
    };

    return {
      name: (typeof metadata['name'] === 'string' ? metadata['name'] : skillName),
      description: (typeof metadata['description'] === 'string' ? metadata['description'] : 'No description'),
      version: (typeof metadata['version'] === 'string' ? metadata['version'] : undefined),
      source: githubRepo?.repo,
      hasSKILLmd,
      hasSKILLyaml,
      hasImplementation,
      path: skillDir,
      resources,
    };
  }

  /**
   * Find files in a subdirectory
   */
  private findFiles(baseDir: string, subDir: string): string[] {
    const targetDir = path.join(baseDir, subDir);
    if (!fs.existsSync(targetDir)) return [];

    try {
      return fs.readdirSync(targetDir);
    } catch {
      return [];
    }
  }

  /**
   * Copy skill to target location
   */
  async copySkill(skill: DiscoveredSkill, targetDir: string): Promise<void> {
    const skillTargetDir = path.join(targetDir, skill.name);

    // Check if exists
    if (fs.existsSync(skillTargetDir)) {
      throw new Error(`Skill already exists: ${skill.name}. Use --force to overwrite.`);
    }

    // Copy entire skill directory
    await this.copyDirectory(skill.path, skillTargetDir);
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    fs.mkdirSync(dest, { recursive: true });

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup(): void {
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }
  }
}

