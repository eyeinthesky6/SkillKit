# Check Dependencies (Subtask)

## Purpose
Verify all project dependencies are installed and up-to-date.

## Check Installation

**Node.js:**

```bash
# Check if node_modules exists:
if [ -d "node_modules" ]; then
  echo "✓ Dependencies installed"
else
  echo "✗ Dependencies missing - run: npm install"
  exit 1
fi
```

**Python:**

```bash
# Check virtual environment:
if [ -d "venv" ] || [ -d ".venv" ]; then
  echo "✓ Virtual environment found"
  source venv/bin/activate || source .venv/bin/activate
else
  echo "⚠ No venv found - create with: python -m venv venv"
fi

# Check requirements:
pip list > installed.txt
diff requirements.txt installed.txt
```

## Detect Outdated Packages

**Node.js:**

```bash
npm outdated
# Shows: current version, wanted version, latest version

# Check for security issues:
npm audit
```

**Python:**

```bash
pip list --outdated
```

## Install Missing Dependencies

**Node.js:**

```bash
# Install based on lock file:
npm ci  # Clean install (faster, more reliable)

# Or normal install:
npm install
```

**Python:**

```bash
pip install -r requirements.txt
```

## Verify Key Packages

```bash
# Check specific packages exist:
npm list typescript eslint jest

# Check binary availability:
which tsc
which eslint
which jest
```

## Output

```
📦 Dependency Check
─────────────────

✓ Package manager: npm
✓ Dependencies: Installed
✓ Security: No vulnerabilities
⚠ Outdated: 3 packages (non-critical)

Recommended: npm update
```

---

**Return dependency status to main workflow.**

