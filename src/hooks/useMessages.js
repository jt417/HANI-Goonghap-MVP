import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { proposalMessages } from '../lib/seedData';

export function useMessages(proposalId) {
  const [messages, setMessages] = useState(proposalMessages);
  const [loading, setLoading] = useState(false);

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
      const newMsg = {
        id: `MSG-${Date.now()}`,
        sender: '이팀장',
        role: 'me',
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        text,
      };
      setMessages((prev) => [...prev, newMsg]);
      return { data: newMsg, error: null };
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({ proposal_id: proposalId, text, sender_role: 'me' })
      .select()
      .single();
    if (!error) setMessages((prev) => [...prev, mapDbMessage(data)]);
    return { data, error };
  }, [proposalId]);

  // Realtime subscription
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
    time: new Date(row.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    text: row.text,
  };
}
