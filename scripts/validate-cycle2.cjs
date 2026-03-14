/**
 * 사이클 2: 보정된 데이터 검증
 * - 점수↔퍼센타일 레이블 일치 여부
 * - 점수↔배지 일치 여부
 * - bodyType↔gender 옵션 일치
 * - 가정환경 레이블이 퍼센타일 형식인지
 * - 소득/자산 데이터 현실성
 * - 키/체중 BMI 정상 범위
 * - 종합 점수 = 가중평균 확인
 */
const { initialMembers, networkMembers } = require('../src/lib/seedData.js');

const BODY_OPTIONS_M = ['듬직', '마른', '슬림탄탄', '근육', '통통', '보통'];
const BODY_OPTIONS_F = ['슬림', '글래머', '귀염', '관리', '통통', '보통'];

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

let issues = [];
let checked = 0;

console.log('===== 사이클 2: 검증 시작 =====\n');

initialMembers.forEach(m => {
  const prefix = `${m.id} ${m.name}`;

  // 1. bodyType 검증
  const bodyOpts = m.gender === 'M' ? BODY_OPTIONS_M : BODY_OPTIONS_F;
  if (!bodyOpts.includes(m.bodyType)) {
    issues.push(`❌ ${prefix}: bodyType "${m.bodyType}" 은(는) ${m.gender} 옵션에 없음. 가능: [${bodyOpts.join(',')}]`);
  }
  checked++;

  // 2. family 레이블 형식
  if (!m.family.startsWith('상위 ') || !m.family.endsWith('%')) {
    issues.push(`❌ ${prefix}: family "${m.family}" — 퍼센타일 형식이 아님 (상위 X% 형식이어야 함)`);
  }
  checked++;

  // 3. 점수↔퍼센타일 레이블 일치
  const cats = m.grade?.categories;
  if (cats) {
    ['overall', 'wealth', 'appearance', 'family', 'career'].forEach(key => {
      const cat = cats[key];
      if (!cat) return;
      const expectedLabel = scoreToPercentileLabel(cat.score);
      if (cat.percentile !== expectedLabel) {
        issues.push(`❌ ${prefix}: ${key} score=${cat.score} → 기대 "${expectedLabel}" but got "${cat.percentile}"`);
      }
      const expectedBadge = scoreToBadge(cat.score);
      if (cat.badge !== expectedBadge) {
        issues.push(`❌ ${prefix}: ${key} score=${cat.score} → 기대 badge="${expectedBadge}" but got "${cat.badge}"`);
      }
      checked++;
    });
  }

  // 4. overallScore = grade.categories.overall.score
  if (cats?.overall && m.grade.overallScore !== cats.overall.score) {
    issues.push(`❌ ${prefix}: overallScore(${m.grade.overallScore}) ≠ categories.overall.score(${cats.overall.score})`);
  }
  checked++;

  // 5. BMI 체크 (16-35 정상범위)
  const bmi = m.weight / ((m.height / 100) ** 2);
  if (bmi < 16 || bmi > 35) {
    issues.push(`⚠️ ${prefix}: BMI ${bmi.toFixed(1)} 비정상 (height=${m.height}, weight=${m.weight})`);
  }
  checked++;

  // 6. 나이 범위 (25-45)
  if (m.age < 25 || m.age > 45) {
    issues.push(`⚠️ ${prefix}: 나이 ${m.age} — 결혼정보업체 타겟 범위(25-45) 외`);
  }
  checked++;

  // 7. 키 현실성 (남150-195, 여145-185)
  const heightRange = m.gender === 'M' ? [158, 195] : [150, 185];
  if (m.height < heightRange[0] || m.height > heightRange[1]) {
    issues.push(`⚠️ ${prefix}: 키 ${m.height}cm — 비현실적 범위`);
  }
  checked++;

  // 8. 종합점수 가중평균 검증 (오차 ±2점 허용)
  if (cats?.wealth && cats?.career && cats?.appearance && cats?.family) {
    // 가중평균: 30% 자산 + 25% 직업 + 20% 외모 + 15% 가정 + 10% 기타
    // 기타(bonus)는 역산할 수 없으므로 대략 검증
    const weighted = cats.wealth.score * 0.3 + cats.career.score * 0.25 +
                     cats.appearance.score * 0.2 + cats.family.score * 0.15;
    // bonus 없이 90%만 → 실제 overall은 이보다 약간 높을 것
    const minExpected = weighted + 55 * 0.1; // bonus 최소 55
    const maxExpected = weighted + 98 * 0.1; // bonus 최대 98
    if (m.grade.overallScore < minExpected - 1 || m.grade.overallScore > maxExpected + 1) {
      issues.push(`⚠️ ${prefix}: overall ${m.grade.overallScore} 범위 벗어남 (예상: ${minExpected.toFixed(1)}~${maxExpected.toFixed(1)})`);
    }
    checked++;
  }

  // 9. 배지 목록 검증 (배지가 있는 카테고리의 점수가 80점 이상인지)
  const badgeLabels = { '자산': 'wealth', '직업': 'career', '외모': 'appearance', '집안': 'family', '종합': 'overall' };
  (m.grade?.badges || []).forEach(badge => {
    const parts = badge.split(' ');
    const catLabel = parts[parts.length - 1];
    const catKey = badgeLabels[catLabel];
    if (catKey && cats[catKey]) {
      if (cats[catKey].score < 80) {
        issues.push(`❌ ${prefix}: badge "${badge}" 있지만 ${catKey} score=${cats[catKey].score} < 80`);
      }
    }
    checked++;
  });

  // 10. 회원 상태 검증
  const validStatuses = ['신규 상담', '소개 가능', '소개 진행중', '보류', '휴면'];
  if (!validStatuses.includes(m.status)) {
    issues.push(`❌ ${prefix}: 잘못된 status "${m.status}"`);
  }
  checked++;

  // 11. verifyLevel 검증
  const validLevels = ['Lv1', 'Lv2', 'Lv3', 'Lv4', 'VIP'];
  if (!validLevels.includes(m.verifyLevel)) {
    issues.push(`❌ ${prefix}: 잘못된 verifyLevel "${m.verifyLevel}"`);
  }
  checked++;
});

