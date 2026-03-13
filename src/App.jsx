import React from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';
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
import { useAuth } from './hooks/useAuth';
import useAppStore from './stores/appStore';

export default function App() {
  const { user, isAuthenticated, isDemoMode, signIn, signOut } = useAuth();
  const {
    activeTab, setActiveTab,
    members, selectedMyMember, setSelectedMyMember, addMember,
    selectedNetworkMember, setSelectedNetworkMember,
    compareList, setCompareList,
    registrationOpen, setRegistrationOpen,
    proposalTarget, setProposalTarget,
    scoreRuleWeights, setScoreRuleWeights,
    badgeThresholds, setBadgeThresholds,
  } = useAppStore();

  if (!isAuthenticated) {
    return <LoginPage onLogin={signIn} isDemoMode={isDemoMode} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onSignOut={signOut} />

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
            addMember(newMember);
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
