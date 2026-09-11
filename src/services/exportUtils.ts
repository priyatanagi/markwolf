import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  showHeader?: boolean;
  showFooter?: boolean;
  headerLeft?: string;
  headerCenter?: string;
  headerRight?: string;
  footerLeft?: string;
  footerCenter?: string;
  footerRight?: string;
  customCss?: string;
}

/**
 * Download a generated text or binary file to user machine.
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(title: string, content: string) {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = cleanTitle.endsWith('.md') ? cleanTitle : `${cleanTitle}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function exportToPlainText(title: string, content: string) {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = cleanTitle.endsWith('.txt') ? cleanTitle : `${cleanTitle}.txt`;
  // Strip markdown formatting symbols for a clean text representation
  const plain = content
    .replace(/^#+\s+/gm, '') // Remove heading hashes
    .replace(/[*_~`]/g, '') // Remove formatting chars
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Extract link text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '[Image: $1]'); // Format images

  const blob = new Blob([plain], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function exportToJSON(title: string, data: any) {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = `${cleanTitle}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function exportToHTML(
  title: string,
  renderedHtml: string,
  isDark: boolean,
  options?: ExportOptions
) {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = `${cleanTitle}.html`;

  const bg = isDark ? '#121316' : '#ffffff';
  const text = isDark ? '#e4e4e7' : '#18181b';
  const border = isDark ? '#27272a' : '#e4e4e7';
  const codeBg = isDark ? '#1e1e24' : '#f4f4f5';

  const replaceTokens = (str?: string) => {
    if (!str) return '';
    const now = new Date();
    return str
      .replace(/{{title}}/g, cleanTitle)
      .replace(/{{date}}/g, now.toLocaleDateString())
      .replace(/{{time}}/g, now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      .replace(/{{page}}/g, 'Page 1')
      .replace(/{{pages}}/g, 'Page 1 of 1');
  };

  const headerHtml =
    options?.showHeader && (options.headerLeft || options.headerCenter || options.headerRight)
      ? `<header class="doc-export-header">
          <div class="h-left">${replaceTokens(options.headerLeft)}</div>
          <div class="h-center">${replaceTokens(options.headerCenter)}</div>
          <div class="h-right">${replaceTokens(options.headerRight)}</div>
        </header>`
      : '';

  const footerHtml =
    options?.showFooter && (options.footerLeft || options.footerCenter || options.footerRight)
      ? `<footer class="doc-export-footer">
          <div class="f-left">${replaceTokens(options.footerLeft)}</div>
          <div class="f-center">${replaceTokens(options.footerCenter)}</div>
          <div class="f-right">${replaceTokens(options.footerRight)}</div>
        </footer>`
      : '';

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanTitle)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      line-height: 1.65;
      background-color: ${bg};
      color: ${text};
      padding: 3rem 1.5rem;
      margin: 0;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 840px;
      width: 100%;
    }
    .doc-export-header, .doc-export-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: ${isDark ? '#71717a' : '#a1a1aa'};
      font-family: monospace;
      padding: 0.75rem 0;
    }
    .doc-export-header {
      border-bottom: 1px solid ${border};
      margin-bottom: 2rem;
    }
    .doc-export-footer {
      border-top: 1px solid ${border};
      margin-top: 3rem;
    }
    h1, h2, h3, h4, h5, h6 {
      color: inherit;
      font-weight: 700;
      line-height: 1.3;
      margin-top: 1.8em;
      margin-bottom: 0.6em;
    }
    h1 { font-size: 2.25rem; border-bottom: 1px solid ${border}; padding-bottom: 0.4em; }
    h2 { font-size: 1.75rem; border-bottom: 1px solid ${border}; padding-bottom: 0.3em; }
    h3 { font-size: 1.4rem; }
    p { margin-bottom: 1.25em; }
    code {
      font-family: 'JetBrains Mono', monospace;
      background: ${codeBg};
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-size: 0.9em;
    }
    pre {
      background: ${codeBg};
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid ${border};
    }
    pre code {
      background: transparent;
      padding: 0;
    }
    blockquote {
      border-left: 3px solid #3b82f6;
      margin: 1.5em 0;
      padding-left: 1rem;
      color: ${isDark ? '#a1a1aa' : '#52525b'};
      font-style: italic;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
    }
    th, td {
      border: 1px solid ${border};
      padding: 0.6rem 0.8rem;
      text-align: left;
    }
    th {
      background: ${codeBg};
      font-weight: 600;
    }
    hr {
      border: 0;
      border-top: 1px solid ${border};
      margin: 2rem 0;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
    }
    ul, ol {
      padding-left: 1.5rem;
      margin-bottom: 1.25em;
    }
    li { margin-bottom: 0.35em; }

    /* Custom CSS Injected */
    ${options?.customCss || ''}
  </style>
