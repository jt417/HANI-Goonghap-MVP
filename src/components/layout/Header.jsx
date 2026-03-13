import React from 'react';
import { Search, Bell } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <div className="text-sm font-medium text-slate-600">현재 로그인: 이팀장 (매칭매니저)</div>
        <div className="text-xs text-slate-400">오늘 응답 필요 제안 4건 · 재검증 2건 · 분쟁 검토 1건</div>
      </div>
      <div className="flex items-center gap-4 text-slate-500">
        <button className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800"><Search size={18} /></button>
        <button className="relative rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800">
          <Bell size={18} />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
        </button>
      </div>
    </header>
  );
}
