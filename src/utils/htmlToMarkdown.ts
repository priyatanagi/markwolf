import DOMPurify from 'dompurify';

const VOID_MARK: Record<string, string> = {
  STRONG: '**',
  B: '**',
  EM: '*',
  I: '*',
  DEL: '~~',
  S: '~~',
  STRIKE: '~~',
  CODE: '`',
};

function isBlock(node: Node): boolean {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  return /^(P|DIV|H[1-6]|BLOCKQUOTE|PRE|UL|OL|TABLE|HR|SECTION|ARTICLE|HEADER|FOOTER)$/.test(
    (node as Element).tagName
  );
}

function escapeText(text: string): string {
  return text.replace(/[ \t]+/g, ' ');
}

function inlineToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeText(node.textContent ?? '');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName;

  if (tag === 'SPAN' || tag === 'FONT' || tag === 'SMALL' || tag === 'SUB' || tag === 'SUP') {
    const inner = childrenToInline(el);
    if (!inner.trim()) return '';
    const cls = el.getAttribute('class');
    // Preserve class so icon fonts (e.g. material-symbols-outlined) still work after paste
    if (cls) return `<span class="${cls}">${inner}</span>`;
    if (tag === 'SUB') return `~${inner}~`;
    if (tag === 'SUP') return `^${inner}^`;
    return inner;
  }

  if (tag === 'BR') return '  \n';

  if (tag === 'A') {
    const href = el.getAttribute('href') || '';
    const label = childrenToInline(el).trim() || href;
    return href ? `[${label}](${href})` : label;
  }

  if (tag === 'IMG') {
    const src = el.getAttribute('src') || '';
    const alt = el.getAttribute('alt') || '';
    return src ? `![${alt}](${src})` : '';
  }

  if (tag === 'U' || tag === 'INS') {
    // Markdown has no underline; keep <u> so the preview still renders it
    const inner = childrenToInline(el);
    return inner.trim() ? `<u>${inner}</u>` : '';
  }

  if (tag === 'HR') return '\n---\n';

  const mark = VOID_MARK[tag];
  if (mark) {
    const inner = childrenToInline(el).trim();
    if (!inner) return '';
    if (mark === '`') return `\`${inner.replace(/`/g, '')}\``;
    return `${mark}${inner}${mark}`;
  }

  return childrenToInline(el);
}

function childrenToInline(node: Node): string {
  let out = '';
  node.childNodes.forEach((child) => {
    out += inlineToMarkdown(child);
  });
  return out;
}

function blockToMarkdown(node: Node, indentLevel = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = escapeText(node.textContent ?? '').trim();
    return text ? `${text}\n\n` : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as Element;
  const tag = el.tagName;

  if (tag === 'SPAN' || tag === 'FONT' || tag === 'SMALL' || tag === 'SUB' || tag === 'SUP') {
    return inlineToMarkdown(el);
  }

  if (tag === 'BR') return '\n';

  if (/^H[1-6]$/.test(tag)) {
    const level = Number(tag[1]);
    const text = childrenToInline(el).trim();
    return text ? `${'#'.repeat(level)} ${text}\n\n` : '';
  }

  if (tag === 'HR') return '---\n\n';

  if (tag === 'PRE') {
    const code = el.textContent ?? '';
    const lang = el.querySelector('code')?.getAttribute('class')?.match(/language-(\w+)/)?.[1] ?? '';
    return `\`\`\`${lang}\n${code.replace(/\n+$/, '')}\n\`\`\`\n\n`;
  }

  if (tag === 'BLOCKQUOTE') {
    const inner = childrenToBlock(el).trim();
    if (!inner) return '';
    return `${inner
      .split('\n')
      .map((line) => (line ? `> ${line}` : '>'))
      .join('\n')}\n\n`;
  }

  if (tag === 'UL' || tag === 'OL') {
    return listToMarkdown(el, indentLevel);
  }

  if (tag === 'TABLE') {
    return tableToMarkdown(el);
  }

  const inlineChildren = Array.from(el.childNodes).some(isInlineNode);

  if (inlineChildren && !/^(DIV|SECTION|ARTICLE|BODY|HTML)$/.test(tag)) {
    const text = childrenToInline(el).trim();
    if (!text) return '';
    return `${text}\n\n`;
  }

  return childrenToBlock(el);
}

