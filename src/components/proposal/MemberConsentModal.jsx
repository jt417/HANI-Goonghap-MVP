import React from 'react';
import { X, CheckCircle2, XCircle, MessageCircle } from 'lucide-react';
import StatusChip from '../common/StatusChip';

export default function MemberConsentModal({ open, onClose, proposal, memberName, counterpart, side, onConsent }) {
  if (!open) return null;

  const isOur = side === 'our';
  const targetLabel = isOur ? '우리 회원' : '상대 회원';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* 카카오톡 스타일 헤더 */}
        <div className="rounded-t-2xl bg-gradient-to-r from-amber-300 to-yellow-200 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} className="text-amber-900" />
              <span className="text-sm font-bold text-amber-900">카카오톡 링크 미리보기</span>
            </div>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-amber-400/30">
              <X size={18} className="text-amber-900" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-amber-800">
            {targetLabel}에게 전송될 프로필 링크 시뮬레이션
          </p>
        </div>

        {/* 메시지 버블 */}
        <div className="p-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {/* 발신자 */}
            <div className="text-[11px] font-medium text-slate-400 mb-3">
              HANI MatchOS · 매니저 알림
            </div>

            {/* 프로필 카드 */}
            <div className="rounded-xl border border-violet-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-bold text-slate-800">
                  {isOur ? '상대측' : '우리측'} 프로필
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {proposal?.score || 0}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-14 text-xs text-slate-400">후보</span>
                  <span className="text-sm font-medium text-slate-800">{counterpart || proposal?.candidate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-xs text-slate-400">업체</span>
                  <span className="text-sm text-slate-700">{proposal?.agency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-14 text-xs text-slate-400">매칭점수</span>
                  <span className="text-sm font-bold text-violet-700">{proposal?.score}점</span>
                </div>
              </div>

              {/* 공개 범위 정보 */}
              {proposal?.visibility && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 mb-1.5">공개 정보</div>
                  <div className="flex flex-wrap gap-1">
                    {proposal.visibility.map((v) => (
                      <span key={v} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 border border-indigo-100">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 동의 요청 메시지 */}
            <div className="mt-3 text-xs text-slate-600 leading-5">
              매니저가 추천하는 {isOur ? '상대' : '우리'} 회원 프로필입니다.
              프로필을 확인하시고 만남 의향을 알려주세요.
            </div>
          </div>

          {/* 시뮬레이션 안내 */}
          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-700">
            ⚠️ 시뮬레이션 모드: 실제로는 카카오톡으로 링크가 전송됩니다.
            아래 버튼으로 {targetLabel}의 응답을 시뮬레이션하세요.
          </div>

          {/* 동의/거절 버튼 */}
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => { onConsent(side === 'our' ? 'ourMemberConsent' : 'counterpartConsent', '거절'); onClose(); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition"
            >
              <XCircle size={16} /> 거절
            </button>
            <button
              onClick={() => { onConsent(side === 'our' ? 'ourMemberConsent' : 'counterpartConsent', '동의'); onClose(); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition"
            >
              <CheckCircle2 size={16} /> 동의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