</head>
<body>
  <div class="container">
    ${headerHtml}
    ${renderedHtml}
    ${footerHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, filename);
}

export async function exportToImage(
  element: HTMLElement,
  title: string,
  isDark: boolean,
  options?: ExportOptions
): Promise<void> {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = `${cleanTitle}.png`;

  const originalScrollTop = element.scrollTop;
  element.scrollTop = 0;

  // Toggle export header/footer visibility if configured
  const headerElem = element.querySelector('#preview-header-bar') as HTMLElement | null;
  const footerElem = element.querySelector('#preview-footer-bar') as HTMLElement | null;

  const originalHeaderDisplay = headerElem ? headerElem.style.display : '';
  const originalFooterDisplay = footerElem ? footerElem.style.display : '';

  if (headerElem && options?.showHeader === false) {
    headerElem.style.display = 'none';
  }
  if (footerElem && options?.showFooter === false) {
    footerElem.style.display = 'none';
  }

  const bgColor = isDark ? '#09090b' : '#ffffff';
  const targetWidth = Math.max(element.clientWidth || 800, 800);

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Retina sharpness
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
      onclone: (clonedDoc, clonedElement) => {
        const previewEl = (clonedElement || clonedDoc.getElementById('markdown-preview-container')) as HTMLElement | null;
        if (!previewEl) return;

        // 1. Synchronize dark / light theme on cloned document
        if (isDark) {
          clonedDoc.documentElement.classList.add('dark');
          clonedDoc.documentElement.classList.remove('theme-sepia');
          clonedDoc.documentElement.style.backgroundColor = '#09090b';
          clonedDoc.documentElement.style.color = '#f4f4f5';
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#09090b';
            clonedDoc.body.style.color = '#f4f4f5';
          }
          previewEl.classList.add('dark');
          previewEl.style.backgroundColor = '#09090b';
          previewEl.style.color = '#f4f4f5';
        } else {
          clonedDoc.documentElement.classList.remove('dark', 'theme-sepia');
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.documentElement.style.color = '#18181b';
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.color = '#18181b';
          }
          previewEl.classList.remove('dark');
          previewEl.style.backgroundColor = '#ffffff';
          previewEl.style.color = '#18181b';
        }

        // 2. Clear margins and overflow restrictions on body and root
        if (clonedDoc.body) {
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.height = 'auto';
          clonedDoc.body.style.minHeight = 'auto';
          clonedDoc.body.style.overflow = 'visible';
        }
        if (clonedDoc.documentElement) {
          clonedDoc.documentElement.style.height = 'auto';
          clonedDoc.documentElement.style.overflow = 'visible';
        }

        // 3. Move previewEl to body to completely isolate it from shell layout (sidebar/header/toolbar)
        previewEl.remove();
        if (clonedDoc.body) {
          clonedDoc.body.innerHTML = '';
          clonedDoc.body.appendChild(previewEl);
        }

        // 4. Configure previewEl for full-length printing
        previewEl.style.width = `${targetWidth}px`;
        previewEl.style.height = 'auto';
        previewEl.style.minHeight = 'auto';
        previewEl.style.maxHeight = 'none';
        previewEl.style.overflow = 'visible';
        previewEl.style.overflowY = 'visible';
        previewEl.style.overflowX = 'visible';
        previewEl.style.position = 'static';
        previewEl.style.margin = '0 auto';
        previewEl.style.boxSizing = 'border-box';

        // 5. If device simulation mode was active, remove phone frame constraints for export
        const deviceWrapper = previewEl.querySelector('#markdown-render-output')?.parentElement?.parentElement as HTMLElement | null;
        if (deviceWrapper && deviceWrapper !== previewEl) {
          deviceWrapper.style.maxWidth = 'none';
          deviceWrapper.style.border = 'none';
          deviceWrapper.style.boxShadow = 'none';
          deviceWrapper.style.margin = '0 auto';
          deviceWrapper.style.padding = '0';
        }
      },
    });

    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(blob, filename);
      }
    }, 'image/png');
  } finally {
    element.scrollTop = originalScrollTop;
    if (headerElem) headerElem.style.display = originalHeaderDisplay;
    if (footerElem) footerElem.style.display = originalFooterDisplay;
  }
}

/**
 * Scans upward from idealEndY to find a safe boundary that avoids cutting through text lines or headings.
 */
