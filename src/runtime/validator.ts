import type { JSONSchema7 } from 'json-schema';
import { z } from 'zod';
import type { ZodError, ZodSchema, ZodString, ZodNumber, ZodType } from 'zod';
import { zodToJsonSchema as zodToJsonSchemaLib } from 'zod-to-json-schema';

import type { Skill } from '../types';

/**
 * Convert a JSON Schema to a Zod schema
 */
export function jsonSchemaToZod(schema: JSONSchema7): ZodSchema<unknown> {
  // JSON Schema to Zod converter - covers common schema patterns
  
  // Handle composition keywords (allOf, anyOf, oneOf) first
  if (schema.allOf && Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    // allOf: all schemas must match (intersection)
    const schemas = schema.allOf.map((s) => jsonSchemaToZod(s as JSONSchema7));
    if (schemas.length === 1) return schemas[0];
    return schemas.reduce((acc, s) => acc.and(s), schemas[0]);
  }
  
  if (schema.anyOf && Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    // anyOf: at least one schema must match (union)
    const schemas = schema.anyOf.map((s) => jsonSchemaToZod(s as JSONSchema7));
    if (schemas.length === 1) return schemas[0];
    return z.union(schemas as [ZodType, ZodType, ...ZodType[]]);
  }
  
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    // oneOf: exactly one schema must match (discriminated union)
    // Zod doesn't have native oneOf, so we use union with refinement
    const schemas = schema.oneOf.map((s) => jsonSchemaToZod(s as JSONSchema7));
    if (schemas.length === 1) return schemas[0];
    const union = z.union(schemas as [ZodType, ZodType, ...ZodType[]]);
    // Refine to ensure exactly one matches
    return union.refine((val) => {
      let matchCount = 0;
      for (const s of schemas) {
        const result = s.safeParse(val);
        if (result.success) matchCount++;
      }
      return matchCount === 1;
    }, { message: 'Must match exactly one schema' });
  }

  if (schema.type === 'string') {
    let zodType: ZodString = z.string();

    if (schema.minLength !== undefined) {
      zodType = zodType.min(schema.minLength);
    }

    if (schema.maxLength !== undefined) {
      zodType = zodType.max(schema.maxLength);
    }

    if (schema.pattern) {
      zodType = zodType.regex(new RegExp(schema.pattern));
    }

    if (schema.enum) {
      return z.enum(schema.enum as [string, ...string[]]);
    }

    return zodType;
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    let zodType: ZodNumber = schema.type === 'integer' ? z.number().int() : z.number();

    if (schema.minimum !== undefined) {
      zodType = zodType.min(schema.minimum);
    }

    if (schema.exclusiveMinimum !== undefined) {
      zodType = zodType.gt(schema.exclusiveMinimum);
    }

    if (schema.maximum !== undefined) {
      zodType = zodType.max(schema.maximum);
    }

    if (schema.exclusiveMaximum !== undefined) {
      zodType = zodType.lt(schema.exclusiveMaximum);
    }

    return zodType;
  }

  if (schema.type === 'boolean') {
    return z.boolean();
  }

  if (schema.type === 'array' && schema.items) {
    const itemsSchema = Array.isArray(schema.items)
      ? z.tuple(
          schema.items.map((s) => jsonSchemaToZod(s as JSONSchema7)) as [ZodType, ...ZodType[]],
        )
      : z.array(jsonSchemaToZod(schema.items as JSONSchema7));

    if (schema.minItems !== undefined) {
      (itemsSchema as { min: (n: number) => unknown }).min(schema.minItems);
    }

    if (schema.maxItems !== undefined) {
      (itemsSchema as { max: (n: number) => unknown }).max(schema.maxItems);
    }

    return itemsSchema;
  }

  if (schema.type === 'object' && schema.properties) {
    const shape: Record<string, ZodType> = {};

    for (const [key, prop] of Object.entries(schema.properties)) {
      shape[key] = jsonSchemaToZod(prop as JSONSchema7);
    }

    let zodObj = z.object(shape);

    if (schema.required) {
      // Mark required fields
      const requiredFields = schema.required;
      for (const field of requiredFields) {
        if (shape[field]) {
          // Use min(1) instead of nonempty() for strings
          if (shape[field] instanceof z.ZodString) {
            shape[field] = (shape[field] as ZodString).min(1);
          }
        }
      }
    }

    // Handle additional properties
    if (schema.additionalProperties === false) {
      // Use .strip() to remove unknown properties
      zodObj = zodObj.strip();
    } else if (typeof schema.additionalProperties === 'object') {
      // additionalProperties with schema object: validate additional properties against schema
      const additionalSchema = jsonSchemaToZod(schema.additionalProperties as JSONSchema7);
      // Use catchall() to validate additional properties against the schema
      zodObj = zodObj.catchall(additionalSchema);
    }

    return zodObj;
  }

  // Fallback to any if type is not recognized
  return z.any();
}

