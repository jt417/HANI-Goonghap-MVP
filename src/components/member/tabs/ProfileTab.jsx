import React, { useState, useRef } from 'react';
import { Edit3, Save, Camera, Plus, X, Heart, ArrowRight, CheckCircle2 } from 'lucide-react';
import { bodyTypeOptions, eduOptions, locationOptions, idealTypeCategories, idealTypeOptions } from '../../../lib/constants';
import { normalizeIdealWeights } from '../../../lib/scoring';

export default function ProfileTab({ member, onUpdate, showToast }) {
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const photoInputRef = useRef(null);

  const handleEditStart = () => {
    setEditForm({
      job: member.job || '',
      income: member.income || '',
      height: member.height || '',
      bodyType: member.bodyType || '',
      location: member.location || '',
      edu: member.edu || '',
      family: member.family || '',
      appearanceNote: member.appearanceNote || '',
      phone: member.phone || '',
    });
    setEditMode(true);
  };

  const handleEditSave = () => {
    onUpdate(member.id, editForm);
    showToast('회원 정보 수정 완료', 'emerald');
    setEditMode(false);
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const existing = member.photos || [];
    if (existing.length + files.length > 6) return;
    let processed = 0;
    const newPhotos = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        newPhotos.push(ev.target.result);
        processed++;
        if (processed === files.length) {
          onUpdate(member.id, { photos: [...existing, ...newPhotos] });
          showToast(`사진 ${files.length}장 추가됨`, 'indigo');
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handlePhotoRemove = (idx) => {
    const prevPhotos = [...(member.photos || [])];
    const filtered = prevPhotos.filter((_, i) => i !== idx);
    onUpdate(member.id, { photos: filtered });
    showToast('사진 삭제됨', 'slate', () => {
      onUpdate(member.id, { photos: prevPhotos });
    });
  };

  const infoFields = [
    ['직업', member.job],
    ['연소득', member.income],
    ['자산', member.assets],
    ['거주', member.location],
    ['키/체형', `${member.height}cm · ${member.bodyType}`],
    ['학력', member.edu],
    ['집안', member.family],
    ['외모 메모', member.appearanceNote],
    ['전화번호', member.phone],
  ];

  const renderEditField = (label, key) => {
    const value = editForm[key] || '';
    const onChange = (v) => setEditForm((prev) => ({ ...prev, [key]: v }));

    if (key === 'bodyType') {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-slate-200 bg-transparent text-sm font-medium text-slate-800 outline-none focus:border-violet-400">
          {bodyTypeOptions[member.gender]?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'location') {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-slate-200 bg-transparent text-sm font-medium text-slate-800 outline-none focus:border-violet-400">
          {locationOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'edu') {
      return (
        <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-slate-200 bg-transparent text-sm font-medium text-slate-800 outline-none focus:border-violet-400">
          {eduOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (key === 'height') {
      return (
        <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-slate-200 bg-transparent text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
      );
    }
    return (
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border-b border-slate-200 bg-transparent text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Info Grid */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">기본 정보</div>
          {editMode ? (
            <div className="flex gap-1.5">
              <button onClick={() => setEditMode(false)} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50">취소</button>
              <button onClick={handleEditSave} className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-600"><Save size={12} /> 저장</button>
            </div>
          ) : (
            <button onClick={handleEditStart} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"><Edit3 size={12} /> 수정</button>
          )}
        </div>
        {editMode ? (
          <div className="grid grid-cols-2 gap-3">
            {[['직업', 'job'], ['연소득', 'income'], ['키', 'height'], ['체형', 'bodyType'], ['거주', 'location'], ['학력', 'edu'], ['집안', 'family'], ['외모 메모', 'appearanceNote'], ['전화번호', 'phone']].map(([label, key]) => (
              <div key={key} className="rounded-xl border border-violet-200 p-3">
                <div className="text-xs text-violet-600">{label}</div>
                {renderEditField(label, key)}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {infoFields.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{v || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contract Info (Phase 2-2) */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-bold text-slate-800">계약 정보</div>
          {!editMode && (
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              member.paymentStatus === '완납' ? 'bg-emerald-100 text-emerald-700' :
              member.paymentStatus === '미납' ? 'bg-rose-100 text-rose-700' :
              member.paymentStatus === '분납중' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-500'
            }`}>{member.paymentStatus || '미등록'}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['가입일', member.contractDate || '-'],
            ['만료일', member.contractEndDate || '-'],
            ['가입비', member.fee ? `${member.fee}만원` : '-'],
            ['성공보수', member.successFee ? `${member.successFee}만원` : '-'],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-400">{k}</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Outcome Tracking */}
      {(member.status === '매칭중' || member.status === '성혼' || member.matchOutcome) && (
        <MatchOutcomeSection member={member} onUpdate={onUpdate} showToast={showToast} />
      )}

      {/* Photo Gallery */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Camera size={16} /> 사진함 <span className="text-xs font-normal text-slate-400">({(member.photos || []).length}/6)</span>
          </div>
          {(member.photos || []).length < 6 && (
            <button onClick={() => photoInputRef.current?.click()} className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200">
              <Plus size={13} /> 추가
            </button>
          )}
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
        {(member.photos || []).length > 0 ? (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {member.photos.map((src, i) => (
              <div key={i} className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-slate-200" onClick={() => setPreviewPhoto(src)}>
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button onClick={(e) => { e.stopPropagation(); handlePhotoRemove(i); }} className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"><X size={12} /></button>
                {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>}
              </div>
            ))}
          </div>
        ) : (
          <div onClick={() => photoInputRef.current?.click()} className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-6 text-xs text-slate-400 hover:border-violet-300 hover:text-violet-500">
            클릭하여 사진을 추가하세요
          </div>
        )}
      </div>

      {/* Profile Completion */}
      <div className="rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-slate-800">프로필 완성도</span>
          <span className="font-bold text-violet-700">{member.profileCompletion}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-violet-500 transition-all" style={{ width: `${member.profileCompletion}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {member.values?.map((tag) => (
            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>
          ))}
        </div>
      </div>

      {/* Ideal Type Preferences */}
      {member.idealType && (() => {
        const weights = normalizeIdealWeights(member.idealType);
        const toneMap = { '매우 중요': 'bg-violet-500', '중요': 'bg-blue-500', '보통': 'bg-slate-400', '덜 중요': 'bg-slate-300', '상관없음': 'bg-slate-200' };
        const textMap = { '매우 중요': 'text-violet-700', '중요': 'text-blue-700', '보통': 'text-slate-600', '덜 중요': 'text-slate-400', '상관없음': 'text-slate-300' };
        return (
          <div className="rounded-2xl border border-pink-200 bg-pink-50/40 p-4">
            <div className="text-sm font-bold text-pink-800 mb-3">💕 이상형 선호도</div>
            <div className="space-y-2.5">
              {idealTypeCategories.map((cat) => {
                const pref = member.idealType[cat.key] || '보통';
                const w = weights[cat.key];
                return (
                  <div key={cat.key} className="flex items-center gap-2">
                    <span className="w-5 text-center text-sm">{cat.icon}</span>
                    <span className="w-16 text-xs font-medium text-slate-700 truncate">{cat.label}</span>
                    <div className="flex-1 h-4 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${toneMap[pref]}`} style={{ width: `${w}%` }} />
                    </div>
                    <span className={`w-10 text-right text-xs font-bold ${textMap[pref]}`}>{w.toFixed(0)}%</span>
                    <span className={`w-14 text-right text-[10px] font-medium ${textMap[pref]}`}>{pref}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Ideal Conditions (Phase 2-3) */}
      <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
        <div className="text-sm font-bold text-violet-800 mb-3">조건 분류</div>
        <div className="space-y-3">
          {[
            { key: 'mustHave', label: '절대 조건', color: 'rose', desc: '이 조건이 안 맞으면 소개 불가' },
            { key: 'preferred', label: '선호 조건', color: 'blue', desc: '있으면 좋지만 필수는 아님' },
            { key: 'dealBreaker', label: '거절 조건', color: 'slate', desc: '이 조건이면 절대 거절' },
          ].map(({ key, label, color, desc }) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-2 w-2 rounded-full ${color === 'rose' ? 'bg-rose-500' : color === 'blue' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                <span className="text-xs font-bold text-slate-700">{label}</span>
                <span className="text-[10px] text-slate-400">{desc}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(member.idealConditions?.[key] || []).length > 0 ? (
                  member.idealConditions[key].map((cond) => (
                    <span key={cond} className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      color === 'rose' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      color === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>{cond}</span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400">미설정</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewPhoto(null)}>
          <div className="relative max-h-[80vh] max-w-[80vw]">
            <img src={previewPhoto} alt="" className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain" />
            <button onClick={() => setPreviewPhoto(null)} className="absolute -right-3 -top-3 rounded-full bg-white p-2 shadow-lg hover:bg-slate-100"><X size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 성혼 추적 파이프라인 ── */
const MATCH_STAGES = [
  { key: '교제중', label: '교제중', color: 'bg-pink-500' },
  { key: '성사 확정', label: '성혼 확정', color: 'bg-rose-500' },
  { key: '성혼 정산', label: '정산 완료', color: 'bg-emerald-500' },
];

function MatchOutcomeSection({ member, onUpdate, showToast }) {
  const [editing, setEditing] = useState(false);
  const outcome = member.matchOutcome || {};
  const currentStage = outcome.stage || '교제중';
  const currentIdx = MATCH_STAGES.findIndex((s) => s.key === currentStage);

  const handleStageAdvance = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= MATCH_STAGES.length) return;
    const next = MATCH_STAGES[nextIdx];
    const updates = { ...outcome, stage: next.key };
    if (next.key === '성사 확정') updates.confirmDate = new Date().toISOString().split('T')[0];
    if (next.key === '성혼 정산') updates.settlementDate = new Date().toISOString().split('T')[0];
    onUpdate(member.id, { matchOutcome: updates, status: next.key === '성혼 정산' ? '성혼' : member.status });
    showToast(`${next.label} 단계로 전환되었습니다.`, 'rose');
  };

  const handleStartDating = (partnerName) => {
    onUpdate(member.id, {
      matchOutcome: { stage: '교제중', partnerName, startDate: new Date().toISOString().split('T')[0] },
      status: '매칭중',
    });
    showToast(`교제 시작: ${partnerName}`, 'rose');
    setEditing(false);
  };

  if (!outcome.stage && !editing) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-rose-800">
            <Heart size={16} /> 성혼 추적
          </div>
          <button onClick={() => setEditing(true)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700">
            교제 시작
          </button>
        </div>
        <p className="mt-2 text-xs text-rose-600">아직 교제가 시작되지 않았습니다.</p>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-3">
          <Heart size={16} /> 교제 시작 등록
        </div>
        <PartnerInput onSubmit={handleStartDating} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-3">
        <Heart size={16} /> 성혼 추적
      </div>

      {/* Stage stepper */}
      <div className="flex items-center gap-1 mb-4">
        {MATCH_STAGES.map((stage, idx) => {
          const isActive = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <React.Fragment key={stage.key}>
              {idx > 0 && <ArrowRight size={12} className={isActive ? 'text-rose-400' : 'text-slate-300'} />}
              <div className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                isCurrent ? `${stage.color} text-white ring-2 ring-rose-200` :
                isActive ? `${stage.color} text-white opacity-50` :
                'bg-slate-100 text-slate-400'
              }`}>
                {stage.label}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {outcome.partnerName && (
          <div className="rounded-xl border border-rose-200 bg-white p-2.5">
            <div className="text-[10px] text-slate-400">매칭 상대</div>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{outcome.partnerName}</div>
          </div>
        )}
        {outcome.startDate && (
          <div className="rounded-xl border border-rose-200 bg-white p-2.5">
            <div className="text-[10px] text-slate-400">교제 시작일</div>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{outcome.startDate}</div>
          </div>
        )}
        {outcome.confirmDate && (
          <div className="rounded-xl border border-rose-200 bg-white p-2.5">
            <div className="text-[10px] text-slate-400">성혼 확정일</div>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{outcome.confirmDate}</div>
          </div>
        )}
        {outcome.settlementDate && (
          <div className="rounded-xl border border-rose-200 bg-white p-2.5">
            <div className="text-[10px] text-slate-400">정산 완료일</div>
            <div className="mt-0.5 text-sm font-medium text-slate-800">{outcome.settlementDate}</div>
          </div>
        )}
      </div>

      {/* Advance button */}
      {currentIdx < MATCH_STAGES.length - 1 && (
        <button
          onClick={handleStageAdvance}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition"
        >
          {MATCH_STAGES[currentIdx + 1].label} 단계로 전환 <ArrowRight size={14} />
        </button>
      )}
      {currentIdx === MATCH_STAGES.length - 1 && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={14} /> 성혼 정산 완료
        </div>
      )}
    </div>
  );
}

function PartnerInput({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && name.trim() && onSubmit(name.trim())}
        placeholder="매칭 상대 이름"
        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-rose-400"
        autoFocus
      />
      <button onClick={() => name.trim() && onSubmit(name.trim())} disabled={!name.trim()} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-40">시작</button>
      <button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100">취소</button>
    </div>
  );
}
