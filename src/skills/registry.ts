import fs from 'fs';
import path from 'path';

import matter from 'gray-matter';
import YAML from 'js-yaml';
import type { JSONSchema7 } from 'json-schema';

import { Skill, SkillRegistry, skillMetadataSchema } from '../types';

export class InMemorySkillRegistry implements SkillRegistry {
  private skills: Map<string, Skill> = new Map();

  /**
   * Get a skill by name
   */
  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /**
   * List all available skills
   */
  list(): Skill[] {
    return Array.from(this.skills.values());
  }

  /**
   * Add a skill to the registry
   */
  add(skill: Skill): void {
    this.validateSkill(skill);
    this.skills.set(skill.name, skill);
  }

  /**
   * Remove a skill from the registry
   */
  remove(name: string): void {
    this.skills.delete(name);
  }

  /**
   * Check if a skill exists
   */
  has(name: string): boolean {
    return this.skills.has(name);
  }

  /**
   * Load skills from a directory
   */
  async loadFromDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      throw new Error(`Directory not found: ${dir}`);
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively load from subdirectories
        await this.loadFromDirectory(fullPath);
      } else if (this.isSkillFile(entry.name)) {
        try {
          const skill = await this.loadSkillFromFile(fullPath);
          this.add(skill);
        } catch (error) {
          console.warn(`Failed to load skill from ${fullPath}:`, error);
        }
      }
    }
  }

  /**
   * Check if a file is a skill file
   */
  private isSkillFile(filename: string): boolean {
    return /^(SKILL\.(md|yaml|yml))$/i.test(filename);
  }

  /**
   * Load a skill from a file
   */
  private async loadSkillFromFile(filePath: string): Promise<Skill> {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();

    let metadata: Record<string, unknown>;
    let markdownContent: string | undefined;

    if (ext === '.md') {
      // Parse markdown with YAML frontmatter using gray-matter
      try {
        const parsed = matter(content);
        metadata = parsed.data;
        markdownContent = parsed.content.trim();
      } catch (error) {
        throw new Error(`Failed to parse SKILL.md: ${error}`);
      }

      // If no frontmatter found, try to treat entire content as YAML for backwards compat
      if (!metadata || Object.keys(metadata).length === 0) {
        try {
          metadata = YAML.load(content) as Record<string, unknown>;
        } catch {
          throw new Error('Invalid SKILL.md: missing YAML frontmatter');
        }
      }
    } else if (ext === '.yaml' || ext === '.yml') {
      // Parse YAML file
      try {
        metadata = YAML.load(content) as Record<string, unknown>;
      } catch (error) {
        throw new Error(`Failed to parse YAML: ${error}`);
      }
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    // Validate and normalize metadata
    const result = skillMetadataSchema.safeParse(metadata);
    if (!result.success) {
      throw new Error(`Invalid skill metadata: ${result.error.message}`);
    }

    const skillDir = path.dirname(filePath);

    // Load input/output schemas if they're file references
    const loadSchema = (schema: unknown, type: 'input' | 'output'): unknown => {
      if (typeof schema === 'string') {
        const schemaPath = path.isAbsolute(schema) ? schema : path.join(skillDir, schema);

        if (!fs.existsSync(schemaPath)) {
          throw new Error(`${type} schema not found: ${schemaPath}`);
        }

        try {
          return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        } catch (error) {
          throw new Error(`Failed to parse ${type} schema: ${error}`);
        }
      }
      return schema;
    };

    const inputsSchema = loadSchema(result.data.inputs, 'input');
    const outputsSchema = loadSchema(result.data.outputs, 'output');
    
    // Default empty schemas if not provided
    const defaultSchema: JSONSchema7 = { type: 'object', properties: {} };
    
    const skill: Skill = {
      ...result.data,
      inputs: (inputsSchema as JSONSchema7) || defaultSchema,
      outputs: (outputsSchema as JSONSchema7) || defaultSchema,
      sourcePath: skillDir,
      // Store markdown instructions if available (for instructional/hybrid modes)
      instructions: markdownContent,
    };

    return skill;
  }

  /**
   * Validate a skill object
   */
  private validateSkill(skill: Skill): void {
    if (!skill.name) {
      throw new Error('Skill must have a name');
    }

    if (!skill.version) {
      throw new Error(`Skill '${skill.name}' must have a version`);
    }

    if (!skill.description) {
      throw new Error(`Skill '${skill.name}' must have a description`);
    }

    if (!skill.steps || skill.steps.length === 0) {
      throw new Error(`Skill '${skill.name}' must have at least one step`);
    }

    if (skill.retries < 0 || skill.retries > 3) {
      throw new Error(`Skill '${skill.name}' retries must be between 0 and 3`);
    }
  }
}

/**
 * Create a new skill registry
 */
export function createSkillRegistry(): SkillRegistry {
  return new InMemorySkillRegistry();
}

/**
 * Default skill registry instance
 */
const defaultRegistry = createSkillRegistry();

export default defaultRegistry;
