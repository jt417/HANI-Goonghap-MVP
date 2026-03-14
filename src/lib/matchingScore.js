/*
 * ══════════════════════════════════════════════════════════════
 * HANI 매칭 점수 계산 엔진
 *
 * 3가지 독립 점수:
 *   1. 조건매칭 (Condition) — 객관적 스펙 비교
 *   2. 가치관   (Values)    — 결혼 관련 가치관 일치도
 *   3. 사주궁합 (Saju)      — 만세력엔진 기반 사주 궁합
 *
 * 총합: condition×0.35 + values×0.35 + saju×0.30
 *       (사주 데이터 없으면 condition×0.50 + values×0.50)
 * ══════════════════════════════════════════════════════════════
 */

import { calculateCompatibility, STEM_ELEMENT, GENERATES, CONTROLS, getStemHap } from './saju';

// ── 연령대 → 추정 나이 ──
const AGE_RANGE_MID = {
  '20대 초반': 22, '20대 중반': 25, '20대 후반': 28,
  '30대 초반': 31, '30대 중반': 34, '30대 후반': 37,
  '40대 초반': 41, '40대 중반': 44, '40대 후반': 47,
};

// ── 키 범위 → 추정 키 ──
function parseHeightRange(range) {
  if (!range) return null;
  const m = range.match(/(\d+)~(\d+)/);
  if (m) return (parseInt(m[1]) + parseInt(m[2])) / 2;
  const single = range.match(/(\d+)/);
  return single ? parseInt(single[1]) : null;
}

// ── 소득 문자열 → 만원 단위 숫자 ──
function parseIncome(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const s = str.replace(/,/g, '');
  if (s.includes('억')) {
    const m = s.match(/([\d.]+)\s*억/);
    return m ? parseFloat(m[1]) * 10000 : 0;
  }
  const m2 = s.match(/([\d.]+)\s*만/);
  return m2 ? parseFloat(m2[1]) : 0;
}

// ── 소득 범위 → 추정 소득 (만원) ──
function parseIncomeRange(range) {
  if (!range) return 0;
  if (range.includes('2억 이상')) return 25000;
  if (range.includes('1.5억 이상')) return 17000;
  if (range.includes('1억 이상')) return 12000;
  if (range.includes('7,000만~1억')) return 8500;
  if (range.includes('5,000만~7,000만')) return 6000;
  if (range.includes('3,000만~5,000만')) return 4000;
  return 5000;
}

// ── 자산 문자열 → 총액 만원 ──
function parseAssets(str) {
  if (!str) return 0;
  let total = 0;
  const parts = str.split('/');
  for (const p of parts) {
    const m = p.match(/([\d.]+)\s*억/);
    if (m) total += parseFloat(m[1]) * 10000;
  }
  return total;
}

// ── 자산 범위 → 추정 총액 만원 ──
function parseAssetsRange(range) {
  if (!range) return 0;
  if (range.includes('10억 이상')) return 120000;
  if (range.includes('5~10억') || range.includes('5억 이상')) return 70000;
  if (range.includes('3~5억')) return 40000;
  if (range.includes('2~5억')) return 35000;
  if (range.includes('1~2억')) return 15000;
  return 10000;
}

// ── 학력 티어 ──
const EDU_TIER = {
  // internal members
  '서울대': 10, 'KAIST': 10, 'MIT': 10, 'Stanford': 10, 'NYU Stern': 9, 'Wharton': 10,
  'Columbia': 9, 'LSE': 9, 'Parsons': 7,
  '연세대': 9, '고려대': 9, 'POSTECH': 9,
  '성균관대': 8, '서강대': 8, '한양대': 8,
  '이화여대': 8, '숙명여대': 7, '중앙대': 7,
  '경희대': 7,
  '의대': 10, '치대': 10, '약대': 9, '한의대': 9, '로스쿨': 10,
};

function getEduTier(eduStr) {
  if (!eduStr) return 5;
  for (const [key, tier] of Object.entries(EDU_TIER)) {
    if (eduStr.includes(key)) return tier;
  }
  if (eduStr.includes('PhD') || eduStr.includes('박사')) return 9;
  if (eduStr.includes('MBA') || eduStr.includes('석사')) return 8;
  if (eduStr.includes('학사')) return 6;
  return 5;
}

// ── 학력 범위 → 티어 ──
function getEduRangeTier(range) {
  if (!range) return 5;
  if (range.includes('의대') || range.includes('명문대')) return 9;
  if (range.includes('SKY')) return 9;
  if (range.includes('대학원') || range.includes('상위권')) return 8;
  if (range.includes('해외대')) return 8;
  return 6;
}

