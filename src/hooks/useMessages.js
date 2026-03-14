import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import useAppStore from '../stores/appStore';
import { proposalMessages } from '../lib/seedData';

const demoMessageStore = new Map();

function getDemoMessages(proposalId) {
  if (!proposalId) return [...proposalMessages];
  if (!demoMessageStore.has(proposalId)) {
    demoMessageStore.set(proposalId, [...proposalMessages]);
  }
  return demoMessageStore.get(proposalId);
}

export function useMessages(proposalId) {
  const profile = useAppStore((s) => s.profile);
  const senderName = profile?.full_name || '이팀장';
  const [messages, setMessages] = useState(() => {
    if (!isSupabaseConfigured()) return getDemoMessages(proposalId);
    return [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setMessages(getDemoMessages(proposalId));
    }
  }, [proposalId]);

  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured() || !proposalId) return;
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data.map(mapDbMessage));
    setLoading(false);
  }, [proposalId]);

  const sendMessage = useCallback(async (text) => {
    if (!isSupabaseConfigured()) {
      const now = new Date();
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: senderName,
        role: 'me',
        date: `${now.getMonth() + 1}/${now.getDate()}`,
        time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        text,
      };
      const current = getDemoMessages(proposalId);
      const updated = [...current, newMsg];
      if (proposalId) demoMessageStore.set(proposalId, updated);
      setMessages(updated);
      return { data: newMsg, error: null };
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({ proposal_id: proposalId, text, sender_role: 'me' })
      .select()
      .single();
    if (!error) setMessages((prev) => [...prev, mapDbMessage(data)]);
    return { data, error };
  }, [proposalId, senderName]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !proposalId) return;
    const channel = supabase
      .channel(`messages:${proposalId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `proposal_id=eq.${proposalId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, mapDbMessage(payload.new)]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [proposalId]);

  return { messages, loading, fetchMessages, sendMessage };
}

function mapDbMessage(row) {
  return {
    id: row.id,
    sender: row.sender_name || '상대 업체',
    role: row.sender_role || 'partner',
    date: (() => { const d = new Date(row.created_at); return `${d.getMonth() + 1}/${d.getDate()}`; })(),
    time: new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    text: row.text,
  };
}
