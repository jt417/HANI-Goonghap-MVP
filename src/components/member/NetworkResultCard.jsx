import React from 'react';
import Badge from '../common/Badge';
import GradeBadge from '../common/GradeBadge';
import { computeMatchGap } from '../../lib/matching';

function scoreBg(s) {
  if (s >= 90) return 'bg-emerald-500';
  if (s >= 80) return 'bg-violet-500';
  if (s >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

function scoreColor(s) {
  if (s >= 90) return 'text-emerald-700';
  if (s >= 80) return 'text-violet-700';
  if (s >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

const GAP_STYLES = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber:   'bg-amber-50 text-amber-700 border-amber-200',
  orange:  'bg-orange-50 text-orange-700 border-orange-200',
  rose:    'bg-rose-50 text-rose-700 border-rose-200',
};

export default function NetworkResultCard({ member, selected, onSelect, onToggleCompare, isCompared, myMember }) {
  const myScore = Math.round(myMember?.grade?.overallScore || 0);
  const candidateScore = member.matchScore;
  const myGender = myMember?.gender;

  /* ── 형평성 gap 계산 ── */
  const gapInfo = myScore > 0 ? computeMatchGap(myScore, candidateScore) : null;

  /* ── 남:여 비율 계산 ── */
  const maleScore = myGender === 'M' ? myScore : candidateScore;
  const femaleScore = myGender === 'F' ? myScore : candidateScore;
  const ratioTotal = maleScore + femaleScore || 1;
  const maleRatio = Math.round((maleScore / ratioTotal) * 100);
  const femaleRatio = 100 - maleRatio;

  const myBadge = myMember?.grade?.categories?.overall?.badge;
  const dominant = maleRatio > femaleRatio ? 'male' : maleRatio < femaleRatio ? 'female' : 'even';

  /* ── 3대 매칭 지표 ── */
  const metrics = [
    { label: '조건매칭', score: member.scores.condition },
    { label: '사주궁합', score: member.scores.saju },
    { label: '가치관', score: member.scores.values },
  ];

  /* ── 스펙 비교 행 ── */
  const specs = [
    { label: '나이', my: myMember?.age ? `${myMember.age}세` : '-', their: member.ageRange },
    { label: '키', my: myMember?.height ? `${myMember.height}cm` : '-', their: member.heightRange },
    { label: '체형', my: myMember?.bodyType || '-', their: member.bodyType || '-' },
    { label: '외모상', my: myMember?.faceType || '-', their: member.faceType || '-' },
    { label: '직업', my: myMember?.job || '-', their: member.jobCategory },
    { label: '소득', my: myMember?.income || '-', their: member.incomeRange },
    { label: '자산', my: myMember?.assets || '-', their: member.assetsRange || '-' },
    { label: '학력', my: myMember?.edu || '-', their: member.eduRange },
    { label: '지역', my: myMember?.location || '-', their: member.location },
  ];

  return (
    <div
      className={`rounded-2xl border bg-white shadow-sm transition cursor-pointer overflow-hidden
        ${selected ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200 hover:border-violet-200'}`}
      onClick={() => onSelect(false)}
    >
      {/* ═══ TOP: Dual Player Cards ═══ */}
      <div className="grid grid-cols-[1fr_100px_1fr]">
        {/* ── 내 회원 카드 (왼쪽) ── */}
        <div className={`relative p-3.5 text-center ${myGender === 'M' ? 'bg-gradient-to-br from-blue-50 to-blue-100/40' : 'bg-gradient-to-br from-rose-50 to-rose-100/40'}`}>
          <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${myGender === 'M' ? 'bg-blue-500' : 'bg-rose-400'}`}>
            {myGender === 'M' ? '♂' : '♀'}
          </div>
          <div className="mt-1.5 truncate text-xs font-bold text-slate-800">{myMember?.name || '미선택'}</div>
          <div className="text-[10px] text-slate-400">{myMember?.id}</div>
          <div className={`mt-1 text-3xl font-black leading-none ${scoreColor(myScore)}`}>{myScore}</div>
          {myBadge && (
            <span className="mt-1 inline-block rounded-full bg-violet-100/80 px-2 py-0.5 text-[9px] font-bold text-violet-700">
              {myBadge}
            </span>
          )}
        </div>

        {/* ── 스펙 비교 + 비율 (중앙) ── */}
        <div className="flex flex-col items-center justify-center border-x border-slate-100 bg-slate-50/80 px-1">
          <div className="text-[10px] font-black tracking-wider text-slate-500">스펙 비교</div>

          {/* 비율 숫자 */}
          <div className="mt-1.5 flex items-baseline gap-0.5">
            <span className={`text-base font-black ${dominant === 'male' ? 'text-blue-600' : 'text-blue-400'}`}>{maleRatio}</span>
            <span className="text-xs text-slate-300">:</span>
            <span className={`text-base font-black ${dominant === 'female' ? 'text-rose-500' : 'text-rose-300'}`}>{femaleRatio}</span>
          </div>

          {/* 비율 바 */}
          <div className="mt-1 flex h-2.5 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div
              className={`transition-all duration-500 ${dominant === 'male' ? 'bg-blue-500' : 'bg-blue-300'}`}
              style={{ width: `${maleRatio}%` }}
            />
            <div
              className={`transition-all duration-500 ${dominant === 'female' ? 'bg-rose-400' : 'bg-rose-300'}`}
              style={{ width: `${femaleRatio}%` }}
            />
          </div>
          <div className="mt-0.5 flex w-full justify-between px-0.5 text-[7px] font-bold text-slate-400">
            <span>♂남</span>
            <span>여♀</span>
          </div>

          {/* gap badge */}
          {gapInfo && (
            <div className={`mt-2 rounded-full border px-2 py-0.5 text-[9px] font-bold leading-tight ${GAP_STYLES[gapInfo.color]}`}>
              {gapInfo.direction === '상향' ? '▲' : gapInfo.direction === '하향' ? '▼' : '━'}
              {gapInfo.absGap > 3 ? ` ${gapInfo.absGap}` : ''} {gapInfo.label}
            </div>
          )}
        </div>

        {/* ── 상대 후보 카드 (오른쪽) ── */}
        <div className={`relative p-3.5 text-center ${member.gender === 'F' ? 'bg-gradient-to-bl from-rose-50 to-rose-100/40' : 'bg-gradient-to-bl from-blue-50 to-blue-100/40'}`}>
          <div className="flex items-center justify-center gap-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${member.gender === 'F' ? 'bg-rose-400' : 'bg-blue-500'}`}>
              {member.gender === 'F' ? '♀' : '♂'}
            </div>
            <Badge level={member.verifyLevel} />
          </div>
          <div className="mt-1.5 text-xs font-bold text-slate-800">{member.id}</div>
          <div className="text-[10px] text-slate-400">
            {member.agency}
            {member.source === 'self' && (
              <span className="ml-1 inline-block rounded bg-teal-100 px-1 py-px text-[8px] font-bold text-teal-700">개인등록</span>
            )}
          </div>
          <div className={`mt-1 text-3xl font-black leading-none ${scoreColor(candidateScore)}`}>{candidateScore}</div>
          {member.rankingBadges?.[0] && (
            <span className="mt-1 inline-block rounded-full bg-violet-100/80 px-2 py-0.5 text-[9px] font-bold text-violet-700">
              {member.rankingBadges[0]}
            </span>
          )}
        </div>
      </div>

      {/* ═══ 스펙 비교 테이블 (FM Style) ═══ */}
      <div className="border-t border-slate-100">
        {specs.map(({ label, my, their }, idx) => (
          <div
            key={label}
            className={`grid grid-cols-[1fr_48px_1fr] text-[11px] ${idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}
          >
            <div className={`truncate px-3 py-1.5 text-right font-medium ${myGender === 'M' ? 'text-blue-700' : 'text-rose-600'}`}>
              {my}
            </div>
            <div className="px-1 py-1.5 text-center font-bold text-slate-400">
              {label}
            </div>
            <div className={`truncate px-3 py-1.5 font-medium ${member.gender === 'F' ? 'text-rose-600' : 'text-blue-700'}`}>
              {their}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 3대 매칭 지표 ═══ */}
      <div className="grid grid-cols-3 border-t border-slate-100">
        {metrics.map(({ label, score }) => (
          <div
            key={label}
            className={`border-r border-slate-100 last:border-r-0 px-2 py-2.5 text-center ${
              score >= 90 ? 'bg-emerald-50/40' : ''
            }`}
          >
            <div className="text-[10px] font-medium text-slate-400">{label}</div>
            <div className={`text-xl font-black leading-tight ${scoreColor(score)}`}>{score}</div>
            <div className="mx-auto mt-1 h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-1.5 rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ═══ BOTTOM: 추천 + 업체 지표 + 액션 ═══ */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* 랭킹 배지 */}
            {member.rankingBadges?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {member.rankingBadges.map((badge) => (
                  <GradeBadge key={badge} label={badge} />
                ))}
              </div>
            )}

            {/* 추천 사유 */}
            <div className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 leading-5">
              <span className="font-medium text-slate-600">추천</span>{' '}
              {member.reason.join(' · ')}
            </div>

            {/* 업체 지표 + 태그 */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <div className="flex gap-2.5 text-[10px] text-slate-400">
                <span>활동 <b className="text-slate-600">{member.recentActivity}</b></span>
                <span>응답 <b className="text-slate-600">{member.responseRate}</b></span>
                <span>신뢰 <b className="text-slate-600">{member.trustScore}</b></span>
              </div>
              <div className="h-3 w-px bg-slate-200" />
              <div className="flex flex-wrap gap-1">
                {member.tags?.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex shrink-0 flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onToggleCompare}
              className={`rounded-xl px-3 py-2 text-[11px] font-medium transition ${
                isCompared
                  ? 'bg-slate-800 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {isCompared ? '비교 해제' : '비교 추가'}
            </button>
            <button
              onClick={() => onSelect(true)}
              className="rounded-xl bg-violet-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-violet-700"
            >
              소개 제안
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