function findSafeBreakPoint(
  canvas: HTMLCanvasElement,
  currentY: number,
  idealEndY: number,
  elements: { top: number; bottom: number }[],
  isDark: boolean
): number {
  // Allow at least 40% of the page to be populated before pushing to next page
  const minAllowedBreak = currentY + (idealEndY - currentY) * 0.4;

  let bestBreak = idealEndY;
  let elementWasCut = false;

  for (const el of elements) {
    // Check if element crosses the ideal page boundary
    if (el.top < idealEndY && el.bottom > idealEndY) {
      elementWasCut = true;
      if (el.top < bestBreak) {
        bestBreak = el.top;
      }
    }
  }

  // If breaking before the crossing element preserves enough content on the current page, use it
  if (elementWasCut && bestBreak >= minAllowedBreak) {
    // 6px cushion above element for clean separation
    return Math.max(currentY + 1, Math.floor(bestBreak - 6));
  }

  // Fallback: Scan canvas upwards for a blank background row between lines of text
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      const searchStart = Math.max(currentY + 50, idealEndY - 150);
      const searchEnd = idealEndY;
      const scanHeight = searchEnd - searchStart;

      if (scanHeight > 0) {
        const imgData = ctx.getImageData(0, searchStart, canvas.width, scanHeight);
        const data = imgData.data;
        const width = canvas.width;

        const bgR = isDark ? 9 : 255;
        const bgG = isDark ? 9 : 255;
        const bgB = isDark ? 11 : 255;
        const tolerance = 25;

        for (let row = scanHeight - 1; row >= 0; row--) {
          let isBlankRow = true;
          for (let col = 0; col < width; col += 6) {
            const idx = (row * width + col) * 4;
            const diff =
              Math.abs(data[idx] - bgR) +
              Math.abs(data[idx + 1] - bgG) +
              Math.abs(data[idx + 2] - bgB);
            if (diff > tolerance * 3) {
              isBlankRow = false;
              break;
            }
          }

          if (isBlankRow) {
            return searchStart + row;
          }
        }
      }
    }
  } catch {
    // Ignore canvas read errors if tainted
  }

  return idealEndY;
}

