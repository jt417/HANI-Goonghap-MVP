import React from 'react';
import { Users, HeartHandshake, CalendarCheck, Bell } from 'lucide-react';

const cards = [
  { key: 'total', label: '전체 회원', icon: Users, tone: 'slate' },
  { key: 'available', label: '소개 가능', icon: HeartHandshake, tone: 'emerald' },
  { key: 'todayAction', label: '오늘 액션', icon: CalendarCheck, tone: 'violet' },
  { key: 'overdue', label: '리마인더 초과', icon: Bell, tone: 'rose' },
];

const toneStyles = {
  slate: 'bg-slate-100 text-slate-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  violet: 'bg-violet-100 text-violet-600',
  rose: 'bg-rose-100 text-rose-600',
};

export default function MemberStatsRibbon({ members, reminders }) {
  const counts = {
    total: members.length,
    available: members.filter((m) => m.status === '소개 가능').length,
    todayAction: members.filter((m) => m.nextAction?.includes('오늘')).length,
    overdue: reminders.length,
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {cards.map(({ key, label, icon: Icon, tone }) => (
        <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{counts[key]}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
