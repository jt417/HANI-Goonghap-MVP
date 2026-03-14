import React from 'react';
import Badge from '../common/Badge';
import GradeBadge from '../common/GradeBadge';
import { memberStatusOptions } from '../../lib/constants';

export default function MemberDetailHeader({ member, onStatusChange }) {
  const highestBadge = member.grade?.badges?.[0];

  return (
    <div className="border-b border-slate-200 bg-white px-6 pt-5 pb-4">
      <div className="flex items-start gap-4">
        {member.photos?.length > 0 ? (
          <img src={member.photos[0]} alt="" className="h-16 w-16 shrink-0 rounded-full border-2 border-violet-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-500">
            {member.name?.[0]}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
            <span className="text-sm text-slate-500">{member.age}세 · {member.gender === 'M' ? '남성' : '여성'}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge level={member.verifyLevel} />
            {highestBadge && <GradeBadge label={highestBadge} />}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-slate-400">종합 점수</div>
          <div className="text-3xl font-black text-violet-700">{member.grade?.overallScore}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {memberStatusOptions.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              member.status === s
                ? 'bg-violet-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
