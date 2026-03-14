import React, { useState } from 'react';
import {
  Heart, Brain, MessageCircle, Home, Shield,
  CheckCircle2, AlertTriangle, ChevronDown, ChevronUp,
  Clipboard, Sparkles, Star, Users, Zap, TrendingUp,
} from 'lucide-react';
import { generateBeginnerSummary, generateDetailedReport, COMPAT_CATEGORIES, ELEMENT_HANJA, STEM_ELEMENT, SPOUSE_PALACE } from '../../lib/saju';
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

// Manager-friendly category labels (no hanja)
const CATEGORY_ICONS = {
  destiny: Sparkles,
  love: Heart,
  communication: MessageCircle,
  household: Home,
  longevity: Shield,
};

const CATEGORY_LABEL_FRIENDLY = {
  destiny: '타고난 인연',
  love: '로맨스·끌림',
  communication: '소통·이해',
  household: '생활·가치관',
  longevity: '장기 안정성',
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

/* ── Category Card (20점 만점) ── */
function CategoryCard({ catMeta, catData, score20, expanded, onToggle }) {
  const Icon = CATEGORY_ICONS[catMeta.key];
  const s = catData.score;
  const s20 = score20;
  const isConflict = catMeta.inverted;
  const friendlyLabel = CATEGORY_LABEL_FRIENDLY[catMeta.key] || catMeta.label;

  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={onToggle} className="w-full py-3 px-1 flex items-center gap-3 hover:bg-slate-50/50 transition rounded-lg">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon size={16} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-bold text-slate-700">{catMeta.emoji} {friendlyLabel}</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${labelColor20(s20)}`}>
                {gradeLabel20(s20, isConflict)}
              </span>
              <span className={`text-base font-black ${scoreColor20(s20)}`}>{s20}</span>
              <span className="text-[10px] text-slate-400 font-medium">/ 20</span>
              {expanded ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-500 ${i < s20 ? barColor20(s20) : 'bg-slate-100'}`} />
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
            <div className="text-[10px] font-bold text-indigo-700 mb-1">💡 상담 팁</div>
            <p className="text-[11px] leading-4 text-indigo-800">{catMeta.getAdvice(s)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Match Highlights (핵심 포인트) ── */
function MatchHighlights({ compatResult }) {
  const { categories, stemHap, rawAnalysis } = compatResult;
  const highlights = [];

  // Positive highlights
  if (stemHap?.hap) highlights.push({ type: 'good', icon: Sparkles, text: '천생연분 궁합', desc: '만나면 자연스럽게 끌리는 조합' });
  if (categories.destiny.score >= 80) highlights.push({ type: 'good', icon: Users, text: '성격이 잘 맞음', desc: '편안하게 대화가 되는 사이' });
  if (categories.love.score >= 80) highlights.push({ type: 'good', icon: Heart, text: '강한 로맨틱 케미', desc: '서로에게 끌리는 힘이 강함' });
  if (categories.communication.score >= 75) highlights.push({ type: 'good', icon: MessageCircle, text: '소통이 잘 되는 커플', desc: '대화가 편안하고 이해가 빠름' });
  if (categories.household.score >= 75) highlights.push({ type: 'good', icon: Home, text: '생활 패턴이 비슷', desc: '가정 운영이 조화로움' });
  if (categories.longevity.score >= 80) highlights.push({ type: 'good', icon: Shield, text: '갈등이 적은 안정적 관계', desc: '오래도록 함께할 수 있는 궁합' });

  // From new analysis modules
  const shinsal = rawAnalysis?.shinsal;
  if (shinsal) {
    const allShinsal = [...(shinsal.memberA || []), ...(shinsal.memberB || [])];
    if (allShinsal.some((s) => s.name === '홍란살')) highlights.push({ type: 'good', icon: Star, text: '결혼 타이밍이 좋은 시기', desc: '혼인 운이 열려있는 만남' });
    if (allShinsal.filter((s) => s.name === '천을귀인').length >= 2) highlights.push({ type: 'good', icon: Star, text: '서로가 서로의 귀인', desc: '어려울 때 서로 도와주는 관계' });
  }

  if (rawAnalysis?.spousePalace?.score >= 80) highlights.push({ type: 'good', icon: Heart, text: '이상형에 가까운 상대', desc: '서로가 원하는 배우자상에 부합' });

  // Caution highlights
  if (categories.longevity.score < 50) highlights.push({ type: 'warn', icon: Zap, text: '갈등 소지 있음', desc: '소통 노력이 필요한 관계' });
  if (rawAnalysis?.wonjin?.day) highlights.push({ type: 'warn', icon: AlertTriangle, text: '시간이 지나면 불만이 쌓일 수 있음', desc: '정기적인 대화 시간이 중요' });
  if (categories.love.score < 50) highlights.push({ type: 'warn', icon: Heart, text: '로맨스가 느리게 발전', desc: '외모·조건 만족도가 관건' });

  if (highlights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-violet-600" />
        <span className="text-sm font-bold text-slate-800">궁합 핵심 포인트</span>
      </div>
      <div className="space-y-2">
        {highlights.slice(0, 6).map((h, i) => {
          const IconComp = h.icon;
          const isGood = h.type === 'good';
          return (
            <div key={i} className={`flex items-center gap-3 rounded-xl p-2.5 ${isGood ? 'bg-emerald-50 border border-emerald-100' : 'bg-amber-50 border border-amber-100'}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isGood ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                <IconComp size={14} className={isGood ? 'text-emerald-600' : 'text-amber-600'} />
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-bold ${isGood ? 'text-emerald-800' : 'text-amber-800'}`}>{h.text}</div>
                <div className={`text-[10px] ${isGood ? 'text-emerald-600' : 'text-amber-600'}`}>{h.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Spouse Palace (이상형 비교) ── */
function SpousePalaceSection({ rawAnalysis, memberA, memberB }) {
  const sp = rawAnalysis?.spousePalace;
  if (!sp) return null;

  const nameB = memberB?.name || memberB?.id || '상대';

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-violet-600" />
        <span className="text-sm font-bold text-slate-800">이상형 비교</span>
        <span className="text-[10px] text-slate-400">서로가 원하는 배우자상</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white border border-violet-100 p-3">
          <div className="text-[10px] font-bold text-violet-600 mb-1.5">{memberA?.name}이 원하는 상대</div>
          <div className="text-xs font-bold text-slate-800 mb-1">{sp.palaceA.traits}</div>
          <div className="text-[10px] text-slate-500 leading-4">{sp.palaceA.type}</div>
          <div className="mt-1.5 text-[10px] text-violet-500">{sp.palaceA.ideal}</div>
        </div>
        <div className="rounded-xl bg-white border border-violet-100 p-3">
          <div className="text-[10px] font-bold text-violet-600 mb-1.5">{nameB}이 원하는 상대</div>
          <div className="text-xs font-bold text-slate-800 mb-1">{sp.palaceB.traits}</div>
          <div className="text-[10px] text-slate-500 leading-4">{sp.palaceB.type}</div>
          <div className="mt-1.5 text-[10px] text-violet-500">{sp.palaceB.ideal}</div>
        </div>
      </div>
      {sp.detail && (
        <div className={`mt-3 rounded-lg p-2.5 text-[11px] leading-4 ${sp.score >= 70 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : sp.score >= 55 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
          {sp.score >= 70 ? '✓' : sp.score >= 55 ? '△' : '✗'} {sp.detail}
        </div>
      )}
    </div>
  );
}

