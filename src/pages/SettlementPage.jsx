import React, { useState, useEffect, useMemo } from 'react';
import { Wallet, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, MessageSquare, Send, FileCheck, Receipt, Building2, CalendarRange, Filter, TrendingUp, ChevronLeft } from 'lucide-react';
import StatusChip from '../components/common/StatusChip';
import useAppStore from '../stores/appStore';
import { useSettlements } from '../hooks/useSettlements';
import { useDisputes } from '../hooks/useDisputes';
import { useMessages } from '../hooks/useMessages';
import { settlementStages, settlementStatuses } from '../lib/constants';

/* ───── 금액 파서 ───── */
function parseAmount(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[,만원\s]/g, '');
  return Number(cleaned) || 0;
}
function formatAmount(num) {
  if (num >= 10000) return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}억`;
  return `${num.toLocaleString()}만`;
}

function getStageIndex(stage) {
  const idx = settlementStages.indexOf(stage);
  return idx >= 0 ? idx : 0;
}
function getStatusIndex(status) {
  const idx = settlementStatuses.indexOf(status);
  return idx >= 0 ? idx : 0;
}

/* ───── 날짜 파서 (3월 20일 / 2026.03.24 둘 다 지원) ───── */
function parseDueDate(dueStr) {
  if (!dueStr || dueStr === '미정') return null;
  const korMatch = dueStr.match(/(\d+)월\s*(\d+)일/);
  if (korMatch) return new Date(new Date().getFullYear(), parseInt(korMatch[1]) - 1, parseInt(korMatch[2]));
  const dotMatch = dueStr.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  if (dotMatch) return new Date(parseInt(dotMatch[1]), parseInt(dotMatch[2]) - 1, parseInt(dotMatch[3]));
  return null;
}
function daysOverdue(dueStr) {
  const due = parseDueDate(dueStr);
  if (!due) return -1;
  return Math.floor((new Date() - due) / (1000 * 60 * 60 * 24));
}
function isDueSoon(dueStr) {
  const d = daysOverdue(dueStr);
  return d >= -3 && d < 0;
}
function isOverdue(dueStr) {
  return daysOverdue(dueStr) > 0;
}

/* ───── KPI 카드 ───── */
function KpiCard({ icon: Icon, iconBg, label, value, sub, trend, trendUp }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-slate-400">{sub}</div>}
    </div>
  );
}

/* ───── 정산 상태 스테퍼 ───── */
function SettlementStepper({ status }) {
  const current = getStatusIndex(status);
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
        <CalendarRange size={16} /> 정산 진행 상태
      </div>
      <div className="flex items-center gap-1">
        {settlementStatuses.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                idx < current ? 'bg-emerald-500 text-white' :
                idx === current ? (step === '정산완료' ? 'bg-emerald-500 text-white' : 'bg-violet-600 text-white ring-4 ring-violet-100') :
                'bg-slate-200 text-slate-400'
              }`}>
                {idx < current || (idx === current && step === '정산완료') ? '✓' : idx + 1}
              </div>
              <div className={`whitespace-nowrap text-[10px] font-medium ${
                idx <= current ? (step === '정산완료' && idx === current ? 'text-emerald-700' : 'text-violet-700') : 'text-slate-400'
              }`}>{step}</div>
            </div>
            {idx < settlementStatuses.length - 1 && (
              <div className={`mt-[-16px] h-0.5 flex-1 rounded-full ${idx < current ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/* ───── 매칭 단계 인디케이터 ───── */
function StageIndicator({ stage }) {
  const idx = getStageIndex(stage);
  return (
    <div className="flex items-center gap-1">
      {settlementStages.map((s, i) => (
        <div
          key={s}
          title={s}
          className={`h-1.5 rounded-full ${
            i <= idx ? 'bg-violet-500' : 'bg-slate-200'
          } ${i === 0 || i === settlementStages.length - 1 ? 'w-3' : 'w-2'}`}
        />
      ))}
      <span className="ml-1.5 text-xs text-slate-600">{stage}</span>
    </div>
  );
}

/* ───── 파트너 요약 바 차트 ───── */
function PartnerSummaryChart({ items }) {
  const partnerMap = useMemo(() => {
    const map = {};
    items.forEach((item) => {
      if (!map[item.partner]) map[item.partner] = { total: 0, count: 0, completed: 0 };
      const amt = parseAmount(item.amount);
      map[item.partner].total += amt;
      map[item.partner].count += 1;
      if (item.status === '정산완료') map[item.partner].completed += amt;
    });
    return Object.entries(map).sort((a, b) => b[1].total - a[1].total);
  }, [items]);
  const maxTotal = Math.max(...partnerMap.map(([, v]) => v.total), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900">파트너별 정산 현황</h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-violet-500" />정산 예정</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />정산 완료</span>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {partnerMap.slice(0, 6).map(([partner, data]) => (
          <div key={partner} className="grid grid-cols-[80px_1fr_50px] items-center gap-2 md:grid-cols-[120px_1fr_60px] md:gap-3">
            <div className="truncate text-xs font-medium text-slate-700">{partner}</div>
            <div className="h-5 overflow-hidden rounded-full bg-slate-100">
              <div className="flex h-full">
                <div className="h-full rounded-l-full bg-emerald-400" style={{ width: `${(data.completed / maxTotal) * 100}%` }} />
                <div className="h-full bg-violet-400" style={{ width: `${((data.total - data.completed) / maxTotal) * 100}%` }} />
              </div>
            </div>
            <div className="text-right text-xs font-bold text-slate-700">{formatAmount(data.total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── 필터 탭 ───── */
const filterTabs = [
  { key: '전체', label: '전체' },
  { key: '정산 예정', label: '정산 예정' },
  { key: '검수중', label: '검수중' },
  { key: '대기', label: '대기' },
  { key: '정산완료', label: '정산완료' },
];

/* ───── 상세 패널 ───── */
function SettlementDetailPanel({ item, onAction, onUpdate }) {
  const [msgInput, setMsgInput] = useState('');
  const [editSplit, setEditSplit] = useState(false);
  const [splitValue, setSplitValue] = useState(50);
  const { messages, sendMessage } = useMessages(item?.id);

  // Reset edit state when switching items
  useEffect(() => {
    setEditSplit(false);
    setSplitValue(parseInt(item?.split?.split(':')[0]) || 50);
  }, [item?.id]);
  const showToast = useAppStore((s) => s.showToast);

  if (!item) {
    return (
      <aside className="flex h-full items-center justify-center border-l border-slate-200 bg-white">
        <div className="text-center">
          <Receipt size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-400">정산 항목을 선택하세요</p>
        </div>
      </aside>
    );
  }

  const handleSend = async () => {
    if (!msgInput.trim()) return;
    await sendMessage(msgInput.trim());
    setMsgInput('');
  };

  const overdue = isOverdue(item.due);
  const dueSoon = isDueSoon(item.due);
  const isMarriage = item.type === '성혼비';
  const myShare = item.split ? parseInt(item.split.split(':')[0]) : 50;
  const partnerShare = item.split ? parseInt(item.split.split(':')[1]) : 50;
  const totalAmt = parseAmount(item.amount);
  const myAmt = isMarriage ? totalAmt : Math.round(totalAmt * myShare / 100);
  const partnerAmt = isMarriage ? 0 : totalAmt - myAmt;

  return (
    <aside className="flex flex-col border-l border-slate-200 bg-white overflow-y-auto">
      {/* 헤더 */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">정산 상세</div>
            <h3 className="mt-1.5 text-lg font-bold text-slate-900">{item.id}</h3>
            <p className="mt-0.5 text-sm text-slate-500">{item.partner}</p>
          </div>
          <StatusChip label={item.status} />
        </div>
      </div>

      <div className="flex-1 space-y-4 p-5">
        {/* 정산 진행 스테퍼 */}
        <SettlementStepper status={item.status} />

        {/* 금액 정보 */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500">정산 금액</div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isMarriage ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {item.type || '매칭비'}
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900">{item.amount}<span className="ml-0.5 text-lg text-slate-400">원</span></div>

          {isMarriage ? (
            /* 성혼비: 회원 직접 청구 */
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3">
              <div className="text-[11px] font-bold text-amber-700">회원 직접 청구</div>
              <div className="mt-1 text-sm text-amber-900">
                <span className="font-bold">{item.chargedTo}</span> 회원에게 성혼비 청구
              </div>
              <p className="mt-1.5 text-[10px] text-amber-600 leading-4">
                상대측 회원의 성혼비는 파트너({item.partner})가 별도 청구
              </p>
            </div>
          ) : (
            /* 매칭비: 업체 간 분배 */
            <>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-violet-50 p-3 text-center">
                  <div className="text-[11px] text-violet-500">우리 측 ({myShare}%)</div>
                  <div className="mt-1 text-base font-bold text-violet-800">{formatAmount(myAmt)}</div>
                </div>
                <div className="rounded-xl bg-slate-100 p-3 text-center">
                  <div className="text-[11px] text-slate-500">파트너 ({partnerShare}%)</div>
                  <div className="mt-1 text-base font-bold text-slate-700">{formatAmount(partnerAmt)}</div>
                </div>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                <div className="bg-violet-500" style={{ width: `${myShare}%` }} />
                <div className="bg-slate-300" style={{ width: `${partnerShare}%` }} />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>우리 {myShare}%</span>
                <span>{partnerShare}% 파트너</span>
              </div>
            </>
          )}
        </div>

        {/* 상세 필드 */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] text-slate-400">매칭 페어</div>
            <div className="mt-1 text-sm font-medium text-slate-800">{item.pair}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] text-slate-400">매칭 단계</div>
            <div className="mt-1"><StageIndicator stage={item.stage} /></div>
          </div>
          <div className={`rounded-xl border p-3 ${overdue ? 'border-rose-300 bg-rose-50' : dueSoon ? 'border-amber-300 bg-amber-50' : 'border-slate-200'}`}>
            <div className={`text-[11px] ${overdue ? 'text-rose-500' : dueSoon ? 'text-amber-500' : 'text-slate-400'}`}>
              {overdue ? '⚠ 정산 지연' : dueSoon ? '⏰ 임박' : '예정일'}
            </div>
            <div className={`mt-1 text-sm font-medium ${overdue ? 'text-rose-800' : dueSoon ? 'text-amber-800' : 'text-slate-800'}`}>{item.due}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[11px] text-slate-400">{isMarriage ? '청구 대상' : '배분 비율'}</div>
            <div className="mt-1 text-sm font-bold text-slate-800">{isMarriage ? `${item.chargedTo} 회원` : item.split}</div>
          </div>
        </div>

        {/* 지연 경고 */}
        {overdue && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-rose-600" />
            <div>
              <div className="text-sm font-bold text-rose-900">정산 기한 초과</div>
              <p className="mt-1 text-xs leading-5 text-rose-700">예정일({item.due})이 지났습니다. 파트너에 증빙 요청 또는 정산 확정 처리가 필요합니다.</p>
            </div>
          </div>
        )}

        {/* 메시지 스레드 */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <MessageSquare size={16} /> 파트너 메시지
          </div>
          <div className="mt-3 space-y-2.5">
            {messages.map((msg) => (
              <div key={msg.id} className={`rounded-xl p-3 text-sm ${msg.role === 'me' ? 'ml-6 bg-violet-50 text-violet-900' : 'mr-6 border border-slate-200 bg-white text-slate-700'}`}>
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>{msg.sender}</span>
                  <span className="text-slate-400">{msg.date ? `${msg.date} ` : ''}{msg.time}</span>
                </div>
                <p className="mt-1.5 leading-5">{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              placeholder="파트너에게 메시지 보내기..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!msgInput.trim()} className="rounded-xl bg-slate-900 px-3 py-2 text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 하단 액션 버튼 */}
      <div className="border-t border-slate-100 p-4">
        {item.status === '정산완료' ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={16} /> 정산 완료 처리됨
          </div>
        ) : (
          <>
          {/* 배분 조정 슬라이더 (매칭비만) */}
          {editSplit && !isMarriage && (
            <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-700 mb-2">
                <span>배분 비율 조정</span>
                <span>{splitValue} : {100 - splitValue}</span>
              </div>
              <input type="range" min={20} max={80} value={splitValue} onChange={(e) => setSplitValue(Number(e.target.value))}
                className="w-full accent-indigo-600" />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>우리 측 {splitValue}%</span>
                <span>{100 - splitValue}% 파트너</span>
              </div>
              <div className="mt-1 rounded-lg bg-indigo-100 px-2 py-1.5 text-[11px] text-indigo-700">
                변경 시 금액: 우리 <b>{formatAmount(Math.round(totalAmt * splitValue / 100))}</b> / 파트너 <b>{formatAmount(totalAmt - Math.round(totalAmt * splitValue / 100))}</b>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setEditSplit(false)} className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs text-slate-600">취소</button>
                <button onClick={() => {
                  const newSplit = `${splitValue}:${100 - splitValue}`;
                  onUpdate(item.id, { split: newSplit });
                  showToast(`${item.id} 배분 비율 → ${newSplit} 조정 완료 (우리 ${formatAmount(Math.round(totalAmt * splitValue / 100))} / 파트너 ${formatAmount(totalAmt - Math.round(totalAmt * splitValue / 100))})`, 'indigo');
                  setEditSplit(false);
                }} className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-bold text-white">적용</button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            {!isMarriage && (
            <button
              onClick={() => {
                const current = parseInt(item.split?.split(':')[0]) || 50;
                setSplitValue(current);
                setEditSplit(true);
              }}
              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              배분 조정
            </button>
            )}
            <button
              onClick={() => {
                onAction('검수중');
                showToast(`${item.partner}에 증빙 요청 → 상태가 "검수중"으로 변경되었습니다.`, 'amber');
              }}
              className="flex-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition"
            >
              <span className="flex items-center justify-center gap-1.5"><FileCheck size={14} />증빙 요청</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`${item.id} (${item.partner}) 정산을 확정 처리하시겠습니까?`)) {
                  onAction('정산완료');
                }
              }}
              className="flex-1 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition"
            >
              정산 확정
            </button>
          </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════
   메인 페이지
   ═══════════════════════════════════════ */
export default function SettlementPage() {
  const { items, loading, fetchSettlements, updateStatus, updateSettlement } = useSettlements();
  const { items: disputes, createDispute } = useDisputes();
  const showToast = useAppStore((s) => s.showToast);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('전체');
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const escalatedRef = React.useRef(new Set());

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  /* ── 정산 14일 초과 → 분쟁 자동 에스컬레이션 (Phase 1-5) ── */
  useEffect(() => {
    if (loading) return;
    items.forEach((item) => {
      if (item.status === '정산완료') return;
      if (daysOverdue(item.due) < 14) return;
      if (escalatedRef.current.has(item.id)) return;
      const alreadyDisputed = disputes.some(
        (d) => d.settlementId === item.id || d.issue?.includes(item.id),
      );
      if (alreadyDisputed) {
        escalatedRef.current.add(item.id);
        return;
      }
      escalatedRef.current.add(item.id);
      const now = new Date();
      createDispute({
        partner: item.partner,
        category: '정산분쟁',
        issue: `정산 지연 14일 초과 (${item.id})`,
        description: `${item.pair} 건의 정산 예정일(${item.due})이 14일 이상 경과했습니다. 금액: ${item.amount}, 배분: ${item.split}`,
        priority: '높음',
        owner: '운영관리자',
        daysOpen: 0,
        settlementId: item.id,
        relatedMembers: item.pair ? item.pair.split(' ↔ ').map((s) => s.trim()) : [],
        timeline: [{ date: `${now.getMonth() + 1}/${now.getDate()}`, action: '정산 지연 자동 에스컬레이션', by: '시스템' }],
      });
      showToast(`${item.id} 정산 14일 초과 — 분쟁이 자동 등록되었습니다.`, 'rose');
    });
  }, [items, loading]);

  /* auto-select removed — on mobile the list should stay visible */

  /* ── KPI 계산 ── */
  const kpi = useMemo(() => {
    const pending = items.filter((i) => i.status === '정산 예정');
    const review = items.filter((i) => i.status === '검수중');
    const waiting = items.filter((i) => i.status === '대기');
    const completed = items.filter((i) => i.status === '정산완료');
    const overdue = items.filter((i) => i.status !== '정산완료' && isOverdue(i.due));

    const sumAmt = (arr) => arr.reduce((s, i) => s + parseAmount(i.amount), 0);
    const totalPending = sumAmt([...pending, ...review, ...waiting]);
    const totalCompleted = sumAmt(completed);

    return {
      totalPending,
      totalCompleted,
      pendingCount: pending.length,
      reviewCount: review.length,
      waitingCount: waiting.length,
      completedCount: completed.length,
      overdueCount: overdue.length,
      totalItems: items.length,
    };
  }, [items]);

  /* ── 필터 + 정렬 ── */
  const filteredItems = useMemo(() => {
    let result = activeFilter === '전체' ? items : items.filter((i) => i.status === activeFilter);
    if (sortKey) {
      result = [...result].sort((a, b) => {
        let va = a[sortKey], vb = b[sortKey];
        if (sortKey === 'amount') { va = parseAmount(va); vb = parseAmount(vb); }
        if (typeof va === 'number' && typeof vb === 'number') return sortAsc ? va - vb : vb - va;
        return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return result;
  }, [items, activeFilter, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) { setSortAsc(!sortAsc); }
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const prevStatus = selected.status;
    const { error } = await updateStatus(selected.id, newStatus);
    if (!error) {
      setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
      showToast(`${selected.id} 정산이 완료 처리되었습니다.`, 'emerald', () => {
        updateStatus(selected.id, prevStatus);
        setSelected((prev) => prev ? { ...prev, status: prevStatus } : prev);
      });
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: '80px' },
    { key: 'partner', label: '파트너', width: '1fr' },
    { key: 'pair', label: '매칭 페어', width: '1fr' },
    { key: 'stage', label: '단계', width: '1fr' },
    { key: 'type', label: '유형', width: '70px' },
    { key: 'amount', label: '금액', width: '80px' },
    { key: 'due', label: '예정일', width: '90px' },
    { key: 'status', label: '상태', width: '90px' },
  ];

  const filterCounts = useMemo(() => ({
    '전체': items.length,
    '정산 예정': items.filter((i) => i.status === '정산 예정').length,
    '검수중': items.filter((i) => i.status === '검수중').length,
    '대기': items.filter((i) => i.status === '대기').length,
    '정산완료': items.filter((i) => i.status === '정산완료').length,
  }), [items]);

  return (
    <div className={`grid h-full ${selected ? 'grid-cols-1 lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>
      {/* 좌측 메인 영역 */}
      <div className={`overflow-y-auto ${selected ? 'hidden lg:block' : ''}`}>
        <div className="space-y-5 p-4 md:p-6">
          {/* 페이지 헤더 */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">정산관리</h2>
              <p className="mt-1 hidden text-sm text-slate-500 sm:block">매칭비·성혼비 정산 예정액과 지급 상태를 추적합니다.</p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm md:px-4 md:py-2.5">
              <TrendingUp size={16} className="text-violet-500" />
              <span className="text-slate-600">정산율</span>
              <span className="font-bold text-violet-700">{kpi.totalItems > 0 ? Math.round((kpi.completedCount / kpi.totalItems) * 100) : 0}%</span>
            </div>
          </div>

          {/* KPI 카드 */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <KpiCard
              icon={Wallet}
              iconBg="bg-violet-500"
              label="정산 예정 총액"
              value={formatAmount(kpi.totalPending)}
              sub={`${kpi.pendingCount + kpi.reviewCount + kpi.waitingCount}건 미처리`}
              trend={`${kpi.pendingCount}건 대기`}
              trendUp={false}
            />
            <KpiCard
              icon={CheckCircle2}
              iconBg="bg-emerald-500"
              label="정산 완료"
              value={formatAmount(kpi.totalCompleted)}
              sub={`${kpi.completedCount}건 완료`}
              trend={kpi.completedCount > 0 ? `+${kpi.completedCount}건` : null}
              trendUp={true}
            />
            <KpiCard
              icon={Clock}
              iconBg="bg-blue-500"
              label="검수 진행중"
              value={`${kpi.reviewCount}건`}
              sub="증빙 확인 대기"
            />
            <KpiCard
              icon={AlertTriangle}
              iconBg={kpi.overdueCount > 0 ? 'bg-rose-500' : 'bg-slate-400'}
              label="지연 건수"
              value={`${kpi.overdueCount}건`}
              sub={kpi.overdueCount > 0 ? '즉시 처리 필요' : '정상 운영중'}
              trend={kpi.overdueCount > 0 ? '주의' : null}
              trendUp={false}
            />
          </div>

          {/* 파트너 요약 차트 */}
          <PartnerSummaryChart items={items} />

          {/* 필터 탭 + 테이블 */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* 필터 탭 */}
            <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 px-3 pt-3 pb-0 md:px-5 md:pt-4">
              <Filter size={14} className="mr-1 text-slate-400" />
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative rounded-t-lg px-4 py-2.5 text-sm font-medium transition ${
                    activeFilter === tab.key
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200 border-b-white -mb-px z-10'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeFilter === tab.key ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-400'
                  }`}>{filterCounts[tab.key]}</span>
                </button>
              ))}
            </div>

            {/* 테이블 헤더 */}
            <div
              className="hidden border-b border-slate-200 bg-slate-50 px-5 py-2.5 lg:grid"
              style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}
            >
              {columns.map((col) => (
                <button
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="flex items-center gap-1 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                >
                  {col.label}
                  {sortKey === col.key && (
                    <span className="text-violet-500">{sortAsc ? '↑' : '↓'}</span>
                  )}
                </button>
              ))}
            </div>

            {/* 테이블 바디 */}
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-400">불러오는 중...</div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">해당 상태의 정산 건이 없습니다.</div>
            ) : (
              <div>
                {filteredItems.map((row) => {
                  const overdue = row.status !== '정산완료' && isOverdue(row.due);
                  const dueSoon = row.status !== '정산완료' && isDueSoon(row.due);
                  return (
                    <button
                      key={row.id}
                      onClick={() => setSelected(row)}
                      className={`w-full border-b border-slate-100 text-left text-sm transition hover:bg-slate-50 ${
                        selected?.id === row.id ? 'bg-violet-50/60 border-l-2 border-l-violet-500' : 'bg-white'
                      } ${overdue ? 'bg-rose-50/40' : ''}`}
                    >
                      {/* Mobile card */}
                      <div className="block px-4 py-3 lg:hidden">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-slate-800">{row.partner}</div>
                          <StatusChip label={row.status} />
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${row.type === '성혼비' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{row.type || '매칭비'}</span>
                          <span className={`font-bold ${row.status === '정산완료' ? 'text-emerald-700' : 'text-slate-900'}`}>{row.amount}</span>
                          <span className={`${overdue ? 'text-rose-600 font-bold' : dueSoon ? 'text-amber-600' : ''}`}>
                            {overdue && '⚠ '}{row.due}
                          </span>
                        </div>
                      </div>
                      {/* Desktop grid */}
                      <div
                        className="hidden items-center px-5 py-3.5 lg:grid"
                        style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}
                      >
                        <div className="text-xs font-mono text-slate-500">{row.id}</div>
                        <div className="font-medium text-slate-800 truncate">{row.partner}</div>
                        <div className="text-slate-600 truncate">{row.pair}</div>
                        <div><StageIndicator stage={row.stage} /></div>
                        <div><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${row.type === '성혼비' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{row.type || '매칭비'}</span></div>
                        <div className={`font-bold ${row.status === '정산완료' ? 'text-emerald-700' : 'text-slate-900'}`}>{row.amount}</div>
                        <div className={`text-xs font-medium ${overdue ? 'text-rose-600 font-bold' : dueSoon ? 'text-amber-600' : 'text-slate-600'}`}>
                          {overdue && '⚠ '}{row.due}
                        </div>
                        <div><StatusChip label={row.status} /></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 테이블 푸터 요약 */}
            {!loading && filteredItems.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
                <div className="text-xs text-slate-500">
                  총 <span className="font-bold text-slate-700">{filteredItems.length}</span>건
                </div>
                <div className="text-xs text-slate-500">
                  합계 <span className="font-bold text-slate-900">{formatAmount(filteredItems.reduce((s, i) => s + parseAmount(i.amount), 0))}</span>원
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측 상세 패널 */}
      {selected && (
        <div className="fixed inset-0 z-30 flex flex-col bg-white lg:relative lg:inset-auto lg:z-auto">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
          >
            <ChevronLeft size={18} /> 목록으로 돌아가기
          </button>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SettlementDetailPanel item={selected} onAction={handleAction} onUpdate={(id, updates) => {
              updateSettlement(id, updates);
              setSelected((prev) => prev ? { ...prev, ...updates } : prev);
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
