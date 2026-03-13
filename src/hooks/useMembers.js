import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAppStore from '../stores/appStore';
import { scoreMember } from '../lib/scoring';

export function useMembers() {
  const {
    members, setMembers, addMember,
    selectedMyMember, setSelectedMyMember,
    scoreRuleWeights, badgeThresholds,
  } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!isSupabaseConfigured()) return; // demo mode uses seedData
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      const mapped = data.map(mapDbToLocal);
      setMembers(mapped);
      const store = useAppStore.getState();
      if (mapped.length > 0 && !store.selectedMyMember) setSelectedMyMember(mapped[0]);
    }
    setLoading(false);
  }, [setMembers, setSelectedMyMember]);

  const createMember = useCallback(async (formData) => {
    const labels = { overall: '종합', wealth: '자산', appearance: '외모', family: '집안', career: '직업' };
    const gradeResult = scoreMember(formData, scoreRuleWeights, badgeThresholds);
    const badges = Object.entries(gradeResult.categories)
      .map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null))
      .filter(Boolean);

    const newMember = {
      id: `M${String(Date.now()).slice(-3)}`,
      name: formData.name,
      age: 2026 - Number(formData.birthYear),
      gender: formData.gender || 'F',
      job: formData.job,
      income: `${(formData.income / 10000).toFixed(1)}억`,
      edu: formData.edu || '미입력',
      height: formData.height,
      weight: formData.weight,
      bodyType: formData.bodyType,
      assets: `금융 ${(formData.financial / 10000).toFixed(1)}억 / 부동산 ${formData.realEstate}건`,
      family: formData.family,
      appearanceNote: formData.appearance,
      location: formData.location || '서울',
      verifyLevel: 'Lv1',
      verifyItems: ['본인'],
      saju: { profile: '등록 후 성향 요약 생성 예정' },
      grade: {
        overallScore: gradeResult.overallScore,
        categories: gradeResult.categories,
        badges,
      },
      values: ['신규등록'],
      status: '신규 상담',
      manager: '이팀장',
      lastContact: '방금',
      nextAction: '초기 상담 필요',
      profileCompletion: 64,
      outboundProposals: 0,
    };

    if (!isSupabaseConfigured()) {
      addMember(newMember);
      setSelectedMyMember(newMember);
      return { data: newMember, error: null };
    }

    const { data, error: err } = await supabase
      .from('members')
      .insert(mapLocalToDb(newMember))
      .select()
      .single();

    if (err) return { data: null, error: err };
    const mapped = mapDbToLocal(data);
    addMember(mapped);
    setSelectedMyMember(mapped);
    return { data: mapped, error: null };
  }, [scoreRuleWeights, badgeThresholds, addMember, setSelectedMyMember]);

  const updateMember = useCallback(async (id, updates) => {
    if (!isSupabaseConfigured()) {
      const store = useAppStore.getState();
      setMembers(store.members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
      if (store.selectedMyMember?.id === id) setSelectedMyMember({ ...store.selectedMyMember, ...updates });
      return { error: null };
    }

    const { error: err } = await supabase
      .from('members')
      .update(mapLocalToDb(updates))
      .eq('display_id', id);
    if (!err) await fetchMembers();
    return { error: err };
  }, [fetchMembers]);

  const deleteMember = useCallback(async (id) => {
    if (!isSupabaseConfigured()) {
      const store = useAppStore.getState();
      const filtered = store.members.filter((m) => m.id !== id);
      setMembers(filtered);
      if (store.selectedMyMember?.id === id && filtered.length > 0) setSelectedMyMember(filtered[0]);
      return { error: null };
    }

    const { error: err } = await supabase.from('members').delete().eq('display_id', id);
    if (!err) await fetchMembers();
    return { error: err };
  }, [fetchMembers]);

  const searchMembers = useCallback((query) => {
    if (!query) return members;
    const q = query.toLowerCase();
    return members.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.job.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q)
    );
  }, [members]);

  return {
    members,
    selectedMyMember,
    setSelectedMyMember,
    loading,
    error,
    fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    searchMembers,
  };
}

function mapDbToLocal(row) {
  return {
    id: row.display_id || row.id,
    name: row.name,
    age: row.age,
    gender: row.gender,
    job: row.job,
    income: row.income,
    edu: row.edu,
    height: row.height,
    weight: row.weight,
    bodyType: row.body_type,
    assets: row.assets,
    family: row.family,
    appearanceNote: row.appearance_note,
    location: row.location,
    verifyLevel: row.verify_level,
    verifyItems: row.verify_items || [],
    saju: { profile: row.saju_profile || '' },
    grade: row.grade || {},
    values: row.values || [],
    status: row.status,
    manager: row.manager_id || '이팀장',
    lastContact: row.last_contact ? new Date(row.last_contact).toLocaleDateString('ko-KR') : '없음',
    nextAction: row.next_action || '',
    profileCompletion: row.profile_completion || 0,
    outboundProposals: row.outbound_proposals || 0,
  };
}

function mapLocalToDb(member) {
  const result = {};
  if (member.id) result.display_id = member.id;
  if (member.name) result.name = member.name;
  if (member.age) result.age = member.age;
  if (member.gender) result.gender = member.gender;
  if (member.job) result.job = member.job;
  if (member.income) result.income = member.income;
  if (member.edu) result.edu = member.edu;
  if (member.height) result.height = member.height;
  if (member.weight) result.weight = member.weight;
  if (member.bodyType) result.body_type = member.bodyType;
  if (member.assets) result.assets = member.assets;
  if (member.family) result.family = member.family;
  if (member.appearanceNote) result.appearance_note = member.appearanceNote;
  if (member.location) result.location = member.location;
  if (member.verifyLevel) result.verify_level = member.verifyLevel;
  if (member.verifyItems) result.verify_items = member.verifyItems;
  if (member.saju?.profile) result.saju_profile = member.saju.profile;
  if (member.grade) result.grade = member.grade;
  if (member.values) result.values = member.values;
  if (member.status) result.status = member.status;
  if (member.profileCompletion) result.profile_completion = member.profileCompletion;
  if (member.outboundProposals) result.outbound_proposals = member.outboundProposals;
  if (member.nextAction) result.next_action = member.nextAction;
  return result;
}
