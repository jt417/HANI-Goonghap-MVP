import React, { useState, useRef } from 'react';
import { X, Camera, Plus, ChevronDown, Check } from 'lucide-react';
import useAppStore from '../../stores/appStore';
import GradeBadge from '../common/GradeBadge';
import GradeScoreCard from '../grade/GradeScoreCard';

import { scoreMember, gradeMember, gradeOverall, normalizeIdealWeights } from '../../lib/scoring';
import {
  bodyTypeOptions, eduOptions, locationHierarchy, locationCities,
  drinkOptions, smokeOptions, religionOptions, mbtiOptions,
  jobCategoryOptions, appearanceStyleOptions, faceTypeOptions, hobbyCategoryOptions, fieldWeights,
  hairLossOptions,
  maritalStatusOptions, parentWealthOptions, parentJobOptions, parentAssetOptions,
  retirementPrepOptions, siblingsOptions, familyRiskOptions,
  idealTypeOptions, idealTypeCategories, idealConditionCategories,
  suggestBodyType,
} from '../../lib/constants';
import { useActivityLog, LOG_ACTIONS } from '../../hooks/useActivityLog';

/* ── 배점 뱃지 ── */
function WeightBadge({ fieldKey, score, gender }) {
  const fw = fieldWeights[fieldKey];
  if (!fw) return null;
  const pct = gender === 'M' ? (fw.overallM ?? fw.overall) : gender === 'F' ? (fw.overallF ?? fw.overall) : fw.overall;
  const color = score >= 85 ? 'bg-emerald-100 text-emerald-700' : score >= 70 ? 'bg-blue-100 text-blue-700' : score >= 55 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500';
  return (
    <span className="ml-auto flex items-center gap-1.5 shrink-0">
      {score !== undefined && score !== null && (
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${color}`}>{Math.round(score)}점</span>
      )}
    </span>
  );
}

/* ── SABCD 선호도 등급 알약 ── */
const PILL_STYLES = {
  S: 'bg-gradient-to-r from-amber-300 to-yellow-200 text-amber-900 ring-1 ring-amber-400/30',
  A: 'bg-violet-100 text-violet-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-slate-100 text-slate-500',
  D: 'bg-rose-100 text-rose-600',
};
function GradePill({ grade, note }) {
  if (!grade) return null;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold leading-none ${PILL_STYLES[grade] || PILL_STYLES.C}`}>
      {grade}{note ? <span className="font-semibold ml-0.5">{note}</span> : ''}
    </span>
  );
}

/* ── 섹션 타이틀 ── */
function SectionTitle({ icon, title, desc }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 border border-slate-100">
      <span className="text-base">{icon}</span>
      <div>
        <div className="text-sm font-bold text-slate-800">{title}</div>
        {desc && <div className="text-[11px] text-slate-500">{desc}</div>}
      </div>
    </div>
  );
}

