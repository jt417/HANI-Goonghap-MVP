import {
  jobCategoryOptions,
  parentWealthOptions, parentJobOptions, parentAssetOptions,
  retirementPrepOptions, siblingsOptions, familyRiskOptions,
} from './constants';

export function buildPercentile(score, thresholds) {
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

/* ══════════════════════════════════════════════ */
/* ── 개별 필드 점수 산출 (0~100) ──              */
/* ══════════════════════════════════════════════ */

// ── 경제력 (나이+성별 차등, 2025-2026 통계청/국세청 기준) ──

/*
 * 연봉 점수: 동일 연봉이라도 나이·성별에 따라 점수가 달라짐.
 * 28세 남성 7000만 → A급(85점대), 40세 남성 7000만 → B급(72점대)
 *
 * 벤치마크 출처:
 *  - 통계청 2024 임금근로일자리 소득(연령별 분위)
 *  - 국세청 근로소득 백분위(상위 5% ≈ 1.3억, 상위 10% ≈ 1억)
 *  - 듀오 성혼 남성 기준 연봉 7000만(36.9세) = B~B+급
 *  - 가연 이상적 배우자 연봉: 남 6000만, 여 4400만
 *
 * 티어: [S=95, A=85, B=72, C=60], 미만=40~60 보간
 */
function _interpolateByTier(value, thresholds) {
  const [s, a, b, c] = thresholds;
  if (value >= s) return Math.min(98, 95 + ((value - s) / s) * 10);
  if (value >= a) return 85 + ((value - a) / (s - a)) * 10;
  if (value >= b) return 72 + ((value - b) / (a - b)) * 13;
  if (value >= c) return 60 + ((value - c) / (b - c)) * 12;
  if (c > 0) return 40 + (value / c) * 20;
  return 40;
}

function scoreIncome(income, gender, birthYear) {
  if (!income || income <= 0) return 40;
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  let t; // [S(상위5%), A(상위15%), B(상위35%), C(상위65%)] — 만원
  if (gender === 'M') {
    if (age <= 29)      t = [8000,  5500,  4200, 3200];
    else if (age <= 34) t = [11000, 7500,  5500, 4000];
    else if (age <= 39) t = [14000, 9500,  7000, 5000];
    else if (age <= 44) t = [17000, 12000, 8500, 6000];
    else                t = [19000, 14000, 9500, 6500];
  } else {
    if (age <= 29)      t = [5500,  4000,  3200, 2600];
    else if (age <= 34) t = [7000,  5000,  3800, 3000];
    else if (age <= 39) t = [8000,  6000,  4500, 3400];
    else                t = [8500,  6500,  4800, 3600];
  }
  return Math.round(_interpolateByTier(income, t));
}

/*
 * 금융자산 점수: 나이별 차등 (성별 무관 — 자산축적은 성별 차이 적음)
 * 벤치마크: 2025 가계금융복지조사 + 신한은행 보통사람 금융생활 보고서
 *  - 20대 미혼 평균 금융자산 ~3625만
 *  - 30초 개인 금융자산 평균 ~5000-8000만
 *  - 40대 가구 평균 순자산 4.4억 (금융자산 비중 24%)
 */
function scoreFinancial(financial, birthYear) {
  if (!financial || financial <= 0) return 35;
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  let t; // [S, A, B, C] — 만원
  if (age <= 29)      t = [15000, 7000,  3500, 1500];
  else if (age <= 34) t = [30000, 15000, 7000, 3500];
  else if (age <= 39) t = [50000, 25000, 12000, 6000];
  else                t = [80000, 40000, 20000, 10000];

  return Math.round(_interpolateByTier(financial, t));
}

function scoreRealEstate(value, birthYear) {
  // value: 만원 단위, 연령대별 중위값 기준 평가
  if (!value || value <= 0) return 40;
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  // 연령대별 중위값(만원): 통계청 가계금융복지조사 기반
  // 20대 ~0, 30초 ~15000, 30후 ~25000, 40대 ~35000
  let thresholds;
  if (age <= 29)      thresholds = [30000, 15000, 8000, 3000];
  else if (age <= 34) thresholds = [50000, 30000, 15000, 8000];
  else if (age <= 39) thresholds = [80000, 50000, 25000, 15000];
  else                thresholds = [120000, 80000, 35000, 20000];

  if (value >= thresholds[0]) return 96;
  if (value >= thresholds[1]) return 90;
  if (value >= thresholds[2]) return 78;
  if (value >= thresholds[3]) return 65;
  return 40 + (value / thresholds[3]) * 25;
}

// ── 직업/학력 ──

function scoreJobCategory(jobCategory, jobText) {
  const job = jobCategoryOptions.find((j) => j.value === jobCategory);
  if (job) {
    const tierMap = { 5: 95, 4: 85, 3: 72, 2: 60, 1: 50 };
    return tierMap[job.tier] || 55;
  }
  if (!jobText) return 55;
  const t = jobText.toLowerCase();
  if (/의사|변호사|회계사|약사|판사|검사/.test(t)) return 95;
  if (/대기업|삼성|현대|LG|SK|포스코/.test(t)) return 85;
  if (/공무원|공기업/.test(t)) return 85;
  if (/외국계|IT|테크|금융/.test(t)) return 82;
  return 65;
}

function scoreEdu(edu) {
  const map = {
    '박사/전문대학원': 97,
    '의치한약수': 96,
    'SKY': 93,
    '해외 상위대학': 92,
    '석사 (SKY/해외)': 90,
    '석사 (일반)': 85,
    '석사': 85,
    '대학원': 85,
    '4년제 인서울 상위권': 82,
    '4년제 상위권': 82,
    '해외대학': 78,
    '해외대': 78,
    '4년제 인서울': 72,
    '4년제 일반': 72,
    '4년제 지방': 62,
    '4년제': 62,
    '전문대': 50,
    '고졸': 40,
  };
  return map[edu] || 60;
}

// ── 외모/자기관리 ──

function scoreHeight(height, gender) {
  if (!height) return 50;
  if (gender === 'M') {
    // 최적 구간: 181-186 (최고점 95)
    if (height >= 181 && height <= 186) return 95;
    // 최적 위: 점차 감점
    if (height > 186) return Math.max(60, 95 - (height - 186) * 4);
    // 최적 아래: 점차 감점
    if (height >= 179) return 90;
    if (height >= 177) return 84;
    if (height >= 175) return 76;
    if (height >= 173) return 68;
    if (height >= 170) return 58;
    return Math.max(30, 58 - (170 - height) * 3);
  }
  // 여성: 최적 구간 165-169 (최고점 95)
  if (height >= 165 && height <= 169) return 95;
  // 최적 위: 점차 감점
  if (height > 169) return Math.max(60, 95 - (height - 169) * 4);
  // 최적 아래: 점차 감점
  if (height >= 163) return 88;
  if (height >= 161) return 80;
  if (height >= 159) return 72;
  if (height >= 157) return 64;
  if (height >= 155) return 56;
  return Math.max(30, 56 - (155 - height) * 3);
}

function scoreBodyType(bodyType) {
  const top = ['슬림탄탄', '균형형'];
  const high = ['슬림', '건강미', '글래머', '볼륨'];
  const mid = ['보통', '건장', '근육형'];
  const low = ['마른', '통통'];
  if (top.includes(bodyType)) return 92;
  if (high.includes(bodyType)) return 84;
  if (mid.includes(bodyType)) return 72;
  if (low.includes(bodyType)) return 60;
  return 50; // 과체중 등
}

function scoreAppearanceStyle(styles) {
  if (!styles || styles.length === 0) return 55;
  if (styles.length >= 3) return 90;
  if (styles.length >= 2) return 82;
  return 70;
}

/*
 * ── 매니저 주관 외모 평가 (1~10점) ──
 * 매니저가 상담 시 직접 부여하는 외모 점수.
 * 10: 연예인급  9: 매우 잘생김/예쁨  8: 잘생김/예쁨  7: 준수
 * 6: 평균 이상  5: 평균  4: 평균 이하  3: 아쉬운 편
 * 2: 많이 아쉬움  1: 관리 필요
 */
function scoreAppearanceManager(score) {
  if (!score || score <= 0) return 55; // 미입력 시 중립
  const clamped = Math.min(10, Math.max(1, score));
  // 비선형 매핑: 5점(평균)=62, 7점=78, 10점=98
  const map = [0, 22, 32, 42, 52, 62, 70, 78, 85, 92, 98];
  return map[clamped];
}

function scoreBMI(height, weight, gender) {
  if (!height || !weight) return 60;
  const h = height / 100;
  const bmi = weight / (h * h);
  if (gender === 'M') {
    if (bmi >= 21 && bmi <= 25) return 90;
    if (bmi >= 19 && bmi <= 27) return 78;
    if (bmi >= 17 && bmi <= 30) return 62;
    return 45;
  }
  if (bmi >= 18.5 && bmi <= 23) return 90;
  if (bmi >= 17 && bmi <= 25) return 78;
  if (bmi >= 16 && bmi <= 28) return 62;
  return 45;
}

/*
 * ── 탈모 점수 ──
 * 남성: 결혼시장에서 탈모는 외모 경쟁력에 큰 영향.
 *       관리중(치료/이식)은 적극적 자기관리 시그널로 초기보다 높게.
 * 여성: 상대적으로 드물지만 숱 감소 시 이미지에 영향.
 */
function scoreHairLoss(hairLoss, gender) {
  if (!hairLoss || hairLoss === '없음') return 95;
  if (gender === 'M') {
    const map = {
      '초기 (M자 등)': 70,
      '관리중 (치료/이식)': 74,
      '진행중': 48,
      '심한편': 30,
    };
    return map[hairLoss] || 60;
  }
  // Female
  const map = {
    '가르마 숱 감소': 78,
    '관리중 (치료중)': 72,
    '전체적 숱 감소': 55,
  };
  return map[hairLoss] || 70;
}

/*
 * ── 나이 점수 (성별 차등) ──
 *
 * ▸ 여성 — 노산 리스크가 핵심 감점 요인
 *   의학적 근거: 대한산부인과학회 기준 만 35세부터 고령산모.
 *   35세 이후 난임률 급증(30% → 50%), 자연유산율 2배, 다운증후군 등 염색체 이상 위험 상승.
 *   결혼→임신 준비기간(평균 1-2년) 고려 시 33세 전후가 실질적 분기점.
 *
 * ▸ 남성 — 경제적 안정기 + 정자 질 저하 반영
 *   의학적 근거: 45세 이후 정자 DNA 손상률 증가, 자폐스펙트럼 위험 상승(JAMA 2014).
 *   너무 젊으면(~26) 경제력·사회적 안정성 부족 → 중간 감점.
 *   31-37 구간이 "경제적 안정 + 생물학적 건강" 최적 구간.
 */
export function scoreAge(age, gender) {
  if (!age || age <= 0) return 50;

  if (gender === 'F') {
    // 여성: 노산 리스크 중심 — 35세 이후 급감
    if (age <= 25) return 88;  // 젊지만 시장 내 이른 편
    if (age <= 27) return 95;  // 최적
    if (age <= 29) return 93;
    if (age <= 30) return 88;
    if (age <= 31) return 82;
    if (age <= 32) return 76;
    if (age <= 33) return 70;
    if (age <= 34) return 62;  // 마지노선 진입
    if (age <= 35) return 52;  // 고령산모 기준 — 급감 시작
    if (age <= 36) return 44;
    if (age <= 37) return 38;
    if (age <= 38) return 32;
    if (age <= 39) return 28;
    if (age <= 40) return 24;
    return Math.max(15, 24 - (age - 40) * 3);
  }

  // 남성: 경제안정기 + 생물학적 요인
  if (age <= 26) return 72;   // 아직 경제적 미성숙
  if (age <= 28) return 82;
  if (age <= 30) return 88;
  if (age <= 33) return 92;   // 최적: 경제 안정 + 젊음
  if (age <= 35) return 90;
  if (age <= 37) return 85;
  if (age <= 39) return 78;
  if (age <= 41) return 70;
  if (age <= 43) return 62;
  if (age <= 45) return 52;   // 정자 질 저하 구간 진입
  if (age <= 48) return 42;
  if (age <= 50) return 34;
  return Math.max(20, 34 - (age - 50) * 3);
}

// ── 라이프스타일 ──

function scoreHobbies(hobbies) {
  if (!hobbies || hobbies.length === 0) return 40;
  if (hobbies.length >= 5) return 95;
  if (hobbies.length >= 4) return 88;
  if (hobbies.length >= 3) return 80;
  if (hobbies.length >= 2) return 70;
  return 58;
}

function scoreSmoke(smoke) {
  const map = { '비흡연': 95, '금연중': 78, '전자담배': 55, '가끔': 55, '흡연': 30 };
  return map[smoke] || 60;
}

function scoreDrink(drink) {
  const map = { '비음주': 90, '월 1~2회': 82, '가끔': 82, '주 1~2회': 68, '사교적': 68, '자주': 50, '즐기는편': 50 };
  return map[drink] || 65;
}

// ── 집안/가족 (세부 항목) ──

function _optionScore(value, options, fallback = 60) {
  if (!value) return fallback;
  const found = options.find((o) => o.value === value);
  return found ? found.score : fallback;
}

function scoreParentWealth(v) { return _optionScore(v, parentWealthOptions, 60); }
function scoreParentJob(v)    { return _optionScore(v, parentJobOptions, 60); }
function scoreParentAssets(v) { return _optionScore(v, parentAssetOptions, 55); }
function scoreRetirementPrep(v) { return _optionScore(v, retirementPrepOptions, 55); }
function scoreSiblings(v)     { return _optionScore(v, siblingsOptions, 65); }
function scoreFamilyRisk(v)   { return _optionScore(v, familyRiskOptions, 70); }

/* ══════════════════════════════════════════════ */
/* ── SABCD 선호도 등급 (2026 시장 기준) ──         */
/* ══════════════════════════════════════════════ */

/*
 * 각 함수는 { grade: 'S'|'A'|'B'|'C'|'D', note: string } 반환
 * S=최상위(상위5%), A=상위(상위15%), B=중상(상위35%), C=보통(상위65%), D=하위
 *
 * 2026 한국 결혼시장 벤치마크 기반
 * - 연봉: 성별+연령대별 차등 (남성 30초 S=1.5억+, 여성 30초 S=1억+)
 * - 금융자산: 연령대별 차등 (30대 초반 S=10억+)
 * - 키: 남 S=183+, 여 S=168+
 * - 학력: 의대/SKY/KAIST = S, 해외대/석사 = A
 * - 직업: 전문직 tier5 = S, 대기업/금융 tier4 = A
 */

function _pickGrade(value, thresholds) {
  const [s, a, b, c] = thresholds;
  if (value >= s) return 'S';
  if (value >= a) return 'A';
  if (value >= b) return 'B';
  if (value >= c) return 'C';
  return 'D';
}

const GRADE_NOTES = { S: '최상위', A: '상위', B: '중상', C: '보통', D: '하위' };

export function gradeIncome(income, gender, birthYear) {
  if (!income || income <= 0) return { grade: 'D', note: '미입력' };
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  // 2025-2026 통계청+국세청 기반 연령·성별 소득분위 [S=상위5%, A=15%, B=35%, C=65%]
  let t; // [S, A, B, C] thresholds in 만원
  if (gender === 'M') {
    if (age <= 29)      t = [8000,  5500,  4200, 3200];
    else if (age <= 34) t = [11000, 7500,  5500, 4000];
    else if (age <= 39) t = [14000, 9500,  7000, 5000];
    else if (age <= 44) t = [17000, 12000, 8500, 6000];
    else                t = [19000, 14000, 9500, 6500];
  } else {
    if (age <= 29)      t = [5500,  4000,  3200, 2600];
    else if (age <= 34) t = [7000,  5000,  3800, 3000];
    else if (age <= 39) t = [8000,  6000,  4500, 3400];
    else                t = [8500,  6500,  4800, 3600];
  }
  const g = _pickGrade(income, t);
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeFinancial(financial, birthYear) {
  if (!financial || financial <= 0) return { grade: 'D', note: '미입력' };
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  // 2025 가계금융복지조사 + 신한은행 보통사람 금융생활 보고서 기준
  // 개인 금융자산(예적금+주식+펀드+연금), 만원 단위
  let t; // [S=상위5%, A=상위15%, B=상위35%, C=상위65%]
  if (age <= 29)      t = [15000, 7000,  3500, 1500];
  else if (age <= 34) t = [30000, 15000, 7000, 3500];
  else if (age <= 39) t = [50000, 25000, 12000, 6000];
  else                t = [80000, 40000, 20000, 10000];

  const g = _pickGrade(financial, t);
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeRealEstate(value, birthYear) {
  if (!value || value <= 0) return { grade: 'D', note: '없음' };
  const age = birthYear ? 2026 - Number(birthYear) : 30;

  let t; // 만원 기준, 연령대별 중위값 참조
  if (age <= 29)      t = [30000, 15000, 8000, 3000];
  else if (age <= 34) t = [50000, 30000, 15000, 8000];
  else if (age <= 39) t = [80000, 50000, 25000, 15000];
  else                t = [120000, 80000, 35000, 20000];

  const g = _pickGrade(value, t);
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeHeight(height, gender) {
  if (!height) return { grade: 'C', note: '미입력' };
  const s = scoreHeight(height, gender);
  const g = s >= 90 ? 'S' : s >= 80 ? 'A' : s >= 70 ? 'B' : s >= 58 ? 'C' : 'D';
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeEdu(edu) {
  const map = {
    '박사/전문대학원': 'S', '의치한약수': 'S', 'SKY': 'S', '해외 상위대학': 'S',
    '석사 (SKY/해외)': 'A', '석사 (일반)': 'A', '석사': 'A', '대학원': 'A',
    '4년제 인서울 상위권': 'A', '4년제 상위권': 'A',
    '해외대학': 'B', '해외대': 'B', '4년제 인서울': 'B',
    '4년제 일반': 'C', '4년제': 'C', '4년제 지방': 'C',
    '전문대': 'D', '고졸': 'D',
  };
  const g = map[edu] || 'C';
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeJob(jobCategory) {
  const tierMap = { 5: 'S', 4: 'A', 3: 'B', 2: 'C', 1: 'D' };
  const job = jobCategoryOptions.find((j) => j.value === jobCategory);
  const g = job ? (tierMap[job.tier] || 'C') : 'C';
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeSmoke(smoke) {
  const map = { '비흡연': 'S', '금연중': 'A', '전자담배': 'C', '가끔': 'C', '흡연': 'D' };
  const g = map[smoke] || 'C';
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeDrink(drink) {
  const map = { '비음주': 'S', '월 1~2회': 'A', '가끔': 'A', '주 1~2회': 'B', '사교적': 'B', '자주': 'D', '즐기는편': 'C' };
  const g = map[drink] || 'B';
  return { grade: g, note: GRADE_NOTES[g] };
}

function _gradeFromScore(score) {
  if (score >= 90) return { grade: 'S', note: '최상위' };
  if (score >= 78) return { grade: 'A', note: '상위' };
  if (score >= 65) return { grade: 'B', note: '중상' };
  if (score >= 50) return { grade: 'C', note: '보통' };
  return { grade: 'D', note: '하위' };
}

export function gradeParentWealth(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, parentWealthOptions, 60));
}
export function gradeParentJob(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, parentJobOptions, 60));
}
export function gradeParentAssets(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, parentAssetOptions, 55));
}
export function gradeRetirementPrep(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, retirementPrepOptions, 55));
}
export function gradeSiblings(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, siblingsOptions, 65));
}
export function gradeFamilyRisk(v) {
  if (!v) return { grade: 'C', note: '미입력' };
  return _gradeFromScore(_optionScore(v, familyRiskOptions, 70));
}

