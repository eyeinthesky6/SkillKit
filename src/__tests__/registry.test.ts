import { describe, it, expect, beforeEach } from 'vitest';
import { InMemorySkillRegistry } from '../skills/registry';
import type { Skill } from '../types';

describe('InMemorySkillRegistry', () => {
  let registry: InMemorySkillRegistry;

  beforeEach(() => {
    registry = new InMemorySkillRegistry();
  });

  describe('add and get', () => {
    it('should add and retrieve a skill', () => {
      const skill: Skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill for testing',
        tags: ['test'],
        inputs: { type: 'object', properties: {} },
        outputs: { type: 'object', properties: {} },
        allowedPaths: { read: [], write: [] },
        allowedCommands: [],
        steps: ['Do something'],
        retries: 1,
        dryRunSupported: true,
        dependencies: [],
      };

      registry.add(skill);
      const retrieved = registry.get('test-skill');

      expect(retrieved).toEqual(skill);
    });

    it('should return undefined for non-existent skill', () => {
      const skill = registry.get('non-existent');
      expect(skill).toBeUndefined();
    });

    it('should overwrite existing skill with same name', () => {
      const skill1: Skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'First version',
        tags: ['test'],
        inputs: { type: 'object', properties: {} },
        outputs: { type: 'object', properties: {} },
        allowedPaths: { read: [], write: [] },
        allowedCommands: [],
        steps: ['Do something'],
        retries: 1,
        dryRunSupported: true,
        dependencies: [],
      };

      const skill2: Skill = {
        ...skill1,
        version: '2.0.0',
        description: 'Second version',
      };

      registry.add(skill1);
      registry.add(skill2);

      const retrieved = registry.get('test-skill');
      expect(retrieved?.version).toBe('2.0.0');
      expect(retrieved?.description).toBe('Second version');
    });
  });

  describe('list', () => {
    it('should return empty array when no skills', () => {
      const skills = registry.list();
      expect(skills).toEqual([]);
    });

    it('should return all registered skills', () => {
      const skill1: Skill = {
        name: 'skill-1',
        version: '1.0.0',
        description: 'First skill test',
        tags: ['test'],
        inputs: { type: 'object', properties: {} },
        outputs: { type: 'object', properties: {} },
        allowedPaths: { read: [], write: [] },
        allowedCommands: [],
        steps: ['Do something'],
        retries: 1,
        dryRunSupported: true,
        dependencies: [],
      };

      const skill2: Skill = {
        ...skill1,
        name: 'skill-2',
        description: 'Second skill test',
      };

      registry.add(skill1);
      registry.add(skill2);

      const skills = registry.list();
      expect(skills).toHaveLength(2);
      expect(skills.map((s) => s.name)).toContain('skill-1');
      expect(skills.map((s) => s.name)).toContain('skill-2');
    });
  });

  describe('remove', () => {
    it('should remove a skill', () => {
      const skill: Skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill for testing',
        tags: ['test'],
        inputs: { type: 'object', properties: {} },
        outputs: { type: 'object', properties: {} },
        allowedPaths: { read: [], write: [] },
        allowedCommands: [],
        steps: ['Do something'],
        retries: 1,
        dryRunSupported: true,
        dependencies: [],
      };

      registry.add(skill);
      expect(registry.has('test-skill')).toBe(true);

      registry.remove('test-skill');
      expect(registry.has('test-skill')).toBe(false);
      expect(registry.get('test-skill')).toBeUndefined();
    });

    it('should do nothing when removing non-existent skill', () => {
      expect(() => registry.remove('non-existent')).not.toThrow();
    });
  });

  describe('has', () => {
    it('should return true for existing skill', () => {
      const skill: Skill = {
        name: 'test-skill',
        version: '1.0.0',
        description: 'A test skill for testing',
        tags: ['test'],
        inputs: { type: 'object', properties: {} },
        outputs: { type: 'object', properties: {} },
        allowedPaths: { read: [], write: [] },
        allowedCommands: [],
        steps: ['Do something'],
        retries: 1,
        dryRunSupported: true,
        dependencies: [],
      };

      registry.add(skill);
      expect(registry.has('test-skill')).toBe(true);
    });

    it('should return false for non-existent skill', () => {
      expect(registry.has('non-existent')).toBe(false);
    });
  });

  describe('validation', () => {
    it('should reject skill without name', () => {
      const invalidSkill = {
        version: '1.0.0',
        description: 'Missing name',
      } as any;

      expect(() => registry.add(invalidSkill)).toThrow('must have a name');
    });

    it('should reject skill without version', () => {
      const invalidSkill = {
        name: 'test',
        description: 'Missing version',
      } as any;

      expect(() => registry.add(invalidSkill)).toThrow('must have a version');
    });

    it('should reject skill without description', () => {
      const invalidSkill = {
        name: 'test',
        version: '1.0.0',
      } as any;

      expect(() => registry.add(invalidSkill)).toThrow('must have a description');
    });

    it('should reject skill without steps', () => {
      const invalidSkill = {
        name: 'test',
        version: '1.0.0',
        description: 'Test',
        steps: [],
      } as any;

      expect(() => registry.add(invalidSkill)).toThrow('must have at least one step');
    });

    it('should reject skill with invalid retries', () => {
      const invalidSkill = {
        name: 'test',
        version: '1.0.0',
        description: 'Test',
        steps: ['Do something'],
        retries: 5,
      } as any;

      expect(() => registry.add(invalidSkill)).toThrow('retries must be between 0 and 3');
    });
  });
});
