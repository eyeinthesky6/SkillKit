import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Workflow Generation', () => {
  const testDir = path.join(__dirname, '..', 'test-workflow-output');
  const cursorCommandsDir = path.join(testDir, '.cursor', 'commands');

  beforeEach(async () => {
    // Create test directory
    await fs.ensureDir(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  it('should generate BEGIN_SESSION workflow', async () => {
    // Run workflow generation command
    await execAsync(`node dist/cli.js workflow --template BEGIN_SESSION --dir ${testDir}`);

    // Check if file was created
    const workflowPath = path.join(cursorCommandsDir, 'BEGIN_SESSION.md');
    const exists = await fs.pathExists(workflowPath);
    expect(exists).toBe(true);

    // Verify file content
    const content = await fs.readFile(workflowPath, 'utf8');
    expect(content).toContain('# Begin Session');
    expect(content).toContain('Step 1: Load Context');
    expect(content).toContain('tsk diagnose');
  });

  it('should generate all workflows with --all flag', async () => {
    // Run workflow generation command
    await execAsync(`node dist/cli.js workflow --all --dir ${testDir}`);

    // Check if all workflow files were created
    const expectedWorkflows = [
      'BEGIN_SESSION.md',
      'IMPLEMENT_FEATURE.md',
      'FIX_BUGS.md',
      'DEPLOY_PREP.md',
    ];

    for (const workflow of expectedWorkflows) {
      const workflowPath = path.join(cursorCommandsDir, workflow);
      const exists = await fs.pathExists(workflowPath);
      expect(exists).toBe(true);
    }
  });

  it('should have proper structure in IMPLEMENT_FEATURE workflow', async () => {
    await execAsync(`node dist/cli.js workflow --template IMPLEMENT_FEATURE --dir ${testDir}`);

    const content = await fs.readFile(
      path.join(cursorCommandsDir, 'IMPLEMENT_FEATURE.md'),
      'utf8',
    );

    // Check for key phases
    expect(content).toContain('Phase 0: Check AITracking');
    expect(content).toContain('Phase 1: Gather Requirements');
    expect(content).toContain('Phase 9: Final Validation');

    // Check for SkillKit command integration
    expect(content).toContain('tsk diagnose');
    expect(content).toContain('tsk exec quality-gate');
    expect(content).toContain('tsk exec lint');
    expect(content).toContain('tsk exec typecheck');
    expect(content).toContain('tsk exec test');
  });

  it('should have bug fixing phases in FIX_BUGS workflow', async () => {
    await execAsync(`node dist/cli.js workflow --template FIX_BUGS --dir ${testDir}`);

    const content = await fs.readFile(path.join(cursorCommandsDir, 'FIX_BUGS.md'), 'utf8');

    expect(content).toContain('Phase 1: Find Issues');
    expect(content).toContain('Phase 2: Prioritize');
    expect(content).toContain('Phase 3: One File at a Time');
    expect(content).toContain('Build failures');
    expect(content).toContain('Test failures');
    expect(content).toContain('Type errors');
  });

  it('should have deployment checklist in DEPLOY_PREP workflow', async () => {
    await execAsync(`node dist/cli.js workflow --template DEPLOY_PREP --dir ${testDir}`);

    const content = await fs.readFile(path.join(cursorCommandsDir, 'DEPLOY_PREP.md'), 'utf8');

    expect(content).toContain('Phase 1: Full System Check');
    expect(content).toContain('Phase 6: Final Validation');
    expect(content).toContain('tsk exec quality-gate');
    expect(content).toContain('tsk exec build');
    expect(content).toContain('git status');
    expect(content).toContain('Ready to deploy');
  });

  it('should create .cursor/commands directory if it does not exist', async () => {
    // Ensure directory doesn't exist
    await fs.remove(cursorCommandsDir);

    // Run workflow generation
    await execAsync(`node dist/cli.js workflow --all --dir ${testDir}`);

    // Check if directory was created
    const exists = await fs.pathExists(cursorCommandsDir);
    expect(exists).toBe(true);
  });

  it('should overwrite existing workflows', async () => {
    // Create a workflow first
    await execAsync(`node dist/cli.js workflow --template BEGIN_SESSION --dir ${testDir}`);

    // Modify the file
    const workflowPath = path.join(cursorCommandsDir, 'BEGIN_SESSION.md');
    await fs.writeFile(workflowPath, '# Modified', 'utf8');

    // Run workflow generation again (should overwrite)
    await execAsync(`node dist/cli.js workflow --template BEGIN_SESSION --dir ${testDir}`);

    // Verify file was overwritten
    const content = await fs.readFile(workflowPath, 'utf8');
    expect(content).not.toContain('# Modified');
    expect(content).toContain('# Begin Session');
  });
});

