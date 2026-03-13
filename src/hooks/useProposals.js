import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { inboxItems, outboxItems } from '../lib/seedData';

const WORKFLOW = ['검토중', '추가정보 요청', '회원 확인중', '수락'];

export function useProposals() {
  const [inbox, setInbox] = useState(inboxItems);
  const [outbox, setOutbox] = useState(outboxItems);
  const [loading, setLoading] = useState(false);

  const fetchInbox = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .eq('to_agency_id', '(SELECT agency_id FROM users WHERE id = auth.uid())')
      .order('created_at', { ascending: false });
    if (data) setInbox(data);
    setLoading(false);
  }, []);

  const fetchOutbox = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase
      .from('proposals')
      .select('*')
      .eq('from_agency_id', '(SELECT agency_id FROM users WHERE id = auth.uid())')
      .order('created_at', { ascending: false });
    if (data) setOutbox(data);
    setLoading(false);
  }, []);

  const createProposal = useCallback(async (proposal) => {
    if (!isSupabaseConfigured()) {
      const newItem = {
        id: `OUT-${String(Date.now()).slice(-3)}`,
        ...proposal,
        status: '검토중',
        lastAction: '방금',
      };
      setOutbox((prev) => [newItem, ...prev]);
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
  }, []);

  return {
    inbox,
    outbox,
    loading,
    fetchInbox,
    fetchOutbox,
    createProposal,
    updateProposalStatus,
  };
}
