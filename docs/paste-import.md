# Paste & Import

How text gets into the editor, and what to expect from each path.

## Pasting from other apps (Word, browsers, etc.)

| Action | Result |
| --- | --- |
| `Ctrl+V` with rich text (HTML) on the clipboard | Formatting is converted to Markdown: headings, bold/italic/strikethrough, links, images, lists (nested), blockquotes, code blocks, tables, `<hr>`. Underlines are kept as `<u>` tags since Markdown has no underline syntax. |
| `Ctrl+V` with plain text | Inserted as-is (browser default). |
| `Ctrl+Shift+V` | Always plain text, HTML ignored. |
| Toolbar "Paste" icon | Reads the system clipboard and converts HTML to Markdown, like `Ctrl+V` with rich content. |
| Toolbar "Paste as plain text" icon | Reads the clipboard as plain text only. |

Notes:

- Toolbar paste buttons use the browser Clipboard API. If the page is not focused or permission is denied, the editor shows a hint to use `Ctrl+V` instead.
- HTML is sanitized (via DOMPurify) before conversion — scripts and event handlers never reach the editor.
- Inline `<span class="...">` markup survives the conversion, so icon-font snippets (see below) keep working after a paste.
- Conversion from very complex Word documents is "good enough", not perfect; inspect the result and fix up as needed.
- Word `.docx` files are **not** parsed natively. Copy-paste the content from Word (paste will convert formatting), or export from Word as Markdown/text first.

## Material Symbols icons (type the name directly)

The preview loads the *Material Symbols Outlined* font, so you can write an icon inline in Markdown using its ligature name:

```markdown
Cleaning tool: <span class="material-symbols-outlined">ink_eraser</span>
```

Use the exact snake_case name from the Material Symbols catalogue (the same names the **Emoji & Icons → Material Icons** picker inserts), e.g. `home`, `favorite`, `rocket_launch`, `check_circle`, `lightbulb`.

If the icon shows as literal words instead of a glyph, that name has no ligature in this font weight/style — try the canonical variant name instead (`eraser` → `ink_eraser`, `fire` → `local_fire_department`, `heart` → `favorite`).

## Drag & drop into the editor

- Dropping a `.md`, `.markdown`, or `.txt` file **inserts its content at the cursor** — it never replaces the document.
- While dragging a file over the editor, a dashed drop-zone highlight appears.
- Files over 500 KB are rejected on drop (use the sidebar Import instead); non-text files and `.docx` show an explanatory toast.

## Importing from the sidebar

Importing a file (`Import` button) now shows an options dialog with a content preview:

1. **Create as new document** — the previous behavior; adds a new doc tagged `imported`.
2. **Append to "current doc"** — adds the file content to the end of the open document.
3. **Replace "current doc"** — overwrites the open document (button is styled as destructive).

Safeguards:

- Files larger than 500 KB trigger a confirmation before reading.
- `.docx`/`.doc` are rejected with a hint (see above).
- If a file cannot be decoded as UTF-8 text, an error toast is shown and nothing is changed.

## Shortcuts summary

| Shortcut | Behavior |
| --- | --- |
| `Ctrl+V` | Paste, HTML converted to Markdown when present |
| `Ctrl+Shift+V` | Paste as plain text |
| Drop `.md`/`.txt` | Insert file at cursor |
