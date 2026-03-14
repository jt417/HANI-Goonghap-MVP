/**
 * 프로필 완성도 계산 유틸리티
 */

const SECTIONS = {
  basic: {
    label: '기본 정보',
    weight: 15,
    fields: [
      { key: 'gender' },
      { key: 'name' },
      { key: 'birthYear' },
      { key: 'phone' },
      { key: 'maritalStatus' },
    ],
  },
  appearance: {
    label: '외모',
    weight: 15,
    fields: [
      { key: 'height', check: (v) => v > 0 },
      { key: 'weight', check: (v) => v > 0 },
      { key: 'bodyType' },
      { key: 'faceType' },
    ],
  },
  career: {
    label: '직업/학력',
    weight: 15,
    fields: [
      { key: 'jobCategory' },
      { key: 'edu' },
    ],
  },
  wealth: {
    label: '경제력',
    weight: 15,
    fields: [
      { key: 'income', check: (v) => v > 0 },
      { key: 'financial', check: (v) => v > 0 },
      { key: 'realEstate', check: (v) => v > 0 },
    ],
  },
  lifestyle: {
    label: '라이프스타일',
    weight: 10,
    fields: [
      { key: 'hobbies', check: (v) => v?.length > 0 },
      { key: 'drink' },
      { key: 'smoke' },
    ],
  },
  family: {
    label: '집안/가족',
    weight: 10,
    fields: [
      { key: 'parentWealth' },
      { key: 'parentJob' },
      { key: 'parentAssets' },
      { key: 'familyRisk' },
    ],
  },
  idealType: {
    label: '이상형',
    weight: 10,
    fields: [
      { key: 'idealConditions', check: (v) => (v?.mustHave?.length || 0) + (v?.preferred?.length || 0) > 0 },
    ],
  },
  photos: {
    label: '사진',
    weight: 10,
    fields: [
      { key: 'photos', check: (v) => v?.length > 0 },
    ],
  },
};

function isFieldFilled(form, field) {
  const val = form[field.key];
  if (field.check) return !!field.check(val);
  if (val === undefined || val === null || val === '') return false;
  if (Array.isArray(val)) return val.length > 0;
  return true;
}

export function calcSectionCompletion(form, sectionKey) {
  const section = SECTIONS[sectionKey];
  if (!section) return 0;
  const filled = section.fields.filter((f) => isFieldFilled(form, f)).length;
  return Math.round((filled / section.fields.length) * 100);
}

export function calcProfileCompletion(form) {
  let totalWeight = 0;
  let filledWeight = 0;
  for (const [key, section] of Object.entries(SECTIONS)) {
    totalWeight += section.weight;
    const pct = calcSectionCompletion(form, key);
    filledWeight += (pct / 100) * section.weight;
  }
  return Math.round((filledWeight / totalWeight) * 100);
}

export function getSectionMeta() {
  return SECTIONS;
}
