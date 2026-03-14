import React, { useState, useEffect } from 'react';
import { User, Clock, Sparkles } from 'lucide-react';
import MemberDetailHeader from './MemberDetailHeader';
import MemberDetailFooter from './MemberDetailFooter';
import ProfileTab from './tabs/ProfileTab';
import ActivityTab from './tabs/ActivityTab';
import AnalysisTab from './tabs/AnalysisTab';
import { useActivityLog, LOG_ACTIONS } from '../../hooks/useActivityLog';

const tabs = [
  { key: 'profile', label: '프로필', icon: User },
  { key: 'activity', label: '활동', icon: Clock },
  { key: 'analysis', label: '분석', icon: Sparkles },
];

export default function MemberDetailPanel({
  member, members, inbox, outbox,
  onUpdate, onDelete, onCleanupRelated, showToast,
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [dataDeleteModal, setDataDeleteModal] = useState(false);

  useEffect(() => {
    setActiveTab('profile');
  }, [member.id]);

  const memberProposals = [
    ...inbox.filter((p) => p.memberId === member.id).map((p) => ({ ...p, direction: '받은' })),
    ...outbox.filter((p) => p.memberId === member.id).map((p) => ({ ...p, direction: '보낸' })),
  ];

  const { addLog } = useActivityLog();

  const maskPersonalData = () => {
    const masked = {
      name: member.name?.[0] + '**',
      phone: '***-****-****',
      photos: [],
      income: null,
      assets: null,
      parentWealth: null,
      parentAssets: null,
      job: '비공개',
      birthYear: null,
      edu: '비공개',
      height: null,
      weight: null,
      bodyType: null,
      location: '비공개',
      mbti: null,
      religion: null,
      smoking: null,
      drinking: null,
      appearanceNote: null,
      hobbies: [],
      idealConditions: [],
      notes: '',
      dataDeletedAt: new Date().toISOString(),
      status: '탈퇴',
    };
    onUpdate(member.id, masked);
    onCleanupRelated?.(member.id);
    addLog({ action: LOG_ACTIONS.DATA_DELETE_REQUEST, target: 'member', targetId: member.id, detail: `개인정보 삭제 처리: ${member.name}` });
    showToast('개인정보가 삭제(마스킹) 처리되었습니다.', 'rose');
    setDataDeleteModal(false);
  };

  const handleStatusChange = (status) => {
    if (status === '탈퇴') {
      setDataDeleteModal(true);
      return;
    }
    const prevStatus = member.status;
    const updates = { status };
    // When setting to 성혼, initialize matchOutcome if not already tracking
    if (status === '성혼' && !member.matchOutcome?.stage) {
      updates.matchOutcome = { stage: '교제중', startDate: new Date().toISOString().split('T')[0] };
    }
    onUpdate(member.id, updates);
    addLog({ action: LOG_ACTIONS.MEMBER_STATUS, target: 'member', targetId: member.id, detail: `${prevStatus} → ${status}` });
    showToast(`상태 → ${status}`, 'indigo', () => {
      onUpdate(member.id, { status: prevStatus });
    });
  };

  const handleTransfer = (targetManager) => {
    onUpdate(member.id, { manager: targetManager });
    addLog({ action: LOG_ACTIONS.MEMBER_UPDATE, target: 'member', targetId: member.id, detail: `이관: ${targetManager}` });
    showToast(`${member.name} → ${targetManager} 이관 완료`, 'emerald');
  };

  const handleDelete = () => {
    addLog({ action: LOG_ACTIONS.MEMBER_DELETE, target: 'member', targetId: member.id, detail: member.name });
    onCleanupRelated?.(member.id);
    onDelete(member.id);
    showToast(`${member.name} 회원 삭제됨`, 'rose');
  };

  return (
    <aside className="flex h-full flex-col border-l border-slate-200 bg-white">
      {/* Sticky Header */}
      <MemberDetailHeader member={member} onStatusChange={handleStatusChange} />

      {/* Tab Bar */}
      <div className="border-b border-slate-200 bg-white px-4 py-2 md:px-6">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content (scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'profile' && (
          <ProfileTab member={member} onUpdate={onUpdate} showToast={showToast} />
        )}
        {activeTab === 'activity' && (
          <ActivityTab member={member} memberProposals={memberProposals} onUpdate={onUpdate} showToast={showToast} />
        )}
        {activeTab === 'analysis' && (
          <AnalysisTab member={member} members={members} />
        )}
      </div>

      {/* Footer */}
      <MemberDetailFooter member={member} onTransfer={handleTransfer} onDelete={handleDelete} />

      {/* 개인정보 삭제 확인 모달 */}
      {dataDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">회원 탈퇴 처리</h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>{member.name}</strong> 회원을 탈퇴 처리합니다.
            </p>
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-bold text-rose-700">개인정보 삭제 안내</p>
              <p className="mt-1 text-xs text-rose-600">
                탈퇴 시 성명, 연락처, 사진, 소득, 자산 정보가 마스킹 처리됩니다.
                개인정보보호법에 따라 30일 후 완전 삭제됩니다.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const prevStatus = member.status;
                  onUpdate(member.id, { status: '탈퇴' });
                  addLog({ action: LOG_ACTIONS.MEMBER_STATUS, target: 'member', targetId: member.id, detail: `${prevStatus} → 탈퇴 (정보 보존)` });
                  showToast('탈퇴 처리 완료 (정보 보존)', 'slate');
                  setDataDeleteModal(false);
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                탈퇴만 처리
              </button>
              <button
                onClick={maskPersonalData}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
              >
                탈퇴 + 정보 삭제
              </button>
            </div>
            <button
              onClick={() => setDataDeleteModal(false)}
              className="mt-2 w-full rounded-xl px-4 py-2 text-sm text-slate-400 hover:text-slate-600"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
