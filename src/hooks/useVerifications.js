import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { verifyQueue } from '../lib/seedData';

export function useVerifications() {
  const [items, setItems] = useState(verifyQueue);
  const [loading, setLoading] = useState(false);

  const fetchVerifications = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase.from('verifications').select('*').order('created_at', { ascending: false });
    if (data) setItems(data.map(mapDbToLocal));
    setLoading(false);
  }, []);

  const updateStatus = useCallback(async (id, newStatus) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      return { error: null };
    }
    const { error } = await supabase.from('verifications').update({ status: newStatus }).eq('id', id);
    if (!error) await fetchVerifications();
    return { error };
  }, [fetchVerifications]);

  const createVerification = useCallback(async (verification) => {
    if (!isSupabaseConfigured()) {
      const newItem = { id: `VER-${Date.now()}`, ...verification, status: '대기' };
      setItems((prev) => [newItem, ...prev]);
      return { data: newItem, error: null };
    }
    const { data, error } = await supabase.from('verifications').insert(verification).select().single();
    if (!error) setItems((prev) => [mapDbToLocal(data), ...prev]);
    return { data, error };
  }, []);

  return { items, loading, fetchVerifications, updateStatus, createVerification };
}

function mapDbToLocal(row) {
  return {
    id: row.id,
    memberId: row.member_id,
    type: row.type,
    owner: '인증팀',
    due: row.due_date || '미정',
    status: row.status,
    fileUrls: row.file_urls || [],
    notes: row.notes,
  };
}
