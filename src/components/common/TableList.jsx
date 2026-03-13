import React from 'react';
import StatusChip from './StatusChip';

export default function TableList({ columns, rows, onRowClick, selectedRowId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}>
        {columns.map((col) => <div key={col.key}>{col.label}</div>)}
      </div>
      <div>
        {rows.map((row, idx) => (
          <button
            key={row.id || idx}
            onClick={() => onRowClick?.(row)}
            className={`grid w-full items-center border-b border-slate-100 px-5 py-4 text-left text-sm transition hover:bg-slate-50 ${selectedRowId === row.id ? 'bg-violet-50/60' : 'bg-white'}`}
            style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}
          >
            {columns.map((col) => (
              <div key={col.key} className="text-slate-700">
                {col.key === 'status' || col.key === 'level' ? <StatusChip label={row[col.key]} /> : row[col.key]}
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
