import React from 'react';
import { Info } from 'lucide-react';

export default function InfoTooltip({ title, lines }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Info size={16} /> {title}
      </div>
      <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {lines.map((line) => (
          <div key={line}>• {line}</div>
        ))}
      </div>
    </div>
  );
}
