import React from 'react';
import { Activity, Users, Network, Lock, ArrowRightLeft, UserCheck, Wallet, AlertTriangle, CalendarDays, User, Inbox, Building2, BarChart3 } from 'lucide-react';
import { useProposals } from '../../hooks/useProposals';
import useAppStore from '../../stores/appStore';

function SidebarButton({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-5 py-3 text-sm transition ${
        active
          ? 'border-r-4 border-violet-500 bg-slate-800 font-medium text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {badge ? <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs text-white">{badge}</span> : null}
    </button>
  );
}

const ROLE_LABEL = {
  manager: '매칭매니저',
  admin: '관리자',
  individual: '개인회원',
};

const ROLE_SUBTITLE = {
  manager: '압구정 노블레스 파트너스',
  admin: 'HANI 시스템 관리',
  individual: '내 프로필 관리',
};

export default function Sidebar({ activeTab, setActiveTab }) {
  const { inbox } = useProposals();
  const userRole = useAppStore((s) => s.userRole);
  const profile = useAppStore((s) => s.profile);
  const actionableCount = inbox.filter((p) => p.status === '검토중' || p.status === '추가정보 요청').length;

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-slate-300">
      <div className="border-b border-slate-800 p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <span className="rounded-xl bg-violet-500 p-2"><Activity size={18} color="white" /></span>
          HANI MatchOS
        </h1>
        <p className="mt-2 text-xs text-slate-500">{profile?.agency_name || ROLE_SUBTITLE[userRole]}</p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-medium text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${userRole === 'admin' ? 'bg-amber-400' : userRole === 'individual' ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          {ROLE_LABEL[userRole]}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto py-6">
        {/* ── 개인회원 메뉴 ── */}
        {userRole === 'individual' && (
          <>
            <SidebarButton icon={User} label="내 프로필" active={activeTab === 'myProfile'} onClick={() => setActiveTab('myProfile')} />
            <SidebarButton icon={Inbox} label="받은 소개" active={activeTab === 'receivedProposals'} onClick={() => setActiveTab('receivedProposals')} badge={actionableCount > 0 ? String(actionableCount) : null} />
            <SidebarButton icon={UserCheck} label="인증센터" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} />
          </>
        )}

        {/* ── 매칭매니저 메뉴 ── */}
        {userRole === 'manager' && (
          <>
            <SidebarButton icon={Activity} label="대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarButton icon={Users} label="우리 회원 (CRM)" active={activeTab === 'myMembers'} onClick={() => setActiveTab('myMembers')} />
            <SidebarButton icon={CalendarDays} label="캘린더" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            <SidebarButton icon={Network} label="매칭 검색" active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
            <SidebarButton icon={Lock} label="받은 제안함" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} badge={actionableCount > 0 ? String(actionableCount) : null} />
            <SidebarButton icon={ArrowRightLeft} label="보낸 제안함" active={activeTab === 'outbox'} onClick={() => setActiveTab('outbox')} />
            <SidebarButton icon={UserCheck} label="인증센터" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} />
            <SidebarButton icon={Wallet} label="정산관리" active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')} />
            <SidebarButton icon={AlertTriangle} label="분쟁관리" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
          </>
        )}

        {/* ── 관리자 메뉴 ── */}
        {userRole === 'admin' && (
          <>
            <SidebarButton icon={BarChart3} label="관리자 대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarButton icon={Building2} label="업체 관리" active={activeTab === 'agencies'} onClick={() => setActiveTab('agencies')} />
            <SidebarButton icon={Users} label="전체 회원" active={activeTab === 'myMembers'} onClick={() => setActiveTab('myMembers')} />
            <SidebarButton icon={User} label="개인회원 관리" active={activeTab === 'individualMembers'} onClick={() => setActiveTab('individualMembers')} />
            <SidebarButton icon={Network} label="매칭 검색" active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
            <SidebarButton icon={Lock} label="받은 제안함" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} badge={actionableCount > 0 ? String(actionableCount) : null} />
            <SidebarButton icon={ArrowRightLeft} label="보낸 제안함" active={activeTab === 'outbox'} onClick={() => setActiveTab('outbox')} />
            <SidebarButton icon={UserCheck} label="인증센터" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} />
            <SidebarButton icon={Wallet} label="정산관리" active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')} />
            <SidebarButton icon={AlertTriangle} label="분쟁관리" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
          </>
        )}
      </nav>
    </aside>
  );
}
