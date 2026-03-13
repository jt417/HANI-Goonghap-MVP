import React from 'react';
import { Crown, Trophy, Medal, Sparkles } from 'lucide-react';

export default function GradeBadge({ label }) {
  if (!label) return null;
  const map = {
    'TOP 0.1%': { cls: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-300', icon: Crown },
    'TOP 1%': { cls: 'bg-violet-100 text-violet-800 border-violet-200', icon: Trophy },
    'TOP 5%': { cls: 'bg-blue-100 text-blue-800 border-blue-200', icon: Medal },
    'TOP 10%': { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Sparkles },
  };
  const key = ['TOP 0.1%', 'TOP 1%', 'TOP 5%', 'TOP 10%'].find((k) => label.includes(k));
  if (!key) return <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{label}</span>;
  const { cls, icon: Icon } = map[key];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${cls}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}
