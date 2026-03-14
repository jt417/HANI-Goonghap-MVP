import React, { useState, useEffect } from 'react';
import { User, Clock, Sparkles } from 'lucide-react';
import MemberDetailHeader from './MemberDetailHeader';
import MemberDetailFooter from './MemberDetailFooter';
import ProfileTab from './tabs/ProfileTab';
import ActivityTab from './tabs/ActivityTab';
import AnalysisTab from './tabs/AnalysisTab';

const tabs = [
  { key: 'profile', label: '프로필', icon: User },
  { key: 'activity', label: '활동', icon: Clock },
  { key: 'analysis', label: '분석', icon: Sparkles },
];

export default function MemberDetailPanel({
  member, members, inbox, outbox,
  onUpdate, onDelete, showToast,
}) {
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    setActiveTab('profile');
  }, [member.id]);

  const memberProposals = [
    ...inbox.filter((p) => p.memberId === member.id).map((p) => ({ ...p, direction: '받은' })),
    ...outbox.filter((p) => p.memberId === member.id).map((p) => ({ ...p, direction: '보낸' })),
  ];

  const handleStatusChange = (status) => {
    const prevStatus = member.status;
    onUpdate(member.id, { status });
    showToast(`상태 → ${status}`, 'indigo', () => {
      onUpdate(member.id, { status: prevStatus });
    });
  };

  const handleTransfer = (targetManager) => {
    onUpdate(member.id, { manager: targetManager });
    showToast(`${member.name} → ${targetManager} 이관 완료`, 'emerald');
  };

  const handleDelete = () => {
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
    </aside>
  );
}
