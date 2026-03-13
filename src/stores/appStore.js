import { create } from 'zustand';
import { initialMembers, networkMembers } from '../lib/seedData';
import { defaultScoreRuleWeights, defaultBadgeThresholds } from '../lib/constants';

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
  activeTab: 'network',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));

export default useAppStore;
