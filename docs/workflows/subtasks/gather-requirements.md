# Gather Requirements (Subtask)

## Purpose
Extract and clarify requirements before implementation.

## Questions to Ask

### 1. Functional Requirements
- What should this feature DO?
- What inputs does it accept?
- What outputs should it produce?
- What are the edge cases?

### 2. Technical Requirements
- Which files/modules affected?
- Any new dependencies needed?
- Performance constraints?
- Compatibility requirements?

### 3. User Experience
- Who will use this?
- What's the expected flow?
- Error handling approach?
- Success/failure feedback?

### 4. Testing Requirements
- What tests are needed?
- How to verify it works?
- Manual testing steps?
- Automated test coverage?

## Checklist

```markdown
## Requirements Checklist

- [ ] Feature description clear
- [ ] Input/output defined
- [ ] Edge cases identified
- [ ] Files to modify listed
- [ ] Dependencies identified
- [ ] Test strategy defined
- [ ] Success criteria clear
```

## Document Requirements

**Create a brief spec:**

```markdown
# Feature: <Name>

## Goal
[One sentence description]

## Inputs
- Parameter 1: type, constraints
- Parameter 2: type, constraints

## Outputs
- Return value: type, format
- Side effects: [list any]

## Edge Cases
1. Empty input → return default
2. Invalid input → throw error
3. [etc.]

## Files Affected
- src/components/Button.tsx (modify)
- tests/Button.test.ts (add tests)
- docs/components.md (update docs)

## Success Criteria
- [ ] Tests pass
- [ ] Lint clean
- [ ] Docs updated
- [ ] Code reviewed
```

## Detect Domain Expertise Needed

**Check requirements for keywords:**

```bash
# If mentions: "PDF", "extract", "merge"
# → Need: pdf skill

# If mentions: "Excel", "spreadsheet", "chart"
# → Need: xlsx skill

# If mentions: "Word", "document", "docx"
# → Need: docx skill

# If mentions: "design", "poster", "canvas"
# → Need: canvas-design skill
```

---

**Return clear requirements to main workflow.**

