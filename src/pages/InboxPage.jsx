import React, { useState } from 'react';
import SectionCard from '../components/common/SectionCard';
import TableList from '../components/common/TableList';
import ProposalDetailPanel from '../components/proposal/ProposalDetailPanel';
import { inboxItems } from '../lib/seedData';

export default function InboxPage() {
  const [selected, setSelected] = useState(inboxItems[0]);
  const columns = [
    { key: 'agency', label: '업체', width: '1.1fr' },
    { key: 'memberId', label: '우리 회원', width: '0.9fr' },
    { key: 'candidate', label: '상대 후보', width: '0.9fr' },
    { key: 'score', label: '점수', width: '0.6fr' },
    { key: 'status', label: '상태', width: '0.8fr' },
    { key: 'lastAction', label: '최근 액션', width: '0.8fr' },
    { key: 'owner', label: '담당', width: '0.7fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="받은 제안함" subtitle="타 업체가 보낸 소개 요청과 추가 정보 요청을 관리합니다.">
          <TableList columns={columns} rows={inboxItems} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel title="받은 제안 상세" item={selected} actions={<><button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">추가정보 요청</button><button className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">수락</button><button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">회원 확인 진행</button></>} />
    </div>
  );
}
