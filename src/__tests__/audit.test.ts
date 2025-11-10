import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuditLogger, createAuditLog } from '../runtime/audit';
import type { Skill, AuditLog } from '../types';
import fs from 'fs';
import path from 'path';

describe('Audit', () => {
  const testLogDir = path.join(process.cwd(), 'test-logs');

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  const createTestSkill = (): Skill => ({
    name: 'test-skill',
    version: '1.0.0',
    description: 'Test skill for auditing',
    tags: ['test'],
    inputs: { type: 'object', properties: {} },
    outputs: { type: 'object', properties: {} },
    allowedPaths: { read: [], write: [] },
    allowedCommands: [],
    steps: ['Do something'],
    retries: 1,
    dryRunSupported: true,
    dependencies: [],
  });

  describe('createAuditLog', () => {
    it('should create a valid audit log', () => {
      const skill = createTestSkill();
      const log = createAuditLog(skill, {
        input: { key: 'value' },
        output: { result: 'success' },
        dryRun: false,
        applied: true,
        duration: 1000,
        fileOps: [],
        commands: [],
        validations: [],
      });

      expect(log.id).toBeDefined();
      expect(log.timestamp).toBeDefined();
      expect(log.skill).toBe('test-skill');
      expect(log.version).toBe('1.0.0');
      expect(log.input).toEqual({ key: 'value' });
      expect(log.output).toEqual({ result: 'success' });
      expect(log.duration).toBe(1000);
      expect(log.dryRun).toBe(false);
      expect(log.applied).toBe(true);
    });

    it('should include environment information', () => {
      const skill = createTestSkill();
      const log = createAuditLog(skill, {
        input: {},
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      expect(log.environment).toBeDefined();
      expect(log.environment.node).toBeDefined();
      expect(log.environment.os).toBeDefined();
      expect(log.environment.arch).toBeDefined();
      expect(log.environment.cwd).toBeDefined();
    });

    it('should include file operations', () => {
      const skill = createTestSkill();
      const fileOps = [
        { type: 'read' as const, path: './input.txt' },
        { type: 'write' as const, path: './output.txt', content: 'data' },
      ];

      const log = createAuditLog(skill, {
        input: {},
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps,
        commands: [],
        validations: [],
      });

      expect(log.fileOps).toHaveLength(2);
      expect(log.fileOps[0].type).toBe('read');
      expect(log.fileOps[1].type).toBe('write');
    });

    it('should include command executions', () => {
      const skill = createTestSkill();
      const commands = [
        {
          command: 'git',
          args: ['status'],
          cwd: '/path',
          exitCode: 0,
          stdout: 'clean',
          stderr: '',
          duration: 100,
        },
      ];

      const log = createAuditLog(skill, {
        input: {},
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands,
        validations: [],
      });

      expect(log.commands).toHaveLength(1);
      expect(log.commands[0].command).toBe('git');
      expect(log.commands[0].exitCode).toBe(0);
    });

    it('should include validation results', () => {
      const skill = createTestSkill();
      const validations = [
        { type: 'input' as const, valid: true, message: 'Input valid' },
        { type: 'output' as const, valid: true, message: 'Output valid' },
      ];

      const log = createAuditLog(skill, {
        input: {},
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations,
      });

      expect(log.validations).toHaveLength(2);
      expect(log.validations[0].type).toBe('input');
      expect(log.validations[1].type).toBe('output');
    });

    it('should handle errors', () => {
      const skill = createTestSkill();
      const log = createAuditLog(skill, {
        input: {},
        error: 'Something went wrong',
        dryRun: false,
        applied: false,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      expect(log.error).toBe('Something went wrong');
      expect(log.output).toBeUndefined();
    });
  });

  describe('AuditLogger', () => {
    it('should create log directory', async () => {
      // Create custom logger that writes to files
      const logger = new AuditLogger({
        logDir: testLogDir,
        logger: async (log) => {
          const logFile = path.join(testLogDir, `${log.skill}.jsonl`);
          await fs.promises.mkdir(testLogDir, { recursive: true });
          await fs.promises.appendFile(logFile, JSON.stringify(log) + '\n');
        },
      });
      const skill = createTestSkill();
      const log = createAuditLog(skill, {
        input: {},
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      await logger.log(log);

      expect(fs.existsSync(testLogDir)).toBe(true);
    });

    it('should write log entries in JSONL format', async () => {
      const logger = new AuditLogger({
        logDir: testLogDir,
        logger: async (log) => {
          const logFile = path.join(testLogDir, `${log.skill}.jsonl`);
          await fs.promises.mkdir(testLogDir, { recursive: true });
          await fs.promises.appendFile(logFile, JSON.stringify(log) + '\n');
        },
      });
      const skill = createTestSkill();
      const log = createAuditLog(skill, {
        input: { test: 'data' },
        output: { result: 'success' },
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      await logger.log(log);

      // Find log file
      const files = fs.readdirSync(testLogDir);
      expect(files.length).toBeGreaterThan(0);

      const logFile = path.join(testLogDir, files[0]);
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(1);

      const parsed = JSON.parse(lines[0]) as AuditLog;
      expect(parsed.skill).toBe('test-skill');
      expect(parsed.input).toEqual({ test: 'data' });
      expect(parsed.output).toEqual({ result: 'success' });
    });

    it('should append to existing log file', async () => {
      const logger = new AuditLogger({
        logDir: testLogDir,
        logger: async (log) => {
          const logFile = path.join(testLogDir, `${log.skill}.jsonl`);
          await fs.promises.mkdir(testLogDir, { recursive: true });
          await fs.promises.appendFile(logFile, JSON.stringify(log) + '\n');
        },
      });
      const skill = createTestSkill();

      const log1 = createAuditLog(skill, {
        input: { test: '1' },
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      const log2 = createAuditLog(skill, {
        input: { test: '2' },
        dryRun: false,
        applied: true,
        duration: 100,
        fileOps: [],
        commands: [],
        validations: [],
      });

      await logger.log(log1);
      await logger.log(log2);

      const files = fs.readdirSync(testLogDir);
      const logFile = path.join(testLogDir, files[0]);
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(2);
    });

    it('should handle concurrent writes', async () => {
      const logger = new AuditLogger({
        logDir: testLogDir,
        logger: async (log) => {
          const logFile = path.join(testLogDir, `${log.skill}.jsonl`);
          await fs.promises.mkdir(testLogDir, { recursive: true });
          await fs.promises.appendFile(logFile, JSON.stringify(log) + '\n');
        },
      });
      const skill = createTestSkill();

      const logs = Array.from({ length: 10 }, (_, i) =>
        createAuditLog(skill, {
          input: { index: i },
          dryRun: false,
          applied: true,
          duration: 100,
          fileOps: [],
          commands: [],
          validations: [],
        }),
      );

      // Write all logs concurrently
      await Promise.all(logs.map((log) => logger.log(log)));

      const files = fs.readdirSync(testLogDir);
      const logFile = path.join(testLogDir, files[0]);
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');

      expect(lines.length).toBe(10);
    });
  });
});