// ===== 네트워크 멤버 검증 =====
networkMembers.forEach(m => {
  const prefix = `${m.id} (${m.agency})`;

  // matchScore 범위
  if (m.matchScore < 50 || m.matchScore > 100) {
    issues.push(`⚠️ ${prefix}: matchScore ${m.matchScore} 범위 이상`);
  }
  checked++;

  // trustScore 범위
  if (m.trustScore < 1 || m.trustScore > 5) {
    issues.push(`⚠️ ${prefix}: trustScore ${m.trustScore} 범위 이상`);
  }
  checked++;

  // scores 개별 범위
  ['condition', 'values', 'saju', 'possibility'].forEach(key => {
    if (m.scores[key] < 0 || m.scores[key] > 100) {
      issues.push(`⚠️ ${prefix}: scores.${key}=${m.scores[key]} 범위 이상`);
    }
  });
  checked++;
});

// ===== 결과 출력 =====
console.log(`총 ${checked}건 검사 완료\n`);

if (issues.length === 0) {
  console.log('✅ 모든 검증 통과! 추가 수정 사항 없음.\n');
} else {
  console.log(`⚠️ ${issues.length}건의 이슈 발견:\n`);
  issues.forEach(i => console.log(i));
}

// 최종 점수 분포 출력
console.log('\n===== 보정 후 점수 분포 =====');
const scores = initialMembers.map(m => m.grade?.overallScore).filter(Boolean).sort((a,b) => b-a);
console.log(`최고: ${scores[0]}, 최저: ${scores[scores.length-1]}, 중간: ${scores[Math.floor(scores.length/2)]}`);

const dist = { 'TOP 0.1% (95+)': 0, 'TOP 1% (90-94.9)': 0, 'TOP 5% (85-89.9)': 0, 'TOP 10% (80-84.9)': 0, 'TOP 15-20% (75-79.9)': 0, 'TOP 30%+ (<75)': 0 };
scores.forEach(s => {
  if (s >= 95) dist['TOP 0.1% (95+)']++;
  else if (s >= 90) dist['TOP 1% (90-94.9)']++;
  else if (s >= 85) dist['TOP 5% (85-89.9)']++;
  else if (s >= 80) dist['TOP 10% (80-84.9)']++;
  else if (s >= 75) dist['TOP 15-20% (75-79.9)']++;
  else dist['TOP 30%+ (<75)']++;
});
Object.entries(dist).forEach(([label, count]) => {
  const pct = ((count / scores.length) * 100).toFixed(0);
  const bar = '█'.repeat(count);
  console.log(`  ${label}: ${count}명 (${pct}%) ${bar}`);
});

// 자산 점수 분포
console.log('\n===== 자산 점수 분포 =====');
const wScores = initialMembers.map(m => m.grade?.categories?.wealth?.score).filter(Boolean).sort((a,b) => b-a);
const wDist = { '상위 1% (90+)': 0, '상위 3% (87-89)': 0, '상위 5% (85-86)': 0, '상위 10% (80-84)': 0, '상위 15% (76-79)': 0, '상위 20% (70-75)': 0, '상위 30%+ (<70)': 0 };
wScores.forEach(s => {
  if (s >= 90) wDist['상위 1% (90+)']++;
  else if (s >= 87) wDist['상위 3% (87-89)']++;
  else if (s >= 85) wDist['상위 5% (85-86)']++;
  else if (s >= 80) wDist['상위 10% (80-84)']++;
  else if (s >= 76) wDist['상위 15% (76-79)']++;
  else if (s >= 70) wDist['상위 20% (70-75)']++;
  else wDist['상위 30%+ (<70)']++;
});
Object.entries(wDist).forEach(([label, count]) => {
  console.log(`  ${label}: ${count}명`);
});
