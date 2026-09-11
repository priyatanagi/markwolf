import React, { useMemo, useEffect, useRef } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import { FontFamily, FontSize, PreviewWidth, DocumentHeaderFooter, DeviceScreenMode } from '../types';
import { copyTextToClipboard } from '../services/exportUtils';
import { Smartphone, Tablet, Monitor, Maximize2 } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
  fontFamily: FontFamily;
  fontSize: FontSize;
  previewWidth: PreviewWidth;
  onToggleTask?: (taskIndex: number) => void;
  previewRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  headerFooter?: DocumentHeaderFooter;
  docTitle?: string;
  deviceMode?: DeviceScreenMode;
  onDeviceModeChange?: (mode: DeviceScreenMode) => void;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  fontFamily,
  fontSize,
  previewWidth,
  onToggleTask,
  previewRef,
  onScroll,
  headerFooter,
  docTitle = 'Untitled',
  deviceMode = 'responsive',
  onDeviceModeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = previewRef || containerRef;

  // Configure marked custom renderer
  const htmlContent = useMemo(() => {
    // Custom renderer for code highlighting
    const renderer = new marked.Renderer();

    // Code highlighting renderer
    renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
      const language = lang && Prism.languages[lang] ? lang : 'markup';
      let highlighted = text;
      try {
        if (Prism.languages[language]) {
          highlighted = Prism.highlight(text, Prism.languages[language], language);
        }
      } catch {
        highlighted = text;
      }

      return `<div class="code-block-wrapper relative group my-4 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-zinc-100 font-mono text-[13px] leading-relaxed shadow-xs">
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-zinc-950/80 border-b border-zinc-800 text-[11px] text-zinc-400 select-none">
          <span class="uppercase tracking-wider font-semibold">${language}</span>
          <button type="button" class="btn-copy-code px-2 py-0.5 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors" data-code="${encodeURIComponent(text)}">
            Copy
          </button>
        </div>
        <pre class="p-4 overflow-x-auto m-0"><code class="language-${language}">${highlighted}</code></pre>
      </div>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    const parsed = marked.parse(content || '*No content to preview*') as string;
    return DOMPurify.sanitize(parsed, {
      ADD_TAGS: ['iframe', 'button', 'span'],
      ADD_ATTR: ['target', 'data-code', 'type', 'checked', 'class'],
    });
  }, [content]);

  // Attach click listeners for copy buttons and task list checkboxes
  useEffect(() => {
    const el = activeRef.current;
    if (!el) return;

    const handleContainerClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Copy code button
      const copyBtn = target.closest('.btn-copy-code') as HTMLButtonElement;
      if (copyBtn) {
        const rawCode = copyBtn.getAttribute('data-code');
        if (rawCode) {
          const text = decodeURIComponent(rawCode);
          const ok = await copyTextToClipboard(text);
          if (ok) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('text-emerald-400');
            setTimeout(() => {
              copyBtn.textContent = originalText;
              copyBtn.classList.remove('text-emerald-400');
            }, 2000);
          }
        }
        return;
      }

      // Checkbox click
      if (target instanceof HTMLInputElement && target.type === 'checkbox') {
        const checkboxes = Array.from(el.querySelectorAll('input[type="checkbox"]'));
        const index = checkboxes.indexOf(target);
        if (index !== -1 && onToggleTask) {
          onToggleTask(index);
        }
      }
    };

    el.addEventListener('click', handleContainerClick);
    return () => el.removeEventListener('click', handleContainerClick);
  }, [htmlContent, onToggleTask, activeRef]);

  // Typography font class
  const fontClass = useMemo(() => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      case 'sans':
      default:
        return 'font-sans';
    }
  }, [fontFamily]);

  // Typography size class
  const sizeClass = useMemo(() => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm leading-relaxed';
      case 'lg':
        return 'text-lg leading-relaxed';
      case 'xl':
        return 'text-xl leading-relaxed';
      case 'base':
      default:
        return 'text-base leading-relaxed';
    }
  }, [fontSize]);

  // Width class
  const widthClass = useMemo(() => {
    switch (previewWidth) {
      case 'wide':
        return 'max-w-4xl';
      case 'full':
        return 'max-w-none';
      case 'standard':
      default:
        return 'max-w-prose';
    }
  }, [previewWidth]);

  const replaceTokens = (text?: string) => {
    if (!text) return '';
    const now = new Date();
    return text
      .replace(/{{title}}/g, docTitle)
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      .replace(/{{page}}/g, 'Page 1')
      .replace(/{{pages}}/g, 'Page 1 of 1');
  };

  // Device mode frame wrapper classes
  const deviceContainerClass = useMemo(() => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-[390px] mx-auto my-6 border border-zinc-300 dark:border-zinc-700 rounded-3xl p-6 shadow-2xl bg-white dark:bg-zinc-950 transition-all';
      case 'tablet':
        return 'max-w-[768px] mx-auto my-6 border border-zinc-300 dark:border-zinc-700 rounded-2xl p-8 shadow-2xl bg-white dark:bg-zinc-950 transition-all';
      case 'desktop':
        return 'max-w-[1024px] mx-auto my-4 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 shadow-lg bg-white dark:bg-zinc-950 transition-all';
      case 'responsive':
      default:
        return 'w-full';
    }
  }, [deviceMode]);

  return (
    <div
      id="markdown-preview-container"
      ref={activeRef}
      onScroll={onScroll}
      className={`h-full overflow-y-auto px-4 py-6 md:px-8 md:py-8 bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-100 dark:selection:bg-blue-900/40 ${fontClass} ${sizeClass}`}
    >
      {/* Optional Injected Custom CSS */}
      {headerFooter?.customCss && <style>{headerFooter.customCss}</style>}

      <div className={`${deviceContainerClass} transition-all duration-200`}>
        <div className={`mx-auto ${widthClass} transition-all duration-150`}>
          {/* Header Bar */}
          {headerFooter?.enabled && (headerFooter.headerLeft || headerFooter.headerCenter || headerFooter.headerRight) && (
            <div
              id="preview-header-bar"
              className="flex items-center justify-between pb-3 mb-6 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-400 dark:text-zinc-500 select-none"
            >
              <span>{replaceTokens(headerFooter.headerLeft)}</span>
              <span>{replaceTokens(headerFooter.headerCenter)}</span>
              <span>{replaceTokens(headerFooter.headerRight)}</span>
            </div>
          )}

          {/* Rendered Document Body */}
          <div
            id="markdown-render-output"
            className="markdown-body transition-all duration-150 min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Footer Bar */}
          {headerFooter?.footerEnabled && (headerFooter.footerLeft || headerFooter.footerCenter || headerFooter.footerRight) && (
            <div
              id="preview-footer-bar"
              className="flex items-center justify-between pt-4 mt-8 border-t border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-400 dark:text-zinc-500 select-none"
            >
              <span>{replaceTokens(headerFooter.footerLeft)}</span>
              <span>{replaceTokens(headerFooter.footerCenter)}</span>
              <span>{replaceTokens(headerFooter.footerRight)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
