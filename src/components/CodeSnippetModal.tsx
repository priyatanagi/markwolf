import React, { useState } from 'react';
import {
  Code,
  X,
  Check,
  Search,
  Sparkles,
  FileCode,
  Layers,
} from 'lucide-react';

interface CodeSnippetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSnippet: (snippetMarkdown: string) => void;
}

interface LanguageOption {
  id: string;
  name: string;
  category: 'Web' | 'Backend' | 'Data' | 'DevOps' | 'General';
  defaultSnippet: string;
  presets: { name: string; code: string }[];
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Web',
    defaultSnippet: `interface UserData {\n  id: string;\n  name: string;\n  email: string;\n}\n\nasync function fetchUserProfile(userId: string): Promise<UserData> {\n  const response = await fetch(\`/api/users/\${userId}\`);\n  if (!response.ok) throw new Error('User not found');\n  return response.json();\n}`,
    presets: [
      {
        name: 'Async API Fetch',
        code: `async function fetchData<T>(url: string): Promise<T> {\n  const res = await fetch(url);\n  if (!res.ok) throw new Error(\`HTTP error! status: \${res.status}\`);\n  return res.json();\n}`,
      },
      {
        name: 'Interface & Type',
        code: `export interface AppConfig {\n  apiUrl: string;\n  timeoutMs: number;\n  retryAttempts?: number;\n  features: {\n    darkMode: boolean;\n    analytics: boolean;\n  };\n}`,
      },
      {
        name: 'React Component Hook',
        code: `import { useState, useEffect } from 'react';\n\nexport function useDebounce<T>(value: T, delayMs: number): T {\n  const [debounced, setDebounced] = useState<T>(value);\n\n  useEffect(() => {\n    const handler = setTimeout(() => setDebounced(value), delayMs);\n    return () => clearTimeout(handler);\n  }, [value, delayMs]);\n\n  return debounced;\n}`,
      },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    category: 'Web',
    defaultSnippet: `function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func(...args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}`,
    presets: [
      {
        name: 'Fetch Request',
        code: `fetch('https://api.example.com/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error('Request failed', err));`,
      },
      {
        name: 'Array Map & Filter',
        code: `const items = [1, 2, 3, 4, 5];\nconst squaredEvens = items\n  .filter(n => n % 2 === 0)\n  .map(n => n ** 2);\nconsole.log(squaredEvens); // [4, 16]`,
      },
    ],
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Backend',
    defaultSnippet: `from typing import List, Optional\nimport json\n\ndef process_records(records: List[dict]) -> dict:\n    """Process and summarize record metrics."""\n    total = len(records)\n    valid = [r for r in records if r.get("status") == "active"]\n    return {\n        "total_count": total,\n        "active_ratio": len(valid) / total if total > 0 else 0.0,\n    }`,
    presets: [
      {
        name: 'FastAPI / Flask Route',
        code: `from fastapi import FastAPI, HTTPException\n\napp = FastAPI()\n\n@app.get("/items/{item_id}")\ndef read_item(item_id: int, q: str | None = None):\n    return {"item_id": item_id, "query": q}`,
      },
      {
        name: 'List Comprehension & Dict',
        code: `numbers = [1, 2, 3, 4, 5, 6]\nsquares = {n: n**2 for n in numbers if n % 2 == 0}\nprint(squares) # {2: 4, 4: 16, 6: 36}`,
      },
      {
        name: 'File Context Manager',
        code: `with open("data.json", "r", encoding="utf-8") as f:\n    data = json.load(f)\n    print(f"Loaded {len(data)} entries")`,
      },
    ],
  },
  {
    id: 'html',
    name: 'HTML5',
    category: 'Web',
    defaultSnippet: `<section class="hero-container">\n  <div class="card">\n    <h1 class="title">Productive Workspace</h1>\n    <p class="description">Write, organize, and export with zero distraction.</p>\n    <button type="button" class="btn-primary">Get Started</button>\n  </div>\n</section>`,
    presets: [
      {
        name: 'Semantic Article',
        code: `<article class="prose max-w-prose">\n  <header>\n    <h2>Design Principles</h2>\n    <time datetime="2026-09-10">September 10, 2026</time>\n  </header>\n  <p>Good design is as little design as possible.</p>\n</article>`,
      },
    ],
  },
  {
    id: 'css',
    name: 'CSS / Tailwind',
    category: 'Web',
    defaultSnippet: `.glass-panel {\n  background: rgba(255, 255, 255, 0.85);\n  backdrop-filter: blur(12px);\n  border: 1px solid rgba(229, 231, 235, 0.8);\n  border-radius: 0.75rem;\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);\n}`,
    presets: [
      {
        name: 'Flex Center Center',
        code: `.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 100vh;\n}`,
      },
      {
        name: 'CSS Grid Layout',
        code: `.grid-auto {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n  gap: 1.5rem;\n}`,
      },
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    category: 'Data',
    defaultSnippet: `SELECT \n  u.id,\n  u.email,\n  COUNT(d.id) AS total_documents,\n  MAX(d.updated_at) AS last_activity\nFROM users u\nLEFT JOIN documents d ON d.user_id = u.id\nWHERE u.is_active = true\nGROUP BY u.id, u.email\nHAVING COUNT(d.id) > 0\nORDER BY last_activity DESC\nLIMIT 50;`,
    presets: [
      {
        name: 'Create Table',
        code: `CREATE TABLE documents (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title VARCHAR(255) NOT NULL,\n  content TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);`,
      },
      {
        name: 'Upsert Query',
        code: `INSERT INTO user_preferences (user_id, theme, auto_save)\nVALUES ($1, 'dark', true)\nON CONFLICT (user_id) \nDO UPDATE SET \n  theme = EXCLUDED.theme,\n  auto_save = EXCLUDED.auto_save;`,
      },
    ],
  },
  {
    id: 'bash',
    name: 'Bash / Shell',
    category: 'DevOps',
    defaultSnippet: `#!/usr/bin/env bash\nset -euo pipefail\n\necho "🚀 Deploying Markdown Studio build..."\nnpm run build\n\nif [ -d "dist" ]; then\n  echo "Build succeeded. Deploying to production server..."\nelse\n  echo "Build failed!" >&2\n  exit 1\nfi`,
    presets: [
      {
        name: 'Curl API Request',
        code: `curl -s -X POST "https://api.example.com/v1/sync" \\\n  -H "Authorization: Bearer $API_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"status": "published"}'`,
      },
      {
        name: 'Docker Run Script',
        code: `docker run -d \\\n  --name markdown-studio \\\n  -p 3000:3000 \\\n  -e NODE_ENV=production \\\n  markdown-app:latest`,
      },
    ],
  },
  {
    id: 'json',
    name: 'JSON',
    category: 'Data',
    defaultSnippet: `{\n  "name": "markdown-studio",\n  "version": "1.0.0",\n  "private": true,\n  "settings": {\n    "theme": "light",\n    "autoSave": true,\n    "syncScroll": true\n  }\n}`,
    presets: [
      {
        name: 'API Payload Schema',
        code: `{\n  "status": "success",\n  "code": 200,\n  "data": {\n    "items": [\n      { "id": 1, "title": "Document Alpha", "isEncrypted": false },\n      { "id": 2, "title": "Encrypted Vault", "isEncrypted": true }\n    ]\n  }\n}`,
      },
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'Backend',
    defaultSnippet: `use std::error::Error;\n\n#[derive(Debug, serde::Serialize, serde::Deserialize)]\npub struct Document {\n    pub id: String,\n    pub title: String,\n    pub content: String,\n}\n\nfn main() -> Result<(), Box<dyn Error>> {\n    println!("Rust microservice online.");\n    Ok(())\n}`,
    presets: [
      {
        name: 'Result Handler',
        code: `fn parse_config(raw: &str) -> Result<Config, ConfigError> {\n    let config = serde_json::from_str(raw)?;\n    Ok(config)\n}`,
      },
    ],
  },
  {
    id: 'go',
    name: 'Go',
    category: 'Backend',
    defaultSnippet: `package main\n\nimport (\n\t"fmt"\n\t"net/http"\n)\n\nfunc handler(w http.ResponseWriter, r *http.Request) {\n\tfmt.Fprintf(w, "Hello from Go microservice!")\n}\n\nfunc main() {\n\thttp.HandleFunc("/api/health", handler)\n\thttp.ListenAndServe(":3000", nil)\n}`,
    presets: [
      {
        name: 'Struct with JSON tags',
        code: `type UserProfile struct {\n\tID       string \`json:"id"\`\n\tUsername string \`json:"username"\`\n\tRole     string \`json:"role"\`\n}`,
      },
    ],
  },
  {
    id: 'yaml',
    name: 'YAML',
    category: 'DevOps',
    defaultSnippet: `version: "3.8"\nservices:\n  app:\n    image: node:20-alpine\n    ports:\n      - "3000:3000"\n    environment:\n      - NODE_ENV=production\n    restart: always`,
    presets: [
      {
        name: 'GitHub Action Workflow',
        code: `name: CI Test & Build\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run build`,
      },
    ],
  },
  {
    id: 'markdown',
    name: 'Markdown',
    category: 'General',
    defaultSnippet: `# Project Title\n\nA brief description of what this project does.\n\n## 🛠️ Installation\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## 🚀 Features\n- Fast live preview\n- Encrypted storage`,
    presets: [],
  },
];

export const CodeSnippetModal: React.FC<CodeSnippetModalProps> = ({
  isOpen,
  onClose,
  onInsertSnippet,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>('typescript');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [codeText, setCodeText] = useState<string>(LANGUAGES[0].defaultSnippet);
  const [titleComment, setTitleComment] = useState<string>('');

  if (!isOpen) return null;

  const currentLangObj = LANGUAGES.find((l) => l.id === selectedLang) || LANGUAGES[0];

  const filteredLanguages = LANGUAGES.filter((lang) => {
    const matchesSearch =
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || lang.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectLanguage = (langId: string) => {
    setSelectedLang(langId);
    const found = LANGUAGES.find((l) => l.id === langId);
    if (found) {
      setCodeText(found.defaultSnippet);
    }
  };

  const handleInsert = () => {
    let result = '';
    if (titleComment.trim()) {
      result += `\`\`\`${selectedLang} title="${titleComment.trim()}"\n`;
    } else {
      result += `\`\`\`${selectedLang}\n`;
    }
    result += codeText.trim() + '\n```\n';

    onInsertSnippet(result);
    onClose();
  };

  return (
    <div
      id="code-snippet-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="code-snippet-modal"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Code size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Insert Code Snippet
              </h2>
              <p className="text-xs text-zinc-500">
                Select language, choose a template or paste custom code
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Language Selection Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <FileCode size={13} />
                <span>Programming Language</span>
              </label>

              {/* Category filter pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {['All', 'Web', 'Backend', 'Data', 'DevOps'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded-full transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-medium'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Language grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-zinc-50 dark:bg-zinc-950/40 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {filteredLanguages.map((lang) => {
                const isSelected = lang.id === selectedLang;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <span className="truncate">{lang.name}</span>
                    {isSelected && <Check size={12} className="shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preset Templates */}
          {currentLangObj.presets.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
                <Sparkles size={13} className="text-amber-500" />
                <span>Ready-to-use Templates ({currentLangObj.name})</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentLangObj.presets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setCodeText(preset.code)}
                    className="px-2.5 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-zinc-700 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Optional Title / File Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              File Name or Caption <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={titleComment}
              onChange={(e) => setTitleComment(e.target.value)}
              placeholder="e.g. services/api.ts or query.sql"
              className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* Code Editor Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Code Body
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {codeText.split('\n').length} lines
              </span>
            </div>
            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-900 text-zinc-100">
              <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-mono text-zinc-400">
                <span className="text-blue-400">{currentLangObj.id}</span>
                <span>UTF-8</span>
              </div>
              <textarea
                id="code-snippet-input"
                value={codeText}
                onChange={(e) => setCodeText(e.target.value)}
                placeholder="// Enter or paste your code snippet here"
                rows={8}
                spellCheck={false}
                className="w-full p-3.5 bg-transparent font-mono text-xs leading-5 text-zinc-200 resize-none outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="text-xs text-zinc-500 font-mono">
            ```{currentLangObj.id}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-insert-code-snippet"
              type="button"
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Check size={14} />
              <span>Insert Snippet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
