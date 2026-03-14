import { useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const MAX_LOCAL_LOGS = 200;

export function useActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const addLog = useCallback(async ({ action, target, targetId, detail, userId }) => {
    const entry = {
      id: `LOG-${Date.now()}`,
      action,
      target,
      target_id: targetId || null,
      detail: detail || null,
      user_id: userId || null,
      created_at: new Date().toISOString(),
    };

    if (!isSupabaseConfigured()) {
      setLogs((prev) => [entry, ...prev].slice(0, MAX_LOCAL_LOGS));
      return { data: entry, error: null };
    }

    const { data, error } = await supabase.from('activity_logs').insert(entry).select().single();
    if (!error) setLogs((prev) => [data || entry, ...prev].slice(0, MAX_LOCAL_LOGS));
    return { data: data || entry, error };
  }, []);

  const fetchLogs = useCallback(async (filters = {}) => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    let query = supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (filters.target) query = query.eq('target', filters.target);
    if (filters.targetId) query = query.eq('target_id', filters.targetId);
    const { data } = await query;
    if (data) setLogs(data);
    setLoading(false);
  }, []);

  return { logs, loading, addLog, fetchLogs };
}

// Standalone log function (usable outside React components/hooks)
export async function logActivity({ action, target, targetId, detail, userId }) {
  const entry = {
    id: `LOG-${Date.now()}`,
    action,
    target,
    target_id: targetId || null,
    detail: detail || null,
    user_id: userId || null,
    created_at: new Date().toISOString(),
  };
  if (!isSupabaseConfigured()) return { data: entry, error: null };
  const { data, error } = await supabase.from('activity_logs').insert(entry).select().single();
  return { data: data || entry, error };
}

// Action type constants
export const LOG_ACTIONS = {
  MEMBER_CREATE: '회원 등록',
  MEMBER_UPDATE: '회원 수정',
  MEMBER_STATUS: '회원 상태 변경',
  MEMBER_DELETE: '회원 삭제',
  PROPOSAL_SEND: '제안 발송',
  PROPOSAL_ACCEPT: '제안 수락',
  PROPOSAL_REJECT: '제안 반려',
  PROPOSAL_WITHDRAW: '제안 철회',
  PROPOSAL_EXPIRE: '제안 만료',
  SETTLEMENT_CREATE: '정산 생성',
  SETTLEMENT_UPDATE: '정산 수정',
  SETTLEMENT_COMPLETE: '정산 완료',
  DISPUTE_CREATE: '분쟁 생성',
  DISPUTE_RESOLVE: '분쟁 해결',
  VERIFY_APPROVE: '인증 승인',
  VERIFY_REJECT: '인증 반려',
  CONSENT_GIVEN: '개인정보 동의',
  DATA_DELETE_REQUEST: '데이터 삭제 요청',
};