export function gradeAge(age, gender) {
  if (!age || age <= 0) return { grade: 'C', note: '미입력' };
  if (gender === 'F') {
    if (age <= 29) return { grade: 'S', note: '최적기' };
    if (age <= 31) return { grade: 'A', note: '적정' };
    if (age <= 33) return { grade: 'B', note: '양호' };
    if (age <= 35) return { grade: 'C', note: '마지노선' };
    return { grade: 'D', note: '고위험' };
  }
  if (age <= 27) return { grade: 'B', note: '이른편' };
  if (age <= 33) return { grade: 'S', note: '최적기' };
  if (age <= 37) return { grade: 'A', note: '적정' };
  if (age <= 41) return { grade: 'B', note: '양호' };
  if (age <= 45) return { grade: 'C', note: '늦은편' };
  return { grade: 'D', note: '고위험' };
}

export function gradeHobbies(hobbies) {
  if (!hobbies || hobbies.length === 0) return { grade: 'D', note: '없음' };
  if (hobbies.length >= 5) return { grade: 'S', note: '매우 다양' };
  if (hobbies.length >= 4) return { grade: 'A', note: '활발' };
  if (hobbies.length >= 3) return { grade: 'B', note: '적당' };
  if (hobbies.length >= 2) return { grade: 'C', note: '보통' };
  return { grade: 'D', note: '부족' };
}

