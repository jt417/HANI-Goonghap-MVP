import React, { useState } from 'react';
import { ArrowRightLeft, Trash2 } from 'lucide-react';
import { managerList } from '../../lib/constants';

export default function MemberDetailFooter({ member, onTransfer, onDelete }) {
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');

  const handleTransfer = () => {
    if (transferTarget && window.confirm(`${member.name} 회원을 ${transferTarget}에게 이관하시겠습니까?`)) {
      onTransfer(transferTarget);
      setTransferTarget('');
      setShowTransfer(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`${member.name} 회원을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      onDelete();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
      {showTransfer ? (
        <div className="flex items-center gap-2">
          <select
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-violet-400"
          >
            <option value="">매니저 선택</option>
            {managerList.filter((m) => m !== member.manager).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button onClick={handleTransfer} disabled={!transferTarget} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-40">이관</button>
          <button onClick={() => { setShowTransfer(false); setTransferTarget(''); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100">취소</button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button onClick={() => setShowTransfer(true)} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700">
            <ArrowRightLeft size={12} /> 매니저 이관 ({member.manager})
          </button>
          <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-600">
            <Trash2 size={12} /> 회원 삭제
          </button>
        </div>
      )}
    </div>
  );
}
