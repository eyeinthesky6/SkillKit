# Workflow Customization Preservation System

## 🎯 **Purpose**

Automatically preserves user customizations when upgrading workflow files, ensuring that:
- ✅ Custom sections are kept
- ✅ Custom commands are preserved
- ✅ Custom comments are maintained
- ✅ User modifications aren't lost during upgrades

---

## 🔄 **How It Works**

### **1. Automatic Detection**

When running `tsk workflow --all` or `tsk workflow --template <name>`, the system:

1. **Reads existing workflow file** (if it exists)
2. **Compares with new template** to detect customizations
3. **Identifies custom content:**
   - Custom sections (not in template)
   - Custom commands (user-added)
   - Custom comments
   - Custom blocks (marked with `<!-- CUSTOM -->`)

### **2. Smart Merging**

The system merges customizations into the new template:
- ✅ New template features are added
- ✅ User customizations are preserved
- ✅ Both coexist in the final file

### **3. Automatic During Upgrades**

**Every time you run:**
```bash
tsk workflow --all
# or
tsk workflow --template IMPLEMENT_FEATURE
```

**The system automatically:**
1. Checks for existing files
2. Detects customizations
3. Merges them into new versions
4. Reports what was preserved

---

## 📋 **What Gets Preserved**

### ✅ **Custom Sections**

If you add a new section to a workflow:

```markdown
## Phase 8: My Custom Step

**This is my custom workflow step:**
```bash
my-custom-command
```
```

**Result:** ✅ Preserved in upgraded version

### ✅ **Custom Commands**

If you add custom commands:

```markdown
```bash
# My custom command
tsk my-custom-command
```
```

**Result:** ✅ Preserved in upgraded version

### ✅ **Custom Comments**

If you add explanatory comments:

```markdown
<!-- This is my custom note about the workflow -->
```

**Result:** ✅ Preserved in upgraded version

### ✅ **Custom Blocks**

If you mark content for preservation:

```markdown
<!-- CUSTOM START -->
My custom content here
<!-- CUSTOM END -->
```

**Result:** ✅ Always preserved (explicit marker)

---

## 🚀 **Usage**

### **Upgrade Workflows (Preserves Customizations)**

```bash
# Upgrade all workflows
tsk workflow --all

# Upgrade specific workflow
tsk workflow --template IMPLEMENT_FEATURE
```

**Output:**
```
📝 Generating workflow commands in .cursor\commands...

🔍 Analyzing project structure...

📦 Detected 2 language stack(s):
   • python (.) - poetry, ruff
   • typescript (apps\web) - Next.js, jest, eslint

   🔄 Preserved 3 customization(s) in IMPLEMENT_FEATURE.md
✅ IMPLEMENT_FEATURE.md (adapted + 3 customization(s) preserved)

💡 Preserved 3 total customization(s) across all workflows

✅ Workflow generation complete!
```

### **Deduplicate (Warns About Customizations)**

```bash
# Check for duplicates
tsk dedupe-workflows --dry-run

# If customizations found, you'll see:
⚠️  Customizations detected in duplicates!
   Run: tsk workflow --template <name> to merge customizations
   Or: tsk dedupe-workflows --force to delete anyway
```

---

## 🔍 **Detection Methods**

### **1. Section Detection**

Compares markdown sections (`##` and `###` headers):
- Finds sections in existing file not in template
- Preserves them in merged version

### **2. Command Detection**

Identifies custom commands in code blocks:
- Finds commands not in template
- Preserves them in merged version

### **3. Comment Detection**

Detects user-added comments:
- Finds comments not in template
- Preserves them in merged version

### **4. Custom Block Detection**

Looks for explicit markers:
- `<!-- CUSTOM START -->` ... `<!-- CUSTOM END -->`
- Always preserves these blocks

---

## ⚠️ **Important Notes**

### **What Gets Overwritten**

- ✅ Template sections are updated to latest version
- ✅ Template commands are updated
- ✅ Template structure follows new format

### **What Gets Preserved**

- ✅ Custom sections you added
- ✅ Custom commands you added
- ✅ Custom comments you added
- ✅ Custom blocks (marked with `<!-- CUSTOM -->`)

### **Best Practice: Use Custom Blocks**

For content you **definitely** want preserved:

```markdown
<!-- CUSTOM START -->
## My Custom Section

This will always be preserved, even if template changes significantly.

```bash
my-custom-command
```
<!-- CUSTOM END -->
```

---

## 🛠️ **Technical Details**

### **Customization Types**

```typescript
interface Customization {
  type: 'section' | 'comment' | 'command' | 'custom-content';
  content: string;
  location: 'before' | 'after' | 'replace';
  marker?: string;
}
```

### **Merge Strategy**

1. **Template content** is used as base
2. **Custom sections** are appended after last section
3. **Custom commands** are added after last code block
4. **Custom comments** are added after title
5. **Custom blocks** are appended at end

---

## 📊 **Example Workflow**

### **Before Upgrade:**

```markdown
# Implement Feature

## Phase 1: Understand Requirements
...

## My Custom Phase
**This is my custom workflow step**
```

### **After Upgrade:**

```markdown
# Implement Feature

## Phase 1: Understand Requirements
... (updated from template)

## Phase 2: Check Dependencies
... (new from template)

## My Custom Phase
**This is my custom workflow step** ✅ PRESERVED
```

---

## ✅ **Summary**

**Every upgrade run (`tsk workflow`) now:**
1. ✅ Automatically detects customizations
2. ✅ Preserves them in new versions
3. ✅ Reports what was preserved
4. ✅ Works seamlessly with deduplication

**No manual steps needed!** Just run `tsk workflow --all` and your customizations are automatically preserved. 🎉