// ── 직업 티어 ──
function getJobTier(jobStr) {
  if (!jobStr) return 5;
  const s = jobStr.toLowerCase();
  if (/변호사|판사|검사|법조/.test(s)) return 10;
  if (/의사|전문의|전공의|외과|내과/.test(s)) return 10;
  if (/교수/.test(s)) return 9;
  if (/한의사|치과의사|약사/.test(s)) return 9;
  if (/대표|파트너|VP|임원/.test(s)) return 9;
  if (/맥킨지|골드만|PE펀드/.test(s)) return 9;
  if (/삼성|현대|SK|LG|네이버|카카오|쿠팡/.test(s)) return 8;
  if (/외국계/.test(s)) return 8;
  if (/공인회계사|CPA|회계사/.test(s)) return 8;
  if (/공기업|공무원/.test(s)) return 7;
  if (/방송작가|디자이너/.test(s)) return 6;
  if (/대기업/.test(s)) return 8;
  return 6;
}

// ── 직업 카테고리 → 티어 ──
function getJobCategoryTier(cat) {
  if (!cat) return 5;
  if (/변호사|법조/.test(cat)) return 10;
  if (/의료|전문직/.test(cat)) return 9;
  if (/금융|투자/.test(cat)) return 9;
  if (/경영|사업/.test(cat)) return 9;
  if (/IT|테크/.test(cat)) return 8;
  if (/대기업/.test(cat)) return 8;
  if (/약사/.test(cat)) return 8;
  if (/학계|연구/.test(cat)) return 7;
  if (/교직|공무원/.test(cat)) return 7;
  if (/크리에이티브|미디어/.test(cat)) return 6;
  return 6;
}

// ── 지역 거리 점수 ──
const LOCATION_GROUP = {
  '서울 강남구': 'A', '서울 서초구': 'A', '서울 용산구': 'A', '서울 송파구': 'A',
  '서울 마포구': 'B', '서울 성동구': 'B', '서울 종로구': 'B', '서울 광진구': 'B', '서울 강동구': 'B',
  '서울 관악구': 'B',
  '경기 판교': 'C', '경기 분당': 'C',
  '인천 연수구(송도)': 'D',
  '부산 해운대구': 'E', '대전 유성구': 'E', '대구 수성구': 'E', '광주 남구': 'E', '세종 세종시': 'E',
};

function getLocationScore(loc1, loc2) {
  const g1 = LOCATION_GROUP[loc1] || 'X';
  const g2 = LOCATION_GROUP[loc2] || 'X';
  if (g1 === g2) return 100;
  if ((g1 === 'A' && g2 === 'B') || (g1 === 'B' && g2 === 'A')) return 85;
  if (['A', 'B'].includes(g1) && g2 === 'C' || g1 === 'C' && ['A', 'B'].includes(g2)) return 70;
  if (['A', 'B', 'C'].includes(g1) && g2 === 'D' || g1 === 'D' && ['A', 'B', 'C'].includes(g2)) return 55;
  if (g1 === 'E' || g2 === 'E') return 30;
  return 50;
}

// ══════════════════════════════════════════════════════════════
// 1. 조건 매칭 점수 (0~100)
// ══════════════════════════════════════════════════════════════

const CONDITION_WEIGHTS = {
  age: 0.18,      // 나이 호환성
  height: 0.12,   // 키 호환성
  income: 0.18,   // 소득 수준
  edu: 0.12,      // 학력 수준
  job: 0.15,      // 직업 티어
  assets: 0.13,   // 자산 수준
  location: 0.12, // 지역 근접성
};

