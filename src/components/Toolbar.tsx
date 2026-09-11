import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  FileCode,
  List,
  ListOrdered,
  CheckSquare,
  Link,
  Image,
  Table,
  Minus,
  Undo2,
  Redo2,
  Clock,
  Smile,
  Palette,
} from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ToolbarProps {
  onInsertMarkdown: (prefix: string, suffix?: string, defaultText?: string) => void;
  onOpenCodeSnippetModal?: () => void;
  onOpenTableWizard?: () => void;
  onOpenEmojiPicker?: () => void;
  onOpenInlineCssModal?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  wordCount: number;
  charCount: number;
  readingTime: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onInsertMarkdown,
  onOpenCodeSnippetModal,
  onOpenTableWizard,
  onOpenEmojiPicker,
  onOpenInlineCssModal,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
  wordCount,
  charCount,
  readingTime,
}) => {
  const insertTable = () => {
    if (onOpenTableWizard) {
      onOpenTableWizard();
    } else {
      const tableTemplate = `\n| Column 1 | Column 2 | Column 3 |\n| :--- | :---: | ---: |\n| Item 1 | Details | $10.00 |\n| Item 2 | Details | $20.00 |\n`;
      onInsertMarkdown(tableTemplate, '', '');
    }
  };

  const insertCodeBlock = () => {
    if (onOpenCodeSnippetModal) {
      onOpenCodeSnippetModal();
    } else {
      onInsertMarkdown('```typescript\n', '\n```', '// Type your code here');
    }
  };

  return (
    <div
      id="editor-toolbar"
      className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/60 px-3 py-1.5 backdrop-blur-xs select-none overflow-x-auto text-xs"
    >
      {/* Action group */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Tooltip content="Undo" shortcut="Ctrl+Z">
          <button
            id="tb-btn-undo"
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <Undo2 size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Redo" shortcut="Ctrl+Y">
          <button
            id="tb-btn-redo"
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Redo"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
          >
            <Redo2 size={15} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Text styling */}
        <Tooltip content="Bold" shortcut="Ctrl+B">
          <button
            id="tb-btn-bold"
            type="button"
            onClick={() => onInsertMarkdown('**', '**', 'bold text')}
            aria-label="Bold"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bold size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Italic" shortcut="Ctrl+I">
          <button
            id="tb-btn-italic"
            type="button"
            onClick={() => onInsertMarkdown('*', '*', 'italic text')}
            aria-label="Italic"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Italic size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Strikethrough" shortcut="~~">
          <button
            id="tb-btn-strike"
            type="button"
            onClick={() => onInsertMarkdown('~~', '~~', 'strikethrough')}
            aria-label="Strikethrough"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Strikethrough size={15} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Headings */}
        <Tooltip content="Heading 1" shortcut="# ">
          <button
            id="tb-btn-h1"
            type="button"
            onClick={() => onInsertMarkdown('# ', '', 'Heading 1')}
            aria-label="Heading 1"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Heading1 size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Heading 2" shortcut="## ">
          <button
            id="tb-btn-h2"
            type="button"
            onClick={() => onInsertMarkdown('## ', '', 'Heading 2')}
            aria-label="Heading 2"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Heading2 size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Heading 3" shortcut="### ">
          <button
            id="tb-btn-h3"
            type="button"
            onClick={() => onInsertMarkdown('### ', '', 'Heading 3')}
            aria-label="Heading 3"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Heading3 size={15} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Lists & Tasks */}
        <Tooltip content="Bullet List" shortcut="- ">
          <button
            id="tb-btn-bullet-list"
            type="button"
            onClick={() => onInsertMarkdown('- ', '', 'List item')}
            aria-label="Bullet List"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <List size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Numbered List" shortcut="1. ">
          <button
            id="tb-btn-numbered-list"
            type="button"
            onClick={() => onInsertMarkdown('1. ', '', 'First item')}
            aria-label="Numbered List"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <ListOrdered size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Task List" shortcut="- [ ] ">
          <button
            id="tb-btn-task-list"
            type="button"
            onClick={() => onInsertMarkdown('- [ ] ', '', 'New task')}
            aria-label="Task List"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <CheckSquare size={15} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Code & Quote */}
        <Tooltip content="Inline Code" shortcut="`">
          <button
            id="tb-btn-inline-code"
            type="button"
            onClick={() => onInsertMarkdown('`', '`', 'code')}
            aria-label="Inline Code"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Code size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Code Snippet" shortcut="Languages & Presets">
          <button
            id="tb-btn-code-block"
            type="button"
            onClick={insertCodeBlock}
            aria-label="Insert Code Snippet"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <FileCode size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Blockquote" shortcut="> ">
          <button
            id="tb-btn-quote"
            type="button"
            onClick={() => onInsertMarkdown('> ', '', 'Quote here')}
            aria-label="Blockquote"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Quote size={15} />
          </button>
        </Tooltip>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1.5" />

        {/* Media & Structure */}
        <Tooltip content="Link" shortcut="Ctrl+K">
          <button
            id="tb-btn-link"
            type="button"
            onClick={() => onInsertMarkdown('[', '](https://example.com)', 'Link title')}
            aria-label="Insert Link"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Link size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Image" shortcut="![alt](url)">
          <button
            id="tb-btn-image"
            type="button"
            onClick={() => onInsertMarkdown('![', '](https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800)', 'Image description')}
            aria-label="Insert Image"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Image size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Table Wizard" shortcut="Interactive Grid">
          <button
            id="tb-btn-table"
            type="button"
            onClick={insertTable}
            aria-label="Table Wizard"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Table size={15} />
          </button>
        </Tooltip>

        <Tooltip content="Emoji & Icons" shortcut="Picker">
          <button
            id="tb-btn-emoji"
            type="button"
            onClick={onOpenEmojiPicker}
            aria-label="Insert Emoji and Icons"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Smile size={15} />
          </button>
        </Tooltip>

        {onOpenInlineCssModal && (
          <Tooltip content="Inline CSS & Callout Boxes" shortcut="HTML Badges & Styling">
            <button
              id="tb-btn-inline-css"
              type="button"
              onClick={onOpenInlineCssModal}
              aria-label="Insert Inline CSS and Callouts"
              className="p-1.5 rounded text-purple-600 dark:text-purple-400 hover:bg-purple-100/70 dark:hover:bg-purple-950/40 transition-colors"
            >
              <Palette size={15} />
            </button>
          </Tooltip>
        )}

        <Tooltip content="Horizontal Rule" shortcut="---">
          <button
            id="tb-btn-rule"
            type="button"
            onClick={() => onInsertMarkdown('\n---\n', '', '')}
            aria-label="Insert Divider"
            className="p-1.5 rounded text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
          >
            <Minus size={15} />
          </button>
        </Tooltip>
      </div>

      {/* Stats counter */}
      <div className="hidden sm:flex items-center gap-3 text-zinc-400 dark:text-zinc-500 font-mono text-[11px] shrink-0 pl-2">
        <span>{wordCount} words</span>
        <span>·</span>
        <span>{charCount} chars</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {readingTime} min read
        </span>
      </div>
    </div>
  );
};
