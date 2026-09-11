import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  Search,
  Code,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Flame,
  LayoutGrid,
  Eye,
} from 'lucide-react';

interface InlineCssModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (snippet: string) => void;
}

interface StyleSnippet {
  id: string;
  title: string;
  category: 'callouts' | 'badges' | 'cards' | 'text' | 'layout';
  snippet: string;
  previewDescription: string;
  icon?: any;
}

export const InlineCssModal: React.FC<InlineCssModalProps> = ({ isOpen, onClose, onInsert }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customHtml, setCustomHtml] = useState(
    `<div style="padding: 1rem; border-radius: 8px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-weight: 500;">\n  ✨ Custom Styled Box with Gradient\n</div>`
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewSnippet, setPreviewSnippet] = useState<string | null>(null);

  if (!isOpen) return null;

  const snippets: StyleSnippet[] = [
    // Callouts
    {
      id: 'callout-info',
      title: 'Info Callout Box',
      category: 'callouts',
      icon: Info,
      snippet: `<div style="padding: 12px 16px; border-left: 4px solid #3b82f6; background-color: #eff6ff; border-radius: 6px; color: #1e40af; margin: 16px 0; font-size: 14px;">\n  <strong>Note:</strong> Here is important contextual information for the reader.\n</div>`,
      previewDescription: 'Clean blue background with thick left border for helpful tips',
    },
    {
      id: 'callout-warning',
      title: 'Warning Callout Box',
      category: 'callouts',
      icon: AlertTriangle,
      snippet: `<div style="padding: 12px 16px; border-left: 4px solid #f59e0b; background-color: #fffbeb; border-radius: 6px; color: #92400e; margin: 16px 0; font-size: 14px;">\n  <strong>Caution:</strong> Proceed with attention when modifying this section.\n</div>`,
      previewDescription: 'Amber highlight box alerting readers to caveats',
    },
    {
      id: 'callout-success',
      title: 'Success / Completed Box',
      category: 'callouts',
      icon: CheckCircle,
      snippet: `<div style="padding: 12px 16px; border-left: 4px solid #10b981; background-color: #ecfdf5; border-radius: 6px; color: #065f46; margin: 16px 0; font-size: 14px;">\n  <strong>Success:</strong> Step completed successfully without errors.\n</div>`,
      previewDescription: 'Emerald green box confirming achievements and results',
    },
    {
      id: 'callout-danger',
      title: 'Error / Danger Box',
      category: 'callouts',
      icon: Flame,
      snippet: `<div style="padding: 12px 16px; border-left: 4px solid #ef4444; background-color: #fef2f2; border-radius: 6px; color: #991b1b; margin: 16px 0; font-size: 14px;">\n  <strong>Danger:</strong> This operation is destructive and cannot be undone.\n</div>`,
      previewDescription: 'Rose red alert container for critical warnings',
    },

    // Badges & Pills
    {
      id: 'badge-pill-blue',
      title: 'Status Pill Badge',
      category: 'badges',
      snippet: `<span style="display: inline-block; padding: 2px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; background-color: #dbeafe; color: #1d4ed8;">IN PROGRESS</span>`,
      previewDescription: 'Rounded inline badge for task status or version labels',
    },
    {
      id: 'badge-pill-green',
      title: 'Verified Pill Badge',
      category: 'badges',
      snippet: `<span style="display: inline-block; padding: 2px 10px; font-size: 12px; font-weight: 600; border-radius: 9999px; background-color: #d1fae5; color: #047857;">VERIFIED ✓</span>`,
      previewDescription: 'Green badge for confirmed states and certifications',
    },
    {
      id: 'badge-gradient',
      title: 'Gradient Highlight Tag',
      category: 'badges',
      snippet: `<span style="display: inline-block; padding: 3px 12px; font-size: 12px; font-weight: bold; border-radius: 6px; background: linear-gradient(90deg, #ec4899, #8b5cf6); color: white;">PRO FEATURE</span>`,
      previewDescription: 'Vibrant gradient tag that commands attention',
    },

    // Cards & Containers
    {
      id: 'card-framed',
      title: 'Framed Card Container',
      category: 'cards',
      snippet: `<div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 20px; margin: 18px 0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06); background-color: #fafafa;">\n  <h4 style="margin: 0 0 8px 0; color: #111827; font-size: 16px;">Featured Summary</h4>\n  <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">This card stands out with rounded corners, subtle border, and soft drop shadow.</p>\n</div>`,
      previewDescription: 'Elevated content card with border and soft shadow',
    },
    {
      id: 'card-quote',
      title: 'Styled Testimonial / Quote',
      category: 'cards',
      snippet: `<div style="position: relative; padding: 24px 28px; margin: 20px 0; border-radius: 12px; background: #f8fafc; border-left: 6px solid #6366f1; font-style: italic; color: #334155;">\n  <p style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.6;">"Good design is obvious. Great design is transparent."</p>\n  <span style="font-weight: 600; font-style: normal; font-size: 13px; color: #6366f1;">— Joe Sparano</span>\n</div>`,
      previewDescription: 'Modern testimonial card with citation attribution',
    },

    // Text & Typography
    {
      id: 'text-highlight',
      title: 'Yellow Marker Highlight',
      category: 'text',
      snippet: `<mark style="background-color: #fef08a; padding: 2px 6px; border-radius: 4px; color: #713f12; font-weight: 500;">highlighted text</mark>`,
      previewDescription: 'Authentic highlighter marker effect on text',
    },
    {
      id: 'text-kbd',
      title: 'Keyboard Key Styling',
      category: 'text',
      snippet: `<kbd style="padding: 2px 6px; font-size: 12px; font-family: monospace; background-color: #f3f4f6; border: 1px solid #d1d5db; border-bottom: 2px solid #9ca3af; border-radius: 4px; color: #374151;">Ctrl + P</kbd>`,
      previewDescription: 'Physical keyboard key representation for documentation',
    },
    {
      id: 'text-gradient',
      title: 'Gradient Text Heading',
      category: 'text',
      snippet: `<h2 style="background: linear-gradient(135deg, #2563eb, #9333ea); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 24px; font-weight: 800; margin: 16px 0;">Spectacular Gradient Headline</h2>`,
      previewDescription: 'Vibrant dual-color text gradient heading',
    },

    // Layout
    {
      id: 'layout-two-col',
      title: 'Two-Column Grid Layout',
      category: 'layout',
      icon: LayoutGrid,
      snippet: `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; margin: 20px 0;">\n  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff;">\n    <strong>Column A</strong>\n    <p style="font-size: 13px; color: #6b7280; margin-top: 6px;">Content for first column.</p>\n  </div>\n  <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #ffffff;">\n    <strong>Column B</strong>\n    <p style="font-size: 13px; color: #6b7280; margin-top: 6px;">Content for second column.</p>\n  </div>\n</div>`,
      previewDescription: 'Responsive responsive 2-column bento grid for comparisons',
    },
    {
      id: 'layout-divider-dot',
      title: 'Decorative Dot Divider',
      category: 'layout',
      snippet: `<div style="text-align: center; margin: 32px 0; color: #9ca3af; letter-spacing: 0.5rem; font-size: 18px;">• • •</div>`,
      previewDescription: 'Sophisticated literary section divider',
    },
  ];

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.previewDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectSnippet = (snippet: string) => {
    onInsert(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="inline-css-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inline-css-modal-title"
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Palette size={18} />
            </div>
            <div>
              <h3 id="inline-css-modal-title" className="text-base font-semibold">
                Inline CSS & HTML Styling Wizard
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Insert rich HTML & inline CSS snippets directly into your Markdown document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styling snippets (e.g. callout, badge, card, grid, kbd)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'All Elements' },
              { id: 'callouts', label: 'Callout Boxes' },
              { id: 'badges', label: 'Badges & Tags' },
              { id: 'cards', label: 'Cards & Quotes' },
              { id: 'text', label: 'Text Styles' },
              { id: 'layout', label: 'Grid & Dividers' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white font-medium'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300/70 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredSnippets.length === 0 ? (
            <div className="text-center py-8 text-xs text-zinc-400">
              No snippets matched "{searchQuery}"
            </div>
          ) : (
            filteredSnippets.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-800 bg-white dark:bg-zinc-800/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {s.title}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                      {s.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {s.previewDescription}
                  </p>
                  <div className="mt-2 text-[11px] font-mono text-zinc-400 bg-zinc-50 dark:bg-zinc-900/90 p-1.5 rounded border border-zinc-100 dark:border-zinc-800 truncate">
                    {s.snippet}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectSnippet(s.snippet)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 rounded-lg transition-colors shrink-0"
                >
                  Insert Snippet
                </button>
              </div>
            ))
          )}

          {/* Custom HTML/CSS composer */}
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-xs font-semibold mb-1 flex items-center gap-1.5">
              <Code size={14} className="text-purple-500" />
              <span>Custom Inline HTML & CSS Composer</span>
            </div>
            <textarea
              value={customHtml}
              onChange={(e) => setCustomHtml(e.target.value)}
              rows={3}
              className="w-full p-2.5 font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-900 text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500 mt-1"
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewSnippet(showPreview ? null : customHtml);
                  setShowPreview(!showPreview);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  showPreview
                    ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Eye size={13} />
                <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSnippet(customHtml)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                Insert Custom HTML
              </button>
            </div>

            {/* Live Preview */}
            {showPreview && previewSnippet && (
              <div className="mt-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 overflow-auto">
                <div className="text-[10px] font-mono text-zinc-400 mb-2 select-none">LIVE PREVIEW</div>
                <div
                  className="text-sm text-zinc-900 dark:text-zinc-100 [&_*]:max-w-full"
                  dangerouslySetInnerHTML={{ __html: previewSnippet }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
