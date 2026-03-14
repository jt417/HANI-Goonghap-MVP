import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialMembers as _rawMembers, networkMembers, inboxItems, outboxItems } from '../lib/seedData';
import { defaultScoreRuleWeights, defaultBadgeThresholds } from '../lib/constants';
import { scoreAge, buildPercentile } from '../lib/scoring';

// Enrich seed members with missing age/lifestyle grade categories
const initialMembers = _rawMembers.map((m) => {
  if (m.grade?.categories && !m.grade.categories.age) {
    const ageScore = scoreAge(m.age, m.gender);
    return {
      ...m,
      grade: {
        ...m.grade,
        categories: {
          ...m.grade.categories,
          age: { score: ageScore, ...buildPercentile(ageScore, defaultBadgeThresholds) },
          lifestyle: { score: 72, percentile: '상위 20%', badge: null },
        },
      },
    };
  }
  return m;
});

let _toastTimer = null;

const useAppStore = create(
  persist(
    (set) => ({
  // Auth
  user: null,
  profile: null,
  userRole: 'manager', // 'manager' | 'admin' | 'individual'
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setUserRole: (role) => set({
    userRole: role,
    activeTab: role === 'individual' ? 'myProfile' : 'dashboard',
  }),

  // Members
  members: initialMembers,
  selectedMyMember: initialMembers[0],
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [member, ...state.members] })),
  setSelectedMyMember: (member) => set({ selectedMyMember: member }),

  // Proposals (shared state for inbox/outbox)
  inbox: inboxItems,
  outbox: outboxItems,
  setInbox: (fn) => set((state) => ({
    inbox: typeof fn === 'function' ? fn(state.inbox) : fn,
  })),
  setOutbox: (fn) => set((state) => ({
    outbox: typeof fn === 'function' ? fn(state.outbox) : fn,
  })),

  // Network
  networkPool: [...networkMembers],
  selectedNetworkMember: networkMembers[0],
  compareList: [],
  setSelectedNetworkMember: (member) => set({ selectedNetworkMember: member }),
  setCompareList: (fn) => set((state) => ({
    compareList: typeof fn === 'function' ? fn(state.compareList) : fn,
  })),
  addToNetworkPool: (member) => set((s) => ({
    networkPool: [member, ...s.networkPool.filter((m) => m.id !== member.id)],
  })),

  // Individual profile
  individualProfile: null,
  setIndividualProfile: (p) => set({ individualProfile: p }),

  // Modals
  registrationOpen: false,
  proposalTarget: null,
  setRegistrationOpen: (open) => set({ registrationOpen: open }),
  setProposalTarget: (target) => set({ proposalTarget: target }),

  // Settings
  scoreRuleWeights: defaultScoreRuleWeights,
  badgeThresholds: defaultBadgeThresholds,
  setScoreRuleWeights: (fn) => set((state) => ({
    scoreRuleWeights: typeof fn === 'function' ? fn(state.scoreRuleWeights) : fn,
  })),
  setBadgeThresholds: (fn) => set((state) => ({
    badgeThresholds: typeof fn === 'function' ? fn(state.badgeThresholds) : fn,
  })),

  // Navigation
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Mobile UI
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // KPI
  kpiTargets: { match: 15, intro: 8, close: 3 }, // 주간 목표
  kpiWeekly: [
    { label: '1주차', match: 10, intro: 6, close: 2 },
    { label: '2주차', match: 13, intro: 8, close: 3 },
    { label: '3주차', match: 11, intro: 7, close: 4 },
    { label: '4주차', match: 18, intro: 10, close: 5 },
  ],
  setKpiTargets: (targets) => set({ kpiTargets: targets }),
  setKpiWeekly: (fn) => set((state) => ({
    kpiWeekly: typeof fn === 'function' ? fn(state.kpiWeekly) : fn,
  })),

  // Notifications
  notifications: [],
  addNotification: ({ title, body, type = 'info', tab = null }) => set((state) => {
    const entry = {
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title, body, type, tab, read: false,
      createdAt: new Date().toISOString(),
    };
    // Browser notification
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try { new Notification(title, { body }); } catch (_) {}
    }
    return { notifications: [entry, ...state.notifications].slice(0, 50) };
  }),
  markNotifRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
  })),
  markAllNotifsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),

  // Toast
  toastMessage: null,
  showToast: (text, tone = 'slate', onUndo = null) => {
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => set({ toastMessage: null }), onUndo ? 5000 : 3000);
    set({ toastMessage: { text, tone, onUndo } });
  },
  dismissToast: () => {
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = null;
    set({ toastMessage: null });
  },
}),
    {
      name: 'hani-app-store',
      partialize: (state) => ({
        members: state.members,
        inbox: state.inbox,
        outbox: state.outbox,
        scoreRuleWeights: state.scoreRuleWeights,
        badgeThresholds: state.badgeThresholds,
        userRole: state.userRole,
        individualProfile: state.individualProfile,
        networkPool: state.networkPool,
        kpiTargets: state.kpiTargets,
        kpiWeekly: state.kpiWeekly,
      }),
    },
  ),
);

export default useAppStore;
