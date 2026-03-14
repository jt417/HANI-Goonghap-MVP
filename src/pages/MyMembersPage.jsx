import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import useAppStore from '../stores/appStore';
import { useMembers } from '../hooks/useMembers';
import { useProposals } from '../hooks/useProposals';
import { useReminders } from '../hooks/useReminders';
import MemberStatsRibbon from '../components/member/MemberStatsRibbon';
import MemberSearchBar from '../components/member/MemberSearchBar';
import MemberFilterBar from '../components/member/MemberFilterBar';
import MemberCard from '../components/member/MemberCard';
import MemberDetailPanel from '../components/member/MemberDetailPanel';

function sortMembers(list, sortBy) {
  const sorted = [...list];
  switch (sortBy) {
    case 'grade':
      return sorted.sort((a, b) => (b.grade?.overallScore || 0) - (a.grade?.overallScore || 0));
    case 'lastContact':
      return sorted.sort((a, b) => (b.lastContactDate || '').localeCompare(a.lastContactDate || ''));
    case 'status': {
      const order = { '소개 진행중': 0, '매칭중': 1, '소개 가능': 2, '신규 상담': 3, '보류': 4, '성혼': 5, '휴면': 6, '탈퇴': 7 };
      return sorted.sort((a, b) => (order[a.status] ?? 8) - (order[b.status] ?? 8));
    }
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }
}

export default function MyMembersPage({ onOpenRegistration }) {
  const { members, loading, fetchMembers, selectedMyMember, setSelectedMyMember, updateMember, deleteMember, searchMembers } = useMembers();
  const { inbox, outbox, updateProposalStatus } = useProposals();
  const profile = useAppStore((s) => s.profile);
  const showToast = useAppStore((s) => s.showToast);
  const { myReminders, getReminderForMember } = useReminders();

  const [showOnlyMine, setShowOnlyMine] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // C-4: 계약 만료 자동 휴면 전환 (run once on mount)
  const hasCheckedExpiration = useRef(false);
  useEffect(() => {
    if (hasCheckedExpiration.current || members.length === 0) return;
    hasCheckedExpiration.current = true;
    const today = new Date().toISOString().split('T')[0];
    members.forEach((m) => {
      if (m.contractEndDate && m.contractEndDate < today && !['휴면', '탈퇴', '성혼'].includes(m.status)) {
        updateMember(m.id, { status: '휴면' });
        showToast(`${m.name} 계약 만료 → 휴면 전환`, 'slate');
      }
    });
  }, [members.length]);

  const myCount = useMemo(() => members.filter((m) => m.manager === profile?.full_name).length, [members, profile]);

  const displayMembers = useMemo(() => {
    let list = showOnlyMine ? members.filter((m) => m.manager === profile?.full_name) : members;
    if (searchQuery) {
      const searched = searchMembers(searchQuery);
      list = list.filter((m) => searched.includes(m));
    }
    if (statusFilter) {
      list = list.filter((m) => m.status === statusFilter);
    }
    return sortMembers(list, sortBy);
  }, [members, showOnlyMine, searchQuery, statusFilter, sortBy, profile, searchMembers]);

  const baseMembers = useMemo(
    () => (showOnlyMine ? members.filter((m) => m.manager === profile?.full_name) : members),
    [members, showOnlyMine, profile],
  );

  return (
    <div className={`grid h-full grid-rows-1 overflow-hidden ${selectedMyMember ? 'grid-cols-1 lg:grid-cols-[1fr_560px]' : 'grid-cols-1'} gap-0`}>
      {/* LEFT: Member List */}
      <div className={`flex min-h-0 flex-col overflow-hidden ${selectedMyMember ? 'hidden lg:flex' : 'flex'}`}>
        <div className="shrink-0 space-y-4 p-4 pb-0 md:p-6 md:pb-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">우리 회원 CRM</h2>
              <p className="mt-1 hidden text-sm text-slate-500 sm:block">실명, 증빙 원본, 연락처는 자사 권한 사용자만 열람 가능합니다.</p>
            </div>
            <button onClick={onOpenRegistration} className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 md:px-4 md:py-2.5"><span className="hidden sm:inline">+ 신규 </span>회원 등록</button>
          </div>
          <MemberStatsRibbon members={baseMembers} reminders={myReminders} />
          <MemberSearchBar value={searchQuery} onChange={setSearchQuery} />
          <MemberFilterBar
            showOnlyMine={showOnlyMine}
            setShowOnlyMine={setShowOnlyMine}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalCount={members.length}
            myCount={myCount}
          />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:pb-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
            ) : displayMembers.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                {members.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium text-slate-500">등록된 회원이 없습니다.</p>
                    <button onClick={onOpenRegistration} className="mt-4 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800">+ 신규 회원 등록</button>
                  </div>
                ) : (
                  '검색 결과가 없습니다.'
                )}
              </div>
            ) : (
              displayMembers.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  isSelected={selectedMyMember?.id === m.id}
                  onClick={() => setSelectedMyMember(m)}
                  reminder={getReminderForMember(m.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Detail Panel — full-screen overlay on mobile, side panel on lg+ */}
      {selectedMyMember && (
        <div className="fixed inset-0 z-30 flex min-h-0 flex-col bg-white lg:relative lg:inset-auto lg:z-auto">
          <button
            onClick={() => setSelectedMyMember(null)}
            className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
          >
            <ChevronLeft size={18} /> 목록으로 돌아가기
          </button>
          <div className="min-h-0 flex-1 overflow-hidden">
            <MemberDetailPanel
              member={selectedMyMember}
              members={members}
              inbox={inbox}
              outbox={outbox}
              onUpdate={updateMember}
              onDelete={(id) => {
                deleteMember(id);
              }}
              onCleanupRelated={(memberId) => {
                // 진행중인 제안 자동 철회
                const activeStatuses = ['검토중', '열람함', '응답대기', '회원 확인중', '추가정보 요청'];
                [...inbox, ...outbox].forEach((p) => {
                  if (p.memberId === memberId && activeStatuses.includes(p.status)) {
                    updateProposalStatus(p.id, '철회');
                  }
                });
              }}
              showToast={showToast}
            />
          </div>
        </div>
      )}
    </div>
  );
}
