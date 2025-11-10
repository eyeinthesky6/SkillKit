/**
 * CLI Command: run
 * Run a skill (discovers from installed skills or path)
 */

import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { InMemorySkillRegistry } from '../skills/registry.js';
import { StorageManager } from '../package-manager/storage.js';
import { SkillExecutor } from '../runtime/executor.js';
import { OutputFormatter } from '../runtime/formatter.js';
import { ErrorFactory, SkillKitError } from '../errors.js';
import { resolveSkillPath } from '../utils/skill-resolver.js';

export function createRunCommand(): Command {
  return new Command('run')
    .description('Run a skill (auto-discovers from installed skills or path)')
    .argument('<skillNameOrPath>', 'Skill name or path')
    .option('--input <file>', 'JSON input file')
    .option('--json', 'Output as JSON (for AI consumption)')
    .action(async (skillNameOrPath: string, opts: { input?: string; json?: boolean }) => {
      try {
        const storage = new StorageManager();
        const formatter = new OutputFormatter();

        // Try to find skill in installed locations first
        const skillLocation = storage.findSkill(skillNameOrPath);
        let skillPath: string;

        if (skillLocation) {
          skillPath = skillLocation.path;
        } else {
          // Fall back to path resolution
          const resolution = resolveSkillPath(skillNameOrPath);
          if (!resolution.found) {
            throw ErrorFactory.skillNotFound(skillNameOrPath, resolution.searchedPaths);
          }
          skillPath = resolution.path!;
        }

        // Load skill
        const registry = new InMemorySkillRegistry();
        await registry.loadFromDirectory(skillPath);
        const skills = registry.list();

        if (skills.length === 0) {
          throw ErrorFactory.noSkillMetadata(skillPath);
        }

        const skill = skills[0];

        // Parse input
        let inputData = {};
        try {
          if (!process.stdin.isTTY) {
            const chunks: Buffer[] = [];
            for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
            const raw = Buffer.concat(chunks).toString('utf8').trim();
            inputData = raw ? JSON.parse(raw) : {};
          } else if (opts.input) {
            const raw = fs.readFileSync(path.resolve(opts.input), 'utf8');
            inputData = JSON.parse(raw);
          }
        } catch (e) {
          console.error(
            chalk.red(`Failed to read/parse input: ${e instanceof Error ? e.message : e}`),
          );
          process.exitCode = 1;
          return;
        }

        if (!opts.json) {
          console.log(chalk.bold(`\n🚀 Running skill: ${chalk.cyan(skill.name)}\n`));
        }

        // Execute with new executor
        const executor = new SkillExecutor(skillPath, skill);
        const result = await executor.execute({ input: inputData, json: opts.json });

        // Format and display output
        console.log(formatter.format(result, { json: opts.json }));

        if (!result.success) {
          process.exitCode = 1;
        }
      } catch (e) {
        if (e instanceof SkillKitError) {
          console.error(e.format());
        } else {
          console.error(chalk.red(`\n❌ Execution error: ${e instanceof Error ? e.message : e}`));
        }
        process.exitCode = 1;
      }
    });
}

