/**
 * 보정 적용 v2: 원본 파일에서 initialMembers/networkMembers만 교체,
 * 나머지 export (inboxItems, outboxItems 등)는 그대로 유지
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 원본 seedData.js (git HEAD)에서 가져오기
const originalContent = execSync('git show HEAD:src/lib/seedData.js', { encoding: 'utf8', cwd: path.join(__dirname, '..') });

// 현재 보정된 data (이미 적용된 corrections.json 기반)
// require 대신 원본에서 파싱
const corrections = require('./corrections.json');

// ===== bodyType 수정 맵 =====
const BODY_TYPE_FIXES = {
  M006: '보통', M008: '듬직', M012: '슬림탄탄', M014: '보통',
  M020: '슬림탄탄', M022: '듬직', M024: '마른', M028: '보통', M032: '보통',
  M003: '보통', M007: '관리', M015: '관리', M021: '보통',
  M027: '슬림', M029: '슬림',
};

// ===== 원본 파일에서 각 export 블록 추출 =====

// initialMembers 블록 위치 찾기
function findExportBlock(content, exportName) {
  const startMarker = `export const ${exportName} = [`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;

  // 매칭되는 닫는 ]; 찾기
  let depth = 0;
  let i = content.indexOf('[', startIdx);
  for (; i < content.length; i++) {
    if (content[i] === '[') depth++;
    if (content[i] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  // ]; 포함
  const endIdx = content.indexOf(';', i) + 1;
  return { start: startIdx, end: endIdx };
}

function findExportBlockObj(content, exportName) {
  const startMarker = `export const ${exportName} = {`;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return null;

  let depth = 0;
  let i = content.indexOf('{', startIdx);
  for (; i < content.length; i++) {
    if (content[i] === '{') depth++;
    if (content[i] === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const endIdx = content.indexOf(';', i) + 1;
  return { start: startIdx, end: endIdx };
}

// 원본에서 initialMembers 파싱 (eval 대신 Function 사용)
function extractJSArray(content, exportName) {
  const block = findExportBlock(content, exportName);
  if (!block) return null;
  const code = content.substring(block.start, block.end)
    .replace(`export const ${exportName} = `, `return `);
  try {
    return new Function(code)();
  } catch (e) {
    console.error(`Failed to parse ${exportName}:`, e.message);
    return null;
  }
}

// ===== 원본 initialMembers 추출 및 보정 =====
const origMembers = extractJSArray(originalContent, 'initialMembers');
if (!origMembers) {
  console.error('❌ initialMembers 파싱 실패');
  process.exit(1);
}

const correctedMembers = origMembers.map(m => {
  const copy = JSON.parse(JSON.stringify(m));

  // grade & family 보정
  if (corrections[m.id]) {
    copy.family = corrections[m.id].family;
    copy.grade = corrections[m.id].grade;
  }

  // bodyType 보정
  if (BODY_TYPE_FIXES[m.id]) {
    copy.bodyType = BODY_TYPE_FIXES[m.id];
  }

  return copy;
});

// ===== 새 파일 생성 =====
// initialMembers 블록만 교체하고 나머지는 원본 유지

const membersBlock = findExportBlock(originalContent, 'initialMembers');
if (!membersBlock) {
  console.error('❌ initialMembers 블록 위치 찾기 실패');
  process.exit(1);
}

// 새 initialMembers 문자열 생성
let newMembersStr = 'export const initialMembers = [\n';
correctedMembers.forEach((m, i) => {
  newMembersStr += `  ${JSON.stringify(m)}${i < correctedMembers.length - 1 ? ',' : ''}\n`;
});
newMembersStr += '];';

// 교체
let newContent = originalContent.substring(0, membersBlock.start) +
  newMembersStr +
  originalContent.substring(membersBlock.end);

// 파일 쓰기
const outPath = path.join(__dirname, '..', 'src', 'lib', 'seedData.js');
fs.writeFileSync(outPath, newContent, 'utf8');

console.log('✅ seedData.js 업데이트 완료 (initialMembers만 교체, 나머지 export 유지)');
console.log(`보정된 회원: ${correctedMembers.length}명`);

// 검증: 모든 export가 존재하는지
const expectedExports = ['initialMembers', 'networkMembers', 'inboxItems', 'outboxItems',
  'settlementItems', 'disputeItems', 'verifyQueue', 'proposalMessages',
  'scorePreview', 'stats', 'tasks', 'timelineItems', 'reputationMetrics', 'kpiSeries'];

const missing = expectedExports.filter(e => !newContent.includes(`export const ${e}`));
if (missing.length > 0) {
  console.error(`❌ 누락된 exports: ${missing.join(', ')}`);
} else {
  console.log('✅ 모든 14개 export 확인됨');
}
