/**
 * Package Manager
 * Main orchestrator for Layer 1: Universal Package Management
 */

import { StorageManager } from './storage.js';
import { GitHubIntegration } from './github.js';
import { InteractiveTUI } from './tui.js';
import { AGENTSMDGenerator } from './agents-md.js';
import type { InstallOptions, SyncOptions, DiscoveredSkill, SkillLocation } from './types.js';

export class PackageManager {
  private storage: StorageManager;
  private github: GitHubIntegration;
  private tui: InteractiveTUI;
  private agentsMD: AGENTSMDGenerator;

  constructor(projectRoot: string = process.cwd()) {
    this.storage = new StorageManager(projectRoot);
    this.github = new GitHubIntegration();
    this.tui = new InteractiveTUI();
    this.agentsMD = new AGENTSMDGenerator(projectRoot);
  }

  /**
   * Install skills from GitHub repository
   */
  async install(repoString: string, options: InstallOptions = {}): Promise<void> {
    const spinner = this.tui.spinner('Cloning repository...');

    try {
      // Parse repository
      const githubRepo = this.github.parseRepo(repoString);
      spinner.text = `Cloning ${githubRepo.repo}...`;

      // Clone repository
      const repoDir = await this.github.cloneRepo(githubRepo);
      spinner.text = 'Discovering skills...';

      // Discover skills
      const discoveredSkills = await this.github.discoverSkills(repoDir, githubRepo);

      if (discoveredSkills.length === 0) {
        spinner.fail('No skills found in repository');
        this.github.cleanup();
        return;
      }

      spinner.succeed(`Found ${discoveredSkills.length} skill(s)`);

      // Select skills (interactive or all)
      let selectedSkills: DiscoveredSkill[];

      if (options.all) {
        selectedSkills = discoveredSkills;
      } else if (options.skills && options.skills.length > 0) {
        selectedSkills = discoveredSkills.filter((s) =>
          options.skills!.includes(s.name),
        );
      } else {
        // Interactive selection
        const selectedNames = await this.tui.selectSkillsToInstall(discoveredSkills);
        if (selectedNames.length === 0) {
          this.tui.warn('No skills selected');
          this.github.cleanup();
          return;
        }
        selectedSkills = discoveredSkills.filter((s) => selectedNames.includes(s.name));
      }

      // Get installation location
      const location = this.storage.getInstallLocation(options);
      this.storage.ensureLocation(location);

      // Install skills
      const installSpinner = this.tui.spinner('Installing skills...');
      const installed: string[] = [];
      const failed: string[] = [];

      for (const skill of selectedSkills) {
        try {
          // Check if exists
          if (this.storage.skillExists(skill.name, location) && !options.force) {
            installSpinner.text = `Skipping ${skill.name} (already exists)`;
            failed.push(skill.name);
            continue;
          }

          installSpinner.text = `Installing ${skill.name}...`;
          try {
            await this.github.copySkill(skill, location.base, options.force || false);
            installed.push(skill.name);
          } catch (error) {
            if (error instanceof Error && error.message.includes('identical content')) {
              // Content-based duplicate detected
              installSpinner.text = `Skipping ${skill.name} (identical content)`;
              continue;
            }
            throw error;
          }
        } catch {
          failed.push(skill.name);
        }
      }

      installSpinner.succeed('Installation complete');

      // Show summary
      this.tui.showInstallSummary(installed, failed, location.base);

      // Cleanup
      this.github.cleanup();
    } catch (error) {
      spinner.fail(`Installation failed: ${error}`);
      this.github.cleanup();
      throw error;
    }
  }

  /**
   * List all installed skills
   */
  list(): void {
    const skills = this.storage.listAllSkills();
    this.tui.showSkillTable(skills);
  }

  /**
   * Sync AGENTS.md with installed skills
   */
  async sync(options: SyncOptions = {}): Promise<void> {
    const allSkills = this.storage.listAllSkills();

    if (allSkills.length === 0) {
      this.tui.warn('No skills installed');
      this.tui.info('Install skills with: tsk install <repo>');
      return;
    }

    // Get current skills from AGENTS.md
    const agentsMdPath = options.output || 'AGENTS.md';
    const currentSkills = this.agentsMD.parseExistingAGENTSMD(agentsMdPath);

    // Select skills (interactive or auto)
    let selectedSkills: SkillLocation[];

    if (options.auto) {
      selectedSkills = allSkills;
    } else if (options.skills && options.skills.length > 0) {
      selectedSkills = allSkills.filter((s) => options.skills!.includes(s.name));
    } else {
      // Interactive selection
      const selectedNames = await this.tui.selectSkillsForAgentsMD(allSkills, currentSkills);
      selectedSkills = allSkills.filter((s) => selectedNames.includes(s.name));
    }

    // Generate and write AGENTS.md
    const spinner = this.tui.spinner('Generating AGENTS.md...');

    try {
      await this.agentsMD.writeAGENTSMD(selectedSkills, options);
      spinner.succeed(`AGENTS.md updated with ${selectedSkills.length} skill(s)`);
      this.tui.info(`File: ${agentsMdPath}`);
    } catch (error) {
      spinner.fail(`Failed to update AGENTS.md: ${error}`);
      throw error;
    }
  }

  /**
   * Remove installed skills
   */
  async remove(options: { skills?: string[] } = {}): Promise<void> {
    const allSkills = this.storage.listAllSkills();

    if (allSkills.length === 0) {
      this.tui.warn('No skills installed');
      return;
    }

    // Select skills
    let skillsToRemove: SkillLocation[];

    if (options.skills && options.skills.length > 0) {
      skillsToRemove = allSkills.filter((s) => options.skills!.includes(s.name));
    } else {
      // Interactive selection
      const selectedNames = await this.tui.selectSkillsToRemove(allSkills);
      if (selectedNames.length === 0) {
        this.tui.warn('No skills selected');
        return;
      }
      skillsToRemove = allSkills.filter((s) => selectedNames.includes(s.name));
    }

    // Confirm removal
    const confirmed = await this.tui.confirm(
      `Remove ${skillsToRemove.length} skill(s)?`,
      false,
    );

    if (!confirmed) {
      this.tui.warn('Cancelled');
      return;
    }

    // Remove skills
    const spinner = this.tui.spinner('Removing skills...');
    const removed: string[] = [];

    for (const skill of skillsToRemove) {
      try {
        this.storage.removeSkill(skill);
        removed.push(skill.name);
      } catch {
        // Continue with others
      }
    }

    spinner.succeed(`Removed ${removed.length} skill(s)`);

    removed.forEach((name) => {
      console.log(`  • ${name}`);
    });
  }
}

// Export everything
export * from './types.js';
export { StorageManager } from './storage.js';
export { GitHubIntegration } from './github.js';
export { InteractiveTUI } from './tui.js';
export { AGENTSMDGenerator } from './agents-md.js';

