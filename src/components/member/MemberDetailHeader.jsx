import React from 'react';
import { Search, Lock } from 'lucide-react';
import Badge from '../common/Badge';
import GradeBadge from '../common/GradeBadge';
import useAppStore from '../../stores/appStore';

/* ── 상태 전환 규칙 (A-1/A-2) ── */
const STATUS_TRANSITIONS = {
  '신규 상담':    ['소개 가능', '보류', '탈퇴'],
  '소개 가능':    ['소개 진행중', '보류', '휴면', '탈퇴'],
  '소개 진행중':  ['매칭중', '소개 가능', '보류', '탈퇴'],
  '매칭중':       ['소개 진행중', '소개 가능', '보류', '탈퇴'],
  '성혼':         ['탈퇴'],  // 성혼은 파이프라인으로만 진입
  '보류':         ['소개 가능', '휴면', '탈퇴'],
  '휴면':         ['소개 가능', '탈퇴'],
  '탈퇴':         [],         // 탈퇴 후 복귀 불가
};

const DISPLAY_STATUSES = ['신규 상담', '소개 가능', '소개 진행중', '매칭중', '성혼', '보류', '휴면', '탈퇴'];

export default function MemberDetailHeader({ member, onStatusChange }) {
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const highestBadge = member.grade?.badges?.[0];
  const allowedNext = STATUS_TRANSITIONS[member.status] || [];

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
          <div className="text-3xl font-black text-violet-700">{member.grade?.overallScore ?? '-'}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {DISPLAY_STATUSES.map((s) => {
          const isCurrent = member.status === s;
          const isAllowed = allowedNext.includes(s);
          const isLocked = !isCurrent && !isAllowed;
          // 성혼은 파이프라인 전용 — 직접 선택 불가
          const isPipelineOnly = s === '성혼' && !isCurrent;

          return (
            <button
              key={s}
              disabled={isLocked || isPipelineOnly}
              title={
                isPipelineOnly ? '성혼은 프로필 탭의 성혼 파이프라인을 통해서만 전환됩니다' :
                isLocked ? `${member.status}에서 ${s}(으)로 전환할 수 없습니다` : ''
              }
              onClick={() => {
                if (isLocked || isPipelineOnly) return;
                if (isCurrent) return;
                if (s === '탈퇴' && !window.confirm(`${member.name} 회원을 탈퇴 처리하시겠습니까?`)) return;
                onStatusChange(s);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                isCurrent
                  ? s === '성혼' ? 'bg-rose-500 text-white' : s === '탈퇴' ? 'bg-slate-700 text-white' : 'bg-violet-600 text-white'
                  : isLocked || isPipelineOnly
                    ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                    : s === '탈퇴' ? 'bg-slate-50 text-slate-400 hover:bg-slate-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {(isLocked || isPipelineOnly) && !isCurrent && <Lock size={9} className="inline mr-0.5 -mt-px" />}
              {s}
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('network')}
          className="ml-auto flex items-center gap-1 rounded-full bg-indigo-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition"
        >
          <Search size={12} />
          매칭하기
        </button>
      </div>
    </div>
  );
}
