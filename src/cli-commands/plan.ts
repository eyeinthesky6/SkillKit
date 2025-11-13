/**
 * CLI Command: plan
 * 
 * Plan which skill to use for a given task using the planner/router
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { InMemorySkillRegistry } from '../skills/registry';
import { planTask, PlanOptions } from '../router/planner';
import { discoverSkills, getDefaultSkillPaths } from '../utils/skill-resolver';
import { SkillKitError } from '../errors';

export function createPlanCommand(): Command {
  const command = new Command('plan');
  
  command
    .description('Plan which skill to use for a task')
    .argument('<task>', 'Task description')
    .option('--tags <tags...>', 'Required tags for skill selection', [])
    .option('--json', 'Output as JSON (for AI consumption)', false)
    .option('--min-confidence <threshold>', 'Minimum confidence threshold (0-1)', '0.5')
    .action(async (task: string, opts: { tags?: string[]; json?: boolean; minConfidence?: string }) => {
      try {
        // Load skill registry from default locations
        const registry = new InMemorySkillRegistry();
        const searchPaths = getDefaultSkillPaths();
        
        if (searchPaths.length === 0) {
          throw new Error('No skill directories found. Create skills in current directory or examples/skills/');
        }
        
        // Discover and load all skills
        for (const searchPath of searchPaths) {
          const skillPaths = discoverSkills(searchPath);
          for (const skillPath of skillPaths) {
            await registry.loadFromDirectory(skillPath);
          }
        }
        
        const availableSkills = registry.list();
        
        if (availableSkills.length === 0) {
          throw new Error('No skills found. Create a skill first: tsk gen-skill my-skill');
        }
        
        // Parse min confidence
        const minConfidence = parseFloat(opts.minConfidence || '0.5');
        if (isNaN(minConfidence) || minConfidence < 0 || minConfidence > 1) {
          throw new Error('min-confidence must be between 0 and 1');
        }
        
        // Plan task
        const planOptions: PlanOptions = {
          taskText: task,
          tags: opts.tags || [],
          minConfidence,
        };
        
        const plan = planTask(registry, planOptions);
        
        // Output
        if (opts.json) {
          console.log(JSON.stringify({
            skill: plan.skill,
            why: plan.why,
            confidence: plan.confidence,
            expectedOutputs: plan.expectedOutputs,
            warnings: plan.warnings,
            availableSkills: availableSkills.length,
          }, null, 2));
        } else {
          console.log(chalk.bold('\n📋 Skill Selection Plan\n'));
          console.log(chalk.cyan('Task:'), task);
          console.log(chalk.cyan('Selected Skill:'), chalk.green(plan.skill));
          console.log(chalk.cyan('Confidence:'), `${(plan.confidence * 100).toFixed(1)}%`);
          console.log(chalk.cyan('Reason:'), plan.why);
          
          if (plan.warnings && plan.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Warnings:'));
            plan.warnings.forEach(w => console.log(chalk.gray(`   - ${w}`)));
          }
          
          const selectedSkill = registry.get(plan.skill);
          if (selectedSkill) {
            console.log(chalk.cyan('\n📝 Skill Details:'));
            console.log(chalk.gray(`   Description: ${selectedSkill.description}`));
            console.log(chalk.gray(`   Tags: ${selectedSkill.tags.join(', ')}`));
            console.log(chalk.gray(`   Version: ${selectedSkill.version}`));
            if (selectedSkill.sourcePath) {
              console.log(chalk.gray(`   Path: ${selectedSkill.sourcePath}`));
            }
          }
          
          console.log(chalk.dim(`\n💡 Run with: tsk task "${task}"`));
          console.log(chalk.dim(`   Or directly: tsk run ${plan.skill}`));
        }
      } catch (error) {
        if (error instanceof SkillKitError) {
          console.error(error.format());
        } else {
          console.error(chalk.red(`\n❌ Planning failed: ${error instanceof Error ? error.message : error}`));
        }
        process.exitCode = 1;
      }
    });
  
  return command;
}

