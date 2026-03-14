/*
 * ── 카테고리별 가중치 (2025-2026 결혼정보업체 시장 반영) ──
 *
 * 남성 평가 기준 (듀오/가연/노블레스 내부 등급표 + 2024-25 설문 종합)
 *   직업 30 > 경제력 25 > 집안 20 > 외모 10 > 나이 8 > 라이프스타일 7
 * 여성 평가 기준
 *   외모 30 > 집안 20 > 직업 20 > 나이 15 > 경제력 10 > 라이프스타일 5
 *
 * weight = 성별 무관 평균, weightM = 남성 평가용, weightF = 여성 평가용
 */
export const defaultScoreRuleWeights = [
  { key: 'career',     label: '직업/학력',     weight: 25, weightM: 30, weightF: 20, desc: '직군 서열(S~D)·고용안정성·성장성·학력 — 남성 최대 배점 항목' },
  { key: 'wealth',     label: '경제력',         weight: 18, weightM: 25, weightF: 10, desc: '연봉·금융자산·부동산 — 남성 평가 시 직업 다음으로 중요' },
  { key: 'appearance', label: '외모/자기관리', weight: 20, weightM: 10, weightF: 30, desc: '키·체형·스타일·탈모·자기관리 — 여성 최대 배점 항목' },
  { key: 'family',     label: '집안/가족',     weight: 20, weightM: 20, weightF: 20, desc: '부모 재력·자산·직업·노후 준비 — 2025년 4위→공동 2위로 급상승' },
  { key: 'age',        label: '나이/결혼적기', weight: 12, weightM:  8, weightF: 15, desc: '여성: 30세+ 감점, 35세+ 급감 / 남성: 세대차·안정기 반영' },
  { key: 'lifestyle',  label: '라이프스타일', weight:  5, weightM:  7, weightF:  5, desc: '취미·건강습관·비흡연·DINK 여부 — 커플궁전2 이후 부상 중' },
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
  승인: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  보완요청: 'bg-amber-100 text-amber-800 border-amber-200',
  정산완료: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  패널티: 'bg-rose-100 text-rose-800 border-rose-200',
  '소개 확정': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  철회: 'bg-rose-100 text-rose-800 border-rose-200',
  해결: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  '신규 상담': 'bg-blue-100 text-blue-800 border-blue-200',
  '소개 가능': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  '소개 진행중': 'bg-violet-100 text-violet-800 border-violet-200',
  '보류': 'bg-amber-100 text-amber-800 border-amber-200',
  '휴면': 'bg-slate-100 text-slate-500 border-slate-200',
};

export const reminderCycleOptions = [
  { value: '3일', days: 3 },
  { value: '1주', days: 7 },
  { value: '2주', days: 14 },
  { value: '1개월', days: 30 },
];

export const managerList = ['이팀장', '최수석', '김매니저', '박실장'];

export const memberStatusOptions = ['신규 상담', '소개 가능', '소개 진행중', '보류', '휴면'];

export const meetingTypeColors = {
  '상담': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '만남': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '피드백': 'bg-amber-100 text-amber-700 border-amber-200',
  '프로필촬영': 'bg-violet-100 text-violet-700 border-violet-200',
  '계약': 'bg-rose-100 text-rose-700 border-rose-200',
};

export const bodyTypeOptions = {
  M: ['슬림', '슬림탄탄', '균형형', '건장', '근육형', '통통', '보통'],
  F: ['슬림', '슬림탄탄', '균형형', '글래머', '건강미', '통통', '보통'],
};

export const eduOptions = [
  '고졸',
  '전문대',
  '4년제 지방',
  '4년제 인서울',
  '4년제 인서울 상위권',
  'SKY',
  '의치한약수',
  '해외대학',
  '해외 상위대학',
  '석사 (일반)',
  '석사 (SKY/해외)',
  '박사/전문대학원',
];

