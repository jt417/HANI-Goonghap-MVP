import React, { useState } from 'react';
import { Inbox, CheckCircle2, XCircle, Clock, Star, MapPin, Briefcase, GraduationCap, MessageCircle } from 'lucide-react';

/* ── 데모 받은 소개 데이터 ── */
const DEMO_PROPOSALS = [
  {
    id: 'RP-001',
    managerName: '이팀장',
    agencyName: '압구정 노블레스 파트너스',
    candidatePreview: {
      age: '33세',
      height: '178cm',
      job: '대기업 IT',
      edu: '서울대 학사',
      location: '서울 강남구',
      bodyType: '슬림탄탄',
      faceType: '호감상',
      income: '9000만',
    },
    matchScore: 88,
    managerNote: '성격이 차분하고 가정적인 분입니다. 안정적인 직장에 재테크에도 관심이 많아 가치관이 맞을 것 같습니다.',
    status: '검토중',
    receivedAt: '2026-03-13',
    expiresAt: '2026-03-20',
  },
  {
    id: 'RP-002',
    managerName: '박매니저',
    agencyName: '청담 매치메이커',
    candidatePreview: {
      age: '35세',
      height: '181cm',
      job: '변호사',
      edu: '고려대 법학전문대학원',
      location: '서울 서초구',
      bodyType: '보통',
      faceType: '남자다운 상',
      income: '1.5억',
    },
    matchScore: 92,
    managerNote: '유머감각이 좋고 배려심 깊은 성격입니다. 결혼에 진지하며 2명의 자녀를 희망합니다.',
    status: '검토중',
    receivedAt: '2026-03-12',
    expiresAt: '2026-03-19',
  },
  {
    id: 'RP-003',
    managerName: '최수석',
    agencyName: '강남 웨딩앤매치',
    candidatePreview: {
      age: '31세',
      height: '176cm',
      job: '스타트업 CEO',
      edu: 'KAIST 석사',
      location: '서울 성동구',
      bodyType: '근육질',
      faceType: '귀공자상',
      income: '2억+',
    },
    matchScore: 85,
    managerNote: '활발하고 진취적인 분입니다. IT 스타트업을 운영 중이며 주말에는 등산과 골프를 즐깁니다.',
    status: '수락',
    receivedAt: '2026-03-08',
    expiresAt: null,
  },
];

function ScoreBadge({ score }) {
  const color = score >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : score >= 80 ? 'bg-violet-100 text-violet-700 border-violet-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-sm font-black ${color}`}>
      <Star size={12} /> {score}점
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    '검토중': 'bg-amber-100 text-amber-700',
    '수락': 'bg-emerald-100 text-emerald-700',
    '거절': 'bg-rose-100 text-rose-700',
    '만료': 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${styles[status] || styles['검토중']}`}>
      {status}
    </span>
  );
}

function ProposalCard({ proposal, onAccept, onReject }) {
  const { candidatePreview: c } = proposal;
  const isPending = proposal.status === '검토중';

  return (
    <div className={`rounded-2xl border bg-white shadow-sm transition ${isPending ? 'border-violet-200' : 'border-slate-200'}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
            {proposal.managerName[0]}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">{proposal.managerName}</div>
            <div className="text-[10px] text-slate-400">{proposal.agencyName}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ScoreBadge score={proposal.matchScore} />
          <StatusBadge status={proposal.status} />
        </div>
      </div>

      {/* 후보자 프리뷰 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 sm:grid-cols-4">
        {[
          { icon: Clock, label: '나이', value: c.age },
          { icon: Briefcase, label: '직업', value: c.job },
          { icon: GraduationCap, label: '학력', value: c.edu },
          { icon: MapPin, label: '지역', value: c.location },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <Icon size={10} /> {label}
            </div>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{value}</div>
          </div>
        ))}
      </div>

      {/* 추가 스펙 */}
      <div className="flex flex-wrap gap-1.5 border-t border-slate-50 px-5 py-2.5">
        {[
          `${c.height}`,
          c.bodyType,
          c.faceType,
          `소득 ${c.income}`,
        ].map((tag) => (
          <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">{tag}</span>
        ))}
      </div>

      {/* 매니저 코멘트 */}
      <div className="border-t border-slate-100 px-5 py-3.5">
        <div className="flex items-start gap-2">
          <MessageCircle size={14} className="mt-0.5 shrink-0 text-violet-400" />
          <div className="text-xs leading-5 text-slate-600">{proposal.managerNote}</div>
        </div>
      </div>

      {/* 액션 (검토중일 때만) */}
      {isPending && (
        <div className="flex gap-2 border-t border-slate-100 px-5 py-3.5">
          <button
            onClick={() => onAccept(proposal.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-violet-600 py-2.5 text-sm font-bold text-white hover:bg-violet-700"
          >
            <CheckCircle2 size={16} /> 수락하기
          </button>
          <button
            onClick={() => onReject(proposal.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            <XCircle size={16} /> 정중히 거절
          </button>
        </div>
      )}

      {/* 날짜 정보 */}
      <div className="flex items-center justify-between border-t border-slate-50 px-5 py-2">
        <span className="text-[10px] text-slate-400">받은 날짜: {proposal.receivedAt}</span>
        {proposal.expiresAt && (
          <span className="text-[10px] text-rose-400">응답 기한: {proposal.expiresAt}</span>
        )}
      </div>
    </div>
  );
}

export default function ReceivedProposalsPage() {
  const [proposals, setProposals] = useState(DEMO_PROPOSALS);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? proposals : proposals.filter((p) => p.status === filter);
  const pendingCount = proposals.filter((p) => p.status === '검토중').length;

  const handleAccept = (id) => {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status: '수락' } : p));
  };

  const handleReject = (id) => {
    setProposals((prev) => prev.map((p) => p.id === id ? { ...p, status: '거절' } : p));
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8">
      {/* 헤더 */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">받은 소개</h2>
          <p className="mt-1 text-sm text-slate-500">
            전문 매칭매니저가 추천한 소개 제안입니다
            {pendingCount > 0 && <span className="ml-1 font-bold text-violet-600">· {pendingCount}건 검토 대기</span>}
          </p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {[
            { key: 'all', label: '전체' },
            { key: '검토중', label: '검토중' },
            { key: '수락', label: '수락' },
            { key: '거절', label: '거절' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                filter === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 소개 카드 목록 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 py-16">
          <Inbox size={40} className="text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">
            {filter === 'all' ? '아직 받은 소개가 없습니다' : `${filter} 상태의 소개가 없습니다`}
          </p>
          <p className="mt-1 text-xs text-slate-400">프로필을 완성하면 매니저 노출이 늘어납니다</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} onAccept={handleAccept} onReject={handleReject} />
          ))}
        </div>
      )}
    </div>
  );
}
