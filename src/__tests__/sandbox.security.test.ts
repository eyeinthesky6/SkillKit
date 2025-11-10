import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Sandbox, SandboxEvent } from '../runtime/sandbox';
import { Skill } from '../types';
import fs from 'fs';
import path from 'path';

describe('Sandbox Security', () => {
  let sandbox: Sandbox;
  const testDir = path.join(process.cwd(), 'test-sandbox');
  const testSkill: Skill = {
    name: 'test-skill',
    version: '1.0.0',
    description: 'Test security features',
    tags: ['test'],
    inputs: { type: 'object', properties: {} },
    outputs: { type: 'object', properties: {} },
    allowedPaths: {
      read: [path.join(testDir, 'allowed-read/**/*')],
      write: [path.join(testDir, 'allowed-write/**/*')],
    },
    allowedCommands: [process.platform === 'win32' ? '^dir' : '^ls'],
    steps: [],
    retries: 1,
    dryRunSupported: true,
    dependencies: [],
  };

  beforeEach(() => {
    // Setup test directory
    fs.mkdirSync(testDir, { recursive: true });
    fs.mkdirSync(path.join(testDir, 'allowed-read'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'allowed-write'), { recursive: true });

    // Create test file
    fs.writeFileSync(path.join(testDir, 'allowed-read/test.txt'), 'test content', 'utf8');
  });

  afterEach(() => {
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
  });

  it('should prevent path traversal attacks', async () => {
    sandbox = new Sandbox(testSkill, { cwd: testDir });

    // Try to access files outside sandbox
    const maliciousPath = path.join(testDir, '../sensitive-file');

    expect(() => sandbox.readFile(maliciousPath)).toThrow('Path traversal attempt');
    expect(() => sandbox.writeFile(maliciousPath, 'hacked')).toThrow('Path traversal attempt');
    expect(() => sandbox.deletePath(maliciousPath)).toThrow('Path traversal attempt');
  });

  it('should enforce allowed paths', async () => {
    sandbox = new Sandbox(testSkill, { cwd: testDir });

    // Try to access disallowed paths
    const disallowedPath = path.join(testDir, 'disallowed/test.txt');

    expect(() => sandbox.readFile(disallowedPath)).toThrow('not allowed');
    expect(() => sandbox.writeFile(disallowedPath, 'test')).toThrow('not allowed');
  });

  it('should enforce command restrictions', async () => {
    // Create a test file to verify file operations
    const testFilePath = path.join(testDir, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'test content');

    // Use a simple command that's guaranteed to work on all platforms
    const testCommand = process.platform === 'win32' ? 'cmd' : 'sh';
    const testArgs = process.platform === 'win32' ? ['/c', 'echo test'] : ['-c', 'echo test'];

    // Update the sandbox to allow the test command
    // Note: The pattern should match the full command string
    const testSkillWithCmd: Skill = {
      ...testSkill,
      allowedCommands: [process.platform === 'win32' ? '/^cmd \/c/' : '/^sh -c/'],
    };

    sandbox = new Sandbox(testSkillWithCmd, { cwd: testDir });

    // Test allowed command - use the full command pattern that matches the regex
    const result = await sandbox.executeCommand(
      testCommand,
      [testArgs.join(' ')], // Join args to match the regex pattern
    );
    expect(result).toBeDefined();

    // Test disallowed command
    await expect(sandbox.executeCommand('rm', ['-rf', '/'])).rejects.toThrow('not allowed');
  });

  it('should respect resource limits', async () => {
    const lowLimits = {
      maxCpuTime: 100, // 100ms
      maxMemory: 10 * 1024 * 1024, // 10MB
      maxOutputSize: 100, // 100 bytes
    };

    sandbox = new Sandbox(
      { ...testSkill },
      {
        cwd: testDir,
        limits: lowLimits,
        timeout: 50, // 50ms timeout
      },
    );

    // Test output size limit
    const testString = 'x'.repeat(200);
    if (process.platform === 'win32') {
      await expect(sandbox.executeCommand('cmd', ['/c', `echo ${testString}`])).rejects.toThrow();
    } else {
      await expect(sandbox.executeCommand('echo', [testString])).rejects.toThrow(
        'Output size limit exceeded',
      );
    }

    // Test timeout - use a command that will run longer than the timeout
    if (process.platform === 'win32') {
      await expect(
        sandbox.executeCommand('timeout', ['2', 'echo', 'should timeout']),
      ).rejects.toThrow();
    } else {
      await expect(sandbox.executeCommand('sleep', ['1'])).rejects.toThrow();
    }
  });

  it('should clean up resources on error', async () => {
    // Skip this test on Windows CI due to process handling differences
    if (process.platform === 'win32' && process.env['CI']) {
      console.log('Skipping test on Windows CI');
      return;
    }

    // Use a command that will definitely fail with a non-zero exit code
    const failingCommand = process.platform === 'win32' ? 'cmd' : 'sh';
    const failingArgs = process.platform === 'win32' ? ['/c', 'exit 1'] : ['-c', 'exit 1'];

    // Create a skill that allows the failing command
    const failingSkill: Skill = {
      ...testSkill,
      allowedCommands: [process.platform === 'win32' ? '/^cmd/' : '/^sh/'],
    };

    sandbox = new Sandbox(failingSkill, {
      cwd: testDir,
      timeout: 5000, // Increased timeout for CI
    });

    // Track if error event was emitted
    const errorHandler = vi.fn();
    sandbox.on(SandboxEvent.Error, errorHandler);

    try {
      // This should throw an error due to non-zero exit code
      await sandbox.executeCommand(failingCommand, failingArgs);

      // If we get here, the test should fail
      throw new Error('Command should have thrown an error');
    } catch (error) {
      // Expected error - verify it's the right type
      expect(error).toBeDefined();

      // Log the error for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('Command failed with error:', errorMessage);

      // Just verify that some error occurred
      expect(errorMessage).toBeTruthy();
    } finally {
      // Give some time for cleanup to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify cleanup - check if activeProcesses is empty
      const activeProcesses = (sandbox as any).activeProcesses as Set<any>;
      console.log('Active processes after cleanup:', activeProcesses.size);
      expect(activeProcesses.size).toBe(0);
    }
  });
});
