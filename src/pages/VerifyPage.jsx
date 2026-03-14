import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck, Clock, AlertTriangle, CheckCircle2, FileText,
  User, Building2, GraduationCap, Wallet, Users, Fingerprint,
  UserCheck, ChevronRight, FileCheck, FilePlus, Send, ChevronLeft,
} from 'lucide-react';
import useAppStore from '../stores/appStore';
import { useVerifications } from '../hooks/useVerifications';
import StatusChip from '../components/common/StatusChip';

const VERIFY_TYPE_META = {
  '자산 인증': { icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  '소득 인증': { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  '재직 인증': { icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  '학력 인증': { icon: GraduationCap, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  '가족 인증': { icon: Users, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
  '신원 인증': { icon: Fingerprint, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  '대면검증': { icon: UserCheck, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
};

const STATUS_FILTERS = [
  { key: 'all', label: '전체' },
  { key: '원본 검토중', label: '검토중' },
  { key: '대기', label: '대기' },
  { key: '서류보완 요청', label: '보완요청' },
  { key: '승인', label: '승인' },
];

const VERIFY_STEPS = ['서류 접수', '원본 검토', '보완/확인', '승인 완료'];

function getStepIndex(status) {
  if (status === '대기') return 0;
  if (status === '원본 검토중') return 1;
  if (status === '서류보완 요청') return 2;
  if (status === '승인') return 3;
  return 0;
}

function getDueUrgency(due) {
  if (due === '오늘') return 'urgent';
  if (due === '내일') return 'high';
  return 'normal';
}

export default function VerifyPage() {
  const { items, loading, fetchVerifications, updateStatus } = useVerifications();
  const showToast = useAppStore((s) => s.showToast);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [memoText, setMemoText] = useState('');
  const [memos, setMemos] = useState({});

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  useEffect(() => {
    if (!selected && items.length > 0) setSelected(items[0]);
  }, [items]);

  useEffect(() => {
    if (selected) {
      setMemoText(memos[selected.id] || selected.memo || '');
    }
  }, [selected?.id]);

  const stats = useMemo(() => {
    const total = items.length;
    const todayDue = items.filter((i) => i.due === '오늘').length;
    const reviewing = items.filter((i) => i.status === '원본 검토중').length;
    const needFix = items.filter((i) => i.status === '서류보완 요청').length;
    const approved = items.filter((i) => i.status === '승인').length;
    return { total, todayDue, reviewing, needFix, approved };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((i) => i.status === activeFilter);
  }, [items, activeFilter]);

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const prevStatus = selected.status;
    const { error } = await updateStatus(selected.id, newStatus);
    if (!error) {
      setSelected((prev) => (prev ? { ...prev, status: newStatus } : prev));
      const label = newStatus === '승인' ? '승인 처리' : newStatus === '서류보완 요청' ? '보완 요청' : '반려 처리';
      const tone = newStatus === '승인' ? 'emerald' : 'amber';
      showToast(`${selected.memberName || selected.memberId} ${selected.type} ${label}되었습니다.`, tone, () => {
        updateStatus(selected.id, prevStatus);
        setSelected((prev) => (prev ? { ...prev, status: prevStatus } : prev));
      });
    }
  };

  const handleSaveMemo = () => {
    if (!selected) return;
    setMemos((prev) => ({ ...prev, [selected.id]: memoText }));
    showToast(`${selected.memberName || selected.memberId} 검토 메모가 저장되었습니다.`, 'emerald');
  };

  const typeMeta = selected ? (VERIFY_TYPE_META[selected.type] || VERIFY_TYPE_META['신원 인증']) : null;
  const TypeIcon = typeMeta?.icon || FileText;

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[1fr_400px]">
      {/* Left: List */}
      <div className={`space-y-5 overflow-y-auto p-4 md:p-6 lg:p-8 ${selected ? 'hidden lg:block' : ''}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <ShieldCheck size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">인증센터</h2>
            <p className="text-sm text-slate-500">회원 서류 인증 접수 · 검토 · 승인을 관리합니다</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={FileText} label="전체" value={stats.total} tone="slate" />
          <StatCard icon={AlertTriangle} label="오늘 마감" value={stats.todayDue} tone="rose" highlight={stats.todayDue > 0} />
          <StatCard icon={Clock} label="검토중" value={stats.reviewing} tone="blue" />
          <StatCard icon={FilePlus} label="보완요청" value={stats.needFix} tone="amber" />
          <StatCard icon={CheckCircle2} label="승인완료" value={stats.approved} tone="emerald" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === 'all' ? items.length : items.filter((i) => i.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  activeFilter === f.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeFilter === f.key ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">불러오는 중...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">해당 상태의 인증 건이 없습니다.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Table Header */}
            <div className="hidden grid-cols-[2.2fr_1.2fr_0.8fr_0.7fr_1fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 lg:grid">
              <div>회원 / 인증 종류</div>
              <div>담당자</div>
              <div>접수일</div>
              <div>마감</div>
              <div>상태</div>
            </div>
            {/* Table Rows */}
            {filteredItems.map((row) => {
              const meta = VERIFY_TYPE_META[row.type] || VERIFY_TYPE_META['신원 인증'];
              const Icon = meta.icon;
              const urgency = getDueUrgency(row.due);
              const isSelected = selected?.id === row.id;
              return (
                <button
                  key={row.id}
                  onClick={() => setSelected(row)}
                  className={`w-full border-b border-slate-100 text-left text-sm transition hover:bg-slate-50 ${
                    isSelected ? 'bg-indigo-50/60 border-l-2 border-l-indigo-500' : 'bg-white'
                  } block px-4 py-3 lg:grid lg:grid-cols-[2.2fr_1.2fr_0.8fr_0.7fr_1fr] lg:items-center lg:px-5 lg:py-3.5`}
                >
                  {/* Mobile card */}
                  <div className="lg:contents">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg} ${meta.border} border`}>
                        <Icon size={16} className={meta.color} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 truncate">{row.memberName || row.memberId}</span>
                          <span className="text-xs text-slate-400">{row.memberId}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{row.type}</div>
                      </div>
                      <div className="lg:hidden"><StatusChip label={row.status} /></div>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between lg:hidden">
                      <span className="text-xs text-slate-500">{row.owner} · {row.submittedAt || '-'}</span>
                      <span className={`text-xs font-medium ${urgency === 'urgent' ? 'text-rose-600' : urgency === 'high' ? 'text-amber-600' : 'text-slate-500'}`}>{row.due}</span>
                    </div>
                    {/* Desktop-only cells */}
                    <div className="hidden text-slate-600 lg:block">{row.owner}</div>
                    <div className="hidden text-slate-500 lg:block">{row.submittedAt || '-'}</div>
                    <div className={`hidden font-medium lg:block ${urgency === 'urgent' ? 'text-rose-600' : urgency === 'high' ? 'text-amber-600' : 'text-slate-600'}`}>
                      {urgency === 'urgent' && <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />}
                      {row.due}
                    </div>
                    <div className="hidden lg:block"><StatusChip label={row.status} /></div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Detail Panel — full overlay on mobile */}
      {selected ? (
        <div className="fixed inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto lg:border-l lg:border-slate-200">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
          >
            <ChevronLeft size={18} /> 목록으로
          </button>
          <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {/* Detail Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${typeMeta.bg} ${typeMeta.border}`}>
                  <TypeIcon size={20} className={typeMeta.color} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-slate-400">인증 상세</div>
                  <h3 className="mt-0.5 text-lg font-bold text-slate-900">{selected.type}</h3>
                </div>
              </div>
              <StatusChip label={selected.status} />
            </div>

            {/* Verification Stepper */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 text-xs font-bold text-slate-500">인증 처리 단계</div>
              <div className="flex items-center gap-1">
                {VERIFY_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(selected.status);
                  const isActive = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;
                  return (
                    <React.Fragment key={step}>
                      <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 52 }}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition ${
                          isCurrent
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-200'
                            : isActive
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                        }`}>
                          {idx === 3 && isActive ? <CheckCircle2 size={14} /> : idx + 1}
                        </div>
                        <div className={`text-[10px] font-medium text-center leading-tight ${
                          isActive ? 'text-indigo-700' : 'text-slate-400'
                        }`}>{step}</div>
                      </div>
                      {idx < VERIFY_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 rounded-full ${idx < currentIdx ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Member Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">회원</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <User size={14} className="text-slate-500" />
                  <span className="text-sm font-semibold text-slate-900">{selected.memberName || '-'}</span>
                  <span className="text-xs text-slate-400">{selected.memberId}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">담당자</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{selected.owner}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">접수일</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{selected.submittedAt || '-'}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">마감일</div>
                <div className={`mt-1 text-sm font-medium ${
                  getDueUrgency(selected.due) === 'urgent' ? 'text-rose-600' : getDueUrgency(selected.due) === 'high' ? 'text-amber-600' : 'text-slate-800'
                }`}>
                  {selected.due}
                  {getDueUrgency(selected.due) === 'urgent' && <span className="ml-1.5 text-xs font-bold text-rose-500">긴급</span>}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileCheck size={16} className="text-slate-500" />
                제출 서류
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                  {(selected.docs || []).length}건
                </span>
              </div>
              <div className="mt-3 space-y-2">
                {(selected.docs || []).length === 0 ? (
                  <div className="text-sm text-slate-400">제출된 서류가 없습니다.</div>
                ) : (
                  selected.docs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <FileText size={14} className="shrink-0 text-slate-400" />
                      <span className="text-sm text-slate-700">{doc}</span>
                      <ChevronRight size={14} className="ml-auto text-slate-300" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Review Memo */}
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
                <Send size={15} className="text-slate-500" />
                검토 메모
              </div>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 resize-none"
                rows={3}
                placeholder="검토 내용을 입력하세요 (보완요청 시 회원에게 전달됩니다)"
                value={memoText}
                onChange={(e) => setMemoText(e.target.value)}
              />
              <button
                onClick={handleSaveMemo}
                className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition"
              >
                메모 저장
              </button>
            </div>

            {/* Action Buttons */}
            {selected.status !== '승인' && (
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleAction('서류보완 요청')}
                  className="flex-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition"
                >
                  보완 요청
                </button>
                <button
                  onClick={() => handleAction('승인')}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  승인 처리
                </button>
              </div>
            )}
            {selected.status === '승인' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-700">
                  <CheckCircle2 size={16} />
                  인증 승인 완료
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, highlight }) {
  const toneStyles = {
    slate: 'bg-white border-slate-200 text-slate-600',
    rose: highlight ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-slate-200 text-slate-600',
    blue: 'bg-white border-slate-200 text-blue-600',
    amber: 'bg-white border-slate-200 text-amber-600',
    emerald: 'bg-white border-slate-200 text-emerald-600',
  };
  const iconStyles = {
    slate: 'text-slate-400',
    rose: highlight ? 'text-rose-500' : 'text-slate-400',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
  };
  return (
    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${toneStyles[tone]}`}>
      <Icon size={18} className={iconStyles[tone]} />
      <div>
        <div className={`text-xl font-bold ${highlight ? 'text-rose-700' : ''}`}>{value}</div>
        <div className="text-[11px] text-slate-500">{label}</div>
      </div>
    </div>
  );
}
