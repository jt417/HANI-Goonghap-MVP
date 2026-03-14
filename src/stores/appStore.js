import { create } from 'zustand';
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

const useAppStore = create((set) => ({
  // Auth
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

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
  selectedNetworkMember: networkMembers[0],
  compareList: [],
  setSelectedNetworkMember: (member) => set({ selectedNetworkMember: member }),
  setCompareList: (fn) => set((state) => ({
    compareList: typeof fn === 'function' ? fn(state.compareList) : fn,
  })),

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
}));

export default useAppStore;
