import React from 'react';
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Coffee,
  Type,
  Maximize2,
  Sliders,
  Keyboard,
  X,
} from 'lucide-react';
import { EditorSettings, FontFamily, FontSize, LayoutMode, PreviewWidth, ThemeMode } from '../types';
import { FileText, ChevronRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onOpenHeaderFooterModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenHeaderFooterModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="settings-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              <SettingsIcon size={18} />
            </div>
            <div>
              <h3 id="settings-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Preferences & Controls
              </h3>
              <p className="text-xs text-zinc-500">
                Customize appearance, typography, and editor behavior
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Theme selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Sun size={14} />
              <span>Color Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'light', label: 'Light', icon: Sun, bg: 'bg-white text-zinc-900 border-zinc-200' },
                { id: 'dark', label: 'Dark', icon: Moon, bg: 'bg-zinc-900 text-zinc-100 border-zinc-700' },
                { id: 'sepia', label: 'Warm Sepia', icon: Coffee, bg: 'bg-[#fbf7ee] text-[#433422] border-[#e8dfcf]' },
              ].map((t) => {
                const isSelected = settings.theme === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t.id as ThemeMode })}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-500 border-blue-500 font-semibold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    } ${t.bg}`}
                  >
                    <Icon size={14} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Type size={14} />
              <span>Typography & Font Family</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'sans', label: 'Sans-Serif', family: 'font-sans', desc: 'Plus Jakarta' },
                { id: 'serif', label: 'Serif', family: 'font-serif', desc: 'Source Serif' },
                { id: 'mono', label: 'Monospace', family: 'font-mono', desc: 'JetBrains' },
              ].map((f) => {
                const isSelected = settings.fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onUpdateSettings({ fontFamily: f.id as FontFamily })}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className={`text-xs font-medium ${f.family}`}>{f.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{f.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sm', label: 'Small', px: '14px' },
                { id: 'base', label: 'Medium', px: '16px' },
                { id: 'lg', label: 'Large', px: '18px' },
                { id: 'xl', label: 'X-Large', px: '20px' },
              ].map((s) => {
                const isSelected = settings.fontSize === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onUpdateSettings({ fontSize: s.id as FontSize })}
                    className={`py-2 px-3 text-center rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div>{s.label}</div>
                    <div className="text-[10px] opacity-75">{s.px}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reading Width */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5 flex items-center gap-1.5">
              <Maximize2 size={14} />
              <span>Preview Container Width</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'standard', label: 'Standard', desc: '65-75ch readability' },
                { id: 'wide', label: 'Wide', desc: '1000px max width' },
                { id: 'full', label: 'Full Width', desc: 'Expands 100%' },
              ].map((w) => {
                const isSelected = settings.previewWidth === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => onUpdateSettings({ previewWidth: w.id as PreviewWidth })}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 font-medium'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <div>{w.label}</div>
                    <div className="text-[10px] text-zinc-400">{w.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Synchronized Scrolling
                </div>
                <div className="text-[11px] text-zinc-400">
                  Scroll preview and editor simultaneously
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.syncScroll}
                onChange={(e) => onUpdateSettings({ syncScroll: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Show Line Numbers
                </div>
                <div className="text-[11px] text-zinc-400">
                  Display gutter line numbers in editor
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showLineNumbers}
                onChange={(e) => onUpdateSettings({ showLineNumbers: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Auto-Capitalize Sentences
                </div>
                <div className="text-[11px] text-zinc-400">
                  Automatically capitalize sentence-starting letters as you type
                </div>
              </div>
              <input
                id="setting-auto-capitalize"
                type="checkbox"
                checked={settings.autoCapitalizeSentences ?? true}
                onChange={(e) => onUpdateSettings({ autoCapitalizeSentences: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                  Automatic Local Backup
                </div>
                <div className="text-[11px] text-zinc-400">
                  Persist changes to local storage every edit
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => onUpdateSettings({ autoSave: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            {onOpenHeaderFooterModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHeaderFooterModal();
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
                    <FileText size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      Header, Footer & Custom CSS
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Configure document framing, dynamic tokens, and custom styling
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-zinc-400" />
              </button>
            )}
          </div>

          {/* Keyboard Shortcuts Reference */}
          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2.5">
              <Keyboard size={14} />
              <span>Productivity Shortcuts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Bold</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Ctrl+B</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Italic</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Ctrl+I</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Link</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Ctrl+K</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Quick Save</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Ctrl+S</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Indent</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Tab</kbd>
              </div>
              <div className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/40">
                <span className="text-zinc-500 font-sans">Unindent</span>
                <kbd className="text-[11px] bg-zinc-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">Shift+Tab</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
