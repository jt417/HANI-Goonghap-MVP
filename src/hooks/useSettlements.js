import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { settlementItems } from '../lib/seedData';

export function useSettlements() {
  const [items, setItems] = useState(settlementItems);
  const [loading, setLoading] = useState(false);

  const fetchSettlements = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const { data } = await supabase.from('settlements').select('*').order('created_at', { ascending: false });
    if (data) setItems(data.map(mapDbToLocal));
    setLoading(false);
  }, []);

  const updateStatus = useCallback(async (id, newStatus) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      return { error: null };
    }
    const { error } = await supabase.from('settlements').update({ status: newStatus }).eq('id', id);
    if (!error) await fetchSettlements();
    return { error };
  }, [fetchSettlements]);

  return { items, loading, fetchSettlements, updateStatus };
}

function mapDbToLocal(row) {
  return {
    id: row.id,
    partner: row.partner_agency_id,
    pair: row.pair_desc,
    stage: row.stage,
    amount: row.amount,
    split: row.split_ratio,
    due: row.due_date || '미정',
    status: row.status,
  };
}
