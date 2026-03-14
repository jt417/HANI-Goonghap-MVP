import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Bell, Eye, CheckCircle2, Clock, AlertCircle, Inbox,
  ArrowUpDown, FileQuestion, UserCheck, XCircle, Handshake, Undo2, ChevronLeft,
} from 'lucide-react';
import StatusChip from '../components/common/StatusChip';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import MemberConsentModal from '../components/proposal/MemberConsentModal';
import useAppStore from '../stores/appStore';
import { useMembers } from '../hooks/useMembers';
import { useProposals } from '../hooks/useProposals';
import { useSettlements } from '../hooks/useSettlements';
import { useActivityLog, LOG_ACTIONS } from '../hooks/useActivityLog';
import { rejectionReasons } from '../lib/constants';

/* ── 매칭 점수 시각화 ── */
function ScoreBar({ score }) {
  const color =
    score >= 90 ? 'bg-violet-500' :
    score >= 85 ? 'bg-indigo-500' :
    score >= 80 ? 'bg-blue-400' : 'bg-slate-300';
  const badge =
    score >= 95 ? 'TOP 0.1%' :
    score >= 90 ? 'TOP 1%' :
    score >= 85 ? 'TOP 5%' :
    score >= 80 ? 'TOP 10%' : null;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-sm font-bold tabular-nums text-slate-800">{score}</span>
      {badge && (
        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
          {badge}
        </span>
      )}
    </div>
  );
}

/* ── 경과 시간 + 긴급도 (내가 응답해야 하는 건) ── */
function ResponseBadge({ lastAction, status }) {
  if (['수락', '소개 확정'].includes(status)) {
    return <span className="text-xs font-medium text-emerald-600">{lastAction}</span>;
  }
  // 추가정보 요청은 상대가 응답해야 함 → 대기 표시
  if (status === '추가정보 요청') {
    return (
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-xs font-medium text-amber-600">{lastAction}</span>
      </span>
    );
  }
  // 검토중/회원 확인중 — 내가 처리해야 하는 건
  const isOverdue = ['2일 전', '3일 전'].includes(lastAction);
  const isWarning = ['어제', '1일 전'].includes(lastAction);
  if (isOverdue) {
    return (
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
        <span className="text-xs font-bold text-rose-600">{lastAction}</span>
      </span>
    );
  }
  if (isWarning) {
    return (
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="text-xs font-medium text-amber-700">{lastAction}</span>
      </span>
    );
  }
  return <span className="text-xs text-slate-500">{lastAction}</span>;
}

/* ── 상태별 필터 탭 ── */
const TABS = [
  { key: 'all', label: '전체' },
  { key: '검토중', label: '검토 필요' },
  { key: '추가정보 요청', label: '추가정보 대기' },
  { key: '회원 확인중', label: '회원확인중' },
  { key: '수락', label: '수락' },
  { key: '소개 확정', label: '소개확정' },
];

/* ── 테이블 컬럼 ── */
const COL = [
  { key: 'agency', label: '보낸 업체', w: '1.1fr' },
  { key: 'memberId', label: '우리 회원', w: '0.75fr' },
  { key: 'candidate', label: '상대 후보', w: '0.75fr' },
  { key: 'score', label: '매칭 점수', w: '1.05fr' },
  { key: 'status', label: '상태', w: '0.85fr' },
  { key: 'lastAction', label: '경과', w: '0.7fr' },
  { key: 'owner', label: '담당', w: '0.55fr' },
];

/* ── 제안서 남은 일수 (Phase 1-6) ── */
function proposalDaysLeft(sentDate) {
  if (!sentDate) return null;
  return 14 - Math.floor((Date.now() - new Date(sentDate).getTime()) / (1000 * 60 * 60 * 24));
}

