/**
 * 2025-2026 대한민국 중위값 기반 등급 재보정 스크립트
 *
 * 핵심 원칙:
 * 1. 평균(mean)이 아닌 중위값(median) 기준으로 퍼센타일 산정
 * 2. SABCD 스케일 → 전부 "상위 X%" 퍼센타일 스케일로 변환
 * 3. 국세청·통계청·KB금융연구소 2024-2025 데이터 기반
 */

const { initialMembers, networkMembers } = require('../src/lib/seedData.js');

// ===== 2025-2026 대한민국 30대 중위값 기준 퍼센타일 테이블 =====

// 소득 (개인 근로소득, 국세청 기준)
// 중위값: ~3,800만원
const INCOME_PERCENTILE = [
  { threshold: 8_0000, percentile: 0.1 },   // 8억+ → 상위 0.1%
  { threshold: 2_5000, percentile: 1 },      // 2.5억+ → 상위 1%
  { threshold: 1_5000, percentile: 3 },      // 1.5억+ → 상위 3%
  { threshold: 1_0000, percentile: 5 },      // 1억+ → 상위 5%
  { threshold: 8500, percentile: 8 },        // 8,500만+ → 상위 8%
  { threshold: 7000, percentile: 10 },       // 7,000만+ → 상위 10%
  { threshold: 5500, percentile: 20 },       // 5,500만+ → 상위 20%
  { threshold: 3800, percentile: 50 },       // 3,800만 = 중위값
];

// 순자산 (30대 가구, 통계청 가계금융복지조사 + KB금융보고서)
// 중위값: ~1.8억
const NET_WORTH_PERCENTILE = [
  { threshold: 50_0000, percentile: 0.1 },   // 50억+ → 상위 0.1%
  { threshold: 30_0000, percentile: 1 },      // 30억+ → 상위 1%
  { threshold: 15_0000, percentile: 3 },      // 15억+ → 상위 3%
  { threshold: 10_0000, percentile: 5 },      // 10억+ → 상위 5%
  { threshold: 7_0000, percentile: 10 },      // 7억+ → 상위 10%
  { threshold: 5_0000, percentile: 15 },      // 5억+ → 상위 15%
  { threshold: 3_0000, percentile: 20 },      // 3억+ → 상위 20%
  { threshold: 1_8000, percentile: 50 },      // 1.8억 = 중위값
];

// 직업 퍼센타일 (결혼시장 평가 기준)
const CAREER_MAP = {
  // 상위 0.1% (score 96-98)
  'PE펀드 파트너': { pct: 0.1, score: 97 },

  // 상위 0.5% (score 95)
  '김앤장 변호사': { pct: 0.5, score: 95 },
  '외국계 투자은행 VP': { pct: 0.5, score: 95 },
  '교수 (서울대 경영)': { pct: 0.5, score: 95 },
  '외국계 컨설팅 (맥킨지)': { pct: 0.5, score: 95 },
  '로펌 변호사 (율촌)': { pct: 0.5, score: 94 },

  // 상위 1% (score 91-94)
  '성형외과 전문의': { pct: 1, score: 93 },
  '외과전문의 (삼성서울)': { pct: 1, score: 93 },
  '치과의사 (강남)': { pct: 1, score: 92 },
  '한의사 (개원)': { pct: 1, score: 91 },
  '서울대병원 내과 전공의': { pct: 2, score: 90 },
  '공인회계사 (빅4)': { pct: 2, score: 90 },

  // 상위 3-5% (score 87-89)
  'SK하이닉스 수석연구원': { pct: 3, score: 89 },
  '스타트업 대표 (시리즈B)': { pct: 3, score: 88 },
  '약사 (강남역점)': { pct: 5, score: 87 },
  '삼성전자 무선사업부 책임': { pct: 5, score: 87 },
  '카카오 PM리드': { pct: 5, score: 87 },
  '네이버 시니어 개발자': { pct: 5, score: 87 },

  // 상위 5-10% (score 83-86)
  '현대자동차 전략기획 과장': { pct: 7, score: 85 },
  '삼성물산 기획팀': { pct: 7, score: 84 },
  '쿠팡 시니어 PM': { pct: 7, score: 84 },
  '외국계 금융 애널리스트': { pct: 8, score: 84 },
  '삼성전자 DS사업부 선임': { pct: 10, score: 83 },
  '외국계 제약사 마케팅': { pct: 10, score: 83 },
  '삼성바이오로직스 연구원': { pct: 10, score: 82 },

  // 상위 10-15% (score 80-83)
  '대기업 HR': { pct: 12, score: 81 },
  'LG전자 브랜드전략': { pct: 10, score: 82 },
  '교사 (과학고)': { pct: 12, score: 81 },
  '공기업 사무관 (한국전력)': { pct: 10, score: 82 },
  '대기업 마케팅 (CJ)': { pct: 15, score: 80 },
  '디자이너 (구찌 코리아)': { pct: 12, score: 81 },
  '방송작가 (KBS)': { pct: 15, score: 80 },
};

