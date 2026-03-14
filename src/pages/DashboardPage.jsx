import React, { useState, useMemo } from 'react';
import {
  BarChart3, Clock3, TrendingUp, UserPlus, Network, CalendarDays,
  ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, MapPin, Clock,
  Inbox, Send, Users, CalendarCheck,
} from 'lucide-react';
import SectionCard from '../components/common/SectionCard';
import StatusChip from '../components/common/StatusChip';
import { toneClasses, meetingTypeColors, memberStatusOptions } from '../lib/constants';
import useAppStore from '../stores/appStore';
import { useReminders } from '../hooks/useReminders';
import { useMembers } from '../hooks/useMembers';
import { useProposals } from '../hooks/useProposals';
import { reputationMetrics, kpiSeries } from '../lib/seedData';

const TODAY_STR = '2026-03-14';
const TODAY_LABEL = '2026년 3월 14일 금요일';

const FUNNEL_COLORS = {
  '신규 상담': 'bg-blue-500',
  '소개 가능': 'bg-emerald-500',
  '소개 진행중': 'bg-violet-500',
  '보류': 'bg-amber-500',
  '휴면': 'bg-slate-300',
};

const FUNNEL_BG = {
  '신규 상담': 'bg-blue-50 text-blue-700',
  '소개 가능': 'bg-emerald-50 text-emerald-700',
  '소개 진행중': 'bg-violet-50 text-violet-700',
  '보류': 'bg-amber-50 text-amber-700',
  '휴면': 'bg-slate-100 text-slate-500',
};

/* ── Mini Bar Chart (kept from original) ── */
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

/* ── Morning Brief Header ── */
function MorningBriefHeader({ profile, totalActions, memberCount }) {
  const name = profile?.full_name || '매니저';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '수고 많으셨어요';

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 md:text-2xl">{greeting}, {name}님</h2>
        <p className="mt-1 text-sm text-slate-500">{TODAY_LABEL} · 관리 회원 {memberCount}명</p>
      </div>
      {totalActions > 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700">
          <AlertCircle size={16} />
          오늘 처리 필요 <span className="text-lg">{totalActions}</span>건
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700">
          <CheckCircle2 size={16} />
          모든 업무 처리 완료
        </div>
      )}
    </div>
  );
}