export function gradeHairLoss(hairLoss, gender) {
  if (!hairLoss || hairLoss === '없음') return { grade: 'S', note: '양호' };
  if (gender === 'M') {
    const map = { '초기 (M자 등)': 'B', '관리중 (치료/이식)': 'B', '진행중': 'D', '심한편': 'D' };
    const g = map[hairLoss] || 'C';
    return { grade: g, note: GRADE_NOTES[g] };
  }
  const map = { '가르마 숱 감소': 'B', '관리중 (치료중)': 'B', '전체적 숱 감소': 'C' };
  const g = map[hairLoss] || 'C';
  return { grade: g, note: GRADE_NOTES[g] };
}

export function gradeAppearanceManager(score) {
  if (!score || score <= 0) return { grade: 'C', note: '미입력' };
  if (score >= 9) return { grade: 'S', note: '최상위' };
  if (score >= 7) return { grade: 'A', note: '상위' };
  if (score >= 5) return { grade: 'B', note: '보통' };
  if (score >= 3) return { grade: 'C', note: '하위' };
  return { grade: 'D', note: '매우 낮음' };
}

export function gradeBodyType(bodyType) {
  const sGrade = ['슬림탄탄', '균형형', '건강미', '건강미형'];
  const aGrade = ['슬림', '글래머'];
  const bGrade = ['보통', '건장', '근육형', '근육', '듬직', '관리'];
  if (sGrade.includes(bodyType)) return { grade: 'S', note: '최적' };
  if (aGrade.includes(bodyType)) return { grade: 'A', note: '양호' };
  if (bGrade.includes(bodyType)) return { grade: 'B', note: '보통' };
  return { grade: 'C', note: GRADE_NOTES.C };
}