/**
 * Validate input data against a schema
 */
export function validateInput<T = unknown>(
  schema: JSONSchema7 | ZodSchema<T>,
  data: unknown,
): { success: boolean; data?: T; error?: string; details?: unknown } {
  try {
    let zodSchema: ZodSchema<T>;

    // If it's already a Zod schema, use it directly
    if (typeof (schema as { parse?: unknown })?.parse === 'function') {
      zodSchema = schema as ZodSchema<T>;
    } else {
      // Convert JSON Schema to Zod schema
      zodSchema = jsonSchemaToZod(schema as JSONSchema7) as ZodSchema<T>;
    }

    const result = zodSchema.safeParse(data);

    if (result.success) {
      return { success: true, data: result.data };
    }
    return {
      success: false,
      error: 'Validation failed',
      details: formatZodError(result.error),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      details: error,
    };
  }
}

/**
 * Validate output data against a skill's output schema
 */
export function validateOutput(
  skill: Skill,
  data: unknown,
): { success: boolean; data?: unknown; error?: string; details?: unknown } {
  if (!skill.outputs) {
    return { success: true, data };
  }

  return validateInput(skill.outputs, data);
}

/**
 * Format Zod validation error for better readability
 */
export function formatZodError(error: ZodError): { message: string; path?: string; code?: string } {
  if (!error.issues || error.issues.length === 0) {
    return { message: 'Unknown validation error' };
  }

  const issue = error.issues[0];
  const result: { message: string; path?: string; code?: string; params?: unknown } = {
    message: issue.message || 'Validation error',
    path: issue.path.join('.'),
    code: (issue as { code?: string }).code,
  };

  // Add params if they exist
  const params = (issue as { params?: unknown }).params;
  if (params) {
    result.params = params;
  }

  return result;
}

/**
 * Convert a Zod schema to JSON Schema
 */
export function zodToJsonSchema(schema: ZodSchema): JSONSchema7 {
  return zodToJsonSchemaLib(schema) as unknown as JSONSchema7;
}

/**
 * Create a validator for a skill
 */
export function createValidator(skill: Skill) {
  return {
    /**
     * Validate input against the skill's input schema
     */
    validateInput: (input: unknown) => {
      if (!skill.inputs) {
        return { success: true, data: input };
      }
      return validateInput(skill.inputs, input);
    },

    /**
     * Validate output against the skill's output schema
     */
    validateOutput: (output: unknown) => validateOutput(skill, output),

    /**
     * Get the input schema as a Zod schema
     */
    getInputSchema: () => {
      if (!skill.inputs) return z.any();
      return jsonSchemaToZod(skill.inputs);
    },

    /**
     * Get the output schema as a Zod schema
     */
    getOutputSchema: () => {
      if (!skill.outputs) return z.any();
      return jsonSchemaToZod(skill.outputs);
    },
  };
}
