import React from 'react';
import { Info } from 'lucide-react';
import GradeBadge from '../common/GradeBadge';

export default function GradeScoreCard({ title, data, active, onClick, showHint = false }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? 'border-violet-300 bg-violet-50 ring-2 ring-violet-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</div>
        {showHint ? <Info size={14} className="text-slate-400" /> : null}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900">{data.score}</div>
        <GradeBadge label={data.badge} />
      </div>
      <div className="mt-2 text-sm font-medium text-violet-700">{data.percentile}</div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.min(data.score, 100)}%` }} />
      </div>
    </button>
  );
}