/* ── 2단계 지역 계층 구조 (시/도 → 구/군/시) ── */
export const locationHierarchy = {
  '서울': [
    '강남구', '서초구', '송파구', '강동구', '용산구', '마포구',
    '성동구', '광진구', '종로구', '중구', '관악구', '영등포구',
    '강서구', '서대문구', '동작구', '노원구', '은평구',
  ],
  '경기': [
    '분당', '판교', '용인', '수원', '고양(일산)', '하남',
    '과천', '화성', '안양', '부천', '파주', '광명', '성남',
  ],
  '인천': ['연수구(송도)', '남동구', '부평구', '미추홀구', '서구', '중구'],
  '부산': ['해운대구', '수영구', '남구', '연제구', '사하구', '금정구', '부산진구'],
  '대구': ['수성구', '중구', '달서구', '북구', '동구'],
  '대전': ['유성구', '서구', '중구', '동구'],
  '광주': ['남구', '서구', '북구', '동구'],
  '울산': ['남구', '중구', '동구'],
  '세종': ['세종시'],
  '제주': ['제주시', '서귀포시'],
  '충남': ['천안', '아산', '논산'],
  '충북': ['청주', '충주'],
  '경남': ['창원', '김해', '양산'],
  '경북': ['포항', '구미', '경주'],
  '전남': ['여수', '순천', '목포'],
  '전북': ['전주', '익산'],
  '강원': ['춘천', '원주', '강릉', '속초'],
};

/* 시/도 목록 (표시 순서) */
export const locationCities = Object.keys(locationHierarchy);

/* flat 목록 (하위 호환용) — '시/도 구/군' 형식 */
export const locationOptions = Object.entries(locationHierarchy).flatMap(
  ([city, districts]) => districts.map((d) => `${city} ${d}`),
);

export const drinkOptions = ['비음주', '월 1~2회', '주 1~2회', '자주'];
export const smokeOptions = ['비흡연', '금연중', '전자담배', '흡연'];
export const religionOptions = ['무교', '기독교', '천주교', '불교', '기타'];
export const mbtiOptions = [
  'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
  'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP',
];

/* ── 직업 카테고리 (드롭다운) ── */
export const jobCategoryOptions = [
  { value: '전문직', label: '전문직 (의사/변호사/회계사/약사)', tier: 5 },
  { value: '대기업', label: '대기업 임직원', tier: 4 },
  { value: '공기업/공무원', label: '공기업 / 공무원', tier: 4 },
  { value: 'IT/테크', label: 'IT / 테크기업', tier: 4 },
  { value: '금융권', label: '금융권 (은행/증권/보험)', tier: 4 },
  { value: '중견기업', label: '중견기업', tier: 3 },
  { value: '교직/연구', label: '교직 / 연구직', tier: 3 },
  { value: '스타트업', label: '스타트업 / 벤처', tier: 3 },
  { value: '외국계', label: '외국계 기업', tier: 4 },
  { value: '자영업', label: '자영업 / 사업가', tier: 3 },
  { value: '프리랜서', label: '프리랜서 / 크리에이터', tier: 2 },
  { value: '기타', label: '기타', tier: 1 },
];

