import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, X, Clock, Menu } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import { useReminders } from '../../hooks/useReminders';
import { useMembers } from '../../hooks/useMembers';
import { useProposals } from '../../hooks/useProposals';

const staticNotifications = [
  { text: '노블레스 에스가 OUT-311을 열람했습니다.', time: '5분 전', isReminder: false, tab: 'outbox' },
  { text: 'VER-51 자산 인증 검토 마감 임박', time: '1시간 전', isReminder: false, tab: 'verify' },
  { text: 'DSP-14 우회 접촉 의심 건 업데이트', time: '오늘 09:30', isReminder: false, tab: 'dispute' },
];

export default function Header({ onSignOut, onMenuToggle }) {
  const profile = useAppStore((s) => s.profile);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const { myReminders } = useReminders();
  const { searchMembers, setSelectedMyMember } = useMembers();
  const { inbox } = useProposals();
  const actionableInbox = inbox.filter((p) => p.status === '검토중' || p.status === '추가정보 요청');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const searchResults = searchQuery.trim().length >= 1 ? searchMembers(searchQuery).slice(0, 8) : [];

  const handleSelectMember = (member) => {
    setSelectedMyMember(member);
    setActiveTab('myMembers');
    setSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (!searchOpen && !notifOpen) return;
    const handler = (e) => {
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchQuery('');
      }
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [searchOpen, notifOpen]);

  const reminderNotifs = myReminders.map(({ member, reminder }) => ({
    text: `${member.name}(${member.id}) 소개 시기입니다 (${reminder.cycleLabel} 주기)`,
    time: `${reminder.daysOverdue}일 초과`,
    isReminder: true,
    urgency: reminder.urgency,
    onNavigate: () => { setSelectedMyMember(member); setActiveTab('myMembers'); },
  }));

  const allNotifications = [...reminderNotifs, ...staticNotifications];
  const unreadCount = reminderNotifs.length;

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:h-16 md:px-8">
      <div className="flex items-center gap-2 min-w-0">
        <button onClick={onMenuToggle} className="shrink-0 rounded-lg p-2 hover:bg-slate-100 md:hidden">
          <Menu size={20} className="text-slate-600" />
        </button>
        <div className="min-w-0">
          <div className="hidden text-sm font-medium text-slate-600 sm:block">
            현재 로그인: {profile?.full_name || '사용자'} ({profile?.role === 'admin' ? '관리자' : '매칭매니저'})
          </div>
          <div className="text-xs text-slate-400 truncate">
            <span className="hidden sm:inline">{profile?.agency_name || ''} · </span>제안 {actionableInbox.length}건 · 리마인더 {unreadCount}건
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 text-slate-500">
        {searchOpen && (
          <div ref={searchRef} className="relative">
            <div className="flex items-center gap-2">
              <input
                autoFocus
                placeholder="회원 이름, ID, 직업, 지역..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-violet-400 sm:w-64"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); }
                  if (e.key === 'Enter' && searchResults.length > 0) handleSelectMember(searchResults[0]);
                }}
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="rounded-lg p-1 hover:bg-slate-100"><X size={14} /></button>
            </div>
            {searchQuery.trim().length >= 1 && (
              <div className="absolute right-0 top-10 z-50 w-[calc(100vw-2rem)] max-w-80 rounded-2xl border border-slate-200 bg-white py-2 shadow-lg sm:w-80">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-slate-400">검색 결과가 없습니다.</div>
                ) : (
                  searchResults.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-violet-50"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{m.name?.[0]}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">{m.name} <span className="text-xs text-slate-400">({m.id})</span></div>
                        <div className="truncate text-xs text-slate-500">{m.job} · {m.location}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{m.status}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800"><Search size={18} /></button>
        <div ref={notifRef} className="relative">
          <button onClick={() => { setNotifOpen(!notifOpen); setNotifRead(true); }} className="relative rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800">
            <Bell size={18} />
            {(!notifRead || unreadCount > 0) && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount || ''}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 z-50 w-[calc(100vw-2rem)] max-w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:w-96">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-bold text-slate-800">알림</div>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">리마인더 {unreadCount}건</span>
                )}
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {allNotifications.map((n, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (n.onNavigate) n.onNavigate();
                      else if (n.tab) setActiveTab(n.tab);
                      setNotifOpen(false);
                    }}
                    className={`w-full rounded-xl p-3 text-left transition-colors ${n.isReminder ? (n.urgency === 'high' ? 'border border-rose-200 bg-rose-50 hover:bg-rose-100' : 'border border-amber-200 bg-amber-50 hover:bg-amber-100') : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <div className="flex items-start gap-2">
                      {n.isReminder && <Clock size={14} className={n.urgency === 'high' ? 'mt-0.5 text-rose-500' : 'mt-0.5 text-amber-500'} />}
                      <div className="flex-1">
                        <div className={`text-sm ${n.isReminder ? (n.urgency === 'high' ? 'font-medium text-rose-800' : 'font-medium text-amber-800') : 'text-slate-800'}`}>{n.text}</div>
                        <div className="mt-1 text-xs text-slate-400">{n.time}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {onSignOut && (
          <button onClick={onSignOut} className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800" title="로그아웃">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </header>
  );
}
