import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  BarChart3,
  Bell,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Crown,
  FileSearch,
  Filter,
  Gem,
  Info,
  Lock,
  MessageSquare,
  Medal,
  Network,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';

const initialMembers = [
  {
    id: 'M001',
    name: '김태형',
    age: 34,
    gender: 'M',
    job: '삼성전자 무선사업부 책임',
    income: '1.2억',
    edu: '연세대 학사',
    height: 178,
    weight: 74,
    bodyType: '슬림탄탄',
    assets: '금융 3.8억 / 부동산 8.5억',
    family: '중상',
    appearanceNote: '호감형 / 단정한 인상',
    location: '서울 송파구',
    verifyLevel: 'Lv4',
    verifyItems: ['본인', '재직', '소득', '학력', '가족'],
    saju: {
      profile: '책임감이 강하고 안정지향적. 초반 호감 형성은 느리나 장기적인 신뢰 구축에 유리한 편.',
    },
    grade: {
      overallScore: 93.8,
      categories: {
        overall: { score: 93.8, percentile: '상위 1%', badge: 'TOP 1%' },
        wealth: { score: 95.4, percentile: '상위 0.1%', badge: 'TOP 0.1%' },
        appearance: { score: 82.1, percentile: '상위 10%', badge: 'TOP 10%' },
        family: { score: 87.5, percentile: '상위 5%', badge: 'TOP 5%' },
        career: { score: 91.2, percentile: '상위 1%', badge: 'TOP 1%' },
      },
      badges: ['TOP 0.1% 자산', 'TOP 1% 종합', 'TOP 1% 직업', 'TOP 5% 집안'],
    },
    values: ['안정지향', '비흡연', '자녀희망'],
    status: '소개 가능',
    manager: '이팀장',
    lastContact: '3일 전',
    nextAction: '오늘 16:00',
    profileCompletion: 92,
    outboundProposals: 4,
  },
  {
    id: 'M002',
    name: '박지연',
    age: 31,
    gender: 'F',
    job: '외국계 제약사 마케팅',
    income: '8,500만',
    edu: '이화여대 석사',
    height: 165,
    weight: 52,
    bodyType: '슬림',
    assets: '금융 2.2억 / 부동산 3.1억',
    family: '중상',
    appearanceNote: '세련형 / 관리 우수',
    location: '서울 강남구',
    verifyLevel: 'VIP',
    verifyItems: ['대면검증', '본인', '재직', '소득', '학력', '가족', '자산'],
    saju: {
      profile: '감정 표현이 솔직하고 에너지가 좋음. 관계에서 활력과 템포가 중요한 타입.',
    },
    grade: {
      overallScore: 89.6,
      categories: {
        overall: { score: 89.6, percentile: '상위 5%', badge: 'TOP 5%' },
        wealth: { score: 84.4, percentile: '상위 10%', badge: 'TOP 10%' },
        appearance: { score: 96.2, percentile: '상위 0.1%', badge: 'TOP 0.1%' },
        family: { score: 86.8, percentile: '상위 5%', badge: 'TOP 5%' },
        career: { score: 88.9, percentile: '상위 5%', badge: 'TOP 5%' },
      },
      badges: ['TOP 0.1% 외모', 'TOP 5% 종합', 'TOP 5% 집안'],
    },
    values: ['활동적', '골프', '맞벌이 선호'],
    status: '소개 진행중',
    manager: '최수석',
    lastContact: '오늘',
    nextAction: '내일 11:00',
    profileCompletion: 98,
    outboundProposals: 7,
  },
  {
    id: 'M003',
    name: '정소민',
    age: 33,
    gender: 'F',
    job: '대기업 HR',
    income: '9,000만',
    edu: '서강대 학사',
    height: 167,
    weight: 55,
    bodyType: '균형형',
    assets: '금융 1.4억 / 부동산 없음',
    family: '중',
    appearanceNote: '단아형 / 안정감 있는 이미지',
    location: '서울 용산구',
    verifyLevel: 'Lv3',
    verifyItems: ['본인', '재직', '학력'],
    saju: {
      profile: '기준이 뚜렷하고 생활 질서가 중요함. 안정적이고 감정 기복이 크지 않은 관계를 선호.',
    },
    grade: {
      overallScore: 81.9,
      categories: {
        overall: { score: 81.9, percentile: '상위 10%', badge: 'TOP 10%' },
        wealth: { score: 71.2, percentile: '상위 20%', badge: null },
        appearance: { score: 87.1, percentile: '상위 5%', badge: 'TOP 5%' },
        family: { score: 78.4, percentile: '상위 10%', badge: 'TOP 10%' },
        career: { score: 83.7, percentile: '상위 10%', badge: 'TOP 10%' },
      },
      badges: ['TOP 5% 외모', 'TOP 10% 종합'],
    },
    values: ['실속형', '비흡연', '종교없음'],
    status: '보류',
    manager: '이팀장',
    lastContact: '7일 전',
    nextAction: '재컨택 필요',
    profileCompletion: 81,
    outboundProposals: 2,
  },
];

const defaultScoreRuleWeights = [
  { key: 'wealth', label: '자산', weight: 30, desc: '금융자산, 부동산, 거주 안정성 반영' },
  { key: 'career', label: '직업', weight: 25, desc: '직군 선호도, 기업/전문직 위상, 안정성 반영' },
  { key: 'appearance', label: '외모', weight: 20, desc: '키, 체형, 인상 메모, 자기관리 가산점 반영' },
  { key: 'family', label: '집안', weight: 15, desc: '가족 배경, 부모 노후, 형제 리스크 등 반영' },
  { key: 'bonus', label: '기타 가산점', weight: 10, desc: '학력, 거주권역, 비흡연, 종교 적합 등 반영' },
];

const defaultBadgeThresholds = [
  { label: 'TOP 0.1%', min: 95 },
  { label: 'TOP 1%', min: 90 },
  { label: 'TOP 5%', min: 85 },
  { label: 'TOP 10%', min: 80 },
];

const scorePreview = {
  overallScore: 91.4,
  categories: {
    overall: { score: 91.4, percentile: '상위 1%', badge: 'TOP 1%' },
    wealth: { score: 88.2, percentile: '상위 5%', badge: 'TOP 5%' },
    appearance: { score: 93.7, percentile: '상위 1%', badge: 'TOP 1%' },
    family: { score: 79.8, percentile: '상위 10%', badge: 'TOP 10%' },
    career: { score: 90.6, percentile: '상위 1%', badge: 'TOP 1%' },
  },
  badges: ['TOP 1% 종합', 'TOP 1% 외모', 'TOP 1% 직업', 'TOP 5% 자산'],
};

