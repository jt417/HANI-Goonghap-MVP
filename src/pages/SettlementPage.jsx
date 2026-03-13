import React, { useState, useEffect } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { useSettlements } from '../hooks/useSettlements';

export default function SettlementPage() {
  const { items, loading, fetchSettlements, updateStatus } = useSettlements();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  useEffect(() => {
    if (!selected && items.length > 0) setSelected(items[0]);
  }, [items]);

  const columns = [
    { key: 'partner', label: '파트너 업체', width: '1fr' },
    { key: 'pair', label: '매칭 페어', width: '1.2fr' },
    { key: 'stage', label: '단계', width: '0.8fr' },
    { key: 'amount', label: '금액', width: '0.7fr' },
    { key: 'split', label: '배분', width: '0.7fr' },
    { key: 'due', label: '예정일', width: '0.8fr' },
    { key: 'status', label: '상태', width: '0.8fr' },
  ];

  const handleAction = async (newStatus) => {
    if (!selected) return;
    const { error } = await updateStatus(selected.id, newStatus);
    if (!error) setSelected((prev) => prev ? { ...prev, status: newStatus } : prev);
  };

  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="정산관리" subtitle="성사 단계별 정산 예정액, 배분 비율, 지급 상태를 추적합니다.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
          ) : (
            <TableList columns={columns} rows={items} onRowClick={setSelected} selectedRowId={selected?.id} />
          )}
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="정산 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">배분 조정</button>
            <button className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">증빙 요청</button>
            <button onClick={() => handleAction('정산완료')} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">정산 확정</button>
          </>
        }
      />
    </div>
  );
}
