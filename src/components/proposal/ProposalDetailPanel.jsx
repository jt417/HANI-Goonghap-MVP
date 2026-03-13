import React from 'react';
import { MessageSquare, Send } from 'lucide-react';
import StatusChip from '../common/StatusChip';
import DetailField from '../common/DetailField';
import WorkflowStepper from './WorkflowStepper';
import { proposalMessages } from '../../lib/seedData';

export default function ProposalDetailPanel({ title, item, actions }) {
  if (!item) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-400">항목을 선택하세요.</div>;
  }
  return (
    <aside className="border-l border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">상세 정보</div>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.id}</p>
        </div>
        <StatusChip label={item.status || item.level} />
      </div>
      {'status' in item ? <div className="mt-5"><WorkflowStepper status={item.status} /></div> : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {'agency' in item ? <DetailField label="업체" value={item.agency} /> : <DetailField label="파트너" value={item.partner} />}
        <DetailField label="담당" value={item.owner || '-'} />
        {'memberId' in item ? <DetailField label="회원" value={item.memberId} /> : null}
        {'candidate' in item ? <DetailField label="상대 후보" value={item.candidate} /> : null}
        {'score' in item ? <DetailField label="매칭 점수" value={`${item.score}점`} /> : null}
        {'lastAction' in item ? <DetailField label="최근 액션" value={item.lastAction} /> : null}
        {'due' in item ? <DetailField label="예정일" value={item.due} /> : null}
        {'amount' in item ? <DetailField label="정산 금액" value={item.amount} /> : null}
      </div>
      {'issue' in item ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-bold text-rose-900">이슈 내용</div>
          <p className="mt-2 text-sm leading-6 text-rose-900">{item.issue}</p>
        </div>
      ) : null}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} /> 메시지 스레드</div>
        <div className="mt-4 space-y-3">
          {proposalMessages.map((msg) => (
            <div key={msg.id} className={`rounded-2xl p-3 text-sm ${msg.role === 'me' ? 'ml-8 bg-violet-50 text-violet-900' : 'mr-8 border border-slate-200 bg-white text-slate-700'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{msg.sender}</span>
                <span className="text-slate-400">{msg.time}</span>
              </div>
              <p className="mt-2 leading-6">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" placeholder="상대 업체에 메시지 보내기" />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Send size={16} /></button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {actions}
      </div>
    </aside>
  );
}
