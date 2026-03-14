import React, { useState, useRef } from 'react';
import { Edit3, Save, Camera, Plus, X } from 'lucide-react';
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
            {[['직업', 'job'], ['연소득', 'income'], ['키', 'height'], ['체형', 'bodyType'], ['거주', 'location'], ['학력', 'edu'], ['집안', 'family'], ['외모 메모', 'appearanceNote']].map(([label, key]) => (
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