export function gradeOverall(score) {
  if (score >= 90) return { grade: 'S', note: '최상위' };
  if (score >= 80) return { grade: 'A', note: '상위' };
  if (score >= 70) return { grade: 'B', note: '중상' };
  if (score >= 60) return { grade: 'C', note: '보통' };
  return { grade: 'D', note: '하위' };
}

/** 전체 필드 등급 일괄 산출 */
export function gradeMember(form) {
  const calcAge = form.birthYear ? 2026 - Number(form.birthYear) : (form.age || 0);
  return {
    income: gradeIncome(form.income, form.gender, form.birthYear),
    financial: gradeFinancial(form.financial, form.birthYear),
    realEstate: gradeRealEstate(form.realEstate, form.birthYear),
    height: gradeHeight(form.height, form.gender),
    edu: gradeEdu(form.edu),
    jobCategory: gradeJob(form.jobCategory),
    smoke: gradeSmoke(form.smoke),
    drink: gradeDrink(form.drink),
    age: gradeAge(calcAge, form.gender),
    hobbies: gradeHobbies(form.hobbies),
    hairLoss: gradeHairLoss(form.hairLoss, form.gender),
    bodyType: gradeBodyType(form.bodyType),
    appearanceManager: gradeAppearanceManager(form.appearanceScore),
    // 집안/가족 세부
    parentWealth: gradeParentWealth(form.parentWealth),
    parentJob: gradeParentJob(form.parentJob),
    parentPastJob: gradeParentJob(form.parentPastJob),
    parentAssets: gradeParentAssets(form.parentAssets),
    retirementPrep: gradeRetirementPrep(form.retirementPrep),
    siblings: gradeSiblings(form.siblings),
    familyRisk: gradeFamilyRisk(form.familyRisk),
  };
}

