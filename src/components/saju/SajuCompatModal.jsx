import React, { useMemo } from 'react';
import { X, Heart, Sparkles, Brain, MessageCircle, Home, Wallet, Zap, Star, Clipboard } from 'lucide-react';
import { calculateCompatibility, COMPAT_CATEGORIES, ELEMENT_HANJA, STEM_ELEMENT } from '../../lib/saju';
import ElementChart from './ElementChart';

/* ── helpers ── */
function barColor(s) {
  if (s >= 80) return 'bg-emerald-500';
  if (s >= 65) return 'bg-violet-500';
  if (s >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}
function barTextColor(s) {
  if (s >= 80) return 'text-emerald-700';
  if (s >= 65) return 'text-violet-700';
  if (s >= 50) return 'text-amber-700';
  return 'text-rose-700';
}

const CATEGORY_ICONS = {
  personality: Brain,
  romance: Heart,
  communication: MessageCircle,
  lifestyle: Home,
  financial: Wallet,
  conflict: Zap,
};

function ScoreBar({ catMeta, catData }) {
  const Icon = CATEGORY_ICONS[catMeta.key];
  const s = catData.score;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Icon size={14} className="text-slate-400" /> {catMeta.emoji} {catMeta.label}
          <span className="text-[10px] text-slate-400 font-normal">{catMeta.weight}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${s >= 75 ? 'bg-emerald-100 text-emerald-700' : s >= 55 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
            {catMeta.inverted ? (s >= 80 ? '안정' : s >= 60 ? '주의' : '위험') : (s >= 80 ? '최상' : s >= 65 ? '양호' : s >= 50 ? '보통' : '부족')}
          </span>
          <span className={`text-sm font-black ${barTextColor(s)}`}>{s}점</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor(s)} transition-all`} style={{ width: `${s}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">{catMeta.getDesc(s)}</p>
      {catData.details && catData.details.length > 0 && (
        <div className="mt-2 rounded-lg bg-slate-50 p-2.5 space-y-1">
          {catData.details.slice(0, 3).map((d, i) => (
            <p key={i} className="text-[10px] leading-4 text-slate-600">• {d}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ stars }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={18} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  );
}

export default function SajuCompatModal({ memberA, memberB, members, onClose, onChangeMemberB }) {
  const compat = useMemo(() => {
    if (!memberA || !memberB) return null;
    return calculateCompatibility(memberA, memberB);
  }, [memberA, memberB]);

  if (!memberA) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 px-6 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wider">
                ✦ HANI ✦
              </div>
              사주 궁합 리포트
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">만세력엔진 기반 6차원 정밀 궁합 분석</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={20} /></button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Member Selection */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700 ring-2 ring-indigo-200">
                {memberA.photos?.[0] ? <img src={memberA.photos[0]} alt="" className="h-14 w-14 rounded-full object-cover" /> : memberA.name[0]}
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">{memberA.name}</div>
              <div className="text-[10px] text-slate-400">{memberA.id} · {ELEMENT_HANJA[STEM_ELEMENT[memberA.saju?.dayMaster] || ''] || ''}일간</div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-100 to-pink-100 ring-2 ring-rose-200">
              <Heart size={18} className="text-rose-500" />
            </div>

            <div className="text-center">
              {memberB ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700 ring-2 ring-violet-200">
                    {memberB.photos?.[0] ? <img src={memberB.photos[0]} alt="" className="h-14 w-14 rounded-full object-cover" /> : (memberB.name || memberB.id || '?')[0]}
                  </div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{memberB.name || `${memberB.agency || ''} ${memberB.ageRange || ''}`.trim() || memberB.id}</div>
                  <div className="text-[10px] text-slate-400">{memberB.id} · {ELEMENT_HANJA[STEM_ELEMENT[memberB.saju?.dayMaster] || ''] || ''}일간</div>
                </>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400">?</div>
              )}
            </div>
          </div>

          {/* Member B Selector */}
          {members && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-xs text-slate-500">궁합 대상:</span>
              <select
                value={memberB?.id || ''}
                onChange={(e) => {
                  const m = members.find((x) => x.id === e.target.value);
                  if (m) onChangeMemberB(m);
                }}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400"
              >
                <option value="">회원 선택...</option>
                {members.filter((m) => m.id !== memberA.id && m.saju?.pillars).map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                ))}
              </select>
            </div>
          )}

          {compat ? (
            <>
              {/* Total Score */}
              <div className="mt-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 text-center">
                <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2">HANI COMPATIBILITY SCORE</div>
                <div className="text-5xl font-black text-violet-900">{compat.totalScore}</div>
                <StarRating stars={compat.stars} />
                {compat.stemHap?.hap && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
                    <Sparkles size={12} /> 천생연분 — {compat.stemHap.label}
                  </div>
                )}
                <div className="mx-auto mt-3 max-w-md text-sm leading-6 text-violet-800">{compat.comment}</div>
              </div>

              {/* 6 Category Scores */}
              <div className="mt-5 space-y-3">
                {COMPAT_CATEGORIES.map((catMeta) => (
                  <ScoreBar key={catMeta.key} catMeta={catMeta} catData={compat.categories[catMeta.key]} />
                ))}
              </div>

              {/* Manager Advice */}
              {compat.managerAdvice && compat.managerAdvice.length > 0 && (
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-2">
                    <Clipboard size={14} /> 매니저 상담 가이드
                  </div>
                  <ul className="space-y-1.5">
                    {compat.managerAdvice.map((p, i) => (
                      <li key={i} className="text-xs leading-5 text-indigo-800">💡 {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Side-by-side Element Charts */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-bold text-slate-600">{memberA.name} 오행</div>
                  <ElementChart elements={memberA.saju.elements} compact />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 text-xs font-bold text-slate-600">{memberB.name || `${memberB.agency || ''} ${memberB.ageRange || ''}`.trim() || memberB.id} 오행</div>
                  <ElementChart elements={memberB.saju.elements} compact />
                </div>
              </div>

              {/* Ten God Relation */}
              {compat.tenGodRelation && (
                <div className="mt-3 rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-bold text-slate-700 mb-2">십신(十神) 관계</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400">{memberA.name} → 상대</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{compat.tenGodRelation.aToB}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2.5 text-center">
                      <div className="text-[10px] text-slate-400">상대 → {memberA.name}</div>
                      <div className="text-sm font-bold text-slate-800 mt-0.5">{compat.tenGodRelation.bToA}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Negative Relations Warning */}
              {compat.rawAnalysis?.branches?.relations?.filter((r) => !r.positive).length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                    <Zap size={14} /> 지지 충돌 상세
                  </div>
                  <div className="space-y-1">
                    {compat.rawAnalysis.branches.relations.filter((r) => !r.positive).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
                        <span>•</span> <span className="font-medium">{r.type}</span> <span>{r.detail}</span>
                        <span className="ml-auto text-[10px] font-bold text-rose-600">{r.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : memberB ? (
            <div className="mt-8 text-center text-sm text-slate-400">
              사주 데이터가 충분하지 않아 궁합을 분석할 수 없습니다.
            </div>
          ) : (
            <div className="mt-8 text-center text-sm text-slate-400">
              궁합 대상 회원을 선택하세요.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">닫기</button>
        </div>
      </div>
    </div>
  );
}
