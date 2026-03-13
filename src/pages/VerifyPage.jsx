import React, { useState } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { verifyQueue } from '../lib/seedData';

export default function VerifyPage() {
  const [selected, setSelected] = useState(verifyQueue[0]);
  const columns = [
    { key: 'memberId', label: '회원', width: '0.8fr' },
    { key: 'type', label: '인증 종류', width: '1fr' },
    { key: 'owner', label: '담당팀', width: '0.8fr' },
    { key: 'due', label: '마감', width: '0.8fr' },
    { key: 'status', label: '상태', width: '1fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="인증센터" subtitle="본인, 재직, 소득, 자산, 가족 인증 상태와 만료 재검증을 관리합니다.">
          <TableList columns={columns} rows={verifyQueue} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel title="인증 상세" item={selected} actions={<><button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">보완 요청</button><button className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">승인</button><button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">검토 메모 저장</button></>} />
    </div>
  );
}
