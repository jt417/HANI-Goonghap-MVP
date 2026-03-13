import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { disputeItems } from '../lib/seedData';

export function useDisputes() {
  const [items, setItems] = useState(disputeItems);
  const [loading, setLoading] = useState(false);

  const fetchDisputes = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase.from('disputes').select('*').order('created_at', { ascending: false });
    if (data) setItems(data.map(mapDbToLocal));
    setLoading(false);
  }, []);

  const updateLevel = useCallback(async (id, newLevel) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, level: newLevel, updated: '방금' } : item)));
      return { error: null };
    }
    const { error } = await supabase.from('disputes').update({ level: newLevel }).eq('id', id);
    if (!error) await fetchDisputes();
    return { error };
  }, [fetchDisputes]);

  const createDispute = useCallback(async (dispute) => {
    if (!isSupabaseConfigured()) {
      const newItem = { id: `DSP-${Date.now()}`, ...dispute, level: '주의', updated: '방금' };
      setItems((prev) => [newItem, ...prev]);
      return { data: newItem, error: null };
    }
    const { data, error } = await supabase.from('disputes').insert(dispute).select().single();
    if (!error) setItems((prev) => [mapDbToLocal(data), ...prev]);
    return { data, error };
  }, []);

  return { items, loading, fetchDisputes, updateLevel, createDispute };
}

function mapDbToLocal(row) {
  return {
    id: row.id,
    partner: row.partner_agency_id,
    issue: row.issue,
    level: row.level,
    updated: row.updated_at ? new Date(row.updated_at).toLocaleDateString('ko-KR') : '오늘',
    owner: '운영관리자',
  };
}
