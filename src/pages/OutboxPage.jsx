import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, Bell, XCircle, Eye, CheckCircle2, Clock,
  AlertCircle, ArrowUpDown, Send, Inbox, ChevronLeft,
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

/* ── 매칭 점수 시각화 ───────────────────────────────────── */
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

/* ── 경과 시간 + 긴급도 표시 ──────────────────────────── */
function ElapsedBadge({ lastAction, status }) {
  if (['수락', '소개 확정'].includes(status)) {
    return <span className="text-xs font-medium text-emerald-600">{lastAction}</span>;
  }
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

/* ── 제안서 남은 일수 (Phase 1-6) ── */
function proposalDaysLeft(sentDate) {
  if (!sentDate) return null;
  return 14 - Math.floor((Date.now() - new Date(sentDate).getTime()) / (1000 * 60 * 60 * 24));
}

/* ── 철회 사유 모달 ──────────────────────────────────────── */
function WithdrawModal({ selected, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-slate-900">제안 철회</h3>
        <p className="mt-1 text-sm text-slate-500">{selected.id} ({selected.agency}) 철회 사유를 선택하세요.</p>
        <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
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
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">취소</button>
          <button
            disabled={!reason}
            onClick={() => onConfirm(reason, note)}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40"
          >철회 확정</button>
        </div>
      </div>
    </div>
  );
}

/* ── 상태별 필터 탭 ──────────────────────────────────────── */
const TABS = [
  { key: 'all', label: '전체' },
  { key: '검토중', label: '검토중' },
  { key: '열람함', label: '열람함' },
  { key: '응답대기', label: '응답대기' },
  { key: '회원 확인중', label: '회원확인' },
  { key: 'positive', label: '수락/확정' },
];

/* ── 테이블 컬럼 ─────────────────────────────────────────── */
const COL = [
  { key: 'agency', label: '상대 업체', w: '1.1fr' },
  { key: 'memberId', label: '보낸 회원', w: '0.9fr' },
  { key: 'candidate', label: '상대 후보', w: '0.7fr' },
  { key: 'score', label: '매칭 점수', w: '1.05fr' },
  { key: 'status', label: '상태', w: '0.85fr' },
  { key: 'lastAction', label: '경과', w: '0.7fr' },
  { key: 'owner', label: '담당', w: '0.55fr' },
];

/* ── 기본 공개 범위 (ProposalModal 기본값과 일치) ────── */
const DEFAULT_VISIBILITY = ['학력', '궁합 요약', '소득 구간'];

export default function OutboxPage() {
  const { outbox, loading, fetchOutbox, updateProposalStatus, updateProposalConsent, setMeetingArranged } = useProposals();
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
  const [withdrawModal, setWithdrawModal] = useState(false);

  useEffect(() => { fetchOutbox(); }, [fetchOutbox]);
  useEffect(() => { if (!selected && outbox.length) setSelected(outbox[0]); }, [outbox]);

  /* ── 제안서 14일 자동 만료 (Phase 1-6) ── */
  useEffect(() => {
    outbox.forEach((p) => {
      if (!p.sentDate || ['수락', '소개 확정', '반려', '철회', '만료'].includes(p.status)) return;
      if (proposalDaysLeft(p.sentDate) <= 0) {
        updateProposalStatus(p.id, '만료');
        showToast(`${p.id} 제안서가 14일 경과로 자동 만료되었습니다.`, 'slate');
      }
    });
  }, [outbox]);

  /* 회원 이름 조회 */
  const getMemberName = (memberId) => {
    const m = members.find((x) => x.id === memberId);
    return m?.name || '';
  };

  /* 데이터 보강 — visibility 추가 */
  const enriched = useMemo(
    () => outbox.map((o) => ({
      ...o,
      visibility: o.visibility || DEFAULT_VISIBILITY,
    })),
    [outbox],
  );

  /* ── 통계 ──────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const s = { total: 0, '검토중': 0, '열람함': 0, '응답대기': 0, '회원 확인중': 0, done: 0, urgent: 0 };
    s.total = outbox.length;
    outbox.forEach((o) => {
      if (o.status === '검토중') s['검토중']++;
      else if (o.status === '열람함') s['열람함']++;
      else if (o.status === '응답대기') s['응답대기']++;
      else if (o.status === '회원 확인중') s['회원 확인중']++;
      else if (['수락', '소개 확정'].includes(o.status)) s.done++;
      if (
        !['수락', '소개 확정'].includes(o.status) &&
        ['어제', '1일 전', '2일 전', '3일 전'].includes(o.lastAction)
      ) s.urgent++;
    });
    return s;
  }, [outbox]);

  /* ── 필터 + 검색 + 정렬 ────────────────────────────────── */
  const rows = useMemo(() => {
    let list = enriched;
    if (tab === 'positive') list = list.filter((o) => ['수락', '소개 확정'].includes(o.status));
    else if (tab !== 'all') list = list.filter((o) => o.status === tab);

    if (q) {
      const t = q.toLowerCase();
      list = list.filter((o) =>
        [o.agency, o.memberId, o.candidate, o.owner, getMemberName(o.memberId)]
          .some((v) => v.toLowerCase().includes(t)),
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
  }, [enriched, tab, q, sortKey, sortDir, members]);

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
    const prevStatus = selected.status;
    const { error } = await updateProposalStatus(selected.id, newStatus);
    if (!error) {
      const logAction = newStatus === '철회' ? LOG_ACTIONS.PROPOSAL_WITHDRAW : newStatus === '소개 확정' ? LOG_ACTIONS.PROPOSAL_SEND : null;
      if (logAction) addLog({ action: logAction, target: 'proposal', targetId: selected.id, detail: `${selected.member} → ${selected.partner}` });
      setSelected((prev) => (prev ? { ...prev, status: newStatus, lastAction: '방금' } : prev));
      const label = newStatus === '철회' ? `${selected.id} 제안이 철회되었습니다.`
        : newStatus === '소개 확정' ? `${selected.id} 소개 확정 처리되었습니다.`
        : `${selected.id} 상태가 "${newStatus}"(으)로 변경되었습니다.`;
      const tone = newStatus === '철회' ? 'rose' : 'emerald';
      showToast(label, tone, () => {
        updateProposalStatus(selected.id, prevStatus);
        setSelected((prev) => (prev ? { ...prev, status: prevStatus } : prev));
      });
    }
  };

  const navigateToMember = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    if (member) { setSelectedMyMember(member); setActiveTab('myMembers'); }
  };

  /* ── 상태별 맥락 액션 ──────────────────────────────────── */
  const actions = (() => {
    if (!selected) return null;
    const st = selected.status;
    return (
      <div className="flex w-full flex-col gap-2">
        {/* 상태 안내 메시지 */}
        {st === '검토중' && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs text-slate-600">
            <Clock size={12} className="inline mr-1.5 -mt-0.5" />
            상대 업체가 아직 열람하지 않았습니다.
          </div>
        )}
        {st === '열람함' && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-700">
            <Eye size={12} className="inline mr-1.5 -mt-0.5" />
            상대 업체가 프로필을 열람했습니다. 응답을 기다리고 있습니다.
          </div>
        )}
        {st === '응답대기' && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-700">
            <Clock size={12} className="inline mr-1.5 -mt-0.5" />
            상대측 응답을 기다리는 중입니다.
          </div>
        )}
        {st === '회원 확인중' && (
          <div className="rounded-xl bg-violet-50 border border-violet-200 px-4 py-2.5 text-xs text-violet-700">
            <Clock size={12} className="inline mr-1.5 -mt-0.5" />
            상대 업체에서 회원에게 확인 중입니다.
          </div>
        )}
        {st === '철회' && (
          <div className="flex w-full items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
            <XCircle size={14} />
            제안이 철회되었습니다
          </div>
        )}

        {/* 주요 액션 버튼 */}
        {['검토중', '열람함', '응답대기'].includes(st) && (
          <button
            onClick={() => {
              const label = st === '검토중' ? '열람 요청' : '응답 요청';
              addNotification({ title: `${label} 리마인드 발송`, body: `${selected.agency} · ${selected.id}`, type: 'remind_sent', tab: 'outbox' });
              showToast(`${selected.agency}에 ${label} 리마인드가 발송되었습니다.`, 'amber');
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition"
          >
            <Bell size={15} />
            {st === '검토중' ? '열람 요청 리마인드' : '응답 요청 리마인드'}
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
                onClick={() => {
                  addNotification({ title: '확인 요청 리마인드 발송', body: `${selected.agency} · ${selected.id}`, type: 'remind_sent', tab: 'outbox' });
                  showToast(`${selected.agency}에 확인 요청 리마인드가 발송되었습니다.`, 'amber');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700 hover:bg-amber-100 transition"
              >
                <Bell size={15} /> 확인 요청 리마인드
              </button>
            )}
          </div>
        )}
        {st === '수락' && (
          <button
            onClick={() => handleAction('소개 확정')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
          >
            <CheckCircle2 size={15} /> 소개 확정 처리
          </button>
        )}
        {st === '소개 확정' && (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={15} /> 소개 확정 완료
          </div>
        )}

        {/* 보조 액션 */}
        {st !== '철회' && (
          <div className="flex gap-2">
            <button
              onClick={() =>
                showToast(
                  `공개 범위: ${selected.visibility?.join(', ') || '기본 정보'}`,
                  'indigo',
                )
              }
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              <Eye size={13} /> 공개 범위
            </button>
            {!['수락', '소개 확정'].includes(st) && (
              <button
                onClick={() => setWithdrawModal(true)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <XCircle size={13} /> 제안 철회
              </button>
            )}
          </div>
        )}
      </div>
    );
  })();

  /* ── 전환율 계산 ────────────────────────────────────────── */
  const readRate = stats.total
    ? Math.round(((stats['열람함'] + stats['회원 확인중'] + stats.done) / stats.total) * 100)
    : 0;
  const acceptRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  /* ── 렌더링 ─────────────────────────────────────────────── */
  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1.1fr_380px]">
      <div className={`space-y-4 overflow-y-auto p-4 md:p-6 ${selected ? 'hidden lg:block' : ''}`}>
        {/* ── 요약 통계 카드 ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { filterKey: 'all', label: '총 보낸 제안', v: stats.total, bg: 'bg-white', fg: 'text-slate-900' },
            { filterKey: '검토중', label: '열람 대기', v: stats['검토중'], bg: 'bg-indigo-50', fg: 'text-indigo-700' },
            { filterKey: '열람함', label: '열람 완료', v: stats['열람함'], bg: 'bg-blue-50', fg: 'text-blue-700' },
            { filterKey: '회원 확인중', label: '회원 확인중', v: stats['회원 확인중'], bg: 'bg-violet-50', fg: 'text-violet-700' },
            { filterKey: 'positive', label: '수락 / 확정', v: stats.done, bg: 'bg-emerald-50', fg: 'text-emerald-700' },
          ].map((c) => (
            <button
              key={c.filterKey}
              onClick={() => setTab(tab === c.filterKey ? 'all' : c.filterKey)}
              className={`rounded-2xl border border-slate-200 ${c.bg} p-4 text-left transition hover:shadow-md ${
                tab === c.filterKey ? 'ring-2 ring-violet-300 shadow-sm' : ''
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

        {/* ── 긴급 알림 바 ── */}
        {stats.urgent > 0 && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <span className="text-sm text-amber-800">
              <b>{stats.urgent}건</b>의 제안이 24시간 이상 미응답 상태입니다.
            </span>
            <button
              onClick={() => {
                addNotification({ title: '일괄 리마인드 발송', body: `미응답 ${stats.urgent}건에 리마인드 발송 완료`, type: 'remind_sent', tab: 'outbox' });
                showToast(`미응답 ${stats.urgent}건에 일괄 리마인드가 발송되었습니다.`, 'amber');
              }}
              className="ml-auto shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700 transition"
            >
              일괄 리마인드
            </button>
          </div>
        )}

        {/* ── 필터 탭 + 검색 ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto">
            {TABS.map((t) => {
              const cnt = t.key === 'all'
                ? outbox.length
                : t.key === 'positive'
                  ? outbox.filter((o) => ['수락', '소개 확정'].includes(o.status)).length
                  : outbox.filter((o) => o.status === t.key).length;
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
              {q || tab !== 'all' ? '조건에 맞는 제안이 없습니다.' : '보낸 제안이 없습니다.'}
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

            {/* 행 — card on mobile, grid on desktop */}
            {rows.map((r) => {
              const memberName = getMemberName(r.memberId);
              return (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={`w-full border-b border-slate-100 text-left text-sm transition hover:bg-slate-50 ${
                    selected?.id === r.id
                      ? 'border-l-2 border-l-violet-500 bg-violet-50/50'
                      : 'bg-white'
                  } block px-4 py-3 lg:grid lg:items-center lg:px-5 lg:py-3.5`}
                  style={{ gridTemplateColumns: COL.map((c) => c.w).join(' ') }}
                >
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
                      <span className="text-xs text-slate-500">{memberName || r.memberId} → {r.candidate}</span>
                      <ScoreBar score={r.score} />
                    </div>
                    <div className="mt-1 flex items-center justify-between lg:hidden">
                      <ElapsedBadge lastAction={r.lastAction} status={r.status} />
                      <span className="text-xs text-slate-400">{r.owner}</span>
                    </div>
                    {/* Desktop grid cells */}
                    <span className="hidden truncate font-medium text-slate-800 lg:block">{r.agency}</span>
                    <div className="hidden min-w-0 lg:block">
                      {memberName ? (<><div className="truncate font-medium text-slate-800">{memberName}</div><div className="text-[11px] text-slate-400">{r.memberId}</div></>) : (<span className="text-slate-600">{r.memberId}</span>)}
                    </div>
                    <span className="hidden truncate text-slate-600 lg:block">{r.candidate}</span>
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
                    <span className="hidden lg:block"><ElapsedBadge lastAction={r.lastAction} status={r.status} /></span>
                    <span className="hidden truncate text-xs text-slate-500 lg:block">{r.owner}</span>
                  </div>
                </button>
              );
            })}

            {/* 푸터 — 전환율 */}
            <div className="flex items-center justify-between bg-slate-50 px-5 py-2.5 text-xs text-slate-500">
              <span>
                총 {rows.length}건
                {tab !== 'all' ? ` (전체 ${outbox.length}건)` : ''}
              </span>
              <span>
                열람률 <b className="text-slate-700">{readRate}%</b> · 수락률{' '}
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
              title="보낸 제안 상세"
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

      {/* ── 철회 사유 모달 (Phase 2-4) ── */}
      {withdrawModal && selected && (
        <WithdrawModal
          selected={selected}
          onClose={() => setWithdrawModal(false)}
          onConfirm={async (reason, note) => {
            const label = rejectionReasons.find((r) => r.code === reason)?.label || reason;
            await updateProposalConsent(selected.id, 'withdrawalReason', { code: reason, label, note });
            await handleAction('철회');
            setWithdrawModal(false);
          }}
        />
      )}
    </div>
  );
}
