import React, { useState, useEffect } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { useDisputes } from '../hooks/useDisputes';

export default function DisputePage() {
  const { items, loading, fetchDisputes, updateLevel } = useDisputes();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  useEffect(() => {
    if (!selected && items.length > 0) setSelected(items[0]);
  }, [items, selected]);

  const columns = [
    { key: 'partner', label: '상대 업체', width: '1fr' },
    { key: 'issue', label: '이슈', width: '1.5fr' },
    { key: 'level', label: '상태', width: '0.9fr' },
    { key: 'updated', label: '최근 업데이트', width: '0.9fr' },
    { key: 'owner', label: '담당', width: '0.8fr' },
  ];

  const handleLevel = async (newLevel) => {
    if (!selected) return;
    const { error } = await updateLevel(selected.id, newLevel);
    if (!error) setSelected((prev) => prev ? { ...prev, level: newLevel } : prev);
  };

  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="분쟁관리" subtitle="우회 접촉, 허위 정보, 정산 분쟁 등 파트너 이슈를 기록하고 중재합니다.">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">불러오는 중...</div>
          ) : (
            <TableList columns={columns} rows={items} onRowClick={setSelected} selectedRowId={selected?.id} />
          )}
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="분쟁 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">증빙 요청</button>
            <button onClick={() => handleLevel('중재중')} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">중재 기록</button>
            <button onClick={() => handleLevel('패널티')} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">패널티 검토</button>
          </>
        }
      />
    </div>
  );
}
