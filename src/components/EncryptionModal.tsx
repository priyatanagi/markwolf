import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { Doc } from '../types';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  doc: Doc;
  onEncrypt: (passphrase: string) => Promise<void>;
  onDecrypt: (passphrase: string) => Promise<void>;
  onRemoveEncryption: () => void;
  isUnlockingOnly?: boolean;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  doc,
  onEncrypt,
  onDecrypt,
  onRemoveEncryption,
  isUnlockingOnly = false,
}) => {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passphrase) {
      setError('Please enter a passphrase.');
      return;
    }

    if (!doc.isEncrypted && !isUnlockingOnly) {
      if (passphrase.length < 6) {
        setError('Passphrase must be at least 6 characters.');
        return;
      }
      if (passphrase !== confirmPassphrase) {
        setError('Passphrases do not match.');
        return;
      }

      try {
        setIsProcessing(true);
        await onEncrypt(passphrase);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Encryption failed.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Decrypting / Unlocking
      try {
        setIsProcessing(true);
        await onDecrypt(passphrase);
        onClose();
      } catch (err: any) {
        setError(err.message || 'Incorrect passphrase.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="encryption-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="encryption-modal-title"
        className="relative w-full max-w-md p-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
            {doc.isEncrypted ? <Lock size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 id="encryption-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {doc.isEncrypted
                ? isUnlockingOnly
                  ? 'Unlock Encrypted Document'
                  : 'Document Security'
                : 'Encrypt Document (AES-256)'}
            </h3>
            <p className="text-xs text-zinc-500">
              {doc.title || 'Untitled Document'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAction} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              {doc.isEncrypted ? 'Enter Passphrase' : 'Set Encryption Passphrase'}
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                id="input-encryption-passphrase"
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={doc.isEncrypted ? 'Your passphrase...' : 'At least 6 characters...'}
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {!doc.isEncrypted && (
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Confirm Passphrase
              </label>
              <div className="relative">
                <KeyRound
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  id="input-confirm-passphrase"
                  type="password"
                  value={confirmPassphrase}
                  onChange={(e) => setConfirmPassphrase(e.target.value)}
                  placeholder="Re-enter passphrase..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Client-side End-to-End Encryption with AES-GCM 256-bit and PBKDF2 (100,000 rounds). The passphrase is never transmitted or stored on any server.
          </div>

          <div className="flex items-center justify-between pt-2">
            {doc.isEncrypted && !isUnlockingOnly ? (
              <button
                type="button"
                onClick={onRemoveEncryption}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline"
              >
                Disable Encryption
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-submit-encryption"
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
              >
                {isProcessing
                  ? 'Processing...'
                  : doc.isEncrypted
                  ? 'Unlock Document'
                  : 'Encrypt Document'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
