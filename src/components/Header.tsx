import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Coffee,
  Columns,
  Square,
  FileCode,
  Download,
  FileDown,
  Image as ImageIcon,
  Printer,
  History,
  Lock,
  Unlock,
  Settings as SettingsIcon,
  Cloud,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
  Copy,
  Tag,
} from 'lucide-react';
import { Doc, EditorSettings, GoogleUser, LayoutMode, ThemeMode } from '../types';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  currentDoc: Doc;
  onUpdateTitle: (title: string) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
  user: GoogleUser | null;
  onOpenDriveModal: () => void;
  onOpenHistoryModal: () => void;
  onOpenEncryptionModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenHeaderFooterModal?: () => void;
  onOpenExportModal?: () => void;
  onExportPDF: () => void;
  onExportImage: () => void;
  onExportMarkdown: () => void;
  onExportHTML: () => void;
  onPrint: () => void;
  onCopyContent: () => void;
  isSaving: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentDoc,
  onUpdateTitle,
  onAddTag,
  onRemoveTag,
  settings,
  onUpdateSettings,
  onToggleSidebar,
  isSidebarOpen,
  user,
  onOpenDriveModal,
  onOpenHistoryModal,
  onOpenEncryptionModal,
  onOpenSettingsModal,
  onOpenHeaderFooterModal,
  onOpenExportModal,
  onExportPDF,
  onExportImage,
  onExportMarkdown,
  onExportHTML,
  onPrint,
  onCopyContent,
  isSaving,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(currentDoc.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const tagMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleValue(currentDoc.title);
  }, [currentDoc.title]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
      if (tagMenuRef.current && !tagMenuRef.current.contains(e.target as Node)) {
        setShowTagMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(currentDoc.title);
    }
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim()) {
      onAddTag(newTagInput.trim());
      setNewTagInput('');
    }
  };

  const toggleTheme = () => {
    const themeOrder: ThemeMode[] = ['light', 'dark', 'sepia'];
    const currentIndex = themeOrder.indexOf(settings.theme);
    const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header
      id="app-header"
      className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-3 sm:px-4 flex items-center justify-between backdrop-blur-md select-none shrink-0 z-20"
    >
      {/* Left side: Sidebar Toggle & Document Title & Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Tooltip content="Toggle documents sidebar">
          <button
            id="btn-toggle-sidebar"
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu size={18} />
          </button>
        </Tooltip>

        {/* Title & Status */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <input
              id="input-doc-title"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded outline-none border border-blue-500 max-w-[180px] sm:max-w-xs"
            />
          ) : (
            <Tooltip content="Click to rename document">
              <h1
                id="text-doc-title"
                onClick={() => setIsEditingTitle(true)}
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800/80 px-2 py-0.5 rounded transition-colors max-w-[140px] sm:max-w-[240px]"
              >
                {currentDoc.title || 'Untitled Document'}
              </h1>
            </Tooltip>
          )}

          {/* Status badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
            <span>·</span>
            {isSaving ? (
              <span>Saving...</span>
            ) : currentDoc.driveFileId ? (
              <span className="flex items-center gap-1 text-blue-500">
                <Cloud size={12} />
                <span>Drive Synced</span>
              </span>
            ) : (
              <span>Saved offline</span>
            )}
            {currentDoc.isEncrypted && (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                · <Lock size={11} /> AES-256
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Layout Toggles, Export, Drive, Settings, Theme */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Layout Modes (Split, Editor, Preview) */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-lg p-0.5 border border-zinc-200 dark:border-zinc-700/60">
          <Tooltip content="Split view" shortcut="Editor + Preview">
            <button
              id="btn-layout-split"
              type="button"
              onClick={() => onUpdateSettings({ layout: 'split', zenMode: false })}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                settings.layout === 'split' && !settings.zenMode
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Columns size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Editor only">
            <button
              id="btn-layout-editor"
              type="button"
              onClick={() => onUpdateSettings({ layout: 'editor', zenMode: false })}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                settings.layout === 'editor' && !settings.zenMode
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <FileCode size={14} />
            </button>
          </Tooltip>

          <Tooltip content="Preview only">
            <button
              id="btn-layout-preview"
              type="button"
              onClick={() => onUpdateSettings({ layout: 'preview', zenMode: false })}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                settings.layout === 'preview' && !settings.zenMode
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Square size={14} />
            </button>
          </Tooltip>
        </div>

        {/* Zen Mode */}
        <Tooltip content={settings.zenMode ? 'Exit Zen mode' : 'Zen focus mode'}>
          <button
            id="btn-zen-mode"
            type="button"
            onClick={() => onUpdateSettings({ zenMode: !settings.zenMode })}
            className={`p-1.5 rounded-lg transition-colors ${
              settings.zenMode
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {settings.zenMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </Tooltip>

        {/* Google Drive status / Sign in */}
        <Tooltip content={user ? 'Google Drive Synced' : 'Connect Google Drive'}>
          <button
            id="btn-header-drive"
            type="button"
            onClick={onOpenDriveModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              user
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Cloud size={14} className={user ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400'} />
            <span className="hidden sm:inline">{user ? 'Drive Connected' : 'Google Drive'}</span>
          </button>
        </Tooltip>

        {/* Encryption Lock/Unlock */}
        <Tooltip content={currentDoc.isEncrypted ? 'Document encrypted' : 'Encrypt with AES-256'}>
          <button
            id="btn-header-encryption"
            type="button"
            onClick={onOpenEncryptionModal}
            className={`p-1.5 rounded-lg transition-colors ${
              currentDoc.isEncrypted
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {currentDoc.isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
          </button>
        </Tooltip>

        {/* Document History */}
        <Tooltip content="Version history">
          <button
            id="btn-header-history"
            type="button"
            onClick={onOpenHistoryModal}
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <History size={16} />
          </button>
        </Tooltip>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <Tooltip content="Export options">
            <button
              id="btn-header-export-dropdown"
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={12} />
            </button>
          </Tooltip>

          {showExportMenu && (
            <div
              id="export-dropdown-menu"
              className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-50 text-xs animate-fade-in"
            >
              {onOpenExportModal && (
                <>
                  <button
                    id="btn-open-export-modal"
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      onOpenExportModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors text-left font-medium"
                  >
                    <Download size={14} />
                    <span>Advanced Export Center...</span>
                  </button>
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                </>
              )}

              <button
                id="btn-export-pdf"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportPDF();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <FileDown size={14} className="text-rose-500" />
                <span>Download as PDF</span>
              </button>

              <button
                id="btn-export-image"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportImage();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <ImageIcon size={14} className="text-emerald-500" />
                <span>Download as PNG Image</span>
              </button>

              <button
                id="btn-export-md"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportMarkdown();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <FileCode size={14} className="text-blue-500" />
                <span>Download Markdown (.md)</span>
              </button>

              <button
                id="btn-export-html"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onExportHTML();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <FileCode size={14} className="text-amber-500" />
                <span>Download HTML (.html)</span>
              </button>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

              <button
                id="btn-print-doc"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onPrint();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Printer size={14} className="text-zinc-500" />
                <span>Print Document</span>
              </button>

              <button
                id="btn-copy-markdown"
                type="button"
                onClick={() => {
                  setShowExportMenu(false);
                  onCopyContent();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <Copy size={14} className="text-zinc-500" />
                <span>Copy Markdown</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme toggle: cycles light → dark → sepia → light */}
        <Tooltip content={settings.theme === 'dark' ? 'Switch to Sepia' : settings.theme === 'sepia' ? 'Switch to Light' : 'Switch to Dark'}>
          <button
            id="btn-toggle-theme"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {settings.theme === 'dark' ? <Coffee size={16} /> : settings.theme === 'sepia' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </Tooltip>

        {/* Settings button */}
        <Tooltip content="Preferences & typography">
          <button
            id="btn-open-settings"
            type="button"
            onClick={onOpenSettingsModal}
            aria-label="Settings"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <SettingsIcon size={16} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