// 키 퍼센타일 (질병관리청 국민건강영양조사 2023-2024)
// 남성 20-30대 중위: ~173.5cm
const HEIGHT_MALE_PERCENTILE = [
  { height: 187, percentile: 0.1 },
  { height: 185, percentile: 1 },
  { height: 183, percentile: 2 },
  { height: 181, percentile: 5 },
  { height: 180, percentile: 7 },
  { height: 179, percentile: 8 },
  { height: 178, percentile: 10 },
  { height: 177, percentile: 12 },
  { height: 176, percentile: 15 },
  { height: 175, percentile: 18 },
  { height: 174, percentile: 20 },
  { height: 173, percentile: 50 },
];

// 여성 20-30대 중위: ~160.5cm
const HEIGHT_FEMALE_PERCENTILE = [
  { height: 175, percentile: 0.1 },
  { height: 173, percentile: 1 },
  { height: 171, percentile: 2 },
  { height: 169, percentile: 5 },
  { height: 168, percentile: 7 },
  { height: 167, percentile: 8 },
  { height: 166, percentile: 10 },
  { height: 165, percentile: 12 },
  { height: 164, percentile: 15 },
  { height: 163, percentile: 20 },
  { height: 162, percentile: 25 },
  { height: 161, percentile: 50 },
];

// 가정환경 퍼센타일 (기존 SABCD → 퍼센타일)
const FAMILY_MAP = {
  '상': { label: '상위 5%', scoreRange: [87, 92] },
  '중상': { label: '상위 15%', scoreRange: [80, 86] },
  '중': { label: '상위 30%', scoreRange: [70, 78] },
  '중하': { label: '상위 50%', scoreRange: [60, 69] },
  '하': { label: '상위 70%', scoreRange: [50, 59] },
};

// ===== 유틸리티 함수 =====

function parseIncome(str) {
  if (!str) return 0;
  str = str.replace(/,/g, '');
  if (str.includes('억')) {
    return parseFloat(str) * 10000; // 만원 단위
  }
  if (str.includes('만')) {
    return parseFloat(str);
  }
  return parseFloat(str);
}

function parseAssets(str) {
  if (!str) return { financial: 0, realestate: 0 };
  const parts = str.split('/').map(s => s.trim());
  let financial = 0, realestate = 0;

  parts.forEach(p => {
    if (p.includes('금융')) {
      const match = p.match(/([\d.]+)억/);
      if (match) financial = parseFloat(match[1]) * 10000;
    }
    if (p.includes('부동산') && !p.includes('없음')) {
      const match = p.match(/([\d.]+)억/);
      if (match) realestate = parseFloat(match[1]) * 10000;
    }
  });

  return { financial, realestate };
}

function getPercentile(value, table) {
  for (const row of table) {
    if (value >= row.threshold) return row.percentile;
  }
  return 50; // 중위값 이하
}

function getHeightPercentile(height, gender) {
  const table = gender === 'M' ? HEIGHT_MALE_PERCENTILE : HEIGHT_FEMALE_PERCENTILE;
  for (const row of table) {
    if (height >= row.height) return row.percentile;
  }
  return 50;
}

function percentileToScore(pct) {
  // 퍼센타일 → 0-100 점수 변환
  if (pct <= 0.1) return 97;
  if (pct <= 0.5) return 95;
  if (pct <= 1) return 93;
  if (pct <= 2) return 91;
  if (pct <= 3) return 89;
  if (pct <= 5) return 87;
  if (pct <= 7) return 85;
  if (pct <= 8) return 84;
  if (pct <= 10) return 82;
  if (pct <= 12) return 81;
  if (pct <= 15) return 79;
  if (pct <= 20) return 76;
  if (pct <= 25) return 73;
  if (pct <= 30) return 70;
  if (pct <= 40) return 65;
  if (pct <= 50) return 60;
  return 55;
}

function scoreToPercentileLabel(score) {
  if (score >= 95) return '상위 0.1%';
  if (score >= 90) return '상위 1%';
  if (score >= 85) return '상위 5%';
  if (score >= 80) return '상위 10%';
  if (score >= 75) return '상위 15%';
  if (score >= 70) return '상위 20%';
  if (score >= 65) return '상위 30%';
  return '상위 50%';
}

function scoreToBadge(score) {
  if (score >= 95) return 'TOP 0.1%';
  if (score >= 90) return 'TOP 1%';
  if (score >= 85) return 'TOP 5%';
  if (score >= 80) return 'TOP 10%';
  return null;
}

