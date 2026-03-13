import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import MyMembersPage from './pages/MyMembersPage';
import NetworkPage from './pages/NetworkPage';
import InboxPage from './pages/InboxPage';
import OutboxPage from './pages/OutboxPage';
import VerifyPage from './pages/VerifyPage';
import SettlementPage from './pages/SettlementPage';
import DisputePage from './pages/DisputePage';
import MemberRegistrationModal from './components/member/MemberRegistrationModal';
import ProposalModal from './components/proposal/ProposalModal';
import { initialMembers, networkMembers } from './lib/seedData';
import { defaultScoreRuleWeights, defaultBadgeThresholds } from './lib/constants';

export default function App() {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('network');
  const [members, setMembers] = useState(initialMembers);
  const [selectedMyMember, setSelectedMyMember] = useState(initialMembers[0]);
  const [selectedNetworkMember, setSelectedNetworkMember] = useState(networkMembers[0]);
  const [compareList, setCompareList] = useState([]);
  const [proposalTarget, setProposalTarget] = useState(null);
  const [scoreRuleWeights, setScoreRuleWeights] = useState(defaultScoreRuleWeights);
  const [badgeThresholds, setBadgeThresholds] = useState(defaultBadgeThresholds);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage
              onOpenRegistration={() => setRegistrationOpen(true)}
              scoreRuleWeights={scoreRuleWeights}
              setScoreRuleWeights={setScoreRuleWeights}
              badgeThresholds={badgeThresholds}
              setBadgeThresholds={setBadgeThresholds}
            />
          )}
          {activeTab === 'myMembers' && (
            <MyMembersPage
              members={members}
              selectedMyMember={selectedMyMember}
              setSelectedMyMember={setSelectedMyMember}
              onOpenRegistration={() => setRegistrationOpen(true)}
            />
          )}
          {activeTab === 'network' && (
            <NetworkPage
              selectedMyMember={selectedMyMember}
              compareList={compareList}
              setCompareList={setCompareList}
              selectedNetworkMember={selectedNetworkMember}
              setSelectedNetworkMember={setSelectedNetworkMember}
              openProposal={setProposalTarget}
            />
          )}
          {activeTab === 'inbox' && <InboxPage />}
          {activeTab === 'outbox' && <OutboxPage />}
          {activeTab === 'verify' && <VerifyPage />}
          {activeTab === 'settlement' && <SettlementPage />}
          {activeTab === 'dispute' && <DisputePage />}
        </main>
      </div>

      {registrationOpen ? (
        <MemberRegistrationModal
          open={registrationOpen}
          onClose={() => setRegistrationOpen(false)}
          scoreRuleWeights={scoreRuleWeights}
          badgeThresholds={badgeThresholds}
          onSave={(newMember) => {
            setMembers((prev) => [newMember, ...prev]);
            setSelectedMyMember(newMember);
          }}
        />
      ) : null}

      {proposalTarget ? (
        <ProposalModal member={proposalTarget} selectedMyMember={selectedMyMember} onClose={() => setProposalTarget(null)} />
      ) : null}
    </div>
  );
}
