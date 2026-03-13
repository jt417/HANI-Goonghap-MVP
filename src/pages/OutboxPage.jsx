import React, { useState, useEffect } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { useProposals } from '../hooks/useProposals';

export default function OutboxPage() {
  const { outbox, loading, fetchOutbox, updateProposalStatus } = useProposals();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchOutbox();
  }, [fetchOutbox]);

  useEffect(() => {
    if (!selected && outbox.length > 0) setSelected(outbox[0]);
  }, [outbox, selected]);

  const columns = [
    { key: 'agency', label: '상대 업체', width: '1.1fr' },
    { key: 'memberId', label: '보낸 회원', width: '0.9fr' },
    { key: 'candidate', label: '상대 후보', width: '0.9fr' },
    { key: 'score', label: '점수', width: '0.6fr' },
    { key: 'status', label: '상태', width: '0.9fr' },
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
        <SectionCard title="보낸 제안함" subtitle="보낸 요청의 열람, 수락, 회원 확인, 소개 확정 흐름을 추적합니다.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
          ) : (
            <TableList columns={columns} rows={outbox} onRowClick={setSelected} selectedRowId={selected?.id} />
          )}
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="보낸 제안 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">공개 범위 수정</button>
            <button className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">리마인드 발송</button>
            <button onClick={() => handleAction('수락')} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">소개 확정 처리</button>
          </>
        }
      />
    </div>
  );
}
