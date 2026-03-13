import React, { useState, useMemo } from 'react';
import { Filter, FileSearch, MessageSquare, Send } from 'lucide-react';
import Badge from '../components/common/Badge';
import GradeBadge from '../components/common/GradeBadge';
import NetworkResultCard from '../components/member/NetworkResultCard';
import { networkMembers, proposalMessages } from '../lib/seedData';
import { compareColumns } from '../lib/constants';

function ComparisonTable({ compareList }) {
  if (!compareList.length) {
    return (<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-400">후보를 비교함에 추가하면 조건·궁합·성사 가능성을 한 테이블에서 볼 수 있습니다.</div>);
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_repeat(7,120px)_1.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        {compareColumns.map((col) => <div key={col.key}>{col.label}</div>)}
      </div>
      {compareList.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_repeat(7,120px)_1.8fr] border-b border-slate-100 px-4 py-4 text-sm">
          <div className="font-medium text-slate-900">{item.id}</div><div>{item.agency}</div><div className="font-bold text-violet-700">{item.matchScore}</div>
          <div>{item.scores.condition}</div><div>{item.scores.values}</div><div>{item.scores.saju}</div><div>{item.scores.possibility}</div>
          <div className="pr-4 text-slate-600">{item.chemistryNote}</div>
        </div>
      ))}
    </div>
  );
}

