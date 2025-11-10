/**
 * CLI Command: list
 * List all installed skills across all locations
 */

import { Command } from 'commander';
import { PackageManager } from '../package-manager/index.js';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all installed skills')
    .action(async () => {
      const pm = new PackageManager();

      try {
        pm.list();
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    });
}