/* ── Special Indicators (특이사항 뱃지) ── */
function SpecialIndicators({ rawAnalysis, memberA, memberB }) {
  const badges = [];
  const shinsal = rawAnalysis?.shinsal;
  const nameB = memberB?.name || memberB?.id || '상대';

  if (shinsal) {
    // Member A
    for (const s of (shinsal.memberA || [])) {
      if (s.name === '도화살') badges.push({ label: `${memberA?.name} 이성 매력 높음`, tone: 'rose', desc: s.marriage });
      if (s.name === '천을귀인') badges.push({ label: `${memberA?.name} 좋은 인연 체질`, tone: 'indigo', desc: s.marriage });
      if (s.name === '고란살') badges.push({ label: `${memberA?.name} 만혼 성향`, tone: 'amber', desc: s.marriage });
      if (s.name === '역마살') badges.push({ label: `${memberA?.name} 활동적 성향`, tone: 'sky', desc: s.marriage });
    }
    // Member B
    for (const s of (shinsal.memberB || [])) {
      if (s.name === '도화살') badges.push({ label: `${nameB} 이성 매력 높음`, tone: 'rose', desc: s.marriage });
      if (s.name === '천을귀인') badges.push({ label: `${nameB} 좋은 인연 체질`, tone: 'indigo', desc: s.marriage });
      if (s.name === '고란살') badges.push({ label: `${nameB} 만혼 성향`, tone: 'amber', desc: s.marriage });
      if (s.name === '역마살') badges.push({ label: `${nameB} 활동적 성향`, tone: 'sky', desc: s.marriage });
    }
  }

  // Nayin
  if (rawAnalysis?.nayin) {
    const n = rawAnalysis.nayin;
    if (n.score >= 85) badges.push({ label: '인연의 흐름이 자연스러움', tone: 'emerald', desc: n.detail });
    else if (n.score <= 45) badges.push({ label: '기본 기운의 충돌', tone: 'amber', desc: n.detail });
  }

  // Life stages
  const dayStage = rawAnalysis?.dayLifeStage;
  if (dayStage?.memberA?.stage && ['관대', '건록', '제왕'].includes(dayStage.memberA.stage)) {
    badges.push({ label: `${memberA?.name} 결혼 적기`, tone: 'emerald', desc: dayStage.memberA.marriageNote });
  }
  if (dayStage?.memberB?.stage && ['관대', '건록', '제왕'].includes(dayStage.memberB.stage)) {
    badges.push({ label: `${nameB} 결혼 적기`, tone: 'emerald', desc: dayStage.memberB.marriageNote });
  }

  if (badges.length === 0) return null;

  const toneMap = {
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  // Deduplicate by label
  const seen = new Set();
  const unique = badges.filter((b) => { if (seen.has(b.label)) return false; seen.add(b.label); return true; });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-amber-500" />
        <span className="text-sm font-bold text-slate-800">특이사항</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {unique.slice(0, 8).map((b, i) => (
          <div key={i} className={`group relative rounded-lg border px-2.5 py-1.5 text-[11px] font-medium cursor-default ${toneMap[b.tone] || toneMap.amber}`}>
            {b.label}
            {b.desc && (
              <div className="absolute left-0 top-full z-10 mt-1 hidden w-56 rounded-lg border border-slate-200 bg-white p-2.5 text-[10px] leading-4 text-slate-600 shadow-lg group-hover:block">
                {b.desc}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Manager Advice Section ── */
function ManagerAdviceSection({ managerAdvice }) {
  if (!managerAdvice || managerAdvice.length === 0) return null;
  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-2.5">
        <Clipboard size={14} /> 매니저 상담 가이드
      </div>
      <ul className="space-y-2">
        {managerAdvice.map((p, i) => (
          <li key={i} className="flex items-start gap-2 text-xs leading-5 text-indigo-800">
            <span className="mt-0.5 shrink-0">💡</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
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
          HANI 궁합
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
   MAIN: CompatDashboard — HANI 사주 궁합 (매니저 친화형)
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

  const { totalScore, score20, stars, comment, categories, managerAdvice, stemHap, tenGodRelation, rawAnalysis } = compatResult;
  const tier = getTier(totalScore);

  const toggleCat = (key) => setExpandedCat((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-4">
      {/* ── 브랜딩 헤더 ── */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-1 text-[10px] font-bold text-white tracking-wider">
          HANI 궁합 분석
        </div>
      </div>

      {/* ── 종합 점수 ── */}
      <div className={`rounded-2xl border ${tier.border} ${tier.bg} p-5 text-center`}>
        <ScoreRing score={totalScore} tier={tier} />
        <StarRating stars={stars} />
        <div className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold ${tier.badge}`}>
          {tier.emoji} {tier.label}
        </div>
        {stemHap?.hap && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
            <Sparkles size={12} /> 천생연분
          </div>
        )}
        <p className="mt-3 text-xs leading-5 text-slate-600 max-w-sm mx-auto">{comment}</p>
      </div>

      {/* ── 궁합 핵심 포인트 ── */}
      <MatchHighlights compatResult={compatResult} />

      {/* ── 5항목 궁합 점수 ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-sm font-bold text-slate-800">항목별 궁합</span>
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

      {/* ── 이상형 비교 (배우자궁) ── */}
      <SpousePalaceSection rawAnalysis={rawAnalysis} memberA={memberA} memberB={memberB} />

      {/* ── 특이사항 뱃지 (신살·납음·운성) ── */}
      <SpecialIndicators rawAnalysis={rawAnalysis} memberA={memberA} memberB={memberB} />

      {/* ── 매니저 상담 가이드 ── */}
      <ManagerAdviceSection managerAdvice={managerAdvice} />

      {/* ── 좋은 점 / 참고할 점 요약 ── */}
      {(() => {
        const summary = generateBeginnerSummary(compatResult);
        if (!summary) return null;
        return (
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-2">
                <CheckCircle2 size={13} /> 잘 맞는 점
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

      {/* ── 상세 분석 토글 ── */}
      <button
        onClick={() => setShowExpert((v) => !v)}
        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 transition"
      >
        {showExpert ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showExpert ? '간단히 보기' : '상세 분석 보기'}
      </button>

      {showExpert && (
        <div className="space-y-3 animate-in fade-in">
          {/* 상세 리포트 */}
          {(() => {
            const detailedReport = generateDetailedReport(compatResult, memberA, memberB);
            if (!detailedReport) return null;
            const sectionStyles = {
              '💘': { bg: 'bg-rose-50', border: 'border-rose-200', title: 'text-rose-800', bullet: 'text-rose-700' },
              '💑': { bg: 'bg-violet-50', border: 'border-violet-200', title: 'text-violet-800', bullet: 'text-violet-700' },
              '🗣️': { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', bullet: 'text-blue-700' },
              '📋': { bg: 'bg-slate-50', border: 'border-slate-200', title: 'text-slate-800', bullet: 'text-slate-700' },
            };
            return (
              <div className="space-y-3">
                {detailedReport.map((section) => {
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
          })()}

          {/* 관계 역학 */}
          {tenGodRelation && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-700 mb-2">관계 역학</div>
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

          {/* 오행 비교 */}
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

          {/* 지지 관계 */}
          {rawAnalysis?.branches?.relations?.length > 0 && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs font-bold text-slate-700 mb-2">지지 관계 상세</div>
              <div className="space-y-1.5">
                {rawAnalysis.branches.relations.map((r, i) => (
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
        </div>
      )}
    </div>
  );
}
