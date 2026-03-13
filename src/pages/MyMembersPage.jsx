import React, { useState } from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import Badge from '../components/common/Badge';
import GradeBadge from '../components/common/GradeBadge';
import GradeScoreCard from '../components/grade/GradeScoreCard';

export default function MyMembersPage({ members, selectedMyMember, setSelectedMyMember, onOpenRegistration }) {
  const [activeGradeTab, setActiveGradeTab] = useState('overall');
  const gradeTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const currentGrade = selectedMyMember.grade.categories[activeGradeTab];

  return (
    <div className="grid h-full grid-cols-[1.2fr_420px] gap-0">
      <div className="space-y-6 overflow-y-auto p-8">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold text-slate-900">우리 회원 CRM</h2><p className="mt-1 text-sm text-slate-500">실명, 증빙 원본, 연락처는 자사 권한 사용자만 열람 가능합니다.</p></div>
          <div className="flex gap-2">
            <button onClick={onOpenRegistration} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">+ 신규 회원 등록</button>
            <button className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100">자동 점수 산정 보기</button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr_0.8fr_0.9fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>회원</div><div>상태</div><div>직업 / 학력</div><div>최근 접촉</div><div>다음 액션</div><div>검증</div>
          </div>
          <div>
            {members.map((m) => (
              <button key={m.id} onClick={() => setSelectedMyMember(m)} className={`grid w-full grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr_0.8fr_0.9fr] items-center border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${selectedMyMember.id === m.id ? 'bg-violet-50/60' : 'bg-white'}`}>
                <div><div className="font-medium text-slate-900">{m.name} <span className="text-xs text-slate-400">({m.id})</span></div><div className="mt-1 text-sm text-slate-500">{m.age}세 · {m.gender} · {m.location}</div></div>
                <div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{m.status}</span></div>
                <div><div className="text-sm text-slate-800">{m.job}</div><div className="mt-1 text-xs text-slate-500">{m.edu}</div></div>
                <div className="text-sm text-slate-600">{m.lastContact}</div>
                <div className="text-sm font-medium text-violet-700">{m.nextAction}</div>
                <div><Badge level={m.verifyLevel} /></div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <aside className="border-l border-slate-200 bg-white p-6 overflow-y-auto">
        <div className="flex items-start justify-between"><div><div className="text-xs font-bold uppercase tracking-wide text-slate-400">선택 회원 상세</div><h3 className="mt-2 text-xl font-bold text-slate-900">{selectedMyMember.name}</h3><p className="mt-1 text-sm text-slate-500">담당 매니저 {selectedMyMember.manager}</p></div><Badge level={selectedMyMember.verifyLevel} /></div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[['직업', selectedMyMember.job],['연소득', selectedMyMember.income],['자산', selectedMyMember.assets],['거주', selectedMyMember.location],['키/체형', `${selectedMyMember.height}cm · ${selectedMyMember.bodyType}`],['외모 메모', selectedMyMember.appearanceNote]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-400">{k}</div><div className="mt-1 text-sm font-medium text-slate-800">{v}</div></div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div><div className="text-sm font-bold text-amber-900">자동 스펙 랭킹</div><div className="mt-1 text-xs text-amber-700">등록 데이터 기반 자동 점수화 · 퍼센타일 산출 · 배지 부여</div></div>
            <div className="text-right"><div className="text-xs text-amber-700">종합 점수</div><div className="text-3xl font-bold text-amber-900">{selectedMyMember.grade.overallScore}</div></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">{selectedMyMember.grade.badges.map((badge) => (<GradeBadge key={badge} label={badge} />))}</div>
        </div>
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between"><div className="text-sm font-bold text-slate-800">카테고리별 상위권 분석</div><div className="text-xs text-slate-500">탭 이동</div></div>
          <div className="mt-4 flex flex-wrap gap-2">
            {gradeTabs.map((tab) => (<button key={tab.key} onClick={() => setActiveGradeTab(tab.key)} className={`rounded-full px-3 py-1.5 text-xs font-medium ${activeGradeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{tab.label}</button>))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {gradeTabs.map((tab) => (<GradeScoreCard key={tab.key} title={tab.label} data={selectedMyMember.grade.categories[tab.key]} active={activeGradeTab === tab.key} onClick={() => setActiveGradeTab(tab.key)} />))}
          </div>
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center justify-between"><div><div className="text-sm font-bold text-violet-900">{gradeTabs.find((t) => t.key === activeGradeTab)?.label} 상세</div><div className="mt-1 text-xs text-violet-700">현재 회원은 {currentGrade.percentile} 포지션입니다.</div></div><GradeBadge label={currentGrade.badge} /></div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">카테고리 점수</div><div className="mt-1 text-xl font-bold text-slate-900">{currentGrade.score}</div></div>
              <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">퍼센타일</div><div className="mt-1 text-xl font-bold text-violet-700">{currentGrade.percentile}</div></div>
              <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">뱃지</div><div className="mt-1 text-sm font-bold text-slate-900">{currentGrade.badge || '없음'}</div></div>
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-800"><Star size={16} /> 사주 성향 요약</div>
          <p className="mt-3 text-sm leading-6 text-violet-900">{selectedMyMember.saju.profile}</p>
        </div>
        <div className="mt-5">
          <div className="mb-2 text-sm font-bold text-slate-800">프로필 상태</div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between text-sm"><span className="text-slate-500">프로필 완성도</span><span className="font-bold text-slate-900">{selectedMyMember.profileCompletion}%</span></div>
            <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-violet-500" style={{ width: `${selectedMyMember.profileCompletion}%` }} /></div>
            <div className="mt-4 flex flex-wrap gap-2">{selectedMyMember.values.map((tag) => (<span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>))}</div>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-blue-500" size={18} /><div><div className="text-sm font-bold text-blue-900">테넌트 데이터 분리</div><p className="mt-1 text-xs leading-5 text-blue-700">실명, 연락처, 증빙 원본은 외부 네트워크에 공개되지 않으며, 익명 카드와 단계적 공개 정책에 따라 제안이 진행됩니다.</p></div></div>
        </div>
      </aside>
    </div>
  );
}
