import React from 'react';
import { statusToneMap } from '../../lib/constants';

export default function StatusChip({ label }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusToneMap[label] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{label}</span>;
}