function isInlineNode(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) return true;
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = (node as Element).tagName;
  if (tag === 'BR') return true;
  if (['SPAN', 'FONT', 'SMALL', 'SUB', 'SUP'].includes(tag)) return true;
  return !isBlock(node);
}

function childrenToBlock(node: Node, indentLevel = 0): string {
  let out = '';
  let inlineRun = '';

  const flush = () => {
    const text = inlineRun.replace(/\s+/g, ' ').trim();
    if (text) out += `${text}\n\n`;
    inlineRun = '';
  };

  node.childNodes.forEach((child) => {
    if (isInlineNode(child)) {
      inlineRun += inlineToMarkdown(child);
      return;
    }
    flush();
    out += blockToMarkdown(child, indentLevel);
  });

  flush();
  return out;
}

function listToMarkdown(el: Element, indentLevel: number): string {
  const ordered = el.tagName === 'OL';
  const start = ordered ? Number(el.getAttribute('start') || '1') || 1 : 1;
  let out = '';
  let index = 0;

  Array.from(el.children).forEach((li) => {
    if (li.tagName !== 'LI') return;
    index += 1;
    const indent = '  '.repeat(indentLevel);
    const bullet = ordered ? `${start + index - 1}. ` : '- ';
    const nested: Element[] = [];
    let inline = '';

    li.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE && /^(UL|OL)$/.test((child as Element).tagName)) {
        nested.push(child as Element);
      } else {
        inline += blockToMarkdownOrInline(child);
      }
    });

    const text = inline.replace(/\n+/g, ' ').trim();
    const taskBox = li.getAttribute('data-task') === 'checked' ? '[x] '
      : li.getAttribute('data-task') === 'unchecked' ? '[ ] ' : '';
    out += `${indent}${bullet}${taskBox}${text}\n`;
    nested.forEach((list) => {
      out += listToMarkdown(list, indentLevel + 1);
    });
  });

  return `${out}\n`.replace(/\n{3,}/g, '\n\n');
}

function blockToMarkdownOrInline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType === Node.ELEMENT_NODE && isBlock(node as Element)) {
    return `\n${blockToMarkdown(node)}\n`;
  }
  return inlineToMarkdown(node);
}

function tableToMarkdown(el: Element): string {
  const rows = Array.from(el.querySelectorAll(':scope > thead > tr, :scope > tbody > tr, :scope > tr'));
  if (rows.length === 0) return '';

  const cellsOf = (tr: Element) =>
    Array.from(tr.querySelectorAll(':scope > th, :scope > td')).map(
      (cell) => childrenToInline(cell).replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
    );

  const header = cellsOf(rows[0]);
  if (header.length === 0) return '';

  const lines = [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
  ];
  rows.slice(1).forEach((tr) => {
    const cells = cellsOf(tr);
    if (cells.length) lines.push(`| ${cells.join(' | ')} |`);
  });
  return `${lines.join('\n')}\n\n`;
}

// Word/Google Docs sometimes paste literal bullet glyphs outside list tags
function normalizeArtifactText(markdown: string): string {
  return markdown
    .replace(/^[\u00A0\u200B\ufeff]+/gm, '')
    .replace(/^[•▪◦·]\s*/gm, '')
    .replace(/[ \t]+\n/g, '\n');
}

export function htmlToMarkdown(html: string): string {
  if (!html.trim()) return '';

  const sanitized = DOMPurify.sanitize(html, {
    FORBID_TAGS: ['script', 'style', 'meta', 'link', 'head', 'iframe', 'object', 'form', 'input', 'video', 'audio'],
  });

  const doc = new DOMParser().parseFromString(sanitized, 'text/html');
  const raw = childrenToBlock(doc.body);
  const cleaned = normalizeArtifactText(raw).replace(/\n{3,}/g, '\n\n').trim();

  // Fall back to plain text when conversion produces nothing usable
  if (!cleaned) {
    return (doc.body.textContent ?? '').trim();
  }
  return cleaned;
}
