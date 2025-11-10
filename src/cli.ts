#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { InMemorySkillRegistry } from './skills/registry';
import { createDiagnoseCommand } from './cli-commands/diagnose';
import { createDiscoverCommand } from './cli-commands/discover';
import { createExecCommand } from './cli-commands/exec';
import { createInitCommand } from './cli-commands/init';
import { createSuggestCommand } from './cli-commands/suggest';
import { createListWorkflowsCommand } from './cli-commands/list-workflows';
import { createExplainCommand } from './cli-commands/explain';
import { createCompletionCommand } from './cli-commands/completion';
import { createInstallCommand } from './cli-commands/install';
import { createSyncCommand } from './cli-commands/sync';
import { createManageCommand } from './cli-commands/manage';
import { createListCommand } from './cli-commands/list';
import { createRunCommand } from './cli-commands/run';
import { createWorkflowGenCommand } from './cli-commands/workflow-gen';
import { createSkillLoadCommand } from './cli-commands/skill-load';
import { createBuildAgentsCommand } from './cli-commands/build-agents';
import { createSkillsAddCommand } from './cli-commands/skills-add';
import { createWorkflowsAddCommand } from './cli-commands/workflows-add';
import { createDedupeWorkflowsCommand } from './cli-commands/dedupe-workflows';
import { createAuditCommand } from './cli-commands/audit';
import { createAuditFixCommand } from './cli-commands/audit-fix';
import { createValidateWorkflowCommand } from './cli-commands/validate-workflow';
import { createMetaCustomizeCommand } from './cli-commands/meta-customize';
import { ErrorFactory, SkillKitError } from './errors';
import { discoverSkills } from './utils/skill-resolver';

// Read version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

const program = new Command();
program.name('tsk').description('SkillKit - Terminal-aware workflow orchestration + Anthropic skills integration for AI-assisted development').version(version);

function resolveDir(dir?: string): string {
  const d = dir ? path.resolve(process.cwd(), dir) : process.cwd();
  if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) {
    throw new Error(`Directory not found: ${d}`);
  }
  return d;
}

program
  .command('list-skills')
  .description('List all discoverable skills')
  .argument('[dir]', 'Directory to scan (defaults to current directory + examples/skills)')
  .action(async (dir?: string) => {
    try {
      const searchDir = dir ? resolveDir(dir) : process.cwd();
      const skillPaths = discoverSkills(searchDir);
      
      if (skillPaths.length === 0) {
        console.log(chalk.yellow('\nNo skills found.'));
        console.log(chalk.gray('\n💡 Suggestions:'));
        console.log(chalk.gray('   1. Create a new skill:'));
        console.log(chalk.cyan('      $ tsk gen-skill my-skill'));
        console.log(chalk.gray('\n   2. Skills should have SKILL.yaml/SKILL.md + index.js'));
        return;
      }
      
      console.log(chalk.bold(`\n📦 Found ${skillPaths.length} skill${skillPaths.length === 1 ? '' : 's'}:\n`));
      
      const registry = new InMemorySkillRegistry();
      for (const skillPath of skillPaths) {
        await registry.loadFromDirectory(skillPath);
      }
      
      const skills = registry.list();
      for (const s of skills) {
        console.log(`${chalk.green('●')} ${chalk.bold(s.name)}${chalk.gray('@' + s.version)}`);
        console.log(`  ${s.description}`);
        if (s.tags?.length) console.log(chalk.gray(`  tags: ${s.tags.join(', ')}`));
        console.log(chalk.gray(`  path: ${path.relative(process.cwd(), s.sourcePath || '')}`));
        console.log();
      }
    } catch (error) {
      if (error instanceof SkillKitError) {
        console.error(error.format());
      } else {
        console.error(chalk.red((error as Error).message));
      }
      process.exitCode = 1;
    }
  });

// Run command - now modular
program.addCommand(createRunCommand());

program
  .command('stats')
  .description('Summarize audit logs')
  .argument('[logDir]', 'Audit log directory', path.join('logs', 'audit'))
  .action(async (logDir: string) => {
    const dir = resolveDir(logDir);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl'));
    if (files.length === 0) {
      console.log(chalk.yellow('No audit logs found.'));
      return;
    }
    let runs = 0;
    let success = 0;
    let failure = 0;
    let totalDuration = 0;
    const bySkill = new Map<string, { runs: number; failures: number }>();

    for (const f of files) {
      const p = path.join(dir, f);
      const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        try {
          const entry = JSON.parse(line);
          runs++;
          totalDuration += Number(entry.duration || 0);
          const ok = !entry.error;
          if (ok) success++;
          else failure++;
          const rec = bySkill.get(entry.skill) || { runs: 0, failures: 0 };
          rec.runs += 1;
          if (!ok) rec.failures += 1;
          bySkill.set(entry.skill, rec);
        } catch {
          // skip malformed lines
        }
      }
    }

    console.log(chalk.cyan('Audit stats'));
    console.log(`runs: ${runs}`);
    console.log(`success: ${success}`);
    console.log(`failure: ${failure}`);
    console.log(`avgDuration(ms): ${runs ? Math.round(totalDuration / runs) : 0}`);
    console.log('bySkill:');
    for (const [name, rec] of bySkill.entries()) {
      console.log(`  ${name}: runs=${rec.runs}, failures=${rec.failures}`);
    }
  });

