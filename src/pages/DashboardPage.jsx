import React, { useState } from 'react';
import { BarChart3, Clock3, TrendingUp, SlidersHorizontal, Crown, Settings2, Gem } from 'lucide-react';
import SectionCard from '../components/common/SectionCard';
import GradeBadge from '../components/common/GradeBadge';
import GradeScoreCard from '../components/grade/GradeScoreCard';
import InfoTooltip from '../components/common/InfoTooltip';
import { toneClasses } from '../lib/constants';
import { stats, tasks, timelineItems, reputationMetrics, kpiSeries, scorePreview } from '../lib/seedData';

function MiniBarChart() {
  const max = Math.max(...kpiSeries.flatMap((d) => [d.match, d.intro, d.close]));
  return (
    <div className="space-y-4">
      {kpiSeries.map((item) => (
        <div key={item.label} className="grid grid-cols-[60px_1fr] items-center gap-4">
          <div className="text-xs font-medium text-slate-500">{item.label}</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '탐색', value: item.match, tone: 'bg-slate-700' },
              { label: '소개', value: item.intro, tone: 'bg-violet-500' },
              { label: '성사', value: item.close, tone: 'bg-emerald-500' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500"><span>{bar.label}</span><span>{bar.value}</span></div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${bar.tone}`} style={{ width: `${(bar.value / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberRegistrationPanel({ onOpenModal, scoreRuleWeights }) {
  const [activePreviewTab, setActivePreviewTab] = useState('overall');
  const previewTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const preview = scorePreview.categories[activePreviewTab];

  return (
    <SectionCard
      title="회원 등록 & 자동 점수 산정"
      subtitle="회원 등록 직후 입력값을 기반으로 자동 점수, 퍼센타일, 배지가 생성됩니다."
      action={<button onClick={onOpenModal} className="flex items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"><Gem size={16} /> 실시간 등록 열기</button>}
    >
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[['이름', '이서윤'],['출생연도', '1993'],['키 / 몸무게', '167cm / 52kg'],['체형', '슬림탄탄'],['직업', '국내 대기업 브랜드전략'],['연봉', '1.1억'],['금융자산', '2.7억'],['부동산', '본인명의 아파트 1채'],['집안', '부모 노후 안정'],['외모 메모', '세련형 / 자기관리 우수']].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm font-bold text-blue-900">점수 산정 가중치</div>
            <div className="mt-3 space-y-2">
              {scoreRuleWeights.map((rule) => (
                <div key={rule.key} className="rounded-xl border border-blue-100 bg-white px-3 py-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800"><span>{rule.label}</span><span className="text-blue-700">{rule.weight}%</span></div>
                  <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-bold text-amber-900">자동 산정 결과</div>
            <div className="mt-2 flex items-end justify-between">
              <div><div className="text-xs text-amber-700">종합 점수</div><div className="text-3xl font-bold text-amber-900">{scorePreview.overallScore}</div></div>
              <GradeBadge label={scorePreview.categories.overall.badge} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">{scorePreview.badges.map((badge) => (<GradeBadge key={badge} label={badge} />))}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
              {previewTabs.map((tab) => (
                <button key={tab.key} onClick={() => setActivePreviewTab(tab.key)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${activePreviewTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab.label}</button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {previewTabs.map((tab) => (<GradeScoreCard key={tab.key} title={tab.label} data={scorePreview.categories[tab.key]} active={activePreviewTab === tab.key} onClick={() => setActivePreviewTab(tab.key)} showHint />))}
            </div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><div className="text-sm font-bold text-violet-900">{previewTabs.find((tab) => tab.key === activePreviewTab)?.label} 퍼센타일 결과</div><div className="mt-1 text-xs text-violet-700">신규 회원 등록 시 프로필 카드와 내부 CRM에 즉시 반영됩니다.</div></div>
                <GradeBadge label={preview.badge} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">점수</div><div className="mt-1 text-xl font-bold text-slate-900">{preview.score}</div></div>
                <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">퍼센타일</div><div className="mt-1 text-xl font-bold text-violet-700">{preview.percentile}</div></div>
                <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">배지</div><div className="mt-1 text-sm font-bold text-slate-900">{preview.badge}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ScoreSettingsPanel({ scoreRuleWeights, setScoreRuleWeights, badgeThresholds, setBadgeThresholds }) {
  const totalWeight = scoreRuleWeights.reduce((sum, r) => sum + r.weight, 0);
  return (
    <SectionCard title="관리자용 점수 기준 설정" subtitle="가중치와 배지 임계값을 조정해 내부 평가 기준을 관리합니다." action={<div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Settings2 size={16} /> Admin</div>}>
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><SlidersHorizontal size={16} /> 가중치 설정</div>
            <div className={`text-sm font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>합계: {totalWeight}%</div>
          </div>
          <div className="space-y-3">
            {scoreRuleWeights.map((rule) => (
              <div key={rule.key} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between"><div><div className="text-sm font-medium text-slate-900">{rule.label}</div><div className="mt-1 text-xs text-slate-500">{rule.desc}</div></div><div className="text-sm font-bold text-violet-700">{rule.weight}%</div></div>
                <input type="range" min="0" max="50" value={rule.weight} onChange={(e) => setScoreRuleWeights((prev) => prev.map((item) => item.key === rule.key ? { ...item, weight: Math.min(50, Math.max(0, Number(e.target.value))) } : item))} className="mt-3 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Crown size={16} /> 배지 임계값</div>
            <div className="space-y-3">
              {badgeThresholds.map((badge) => (
                <div key={badge.label} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between"><GradeBadge label={badge.label} /><input type="number" min="0" max="100" value={badge.min} onChange={(e) => { const v = Math.min(100, Math.max(0, Number(e.target.value))); setBadgeThresholds((prev) => prev.map((item) => item.label === badge.label ? { ...item, min: v } : item)); }} className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm" /></div>
                  <div className="mt-2 text-xs text-slate-500">이 점수 이상일 때 자동 부여</div>
                </div>
              ))}
            </div>
          </div>
          <InfoTooltip title="운영 주의사항" lines={['가중치 총합은 100 기준으로 운영하는 것이 권장됩니다.', '배지 임계값은 상위 회원 분포를 보고 정기적으로 조정할 수 있습니다.', '설정 변경 시 이후 등록 회원과 재산정 대상 회원에 반영됩니다.']} />
        </div>
      </div>
    </SectionCard>
  );
}

export default function DashboardPage({ onOpenRegistration, scoreRuleWeights, setScoreRuleWeights, badgeThresholds, setBadgeThresholds }) {
  return (
    <div className="space-y-6 overflow-y-auto p-8">
      <div className="flex items-end justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">운영 대시보드</h2><p className="mt-1 text-sm text-slate-500">매칭, 인증, 정산, 분쟁, 제안 흐름을 한눈에 관리합니다.</p></div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">오늘의 성사 가능성 높은 후보 <span className="font-bold text-violet-600">6건</span></div>
      </div>
      <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${toneClasses[item.tone]}`}>{item.label}</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-1 text-xs text-slate-500">전월 대비 안정적 유지</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h3 className="text-base font-bold text-slate-900">오늘의 업무 큐</h3><button className="text-sm font-medium text-violet-600">전체 보기</button></div>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div><div className="font-medium text-slate-900">{task.title}</div><div className="mt-1 text-sm text-slate-500">{task.meta}</div></div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClasses[task.tone]}`}>우선 처리</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">핵심 알림</h3>
          <div className="mt-4 space-y-3">
            {['받은 제안 3건', '정산 예정 2건', '분쟁 검토 1건'].map((item, idx) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4"><div className="text-sm font-medium text-slate-800">{item}</div><div className="mt-1 text-xs text-slate-500">{idx === 2 ? '운영관리자 확인 필요' : '오늘 처리 권장'}</div></div>
            ))}
          </div>
        </div>
      </div>
      <MemberRegistrationPanel onOpenModal={onOpenRegistration} scoreRuleWeights={scoreRuleWeights} />
      <ScoreSettingsPanel scoreRuleWeights={scoreRuleWeights} setScoreRuleWeights={setScoreRuleWeights} badgeThresholds={badgeThresholds} setBadgeThresholds={setBadgeThresholds} />
      <div className="grid grid-cols-3 gap-4">
        <SectionCard title="주간 파이프라인 흐름" subtitle="탐색 → 소개 → 성사 전환 추이를 확인합니다." action={<div className="flex items-center gap-2 text-sm font-medium text-violet-600"><BarChart3 size={16} /> KPI</div>}><MiniBarChart /></SectionCard>
        <SectionCard title="실시간 액티비티" subtitle="오늘 팀/파트너 네트워크에서 발생한 주요 이벤트입니다." action={<div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Clock3 size={16} /> Live</div>}>
          <div className="space-y-4">
            {timelineItems.map((item) => (
              <div key={item.time + item.title} className="grid grid-cols-[56px_1fr] gap-3">
                <div className="text-xs font-bold text-violet-600">{item.time}</div>
                <div className="rounded-xl border border-slate-200 p-3"><div className="text-sm font-medium text-slate-900">{item.title}</div><div className="mt-1 text-xs text-slate-500">{item.desc}</div></div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="업체 평판 / 협업 지표" subtitle="네트워크 내 우리 업체의 운영 품질을 보여줍니다." action={<div className="flex items-center gap-2 text-sm font-medium text-emerald-600"><TrendingUp size={16} /> 개선중</div>}>
          <div className="space-y-3">
            {reputationMetrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-4"><div className="text-xs text-slate-400">{item.label}</div><div className="mt-1 text-lg font-bold text-slate-900">{item.value}</div><div className="mt-1 text-xs text-slate-500">{item.sub}</div></div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
