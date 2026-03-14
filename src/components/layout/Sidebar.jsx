import React from 'react';
import { Activity, Users, Network, Lock, ArrowRightLeft, UserCheck, Wallet, AlertTriangle, CalendarDays } from 'lucide-react';
import { useProposals } from '../../hooks/useProposals';

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

export default function Sidebar({ activeTab, setActiveTab }) {
  const { inbox } = useProposals();
  const actionableCount = inbox.filter((p) => p.status === '검토중' || p.status === '추가정보 요청').length;

  return (
    <aside className="flex w-72 flex-col bg-slate-900 text-slate-300">
      <div className="border-b border-slate-800 p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <span className="rounded-xl bg-violet-500 p-2"><Activity size={18} color="white" /></span>
          HANI MatchOS
        </h1>
        <p className="mt-2 text-xs text-slate-500">압구정 노블레스 파트너스</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto py-6">
        <SidebarButton icon={Activity} label="대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <SidebarButton icon={Users} label="우리 회원 (CRM)" active={activeTab === 'myMembers'} onClick={() => setActiveTab('myMembers')} />
        <SidebarButton icon={CalendarDays} label="캘린더" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <SidebarButton icon={Network} label="매칭 검색" active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
        <SidebarButton icon={Lock} label="받은 제안함" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} badge={actionableCount > 0 ? String(actionableCount) : null} />
        <SidebarButton icon={ArrowRightLeft} label="보낸 제안함" active={activeTab === 'outbox'} onClick={() => setActiveTab('outbox')} />
        <SidebarButton icon={UserCheck} label="인증센터" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} />
        <SidebarButton icon={Wallet} label="정산관리" active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')} />
        <SidebarButton icon={AlertTriangle} label="분쟁관리" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
      </nav>
    </aside>
  );
}
