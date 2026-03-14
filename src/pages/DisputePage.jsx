import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield, AlertTriangle, Scale, FileSearch, Ban, Plus,
  Clock, MessageSquare, Send, Search, X, CheckCircle2,
  ChevronLeft, ChevronRight, ArrowRight, Users,
} from 'lucide-react';
import useAppStore from '../stores/appStore';
import { useDisputes } from '../hooks/useDisputes';
import { useMessages } from '../hooks/useMessages';
import { managerList, disputeCategories } from '../lib/constants';

/* ── Level / Category config ──────────────────────────── */
const LEVEL_CONFIG = {
  '주의':   { dot: 'bg-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200',    text: 'text-rose-700',    ring: 'ring-rose-200' },
  '중재중':  { dot: 'bg-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-700',   ring: 'ring-amber-200' },
  '증빙검토': { dot: 'bg-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-700',    ring: 'ring-blue-200' },
  '패널티':  { dot: 'bg-slate-800',   bg: 'bg-slate-100',  border: 'border-slate-300',   text: 'text-slate-800',   ring: 'ring-slate-300' },
  '해결':   { dot: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', ring: 'ring-emerald-200' },
};

const CATEGORY_TONE = {
  '우회접촉':   'bg-rose-50 text-rose-700 border-rose-200',
  '허위정보':   'bg-amber-50 text-amber-700 border-amber-200',
  '정산분쟁':   'bg-blue-50 text-blue-700 border-blue-200',
  '정보무단공유': 'bg-violet-50 text-violet-700 border-violet-200',
  '약속불이행':  'bg-slate-100 text-slate-700 border-slate-200',
  '프로필도용':  'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const ESCALATION_STEPS = ['주의', '중재중', '증빙검토', '패널티'];

/* ── Micro-components ──────────────────────────────────── */

function LevelBadge({ level }) {
  const c = LEVEL_CONFIG[level] || LEVEL_CONFIG['주의'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${c.bg} ${c.border} ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {level}
    </span>
  );
}

function CategoryBadge({ category }) {
  const tone = CATEGORY_TONE[category];
  if (!tone) return null;
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>{category}</span>;
}

function PriorityDot({ priority }) {
  const color = priority === '높음' ? 'bg-rose-500' : priority === '중간' ? 'bg-amber-400' : 'bg-slate-300';
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {priority}
    </span>
  );
}

function DaysOpenBadge({ days }) {
  const tone = days >= 14 ? 'text-rose-700 bg-rose-50 border-rose-200' : days >= 7 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-50 border-slate-200';
  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${tone}`}>
      <Clock size={10} />D+{days}
    </span>
  );
}

/* ── Escalation stepper ────────────────────────────────── */

function EscalationStepper({ currentLevel }) {
  if (currentLevel === '해결') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
        <CheckCircle2 size={15} className="text-emerald-600" />
        <span className="text-sm font-medium text-emerald-700">분쟁 해결 완료</span>
      </div>
    );
  }
  const currentIdx = ESCALATION_STEPS.indexOf(currentLevel);
  return (
    <div className="flex items-center gap-0.5">
      {ESCALATION_STEPS.map((step, idx) => {
        const isActive = idx === currentIdx;
        const isPast = idx < currentIdx;
        const c = LEVEL_CONFIG[step];
        return (
          <React.Fragment key={step}>
            {idx > 0 && <ChevronRight size={12} className={isPast ? 'text-slate-400' : 'text-slate-300'} />}
            <div className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
              isActive ? `${c.bg} ${c.border} ${c.text} border ring-2 ${c.ring}` :
              isPast ? `${c.bg} ${c.border} ${c.text} border opacity-50` :
              'bg-slate-50 border border-slate-200 text-slate-400'
            }`}>{step}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Message thread (separate component for hooks) ────── */

function MessageThread({ itemId }) {
  const [msgInput, setMsgInput] = useState('');
  const { messages, sendMessage } = useMessages(itemId);

  const handleSend = async () => {
    if (!msgInput.trim()) return;
    await sendMessage(msgInput.trim());
    setMsgInput('');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <MessageSquare size={15} /> 메시지 스레드
      </div>
      <div className="mt-3 max-h-44 space-y-2 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`rounded-xl p-2.5 text-sm ${
            msg.role === 'me' ? 'ml-6 bg-violet-50 text-violet-900' : 'mr-6 border border-slate-200 bg-white text-slate-700'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span>{msg.sender}</span>
              <span className="text-slate-400">{msg.date ? `${msg.date} ` : ''}{msg.time}</span>
            </div>
            <p className="mt-1 leading-relaxed">{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200"
          placeholder="상대 업체에 메시지 보내기..."
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!msgInput.trim()} className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

/* ── New dispute modal ─────────────────────────────────── */

function NewDisputeModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    partner: '', category: '우회접촉', issue: '', description: '', priority: '중간', owner: managerList[0], relatedMemberIds: '',
  });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const hasUnsavedData = form.partner.trim() || form.issue.trim() || form.description.trim() || form.relatedMemberIds.trim();

  const handleClose = () => {
    if (hasUnsavedData && !window.confirm('작성 중인 내용이 있습니다. 닫으시겠습니까?')) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!form.partner.trim() || !form.issue.trim()) return;
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
    onSubmit({
      partner: form.partner.trim(),
      category: form.category,
      issue: form.issue.trim(),
      description: form.description.trim(),
      priority: form.priority,
      owner: form.owner,
      daysOpen: 0,
      relatedMembers: form.relatedMemberIds ? form.relatedMemberIds.split(',').map((s) => s.trim()).filter(Boolean) : [],
      timeline: [{ date: dateStr, action: '분쟁 접수', by: form.owner }],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={handleClose}>
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">새 분쟁 등록</h3>
            <p className="mt-0.5 text-sm text-slate-500">파트너 업체와의 이슈를 기록합니다.</p>
          </div>
          <button onClick={handleClose} className="rounded-lg p-2 hover:bg-slate-100 transition"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600">상대 업체 *</label>
            <input value={form.partner} onChange={(e) => set('partner', e.target.value)} placeholder="업체명 입력"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600">분쟁 유형</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400">
                {disputeCategories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">우선순위</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400">
                {['높음', '중간', '낮음'].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">이슈 제목 *</label>
            <input value={form.issue} onChange={(e) => set('issue', e.target.value)} placeholder="분쟁 이슈를 간결하게 입력"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200" />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600">상세 설명</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="발생 경위, 근거, 요청사항 등을 상세히 기록..." rows={3}
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none resize-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600">담당자</label>
              <select value={form.owner} onChange={(e) => set('owner', e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400">
                {managerList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">관련 회원 ID</label>
              <input value={form.relatedMemberIds} onChange={(e) => set('relatedMemberIds', e.target.value)} placeholder="M001, N-5022"
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">취소</button>
          <button onClick={handleSubmit} disabled={!form.partner.trim() || !form.issue.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
            분쟁 등록
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main DisputePage
   ══════════════════════════════════════════════════════════ */

export default function DisputePage() {
  const { items, loading, fetchDisputes, updateLevel, createDispute } = useDisputes();
  const showToast = useAppStore((s) => s.showToast);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => { fetchDisputes(); }, [fetchDisputes]);
  /* auto-select removed — on mobile the list should stay visible */

  /* ── Computed ─────────────────────────────────────────── */
  const stats = useMemo(() => ({
    total: items.filter((i) => i.level !== '해결').length,
    '주의': items.filter((i) => i.level === '주의').length,
    '중재중': items.filter((i) => i.level === '중재중').length,
    '증빙검토': items.filter((i) => i.level === '증빙검토').length,
    '패널티': items.filter((i) => i.level === '패널티').length,
  }), [items]);

  const filtered = useMemo(() => {
    let result = items;
    if (activeFilter !== '전체') result = result.filter((i) => i.level === activeFilter);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((i) =>
        i.partner?.toLowerCase().includes(q) || i.issue?.toLowerCase().includes(q) ||
        i.id?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [items, activeFilter, searchTerm]);

  /* ── Handlers ────────────────────────────────────────── */
  const handleLevel = async (newLevel) => {
    if (!selected) return;
    const prevLevel = selected.level;
    const prevTimeline = [...(selected.timeline || [])];
    const { error } = await updateLevel(selected.id, newLevel);
    if (!error) {
      const now = new Date();
      const dateStr = `${now.getMonth() + 1}/${now.getDate()}`;
      setSelected((prev) => prev ? {
        ...prev, level: newLevel, updated: '방금',
        timeline: [...(prev.timeline || []), { date: dateStr, action: `상태 변경: ${prev.level} → ${newLevel}`, by: prev.owner || '운영관리자' }],
      } : prev);
      const tone = newLevel === '해결' ? 'emerald' : newLevel === '패널티' ? 'rose' : 'amber';
      showToast(`${selected.id} 상태가 "${newLevel}"(으)로 변경되었습니다.`, tone, () => {
        updateLevel(selected.id, prevLevel);
        setSelected((prev) => prev ? { ...prev, level: prevLevel, timeline: prevTimeline } : prev);
      });
    }
  };

  const handleNewDispute = async (data) => {
    const { error } = await createDispute(data);
    if (!error) {
      showToast('새 분쟁이 등록되었습니다.', 'indigo');
      setShowNewForm(false);
    }
  };

  const handleEvidenceRequest = () => {
    if (!selected) return;
    showToast(`${selected.partner}에 증빙 자료 요청이 전달되었습니다.`, 'indigo');
  };

  /* ── Summary cards config ────────────────────────────── */
  const summaryCards = [
    { key: '전체', label: '활성 분쟁', count: stats.total, sub: '진행중', dot: 'bg-slate-600', accent: '' },
    { key: '주의', label: '주의', count: stats['주의'], sub: '즉시 대응', dot: 'bg-rose-500', accent: stats['주의'] > 0 ? 'bg-rose-50/70' : '' },
    { key: '중재중', label: '중재중', count: stats['중재중'], sub: '협의 진행', dot: 'bg-amber-500', accent: stats['중재중'] > 0 ? 'bg-amber-50/70' : '' },
    { key: '증빙검토', label: '증빙검토', count: stats['증빙검토'], sub: '서류 확인', dot: 'bg-blue-500', accent: stats['증빙검토'] > 0 ? 'bg-blue-50/70' : '' },
    { key: '패널티', label: '패널티', count: stats['패널티'], sub: '제재 검토', dot: 'bg-slate-800', accent: stats['패널티'] > 0 ? 'bg-slate-100/70' : '' },
  ];

  const filterTabs = [
    { key: '전체', count: stats.total },
    { key: '주의', count: stats['주의'] },
    { key: '중재중', count: stats['중재중'] },
    { key: '증빙검토', count: stats['증빙검토'] },
    { key: '패널티', count: stats['패널티'] },
  ];

  /* ── Render ──────────────────────────────────────────── */
  return (
    <div className={`grid h-full ${selected ? 'grid-cols-1 lg:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>
      {/* ─── Left: list panel ─── */}
      <div className={`space-y-5 overflow-y-auto p-4 md:p-6 ${selected ? 'hidden lg:block' : ''}`}>
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={22} className="text-slate-700" />
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">분쟁관리</h2>
            </div>
            <p className="mt-1 hidden text-sm text-slate-500 sm:block">우회 접촉, 허위 정보, 정산 분쟁 등 파트너 이슈를 기록하고 중재합니다.</p>
          </div>
          <button onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-sm transition">
            <Plus size={16} /> 분쟁 등록
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-3">
          {summaryCards.map((card) => (
            <button key={card.key} onClick={() => setActiveFilter(card.key)}
              className={`rounded-2xl border border-slate-200 p-4 text-left shadow-sm transition hover:shadow-md ${card.accent || 'bg-white'} ${activeFilter === card.key ? 'ring-2 ring-violet-300 border-violet-300' : ''}`}>
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${card.dot}`} />
                <span className="text-[11px] font-bold text-slate-500">{card.label}</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{card.count}<span className="ml-0.5 text-sm font-medium text-slate-400">건</span></div>
              <div className="mt-0.5 text-[11px] text-slate-400">{card.sub}</div>
            </button>
          ))}
        </div>

        {/* Filter tabs + search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filterTabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${activeFilter === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {tab.key} {tab.count > 0 && <span className="ml-0.5 opacity-70">{tab.count}</span>}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="업체, 이슈, ID 검색..."
              className="w-52 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-200" />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <X size={14} className="text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
            <Shield size={32} className="mx-auto text-slate-300" />
            <div className="mt-3 text-sm font-medium text-slate-500">
              {searchTerm || activeFilter !== '전체' ? '조건에 맞는 분쟁이 없습니다.' : '등록된 분쟁이 없습니다.'}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {filtered.map((row) => {
              const lc = LEVEL_CONFIG[row.level] || LEVEL_CONFIG['주의'];
              const isSelected = selected?.id === row.id;
              return (
                <button key={row.id} onClick={() => setSelected(row)}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition hover:bg-slate-50 ${isSelected ? 'bg-violet-50/60' : 'bg-white'}`}>
                  {/* Severity bar */}
                  <div className={`h-10 w-1 shrink-0 rounded-full ${lc.dot}`} />

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 truncate">{row.partner}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{row.id}</span>
                      {row.category && <CategoryBadge category={row.category} />}
                    </div>
                    <div className="mt-1 text-sm text-slate-600 truncate">{row.issue}</div>
                  </div>

                  {/* Meta */}
                  <div className="flex shrink-0 items-center gap-3">
                    {row.priority && <PriorityDot priority={row.priority} />}
                    <LevelBadge level={row.level} />
                    {row.daysOpen != null && <DaysOpenBadge days={row.daysOpen} />}
                    <span className="hidden w-16 text-right text-xs text-slate-500 sm:inline">{row.owner}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Right: detail panel ─── */}
      {selected && (
      <div className="fixed inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
        >
          <ChevronLeft size={18} /> 목록으로 돌아가기
        </button>
      <aside className="min-h-0 flex-1 border-l border-slate-200 bg-white overflow-y-auto">
        {selected ? (
          <div className="p-4 md:p-6 space-y-5">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">분쟁 상세</div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{selected.id}</h3>
                </div>
                <LevelBadge level={selected.level} />
              </div>
              <div className="mt-3">
                <EscalationStepper currentLevel={selected.level} />
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[11px] text-slate-400">상대 업체</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{selected.partner}</div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[11px] text-slate-400">담당자</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{selected.owner}</div>
              </div>
              {selected.category && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] text-slate-400">분쟁 유형</div>
                  <div className="mt-1.5"><CategoryBadge category={selected.category} /></div>
                </div>
              )}
              {selected.priority && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] text-slate-400">우선순위</div>
                  <div className="mt-1.5"><PriorityDot priority={selected.priority} /></div>
                </div>
              )}
              {selected.daysOpen != null && (
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-[11px] text-slate-400">경과일</div>
                  <div className="mt-1.5"><DaysOpenBadge days={selected.daysOpen} /></div>
                </div>
              )}
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-[11px] text-slate-400">최근 업데이트</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{selected.updated}</div>
              </div>
            </div>

            {/* Related members */}
            {selected.relatedMembers?.length > 0 && (
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                  <Users size={12} /> 관련 회원
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selected.relatedMembers.map((m) => (
                    <span key={m} className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Issue description */}
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <div className="text-sm font-bold text-rose-900">이슈 내용</div>
              <p className="mt-2 text-sm leading-6 text-rose-800">{selected.issue}</p>
              {selected.description && (
                <p className="mt-2 text-sm leading-6 text-rose-700/80">{selected.description}</p>
              )}
            </div>

            {/* Timeline */}
            {selected.timeline?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Clock size={15} /> 조치 이력
                </div>
                <div className="mt-3 space-y-0">
                  {[...selected.timeline].reverse().map((entry, idx) => (
                    <div key={idx} className="relative flex gap-3 pb-3">
                      <div className="flex flex-col items-center">
                        <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${idx === 0 ? 'bg-violet-500' : 'bg-slate-300'}`} />
                        {idx < selected.timeline.length - 1 && <div className="mt-0.5 w-px flex-1 bg-slate-200" />}
                      </div>
                      <div className="min-w-0 pb-0.5">
                        <div className="text-sm font-medium text-slate-800 leading-snug">{entry.action}</div>
                        <div className="mt-0.5 text-[11px] text-slate-500">{entry.date} · {entry.by}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message thread */}
            <MessageThread itemId={selected.id} />

            {/* Contextual actions */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">조치</div>
              {selected.level === '해결' ? (
                <button onClick={() => handleLevel('주의')}
                  className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100 transition">
                  분쟁 재개
                </button>
              ) : (
                <div className="space-y-2">
                  <button onClick={handleEvidenceRequest}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    증빙 자료 요청
                  </button>

                  {selected.level === '주의' && (
                    <button onClick={() => handleLevel('중재중')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition">
                      중재 전환 <ArrowRight size={14} />
                    </button>
                  )}
                  {selected.level === '중재중' && (
                    <button onClick={() => handleLevel('증빙검토')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition">
                      증빙검토 전환 <ArrowRight size={14} />
                    </button>
                  )}
                  {selected.level === '증빙검토' && (
                    <button onClick={() => {
                      if (window.confirm(`${selected.partner} 건을 패널티 단계로 전환하시겠습니까?`)) handleLevel('패널티');
                    }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition">
                      패널티 검토 <ArrowRight size={14} />
                    </button>
                  )}
                  {selected.level === '패널티' && (
                    <button onClick={() => handleLevel('중재중')}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition">
                      재심 요청
                    </button>
                  )}

                  <button onClick={() => {
                    if (window.confirm(`${selected.partner} 분쟁을 해결 처리하시겠습니까?`)) handleLevel('해결');
                  }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition">
                    <CheckCircle2 size={14} /> 해결 처리
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </aside>
      </div>
      )}

      {/* New dispute modal */}
      {showNewForm && <NewDisputeModal onClose={() => setShowNewForm(false)} onSubmit={handleNewDispute} />}
    </div>
  );
}
