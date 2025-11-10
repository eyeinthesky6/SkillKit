/**
 * CLI Command: manage
 * Manage installed skills (remove with interactive UI)
 */

import { Command } from 'commander';
import { PackageManager } from '../package-manager/index.js';

export function createManageCommand(): Command {
  return new Command('manage')
    .description('Manage installed skills (interactive removal)')
    .option('-s, --skills <skills...>', 'Specific skills to remove (non-interactive)')
    .action(async (options) => {
      const pm = new PackageManager();

      try {
        await pm.remove({
          skills: options.skills,
        });
      } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
      }
    });
}

