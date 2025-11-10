/**
 * Interactive TUI
 * Beautiful checkbox selection and output
 */

import inquirer from 'inquirer';
import ora, { type Ora } from 'ora';
import chalk from 'chalk';
import type { DiscoveredSkill, SkillLocation } from './types.js';

export class InteractiveTUI {
  /**
   * Prompt user to select skills to install
   */
  async selectSkillsToInstall(skills: DiscoveredSkill[]): Promise<string[]> {
    if (skills.length === 0) {
      console.log(chalk.yellow('No skills found to install.'));
      return [];
    }

    console.log(chalk.bold('\n📦 Available Skills:\n'));

    const choices = skills.map((skill) => ({
      name: `${chalk.cyan(skill.name)} - ${chalk.gray(skill.description)}`,
      value: skill.name,
      checked: true, // All checked by default (like OpenSkills)
    }));

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'skills',
        message: 'Select skills to install:',
        choices,
        pageSize: 15,
      },
    ]);

    return answer.skills as string[];
  }

  /**
   * Prompt user to select skills for AGENTS.md
   */
  async selectSkillsForAgentsMD(
    skills: SkillLocation[],
    currentSkills: string[] = [],
  ): Promise<string[]> {
    if (skills.length === 0) {
      console.log(chalk.yellow('No skills installed.'));
      return [];
    }

    console.log(chalk.bold('\n🔄 Sync AGENTS.md:\n'));

    const choices = skills.map((skill) => ({
      name: chalk.cyan(skill.name),
      value: skill.name,
      checked: currentSkills.includes(skill.name),
    }));

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'skills',
        message: 'Select skills to include in AGENTS.md:',
        choices,
        pageSize: 15,
      },
    ]);

    return answer.skills as string[];
  }

  /**
   * Prompt user to select skills to remove
   */
  async selectSkillsToRemove(skills: SkillLocation[]): Promise<string[]> {
    if (skills.length === 0) {
      console.log(chalk.yellow('No skills installed.'));
      return [];
    }

    console.log(chalk.bold('\n🗑️  Remove Skills:\n'));

    const choices = skills.map((skill) => ({
      name: `${chalk.cyan(skill.name)} ${chalk.gray(`(${skill.type})`)}`,
      value: skill.name,
      checked: false, // Nothing checked by default (safe)
    }));

    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'skills',
        message: 'Select skills to remove:',
        choices,
        pageSize: 15,
      },
    ]);

    return answer.skills as string[];
  }

  /**
   * Confirm action
   */
  async confirm(message: string, defaultValue = false): Promise<boolean> {
    const answer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue,
      },
    ]);

    return answer.confirmed as boolean;
  }

  /**
   * Create a spinner for long operations
   */
  spinner(text: string): Ora {
    return ora({
      text,
      color: 'cyan',
    }).start();
  }

  /**
   * Show success message
   */
  success(message: string): void {
    console.log(chalk.green('✔'), chalk.bold(message));
  }

  /**
   * Show error message
   */
  error(message: string): void {
    console.log(chalk.red('✖'), chalk.bold(message));
  }

  /**
   * Show warning message
   */
  warn(message: string): void {
    console.log(chalk.yellow('⚠'), chalk.bold(message));
  }

  /**
   * Show info message
   */
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  /**
   * Show skill table
   */
  showSkillTable(skills: SkillLocation[]): void {
    if (skills.length === 0) {
      console.log(chalk.yellow('\nNo skills installed.\n'));
      return;
    }

    console.log(chalk.bold('\n📦 Installed Skills:\n'));

    // Header
    console.log(
      chalk.gray(
        '  ' +
          'Name'.padEnd(30) +
          'Location'.padEnd(20) +
          'Priority',
      ),
    );
    console.log(chalk.gray('  ' + '-'.repeat(60)));

    // Skills
    for (const skill of skills) {
      const name = chalk.cyan(skill.name).padEnd(38); // 30 + chalk codes
      const location = this.formatLocationType(skill.type).padEnd(28); // 20 + chalk codes
      const priority = chalk.gray(`${skill.priority}`);

      console.log(`  ${name}${location}${priority}`);
    }

    console.log(); // Empty line
  }

  /**
   * Format location type for display
   */
  private formatLocationType(type: string): string {
    switch (type) {
      case 'project-universal':
        return chalk.blue('.agent (project)');
      case 'global-universal':
        return chalk.blue('.agent (global)');
      case 'project':
        return chalk.magenta('.claude (project)');
      case 'global':
        return chalk.magenta('.claude (global)');
      default:
        return type;
    }
  }

  /**
   * Show installation summary
   */
  showInstallSummary(installed: string[], failed: string[], location: string): void {
    console.log(); // Empty line

    if (installed.length > 0) {
      this.success(`Installed ${installed.length} skill(s) to ${chalk.cyan(location)}`);
      installed.forEach((name) => {
        console.log(chalk.gray(`  • ${name}`));
      });
    }

    if (failed.length > 0) {
      console.log(); // Empty line
      this.error(`Failed to install ${failed.length} skill(s)`);
      failed.forEach((name) => {
        console.log(chalk.gray(`  • ${name}`));
      });
    }

    console.log(); // Empty line
  }
}

