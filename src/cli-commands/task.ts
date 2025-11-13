/**
 * CLI Command: task
 * 
 * Execute a task using SkillKit (plan + run)
 * This is the unified entry point that forces SkillKit usage
 */

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { InMemorySkillRegistry } from '../skills/registry';
import { planTask, PlanOptions } from '../router/planner';
import { discoverSkills, getDefaultSkillPaths, resolveSkillPath } from '../utils/skill-resolver';
import { SkillExecutor } from '../runtime/executor';
import { logSkillUsage, logPlan } from '../utils/telemetry';
import { ErrorFactory, SkillKitError } from '../errors';

export function createTaskCommand(): Command {
  const command = new Command('task');
  
  command
    .description('Execute a task using SkillKit (plan + run)')
    .argument('<task>', 'Task description')
    .option('--tags <tags...>', 'Required tags for skill selection', [])
    .option('--input <json>', 'Input data as JSON string', '{}')
    .option('--input-file <path>', 'Path to JSON input file')
    .option('--dry-run', 'Dry run mode (simulate without executing)', false)
    .option('--json', 'Output as JSON', false)
    .option('--min-confidence <threshold>', 'Minimum confidence threshold (0-1)', '0.5')
    .option('--skip-plan', 'Skip planning and use provided skill (for testing)', false)
    .option('--skill <name>', 'Force specific skill (requires --skip-plan)', '')
    .action(async (
      task: string,
      opts: {
        tags?: string[];
        input?: string;
        inputFile?: string;
        dryRun?: boolean;
        json?: boolean;
        minConfidence?: string;
        skipPlan?: boolean;
        skill?: string;
      }
    ) => {
      const startTime = Date.now();
      let selectedSkill: string | null = null;
      let planConfidence = 0;
      
      try {
        // Load skill registry
        const registry = new InMemorySkillRegistry();
        const searchPaths = getDefaultSkillPaths();
        
        if (searchPaths.length === 0) {
          throw new Error('No skill directories found. Create skills in current directory or examples/skills/');
        }
        
        // Discover and load all skills
        const loadSpinner = ora('Loading skills...').start();
        for (const searchPath of searchPaths) {
          const skillPaths = discoverSkills(searchPath);
          for (const skillPath of skillPaths) {
            await registry.loadFromDirectory(skillPath);
          }
        }
        loadSpinner.stop();
        
        const availableSkills = registry.list();
        
        if (availableSkills.length === 0) {
          throw new Error('No skills found. Create a skill first: tsk gen-skill my-skill');
        }
        
        // Plan or use provided skill
        let plan;
        if (opts.skipPlan && opts.skill) {
          // Use provided skill directly
          const skill = registry.get(opts.skill);
          if (!skill) {
            throw new Error(`Skill not found: ${opts.skill}`);
          }
          plan = {
            skill: opts.skill,
            why: 'Manually specified',
            confidence: 1.0,
            expectedOutputs: skill.outputs,
            warnings: undefined,
          };
          selectedSkill = opts.skill;
          planConfidence = 1.0;
        } else {
          // Plan task
          const planSpinner = ora('Planning task...').start();
          
          const minConfidence = parseFloat(opts.minConfidence || '0.5');
          if (isNaN(minConfidence) || minConfidence < 0 || minConfidence > 1) {
            throw new Error('min-confidence must be between 0 and 1');
          }
          
          const planOptions: PlanOptions = {
            taskText: task,
            tags: opts.tags || [],
            minConfidence,
          };
          
          plan = planTask(registry, planOptions);
          planSpinner.succeed(`Selected skill: ${plan.skill} (${(plan.confidence * 100).toFixed(1)}% confidence)`);
          
          selectedSkill = plan.skill;
          planConfidence = plan.confidence;
          
          // Log plan
          await logPlan({
            task,
            timestamp: new Date().toISOString(),
            selectedSkill: plan.skill,
            confidence: plan.confidence,
            why: plan.why,
            availableSkills: availableSkills.length,
            tags: opts.tags,
          });
        }
        
        if (!opts.json) {
          console.log(chalk.dim(`\nReason: ${plan.why}`));
          if (plan.warnings && plan.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Warnings:'));
            plan.warnings.forEach(w => console.log(chalk.gray(`   - ${w}`)));
          }
        }
        
        // Parse input
        let inputData = {};
        try {
          if (opts.inputFile) {
            const fs = await import('fs');
            const content = fs.readFileSync(opts.inputFile, 'utf8');
            inputData = JSON.parse(content);
          } else if (opts.input) {
            inputData = JSON.parse(opts.input);
          }
        } catch (error) {
          throw new Error(`Failed to parse input: ${error instanceof Error ? error.message : error}`);
        }
        
        // Find skill path
        const skillResolution = resolveSkillPath(plan.skill);
        if (!skillResolution.found || !skillResolution.path) {
          throw ErrorFactory.skillNotFound(plan.skill, skillResolution.searchedPaths);
        }
        
        const skillPath = skillResolution.path;
        const skill = registry.get(plan.skill);
        if (!skill) {
          throw new Error(`Skill not found in registry: ${plan.skill}`);
        }
        
        // Execute skill
        const execSpinner = ora(`Executing skill: ${plan.skill}...`).start();
        const executor = new SkillExecutor(skillPath, skill);
        
        const execStartTime = Date.now();
        const result = await executor.execute({
          input: inputData,
          json: opts.json,
        });
        const execDuration = Date.now() - execStartTime;
        
        execSpinner.succeed(`Skill executed successfully (${execDuration}ms)`);
        
        // Log usage
        await logSkillUsage({
          skill: plan.skill,
          timestamp: new Date().toISOString(),
          repo: process.cwd(),
          status: result.success ? 'success' : 'failure',
          duration_ms: execDuration,
          task,
          error: result.error,
          confidence: planConfidence,
        });
        
        const totalDuration = Date.now() - startTime;
        
        // Output results
        if (opts.json) {
          console.log(JSON.stringify({
            success: result.success,
            skill: plan.skill,
            confidence: planConfidence,
            duration_ms: execDuration,
            total_duration_ms: totalDuration,
            output: result.output,
            error: result.error,
          }, null, 2));
        } else {
          if (result.success) {
            console.log(chalk.green('\n✅ Task completed successfully'));
            if (result.output && typeof result.output === 'object') {
              console.log(chalk.dim('\nOutput:'));
              console.log(JSON.stringify(result.output, null, 2));
            }
          } else {
            console.log(chalk.red('\n❌ Task failed'));
            if (result.error) {
              console.log(chalk.red(`Error: ${result.error}`));
            }
          }
          console.log(chalk.dim(`\nTotal time: ${totalDuration}ms`));
        }
        
        process.exitCode = result.success ? 0 : 1;
      } catch (error) {
        // Log failure
        if (selectedSkill) {
          await logSkillUsage({
            skill: selectedSkill,
            timestamp: new Date().toISOString(),
            repo: process.cwd(),
            status: 'failure',
            duration_ms: Date.now() - startTime,
            task,
            error: error instanceof Error ? error.message : String(error),
            confidence: planConfidence,
          });
        }
        
        if (error instanceof SkillKitError) {
          console.error(error.format());
        } else {
          console.error(chalk.red(`\n❌ Task execution failed: ${error instanceof Error ? error.message : error}`));
        }
        process.exitCode = 1;
      }
    });
  
  return command;
}