/* ── 얼굴/외모상 (단일 선택) — 매니저 주관 평가 ── */
export const faceTypeOptions = {
  M: [
    { value: '호감상', desc: '편안하고 따뜻한 인상, 좋은 첫인상' },
    { value: '남자다운 상', desc: '각진 턱선, 남성적이고 듬직한 인상' },
    { value: '귀공자상', desc: '깔끔하고 세련된 도련님 이미지' },
    { value: '동안/귀여운 상', desc: '실제 나이보다 어려 보이는 동안' },
    { value: '지적인 상', desc: '차분하고 이성적인 분위기' },
    { value: '연예인상', desc: '준수한 이목구비, 연예인급 외모' },
    { value: '강인한 상', desc: '운동선수형, 건강하고 단단한 인상' },
    { value: '댄디한 상', desc: '단정하고 깔끔한 슈트 잘 어울리는 타입' },
    { value: '소년 감성', desc: '천진난만하고 순수한 분위기' },
    { value: '평균', desc: '무난한 인상, 특별히 눈에 띄지 않음' },
  ],
  F: [
    { value: '청순상', desc: '깨끗하고 자연스러운 분위기, 맑은 이미지' },
    { value: '귀여운/동안상', desc: '앳되고 사랑스러운 인상, 나이보다 어려 보임' },
    { value: '동양 미인상', desc: '단아하고 우아한 동양적 미인' },
    { value: '세련된 상', desc: '도시적이고 세련된 분위기' },
    { value: '섹시한 상', desc: '성숙하고 매력적인 이미지' },
    { value: '화사한 상', desc: '밝고 화사한 분위기, 눈에 띄는 외모' },
    { value: '지적인 상', desc: '차분하고 지적인 분위기, 단아한 이미지' },
    { value: '서구적 미인상', desc: '이목구비 뚜렷, 서양적 느낌의 외모' },
    { value: '연예인상', desc: '연예인급 외모, 매우 예쁨' },
    { value: '평균', desc: '무난한 인상, 특별히 눈에 띄지 않음' },
  ],
};

/* ── 외모 스타일 (복수 선택 드롭다운) ── */
export const appearanceStyleOptions = {
  M: [
    { value: '호감형', desc: '편안하고 좋은 첫인상' },
    { value: '지적형', desc: '안경·깔끔·차분한 이미지' },
    { value: '듬직형', desc: '체격 좋고 믿음직한 인상' },
    { value: '세련형', desc: '패션 감각·도시적 이미지' },
    { value: '건강미형', desc: '운동·건강한 체형' },
    { value: '댄디형', desc: '깔끔한 슈트·단정한 이미지' },
    { value: '자연형', desc: '꾸밈없이 자연스러운 이미지' },
  ],
  F: [
    { value: '세련형', desc: '패션 감각·도시적 이미지' },
    { value: '청순형', desc: '자연스럽고 깨끗한 이미지' },
    { value: '귀여운형', desc: '동안·사랑스러운 이미지' },
    { value: '지적형', desc: '차분하고 단아한 이미지' },
    { value: '건강미형', desc: '운동·건강한 체형' },
    { value: '화려형', desc: '눈에 띄는 화려한 이미지' },
    { value: '자연형', desc: '꾸밈없이 편안한 이미지' },
  ],
};

/* ── 취미 (복수 선택) ── */
export const hobbyOptions = [
  { value: '골프', emoji: '⛳' },
  { value: '테니스', emoji: '🎾' },
  { value: '필라테스/요가', emoji: '🧘' },
  { value: '헬스/크로스핏', emoji: '🏋️' },
  { value: '러닝/마라톤', emoji: '🏃' },
  { value: '수영', emoji: '🏊' },
  { value: '등산/하이킹', emoji: '🥾' },
  { value: '여행', emoji: '✈️' },
  { value: '와인/미식', emoji: '🍷' },
  { value: '독서', emoji: '📚' },
  { value: '영화/넷플릭스', emoji: '🎬' },
  { value: '캠핑', emoji: '🏕️' },
  { value: '음악/악기', emoji: '🎵' },
  { value: '요리/베이킹', emoji: '🍳' },
  { value: '반려동물', emoji: '🐶' },
  { value: '투자/재테크', emoji: '📈' },
  { value: '사진/영상', emoji: '📸' },
  { value: '게임', emoji: '🎮' },
  { value: '봉사활동', emoji: '🤝' },
  { value: '드라이브', emoji: '🚗' },
];

