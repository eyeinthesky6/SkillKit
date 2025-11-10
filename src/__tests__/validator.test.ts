import { describe, it, expect } from 'vitest';
import { createValidator } from '../runtime/validator';
import type { Skill } from '../types';

describe('Validator', () => {
  const createTestSkill = (inputs: any, outputs: any): Skill => ({
    name: 'test-skill',
    version: '1.0.0',
    description: 'Test skill for validation',
    tags: ['test'],
    inputs,
    outputs,
    allowedPaths: { read: [], write: [] },
    allowedCommands: [],
    steps: ['Do something'],
    retries: 1,
    dryRunSupported: true,
    dependencies: [],
  });

  describe('validateInput', () => {
    it('should validate correct input', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({ message: 'test' });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject missing required field', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject wrong type', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            count: { type: 'number' },
          },
          required: ['count'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({ count: 'not a number' });

      expect(result.success).toBe(false);
    });

    it('should strip additional properties when not allowed', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
          required: ['message'],
          additionalProperties: false,
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({
        message: 'test',
        extra: 'field',
      });

      // Zod strips additional properties with .strip(), so validation succeeds
      // but the extra property is removed
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'test' });
    });

    it('should validate nested objects', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                age: { type: 'number' },
              },
              required: ['name'],
            },
          },
          required: ['user'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({
        user: {
          name: 'John',
          age: 30,
        },
      });

      expect(result.success).toBe(true);
    });

    it('should validate arrays', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['items'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({
        items: ['a', 'b', 'c'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('validateOutput', () => {
    it('should validate correct output', () => {
      const skill = createTestSkill(
        { type: 'object', properties: {} },
        {
          type: 'object',
          properties: {
            result: { type: 'string' },
          },
          required: ['result'],
        },
      );

      const validator = createValidator(skill);
      const result = validator.validateOutput({ result: 'success' });

      expect(result.success).toBe(true);
    });

    it('should reject invalid output', () => {
      const skill = createTestSkill(
        { type: 'object', properties: {} },
        {
          type: 'object',
          properties: {
            count: { type: 'number' },
          },
          required: ['count'],
        },
      );

      const validator = createValidator(skill);
      const result = validator.validateOutput({ count: 'not a number' });

      expect(result.success).toBe(false);
    });

    it('should validate complex output schemas', () => {
      const skill = createTestSkill(
        { type: 'object', properties: {} },
        {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                },
                required: ['id', 'name'],
              },
            },
            metadata: {
              type: 'object',
              properties: {
                timestamp: { type: 'string' },
                count: { type: 'number' },
              },
            },
          },
          required: ['success', 'data'],
        },
      );

      const validator = createValidator(skill);
      const result = validator.validateOutput({
        success: true,
        data: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
        ],
        metadata: {
          timestamp: '2025-11-05T10:00:00Z',
          count: 2,
        },
      });

      expect(result.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null values', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            value: { type: ['string', 'null'] },
          },
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({ value: null });

      expect(result.success).toBe(true);
    });

    it('should handle empty objects', () => {
      const skill = createTestSkill(
        { type: 'object', properties: {} },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const inputResult = validator.validateInput({});
      const outputResult = validator.validateOutput({});

      expect(inputResult.success).toBe(true);
      expect(outputResult.success).toBe(true);
    });

    it('should handle undefined as invalid', () => {
      const skill = createTestSkill(
        {
          type: 'object',
          properties: {
            required: { type: 'string' },
          },
          required: ['required'],
        },
        { type: 'object', properties: {} },
      );

      const validator = createValidator(skill);
      const result = validator.validateInput({ required: undefined });

      expect(result.success).toBe(false);
    });
  });
});
