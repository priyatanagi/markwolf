import { Doc, DocHistory, EditorSettings } from '../types';

const STORAGE_KEYS = {
  DOCS: 'md_app_docs_v1',
  ACTIVE_DOC_ID: 'md_app_active_doc_id_v1',
  SETTINGS: 'md_app_settings_v1',
  HISTORY_PREFIX: 'md_app_history_v1_',
};

export const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'light',
  fontFamily: 'sans',
  fontSize: 'base',
  layout: 'split',
  zenMode: false,
  syncScroll: true,
  showLineNumbers: true,
  previewWidth: 'standard',
  autoSave: true,
  autoCapitalizeSentences: true,
  headerFooter: {
    enabled: true,
    footerEnabled: true,
    showHeaderInExport: true,
    showFooterInExport: true,
    headerLeft: '{{title}}',
    headerCenter: '',
    headerRight: '{{date}}',
    footerLeft: 'Created with Markdown Studio',
    footerCenter: '{{page}}',
    footerRight: '',
    customCss: '',
  },
};

const STARTER_MARKDOWN = `# Modern Markdown Studio

Welcome to your distraction-free Markdown workspace. Built for high-velocity writing, documentation, and real-time collaboration.

## 🚀 Key Features

* **Real-time Live Preview** with synchronized scrolling
* **Prism.js Syntax Highlighting** for TypeScript, Python, Bash, CSS, & more
* **Multi-Format Export**: Instant vector PDF, high-res Image, Markdown, & clean HTML
* **Google Drive Sync & Cloud Backup** with secure Google Sign-in
* **Client-Side E2E Encryption** (AES-256-GCM) for private sensitive notes
* **Full Offline Support** with local snapshots & revision history

---

## 💻 Code Highlighting

Here is an example of modern TypeScript code:

\`\`\`typescript
interface UserProfile {
  id: string;
  name: string;
  role: 'architect' | 'developer' | 'designer';
}

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}
\`\`\`

And Python with clean indentation:

\`\`\`python
def fibonacci(n: int) -> list[int]:
    """Generate Fibonacci sequence up to n numbers."""
    seq = [0, 1]
    while len(seq) < n:
        seq.append(seq[-1] + seq[-2])
    return seq[:n]

print(fibonacci(8))
\`\`\`

---

## 📊 Structured Tables

| Feature | Local Browser | Google Drive Cloud | E2E Encrypted |
| :--- | :---: | :---: | :---: |
| **Real-time Editing** | ✅ Supported | ✅ Synced | ✅ AES-256 |
| **PDF / Image Export** | ✅ Instant | ✅ Cloud Saved | ✅ Passphrase Protected |
| **Offline Performance**| ✅ 100% Offline | 🔄 Syncs on Reconnect | ✅ Protected Key |

---

## 📋 Task Checklist

- [x] Integrate high-precision live editor & markdown preview
- [x] Configure Google Drive workspace synchronization
- [x] Implement multi-page PDF & PNG image exports
- [x] Build version history snapshots & diff comparison
- [ ] Write documentation for team members
- [ ] Export quarterly report to PDF

---

## 💡 Thoughtful Design Quotes

> "Simplicity is prerequisite for reliability."
> — Edsger W. Dijkstra

> "Good design is as little design as possible."
> — Dieter Rams

---

### Formatting Highlights
You can use **bold text**, *italic text*, ~~strikethrough~~, \`inline code\`, and [external links](https://google.com).
`;

export function loadSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to parse saved settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to persist settings', e);
  }
}

export function loadDocs(): Doc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (raw) {
      const parsed: Doc[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load documents from storage', e);
  }

  // Initial starter document
  const initialDoc: Doc = {
    id: 'starter-doc-01',
    title: 'Modern Markdown Studio',
    content: STARTER_MARKDOWN,
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now(),
    tags: ['Welcome', 'Guide'],
    pinned: true,
    isEncrypted: false,
  };

  saveDocs([initialDoc]);
  return [initialDoc];
}

export function saveDocs(docs: Doc[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents to storage', e);
  }
}

export function loadActiveDocId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_DOC_ID);
}

export function saveActiveDocId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_DOC_ID, id);
}

export function loadDocHistory(docId: string): DocHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY_PREFIX + docId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load history', e);
  }
  return [];
}

export function saveDocHistory(docId: string, history: DocHistory[]): void {
  try {
    // Keep max 30 snapshots per document to avoid storage overflow
    const trimmed = history.slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.HISTORY_PREFIX + docId, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function recordHistoryCheckpoint(doc: Doc, note?: string): void {
  const history = loadDocHistory(doc.id);
  const words = doc.content.trim().split(/\s+/).filter(Boolean).length;
  
  // Don't add if identical to latest checkpoint
  if (history.length > 0 && history[0].content === doc.content) {
    return;
  }

  const snapshot: DocHistory = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    docId: doc.id,
    timestamp: Date.now(),
    content: doc.content,
    title: doc.title,
    charCount: doc.content.length,
    wordCount: words,
    note,
  };

  saveDocHistory(doc.id, [snapshot, ...history]);
}