/* ── 탈모 상태 옵션 (성별 분리) ── */
export const hairLossOptions = {
  M: [
    { value: '없음', desc: '탈모 증상 없음' },
    { value: '초기 (M자 등)', desc: '이마 라인·M자 후퇴 초기' },
    { value: '진행중', desc: '정수리·전두부 진행 중' },
    { value: '심한편', desc: '넓은 범위 탈모' },
    { value: '관리중 (치료/이식)', desc: '약물치료 또는 모발이식 후' },
  ],
  F: [
    { value: '없음', desc: '탈모 증상 없음' },
    { value: '가르마 숱 감소', desc: '가르마 벌어짐·숱 줄어듦' },
    { value: '전체적 숱 감소', desc: '전체적으로 가늘어짐' },
    { value: '관리중 (치료중)', desc: '약물·시술 치료 진행 중' },
  ],
};

/*
 * ── 집안/가족 세부 항목 옵션 (2026 한국 결혼시장 기준) ──
 *
 * 프리미엄 결혼정보업체에서 가족 배경은 교제·성사 확률에
 * 직접적 영향을 미침. 아래 기준은 2026 시장 현실 반영.
 */

export const maritalStatusOptions = [
  { value: '초혼', desc: '결혼 이력 없음' },
  { value: '돌싱(이혼)', desc: '이혼 경험' },
  { value: '돌싱(사별)', desc: '배우자 사별' },
  { value: '재혼', desc: '재혼 (2회 이상 결혼)' },
];

export const birthOrderOptions = {
  M: ['장남', '차남', '삼남', '막내아들', '외동아들'],
  F: ['장녀', '차녀', '삼녀', '막내딸', '외동딸'],
};

export const parentWealthOptions = [
  { value: '최상', desc: '대자산가·재벌가·고위 전문직', score: 97 },
  { value: '상', desc: '고소득 전문직·임원·사업가', score: 88 },
  { value: '중상', desc: '안정적 고소득·자가 보유 가정', score: 78 },
  { value: '중', desc: '평균 수준 소득·생활 안정', score: 65 },
  { value: '중하', desc: '평균 이하 소득·자산 부족', score: 50 },
  { value: '하', desc: '경제적 어려움', score: 35 },
];

export const parentJobOptions = [
  { value: '전문직/임원', desc: '의사·변호사·대기업 임원', score: 95 },
  { value: '고위공직/교수', desc: '고위공무원·대학교수', score: 90 },
  { value: '공무원/교직', desc: '일반 공무원·교사', score: 82 },
  { value: '대기업/공기업', desc: '대기업 또는 공기업 재직', score: 80 },
  { value: '중견기업', desc: '중견기업 재직', score: 72 },
  { value: '사업가(대규모)', desc: '매출 상위 법인 대표·오너', score: 92 },
  { value: '사업가(중규모)', desc: '안정 매출 법인 운영', score: 82 },
  { value: '자영업(안정)', desc: '안정적 자영업·소규모 사업', score: 70 },
  { value: '자영업(불안정)', desc: '불안정 자영업', score: 50 },
  { value: '은퇴(안정)', desc: '연금/자산 기반 안정 은퇴', score: 75 },
  { value: '은퇴(불안정)', desc: '불안정 은퇴', score: 45 },
  { value: '전업주부', desc: '전업주부 (배우자 기준)', score: 65 },
  { value: '무직/미상', desc: '무직 또는 파악 불가', score: 35 },
];

export const parentAssetOptions = [
  { value: '500억 이상', desc: '재벌/대자산가', score: 99 },
  { value: '200~500억', desc: '대규모 자산가', score: 97 },
  { value: '100~200억', desc: '자산가', score: 95 },
  { value: '50~100억', desc: '고자산가', score: 93 },
  { value: '30~50억', desc: '우량 자산', score: 90 },
  { value: '20~30억', desc: '상류층', score: 87 },
  { value: '10~20억', desc: '준상류', score: 83 },
  { value: '5~10억', desc: '중상 자가 보유', score: 78 },
  { value: '3~5억', desc: '중산 자가 보유', score: 68 },
  { value: '1~3억', desc: '소형 자가/전세', score: 52 },
  { value: '1억 미만', desc: '자산 적음', score: 38 },
];

