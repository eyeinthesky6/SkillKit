# Creating Skills

Skills are domain expertise modules that can be loaded on-demand. They provide deep knowledge about specific domains like PDF manipulation, Excel operations, or database queries.

## Skill Structure

A skill consists of:

1. **SKILL.md** or **SKILL.yaml** - Metadata and instructions
2. **Input Schema** - JSON Schema defining required inputs
3. **Output Schema** - JSON Schema defining expected outputs
4. **Implementation** (optional) - Code that executes the skill

## Example Skill

```yaml
# SKILL.yaml
name: pdf-manipulator
version: 1.0.0
description: Manipulate PDF files with advanced operations
tags:
  - pdf
  - document
  - manipulation
inputs:
  type: object
  properties:
    operation:
      type: string
      enum: [merge, split, extract]
    files:
      type: array
      items:
        type: string
outputs:
  type: object
  properties:
    result:
      type: string
    outputFile:
      type: string
allowedPaths:
  read:
    - "**/*.pdf"
  write:
    - "output/**"
allowedCommands:
  - "pdftk"
steps:
  - "Read input PDF files"
  - "Perform requested operation"
  - "Write output file"
```

## Publishing Skills

1. Create a GitHub repository with your skill
2. Add topic tag: `skillkit-skill`
3. Share in GitHub Discussions
4. Others install with: `tsk skills:add your-username/repo`

## Learn More

- [Skills Introduction](introduction)
- [Marketplace Guide](marketplace)
- [Skill Update Strategy](../../../docs/SKILL_UPDATE_STRATEGY.md)