const networkMembers = [
  {
    id: 'N-8421',
    agency: '노블레스 에스',
    ageRange: '30대 초반',
    gender: 'F',
    jobCategory: '전문직 (의료)',
    incomeRange: '1.5억 이상',
    eduRange: '명문대/의대',
    heightRange: '160~165cm',
    location: '서울 서초구',
    verifyLevel: 'VIP',
    matchScore: 94,
    rankingBadges: ['TOP 0.1% 자산', 'TOP 1% 종합'],
    scores: { condition: 96, values: 91, saju: 94, possibility: 82 },
    recentActivity: '2시간 전',
    responseRate: '91%',
    trustScore: 4.8,
    sajuProfile: '차분하고 자기관리가 좋으며 관계를 신중히 진전시키는 타입.',
    chemistryNote: 'M001과는 결혼관과 자녀 계획의 흐름이 잘 맞고, 한쪽이 속도를 조절해주면 안정적 호흡이 가능함.',
    reason: ['자녀 계획 일치', '생활 리듬 안정형', '가족관 유사'],
    risks: ['종교 여부 추가 확인 필요'],
    tags: ['#딩크선호', '#자산가집안', '#비흡연'],
  },
  {
    id: 'N-9932',
    agency: '청담 페어링',
    ageRange: '30대 중반',
    gender: 'M',
    jobCategory: '금융/투자업',
    incomeRange: '2억 이상',
    eduRange: '해외대 학사',
    heightRange: '180cm 이상',
    location: '서울 강남구',
    verifyLevel: 'Lv3',
    matchScore: 78,
    rankingBadges: ['TOP 5% 자산'],
    scores: { condition: 84, values: 72, saju: 78, possibility: 76 },
    recentActivity: '어제',
    responseRate: '74%',
    trustScore: 4.2,
    sajuProfile: '추진력이 좋고 목표지향적이며 관계에서도 주도권을 잡는 편.',
    chemistryNote: '선택 회원과 에너지 레벨은 비슷하지만 갈등 조정 방식 차이로 초반 조율이 필요함.',
    reason: ['소득/직군 선호 충족', '활동적 취미 일치'],
    risks: ['장남 이슈 설명 필요', '갈등 조정 스타일 차이'],
    tags: ['#기독교', '#골프', '#장남'],
  },
  {
    id: 'N-7710',
    agency: '더 브릿지',
    ageRange: '20대 후반',
    gender: 'F',
    jobCategory: '교직/공무원',
    incomeRange: '5,000만~7,000만',
    eduRange: '수도권 4년제',
    heightRange: '165~170cm',
    location: '경기 분당',
    verifyLevel: 'Lv4',
    matchScore: 88,
    rankingBadges: ['TOP 5% 외모', 'TOP 10% 종합'],
    scores: { condition: 83, values: 90, saju: 88, possibility: 87 },
    recentActivity: '오늘',
    responseRate: '89%',
    trustScore: 4.6,
    sajuProfile: '가정적이고 생활 감각이 안정적이며 일상 공유형 관계에 강점이 있음.',
    chemistryNote: '선택 회원과는 생활 루틴과 소비 성향이 잘 맞아 장기 교제형 궁합으로 해석됨.',
    reason: ['가정관 유사', '소비 성향 조화', '응답률 높음'],
    risks: ['지역 거리감 일부 존재'],
    tags: ['#가정적', '#요리', '#부모님노후완료'],
  },
  {
    id: 'N-6204',
    agency: '압구정 셀렉트',
    ageRange: '30대 초반',
    gender: 'F',
    jobCategory: '변호사/법조',
    incomeRange: '1억 이상',
    eduRange: 'SKY 법대/로스쿨',
    heightRange: '163~168cm',
    location: '서울 성동구',
    verifyLevel: 'VIP',
    matchScore: 90,
    rankingBadges: ['TOP 1% 직업', 'TOP 5% 종합'],
    scores: { condition: 92, values: 87, saju: 89, possibility: 90 },
    recentActivity: '30분 전',
    responseRate: '95%',
    trustScore: 4.9,
    sajuProfile: '현실 판단이 빠르고 커리어 지속 의지가 강하며 균형감 있는 관계를 선호.',
    chemistryNote: '선택 회원과는 서로의 일과 생활 리듬을 존중하는 구조라 맞벌이 안정형 궁합으로 해석됨.',
    reason: ['맞벌이 선호 일치', '검증 충실', '업체 응답 속도 우수'],
    risks: ['주거 지역 선호 조율 필요'],
    tags: ['#맞벌이', '#비흡연', '#전문직'],
  },
];

const inboxItems = [
  { id: 'IN-204', agency: '청담 페어링', memberId: 'M002', candidate: 'N-9912', score: 91, status: '검토중', lastAction: '1시간 전', owner: '최수석' },
  { id: 'IN-188', agency: '더 브릿지', memberId: 'M001', candidate: 'N-7710', score: 88, status: '추가정보 요청', lastAction: '오늘', owner: '이팀장' },
  { id: 'IN-173', agency: '노블레스 에스', memberId: 'M003', candidate: 'N-8401', score: 82, status: '응답대기', lastAction: '어제', owner: '이팀장' },
];

const outboxItems = [
  { id: 'OUT-311', agency: '노블레스 에스', memberId: 'M001', candidate: 'N-8421', score: 94, status: '열람함', lastAction: '30분 전', owner: '이팀장' },
  { id: 'OUT-297', agency: '압구정 셀렉트', memberId: 'M002', candidate: 'N-6204', score: 90, status: '회원 확인중', lastAction: '오늘', owner: '최수석' },
  { id: 'OUT-276', agency: '더 브릿지', memberId: 'M003', candidate: 'N-7710', score: 88, status: '수락', lastAction: '어제', owner: '이팀장' },
];

const settlementItems = [
  { id: 'SET-01', partner: '더 브릿지', pair: 'M003 ↔ N-7710', stage: '소개 완료', amount: '250만', split: '50:50', due: '3월 20일', status: '정산 예정' },
  { id: 'SET-02', partner: '압구정 셀렉트', pair: 'M002 ↔ N-6204', stage: '교제 진입', amount: '500만', split: '60:40', due: '3월 25일', status: '검수중' },
  { id: 'SET-03', partner: '노블레스 에스', pair: 'M001 ↔ N-8421', stage: '성사 후보', amount: '700만', split: '50:50', due: '4월 2일', status: '대기' },
];

const disputeItems = [
  { id: 'DSP-14', partner: '청담 페어링', issue: '우회 접촉 의심', level: '주의', updated: '오늘', owner: '운영관리자' },
  { id: 'DSP-11', partner: '강남 프라이빗', issue: '정산 기준 해석 불일치', level: '중재중', updated: '어제', owner: '대표' },
  { id: 'DSP-07', partner: '노블레스 라인', issue: '허위 소득 정보 등록', level: '증빙검토', updated: '3일 전', owner: '인증팀' },
];

const verifyQueue = [
  { id: 'VER-51', memberId: 'M002', type: '자산 인증', owner: '인증팀', due: '오늘', status: '원본 검토중' },
  { id: 'VER-47', memberId: 'M001', type: '가족 인증', owner: '인증팀', due: '내일', status: '서류보완 요청' },
  { id: 'VER-39', memberId: 'M003', type: '재직 인증', owner: '인증팀', due: '3월 16일', status: '대기' },
];

const proposalMessages = [
  { id: 'MSG-1', sender: '노블레스 에스', role: 'partner', time: '10:24', text: 'M001 관련해서 종교 여부만 추가 확인 부탁드립니다.' },
  { id: 'MSG-2', sender: '이팀장', role: 'me', time: '10:31', text: '현재 무교로 확인되어 있고 가족관은 안정형입니다. 추가 브리핑 메모 전달 가능합니다.' },
  { id: 'MSG-3', sender: '노블레스 에스', role: 'partner', time: '10:37', text: '좋습니다. 회원 의사 최종 확인 후 오늘 중 회신드리겠습니다.' },
];

const compareColumns = [
  { key: 'id', label: '후보' },
  { key: 'agency', label: '업체' },
  { key: 'matchScore', label: '총합' },
  { key: 'condition', label: '조건' },
  { key: 'values', label: '가치관' },
  { key: 'saju', label: '궁합' },
  { key: 'possibility', label: '성사' },
  { key: 'note', label: '궁합 코멘트' },
];

const stats = [
  { label: '관리 회원', value: '142명', tone: 'slate' },
  { label: '진행중 매칭', value: '18건', tone: 'indigo' },
  { label: '이번 달 성사', value: '5건', tone: 'emerald' },
  { label: '정산 예정액', value: '1,250만', tone: 'amber' },
  { label: 'TOP 1% 회원', value: '14명', tone: 'indigo' },
  { label: 'TOP 0.1% 배지', value: '3명', tone: 'rose' },
];

const tasks = [
  { title: 'M003 재컨택 필요', meta: '7일 미응답 · 이팀장', tone: 'amber' },
  { title: '노블레스 에스 제안 검토', meta: '받은 제안 3건', tone: 'indigo' },
  { title: 'VIP 인증 만료 2건', meta: '7일 내 재검증 필요', tone: 'rose' },
];

const timelineItems = [
  { time: '09:10', title: 'OUT-311 열람됨', desc: '노블레스 에스가 M001 제안을 열람했습니다.' },
  { time: '10:24', title: '추가정보 요청 수신', desc: '종교/가족관 관련 확인 요청 도착.' },
  { time: '11:40', title: 'VER-51 검토 업데이트', desc: 'M002 자산 인증 원본 검토 진행중.' },
  { time: '14:00', title: '정산 검수 예정', desc: 'SET-02 분배 비율 확인 미팅.' },
];