// ===== 메인 재보정 함수 =====

function recalibrateMember(m) {
  const income = parseIncome(m.income);
  const { financial, realestate } = parseAssets(m.assets);
  const totalNetWorth = financial + realestate;

  // 1. 자산 점수 재산정
  const incomePct = getPercentile(income, INCOME_PERCENTILE);
  const netWorthPct = getPercentile(totalNetWorth, NET_WORTH_PERCENTILE);
  // 자산 퍼센타일 = 순자산 70% + 소득 30% (자산이 더 중요)
  const wealthPct = netWorthPct * 0.7 + incomePct * 0.3;
  const wealthScore = percentileToScore(wealthPct);

  // 2. 직업 점수
  const careerInfo = CAREER_MAP[m.job];
  const careerScore = careerInfo ? careerInfo.score : m.grade?.categories?.career?.score || 80;

  // 3. 외모 점수 (키 기반 50% + 기존 주관평가 50%)
  const heightPct = getHeightPercentile(m.height, m.gender);
  const heightScore = percentileToScore(heightPct);
  const oldAppearance = m.grade?.categories?.appearance?.score || 80;
  // 키가 외모 점수의 30%, 나머지 70%는 체형+인상 등 주관평가 유지
  const appearanceScore = Math.round((heightScore * 0.3 + oldAppearance * 0.7) * 10) / 10;

  // 4. 가정환경 점수
  const familyInfo = FAMILY_MAP[m.family];
  let familyLabel = m.family;
  let familyScore;

  if (familyInfo) {
    familyLabel = familyInfo.label;
    // 기존 점수를 새 범위로 매핑
    const oldScore = m.grade?.categories?.family?.score || 80;
    const [min, max] = familyInfo.scoreRange;
    // 기존 점수의 상대적 위치를 새 범위에 매핑
    familyScore = Math.round((min + (max - min) * 0.5 + (Math.random() * (max - min) * 0.3 - (max - min) * 0.15)) * 10) / 10;
    // 실제로는 결정론적으로: 기존 점수의 상대 위치 반영
    const oldFamilyScores = { '상': [87.5, 95.2], '중상': [84.1, 90.3], '중': [74.2, 79.8] };
    const oldRange = oldFamilyScores[m.family] || [74, 95];
    const normalizedPos = (oldScore - oldRange[0]) / (oldRange[1] - oldRange[0] || 1);
    familyScore = Math.round((min + normalizedPos * (max - min)) * 10) / 10;
  } else {
    familyScore = m.grade?.categories?.family?.score || 75;
  }

  // 5. 기타 가산점 (교육, 거주지, 비흡연, 종교)
  // 기존 점수에서 역산 (overall = 0.3w + 0.25c + 0.2a + 0.15f + 0.1b)
  const oldOverall = m.grade?.overallScore || 80;
  const oldW = m.grade?.categories?.wealth?.score || 80;
  const oldC = m.grade?.categories?.career?.score || 80;
  const oldA = m.grade?.categories?.appearance?.score || 80;
  const oldF = m.grade?.categories?.family?.score || 80;
  const bonusScore = Math.round(((oldOverall - 0.3*oldW - 0.25*oldC - 0.2*oldA - 0.15*oldF) / 0.1) * 10) / 10;
  const finalBonus = Math.max(60, Math.min(98, bonusScore || 82));

  // 6. 종합 점수 재산정
  const overallScore = Math.round((
    wealthScore * 0.30 +
    careerScore * 0.25 +
    appearanceScore * 0.20 +
    familyScore * 0.15 +
    finalBonus * 0.10
  ) * 10) / 10;

  // 7. 배지 생성
  const badges = [];
  const categories = {
    wealth: { score: wealthScore, label: '자산' },
    career: { score: careerScore, label: '직업' },
    appearance: { score: appearanceScore, label: '외모' },
    family: { score: familyScore, label: '집안' },
  };

  // 종합 배지
  const overallBadge = scoreToBadge(overallScore);
  if (overallBadge) badges.push(`${overallBadge} 종합`);

  // 카테고리별 배지 (점수 높은 순)
  Object.entries(categories)
    .sort((a, b) => b[1].score - a[1].score)
    .forEach(([key, { score, label }]) => {
      const badge = scoreToBadge(score);
      if (badge) badges.push(`${badge} ${label}`);
    });

  return {
    // 변경된 필드들
    family: familyLabel,
    grade: {
      overallScore,
      categories: {
        overall: {
          score: overallScore,
          percentile: scoreToPercentileLabel(overallScore),
          badge: overallBadge,
        },
        wealth: {
          score: wealthScore,
          percentile: scoreToPercentileLabel(wealthScore),
          badge: scoreToBadge(wealthScore),
        },
        appearance: {
          score: Math.round(appearanceScore * 10) / 10,
          percentile: scoreToPercentileLabel(appearanceScore),
          badge: scoreToBadge(appearanceScore),
        },
        family: {
          score: familyScore,
          percentile: scoreToPercentileLabel(familyScore),
          badge: scoreToBadge(familyScore),
        },
        career: {
          score: careerScore,
          percentile: scoreToPercentileLabel(careerScore),
          badge: scoreToBadge(careerScore),
        },
      },
      badges,
    },
    // 디버그 정보
    _debug: {
      income: `${income}만`,
      totalNetWorth: `${totalNetWorth}만 (${(totalNetWorth/10000).toFixed(1)}억)`,
      incomePct: `상위 ${incomePct}%`,
      netWorthPct: `상위 ${netWorthPct}%`,
      wealthPctBlended: `상위 ${wealthPct.toFixed(1)}%`,
      heightPct: `상위 ${heightPct}%`,
      bonusUsed: finalBonus,
      oldOverall: oldOverall,
    },
  };
}