/* ── Overdue Reminders Panel ── */
function OverdueRemindersPanel({ reminders, onClickMember, onViewAll }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">컨택 필요 회원</h3>
          {reminders.length > 0 && (
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700">{reminders.length}</span>
          )}
        </div>
        <button onClick={onViewAll} className="text-sm font-medium text-violet-600 hover:text-violet-700">전체 보기</button>
      </div>

      {reminders.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8">
          <CheckCircle2 size={28} className="text-emerald-300" />
          <p className="mt-2 text-sm text-slate-400">모든 회원 컨택이 정상입니다</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {reminders.slice(0, 5).map(({ member, reminder }) => {
            const isHigh = reminder.urgency === 'high';
            return (
              <button
                key={member.id}
                onClick={() => onClickMember(member)}
                className={`flex w-full items-center gap-4 rounded-xl border p-3.5 text-left transition hover:shadow-sm ${
                  isHigh
                    ? 'border-l-[3px] border-rose-200 border-l-rose-500 bg-rose-50/50 hover:bg-rose-50'
                    : 'border-l-[3px] border-amber-200 border-l-amber-500 bg-amber-50/50 hover:bg-amber-50'
                }`}
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${isHigh ? 'bg-rose-500' : 'bg-amber-500'}`}>
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900">{member.name} <span className="text-slate-400">({member.id})</span></div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">{member.job} · {member.location}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className={`text-sm font-bold ${isHigh ? 'text-rose-600' : 'text-amber-600'}`}>+{reminder.daysOverdue}일 초과</div>
                  <div className="mt-0.5 text-xs text-slate-400">{reminder.cycleLabel} 주기</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Today Schedule Panel ── */
function TodaySchedulePanel({ meetings, onClickMember, onViewCalendar }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">오늘 일정</h3>
          {meetings.length > 0 && (
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">{meetings.length}</span>
          )}
        </div>
        <button onClick={onViewCalendar} className="text-sm font-medium text-violet-600 hover:text-violet-700">캘린더</button>
      </div>

      {meetings.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8">
          <CalendarCheck size={28} className="text-slate-300" />
          <p className="mt-2 text-sm text-slate-400">오늘 예정된 일정이 없습니다</p>
          <button onClick={onViewCalendar} className="mt-2 text-xs font-semibold text-violet-600">캘린더에서 일정 추가</button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {meetings.map(({ member, meeting }, idx) => {
            const typeClass = meetingTypeColors[meeting.type] || 'bg-slate-100 text-slate-600 border-slate-200';
            return (
              <button
                key={`${member.id}-${idx}`}
                onClick={() => onClickMember(member)}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:bg-slate-50"
              >
                <div className="w-14 shrink-0 pt-0.5 text-center">
                  <div className="text-sm font-bold text-violet-600">{meeting.time || '--:--'}</div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${typeClass}`}>{meeting.type}</span>
                    <span className="font-medium text-slate-900">{member.name}</span>
                  </div>
                  {meeting.location && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={12} />
                      {meeting.location}
                    </div>
                  )}
                  {meeting.note && <div className="mt-1 truncate text-xs text-slate-400">{meeting.note}</div>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Proposal Actions Panel ── */
function ProposalActionsPanel({ actionableInbox, pendingOutbox, totalInbox, totalOutbox, onNavigateInbox, onNavigateOutbox }) {
  const [tab, setTab] = useState('inbox');

  const items = tab === 'inbox' ? actionableInbox : pendingOutbox;
  const total = tab === 'inbox' ? totalInbox : totalOutbox;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setTab('inbox')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'inbox' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Inbox size={14} />
            받은 제안
            {actionableInbox.length > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === 'inbox' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>{actionableInbox.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab('outbox')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              tab === 'outbox' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Send size={14} />
            보낸 제안
            {pendingOutbox.length > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === 'outbox' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'}`}>{pendingOutbox.length}</span>
            )}
          </button>
        </div>
        <button
          onClick={tab === 'inbox' ? onNavigateInbox : onNavigateOutbox}
          className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          전체 보기 ({total}건) <ArrowRight size={14} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8">
          <CheckCircle2 size={28} className="text-emerald-300" />
          <p className="mt-2 text-sm text-slate-400">
            {tab === 'inbox' ? '검토 대기 중인 제안이 없습니다' : '응답 대기 중인 제안이 없습니다'}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {items.slice(0, 5).map((p) => {
            const scoreColor = p.score >= 90 ? 'bg-emerald-100 text-emerald-700' : p.score >= 85 ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700';
            return (
              <button
                key={p.id}
                onClick={tab === 'inbox' ? onNavigateInbox : onNavigateOutbox}
                className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-3.5 text-left transition hover:bg-slate-50"
              >
                <div className={`shrink-0 rounded-lg px-2.5 py-1.5 text-center text-sm font-bold ${scoreColor}`}>{p.score}점</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900">{p.agency}</span>
                    <span className="text-xs text-slate-400">{p.id}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {tab === 'inbox' ? '대상' : '회원'}: {p.memberId} · 후보: {p.candidate}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <StatusChip label={p.status} />
                  <div className="mt-1 text-xs text-slate-400">{p.lastAction}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Member Funnel Panel ── */
function MemberFunnelPanel({ statusCounts, total, onNavigate }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">회원 현황</h3>
        <button onClick={onNavigate} className="text-sm font-medium text-violet-600 hover:text-violet-700">전체 보기</button>
      </div>
      <div className="mt-4 space-y-2.5">
        {memberStatusOptions.map((status) => {
          const count = statusCounts[status] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <button
              key={status}
              onClick={onNavigate}
              className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left transition hover:bg-slate-50"
            >
              <div className="w-20 shrink-0 text-xs font-medium text-slate-600">{status}</div>
              <div className="flex-1">
                <div className="h-5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-5 rounded-full ${FUNNEL_COLORS[status]} transition-all`}
                    style={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
              <div className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${FUNNEL_BG[status]}`}>
                {count}명
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-right text-xs text-slate-400">총 {total}명</div>
    </div>
  );
}

/* ── Quick Actions Panel ── */
function QuickActionsPanel({ onOpenRegistration, setActiveTab }) {
  const actions = [
    { icon: UserPlus, label: '신규 회원 등록', tone: 'violet', onClick: onOpenRegistration },
    { icon: Network, label: '매칭 검색', tone: 'indigo', onClick: () => setActiveTab('network') },
    { icon: CalendarDays, label: '캘린더', tone: 'emerald', onClick: () => setActiveTab('calendar') },
    { icon: ShieldCheck, label: '인증센터', tone: 'amber', onClick: () => setActiveTab('verify') },
  ];

  const toneMap = {
    violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-900">빠른 작업</h3>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {actions.map(({ icon: Icon, label, tone, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3.5 text-xs font-bold transition ${toneMap[tone]}`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Recent Activity Panel ── */
function RecentActivityPanel({ items }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8">
        <Clock3 size={28} className="text-slate-300" />
        <p className="mt-2 text-sm text-slate-400">최근 활동이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-[56px_1fr] gap-3">
          <div className="text-xs font-bold text-violet-600">{item.time}</div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-sm font-medium text-slate-900">{item.title}</div>
            <div className="mt-1 text-xs text-slate-500">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════════════ */
export default function DashboardPage({ onOpenRegistration }) {
  const profile = useAppStore((s) => s.profile);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const setSelectedMyMember = useAppStore((s) => s.setSelectedMyMember);
  const { myReminders } = useReminders();
  const { members } = useMembers();
  const { inbox, outbox } = useProposals();

  /* ── Computed data ── */
  const statusCounts = useMemo(() => {
    const counts = { '신규 상담': 0, '소개 가능': 0, '소개 진행중': 0, '보류': 0, '휴면': 0 };
    members.forEach((m) => { if (counts[m.status] !== undefined) counts[m.status]++; });
    return counts;
  }, [members]);

  const todayMeetings = useMemo(() => {
    const list = [];
    members.forEach((member) => {
      (member.meetings || []).forEach((meeting) => {
        if (meeting.date === TODAY_STR) list.push({ member, meeting });
      });
    });
    return list.sort((a, b) => (a.meeting.time || '99:99').localeCompare(b.meeting.time || '99:99'));
  }, [members]);

  const actionableInbox = useMemo(() =>
    inbox.filter((p) => p.status === '검토중' || p.status === '추가정보 요청'),
  [inbox]);

  const pendingOutbox = useMemo(() =>
    outbox.filter((p) => p.status === '응답대기' || p.status === '열람함' || p.status === '검토중'),
  [outbox]);

  const totalActions = myReminders.length + actionableInbox.length + todayMeetings.length;

  const recentActivity = useMemo(() => {
    const items = [];
    inbox.slice(0, 3).forEach((p) => {
      items.push({ time: p.lastAction, title: `${p.agency}에서 제안 수신`, desc: `${p.memberId} 대상 · 점수 ${p.score} · ${p.status}` });
    });
    outbox.filter((p) => p.status === '수락' || p.status === '소개 확정').slice(0, 2).forEach((p) => {
      items.push({ time: p.lastAction, title: `${p.agency} 제안 ${p.status}`, desc: `${p.memberId} → ${p.candidate}` });
    });
    return items.slice(0, 6);
  }, [inbox, outbox]);

  /* ── Navigation helpers ── */
  const navigateToMember = (member) => {
    setSelectedMyMember(member);
    setActiveTab('myMembers');
  };

  /* ── KPI stat cards ── */
  const realStats = [
    { label: '총 회원수', value: `${members.length}명`, tone: 'slate', onClick: () => setActiveTab('myMembers') },
    { label: '소개 가능', value: `${statusCounts['소개 가능']}명`, tone: 'emerald', onClick: () => setActiveTab('myMembers') },
    { label: '받은 제안', value: `${inbox.length}건`, tone: 'indigo', onClick: () => setActiveTab('inbox'), sub: actionableInbox.length > 0 ? `${actionableInbox.length}건 검토 필요` : null },
    { label: '보낸 제안', value: `${outbox.length}건`, tone: 'amber', onClick: () => setActiveTab('outbox'), sub: pendingOutbox.length > 0 ? `${pendingOutbox.length}건 응답 대기` : null },
    { label: '소개 진행중', value: `${statusCounts['소개 진행중']}명`, tone: 'rose', onClick: () => setActiveTab('myMembers') },
    { label: '리마인더', value: `${myReminders.length}건`, tone: myReminders.length > 0 ? 'rose' : 'slate', onClick: () => setActiveTab('myMembers'), sub: myReminders.length > 0 ? '컨택 필요' : null },
  ];

  return (
    <div className="space-y-5 overflow-y-auto p-4 md:space-y-6 md:p-6 lg:p-8">
      {/* ROW 1: Morning Brief */}
      <MorningBriefHeader profile={profile} totalActions={totalActions} memberCount={members.length} />

      {/* ROW 2: KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {realStats.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${toneClasses[item.tone]}`}>{item.label}</div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
            {item.sub ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{item.sub}</div>
            ) : (
              <div className="mt-1 text-xs text-slate-400">실시간</div>
            )}
          </button>
        ))}
      </div>

      {/* ROW 3: Reminders + Today Schedule */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="col-span-1 md:col-span-3">
          <OverdueRemindersPanel
            reminders={myReminders}
            onClickMember={navigateToMember}
            onViewAll={() => setActiveTab('myMembers')}
          />
        </div>
        <div className="col-span-1 md:col-span-2">
          <TodaySchedulePanel
            meetings={todayMeetings}
            onClickMember={navigateToMember}
            onViewCalendar={() => setActiveTab('calendar')}
          />
        </div>
      </div>

      {/* ROW 4: Proposals + Funnel + Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="col-span-1 md:col-span-3">
          <ProposalActionsPanel
            actionableInbox={actionableInbox}
            pendingOutbox={pendingOutbox}
            totalInbox={inbox.length}
            totalOutbox={outbox.length}
            onNavigateInbox={() => setActiveTab('inbox')}
            onNavigateOutbox={() => setActiveTab('outbox')}
          />
        </div>
        <div className="col-span-1 space-y-4 md:col-span-2">
          <MemberFunnelPanel
            statusCounts={statusCounts}
            total={members.length}
            onNavigate={() => setActiveTab('myMembers')}
          />
          <QuickActionsPanel onOpenRegistration={onOpenRegistration} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* ROW 5: Pipeline + Reputation + Activity */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SectionCard title="주간 파이프라인 흐름" subtitle="탐색 → 소개 → 성사 전환 추이" action={<div className="flex items-center gap-2 text-sm font-medium text-violet-600"><BarChart3 size={16} /> KPI</div>}>
          <MiniBarChart />
        </SectionCard>
        <SectionCard title="업체 평판 / 협업 지표" subtitle="네트워크 내 운영 품질 지표" action={<div className="flex items-center gap-2 text-sm font-medium text-emerald-600"><TrendingUp size={16} /> 개선중</div>}>
          <div className="space-y-3">
            {reputationMetrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-bold text-slate-900">{item.value}</div>
                <div className="mt-1 text-xs text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="최근 활동" subtitle="실시간 제안 · 매칭 현황" action={<div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Clock3 size={16} /> Live</div>}>
          <RecentActivityPanel items={recentActivity} />
        </SectionCard>
      </div>
    </div>
  );
}
