import React from 'react';
import { Star } from 'lucide-react';

export default function Badge({ level }) {
  const styles = {
    VIP: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border border-amber-300',
    Lv4: 'bg-blue-100 text-blue-800 border border-blue-200',
    Lv3: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Lv2: 'bg-slate-100 text-slate-700 border border-slate-200',
    Lv1: 'bg-slate-50 text-slate-500 border border-slate-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${styles[level]}`}>
      {level === 'VIP' && <Star size={11} fill="currentColor" />}
      {level} 인증
    </span>
  );
}
