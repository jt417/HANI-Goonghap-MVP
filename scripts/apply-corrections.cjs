/**
 * 사이클 1 보정 결과 + bodyType 수정을 seedData.js에 적용
 */
const fs = require('fs');
const path = require('path');

const { initialMembers, networkMembers } = require('../src/lib/seedData.js');
const corrections = require('./corrections.json');

// ===== bodyType 수정 (constants.js의 bodyTypeOptions과 일치시킴) =====
// M: ['듬직', '마른', '슬림탄탄', '근육', '통통', '보통']
// F: ['슬림', '글래머', '귀염', '관리', '통통', '보통']
const BODY_TYPE_FIXES = {
  // Males with invalid bodyType
  M006: '보통',       // 균형형→보통 (176/72 BMI=23.2)
  M008: '듬직',       // 건장→듬직 (180/76 BMI=23.5)
  M012: '슬림탄탄',    // 슬림→슬림탄탄 (177/71)
  M014: '보통',       // 균형형→보통 (175/73)
  M020: '슬림탄탄',    // 슬림→슬림탄탄 (176/70)
  M022: '듬직',       // 건장→듬직 (184/79)
  M024: '마른',       // 슬림→마른 (174/68)
  M028: '보통',       // 균형형→보통 (177/73)
  M032: '보통',       // 균형형→보통 (178/72)
  // Females with invalid bodyType
  M003: '보통',       // 균형형→보통 (167/55)
  M007: '관리',       // 슬림탄탄→관리 (168/54)
  M015: '관리',       // 슬림탄탄→관리 (170/55)
  M021: '보통',       // 균형형→보통 (169/56)
  M027: '슬림',       // 슬림탄탄→슬림 (171/54)
  M029: '슬림',       // 균형형→슬림 (166/53)
};

// ===== 적용 =====
const correctedInitial = initialMembers.map(m => {
  const copy = JSON.parse(JSON.stringify(m));

  // grade & family 보정
  if (corrections[m.id]) {
    copy.family = corrections[m.id].family;
    copy.grade = corrections[m.id].grade;
    // _debug 필드 제거
    delete copy.grade._debug;
  }

  // bodyType 보정
  if (BODY_TYPE_FIXES[m.id]) {
    copy.bodyType = BODY_TYPE_FIXES[m.id];
  }

  return copy;
});

// 네트워크 멤버는 그대로 (SABCD 스케일 없음, 이미 퍼센타일 기반)
const correctedNetwork = networkMembers;

// ===== JS 파일 생성 =====
function memberToString(m) {
  return JSON.stringify(m);
}

let output = `export const initialMembers = [\n`;
correctedInitial.forEach((m, i) => {
  output += `  ${memberToString(m)}${i < correctedInitial.length - 1 ? ',' : ''}\n`;
});
output += `];\n\nexport const networkMembers = [\n`;
correctedNetwork.forEach((m, i) => {
  output += `  ${memberToString(m)}${i < correctedNetwork.length - 1 ? ',' : ''}\n`;
});
output += `];\n`;

const outPath = path.join(__dirname, '..', 'src', 'lib', 'seedData.js');
fs.writeFileSync(outPath, output, 'utf8');

console.log('✅ seedData.js 업데이트 완료');
console.log(`총 ${correctedInitial.length}명 initialMembers + ${correctedNetwork.length}명 networkMembers`);

// 변경 요약
let familyChanges = 0, gradeChanges = 0, bodyTypeChanges = 0;
initialMembers.forEach(m => {
  if (corrections[m.id]) {
    if (m.family !== corrections[m.id].family) familyChanges++;
    if (m.grade?.overallScore !== corrections[m.id].grade?.overallScore) gradeChanges++;
  }
  if (BODY_TYPE_FIXES[m.id]) bodyTypeChanges++;
});
console.log(`가정환경 레이블 변경: ${familyChanges}건 (상/중상/중 → 상위 X%)`);
console.log(`등급 점수 재보정: ${gradeChanges}건`);
console.log(`체형 라벨 수정: ${bodyTypeChanges}건`);
