import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAppStore from '../stores/appStore';
import { logActivity, LOG_ACTIONS } from './useActivityLog';

const WORKFLOW = ['검토중', '추가정보 요청', '회원 확인중', '수락', '소개 확정', '만남 예정', '만남 완료'];

export function useProposals() {
  const inbox = useAppStore((s) => s.inbox);
  const outbox = useAppStore((s) => s.outbox);
  const setInbox = useAppStore((s) => s.setInbox);
  const setOutbox = useAppStore((s) => s.setOutbox);
  const profile = useAppStore((s) => s.profile);
  const [loading, setLoading] = useState(false);

  const fetchInbox = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile?.agency_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .eq('to_agency_id', profile.agency_id)
      .order('created_at', { ascending: false });
    if (data) setInbox(data);
    setLoading(false);
  }, [profile?.agency_id]);

  const fetchOutbox = useCallback(async () => {
    if (!isSupabaseConfigured() || !profile?.agency_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .eq('from_agency_id', profile.agency_id)
      .order('created_at', { ascending: false });
    if (data) setOutbox(data);
    setLoading(false);
  }, [profile?.agency_id]);

  const createProposal = useCallback(async (proposal) => {
    // B-6: 제안 중복 방지 — 동일 회원+상대에 진행중인 제안이 있으면 차단
    const activeStatuses = ['검토중', '열람함', '응답대기', '추가정보 요청', '회원 확인중', '수락', '소개 확정'];
    const store = useAppStore.getState();
    const duplicate = store.outbox.find(
      (p) => p.memberId === proposal.memberId && p.candidate === proposal.candidate && activeStatuses.includes(p.status)
    );
    if (duplicate) {
      return { data: null, error: { message: `이미 진행중인 제안이 있습니다 (${duplicate.id}: ${duplicate.status})` } };
    }

    if (!isSupabaseConfigured()) {
      const newItem = {
        id: `OUT-${String(Date.now()).slice(-3)}`,
        ...proposal,
        status: '검토중',
        lastAction: '방금',
      };
      setOutbox((prev) => [newItem, ...prev]);
      logActivity({ action: LOG_ACTIONS.PROPOSAL_SEND, target: 'proposal', targetId: newItem.id, detail: `${proposal.memberId} → ${proposal.candidate}` });
      return { data: newItem, error: null };
    }
    const { data, error } = await supabase.from('proposals').insert(proposal).select().single();
    if (!error) setOutbox((prev) => [data, ...prev]);
    return { data, error };
  }, []);

  const updateProposalStatus = useCallback(async (id, newStatus) => {
    if (!isSupabaseConfigured()) {
      const updateList = (list) =>
        list.map((item) => (item.id === id ? { ...item, status: newStatus, lastAction: '방금' } : item));
      setInbox(updateList);
      setOutbox(updateList);
      return { error: null };
    }
    const stepIdx = WORKFLOW.indexOf(newStatus);
    const { error } = await supabase
      .from('proposals')
      .update({ status: newStatus, workflow_step: stepIdx >= 0 ? stepIdx : 0 })
      .eq('id', id);
    if (!error) {
      await fetchInbox();
      await fetchOutbox();
    }
    return { error };
  }, [fetchInbox, fetchOutbox]);

  const updateProposalConsent = useCallback(async (id, field, value) => {
    if (!isSupabaseConfigured()) {
      const updateList = (list) =>
        list.map((item) => (item.id === id ? { ...item, [field]: value, lastAction: '방금' } : item));
      setInbox(updateList);
      setOutbox(updateList);
      return { error: null };
    }
    const { error } = await supabase
      .from('proposals')
      .update({ [field]: value })
      .eq('id', id);
    if (!error) {
      await fetchInbox();
      await fetchOutbox();
    }
    return { error };
  }, [fetchInbox, fetchOutbox]);

  const setMeetingArranged = useCallback(async (id, meetingInfo) => {
    if (!isSupabaseConfigured()) {
      const updateList = (list) =>
        list.map((item) => (item.id === id ? { ...item, meetingArranged: meetingInfo, status: '소개 확정', lastAction: '방금' } : item));
      setInbox(updateList);
      setOutbox(updateList);
      return { error: null };
    }
    const { error } = await supabase
      .from('proposals')
      .update({ meeting_arranged: meetingInfo, status: '소개 확정' })
      .eq('id', id);
    if (!error) {
      await fetchInbox();
      await fetchOutbox();
    }
    return { error };
  }, [fetchInbox, fetchOutbox]);

  return {
    inbox,
    outbox,
    loading,
    fetchInbox,
    fetchOutbox,
    createProposal,
    updateProposalStatus,
    updateProposalConsent,
    setMeetingArranged,
  };
}