/* ══════════════════════════════════════════════ */
/* ── 종합 점수 산출 ──                            */
/* ══════════════════════════════════════════════ */

export function scoreMember(form, weights, thresholds) {
  // 성별에 따라 가중치 자동 선택 (남성: weightM, 여성: weightF, 미지정: weight)
  const genderKey = form.gender === 'M' ? 'weightM' : form.gender === 'F' ? 'weightF' : 'weight';
  const weightMap = Object.fromEntries(weights.map((item) => [item.key, item[genderKey] ?? item.weight]));
  const calcAge = form.birthYear ? 2026 - Number(form.birthYear) : (form.age || 0);

  // 경제력 (남 25% / 여 10%) — 나이+성별 차등
  const incomeScore = scoreIncome(form.income, form.gender, form.birthYear);
  const financialScore = scoreFinancial(form.financial, form.birthYear);
  const realEstateScore = scoreRealEstate(form.realEstate, form.birthYear);
  const wealth = Number(((incomeScore * 40 + financialScore * 35 + realEstateScore * 25) / 100).toFixed(1));

  // 외모/자기관리 (남 10% / 여 30%) — 매니저 주관 평가 포함
  const heightScore = scoreHeight(form.height, form.gender);
  const bodyScore = scoreBodyType(form.bodyType);
  const styleScore = scoreAppearanceStyle(form.appearanceStyles);
  const hairLossScore = scoreHairLoss(form.hairLoss, form.gender);
  const bmiScore = scoreBMI(form.height, form.weight, form.gender);
  const managerAppScore = scoreAppearanceManager(form.appearanceScore);
  const appearance = Number(((managerAppScore * 30 + heightScore * 15 + bodyScore * 15 + styleScore * 15 + hairLossScore * 15 + bmiScore * 10) / 100).toFixed(1));

  // 직업/학력 (남 30% / 여 20%)
  const jobScore = scoreJobCategory(form.jobCategory, form.job || form.jobDetail);
  const eduScore = scoreEdu(form.edu);
  const career = Number(((jobScore * 65 + eduScore * 35) / 100).toFixed(1));

  // 나이/결혼적기 (남 8% / 여 15%) — 성별 차등
  const ageScore = scoreAge(calcAge, form.gender);
  const ageCategory = Number(ageScore.toFixed(1));

  // 라이프스타일 (남 7% / 여 5%) — 종교 배점 제외
  const hobbyScore = scoreHobbies(form.hobbies);
  const smokeScore = scoreSmoke(form.smoke);
  const drinkScore = scoreDrink(form.drink);
  const lifestyle = Number(((hobbyScore * 40 + smokeScore * 35 + drinkScore * 25) / 100).toFixed(1));

  // 집안/가족 (남 20% / 여 20%) — 세부 항목
  const pwScore = scoreParentWealth(form.parentWealth);
  const pjScore = scoreParentJob(form.parentJob);
  const ppjScore = scoreParentJob(form.parentPastJob);
  const paScore = scoreParentAssets(form.parentAssets);
  const rpScore = scoreRetirementPrep(form.retirementPrep);
  const sibScore = scoreSiblings(form.siblings);
  const frScore = scoreFamilyRisk(form.familyRisk);
  const family = Number(((pwScore * 20 + paScore * 30 + pjScore * 15 + ppjScore * 10 + rpScore * 15 + sibScore * 5 + frScore * 5) / 100).toFixed(1));

  // 매니저 가산점 (최대 10점)
  const bonusItems = Array.isArray(form.managerBonusItems) ? form.managerBonusItems : [];
  const managerBonus = Math.min(10, bonusItems.reduce((sum, item) => sum + (item.score || 0), 0));

  // 종합 (성별별 가중치 적용 + 가산점)
  const baseOverall = Number((
    (wealth * (weightMap.wealth || 18) +
     appearance * (weightMap.appearance || 20) +
     career * (weightMap.career || 25) +
     ageCategory * (weightMap.age || 12) +
     lifestyle * (weightMap.lifestyle || 5) +
     family * (weightMap.family || 20)) / 100
  ).toFixed(1));
  const overall = Number(Math.min(100, baseOverall + managerBonus).toFixed(1));

  return {
    overallScore: overall,
    managerBonus,
    categories: {
      overall: { score: overall, ...buildPercentile(overall, thresholds) },
      wealth: { score: wealth, ...buildPercentile(wealth, thresholds) },
      appearance: { score: appearance, ...buildPercentile(appearance, thresholds) },
      career: { score: career, ...buildPercentile(career, thresholds) },
      age: { score: ageCategory, ...buildPercentile(ageCategory, thresholds) },
      lifestyle: { score: lifestyle, ...buildPercentile(lifestyle, thresholds) },
      family: { score: family, ...buildPercentile(family, thresholds) },
    },
    fieldScores: {
      income: incomeScore, financial: financialScore, realEstate: realEstateScore,
      height: heightScore, bodyType: bodyScore, appearanceStyle: styleScore, hairLoss: hairLossScore, weight: bmiScore, appearanceManager: managerAppScore,
      jobCategory: jobScore, edu: eduScore,
      age: ageScore,
      hobbies: hobbyScore, smoke: smokeScore, drink: drinkScore,
      parentWealth: pwScore, parentJob: pjScore, parentPastJob: ppjScore,
      parentAssets: paScore, retirementPrep: rpScore, siblings: sibScore, familyRisk: frScore,
    },
  };
}

