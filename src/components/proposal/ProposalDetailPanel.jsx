import React, { useState } from 'react';
import { MessageSquare, Send, ExternalLink, Eye, CheckCircle2, Clock, XCircle, Sparkles } from 'lucide-react';
import StatusChip from '../common/StatusChip';
import DetailField from '../common/DetailField';
import WorkflowStepper from './WorkflowStepper';
import { useMessages } from '../../hooks/useMessages';
import { consentStatusOptions } from '../../lib/constants';

function ConsentChip({ status }) {
  const iconMap = { '대기': Clock, '발송됨': Send, '동의': CheckCircle2, '거절': XCircle };
  const toneMap = { '대기': 'bg-slate-100 text-slate-600', '발송됨': 'bg-amber-100 text-amber-700', '동의': 'bg-emerald-100 text-emerald-700', '거절': 'bg-rose-100 text-rose-700' };
  const Icon = iconMap[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${toneMap[status] || toneMap['대기']}`}>
      <Icon size={12} /> {status || '대기'}
    </span>
  );
}

export default function ProposalDetailPanel({ title, item, actions, onNavigateToMember, onOpenConsent, onMeetingAction }) {
  const [msgInput, setMsgInput] = useState('');
  const { messages, sendMessage } = useMessages(item?.id);

  if (!item) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-400">항목을 선택하세요.</div>;
  }

  const handleSend = async () => {
    if (!msgInput.trim()) return;
    await sendMessage(msgInput.trim());
    setMsgInput('');
  };

  return (
    <aside className="border-l border-slate-200 bg-white p-4 overflow-y-auto md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">상세 정보</div>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.id}</p>
        </div>
        <StatusChip label={item.status || item.level} />
      </div>
      {'status' in item ? <div className="mt-5"><WorkflowStepper status={item.status} /></div> : null}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {'agency' in item ? <DetailField label="업체" value={item.agency} /> : <DetailField label="파트너" value={item.partner || '-'} />}
        <DetailField label="담당" value={item.owner || '-'} />
        {'memberId' in item ? (
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-400">회원</div>
            {onNavigateToMember ? (
              <button
                onClick={() => onNavigateToMember(item.memberId)}
                className="mt-1 flex items-center gap-1 text-sm font-medium text-violet-700 hover:text-violet-900"
              >
                {item.memberId} <ExternalLink size={12} />
              </button>
            ) : (
              <div className="mt-1 text-sm font-medium text-slate-800">{item.memberId}</div>
            )}
          </div>
        ) : null}
        {'candidate' in item ? <DetailField label="상대 후보" value={item.candidate} /> : null}
        {'score' in item ? <DetailField label="매칭 점수" value={`${item.score}점`} /> : null}
        {'lastAction' in item ? <DetailField label="최근 액션" value={item.lastAction} /> : null}
        {'due' in item ? <DetailField label="예정일" value={item.due} /> : null}
        {'amount' in item ? <DetailField label="정산 금액" value={item.amount} /> : null}
        {'split' in item ? <DetailField label="배분 비율" value={item.split} /> : null}
        {'type' in item ? <DetailField label="인증 종류" value={item.type} /> : null}
      </div>
      {item.visibility && item.visibility.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 p-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600"><Eye size={13} /> 공개 범위</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.visibility.map((v) => (
              <span key={v} className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">{v}</span>
            ))}
          </div>
        </div>
      )}
      {/* 동의 현황 카드 */}
      {item.status && ['회원 확인중', '수락', '소개 확정'].includes(item.status) && (
        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-900 mb-3">
            <Sparkles size={16} /> 회원 동의 현황
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2.5">
              <span className="text-xs font-medium text-slate-700">우리 회원</span>
              <div className="flex items-center gap-2">
                <ConsentChip status={item.ourMemberConsent || '대기'} />
                {(!item.ourMemberConsent || item.ourMemberConsent === '대기') && onOpenConsent && (
                  <button
                    onClick={() => onOpenConsent('our')}
                    className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-violet-700"
                  >
                    동의 요청
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2.5">
              <span className="text-xs font-medium text-slate-700">상대 회원</span>
              <div className="flex items-center gap-2">
                <ConsentChip status={item.counterpartConsent || '대기'} />
                {(!item.counterpartConsent || item.counterpartConsent === '대기') && onOpenConsent && (
                  <button
                    onClick={() => onOpenConsent('counter')}
                    className="rounded-lg bg-slate-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                  >
                    (시뮬) 응답
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* 양쪽 동의 완료 배너 */}
          {item.ourMemberConsent === '동의' && item.counterpartConsent === '동의' && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-100 border border-emerald-300 px-4 py-2.5 text-sm font-bold text-emerald-800">
                <CheckCircle2 size={16} /> 양측 동의 완료!
              </div>
              {!item.meetingArranged && onMeetingAction && (
                <div className="flex gap-2">
                  <button
                    onClick={() => onMeetingAction('place')}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                  >
                    약속 장소 잡기
                  </button>
                  <button
                    onClick={() => onMeetingAction('contact')}
                    className="flex-1 rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    연락처만 전달
                  </button>
                </div>
              )}
              {item.meetingArranged && (
                <div className="rounded-xl bg-white border border-emerald-200 px-3 py-2.5 text-xs text-emerald-800">
                  {item.meetingArranged.type === '약속장소'
                    ? `📍 약속: ${item.meetingArranged.detail}`
                    : `📱 연락처 전달 완료`}
                </div>
              )}
            </div>
          )}
          {/* 거절 시 안내 */}
          {(item.ourMemberConsent === '거절' || item.counterpartConsent === '거절') && (
            <div className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-700">
              <XCircle size={12} className="inline mr-1 -mt-0.5" />
              {item.ourMemberConsent === '거절' ? '우리 회원이' : '상대 회원이'} 거절했습니다.
            </div>
          )}
        </div>
      )}
      {'issue' in item ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-bold text-rose-900">이슈 내용</div>
          <p className="mt-2 text-sm leading-6 text-rose-900">{item.issue}</p>
        </div>
      ) : null}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} /> 메시지 스레드</div>
        <div className="mt-4 space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className={`rounded-2xl p-3 text-sm ${msg.role === 'me' ? 'ml-8 bg-violet-50 text-violet-900' : 'mr-8 border border-slate-200 bg-white text-slate-700'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{msg.sender}</span>
                <span className="text-slate-400">{msg.date ? `${msg.date} ` : ''}{msg.time}</span>
              </div>
              <p className="mt-2 leading-6">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            placeholder="상대 업체에 메시지 보내기"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={!msgInput.trim()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"><Send size={16} /></button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {actions}
      </div>
    </aside>
  );
}
