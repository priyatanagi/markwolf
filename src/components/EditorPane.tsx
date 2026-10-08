import React, { useRef, useEffect, useState, useMemo } from 'react';
import { FontFamily, FontSize } from '../types';

interface EditorPaneProps {
  value: string;
  onChange: (newValue: string) => void;
  fontFamily: FontFamily;
  fontSize: FontSize;
  showLineNumbers: boolean;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDownShortcut?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPasteEvent?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onNotify?: (message: string) => void;
  isEncryptedLocked?: boolean;
  onUnlockRequest?: () => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  value,
  onChange,
  fontFamily,
  fontSize,
  showLineNumbers,
  onScroll,
  textareaRef,
  onKeyDownShortcut,
  onPasteEvent,
  onNotify,
  isEncryptedLocked = false,
  onUnlockRequest,
}) => {
  const localRef = useRef<HTMLTextAreaElement>(null);
  const activeRef = textareaRef || localRef;
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Calculate line numbers
  const linesCount = useMemo(() => {
    return value.split('\n').length;
  }, [value]);

  const lineNumbers = useMemo(() => {
    return Array.from({ length: Math.max(linesCount, 1) }, (_, i) => i + 1);
  }, [linesCount]);

  // Sync scroll with line numbers
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (onScroll) {
      onScroll(e);
    }
  };

  const updateCursorPosition = () => {
    const el = activeRef.current;
    if (!el) return;
    const pos = el.selectionStart;
    const textBefore = value.substring(0, pos);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Handle Tab key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = activeRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Single line tab
      if (start === end) {
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        });
      } else {
        // Multi-line indent/unindent
        const before = value.substring(0, start);
        const selected = value.substring(start, end);
        const after = value.substring(end);

        if (e.shiftKey) {
          // Un-indent
          const lines = selected.split('\n');
          const modified = lines.map(line => line.startsWith('  ') ? line.substring(2) : (line.startsWith(' ') ? line.substring(1) : line)).join('\n');
          onChange(before + modified + after);
        } else {
          // Indent
          const lines = selected.split('\n');
          const modified = lines.map(line => '  ' + line).join('\n');
          onChange(before + modified + after);
        }
      }
      return;
    }

    if (onKeyDownShortcut) {
      onKeyDownShortcut(e);
    }
  };

  // Font class
  const fontClass = useMemo(() => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'sans':
        return 'font-sans';
      case 'mono':
      default:
        return 'font-mono';
    }
  }, [fontFamily]);

  // Size class
  const sizeClass = useMemo(() => {
    switch (fontSize) {
      case 'sm':
        return 'text-xs leading-5';
      case 'lg':
        return 'text-base leading-6';
      case 'xl':
        return 'text-lg leading-7';
      case 'base':
      default:
        return 'text-sm leading-6';
    }
  }, [fontSize]);

  // File drag & drop: insert text files at cursor with visual drop-zone feedback
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOverFiles(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverFiles(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverFiles(false);

    const textarea = activeRef.current;
    const start = textarea ? textarea.selectionStart : value.length;
    const end = textarea ? textarea.selectionEnd : value.length;

    Array.from(e.dataTransfer.files).forEach((file) => {
      const isTextLike =
        file.type.startsWith('text/') || /\.(md|markdown|txt)$/i.test(file.name);

      if (/\.docx?$/i.test(file.name)) {
        onNotify?.(`"${file.name}" is a Word file — copy-paste its content or export it as Markdown first`);
        return;
      }
      if (isTextLike) {
        if (file.size > 500 * 1024) {
          onNotify?.(`"${file.name}" is ${(file.size / 1024).toFixed(0)} KB — too large to drop. Import it from the sidebar instead.`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result;
          if (typeof content !== 'string') return;
          const insertion = `\n\n${content.trim()}\n`;
          onChange(value.substring(0, start) + insertion + value.substring(end));
          onNotify?.(`Inserted "${file.name}" at cursor`);
          requestAnimationFrame(() => {
            if (!textarea) return;
            const pos = start + insertion.length;
            textarea.focus();
            textarea.setSelectionRange(pos, pos);
          });
        };
        reader.onerror = () => onNotify?.(`Could not read "${file.name}" as UTF-8 text`);
        reader.readAsText(file);
      } else {
        onNotify?.(`"${file.name}" is not a text file — dropped files must be .md, .markdown or .txt`);
      }
    });
  };

  if (isEncryptedLocked) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900/40 text-center">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl max-w-sm">
          <div className="text-3xl mb-3">🔒</div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Document is Encrypted
          </h3>
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
            This document is protected with AES-256-GCM client-side encryption. Enter your passphrase to unlock.
          </p>
          <button
            id="btn-unlock-locked-doc"
            type="button"
            onClick={onUnlockRequest}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            Unlock Document
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="editor-pane-container"
      className={`relative h-full flex flex-col bg-zinc-50/40 dark:bg-zinc-900/40 overflow-hidden transition-shadow ${
        isDragOverFiles ? 'ring-2 ring-inset ring-blue-400/70 dark:ring-blue-500/60' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOverFiles && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50/40 dark:bg-blue-950/30 border-2 border-dashed border-blue-400/70 dark:border-blue-500/50 rounded-sm pointer-events-none">
          <span className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-zinc-900/80 rounded-lg shadow-xs">
            Drop .md / .txt file to insert at cursor
          </span>
        </div>
      )}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        {showLineNumbers && (
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="hidden sm:block select-none py-6 px-2 text-right bg-zinc-100/50 dark:bg-zinc-950/40 border-r border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-400 dark:text-zinc-600 overflow-hidden min-w-[3rem]"
          >
            {lineNumbers.map((num) => (
              <div key={num} className={sizeClass}>
                {num}
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          id="markdown-textarea"
          ref={activeRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={onPasteEvent}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          placeholder="Start writing your Markdown here... Press Tab to indent."
          spellCheck={true}
          className={`flex-1 w-full h-full p-6 resize-none bg-transparent outline-none border-0 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 transition-colors focus:ring-0 ${fontClass} ${sizeClass}`}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-zinc-100/70 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-[11px] font-mono text-zinc-500 dark:text-zinc-500 select-none">
        <div className="flex items-center gap-3">
          <span>Markdown (GFM)</span>
          <span>·</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>·</span>
          <span>{linesCount} lines</span>
        </div>
      </div>
    </div>
  );
};
