import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import Badge from '../common/Badge';
import { useProposals } from '../../hooks/useProposals';

export default function ProposalModal({ member, selectedMyMember, onClose }) {
  const { createProposal } = useProposals();
  const [visibility, setVisibility] = useState(['학력', '궁합 요약', '소득 구간']);
  const [memo, setMemo] = useState('');
  const [sending, setSending] = useState(false);
  const checklistLabels = [
    '회원 1차 소개 의사 확인 완료',
    '민감 개인정보 비공개 설정 확인',
    '종교 / 자녀 계획 등 주요 이슈 사전 브리핑 예정',
    '수락 시 2차 공개 범위 별도 승인 필요',
  ];
  const [checklist, setChecklist] = useState(checklistLabels.reduce((acc, label) => ({ ...acc, [label]: true }), {}));

  const toggleChecklist = (label) => {
    setChecklist((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleVisibility = (item) => {
    setVisibility((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const options = ['학력', '소득 구간', '사진 일부', '궁합 요약', '가치관 요약'];

  const handleSend = async () => {
    setSending(true);
    await createProposal({
      memberId: selectedMyMember.id,
      candidate: member.id,
      agency: member.agency,
      score: member.matchScore,
      visibility,
      memo,
      status: '검토중',
      lastAction: '방금',
      owner: '이팀장',
    });
    setSending(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">소개 제안서 작성</h3>
            <p className="mt-1 text-sm text-slate-500">상대 업체가 수락하기 전까지 실명·연락처는 비공개입니다.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-0">
          <div className="space-y-6 p-6">
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div>
                  <div className="text-xs font-bold text-violet-700">보내는 회원</div>
                  <div className="mt-1 font-bold text-slate-900">{selectedMyMember.id} {selectedMyMember.name}</div>
                  <div className="text-sm text-slate-600">{selectedMyMember.job} / {selectedMyMember.income}</div>
                </div>
                <div className="text-center text-violet-400">
                  <ChevronRight size={24} className="mx-auto" />
                  <div className="text-xs font-bold text-violet-700">{member.matchScore}점</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">대상 익명 카드</div>
                  <div className="mt-1 flex items-center justify-end gap-2 font-bold text-slate-900">
                    <Badge level={member.verifyLevel} /> {member.id}
                  </div>
                  <div className="text-sm text-slate-600">{member.jobCategory} / {member.incomeRange}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-800">요청 회원과의 궁합 요약</div>
              <p className="mt-3 text-sm leading-6 text-slate-700">{member.chemistryNote}</p>
            </div>

            <div>
              <div className="mb-3 text-sm font-bold text-slate-800">1차 공개 범위 선택</div>
              <div className="grid grid-cols-2 gap-3">
                {options.map((opt) => {
                  const active = visibility.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleVisibility(opt)}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                        active
                          ? 'border-violet-300 bg-violet-50 text-violet-900'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt}</span>
                        {active ? <CheckCircle2 size={16} className="text-violet-600" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-3 text-sm font-bold text-slate-800">상대 매니저에게 남길 메모</div>
              <textarea
                rows={5}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-4 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                placeholder="예: 양측 모두 맞벌이/장기 안정형 선호가 강하고, 관계 속도만 조율되면 장기적으로 안정성이 높다고 판단합니다."
              />
            </div>
          </div>

          <aside className="border-l border-slate-200 bg-slate-50 p-6">
            <div className="text-sm font-bold text-slate-800">발송 전 체크리스트</div>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {checklistLabels.map((label) => (
                <label key={label} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 cursor-pointer">
                  <input type="checkbox" className="mt-1" checked={checklist[label]} onChange={() => toggleChecklist(label)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-amber-600" />
                <div>
                  연락처는 양측 회원이 소개를 수락한 뒤에만 공개됩니다. 외부 업체에는 실명과 원문 증빙이 전달되지 않습니다.
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button onClick={onClose} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">취소</button>
              <button onClick={handleSend} disabled={sending} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
                {sending ? '발송 중...' : '제안서 발송하기'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
