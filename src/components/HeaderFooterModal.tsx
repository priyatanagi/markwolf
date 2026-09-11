import React, { useState } from 'react';
import {
  X,
  LayoutTemplate,
  Check,
  Eye,
  EyeOff,
  Code,
  Sparkles,
  Info,
  Layers,
  FileText,
} from 'lucide-react';
import { DocumentHeaderFooter } from '../types';

interface HeaderFooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  headerFooter: DocumentHeaderFooter;
  onUpdateHeaderFooter: (newHF: DocumentHeaderFooter) => void;
  docTitle?: string;
}

export const HeaderFooterModal: React.FC<HeaderFooterModalProps> = ({
  isOpen,
  onClose,
  headerFooter,
  onUpdateHeaderFooter,
  docTitle = 'Document',
}) => {
  const [activeTab, setActiveTab] = useState<'header' | 'footer' | 'css'>('header');
  const [localHF, setLocalHF] = useState<DocumentHeaderFooter>(headerFooter);

  // Sync state if modal opens
  React.useEffect(() => {
    setLocalHF(headerFooter);
  }, [headerFooter, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateHeaderFooter(localHF);
    onClose();
  };

  const handleInsertToken = (target: 'header' | 'footer', pos: 'Left' | 'Center' | 'Right', token: string) => {
    const key = `${target}${pos}` as keyof DocumentHeaderFooter;
    const currentVal = (localHF[key] as string) || '';
    setLocalHF({
      ...localHF,
      [key]: currentVal ? `${currentVal} ${token}` : token,
    });
  };

  const replaceTokens = (text: string) => {
    const now = new Date();
    return text
      .replace(/{{title}}/g, docTitle)
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      .replace(/{{page}}/g, 'Page 1')
      .replace(/{{pages}}/g, 'Page 1 of 1');
  };

  const cssPresets = [
    {
      label: 'Formal Report Border',
      css: '/* Clean subtle document border */\n.prose-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 2.5rem; }',
    },
    {
      label: 'Page Break Utility',
      css: '/* Print page break rule */\n@media print { .page-break { page-break-after: always; break-after: page; } }',
    },
    {
      label: 'Accent Heading Underlines',
      css: '/* Underline major section headings */\nh1, h2 { border-bottom: 2px solid #3b82f6; padding-bottom: 0.35rem; }',
    },
    {
      label: 'Custom Codeblock Style',
      css: '/* Rounded modern code blocks */\npre { border-radius: 10px !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="header-footer-modal"
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <LayoutTemplate size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold">Advanced Header, Footer & Custom CSS</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure document framing, metadata tags, and export hide/unhide visibility
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

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-xs font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('header')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'header'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Layers size={14} />
            <span>Document Header</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'footer'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <FileText size={14} />
            <span>Document Footer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'css'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Code size={14} />
            <span>Custom CSS Injection</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header Tab */}
          {activeTab === 'header' && (
            <div className="space-y-4">
              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold">Enable Header in Preview</div>
                    <div className="text-[11px] text-zinc-400">Show above document text</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localHF.enabled}
                    onChange={(e) => setLocalHF({ ...localHF, enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-700 sm:pl-3 pt-2 sm:pt-0">
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      {localHF.showHeaderInExport ? <Eye size={13} className="text-blue-600" /> : <EyeOff size={13} className="text-zinc-400" />}
                      <span>Show in Export (PDF/HTML)</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Include or hide during export</div>
                  </div>
                  <input
                    id="toggle-header-export"
                    type="checkbox"
                    checked={localHF.showHeaderInExport}
                    onChange={(e) => setLocalHF({ ...localHF, showHeaderInExport: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Dynamic Tokens Bar */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Insert Metadata Variables:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { token: '{{title}}', label: 'Document Title' },
                    { token: '{{date}}', label: 'Current Date' },
                    { token: '{{time}}', label: 'Current Time' },
                    { token: '{{page}}', label: 'Page 1' },
                    { token: '{{pages}}', label: 'Page 1 of 1' },
                  ].map((t) => (
                    <button
                      key={t.token}
                      type="button"
                      onClick={() => handleInsertToken('header', 'Left', t.token)}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title={`Click to insert ${t.token} into left section`}
                    >
                      +{t.token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Header Slots */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Left Header Content
                  </label>
                  <input
                    type="text"
                    value={localHF.headerLeft}
                    onChange={(e) => setLocalHF({ ...localHF, headerLeft: e.target.value })}
                    placeholder="e.g. {{title}}"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Center Header Content
                  </label>
                  <input
                    type="text"
                    value={localHF.headerCenter}
                    onChange={(e) => setLocalHF({ ...localHF, headerCenter: e.target.value })}
                    placeholder="e.g. Confidential Draft"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Right Header Content
                  </label>
                  <input
                    type="text"
                    value={localHF.headerRight}
                    onChange={(e) => setLocalHF({ ...localHF, headerRight: e.target.value })}
                    placeholder="e.g. {{date}}"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/70">
                <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Live Header Simulation
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span>{replaceTokens(localHF.headerLeft) || <em className="text-zinc-400">(Empty Left)</em>}</span>
                  <span>{replaceTokens(localHF.headerCenter) || <em className="text-zinc-400">(Empty Center)</em>}</span>
                  <span>{replaceTokens(localHF.headerRight) || <em className="text-zinc-400">(Empty Right)</em>}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Tab */}
          {activeTab === 'footer' && (
            <div className="space-y-4">
              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold">Enable Footer in Preview</div>
                    <div className="text-[11px] text-zinc-400">Show below document text</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localHF.footerEnabled}
                    onChange={(e) => setLocalHF({ ...localHF, footerEnabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-700 sm:pl-3 pt-2 sm:pt-0">
                  <div>
                    <div className="text-xs font-semibold flex items-center gap-1">
                      {localHF.showFooterInExport ? <Eye size={13} className="text-blue-600" /> : <EyeOff size={13} className="text-zinc-400" />}
                      <span>Show in Export (PDF/HTML)</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Include or hide during export</div>
                  </div>
                  <input
                    id="toggle-footer-export"
                    type="checkbox"
                    checked={localHF.showFooterInExport}
                    onChange={(e) => setLocalHF({ ...localHF, showFooterInExport: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>
              </div>

              {/* Dynamic Tokens Bar */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-medium text-zinc-500 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Insert Metadata Variables:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { token: '{{title}}', label: 'Document Title' },
                    { token: '{{date}}', label: 'Current Date' },
                    { token: '{{time}}', label: 'Current Time' },
                    { token: '{{page}}', label: 'Page 1' },
                    { token: '{{pages}}', label: 'Page 1 of 1' },
                  ].map((t) => (
                    <button
                      key={t.token}
                      type="button"
                      onClick={() => handleInsertToken('footer', 'Center', t.token)}
                      className="px-2 py-1 text-[11px] font-mono rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                      title={`Click to insert ${t.token} into center section`}
                    >
                      +{t.token}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Slots */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Left Footer Content
                  </label>
                  <input
                    type="text"
                    value={localHF.footerLeft}
                    onChange={(e) => setLocalHF({ ...localHF, footerLeft: e.target.value })}
                    placeholder="e.g. Created with Markdown Studio"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Center Footer Content
                  </label>
                  <input
                    type="text"
                    value={localHF.footerCenter}
                    onChange={(e) => setLocalHF({ ...localHF, footerCenter: e.target.value })}
                    placeholder="e.g. {{pages}}"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Right Footer Content
                  </label>
                  <input
                    type="text"
                    value={localHF.footerRight}
                    onChange={(e) => setLocalHF({ ...localHF, footerRight: e.target.value })}
                    placeholder="e.g. {{time}}"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/70 dark:bg-zinc-900/70">
                <div className="text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Live Footer Simulation
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span>{replaceTokens(localHF.footerLeft) || <em className="text-zinc-400">(Empty Left)</em>}</span>
                  <span>{replaceTokens(localHF.footerCenter) || <em className="text-zinc-400">(Empty Center)</em>}</span>
                  <span>{replaceTokens(localHF.footerRight) || <em className="text-zinc-400">(Empty Right)</em>}</span>
                </div>
              </div>
            </div>
          )}

          {/* CSS Tab */}
          {activeTab === 'css' && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-900 dark:text-purple-300">
                <Info size={16} className="shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                <div>
                  Custom CSS will be applied to the document preview and included in PDF, PNG, and HTML exports.
                </div>
              </div>

              {/* Presets */}
              <div>
                <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Quick CSS Presets:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {cssPresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        const current = localHF.customCss || '';
                        setLocalHF({
                          ...localHF,
                          customCss: current ? `${current}\n\n${p.css}` : p.css,
                        });
                      }}
                      className="text-left p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 text-xs transition-colors"
                    >
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{p.label}</div>
                      <div className="text-[11px] text-zinc-400 truncate font-mono mt-0.5">{p.css.split('\n')[0]}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Custom CSS Editor
                </label>
                <textarea
                  value={localHF.customCss || ''}
                  onChange={(e) => setLocalHF({ ...localHF, customCss: e.target.value })}
                  placeholder="/* Write any CSS rules here */&#10;blockquote { border-left-color: #3b82f6; }&#10;table { margin: 1.5rem auto; }"
                  rows={8}
                  className="w-full p-3 font-mono text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-900 text-zinc-100 dark:bg-zinc-950 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <button
            type="button"
            onClick={() => {
              setLocalHF({
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
              });
            }}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
