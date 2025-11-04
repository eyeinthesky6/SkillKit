import { describe, it, expect } from 'vitest';
import { Sandbox } from '../runtime/sandbox';
import { Skill } from '../types';

describe('Sandbox', () => {
  it('should initialize with default options', () => {
    const skill: Skill = {
      name: 'test-skill',
      version: '1.0.0',
      description: 'A test skill',
      tags: ['test'],
      inputs: {
        type: 'object',
        properties: {},
        required: [],
      },
      outputs: {
        type: 'object',
        properties: {},
        required: [],
      },
      allowedPaths: {
        read: [],
        write: []
      },
      allowedCommands: [],
      steps: ['Step 1: Initialize test'],
      retries: 3,
      dryRunSupported: true,
      dependencies: []
    };
    
    const sandbox = new Sandbox(skill);
    expect(sandbox).toBeDefined();
  });
});