export const retirementPrepOptions = [
  { value: '완비', desc: '국민+퇴직+개인연금+보험 완비', score: 95 },
  { value: '양호', desc: '국민+퇴직연금 또는 자산 운용', score: 82 },
  { value: '보통', desc: '국민연금+자가 보유', score: 68 },
  { value: '부족', desc: '국민연금만 있음', score: 50 },
  { value: '미비', desc: '노후 준비 거의 없음', score: 30 },
];

export const siblingsOptions = [
  { value: '형제 모두 기혼/안정', desc: '모두 결혼, 경제 독립', score: 92 },
  { value: '형제 직장/안정', desc: '안정적 직장 재직', score: 82 },
  { value: '외동', desc: '형제 없음', score: 78 },
  { value: '형제 보통', desc: '특이사항 없음', score: 68 },
  { value: '형제 미취업/불안정', desc: '취업 전 또는 불안정', score: 50 },
  { value: '형제 부양 필요', desc: '경제적 부양 필요', score: 35 },
];

export const familyRiskOptions = [
  { value: '없음', desc: '특이사항 없음', score: 95 },
  { value: '사별', desc: '부모 중 사별', score: 68 },
  { value: '이혼', desc: '부모 이혼', score: 58 },
  { value: '재혼', desc: '부모 재혼 가정', score: 55 },
  { value: '건강문제', desc: '부모 중대 질환·간병', score: 52 },
  { value: '부양가족', desc: '부양 필요 가족 있음', score: 45 },
  { value: '부채', desc: '가족 부채 이슈', score: 35 },
];

/*
 * ── 각 입력 필드별 배점 가중치 (실시간 표시용) ──
 *
 * overall = 성별 무관 평균 기준 (within% × 카테고리%)
 * overallM / overallF = 성별별 가중치 적용 시 값
 *   → MemberRegistrationModal에서 회원 성별에 따라 자동 선택
 */
