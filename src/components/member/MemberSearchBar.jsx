import React from 'react';
import { Search, XCircle } from 'lucide-react';

export default function MemberSearchBar({ value, onChange }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Escape' && onChange('')}
        placeholder="이름, ID, 직업, 지역으로 검색..."
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2">
          <XCircle size={16} className="text-slate-400 hover:text-slate-600" />
        </button>
      )}
    </div>
  );
}
