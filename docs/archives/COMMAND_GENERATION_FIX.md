# Command Generation Fix

## Problem

The workflow command generation was using hardcoded tool names (like `flake8`) instead of detecting the actual tools configured in the project (like `ruff`). Additionally, commands were not always using Poetry when Poetry was the package manager.

## Root Cause

1. **Hardcoded tool fallbacks** - The workflow adapter had hardcoded checks for `flake8` and `pylint` even when `ruff` was detected
2. **Missing Poetry prefix** - When Poetry was detected, commands weren't always prefixed with `poetry run`
3. **Script detection priority** - Project scripts from `[tool.poetry.scripts]` weren't always checked first

## Solution

### Priority-Based Command Generation

Commands are now generated with a clear priority system:

1. **PRIORITY 1: Project Scripts** (Highest Priority)
   - Check `[tool.poetry.scripts]` in `pyproject.toml`
   - Check `scripts` in `package.json`
   - Use: `poetry run lint` or `pnpm run lint`

2. **PRIORITY 2: Detected Tools** (Medium Priority)
   - Use detected linter/formatter/test framework
   - **ALWAYS use Poetry when Poetry is detected**: `poetry run ruff check .`
   - Use correct package manager for other tools

3. **PRIORITY 3: Generic Instructions** (Fallback)
   - If nothing detected, use generic instructions
   - Example: `# Run linter: poetry run lint (or check pyproject.toml for available scripts)`

### Changes Made

#### 1. Lint Command (`getLintCommand`)

**Before:**
```typescript
if (stack.linter === 'ruff') {
  if (stack.packageManager === 'poetry') {
    return `poetry run ruff check . || ruff check .`;
  }
  return 'ruff check .';
}
if (stack.linter === 'flake8') {  // ❌ Hardcoded fallback
  return stack.packageManager === 'poetry' ? 'poetry run flake8 .' : 'flake8 .';
}
```

**After:**
```typescript
// PRIORITY 1: Project scripts
if (stack.scripts?.lint) {
  if (stack.packageManager === 'poetry') {
    return `poetry run lint`;
  }
  // ...
}

// PRIORITY 2: Detected tools
if (stack.linter) {
  if (stack.packageManager === 'poetry') {
    // ALWAYS use Poetry when Poetry is detected
    if (stack.linter === 'ruff') {
      return `poetry run ruff check .`;  // ✅ No fallback to direct command
    }
    // ...
  }
}

// PRIORITY 3: Generic instructions
if (stack.packageManager === 'poetry') {
  return '# Run linter: poetry run lint (or check pyproject.toml for available scripts)';
}
```

#### 2. Format Command (`getFormatCommand`)

- Always checks project scripts first
- Uses Poetry when Poetry is detected
- Falls back to generic instructions

#### 3. Typecheck Command (`getTypecheckCommand`)

- Always checks project scripts first
- Uses Poetry when Poetry is detected
- Falls back to generic instructions

#### 4. Test Command (`getTestCommand`)

- Always checks project scripts first
- Uses Poetry when Poetry is detected
- Falls back to generic instructions

#### 5. Improved Script Detection

Enhanced Poetry script parsing to handle:
- Both single and double quotes: `name = "command"` or `name = 'command'`
- Kebab-case script names: `my-script = "command"`
- Better regex pattern: `/([\w-]+)\s*=\s*["']([^"']+)["']/`

## Example: ProfitPilot

### Project Configuration
```toml
[tool.poetry.scripts]
lint = "ruff check ."
format = "ruff format ."
test = "pytest"
```

### Generated Commands

**Before (WRONG):**
```bash
poetry run ruff check . || ruff check .  # ❌ Fallback to direct command
poetry run flake8 .  # ❌ Wrong tool (flake8 not used)
```

**After (CORRECT):**
```bash
poetry run lint  # ✅ Uses project script from [tool.poetry.scripts]
poetry run format  # ✅ Uses project script
poetry run test  # ✅ Uses project script
```

If scripts not found, but `ruff` detected:
```bash
poetry run ruff check .  # ✅ Uses Poetry + detected tool
poetry run ruff format .  # ✅ Uses Poetry + detected tool
```

## Verification

To verify commands are correct:

```bash
# Generate workflows
tsk workflow --all

# Check generated commands
cat .cursor/commands/IMPLEMENT_FEATURE.md

# Should see:
# - poetry run lint (if script exists)
# - poetry run ruff check . (if ruff detected, no script)
# - Generic instructions (if nothing detected)
```

## Benefits

1. ✅ **No hardcoded tools** - Always uses detected tools
2. ✅ **Poetry support** - Always uses `poetry run` when Poetry detected
3. ✅ **Script priority** - Project scripts take precedence
4. ✅ **Generic fallback** - Uses instructions instead of wrong commands
5. ✅ **Multi-language support** - Works for all language combinations

## Testing

Test on a project with:
- Poetry + ruff (like ProfitPilot)
- Poetry + flake8
- Poetry + custom scripts
- Non-Poetry projects (npm, pnpm, etc.)

