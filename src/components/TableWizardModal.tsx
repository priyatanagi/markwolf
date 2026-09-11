import React, { useState } from 'react';
import {
  Table,
  X,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Sparkles,
  LayoutGrid,
} from 'lucide-react';

interface TableWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (tableMarkdown: string) => void;
}

type ColumnAlign = 'left' | 'center' | 'right';

interface ColumnConfig {
  header: string;
  align: ColumnAlign;
}

interface TablePreset {
  name: string;
  desc: string;
  cols: ColumnConfig[];
  sampleRows: string[][];
}

const PRESETS: TablePreset[] = [
  {
    name: 'Feature Comparison',
    desc: 'Compare plans or feature availability',
    cols: [
      { header: 'Feature', align: 'left' },
      { header: 'Starter', align: 'center' },
      { header: 'Pro', align: 'center' },
      { header: 'Enterprise', align: 'center' },
    ],
    sampleRows: [
      ['Live Markdown Editor', '✅ Yes', '✅ Yes', '✅ Yes'],
      ['Export PDF / Image', '✅ Yes', '✅ Yes', '✅ Yes'],
      ['Google Drive Cloud Sync', '❌ No', '✅ Yes', '✅ Yes'],
      ['E2E AES-256 Encryption', '❌ No', '✅ Yes', '✅ Dedicated HSM'],
    ],
  },
  {
    name: 'Pricing Matrix',
    desc: 'SaaS or product pricing plans',
    cols: [
      { header: 'Tier', align: 'left' },
      { header: 'Monthly', align: 'right' },
      { header: 'Annual (Save 20%)', align: 'right' },
      { header: 'Storage', align: 'center' },
    ],
    sampleRows: [
      ['Basic', '$0/mo', '$0/yr', '500 MB'],
      ['Professional', '$12/mo', '$115/yr', '50 GB'],
      ['Team Unlimited', '$29/mo', '$279/yr', 'Unlimited'],
    ],
  },
  {
    name: 'API Endpoint Specs',
    desc: 'Documentation for REST or GraphQL endpoints',
    cols: [
      { header: 'Method', align: 'center' },
      { header: 'Endpoint', align: 'left' },
      { header: 'Auth Required', align: 'center' },
      { header: 'Description', align: 'left' },
    ],
    sampleRows: [
      ['`GET`', '`/api/docs`', 'Bearer Token', 'List all documents in workspace'],
      ['`POST`', '`/api/docs`', 'Bearer Token', 'Create new markdown document'],
      ['`PUT`', '`/api/docs/:id`', 'Bearer Token', 'Update document content & tags'],
      ['`DELETE`', '`/api/docs/:id`', 'Bearer Token', 'Permanently remove document'],
    ],
  },
  {
    name: 'Project Roadmap',
    desc: 'Milestones, tasks, and deadlines',
    cols: [
      { header: 'Task / Feature', align: 'left' },
      { header: 'Owner', align: 'left' },
      { header: 'Priority', align: 'center' },
      { header: 'Status', align: 'center' },
    ],
    sampleRows: [
      ['Sentence Auto-Capitalization', 'Design Team', 'High', '✅ Completed'],
      ['Table Creation Wizard', 'Engineering', 'High', '✅ Completed'],
      ['Emoji & Icon Picker', 'UI/UX', 'Medium', '✅ Completed'],
      ['Code Snippet Selector', 'Core Team', 'High', '✅ Completed'],
    ],
  },
];

