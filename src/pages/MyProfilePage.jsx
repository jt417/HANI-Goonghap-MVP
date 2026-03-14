import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, Plus, X, Camera, Edit3 } from 'lucide-react';
import useAppStore from '../stores/appStore';
import GradeBadge from '../components/common/GradeBadge';
import { scoreMember, gradeMember, gradeOverall } from '../lib/scoring';
import { calcProfileCompletion, calcSectionCompletion } from '../lib/profileCompletion';
import { profileToNetworkMember } from '../lib/profileToNetwork';
import {
  bodyTypeOptions, eduOptions, locationHierarchy, locationCities,
  drinkOptions, smokeOptions, religionOptions, mbtiOptions,
  jobCategoryOptions, appearanceStyleOptions, faceTypeOptions,
  hobbyCategoryOptions, hairLossOptions, maritalStatusOptions,
  parentWealthOptions, parentJobOptions, parentAssetOptions,
  retirementPrepOptions, siblingsOptions, familyRiskOptions,
  idealTypeOptions, idealTypeCategories, idealConditionCategories,
  suggestBodyType,
} from '../lib/constants';

/* ── 등급 알약 ── */
const PILL = { S: 'bg-gradient-to-r from-amber-300 to-yellow-200 text-amber-900', A: 'bg-violet-100 text-violet-700', B: 'bg-blue-100 text-blue-700', C: 'bg-slate-100 text-slate-500', D: 'bg-rose-100 text-rose-600' };
function GradePill({ grade }) {
  if (!grade) return null;
  return <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${PILL[grade] || PILL.C}`}>{grade}</span>;
}

/* ── 기본 폼 ── */
const EMPTY_FORM = {
  name: '', gender: '', phone: '',
  birthYear: '', birthMonth: '', birthDay: '',
  birthHour: '', birthMinute: '', birthTimeUnknown: true, birthPlace: '',
  maritalStatus: '초혼', hasChildren: false, childrenCount: 1,
  brotherCount: 0, sisterCount: 0, birthOrder: 1,
  height: '', weight: '', bodyType: '', faceType: '',
  appearanceStyles: [], hairLoss: '없음',
  appearanceScore: 5, appearanceMemo: '', managerBonusItems: [],
  jobCategory: '', jobDetail: '', edu: '',
  income: '', financial: '', realEstate: '',
  location: '',
  hobbies: [], hobbyMemo: '', customHobby: '',
  drink: '', smoke: '', religion: '', mbti: '',
  parentWealth: '', parentJob: '', parentPastJob: '',
  parentAssets: '', retirementPrep: '',
  siblings: '', familyRisk: '', familyMemo: '',
  photos: [],
  idealType: { wealth: '보통', appearance: '보통', career: '보통', age: '보통', lifestyle: '보통', family: '보통' },
  idealConditions: { mustHave: [], preferred: [], dealBreaker: [] },
};

/* ── 섹션 정의 ── */
const SECTIONS = [
  { key: 'basic', icon: '👤', label: '기본 정보', desc: '이름, 성별, 생년월일, 혼인 상태' },
  { key: 'appearance', icon: '✨', label: '외모', desc: '키, 체형, 외모상, 스타일' },
  { key: 'career', icon: '💼', label: '직업 / 학력', desc: '직군, 상세, 학력' },
  { key: 'wealth', icon: '💰', label: '경제력', desc: '연봉, 금융자산, 부동산' },
  { key: 'lifestyle', icon: '🎯', label: '라이프스타일', desc: '취미, 음주, 흡연, 종교, MBTI' },
  { key: 'family', icon: '🏠', label: '집안 / 가족', desc: '부모 재력, 직업, 자산, 리스크' },
  { key: 'idealType', icon: '💕', label: '이상형', desc: '선호 조건, 절대/선호/거절 조건' },
  { key: 'location', icon: '📍', label: '거주지', desc: '현재 거주 지역' },
  { key: 'photos', icon: '📸', label: '사진', desc: '프로필 사진 (최대 6장)' },
];

function summaryText(form, key) {
  switch (key) {
    case 'basic': {
      const parts = [];
      if (form.name) parts.push(form.name);
      if (form.gender) parts.push(form.gender === 'M' ? '남성' : '여성');
      if (form.birthYear) parts.push(`만 ${2026 - Number(form.birthYear)}세`);
      if (form.maritalStatus) parts.push(form.maritalStatus);
      return parts.join(' · ') || '미입력';
    }
    case 'appearance': {
      const parts = [];
      if (form.height) parts.push(`${form.height}cm`);
      if (form.weight) parts.push(`${form.weight}kg`);
      if (form.bodyType) parts.push(form.bodyType);
      if (form.faceType) parts.push(form.faceType);
      return parts.join(' · ') || '미입력';
    }
    case 'career': return [form.jobCategory, form.edu].filter(Boolean).join(' · ') || '미입력';
    case 'wealth': {
      const fmt = (v) => !v ? '' : v >= 10000 ? `${(v / 10000).toFixed(1)}억` : `${Number(v).toLocaleString()}만`;
      return [form.income && `연봉 ${fmt(form.income)}`, form.financial && `금융 ${fmt(form.financial)}`].filter(Boolean).join(' · ') || '미입력';
    }
    case 'lifestyle': return [form.hobbies?.length > 0 && `취미 ${form.hobbies.length}개`, form.drink, form.smoke].filter(Boolean).join(' · ') || '미입력';
    case 'family': return [form.parentWealth, form.parentJob, form.parentAssets && `자산 ${form.parentAssets}`].filter(Boolean).join(' · ') || '미입력';
    case 'idealType': {
      const cnt = (form.idealConditions?.mustHave?.length || 0) + (form.idealConditions?.preferred?.length || 0) + (form.idealConditions?.dealBreaker?.length || 0);
      return cnt > 0 ? `조건 ${cnt}개 설정됨` : '미입력';
    }
    case 'location': return form.location?.trim() || '미입력';
    case 'photos': return form.photos?.length > 0 ? `${form.photos.length}장 등록` : '미등록';
    default: return '';
  }
}

/* ══════════════════════════════════════════════ */
export default function MyProfilePage() {
  const showToast = useAppStore((s) => s.showToast);
  const savedProfile = useAppStore((s) => s.individualProfile);
  const setIndividualProfile = useAppStore((s) => s.setIndividualProfile);
  const addMember = useAppStore((s) => s.addMember);
  const members = useAppStore((s) => s.members);
  const addToNetworkPool = useAppStore((s) => s.addToNetworkPool);
  const scoreRuleWeights = useAppStore((s) => s.scoreRuleWeights);
  const badgeThresholds = useAppStore((s) => s.badgeThresholds);

  const [form, setForm] = useState(() => savedProfile || { ...EMPTY_FORM });
  const [openSection, setOpenSection] = useState(savedProfile ? null : 'basic');
  const [openHobbyCat, setOpenHobbyCat] = useState(null);
  const [openCondCat, setOpenCondCat] = useState(null);
  const fileInputRef = useRef(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setNum = (k, raw) => {
    if (raw === '' || raw === undefined) { set(k, ''); return; }
    const n = parseInt(String(raw).replace(/[^\d]/g, ''), 10);
    setForm((p) => {
      const next = { ...p, [k]: isNaN(n) ? '' : n };
      if ((k === 'height' || k === 'weight') && next.height && next.weight && next.gender) {
        const s = suggestBodyType(next.height, next.weight, next.gender);
        if (s) next.bodyType = s;
      }
      return next;
    });
  };

  // Scoring
  const preview = scoreMember(form, scoreRuleWeights, badgeThresholds);
  const grades = gradeMember(form);
  const overall = gradeOverall(preview.overallScore);
  const completion = calcProfileCompletion(form);

  // Save profile
  const handleSave = () => {
    if (!form.name?.trim()) { showToast('이름을 입력해주세요.', 'rose'); return; }
    if (!form.gender) { showToast('성별을 선택해주세요.', 'rose'); return; }
    setIndividualProfile(form);

    // Build CRM member
    const age = form.birthYear ? 2026 - Number(form.birthYear) : 0;
    const memberId = savedProfile?._memberId || `IND-${String(Date.now()).slice(-6)}-${Math.random().toString(36).slice(2, 5)}`;
    const networkId = savedProfile?._networkId || `NIND-${String(Date.now()).slice(-6)}`;
    const newMember = {
      id: memberId,
      name: form.name, age, gender: form.gender,
      job: form.jobDetail || form.jobCategory, jobCategory: form.jobCategory,
      income: (form.income || 0) >= 10000 ? `${((form.income || 0) / 10000).toFixed(1)}억` : `${(form.income || 0).toLocaleString()}만`,
      rawIncome: form.income || 0, edu: form.edu,
      height: form.height, weight: form.weight, bodyType: form.bodyType,
      assets: '', rawFinancial: form.financial || 0, rawRealEstate: form.realEstate || 0,
      birthYear: form.birthYear, birthMonth: form.birthMonth, birthDay: form.birthDay,
      maritalStatus: form.maritalStatus,
      location: form.location, verifyLevel: 'Lv1',
      hobbies: form.hobbies, hobbyMemo: form.hobbyMemo,
      appearanceScore: 5, appearanceStyles: form.appearanceStyles,
      faceType: form.faceType, hairLoss: form.hairLoss,
      drink: form.drink, smoke: form.smoke, religion: form.religion, mbti: form.mbti,
      idealType: form.idealType, idealConditions: form.idealConditions,
      phone: form.phone, photos: form.photos,
      familyDetail: {
        parentWealth: form.parentWealth, parentJob: form.parentJob,
        parentPastJob: form.parentPastJob, parentAssets: form.parentAssets,
        retirementPrep: form.retirementPrep, siblings: form.siblings, familyRisk: form.familyRisk,
      },
      grade: { overallScore: preview.overallScore, overallGrade: overall.grade, categories: preview.categories, badges: [], fieldGrades: grades },
      status: '소개 대기', manager: '미배정', source: 'self',
      lastContact: '방금', profileCompletion: completion,
      saju: {
        birthDate: form.birthYear ? `${form.birthYear}-${String(form.birthMonth || 1).padStart(2, '0')}-${String(form.birthDay || 1).padStart(2, '0')}` : '',
        birthTime: form.birthTimeUnknown ? null : `${String(form.birthHour || 0).padStart(2, '0')}:${String(form.birthMinute || 0).padStart(2, '0')}`,
        birthTimeUnknown: form.birthTimeUnknown, birthPlace: (form.birthPlace || '').trim(),
      },
    };

    // Update or add member
    const existing = members.find((m) => m.id === memberId);
    if (existing) {
      useAppStore.getState().setMembers(members.map((m) => m.id === memberId ? newMember : m));
    } else {
      addMember(newMember);
    }

    // Network pool
    const netMember = profileToNetworkMember(form, preview);
    netMember.id = networkId;
    addToNetworkPool(netMember);

    // Persist IDs for future updates
    setIndividualProfile({ ...form, _memberId: memberId, _networkId: networkId });
    showToast('프로필이 저장되었습니다. 매니저들에게 노출됩니다.', 'emerald');
    setOpenSection(null);
  };

  const toggle = (key) => setOpenSection((prev) => prev === key ? null : key);

  /* ══════════ RENDER ══════════ */
  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* ── Header ── */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {form.photos?.length > 0 ? (
            <img src={form.photos[0]} alt="" className="h-16 w-16 rounded-full border-2 border-violet-200 object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-400">
              {form.name?.[0] || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">{form.name || '이름 미입력'}</h2>
              {form.gender && <span className="text-sm text-slate-500">{form.gender === 'M' ? '남성' : '여성'}</span>}
              {form.birthYear && <span className="text-sm text-slate-500">만 {2026 - Number(form.birthYear)}세</span>}
              <GradePill grade={overall.grade} />
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>프로필 완성도</span>
                <span className="font-bold text-violet-700">{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full transition-all ${completion >= 80 ? 'bg-emerald-500' : completion >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`} style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400">종합 점수</div>
            <div className="text-3xl font-black text-violet-700">{preview.overallScore || '-'}</div>
          </div>
        </div>
        {completion < 80 && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-sm text-amber-800">
            프로필을 <strong>{80 - completion}%</strong> 더 채우면 매니저에게 더 많이 노출됩니다.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Left: Sections ── */}
        <div className="space-y-3">
          {SECTIONS.map((sec) => {
            const isOpen = openSection === sec.key;
            const pct = calcSectionCompletion(form, sec.key);
            return (
              <div key={sec.key} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button type="button" onClick={() => toggle(sec.key)} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition">
                  <span className="text-lg">{sec.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800">{sec.label}</div>
                    {!isOpen && <div className="text-xs text-slate-500 truncate mt-0.5">{summaryText(form, sec.key)}</div>}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${pct === 100 ? 'bg-emerald-100 text-emerald-700' : pct > 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>{pct}%</span>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-4 space-y-3">
                    {sec.key === 'basic' && <BasicSection form={form} set={set} setNum={setNum} setForm={setForm} />}
                    {sec.key === 'appearance' && <AppearanceSection form={form} set={set} setNum={setNum} />}
                    {sec.key === 'career' && <CareerSection form={form} set={set} />}
                    {sec.key === 'wealth' && <WealthSection form={form} setNum={setNum} />}
                    {sec.key === 'lifestyle' && <LifestyleSection form={form} set={set} openHobbyCat={openHobbyCat} setOpenHobbyCat={setOpenHobbyCat} />}
                    {sec.key === 'family' && <FamilySection form={form} set={set} />}
                    {sec.key === 'idealType' && <IdealTypeSection form={form} set={set} openCondCat={openCondCat} setOpenCondCat={setOpenCondCat} />}
                    {sec.key === 'location' && <LocationSection form={form} set={set} />}
                    {sec.key === 'photos' && <PhotoSection form={form} set={set} fileInputRef={fileInputRef} setForm={setForm} />}
                  </div>
                )}
              </div>
            );
          })}

          {/* Save button */}
          <button onClick={handleSave} className="w-full rounded-2xl bg-violet-600 py-4 text-sm font-bold text-white hover:bg-violet-700 transition shadow-lg shadow-violet-200">
            프로필 저장 및 공개
          </button>
        </div>

        {/* ── Right: Score Preview ── */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-bold text-amber-900">실시간 점수 산정</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-xs text-amber-700">종합</div>
                <div className="text-3xl font-bold text-amber-900">{preview.overallScore}</div>
              </div>
              <div className="flex items-center gap-2">
                <GradePill grade={overall.grade} />
                <GradeBadge label={preview.categories?.overall?.badge} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-bold text-slate-800 mb-3">항목별 등급</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'income', label: '연봉' }, { key: 'financial', label: '금융자산' },
                { key: 'height', label: '키' }, { key: 'bodyType', label: '체형' },
                { key: 'jobCategory', label: '직군' }, { key: 'edu', label: '학력' },
                { key: 'age', label: '나이' }, { key: 'hobbies', label: '취미' },
                { key: 'smoke', label: '흡연' }, { key: 'drink', label: '음주' },
                { key: 'parentWealth', label: '부모재력' }, { key: 'parentAssets', label: '부모자산' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-1.5">
                  <span className="text-[11px] text-slate-500">{label}</span>
                  <GradePill grade={grades[key]?.grade} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-bold text-slate-800 mb-3">카테고리 점수</div>
            <div className="space-y-2">
              {['wealth', 'appearance', 'career', 'age', 'lifestyle', 'family'].map((cat) => {
                const d = preview.categories?.[cat];
                const labels = { wealth: '경제력', appearance: '외모', career: '직업/학력', age: '나이', lifestyle: '라이프스타일', family: '집안' };
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-slate-600">{labels[cat]}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-violet-500 transition-all" style={{ width: `${d?.score || 0}%` }} />
                    </div>
                    <span className="w-8 text-right text-xs font-bold text-slate-700">{d?.score || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/* ── Section Editors ── */
/* ══════════════════════════════════════════════ */

function Lbl({ children }) { return <div className="text-xs text-slate-400 mb-1">{children}</div>; }
function Inp({ value, onChange, placeholder, type = 'text', ...rest }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-400" {...rest} />;
}
function Sel({ value, onChange, children }) {
  return <select value={value} onChange={onChange} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-400">{children}</select>;
}

/* ── 기본 정보 ── */
function BasicSection({ form, set, setNum, setForm }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Lbl>성별</Lbl>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button type="button" onClick={() => set('gender', 'M')} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${form.gender === 'M' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>남성</button>
          <button type="button" onClick={() => set('gender', 'F')} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${form.gender === 'F' ? 'bg-pink-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>여성</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Lbl>이름</Lbl><Inp value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="홍길동" /></div>
        <div><Lbl>전화번호</Lbl><Inp value={form.phone} onChange={(e) => {
          const d = e.target.value.replace(/\D/g, '').slice(0, 11);
          const f = d.length <= 3 ? d : d.length <= 7 ? `${d.slice(0,3)}-${d.slice(3)}` : `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
          set('phone', f);
        }} placeholder="010-0000-0000" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Lbl>생년월일</Lbl>
          <Inp value={(() => { const y = form.birthYear || '', m = form.birthMonth || '', d = form.birthDay || ''; return y ? `${y}${m ? '.'+m : ''}${d ? '.'+d : ''}` : ''; })()} onChange={(e) => {
            const parts = e.target.value.replace(/[^\d.]/g, '').split('.');
            setForm((p) => ({ ...p, birthYear: parts[0] || '', birthMonth: parts[1] || '', birthDay: parts[2] || '' }));
          }} placeholder="1993.5.15" />
          {form.birthYear?.length === 4 && <div className="mt-1 text-xs font-semibold text-slate-600">만 {2026 - Number(form.birthYear)}세</div>}
        </div>
        <div>
          <Lbl>태어난 시간</Lbl>
          {!form.birthTimeUnknown ? (
            <Inp value={(() => { const h = form.birthHour, m = form.birthMinute; return (h === '' && m === '') ? '' : `${String(h||0).padStart(2,'0')}:${String(m||0).padStart(2,'0')}`; })()} onChange={(e) => {
              const parts = e.target.value.replace(/[^\d:]/g, '').split(':');
              const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
              setForm((p) => ({ ...p, birthHour: !isNaN(h) && h <= 23 ? String(h) : parts[0] === '' ? '' : p.birthHour, birthMinute: !isNaN(m) && m <= 59 ? String(m) : (parts[1] === '' || parts[1] === undefined) ? '' : p.birthMinute }));
            }} placeholder="10:30" />
          ) : <div className="py-2 text-sm text-slate-400">시간 모름</div>}
          <label className="mt-1 flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={form.birthTimeUnknown} onChange={(e) => set('birthTimeUnknown', e.target.checked)} className="rounded" />
            <span className="text-[11px] text-slate-500">시간 모름</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Lbl>태어난 곳</Lbl>
          <Sel value={form.birthPlace?.split(' ')[0] || ''} onChange={(e) => set('birthPlace', e.target.value ? e.target.value + ' ' : '')}>
            <option value="">시/도 선택</option>
            {locationCities.map((c) => <option key={c} value={c}>{c}</option>)}
          </Sel>
          {form.birthPlace?.split(' ')[0] && (
            <Sel value={form.birthPlace?.split(' ')[1] || ''} onChange={(e) => { const city = form.birthPlace.split(' ')[0]; set('birthPlace', e.target.value ? `${city} ${e.target.value}` : `${city} `); }}>
              <option value="">구/군 선택</option>
              {(locationHierarchy[form.birthPlace.split(' ')[0]] || []).map((d) => <option key={d} value={d}>{d}</option>)}
            </Sel>
          )}
        </div>
        <div>
          <Lbl>혼인 상태</Lbl>
          <Sel value={form.maritalStatus} onChange={(e) => set('maritalStatus', e.target.value)}>
            {maritalStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
          </Sel>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Lbl>자녀 유무</Lbl>
          <label className="flex items-center gap-2 mt-1">
            <input type="checkbox" checked={form.hasChildren} onChange={(e) => { set('hasChildren', e.target.checked); if (!e.target.checked) set('childrenCount', 0); }} className="rounded" />
            <span className="text-sm text-slate-700">자녀 있음</span>
            {form.hasChildren && <input type="number" min={1} max={10} value={form.childrenCount || 1} onChange={(e) => setNum('childrenCount', e.target.value)} className="ml-2 w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm outline-none" />}
            {form.hasChildren && <span className="text-xs text-slate-500">명</span>}
          </label>
        </div>
        <div>
          <Lbl>형제 구성 (본인 포함)</Lbl>
          <div className="flex items-center gap-2 mt-1">
            <input type="number" min={0} max={10} value={form.brotherCount} onChange={(e) => setNum('brotherCount', e.target.value)} className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm outline-none" />
            <span className="text-xs text-slate-500">남</span>
            <input type="number" min={0} max={10} value={form.sisterCount} onChange={(e) => setNum('sisterCount', e.target.value)} className="w-12 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm outline-none" />
            <span className="text-xs text-slate-500">녀</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── 외모 ── */
function AppearanceSection({ form, set, setNum }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div><Lbl>키 (cm)</Lbl><Inp type="text" inputMode="numeric" value={form.height} onChange={(e) => setNum('height', e.target.value)} placeholder="cm" /></div>
      <div><Lbl>몸무게 (kg)</Lbl><Inp type="text" inputMode="numeric" value={form.weight} onChange={(e) => setNum('weight', e.target.value)} placeholder="kg" /></div>
      <div><Lbl>체형</Lbl><Sel value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)}><option value="">선택</option>{(bodyTypeOptions[form.gender] || bodyTypeOptions.M).map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
      <div><Lbl>외모상</Lbl><Sel value={form.faceType} onChange={(e) => set('faceType', e.target.value)}><option value="">선택</option>{(faceTypeOptions[form.gender] || []).map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div className="col-span-2">
        <Lbl>외모 스타일 (복수 선택)</Lbl>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {(appearanceStyleOptions[form.gender] || []).map((o) => {
            const active = form.appearanceStyles?.includes(o.value);
            return <button key={o.value} type="button" onClick={() => set('appearanceStyles', active ? form.appearanceStyles.filter((v) => v !== o.value) : [...(form.appearanceStyles || []), o.value])} className={`rounded-full px-3 py-1 text-xs font-medium transition ${active ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{o.value}</button>;
          })}
        </div>
      </div>
      <div><Lbl>탈모 상태</Lbl><Sel value={form.hairLoss} onChange={(e) => set('hairLoss', e.target.value)}>{(hairLossOptions[form.gender] || hairLossOptions.M).map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
    </div>
  );
}

/* ── 직업/학력 ── */
function CareerSection({ form, set }) {
  return (
    <div className="space-y-3">
      <div><Lbl>직군</Lbl><Sel value={form.jobCategory} onChange={(e) => set('jobCategory', e.target.value)}><option value="">선택</option>{jobCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Sel></div>
      <div><Lbl>직업 상세</Lbl><Inp value={form.jobDetail} onChange={(e) => set('jobDetail', e.target.value)} placeholder="예: 삼성전자 무선사업부" /></div>
      <div><Lbl>학력</Lbl><Sel value={form.edu} onChange={(e) => set('edu', e.target.value)}><option value="">선택</option>{eduOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
    </div>
  );
}

/* ── 경제력 ── */
function WealthSection({ form, setNum }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div><Lbl>연봉 (만원)</Lbl><Inp type="text" inputMode="numeric" value={form.income} onChange={(e) => setNum('income', e.target.value)} placeholder="만원 단위" /></div>
      <div><Lbl>금융자산 (만원)</Lbl><Inp type="text" inputMode="numeric" value={form.financial} onChange={(e) => setNum('financial', e.target.value)} placeholder="만원 단위" /></div>
      <div><Lbl>부동산자산 (만원)</Lbl><Inp type="text" inputMode="numeric" value={form.realEstate} onChange={(e) => setNum('realEstate', e.target.value)} placeholder="만원 단위" /></div>
    </div>
  );
}

/* ── 라이프스타일 ── */
function LifestyleSection({ form, set, openHobbyCat, setOpenHobbyCat }) {
  return (
    <div className="space-y-3">
      {/* 취미 카테고리 아코디언 */}
      <div>
        <Lbl>취미 (복수 선택)</Lbl>
        {form.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
            {form.hobbies.map((h) => <button key={h} type="button" onClick={() => set('hobbies', form.hobbies.filter((v) => v !== h))} className="rounded-full bg-violet-500 text-white px-3 py-1 text-xs font-bold hover:opacity-80">{h} ✕</button>)}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {hobbyCategoryOptions.map((cat) => {
            const isOpen = openHobbyCat === cat.key;
            const cnt = cat.items.filter((i) => form.hobbies.includes(i)).length;
            return <button key={cat.key} type="button" onClick={() => setOpenHobbyCat(isOpen ? null : cat.key)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${isOpen ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <span>{cat.icon}</span> {cat.label}
              {cnt > 0 && <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isOpen ? 'bg-white/20' : 'bg-violet-500 text-white'}`}>{cnt}</span>}
            </button>;
          })}
        </div>
        {openHobbyCat && (() => {
          const cat = hobbyCategoryOptions.find((c) => c.key === openHobbyCat);
          if (!cat) return null;
          return <div className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-sm font-bold text-slate-700 mb-2">{cat.icon} {cat.label}</div>
            <div className="flex flex-wrap gap-2">
              {cat.items.map((item) => {
                const active = form.hobbies.includes(item);
                return <button key={item} type="button" onClick={() => set('hobbies', active ? form.hobbies.filter((v) => v !== item) : [...form.hobbies, item])} className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? 'bg-violet-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>;
              })}
            </div>
          </div>;
        })()}
        {/* 직접 입력 */}
        <div className="mt-2 flex items-center gap-2">
          <Inp value={form.customHobby || ''} onChange={(e) => set('customHobby', e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = (form.customHobby || '').trim(); if (v && !form.hobbies.includes(v)) { set('hobbies', [...form.hobbies, v]); set('customHobby', ''); } } }} placeholder="직접 입력" />
          <button type="button" onClick={() => { const v = (form.customHobby || '').trim(); if (v && !form.hobbies.includes(v)) { set('hobbies', [...form.hobbies, v]); set('customHobby', ''); } }} className="shrink-0 rounded-lg bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-200">추가</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Lbl>음주</Lbl><Sel value={form.drink} onChange={(e) => set('drink', e.target.value)}><option value="">선택</option>{drinkOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
        <div><Lbl>흡연</Lbl><Sel value={form.smoke} onChange={(e) => set('smoke', e.target.value)}><option value="">선택</option>{smokeOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
        <div><Lbl>종교</Lbl><Sel value={form.religion} onChange={(e) => set('religion', e.target.value)}><option value="">선택</option>{religionOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
        <div><Lbl>MBTI</Lbl><Sel value={form.mbti} onChange={(e) => set('mbti', e.target.value)}><option value="">선택안함</option>{mbtiOptions.map((o) => <option key={o} value={o}>{o}</option>)}</Sel></div>
      </div>
    </div>
  );
}

/* ── 집안/가족 ── */
function FamilySection({ form, set }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div><Lbl>부모 재력 수준</Lbl><Sel value={form.parentWealth} onChange={(e) => set('parentWealth', e.target.value)}><option value="">선택</option>{parentWealthOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>부모 현 직업</Lbl><Sel value={form.parentJob} onChange={(e) => set('parentJob', e.target.value)}><option value="">선택</option>{parentJobOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>부모 과거 직업</Lbl><Sel value={form.parentPastJob} onChange={(e) => set('parentPastJob', e.target.value)}><option value="">선택</option>{parentJobOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>부모 자산</Lbl><Sel value={form.parentAssets} onChange={(e) => set('parentAssets', e.target.value)}><option value="">선택</option>{parentAssetOptions.map((o) => <option key={o.value} value={o.value}>{o.value} — {o.desc}</option>)}</Sel></div>
      <div><Lbl>노후 준비</Lbl><Sel value={form.retirementPrep} onChange={(e) => set('retirementPrep', e.target.value)}><option value="">선택</option>{retirementPrepOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>형제 상황</Lbl><Sel value={form.siblings} onChange={(e) => set('siblings', e.target.value)}><option value="">선택</option>{siblingsOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>가족 리스크</Lbl><Sel value={form.familyRisk} onChange={(e) => set('familyRisk', e.target.value)}><option value="">선택</option>{familyRiskOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}</Sel></div>
      <div><Lbl>가족 메모</Lbl><Inp value={form.familyMemo} onChange={(e) => set('familyMemo', e.target.value)} placeholder="자유 기입" /></div>
    </div>
  );
}

/* ── 이상형 ── */
function IdealTypeSection({ form, set, openCondCat, setOpenCondCat }) {
  return (
    <div className="space-y-4">
      <div>
        <Lbl>이상형 선호도 (카테고리별)</Lbl>
        <div className="grid grid-cols-2 gap-2 mt-1">
          {idealTypeCategories.map((cat) => (
            <div key={cat.key} className="rounded-lg border border-slate-200 p-2">
              <div className="text-xs text-slate-500 mb-1">{cat.icon} {cat.label}</div>
              <Sel value={form.idealType[cat.key]} onChange={(e) => set('idealType', { ...form.idealType, [cat.key]: e.target.value })}>
                {idealTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.value}</option>)}
              </Sel>
            </div>
          ))}
        </div>
      </div>
      {/* 조건 분류 */}
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
        const pill = color === 'rose' ? 'bg-rose-500 text-white' : color === 'blue' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white';
        const openCat = openCondCat?.startsWith(key + '_') ? openCondCat.replace(key + '_', '') : null;
        return (
          <div key={key} className={`rounded-xl border p-3 ${color === 'rose' ? 'border-rose-200 bg-rose-50/30' : color === 'blue' ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-slate-50/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`h-2 w-2 rounded-full ${color === 'rose' ? 'bg-rose-500' : color === 'blue' ? 'bg-blue-500' : 'bg-slate-500'}`} />
              <span className="text-sm font-bold text-slate-800">{label}</span>
              <span className="text-xs text-slate-400">{desc}</span>
              {selected.length > 0 && <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${pill}`}>{selected.length}개</span>}
            </div>
            {selected.length > 0 && <div className="flex flex-wrap gap-1.5 mb-2">{selected.map((item) => <button key={item} type="button" onClick={() => toggle(item)} className={`rounded-full px-3 py-1 text-xs font-bold ${pill} hover:opacity-80`}>{item} ✕</button>)}</div>}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {idealConditionCategories.map((cat) => {
                const isOpen = openCat === cat.key;
                const cnt = cat.items.filter((i) => selected.includes(i)).length;
                return <button key={cat.key} type="button" onClick={() => setOpenCondCat(isOpen ? null : key + '_' + cat.key)} className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${isOpen ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {cat.icon} {cat.label}
                  {cnt > 0 && <span className={`rounded-full px-1.5 text-[10px] font-bold ${isOpen ? 'bg-white/20' : pill}`}>{cnt}</span>}
                </button>;
              })}
            </div>
            {openCat && (() => {
              const cat = idealConditionCategories.find((c) => c.key === openCat);
              if (!cat) return null;
              return <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="flex flex-wrap gap-1.5">{cat.items.map((item) => {
                  const active = selected.includes(item);
                  return <button key={item} type="button" onClick={() => toggle(item)} className={`rounded-full px-3 py-1 text-xs font-medium transition ${active ? pill : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{item}</button>;
                })}</div>
              </div>;
            })()}
          </div>
        );
      })}
    </div>
  );
}

/* ── 거주지 ── */
function LocationSection({ form, set }) {
  return (
    <div className="space-y-2">
      <Sel value={form.location?.split(' ')[0] || ''} onChange={(e) => set('location', e.target.value ? `${e.target.value} ` : '')}>
        <option value="">시/도 선택</option>
        {locationCities.map((c) => <option key={c} value={c}>{c}</option>)}
      </Sel>
      {form.location?.trim() && (
        <Sel value={form.location.split(' ')[1] || ''} onChange={(e) => { const city = form.location.split(' ')[0]; set('location', e.target.value ? `${city} ${e.target.value}` : `${city} `); }}>
          <option value="">{form.location.split(' ')[0] === '해외' ? '국가 선택' : '구/군 선택'}</option>
          {(locationHierarchy[form.location.split(' ')[0]] || []).map((d) => <option key={d} value={d}>{d}</option>)}
        </Sel>
      )}
      {form.location?.split(' ')[0] === '해외' && form.location.split(' ')[1]?.trim() && (
        <Inp value={form.location.split(' ').slice(2).join(' ') || ''} onChange={(e) => { const parts = form.location.split(' '); set('location', `${parts[0]} ${parts[1]}${e.target.value ? ' ' + e.target.value : ''}`); }} placeholder="도시명 (예: LA, 도쿄)" />
      )}
    </div>
  );
}

/* ── 사진 ── */
function PhotoSection({ form, set, fileInputRef, setForm }) {
  const handleAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (form.photos.length + files.length > 6) return;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setForm((p) => ({ ...p, photos: [...p.photos, ev.target.result] }));
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };
  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAdd} />
      {form.photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {form.photos.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => set('photos', form.photos.filter((_, j) => j !== i))} className="absolute right-1 top-1 hidden rounded-full bg-black/60 p-1 text-white group-hover:block"><X size={12} /></button>
              {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>}
            </div>
          ))}
        </div>
      ) : (
        <div onClick={() => fileInputRef.current?.click()} className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10 text-sm text-slate-400 hover:border-violet-300 hover:text-violet-500">
          클릭하여 사진을 추가하세요 (최대 6장)
        </div>
      )}
      {form.photos.length > 0 && form.photos.length < 6 && (
        <button onClick={() => fileInputRef.current?.click()} className="mt-2 flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"><Plus size={14} /> 사진 추가</button>
      )}
    </div>
  );
}
