/**
 * CLI Command: install
 * Install skills from GitHub repositories
 */

import { Command } from 'commander';
import { PackageManager } from '../package-manager/index.js';

export function createInstallCommand(): Command {
  return new Command('install')
    .description('Install skills from GitHub repository')
    .argument('<repo>', 'GitHub repository (user/repo or user/repo/path)')
    .option('-g, --global', 'Install to global location (~/.claude/skills)')
    .option('-u, --universal', 'Use universal mode (.agent instead of .claude)')
    .option('-a, --all', 'Install all skills without prompting')
    .option('-f, --force', 'Force overwrite existing skills')
    .option('-s, --skills <skills...>', 'Specific skills to install')
    .action(async (repo: string, options) => {
      const pm = new PackageManager();

      try {
        await pm.install(repo, {
          global: options.global,
          universal: options.universal,
          all: options.all,
          force: options.force,
          skills: options.skills,
        });
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    });
}

