import React, { useState } from 'react';
import { Sparkles, Heart, CheckCircle2, AlertTriangle } from 'lucide-react';
import GradeBadge from '../../common/GradeBadge';
import SajuCompatModal from '../../saju/SajuCompatModal';
import { ELEMENT_HANJA, STEM_ELEMENT, calculateCompatibility } from '../../../lib/saju';

const gradeLabels = { overall: '종합', wealth: '자산', appearance: '외모', family: '집안', career: '직업', age: '나이', lifestyle: '라이프' };

export default function AnalysisTab({ member, members }) {
  const [quickCompatTarget, setQuickCompatTarget] = useState(null);
  const [sajuCompatOpen, setSajuCompatOpen] = useState(false);
  const [sajuCompatB, setSajuCompatB] = useState(null);

  const quickCompat = member && quickCompatTarget
    ? calculateCompatibility(member, quickCompatTarget)
    : null;

  return (
    <div className="space-y-5">
      {/* Saju Quick View */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-900"><Sparkles size={16} /> 사주 궁합</div>
          <button
            onClick={() => { setSajuCompatB(quickCompatTarget); setSajuCompatOpen(true); }}
            className="flex items-center gap-1 rounded-lg bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-200"
          >
            상세 분석
          </button>
        </div>

        {member.saju?.dayMaster ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-indigo-200 bg-white px-2.5 py-0.5 font-bold text-indigo-800">
              일간 {member.saju.dayMaster} ({ELEMENT_HANJA[STEM_ELEMENT[member.saju.dayMaster]] || ''})
            </span>
            {member.saju.strength && (
              <span className={`rounded-full px-2.5 py-0.5 font-bold ${member.saju.strength.includes('신강') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                {member.saju.strengthLabel || member.saju.strength}
              </span>
            )}
            {member.saju.structure && (
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600">{member.saju.structure}</span>
            )}
            {member.saju.yongshin?.map((el) => (
              <span key={el} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600">용신 {ELEMENT_HANJA[el]}</span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400">사주 데이터가 없습니다. 생년월일시를 등록하세요.</div>
        )}

        {/* Quick compat target */}
        <div className="mt-3 border-t border-indigo-200/50 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-700">궁합 대상:</span>
            <select
              value={quickCompatTarget?.id || ''}
              onChange={(e) => {
                const m = members.find((x) => x.id === e.target.value);
                setQuickCompatTarget(m || null);
              }}
              className="flex-1 rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs outline-none focus:border-violet-400"
            >
              <option value="">회원 선택...</option>
              {members.filter((m) => m.id !== member.id && m.saju?.pillars).map((m) => (
                <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
              ))}
            </select>
          </div>

          {quickCompat ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2">
                <div className="text-xs font-bold text-indigo-900">종합 점수</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-black text-violet-700">{quickCompat.totalScore}</div>
                  <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <span key={i} className={`text-sm ${i <= quickCompat.stars ? 'text-amber-400' : 'text-slate-200'}`}>★</span>)}</div>
                </div>
              </div>
              {[
                { label: '일간 궁합', score: quickCompat.analysis.dayMaster.score, icon: Heart },
                { label: '오행 상보성', score: quickCompat.analysis.elements.score, icon: CheckCircle2 },
                { label: '용신 호환', score: quickCompat.analysis.yongshin.score, icon: Sparkles },
                { label: '지지 관계', score: quickCompat.analysis.branches.score, icon: AlertTriangle },
              ].map(({ label, score, icon: Icon }) => {
                const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-violet-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
                const textColor = score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-violet-700' : score >= 40 ? 'text-amber-700' : 'text-rose-700';
                return (
                  <div key={label} className="rounded-lg bg-white/60 px-3 py-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-medium text-slate-700"><Icon size={10} /> {label}</span>
                      <span className={`font-bold ${textColor}`}>{score}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} /></div>
                  </div>
                );
              })}
              {quickCompat.analysis.branches.relations?.filter((r) => !r.positive).length > 0 && (
                <div className="rounded-lg bg-amber-50 px-3 py-1.5 text-[10px] text-amber-800">
                  <span className="font-bold">주의: </span>
                  {quickCompat.analysis.branches.relations.filter((r) => !r.positive).map((r) => r.detail).join(', ')}
                </div>
              )}
            </div>
          ) : quickCompatTarget ? (
            <div className="mt-3 text-center text-xs text-slate-400">사주 데이터 부족으로 궁합 분석이 불가합니다.</div>
          ) : null}
        </div>

        {member.saju?.profile && (
          <div className="mt-3 border-t border-indigo-200/50 pt-2">
            <p className="text-[10px] leading-4 text-indigo-800">{member.saju.profile}</p>
          </div>
        )}
      </div>

      {/* Grade Summary */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-amber-900">자동 스펙 랭킹</div>
            <div className="mt-1 text-xs text-amber-700">등록 데이터 기반 자동 점수화</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-700">종합 점수</div>
            <div className="text-3xl font-bold text-amber-900">{member.grade?.overallScore}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.grade?.badges?.map((badge) => <GradeBadge key={badge} label={badge} />)}
        </div>
      </div>

      {/* Grade Category Bars */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-bold text-slate-800 mb-4">카테고리별 분석</div>
        <div className="space-y-3">
          {['overall', 'wealth', 'appearance', 'family', 'career', 'age', 'lifestyle'].map((key) => {
            const cat = member.grade?.categories?.[key];
            if (!cat) return null;
            return (
              <div key={key} className="flex items-center gap-3">
                <div className="w-10 text-xs font-medium text-slate-500">{gradeLabels[key]}</div>
                <div className="flex-1 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-violet-500 transition-all" style={{ width: `${Math.min(cat.score, 100)}%` }} />
                </div>
                <div className="flex items-center gap-2 w-36 justify-end">
                  <span className="text-sm font-bold text-slate-900">{cat.score}</span>
                  <span className="text-xs text-violet-700">{cat.percentile}</span>
                  {cat.badge && <GradeBadge label={cat.badge} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saju Compat Modal */}
      {sajuCompatOpen && (
        <SajuCompatModal
          memberA={member}
          memberB={sajuCompatB}
          members={members}
          onClose={() => setSajuCompatOpen(false)}
          onChangeMemberB={setSajuCompatB}
        />
      )}
    </div>
  );
}
