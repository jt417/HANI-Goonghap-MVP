export const defaultScoreRuleWeights = [
  { key: 'wealth', label: '자산', weight: 30, desc: '금융자산, 부동산, 거주 안정성 반영' },
  { key: 'career', label: '직업', weight: 25, desc: '직군 선호도, 기업/전문직 위상, 안정성 반영' },
  { key: 'appearance', label: '외모', weight: 20, desc: '키, 체형, 인상 메모, 자기관리 가산점 반영' },
  { key: 'family', label: '집안', weight: 15, desc: '가족 배경, 부모 노후, 형제 리스크 등 반영' },
  { key: 'bonus', label: '기타 가산점', weight: 10, desc: '학력, 거주권역, 비흡연, 종교 적합 등 반영' },
];

export const defaultBadgeThresholds = [
  { label: 'TOP 0.1%', min: 95 },
  { label: 'TOP 1%', min: 90 },
  { label: 'TOP 5%', min: 85 },
  { label: 'TOP 10%', min: 80 },
];

export const workflowSteps = ['검토', '추가정보', '회원확인', '소개확정'];

export const toneClasses = {
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const statusToneMap = {
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

export const compareColumns = [
  { key: 'id', label: '후보' },
  { key: 'agency', label: '업체' },
  { key: 'matchScore', label: '총합' },
  { key: 'condition', label: '조건' },
  { key: 'values', label: '가치관' },
  { key: 'saju', label: '궁합' },
  { key: 'possibility', label: '성사' },
  { key: 'note', label: '궁합 코멘트' },
];
