import React from 'react';
import StatusChip from '../common/StatusChip';

export default function MemberCard({ member, isSelected, onClick, reminder }) {
  const hasOverdue = !isSelected && reminder?.isOverdue;
  const borderColor = isSelected
    ? 'border-l-4 border-l-violet-500'
    : hasOverdue
      ? `border-l-4 ${reminder.urgency === 'high' ? 'border-l-rose-500' : 'border-l-amber-400'}`
      : 'border-l-4 border-l-transparent';

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50 last:border-b-0 ${borderColor} ${isSelected ? 'bg-violet-50/60' : 'bg-white'}`}
    >
      {member.photos?.length > 0 ? (
        <img src={member.photos[0]} alt="" className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-200 object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500">
          {member.name?.[0]}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900">{member.name}</span>
            <span className="text-xs text-slate-400">{member.age}세 {member.gender === 'M' ? '남' : '여'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              {Math.round(member.grade?.overallScore || 0)}
            </div>
            <StatusChip label={member.status} />
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 truncate">
          <span className="truncate">{member.job}</span>
          <span>·</span>
          <span className="shrink-0">{member.location}</span>
          <span>·</span>
          <span className="shrink-0">{member.lastContact}</span>
          {reminder?.isOverdue && (
            <span className="ml-1 shrink-0 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
              {reminder.daysOverdue}일 초과
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