/* ══════════════════════════════════════════════ */
/* ── 이상형 가중치 기반 매칭 점수 ──               */
/* ══════════════════════════════════════════════ */

const IDEAL_MULTIPLIER = { '매우 중요': 3, '중요': 2, '보통': 1, '덜 중요': 0.5, '상관없음': 0 };
const IDEAL_KEYS = ['wealth', 'appearance', 'career', 'age', 'lifestyle', 'family'];

/** idealType 객체 → 정규화된 % 가중치 반환 */
export function normalizeIdealWeights(idealType) {
  if (!idealType) return Object.fromEntries(IDEAL_KEYS.map((k) => [k, 100 / IDEAL_KEYS.length]));
  const raw = IDEAL_KEYS.map((k) => IDEAL_MULTIPLIER[idealType[k]] ?? 1);
  const sum = raw.reduce((s, v) => s + v, 0) || 1;
  return Object.fromEntries(IDEAL_KEYS.map((k, i) => [k, Number(((raw[i] / sum) * 100).toFixed(1))]));
}

/** 후보의 카테고리 점수에 이상형 가중치를 적용하여 매칭 점수 산출 */
export function calculateIdealMatchScore(candidateCategories, idealType) {
  const weights = normalizeIdealWeights(idealType);
  let score = 0;
  IDEAL_KEYS.forEach((k) => {
    const catScore = candidateCategories?.[k]?.score ?? 0;
    score += catScore * (weights[k] / 100);
  });
  return Number(score.toFixed(1));
}