program
  .command('gen-skill')
  .description('Generate a new skill scaffold')
  .argument('<name>', 'Skill name (kebab-case)')
  .argument('[dir]', 'Target directory (defaults to current directory)')
  .option('-f, --force', 'Overwrite existing directory', false)
  .action(async (name: string, dir: string | undefined, opts: { force: boolean }) => {
    try {
      if (!/^[a-z0-9-]+$/.test(name)) {
        console.error(chalk.red('\n❌ Invalid skill name'));
        console.error(chalk.gray('   Skill names must be kebab-case (lowercase letters, numbers, dashes)'));
        console.error(chalk.cyan('\n💡 Examples: my-skill, user-auth, data-processor\n'));
        process.exitCode = 1;
        return;
      }
      
      const root = dir ? resolveDir(dir) : process.cwd();
      const skillDir = path.join(root, name);
      
      // Check if directory already exists
      if (fs.existsSync(skillDir) && !opts.force) {
        const error = ErrorFactory.fileOverwriteWarning(skillDir);
        console.error(error.format());
        process.exitCode = 1;
        return;
      }
      
      fs.mkdirSync(skillDir, { recursive: true });

    const skillYaml = `name: ${name}
version: 0.1.0
description: Example skill ${name}
tags: [example]
inputs: ./input.schema.json
outputs: ./output.schema.json
allowedPaths:
  read: ["${skillDir.replace(/\\/g, '/')}/**"]
  write: ["${skillDir.replace(/\\/g, '/')}/**"]
allowedCommands: []
steps:
  - Accept input message and validate format
  - Generate greeting response with input
retries: 0
dryRunSupported: true
dependencies: []
`;
    const inputSchema = {
      type: 'object',
      properties: { message: { type: 'string' } },
      required: ['message'],
      additionalProperties: false,
    };
    const outputSchema = {
      type: 'object',
      properties: { greeting: { type: 'string' } },
      required: ['greeting'],
      additionalProperties: false,
    };
    const indexJs = `module.exports = async function(input, sandbox, context) {
  const msg = (input && input.message) || 'world';
  return { greeting: 'Hello, ' + msg + '!' };
};
`;

      fs.writeFileSync(path.join(skillDir, 'SKILL.yaml'), skillYaml, 'utf8');
      fs.writeFileSync(
        path.join(skillDir, 'input.schema.json'),
        JSON.stringify(inputSchema, null, 2),
      );
      fs.writeFileSync(
        path.join(skillDir, 'output.schema.json'),
        JSON.stringify(outputSchema, null, 2),
      );
      fs.writeFileSync(path.join(skillDir, 'index.js'), indexJs, 'utf8');

      const relativePath = path.relative(process.cwd(), skillDir);
      
      console.log(chalk.green(`\n✅ Skill created successfully!\n`));
      console.log(chalk.bold(`📁 Location: ${chalk.cyan(relativePath)}\n`));
      console.log(chalk.bold('📋 Files created:'));
      console.log(chalk.gray('   ● SKILL.yaml         - Skill metadata'));
      console.log(chalk.gray('   ● index.js           - Implementation'));
      console.log(chalk.gray('   ● input.schema.json  - Input schema'));
      console.log(chalk.gray('   ● output.schema.json - Output schema\n'));
      
      console.log(chalk.bold('🚀 Next steps:\n'));
      console.log(chalk.cyan(`   1. cd ${relativePath}`));
      console.log(chalk.cyan(`   2. Edit index.js to implement your logic`));
      console.log(chalk.cyan(`   3. tsk run ${name} --input '{"message":"world"}'`));
      console.log(chalk.gray('\n   Or run from current directory:'));
      console.log(chalk.cyan(`   tsk run ${name} --input '{"message":"world"}'\n`));
    } catch (error) {
      if (error instanceof SkillKitError) {
        console.error(error.format());
      } else {
        console.error(chalk.red(`\n❌ Failed to create skill: ${error instanceof Error ? error.message : error}`));
      }
      process.exitCode = 1;
    }
  });

// Package management commands (Layer 1)
program.addCommand(createInstallCommand());
program.addCommand(createListCommand());
program.addCommand(createSyncCommand());
program.addCommand(createManageCommand());

// Workflow commands (Layer 3)
program.addCommand(createInitCommand());
program.addCommand(createDiscoverCommand());
program.addCommand(createExecCommand());
program.addCommand(createDiagnoseCommand());
program.addCommand(createSuggestCommand());
program.addCommand(createListWorkflowsCommand());
program.addCommand(createExplainCommand());
program.addCommand(createWorkflowGenCommand());
program.addCommand(createSkillLoadCommand());
program.addCommand(createBuildAgentsCommand());
program.addCommand(createSkillsAddCommand());
program.addCommand(createWorkflowsAddCommand());
program.addCommand(createDedupeWorkflowsCommand());
program.addCommand(createAuditCommand());
program.addCommand(createAuditFixCommand());
program.addCommand(createValidateWorkflowCommand());
program.addCommand(createMetaCustomizeCommand());

// Utility commands
program.addCommand(createCompletionCommand());

program.parseAsync(process.argv).catch((e) => {
  console.error(chalk.red(e instanceof Error ? e.message : String(e)));
  process.exit(1);
});