export function calcConditionScore(myMember, networkMember) {
  const scores = {};

  // ── 나이 ──
  const myAge = myMember.age || 30;
  const theirAge = AGE_RANGE_MID[networkMember.ageRange] || 32;
  const ageDiff = theirAge - myAge;
  // 남성이면 상대(여)가 1~5살 연하가 이상적, 여성이면 상대(남)가 1~6살 연상이 이상적
  let ageScore;
  if (myMember.gender === 'M') {
    // 내가 남자 → 상대 여자가 연하
    const idealDiff = -3; // 내 나이보다 3살 적은게 이상적
    const deviation = Math.abs(ageDiff - idealDiff);
    ageScore = deviation <= 1 ? 100 : deviation <= 3 ? 85 : deviation <= 5 ? 70 : deviation <= 8 ? 55 : 35;
  } else {
    // 내가 여자 → 상대 남자가 연상
    const idealDiff = 3; // 상대가 3살 많은게 이상적
    const deviation = Math.abs(ageDiff - idealDiff);
    ageScore = deviation <= 1 ? 100 : deviation <= 3 ? 85 : deviation <= 5 ? 70 : deviation <= 8 ? 55 : 35;
  }
  scores.age = ageScore;

  // ── 키 ──
  const myHeight = myMember.height || 170;
  const theirHeight = parseHeightRange(networkMember.heightRange) || 170;
  const heightDiff = theirHeight - myHeight;
  let heightScore;
  if (myMember.gender === 'M') {
    // 남→여: 이상적으로 남자가 10~15cm 더 크면 이상적
    const idealDiff = -12; // 상대가 12cm 작으면 이상적
    const deviation = Math.abs(heightDiff - idealDiff);
    heightScore = deviation <= 3 ? 100 : deviation <= 6 ? 85 : deviation <= 10 ? 70 : deviation <= 15 ? 55 : 40;
  } else {
    const idealDiff = 12;
    const deviation = Math.abs(heightDiff - idealDiff);
    heightScore = deviation <= 3 ? 100 : deviation <= 6 ? 85 : deviation <= 10 ? 70 : deviation <= 15 ? 55 : 40;
  }
  scores.height = heightScore;

  // ── 소득 ──
  const myIncome = parseIncome(myMember.income);
  const theirIncome = parseIncomeRange(networkMember.incomeRange);
  const incomeRatio = Math.min(myIncome, theirIncome) / Math.max(myIncome, theirIncome, 1);
  // 비슷할수록 좋고, 어느 한쪽이 높아도 괜찮음
  const combinedIncome = myIncome + theirIncome;
  const incomeScore = combinedIncome >= 30000 ? 95
    : combinedIncome >= 20000 ? 88
    : combinedIncome >= 15000 ? 80
    : combinedIncome >= 10000 ? 70
    : combinedIncome >= 7000 ? 60 : 45;
  // 너무 차이나면 약간 감점
  scores.income = Math.round(incomeScore * (0.7 + incomeRatio * 0.3));

  // ── 학력 ──
  const myEduTier = getEduTier(myMember.edu);
  const theirEduTier = getEduRangeTier(networkMember.eduRange);
  const eduDiff = Math.abs(myEduTier - theirEduTier);
  scores.edu = eduDiff === 0 ? 95 : eduDiff === 1 ? 85 : eduDiff === 2 ? 72 : eduDiff === 3 ? 58 : 42;

  // ── 직업 ──
  const myJobTier = getJobTier(myMember.job);
  const theirJobTier = getJobCategoryTier(networkMember.jobCategory);
  const jobDiff = Math.abs(myJobTier - theirJobTier);
  scores.job = jobDiff === 0 ? 95 : jobDiff === 1 ? 85 : jobDiff === 2 ? 72 : jobDiff === 3 ? 58 : 42;

  // ── 자산 ──
  const myAssets = parseAssets(myMember.assets);
  const theirAssets = parseAssetsRange(networkMember.assetsRange);
  const combinedAssets = myAssets + theirAssets;
  scores.assets = combinedAssets >= 200000 ? 95
    : combinedAssets >= 100000 ? 88
    : combinedAssets >= 60000 ? 80
    : combinedAssets >= 30000 ? 70
    : combinedAssets >= 15000 ? 60 : 45;

  // ── 지역 ──
  scores.location = getLocationScore(myMember.location, networkMember.location);

  // ── 가중합 ──
  let total = 0;
  for (const [key, weight] of Object.entries(CONDITION_WEIGHTS)) {
    total += (scores[key] || 50) * weight;
  }

  return Math.round(total);
}

// ══════════════════════════════════════════════════════════════
// 2. 가치관 점수 (0~100)
// ══════════════════════════════════════════════════════════════

/*
 * 8가지 결혼 가치관 항목:
 *   religion       — 종교 (25%)
 *   childrenPlan   — 자녀 계획 (25%)
 *   dualIncome     — 맞벌이 (15%)
 *   marriageTiming — 결혼 시기 (10%)
 *   smoking        — 흡연 (10%)
 *   drinking       — 음주 (5%)
 *   financialStyle — 자산관리 (5%)
 *   pets           — 반려동물 (5%)
 */

