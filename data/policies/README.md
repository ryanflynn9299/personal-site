# Policy Documents

## Overview

This directory contains policy documents (Privacy Policy, Terms of Service, etc.) that are displayed on the website with a space-themed UI.

## Placeholder Content

The current markdown files contain **lorem ipsum placeholder text** for demonstration purposes. This allows the space-themed document viewing experience to be fully functional and tested before actual policy content is available.

### Why Placeholder Content?

- **UI Development**: The space-themed document viewer can be developed and tested without waiting for final policy text
- **Demonstration**: Shows how various markdown elements (headers, lists, code blocks, etc.) appear in the space-themed design
- **Consistent Experience**: Ensures the document viewing experience works correctly before content is finalized

### "Coming Soon" Header

Each document includes a prominent "⚠️ Content Coming Soon" header at the top to clearly indicate that the content is under development. This header should be removed or updated when actual policy content is added.

## Markdown Elements Demonstrated

The placeholder content demonstrates various markdown features:

- **Headers**: Multiple heading levels (H1, H2, H3)
- **Lists**: Both ordered (numbered) and unordered (bullet) lists
- **Text Formatting**: Bold (`**text**`), italic (`*text*`)
- **Links**: Markdown links `[text](url)`
- **Code Blocks**: Fenced code blocks with syntax highlighting
- **Blockquotes**: Quoted text with `>`
- **Horizontal Rules**: Section dividers with `---`

## Replacing Placeholder Content

When you're ready to add actual policy content:

1. **Open the markdown file** you want to update (e.g., `privacy-policy.md`)
2. **Remove or update** the "Coming Soon" header section
3. **Replace the lorem ipsum text** with your actual policy content
4. **Update the `lastUpdated` date** in the frontmatter
5. **Maintain markdown formatting** - the same markdown features will work with real content

### Frontmatter Structure

Each markdown file includes frontmatter at the top:

```markdown
---
title: "Privacy Policy"
lastUpdated: "2025-01-15"
---
```

- **title**: The document title (displayed in the page header)
- **lastUpdated**: Date when the document was last updated (format: YYYY-MM-DD)

## Markdown Formatting Guidelines

### Headers

Use headers to create document hierarchy:

```markdown
# Main Title (H1)

## Section (H2)

### Subsection (H3)
```

### Lists

**Unordered lists:**

```markdown
- Item one
- Item two
- Item three
```

**Ordered lists:**

```markdown
1. First item
2. Second item
3. Third item
```

### Text Formatting

- **Bold**: `**bold text**` or `__bold text__`
- _Italic_: `*italic text*` or `_italic text_`
- `Inline code`: Use backticks

### Links

```markdown
[Link text](https://example.com)
```

### Code Blocks

Use triple backticks for code blocks:

````markdown
```javascript
const code = "example";
```
````

### Blockquotes

```markdown
> This is a quoted section
```

### Horizontal Rules

```markdown
---
```

## Space Theme Integration

The space-themed UI automatically styles these markdown elements:

- Headers use terminal/monospace font styling
- Links have subtle blue glow effects on hover
- Code blocks have space-themed borders
- The overall design maintains a professional, space-themed aesthetic

## File Structure

- `privacy-policy.md` - Privacy Policy document
- `terms-of-service.md` - Terms of Service document
- `README.md` - This documentation file

## Best Practices

1. **Keep it readable**: Use clear headings and proper spacing
2. **Be consistent**: Use the same formatting patterns throughout
3. **Update dates**: Always update `lastUpdated` when making changes
4. **Test rendering**: Check how the document looks in the space-themed viewer
5. **Legal accuracy**: Ensure all policy content is legally accurate and reviewed

## Questions?

If you have questions about:

- **Markdown formatting**: Refer to [Markdown Guide](https://www.markdownguide.org/)
- **Policy content**: Consult with legal counsel
- **UI/UX**: The space-themed viewer handles all styling automatically
