import React, { useState } from 'react';
import { History, Clock, RotateCcw, X, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Doc, DocHistory } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoc: Doc;
  history: DocHistory[];
  onRestore: (snapshot: DocHistory) => void;
  onCreateCheckpoint: (note?: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  currentDoc,
  history,
  onRestore,
  onCreateCheckpoint,
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(
    history[0]?.id || null
  );
  const [newCheckpointNote, setNewCheckpointNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  if (!isOpen) return null;

  const selectedSnapshot = history.find((h) => h.id === selectedSnapshotId) || history[0];

  const handleCreateSnapshot = () => {
    onCreateCheckpoint(newCheckpointNote.trim() || undefined);
    setNewCheckpointNote('');
    setShowAddNote(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        id="history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-modal-title"
        className="relative w-full max-w-3xl h-[80vh] flex flex-col bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <History size={18} />
            </div>
            <div>
              <h3 id="history-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                Document Version History
              </h3>
              <p className="text-xs text-zinc-500">
                {currentDoc.title || 'Untitled'} · {history.length} snapshots recorded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-checkpoint"
              type="button"
              onClick={() => setShowAddNote(!showAddNote)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <PlusCircle size={14} />
              <span>Save Checkpoint</span>
            </button>
            <button
              id="btn-close-history"
              onClick={onClose}
              aria-label="Close"
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Checkpoint input bar */}
        {showAddNote && (
          <div className="px-6 py-3 bg-blue-50/50 dark:bg-blue-950/20 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={newCheckpointNote}
              onChange={(e) => setNewCheckpointNote(e.target.value)}
              placeholder="Checkpoint description (e.g. 'Finished section 2')..."
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:border-blue-500 text-zinc-900 dark:text-zinc-100"
            />
            <button
              onClick={handleCreateSnapshot}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Record Checkpoint
            </button>
          </div>
        )}

        {/* Body content: Split list & snapshot preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Snapshots list */}
          <div className="w-1/3 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-3 space-y-1.5 bg-zinc-50/50 dark:bg-zinc-950/40">
            {history.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">
                No checkpoints saved yet. Edit the document or click "Save Checkpoint" above.
              </div>
            ) : (
              history.map((snapshot) => {
                const isSelected = snapshot.id === selectedSnapshot?.id;
                return (
                  <button
                    key={snapshot.id}
                    onClick={() => setSelectedSnapshotId(snapshot.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800/80 border-blue-500 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(snapshot.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span>{new Date(snapshot.timestamp).toLocaleDateString()}</span>
                    </div>

                    <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {snapshot.note || snapshot.title || 'Revision'}
                    </div>

                    <div className="text-[11px] text-zinc-400 mt-1">
                      {snapshot.wordCount} words · {snapshot.charCount} chars
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Snapshot Content Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900">
            {selectedSnapshot ? (
              <>
                <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/20 text-xs">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Recorded on {new Date(selectedSnapshot.timestamp).toLocaleString()}
                  </span>
                  <button
                    id="btn-restore-version"
                    type="button"
                    onClick={() => {
                      onRestore(selectedSnapshot);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Restore This Version</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap bg-zinc-50/20 dark:bg-zinc-900/20">
                  {selectedSnapshot.content}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
                Select a checkpoint to view
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
