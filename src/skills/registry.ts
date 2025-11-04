import fs from 'fs';
import path from 'path';

import YAML from 'js-yaml';

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

    let metadata: any;
    // Description is intentionally left empty as it's not currently used

    if (ext === '.md') {
      // Parse markdown with YAML frontmatter
      const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
      if (!match) {
        throw new Error('Invalid skill file: missing YAML frontmatter');
      }

      const yamlContent = match[1];
      // Description is intentionally unused but kept for future reference
      const _description = match[2].trim();

      try {
        metadata = YAML.load(yamlContent);
      } catch (error) {
        throw new Error(`Failed to parse YAML frontmatter: ${error}`);
      }
    } else if (ext === '.yaml' || ext === '.yml') {
      // Parse YAML file
      try {
        metadata = YAML.load(content);
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
    const loadSchema = (schema: any, type: 'input' | 'output'): any => {
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

    const skill: Skill = {
      ...result.data,
      inputs: loadSchema(result.data.inputs, 'input'),
      outputs: loadSchema(result.data.outputs, 'output'),
      sourcePath: skillDir,
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