const VALUES_WEIGHTS = {
  religion: 0.25,
  childrenPlan: 0.25,
  dualIncome: 0.15,
  marriageTiming: 0.10,
  smoking: 0.10,
  drinking: 0.05,
  financialStyle: 0.05,
  pets: 0.05,
};

// 종교 호환 매트릭스 (같으면 100, 무교↔종교 70, 다른 종교 45)
function religionCompat(a, b) {
  if (!a || !b) return 75;
  if (a === b) return 100;
  if (a === '무교' || b === '무교') return 72;
  return 45;
}

// 자녀계획 호환
function childrenCompat(a, b) {
  if (!a || !b) return 70;
  if (a === b) return 100;
  // 둘 다 원하지만 시기만 다른 경우
  const wants = ['1명', '2명', '3명 이상'];
  if (wants.includes(a) && wants.includes(b)) return 80;
  // 한쪽만 원하는 경우
  if ((a === '원하지 않음' && wants.includes(b)) || (b === '원하지 않음' && wants.includes(a))) return 30;
  if (a === '미정' || b === '미정') return 65;
  return 55;
}

// 일반 카테고리 호환 (같으면 100, 비슷하면 75, 다르면 50)
function generalCompat(a, b, similar = []) {
  if (!a || !b) return 70;
  if (a === b) return 100;
  for (const pair of similar) {
    if (pair.includes(a) && pair.includes(b)) return 80;
  }
  return 50;
}

export function calcValuesScore(myMember, networkMember) {
  const myPrefs = myMember.preferences || {};
  const theirPrefs = networkMember.preferences || {};

  if (!Object.keys(myPrefs).length || !Object.keys(theirPrefs).length) {
    // 가치관 데이터 없으면 태그 기반 추정
    return estimateValuesFromTags(myMember, networkMember);
  }

  const scores = {};

  scores.religion = religionCompat(myPrefs.religion, theirPrefs.religion);
  scores.childrenPlan = childrenCompat(myPrefs.childrenPlan, theirPrefs.childrenPlan);
  scores.dualIncome = generalCompat(myPrefs.dualIncome, theirPrefs.dualIncome, [
    ['필수', '선호'], ['가능', '선호'],
  ]);
  scores.marriageTiming = generalCompat(myPrefs.marriageTiming, theirPrefs.marriageTiming, [
    ['1년 이내', '2년 이내'], ['2년 이내', '3년 이내'],
  ]);
  scores.smoking = myPrefs.smoking === theirPrefs.smoking ? 100
    : (myPrefs.smoking === '비흡연' && theirPrefs.smoking !== '비흡연') ? 35
    : (theirPrefs.smoking === '비흡연' && myPrefs.smoking !== '비흡연') ? 35 : 60;
  scores.drinking = generalCompat(myPrefs.drinking, theirPrefs.drinking, [
    ['가끔', '사교적'], ['거의 안 함', '가끔'],
  ]);
  scores.financialStyle = generalCompat(myPrefs.financialStyle, theirPrefs.financialStyle, [
    ['절약형', '균형형'], ['균형형', '투자형'],
  ]);
  scores.pets = generalCompat(myPrefs.pets, theirPrefs.pets, [
    ['좋아함', '키우는 중'], ['상관없음', '좋아함'],
  ]);

  let total = 0;
  for (const [key, weight] of Object.entries(VALUES_WEIGHTS)) {
    total += (scores[key] || 70) * weight;
  }

  return Math.round(total);
}

// 태그 기반 가치관 추정 (preferences 없을 때 폴백)
function estimateValuesFromTags(myMember, networkMember) {
  const myTags = new Set([...(myMember.values || []), ...(myMember.tags || []).map(t => t.replace('#', ''))]);
  const theirTags = new Set([...(networkMember.tags || []).map(t => t.replace('#', ''))]);

  let matchCount = 0;
  let totalChecks = 0;

  // 비흡연 체크
  const myNonSmoker = myTags.has('비흡연');
  const theirNonSmoker = theirTags.has('비흡연');
  if (myNonSmoker && theirNonSmoker) matchCount += 2;
  else if (myNonSmoker !== theirNonSmoker) matchCount += 0.5;
  else matchCount += 1;
  totalChecks += 2;

  // 가정적 체크
  const myFamily = myTags.has('가정적') || myTags.has('안정지향') || myTags.has('자녀희망');
  const theirFamily = theirTags.has('가정적') || theirTags.has('안정지향') || theirTags.has('자녀희망');
  if (myFamily && theirFamily) matchCount += 2;
  else if (myFamily || theirFamily) matchCount += 1;
  totalChecks += 2;

  // 맞벌이 체크
  const myDualIncome = myTags.has('맞벌이 선호') || myTags.has('맞벌이 필수') || myTags.has('맞벌이 가능');
  const theirDualIncome = theirTags.has('맞벌이') || theirTags.has('맞벌이 선호');
  if (myDualIncome && theirDualIncome) matchCount += 2;
  else if (!myDualIncome && !theirDualIncome) matchCount += 1.5;
  totalChecks += 2;

  // 활동성 체크
  const myActive = myTags.has('활동적') || myTags.has('여행') || myTags.has('골프') || myTags.has('해외여행');
  const theirActive = theirTags.has('활동적') || theirTags.has('여행') || theirTags.has('골프');
  if (myActive && theirActive) matchCount += 1.5;
  else matchCount += 0.8;
  totalChecks += 1.5;

  const ratio = matchCount / totalChecks;
  return Math.round(45 + ratio * 50); // 45~95 range
}

