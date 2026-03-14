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
import CalendarPage from './pages/CalendarPage';
import MemberRegistrationModal from './components/member/MemberRegistrationModal';
import ProposalModal from './components/proposal/ProposalModal';
import Toast from './components/common/Toast';
import { useAuth } from './hooks/useAuth';
import useAppStore from './stores/appStore';

export default function App() {
  const { user, isAuthenticated, isDemoMode, signIn, signOut } = useAuth();
  const {
    activeTab, setActiveTab,
    selectedMyMember, setSelectedMyMember, addMember,
    selectedNetworkMember, setSelectedNetworkMember,
    compareList, setCompareList,
    registrationOpen, setRegistrationOpen,
    proposalTarget, setProposalTarget,
    scoreRuleWeights, setScoreRuleWeights,
    badgeThresholds, setBadgeThresholds,
    sidebarOpen, setSidebarOpen, toggleSidebar,
  } = useAppStore();

  const handleSetActiveTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={signIn} isDemoMode={isDemoMode} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — drawer on mobile, static on md+ */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header onSignOut={signOut} onMenuToggle={toggleSidebar} />

        <main className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <DashboardPage onOpenRegistration={() => setRegistrationOpen(true)} />
          )}
          {activeTab === 'myMembers' && (
            <MyMembersPage
              onOpenRegistration={() => setRegistrationOpen(true)}
            />
          )}
          {activeTab === 'calendar' && <CalendarPage />}
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

      <Toast />
    </div>
  );
}
