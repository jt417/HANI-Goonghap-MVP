/**
 * 개인 프로필(exact values)을 네트워크 검색용 익명화 데이터(ranges)로 변환
 */

function toAgeRange(age) {
  if (!age || age < 20) return '';
  const decade = Math.floor(age / 10) * 10;
  const pos = age % 10;
  const posLabel = pos <= 2 ? '초반' : pos <= 5 ? '중반' : '후반';
  return `${decade}대 ${posLabel}`;
}

function toIncomeRange(income) {
  if (!income) return '';
  if (income >= 20000) return '2억 이상';
  if (income >= 15000) return '1.5억 이상';
  if (income >= 10000) return '1억 이상';
  if (income >= 7000) return '7,000만~1억';
  if (income >= 5000) return '5,000만~7,000만';
  if (income >= 3000) return '3,000만~5,000만';
  return '3,000만 미만';
}

function toHeightRange(height) {
  if (!height) return '';
  const base = Math.floor((height - 1) / 4) * 4 + 1;
  return `${base}~${base + 3}cm`;
}

function toAssetsRange(financial, realEstate) {
  const total = ((financial || 0) + (realEstate || 0));
  if (total >= 100000) return '10억 이상';
  if (total >= 50000) return '5억 이상';
  if (total >= 50000) return '5~10억';
  if (total >= 30000) return '3~5억';
  if (total >= 20000) return '2~5억';
  if (total >= 10000) return '1~2억';
  if (total >= 5000) return '5,000만~1억';
  return '5,000만 미만';
}

function toEduRange(edu) {
  if (!edu) return '';
  if (edu.includes('의대') || edu.includes('명문대')) return '명문대/의대';
  if (edu.includes('SKY') || edu === 'SKY') return 'SKY';
  if (edu.includes('해외')) return '해외대 학사';
  if (edu.includes('대학원')) return '상위권 대학원';
  if (edu.includes('인서울')) return '4년제 인서울';
  return edu;
}

function generateTags(form) {
  const tags = [];
  if (form.smoke === '비흡연') tags.push('#비흡연');
  if (form.jobCategory) tags.push(`#${form.jobCategory.split('/')[0].split('(')[0].trim()}`);
  if (form.location) tags.push(`#${form.location.split(' ').pop()}`);
  if (form.religion && form.religion !== '무교') tags.push(`#${form.religion}`);
  if (form.hobbies?.length > 0) tags.push(`#${form.hobbies[0]}`);
  return tags.slice(0, 3);
}

export function profileToNetworkMember(form, scoreResult) {
  const age = form.birthYear ? 2026 - Number(form.birthYear) : 30;
  const id = `IND-${String(Date.now()).slice(-6)}`;

  return {
    id,
    agency: '개인회원',
    source: 'self',
    gender: form.gender || 'M',
    ageRange: toAgeRange(age),
    jobCategory: form.jobCategory || '',
    incomeRange: toIncomeRange(form.income),
    eduRange: toEduRange(form.edu),
    heightRange: toHeightRange(form.height),
    bodyType: form.bodyType || '',
    assetsRange: toAssetsRange(form.financial, form.realEstate),
    location: form.location || '',
    verifyLevel: 'Lv1',
    matchScore: scoreResult?.overallScore || 0,
    rankingBadges: Object.entries(scoreResult?.categories || {})
      .filter(([, v]) => v?.badge)
      .map(([k, v]) => v.badge)
      .slice(0, 2),
    scores: { condition: 0, values: 0, saju: 0, possibility: 0 },
    responseRate: '신규',
    trustScore: 3.0,
    sajuProfile: '',
    chemistryNote: '',
    reason: [],
    risks: [],
    tags: generateTags(form),
    dayMaster: '',
    preferences: {
      religion: form.religion || '무교',
      childrenPlan: '',
      dualIncome: '',
      marriageTiming: '',
      smoking: form.smoke || '',
      drinking: form.drink || '',
      financialStyle: '',
      pets: '상관없음',
    },
    recentActivity: '방금',
  };
}