// ===== 실행 =====

console.log('===== 사이클 1: 재보정 결과 =====\n');

const results = initialMembers.map(m => {
  const recal = recalibrateMember(m);
  return {
    id: m.id,
    name: m.name,
    age: m.age,
    gender: m.gender,
    job: m.job,
    income: m.income,
    assets: m.assets,
    familyOld: m.family,
    familyNew: recal.family,
    oldGrade: {
      overall: m.grade?.overallScore,
      wealth: m.grade?.categories?.wealth?.score,
      career: m.grade?.categories?.career?.score,
      appearance: m.grade?.categories?.appearance?.score,
      family: m.grade?.categories?.family?.score,
    },
    newGrade: {
      overall: recal.grade.overallScore,
      wealth: recal.grade.categories.wealth.score,
      career: recal.grade.categories.career.score,
      appearance: recal.grade.categories.appearance.score,
      family: recal.grade.categories.family.score,
    },
    badges: recal.grade.badges,
    debug: recal._debug,
    recal,
  };
});

// 비교 테이블 출력
console.log('ID    | Name   | 기존Overall | 새Overall | 기존자산 | 새자산  | 기존직업 | 새직업  | 기존외모 | 새외모  | 가정OLD→NEW');
console.log('-'.repeat(130));
results.forEach(r => {
  console.log(
    `${r.id} | ${r.name.padEnd(4)} | ${String(r.oldGrade.overall).padStart(5)} | ${String(r.newGrade.overall).padStart(5)} | ` +
    `${String(r.oldGrade.wealth).padStart(5)} | ${String(r.newGrade.wealth).padStart(5)} | ` +
    `${String(r.oldGrade.career).padStart(5)} | ${String(r.newGrade.career).padStart(5)} | ` +
    `${String(r.oldGrade.appearance).padStart(5)} | ${String(r.newGrade.appearance).padStart(5)} | ` +
    `${r.familyOld}→${r.familyNew}`
  );
});

// 변동 요약
console.log('\n===== 변동 요약 =====');
let totalDelta = 0;
let overInflated = 0;
let underInflated = 0;
results.forEach(r => {
  const delta = r.newGrade.overall - r.oldGrade.overall;
  totalDelta += Math.abs(delta);
  if (delta < -2) overInflated++;
  if (delta > 2) underInflated++;
});
console.log(`평균 절대 변동: ${(totalDelta / results.length).toFixed(1)}점`);
console.log(`하향 조정(>2점): ${overInflated}명`);
console.log(`상향 조정(>2점): ${underInflated}명`);

// 자산 점수 분포 확인
console.log('\n===== 자산 점수 변동 상세 =====');
results.forEach(r => {
  const delta = r.newGrade.wealth - r.oldGrade.wealth;
  if (Math.abs(delta) > 3) {
    console.log(`⚠️  ${r.id} ${r.name}: ${r.oldGrade.wealth} → ${r.newGrade.wealth} (${delta > 0 ? '+' : ''}${delta.toFixed(1)}) | 순자산: ${r.debug.totalNetWorth} | 소득: ${r.income}`);
  }
});

// 결과를 JSON으로도 출력 (파일 생성용)
const corrections = {};
results.forEach(r => {
  corrections[r.id] = {
    family: r.recal.family,
    grade: r.recal.grade,
  };
});

const fs = require('fs');
fs.writeFileSync(
  '/Users/jaylee/Downloads/HANI-Goonghap-MVP/scripts/corrections.json',
  JSON.stringify(corrections, null, 2)
);
console.log('\n✅ corrections.json 저장 완료');