/* ── 공개 범위 결정 ── */
function getVisibility(score, status) {
  if (['수락', '소개 확정'].includes(status))
    return ['이름', '나이', '직업', '학력', '지역', '자산', '가족', '외모'];
  if (score >= 90) return ['이름', '나이', '직업', '학력', '지역', '자산'];
  if (score >= 85) return ['이름', '나이', '직업', '학력', '지역'];
  return ['이름', '나이', '직업'];
}

export default function InboxPage() {
  const { inbox, loading, fetchInbox, updateProposalStatus, updateProposalConsent, setMeetingArranged } = useProposals();
  const { members, setSelectedMyMember, updateMember } = useMembers();
  const { createSettlement } = useSettlements();
  const { addLog } = useActivityLog();
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const showToast = useAppStore((s) => s.showToast);
  const addNotification = useAppStore((s) => s.addNotification);

  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('desc');
  const [consentModal, setConsentModal] = useState({ open: false, side: null });
  const [rejectModal, setRejectModal] = useState(false);

  useEffect(() => { fetchInbox(); }, [fetchInbox]);
  useEffect(() => { if (!selected && inbox.length) setSelected(inbox[0]); }, [inbox]);

  /* ── 제안서 14일 자동 만료 (Phase 1-6) ── */
  useEffect(() => {
    inbox.forEach((p) => {
      if (!p.sentDate || ['수락', '소개 확정', '반려', '철회', '만료'].includes(p.status)) return;
      if (proposalDaysLeft(p.sentDate) <= 0) {
        updateProposalStatus(p.id, '만료');
        showToast(`${p.id} 제안서가 14일 경과로 자동 만료되었습니다.`, 'slate');
      }
    });
  }, [inbox]);

  /* 데이터 보강 */
  const enriched = useMemo(
    () => inbox.map((o) => ({
      ...o,
      visibility: o.visibility || getVisibility(o.score, o.status),
    })),
    [inbox],
  );

  /* 통계 */
  const stats = useMemo(() => {
    const s = { total: 0, '검토중': 0, '추가정보 요청': 0, '회원 확인중': 0, done: 0, needAction: 0 };
    s.total = inbox.length;
    inbox.forEach((o) => {
      if (o.status === '검토중') { s['검토중']++; s.needAction++; }
      else if (o.status === '추가정보 요청') s['추가정보 요청']++;
      else if (o.status === '회원 확인중') { s['회원 확인중']++; s.needAction++; }
      else if (['수락', '소개 확정'].includes(o.status)) s.done++;
    });
    return s;
  }, [inbox]);

  /* 필터 + 검색 + 정렬 */
  const rows = useMemo(() => {
    let list = enriched;
    if (tab !== 'all') list = list.filter((o) => o.status === tab);
    if (q) {
      const t = q.toLowerCase();
      list = list.filter((o) =>
        [o.agency, o.memberId, o.candidate, o.owner].some((v) => v.toLowerCase().includes(t)),
      );
    }
    if (sortKey) {
      list = [...list].sort((a, b) => {
        const va = a[sortKey];
        const vb = b[sortKey];
        const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [enriched, tab, q, sortKey, sortDir]);

  /* 필터 변경 시 선택 동기화 */
  useEffect(() => {
    if (rows.length > 0 && selected && !rows.find((r) => r.id === selected.id)) {
      setSelected(rows[0]);
    } else if (rows.length === 0) {
      setSelected(null);
    }
  }, [rows]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const { error } = await updateProposalStatus(selected.id, newStatus);
    if (!error) {
      const logAction = newStatus === '수락' ? LOG_ACTIONS.PROPOSAL_ACCEPT : newStatus === '반려' ? LOG_ACTIONS.PROPOSAL_REJECT : null;
      if (logAction) addLog({ action: logAction, target: 'proposal', targetId: selected.id, detail: `${selected.partner} → ${selected.member}` });
      showToast(`${selected.id} 상태가 "${newStatus}"(으)로 변경되었습니다.`, 'emerald');
      setSelected((prev) => (prev ? { ...prev, status: newStatus, lastAction: '방금' } : prev));
    }
  };

  const navigateToMember = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (member) { setSelectedMyMember(member); setActiveTab('myMembers'); }
  };

  /* ── 상태별 맥락 액션 ── */
  const actions = (() => {
    if (!selected) return null;
    const st = selected.status;
    return (
      <div className="flex w-full flex-col gap-2">
        {/* 상태 안내 메시지 */}
        {st === '검토중' && (
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-2.5 text-xs text-indigo-700">
            <FileQuestion size={12} className="inline mr-1.5 -mt-0.5" />
            상대 업체의 제안을 검토하고 다음 단계를 결정하세요.
          </div>
        )}
        {st === '추가정보 요청' && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700">
            <Clock size={12} className="inline mr-1.5 -mt-0.5" />
            상대 업체에 추가 정보를 요청했습니다. 응답을 기다리는 중입니다.
          </div>
        )}
        {st === '회원 확인중' && (
          <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-2.5 text-xs text-violet-700">
            <UserCheck size={12} className="inline mr-1.5 -mt-0.5" />
            우리 회원에게 프로필을 보여주고 의향을 확인하세요.
          </div>
        )}

        {/* 주요 액션 */}
        {st === '검토중' && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleAction('회원 확인중')}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              <UserCheck size={15} /> 회원에게 제안
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('추가정보 요청')}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <FileQuestion size={13} /> 추가정보 요청
              </button>
              <button
                onClick={() => setRejectModal(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <XCircle size={13} /> 반려
              </button>
            </div>
          </div>
        )}
        {st === '추가정보 요청' && (
          <button
            onClick={() => {
              addNotification({ title: '추가정보 리마인드 발송', body: `${selected.agency}에 추가정보 요청 리마인드`, type: 'remind_sent', tab: 'inbox' });
              showToast(`${selected.agency}에 추가정보 리마인드가 발송되었습니다.`, 'amber');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition"
          >
            <Bell size={15} /> 추가정보 리마인드
          </button>
        )}
        {st === '회원 확인중' && (
          <div className="flex flex-col gap-2">
            {selected.ourMemberConsent === '동의' && selected.counterpartConsent === '동의' ? (
              <button
                onClick={() => handleAction('수락')}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
              >
                <CheckCircle2 size={15} /> 소개 확정 (양측 동의 완료)
              </button>
            ) : (
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-400 cursor-not-allowed"
              >
                <CheckCircle2 size={15} /> 양측 동의 후 확정 가능
              </button>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModal(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <XCircle size={13} /> 반려
              </button>
              <button
                onClick={() => {
                  if (!window.confirm('검토 단계로 되돌리시겠습니까?')) return;
                  handleAction('검토중');
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <Undo2 size={13} /> 검토로 되돌리기
              </button>
            </div>
          </div>
        )}
        {st === '수락' && (
          <button
            onClick={() => handleAction('소개 확정')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            <Handshake size={15} /> 소개 확정 처리
          </button>
        )}
        {st === '소개 확정' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={15} /> 소개 확정 완료
          </div>
        )}

        {/* 공개 범위 (공통) */}
        <button
          onClick={() =>
            showToast(
              `상대측 공개 범위: ${selected.visibility?.join(', ') || '기본 정보'}`,
              'indigo',
            )
          }
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          <Eye size={13} /> 상대측 공개 범위 확인
        </button>
      </div>
    );
  })();

  const responseRate = stats.total
    ? Math.round(((stats['회원 확인중'] + stats.done) / stats.total) * 100)
    : 0;
  const acceptRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1.1fr_380px]">
      <div className={`space-y-4 overflow-y-auto p-4 md:p-6 ${selected ? 'hidden lg:block' : ''}`}>
        {/* ── 요약 통계 카드 ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: '총 받은 제안', v: stats.total, bg: 'bg-white', fg: 'text-slate-900' },
            { label: '검토 필요', v: stats['검토중'], bg: 'bg-indigo-50', fg: 'text-indigo-700' },
            { label: '추가정보 대기', v: stats['추가정보 요청'], bg: 'bg-amber-50', fg: 'text-amber-700' },
            { label: '회원 확인중', v: stats['회원 확인중'], bg: 'bg-violet-50', fg: 'text-violet-700' },
            { label: '수락 / 확정', v: stats.done, bg: 'bg-emerald-50', fg: 'text-emerald-700' },
          ].map((c) => (
            <button
              key={c.label}
              onClick={() => {
                const keyMap = { '총 받은 제안': 'all', '검토 필요': '검토중', '추가정보 대기': '추가정보 요청', '회원 확인중': '회원 확인중', '수락 / 확정': '수락' };
                setTab(keyMap[c.label] || 'all');
              }}
              className={`rounded-2xl border border-slate-200 ${c.bg} p-4 text-left transition hover:shadow-md ${
                (tab === 'all' && c.label === '총 받은 제안') ||
                (tab === '검토중' && c.label === '검토 필요') ||
                (tab === '추가정보 요청' && c.label === '추가정보 대기') ||
                (tab === '회원 확인중' && c.label === '회원 확인중') ||
                (tab === '수락' && c.label === '수락 / 확정')
                  ? 'ring-2 ring-violet-300 shadow-sm' : ''
              }`}
            >
              <div className="text-[11px] font-medium text-slate-500">{c.label}</div>
              <div className={`mt-1 text-2xl font-black ${c.fg}`}>
                {c.v}
                <span className="ml-0.5 text-xs font-medium text-slate-400">건</span>
              </div>
            </button>
          ))}
        </div>

        {/* ── 조치 필요 알림 ── */}
        {stats.needAction > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-3">
            <AlertCircle size={18} className="shrink-0 text-indigo-600" />
            <span className="text-sm text-indigo-800">
              <b>{stats.needAction}건</b>의 제안이 내 조치를 기다리고 있습니다.
            </span>
            <button
              onClick={() => setTab('검토중')}
              className="ml-auto shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 transition"
            >
              검토 필요 보기
            </button>
          </div>
        )}

        {/* ── 필터 탭 + 검색 ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto">
            {TABS.map((t) => {
              const cnt = t.key === 'all'
                ? inbox.length
                : inbox.filter((o) => o.status === t.key).length;
              if (t.key !== 'all' && cnt === 0) return null;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                    tab === t.key
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      tab === t.key ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && setQ('')}
              className="w-48 rounded-xl border border-slate-200 py-2 pl-8 pr-8 text-xs outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="업체 · 회원 · 담당 검색"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ── 테이블 ── */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">불러오는 중...</div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <Inbox size={40} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">
              {q || tab !== 'all' ? '조건에 맞는 제안이 없습니다.' : '받은 제안이 없습니다.'}
            </p>
            {(q || tab !== 'all') && (
              <button
                onClick={() => { setQ(''); setTab('all'); }}
                className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                필터 초기화
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* 헤더 — desktop only */}
            <div
              className="hidden items-center border-b border-slate-200 bg-slate-50 px-5 py-3 lg:grid"
              style={{ gridTemplateColumns: COL.map((c) => c.w).join(' ') }}
            >
              {COL.map((c) => (
                <button
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="flex items-center gap-1 text-left text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                >
                  {c.label}
                  {sortKey === c.key && <ArrowUpDown size={11} className="text-violet-500" />}
                </button>
              ))}
            </div>

            {/* 행 — card on mobile, grid row on desktop */}
            {rows.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full border-b border-slate-100 text-left text-sm transition hover:bg-slate-50 ${
                  selected?.id === r.id
                    ? 'border-l-2 border-l-violet-500 bg-violet-50/50'
                    : r.status === '검토중'
                      ? 'bg-indigo-50/30'
                      : 'bg-white'
                } block px-4 py-3 lg:grid lg:items-center lg:px-5 lg:py-3.5`}
                style={{ gridTemplateColumns: COL.map((c) => c.w).join(' ') }}
              >
                {/* Mobile card layout */}
                <div className="lg:contents">
                  <div className="flex items-center justify-between lg:hidden">
                    <span className="truncate font-medium text-slate-800">{r.agency}</span>
                    <div className="flex items-center gap-1.5">
                      {r.sentDate && !['수락', '소개 확정', '반려', '철회', '만료'].includes(r.status) && (() => {
                        const dl = proposalDaysLeft(r.sentDate);
                        return dl !== null && dl <= 5 ? (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${dl <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>D-{dl}</span>
                        ) : null;
                      })()}
                      <StatusChip label={r.status} />
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 lg:hidden">
                    <span className="text-xs text-slate-500">{r.memberId} → {r.candidate}</span>
                    <ScoreBar score={r.score} />
                  </div>
                  <div className="mt-1 flex items-center justify-between lg:hidden">
                    <ResponseBadge lastAction={r.lastAction} status={r.status} />
                    <span className="text-xs text-slate-400">{r.owner}</span>
                  </div>
                  {/* Desktop grid cells */}
                  <span className="hidden truncate font-medium text-slate-800 lg:block">{r.agency}</span>
                  <span className="hidden text-slate-600 lg:block">{r.memberId}</span>
                  <span className="hidden text-slate-600 lg:block">{r.candidate}</span>
                  <span className="hidden lg:block"><ScoreBar score={r.score} /></span>
                  <span className="hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <StatusChip label={r.status} />
                      {r.sentDate && !['수락', '소개 확정', '반려', '철회', '만료'].includes(r.status) && (() => {
                        const dl = proposalDaysLeft(r.sentDate);
                        return dl !== null && dl <= 5 ? (
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${dl <= 2 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>D-{dl}</span>
                        ) : null;
                      })()}
                    </div>
                  </span>
                  <span className="hidden lg:block"><ResponseBadge lastAction={r.lastAction} status={r.status} /></span>
                  <span className="hidden text-xs text-slate-500 lg:block">{r.owner}</span>
                </div>
              </button>
            ))}

            {/* 푸터 — 전환율 */}
            <div className="flex items-center justify-between bg-slate-50 px-5 py-2.5 text-xs text-slate-500">
              <span>
                총 {rows.length}건
                {tab !== 'all' ? ` (전체 ${inbox.length}건)` : ''}
              </span>
              <span>
                처리율 <b className="text-slate-700">{responseRate}%</b> · 수락률{' '}
                <b className="text-slate-700">{acceptRate}%</b>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── 상세 패널 — full overlay on mobile ── */}
      {selected && (
        <div className="fixed inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
          >
            <ChevronLeft size={18} /> 목록으로
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ProposalDetailPanel
              title="받은 제안 상세"
              item={selected}
              onNavigateToMember={navigateToMember}
              actions={actions}
              onOpenConsent={(side) => setConsentModal({ open: true, side })}
              onMeetingAction={(type) => {
                const autoSettlement = () => {
                  const dueDate = new Date();
                  dueDate.setDate(dueDate.getDate() + 30);
                  createSettlement({
                    partner: selected.agency,
                    pair: `${selected.memberId} ↔ ${selected.candidate}`,
                    amount: '500만',
                    split: selected.recommendedSplit || '50:50',
                    due: dueDate.toISOString().slice(0, 10).replace(/-/g, '.'),
                    proposalId: selected.id,
                  });
                };
                const addToCalendar = (detail) => {
                  const member = members.find((m) => m.id === selected.memberId);
                  if (member) {
                    const meetingDate = new Date();
                    meetingDate.setDate(meetingDate.getDate() + 7);
                    const newMeeting = {
                      type: '만남',
                      date: meetingDate.toISOString().slice(0, 10),
                      time: '19:00',
                      location: detail || '미정',
                      note: `${selected.candidate} 첫만남 (${selected.agency})`,
                      proposalId: selected.id,
                    };
                    updateMember(member.id, { meetings: [...(member.meetings || []), newMeeting] });
                  }
                };
                if (type === 'place') {
                  const detail = window.prompt('약속 장소와 일시를 입력하세요 (예: 강남역 카페 3/20 19:00)');
                  if (detail) {
                    setMeetingArranged(selected.id, { type: '약속장소', detail });
                    setSelected((prev) => prev ? { ...prev, meetingArranged: { type: '약속장소', detail }, status: '소개 확정' } : prev);
                    addToCalendar(detail);
                    autoSettlement();
                    showToast('소개 확정 — 캘린더 등록 + 정산 레코드가 자동 생성되었습니다.', 'emerald');
                  }
                } else {
                  const member = members.find((m) => m.id === selected.memberId);
                  const phone = member?.phone || '등록된 번호 없음';
                  setMeetingArranged(selected.id, { type: '연락처전달', detail: phone });
                  setSelected((prev) => prev ? { ...prev, meetingArranged: { type: '연락처전달', detail: phone }, status: '소개 확정' } : prev);
                  addToCalendar('연락처 전달');
                  autoSettlement();
                  showToast(`소개 확정 — 연락처 전달 완료 + 캘린더/정산 자동 생성`, 'emerald');
                }
              }}
            />
          </div>
        </div>
      )}
      <MemberConsentModal
        open={consentModal.open}
        onClose={() => setConsentModal({ open: false, side: null })}
        proposal={selected}
        memberName={members.find((m) => m.id === selected?.memberId)?.name}
        counterpart={selected?.candidate}
        side={consentModal.side}
        onConsent={(field, value) => {
          updateProposalConsent(selected.id, field, value);
          setSelected((prev) => prev ? { ...prev, [field]: value } : prev);
          showToast(`${field === 'ourMemberConsent' ? '우리 회원' : '상대 회원'}: ${value}`, value === '동의' ? 'emerald' : 'rose');
        }}
      />

      {/* ── 반려 사유 모달 (Phase 2-4) ── */}
      {rejectModal && selected && (() => {
        const RejectModal = () => {
          const [reason, setReason] = useState('');
          const [note, setNote] = useState('');
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setRejectModal(false)}>
              <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-900">제안 반려</h3>
                <p className="mt-1 text-sm text-slate-500">{selected.id} ({selected.agency}) 반려 사유를 선택하세요.</p>
                <div className="mt-4 space-y-2">
                  {rejectionReasons.map((r) => (
                    <button
                      key={r.code}
                      onClick={() => setReason(r.code)}
                      className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm transition ${
                        reason === r.code ? 'border-rose-300 bg-rose-50 text-rose-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-medium">{r.label}</div>
                      <div className="text-xs text-slate-400">{r.desc}</div>
                    </button>
                  ))}
                </div>
                {reason === 'OTHER' && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="상세 사유를 입력하세요..."
                    rows={2}
                    className="mt-3 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
                  />
                )}
                <div className="mt-5 flex justify-end gap-3">
                  <button onClick={() => setRejectModal(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">취소</button>
                  <button
                    disabled={!reason}
                    onClick={async () => {
                      const label = rejectionReasons.find((r) => r.code === reason)?.label || reason;
                      await updateProposalConsent(selected.id, 'rejectionReason', { code: reason, label, note });
                      await handleAction('반려');
                      setRejectModal(false);
                      showToast(`${selected.id} 반려 — 사유: ${label}`, 'rose');
                    }}
                    className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40"
                  >반려 확정</button>
                </div>
              </div>
            </div>
          );
        };
        return <RejectModal />;
      })()}
    </div>
  );
}
