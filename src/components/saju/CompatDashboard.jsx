import React, { useState } from 'react';
import {
  Heart, Brain, MessageCircle, Home, Leaf,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Clipboard, Sparkles, Star,
} from 'lucide-react';
import { generateBeginnerSummary, generateDetailedReport, COMPAT_CATEGORIES, ELEMENT_HANJA, STEM_ELEMENT } from '../../lib/saju';
import ElementChart from './ElementChart';

/* ── tier helpers ── */
function getTier(score) {
  if (score >= 85) return { label: '최상의 궁합', emoji: '💕', ring: 'stroke-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (score >= 75) return { label: '좋은 궁합', emoji: '💜', ring: 'stroke-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-800 border-violet-300' };
  if (score >= 65) return { label: '무난한 궁합', emoji: '👍', ring: 'stroke-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (score >= 50) return { label: '노력 필요', emoji: '🤝', ring: 'stroke-orange-500', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-800 border-orange-300' };
  return { label: '신중 검토', emoji: '⚠️', ring: 'stroke-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800 border-rose-300' };
}

function scoreColor20(s) {
  if (s >= 17) return 'text-emerald-700';
  if (s >= 14) return 'text-violet-700';
  if (s >= 11) return 'text-amber-600';
  return 'text-rose-600';
}
function barColor20(s) {
  if (s >= 17) return 'bg-emerald-500';
  if (s >= 14) return 'bg-violet-500';
  if (s >= 11) return 'bg-amber-500';
  return 'bg-rose-500';
}
function labelColor20(s) {
  if (s >= 17) return 'bg-emerald-100 text-emerald-700';
  if (s >= 14) return 'bg-violet-100 text-violet-700';
  if (s >= 11) return 'bg-amber-100 text-amber-700';
  return 'bg-rose-100 text-rose-700';
}
function gradeLabel20(s, inverted) {
  if (inverted) return s >= 17 ? '안정' : s >= 13 ? '주의' : s >= 9 ? '경고' : '위험';
  return s >= 17 ? '최상' : s >= 14 ? '양호' : s >= 11 ? '보통' : '부족';
}

const CATEGORY_ICONS = {
  destiny: Sparkles,
  love: Heart,
  communication: MessageCircle,
  household: Home,
  longevity: Leaf,
};

/* ── SVG Circular Gauge ── */
function ScoreRing({ score, tier }) {
  const size = 140;
  const strokeWidth = 11;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          className={tier.ring} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-black ${tier.text}`}>{score}</span>
        <span className="text-[10px] text-slate-400 font-medium">/ 100</span>
      </div>
    </div>
  );
}

/* ── Star Rating ── */
function StarRating({ stars }) {
  return (
    <div className="flex justify-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={16} className={i <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
      ))}
    </div>
  );
}

/* ── Category Card (20점 만점) with expandable detail ── */
function CategoryCard({ catMeta, catData, score20, expanded, onToggle }) {
  const Icon = CATEGORY_ICONS[catMeta.key];
  const s = catData.score; // 0-100 internal
  const s20 = score20;
  const isConflict = catMeta.inverted;

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={onToggle} className="w-full py-3 px-1 flex items-center gap-3 hover:bg-slate-50/50 transition rounded-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">{catMeta.emoji} {catMeta.label}</span>
              <span className="text-[9px] text-slate-400 font-medium">{catMeta.hanja}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${labelColor20(s20)}`}>
                {gradeLabel20(s20, isConflict)}
              </span>
              <span className={`text-base font-black ${scoreColor20(s20)}`}>{s20}</span>
              <span className="text-[10px] text-slate-400 font-medium">/ 20</span>
              {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </div>
          </div>
          {/* 20점 바 */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-sm transition-all duration-500 ${i < s20 ? barColor20(s20) : 'bg-slate-100'}`}
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 text-left truncate">{catMeta.getDesc(s)}</p>
        </div>
      </button>

      {expanded && (
        <div className="pb-3 px-1 ml-12 animate-in fade-in slide-in-from-top-1">
          <div className="rounded-lg bg-slate-50 p-3 space-y-1.5">
            {catData.details.map((d, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] leading-4 text-slate-700">
                <span className="mt-0.5 shrink-0">•</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 rounded-lg border border-indigo-100 bg-indigo-50 p-2.5">
            <div className="text-[10px] font-bold text-indigo-700 mb-1">💡 매니저 가이드</div>
            <p className="text-[11px] leading-4 text-indigo-800">{catMeta.getAdvice(s)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Detailed Report Section ── */
function DetailedReportSection({ sections }) {
  if (!sections || sections.length === 0) return null;

  const sectionStyles = {
    '💘': { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-800', bullet: 'text-rose-700' },
    '💑': { bg: 'bg-violet-50', border: 'border-violet-200', title: 'text-violet-800', bullet: 'text-violet-700' },
    '🗣️': { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', bullet: 'text-blue-700' },
    '📋': { bg: 'bg-slate-50', border: 'border-slate-200', title: 'text-slate-800', bullet: 'text-slate-700' },
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-sm font-bold text-slate-800">연애·부부 궁합 상세 리포트</span>
        <span className="text-[10px] text-slate-400">50년 전문가 분석</span>
      </div>
      {sections.map((section) => {
        const style = sectionStyles[section.emoji] || sectionStyles['📋'];
        return (
          <div key={section.title} className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${style.title} mb-3`}>
              <span className="text-base">{section.emoji}</span>
              {section.title}
            </div>
            <ul className="space-y-2.5">
              {section.bullets.map((bullet, i) => (
                <li key={i} className={`flex items-start gap-2 text-[12px] leading-5 ${style.bullet}`}>
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/* ── Simple (no pillars) Fallback Dashboard ── */
function SimpleDashboard({ score, sajuProfile, chemistryNote, risks }) {
  const tier = getTier(score);
  const stars = score >= 90 ? 5 : score >= 75 ? 4 : score >= 60 ? 3 : score >= 45 ? 2 : 1;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white tracking-wider">
          ✦ HANI 사주 궁합 ✦
        </div>
      </div>
      <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 text-center`}>
        <ScoreRing score={score} tier={tier} />
        <StarRating stars={stars} />
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold ${tier.badge}`}>
          {tier.emoji} {tier.label}
        </div>
        {sajuProfile && <p className="mt-3 text-xs leading-5 text-slate-600 max-w-xs mx-auto">{sajuProfile}</p>}
      </div>

      {(chemistryNote || (risks && risks.length > 0)) && (
        <div className="grid grid-cols-2 gap-2.5">
          {chemistryNote && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                <CheckCircle2 size={13} /> 좋은 점
              </div>
              <p className="text-[11px] leading-4 text-emerald-800">• {chemistryNote}</p>
            </div>
          )}
          {risks && risks.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2">
                <AlertTriangle size={13} /> 참고할 점
              </div>
              {risks.map((r, i) => (
                <p key={i} className="text-[11px] leading-4 text-amber-800">• {r}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN: CompatDashboard — HANI 사주 궁합 (5차원 × 20점)
   ════════════════════════════════════════════════════════════ */
export default function CompatDashboard({ memberA, memberB, compatResult }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [showExpert, setShowExpert] = useState(false);

  const hasFullData = Boolean(compatResult);

  if (!hasFullData) {
    return (
      <SimpleDashboard
        score={memberB?.scores?.saju || 0}
        sajuProfile={memberB?.sajuProfile}
        chemistryNote={memberB?.chemistryNote}
        risks={memberB?.risks}
      />
    );
  }

  const { totalScore, score20, stars, comment, categories, managerAdvice, stemHap, tenGodRelation } = compatResult;
  const tier = getTier(totalScore);
  const detailedReport = generateDetailedReport(compatResult, memberA, memberB);

  const toggleCat = (key) => setExpandedCat((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-4">
      {/* ── HANI 브랜딩 헤더 ── */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white tracking-wider">
          ✦ HANI 사주 궁합 ✦
        </div>
      </div>

      {/* ── 종합 점수 ── */}
      <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 text-center`}>
        <div className="text-[10px] font-bold text-slate-500 mb-2 tracking-wide">COMPATIBILITY SCORE</div>
        <ScoreRing score={totalScore} tier={tier} />
        <StarRating stars={stars} />
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold ${tier.badge}`}>
          {tier.emoji} {tier.label}
        </div>
        {stemHap?.hap && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
            <Sparkles size={12} /> 천생연분 — {stemHap.label}
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-600 max-w-sm mx-auto">{comment}</p>
      </div>

      {/* ── 5차원 궁합 점수 (20점 × 5) ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">항목별 궁합</span>
            <span className="text-[10px] text-slate-400">20점 × 5항목 = 100점</span>
          </div>
          {/* 5개 요약 뱃지 */}
          <div className="flex gap-1">
            {COMPAT_CATEGORIES.map((cat) => {
              const s = score20[cat.key];
              return (
                <div key={cat.key} className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-bold ${labelColor20(s)}`}>
                  {cat.emoji}<span>{s}</span>
                </div>
              );
            })}
          </div>
        </div>
        {COMPAT_CATEGORIES.map((catMeta) => (
          <CategoryCard
            key={catMeta.key}
            catMeta={catMeta}
            catData={categories[catMeta.key]}
            score20={score20[catMeta.key]}
            expanded={expandedCat === catMeta.key}
            onToggle={() => toggleCat(catMeta.key)}
          />
        ))}
      </div>

      {/* ── 연애·부부 궁합 상세 리포트 ── */}
      <DetailedReportSection sections={detailedReport} />

      {/* ── 좋은 점 / 주의 점 (요약) ── */}
      {(() => {
        const summary = generateBeginnerSummary(compatResult);
        if (!summary) return null;
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                <CheckCircle2 size={13} /> 이런 점이 좋아요
              </div>
              <ul className="space-y-1.5">
                {summary.goodPoints.map((p, i) => (
                  <li key={i} className="text-[11px] leading-4 text-emerald-800">• {p}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-2">
                <AlertTriangle size={13} /> 참고할 점
              </div>
              <ul className="space-y-1.5">
                {summary.cautionPoints.map((p, i) => (
                  <li key={i} className="text-[11px] leading-4 text-amber-800">• {p}</li>
                ))}
              </ul>
            </div>
          </div>
        );
      })()}

      {/* ── 전문가 상세 토글 (오행·지지) ── */}
      <button
        onClick={() => setShowExpert((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
      >
        {showExpert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showExpert ? '간단히 보기' : '전문가 분석 보기 (오행·십신·지지 상세)'}
      </button>

      {showExpert && (
        <div className="space-y-3 animate-in fade-in">
          {/* 십신 관계 */}
          {tenGodRelation && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-700 mb-2">십신(十神) 관계</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-[10px] text-slate-400">{memberA?.name} → 상대</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{tenGodRelation.aToB}</div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 text-center">
                  <div className="text-[10px] text-slate-400">상대 → {memberA?.name}</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{tenGodRelation.bToA}</div>
                </div>
              </div>
            </div>
          )}

          {/* Element comparison */}
          <div className="grid grid-cols-2 gap-2.5">
            {memberA?.saju?.elements && (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-[10px] font-bold text-slate-500">{memberA.name} 오행</div>
                <ElementChart elements={memberA.saju.elements} compact />
              </div>
            )}
            {memberB?.saju?.elements && (
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 text-[10px] font-bold text-slate-500">
                  {memberB.name || memberB.id} 오행
                </div>
                <ElementChart elements={memberB.saju.elements} compact />
              </div>
            )}
          </div>

          {/* Branch relations detail */}
          {compatResult.rawAnalysis?.branches?.relations?.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-700 mb-2">지지 관계 상세</div>
              <div className="space-y-1.5">
                {compatResult.rawAnalysis.branches.relations.map((r, i) => (
                  <div key={i} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs ${r.positive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    <span className="font-bold">{r.positive ? '✓' : '✗'}</span>
                    <span className="font-medium">{r.type}</span>
                    <span className="text-slate-500">{r.detail}</span>
                    <span className="ml-auto text-[10px] font-bold">{r.score > 0 ? '+' : ''}{r.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day master detail */}
          {compatResult.rawAnalysis?.dayMaster?.detail && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-700 mb-1">일간 상세</div>
              <p className="text-[11px] text-slate-600 leading-5">{compatResult.rawAnalysis.dayMaster.detail}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
