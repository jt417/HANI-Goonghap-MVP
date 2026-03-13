import React, { useState, useEffect } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { useProposals } from '../hooks/useProposals';

export default function InboxPage() {
  const { inbox, loading, fetchInbox, updateProposalStatus } = useProposals();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (!selected && inbox.length > 0) setSelected(inbox[0]);
  }, [inbox, selected]);

  const columns = [
    { key: 'agency', label: '업체', width: '1.1fr' },
    { key: 'memberId', label: '우리 회원', width: '0.9fr' },
    { key: 'candidate', label: '상대 후보', width: '0.9fr' },
    { key: 'score', label: '점수', width: '0.6fr' },
    { key: 'status', label: '상태', width: '0.8fr' },
    { key: 'lastAction', label: '최근 액션', width: '0.8fr' },
    { key: 'owner', label: '담당', width: '0.7fr' },
  ];

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const { error } = await updateProposalStatus(selected.id, newStatus);
    if (!error) setSelected((prev) => prev ? { ...prev, status: newStatus, lastAction: '방금' } : prev);
  };

  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="받은 제안함" subtitle="타 업체가 보낸 소개 요청과 추가 정보 요청을 관리합니다.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
          ) : (
            <TableList columns={columns} rows={inbox} onRowClick={setSelected} selectedRowId={selected?.id} />
          )}
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="받은 제안 상세"
        item={selected}
        actions={
          <>
            <button onClick={() => handleAction('추가정보 요청')} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">추가정보 요청</button>
            <button onClick={() => handleAction('수락')} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">수락</button>
            <button onClick={() => handleAction('회원 확인중')} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">회원 확인 진행</button>
          </>
        }
      />
    </div>
  );
}
