import React from 'react';
import Badge from '../common/Badge';
import GradeBadge from '../common/GradeBadge';

export default function NetworkResultCard({ member, selected, onSelect, onToggleCompare, isCompared }) {
  const bars = [
    ['조건', member.scores.condition],
    ['가치관', member.scores.values],
    ['궁합', member.scores.saju],
    ['성사', member.scores.possibility],
  ];

  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm transition ${selected ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200 hover:border-violet-200'}`}>
      <div className="grid grid-cols-[100px_1fr_170px] gap-4">
        <div className="rounded-2xl bg-violet-50 p-4 text-center">
          <div className="text-xs text-slate-500">총합 점수</div>
          <div className="mt-1 text-3xl font-bold text-violet-700">{member.matchScore}</div>
          <div className="mt-1 text-xs text-violet-500">상위 추천군</div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-bold text-slate-900">{member.id}</div>
            <Badge level={member.verifyLevel} />
            <span className="text-sm text-slate-500">{member.agency}</span>
          </div>
          <div className="mt-2 text-sm text-slate-600">{member.ageRange} · {member.jobCategory} · {member.location}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.rankingBadges?.map((badge) => (<GradeBadge key={badge} label={badge} />))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {bars.map(([label, score]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>{label}</span><span className="font-bold text-slate-700">{score}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${score}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-medium text-slate-900">추천 이유</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.reason.map((r) => (<span key={r} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{r}</span>))}
            </div>
            <p className="mt-3 leading-6 text-violet-900">궁합 코멘트: {member.chemistryNote}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>최근 활동</span><b>{member.recentActivity}</b></div>
            <div className="mt-2 flex items-center justify-between"><span>응답률</span><b>{member.responseRate}</b></div>
            <div className="mt-2 flex items-center justify-between"><span>업체 신뢰</span><b>{member.trustScore}</b></div>
          </div>
          <button onClick={onSelect} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">상세 보기</button>
          <button onClick={onToggleCompare} className={`rounded-xl px-4 py-2 text-sm font-medium ${isCompared ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
            {isCompared ? '비교함 해제' : '비교함 추가'}
          </button>
          <button onClick={() => onSelect(true)} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">소개 제안</button>
        </div>
      </div>
    </div>
  );
}
