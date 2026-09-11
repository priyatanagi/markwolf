import React, { useState } from 'react';
import {
  X,
  Download,
  FileDown,
  Image as ImageIcon,
  FileCode,
  FileText,
  Copy,
  Printer,
  Sliders,
  Check,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Database,
  Ruler,
} from 'lucide-react';
import { DocumentHeaderFooter, ThemeMode } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  headerFooter: DocumentHeaderFooter;
  currentTheme: ThemeMode;
  onExportPDF: (options: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => Promise<void>;
  onExportImage: (options: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => Promise<void>;
  onExportHTML: (options: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => void;
  onExportMarkdown: () => void;
  onExportPlainText: () => void;
  onCopyRichText: () => Promise<boolean>;
  onPrint: () => void;
  onExportJSON: () => void;
  onOpenHeaderFooterSettings?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  headerFooter,
  currentTheme,
  onExportPDF,
  onExportImage,
  onExportHTML,
  onExportMarkdown,
  onExportPlainText,
  onCopyRichText,
  onPrint,
  onExportJSON,
  onOpenHeaderFooterSettings,
}) => {
  const [showHeader, setShowHeader] = useState(headerFooter.showHeaderInExport ?? true);
  const [showFooter, setShowFooter] = useState(headerFooter.showFooterInExport ?? true);
  const [exportTheme, setExportTheme] = useState<ThemeMode>(currentTheme === 'dark' ? 'dark' : 'light');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedRich, setCopiedRich] = useState(false);
  const [printPageSize, setPrintPageSize] = useState<string>('a4');
  const [customPageW, setCustomPageW] = useState('210');
  const [customPageH, setCustomPageH] = useState('297');

  const PAGE_SIZES = [
    { id: 'a4', label: 'A4', desc: '210 × 297 mm' },
    { id: 'letter', label: 'US Letter', desc: '215.9 × 279.4 mm' },
    { id: 'legal', label: 'US Legal', desc: '215.9 × 355.6 mm' },
    { id: 'a3', label: 'A3', desc: '297 × 420 mm' },
    { id: '1080x1920', label: '1080 × 1920 px', desc: 'Portrait (283.5 × 503 mm)' },
    { id: 'custom', label: 'Custom', desc: 'Set your own dimensions' },
  ];

  const applyPrintPageSize = () => {
    const body = document.body;
    body.classList.remove('print-page-a4', 'print-page-letter', 'print-page-legal', 'print-page-a3', 'print-page-1080x1920', 'print-page-custom');
    if (printPageSize === 'custom') {
      body.style.setProperty('--custom-page-w', `${customPageW}mm`);
      body.style.setProperty('--custom-page-h', `${customPageH}mm`);
    }
    body.classList.add(`print-page-${printPageSize}`);
  };

  const removePrintPageSize = () => {
    const body = document.body;
    body.classList.remove('print-page-a4', 'print-page-letter', 'print-page-legal', 'print-page-a3', 'print-page-1080x1920', 'print-page-custom');
    body.style.removeProperty('--custom-page-w');
    body.style.removeProperty('--custom-page-h');
  };

  const handlePrintWithPageSize = () => {
    applyPrintPageSize();
    onPrint();
    setTimeout(removePrintPageSize, 500);
  };

  if (!isOpen) return null;

  const handleTriggerPDF = async () => {
    setIsExporting(true);
    await onExportPDF({ showHeader, showFooter, theme: exportTheme });
    setIsExporting(false);
    onClose();
  };

  const handleTriggerImage = async () => {
    setIsExporting(true);
    await onExportImage({ showHeader, showFooter, theme: exportTheme });
    setIsExporting(false);
    onClose();
  };

  const handleTriggerHTML = () => {
    onExportHTML({ showHeader, showFooter, theme: exportTheme });
    onClose();
  };

  const handleTriggerCopyRich = async () => {
    const ok = await onCopyRichText();
    if (ok) {
      setCopiedRich(true);
      setTimeout(() => setCopiedRich(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Download size={18} />
            </div>
            <div>
              <h3 id="export-modal-title" className="text-base font-semibold">
                Export & Publishing Center
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Download "{docTitle}" in multiple production-grade formats
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header & Footer Framing Controls for Export */}
          <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
                <Sliders size={14} className="text-blue-500" />
                <span>Export Header & Footer Visibility</span>
              </div>
              {onOpenHeaderFooterSettings && (
                <button
                  type="button"
                  onClick={onOpenHeaderFooterSettings}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Configure Headers & Footers →
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  {showHeader ? <Eye size={13} className="text-emerald-500" /> : <EyeOff size={13} className="text-zinc-400" />}
                  <span>Include Header</span>
                </span>
                <input
                  id="export-toggle-header"
                  type="checkbox"
                  checked={showHeader}
                  onChange={(e) => setShowHeader(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 cursor-pointer">
                <span className="text-xs font-medium flex items-center gap-1.5">
                  {showFooter ? <Eye size={13} className="text-emerald-500" /> : <EyeOff size={13} className="text-zinc-400" />}
                  <span>Include Footer</span>
                </span>
                <input
                  id="export-toggle-footer"
                  type="checkbox"
                  checked={showFooter}
                  onChange={(e) => setShowFooter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>

            {/* Export Theme Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-500">Output Palette / Theme:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setExportTheme('light')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
                    exportTheme === 'light'
                      ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Sun size={12} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExportTheme('dark')}
                  className={`px-2 py-1 rounded text-xs flex items-center gap-1 border transition-colors ${
                    exportTheme === 'dark'
                      ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Moon size={12} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* Export Formats Grid */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Select Output Format:
            </div>

            {/* Print Page Size Selector */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                <Ruler size={14} className="text-indigo-500" />
                <span>Print Page Size</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {PAGE_SIZES.map((ps) => (
                  <button
                    key={ps.id}
                    type="button"
                    onClick={() => setPrintPageSize(ps.id)}
                    className={`p-2 rounded-lg text-left border transition-colors ${
                      printPageSize === ps.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                        : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">{ps.label}</div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">{ps.desc}</div>
                  </button>
                ))}
              </div>
              {printPageSize === 'custom' && (
                <div className="flex items-center gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span className="text-[11px] text-zinc-500">Width:</span>
                  <input
                    type="number"
                    value={customPageW}
                    onChange={(e) => setCustomPageW(e.target.value)}
                    className="w-20 px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-[11px] text-zinc-400">mm ×</span>
                  <span className="text-[11px] text-zinc-500">Height:</span>
                  <input
                    type="number"
                    value={customPageH}
                    onChange={(e) => setCustomPageH(e.target.value)}
                    className="w-20 px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                  <span className="text-[11px] text-zinc-400">mm</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* PDF */}
              <button
                id="btn-modal-export-pdf"
                type="button"
                disabled={isExporting}
                onClick={handleTriggerPDF}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-rose-300 hover:bg-rose-50/40 dark:hover:border-rose-800 dark:hover:bg-rose-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileDown size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>PDF Document</span>
                    <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 px-1.5 py-0.2 rounded font-mono">.pdf</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Print-ready vector pages with optional headers/footers
                  </div>
                </div>
              </button>

              {/* PNG Image */}
              <button
                id="btn-modal-export-image"
                type="button"
                disabled={isExporting}
                onClick={handleTriggerImage}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>PNG High-Res Image</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-1.5 py-0.2 rounded font-mono">.png</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Crisp 2x retina screenshot of full document
                  </div>
                </div>
              </button>

              {/* HTML Webpage */}
              <button
                id="btn-modal-export-html"
                type="button"
                onClick={handleTriggerHTML}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-300 hover:bg-amber-50/40 dark:hover:border-amber-800 dark:hover:bg-amber-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileCode size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>HTML Standalone</span>
                    <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 px-1.5 py-0.2 rounded font-mono">.html</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Self-contained web page with embedded styles & fonts
                  </div>
                </div>
              </button>

              {/* Markdown Source */}
              <button
                id="btn-modal-export-md"
                type="button"
                onClick={() => {
                  onExportMarkdown();
                  onClose();
                }}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 hover:bg-blue-50/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0">
                  <FileCode size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>Raw Markdown</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.2 rounded font-mono">.md</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Universal plaintext source with tables & math
                  </div>
                </div>
              </button>

              {/* Plain Text */}
              <button
                id="btn-modal-export-txt"
                type="button"
                onClick={() => {
                  onExportPlainText();
                  onClose();
                }}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40 transition-all group"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 group-hover:scale-105 transition-transform shrink-0">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>Plain Text</span>
                    <span className="text-[10px] bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 px-1.5 py-0.2 rounded font-mono">.txt</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Clean plain text for notes and email drafts
                  </div>
                </div>
              </button>

              {/* Rich Text Clipboard */}
              <button
                id="btn-modal-copy-rich"
                type="button"
                onClick={handleTriggerCopyRich}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-purple-300 hover:bg-purple-50/40 dark:hover:border-purple-800 dark:hover:bg-purple-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 group-hover:scale-105 transition-transform shrink-0">
                  {copiedRich ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>{copiedRich ? 'Copied to Clipboard!' : 'Copy Formatted Rich Text'}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Paste directly into Google Docs, Word, or Gmail
                  </div>
                </div>
              </button>

              {/* Print Dialog */}
              <button
                id="btn-modal-print"
                type="button"
                onClick={() => {
                  handlePrintWithPageSize();
                  onClose();
                }}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:bg-zinc-50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40 transition-all group"
              >
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 group-hover:scale-105 transition-transform shrink-0">
                  <Printer size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    System Print
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Send directly to connected hardware printer
                  </div>
                </div>
              </button>

              {/* JSON Backup */}
              <button
                id="btn-modal-json-backup"
                type="button"
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
                className="flex items-start gap-3 p-3 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
                  <Database size={18} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <span>Document JSON Backup</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.2 rounded font-mono">.json</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Metadata, tags, and content archive
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
