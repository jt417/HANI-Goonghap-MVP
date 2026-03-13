import React from 'react';
import { CalendarRange } from 'lucide-react';
import { workflowSteps } from '../../lib/constants';

export default function WorkflowStepper({ status }) {
  const stepMap = {
    검토중: 0,
    열람함: 0,
    '추가정보 요청': 1,
    응답대기: 1,
    '회원 확인중': 2,
    수락: 3,
    '소개 확정': 3,
  };
  const current = stepMap[status] ?? 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><CalendarRange size={16} /> 진행 단계</div>
      <div className="flex items-center gap-2">
        {workflowSteps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${idx <= current ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
              <div className={`text-[11px] font-medium ${idx <= current ? 'text-violet-700' : 'text-slate-400'}`}>{step}</div>
            </div>
            {idx < workflowSteps.length - 1 ? <div className={`h-1 flex-1 rounded-full ${idx < current ? 'bg-violet-500' : 'bg-slate-200'}`} /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