const reputationMetrics = [
  { label: '우리 업체 응답 속도', value: '평균 42분', sub: '상위 12%' },
  { label: '제안 수락률', value: '68%', sub: '지난달 +9%' },
  { label: '협업 신뢰 점수', value: '4.7 / 5', sub: '분쟁 건수 낮음' },
  { label: '회원 소개 전환율', value: '31%', sub: '업계 평균 상회' },
];

const kpiSeries = [
  { label: '1주차', match: 10, intro: 6, close: 2 },
  { label: '2주차', match: 13, intro: 8, close: 3 },
  { label: '3주차', match: 11, intro: 7, close: 4 },
  { label: '4주차', match: 18, intro: 10, close: 5 },
];

const workflowSteps = ['검토', '추가정보', '회원확인', '소개확정'];

const toneClasses = {
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
};

const statusToneMap = {
  검토중: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  '추가정보 요청': 'bg-amber-100 text-amber-800 border-amber-200',
  응답대기: 'bg-slate-100 text-slate-700 border-slate-200',
  열람함: 'bg-blue-100 text-blue-800 border-blue-200',
  '회원 확인중': 'bg-violet-100 text-violet-800 border-violet-200',
  수락: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  '정산 예정': 'bg-amber-100 text-amber-800 border-amber-200',
  검수중: 'bg-blue-100 text-blue-800 border-blue-200',
  대기: 'bg-slate-100 text-slate-700 border-slate-200',
  주의: 'bg-rose-100 text-rose-800 border-rose-200',
  중재중: 'bg-amber-100 text-amber-800 border-amber-200',
  증빙검토: 'bg-blue-100 text-blue-800 border-blue-200',
  '원본 검토중': 'bg-blue-100 text-blue-800 border-blue-200',
  '서류보완 요청': 'bg-amber-100 text-amber-800 border-amber-200',
};

function Badge({ level }) {
  const styles = {
    VIP: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border border-amber-300',
    Lv4: 'bg-blue-100 text-blue-800 border border-blue-200',
    Lv3: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Lv2: 'bg-slate-100 text-slate-700 border border-slate-200',
    Lv1: 'bg-slate-50 text-slate-500 border border-slate-100',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold ${styles[level]}`}>
      {level === 'VIP' && <Star size={11} fill="currentColor" />}
      {level} 인증
    </span>
  );
}

function GradeBadge({ label }) {
  if (!label) return null;
  const map = {
    'TOP 0.1%': { cls: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-amber-300', icon: Crown },
    'TOP 1%': { cls: 'bg-violet-100 text-violet-800 border-violet-200', icon: Trophy },
    'TOP 5%': { cls: 'bg-blue-100 text-blue-800 border-blue-200', icon: Medal },
    'TOP 10%': { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Sparkles },
  };
  const key = ['TOP 0.1%', 'TOP 1%', 'TOP 5%', 'TOP 10%'].find((k) => label.includes(k)) || 'TOP 10%';
  const { cls, icon: Icon } = map[key];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${cls}`}>
      <Icon size={12} />
      {label}
    </span>
  );
}

function GradeScoreCard({ title, data, active, onClick, showHint = false }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${active ? 'border-violet-300 bg-violet-50 ring-2 ring-violet-100' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</div>
        {showHint ? <Info size={14} className="text-slate-400" /> : null}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="text-2xl font-bold text-slate-900">{data.score}</div>
        <GradeBadge label={data.badge} />
      </div>
      <div className="mt-2 text-sm font-medium text-violet-700">{data.percentile}</div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-violet-500" style={{ width: `${Math.min(data.score, 100)}%` }} />
      </div>
    </button>
  );
}

function InfoTooltip({ title, lines }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <Info size={16} /> {title}
      </div>
      <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
        {lines.map((line) => (
          <div key={line}>• {line}</div>
        ))}
      </div>
    </div>
  );
}

