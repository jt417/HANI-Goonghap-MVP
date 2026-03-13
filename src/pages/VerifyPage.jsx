import React, { useState, useEffect } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { useVerifications } from '../hooks/useVerifications';

export default function VerifyPage() {
  const { items, loading, fetchVerifications, updateStatus } = useVerifications();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  useEffect(() => {
    if (!selected && items.length > 0) setSelected(items[0]);
  }, [items]);

  const columns = [
    { key: 'memberId', label: '회원', width: '0.8fr' },
    { key: 'type', label: '인증 종류', width: '1fr' },
    { key: 'owner', label: '담당팀', width: '0.8fr' },
    { key: 'due', label: '마감', width: '0.8fr' },
    { key: 'status', label: '상태', width: '1fr' },
  ];

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const { error } = await updateStatus(selected.id, newStatus);
    if (!error) setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="인증센터" subtitle="본인, 재직, 소득, 자산, 가족 인증 상태와 만료 재검증을 관리합니다.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
          ) : (
            <TableList columns={columns} rows={items} onRowClick={setSelected} selectedRowId={selected?.id} />
          )}
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="인증 상세"
        item={selected}
        actions={
          <>
            <button onClick={() => handleAction('보완요청')} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">보완 요청</button>
            <button onClick={() => handleAction('승인')} className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">승인</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">검토 메모 저장</button>
          </>
        }
      />
    </div>
  );
}
