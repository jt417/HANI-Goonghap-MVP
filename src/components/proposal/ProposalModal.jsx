import React, { useState } from 'react';
import { ChevronRight, CheckCircle2, ShieldCheck, X, Sparkles, Scale } from 'lucide-react';
import Badge from '../common/Badge';
import { useProposals } from '../../hooks/useProposals';
import useAppStore from '../../stores/appStore';
import { ELEMENT_HANJA, STEM_ELEMENT } from '../../lib/saju';
import { computeMatchGap } from '../../lib/matching';

export default function ProposalModal({ member, selectedMyMember, onClose }) {
  const { createProposal } = useProposals();
  const profile = useAppStore((s) => s.profile);
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

  /* ── 형평성 gap ── */
  const myScore = Math.round(selectedMyMember?.grade?.overallScore || 0);
  const gapInfo = myScore > 0 ? computeMatchGap(myScore, member.matchScore) : null;

  const toggleChecklist = (label) => {
    setChecklist((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleVisibility = (item) => {
    setVisibility((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const options = ['학력', '소득 구간', '사진 일부', '궁합 요약', '가치관 요약'];

  const handleSend = async () => {
    if (!selectedMyMember) return;
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
      owner: profile?.full_name || '이팀장',
      ...(gapInfo && {
        scoreGap: gapInfo.gap,
        gapTier: gapInfo.tier,
        recommendedSplit: `${gapInfo.mySplit}:${gapInfo.theirSplit}`,
      }),
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
                  <div className="mt-1 font-bold text-slate-900">{selectedMyMember?.id} {selectedMyMember?.name || '미선택'}</div>
                  <div className="text-sm text-slate-600">{selectedMyMember?.job || '-'} / {selectedMyMember?.income || '-'}</div>
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
              {selectedMyMember?.saju?.dayMaster && (
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
                  <Sparkles size={14} className="text-indigo-600" />
                  <div className="text-xs text-indigo-800">
                    <span className="font-bold">{selectedMyMember.name}</span> 일간: {selectedMyMember.saju.dayMaster} ({ELEMENT_HANJA[STEM_ELEMENT[selectedMyMember.saju.dayMaster] || ''] || ''})
                    {selectedMyMember.saju.strength && <> · {selectedMyMember.saju.strength}</>}
                  </div>
                </div>
              )}
              <p className="mt-3 text-sm leading-6 text-slate-700">{member.chemistryNote}</p>
            </div>

            {/* ── 형평성 분석 ── */}
            {gapInfo && (
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                  <Scale size={16} className="text-violet-600" />
                  형평성 분석
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-500">보내는 회원</div>
                    <div className="mt-1 text-2xl font-black text-slate-800">{myScore}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-bold ${
                      gapInfo.color === 'emerald' ? 'text-emerald-600' :
                      gapInfo.color === 'amber' ? 'text-amber-600' :
                      gapInfo.color === 'orange' ? 'text-orange-600' : 'text-rose-600'
                    }`}>
                      {gapInfo.direction === '상향' ? '▲' : gapInfo.direction === '하향' ? '▼' : '━'}
                      {gapInfo.absGap > 3 ? ` ${gapInfo.absGap}점 차` : ''}
                    </div>
                    <div className={`mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      gapInfo.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                      gapInfo.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                      gapInfo.color === 'orange' ? 'bg-orange-100 text-orange-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {gapInfo.label}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] font-bold text-slate-500">대상 후보</div>
                    <div className="mt-1 text-2xl font-black text-slate-800">{member.matchScore}</div>
                  </div>
                </div>
                {/* split bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1.5">
                    <span>추천 정산 비율</span>
                    <span className="text-violet-700">{gapInfo.mySplit} : {gapInfo.theirSplit}</span>
                  </div>
                  <div className="flex h-4 w-full overflow-hidden rounded-full border border-slate-200">
                    <div className="flex items-center justify-center bg-violet-500 text-[9px] font-bold text-white transition-all duration-500"
                      style={{ width: `${gapInfo.mySplit}%` }}>
                      {gapInfo.mySplit}%
                    </div>
                    <div className="flex items-center justify-center bg-slate-300 text-[9px] font-bold text-slate-600 transition-all duration-500"
                      style={{ width: `${gapInfo.theirSplit}%` }}>
                      {gapInfo.theirSplit}%
                    </div>
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                    <span>우리 측</span>
                    <span>상대 측</span>
                  </div>
                </div>
                {gapInfo.absGap > 8 && (
                  <p className="mt-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] leading-4 text-amber-800">
                    종합점수 차이가 크므로 성사 시 정산 비율이 {gapInfo.mySplit}:{gapInfo.theirSplit}로 조정됩니다.
                  </p>
                )}
              </div>
            )}

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
