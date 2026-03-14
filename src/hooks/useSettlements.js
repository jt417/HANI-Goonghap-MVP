import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { settlementItems } from '../lib/seedData';
import { logActivity, LOG_ACTIONS } from './useActivityLog';

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

  const createSettlement = useCallback(async (settlement) => {
    const newItem = {
      id: `STL-${String(Date.now()).slice(-4)}`,
      status: '정산 예정',
      stage: '소개 완료',
      createdAt: new Date().toISOString(),
      ...settlement,
    };
    if (!isSupabaseConfigured()) {
      setItems((prev) => [newItem, ...prev]);
      logActivity({ action: LOG_ACTIONS.SETTLEMENT_CREATE, target: 'settlement', targetId: newItem.id, detail: `${settlement.partner} · ${settlement.pair}` });
      return { data: newItem, error: null };
    }
    const { data, error } = await supabase.from('settlements').insert(newItem).select().single();
    if (!error) setItems((prev) => [data, ...prev]);
    return { data: data || newItem, error };
  }, []);

  const updateStatus = useCallback(async (id, newStatus) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      if (newStatus === '정산완료') logActivity({ action: LOG_ACTIONS.SETTLEMENT_COMPLETE, target: 'settlement', targetId: id });
      return { error: null };
    }
    const { error } = await supabase.from('settlements').update({ status: newStatus }).eq('id', id);
    if (!error) await fetchSettlements();
    return { error };
  }, [fetchSettlements]);

  const updateSettlement = useCallback(async (id, updates) => {
    if (!isSupabaseConfigured()) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      return { error: null };
    }
    const { error } = await supabase.from('settlements').update(updates).eq('id', id);
    if (!error) await fetchSettlements();
    return { error };
  }, [fetchSettlements]);

  return { items, loading, fetchSettlements, createSettlement, updateStatus, updateSettlement };
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