function SidebarButton({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between px-5 py-3 text-sm transition ${
        active
          ? 'border-r-4 border-violet-500 bg-slate-800 font-medium text-white'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} />
        {label}
      </div>
      {badge ? <span className="rounded-full bg-violet-500 px-2 py-0.5 text-xs text-white">{badge}</span> : null}
    </button>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function StatusChip({ label }) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusToneMap[label] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{label}</span>;
}

function TableList({ columns, rows, onRowClick, selectedRowId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500" style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}>
        {columns.map((col) => <div key={col.key}>{col.label}</div>)}
      </div>
      <div>
        {rows.map((row, idx) => (
          <button
            key={row.id || idx}
            onClick={() => onRowClick?.(row)}
            className={`grid w-full items-center border-b border-slate-100 px-5 py-4 text-left text-sm transition hover:bg-slate-50 ${selectedRowId === row.id ? 'bg-violet-50/60' : 'bg-white'}`}
            style={{ gridTemplateColumns: columns.map((c) => c.width).join(' ') }}
          >
            {columns.map((col) => (
              <div key={col.key} className="text-slate-700">
                {col.key === 'status' || col.key === 'level' ? <StatusChip label={row[col.key]} /> : row[col.key]}
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function WorkflowStepper({ status }) {
  const stepMap = {
    검토중: 0,
    열람함: 0,
    '추가정보 요청': 1,
    응답대기: 1,
    '회원 확인중': 2,
    수락: 3,
    '소개 확정': 3,
  };
  const current = stepMap[status] ?? 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><CalendarRange size={16} /> 진행 단계</div>
      <div className="flex items-center gap-2">
        {workflowSteps.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${idx <= current ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{idx + 1}</div>
              <div className={`text-[11px] font-medium ${idx <= current ? 'text-violet-700' : 'text-slate-400'}`}>{step}</div>
            </div>
            {idx < workflowSteps.length - 1 ? <div className={`h-1 flex-1 rounded-full ${idx < current ? 'bg-violet-500' : 'bg-slate-200'}`} /> : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ProposalDetailPanel({ title, item, actions }) {
  if (!item) {
    return <div className="flex h-full items-center justify-center text-sm text-slate-400">항목을 선택하세요.</div>;
  }
  return (
    <aside className="border-l border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">상세 정보</div>
          <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{item.id}</p>
        </div>
        <StatusChip label={item.status || item.level} />
      </div>
      {'status' in item ? <div className="mt-5"><WorkflowStepper status={item.status} /></div> : null}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {'agency' in item ? <DetailField label="업체" value={item.agency} /> : <DetailField label="파트너" value={item.partner} />}
        <DetailField label="담당" value={item.owner || '-'} />
        {'memberId' in item ? <DetailField label="회원" value={item.memberId} /> : null}
        {'candidate' in item ? <DetailField label="상대 후보" value={item.candidate} /> : null}
        {'score' in item ? <DetailField label="매칭 점수" value={`${item.score}점`} /> : null}
        {'lastAction' in item ? <DetailField label="최근 액션" value={item.lastAction} /> : null}
        {'due' in item ? <DetailField label="예정일" value={item.due} /> : null}
        {'amount' in item ? <DetailField label="정산 금액" value={item.amount} /> : null}
      </div>
      {'issue' in item ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <div className="text-sm font-bold text-rose-900">이슈 내용</div>
          <p className="mt-2 text-sm leading-6 text-rose-900">{item.issue}</p>
        </div>
      ) : null}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} /> 메시지 스레드</div>
        <div className="mt-4 space-y-3">
          {proposalMessages.map((msg) => (
            <div key={msg.id} className={`rounded-2xl p-3 text-sm ${msg.role === 'me' ? 'ml-8 bg-violet-50 text-violet-900' : 'mr-8 border border-slate-200 bg-white text-slate-700'}`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{msg.sender}</span>
                <span className="text-slate-400">{msg.time}</span>
              </div>
              <p className="mt-2 leading-6">{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" placeholder="상대 업체에 메시지 보내기" />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Send size={16} /></button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        {actions}
      </div>
    </aside>
  );
}

function MiniBarChart() {
  const max = Math.max(...kpiSeries.flatMap((d) => [d.match, d.intro, d.close]));
  return (
    <div className="space-y-4">
      {kpiSeries.map((item) => (
        <div key={item.label} className="grid grid-cols-[60px_1fr] items-center gap-4">
          <div className="text-xs font-medium text-slate-500">{item.label}</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '탐색', value: item.match, tone: 'bg-slate-700' },
              { label: '소개', value: item.intro, tone: 'bg-violet-500' },
              { label: '성사', value: item.close, tone: 'bg-emerald-500' },
            ].map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500"><span>{bar.label}</span><span>{bar.value}</span></div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${bar.tone}`} style={{ width: `${(bar.value / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function buildPercentile(score, thresholds) {
  const found = thresholds.find((item) => score >= item.min);
  if (found) {
    const map = {
      'TOP 0.1%': '상위 0.1%',
      'TOP 1%': '상위 1%',
      'TOP 5%': '상위 5%',
      'TOP 10%': '상위 10%',
    };
    return { percentile: map[found.label], badge: found.label };
  }
  return { percentile: '상위 20%', badge: null };
}

function scoreMember(form, weights, thresholds) {
  const weightMap = Object.fromEntries(weights.map((item) => [item.key, item.weight]));
  const wealth = Math.min(98, 55 + form.financial / 900 + form.realEstate * 12 + (form.income > 10000 ? 6 : 0));
  const appearance = Math.min(97, 62 + (form.height > 165 ? 8 : 4) + (form.bodyType.includes('슬림') ? 10 : 6) + 12);
  const career = Math.min(96, 60 + (form.job.includes('대기업') ? 18 : 10) + (form.income > 10000 ? 10 : 6));
  const family = Math.min(90, form.family.includes('안정') ? 80 : 72);
  const bonus = 82;
  const overall = Number(((wealth * weightMap.wealth + career * weightMap.career + appearance * weightMap.appearance + family * weightMap.family + bonus * weightMap.bonus) / 100).toFixed(1));
  return {
    overallScore: overall,
    categories: {
      overall: { score: overall, ...buildPercentile(overall, thresholds) },
      wealth: { score: Number(wealth.toFixed(1)), ...buildPercentile(wealth, thresholds) },
      appearance: { score: Number(appearance.toFixed(1)), ...buildPercentile(appearance, thresholds) },
      family: { score: Number(family.toFixed(1)), ...buildPercentile(family, thresholds) },
      career: { score: Number(career.toFixed(1)), ...buildPercentile(career, thresholds) },
    },
  };
}

function MemberRegistrationModal({ open, onClose, onSave, scoreRuleWeights, badgeThresholds }) {
  const [activePreviewTab, setActivePreviewTab] = useState('overall');
  const [form, setForm] = useState({
    name: '이서윤',
    birthYear: '1993',
    height: 167,
    weight: 52,
    bodyType: '슬림탄탄',
    job: '국내 대기업 브랜드전략',
    income: 11000,
    financial: 27000,
    realEstate: 1,
    family: '부모 노후 안정',
    appearance: '세련형 / 자기관리 우수',
  });

  if (!open) return null;

  const dynamicPreview = scoreMember(form, scoreRuleWeights, badgeThresholds);
  const previewTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const preview = dynamicPreview.categories[activePreviewTab];
  const labels = { overall: '종합', wealth: '자산', appearance: '외모', family: '집안', career: '직업' };
  const previewBadges = Object.entries(dynamicPreview.categories)
    .map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">신규 회원 등록</h3>
            <p className="mt-1 text-sm text-slate-500">입력값을 바꾸면 우측 자동 점수, 퍼센타일, 배지가 실시간으로 갱신됩니다.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-0">
          <div className="space-y-6 p-6">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['이름', 'name', 'text'],
                ['출생연도', 'birthYear', 'text'],
                ['키(cm)', 'height', 'number'],
                ['몸무게(kg)', 'weight', 'number'],
                ['체형', 'bodyType', 'text'],
                ['직업', 'job', 'text'],
                ['연봉(만원)', 'income', 'number'],
                ['금융자산(만원)', 'financial', 'number'],
              ].map(([label, key, type]) => (
                <label key={key} className="rounded-xl border border-slate-200 p-3">
                  <div className="text-xs text-slate-400">{label}</div>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                  />
                </label>
              ))}
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">부동산 보유 수</div>
                <input
                  type="number"
                  value={form.realEstate}
                  onChange={(e) => setForm((prev) => ({ ...prev, realEstate: Number(e.target.value) }))}
                  className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                />
              </label>
              <label className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">집안/가족 메모</div>
                <input
                  type="text"
                  value={form.family}
                  onChange={(e) => setForm((prev) => ({ ...prev, family: e.target.value }))}
                  className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                />
              </label>
              <label className="col-span-2 rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">외모/인상 메모</div>
                <input
                  type="text"
                  value={form.appearance}
                  onChange={(e) => setForm((prev) => ({ ...prev, appearance: e.target.value }))}
                  className="mt-2 w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-800 outline-none"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="text-sm font-bold text-blue-900">점수 산정 가중치</div>
              <div className="mt-3 space-y-2">
                {scoreRuleWeights.map((rule) => (
                  <div key={rule.key} className="rounded-xl border border-blue-100 bg-white px-3 py-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                      <span>{rule.label}</span>
                      <span className="text-blue-700">{rule.weight}%</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border-l border-slate-200 bg-slate-50 p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm font-bold text-amber-900">실시간 자동 산정 결과</div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className="text-xs text-amber-700">종합 점수</div>
                  <div className="text-3xl font-bold text-amber-900">{dynamicPreview.overallScore}</div>
                </div>
                <GradeBadge label={dynamicPreview.categories.overall.badge} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {previewBadges.map((badge) => <GradeBadge key={badge} label={badge} />)}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
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
                  <GradeScoreCard
                    key={tab.key}
                    title={tab.label}
                    data={dynamicPreview.categories[tab.key]}
                    active={activePreviewTab === tab.key}
                    onClick={() => setActivePreviewTab(tab.key)}
                    showHint
                  />
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-violet-900">{previewTabs.find((tab) => tab.key === activePreviewTab)?.label} 상세</div>
                    <div className="mt-1 text-xs text-violet-700">저장 시 회원 프로필/네트워크 카드에 자동 반영됩니다.</div>
                  </div>
                  <GradeBadge label={preview.badge} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-white/80 p-3">
                    <div className="text-xs text-slate-400">점수</div>
                    <div className="mt-1 text-xl font-bold text-slate-900">{preview.score}</div>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <div className="text-xs text-slate-400">퍼센타일</div>
                    <div className="mt-1 text-xl font-bold text-violet-700">{preview.percentile}</div>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3">
                    <div className="text-xs text-slate-400">배지</div>
                    <div className="mt-1 text-sm font-bold text-slate-900">{preview.badge || '없음'}</div>
                  </div>
                </div>
              </div>
            </div>

            <InfoTooltip
              title="산정 로직 가이드"
              lines={[
                '저장 시 종합/자산/외모/집안/직업 점수와 퍼센타일이 자동 생성됩니다.',
                '배지는 카테고리별 점수가 기준 이상일 때 즉시 부여됩니다.',
                '관리자는 대시보드 설정 패널에서 가중치와 배지 임계값을 수정할 수 있습니다.',
              ]}
            />

            <div className="mt-4 flex gap-3">
              <button onClick={onClose} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">취소</button>
              <button
                onClick={() => {
                  const newMember = {
                    id: `M${String(Date.now()).slice(-3)}`,
                    name: form.name,
                    age: 2026 - Number(form.birthYear),
                    gender: 'F',
                    job: form.job,
                    income: `${(form.income / 10000).toFixed(1)}억`,
                    edu: '미입력',
                    height: form.height,
                    weight: form.weight,
                    bodyType: form.bodyType,
                    assets: `금융 ${(form.financial / 10000).toFixed(1)}억 / 부동산 ${form.realEstate}건`,
                    family: form.family,
                    appearanceNote: form.appearance,
                    location: '서울',
                    verifyLevel: 'Lv1',
                    verifyItems: ['본인'],
                    saju: { profile: '등록 후 성향 요약 생성 예정' },
                    grade: {
                      overallScore: dynamicPreview.overallScore,
                      categories: dynamicPreview.categories,
                      badges: Object.entries(dynamicPreview.categories)
                        .map(([key, value]) => (value.badge ? `${value.badge} ${labels[key]}` : null))
                        .filter(Boolean),
                    },
                    values: ['신규등록'],
                    status: '신규 상담',
                    manager: '이팀장',
                    lastContact: '방금',
                    nextAction: '초기 상담 필요',
                    profileCompletion: 64,
                    outboundProposals: 0,
                  };
                  onSave(newMember);
                  onClose();
                }}
                className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700"
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

function MemberRegistrationPanel({ onOpenModal, scoreRuleWeights }) {
  const [activePreviewTab, setActivePreviewTab] = useState('overall');
  const previewTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const preview = scorePreview.categories[activePreviewTab];

  return (
    <SectionCard
      title="회원 등록 & 자동 점수 산정"
      subtitle="회원 등록 직후 입력값을 기반으로 자동 점수, 퍼센타일, 배지가 생성됩니다."
      action={<button onClick={onOpenModal} className="flex items-center gap-2 rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100"><Gem size={16} /> 실시간 등록 열기</button>}
    >
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['이름', '이서윤'],
              ['출생연도', '1993'],
              ['키 / 몸무게', '167cm / 52kg'],
              ['체형', '슬림탄탄'],
              ['직업', '국내 대기업 브랜드전략'],
              ['연봉', '1.1억'],
              ['금융자산', '2.7억'],
              ['부동산', '본인명의 아파트 1채'],
              ['집안', '부모 노후 안정'],
              ['외모 메모', '세련형 / 자기관리 우수'],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 p-3">
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-1 text-sm font-medium text-slate-800">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm font-bold text-blue-900">점수 산정 가중치</div>
            <div className="mt-3 space-y-2">
              {scoreRuleWeights.map((rule) => (
                <div key={rule.key} className="rounded-xl border border-blue-100 bg-white px-3 py-2">
                  <div className="flex items-center justify-between text-sm font-medium text-slate-800">
                    <span>{rule.label}</span>
                    <span className="text-blue-700">{rule.weight}%</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-bold text-amber-900">자동 산정 결과</div>
            <div className="mt-2 flex items-end justify-between">
              <div>
                <div className="text-xs text-amber-700">종합 점수</div>
                <div className="text-3xl font-bold text-amber-900">{scorePreview.overallScore}</div>
              </div>
              <GradeBadge label={scorePreview.categories.overall.badge} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {scorePreview.badges.map((badge) => (
                <GradeBadge key={badge} label={badge} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-2">
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
                <GradeScoreCard
                  key={tab.key}
                  title={tab.label}
                  data={scorePreview.categories[tab.key]}
                  active={activePreviewTab === tab.key}
                  onClick={() => setActivePreviewTab(tab.key)}
                  showHint
                />
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-violet-900">{previewTabs.find((tab) => tab.key === activePreviewTab)?.label} 퍼센타일 결과</div>
                  <div className="mt-1 text-xs text-violet-700">신규 회원 등록 시 프로필 카드와 내부 CRM에 즉시 반영됩니다.</div>
                </div>
                <GradeBadge label={preview.badge} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/80 p-3">
                  <div className="text-xs text-slate-400">점수</div>
                  <div className="mt-1 text-xl font-bold text-slate-900">{preview.score}</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3">
                  <div className="text-xs text-slate-400">퍼센타일</div>
                  <div className="mt-1 text-xl font-bold text-violet-700">{preview.percentile}</div>
                </div>
                <div className="rounded-xl bg-white/80 p-3">
                  <div className="text-xs text-slate-400">배지</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{preview.badge}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ScoreSettingsPanel({ scoreRuleWeights, setScoreRuleWeights, badgeThresholds, setBadgeThresholds }) {
  return (
    <SectionCard
      title="관리자용 점수 기준 설정"
      subtitle="가중치와 배지 임계값을 조정해 내부 평가 기준을 관리합니다."
      action={<div className="flex items-center gap-2 text-sm font-medium text-slate-600"><Settings2 size={16} /> Admin</div>}
    >
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><SlidersHorizontal size={16} /> 가중치 설정</div>
          <div className="space-y-3">
            {scoreRuleWeights.map((rule) => (
              <div key={rule.key} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{rule.label}</div>
                    <div className="mt-1 text-xs text-slate-500">{rule.desc}</div>
                  </div>
                  <div className="text-sm font-bold text-violet-700">{rule.weight}%</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rule.weight}
                  onChange={(e) => setScoreRuleWeights((prev) => prev.map((item) => item.key === rule.key ? { ...item, weight: Number(e.target.value) } : item))}
                  className="mt-3 w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><Crown size={16} /> 배지 임계값</div>
            <div className="space-y-3">
              {badgeThresholds.map((badge) => (
                <div key={badge.label} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between">
                    <GradeBadge label={badge.label} />
                    <input
                      type="number"
                      value={badge.min}
                      onChange={(e) => setBadgeThresholds((prev) => prev.map((item) => item.label === badge.label ? { ...item, min: Number(e.target.value) } : item))}
                      className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="mt-2 text-xs text-slate-500">이 점수 이상일 때 자동 부여</div>
                </div>
              ))}
            </div>
          </div>

          <InfoTooltip
            title="운영 주의사항"
            lines={[
              '가중치 총합은 100 기준으로 운영하는 것이 권장됩니다.',
              '배지 임계값은 상위 회원 분포를 보고 정기적으로 조정할 수 있습니다.',
              '설정 변경 시 이후 등록 회원과 재산정 대상 회원에 반영됩니다.',
            ]}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function Dashboard({ onOpenRegistration, scoreRuleWeights, setScoreRuleWeights, badgeThresholds, setBadgeThresholds }) {
  return (
    <div className="space-y-6 overflow-y-auto p-8">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">운영 대시보드</h2>
          <p className="mt-1 text-sm text-slate-500">매칭, 인증, 정산, 분쟁, 제안 흐름을 한눈에 관리합니다.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          오늘의 성사 가능성 높은 후보 <span className="font-bold text-violet-600">6건</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 xl:grid-cols-6">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-lg border px-2 py-1 text-xs font-medium ${toneClasses[item.tone]}`}>
              {item.label}
            </div>
            <div className="mt-3 text-3xl font-bold text-slate-900">{item.value}</div>
            <div className="mt-1 text-xs text-slate-500">전월 대비 안정적 유지</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">오늘의 업무 큐</h3>
            <button className="text-sm font-medium text-violet-600">전체 보기</button>
          </div>
          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <div key={task.title} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <div className="font-medium text-slate-900">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{task.meta}</div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${toneClasses[task.tone]}`}>우선 처리</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-bold text-slate-900">핵심 알림</h3>
          <div className="mt-4 space-y-3">
            {['받은 제안 3건', '정산 예정 2건', '분쟁 검토 1건'].map((item, idx) => (
              <div key={item} className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-medium text-slate-800">{item}</div>
                <div className="mt-1 text-xs text-slate-500">{idx === 2 ? '운영관리자 확인 필요' : '오늘 처리 권장'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <MemberRegistrationPanel onOpenModal={onOpenRegistration} scoreRuleWeights={scoreRuleWeights} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ScoreSettingsPanel
          scoreRuleWeights={scoreRuleWeights}
          setScoreRuleWeights={setScoreRuleWeights}
          badgeThresholds={badgeThresholds}
          setBadgeThresholds={setBadgeThresholds}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <SectionCard
          title="주간 파이프라인 흐름"
          subtitle="탐색 → 소개 → 성사 전환 추이를 확인합니다."
          action={<div className="flex items-center gap-2 text-sm font-medium text-violet-600"><BarChart3 size={16} /> KPI</div>}
        >
          <MiniBarChart />
        </SectionCard>

        <SectionCard
          title="실시간 액티비티"
          subtitle="오늘 팀/파트너 네트워크에서 발생한 주요 이벤트입니다."
          action={<div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Clock3 size={16} /> Live</div>}
        >
          <div className="space-y-4">
            {timelineItems.map((item) => (
              <div key={item.time + item.title} className="grid grid-cols-[56px_1fr] gap-3">
                <div className="text-xs font-bold text-violet-600">{item.time}</div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="업체 평판 / 협업 지표"
          subtitle="네트워크 내 우리 업체의 운영 품질을 보여줍니다."
          action={<div className="flex items-center gap-2 text-sm font-medium text-emerald-600"><TrendingUp size={16} /> 개선중</div>}
        >
          <div className="space-y-3">
            {reputationMetrics.map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-200 p-4">
                <div className="text-xs text-slate-400">{item.label}</div>
                <div className="mt-1 text-lg font-bold text-slate-900">{item.value}</div>
                <div className="mt-1 text-xs text-slate-500">{item.sub}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function MyMembers({ members, selectedMyMember, setSelectedMyMember, onOpenRegistration }) {
  const [activeGradeTab, setActiveGradeTab] = useState('overall');
  const gradeTabs = [
    { key: 'overall', label: '종합' },
    { key: 'wealth', label: '자산' },
    { key: 'appearance', label: '외모' },
    { key: 'family', label: '집안' },
    { key: 'career', label: '직업' },
  ];
  const currentGrade = selectedMyMember.grade.categories[activeGradeTab];

  return (
    <div className="grid h-full grid-cols-[1.2fr_420px] gap-0">
      <div className="space-y-6 overflow-y-auto p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">우리 회원 CRM</h2>
            <p className="mt-1 text-sm text-slate-500">실명, 증빙 원본, 연락처는 자사 권한 사용자만 열람 가능합니다.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={onOpenRegistration} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
              + 신규 회원 등록
            </button>
            <button className="rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100">
              자동 점수 산정 보기
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr_0.8fr_0.9fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
            <div>회원</div>
            <div>상태</div>
            <div>직업 / 학력</div>
            <div>최근 접촉</div>
            <div>다음 액션</div>
            <div>검증</div>
          </div>
          <div>
            {members.map((m) => {
              const active = selectedMyMember.id === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMyMember(m)}
                  className={`grid w-full grid-cols-[1.2fr_0.8fr_1.2fr_0.8fr_0.8fr_0.9fr] items-center border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    active ? 'bg-violet-50/60' : 'bg-white'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{m.name} <span className="text-xs text-slate-400">({m.id})</span></div>
                    <div className="mt-1 text-sm text-slate-500">{m.age}세 · {m.gender} · {m.location}</div>
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{m.status}</span>
                  </div>
                  <div>
                    <div className="text-sm text-slate-800">{m.job}</div>
                    <div className="mt-1 text-xs text-slate-500">{m.edu}</div>
                  </div>
                  <div className="text-sm text-slate-600">{m.lastContact}</div>
                  <div className="text-sm font-medium text-violet-700">{m.nextAction}</div>
                  <div><Badge level={m.verifyLevel} /></div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="border-l border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">선택 회원 상세</div>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{selectedMyMember.name}</h3>
            <p className="mt-1 text-sm text-slate-500">담당 매니저 {selectedMyMember.manager}</p>
          </div>
          <Badge level={selectedMyMember.verifyLevel} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            ['직업', selectedMyMember.job],
            ['연소득', selectedMyMember.income],
            ['자산', selectedMyMember.assets],
            ['거주', selectedMyMember.location],
            ['키/체형', `${selectedMyMember.height}cm · ${selectedMyMember.bodyType}`],
            ['외모 메모', selectedMyMember.appearanceNote],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-400">{k}</div>
              <div className="mt-1 text-sm font-medium text-slate-800">{v}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-amber-900">자동 스펙 랭킹</div>
              <div className="mt-1 text-xs text-amber-700">등록 데이터 기반 자동 점수화 · 퍼센타일 산출 · 배지 부여</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-700">종합 점수</div>
              <div className="text-3xl font-bold text-amber-900">{selectedMyMember.grade.overallScore}</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedMyMember.grade.badges.map((badge) => (
              <GradeBadge key={badge} label={badge} />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-slate-800">카테고리별 상위권 분석</div>
            <div className="text-xs text-slate-500">탭 이동</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {gradeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveGradeTab(tab.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${activeGradeTab === tab.key ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {gradeTabs.map((tab) => (
              <GradeScoreCard
                key={tab.key}
                title={tab.label}
                data={selectedMyMember.grade.categories[tab.key]}
                active={activeGradeTab === tab.key}
                onClick={() => setActiveGradeTab(tab.key)}
              />
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-violet-900">{gradeTabs.find((t) => t.key === activeGradeTab)?.label} 상세</div>
                <div className="mt-1 text-xs text-violet-700">현재 회원은 {currentGrade.percentile} 포지션입니다.</div>
              </div>
              <GradeBadge label={currentGrade.badge} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-xs text-slate-400">카테고리 점수</div>
                <div className="mt-1 text-xl font-bold text-slate-900">{currentGrade.score}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-xs text-slate-400">퍼센타일</div>
                <div className="mt-1 text-xl font-bold text-violet-700">{currentGrade.percentile}</div>
              </div>
              <div className="rounded-xl bg-white/80 p-3">
                <div className="text-xs text-slate-400">뱃지</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{currentGrade.badge || '없음'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-800">
            <Star size={16} /> 사주 성향 요약
          </div>
          <p className="mt-3 text-sm leading-6 text-violet-900">{selectedMyMember.saju.profile}</p>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-sm font-bold text-slate-800">프로필 상태</div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">프로필 완성도</span>
              <span className="font-bold text-slate-900">{selectedMyMember.profileCompletion}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-violet-500" style={{ width: `${selectedMyMember.profileCompletion}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedMyMember.values.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 text-blue-500" size={18} />
            <div>
              <div className="text-sm font-bold text-blue-900">테넌트 데이터 분리</div>
              <p className="mt-1 text-xs leading-5 text-blue-700">
                실명, 연락처, 증빙 원본은 외부 네트워크에 공개되지 않으며, 익명 카드와 단계적 공개 정책에 따라 제안이 진행됩니다.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NetworkResultCard({ member, selected, onSelect, onToggleCompare, isCompared }) {
  const bars = [
    ['조건', member.scores.condition],
    ['가치관', member.scores.values],
    ['궁합', member.scores.saju],
    ['성사', member.scores.possibility],
  ];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
        selected ? 'border-violet-300 ring-2 ring-violet-100' : 'border-slate-200 hover:border-violet-200'
      }`}
    >
      <div className="grid grid-cols-[100px_1fr_170px] gap-4">
        <div className="rounded-2xl bg-violet-50 p-4 text-center">
          <div className="text-xs text-slate-500">총합 점수</div>
          <div className="mt-1 text-3xl font-bold text-violet-700">{member.matchScore}</div>
          <div className="mt-1 text-xs text-violet-500">상위 추천군</div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-bold text-slate-900">{member.id}</div>
            <Badge level={member.verifyLevel} />
            <span className="text-sm text-slate-500">{member.agency}</span>
          </div>
          <div className="mt-2 text-sm text-slate-600">{member.ageRange} · {member.jobCategory} · {member.location}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {member.rankingBadges?.map((badge) => (
              <GradeBadge key={badge} label={badge} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {bars.map(([label, score]) => (
              <div key={label}>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{label}</span>
                  <span className="font-bold text-slate-700">{score}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-violet-500" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-medium text-slate-900">추천 이유</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {member.reason.map((r) => (
                <span key={r} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">{r}</span>
              ))}
            </div>
            <p className="mt-3 leading-6 text-violet-900">궁합 코멘트: {member.chemistryNote}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <div className="flex items-center justify-between"><span>최근 활동</span><b>{member.recentActivity}</b></div>
            <div className="mt-2 flex items-center justify-between"><span>응답률</span><b>{member.responseRate}</b></div>
            <div className="mt-2 flex items-center justify-between"><span>업체 신뢰</span><b>{member.trustScore}</b></div>
          </div>
          <button onClick={onSelect} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            상세 보기
          </button>
          <button
            onClick={onToggleCompare}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              isCompared ? 'bg-slate-900 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isCompared ? '비교함 해제' : '비교함 추가'}
          </button>
          <button onClick={() => onSelect(true)} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">
            소개 제안
          </button>
        </div>
      </div>
    </div>
  );
}

function ComparisonTable({ compareList }) {
  if (!compareList.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-400">
        후보를 비교함에 추가하면 조건·궁합·성사 가능성을 한 테이블에서 볼 수 있습니다.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[1fr_repeat(7,120px)_1.8fr] border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
        {compareColumns.map((col) => <div key={col.key}>{col.label}</div>)}
      </div>
      {compareList.map((item) => (
        <div key={item.id} className="grid grid-cols-[1fr_repeat(7,120px)_1.8fr] border-b border-slate-100 px-4 py-4 text-sm">
          <div className="font-medium text-slate-900">{item.id}</div>
          <div>{item.agency}</div>
          <div className="font-bold text-violet-700">{item.matchScore}</div>
          <div>{item.scores.condition}</div>
          <div>{item.scores.values}</div>
          <div>{item.scores.saju}</div>
          <div>{item.scores.possibility}</div>
          <div className="pr-4 text-slate-600">{item.chemistryNote}</div>
        </div>
      ))}
    </div>
  );
}

function NetworkView({ selectedMyMember, compareList, setCompareList, selectedNetworkMember, setSelectedNetworkMember, openProposal }) {
  const [minScore, setMinScore] = useState(80);
  const [verifyFilter, setVerifyFilter] = useState('전체');

  const filtered = useMemo(() => {
    return networkMembers.filter((m) => {
      const okScore = m.matchScore >= minScore;
      const okVerify = verifyFilter === '전체' ? true : m.verifyLevel === verifyFilter;
      return okScore && okVerify;
    });
  }, [minScore, verifyFilter]);

  const toggleCompare = (member) => {
    setCompareList((prev) => {
      const exists = prev.find((x) => x.id === member.id);
      if (exists) return prev.filter((x) => x.id !== member.id);
      if (prev.length >= 3) return [...prev.slice(1), member];
      return [...prev, member];
    });
  };

  const current = filtered.find((item) => item.id === selectedNetworkMember?.id) || filtered[0] || null;

  return (
    <div className="grid h-full grid-cols-[280px_1fr_360px]">
      <aside className="border-r border-slate-200 bg-white p-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">탐색 필터</h3>
          <p className="mt-1 text-sm text-slate-500">매칭 대상: {selectedMyMember.id} {selectedMyMember.name}</p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">최소 매칭 점수</label>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">기준</span>
                <span className="font-bold text-violet-700">{minScore}점 이상</span>
              </div>
              <input
                type="range"
                min="60"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="mt-3 w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">검증 레벨</label>
            <select
              value={verifyFilter}
              onChange={(e) => setVerifyFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none"
            >
              <option>전체</option>
              <option>VIP</option>
              <option>Lv4</option>
              <option>Lv3</option>
            </select>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
              <Filter size={16} /> 탐색 기준
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-blue-800">
              <li>• 조건 적합도 + 가치관 유사도 + 요청 회원과의 궁합 + 성사 가능성 반영</li>
              <li>• 후보별 사주는 성향 요약만 표시</li>
              <li>• 연락처는 상호 수락 후에만 공개</li>
            </ul>
          </div>

          {compareList.length > 0 ? (
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="text-sm font-bold text-violet-900">비교함 ({compareList.length}/3)</div>
              <div className="mt-3 space-y-2">
                {compareList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm">
                    <span className="font-medium text-slate-800">{item.id}</span>
                    <span className="font-bold text-violet-700">{item.matchScore}점</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <section className="overflow-y-auto bg-slate-50 p-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">협업 네트워크 탐색</h2>
            <p className="mt-1 text-sm text-slate-500">타사 회원은 익명 카드로만 노출되며, 상호 승인 후 단계적으로 정보가 공개됩니다.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            추천 결과 <span className="font-bold text-violet-700">{filtered.length}건</span>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><FileSearch size={16} /> 후보 비교 테이블</div>
          <ComparisonTable compareList={compareList} />
        </div>

        <div className="mt-6 space-y-4">
          {filtered.map((member) => (
            <NetworkResultCard
              key={member.id}
              member={member}
              selected={current?.id === member.id}
              onSelect={(open) => {
                setSelectedNetworkMember(member);
                if (open) openProposal(member);
              }}
              onToggleCompare={() => toggleCompare(member)}
              isCompared={!!compareList.find((x) => x.id === member.id)}
            />
          ))}
        </div>
      </section>

      <aside className="border-l border-slate-200 bg-white p-6">
        {current ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">선택 후보 상세</div>
                <h3 className="mt-2 text-xl font-bold text-slate-900">{current.id}</h3>
                <p className="mt-1 text-sm text-slate-500">{current.agency}</p>
              </div>
              <Badge level={current.verifyLevel} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-800">1차 공개 프로필</div>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between"><span>직군</span><b>{current.jobCategory}</b></div>
                <div className="flex justify-between"><span>소득 구간</span><b>{current.incomeRange}</b></div>
                <div className="flex justify-between"><span>학력 구간</span><b>{current.eduRange}</b></div>
                <div className="flex justify-between"><span>지역</span><b>{current.location}</b></div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {current.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{tag}</span>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
              <div className="text-sm font-bold text-violet-900">사주 성향 & 요청 회원과의 궁합</div>
              <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 p-3 text-sm text-violet-900">
                <div className="text-xs font-bold text-violet-700">후보 성향 요약</div>
                <p className="mt-2 leading-6">{current.sajuProfile}</p>
              </div>
              <div className="mt-3 rounded-xl border border-violet-100 bg-white/70 p-3 text-sm text-violet-900">
                <div className="text-xs font-bold text-violet-700">{selectedMyMember.id}와의 궁합</div>
                <p className="mt-2 leading-6">{current.chemistryNote}</p>
              </div>
              <div className="mt-4">
                <div className="text-xs font-bold text-violet-700">주의 포인트</div>
                <ul className="mt-2 space-y-2 text-sm text-violet-900">
                  {current.risks.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4">
              <div className="text-sm font-bold text-slate-800">업체 협업 지표</div>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between"><span>최근 활동</span><b>{current.recentActivity}</b></div>
                <div className="flex items-center justify-between"><span>응답률</span><b>{current.responseRate}</b></div>
                <div className="flex items-center justify-between"><span>신뢰 점수</span><b>{current.trustScore} / 5.0</b></div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><MessageSquare size={16} /> 업체 메시지 스레드</div>
              <div className="space-y-3">
                {proposalMessages.map((msg) => (
                  <div key={msg.id} className={`rounded-2xl p-3 text-sm ${msg.role === 'me' ? 'ml-8 bg-violet-50 text-violet-900' : 'mr-8 border border-slate-200 bg-white text-slate-700'}`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{msg.sender}</span>
                      <span className="text-slate-400">{msg.time}</span>
                    </div>
                    <p className="mt-2 leading-6">{msg.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none" placeholder="후보 관련 메시지 보내기" />
                <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"><Send size={16} /></button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                비교 후보 지정
              </button>
              <button onClick={() => openProposal(current)} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700">
                소개 제안
              </button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">후보를 선택하세요.</div>
        )}
      </aside>
    </div>
  );
}

function ProposalModal({ member, selectedMyMember, onClose }) {
  const [visibility, setVisibility] = useState(['학력', '궁합 요약', '소득 구간']);
  const [memo, setMemo] = useState('');

  const toggleVisibility = (item) => {
    setVisibility((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const options = ['학력', '소득 구간', '사진 일부', '궁합 요약', '가치관 요약'];

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
              {[
                '회원 1차 소개 의사 확인 완료',
                '민감 개인정보 비공개 설정 확인',
                '종교 / 자녀 계획 등 주요 이슈 사전 브리핑 예정',
                '수락 시 2차 공개 범위 별도 승인 필요',
              ].map((item) => (
                <label key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
                  <input type="checkbox" className="mt-1" defaultChecked />
                  <span>{item}</span>
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
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                onClick={onClose}
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                제안서 발송하기
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InboxView() {
  const [selected, setSelected] = useState(inboxItems[0]);
  const columns = [
    { key: 'agency', label: '업체', width: '1.1fr' },
    { key: 'memberId', label: '우리 회원', width: '0.9fr' },
    { key: 'candidate', label: '상대 후보', width: '0.9fr' },
    { key: 'score', label: '점수', width: '0.6fr' },
    { key: 'status', label: '상태', width: '0.8fr' },
    { key: 'lastAction', label: '최근 액션', width: '0.8fr' },
    { key: 'owner', label: '담당', width: '0.7fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="받은 제안함" subtitle="타 업체가 보낸 소개 요청과 추가 정보 요청을 관리합니다.">
          <TableList columns={columns} rows={inboxItems} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="받은 제안 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">추가정보 요청</button>
            <button className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">수락</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">회원 확인 진행</button>
          </>
        }
      />
    </div>
  );
}

function OutboxView() {
  const [selected, setSelected] = useState(outboxItems[0]);
  const columns = [
    { key: 'agency', label: '상대 업체', width: '1.1fr' },
    { key: 'memberId', label: '보낸 회원', width: '0.9fr' },
    { key: 'candidate', label: '상대 후보', width: '0.9fr' },
    { key: 'score', label: '점수', width: '0.6fr' },
    { key: 'status', label: '상태', width: '0.9fr' },
    { key: 'lastAction', label: '최근 액션', width: '0.8fr' },
    { key: 'owner', label: '담당', width: '0.7fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="보낸 제안함" subtitle="보낸 요청의 열람, 수락, 회원 확인, 소개 확정 흐름을 추적합니다.">
          <TableList columns={columns} rows={outboxItems} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="보낸 제안 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">공개 범위 수정</button>
            <button className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">리마인드 발송</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">소개 확정 처리</button>
          </>
        }
      />
    </div>
  );
}

function VerifyView() {
  const [selected, setSelected] = useState(verifyQueue[0]);
  const columns = [
    { key: 'memberId', label: '회원', width: '0.8fr' },
    { key: 'type', label: '인증 종류', width: '1fr' },
    { key: 'owner', label: '담당팀', width: '0.8fr' },
    { key: 'due', label: '마감', width: '0.8fr' },
    { key: 'status', label: '상태', width: '1fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="인증센터" subtitle="본인, 재직, 소득, 자산, 가족 인증 상태와 만료 재검증을 관리합니다.">
          <TableList columns={columns} rows={verifyQueue} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="인증 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">보완 요청</button>
            <button className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100">승인</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">검토 메모 저장</button>
          </>
        }
      />
    </div>
  );
}

function SettlementView() {
  const [selected, setSelected] = useState(settlementItems[0]);
  const columns = [
    { key: 'partner', label: '파트너 업체', width: '1fr' },
    { key: 'pair', label: '매칭 페어', width: '1.2fr' },
    { key: 'stage', label: '단계', width: '0.8fr' },
    { key: 'amount', label: '금액', width: '0.7fr' },
    { key: 'split', label: '배분', width: '0.7fr' },
    { key: 'due', label: '예정일', width: '0.8fr' },
    { key: 'status', label: '상태', width: '0.8fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="정산관리" subtitle="성사 단계별 정산 예정액, 배분 비율, 지급 상태를 추적합니다.">
          <TableList columns={columns} rows={settlementItems} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="정산 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">배분 조정</button>
            <button className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">증빙 요청</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">정산 확정</button>
          </>
        }
      />
    </div>
  );
}

function DisputeView() {
  const [selected, setSelected] = useState(disputeItems[0]);
  const columns = [
    { key: 'partner', label: '상대 업체', width: '1fr' },
    { key: 'issue', label: '이슈', width: '1.5fr' },
    { key: 'level', label: '상태', width: '0.9fr' },
    { key: 'updated', label: '최근 업데이트', width: '0.9fr' },
    { key: 'owner', label: '담당', width: '0.8fr' },
  ];
  return (
    <div className="grid h-full grid-cols-[1.1fr_380px]">
      <div className="space-y-6 overflow-y-auto p-8">
        <SectionCard title="분쟁관리" subtitle="우회 접촉, 허위 정보, 정산 분쟁 등 파트너 이슈를 기록하고 중재합니다.">
          <TableList columns={columns} rows={disputeItems} onRowClick={setSelected} selectedRowId={selected?.id} />
        </SectionCard>
      </div>
      <ProposalDetailPanel
        title="분쟁 상세"
        item={selected}
        actions={
          <>
            <button className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">증빙 요청</button>
            <button className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 hover:bg-amber-100">중재 기록</button>
            <button className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800">패널티 검토</button>
          </>
        }
      />
    </div>
  );
}

export default function App() {
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('network');
  const [members, setMembers] = useState(initialMembers);
  const [selectedMyMember, setSelectedMyMember] = useState(initialMembers[0]);
  const [selectedNetworkMember, setSelectedNetworkMember] = useState(networkMembers[0]);
  const [compareList, setCompareList] = useState([]);
  const [proposalTarget, setProposalTarget] = useState(null);
  const [scoreRuleWeights, setScoreRuleWeights] = useState(defaultScoreRuleWeights);
  const [badgeThresholds, setBadgeThresholds] = useState(defaultBadgeThresholds);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-72 flex-col bg-slate-900 text-slate-300">
        <div className="border-b border-slate-800 p-6">
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
            <span className="rounded-xl bg-violet-500 p-2"><Activity size={18} color="white" /></span>
            HANI MatchOS
          </h1>
          <p className="mt-2 text-xs text-slate-500">압구정 노블레스 파트너스</p>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto py-6">
          <SidebarButton icon={Activity} label="대시보드" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarButton icon={Users} label="우리 회원 (CRM)" active={activeTab === 'myMembers'} onClick={() => setActiveTab('myMembers')} />
          <SidebarButton icon={Network} label="협업 네트워크 탐색" active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
          <SidebarButton icon={Lock} label="받은 제안함" active={activeTab === 'inbox'} onClick={() => setActiveTab('inbox')} badge="3" />
          <SidebarButton icon={ArrowRightLeft} label="보낸 제안함" active={activeTab === 'outbox'} onClick={() => setActiveTab('outbox')} />
          <SidebarButton icon={UserCheck} label="인증센터" active={activeTab === 'verify'} onClick={() => setActiveTab('verify')} />
          <SidebarButton icon={Wallet} label="정산관리" active={activeTab === 'settlement'} onClick={() => setActiveTab('settlement')} />
          <SidebarButton icon={AlertTriangle} label="분쟁관리" active={activeTab === 'dispute'} onClick={() => setActiveTab('dispute')} />
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <div>
            <div className="text-sm font-medium text-slate-600">현재 로그인: 이팀장 (매칭매니저)</div>
            <div className="text-xs text-slate-400">오늘 응답 필요 제안 4건 · 재검증 2건 · 분쟁 검토 1건</div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button className="rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800"><Search size={18} /></button>
            <button className="relative rounded-lg p-2 hover:bg-slate-100 hover:text-slate-800">
              <Bell size={18} />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenRegistration={() => setRegistrationOpen(true)}
              scoreRuleWeights={scoreRuleWeights}
              setScoreRuleWeights={setScoreRuleWeights}
              badgeThresholds={badgeThresholds}
              setBadgeThresholds={setBadgeThresholds}
            />
          )}
          {activeTab === 'myMembers' && (
            <MyMembers
              members={members}
              selectedMyMember={selectedMyMember}
              setSelectedMyMember={setSelectedMyMember}
              onOpenRegistration={() => setRegistrationOpen(true)}
            />
          )}
          {activeTab === 'network' && (
            <NetworkView
              selectedMyMember={selectedMyMember}
              compareList={compareList}
              setCompareList={setCompareList}
              selectedNetworkMember={selectedNetworkMember}
              setSelectedNetworkMember={setSelectedNetworkMember}
              openProposal={setProposalTarget}
            />
          )}
          {activeTab === 'inbox' && <InboxView />}
          {activeTab === 'outbox' && <OutboxView />}
          {activeTab === 'verify' && <VerifyView />}
          {activeTab === 'settlement' && <SettlementView />}
          {activeTab === 'dispute' && <DisputeView />}
        </main>
      </div>

      {registrationOpen ? (
        <MemberRegistrationModal
          open={registrationOpen}
          onClose={() => setRegistrationOpen(false)}
          scoreRuleWeights={scoreRuleWeights}
          badgeThresholds={badgeThresholds}
          onSave={(newMember) => {
            setMembers((prev) => [newMember, ...prev]);
            setSelectedMyMember(newMember);
          }}
        />
      ) : null}

      {proposalTarget ? (
        <ProposalModal member={proposalTarget} selectedMyMember={selectedMyMember} onClose={() => setProposalTarget(null)} />
      ) : null}
    </div>
  );
}
