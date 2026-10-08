import React from 'react';
import { FileText, X } from 'lucide-react';

export type ImportMode = 'new' | 'append' | 'replace';

interface ImportOptionsModalProps {
  isOpen: boolean;
  fileName: string;
  fileSizeBytes: number;
  preview: string;
  currentDocTitle?: string;
  onChoose: (mode: ImportMode) => void;
  onCancel: () => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ImportOptionsModal: React.FC<ImportOptionsModalProps> = ({
  isOpen,
  fileName,
  fileSizeBytes,
  preview,
  currentDocTitle,
  onChoose,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="import-options-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-options-title"
        className="relative w-full max-w-lg p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xl"
      >
        <button
          id="btn-import-options-close"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-lg shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <FileText size={20} />
          </div>
          <div>
            <h3 id="import-options-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Import file
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              "{fileName}" &middot; {formatSize(fileSizeBytes)}
            </p>
          </div>
        </div>

        <div className="mb-4 max-h-32 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1.5">
            Preview
          </p>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs text-zinc-700 dark:text-zinc-300 leading-5">
            {preview || '(empty file)'}
          </pre>
        </div>

        <div className="grid gap-2">
          <button
            id="btn-import-new"
            type="button"
            onClick={() => onChoose('new')}
            className="w-full text-left px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
          >
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">Create as new document</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">Keeps all current documents untouched</span>
          </button>

          {currentDocTitle && (
            <>
              <button
                id="btn-import-append"
                type="button"
                onClick={() => onChoose('append')}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  Append to "{currentDocTitle}"
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Adds the file content to the end of the current document</span>
              </button>

              <button
                id="btn-import-replace"
                type="button"
                onClick={() => onChoose('replace')}
                className="w-full text-left px-4 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <span className="block text-sm font-medium text-rose-700 dark:text-rose-300">
                  Replace "{currentDocTitle}"
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">Overwrites the current document content</span>
              </button>
            </>
          )}
        </div>

        <button
          id="btn-import-options-cancel"
          type="button"
          onClick={onCancel}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
