import React, { useState, useEffect } from 'react';
import { Clock, Save, StickyNote, Calendar } from 'lucide-react';
import StatusChip from '../../common/StatusChip';
import { meetingTypeColors } from '../../../lib/constants';

export default function ActivityTab({ member, memberProposals, onUpdate, showToast }) {
  const [memo, setMemo] = useState(member.notes || '');
  const [cycleInput, setCycleInput] = useState('');

  useEffect(() => {
    setMemo(member.notes || '');
    const current = member.reminderCycle;
    if (current) {
      const mDay = current.match(/^(\d+)일$/);
      if (mDay) {
        setCycleInput(mDay[1]);
      } else {
        const presetMap = { '1주': '7', '2주': '14', '1개월': '30' };
        setCycleInput(presetMap[current] || '');
      }
    } else {
      setCycleInput('');
    }
  }, [member.id]);

  const handleReminderSet = () => {
    const days = parseInt(cycleInput, 10);
    if (!days || days < 1 || days > 365) return;
    const value = `${days}일`;
    if (value === member.reminderCycle) return;
    const prevCycle = member.reminderCycle;
    onUpdate(member.id, { reminderCycle: value });
    showToast(`리마인더 → ${value}`, 'amber', () => {
      onUpdate(member.id, { reminderCycle: prevCycle });
    });
  };

  const meetings = member.meetings || [];
  const sortedMeetings = [...meetings].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  return (
    <div className="space-y-5">
      {/* Reminder Cycle */}
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-2"><Clock size={13} /> 소개 리마인더 주기</div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="365"
            value={cycleInput}
            onChange={(e) => setCycleInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReminderSet()}
            placeholder="일수"
            className="w-20 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200"
          />
          <span className="text-xs text-slate-500">일마다</span>
          <button
            onClick={handleReminderSet}
            disabled={!cycleInput || parseInt(cycleInput, 10) < 1}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-40 transition"
          >설정</button>
          {member.reminderCycle && (
            <span className="ml-auto rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              현재: {member.reminderCycle}
            </span>
          )}
        </div>
      </div>

      {/* Meeting History Timeline */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-3">
          <Calendar size={16} /> 미팅 히스토리 <span className="text-xs font-normal text-slate-400">({meetings.length}건)</span>
        </div>
        {sortedMeetings.length > 0 ? (
          <div className="space-y-0">
            {sortedMeetings.map((m, i) => {
              const colorClass = meetingTypeColors[m.type] || 'bg-slate-100 text-slate-700 border-slate-200';
              const dotColor = colorClass.split(' ')[0] || 'bg-slate-300';
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 shrink-0 rounded-full ${dotColor}`} />
                    {i < sortedMeetings.length - 1 && <div className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="pb-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${colorClass}`}>{m.type}</span>
                      <span className="text-xs text-slate-500">{m.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700">{m.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 py-4">등록된 미팅이 없습니다</div>
        )}
      </div>

      {/* Proposal History */}
      {memberProposals.length > 0 && (
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-sm font-bold text-slate-800 mb-3">소개 이력 ({memberProposals.length}건)</div>
          <div className="space-y-2">
            {memberProposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                <div>
                  <div className="text-sm font-medium text-slate-800">{p.id} <span className="text-xs text-slate-400">· {p.direction}</span></div>
                  <div className="mt-0.5 text-xs text-slate-500">{p.agency} · {p.candidate}</div>
                </div>
                <StatusChip label={p.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes/Memo */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><StickyNote size={16} /> 특이사항 메모</div>
          <button
            onClick={() => { onUpdate(member.id, { notes: memo }); showToast('메모 저장됨', 'emerald'); }}
            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          ><Save size={13} /> 저장</button>
        </div>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder="회원 특이사항, 성격, 선호 조건 등을 기록하세요..."
          className="mt-3 w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-violet-400"
        />
      </div>
    </div>
  );
}
