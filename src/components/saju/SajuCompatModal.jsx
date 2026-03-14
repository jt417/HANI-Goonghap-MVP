import React, { useMemo } from 'react';
import { X, Heart, Sparkles, MessageCircle, Home, Shield, Star, Clipboard, Users, Zap, AlertTriangle } from 'lucide-react';
import { calculateCompatibility, COMPAT_CATEGORIES, SPOUSE_PALACE } from '../../lib/saju';

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
  destiny: Sparkles,
  love: Heart,
  communication: MessageCircle,
  household: Home,
  longevity: Shield,
};

const FRIENDLY_LABELS = {
  destiny: '타고난 인연',
  love: '로맨스·끌림',
  communication: '소통·이해',
  household: '생활·가치관',
  longevity: '장기 안정성',
};

function ScoreBar({ catMeta, catData }) {
  const Icon = CATEGORY_ICONS[catMeta.key];
  const s = catData.score;
  const label = FRIENDLY_LABELS[catMeta.key] || catMeta.label;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          {Icon && <Icon size={14} className="text-slate-400" />} {catMeta.emoji} {label}
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

/* ── Key Highlights ── */
function KeyHighlights({ compat }) {
  const { categories, stemHap, rawAnalysis } = compat;
  const items = [];

  if (stemHap?.hap) items.push({ good: true, text: '만나면 자연스럽게 끌리는 천생연분 조합' });
  if (categories.destiny.score >= 80) items.push({ good: true, text: '성격이 잘 맞아 대화가 편안한 사이' });
  if (categories.love.score >= 80) items.push({ good: true, text: '서로에게 강하게 끌리는 로맨틱 궁합' });
  if (categories.communication.score >= 75) items.push({ good: true, text: '소통이 잘 되어 오해가 적음' });
  if (categories.household.score >= 75) items.push({ good: true, text: '생활 패턴과 가치관이 비슷함' });
  if (categories.longevity.score >= 80) items.push({ good: true, text: '갈등 요소가 적어 오래 함께할 수 있음' });

  if (rawAnalysis?.spousePalace?.score >= 80) items.push({ good: true, text: '서로의 이상형에 가까운 상대' });
  if (rawAnalysis?.wonjin?.day) items.push({ good: false, text: '시간이 지나면 불만이 쌓일 수 있어 소통 필수' });
  if (categories.longevity.score < 50) items.push({ good: false, text: '갈등 소지가 있어 만남 후 피드백 확인 필요' });
  if (categories.love.score < 45) items.push({ good: false, text: '초반 끌림이 약할 수 있어 외모·조건이 관건' });

  if (items.length === 0) return null;

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-xs font-bold text-slate-700 mb-3">핵심 포인트</div>
      <div className="space-y-2">
        {items.slice(0, 6).map((item, i) => (
          <div key={i} className={`flex items-center gap-2.5 rounded-lg p-2 text-xs ${item.good ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <span className="font-bold text-sm">{item.good ? '✓' : '△'}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Spouse Palace Comparison ── */
function SpousePalaceCompare({ compat, memberA, memberB }) {
  const sp = compat.rawAnalysis?.spousePalace;
  if (!sp) return null;

  const nameB = memberB?.name || memberB?.id || '상대';

  return (
    <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
        <Users size={14} className="text-violet-600" />
        이상형 비교
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-violet-100 p-3">
          <div className="text-[10px] font-bold text-violet-600 mb-1">{memberA.name}이 원하는 상대</div>
          <div className="text-xs font-bold text-slate-800">{sp.palaceA.traits}</div>
          <div className="mt-1 text-[10px] text-slate-500">{sp.palaceA.type}</div>
          <div className="mt-1 text-[10px] text-violet-500">{sp.palaceA.ideal}</div>
        </div>
        <div className="rounded-xl bg-white border border-violet-100 p-3">
          <div className="text-[10px] font-bold text-violet-600 mb-1">{nameB}이 원하는 상대</div>
          <div className="text-xs font-bold text-slate-800">{sp.palaceB.traits}</div>
          <div className="mt-1 text-[10px] text-slate-500">{sp.palaceB.type}</div>
          <div className="mt-1 text-[10px] text-violet-500">{sp.palaceB.ideal}</div>
        </div>
      </div>
      {sp.detail && (
        <div className={`mt-3 rounded-lg p-2.5 text-[11px] ${sp.score >= 70 ? 'bg-emerald-50 text-emerald-700' : sp.score >= 55 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
          {sp.score >= 70 ? '✓' : sp.score >= 55 ? '△' : '✗'} {sp.detail}
        </div>
      )}
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
                HANI
              </div>
              궁합 리포트
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">두 사람의 궁합을 다각도로 분석합니다</p>
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
              <div className="text-[10px] text-slate-400">{memberA.id}</div>
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
                  <div className="text-[10px] text-slate-400">{memberB.id}</div>
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
                <div className="text-[10px] font-bold text-slate-500 tracking-wide mb-2">COMPATIBILITY SCORE</div>
                <div className="text-5xl font-black text-violet-900">{compat.totalScore}</div>
                <StarRating stars={compat.stars} />
                {compat.stemHap?.hap && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
                    <Sparkles size={12} /> 천생연분
                  </div>
                )}
                <div className="mx-auto mt-3 max-w-md text-sm leading-6 text-violet-800">{compat.comment}</div>
              </div>

              {/* Key Highlights */}
              <KeyHighlights compat={compat} />

              {/* 5 Category Scores */}
              <div className="mt-5 space-y-3">
                {COMPAT_CATEGORIES.map((catMeta) => (
                  <ScoreBar key={catMeta.key} catMeta={catMeta} catData={compat.categories[catMeta.key]} />
                ))}
              </div>

              {/* Spouse Palace Comparison */}
              <SpousePalaceCompare compat={compat} memberA={memberA} memberB={memberB} />

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

              {/* Caution: Negative Relations */}
              {compat.rawAnalysis?.branches?.relations?.filter((r) => !r.positive).length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-2">
                    <AlertTriangle size={14} /> 주의 사항
                  </div>
                  <div className="space-y-1">
                    {compat.rawAnalysis.branches.relations.filter((r) => !r.positive).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-amber-700">
                        <span>•</span> <span>{r.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wonjin Warning */}
              {compat.rawAnalysis?.wonjin?.any && (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 mb-1">
                    <Zap size={14} /> 장기 관계 주의
                  </div>
                  <p className="text-xs text-rose-700">
                    {compat.rawAnalysis.wonjin.day
                      ? '처음에는 좋지만 시간이 지나면 작은 불만이 쌓일 수 있는 관계입니다. 정기적인 대화 시간을 갖도록 안내하세요.'
                      : '양가 부모님 관계에서 미묘한 긴장이 있을 수 있습니다. 가족 행사 시 세심한 배려가 필요합니다.'}
                  </p>
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
