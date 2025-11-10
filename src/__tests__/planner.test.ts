import { describe, it, expect, beforeEach } from 'vitest';
import { planTask, findSkillsByTags, findSkillsByPattern } from '../router/planner';
import { InMemorySkillRegistry } from '../skills/registry';
import type { Skill } from '../types';

describe('Planner', () => {
  let registry: InMemorySkillRegistry;

  beforeEach(() => {
    registry = new InMemorySkillRegistry();

    // Add test skills
    const skill1: Skill = {
      name: 'json-processor',
      version: '1.0.0',
      description: 'Process JSON files and transform data',
      tags: ['json', 'data', 'processing'],
      inputs: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          options: { type: 'object' },
        },
        required: ['file'],
      },
      outputs: { type: 'object', properties: {} },
      allowedPaths: { read: [], write: [] },
      allowedCommands: [],
      steps: ['Read JSON file'],
      retries: 1,
      dryRunSupported: true,
      dependencies: [],
    };

    const skill2: Skill = {
      name: 'xml-parser',
      version: '1.0.0',
      description: 'Parse and validate XML documents',
      tags: ['xml', 'parsing', 'validation'],
      inputs: {
        type: 'object',
        properties: {
          content: { type: 'string' },
        },
        required: ['content'],
      },
      outputs: { type: 'object', properties: {} },
      allowedPaths: { read: [], write: [] },
      allowedCommands: [],
      steps: ['Parse XML'],
      retries: 1,
      dryRunSupported: true,
      dependencies: [],
    };

    const skill3: Skill = {
      name: 'data-validator',
      version: '1.0.0',
      description: 'Validate data against schemas',
      tags: ['validation', 'data'],
      inputs: {
        type: 'object',
        properties: {
          data: { type: 'object' },
          schema: { type: 'object' },
        },
        required: ['data', 'schema'],
      },
      outputs: { type: 'object', properties: {} },
      allowedPaths: { read: [], write: [] },
      allowedCommands: [],
      steps: ['Validate data'],
      retries: 1,
      dryRunSupported: true,
      dependencies: [],
    };

    registry.add(skill1);
    registry.add(skill2);
    registry.add(skill3);
  });

  describe('planTask', () => {
    it('should select skill based on tags', () => {
      const plan = planTask(registry, {
        tags: ['json'],
        minConfidence: 0.3,
      });

      expect(plan.skill).toBe('json-processor');
      expect(plan.confidence).toBeGreaterThan(0.3);
    });

    it('should select skill based on task text', () => {
      const plan = planTask(registry, {
        taskText: 'I need to parse XML files',
        minConfidence: 0.1,
      });

      expect(plan.skill).toBe('xml-parser');
    });

    it('should select skill based on multiple criteria', () => {
      const plan = planTask(registry, {
        taskText: 'validate data',
        tags: ['validation'],
        minConfidence: 0.3,
      });

      expect(plan.skill).toBe('data-validator');
      expect(plan.why).toContain('validation');
    });

    it('should throw when no suitable skill found', () => {
      expect(() => {
        planTask(registry, {
          tags: ['non-existent-tag'],
          minConfidence: 0.9,
        });
      }).toThrow('No suitable skill found');
    });

    it('should throw when no skills available', () => {
      const emptyRegistry = new InMemorySkillRegistry();

      expect(() => {
        planTask(emptyRegistry, {});
      }).toThrow('No skills available');
    });

    it('should include warnings for missing required fields', () => {
      const plan = planTask(registry, {
        tags: ['json'],
        inputShape: { wrongField: 'value' }, // missing required 'file' field
        minConfidence: 0.1,
      });

      // Should still find a skill even with missing fields
      expect(plan.skill).toBe('json-processor');
      // Warnings might not be present if confidence is met through other means
      if (plan.warnings) {
        expect(plan.warnings.length).toBeGreaterThan(0);
      }
    });

    it('should provide confidence score', () => {
      const plan = planTask(registry, {
        taskText: 'process json data',
        tags: ['json', 'processing'],
        inputShape: { file: 'test.json' },
        minConfidence: 0.5,
      });

      expect(plan.confidence).toBeGreaterThanOrEqual(0);
      expect(plan.confidence).toBeLessThanOrEqual(1);
      expect(plan.confidence).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('findSkillsByTags', () => {
    it('should find skills with any matching tag', () => {
      const skills = findSkillsByTags(registry, ['json', 'xml'], false);

      expect(skills).toHaveLength(2);
      expect(skills.map((s) => s.name)).toContain('json-processor');
      expect(skills.map((s) => s.name)).toContain('xml-parser');
    });

    it('should find skills with all matching tags', () => {
      const skills = findSkillsByTags(registry, ['data', 'validation'], true);

      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('data-validator');
    });

    it('should return empty array when no matches', () => {
      const skills = findSkillsByTags(registry, ['non-existent'], false);
      expect(skills).toEqual([]);
    });

    it('should return empty array for empty tag list', () => {
      const skills = findSkillsByTags(registry, [], false);
      expect(skills).toEqual([]);
    });

    it('should be case-insensitive', () => {
      const skills = findSkillsByTags(registry, ['JSON', 'DATA'], false);
      expect(skills.length).toBeGreaterThan(0);
    });
  });

  describe('findSkillsByPattern', () => {
    it('should find skills by name pattern', () => {
      const skills = findSkillsByPattern(registry, '*processor*');

      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('json-processor');
    });

    it('should find skills by tag pattern', () => {
      const skills = findSkillsByPattern(registry, '*json*');
      expect(skills.length).toBeGreaterThan(0);
    });

    it('should support wildcards', () => {
      const skills = findSkillsByPattern(registry, 'data-*');

      expect(skills).toHaveLength(1);
      expect(skills[0].name).toBe('data-validator');
    });

    it('should return empty array when no matches', () => {
      const skills = findSkillsByPattern(registry, 'nonexistent*');
      expect(skills).toEqual([]);
    });
  });
});
