import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, FileSearch, MessageSquare, Send, Sparkles,
  Clock, ChevronDown, ChevronUp, TrendingUp,
  User, X, Filter, Shield, ChevronLeft
} from 'lucide-react';
import Badge from '../components/common/Badge';
import GradeBadge from '../components/common/GradeBadge';
import NetworkResultCard from '../components/member/NetworkResultCard';
import SajuCompatModal from '../components/saju/SajuCompatModal';
import CompatDashboard from '../components/saju/CompatDashboard';
import { ELEMENT_HANJA, STEM_ELEMENT, calculateCompatibility } from '../lib/saju';
import { locationHierarchy } from '../lib/constants';
import { computeMatchGap, sortByGapAsc } from '../lib/matching';
import { calcMatchScores } from '../lib/matchingScore';
import { useMessages } from '../hooks/useMessages';
import { useMembers } from '../hooks/useMembers';
import useAppStore from '../stores/appStore';

/* ── helpers ── */
function parseActivityMinutes(text) {
  if (!text) return 9999;
  if (text.includes('방금')) return 0;
  const num = parseInt(text) || 0;
  if (text.includes('분')) return num;
  if (text.includes('시간')) return num * 60;
  if (text.includes('일')) return num * 1440;
  return 9999;
}

function scoreColor(s) {
  if (s >= 90) return 'text-emerald-700';
  if (s >= 80) return 'text-violet-700';
  if (s >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

function scoreBgCls(s) {
  if (s >= 90) return 'bg-emerald-500';
  if (s >= 80) return 'bg-violet-500';
  if (s >= 70) return 'bg-amber-500';
  return 'bg-rose-500';
}

/* ── 연령대 → 나이 범위 매핑 ── */
const AGE_RANGE_MAP = {
  '20대 초반': [20, 24], '20대 중반': [24, 27], '20대 후반': [27, 29],
  '30대 초반': [30, 32], '30대 중반': [33, 35], '30대 후반': [36, 39],
  '40대 초반': [40, 42], '40대 중반': [43, 46], '40대 후반': [46, 49],
};

const RANGE_THUMB = 'absolute inset-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-600 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-violet-600 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer';

/* ── ComparisonTable (card-column style) ── */
function ComparisonTable({ compareList, onRemove, myScore }) {
  if (!compareList.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-400">
        후보를 비교함에 추가하면 조건·궁합·가치관을 한눈에 비교할 수 있습니다.
      </div>
    );
  }

  const rows = [
    { label: '총합', get: (m) => m.matchScore },
    { label: '조건', get: (m) => m.scores?.condition ?? 0 },
    { label: '가치관', get: (m) => m.scores?.values ?? 0 },
    { label: '궁합', get: (m) => m.scores?.saju ?? 0 },
  ];

  return (
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className={`flex gap-3 ${compareList.length <= 2 ? '' : ''}`} style={{ minWidth: compareList.length >= 3 ? `${compareList.length * 220}px` : undefined }}>
        {compareList.map((item) => (
          <div key={item.id} className="w-[210px] shrink-0 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* header */}
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2.5 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${item.gender === 'F' ? 'bg-rose-400' : 'bg-blue-500'}`}>
                    {item.gender === 'F' ? '♀' : '♂'}
                  </span>
                  {item.id}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">{item.agency} · {item.ageRange}</div>
              </div>
              <button onClick={() => onRemove(item)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
            {/* scores */}
            <div className="p-3 space-y-2">
              {rows.map((row) => {
                const val = row.get(item);
                return (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 text-xs">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full ${scoreBgCls(val)}`} style={{ width: `${val}%` }} />
                      </div>
                      <span className={`font-bold text-xs w-7 text-right ${scoreColor(val)}`}>{val}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-3 pb-2">
              <p className="text-[10px] leading-4 text-slate-500 line-clamp-2">{item.chemistryNote}</p>
            </div>
            {/* gap row */}
            {myScore > 0 && (() => {
              const g = computeMatchGap(myScore, item.matchScore);
              const arrow = g.direction === '상향' ? '▲' : g.direction === '하향' ? '▼' : '━';
              const clr = { emerald: 'text-emerald-700 bg-emerald-50', amber: 'text-amber-700 bg-amber-50', orange: 'text-orange-700 bg-orange-50', rose: 'text-rose-700 bg-rose-50' };
              return (
                <div className={`mx-3 mb-2.5 flex items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-bold ${clr[g.color]}`}>
                  <span>{arrow} {g.label}{g.absGap > 3 ? ` (${g.absGap}점)` : ''}</span>
                  <span>{g.mySplit}:{g.theirSplit}</span>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function NetworkPage({ selectedMyMember, compareList, setCompareList, selectedNetworkMember, setSelectedNetworkMember, openProposal }) {
  /* filters */
  const [searchQuery, setSearchQuery] = useState('');
  const [ageRange, setAgeRange] = useState([25, 45]);
  const [cityFilter, setCityFilter] = useState('전체');
  const [districtFilter, setDistrictFilter] = useState('전체');
  const [jobFilter, setJobFilter] = useState('전체');
  const [minScore, setMinScore] = useState(70);
  const [verifyFilter, setVerifyFilter] = useState('전체');
  const [sortBy, setSortBy] = useState('score');
  const [selectedTags, setSelectedTags] = useState([]);
  const [eduFilter, setEduFilter] = useState('전체');
  const [incomeFilter, setIncomeFilter] = useState('전체');
  const [heightFilter, setHeightFilter] = useState([155, 190]);
  const [bodyTypeFilter, setBodyTypeFilter] = useState('전체');
  const [assetsFilter, setAssetsFilter] = useState('전체');

  /* UI state */
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [sajuCompatOpen, setSajuCompatOpen] = useState(false);
  const [sajuCompatB, setSajuCompatB] = useState(null);
  const [msgThreadOpen, setMsgThreadOpen] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(false);
  const [detailTab, setDetailTab] = useState('profile'); // 'profile' | 'compat'

  const networkPool = useAppStore((s) => s.networkPool);
  const { messages, sendMessage } = useMessages(selectedNetworkMember?.id);
  const { members: internalMembers } = useMembers();

  /* reset detail tab when selected member changes */
  useEffect(() => { setDetailTab('profile'); }, [selectedNetworkMember?.id]);

  /* unique filter options */
  const filterOptions = useMemo(() => {
    const ageOrder = ['20대 후반', '30대 초반', '30대 중반', '30대 후반', '40대 초반'];
    const ages = [...new Set(networkPool.map((m) => m.ageRange))].sort(
      (a, b) => ageOrder.indexOf(a) - ageOrder.indexOf(b),
    );
    /* 시/도별 회원 수 집계 */
    const cityCount = {};
    networkPool.forEach((m) => {
      const city = m.location.split(' ')[0];
      cityCount[city] = (cityCount[city] || 0) + 1;
    });
    const cities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).map(([c]) => c);

    /* 선택된 시/도 내 구/군 목록 (동적) */
    const locations = [...new Set(networkPool.map((m) => m.location))].sort();
    const jobs = [...new Set(networkPool.map((m) => m.jobCategory))].sort();

    /* popular tags sorted by frequency */
    const tagCount = {};
    networkPool.forEach((m) => m.tags?.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const tags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag);

    /* 학력 */
    const eduOrder = ['SKY', '명문대/의대', '해외대 학사', '상위권 대학원'];
    const edus = [...new Set(networkPool.map((m) => m.eduRange))].sort(
      (a, b) => eduOrder.indexOf(a) - eduOrder.indexOf(b),
    );
    /* 연소득 */
    const incomeOrder = ['5,000만~7,000만', '7,000만~1억', '1억 이상', '1.5억 이상', '2억 이상'];
    const incomes = [...new Set(networkPool.map((m) => m.incomeRange))].sort(
      (a, b) => incomeOrder.indexOf(a) - incomeOrder.indexOf(b),
    );
    /* 체형 */
    const bodyTypes = [...new Set(networkPool.map((m) => m.bodyType))].sort();
    /* 자산 */
    const assetsOrder = ['1~2억', '2~5억', '3~5억', '5억 이상', '5~10억', '10억 이상'];
    const assets = [...new Set(networkPool.map((m) => m.assetsRange))].sort(
      (a, b) => assetsOrder.indexOf(a) - assetsOrder.indexOf(b),
    );

    return { ages, cities, locations, jobs, tags, edus, incomes, bodyTypes, assets };
  }, [networkPool]);

  /* 선택된 회원의 반대 성별 자동 필터 */
  const oppositeGender = selectedMyMember?.gender === 'M' ? 'F' : selectedMyMember?.gender === 'F' ? 'M' : null;

  /* 동적 점수 계산 — selectedMyMember 기준으로 모든 네트워크 회원 점수를 재계산 */
  const scoredNetworkMembers = useMemo(() => {
    if (!selectedMyMember) return networkPool;
    return networkPool.map((m) => {
      const computed = calcMatchScores(selectedMyMember, m);
      return { ...m, scores: { condition: computed.condition, values: computed.values, saju: computed.saju }, matchScore: computed.matchScore };
    });
  }, [selectedMyMember, networkPool]);

  /* filter + sort */
  const filtered = useMemo(() => {
    let list = scoredNetworkMembers.filter((m) => {
      /* broad full-text search (multi-keyword AND) */
      if (searchQuery.trim()) {
        const haystack = [
          m.id, m.agency, m.jobCategory, m.location, m.ageRange,
          m.incomeRange, m.eduRange, m.heightRange,
          m.sajuProfile, m.chemistryNote,
          ...(m.reason || []), ...(m.risks || []),
          ...(m.tags || []), ...(m.rankingBadges || []),
        ].join(' ').toLowerCase();
        const keywords = searchQuery.toLowerCase().trim().split(/\s+/);
        if (!keywords.every((kw) => haystack.includes(kw))) return false;
      }
      /* tag chip filter (AND) */
      if (selectedTags.length > 0) {
        const memberAllText = [
          ...(m.tags || []), m.sajuProfile, m.chemistryNote,
          ...(m.reason || []), ...(m.risks || []),
        ].join(' ');
        if (!selectedTags.every((st) => memberAllText.includes(st))) return false;
      }
      /* 반대 성별 자동 필터 — 남자 회원이면 여자만, 여자 회원이면 남자만 */
      if (oppositeGender && m.gender !== oppositeGender) return false;
      if (ageRange[0] !== 25 || ageRange[1] !== 45) {
        const ar = AGE_RANGE_MAP[m.ageRange];
        if (ar && (ar[1] < ageRange[0] || ar[0] > ageRange[1])) return false;
      }
      if (cityFilter !== '전체') {
        if (!m.location.startsWith(cityFilter)) return false;
        if (districtFilter !== '전체') {
          const district = m.location.replace(/^[^\s]+\s/, '');
          if (district !== districtFilter) return false;
        }
      }
      if (jobFilter !== '전체' && m.jobCategory !== jobFilter) return false;
      if (m.matchScore < minScore) return false;
      if (verifyFilter !== '전체' && m.verifyLevel !== verifyFilter) return false;
      if (eduFilter !== '전체' && m.eduRange !== eduFilter) return false;
      if (incomeFilter !== '전체' && m.incomeRange !== incomeFilter) return false;
      if (heightFilter[0] !== 155 || heightFilter[1] !== 190) {
        const hMatch = m.heightRange?.match(/(\d+)~(\d+)/);
        if (hMatch) {
          const [hMin, hMax] = [parseInt(hMatch[1]), parseInt(hMatch[2])];
          if (hMax < heightFilter[0] || hMin > heightFilter[1]) return false;
        }
      }
      if (bodyTypeFilter !== '전체' && m.bodyType !== bodyTypeFilter) return false;
      if (assetsFilter !== '전체' && m.assetsRange !== assetsFilter) return false;
      return true;
    });

    list = [...list];
    const myOverall = Math.round(selectedMyMember?.grade?.overallScore || 0);
    switch (sortBy) {
      case 'saju': list.sort((a, b) => (b.scores?.saju || 0) - (a.scores?.saju || 0)); break;
      case 'activity': list.sort((a, b) => parseActivityMinutes(a.recentActivity) - parseActivityMinutes(b.recentActivity)); break;
      case 'response': list.sort((a, b) => parseFloat(b.responseRate) - parseFloat(a.responseRate)); break;
      case 'trust': list.sort((a, b) => b.trustScore - a.trustScore); break;
      case 'gap': if (myOverall > 0) { list.sort(sortByGapAsc(myOverall)); } break;
      default: list.sort((a, b) => b.matchScore - a.matchScore); break;
    }
    return list;
  }, [searchQuery, selectedTags, oppositeGender, ageRange, cityFilter, districtFilter, jobFilter, minScore, verifyFilter, eduFilter, incomeFilter, heightFilter, bodyTypeFilter, assetsFilter, sortBy, scoredNetworkMembers, selectedMyMember]);

  const activeFilterCount = [
    ageRange[0] !== 25 || ageRange[1] !== 45, cityFilter !== '전체',
    districtFilter !== '전체', jobFilter !== '전체', minScore !== 70, verifyFilter !== '전체',
    searchQuery.trim() !== '', selectedTags.length > 0,
    eduFilter !== '전체', incomeFilter !== '전체',
    heightFilter[0] !== 155 || heightFilter[1] !== 190,
    bodyTypeFilter !== '전체', assetsFilter !== '전체',
  ].filter(Boolean).length;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleCompare = (member) => {
    setCompareList((prev) => {
      const exists = prev.find((x) => x.id === member.id);
      if (exists) return prev.filter((x) => x.id !== member.id);
      return [...prev, member];
    });
  };

  const removeCompare = (member) => setCompareList((prev) => prev.filter((x) => x.id !== member.id));

  const current = filtered.find((item) => item.id === selectedNetworkMember?.id) || filtered[0] || null;

  /* compute saju compatibility when both members have saju pillars */
  const compatResult = useMemo(() => {
    if (!selectedMyMember?.saju?.pillars || !current?.saju?.pillars) return null;
    return calculateCompatibility(selectedMyMember, current);
  }, [selectedMyMember, current]);

  const handleSendMessage = async () => {
    if (!msgInput.trim()) return;
    await sendMessage(msgInput.trim());
    setMsgInput('');
  };

  const resetFilters = () => {
    setSearchQuery(''); setAgeRange([25, 45]);
    setCityFilter('전체'); setDistrictFilter('전체'); setJobFilter('전체'); setMinScore(70); setVerifyFilter('전체');
    setSelectedTags([]);
    setEduFilter('전체'); setIncomeFilter('전체'); setHeightFilter([155, 190]);
    setBodyTypeFilter('전체'); setAssetsFilter('전체');
  };

  return (
    <div className={`grid h-full grid-rows-1 overflow-hidden grid-cols-1 ${selectedNetworkMember ? 'lg:grid-cols-[280px_1fr_360px]' : 'lg:grid-cols-[280px_1fr]'}`}>
      {/* ═══ LEFT SIDEBAR (hidden on mobile, toggle via filter button) ═══ */}
      {showMobileFilters && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setShowMobileFilters(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:relative lg:w-auto lg:translate-x-0 ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'} flex flex-col border-r border-slate-200 bg-white overflow-hidden`}>
        {/* mobile close button */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 lg:hidden">
          <span className="text-sm font-bold text-slate-900">필터</span>
          <button onClick={() => setShowMobileFilters(false)} className="rounded-lg p-1.5 hover:bg-slate-100">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        {/* my member context */}
        <div className="shrink-0 border-b border-slate-100 p-4">
          <div className="rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-violet-500">매칭 대상 회원</div>
            <div className="mt-1.5 flex items-center gap-2.5">
              {selectedMyMember?.photos?.length > 0 ? (
                <img src={selectedMyMember.photos[0]} alt="" className="h-9 w-9 shrink-0 rounded-full border border-violet-200 object-cover" />
              ) : (
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${selectedMyMember?.gender === 'F' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                  {selectedMyMember?.name?.[0] || '?'}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {selectedMyMember?.name || '회원 미선택'}
                  <span className="ml-1 text-xs font-normal text-slate-400">{selectedMyMember?.id}</span>
                </div>
                <div className="truncate text-xs text-slate-500">
                  {selectedMyMember ? `${selectedMyMember.gender === 'F' ? '여' : '남'} ${selectedMyMember.age}세 · ${selectedMyMember.location}` : '우리 회원 CRM에서 선택하세요'}
                </div>
                {selectedMyMember?.grade?.overallScore > 0 && (
                  <div className="mt-0.5 text-xs">
                    <span className="text-slate-400">종합 </span>
                    <span className={`font-bold ${scoreColor(Math.round(selectedMyMember.grade.overallScore))}`}>
                      {Math.round(selectedMyMember.grade.overallScore)}점
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* search */}
          <div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="키워드 검색 (예: 강남 의료 안정)"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-sm outline-none focus:border-violet-400 focus:bg-white"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-4">
              직업·학력·소득·지역·사주성향·궁합코멘트 등 모든 정보에서 검색. 띄어쓰기로 복수 키워드 AND 검색
            </p>
          </div>

          {/* tag chips */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">키워드 태그</label>
            <div className="flex flex-wrap gap-1.5">
              {(tagsExpanded ? filterOptions.tags : filterOptions.tags.slice(0, 10)).map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button key={tag} onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${active ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    {tag}
                  </button>
                );
              })}
              {filterOptions.tags.length > 10 && (
                <button onClick={() => setTagsExpanded(!tagsExpanded)}
                  className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50">
                  {tagsExpanded ? '접기' : `+${filterOptions.tags.length - 10}개 더보기`}
                </button>
              )}
            </div>
            {selectedTags.length > 0 && (
              <button onClick={() => setSelectedTags([])} className="mt-1.5 text-[10px] text-violet-600 hover:text-violet-700">
                태그 초기화
              </button>
            )}
          </div>

          {/* age range slider */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">연령대</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-500">범위</span>
                <span className="font-bold text-violet-700">
                  {ageRange[0] === 25 && ageRange[1] === 45 ? '전체' : `${ageRange[0]}세 – ${ageRange[1]}세`}
                </span>
              </div>
              <div className="relative h-6">
                <div className="absolute top-2.5 h-1.5 w-full rounded-full bg-slate-200" />
                <div
                  className="absolute top-2.5 h-1.5 rounded-full bg-violet-400"
                  style={{
                    left: `${((ageRange[0] - 25) / 20) * 100}%`,
                    width: `${((ageRange[1] - ageRange[0]) / 20) * 100}%`,
                  }}
                />
                <input
                  type="range" min={25} max={45} value={ageRange[0]}
                  onChange={(e) => setAgeRange([Math.min(+e.target.value, ageRange[1] - 1), ageRange[1]])}
                  className={RANGE_THUMB}
                  style={{ zIndex: ageRange[0] > 35 ? 5 : 3 }}
                />
                <input
                  type="range" min={25} max={45} value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], Math.max(+e.target.value, ageRange[0] + 1)])}
                  className={RANGE_THUMB}
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>25</span><span>30</span><span>35</span><span>40</span><span>45</span>
              </div>
            </div>
          </div>

          {/* location — 2단계: 시/도 → 구/군 */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">지역</label>
            {/* 1차: 시/도 선택 */}
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setDistrictFilter('전체'); }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400"
            >
              <option value="전체">전체 지역</option>
              {filterOptions.cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* 2차: 구/군 선택 (시/도 선택 시만 표시) */}
            {cityFilter !== '전체' && (
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm outline-none focus:border-violet-400"
              >
                <option value="전체">{cityFilter} 전체</option>
                {(() => {
                  /* 실제 회원 데이터에 있는 구/군만 표시 + 계층 구조의 전체 목록 병합 */
                  const dataDistricts = filterOptions.locations
                    .filter((l) => l.startsWith(cityFilter))
                    .map((l) => l.replace(/^[^\s]+\s/, ''));
                  const hierDistricts = locationHierarchy[cityFilter] || [];
                  const merged = [...new Set([...dataDistricts, ...hierDistricts])].sort();
                  return merged.map((d) => {
                    const hasMembers = dataDistricts.includes(d);
                    return (
                      <option key={d} value={d} className={hasMembers ? '' : 'text-slate-400'}>
                        {d}{hasMembers ? '' : ' (0)'}
                      </option>
                    );
                  });
                })()}
              </select>
            )}

            {/* 시/도 요약 — 선택 현황 */}
            {cityFilter !== '전체' && (
              <div className="mt-1.5 text-[10px] text-violet-600">
                {cityFilter}{districtFilter !== '전체' ? ` ${districtFilter}` : ' 전체'} ·{' '}
                {filtered.length}건 매칭
              </div>
            )}
          </div>

          {/* job */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">직업군</label>
            <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="전체">전체 직업</option>
              {filterOptions.jobs.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>

          {/* min score slider */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">최소 매칭 점수</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">기준</span>
                <span className={`font-bold ${scoreColor(minScore)}`}>{minScore}점 이상</span>
              </div>
              <input type="range" min="60" max="95" step="5" value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="mt-2 w-full accent-violet-600" />
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>60</span><span>70</span><span>80</span><span>90</span><span>95</span>
              </div>
            </div>
          </div>

          {/* verify level */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">인증 레벨</label>
            <select value={verifyFilter} onChange={(e) => setVerifyFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option>전체</option><option>VIP</option><option>Lv4</option><option>Lv3</option>
            </select>
          </div>

          {/* education */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">학력</label>
            <select value={eduFilter} onChange={(e) => setEduFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="전체">전체 학력</option>
              {filterOptions.edus.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* income */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">연소득</label>
            <select value={incomeFilter} onChange={(e) => setIncomeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="전체">전체 소득</option>
              {filterOptions.incomes.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* height range slider */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">키</label>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-slate-500">범위</span>
                <span className="font-bold text-violet-700">
                  {heightFilter[0] === 155 && heightFilter[1] === 190 ? '전체' : `${heightFilter[0]}cm – ${heightFilter[1]}cm`}
                </span>
              </div>
              <div className="relative h-6">
                <div className="absolute top-2.5 h-1.5 w-full rounded-full bg-slate-200" />
                <div
                  className="absolute top-2.5 h-1.5 rounded-full bg-violet-400"
                  style={{
                    left: `${((heightFilter[0] - 155) / 35) * 100}%`,
                    width: `${((heightFilter[1] - heightFilter[0]) / 35) * 100}%`,
                  }}
                />
                <input
                  type="range" min={155} max={190} value={heightFilter[0]}
                  onChange={(e) => setHeightFilter([Math.min(+e.target.value, heightFilter[1] - 1), heightFilter[1]])}
                  className={RANGE_THUMB}
                  style={{ zIndex: heightFilter[0] > 172 ? 5 : 3 }}
                />
                <input
                  type="range" min={155} max={190} value={heightFilter[1]}
                  onChange={(e) => setHeightFilter([heightFilter[0], Math.max(+e.target.value, heightFilter[0] + 1)])}
                  className={RANGE_THUMB}
                  style={{ zIndex: 4 }}
                />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                <span>155</span><span>165</span><span>175</span><span>185</span><span>190</span>
              </div>
            </div>
          </div>

          {/* body type */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">체형</label>
            <select value={bodyTypeFilter} onChange={(e) => setBodyTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="전체">전체 체형</option>
              {filterOptions.bodyTypes.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {/* assets */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-400">자산</label>
            <select value={assetsFilter} onChange={(e) => setAssetsFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400">
              <option value="전체">전체 자산</option>
              {filterOptions.assets.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* reset */}
          {activeFilterCount > 0 && (
            <button onClick={resetFilters}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 flex items-center justify-center gap-1">
              <X size={12} /> 필터 초기화 ({activeFilterCount}개 적용 중)
            </button>
          )}

          {/* compare box */}
          {compareList.length > 0 && (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-3">
              <div className="text-xs font-bold text-violet-900">비교함 ({compareList.length}명)</div>
              <div className="mt-2 space-y-1.5">
                {compareList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-violet-100 bg-white px-2.5 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white ${item.gender === 'F' ? 'bg-rose-400' : 'bg-blue-500'}`}>
                        {item.gender === 'F' ? '♀' : '♂'}
                      </span>
                      <span className="font-medium text-slate-700">{item.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-violet-700">{item.matchScore}</span>
                      <button onClick={() => removeCompare(item)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ CENTER ═══ */}
      <section className={`overflow-y-auto bg-slate-50 p-4 md:p-6 ${selectedNetworkMember ? 'hidden lg:block' : ''}`}>
        {/* header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowMobileFilters(true)} className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"><Filter size={18} /></button>
              <h2 className="text-xl font-bold text-slate-900 md:text-2xl">매칭 검색</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {oppositeGender === 'F' ? '♀ 여성' : oppositeGender === 'M' ? '♂ 남성' : ''} 후보{' '}
              <span className="font-bold text-violet-700">{filtered.length}건</span>
              {selectedMyMember && (
                <span className="text-slate-400 ml-1.5">
                  ({selectedMyMember.name} {selectedMyMember.gender === 'F' ? '여' : '남'}회원 기준)
                </span>
              )}
            </p>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-violet-400 shadow-sm">
            <option value="score">종합점수순</option>
            <option value="gap">균형 매칭순</option>
            <option value="saju">궁합점수순</option>
            <option value="activity">최근활동순</option>
            <option value="response">응답률순</option>
            <option value="trust">신뢰점수순</option>
          </select>
        </div>

        {/* compare table */}
        <div className="mt-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
            <FileSearch size={15} /> 후보 비교
            {compareList.length === 0 && <span className="font-normal text-xs text-slate-400">카드에서 "비교함 추가" 클릭</span>}
          </div>
          <ComparisonTable compareList={compareList} onRemove={removeCompare} myScore={Math.round(selectedMyMember?.grade?.overallScore || 0)} />
        </div>

        {/* results */}
        <div className="mt-6 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((member) => (
              <NetworkResultCard
                key={member.id} member={member} selected={current?.id === member.id}
                onSelect={(open) => { setSelectedNetworkMember(member); if (open) openProposal(member); }}
                onToggleCompare={() => toggleCompare(member)}
                isCompared={!!compareList.find((x) => x.id === member.id)}
                myMember={selectedMyMember}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <Filter size={28} className="mx-auto text-slate-300" />
              <p className="mt-3 text-sm text-slate-400">필터 조건에 맞는 후보가 없습니다.</p>
              <button onClick={resetFilters} className="mt-2 text-sm font-medium text-violet-600 hover:text-violet-700">필터 초기화</button>
            </div>
          )}
        </div>
      </section>

      {/* ═══ RIGHT DETAIL ═══ */}
      {selectedNetworkMember && (
      <div className="fixed inset-0 z-30 flex min-h-0 flex-col bg-white lg:relative lg:inset-auto lg:z-auto">
        <button
          onClick={() => setSelectedNetworkMember(null)}
          className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 lg:hidden"
        >
          <ChevronLeft size={18} /> 목록으로 돌아가기
        </button>
      <aside className="flex min-h-0 flex-1 flex-col border-l border-slate-200 bg-white overflow-hidden">
        {current ? (
          <>
            {/* header (sticky) */}
            <div className="shrink-0 border-b border-slate-100 px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold ${current.gender === 'F' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-600'}`}>
                    {current.gender === 'F' ? '♀' : '♂'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{current.id}</h3>
                    <p className="text-xs text-slate-500">{current.agency} · {current.ageRange} · {current.gender === 'F' ? '여성' : '남성'}</p>
                  </div>
                </div>
                <Badge level={current.verifyLevel} />
              </div>
            </div>

            {/* tab bar */}
            <div className="shrink-0 flex border-b border-slate-200">
              <button onClick={() => setDetailTab('profile')}
                className={`flex-1 py-2.5 text-xs font-bold transition ${detailTab === 'profile' ? 'border-b-2 border-violet-500 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}>
                프로필 비교
              </button>
              <button onClick={() => setDetailTab('compat')}
                className={`flex-1 py-2.5 text-xs font-bold transition ${detailTab === 'compat' ? 'border-b-2 border-violet-500 text-violet-700' : 'text-slate-400 hover:text-slate-600'}`}>
                <span className="inline-flex items-center gap-1"><Sparkles size={12} /> HANI 사주 궁합</span>
              </button>
            </div>

            {/* scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

            {detailTab === 'compat' ? (
              <CompatDashboard memberA={selectedMyMember} memberB={current} compatResult={compatResult} />
            ) : (
              <>
              {/* ── FM Style: Dual Card Comparison ── */}
              {(() => {
                const myScore = Math.round(selectedMyMember?.grade?.overallScore || 0);
                const myGender = selectedMyMember?.gender;
                const mScore = myGender === 'M' ? myScore : current.matchScore;
                const fScore = myGender === 'F' ? myScore : current.matchScore;
                const rTotal = mScore + fScore || 1;
                const mRatio = Math.round((mScore / rTotal) * 100);
                const fRatio = 100 - mRatio;
                const dom = mRatio > fRatio ? 'male' : mRatio < fRatio ? 'female' : 'even';
                const myBadge = selectedMyMember?.grade?.categories?.overall?.badge;
                return (
                  <div className="rounded-2xl border border-violet-200 overflow-hidden">
                    {/* dual cards */}
                    <div className="grid grid-cols-[1fr_64px_1fr]">
                      <div className={`p-3 text-center ${myGender === 'M' ? 'bg-gradient-to-br from-blue-50 to-blue-100/40' : 'bg-gradient-to-br from-rose-50 to-rose-100/40'}`}>
                        <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${myGender === 'M' ? 'bg-blue-500' : 'bg-rose-400'}`}>
                          {myGender === 'M' ? '♂' : '♀'}
                        </div>
                        <div className="mt-1 truncate text-[11px] font-bold text-slate-700">{selectedMyMember?.name || '?'}</div>
                        <div className={`text-2xl font-black ${scoreColor(myScore)}`}>{myScore}</div>
                        {myBadge && <span className="text-[8px] font-bold text-violet-600">{myBadge}</span>}
                      </div>
                      <div className="flex flex-col items-center justify-center border-x border-slate-100 bg-slate-50/80">
                        <div className="text-[8px] font-black tracking-wider text-slate-500">스펙 비교</div>
                        <div className="mt-1 text-[11px] font-black">
                          <span className={dom === 'male' ? 'text-blue-600' : 'text-blue-400'}>{mRatio}</span>
                          <span className="text-slate-300">:</span>
                          <span className={dom === 'female' ? 'text-rose-500' : 'text-rose-300'}>{fRatio}</span>
                        </div>
                        <div className="mt-0.5 flex h-2 w-10 overflow-hidden rounded-full border border-slate-200">
                          <div className={dom === 'male' ? 'bg-blue-500' : 'bg-blue-300'} style={{ width: `${mRatio}%` }} />
                          <div className={dom === 'female' ? 'bg-rose-400' : 'bg-rose-300'} style={{ width: `${fRatio}%` }} />
                        </div>
                        <div className="mt-0.5 flex justify-between w-10 text-[6px] font-bold text-slate-400">
                          <span>♂</span><span>♀</span>
                        </div>
                      </div>
                      <div className={`p-3 text-center ${current.gender === 'F' ? 'bg-gradient-to-bl from-rose-50 to-rose-100/40' : 'bg-gradient-to-bl from-blue-50 to-blue-100/40'}`}>
                        <div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${current.gender === 'F' ? 'bg-rose-400' : 'bg-blue-500'}`}>
                          {current.gender === 'F' ? '♀' : '♂'}
                        </div>
                        <div className="mt-1 text-[11px] font-bold text-slate-700">{current.id}</div>
                        <div className={`text-2xl font-black ${scoreColor(current.matchScore)}`}>{current.matchScore}</div>
                        {current.rankingBadges?.[0] && <span className="text-[8px] font-bold text-violet-600">{current.rankingBadges[0]}</span>}
                      </div>
                    </div>
                    {/* 3 metrics */}
                    <div className="grid grid-cols-3 border-t border-violet-100">
                      {[['조건', current.scores.condition], ['궁합', current.scores.saju], ['가치관', current.scores.values]].map(([label, score]) => (
                        <div key={label} className={`border-r border-violet-100 last:border-r-0 p-2 text-center ${score >= 90 ? 'bg-emerald-50/40' : 'bg-white'}`}>
                          <div className="text-[9px] font-medium text-slate-400">{label}</div>
                          <div className={`text-lg font-black ${scoreColor(score)}`}>{score}</div>
                          <div className="mx-auto mt-0.5 h-1 w-10 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-1 rounded-full ${scoreBgCls(score)}`} style={{ width: `${score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* ── 형평성 분석 (Gap Analysis) ── */}
              {(() => {
                const myS = Math.round(selectedMyMember?.grade?.overallScore || 0);
                if (!myS) return null;
                const g = computeMatchGap(myS, current.matchScore);
                const GAP_CLR = {
                  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                  amber:   { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', bar: 'bg-amber-500' },
                  orange:  { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', bar: 'bg-orange-500' },
                  rose:    { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', bar: 'bg-rose-500' },
                };
                const c = GAP_CLR[g.color];
                const arrow = g.direction === '상향' ? '▲' : g.direction === '하향' ? '▼' : '━';
                return (
                  <div className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className={`text-sm font-bold ${c.text}`}>
                        {arrow} {g.label}
                        {g.absGap > 3 && <span className="ml-1 text-xs font-normal">({g.absGap}점 차)</span>}
                      </div>
                      <div className={`rounded-full border ${c.border} bg-white px-2.5 py-1 text-xs font-bold ${c.text}`}>
                        정산 {g.mySplit}:{g.theirSplit}
                      </div>
                    </div>
                    {/* split bar */}
                    <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full border border-slate-200 bg-white">
                      <div className="bg-violet-500 transition-all duration-500" style={{ width: `${g.mySplit}%` }} />
                      <div className="bg-slate-300 transition-all duration-500" style={{ width: `${g.theirSplit}%` }} />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                      <span>우리 {g.mySplit}%</span>
                      <span>상대 {g.theirSplit}%</span>
                    </div>
                    {g.absGap > 8 && (
                      <p className="mt-2 text-[11px] leading-4 text-slate-600">
                        점수 차이가 크므로 성사 시 정산 비율이 조정됩니다. 제안서에 자동 반영됩니다.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* ranking badges */}
              {current.rankingBadges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.rankingBadges.map((badge) => <GradeBadge key={badge} label={badge} />)}
                </div>
              )}

              {/* 스펙 비교 테이블 (FM Style) */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 border-b border-slate-200 text-center">
                  조건 비교
                </div>
                {/* header */}
                <div className="grid grid-cols-[1fr_50px_1fr] border-b border-slate-100 bg-slate-50/50 px-1 py-1.5 text-[10px] font-bold text-slate-400">
                  <div className={`text-right pr-2 ${selectedMyMember?.gender === 'M' ? 'text-blue-500' : 'text-rose-400'}`}>
                    {selectedMyMember?.name || '내 회원'}
                  </div>
                  <div className="text-center">항목</div>
                  <div className={`pl-2 ${current.gender === 'F' ? 'text-rose-400' : 'text-blue-500'}`}>
                    {current.id}
                  </div>
                </div>
                {/* rows */}
                {[
                  { label: '나이', my: selectedMyMember?.age ? `${selectedMyMember.age}세` : '-', their: current.ageRange },
                  { label: '키', my: selectedMyMember?.height ? `${selectedMyMember.height}cm` : '-', their: current.heightRange },
                  { label: '체형', my: selectedMyMember?.bodyType || '-', their: current.bodyType || '-' },
                  { label: '외모상', my: selectedMyMember?.faceType || '-', their: current.faceType || '-' },
                  { label: '직업', my: selectedMyMember?.job || '-', their: current.jobCategory },
                  { label: '소득', my: selectedMyMember?.income || '-', their: current.incomeRange },
                  { label: '자산', my: selectedMyMember?.assets || '-', their: current.assetsRange || '-' },
                  { label: '학력', my: selectedMyMember?.edu || '-', their: current.eduRange },
                  { label: '지역', my: selectedMyMember?.location || '-', their: current.location },
                ].map(({ label, my, their }, idx) => (
                  <div key={label} className={`grid grid-cols-[1fr_50px_1fr] text-xs ${idx % 2 === 0 ? 'bg-slate-50/60' : 'bg-white'}`}>
                    <div className={`truncate px-3 py-2 text-right font-medium ${selectedMyMember?.gender === 'M' ? 'text-blue-700' : 'text-rose-600'}`}>
                      {my}
                    </div>
                    <div className="px-1 py-2 text-center text-[10px] font-bold text-slate-400">{label}</div>
                    <div className={`truncate px-3 py-2 font-medium ${current.gender === 'F' ? 'text-rose-600' : 'text-blue-700'}`}>
                      {their}
                    </div>
                  </div>
                ))}
                {/* tags */}
                <div className="border-t border-slate-100 px-3 py-2.5 flex flex-wrap gap-1.5">
                  {(current.tags || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">{tag}</span>
                  ))}
                </div>
              </div>

              {/* my member saju */}
              {selectedMyMember?.saju?.dayMaster && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-indigo-700">{selectedMyMember.name} 사주</div>
                    <button
                      onClick={() => setDetailTab('compat')}
                      className="flex items-center gap-1 rounded-lg bg-violet-100 px-2 py-1 text-[10px] font-bold text-violet-700 hover:bg-violet-200"
                    >
                      <Sparkles size={11} /> HANI 사주 궁합
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="rounded-full border border-indigo-200 bg-white px-2 py-0.5 font-bold text-indigo-800">
                      {selectedMyMember.saju.dayMaster} ({ELEMENT_HANJA[STEM_ELEMENT[selectedMyMember.saju.dayMaster]] || ''})
                    </span>
                    {selectedMyMember.saju.strength && (
                      <span className={`rounded-full px-2 py-0.5 font-bold ${selectedMyMember.saju.strength.includes('신강') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedMyMember.saju.strengthLabel || selectedMyMember.saju.strength}
                      </span>
                    )}
                    {selectedMyMember.saju.yongshin?.map((el) => (
                      <span key={el} className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600">용신 {ELEMENT_HANJA[el]}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* saju & chemistry */}
              <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <div className="text-sm font-bold text-violet-900">후보 사주 성향 & 궁합</div>
                <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 p-3">
                  <div className="text-xs font-bold text-violet-700">후보 성향 요약</div>
                  <p className="mt-2 text-xs leading-5 text-violet-900">{current.sajuProfile}</p>
                </div>
                <div className="mt-2 rounded-xl border border-violet-100 bg-white/70 p-3">
                  <div className="text-xs font-bold text-violet-700">{selectedMyMember?.name || '회원'}과(와)의 궁합</div>
                  <p className="mt-2 text-xs leading-5 text-violet-900">{current.chemistryNote}</p>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-bold text-violet-700">주의 포인트</div>
                  <ul className="mt-1.5 space-y-1">
                    {(current.risks || []).map((r) => (<li key={r} className="text-xs text-violet-800 leading-5">• {r}</li>))}
                  </ul>
                </div>
              </div>

              {/* agency metrics */}
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-bold text-slate-800">업체 협업 지표</div>
                <div className="mt-3 space-y-2.5 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" /> 최근 활동</span>
                    <b className={parseActivityMinutes(current.recentActivity) <= 60 ? 'text-emerald-600' : parseActivityMinutes(current.recentActivity) <= 360 ? 'text-slate-700' : 'text-slate-400'}>
                      {current.recentActivity}
                    </b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><TrendingUp size={13} className="text-slate-400" /> 응답률</span>
                    <b className={parseFloat(current.responseRate) >= 90 ? 'text-emerald-600' : 'text-slate-700'}>{current.responseRate}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Shield size={13} className="text-slate-400" /> 신뢰 점수</span>
                    <b className={current.trustScore >= 4.5 ? 'text-emerald-600' : 'text-slate-700'}>{current.trustScore} / 5.0</b>
                  </div>
                </div>
              </div>

              {/* message thread (collapsible) */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setMsgThreadOpen(!msgThreadOpen)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} /> 업체 메시지
                    {messages.length > 0 && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{messages.length}</span>
                    )}
                  </div>
                  {msgThreadOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {msgThreadOpen && (
                  <div className="border-t border-slate-200 px-4 py-3">
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {messages.map((msg) => (
                        <div key={msg.id} className={`rounded-xl p-2.5 text-xs ${msg.role === 'me' ? 'ml-6 bg-violet-50 text-violet-900' : 'mr-6 border border-slate-200 bg-white text-slate-700'}`}>
                          <div className="flex items-center justify-between font-bold text-[10px]">
                            <span>{msg.sender}</span>
                            <span className="text-slate-400">{msg.date ? `${msg.date} ` : ''}{msg.time}</span>
                          </div>
                          <p className="mt-1 leading-5">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                        placeholder="메시지 입력..."
                        value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} disabled={!msgInput.trim()} className="rounded-lg bg-slate-800 px-3 py-2 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed">
                        <Send size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            )}
            </div>

            {/* sticky actions */}
            <div className="shrink-0 border-t border-slate-100 p-4">
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={() => toggleCompare(current)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${compareList.find((x) => x.id === current.id) ? 'bg-slate-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>
                  {compareList.find((x) => x.id === current.id) ? '비교함 해제' : '비교 추가'}
                </button>
                <button onClick={() => openProposal(current)}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700">
                  소개 제안
                </button>
              </div>
            </div>
          </>
        ) : null}
      </aside>
      </div>
      )}

      {/* saju compat modal */}
      {sajuCompatOpen && (
        <SajuCompatModal
          memberA={selectedMyMember} memberB={sajuCompatB}
          members={internalMembers}
          onClose={() => setSajuCompatOpen(false)}
          onChangeMemberB={setSajuCompatB}
        />
      )}
    </div>
  );
}