export async function exportToPDF(
  element: HTMLElement,
  title: string,
  isDark: boolean,
  options?: ExportOptions
): Promise<void> {
  const cleanTitle = title.trim() || 'Untitled';
  const filename = `${cleanTitle}.pdf`;

  const originalScrollTop = element.scrollTop;
  element.scrollTop = 0;

  // Toggle export header/footer visibility if configured
  const headerElem = element.querySelector('#preview-header-bar') as HTMLElement | null;
  const footerElem = element.querySelector('#preview-footer-bar') as HTMLElement | null;

  const originalHeaderDisplay = headerElem ? headerElem.style.display : '';
  const originalFooterDisplay = footerElem ? footerElem.style.display : '';

  if (headerElem && options?.showHeader === false) {
    headerElem.style.display = 'none';
  }
  if (footerElem && options?.showFooter === false) {
    footerElem.style.display = 'none';
  }

  const bgColor = isDark ? '#09090b' : '#ffffff';
  const targetWidth = Math.max(element.clientWidth || 800, 800);
  let elementPositions: { top: number; bottom: number }[] = [];
  let renderedElementHeight = 0;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: bgColor,
      logging: false,
      onclone: (clonedDoc, clonedElement) => {
        const previewEl = (clonedElement || clonedDoc.getElementById('markdown-preview-container')) as HTMLElement | null;
        if (!previewEl) return;

        // 1. Synchronize dark / light theme on cloned document
        if (isDark) {
          clonedDoc.documentElement.classList.add('dark');
          clonedDoc.documentElement.classList.remove('theme-sepia');
          clonedDoc.documentElement.style.backgroundColor = '#09090b';
          clonedDoc.documentElement.style.color = '#f4f4f5';
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#09090b';
            clonedDoc.body.style.color = '#f4f4f5';
          }
          previewEl.classList.add('dark');
          previewEl.style.backgroundColor = '#09090b';
          previewEl.style.color = '#f4f4f5';
        } else {
          clonedDoc.documentElement.classList.remove('dark', 'theme-sepia');
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.documentElement.style.color = '#18181b';
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.color = '#18181b';
          }
          previewEl.classList.remove('dark');
          previewEl.style.backgroundColor = '#ffffff';
          previewEl.style.color = '#18181b';
        }

        // 2. Clear margins and overflow restrictions on body and root
        if (clonedDoc.body) {
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
          clonedDoc.body.style.height = 'auto';
          clonedDoc.body.style.minHeight = 'auto';
          clonedDoc.body.style.overflow = 'visible';
        }
        if (clonedDoc.documentElement) {
          clonedDoc.documentElement.style.height = 'auto';
          clonedDoc.documentElement.style.overflow = 'visible';
        }

        // 3. Move previewEl to body to completely isolate it from shell layout (sidebar/header/toolbar)
        previewEl.remove();
        if (clonedDoc.body) {
          clonedDoc.body.innerHTML = '';
          clonedDoc.body.appendChild(previewEl);
        }

        // 4. Configure previewEl for full-length printing
        previewEl.style.width = `${targetWidth}px`;
        previewEl.style.height = 'auto';
        previewEl.style.minHeight = 'auto';
        previewEl.style.maxHeight = 'none';
        previewEl.style.overflow = 'visible';
        previewEl.style.overflowY = 'visible';
        previewEl.style.overflowX = 'visible';
        previewEl.style.position = 'static';
        previewEl.style.margin = '0 auto';
        previewEl.style.boxSizing = 'border-box';

        // 5. If device simulation mode was active, remove phone frame constraints for export
        const deviceWrapper = previewEl.querySelector('#markdown-render-output')?.parentElement?.parentElement as HTMLElement | null;
        if (deviceWrapper && deviceWrapper !== previewEl) {
          deviceWrapper.style.maxWidth = 'none';
          deviceWrapper.style.border = 'none';
          deviceWrapper.style.boxShadow = 'none';
          deviceWrapper.style.margin = '0 auto';
          deviceWrapper.style.padding = '0';
        }

        // 6. Record element coordinates for smart page breaking from the isolated layout
        const clonedBlocks = Array.from(
          previewEl.querySelectorAll<HTMLElement>(
            'h1, h2, h3, h4, h5, h6, p, li, pre, blockquote, table, tr, hr, .code-block-wrapper, img'
          )
        );
        const previewRect = previewEl.getBoundingClientRect();
        renderedElementHeight = previewEl.offsetHeight;
        elementPositions = clonedBlocks.map((el) => {
          const r = el.getBoundingClientRect();
          return {
            top: r.top - previewRect.top,
            bottom: r.bottom - previewRect.top,
          };
        });
      },
    });

    // 3. Map DOM coordinates to Canvas coordinates
    const domHeight = renderedElementHeight || (canvas.height / 2);
    const scaleFactor = canvas.height / domHeight;
    const canvasElements = elementPositions.map((pos) => ({
      top: pos.top * scaleFactor,
      bottom: pos.bottom * scaleFactor,
    }));

    // 4. A4 Dimensions in mm and corresponding canvas pixels
    const pdfPageWidthMm = 210;
    const pdfPageHeightMm = 297;
    const pageCanvasHeight = Math.floor((canvas.width * pdfPageHeightMm) / pdfPageWidthMm);

    // 5. Initialize jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    let currentY = 0;
    let pageIndex = 0;

    while (currentY < canvas.height) {
      const idealEndY = currentY + pageCanvasHeight;
      let sliceEndY = idealEndY;

      if (idealEndY >= canvas.height) {
        sliceEndY = canvas.height;
      } else {
        // Smart break avoiding cutting text lines, list items, or headings in half
        sliceEndY = findSafeBreakPoint(canvas, currentY, idealEndY, canvasElements, isDark);
        if (sliceEndY <= currentY + 100) {
          sliceEndY = idealEndY;
        }
      }

      const sliceHeight = Math.max(1, Math.min(sliceEndY - currentY, pageCanvasHeight));

      // Dedicated single-page canvas filled with full background color
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageCanvasHeight;
      const ctx = pageCanvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvasHeight);
        ctx.drawImage(
          canvas,
          0,
          currentY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );
      }

      if (pageIndex > 0) {
        doc.addPage('a4', 'p');
      }

      // Pre-fill PDF page with background color (eliminates white void artifacts)
      if (isDark) {
        doc.setFillColor(9, 9, 11);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(0, 0, pdfPageWidthMm, pdfPageHeightMm, 'F');

      const pageImgData = pageCanvas.toDataURL('image/png');
      doc.addImage(pageImgData, 'PNG', 0, 0, pdfPageWidthMm, pdfPageHeightMm, undefined, 'FAST');

      currentY = sliceEndY;
      pageIndex++;

      if (sliceHeight <= 0 || pageIndex > 50) break;
    }

    doc.save(filename);
  } finally {
    element.scrollTop = originalScrollTop;
    if (headerElem) headerElem.style.display = originalHeaderDisplay;
    if (footerElem) footerElem.style.display = originalFooterDisplay;
  }
}

export function printDocument(): void {
  window.print();
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Failed to copy plain text', err);
    return false;
  }
}

export async function copyRichTextToClipboard(html: string, plainText: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      const item = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob,
      });
      await navigator.clipboard.write([item]);
      return true;
    } else {
      return copyTextToClipboard(plainText);
    }
  } catch (err) {
    console.warn('ClipboardItem not permitted, falling back to plain text:', err);
    return copyTextToClipboard(plainText);
  }
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => {
    switch (m) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return m;
    }
  });
}