// ══════════════════════════════════════════════════════════════
// 3. 사주 궁합 점수 (0~100)
// ══════════════════════════════════════════════════════════════

export function calcSajuScore(myMember, networkMember) {
  // Case 1: 양쪽 다 full pillars → 기존 calculateCompatibility 사용
  if (myMember.saju?.pillars && networkMember.saju?.pillars) {
    const result = calculateCompatibility(myMember, networkMember);
    return result ? result.totalScore : 65;
  }

  // Case 2: 내 회원은 full pillars, 상대는 dayMaster만 있음
  const myDM = myMember.saju?.dayMaster;
  const theirDM = networkMember.dayMaster || networkMember.saju?.dayMaster;

  if (myDM && theirDM) {
    return calcSimplifiedSajuScore(myDM, theirDM, myMember, networkMember);
  }

  // Case 3: 사주 데이터 없음
  return null;
}

// 간소화 사주 궁합 (일간 기반)
function calcSimplifiedSajuScore(dmA, dmB, memberA, memberB) {
  const stemHap = getStemHap(dmA, dmB);
  const elA = STEM_ELEMENT[dmA];
  const elB = STEM_ELEMENT[dmB];

  let baseScore;

  // 천간합 = 최고 궁합
  if (stemHap.hap) {
    baseScore = 92;
  }
  // 상생 = 좋은 궁합
  else if (GENERATES[elA] === elB || GENERATES[elB] === elA) {
    baseScore = 78;
  }
  // 동일 오행 = 이해도 높으나 경쟁
  else if (elA === elB) {
    baseScore = 62;
  }
  // 상극 = 도전적
  else if (CONTROLS[elA] === elB || CONTROLS[elB] === elA) {
    baseScore = 48;
  }
  // 간접 관계
  else {
    baseScore = 58;
  }

  // 내 회원의 용신이 상대 일간 오행과 맞으면 보너스
  const yongA = memberA.saju?.yongshin || [];
  if (yongA.includes(elB)) baseScore = Math.min(100, baseScore + 8);

  // 내 회원의 기신이 상대 일간 오행이면 감점
  const giA = memberA.saju?.gisin || [];
  if (giA.includes(elB)) baseScore = Math.max(0, baseScore - 6);

  // 오행 보완 보너스
  const elAData = memberA.saju?.elements || {};
  if (elAData[elB] !== undefined && elAData[elB] < 15) {
    baseScore = Math.min(100, baseScore + 5); // 부족한 오행 보완
  }

  // ±5 정도 변동폭 (id 해시 기반으로 동일 입력 시 동일 결과)
  const hash = ((dmA.charCodeAt(0) * 7 + dmB.charCodeAt(0) * 13) % 11) - 5;
  baseScore = Math.max(30, Math.min(100, baseScore + hash));

  return baseScore;
}

// ══════════════════════════════════════════════════════════════
// 종합 점수 계산
// ══════════════════════════════════════════════════════════════

export function calcMatchScores(myMember, networkMember) {
  const condition = calcConditionScore(myMember, networkMember);
  const values = calcValuesScore(myMember, networkMember);
  const saju = calcSajuScore(myMember, networkMember);

  let matchScore;
  if (saju !== null) {
    matchScore = Math.round(condition * 0.35 + values * 0.35 + saju * 0.30);
  } else {
    matchScore = Math.round(condition * 0.50 + values * 0.50);
  }

  return {
    condition,
    values,
    saju: saju ?? Math.round(matchScore * 0.85 + 5), // fallback 추정치
    matchScore,
  };
}