export const fieldWeights = {
  // 직업/학력 (남30% / 여20% / 평균25%)
  jobCategory: { category: 'career', within: 65, overall: 16.3, overallM: 19.5, overallF: 13.0, label: '직군' },
  edu:         { category: 'career', within: 35, overall: 8.8,  overallM: 10.5, overallF: 7.0,  label: '학력' },
  // 경제력 (남25% / 여10% / 평균18%)
  income:      { category: 'wealth', within: 40, overall: 7.2,  overallM: 10.0, overallF: 4.0,  label: '연봉' },
  financial:   { category: 'wealth', within: 35, overall: 6.3,  overallM: 8.8,  overallF: 3.5,  label: '금융자산' },
  realEstate:  { category: 'wealth', within: 25, overall: 4.5,  overallM: 6.3,  overallF: 2.5,  label: '부동산자산' },
  // 외모/자기관리 (남10% / 여30% / 평균20%)
  appearanceManager: { category: 'appearance', within: 30, overall: 6.0, overallM: 3.0, overallF: 9.0, label: '외모(매니저 주관)' },
  height:         { category: 'appearance', within: 15, overall: 3.0, overallM: 1.5, overallF: 4.5, label: '키' },
  bodyType:       { category: 'appearance', within: 15, overall: 3.0, overallM: 1.5, overallF: 4.5, label: '체형' },
  appearanceStyle:{ category: 'appearance', within: 15, overall: 3.0, overallM: 1.5, overallF: 4.5, label: '외모 스타일' },
  hairLoss:       { category: 'appearance', within: 15, overall: 3.0, overallM: 1.5, overallF: 4.5, label: '탈모 상태' },
  weight:         { category: 'appearance', within: 10, overall: 2.0, overallM: 1.0, overallF: 3.0, label: '몸무게(BMI)' },
  // 집안/가족 (남20% / 여20% / 평균20%) — 2025년 급상승
  parentWealth:  { category: 'family', within: 20, overall: 4.0, overallM: 4.0, overallF: 4.0, label: '부모 재력' },
  parentJob:     { category: 'family', within: 15, overall: 3.0, overallM: 3.0, overallF: 3.0, label: '부모 현직업' },
  parentPastJob: { category: 'family', within: 10, overall: 2.0, overallM: 2.0, overallF: 2.0, label: '부모 과거직업' },
  parentAssets:  { category: 'family', within: 30, overall: 6.0, overallM: 6.0, overallF: 6.0, label: '부모 자산' },
  retirementPrep:{ category: 'family', within: 15, overall: 3.0, overallM: 3.0, overallF: 3.0, label: '노후 연금' },
  siblings:      { category: 'family', within: 5, overall: 1.0, overallM: 1.0, overallF: 1.0, label: '형제 상황' },
  familyRisk:    { category: 'family', within: 5, overall: 1.0, overallM: 1.0, overallF: 1.0, label: '가족 리스크' },
  // 나이/결혼적기 (남8% / 여15% / 평균12%)
  age:         { category: 'age', within: 100, overall: 12, overallM: 8, overallF: 15, label: '나이/결혼적기' },
  // 라이프스타일 (남7% / 여5% / 평균5%)
  hobbies: { category: 'lifestyle', within: 40, overall: 2.0, overallM: 2.8, overallF: 2.0, label: '취미' },
  smoke:   { category: 'lifestyle', within: 35, overall: 1.8, overallM: 2.5, overallF: 1.8, label: '흡연' },
  drink:   { category: 'lifestyle', within: 25, overall: 1.3, overallM: 1.8, overallF: 1.3, label: '음주' },
};

export const compareColumns = [
  { key: 'id', label: '후보' },
  { key: 'agency', label: '업체' },
  { key: 'matchScore', label: '총합' },
  { key: 'condition', label: '조건' },
  { key: 'values', label: '가치관' },
  { key: 'saju', label: '궁합' },
  { key: 'note', label: '궁합 코멘트' },
];

/* ── 정산 단계 / 상태 ── */
export const settlementStages = ['소개 완료', '교제 진입', '교제 유지', '성사 후보', '성사 확정'];
export const settlementStatuses = ['정산 예정', '검수중', '대기', '정산완료'];

/* ── 이상형 선호도 ── */
export const idealTypeOptions = [
  { value: '매우 중요', multiplier: 3.0, desc: '가장 중시 (가중치 3배)' },
  { value: '중요', multiplier: 2.0, desc: '중시 (가중치 2배)' },
  { value: '보통', multiplier: 1.0, desc: '기본 반영' },
  { value: '덜 중요', multiplier: 0.5, desc: '약간 반영' },
  { value: '상관없음', multiplier: 0.0, desc: '반영 안함' },
];

export const idealTypeCategories = [
  { key: 'wealth', label: '경제력', icon: '💰', desc: '연봉, 자산, 부동산' },
  { key: 'appearance', label: '외모', icon: '✨', desc: '키, 체형, 스타일' },
  { key: 'career', label: '직업/학력', icon: '💼', desc: '직군, 학력' },
  { key: 'age', label: '나이', icon: '📅', desc: '결혼적기' },
  { key: 'lifestyle', label: '라이프스타일', icon: '🎯', desc: '취미, 건강습관' },
  { key: 'family', label: '집안', icon: '🏠', desc: '가족 배경' },
];

export const disputeCategories = ['우회접촉', '허위정보', '정산분쟁', '정보무단공유', '약속불이행', '프로필도용'];
export const disputeLevels = ['주의', '중재중', '증빙검토', '패널티', '해결'];
export const disputePriorities = ['높음', '중간', '낮음'];