/* ── 외모 스타일 복수선택 드롭다운 ── */
function AppearanceStylePicker({ gender, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const options = appearanceStyleOptions[gender] || [];
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
      >
        <span className={selected.length ? 'text-slate-800' : 'text-slate-400'}>
          {selected.length ? selected.join(', ') : '스타일 선택 (복수)'}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  if (active) onChange(selected.filter((v) => v !== opt.value));
                  else onChange([...selected, opt.value]);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition ${active ? 'bg-violet-50 text-violet-700' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? 'border-violet-500 bg-violet-500' : 'border-slate-300'}`}>
                  {active && <Check size={10} className="text-white" />}
                </div>
                <div>
                  <div className="font-medium">{opt.value}</div>
                  <div className="text-[11px] text-slate-400">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* ── 메인 모달 ── */
/* ══════════════════════════════════════════════ */

export default function MemberRegistrationModal({ open, onClose, onSave, scoreRuleWeights, badgeThresholds }) {
  const showToast = useAppStore((s) => s.showToast);
  const profile = useAppStore((s) => s.profile);
  const { addLog } = useActivityLog();
  const [activePreviewTab, setActivePreviewTab] = useState('overall');
  const [openCondCat, setOpenCondCat] = useState(null);
  const [openHobbyCat, setOpenHobbyCat] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '이서윤',
    gender: 'F',
    birthYear: '1993',
    birthMonth: '5',
    birthDay: '15',
    birthHour: '10',
    birthMinute: '30',
    birthTimeUnknown: false,
    birthPlace: '',
    maritalStatus: '초혼',
    hasChildren: false,
    childrenCount: 1,
    brotherCount: 0,
    sisterCount: 1,
    birthOrder: 1,
    height: 167,
    weight: 52,
    bodyType: '슬림',
    faceType: '청순상',
    jobCategory: '대기업',
    jobDetail: '국내 대기업 브랜드전략',
    edu: '4년제 인서울',
    income: 11000,
    financial: 27000,
    realEstate: 15000,
    location: '서울 강남구',
    drink: '월 1~2회',
    smoke: '비흡연',
    religion: '무교',
    mbti: '',
    parentWealth: '중상',
    parentJob: '은퇴(안정)',
    parentPastJob: '대기업/공기업',
    parentAssets: '5~10억',
    retirementPrep: '양호',
    siblings: '형제 직장/안정',
    familyRisk: '없음',
    familyMemo: '',
    hairLoss: '없음',
    appearanceScore: 7,
    appearanceStyles: ['세련형'],
    appearanceMemo: '자기관리 우수',
    hobbies: ['필라테스/요가', '여행', '와인/미식'],
    hobbyMemo: '',
    customHobby: '',
    managerBonusItems: [],
    phone: '',
    photos: [],
    idealType: { wealth: '보통', appearance: '보통', career: '보통', age: '보통', lifestyle: '보통', family: '보통' },
    idealConditions: { mustHave: [], preferred: [], dealBreaker: [] },
  });

  if (!open) return null;

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setNum = (key, raw) => {
    if (raw === '' || raw === undefined) { setForm((prev) => ({ ...prev, [key]: '' })); return; }
    const cleaned = String(raw).replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    const n = parseInt(cleaned, 10);
    setForm((prev) => {
      const next = { ...prev, [key]: isNaN(n) ? '' : n };
      if ((key === 'height' || key === 'weight') && next.height && next.weight) {
        const suggested = suggestBodyType(next.height, next.weight, next.gender);
        if (suggested) next.bodyType = suggested;
      }
      return next;
    });
  };

  const handleGenderChange = (g) => {
    const opts = bodyTypeOptions[g];
    const styleOpts = (appearanceStyleOptions[g] || []).map((o) => o.value);
    const faceOpts = (faceTypeOptions[g] || []).map((o) => o.value);
    const hairOpts = (hairLossOptions[g] || []).map((o) => o.value);
    setForm((prev) => ({
      ...prev,
      gender: g,
      bodyType: opts.includes(prev.bodyType) ? prev.bodyType : opts[0],
      faceType: faceOpts.includes(prev.faceType) ? prev.faceType : '',
      appearanceStyles: prev.appearanceStyles.filter((s) => styleOpts.includes(s)),
      hairLoss: hairOpts.includes(prev.hairLoss) ? prev.hairLoss : '없음',
    }));
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (form.photos.length + files.length > 6) {
      showToast(`사진은 최대 6장까지 등록 가능합니다. (현재 ${form.photos.length}장)`, 'rose');
      e.target.value = '';
      return;
    }
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, photos: [...prev.photos, ev.target.result] }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setForm((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }));
  };

  /* ── 실시간 점수 산출 ── */
  const dynamicPreview = scoreMember(form, scoreRuleWeights, badgeThresholds);
  const fs = dynamicPreview.fieldScores;
  const grades = gradeMember(form);
  const gradeOverallResult = gradeOverall(dynamicPreview.overallScore);
  const idealWeights = normalizeIdealWeights(form.idealType);

  const previewTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '경제력' },
    { key: 'appearance', label: '외모' },
    { key: 'career', label: '직업/학력' },
    { key: 'age', label: '나이' },
    { key: 'lifestyle', label: '라이프스타일' },
    { key: 'family', label: '집안' },
  ];
  const preview = dynamicPreview.categories[activePreviewTab];
  const labels = { overall: '종합', wealth: '경제력', appearance: '외모', family: '집안', career: '직업/학력', age: '나이', lifestyle: '라이프스타일' };
  const previewBadges = Object.entries(dynamicPreview.categories)
    .map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm md:p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl md:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-4 py-4 md:px-6 md:py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">신규 회원 등록</h3>
            <p className="mt-1 text-sm text-slate-500">입력값을 바꾸면 우측 점수가 실시간으로 갱신됩니다. 각 필드의 <span className="rounded bg-indigo-50 px-1 text-indigo-600 font-semibold">배점 %</span>를 확인하세요.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ═══════ LEFT: Form ═══════ */}
          <div className="max-h-[85vh] space-y-4 overflow-y-auto p-4 md:p-6 lg:max-h-[70vh]">
            {/* ── 기본 정보 ── */}
            <SectionTitle icon="👤" title="기본 정보" desc="이름, 성별, 생년월일, 나이 — 나이 배점 남8%/여15%" />
            <div className="flex items-center gap-3">
              <div className="text-sm font-bold text-slate-700">성별</div>
              <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button onClick={() => handleGenderChange('M')} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${form.gender === 'M' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>남성</button>
                <button onClick={() => handleGenderChange('F')} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${form.gender === 'F' ? 'bg-pink-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>여성</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">이름</div>
                <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">전화번호</div>
                <input type="tel" value={form.phone} onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                  const formatted = digits.length <= 3 ? digits : digits.length <= 7 ? `${digits.slice(0,3)}-${digits.slice(3)}` : `${digits.slice(0,3)}-${digits.slice(3,7)}-${digits.slice(7)}`;
                  set('phone', formatted);
                }} placeholder="010-0000-0000" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400 mb-2">
                  생년월일
                  <GradePill grade={grades.age.grade} note={grades.age.note} />
                  <WeightBadge gender={form.gender} fieldKey="age" score={fs.age} />
                </div>
                <input
                  type="text"
                  value={(() => {
                    const y = form.birthYear || '';
                    const m = form.birthMonth || '';
                    const d = form.birthDay || '';
                    if (!y && !m && !d) return '';
                    return `${y}${m ? '.' + m : ''}${d ? '.' + d : ''}`;
                  })()}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.]/g, '');
                    const parts = raw.split('.');
                    setForm((prev) => ({ ...prev, birthYear: parts[0] || '', birthMonth: parts[1] || '', birthDay: parts[2] || '' }));
                  }}
                  placeholder="1993.5.15"
                  className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                />
                {form.birthYear && form.birthYear.length === 4 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">만 {2026 - Number(form.birthYear)}세</span>
                    {form.gender === 'F' && 2026 - Number(form.birthYear) >= 34 && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                        {2026 - Number(form.birthYear) >= 35 ? '고령산모 구간' : '마지노선 진입'}
                      </span>
                    )}
                    {form.gender === 'M' && 2026 - Number(form.birthYear) >= 45 && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">정자 질 저하 구간</span>
                    )}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400 mb-2">태어난 시간</div>
                <div className="flex items-center gap-2">
                  {!form.birthTimeUnknown ? (
                    <input
                      type="text"
                      value={(() => {
                        const h = form.birthHour;
                        const m = form.birthMinute;
                        if (h === '' && m === '') return '';
                        return `${String(h || 0).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
                      })()}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d:]/g, '');
                        const parts = raw.split(':');
                        const h = parseInt(parts[0], 10);
                        const m = parseInt(parts[1], 10);
                        setForm((prev) => ({
                          ...prev,
                          birthHour: !isNaN(h) && h >= 0 && h <= 23 ? String(h) : parts[0] === '' ? '' : prev.birthHour,
                          birthMinute: !isNaN(m) && m >= 0 && m <= 59 ? String(m) : (parts[1] === '' || parts[1] === undefined) ? '' : prev.birthMinute,
                        }));
                      }}
                      placeholder="10:30"
                      className="w-20 border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">모름</span>
                  )}
                  <label className="ml-auto flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.birthTimeUnknown} onChange={(e) => set('birthTimeUnknown', e.target.checked)} className="rounded" />
                    <span className="text-[11px] text-slate-500">시간 모름</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400 mb-2">태어난 곳</div>
                <div className="flex items-center gap-1.5">
                  <select
                    value={form.birthPlace?.split(' ')[0] || ''}
                    onChange={(e) => set('birthPlace', e.target.value ? e.target.value + ' ' : '')}
                    className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-400"
                  >
                    <option value="">시/도 선택</option>
                    {locationCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {form.birthPlace?.split(' ')[0] && (
                  <select
                    value={form.birthPlace?.split(' ')[1] || ''}
                    onChange={(e) => {
                      const city = form.birthPlace.split(' ')[0];
                      set('birthPlace', e.target.value ? `${city} ${e.target.value}` : `${city} `);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-400"
                  >
                    <option value="">{form.birthPlace.split(' ')[0] === '해외' ? '국가 선택' : '구/군 선택'}</option>
                    {(locationHierarchy[form.birthPlace.split(' ')[0]] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">혼인 상태</div>
                <select value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {maritalStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                {form.maritalStatus && <div className="mt-1 text-[10px] text-slate-400">{maritalStatusOptions.find((o) => o.value === form.maritalStatus)?.desc}</div>}
              </label>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">자녀 유무</div>
                <div className="mt-2 flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.hasChildren} onChange={(e) => { set('hasChildren', e.target.checked); if (!e.target.checked) set('childrenCount', 0); }} className="rounded" />
                    <span className="text-sm font-medium text-slate-800">자녀 있음</span>
                  </label>
                  {form.hasChildren && (
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={1} max={10} value={form.childrenCount || 1} onChange={(e) => setNum('childrenCount', e.target.value)} className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
                      <span className="text-xs text-slate-500">명</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">형제 구성 — 본인 포함 (n남 n녀)</div>
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min={0} max={10} value={form.brotherCount} onChange={(e) => setNum('brotherCount', e.target.value)} className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
                  <span className="text-xs text-slate-500">남</span>
                  <input type="number" min={0} max={10} value={form.sisterCount} onChange={(e) => setNum('sisterCount', e.target.value)} className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
                  <span className="text-xs text-slate-500">녀</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">본인 서열 (몇째)</div>
                {(() => {
                  const total = (form.brotherCount || 0) + (form.sisterCount || 0);
                  const label = total === 0 ? '' : form.brotherCount > 0 && form.sisterCount > 0 ? '남매' : form.brotherCount > 0 ? '형제' : '자매';
                  return (
                    <>
                      <div className="mt-2 flex items-center gap-2">
                        {total <= 1 ? (
                          <span className="text-sm font-medium text-slate-800">외동</span>
                        ) : (
                          <>
                            <input type="number" min={1} max={total} value={form.birthOrder || ''} onChange={(e) => setNum('birthOrder', e.target.value)} className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm font-medium text-slate-800 outline-none focus:border-violet-400" />
                            <span className="text-xs text-slate-500">째</span>
                          </>
                        )}
                      </div>
                      {total >= 2 && form.birthOrder && form.birthOrder <= total && (
                        <div className="mt-1 text-[10px] text-violet-600 font-medium">
                          {form.brotherCount}남 {form.sisterCount}녀 {label} 중 {form.birthOrder}째
                          {form.birthOrder === 1 && (form.gender === 'M' ? ' (장남)' : ' (장녀)')}
                          {form.birthOrder === total && total >= 2 && ' (막내)'}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* ── 직업/학력 (남30%/여20%) ── */}
            <SectionTitle icon="💼" title="직업 / 학력" desc="직군 위상, 안정성, 학력 — 남30%/여20%" />
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  직군 (카테고리)
                  <GradePill grade={grades.jobCategory.grade} note={grades.jobCategory.note} />
                  <WeightBadge gender={form.gender} fieldKey="jobCategory" score={fs.jobCategory} />
                </div>
                <select value={form.jobCategory} onChange={(e) => set('jobCategory', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {jobCategoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  학력
                  <GradePill grade={grades.edu.grade} note={grades.edu.note} />
                  <WeightBadge gender={form.gender} fieldKey="edu" score={fs.edu} />
                </div>
                <select value={form.edu} onChange={(e) => set('edu', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {eduOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label className="col-span-2 rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">직업 상세 메모 (회사명, 직급 등)</div>
                <input type="text" value={form.jobDetail} onChange={(e) => set('jobDetail', e.target.value)} placeholder="예: 삼성전자 무선사업부 책임" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
            </div>

            {/* ── 경제력 (남25%/여10%) ── */}
            <SectionTitle icon="💰" title="경제력" desc="연봉, 금융자산, 부동산 — 남25%/여10%" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  연봉(만원)
                  <GradePill grade={grades.income.grade} note={grades.income.note} />
                  <WeightBadge gender={form.gender} fieldKey="income" score={fs.income} />
                </div>
                <input type="text" inputMode="numeric" value={form.income} onChange={(e) => setNum('income', e.target.value)} placeholder="만원 단위" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  금융자산(만원)
                  <GradePill grade={grades.financial.grade} note={grades.financial.note} />
                  <WeightBadge gender={form.gender} fieldKey="financial" score={fs.financial} />
                </div>
                <input type="text" inputMode="numeric" value={form.financial} onChange={(e) => setNum('financial', e.target.value)} placeholder="만원 단위" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  부동산자산(만원)
                  <GradePill grade={grades.realEstate.grade} note={grades.realEstate.note} />
                  <WeightBadge gender={form.gender} fieldKey="realEstate" score={fs.realEstate} />
                </div>
                <input type="text" inputMode="numeric" value={form.realEstate} onChange={(e) => setNum('realEstate', e.target.value)} placeholder="만원 단위" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
            </div>

            {/* ── 외모/자기관리 (남10%/여30%) ── */}
            <SectionTitle icon="✨" title="외모 / 자기관리" desc="매니저 주관 평가, 키, 체형, 스타일, 탈모 — 남10%/여30%" />

            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  키(cm)
                  <GradePill grade={grades.height.grade} note={grades.height.note} />
                  <WeightBadge gender={form.gender} fieldKey="height" score={fs.height} />
                </div>
                <input type="text" inputMode="numeric" value={form.height} onChange={(e) => setNum('height', e.target.value)} placeholder="cm" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  몸무게(kg)
                  <WeightBadge gender={form.gender} fieldKey="weight" score={fs.weight} />
                </div>
                {form.height && form.weight && (() => {
                  const h = form.height / 100;
                  const bmi = (form.weight / (h * h)).toFixed(1);
                  return <div className="mt-1 text-[10px] text-slate-400">BMI {bmi}</div>;
                })()}
                <input type="text" inputMode="numeric" value={form.weight} onChange={(e) => setNum('weight', e.target.value)} placeholder="kg" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  체형
                  {form.height && form.weight && suggestBodyType(form.height, form.weight, form.gender) === form.bodyType && (
                    <span className="ml-1 rounded bg-blue-50 px-1 py-0.5 text-[9px] font-medium text-blue-600 border border-blue-100">BMI 추천</span>
                  )}
                  <GradePill grade={grades.bodyType.grade} note={grades.bodyType.note} />
                  <WeightBadge gender={form.gender} fieldKey="bodyType" score={fs.bodyType} />
                </div>
                <select value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {bodyTypeOptions[form.gender].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  👤 외모상 (얼굴 인상)
                </div>
                <select value={form.faceType} onChange={(e) => set('faceType', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {(faceTypeOptions[form.gender] || []).map((opt) => <option key={opt.value} value={opt.value}>{opt.value}</option>)}
                </select>
                {form.faceType && (
                  <div className="mt-1 text-[10px] text-slate-400">
                    {(faceTypeOptions[form.gender] || []).find((o) => o.value === form.faceType)?.desc}
                  </div>
                )}
              </label>
              <div className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  외모 스타일 ({form.appearanceStyles.length}개)
                  <WeightBadge gender={form.gender} fieldKey="appearanceStyle" score={fs.appearanceStyle} />
                </div>
                <div className="mt-2">
                  <AppearanceStylePicker
                    gender={form.gender}
                    selected={form.appearanceStyles}
                    onChange={(v) => set('appearanceStyles', v)}
                  />
                </div>
              </div>
              {/* 탈모 상태 */}
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  탈모 상태
                  <GradePill grade={grades.hairLoss.grade} note={grades.hairLoss.note} />
                  <WeightBadge gender={form.gender} fieldKey="hairLoss" score={fs.hairLoss} />
                </div>
                <select value={form.hairLoss} onChange={(e) => set('hairLoss', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {(hairLossOptions[form.gender] || hairLossOptions.M).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.value}</option>
                  ))}
                </select>
                {form.hairLoss && form.hairLoss !== '없음' && (
                  <div className="mt-1 text-[10px] text-slate-400">
                    {(hairLossOptions[form.gender] || hairLossOptions.M).find((o) => o.value === form.hairLoss)?.desc}
                  </div>
                )}
              </label>
              {/* 매니저 주관 외모 점수 */}
              <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-pink-50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-400">
                    👁️ 매니저 외모 점수
                    <GradePill grade={grades.appearanceManager.grade} note={grades.appearanceManager.note} />
                    <WeightBadge gender={form.gender} fieldKey="appearanceManager" score={fs.appearanceManager} />
                  </div>
                  <span className="text-lg font-black text-violet-700">{form.appearanceScore || '-'}<span className="text-xs font-medium text-violet-400">/10</span></span>
                </div>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.appearanceScore || 5}
                  onChange={(e) => setNum('appearanceScore', e.target.value)}
                  className="mt-2 w-full h-1.5 rounded-full appearance-none bg-gradient-to-r from-rose-200 via-amber-200 to-violet-300 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
                />
                <div className="flex justify-between mt-1 text-[9px] text-slate-400">
                  <span>1</span><span>3</span><span>5</span><span>7</span><span>10</span>
                </div>
                <div className="mt-1 text-[10px] text-violet-600 font-medium">
                  {form.appearanceScore >= 9 ? '연예인급' : form.appearanceScore >= 7 ? '준수/호감' : form.appearanceScore >= 5 ? '평균' : form.appearanceScore >= 3 ? '아쉬움' : '관리필요'}
                </div>
              </div>
              <label className="col-span-2 rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">외모/인상 상세 메모</div>
                <input type="text" value={form.appearanceMemo} onChange={(e) => set('appearanceMemo', e.target.value)} placeholder="예: 세련된 이미지, 관리 우수, 첫인상 호감" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
            </div>

            {/* ── 라이프스타일 (남7%/여5%) ── */}
            <SectionTitle icon="🎯" title="라이프스타일" desc="취미, 건강습관, 가치관 — 남7%/여5%" />
            <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                <span className="text-sm font-bold text-slate-800">취미 (복수 선택)</span>
                <GradePill grade={grades.hobbies.grade} note={grades.hobbies.note} />
                <WeightBadge gender={form.gender} fieldKey="hobbies" score={fs.hobbies} />
                {form.hobbies.length > 0 && <span className="ml-auto rounded-full bg-violet-500 text-white px-2 py-0.5 text-xs font-bold">{form.hobbies.length}개</span>}
              </div>
              {/* 선택된 취미 표시 */}
              {form.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.hobbies.map((item) => (
                    <button key={item} type="button" onClick={() => set('hobbies', form.hobbies.filter((v) => v !== item))} className="rounded-full bg-violet-500 text-white px-3 py-1 text-xs font-bold hover:opacity-80">
                      {item} ✕
                    </button>
                  ))}
                </div>
              )}
              {/* 카테고리 탭 */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {hobbyCategoryOptions.map((cat) => {
                  const isOpen = openHobbyCat === cat.key;
                  const catCount = cat.items.filter((i) => form.hobbies.includes(i)).length;
                  return (
                    <button key={cat.key} type="button" onClick={() => setOpenHobbyCat(isOpen ? null : cat.key)}
                      className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${isOpen ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      <span>{cat.icon}</span> {cat.label}
                      {catCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isOpen ? 'bg-white/20' : 'bg-violet-500 text-white'}`}>{catCount}</span>}
                    </button>
                  );
                })}
              </div>
              {/* 선택된 카테고리의 항목 */}
              {openHobbyCat && (() => {
                const cat = hobbyCategoryOptions.find((c) => c.key === openHobbyCat);
                if (!cat) return null;
                return (
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((item) => {
                        const active = form.hobbies.includes(item);
                        return (
                          <button key={item} type="button" onClick={() => {
                            if (active) set('hobbies', form.hobbies.filter((v) => v !== item));
                            else set('hobbies', [...form.hobbies, item]);
                          }}
                            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >{item}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {/* 직접 입력 */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={form.customHobby || ''}
                  onChange={(e) => set('customHobby', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const v = (form.customHobby || '').trim();
                      if (v && !form.hobbies.includes(v)) {
                        set('hobbies', [...form.hobbies, v]);
                        set('customHobby', '');
                      }
                    }
                  }}
                  placeholder="목록에 없는 취미 직접 입력"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-violet-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    const v = (form.customHobby || '').trim();
                    if (v && !form.hobbies.includes(v)) {
                      set('hobbies', [...form.hobbies, v]);
                      set('customHobby', '');
                    }
                  }}
                  className="shrink-0 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-200"
                >+ 추가</button>
              </div>
              {form.hobbies.length > 0 && (
                <div className="mt-2 text-[11px] text-slate-500">
                  선택: {form.hobbies.length}개 — {form.hobbies.length >= 5 ? '매우 다양' : form.hobbies.length >= 3 ? '활발' : form.hobbies.length >= 2 ? '적당' : '보통'}
                </div>
              )}
            </div>
            <label className="block rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-400">취미 상세 메모</div>
              <input type="text" value={form.hobbyMemo} onChange={(e) => set('hobbyMemo', e.target.value)} placeholder="예: 골프 주 1회 라운딩, 와인바 즐겨 감" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  음주
                  <GradePill grade={grades.drink.grade} note={grades.drink.note} />
                  <WeightBadge gender={form.gender} fieldKey="drink" score={fs.drink} />
                </div>
                <select value={form.drink} onChange={(e) => set('drink', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {drinkOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  흡연
                  <GradePill grade={grades.smoke.grade} note={grades.smoke.note} />
                  <WeightBadge gender={form.gender} fieldKey="smoke" score={fs.smoke} />
                </div>
                <select value={form.smoke} onChange={(e) => set('smoke', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {smokeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">종교 (참고용, 배점 없음)</div>
                <select value={form.religion} onChange={(e) => set('religion', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  {religionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">MBTI</div>
                <select value={form.mbti} onChange={(e) => set('mbti', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택안함</option>
                  {mbtiOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </label>
            </div>

            {/* ── 집안/가족 (남녀20%) ── */}
            <SectionTitle icon="🏠" title="집안 / 가족" desc="부모 재력·자산·직업·노후·형제·리스크 — 남녀 공통 20%" />
            <div className="grid grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  부모 재력 수준
                  <GradePill grade={grades.parentWealth.grade} note={grades.parentWealth.note} />
                  <WeightBadge gender={form.gender} fieldKey="parentWealth" score={fs.parentWealth} />
                </div>
                <select value={form.parentWealth} onChange={(e) => set('parentWealth', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {parentWealthOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                {form.parentWealth && <div className="mt-1 text-[10px] text-slate-400">{parentWealthOptions.find((o) => o.value === form.parentWealth)?.desc}</div>}
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  부모 현 직업
                  <GradePill grade={grades.parentJob.grade} note={grades.parentJob.note} />
                  <WeightBadge gender={form.gender} fieldKey="parentJob" score={fs.parentJob} />
                </div>
                <select value={form.parentJob} onChange={(e) => set('parentJob', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {parentJobOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                {form.parentJob && <div className="mt-1 text-[10px] text-slate-400">{parentJobOptions.find((o) => o.value === form.parentJob)?.desc}</div>}
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  부모 과거 직업 (가문)
                  <GradePill grade={grades.parentPastJob.grade} note={grades.parentPastJob.note} />
                  <WeightBadge gender={form.gender} fieldKey="parentPastJob" score={fs.parentPastJob} />
                </div>
                <select value={form.parentPastJob} onChange={(e) => set('parentPastJob', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {parentJobOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  부모 자산
                  <GradePill grade={grades.parentAssets.grade} note={grades.parentAssets.note} />
                  <WeightBadge gender={form.gender} fieldKey="parentAssets" score={fs.parentAssets} />
                </div>
                <select value={form.parentAssets} onChange={(e) => set('parentAssets', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {parentAssetOptions.map((o) => <option key={o.value} value={o.value}>{o.value} — {o.desc}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  노후 연금/보험
                  <GradePill grade={grades.retirementPrep.grade} note={grades.retirementPrep.note} />
                  <WeightBadge gender={form.gender} fieldKey="retirementPrep" score={fs.retirementPrep} />
                </div>
                <select value={form.retirementPrep} onChange={(e) => set('retirementPrep', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {retirementPrepOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                {form.retirementPrep && <div className="mt-1 text-[10px] text-slate-400">{retirementPrepOptions.find((o) => o.value === form.retirementPrep)?.desc}</div>}
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  형제 상황
                  <GradePill grade={grades.siblings.grade} note={grades.siblings.note} />
                  <WeightBadge gender={form.gender} fieldKey="siblings" score={fs.siblings} />
                </div>
                <select value={form.siblings} onChange={(e) => set('siblings', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {siblingsOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center text-xs text-slate-400">
                  가족 리스크
                  <GradePill grade={grades.familyRisk.grade} note={grades.familyRisk.note} />
                  <WeightBadge gender={form.gender} fieldKey="familyRisk" score={fs.familyRisk} />
                </div>
                <select value={form.familyRisk} onChange={(e) => set('familyRisk', e.target.value)} className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none">
                  <option value="">선택</option>
                  {familyRiskOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
                </select>
                {form.familyRisk && form.familyRisk !== '없음' && <div className="mt-1 text-[10px] text-rose-500">{familyRiskOptions.find((o) => o.value === form.familyRisk)?.desc}</div>}
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">가족 상세 메모</div>
                <input type="text" value={form.familyMemo} onChange={(e) => set('familyMemo', e.target.value)} placeholder="예: 아버지 前삼성 임원, 어머니 전업주부, 형 기혼" className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none" />
              </label>
            </div>

            {/* ── 이상형 선호도 ── */}
            <SectionTitle icon="💕" title="이상형 선호도" desc="상대방에게 중요하게 보는 조건 — 매칭 가중치에 반영됩니다" />
            <div className="grid grid-cols-2 gap-3">
              {idealTypeCategories.map((cat) => (
                <label key={cat.key} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{cat.icon}</span> {cat.label}
                    <span className="ml-auto text-[10px] text-slate-300">{cat.desc}</span>
                  </div>
                  <select
                    value={form.idealType[cat.key]}
                    onChange={(e) => set('idealType', { ...form.idealType, [cat.key]: e.target.value })}
                    className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                  >
                    {idealTypeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.value}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            {/* ── 이상형 조건 분류 (Phase 2-3) ── */}
            {[
              { key: 'mustHave', label: '절대 조건', color: 'rose', desc: '반드시 충족' },
              { key: 'preferred', label: '선호 조건', color: 'blue', desc: '있으면 좋은' },
              { key: 'dealBreaker', label: '거절 조건', color: 'slate', desc: '해당 시 거절' },
            ].map(({ key, label, color, desc }) => {
              const selected = form.idealConditions[key] || [];
              const toggle = (item) => {
                const updated = selected.includes(item) ? selected.filter((x) => x !== item) : [...selected, item];
                set('idealConditions', { ...form.idealConditions, [key]: updated });
              };
              const activePill = color === 'rose' ? 'bg-rose-500 text-white' : color === 'blue' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white';
              const openCat = openCondCat?.startsWith(key + '_') ? openCondCat.replace(key + '_', '') : null;
              return (
                <div key={key} className={`rounded-2xl border p-4 ${color === 'rose' ? 'border-rose-200 bg-rose-50/30' : color === 'blue' ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${color === 'rose' ? 'bg-rose-500' : color === 'blue' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                    <span className="text-sm font-bold text-slate-800">{label}</span>
                    <span className="text-xs text-slate-400">{desc}</span>
                    {selected.length > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${activePill}`}>{selected.length}개</span>}
                  </div>
                  {/* 선택된 항목 */}
                  {selected.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {selected.map((item) => (
                        <button key={item} type="button" onClick={() => toggle(item)} className={`rounded-full px-3 py-1 text-xs font-bold ${activePill} hover:opacity-80`}>
                          {item} ✕
                        </button>
                      ))}
                    </div>
                  )}
                  {/* 카테고리 탭 */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {idealConditionCategories.map((cat) => {
                      const isOpen = openCat === cat.key;
                      const catCount = cat.items.filter((i) => selected.includes(i)).length;
                      return (
                        <button key={cat.key} type="button" onClick={() => setOpenCondCat(isOpen ? null : key + '_' + cat.key)}
                          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${isOpen ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                          <span>{cat.icon}</span> {cat.label}
                          {catCount > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isOpen ? 'bg-white/20' : activePill}`}>{catCount}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {/* 선택된 카테고리의 키워드 */}
                  {openCat && (() => {
                    const cat = idealConditionCategories.find((c) => c.key === openCat);
                    if (!cat) return null;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="text-base">{cat.icon}</span>
                          <span className="text-sm font-bold text-slate-700">{cat.label}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((item) => {
                            const active = selected.includes(item);
                            return (
                              <button key={item} type="button" onClick={() => toggle(item)}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? activePill : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              >{item}</button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}

            {/* ── 거주지 ── */}
            <SectionTitle icon="📍" title="거주지" />
            <div className="rounded-xl border border-slate-200 p-3">
              <select
                value={form.location?.split(' ')[0] || ''}
                onChange={(e) => set('location', e.target.value ? `${e.target.value} ` : '')}
                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
              >
                <option value="">시/도 선택</option>
                {locationCities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
              {form.location && form.location.trim() && (
                <>
                  <select
                    value={(() => {
                      const parts = form.location.split(' ');
                      return parts.length >= 2 ? parts[1] : '';
                    })()}
                    onChange={(e) => {
                      const city = form.location.split(' ')[0];
                      set('location', e.target.value ? `${city} ${e.target.value}` : `${city} `);
                    }}
                    className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-800 outline-none"
                  >
                    <option value="">{form.location.split(' ')[0] === '해외' ? '국가 선택' : '구/군 선택'}</option>
                    {(locationHierarchy[form.location.split(' ')[0]] || []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {form.location.split(' ')[0] === '해외' && form.location.split(' ')[1]?.trim() && (
                    <input
                      type="text"
                      value={form.location.split(' ').slice(2).join(' ') || ''}
                      onChange={(e) => {
                        const parts = form.location.split(' ');
                        set('location', `${parts[0]} ${parts[1]}${e.target.value ? ' ' + e.target.value : ''}`);
                      }}
                      placeholder="도시명 (예: LA, 도쿄, 런던)"
                      className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm font-medium text-slate-800 outline-none focus:border-violet-400"
                    />
                  )}
                </>
              )}
            </div>

            {/* ── 매니저 가산점 (최대 10점) ── */}
            <SectionTitle icon="⭐" title="매니저 가산점" desc="매니저 주관 가산점 — 사유별 점수 책정 (합산 최대 10점)" />
            <div className="space-y-2">
              {form.managerBonusItems.map((item, idx) => {
                const othersTotal = form.managerBonusItems.reduce((sum, b, i) => i === idx ? sum : sum + b.score, 0);
                const maxForThis = Math.max(1, 10 - othersTotal);
                return (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.reason}
                    onChange={(e) => {
                      const updated = [...form.managerBonusItems];
                      updated[idx] = { ...updated[idx], reason: e.target.value };
                      set('managerBonusItems', updated);
                    }}
                    placeholder="사유 (예: 가정적임, 생활력 강함)"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-violet-400"
                  />
                  <select
                    value={Math.min(item.score, maxForThis)}
                    onChange={(e) => {
                      const updated = [...form.managerBonusItems];
                      updated[idx] = { ...updated[idx], score: Number(e.target.value) };
                      set('managerBonusItems', updated);
                    }}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-400"
                  >
                    {Array.from({ length: maxForThis }, (_, i) => i + 1).map((n) => <option key={n} value={n}>+{n}점</option>)}
                  </select>
                  <button type="button" onClick={() => set('managerBonusItems', form.managerBonusItems.filter((_, i) => i !== idx))} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500">
                    <X size={14} />
                  </button>
                </div>
                );
              })}
              {(() => {
                const totalBonus = form.managerBonusItems.reduce((sum, item) => sum + item.score, 0);
                return (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={totalBonus >= 10}
                      onClick={() => set('managerBonusItems', [...form.managerBonusItems, { reason: '', score: 1 }])}
                      className="flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-violet-400 hover:text-violet-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={12} /> 가산점 추가
                    </button>
                    {totalBonus > 0 && (
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${totalBonus > 10 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        합산 +{totalBonus}점 {totalBonus > 10 ? '(10점 초과!)' : `/ 10점`}
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* ── 사진 ── */}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Camera size={16} /> 사진 등록 <span className="text-xs font-normal text-slate-400">({form.photos.length}/6)</span></div>
                {form.photos.length < 6 && (
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"><Plus size={14} /> 추가</button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
              {form.photos.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {form.photos.map((src, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                      <img src={src} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => removePhoto(i)} className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"><X size={12} /></button>
                      {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-sm text-slate-400 hover:border-violet-300 hover:text-violet-500">
                  클릭하여 사진을 추가하세요
                </div>
              )}
            </div>

            {/* ── 가중치 요약 ── */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-blue-900">카테고리별 가중치 배분</div>
                {form.gender && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${form.gender === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-600'}`}>
                    {form.gender === 'M' ? '♂ 남성 기준' : '♀ 여성 기준'}
                  </span>
                )}
              </div>
              <div className="mt-3 space-y-2">
                {scoreRuleWeights.map((rule) => {
                  const w = form.gender === 'M' ? (rule.weightM ?? rule.weight) : form.gender === 'F' ? (rule.weightF ?? rule.weight) : rule.weight;
                  return (
                    <div key={rule.key} className="rounded-xl border border-blue-100 bg-white px-3 py-2">
                      <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                        <span>{rule.label}</span>
                        <span className="text-blue-700 font-bold">{w}%</span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-blue-100">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${w * (100 / 30)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT: Preview ═══════ */}
          <aside className="max-h-[85vh] overflow-y-auto border-t border-slate-200 bg-slate-50 p-4 md:p-6 lg:max-h-[70vh] lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-bold text-amber-900">실시간 자동 산정 결과</div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className="text-xs text-amber-700">종합 점수</div>
                  <div className="text-3xl font-bold text-amber-900">{dynamicPreview.overallScore}</div>
                </div>
                <div className="flex items-center gap-2">
                  <GradePill grade={gradeOverallResult.grade} note={gradeOverallResult.note} />
                  <GradeBadge label={dynamicPreview.categories.overall.badge} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewBadges.map((badge) => <GradeBadge key={badge} label={badge} />)}
              </div>
            </div>

            {/* ── SABCD 등급 요약 ── */}
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-bold text-slate-800 mb-3">선호도 등급 (SABCD)</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'income', label: '연봉' },
                  { key: 'financial', label: '금융자산' },
                  { key: 'realEstate', label: '부동산자산' },
                  { key: 'appearanceManager', label: '외모(주관)' },
                  { key: 'height', label: '키' },
                  { key: 'bodyType', label: '체형' },
                  { key: 'hairLoss', label: '탈모' },
                  { key: 'jobCategory', label: '직군' },
                  { key: 'edu', label: '학력' },
                  { key: 'age', label: '나이' },
                  { key: 'hobbies', label: '취미' },
                  { key: 'smoke', label: '흡연' },
                  { key: 'drink', label: '음주' },
                  { key: 'parentWealth', label: '부모재력' },
                  { key: 'parentJob', label: '부모직업' },
                  { key: 'parentPastJob', label: '부모과거직업' },
                  { key: 'parentAssets', label: '부모자산' },
                  { key: 'retirementPrep', label: '노후준비' },
                  { key: 'siblings', label: '형제' },
                  { key: 'familyRisk', label: '리스크' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-1.5">
                    <span className="text-[11px] text-slate-500">{label}</span>
                    <GradePill grade={grades[key].grade} note={grades[key].note} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap gap-1.5">
                {previewTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActivePreviewTab(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${activePreviewTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {previewTabs.map((tab) => (
                  <GradeScoreCard key={tab.key} title={tab.label} data={dynamicPreview.categories[tab.key]} active={activePreviewTab === tab.key} onClick={() => setActivePreviewTab(tab.key)} showHint />
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-violet-900">{labels[activePreviewTab]} 상세</div>
                    <div className="mt-1 text-xs text-violet-700">저장 시 회원 프로필에 자동 반영됩니다.</div>
                  </div>
                  <GradeBadge label={preview.badge} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">점수</div><div className="mt-1 text-xl font-bold text-slate-900">{preview.score}</div></div>
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">퍼센타일</div><div className="mt-1 text-xl font-bold text-violet-700">{preview.percentile}</div></div>
                  <div className="rounded-xl bg-white/80 p-3"><div className="text-xs text-slate-400">배지</div><div className="mt-1 text-sm font-bold text-slate-900">{preview.badge || '없음'}</div></div>
                </div>
              </div>
            </div>

            {/* ── 이상형 가중치 프리뷰 ── */}
            <div className="mt-4 rounded-2xl border border-pink-200 bg-pink-50 p-4">
              <div className="text-sm font-bold text-pink-900">이상형 매칭 가중치</div>
              <div className="mt-1 text-xs text-pink-700">선호도에 따라 상대 평가 시 가중치가 달라집니다.</div>
              <div className="mt-3 space-y-2">
                {idealTypeCategories.map((cat) => {
                  const w = idealWeights[cat.key] || 0;
                  const pref = form.idealType[cat.key];
                  const barColor = pref === '매우 중요' ? 'bg-violet-500' : pref === '중요' ? 'bg-blue-500' : pref === '보통' ? 'bg-slate-400' : pref === '덜 중요' ? 'bg-slate-300' : 'bg-slate-200';
                  return (
                    <div key={cat.key} className="flex items-center gap-2">
                      <span className="w-16 text-xs font-medium text-pink-800">{cat.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-pink-100">
                        <div className={`h-2 rounded-full transition-all ${barColor}`} style={{ width: `${w}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs font-bold text-pink-900">{w}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">취소</button>
              <button
                onClick={() => {
                  const newMember = {
                    id: `M${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 6)}`,
                    name: form.name,
                    age: 2026 - Number(form.birthYear),
                    gender: form.gender,
                    job: form.jobDetail || form.jobCategory,
                    jobCategory: form.jobCategory,
                    income: (form.income || 0) >= 10000 ? `${((form.income || 0) / 10000).toFixed(1)}억` : `${(form.income || 0).toLocaleString()}만`,
                    rawIncome: form.income || 0,
                    edu: form.edu,
                    height: form.height,
                    weight: form.weight,
                    bodyType: form.bodyType,
                    assets: `금융 ${(form.financial || 0) >= 10000 ? ((form.financial || 0) / 10000).toFixed(1) + '억' : (form.financial || 0).toLocaleString() + '만'} / 부동산 ${(form.realEstate || 0) >= 10000 ? ((form.realEstate || 0) / 10000).toFixed(1) + '억' : (form.realEstate || 0).toLocaleString() + '만'}`,
                    rawFinancial: form.financial || 0,
                    rawRealEstate: form.realEstate || 0,
                    birthYear: form.birthYear,
                    birthMonth: form.birthMonth,
                    birthDay: form.birthDay,
                    maritalStatus: form.maritalStatus,
                    hasChildren: form.hasChildren,
                    childrenCount: form.hasChildren ? (form.childrenCount || 1) : 0,
                    siblingComposition: `${form.brotherCount}남 ${form.sisterCount}녀`,
                    birthOrder: (() => {
                      const t = (form.brotherCount || 0) + (form.sisterCount || 0);
                      if (t <= 1) return '외동';
                      const lbl = form.brotherCount > 0 && form.sisterCount > 0 ? '남매' : form.brotherCount > 0 ? '형제' : '자매';
                      return form.birthOrder ? `${form.brotherCount}남 ${form.sisterCount}녀 ${lbl} 중 ${form.birthOrder}째` : '';
                    })(),
                    family: `${form.parentWealth || ''} / ${form.parentJob || ''} (자산 ${form.parentAssets || ''})`,
                    familyDetail: {
                      parentWealth: form.parentWealth,
                      parentJob: form.parentJob,
                      parentPastJob: form.parentPastJob,
                      parentAssets: form.parentAssets,
                      retirementPrep: form.retirementPrep,
                      siblings: form.siblings,
                      familyRisk: form.familyRisk,
                    },
                    familyMemo: form.familyMemo,
                    managerBonusItems: form.managerBonusItems.filter((item) => item.reason.trim()),
                    managerBonus: dynamicPreview.managerBonus || 0,
                    appearanceNote: form.appearanceStyles.join(', ') + (form.appearanceMemo ? ` / ${form.appearanceMemo}` : ''),
                    faceType: form.faceType,
                    appearanceScore: form.appearanceScore,
                    appearanceStyles: form.appearanceStyles,
                    hairLoss: form.hairLoss,
                    hobbies: form.hobbies,
                    hobbyMemo: form.hobbyMemo,
                    location: form.location,
                    verifyLevel: 'Lv1',
                    verifyItems: ['본인'],
                    saju: {
                      profile: '등록 후 만세력 분석 예정',
                      birthDate: `${form.birthYear}-${String(form.birthMonth).padStart(2, '0')}-${String(form.birthDay).padStart(2, '0')}`,
                      birthTime: form.birthTimeUnknown ? null : `${String(form.birthHour).padStart(2, '0')}:${String(form.birthMinute).padStart(2, '0')}`,
                      birthTimeUnknown: form.birthTimeUnknown,
                      birthPlace: (form.birthPlace || '').trim(),
                    },
                    grade: {
                      overallScore: dynamicPreview.overallScore,
                      overallGrade: gradeOverallResult.grade,
                      categories: dynamicPreview.categories,
                      badges: previewBadges,
                      fieldGrades: grades,
                    },
                    values: form.hobbies.length > 0 ? form.hobbies.slice(0, 3) : ['신규등록'],
                    status: '신규 상담',
                    manager: profile?.full_name || '미배정',
                    lastContact: '방금',
                    nextAction: '초기 상담 필요',
                    profileCompletion: (() => {
                      const fields = [
                        form.name, form.birthYear, form.height, form.weight,
                        form.jobCategory, form.edu, form.income, form.financial, form.realEstate,
                        form.location, form.drink, form.smoke,
                        form.parentWealth, form.parentJob, form.parentAssets,
                        form.retirementPrep, form.siblings, form.familyRisk,
                        form.appearanceScore, form.faceType,
                        form.hobbies.length > 0, form.photos.length > 0,
                      ];
                      return Math.round((fields.filter(Boolean).length / fields.length) * 100);
                    })(),
                    outboundProposals: 0,
                    photos: form.photos,
                    notes: '',
                    reminderCycle: '1주',
                    lastContactDate: new Date().toISOString().split('T')[0],
                    meetings: [],
                    drink: form.drink,
                    smoke: form.smoke,
                    religion: form.religion,
                    mbti: form.mbti,
                    idealType: form.idealType,
                    idealConditions: form.idealConditions,
                    phone: form.phone,
                    contractDate: new Date().toISOString().split('T')[0],
                    contractEndDate: (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split('T')[0]; })(),
                    fee: null,
                    successFee: null,
                    paymentStatus: '미등록',
                  };
                  onSave(newMember);
                  addLog({ action: LOG_ACTIONS.MEMBER_CREATE, target: 'member', targetId: newMember.id, detail: `${newMember.name} (${newMember.gender === 'M' ? '남' : '여'}, ${newMember.age}세)` });
                  showToast(`${newMember.name} 회원이 등록되었습니다.`, 'emerald');
                  onClose();
                }}
                disabled={!form.name.trim()}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                회원 저장
              </button>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