export default function NetworkPage({ selectedMyMember, compareList, setCompareList, selectedNetworkMember, setSelectedNetworkMember, openProposal }) {
  const [minScore, setMinScore] = useState(80);
  const [verifyFilter, setVerifyFilter] = useState('전체');

  const filtered = useMemo(() => {
    return networkMembers.filter((m) => {
      const okScore = m.matchScore >= minScore;
      const okVerify = verifyFilter === '전체' ? true : m.verifyLevel === verifyFilter;
      return okScore && okVerify;
    });
  }, [minScore, verifyFilter]);

  const toggleCompare = (member) => {
    setCompareList((prev) => {
      const exists = prev.find((x) => x.id === member.id);
      if (exists) return prev.filter((x) => x.id !== member.id);
      if (prev.length >= 3) return [...prev.slice(1), member];
      return [...prev, member];
    });
  };

  const current = filtered.find((item) => item.id === selectedNetworkMember?.id) || filtered[0] || null;

  return (
    <div className="grid h-full grid-cols-[280px_1fr_360px]">
      <aside className="border-r border-slate-200 bg-white p-6 overflow-y-auto">
        <div><h3 className="text-lg font-bold text-slate-900">탐색 필터</h3><p className="mt-1 text-sm text-slate-500">매칭 대상: {selectedMyMember.id} {selectedMyMember.name}</p></div>
        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">최소 매칭 점수</label>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between text-sm"><span className="text-slate-500">기준</span><span className="font-bold text-violet-700">{minScore}점 이상</span></div>
              <input type="range" min="60" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="mt-3 w-full" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">검증 레벨</label>
            <select value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"><option>전체</option><option>VIP</option><option>Lv4</option><option>Lv3</option></select>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900"><Filter size={16} /> 탐색 기준</div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-800"><li>• 조건 적합도 + 가치관 유사도 + 요청 회원과의 궁합 + 성사 가능성 반영</li><li>• 후보별 사주는 성향 요약만 표시</li><li>• 연락처는 상호 수락 후에만 공개</li></ul>
          </div>
          {compareList.length > 0 ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="text-sm font-bold text-violet-900">비교함 ({compareList.length}/3)</div>
              <div className="mt-3 space-y-2">{compareList.map((item) => (<div key={item.id} className="flex items-center justify-between rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm"><span className="font-medium text-slate-800">{item.id}</span><span className="font-bold text-violet-700">{item.matchScore}점</span></div>))}</div>
            </div>
          ) : null}
        </div>
      </aside>
      <section className="overflow-y-auto bg-slate-50 p-6">
        <div className="flex items-end justify-between">
          <div><h2 className="text-2xl font-bold text-slate-900">협업 네트워크 탐색</h2><p className="mt-1 text-sm text-slate-500">타사 회원은 익명 카드로만 노출되며, 상호 승인 후 단계적으로 정보가 공개됩니다.</p></div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">추천 결과 <span className="font-bold text-violet-700">{filtered.length}건</span></div>
        </div>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><FileSearch size={16} /> 후보 비교 테이블</div>
          <ComparisonTable compareList={compareList} />
        </div>
        <div className="mt-6 space-y-4">
          {filtered.map((member) => (
            <NetworkResultCard key={member.id} member={member} selected={current?.id === member.id}
              onSelect={(open) => { setSelectedNetworkMember(member); if (open) openProposal(member); }}
              onToggleCompare={() => toggleCompare(member)} isCompared={!!compareList.find((x) => x.id === member.id)} />
          ))}
        </div>
      </section>
      <aside className="border-l border-slate-200 bg-white p-6 overflow-y-auto">
        {current ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div><div className="text-xs font-bold uppercase tracking-wide text-slate-400">선택 후보 상세</div><h3 className="mt-2 text-xl font-bold text-slate-900">{current.id}</h3><p className="mt-1 text-sm text-slate-500">{current.agency}</p></div>
              <Badge level={current.verifyLevel} />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-800">1차 공개 프로필</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>직군</span><b>{current.jobCategory}</b></div>
                <div className="flex justify-between"><span>소득 구간</span><b>{current.incomeRange}</b></div>
                <div className="flex justify-between"><span>학력 구간</span><b>{current.eduRange}</b></div>
                <div className="flex justify-between"><span>지역</span><b>{current.location}</b></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{current.tags.map((tag) => (<span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>))}</div>
            </div>
            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="text-sm font-bold text-violet-900">사주 성향 & 요청 회원과의 궁합</div>
              <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 p-3 text-sm text-violet-900"><div className="text-xs font-bold text-violet-700">후보 성향 요약</div><p className="mt-2 leading-6">{current.sajuProfile}</p></div>
              <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 p-3 text-sm text-violet-900"><div className="text-xs font-bold text-violet-700">{selectedMyMember.id}와의 궁합</div><p className="mt-2 leading-6">{current.chemistryNote}</p></div>
              <div className="mt-4"><div className="text-xs font-bold text-violet-700">주의 포인트</div><ul className="mt-2 space-y-2 text-sm text-violet-900">{current.risks.map((r) => (<li key={r}>• {r}</li>))}</ul></div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-800">업체 협업 지표</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between"><span>최근 활동</span><b>{current.recentActivity}</b></div>
                <div className="flex items-center justify-between"><span>응답률</span><b>{current.responseRate}</b></div>
                <div className="flex items-center justify-between"><span>신뢰 점수</span><b>{current.trustScore} / 5.0</b></div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} /> 업체 메시지 스레드</div>
              <div className="space-y-3">
                {proposalMessages.map((msg) => (
                  <div key={msg.id} className={`rounded-2xl p-3 text-sm ${msg.role === 'me' ? 'ml-8 bg-violet-50 text-violet-900' : 'mr-8 border border-slate-200 bg-white text-slate-700'}`}>
                    <div className="flex items-center justify-between text-xs font-bold"><span>{msg.sender}</span><span className="text-slate-400">{msg.time}</span></div>
                    <p className="mt-2 leading-6">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2"><input className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" placeholder="후보 관련 메시지 보내기" /><button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Send size={16} /></button></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">비교 후보 지정</button>
              <button onClick={() => openProposal(current)} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700">소개 제안</button>
            </div>
          </>
        ) : (<div className="flex h-full items-center justify-center text-sm text-slate-400">후보를 선택하세요.</div>)}
      </aside>
    </div>
  );
}
