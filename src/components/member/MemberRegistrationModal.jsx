import React, { useState } from 'react';
import { X } from 'lucide-react';
import GradeBadge from '../common/GradeBadge';
import GradeScoreCard from '../grade/GradeScoreCard';
import InfoTooltip from '../common/InfoTooltip';
import { scoreMember } from '../../lib/scoring';

export default function MemberRegistrationModal({ open, onClose, onSave, scoreRuleWeights, badgeThresholds }) {
  const [activePreviewTab, setActivePreviewTab] = useState('overall');
  const [form, setForm] = useState({
    name: '이서윤',
    birthYear: '1993',
    height: 167,
    weight: 52,
    bodyType: '슬림탄탄',
    job: '국내 대기업 브랜드전략',
    income: 11000,
    financial: 27000,
    realEstate: 1,
    family: '부모 노후 안정',
    appearance: '세련형 / 자기관리 우수',
  });

  if (!open) return null;

  const dynamicPreview = scoreMember(form, scoreRuleWeights, badgeThresholds);
  const previewTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const preview = dynamicPreview.categories[activePreviewTab];
  const labels = { overall: '종합', wealth: '자산', appearance: '외모', family: '집안', career: '직업' };
  const previewBadges = Object.entries(dynamicPreview.categories)
    .map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">신규 회원 등록</h3>
            <p className="mt-1 text-sm text-slate-500">입력값을 바꾸면 우측 자동 점수, 퍼센타일, 배지가 실시간으로 갱신됩니다.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-0">
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['이름', 'name', 'text'],
                ['출생연도', 'birthYear', 'text'],
                ['키(cm)', 'height', 'number'],
                ['몸무게(kg)', 'weight', 'number'],
                ['체형', 'bodyType', 'text'],
                ['직업', 'job', 'text'],
                ['연봉(만원)', 'income', 'number'],
                ['금융자산(만원)', 'financial', 'number'],
              ].map(([label, key, type]) => (
                <label key={key} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-400">{label}</div>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                  />
                </label>
              ))}
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">부동산 보유 수</div>
                <input type="number" value={form.realEstate} onChange={(e) => setForm((prev) => ({ ...prev, realEstate: Number(e.target.value) }))} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">집안/가족 메모</div>
                <input type="text" value={form.family} onChange={(e) => setForm((prev) => ({ ...prev, family: e.target.value }))} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="col-span-2 rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">외모/인상 메모</div>
                <input type="text" value={form.appearance} onChange={(e) => setForm((prev) => ({ ...prev, appearance: e.target.value }))} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-bold text-blue-900">점수 산정 가중치</div>
              <div className="mt-3 space-y-2">
                {scoreRuleWeights.map((rule) => (
                  <div key={rule.key} className="rounded-xl border border-blue-100 bg-white px-3 py-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                      <span>{rule.label}</span>
                      <span className="text-blue-700">{rule.weight}%</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-l border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-bold text-amber-900">실시간 자동 산정 결과</div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className="text-xs text-amber-700">종합 점수</div>
                  <div className="text-3xl font-bold text-amber-900">{dynamicPreview.overallScore}</div>
                </div>
                <GradeBadge label={dynamicPreview.categories.overall.badge} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewBadges.map((badge) => <GradeBadge key={badge} label={badge} />)}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                {previewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePreviewTab(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${activePreviewTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {previewTabs.map((tab) => (
                  <GradeScoreCard key={tab.key} title={tab.label} data={dynamicPreview.categories[tab.key]} active={activePreviewTab === tab.key} onClick={() => setActivePreviewTab(tab.key)} showHint />
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-violet-900">{previewTabs.find((tab) => tab.key === activePreviewTab)?.label} 상세</div>
                    <div className="mt-1 text-xs text-violet-700">저장 시 회원 프로필/네트워크 카드에 자동 반영됩니다.</div>
                  </div>
                  <GradeBadge label={preview.badge} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">점수</div><div className="mt-1 text-xl font-bold text-slate-900">{preview.score}</div></div>
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">퍼센타일</div><div className="mt-1 text-xl font-bold text-violet-700">{preview.percentile}</div></div>
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">배지</div><div className="mt-1 text-sm font-bold text-slate-900">{preview.badge || '없음'}</div></div>
                </div>
              </div>
            </div>

            <InfoTooltip title="산정 로직 가이드" lines={['저장 시 종합/자산/외모/집안/직업 점수와 퍼센타일이 자동 생성됩니다.', '배지는 카테고리별 점수가 기준 이상일 때 즉시 부여됩니다.', '관리자는 대시보드 설정 패널에서 가중치와 배지 임계값을 수정할 수 있습니다.']} />

            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">취소</button>
              <button
                onClick={() => {
                  const newMember = {
                    id: `M${String(Date.now()).slice(-3)}`,
                    name: form.name,
                    age: 2026 - Number(form.birthYear),
                    gender: 'F',
                    job: form.job,
                    income: `${(form.income / 10000).toFixed(1)}억`,
                    edu: '미입력',
                    height: form.height,
                    weight: form.weight,
                    bodyType: form.bodyType,
                    assets: `금융 ${(form.financial / 10000).toFixed(1)}억 / 부동산 ${form.realEstate}건`,
                    family: form.family,
                    appearanceNote: form.appearance,
                    location: '서울',
                    verifyLevel: 'Lv1',
                    verifyItems: ['본인'],
                    saju: { profile: '등록 후 성향 요약 생성 예정' },
                    grade: {
                      overallScore: dynamicPreview.overallScore,
                      categories: dynamicPreview.categories,
                      badges: Object.entries(dynamicPreview.categories).map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null)).filter(Boolean),
                    },
                    values: ['신규등록'],
                    status: '신규 상담',
                    manager: '이팀장',
                    lastContact: '방금',
                    nextAction: '초기 상담 필요',
                    profileCompletion: 64,
                    outboundProposals: 0,
                  };
                  onSave(newMember);
                  onClose();
                }}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                회원 저장
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
