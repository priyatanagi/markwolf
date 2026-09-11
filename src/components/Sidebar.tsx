import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Pin,
  Trash2,
  Copy,
  Lock,
  Cloud,
  X,
  Upload,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { Doc } from '../types';
import { Tooltip } from './Tooltip';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  docs: Doc[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateDoc: () => void;
  onCreateFromTemplate?: (template: { title: string; content: string; tags?: string[] }) => void;
  onDeleteDoc: (id: string) => void;
  onDuplicateDoc: (id: string) => void;
  onTogglePin: (id: string) => void;
  onImportFile: (file: File) => void;
  isOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  docs,
  activeDocId,
  onSelectDoc,
  onCreateDoc,
  onCreateFromTemplate,
  onDeleteDoc,
  onDuplicateDoc,
  onTogglePin,
  onImportFile,
  isOnline,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    docs.forEach((d) => d.tags?.forEach((t) => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [docs]);

  // Filtered and sorted docs (pinned first, then updated recently)
  const filteredDocs = useMemo(() => {
    return docs
      .filter((doc) => {
        const matchesSearch =
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || doc.tags?.includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [docs, searchQuery, selectedTag]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportFile(e.target.files[0]);
    }
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-72 md:w-64 lg:w-72 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand / Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs">
              <FileText size={16} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Workspace
              </h2>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {docs.length} {docs.length === 1 ? 'document' : 'documents'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-sidebar-close-mobile"
              onClick={onClose}
              aria-label="Close sidebar"
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action bar: New Document & Import */}
        <div className="p-3 grid grid-cols-2 gap-2 border-b border-zinc-200/70 dark:border-zinc-800/70">
          <button
            id="btn-new-document"
            type="button"
            onClick={onCreateDoc}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>New Doc</span>
          </button>

          <label
            id="btn-import-document"
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors"
          >
            <Upload size={14} />
            <span>Import</span>
            <input
              type="file"
              accept=".md,.markdown,.txt"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
            <input
              id="sidebar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Tag filters pill row */}
          {allTags.length > 0 && (
            <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                  selectedTag === null
                    ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md whitespace-nowrap transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Tag size={10} />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Documents List */}
        <div
          id="sidebar-docs-list"
          className="flex-1 overflow-y-auto px-2 py-1 space-y-1"
        >
          {filteredDocs.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
              No matching documents
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isActive = doc.id === activeDocId;
              return (
                <div
                  key={doc.id}
                  id={`doc-item-${doc.id}`}
                  onClick={() => onSelectDoc(doc.id)}
                  className={`group relative flex flex-col p-2.5 rounded-lg text-left cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 border border-blue-200/70 dark:border-blue-800/60'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {doc.pinned && (
                        <Pin
                          size={12}
                          className="shrink-0 text-amber-500 fill-amber-500 rotate-45"
                        />
                      )}
                      {doc.isEncrypted && (
                        <Lock size={12} className="shrink-0 text-emerald-500" />
                      )}
                      {doc.driveFileId && (
                        <Cloud size={12} className="shrink-0 text-blue-500" />
                      )}
                      <span className="text-xs font-semibold truncate">
                        {doc.title || 'Untitled Document'}
                      </span>
                    </div>

                    {/* Action buttons (hover) */}
                    <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                      <Tooltip content={doc.pinned ? 'Unpin' : 'Pin to top'}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(doc.id);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <Pin size={12} />
                        </button>
                      </Tooltip>

                      <Tooltip content="Duplicate">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateDoc(doc.id);
                          }}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        >
                          <Copy size={12} />
                        </button>
                      </Tooltip>

                      {docs.length > 1 && (
                        <Tooltip content="Delete">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDoc(doc.id);
                            }}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>

                  {/* Snippet / Date */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
                    <span className="truncate pr-2">
                      {doc.isEncrypted ? 'Encrypted document' : doc.content.slice(0, 35) || 'Empty document'}
                    </span>
                    <span className="shrink-0">{formatRelativeTime(doc.updatedAt)}</span>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {doc.tags.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 rounded text-[10px] bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Offline & Security Status Footer */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/40 text-[11px] flex items-center justify-between text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>{isOnline ? 'Cloud Ready' : 'Working Offline'}</span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400">v1.2</span>
        </div>
      </aside>
    </>
  );
};
