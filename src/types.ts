export interface DocumentHeaderFooter {
  enabled: boolean;
  footerEnabled: boolean;
  showHeaderInExport: boolean;
  showFooterInExport: boolean;
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
  customCss?: string;
}

export type DeviceScreenMode = 'responsive' | 'desktop' | 'tablet' | 'mobile';

export interface Doc {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  pinned: boolean;
  isEncrypted: boolean;
  encryptedPayload?: {
    cipherText: string;
    salt: string;
    iv: string;
  };
  driveFileId?: string;
  driveSyncedAt?: number;
}

export interface DocHistory {
  id: string;
  docId: string;
  timestamp: number;
  content: string;
  title: string;
  charCount: number;
  wordCount: number;
  note?: string;
}

export type ThemeMode = 'light' | 'dark' | 'sepia';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type LayoutMode = 'split' | 'editor' | 'preview';
export type PreviewWidth = 'standard' | 'wide' | 'full';

export interface EditorSettings {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: FontSize;
  layout: LayoutMode;
  zenMode: boolean;
  syncScroll: boolean;
  showLineNumbers: boolean;
  previewWidth: PreviewWidth;
  autoSave: boolean;
  autoCapitalizeSentences: boolean;
  headerFooter?: DocumentHeaderFooter;
}

export interface GoogleUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
