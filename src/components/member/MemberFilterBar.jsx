import React from 'react';
import { memberStatusOptions } from '../../lib/constants';

export default function MemberFilterBar({
  showOnlyMine, setShowOnlyMine,
  statusFilter, setStatusFilter,
  sortBy, setSortBy,
  totalCount, myCount,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1">
        <button
          onClick={() => setShowOnlyMine(false)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${!showOnlyMine ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          전체 ({totalCount})
        </button>
        <button
          onClick={() => setShowOnlyMine(true)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${showOnlyMine ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          내 담당 ({myCount})
        </button>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400"
      >
        <option value="">상태 전체</option>
        {memberStatusOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-400"
      >
        <option value="name">이름순</option>
        <option value="grade">등급순</option>
        <option value="lastContact">최근접촉순</option>
        <option value="status">상태순</option>
      </select>
    </div>
  );
}