export const TableWizardModal: React.FC<TableWizardModalProps> = ({
  isOpen,
  onClose,
  onInsertTable,
}) => {
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { header: 'Column 1', align: 'left' },
    { header: 'Column 2', align: 'center' },
    { header: 'Column 3', align: 'right' },
  ]);
  const [rowCount, setRowCount] = useState<number>(3);
  const [hoveredGrid, setHoveredGrid] = useState<{ c: number; r: number } | null>(null);

  if (!isOpen) return null;

  // Grid hover dimensions: 6 cols x 6 rows
  const handleGridHover = (col: number, row: number) => {
    setHoveredGrid({ c: col, r: row });
  };

  const handleGridClick = (col: number, row: number) => {
    const newCols: ColumnConfig[] = Array.from({ length: col }, (_, i) => ({
      header: columns[i]?.header || `Header ${i + 1}`,
      align: columns[i]?.align || 'left',
    }));
    setColumns(newCols);
    setRowCount(row);
  };

  const handleApplyPreset = (preset: TablePreset) => {
    setColumns(preset.cols);
    setRowCount(preset.sampleRows.length);
  };

  const handleAddColumn = () => {
    if (columns.length >= 10) return;
    setColumns((prev) => [
      ...prev,
      { header: `Column ${prev.length + 1}`, align: 'left' },
    ]);
  };

  const handleRemoveColumn = (index: number) => {
    if (columns.length <= 1) return;
    setColumns((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateHeader = (index: number, header: string) => {
    setColumns((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], header };
      return updated;
    });
  };

  const handleToggleAlign = (index: number, align: ColumnAlign) => {
    setColumns((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], align };
      return updated;
    });
  };

  const generateMarkdownTable = (): string => {
    // 1. Header row
    const headerRow = '| ' + columns.map((c) => c.header.trim() || 'Header').join(' | ') + ' |';

    // 2. Alignment row
    const alignRow =
      '| ' +
      columns
        .map((c) => {
          switch (c.align) {
            case 'center':
              return ':---:';
            case 'right':
              return '---:';
            case 'left':
            default:
              return ':---';
          }
        })
        .join(' | ') +
      ' |';

    // 3. Body rows
    const bodyRows: string[] = [];
    for (let r = 1; r <= rowCount; r++) {
      const cells = columns.map((c, i) => `Data ${r}, Col ${i + 1}`);
      bodyRows.push('| ' + cells.join(' | ') + ' |');
    }

    return '\n' + [headerRow, alignRow, ...bodyRows].join('\n') + '\n\n';
  };

  const handleInsert = () => {
    const tableMd = generateMarkdownTable();
    onInsertTable(tableMd);
    onClose();
  };

  return (
    <div
      id="table-wizard-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        id="table-wizard-modal"
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Table size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Table Creation Wizard
              </h2>
              <p className="text-xs text-zinc-500">
                Configure columns, alignments, rows, or select ready templates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick interactive grid selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-1">
                <LayoutGrid size={13} />
                <span>Interactive Dimension Picker</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Hover to select grid size ({hoveredGrid ? `${hoveredGrid.c} × ${hoveredGrid.r}` : `${columns.length} × ${rowCount}`})
              </p>
            </div>

            <div
              className="grid grid-cols-6 gap-1 p-1.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"
              onMouseLeave={() => setHoveredGrid(null)}
            >
              {Array.from({ length: 5 }, (_, r) =>
                Array.from({ length: 6 }, (_, c) => {
                  const colIdx = c + 1;
                  const rowIdx = r + 1;
                  const isHovered =
                    hoveredGrid && colIdx <= hoveredGrid.c && rowIdx <= hoveredGrid.r;
                  const isCurrent =
                    !hoveredGrid && colIdx <= columns.length && rowIdx <= rowCount;

                  return (
                    <div
                      key={`${colIdx}-${rowIdx}`}
                      onMouseEnter={() => handleGridHover(colIdx, rowIdx)}
                      onClick={() => handleGridClick(colIdx, rowIdx)}
                      className={`w-5 h-5 rounded-xs cursor-pointer transition-colors ${
                        isHovered
                          ? 'bg-blue-500'
                          : isCurrent
                          ? 'bg-blue-300 dark:bg-blue-700'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Template Presets */}
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
              <Sparkles size={13} className="text-amber-500" />
              <span>Table Presets</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2.5 text-left rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 hover:border-blue-400 hover:bg-blue-50/40 dark:hover:bg-zinc-800/60 transition-all text-xs"
                >
                  <div className="font-medium text-zinc-900 dark:text-zinc-100">
                    {preset.name}
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Column Customizer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Columns Configuration ({columns.length} columns)
              </label>
              <button
                type="button"
                onClick={handleAddColumn}
                disabled={columns.length >= 8}
                className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 disabled:opacity-40 transition-colors"
              >
                <Plus size={12} />
                <span>Add Column</span>
              </button>
            </div>

            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 text-xs"
                >
                  <span className="w-5 text-center font-mono text-[11px] text-zinc-400">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={col.header}
                    onChange={(e) => handleUpdateHeader(idx, e.target.value)}
                    placeholder={`Header ${idx + 1}`}
                    className="flex-1 px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
                  />

                  {/* Alignment buttons */}
                  <div className="flex items-center bg-zinc-200/60 dark:bg-zinc-800 rounded p-0.5">
                    <button
                      type="button"
                      title="Align Left"
                      onClick={() => handleToggleAlign(idx, 'left')}
                      className={`p-1 rounded ${
                        col.align === 'left'
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      <AlignLeft size={13} />
                    </button>
                    <button
                      type="button"
                      title="Align Center"
                      onClick={() => handleToggleAlign(idx, 'center')}
                      className={`p-1 rounded ${
                        col.align === 'center'
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      <AlignCenter size={13} />
                    </button>
                    <button
                      type="button"
                      title="Align Right"
                      onClick={() => handleToggleAlign(idx, 'right')}
                      className={`p-1 rounded ${
                        col.align === 'right'
                          ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                          : 'text-zinc-500'
                      }`}
                    >
                      <AlignRight size={13} />
                    </button>
                  </div>

                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveColumn(idx)}
                      className="p-1 text-zinc-400 hover:text-red-500 rounded transition-colors"
                      title="Delete Column"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Row Count Control */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Data Rows Count
              </div>
              <div className="text-[11px] text-zinc-400">
                Number of data rows to generate
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRowCount(Math.max(1, rowCount - 1))}
                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                -
              </button>
              <span className="w-8 text-center font-mono text-xs font-medium">
                {rowCount}
              </span>
              <button
                type="button"
                onClick={() => setRowCount(Math.min(25, rowCount + 1))}
                className="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Live Preview
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50 dark:bg-zinc-950/40">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/60">
                    {columns.map((c, i) => (
                      <th
                        key={i}
                        className={`p-2 font-semibold text-zinc-800 dark:text-zinc-200 ${
                          c.align === 'center'
                            ? 'text-center'
                            : c.align === 'right'
                            ? 'text-right'
                            : 'text-left'
                        }`}
                      >
                        {c.header || `Col ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: Math.min(rowCount, 3) }, (_, r) => (
                    <tr
                      key={r}
                      className="border-b border-zinc-200 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400"
                    >
                      {columns.map((c, i) => (
                        <td
                          key={i}
                          className={`p-2 ${
                            c.align === 'center'
                              ? 'text-center'
                              : c.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          }`}
                        >
                          Data {r + 1}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rowCount > 3 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        className="p-1.5 text-center text-[10px] text-zinc-400 font-mono italic"
                      >
                        ... +{rowCount - 3} more row(s)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50">
          <span className="text-xs text-zinc-500 font-mono">
            {columns.length} cols × {rowCount} rows
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-insert-table-wizard"
              type="button"
              onClick={handleInsert}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <Check size={14} />
              <span>Insert Table</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
