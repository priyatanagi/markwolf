import React, { useState, useEffect } from 'react';
import {
  Cloud,
  UploadCloud,
  DownloadCloud,
  FileText,
  RotateCw,
  LogOut,
  CheckCircle,
  AlertCircle,
  X,
  FolderOpen,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { GoogleUser, Doc } from '../types';
import { googleSignIn, logout } from '../services/firebaseAuth';
import {
  saveMarkdownToDrive,
  listDriveMarkdownFiles,
  fetchDriveFileContent,
  backupWorkspaceToDrive,
  listDriveBackups,
  DriveFileItem,
} from '../services/googleDrive';
import { ConfirmModal } from './ConfirmModal';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: GoogleUser | null;
  onUserChanged: (user: GoogleUser | null) => void;
  currentDoc: Doc;
  onDocUpdated: (updatedFields: Partial<Doc>) => void;
  allDocs: Doc[];
  onRestoreWorkspace: (restoredDocs: Doc[]) => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserChanged,
  currentDoc,
  onDocUpdated,
  allDocs,
  onRestoreWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'browse' | 'backup'>('sync');
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drive file list
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [backupsList, setBackupsList] = useState<DriveFileItem[]>([]);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  useEffect(() => {
    if (isOpen && user) {
      if (activeTab === 'browse') {
        loadDriveFiles();
      } else if (activeTab === 'backup') {
        loadDriveBackupsList();
      }
    }
  }, [isOpen, user, activeTab]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setStatusMessage(null);
      const res = await googleSignIn();
      if (res) {
        onUserChanged(res.user);
        setStatusMessage({ type: 'success', text: `Signed in as ${res.user.displayName || res.user.email}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Google Sign-in failed' });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onUserChanged(null);
      setStatusMessage({ type: 'success', text: 'Signed out from Google' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Sign-out failed' });
    }
  };

  const loadDriveFiles = async () => {
    try {
      setIsLoading(true);
      const files = await listDriveMarkdownFiles();
      setDriveFiles(files);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not load Drive files' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDriveBackupsList = async () => {
    try {
      setIsLoading(true);
      const backups = await listDriveBackups();
      setBackupsList(backups);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not load backups' });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync / Save current document to Drive
  const handleSaveToDrive = async () => {
    if (!user) return;

    if (currentDoc.driveFileId) {
      // Per workspace skill rules: explicit confirmation before updating existing file in Drive!
      setConfirmDialog({
        isOpen: true,
        title: 'Update Google Drive File',
        message: `Are you sure you want to update '${currentDoc.title}' on Google Drive? Existing remote content will be updated with your latest changes.`,
        confirmLabel: 'Update File',
        isDestructive: false,
        action: async () => {
          try {
            setIsLoading(true);
            const result = await saveMarkdownToDrive(currentDoc.title, currentDoc.content, currentDoc.driveFileId);
            onDocUpdated({
              driveFileId: result.fileId,
              driveSyncedAt: Date.now(),
            });
            setStatusMessage({ type: 'success', text: `Successfully updated '${result.name}' on Google Drive!` });
          } catch (err: any) {
            setStatusMessage({ type: 'error', text: err.message || 'Failed to update Drive file' });
          } finally {
            setIsLoading(false);
          }
        },
      });
    } else {
      try {
        setIsLoading(true);
        const result = await saveMarkdownToDrive(currentDoc.title, currentDoc.content);
        onDocUpdated({
          driveFileId: result.fileId,
          driveSyncedAt: Date.now(),
        });
        setStatusMessage({ type: 'success', text: `Saved '${result.name}' to Google Drive!` });
      } catch (err: any) {
        setStatusMessage({ type: 'error', text: err.message || 'Failed to save to Drive' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Import file from Google Drive
  const handleImportFile = (fileItem: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Import from Google Drive',
      message: `Do you want to load and replace the current document with '${fileItem.name}' from Google Drive?`,
      confirmLabel: 'Import File',
      isDestructive: false,
      action: async () => {
        try {
          setIsLoading(true);
          const content = await fetchDriveFileContent(fileItem.id);
          const cleanTitle = fileItem.name.replace(/\.md$/i, '');
          onDocUpdated({
            title: cleanTitle,
            content,
            driveFileId: fileItem.id,
            driveSyncedAt: Date.now(),
            updatedAt: Date.now(),
          });
          setStatusMessage({ type: 'success', text: `Imported '${fileItem.name}' from Google Drive.` });
          onClose();
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to read file from Drive' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Create workspace cloud backup
  const handleCreateWorkspaceBackup = async () => {
    try {
      setIsLoading(true);
      const payload = {
        version: 1,
        createdAt: new Date().toISOString(),
        documents: allDocs,
      };
      const res = await backupWorkspaceToDrive(payload);
      setStatusMessage({ type: 'success', text: `Cloud backup created: '${res.name}'` });
      loadDriveBackupsList();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Backup failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Restore workspace from cloud backup
  const handleRestoreBackup = (backupItem: DriveFileItem) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Workspace Backup',
      message: `Restoring from '${backupItem.name}' will merge or replace workspace documents with the cloud backup. Do you wish to continue?`,
      confirmLabel: 'Restore Workspace',
      isDestructive: true,
      action: async () => {
        try {
          setIsLoading(true);
          const content = await fetchDriveFileContent(backupItem.id);
          const parsed = JSON.parse(content);
          if (parsed && Array.isArray(parsed.documents)) {
            onRestoreWorkspace(parsed.documents);
            setStatusMessage({ type: 'success', text: 'Workspace restored successfully from Google Drive!' });
          } else {
            throw new Error('Invalid backup structure.');
          }
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to restore backup' });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
        <div
          id="drive-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drive-modal-title"
          className="relative w-full max-w-xl max-h-[85vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <Cloud size={18} />
              </div>
              <div>
                <h3 id="drive-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Google Drive Cloud Sync
                </h3>
                <p className="text-xs text-zinc-500">
                  Synchronize documents, collaborative backups & cloud retention
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

          {/* Account Bar */}
          <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {user.displayName || 'Google Account'}
                    </div>
                    <div className="text-[11px] text-zinc-500">{user.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <LogOut size={13} />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Sign in with Google to sync files and create backups
                </div>

                {/* Google Sign In button styled according to Google identity guidelines */}
                <button
                  id="btn-google-signin-modal"
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-100 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`px-6 py-2.5 text-xs flex items-center gap-2 border-b ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/40 dark:bg-zinc-900/60 px-6 pt-2">
            {[
              { id: 'sync', label: 'Current Document', icon: UploadCloud },
              { id: 'browse', label: 'Browse Drive', icon: FolderOpen },
              { id: 'backup', label: 'Workspace Backups', icon: Archive },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${
                    isActive
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!user ? (
              <div className="p-8 text-center">
                <Cloud size={36} className="mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
                <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  Google Drive Disconnected
                </h4>
                <p className="mt-1 text-xs text-zinc-500 max-w-sm mx-auto">
                  Please sign in with your Google account above to sync documents, load markdown from Google Drive, and manage encrypted backups.
                </p>
              </div>
            ) : (
              <>
                {/* Tab: Sync Current Document */}
                {activeTab === 'sync' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Current Document
                          </span>
                          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                            {currentDoc.title || 'Untitled Document'}.md
                          </h4>
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                            {currentDoc.driveFileId ? (
                              <>
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Linked to Drive (ID: {currentDoc.driveFileId.slice(0, 10)}...)</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                <span>Not yet saved to Google Drive</span>
                              </>
                            )}
                          </div>
                          {currentDoc.driveSyncedAt && (
                            <div className="text-[11px] text-zinc-400 mt-1">
                              Last cloud sync: {new Date(currentDoc.driveSyncedAt).toLocaleString()}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveToDrive}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                        >
                          <UploadCloud size={15} />
                          <span>{currentDoc.driveFileId ? 'Sync to Drive' : 'Save to Drive'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Files saved to Google Drive remain in your personal cloud storage. If client-side encryption is active on this document, only the encrypted payload is synced to the cloud.
                    </div>
                  </div>
                )}

                {/* Tab: Browse Drive Files */}
                {activeTab === 'browse' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        Markdown Files in your Drive
                      </span>
                      <button
                        type="button"
                        onClick={loadDriveFiles}
                        disabled={isLoading}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                      </button>
                    </div>

                    {isLoading ? (
                      <div className="p-8 text-center text-xs text-zinc-400">Loading Drive files...</div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-8 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                        No Markdown (.md) files found in your Google Drive.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText size={16} className="text-blue-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                                  {file.name}
                                </div>
                                <div className="text-[11px] text-zinc-400">
                                  {new Date(file.modifiedTime).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleImportFile(file)}
                              className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                            >
                              Open in Editor
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Workspace Backups */}
                {activeTab === 'backup' && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          Workspace Cloud Backup
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          Backup all {allDocs.length} documents and custom settings to your Google Drive
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateWorkspaceBackup}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                      >
                        <Archive size={14} />
                        <span>Backup Now</span>
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                          Previous Backups on Drive
                        </span>
                        <button
                          type="button"
                          onClick={loadDriveBackupsList}
                          disabled={isLoading}
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                          <span>Refresh</span>
                        </button>
                      </div>

                      {isLoading ? (
                        <div className="p-6 text-center text-xs text-zinc-400">Loading backups...</div>
                      ) : backupsList.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                          No workspace backups found in Google Drive yet.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {backupsList.map((b) => (
                            <div
                              key={b.id}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                            >
                              <div>
                                <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                  {b.name}
                                </div>
                                <div className="text-[10px] text-zinc-400">
                                  {new Date(b.modifiedTime).toLocaleString()}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRestoreBackup(b)}
                                className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md transition-colors"
                              >
                                <DownloadCloud size={13} />
                                <span>Restore</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Required Confirmation Modal for Destructive / Mutating Actions */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await confirmDialog.action();
        }}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};
