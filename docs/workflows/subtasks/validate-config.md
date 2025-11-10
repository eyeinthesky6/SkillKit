# Validate Configuration (Subtask)

## Purpose
Verify project configuration files are valid.

## Package.json

```bash
# Validate JSON:
node -e "require('./package.json')"

# Or:
npm install --dry-run
```

## TypeScript Config

```bash
# Validate tsconfig.json:
npx tsc --showConfig

# Check for errors:
npx tsc --noEmit
```

## ESLint Config

```bash
# Validate .eslintrc:
npx eslint --print-config src/index.ts

# Test config:
npx eslint src/index.ts --debug
```

## Environment Variables

```bash
# Check .env exists:
if [ ! -f ".env" ]; then
  echo "⚠ No .env file - copy from .env.example"
  cp .env.example .env
fi

# Validate required vars:
source .env
if [ -z "$API_KEY" ]; then
  echo "✗ Missing API_KEY in .env"
fi
```

## JSON/YAML Validation

```bash
# Validate JSON files:
find . -name "*.json" -exec node -e "require('{}')" \;

# Validate YAML:
npm install -g js-yaml
find . -name "*.yaml" -exec js-yaml {} \;
```

---

**Configuration validated.**

