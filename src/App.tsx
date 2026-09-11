import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Doc, DocHistory, EditorSettings, GoogleUser, DeviceScreenMode, ThemeMode } from './types';
import {
  loadDocs,
  saveDocs,
  loadActiveDocId,
  saveActiveDocId,
  loadDocHistory,
  saveDocHistory,
  recordHistoryCheckpoint,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from './services/storage';
import { initAuth } from './services/firebaseAuth';
import {
  exportToMarkdown,
  exportToHTML,
  exportToImage,
  exportToPDF,
  exportToPlainText,
  exportToJSON,
  copyRichTextToClipboard,
  printDocument,
  copyTextToClipboard,
} from './services/exportUtils';
import { encryptText, decryptText } from './services/crypto';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { EditorPane } from './components/EditorPane';
import { MarkdownPreview } from './components/MarkdownPreview';
import { HistoryModal } from './components/HistoryModal';
import { EncryptionModal } from './components/EncryptionModal';
import { DriveModal } from './components/DriveModal';
import { SettingsModal } from './components/SettingsModal';
import { HeaderFooterModal } from './components/HeaderFooterModal';
import { ExportModal } from './components/ExportModal';
import { InlineCssModal } from './components/InlineCssModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CodeSnippetModal } from './components/CodeSnippetModal';
import { TableWizardModal } from './components/TableWizardModal';
import { EmojiIconPickerModal } from './components/EmojiIconPickerModal';
import { autoCapitalizeSentences } from './utils/markdownUtils';
import { Check, FileCode, Square } from 'lucide-react';

export default function App() {
  // Application Data State
  const [docs, setDocs] = useState<Doc[]>(() => loadDocs());
  const [activeDocId, setActiveDocId] = useState<string>(() => {
    const savedId = loadActiveDocId();
    const initialDocs = loadDocs();
    return savedId && initialDocs.some((d) => d.id === savedId)
      ? savedId
      : initialDocs[0]?.id || '';
  });

  const [settings, setSettings] = useState<EditorSettings>(() => loadSettings());
  // Default sidebar open on desktop, collapsed on small screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  const [deviceMode, setDeviceMode] = useState<DeviceScreenMode>('responsive');
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Auth & Cloud state
  const [user, setUser] = useState<GoogleUser | null>(null);

  // In-memory decrypted plain text cache for encrypted documents
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isEncryptionOpen, setIsEncryptionOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHeaderFooterOpen, setIsHeaderFooterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isInlineCssOpen, setIsInlineCssOpen] = useState(false);
  const [isCodeSnippetOpen, setIsCodeSnippetOpen] = useState(false);
  const [isTableWizardOpen, setIsTableWizardOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  // Mobile layout view toggle (editor vs preview)
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete confirmation
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // Undo / Redo history stack for current editor
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Refs for scrolling and export
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isScrollingSyncRef = useRef<boolean>(false);

  // Auto-checkpoint timer ref
  const autoCheckpointTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Current active doc
  const currentDoc = useMemo(() => {
    return docs.find((d) => d.id === activeDocId) || docs[0] || null;
  }, [docs, activeDocId]);

  // Document text (either decrypted or raw content)
  const activeContent = useMemo(() => {
    if (!currentDoc) return '';
    if (currentDoc.isEncrypted) {
      return decryptedCache[currentDoc.id] ?? '';
    }
    return currentDoc.content;
  }, [currentDoc, decryptedCache]);

  const isEncryptedLocked = useMemo(() => {
    return Boolean(currentDoc?.isEncrypted && decryptedCache[currentDoc.id] === undefined);
  }, [currentDoc, decryptedCache]);

  // Show temporary toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Back online');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Working offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-sepia');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'sepia') {
      root.classList.add('theme-sepia');
    }
  }, [settings.theme]);

  // Initialize Firebase Auth listener
  useEffect(() => {
    try {
      const unsubscribe = initAuth((currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase auth initialization deferred:', e);
    }
  }, []);

  // Synchronize undo/redo history on active document change
  useEffect(() => {
    if (activeContent) {
      setHistoryStack([activeContent]);
      setHistoryIndex(0);
    } else {
      setHistoryStack([]);
      setHistoryIndex(-1);
    }
  }, [activeDocId]);

  // Persist activeDocId
  useEffect(() => {
    if (activeDocId) {
      saveActiveDocId(activeDocId);
    }
  }, [activeDocId]);

  // Save settings on change
  const handleUpdateSettings = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // Sync scroll between textarea and preview
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    const textarea = e.currentTarget;
    const preview = previewRef.current;
    if (preview) {
      const textMax = textarea.scrollHeight - textarea.clientHeight;
      const previewMax = preview.scrollHeight - preview.clientHeight;
      if (textMax > 0 && previewMax > 0) {
        const percentage = textarea.scrollTop / textMax;
        preview.scrollTop = percentage * previewMax;
      }
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!settings.syncScroll || isScrollingSyncRef.current) return;
    isScrollingSyncRef.current = true;

    const preview = e.currentTarget;
    const textarea = textareaRef.current;
    if (textarea) {
      const textMax = textarea.scrollHeight - textarea.clientHeight;
      const previewMax = preview.scrollHeight - preview.clientHeight;
      if (textMax > 0 && previewMax > 0) {
        const percentage = preview.scrollTop / previewMax;
        textarea.scrollTop = percentage * textMax;
      }
    }

    setTimeout(() => {
      isScrollingSyncRef.current = false;
    }, 40);
  };

  // Content change handler
  const handleContentChange = (newContent: string) => {
    if (!currentDoc) return;

    // Auto-capitalize sentences if enabled in settings
    const processedContent = (settings.autoCapitalizeSentences ?? true)
      ? autoCapitalizeSentences(newContent)
      : newContent;

    // Preserve textarea selection position if text was capitalized
    const textarea = textareaRef.current;
    if (textarea && processedContent !== newContent) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      requestAnimationFrame(() => {
        textarea.setSelectionRange(start, end);
      });
    }

    if (currentDoc.isEncrypted) {
      setDecryptedCache((prev) => ({ ...prev, [currentDoc.id]: processedContent }));
    } else {
      setDocs((prevDocs) => {
        const updated = prevDocs.map((d) =>
          d.id === currentDoc.id
            ? { ...d, content: processedContent, updatedAt: Date.now() }
            : d
        );
        if (settings.autoSave) {
          setIsSaving(true);
          saveDocs(updated);
          setTimeout(() => setIsSaving(false), 300);
        }
        return updated;
      });
    }

    // Push to undo stack
    setHistoryStack((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      if (sliced[sliced.length - 1] !== processedContent) {
        return [...sliced, processedContent];
      }
      return sliced;
    });
    setHistoryIndex((prev) => prev + 1);

    // Debounced automatic version checkpoint (3 minutes idle)
    if (autoCheckpointTimerRef.current) {
      clearTimeout(autoCheckpointTimerRef.current);
    }
    autoCheckpointTimerRef.current = setTimeout(() => {
      if (currentDoc) {
        recordHistoryCheckpoint(currentDoc, 'Auto save checkpoint');
      }
    }, 180000);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevContent = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      if (currentDoc?.isEncrypted) {
        setDecryptedCache((prev) => ({ ...prev, [currentDoc.id]: prevContent }));
      } else if (currentDoc) {
        setDocs((prev) => {
          const updated = prev.map((d) =>
            d.id === currentDoc.id ? { ...d, content: prevContent, updatedAt: Date.now() } : d
          );
          saveDocs(updated);
          return updated;
        });
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextContent = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      if (currentDoc?.isEncrypted) {
        setDecryptedCache((prev) => ({ ...prev, [currentDoc.id]: nextContent }));
      } else if (currentDoc) {
        setDocs((prev) => {
          const updated = prev.map((d) =>
            d.id === currentDoc.id ? { ...d, content: nextContent, updatedAt: Date.now() } : d
          );
          saveDocs(updated);
          return updated;
        });
      }
    }
  };

  // Insert markdown helpers
  const handleInsertMarkdown = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${defaultText}${suffix}`;

    const newContent =
      textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectedText
        ? start + replacement.length
        : start + prefix.length + defaultText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleInsertRawText = (rawText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      handleContentChange(activeContent + '\n\n' + rawText);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent =
      textarea.value.substring(0, start) + rawText + textarea.value.substring(end);

    handleContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + rawText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 10);
  };

  // Document Management
  const handleCreateDoc = () => {
    const newDoc: Doc = {
      id: 'doc_' + Date.now(),
      title: 'Untitled Document',
      content: `# Untitled Document\n\nStart writing your ideas in Markdown...\n`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      pinned: false,
      isEncrypted: false,
    };
    const updated = [newDoc, ...docs];
    setDocs(updated);
    saveDocs(updated);
    setActiveDocId(newDoc.id);
    showToast('New document created');
  };

  const handleCreateFromTemplate = (template: { title: string; content: string; tags?: string[] }) => {
    const newDoc: Doc = {
      id: 'doc_' + Date.now(),
      title: template.title,
      content: template.content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: template.tags || [],
      pinned: false,
      isEncrypted: false,
    };
    const updated = [newDoc, ...docs];
    setDocs(updated);
    saveDocs(updated);
    setActiveDocId(newDoc.id);
    showToast(`Created from template: ${template.title}`);
  };

  const handleDuplicateDoc = (id: string) => {
    const target = docs.find((d) => d.id === id);
    if (!target) return;

    const dupContent = target.isEncrypted ? decryptedCache[target.id] || target.content : target.content;
    const duplicated: Doc = {
      ...target,
      id: 'doc_' + Date.now(),
      title: `${target.title} (Copy)`,
      content: dupContent,
      isEncrypted: false,
      encryptedPayload: undefined,
      driveFileId: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      tags: target.tags || [],
    };

    const updated = [duplicated, ...docs];
    setDocs(updated);
    saveDocs(updated);
    setActiveDocId(duplicated.id);
    showToast('Document duplicated');
  };

  const handleDeleteDocConfirm = () => {
    if (!deleteDocId) return;

    const remaining = docs.filter((d) => d.id !== deleteDocId);
    if (remaining.length === 0) {
      const fallbackDoc: Doc = {
        id: 'doc_' + Date.now(),
        title: 'Welcome to Markdown Studio',
        content: `# Welcome to Markdown Studio\n\nA responsive, production-ready markdown workspace with live preview, math equations, diagrams, and encrypted notes.\n`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [],
        pinned: false,
        isEncrypted: false,
      };
      setDocs([fallbackDoc]);
      saveDocs([fallbackDoc]);
      setActiveDocId(fallbackDoc.id);
    } else {
      setDocs(remaining);
      saveDocs(remaining);
      if (activeDocId === deleteDocId) {
        setActiveDocId(remaining[0].id);
      }
    }

    setDeleteDocId(null);
    showToast('Document deleted');
  };

  const handleTogglePin = (id: string) => {
    setDocs((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, pinned: !d.pinned } : d));
      saveDocs(updated);
      return updated;
    });
  };

  const handleUpdateTitle = (newTitle: string) => {
    if (!currentDoc) return;
    setDocs((prev) => {
      const updated = prev.map((d) =>
        d.id === currentDoc.id ? { ...d, title: newTitle, updatedAt: Date.now() } : d
      );
      saveDocs(updated);
      return updated;
    });
  };

  const handleAddTag = (tag: string) => {
    if (!currentDoc) return;
    const cleanTag = tag.trim().toLowerCase();
    if (!cleanTag) return;
    const currentTags = currentDoc.tags || [];
    if (currentTags.includes(cleanTag)) return;

    setDocs((prev) => {
      const updated = prev.map((d) =>
        d.id === currentDoc.id ? { ...d, tags: [...currentTags, cleanTag], updatedAt: Date.now() } : d
      );
      saveDocs(updated);
      return updated;
    });
  };

  const handleRemoveTag = (tag: string) => {
    if (!currentDoc || !currentDoc.tags) return;
    setDocs((prev) => {
      const updated = prev.map((d) =>
        d.id === currentDoc.id
          ? { ...d, tags: d.tags?.filter((t) => t !== tag), updatedAt: Date.now() }
          : d
      );
      saveDocs(updated);
      return updated;
    });
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
      const newDoc: Doc = {
        id: 'doc_' + Date.now(),
        title: cleanTitle,
        content: content || '',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['imported'],
        pinned: false,
        isEncrypted: false,
      };
      const updated = [newDoc, ...docs];
      setDocs(updated);
      saveDocs(updated);
      setActiveDocId(newDoc.id);
      showToast(`Imported "${file.name}"`);
    };
    reader.readAsText(file);
  };

  const handleToggleTask = (taskIndex: number) => {
    let count = 0;
    const updatedContent = activeContent.replace(
      /^(\s*[-*+]\s+\[)( |x|X)(\]\s+)/gm,
      (match, prefix, check, suffix) => {
        if (count === taskIndex) {
          count++;
          const newCheck = check.trim() ? ' ' : 'x';
          return `${prefix}${newCheck}${suffix}`;
        }
        count++;
        return match;
      }
    );
    handleContentChange(updatedContent);
  };

  // Restore snapshot from history
  const handleRestoreHistorySnapshot = (snapshot: DocHistory) => {
    handleContentChange(snapshot.content);
    if (snapshot.title && currentDoc) {
      handleUpdateTitle(snapshot.title);
    }
    showToast('Restored version from history');
  };

  // Encryption handlers
  const handleEncryptCurrentDoc = async (passphrase: string) => {
    if (!currentDoc) return;
    const { cipherText, salt, iv } = await encryptText(activeContent, passphrase);

    setDocs((prev) => {
      const updated = prev.map((d) => {
        if (d.id === currentDoc.id) {
          return {
            ...d,
            isEncrypted: true,
            content: '<!-- Encrypted with AES-256-GCM -->',
            encryptedPayload: { cipherText, salt, iv },
            updatedAt: Date.now(),
          };
        }
        return d;
      });
      saveDocs(updated);
      return updated;
    });

    setDecryptedCache((prev) => ({ ...prev, [currentDoc.id]: activeContent }));
    showToast('Document encrypted with AES-256-GCM');
  };

  const handleDecryptCurrentDoc = async (passphrase: string) => {
    if (!currentDoc || !currentDoc.encryptedPayload) return;
    const { cipherText, salt, iv } = currentDoc.encryptedPayload;
    const plainText = await decryptText(cipherText, salt, iv, passphrase);

    setDecryptedCache((prev) => ({ ...prev, [currentDoc.id]: plainText }));
    showToast('Document unlocked');
  };

  const handleRemoveEncryption = () => {
    if (!currentDoc) return;
    setDocs((prev) => {
      const updated = prev.map((d) => {
        if (d.id === currentDoc.id) {
          return {
            ...d,
            isEncrypted: false,
            content: activeContent,
            encryptedPayload: undefined,
            updatedAt: Date.now(),
          };
        }
        return d;
      });
      saveDocs(updated);
      return updated;
    });
    setIsEncryptionOpen(false);
    showToast('Encryption removed');
  };

  // Restore Workspace from Google Drive backup
  const handleRestoreWorkspace = (restoredDocs: Doc[]) => {
    setDocs(restoredDocs);
    saveDocs(restoredDocs);
    if (restoredDocs.length > 0) {
      setActiveDocId(restoredDocs[0].id);
    }
    showToast('Restored workspace from Google Drive');
  };

  // Keyboard shortcut listener
  const handleEditorKeyDownShortcut = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const mod = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl+\ to toggle sidebar
    if (mod && e.key === '\\') {
      e.preventDefault();
      setIsSidebarOpen((prev) => !prev);
      return;
    }

    if (mod) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          handleInsertMarkdown('**', '**', 'bold text');
          break;
        case 'i':
          e.preventDefault();
          handleInsertMarkdown('*', '*', 'italic text');
          break;
        case 'k':
          e.preventDefault();
          handleInsertMarkdown('[', '](https://example.com)', 'link');
          break;
        case 's':
          e.preventDefault();
          if (currentDoc) {
            saveDocs(docs);
            recordHistoryCheckpoint(currentDoc, 'Manual checkpoint');
            showToast('Document saved & checkpoint recorded');
          }
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            handleRedo();
          } else {
            e.preventDefault();
            handleUndo();
          }
          break;
        case 'y':
          e.preventDefault();
          handleRedo();
          break;
      }
    }
  };

  // Document statistics
  const stats = useMemo(() => {
    const text = activeContent.trim();
    const chars = text.length;
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    return { chars, words, readingTime };
  }, [activeContent]);

  // Export handlers
  const handleExportPDF = async (options?: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => {
    if (!previewRef.current || !currentDoc) return;
    const hf = settings.headerFooter || DEFAULT_SETTINGS.headerFooter!;
    try {
      showToast('Generating PDF...');
      await exportToPDF(
        previewRef.current,
        currentDoc.title,
        (options?.theme || settings.theme) === 'dark',
        {
          showHeader: options ? options.showHeader : (hf?.showHeaderInExport ?? true),
          showFooter: options ? options.showFooter : (hf?.showFooterInExport ?? true),
        }
      );
      showToast('PDF downloaded successfully');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to export PDF');
    }
  };

  const handleExportImage = async (options?: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => {
    if (!previewRef.current || !currentDoc) return;
    const hf = settings.headerFooter || DEFAULT_SETTINGS.headerFooter!;
    try {
      showToast('Generating PNG image...');
      await exportToImage(
        previewRef.current,
        currentDoc.title,
        (options?.theme || settings.theme) === 'dark',
        {
          showHeader: options ? options.showHeader : (hf?.showHeaderInExport ?? true),
          showFooter: options ? options.showFooter : (hf?.showFooterInExport ?? true),
        }
      );
      showToast('Image downloaded successfully');
    } catch (e: any) {
      console.error(e);
      showToast('Failed to export image');
    }
  };

  const handleExportMarkdown = () => {
    if (!currentDoc) return;
    exportToMarkdown(currentDoc.title, activeContent);
    showToast('Markdown downloaded');
  };

  const handleExportHTML = (options?: { showHeader: boolean; showFooter: boolean; theme: ThemeMode }) => {
    if (!previewRef.current || !currentDoc) return;
    const hf = settings.headerFooter || DEFAULT_SETTINGS.headerFooter!;
    exportToHTML(
      currentDoc.title,
      previewRef.current.innerHTML,
      (options?.theme || settings.theme) === 'dark',
      {
        showHeader: options ? options.showHeader : (hf?.showHeaderInExport ?? true),
        showFooter: options ? options.showFooter : (hf?.showFooterInExport ?? true),
        headerLeft: hf?.headerLeft,
        headerCenter: hf?.headerCenter,
        headerRight: hf?.headerRight,
        footerLeft: hf?.footerLeft,
        footerCenter: hf?.footerCenter,
        footerRight: hf?.footerRight,
        customCss: hf?.customCss,
      }
    );
    showToast('HTML file downloaded');
  };

  const handleExportPlainText = () => {
    if (!currentDoc) return;
    exportToPlainText(currentDoc.title, activeContent);
    showToast('Plain text (.txt) file downloaded');
  };

  const handleCopyRichText = async (): Promise<boolean> => {
    if (!previewRef.current || !currentDoc) return false;
    const ok = await copyRichTextToClipboard(previewRef.current.innerHTML, activeContent);
    if (ok) {
      showToast('Formatted rich text copied to clipboard');
    }
    return ok;
  };

  const handleExportJSON = () => {
    if (!currentDoc) return;
    const hf = settings.headerFooter || DEFAULT_SETTINGS.headerFooter!;
    exportToJSON(currentDoc.title, {
      ...currentDoc,
      exportedAt: new Date().toISOString(),
      headerFooter: hf,
    });
    showToast('Document JSON backup downloaded');
  };

  const handleCopyMarkdown = async () => {
    const ok = await copyTextToClipboard(activeContent);
    if (ok) {
      showToast('Markdown copied to clipboard');
    }
  };

  // Compute Layout Visibility
  const showEditor = settings.layout === 'split' || settings.layout === 'editor';
  const showPreview = settings.layout === 'split' || settings.layout === 'preview';

  return (
    <div
      id="app-root-container"
      className="h-screen w-screen flex flex-col overflow-hidden bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-blue-100 dark:selection:bg-blue-900/40"
    >
      {/* App Header */}
      {currentDoc && (
        <Header
          currentDoc={currentDoc}
          onUpdateTitle={handleUpdateTitle}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
          user={user}
          onOpenDriveModal={() => setIsDriveOpen(true)}
          onOpenHistoryModal={() => setIsHistoryOpen(true)}
          onOpenEncryptionModal={() => setIsEncryptionOpen(true)}
          onOpenSettingsModal={() => setIsSettingsOpen(true)}
          onOpenHeaderFooterModal={() => setIsHeaderFooterOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          onExportPDF={() => handleExportPDF()}
          onExportImage={() => handleExportImage()}
          onExportMarkdown={handleExportMarkdown}
          onExportHTML={() => handleExportHTML()}
          onPrint={printDocument}
          onCopyContent={handleCopyMarkdown}
          isSaving={isSaving}
        />
      )}

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Document Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          docs={docs}
          activeDocId={activeDocId}
          onSelectDoc={(id) => {
            setActiveDocId(id);
            // On mobile screen only, auto-close sidebar
            if (window.innerWidth < 768) {
              setIsSidebarOpen(false);
            }
          }}
          onCreateDoc={handleCreateDoc}
          onCreateFromTemplate={handleCreateFromTemplate}
          onDeleteDoc={(id) => setDeleteDocId(id)}
          onDuplicateDoc={handleDuplicateDoc}
          onTogglePin={handleTogglePin}
          onImportFile={handleImportFile}
          isOnline={isOnline}
        />

        {/* Editor & Preview Main Workspace */}
        <main className={`flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-zinc-950 min-w-0 transition-all duration-200 ${isSidebarOpen ? 'md:ml-64 lg:ml-72' : ''}`}>
          {/* Mobile view switch pills (< 768px) */}
          <div className="flex md:hidden items-center justify-center p-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-2 w-full max-w-xs bg-zinc-200/70 dark:bg-zinc-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMobileTab('editor')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  mobileTab === 'editor'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <FileCode size={13} />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  mobileTab === 'preview'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <Square size={13} />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          {!settings.zenMode && (
            <Toolbar
              onInsertMarkdown={handleInsertMarkdown}
              onOpenCodeSnippetModal={() => setIsCodeSnippetOpen(true)}
              onOpenTableWizard={() => setIsTableWizardOpen(true)}
              onOpenEmojiPicker={() => setIsEmojiPickerOpen(true)}
              onOpenInlineCssModal={() => setIsInlineCssOpen(true)}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={historyIndex > 0}
              canRedo={historyIndex < historyStack.length - 1}
              wordCount={stats.words}
              charCount={stats.chars}
              readingTime={stats.readingTime}
            />
          )}

          {/* Panes Container (Split / Single) */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Editor Pane */}
            <div
              className={`h-full flex-col min-w-0 ${
                // Mobile visibility
                mobileTab === 'editor' ? 'flex md:flex' : 'hidden md:flex'
              } ${
                // Desktop width: split=50%, single=100%, hidden=none
                !showEditor ? 'hidden' : showPreview ? 'w-full md:w-1/2 border-r border-zinc-200 dark:border-zinc-800' : 'w-full'
              }`}
            >
              <EditorPane
                value={activeContent}
                onChange={handleContentChange}
                fontFamily={settings.fontFamily}
                fontSize={settings.fontSize}
                showLineNumbers={settings.showLineNumbers}
                onScroll={handleEditorScroll}
                textareaRef={textareaRef}
                onKeyDownShortcut={handleEditorKeyDownShortcut}
                isEncryptedLocked={isEncryptedLocked}
                onUnlockRequest={() => setIsEncryptionOpen(true)}
              />
            </div>

            {/* Preview Pane */}
            <div
              className={`h-full flex-col bg-white dark:bg-zinc-950 min-w-0 ${
                // Mobile visibility
                mobileTab === 'preview' ? 'flex md:flex' : 'hidden md:flex'
              } ${
                // Desktop width: split=50%, single=100%, hidden=none
                !showPreview ? 'hidden' : showEditor ? 'w-full md:w-1/2' : 'w-full'
              }`}
            >
              <MarkdownPreview
                content={activeContent}
                fontFamily={settings.fontFamily}
                fontSize={settings.fontSize}
                previewWidth={settings.previewWidth}
                onToggleTask={handleToggleTask}
                previewRef={previewRef}
                onScroll={handlePreviewScroll}
                headerFooter={settings.headerFooter}
                docTitle={currentDoc?.title}
                deviceMode={deviceMode}
                onDeviceModeChange={setDeviceMode}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-message"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium rounded-lg shadow-xl border border-zinc-800 dark:border-zinc-300 animate-slide-up"
        >
          <Check size={14} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      {currentDoc && (
        <>
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            currentDoc={currentDoc}
            history={loadDocHistory(currentDoc.id)}
            onRestore={handleRestoreHistorySnapshot}
            onCreateCheckpoint={(note) => {
              recordHistoryCheckpoint(currentDoc, note);
              showToast('Recorded document checkpoint');
            }}
          />

          <EncryptionModal
            isOpen={isEncryptionOpen}
            onClose={() => setIsEncryptionOpen(false)}
            doc={currentDoc}
            onEncrypt={handleEncryptCurrentDoc}
            onDecrypt={handleDecryptCurrentDoc}
            onRemoveEncryption={handleRemoveEncryption}
            isUnlockingOnly={isEncryptedLocked}
          />

          <DriveModal
            isOpen={isDriveOpen}
            onClose={() => setIsDriveOpen(false)}
            user={user}
            onUserChanged={setUser}
            currentDoc={currentDoc}
            onDocUpdated={(updatedFields) => {
              setDocs((prev) => {
                const updated = prev.map((d) => (d.id === currentDoc.id ? { ...d, ...updatedFields } : d));
                saveDocs(updated);
                return updated;
              });
            }}
            allDocs={docs}
            onRestoreWorkspace={handleRestoreWorkspace}
          />
        </>
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenHeaderFooterModal={() => setIsHeaderFooterOpen(true)}
      />

      {/* Advanced Header, Footer & Custom CSS Modal */}
      <HeaderFooterModal
        isOpen={isHeaderFooterOpen}
        onClose={() => setIsHeaderFooterOpen(false)}
        headerFooter={settings.headerFooter || DEFAULT_SETTINGS.headerFooter!}
        onUpdateHeaderFooter={(updatedHF) => handleUpdateSettings({ headerFooter: updatedHF })}
        docTitle={currentDoc?.title}
      />

      {/* Comprehensive Export Modal */}
      {currentDoc && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          docTitle={currentDoc.title}
          headerFooter={settings.headerFooter || DEFAULT_SETTINGS.headerFooter!}
          currentTheme={settings.theme}
          onExportPDF={handleExportPDF}
          onExportImage={handleExportImage}
          onExportHTML={handleExportHTML}
          onExportMarkdown={handleExportMarkdown}
          onExportPlainText={handleExportPlainText}
          onCopyRichText={handleCopyRichText}
          onPrint={printDocument}
          onExportJSON={handleExportJSON}
          onOpenHeaderFooterSettings={() => {
            setIsExportModalOpen(false);
            setIsHeaderFooterOpen(true);
          }}
        />
      )}

      {/* Inline CSS & Style Snippets Modal */}
      <InlineCssModal
        isOpen={isInlineCssOpen}
        onClose={() => setIsInlineCssOpen(false)}
        onInsert={(snippet) => {
          handleInsertRawText(snippet);
          showToast('Inserted styling snippet');
        }}
      />

      {/* Code Snippet Modal */}
      <CodeSnippetModal
        isOpen={isCodeSnippetOpen}
        onClose={() => setIsCodeSnippetOpen(false)}
        onInsertSnippet={(snippetMarkdown) => {
          handleInsertRawText(snippetMarkdown);
          showToast('Code snippet inserted');
        }}
      />

      {/* Table Creation Wizard */}
      <TableWizardModal
        isOpen={isTableWizardOpen}
        onClose={() => setIsTableWizardOpen(false)}
        onInsertTable={(tableMarkdown) => {
          handleInsertRawText(tableMarkdown);
          showToast('Table inserted');
        }}
      />

      {/* Emoji & Icon Picker */}
      <EmojiIconPickerModal
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onInsertEmoji={(emojiChar) => {
          handleInsertRawText(emojiChar);
        }}
      />

      {/* Delete Doc Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteDocId !== null}
        title="Delete Document"
        message="Are you sure you want to permanently delete this document? This action cannot be undone."
        confirmLabel="Delete Document"
        isDestructive={true}
        onConfirm={handleDeleteDocConfirm}
        onCancel={() => setDeleteDocId(null)}
      />
    </div>
  );
}
