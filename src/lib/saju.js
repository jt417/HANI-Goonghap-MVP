// ============================================================
// HANI Saju Engine (JS) — 사주 상수 + 궁합 계산 순수함수
// 만세력엔진2 (Python v6.1)의 핵심 상수/알고리즘을 JS로 이식
// ============================================================

// 천간 (Heavenly Stems)
export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
export const STEMS_KR = ['갑','을','병','정','무','기','경','신','임','계'];

// 지지 (Earthly Branches)
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
export const BRANCHES_KR = ['자','축','인','묘','진','사','오','미','신','유','술','해'];

// 오행 (Five Elements)
export const ELEMENTS = ['목','화','토','금','수'];

// 천간 → 오행
export const STEM_ELEMENT = {
  '甲': '목', '乙': '목',
  '丙': '화', '丁': '화',
  '戊': '토', '己': '토',
  '庚': '금', '辛': '금',
  '壬': '수', '癸': '수',
};

// 지지 → 오행
export const BRANCH_ELEMENT = {
  '寅': '목', '卯': '목',
  '巳': '화', '午': '화',
  '辰': '토', '未': '토', '丑': '토', '戌': '토',
  '申': '금', '酉': '금',
  '子': '수', '亥': '수',
};

// 천간 → 음양 (0=양, 1=음)
export const STEM_POLARITY = {
  '甲': 0, '乙': 1, '丙': 0, '丁': 1, '戊': 0,
  '己': 1, '庚': 0, '辛': 1, '壬': 0, '癸': 1,
};

// 오행 상생: A → B (A가 B를 생함)
export const GENERATES = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
// 오행 상극: A → B (A가 B를 극함)
export const CONTROLS = { '목': '토', '토': '수', '수': '화', '화': '금', '금': '목' };

// 오행 색상 (UI용)
export const ELEMENT_COLORS = {
  '목': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', bar: 'bg-green-500', dot: 'bg-green-400' },
  '화': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', bar: 'bg-red-500', dot: 'bg-red-400' },
  '토': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', bar: 'bg-yellow-500', dot: 'bg-yellow-400' },
  '금': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', bar: 'bg-slate-400', dot: 'bg-slate-400' },
  '수': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', bar: 'bg-blue-500', dot: 'bg-blue-400' },
};

// 오행 한자
export const ELEMENT_HANJA = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };

// ============================================================
// 십신 (Ten Gods) 계산
// ============================================================

const TEN_GOD_TABLE = {
  '비견': '비견', '겁재': '겁재',
  '식신': '식신', '상관': '상관',
  '편재': '편재', '정재': '정재',
  '편관': '편관', '정관': '정관',
  '편인': '편인', '정인': '정인',
};

export function getTenGod(dayMasterStem, otherStem) {
  const dmEl = STEM_ELEMENT[dayMasterStem];
  const otEl = STEM_ELEMENT[otherStem];
  const dmPol = STEM_POLARITY[dayMasterStem];
  const otPol = STEM_POLARITY[otherStem];
  const samePol = dmPol === otPol;

  if (dmEl === otEl) return samePol ? '비견' : '겁재';

  const gen = GENERATES[dmEl];
  const ctrl = CONTROLS[dmEl];
  const genBy = Object.entries(GENERATES).find(([, v]) => v === dmEl)?.[0];
  const ctrlBy = Object.entries(CONTROLS).find(([, v]) => v === dmEl)?.[0];

  if (otEl === gen) return samePol ? '식신' : '상관';
  if (otEl === ctrl) return samePol ? '편재' : '정재';
  if (otEl === ctrlBy) return samePol ? '편관' : '정관';
  if (otEl === genBy) return samePol ? '편인' : '정인';

  return '비견';
}

// 십신 한자 & 약어
export const TEN_GOD_INFO = {
  '비견': { hanja: '比肩', short: '비', tone: 'slate' },
  '겁재': { hanja: '劫財', short: '겁', tone: 'slate' },
  '식신': { hanja: '食神', short: '식', tone: 'emerald' },
  '상관': { hanja: '傷官', short: '상', tone: 'emerald' },
  '편재': { hanja: '偏財', short: '편재', tone: 'amber' },
  '정재': { hanja: '正財', short: '정재', tone: 'amber' },
  '편관': { hanja: '偏官', short: '편관', tone: 'rose' },
  '정관': { hanja: '正官', short: '정관', tone: 'rose' },
  '편인': { hanja: '偏印', short: '편인', tone: 'blue' },
  '정인': { hanja: '正印', short: '정인', tone: 'blue' },
};

// ============================================================
// 천간합 (Stem Harmony) — 5쌍
// ============================================================

export const STEM_HAP = [
  ['甲', '己', '토'],
  ['乙', '庚', '금'],
  ['丙', '辛', '수'],
  ['丁', '壬', '목'],
  ['戊', '癸', '화'],
];

export function getStemHap(s1, s2) {
  const pair = STEM_HAP.find(([a, b]) => (s1 === a && s2 === b) || (s1 === b && s2 === a));
  return pair ? { hap: true, result: pair[2], label: `${pair[0]}${pair[1]}합${ELEMENT_HANJA[pair[2]]}` } : { hap: false };
}

// ============================================================
// 지지 관계 — 육합, 삼합, 충, 형, 파, 해
// ============================================================

// 육합 (Six Harmony)
export const BRANCH_YUKHAP = [
  ['子', '丑', '토'], ['寅', '亥', '목'], ['卯', '戌', '화'],
  ['辰', '酉', '금'], ['巳', '申', '수'], ['午', '未', '화'],
];

// 삼합 (Three Harmony)
export const BRANCH_SAMHAP = [
  ['申', '子', '辰', '수'], ['寅', '午', '戌', '화'],
  ['巳', '酉', '丑', '금'], ['亥', '卯', '未', '목'],
];

// 방합 (Square Harmony)
export const BRANCH_BANGHAP = [
  ['寅', '卯', '辰', '목'], ['巳', '午', '未', '화'],
  ['申', '酉', '戌', '금'], ['亥', '子', '丑', '수'],
];

// 충 (Clash) — 6쌍
export const BRANCH_CHUNG = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

// 형 (Punishment)
export const BRANCH_HYUNG = [
  ['寅', '巳'], ['巳', '申'], ['丑', '戌'], ['戌', '未'],
  ['子', '卯'], ['午', '午'], ['酉', '酉'], ['辰', '辰'], ['亥', '亥'],
];

// 파 (Break)
export const BRANCH_PA = [
  ['子', '酉'], ['丑', '辰'], ['寅', '亥'],
  ['卯', '午'], ['巳', '申'], ['未', '戌'],
];

// 해 (Harm)
export const BRANCH_HAE = [
  ['子', '未'], ['丑', '午'], ['寅', '巳'],
  ['卯', '辰'], ['申', '亥'], ['酉', '戌'],
];

function matchPair(pairs, b1, b2) {
  return pairs.some(([a, b]) => (b1 === a && b2 === b) || (b1 === b && b2 === a));
}

export function getBranchRelations(b1, b2) {
  const relations = [];

  // 육합
  const yukhap = BRANCH_YUKHAP.find(([a, b]) => (b1 === a && b2 === b) || (b1 === b && b2 === a));
  if (yukhap) relations.push({ type: '육합', positive: true, detail: `${b1}${b2} → ${ELEMENT_HANJA[yukhap[2]]}국`, score: 20 });

  // 삼합 (부분 - 2개만 있어도 반합 인정)
  for (const [a, b, c, el] of BRANCH_SAMHAP) {
    const group = [a, b, c];
    if (group.includes(b1) && group.includes(b2)) {
      relations.push({ type: '삼합', positive: true, detail: `${a}${b}${c} ${ELEMENT_HANJA[el]}국 (반합)`, score: 15 });
    }
  }

  // 충
  if (matchPair(BRANCH_CHUNG, b1, b2))
    relations.push({ type: '충', positive: false, detail: `${b1}${b2}충`, score: -25 });

  // 형
  if (matchPair(BRANCH_HYUNG, b1, b2))
    relations.push({ type: '형', positive: false, detail: `${b1}${b2}형`, score: -15 });

  // 파
  if (matchPair(BRANCH_PA, b1, b2))
    relations.push({ type: '파', positive: false, detail: `${b1}${b2}파`, score: -10 });

  // 해
  if (matchPair(BRANCH_HAE, b1, b2))
    relations.push({ type: '해', positive: false, detail: `${b1}${b2}해`, score: -10 });

  return relations;
}

// ============================================================
// 납음오행 (Nayin Five Elements) — 六十甲子 납음표
// ============================================================

const _N = (element, name, hanja) => ({ element, name, hanja });
export const NAYIN_TABLE = {
  '甲子': _N('금','해중금','海中金'), '乙丑': _N('금','해중금','海中金'),
  '丙寅': _N('화','노중화','爐中火'), '丁卯': _N('화','노중화','爐中火'),
  '戊辰': _N('목','대림목','大林木'), '己巳': _N('목','대림목','大林木'),
  '庚午': _N('토','노방토','路旁土'), '辛未': _N('토','노방토','路旁土'),
  '壬申': _N('금','검봉금','劍鋒金'), '癸酉': _N('금','검봉금','劍鋒金'),
  '甲戌': _N('화','산두화','山頭火'), '乙亥': _N('화','산두화','山頭火'),
  '丙子': _N('수','간하수','澗下水'), '丁丑': _N('수','간하수','澗下水'),
  '戊寅': _N('토','성두토','城頭土'), '己卯': _N('토','성두토','城頭土'),
  '庚辰': _N('금','백랍금','白蠟金'), '辛巳': _N('금','백랍금','白蠟金'),
  '壬午': _N('목','양류목','楊柳木'), '癸未': _N('목','양류목','楊柳木'),
  '甲申': _N('수','천중수','泉中水'), '乙酉': _N('수','천중수','泉中水'),
  '丙戌': _N('토','옥상토','屋上土'), '丁亥': _N('토','옥상토','屋上土'),
  '戊子': _N('화','벽력화','霹靂火'), '己丑': _N('화','벽력화','霹靂火'),
  '庚寅': _N('목','송백목','松柏木'), '辛卯': _N('목','송백목','松柏木'),
  '壬辰': _N('수','장류수','長流水'), '癸巳': _N('수','장류수','長流水'),
  '甲午': _N('금','사중금','砂中金'), '乙未': _N('금','사중금','砂中金'),
  '丙申': _N('화','산하화','山下火'), '丁酉': _N('화','산하화','山下火'),
  '戊戌': _N('목','평지목','平地木'), '己亥': _N('목','평지목','平地木'),
  '庚子': _N('토','벽상토','壁上土'), '辛丑': _N('토','벽상토','壁上土'),
  '壬寅': _N('금','금박금','金箔金'), '癸卯': _N('금','금박금','金箔金'),
  '甲辰': _N('화','복등화','覆燈火'), '乙巳': _N('화','복등화','覆燈火'),
  '丙午': _N('수','천하수','天河水'), '丁未': _N('수','천하수','天河水'),
  '戊申': _N('토','대역토','大驛土'), '己酉': _N('토','대역토','大驛土'),
  '庚戌': _N('금','차천금','釵釧金'), '辛亥': _N('금','차천금','釵釧金'),
  '壬子': _N('목','상자목','桑柘木'), '癸丑': _N('목','상자목','桑柘木'),
  '甲寅': _N('수','대계수','大溪水'), '乙卯': _N('수','대계수','大溪水'),
  '丙辰': _N('토','사중토','沙中土'), '丁巳': _N('토','사중토','沙中土'),
  '戊午': _N('화','천상화','天上火'), '己未': _N('화','천상화','天上火'),
  '庚申': _N('목','석류목','石榴木'), '辛酉': _N('목','석류목','石榴木'),
  '壬戌': _N('수','대해수','大海水'), '癸亥': _N('수','대해수','大海水'),
};

export function getNayin(stem, branch) {
  return NAYIN_TABLE[stem + branch] || null;
}

export function calculateNayinCompat(yearA, yearB) {
  const nA = getNayin(yearA.stem, yearA.branch);
  const nB = getNayin(yearB.stem, yearB.branch);
  if (!nA || !nB) return null;

  const elA = nA.element;
  const elB = nB.element;
  let relation, score, detail;

  if (GENERATES[elA] === elB) {
    relation = '상생'; score = 92;
    detail = `${nA.name}(${ELEMENT_HANJA[elA]})이 ${nB.name}(${ELEMENT_HANJA[elB]})을 생함 — 자연스러운 인연의 흐름`;
  } else if (GENERATES[elB] === elA) {
    relation = '상생'; score = 88;
    detail = `${nB.name}(${ELEMENT_HANJA[elB]})이 ${nA.name}(${ELEMENT_HANJA[elA]})을 생함 — 상대가 나를 도와주는 인연`;
  } else if (elA === elB) {
    relation = '비화'; score = 75;
    detail = `${nA.name}·${nB.name} 동일 ${ELEMENT_HANJA[elA]}행 — 서로 이해는 깊으나 변화가 적음`;
  } else if (CONTROLS[elA] === elB) {
    relation = '상극'; score = 45;
    detail = `${nA.name}(${ELEMENT_HANJA[elA]})이 ${nB.name}(${ELEMENT_HANJA[elB]})을 극함 — 주도권 갈등 주의`;
  } else if (CONTROLS[elB] === elA) {
    relation = '상극'; score = 40;
    detail = `${nB.name}(${ELEMENT_HANJA[elB]})이 ${nA.name}(${ELEMENT_HANJA[elA]})을 극함 — 상대에게 눌리는 느낌 가능`;
  } else {
    relation = '무관'; score = 60;
    detail = `${nA.name}·${nB.name} 간접 관계 — 특별한 길흉 없이 중립적`;
  }
  return { nayinA: nA, nayinB: nB, relation, score, detail };
}

// ============================================================
// 신살 (Spirit Stars) — 혼인 관련 핵심 신살
// ============================================================

// 삼합국 기준 그룹
const _SAMHAP_GROUP = { '申': 0, '子': 0, '辰': 0, '寅': 1, '午': 1, '戌': 1, '巳': 2, '酉': 2, '丑': 2, '亥': 3, '卯': 3, '未': 3 };
const _DOHA_TARGET  = ['酉', '卯', '午', '子']; // 도화살 목표 지지
const _YEOKMA_TARGET = ['寅', '申', '亥', '巳']; // 역마살 목표 지지
const _HWAGAE_TARGET = ['辰', '戌', '丑', '未']; // 화개살 목표 지지

// 홍란살 (紅鸞煞) — 연지 기준
const HONGRAN = { '子':'卯','丑':'寅','寅':'丑','卯':'子','辰':'亥','巳':'戌','午':'酉','未':'申','申':'未','酉':'午','戌':'巳','亥':'辰' };
// 천희성 (天喜星) — 연지 기준
const CHUNHEE = { '子':'酉','丑':'申','寅':'未','卯':'午','辰':'巳','巳':'辰','午':'卯','未':'寅','申':'丑','酉':'子','戌':'亥','亥':'戌' };

// 양인살 (羊刃煞) — 일간(양간만)
const YANGIN = { '甲':'卯', '丙':'午', '戊':'午', '庚':'酉', '壬':'子' };

// 천을귀인 (天乙貴人) — 일간 기준
const CHUNEUL = {
  '甲':['丑','未'], '戊':['丑','未'], '乙':['子','申'], '己':['子','申'],
  '丙':['亥','酉'], '丁':['亥','酉'], '庚':['寅','午'], '辛':['寅','午'],
  '壬':['卯','巳'], '癸':['卯','巳'],
};

// 고란살 (孤鸞煞) — 특정 일주
const GORAN_DAYS = ['甲寅','乙巳','丁巳','辛亥','壬子','戊申'];

// 원진살 (怨嗔煞) — 상극적 관계
export const WONJIN_MAP = { '子':'未','丑':'午','寅':'巳','卯':'辰','辰':'卯','巳':'寅','午':'丑','未':'子','申':'亥','酉':'戌','戌':'酉','亥':'申' };

export function calculateShinsal(pillars, dayMaster) {
  if (!pillars) return [];
  const results = [];
  const dayBranch = pillars.day.branch;
  const yearBranch = pillars.year.branch;
  const allBranches = [pillars.year.branch, pillars.month.branch, pillars.day.branch, pillars.hour.branch];
  const group = _SAMHAP_GROUP[dayBranch];

  // 도화살 (桃花煞) — 일지 삼합국 기준
  if (group !== undefined) {
    const target = _DOHA_TARGET[group];
    allBranches.forEach((b, i) => {
      if (b === target && i !== 2) { // 일지 자체는 제외
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '도화살', hanja: '桃花煞', positive: true, branch: b, position: pos,
          desc: '타고난 매력과 이성 인연이 강한 별. 연애 감각이 뛰어나고 사교적',
          marriage: '이성에게 인기가 많아 좋은 인연을 만나기 쉬우나, 결혼 후 외도 주의 필요' });
      }
    });
  }

  // 역마살 (驛馬煞)
  if (group !== undefined) {
    const target = _YEOKMA_TARGET[group];
    allBranches.forEach((b, i) => {
      if (b === target) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '역마살', hanja: '驛馬煞', positive: null, branch: b, position: pos,
          desc: '활동적이고 변화를 좋아하는 별. 여행·이직·이사가 잦음',
          marriage: '결혼 후에도 활동 반경이 넓음. 자유를 존중하는 배우자와 궁합이 좋음' });
      }
    });
  }

  // 화개살 (華蓋煞)
  if (group !== undefined) {
    const target = _HWAGAE_TARGET[group];
    allBranches.forEach((b, i) => {
      if (b === target) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '화개살', hanja: '華蓋煞', positive: true, branch: b, position: pos,
          desc: '예술적 감각과 영적 감수성이 뛰어난 별. 학문·종교에 관심',
          marriage: '깊이 있는 대화를 좋아하며, 지적인 배우자와 잘 맞음' });
      }
    });
  }

  // 홍란살 (紅鸞煞) — 연지 기준
  const hongranTarget = HONGRAN[yearBranch];
  if (hongranTarget) {
    allBranches.forEach((b, i) => {
      if (b === hongranTarget) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '홍란살', hanja: '紅鸞煞', positive: true, branch: b, position: pos,
          desc: '결혼 인연이 강한 길한 별. 혼인 시기가 다가오는 신호',
          marriage: '좋은 배우자를 만날 운이 열려 있음. 적극적인 소개에 유리한 시기' });
      }
    });
  }

  // 천희성 (天喜星) — 연지 기준
  const chunheeTarget = CHUNHEE[yearBranch];
  if (chunheeTarget) {
    allBranches.forEach((b, i) => {
      if (b === chunheeTarget) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '천희성', hanja: '天喜星', positive: true, branch: b, position: pos,
          desc: '경사(慶事)가 있는 별. 결혼·출산 등 기쁜 일이 생김',
          marriage: '결혼 운이 열려 있으며, 행복한 결혼 생활이 기대됨' });
      }
    });
  }

  // 양인살 (羊刃煞) — 양간만
  const yangInTarget = YANGIN[dayMaster];
  if (yangInTarget) {
    allBranches.forEach((b, i) => {
      if (b === yangInTarget) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '양인살', hanja: '羊刃煞', positive: false, branch: b, position: pos,
          desc: '강한 자존심과 추진력의 별. 일에서는 성공하나 대인관계에 날카로움',
          marriage: '배우자와 주도권 다툼 가능. 양보와 타협이 관계의 핵심' });
      }
    });
  }

  // 천을귀인 (天乙貴人) — 일간 기준
  const chuneulTargets = CHUNEUL[dayMaster] || [];
  chuneulTargets.forEach((target) => {
    allBranches.forEach((b, i) => {
      if (b === target) {
        const pos = ['년지','월지','일지','시지'][i];
        results.push({ name: '천을귀인', hanja: '天乙貴人', positive: true, branch: b, position: pos,
          desc: '최고의 길성. 위기 때 귀인이 나타나 도움을 받는 별',
          marriage: '좋은 배우자를 만나 평생 도움을 주고받는 인연. 시댁·처가 관계도 원만' });
      }
    });
  });

  // 고란살 (孤鸞煞) — 일주 기준
  const dayPillar = pillars.day.stem + pillars.day.branch;
  if (GORAN_DAYS.includes(dayPillar)) {
    results.push({ name: '고란살', hanja: '孤鸞煞', positive: false, branch: pillars.day.branch, position: '일주',
      desc: '혼인 지연 또는 배우자 인연이 약한 별. 만혼이 오히려 길함',
      marriage: '서두르지 않고 충분한 교제 후 결혼하면 오히려 좋은 결과. 30대 중반 이후 결혼이 안정적' });
  }

  return results;
}

// ============================================================
// 배우자궁 (Spouse Palace) — 일지(日支) 해석
// ============================================================

export const SPOUSE_PALACE = {
  '子': { traits: '지적·유연', type: '감성적이고 적응력 뛰어남', ideal: '학자·예술가·교육자형', caution: '변덕스러울 수 있어 안정감 있는 상대가 보완', element: '수' },
  '丑': { traits: '성실·보수적', type: '묵묵히 내조하는 알뜰형', ideal: '공무원·금융인·관리자형', caution: '고집이 세므로 유연한 상대가 보완', element: '토' },
  '寅': { traits: '활동적·진취적', type: '자유롭고 리더십 있음', ideal: '사업가·운동선수·외향형', caution: '구속을 싫어해 독립적 관계 필요', element: '목' },
  '卯': { traits: '온화·감성적', type: '예술적 감각과 배려심', ideal: '디자이너·작가·상담가형', caution: '우유부단할 수 있어 결단력 있는 상대가 보완', element: '목' },
  '辰': { traits: '야심·능력형', type: '큰 그림을 그리는 포부형', ideal: '경영자·전문직·정치인형', caution: '권위적일 수 있어 존중 기반의 소통 중요', element: '토' },
  '巳': { traits: '지혜·세련됨', type: '깊은 사고력과 전략적 사고', ideal: '연구자·의사·컨설턴트형', caution: '속마음을 잘 드러내지 않아 인내심 필요', element: '화' },
  '午': { traits: '열정·사교적', type: '밝고 에너지 넘치는 스타일', ideal: '영업·방송인·마케터형', caution: '다혈질이라 감정 조절이 관계의 관건', element: '화' },
  '未': { traits: '따뜻·가정적', type: '헌신적이고 가족 중심', ideal: '교사·요리사·사회복지형', caution: '결정장애가 있을 수 있어 리드형 상대가 보완', element: '토' },
  '申': { traits: '영리·다재다능', type: '빠른 두뇌와 적응력', ideal: 'IT전문가·기획자·변호사형', caution: '변화를 좋아해 안정추구형과 마찰 가능', element: '금' },
  '酉': { traits: '세련·완벽주의', type: '미적 감각과 꼼꼼함', ideal: '예술가·패션·금융전문가형', caution: '비판적일 수 있어 포용력 있는 상대 필요', element: '금' },
  '戌': { traits: '충직·의리형', type: '한번 사귀면 평생 함께', ideal: '군인·경찰·공무원·사업가형', caution: '보수적이라 새로운 시도에 대한 유연성 필요', element: '토' },
  '亥': { traits: '관대·낭만적', type: '정이 많고 베풀기 좋아함', ideal: '작가·의사·봉사직·사업가형', caution: '현실감각이 부족할 수 있어 실용적 상대가 보완', element: '수' },
};

export function analyzeSpousePalace(dayBranchA, dayBranchB) {
  const spA = SPOUSE_PALACE[dayBranchA];
  const spB = SPOUSE_PALACE[dayBranchB];
  if (!spA || !spB) return null;

  // 배우자궁 오행 호환성
  const elA = spA.element;
  const elB = spB.element;
  let compatScore = 60;
  let compatDetail = '';

  if (GENERATES[elA] === elB || GENERATES[elB] === elA) {
    compatScore = 88;
    compatDetail = '서로의 배우자궁이 상생 관계 — 자연스럽게 상대가 원하는 배우자상에 가까움';
  } else if (elA === elB) {
    compatScore = 72;
    compatDetail = '동일한 배우자궁 오행 — 비슷한 이상형을 가져 서로를 이해하기 쉬움';
  } else if (CONTROLS[elA] === elB || CONTROLS[elB] === elA) {
    compatScore = 48;
    compatDetail = '배우자궁이 상극 관계 — 서로의 이상형과 다를 수 있어 기대치 조율 필요';
  } else {
    compatDetail = '배우자궁 간접 관계 — 특별한 길흉 없이 노력에 따라 결정';
  }

  return { palaceA: spA, palaceB: spB, score: compatScore, detail: compatDetail };
}

// ============================================================
// 십이운성 (12 Life Stages) — 일간 기준 각 지지의 운성
// ============================================================

const TWELVE_STAGES = ['장생','목욕','관대','건록','제왕','쇠','병','사','묘','절','태','양'];
const TWELVE_STAGES_HANJA = ['長生','沐浴','冠帶','建祿','帝旺','衰','病','死','墓','絶','胎','養'];

// 양간 장생 위치 (지지 인덱스)
const YANG_START = { '甲': 11, '丙': 2, '戊': 2, '庚': 5, '壬': 8 }; // 亥=11, 寅=2, 巳=5, 申=8
// 음간 장생 위치 (역순)
const YIN_START = { '乙': 6, '丁': 9, '己': 9, '辛': 0, '癸': 3 }; // 午=6, 酉=9, 子=0, 卯=3

export function getLifeStage(dayMaster, branch) {
  const branchIdx = BRANCHES.indexOf(branch);
  if (branchIdx < 0) return null;

  const isYang = STEM_POLARITY[dayMaster] === 0;
  const startIdx = isYang ? YANG_START[dayMaster] : YIN_START[dayMaster];
  if (startIdx === undefined) return null;

  let stageIdx;
  if (isYang) {
    stageIdx = (branchIdx - startIdx + 12) % 12;
  } else {
    stageIdx = (startIdx - branchIdx + 12) % 12;
  }

  return { stage: TWELVE_STAGES[stageIdx], hanja: TWELVE_STAGES_HANJA[stageIdx], index: stageIdx };
}

export function getMarriageLifeStages(pillars, dayMaster) {
  if (!pillars) return null;
  return {
    year: getLifeStage(dayMaster, pillars.year.branch),
    month: getLifeStage(dayMaster, pillars.month.branch),
    day: getLifeStage(dayMaster, pillars.day.branch),
    hour: getLifeStage(dayMaster, pillars.hour.branch),
  };
}

// 십이운성 혼인 해석
const STAGE_MARRIAGE_NOTE = {
  '장생': '성장과 시작의 에너지. 결혼을 통해 새로운 삶이 열리는 운',
  '목욕': '연애·로맨스 에너지가 강함. 이성 인연이 활발하나 감정 기복 주의',
  '관대': '사회적 성취와 결혼 시기가 겹치는 최적기. 좋은 배우자를 만날 운',
  '건록': '안정과 실력의 시기. 신뢰를 기반으로 한 건실한 결혼 가능',
  '제왕': '최고 전성기. 배우자 선택지가 많으나 주도권 의식이 강해 양보 필요',
  '쇠': '안정기에 접어듦. 차분하고 현실적인 결혼이 유리',
  '병': '건강·감정 관리 필요. 결혼보다는 자기 돌봄이 우선',
  '사': '전환기. 과거 패턴을 내려놓고 새로운 관계 방식을 배우는 시기',
  '묘': '내면의 성숙기. 깊이 있는 인연을 만나지만 느리게 진행됨',
  '절': '리셋의 시기. 이전 연애 패턴과 다른 새로운 인연이 찾아옴',
  '태': '새 인연이 잉태되는 시기. 예상치 못한 만남이 인연이 될 수 있음',
  '양': '인연이 천천히 무르익는 시기. 서두르지 않으면 좋은 결과',
};

// ============================================================
// 원진살 (怨嗔煞) — 관계 충돌 경고
// ============================================================

export function hasWonjin(b1, b2) {
  return WONJIN_MAP[b1] === b2 || WONJIN_MAP[b2] === b1;
}

// ============================================================
// LLM 프롬프트 데이터 빌더
// ============================================================

export function buildLLMPromptData(compatResult, memberA, memberB) {
  if (!compatResult) return null;
  const { totalScore, categories, rawAnalysis, stemHap, tenGodRelation, score20 } = compatResult;
  const sa = memberA?.saju;
  const sb = memberB?.saju;
  if (!sa || !sb) return null;

  return {
    summary: {
      totalScore,
      grade: totalScore >= 85 ? '최상' : totalScore >= 75 ? '상' : totalScore >= 65 ? '중상' : totalScore >= 50 ? '중' : '하',
      천간합: stemHap?.hap ? stemHap.label : '없음',
    },
    memberA: {
      name: memberA.name,
      dayMaster: `${sa.dayMaster}(${ELEMENT_HANJA[STEM_ELEMENT[sa.dayMaster]]})`,
      strength: sa.strengthLabel || sa.strength,
      structure: sa.structure,
      yongshin: sa.yongshin?.map((e) => ELEMENT_HANJA[e]).join(','),
      nayin: rawAnalysis.nayin?.nayinA ? `${rawAnalysis.nayin.nayinA.name}(${rawAnalysis.nayin.nayinA.hanja})` : '',
      shinsal: rawAnalysis.shinsal?.memberA?.map((s) => s.name).join(',') || '',
      spousePalace: rawAnalysis.spousePalace?.palaceA?.traits || '',
    },
    memberB: {
      name: memberB.name || memberB.id,
      dayMaster: `${sb.dayMaster}(${ELEMENT_HANJA[STEM_ELEMENT[sb.dayMaster]]})`,
      strength: sb.strengthLabel || sb.strength,
      structure: sb.structure,
      yongshin: sb.yongshin?.map((e) => ELEMENT_HANJA[e]).join(','),
      nayin: rawAnalysis.nayin?.nayinB ? `${rawAnalysis.nayin.nayinB.name}(${rawAnalysis.nayin.nayinB.hanja})` : '',
      shinsal: rawAnalysis.shinsal?.memberB?.map((s) => s.name).join(',') || '',
      spousePalace: rawAnalysis.spousePalace?.palaceB?.traits || '',
    },
    categories: Object.fromEntries(
      Object.entries(categories).map(([k, v]) => [k, { score: v.score, score20: score20[k], details: v.details }])
    ),
    tenGodRelation,
    branchConflicts: rawAnalysis.branches?.relations?.filter((r) => !r.positive).map((r) => `${r.type}: ${r.detail}`) || [],
    nayin: rawAnalysis.nayin?.detail || '',
    wonjin: rawAnalysis.wonjin || null,
  };
}

// ============================================================
// HANI 사주 궁합 — 6차원 실전 궁합 분석
// ============================================================

/*
 * 매니저가 실제 매칭 상담에서 바로 활용할 수 있는 6가지 실전 카테고리:
 *
 * 1. 성격 궁합 (25%) — 일간 오행 관계 기반, 기본 성격 맞춤도
 * 2. 애정·끌림 (20%) — 천간합·일지합·배우자성 기반, 로맨틱 케미
 * 3. 소통·이해 (15%) — 오행 상보성 + 식신/상관 관계, 대화 호흡
 * 4. 생활·가치관 (15%) — 월주·시주 지지 관계, 일상 생활 조화
 * 5. 재물·경제 (10%) — 용신 호환 + 재성 관계, 경제적 시너지
 * 6. 갈등 위험도 (15%) — 충·형·파·해 종합, 낮을수록 안정적
 */

/*
 * ══════════════════════════════════════════════════════════════
 * HANI 사주 궁합 — 5차원 연애·부부 궁합 (20점 × 5 = 100점)
 *
 * 50년차 연애사주 전문가 관점:
 * 1. 천생인연 (天生姻緣) — 타고난 인연, 일간 오행·천간합
 * 2. 부부애정 (夫婦愛情) — 로맨스·끌림, 배우자성·일지합
 * 3. 심성소통 (心性疏通) — 대화·이해, 오행 상보·식상 관계
 * 4. 가정살림 (家庭살림) — 생활·경제·가족, 월주·연주·재성
 * 5. 해로백년 (偕老百年) — 장기 안정, 충형파해 역수
 * ══════════════════════════════════════════════════════════════
 */

const CATEGORY_WEIGHTS = {
  destiny: 0.20,
  love: 0.20,
  communication: 0.20,
  household: 0.20,
  longevity: 0.20,
};

export const COMPAT_CATEGORIES = [
  {
    key: 'destiny', label: '천생인연', hanja: '天生姻緣', weight: 20,
    emoji: '🔮',
    getDesc: (s) => s >= 85 ? '전생에 맺은 인연처럼 자연스러운 끌림의 사주입니다'
      : s >= 70 ? '인연의 흐름이 좋아 만남이 이어지기 쉬운 조합입니다'
      : s >= 55 ? '노력으로 인연을 깊게 만들어갈 수 있는 관계입니다'
      : '타고난 인연보다 후천적 조건이 더 중요한 조합입니다',
    getAdvice: (s) => s >= 80 ? '첫 만남에서 "어디선가 본 듯한 느낌"을 받을 수 있습니다. 자신 있게 추천하세요.'
      : s >= 60 ? '2~3회 만남을 통해 서서히 인연의 깊이를 느낄 수 있습니다.'
      : '활동적인 만남(전시·쿠킹클래스)으로 함께하는 시간을 만들어주세요.',
  },
  {
    key: 'love', label: '부부애정', hanja: '夫婦愛情', weight: 20,
    emoji: '💕',
    getDesc: (s) => s >= 85 ? '부부간 애정이 깊고 평생 연인 같은 관계가 기대됩니다'
      : s >= 70 ? '서로에 대한 애정과 존중이 자연스럽게 흐르는 궁합입니다'
      : s >= 55 ? '천천히 정이 쌓이며 묵직한 사랑으로 발전하는 타입입니다'
      : '애정 표현 방식이 다르니 서로의 사랑 언어를 배워야 합니다',
    getAdvice: (s) => s >= 80 ? '분위기 있는 레스토랑·와인바에서의 만남을 추천하세요. 로맨틱 케미가 강합니다.'
      : s >= 60 ? '급하게 진도를 나가기보다 5회 이상 편안한 만남을 갖도록 안내하세요.'
      : '외모·조건 만족도가 높다면 시간을 두고 감정이 자라도록 기다려주세요.',
  },
  {
    key: 'communication', label: '심성소통', hanja: '心性疏通', weight: 20,
    emoji: '💬',
    getDesc: (s) => s >= 85 ? '말하지 않아도 통하는, 마음이 잘 맞는 사주입니다'
      : s >= 70 ? '대화가 편안하고 서로의 감정을 잘 읽는 조합입니다'
      : s >= 55 ? '표현 방식이 다르지만 서로 맞춰갈 수 있습니다'
      : '소통 방식의 차이를 이해하고 배려하는 노력이 필요합니다',
    getAdvice: (s) => s >= 75 ? '대화 중심의 만남(식사·카페)이 가장 잘 맞습니다. 자연스럽게 대화가 이어질 거예요.'
      : s >= 55 ? '"상대방의 말을 끊지 않기" 같은 소통 팁을 미리 안내해주세요.'
      : '감정 표현법이 다를 수 있으니, "나는 이렇게 느꼈어" 식의 대화법을 권하세요.',
  },
  {
    key: 'household', label: '가정살림', hanja: '家庭살림', weight: 20,
    emoji: '🏠',
    getDesc: (s) => s >= 85 ? '가정 운영·경제관·생활 리듬이 이상적으로 맞는 부부입니다'
      : s >= 70 ? '생활 가치관이 비슷하여 안정적인 가정을 꾸릴 수 있습니다'
      : s >= 55 ? '생활 방식에 차이가 있으나 대화로 조율 가능합니다'
      : '소비 습관·생활 패턴 등 사전에 충분한 대화가 필요합니다',
    getAdvice: (s) => s >= 75 ? '결혼 후 가정생활 조화가 좋습니다. 장기 안정성을 부모님께 어필하세요.'
      : s >= 55 ? '결혼 전 1박 2일 여행으로 생활 호환성을 확인하도록 권하세요.'
      : '경제관·가사 분담·주거 선호에 대해 교제 초기부터 대화하도록 안내하세요.',
  },
  {
    key: 'longevity', label: '해로백년', hanja: '偕老百年', weight: 20,
    emoji: '🌿',
    inverted: true,
    getDesc: (s) => s >= 85 ? '백년해로할 수 있는 매우 안정적인 궁합입니다'
      : s >= 70 ? '큰 마찰 없이 오래도록 함께할 수 있는 조합입니다'
      : s >= 55 ? '작은 갈등은 있으나 관계를 해칠 수준은 아닙니다'
      : '갈등 요소가 있으니 감정 관리와 소통 훈련이 중요합니다',
    getAdvice: (s) => s >= 80 ? '장기 안정성이 높으니 안심하고 추천하세요. "오래 볼 사이"라는 확신을 주세요.'
      : s >= 60 ? '"작은 양보"를 습관화하면 평생 함께할 수 있다고 안내하세요.'
      : '갈등 시 "24시간 룰"(하루 뒤에 대화) 적용을 권하세요. 만남 후 피드백을 꼭 확인하세요.',
  },
];

export function calculateCompatibility(memberA, memberB) {
  const sa = memberA.saju;
  const sb = memberB.saju;
  if (!sa?.pillars || !sb?.pillars) return null;

  const rawAnalysis = { dayMaster: {}, elements: {}, yongshin: {}, branches: {} };

  // ── 원시 분석 1: 일간 궁합 ──
  const dmA = sa.dayMaster;
  const dmB = sb.dayMaster;
  const stemHap = getStemHap(dmA, dmB);
  const dmElA = STEM_ELEMENT[dmA];
  const dmElB = STEM_ELEMENT[dmB];

  let dayMasterScore;
  let dayMasterDetail;

  if (stemHap.hap) {
    dayMasterScore = 100;
    dayMasterDetail = `${stemHap.label} — 천생연분, 자연스러운 끌림과 상호 보완`;
  } else if (GENERATES[dmElA] === dmElB || GENERATES[dmElB] === dmElA) {
    dayMasterScore = 82;
    const who = GENERATES[dmElA] === dmElB ? 'A가 B를 생함' : 'B가 A를 생함';
    dayMasterDetail = `${ELEMENT_HANJA[dmElA]}→${ELEMENT_HANJA[dmElB]} 상생 (${who}) — 배려와 성장의 관계`;
  } else if (dmElA === dmElB) {
    dayMasterScore = 65;
    dayMasterDetail = `동일 오행 (${ELEMENT_HANJA[dmElA]}) — 이해도 높으나 주도권 경쟁 가능`;
  } else if (CONTROLS[dmElA] === dmElB || CONTROLS[dmElB] === dmElA) {
    dayMasterScore = 42;
    dayMasterDetail = `${ELEMENT_HANJA[dmElA]}↔${ELEMENT_HANJA[dmElB]} 상극 — 초기 긴장 있으나 보완적 관계 가능`;
  } else {
    dayMasterScore = 58;
    dayMasterDetail = `${ELEMENT_HANJA[dmElA]}↔${ELEMENT_HANJA[dmElB]} 간접 관계 — 중립적 상호작용`;
  }
  rawAnalysis.dayMaster = { score: dayMasterScore, detail: dayMasterDetail, stemHap };

  // ── 원시 분석 2: 오행 상보성 ──
  const elA = sa.elements || {};
  const elB = sb.elements || {};
  let complementScore = 0;
  let complementDetails = [];

  for (const el of ELEMENTS) {
    const aVal = elA[el] || 0;
    const bVal = elB[el] || 0;
    if (aVal < 15 && bVal >= 20) {
      complementScore += 20;
      complementDetails.push(`${memberA.name}의 부족한 ${ELEMENT_HANJA[el]}을 ${memberB.name || memberB.id}가 보완`);
    }
    if (bVal < 15 && aVal >= 20) {
      complementScore += 20;
      complementDetails.push(`${memberB.name || memberB.id}의 부족한 ${ELEMENT_HANJA[el]}을 ${memberA.name}가 보완`);
    }
  }
  complementScore = Math.min(100, complementScore);
  if (complementDetails.length === 0) {
    complementScore = 55;
    complementDetails.push('양측 오행 분포가 유사하여 보완 효과 보통');
  }
  rawAnalysis.elements = { score: complementScore, details: complementDetails };

  // ── 원시 분석 3: 용신 호환 ──
  const yongA = sa.yongshin || [];
  const yongB = sb.yongshin || [];
  let yongScore = 50;
  let yongDetails = [];

  for (const y of yongA) {
    if ((elB[y] || 0) >= 20) {
      yongScore += 25;
      yongDetails.push(`${memberA.name}의 용신(${ELEMENT_HANJA[y]})을 상대가 충족`);
    }
  }
  for (const y of yongB) {
    if ((elA[y] || 0) >= 20) {
      yongScore += 25;
      yongDetails.push(`${memberB.name || memberB.id}의 용신(${ELEMENT_HANJA[y]})을 상대가 충족`);
    }
  }
  yongScore = Math.min(100, yongScore);
  if (yongDetails.length === 0) yongDetails.push('용신 직접 호환은 약하나 간접 보완 가능');
  rawAnalysis.yongshin = { score: yongScore, details: yongDetails };

  // ── 원시 분석 4: 지지 관계 (전체) ──
  const branchesA = [sa.pillars.year.branch, sa.pillars.month.branch, sa.pillars.day.branch, sa.pillars.hour.branch];
  const branchesB = [sb.pillars.year.branch, sb.pillars.month.branch, sb.pillars.day.branch, sb.pillars.hour.branch];
  let branchRelationsAll = [];
  let branchScoreRaw = 60;

  for (const bA of branchesA) {
    for (const bB of branchesB) {
      const rels = getBranchRelations(bA, bB);
      for (const r of rels) {
        if (!branchRelationsAll.find((x) => x.detail === r.detail)) {
          branchRelationsAll.push(r);
          branchScoreRaw += r.score;
        }
      }
    }
  }
  const branchScore = Math.max(0, Math.min(100, branchScoreRaw));
  rawAnalysis.branches = { score: branchScore, relations: branchRelationsAll };

  // ── 신규 분석 모듈 ──
  const nayinResult = calculateNayinCompat(sa.pillars.year, sb.pillars.year);
  rawAnalysis.nayin = nayinResult;

  const shinsalA = calculateShinsal(sa.pillars, dmA);
  const shinsalB = calculateShinsal(sb.pillars, dmB);
  rawAnalysis.shinsal = { memberA: shinsalA, memberB: shinsalB };

  const dayBranchA = sa.pillars.day.branch;
  const dayBranchB = sb.pillars.day.branch;
  const spousePalace = analyzeSpousePalace(dayBranchA, dayBranchB);
  rawAnalysis.spousePalace = spousePalace;

  const wonjinDay = hasWonjin(dayBranchA, dayBranchB);
  const wonjinYear = hasWonjin(sa.pillars.year.branch, sb.pillars.year.branch);
  rawAnalysis.wonjin = { day: wonjinDay, year: wonjinYear, any: wonjinDay || wonjinYear };

  const lifeStagesA = getMarriageLifeStages(sa.pillars, dmA);
  const lifeStagesB = getMarriageLifeStages(sb.pillars, dmB);
  rawAnalysis.lifeStages = { memberA: lifeStagesA, memberB: lifeStagesB };

  // 일지 십이운성 (혼인 관련)
  const dayStageA = lifeStagesA?.day;
  const dayStageB = lifeStagesB?.day;
  rawAnalysis.dayLifeStage = {
    memberA: dayStageA ? { ...dayStageA, marriageNote: STAGE_MARRIAGE_NOTE[dayStageA.stage] } : null,
    memberB: dayStageB ? { ...dayStageB, marriageNote: STAGE_MARRIAGE_NOTE[dayStageB.stage] } : null,
  };

  // ── 십신 관계 (A↔B) ──
  const tgAB = getTenGod(dmA, sb.pillars.day.stem);
  const tgBA = getTenGod(dmB, sa.pillars.day.stem);

  // ══════════════════════════════════════════════════════
  // 6차원 실전 궁합 카테고리 산출
  // ══════════════════════════════════════════════════════

  const dayBrA = dayBranchA;
  const dayBrB = dayBranchB;

  // ── 1. 천생인연 (20%) — 일간 + 납음 + 십신 ──
  let cat_personality = dayMasterScore;
  const personalityDetails = [dayMasterDetail];
  if (stemHap.hap) personalityDetails.push('일간 천간합으로 서로의 본성이 자연스럽게 합치됩니다');
  if (dmElA === dmElB) personalityDetails.push('같은 오행이라 이해도는 높으나 비슷한 성격의 충돌에 주의');

  // 납음오행 반영
  if (nayinResult) {
    const nayinBonus = Math.round((nayinResult.score - 60) * 0.3); // -6 ~ +10
    cat_personality = Math.max(0, Math.min(100, cat_personality + nayinBonus));
    personalityDetails.push(`납음(年柱): ${nayinResult.detail}`);
  }

  // 십신 관계로 성격 역학 설명
  const personalityTenGod = `${memberA.name}→상대: ${tgAB} / 상대→${memberA.name}: ${tgBA}`;
  personalityDetails.push(personalityTenGod);
  if (['정인', '편인'].includes(tgAB) || ['정인', '편인'].includes(tgBA)) {
    personalityDetails.push('인성 관계가 있어 서로를 정신적으로 지지해주는 조합');
  }
  if (['편관', '정관'].includes(tgAB) && ['편관', '정관'].includes(tgBA)) {
    personalityDetails.push('쌍방 관성 관계로 서로를 통제하려는 경향 — 존중이 중요');
  }

  // ── 2. 애정·끌림 (20%) ──
  let cat_romance = 45;
  const romanceDetails = [];

  if (stemHap.hap) {
    cat_romance += 40;
    romanceDetails.push(`일간 ${stemHap.label} 천간합 — 타고난 끌림의 궁합, 만나면 자연스럽게 빠져드는 조합`);
  }
  // 일지(日支) 육합 = 강한 연애 궁합
  const dayYukhap = BRANCH_YUKHAP.find(([a, b]) => (dayBrA === a && dayBrB === b) || (dayBrA === b && dayBrB === a));
  if (dayYukhap) {
    cat_romance += 25;
    romanceDetails.push(`일지 육합(${dayBrA}${dayBrB}) — 일상에서 자연스럽게 정이 쌓이는 관계`);
  }
  // 상생 = 서로 돌보는 연애
  if (GENERATES[dmElA] === dmElB) {
    cat_romance += 12;
    romanceDetails.push(`${memberA.name}이 상대를 돌보는 상생 관계 — 한쪽이 리드하는 안정적 연애`);
  } else if (GENERATES[dmElB] === dmElA) {
    cat_romance += 12;
    romanceDetails.push(`상대가 ${memberA.name}을 돌보는 상생 관계 — 보살핌받는 안정감`);
  }
  // 배우자성: 정재(남→여의 배우자), 정관(여→남의 배우자)
  if (['정재', '정관'].includes(tgAB)) {
    cat_romance += 12;
    romanceDetails.push(`${memberA.name}에게 상대는 ${tgAB} 관계 — 전통적 배우자 궁합`);
  }
  if (['정재', '정관'].includes(tgBA)) {
    cat_romance += 12;
    romanceDetails.push(`상대에게 ${memberA.name}은 ${tgBA} 관계 — 전통적 배우자 궁합`);
  }
  // 배우자궁 반영
  if (spousePalace) {
    const spBonus = Math.round((spousePalace.score - 60) * 0.35); // -4 ~ +10
    cat_romance += spBonus;
    romanceDetails.push(`배우자궁: ${spousePalace.detail}`);
  }
  // 신살 반영 (도화살=매력, 홍란살=혼인운, 고란살=혼인지연)
  const allShinsal = [...shinsalA, ...shinsalB];
  const dohaCount = allShinsal.filter((s) => s.name === '도화살').length;
  const hongranCount = allShinsal.filter((s) => s.name === '홍란살').length;
  const goranCount = allShinsal.filter((s) => s.name === '고란살').length;
  if (dohaCount >= 2) {
    cat_romance += 8;
    romanceDetails.push('양측 모두 도화살(桃花煞) 보유 — 서로에 대한 매력과 끌림이 강한 조합');
  } else if (dohaCount === 1) {
    cat_romance += 4;
    romanceDetails.push('한쪽에 도화살 — 이성적 매력이 관계를 이끄는 힘이 됨');
  }
  if (hongranCount > 0) {
    cat_romance += 5;
    romanceDetails.push('홍란살(紅鸞煞) 발동 — 혼인 인연이 열려있는 좋은 시기');
  }
  if (goranCount > 0) {
    cat_romance -= 6;
    romanceDetails.push('고란살(孤鸞煞) 존재 — 만혼이 오히려 길할 수 있으니 서두르지 않는 것이 좋음');
  }
  // 일지 충 = 로맨틱 충돌
  if (matchPair(BRANCH_CHUNG, dayBrA, dayBrB)) {
    cat_romance -= 18;
    romanceDetails.push(`일지 ${dayBrA}${dayBrB}충 — 끌림은 있으나 감정 기복이 클 수 있음`);
  }
  if (romanceDetails.length === 0) {
    romanceDetails.push('특별한 끌림 요소는 적으나, 조건과 외모에 따라 호감 발전 가능');
  }
  cat_romance = Math.max(0, Math.min(100, cat_romance));

  // ── 3. 소통·이해 (15%) ──
  let cat_communication = complementScore;
  const commDetails = [...complementDetails];
  if (['식신', '상관'].includes(tgAB)) {
    cat_communication = Math.min(100, cat_communication + 10);
    commDetails.push(`${memberA.name}→상대: ${tgAB} — 자신의 생각을 자연스럽게 전달하는 관계`);
  }
  if (['식신', '상관'].includes(tgBA)) {
    cat_communication = Math.min(100, cat_communication + 10);
    commDetails.push(`상대→${memberA.name}: ${tgBA} — 상대가 편하게 마음을 여는 관계`);
  }
  if (GENERATES[dmElA] === dmElB || GENERATES[dmElB] === dmElA) {
    cat_communication = Math.min(100, cat_communication + 5);
    commDetails.push('상생 에너지가 소통을 부드럽게 만들어줍니다');
  }
  // 화개살 양측 = 깊은 대화 궁합
  const hwagaeBoth = shinsalA.some((s) => s.name === '화개살') && shinsalB.some((s) => s.name === '화개살');
  if (hwagaeBoth) {
    cat_communication = Math.min(100, cat_communication + 8);
    commDetails.push('양측 화개살 보유 — 깊이 있는 대화와 정신적 교감에 강한 조합');
  }

  // ── 4. 생활·가치관 (15%) ──
  let cat_lifestyle = 55;
  const lifestyleDetails = [];
  // 월주 = 사회운/직업적 조화
  const monthRels = getBranchRelations(sa.pillars.month.branch, sb.pillars.month.branch);
  for (const r of monthRels) {
    cat_lifestyle += r.score;
    lifestyleDetails.push(`월주(사회운) ${r.detail} ${r.type} — ${r.positive ? '사회적 활동 패턴이 잘 맞음' : '사회적 가치관 차이 가능'}`);
  }
  // 연주 = 가문/가족적 배경 조화
  const yearRels = getBranchRelations(sa.pillars.year.branch, sb.pillars.year.branch);
  for (const r of yearRels) {
    cat_lifestyle += r.score;
    lifestyleDetails.push(`연주(가문) ${r.detail} ${r.type} — ${r.positive ? '가문/가족 배경이 조화로움' : '시댁/처가 관계 마찰 가능'}`);
  }
  // 시주 = 내면/노후
  if (sa.pillars.hour && sb.pillars.hour) {
    const hourRels = getBranchRelations(sa.pillars.hour.branch, sb.pillars.hour.branch);
    for (const r of hourRels) {
      cat_lifestyle += Math.round(r.score * 0.7);
      lifestyleDetails.push(`시주(내면) ${r.detail} ${r.type} — ${r.positive ? '장기적 생활 리듬 조화' : '장기적 가치관 조율 필요'}`);
    }
  }
  // 오행 분포 유사도 보너스 (비슷한 라이프스타일)
  let distDiff = 0;
  for (const el of ELEMENTS) distDiff += Math.abs((elA[el] || 0) - (elB[el] || 0));
  if (distDiff < 30) {
    cat_lifestyle += 8;
    lifestyleDetails.push('오행 분포가 유사하여 생활 리듬이 비슷한 타입');
  }
  if (lifestyleDetails.length === 0) lifestyleDetails.push('특별한 생활 조화/충돌 요소 없이 보통 수준');
  cat_lifestyle = Math.max(0, Math.min(100, Math.round(cat_lifestyle)));

  // ── 5. 재물·경제 (10%) ──
  let cat_financial = yongScore;
  const financialDetails = [...yongDetails];
  // 재성(편재/정재) 관계 = 경제적 시너지
  if (['편재', '정재'].includes(tgAB)) {
    cat_financial = Math.min(100, cat_financial + 12);
    financialDetails.push(`${memberA.name}→상대: ${tgAB} — 경제적 동기 부여가 되는 관계`);
  }
  if (['편재', '정재'].includes(tgBA)) {
    cat_financial = Math.min(100, cat_financial + 12);
    financialDetails.push(`상대→${memberA.name}: ${tgBA} — 재물 운에 긍정적 영향`);
  }
  // 양쪽 모두 재성 에너지가 충분하면 보너스
  const wealthEls = ['금', '토'];
  const aWealth = wealthEls.reduce((s, el) => s + (elA[el] || 0), 0);
  const bWealth = wealthEls.reduce((s, el) => s + (elB[el] || 0), 0);
  if (aWealth >= 25 && bWealth >= 25) {
    cat_financial = Math.min(100, cat_financial + 8);
    financialDetails.push('양쪽 모두 금·토 에너지가 풍부하여 경제적 안정감이 높음');
  }
  cat_financial = Math.max(0, Math.min(100, cat_financial));

  // ── 6. 갈등 위험도 (15%) — 높은 점수 = 갈등 적음 ──
  const negativeRels = branchRelationsAll.filter((r) => !r.positive);
  const negativeTotal = negativeRels.reduce((sum, r) => sum + Math.abs(r.score), 0);
  let cat_conflict = Math.max(0, Math.min(100, 100 - negativeTotal * 1.5));
  const conflictDetails = [];

  // 원진살 반영
  if (wonjinDay) {
    cat_conflict = Math.max(0, cat_conflict - 18);
    conflictDetails.push('일지 원진살(怨嗔煞) — 처음엔 좋으나 시간이 지나면 작은 불만이 쌓이는 관계. 소통 노력 필수');
  }
  if (wonjinYear && !wonjinDay) {
    cat_conflict = Math.max(0, cat_conflict - 8);
    conflictDetails.push('연지 원진살 — 양가 부모님 관계에서 미묘한 긴장이 있을 수 있음');
  }
  // 일지 충은 가장 위험 — 추가 감점
  if (matchPair(BRANCH_CHUNG, dayBrA, dayBrB)) {
    cat_conflict = Math.max(0, cat_conflict - 15);
    conflictDetails.push(`일지 ${dayBrA}${dayBrB}충 — 가장 핵심적인 갈등 요소, 성격 충돌이 잦을 수 있음`);
  }
  // 월주 충 = 사회적 갈등
  if (matchPair(BRANCH_CHUNG, sa.pillars.month.branch, sb.pillars.month.branch)) {
    conflictDetails.push(`월주 충 — 사회적 가치관·직업관 충돌 가능`);
  }
  // 양인살 양측 = 충돌 위험 상승
  const yangInBoth = shinsalA.some((s) => s.name === '양인살') && shinsalB.some((s) => s.name === '양인살');
  if (yangInBoth) {
    cat_conflict = Math.max(0, cat_conflict - 10);
    conflictDetails.push('양측 모두 양인살 — 자존심이 강해 갈등 시 격해질 수 있음. 양보 훈련 필요');
  }
  for (const r of negativeRels) {
    if (r.type === '형') conflictDetails.push(`${r.detail} — 스트레스 상황에서 예기치 않은 갈등 발생 가능`);
    if (r.type === '파') conflictDetails.push(`${r.detail} — 작은 오해가 쌓일 수 있으니 평소 소통 중요`);
    if (r.type === '해') conflictDetails.push(`${r.detail} — 감정적 상처를 주고받을 수 있어 주의`);
  }
  // 천을귀인 보유 = 갈등 완화
  const chuneulBoth = shinsalA.some((s) => s.name === '천을귀인') && shinsalB.some((s) => s.name === '천을귀인');
  if (chuneulBoth) {
    cat_conflict = Math.min(100, cat_conflict + 8);
    conflictDetails.push('양측 천을귀인 보유 — 위기 상황에서 서로가 귀인이 되어 관계를 지켜줌');
  }
  if (negativeRels.length === 0 && !wonjinDay) {
    cat_conflict = Math.min(100, cat_conflict + 5);
    conflictDetails.push('충돌 요소 없음 — 갈등 요소가 매우 적어 안정적인 관계 기대');
  }

  // ══════════════════════════════════════════════
  // 5차원 실전 궁합 (20점 × 5 = 100점)
  // ══════════════════════════════════════════════

  // 가정살림 = 생활·가치관 + 재물·경제 통합
  const cat_household = Math.round(cat_lifestyle * 0.6 + cat_financial * 0.4);
  const householdDetails = [...lifestyleDetails, ...financialDetails];

  const categories = {
    destiny: { score: cat_personality, details: personalityDetails },
    love: { score: cat_romance, details: romanceDetails },
    communication: { score: cat_communication, details: commDetails },
    household: { score: cat_household, details: householdDetails },
    longevity: { score: cat_conflict, details: conflictDetails },
  };

  // 각 항목 20점 만점으로 변환 후 합산 (= 100점)
  const score20 = {};
  for (const key of Object.keys(categories)) {
    score20[key] = Math.round(categories[key].score / 5);
  }
  const totalScore = score20.destiny + score20.love + score20.communication + score20.household + score20.longevity;

  // 매칭 종합 코멘트
  let comment = '';
  if (totalScore >= 85) comment = '사주 궁합이 매우 뛰어납니다. 자연스러운 끌림과 상호 보완이 기대되는 최상의 조합입니다.';
  else if (totalScore >= 75) comment = '좋은 궁합입니다. 대부분의 영역에서 조화로우며 안정적인 관계 형성이 가능합니다.';
  else if (totalScore >= 65) comment = '보통 이상의 궁합입니다. 일부 차이가 있으나 서로 맞춰가며 좋은 관계를 만들 수 있습니다.';
  else if (totalScore >= 50) comment = '주의가 필요한 궁합입니다. 갈등 요소가 있으나 다른 조건이 잘 맞는다면 충분히 가능합니다.';
  else comment = '도전적인 궁합입니다. 사주 외적인 조건(가치관, 외모, 경제력)으로 보완이 필요합니다.';

  if (stemHap.hap) comment = `일간 ${stemHap.label}이 성립! 천생연분의 조합입니다. ` + comment;

  // 매니저 상담 추천 종합
  const managerAdvice = [];
  if (totalScore >= 80) {
    managerAdvice.push('적극 추천할 수 있는 궁합입니다. 자신 있게 소개하세요.');
    managerAdvice.push('부모님 상담 시 "사주 궁합이 매우 좋습니다"라고 말씀하시면 효과적입니다.');
  } else if (totalScore >= 65) {
    managerAdvice.push('무난하게 추천할 수 있는 궁합입니다.');
    if (cat_romance >= 75) managerAdvice.push('애정 궁합이 좋으니 첫 만남의 분위기를 잘 잡아주세요.');
    if (cat_conflict < 60) managerAdvice.push('초반 갈등 가능성이 있으니 2~3회 만남 후 판단을 안내하세요.');
  } else {
    managerAdvice.push('궁합 점수는 보통이지만, 조건과 가치관이 잘 맞는다면 진행해볼 만합니다.');
    managerAdvice.push('사주만으로 판단하지 말고, 실제 조건 매칭과 함께 종합적으로 판단하세요.');
  }
  // 각 카테고리별 특이사항 추가
  if (cat_personality >= 85) managerAdvice.push('성격 궁합이 최상입니다 — 첫 만남에서 호감도가 높을 것입니다.');
  if (cat_romance >= 85) managerAdvice.push('로맨틱 케미가 강합니다 — 분위기 있는 장소(와인바, 레스토랑)를 추천하세요.');
  if (cat_conflict < 50) managerAdvice.push('갈등 위험이 높습니다 — 만남 후 반드시 양측 피드백을 확인하세요.');

  // 신살 기반 추가 조언
  if (hongranCount > 0) managerAdvice.push('혼인 운이 열려있는 시기입니다 — 적극적으로 소개를 진행하세요.');
  if (goranCount > 0) managerAdvice.push('만혼 성향이 있으니 천천히 교제할 수 있도록 안내하세요.');
  if (wonjinDay) managerAdvice.push('일지 원진 관계 — 만남 초기에는 좋으나 장기적으로 소통 훈련이 필요합니다.');
  if (dohaCount >= 2) managerAdvice.push('양측 모두 이성에게 인기가 많은 타입 — 교제 초기 집중도를 높여주세요.');

  return {
    totalScore,
    score20,
    categories,
    rawAnalysis,
    comment,
    managerAdvice,
    stemHap,
    tenGodRelation: { aToB: tgAB, bToA: tgBA },
    stars: totalScore >= 90 ? 5 : totalScore >= 75 ? 4 : totalScore >= 60 ? 3 : totalScore >= 45 ? 2 : 1,
  };
}

// ============================================================
// 연애·부부 궁합 상세 리포트 (50년차 전문가 관점)
// ============================================================

export function generateDetailedReport(compatResult, memberA, memberB) {
  if (!compatResult) return null;
  const { categories, stemHap, tenGodRelation, totalScore, rawAnalysis } = compatResult;
  const nameA = memberA?.name || '회원A';
  const nameB = memberB?.name || memberB?.id || '상대';
  const sections = [];

  // ── 1. 연애 케미 분석 ──
  const dating = { title: '연애 케미 분석', emoji: '💘', bullets: [] };
  const loveS = categories.love.score;
  const destS = categories.destiny.score;

  if (stemHap?.hap) {
    dating.bullets.push(`천간합(${stemHap.label}) 성립 — 만나는 순간 설명할 수 없는 끌림을 느끼는 천생연분입니다. "어디서 본 것 같다"는 데자뷔를 경험할 수 있습니다.`);
  }
  if (loveS >= 80) {
    dating.bullets.push('연애 감정이 빠르게 깊어지는 조합입니다. 3회 이내 만남에서 서로의 매력을 확실히 느낄 수 있습니다.');
  } else if (loveS >= 60) {
    dating.bullets.push('서서히 정이 드는 "슬로우 러브" 타입의 인연입니다. 급하게 판단하지 말고 5회 이상 만남을 갖도록 안내하세요.');
  } else {
    dating.bullets.push('초반에는 조건적 매력에서 호감이 시작됩니다. 외모·스펙 만족도가 첫 만남의 성패를 좌우합니다.');
  }

  const { aToB, bToA } = tenGodRelation || {};
  if (['정재', '정관'].includes(aToB)) {
    dating.bullets.push(`${nameA}에게 상대는 ${aToB}(${aToB === '정재' ? '正財' : '正官'}) — 전통적 배우자 궁합으로, 한눈에 "이 사람이다"라는 확신이 드는 관계입니다.`);
  } else if (['편재', '편관'].includes(aToB)) {
    dating.bullets.push(`${nameA}에게 상대는 ${aToB} 관계 — 자극적이고 역동적인 연애가 예상됩니다. 밀당이 있을수록 빠져드는 관계입니다.`);
  }
  if (['정재', '정관'].includes(bToA) && !['정재', '정관'].includes(aToB)) {
    dating.bullets.push(`상대에게 ${nameA}은 ${bToA} 관계 — 상대가 ${nameA}에게 강한 결혼 의지를 보일 수 있습니다.`);
  }

  if (destS >= 85 && loveS >= 75) {
    dating.bullets.push('일간 궁합과 애정 궁합 모두 최상급 — 50년 경력에서도 드문 "찰떡 궁합"입니다. 적극 추천하세요.');
  }
  sections.push(dating);

  // ── 2. 결혼 후 부부관계 전망 ──
  const marriage = { title: '결혼 후 부부관계 전망', emoji: '💑', bullets: [] };
  const houseS = categories.household.score;

  if (destS >= 80 && loveS >= 70) {
    marriage.bullets.push('성격이 맞고 애정도 깊어, 결혼 후에도 "연인 같은 부부"가 될 가능성이 높습니다. 주변에서 부러워하는 커플이 됩니다.');
  } else if (destS >= 60) {
    marriage.bullets.push('성격 차이는 있으나 서로 보완하는 관계입니다. "나와 다른 점"이 오히려 결혼 생활에서 균형을 만들어줍니다.');
  } else {
    marriage.bullets.push('성격 차이가 크므로 결혼 전 최소 6개월 이상 교제하며 서로의 생활 패턴을 충분히 확인하세요.');
  }

  if (houseS >= 75) {
    marriage.bullets.push('가사 분담, 경제관, 생활 리듬이 자연스럽게 맞아 가정 운영이 원활합니다. 맞벌이 부부로서도 시너지가 좋습니다.');
  } else if (houseS >= 55) {
    marriage.bullets.push('생활 방식에 다소 차이가 있습니다. 결혼 전 1박 2일 여행이나 주말 동거 체험으로 생활 호환성을 미리 확인하세요.');
  } else {
    marriage.bullets.push('소비 습관, 주거 환경, 여가 활동에 대한 가치관 차이가 있을 수 있습니다. 교제 초기부터 솔직한 대화가 필수입니다.');
  }

  // 시댁/처가 관계 (연주 기반)
  const yearDetails = categories.household.details.filter((d) => d.includes('가문') || d.includes('연주'));
  if (yearDetails.some((d) => d.includes('조화'))) {
    marriage.bullets.push('양가 부모님 관계도 원만할 것으로 보입니다. 명절·가족 행사에서의 마찰이 적어 시댁/처가 스트레스가 낮습니다.');
  } else if (yearDetails.some((d) => d.includes('마찰'))) {
    marriage.bullets.push('시댁·처가 관계에서 갈등 요소가 보입니다. 양가 부모님 첫 만남을 신중히 준비하고, 상견례 전 충분한 교제 기간을 두세요.');
  }
  sections.push(marriage);

  // ── 3. 소통과 갈등 관리 ──
  const commSection = { title: '소통과 갈등 관리', emoji: '🗣️', bullets: [] };
  const commS = categories.communication.score;
  const longS = categories.longevity.score;

  if (commS >= 75) {
    commSection.bullets.push('서로의 감정을 자연스럽게 읽는 커플입니다. 갈등이 생겨도 대화로 빠르게 해결하며, "말 안 해도 아는 사이"로 발전합니다.');
  } else if (commS >= 55) {
    commSection.bullets.push('소통 스타일이 다르지만, 서로의 표현법을 배우면 깊은 대화가 가능합니다. "너는 왜 그래?" 대신 "이런 점이 궁금해"로 대화하도록 안내하세요.');
  } else {
    commSection.bullets.push('한쪽은 논리적, 한쪽은 감정적 표현을 하는 경우가 많습니다. 커플 소통 코칭이나 성격 유형 검사를 병행하면 효과적입니다.');
  }

  if (longS >= 80) {
    commSection.bullets.push('충·형·파·해 등 갈등 요소가 적어 평화로운 관계가 기대됩니다. 큰 싸움 없이 백년해로할 수 있는 사주입니다.');
  } else if (longS >= 55) {
    commSection.bullets.push('일상적 마찰은 있으나 관계를 해칠 수준은 아닙니다. "작은 양보"를 습관화하면 30년, 50년 함께할 수 있습니다.');
  } else {
    commSection.bullets.push('갈등 가능성이 다소 높습니다. 감정이 격해질 때 "24시간 룰"(하루 뒤에 대화)을 적용하도록 권하세요.');
    const conflictDetails = categories.longevity.details || [];
    if (conflictDetails.some((d) => d.includes('일지') && d.includes('충'))) {
      commSection.bullets.push('일지충(日支衝)이 있어 가정 내 주도권 다툼에 주의하세요. 역할 분담을 명확히 정하고 서로의 영역을 존중하는 것이 핵심입니다.');
    }
  }
  sections.push(commSection);

  // ── 4. 매니저 종합 의견 ──
  const summary = { title: '매니저 종합 의견', emoji: '📋', bullets: [] };

  if (totalScore >= 85) {
    summary.bullets.push('50년 경험에 비추어 최상급 궁합입니다. 자신 있게 추천하시고, 부모님 상담 시 "사주 궁합이 최상"이라 말씀하셔도 됩니다.');
  } else if (totalScore >= 70) {
    summary.bullets.push('좋은 궁합입니다. 사주적으로 추천 가능하며, 조건 매칭만 잘 맞으면 성사 가능성이 높습니다.');
  } else if (totalScore >= 55) {
    summary.bullets.push('보통 수준의 궁합입니다. 사주만으로 판단하지 말고 실제 만남의 느낌, 조건 매칭을 종합적으로 고려하세요.');
  } else {
    summary.bullets.push('궁합 점수가 낮은 편입니다. 다른 조건이 매우 잘 맞는 경우에만 신중하게 진행하되, 양측에 솔직하게 안내하세요.');
  }

  if (loveS >= 80) summary.bullets.push('로맨틱 케미가 높으니 야경 명소·루프탑 레스토랑 등 분위기 있는 장소에서 첫 만남을 잡아주세요.');
  if (destS >= 85) summary.bullets.push('성격 궁합 최상 — 편안한 카페에서 만나도 대화가 끊이지 않을 거예요. 자연스러운 만남을 세팅하세요.');
  if (longS < 60) summary.bullets.push('장기 안정성이 낮으니, 만남 후 양측 피드백을 반드시 확인하고 3회 만남까지 인내심을 안내하세요.');
  if (houseS >= 80) summary.bullets.push('결혼 후 생활 조화가 좋습니다. 장기적 관점에서의 안정성을 부모님께 적극 어필하세요.');

  sections.push(summary);

  return sections;
}

// ============================================================
// 초보자 친화 요약 생성 (하위 호환 유지)
// ============================================================

export function generateBeginnerSummary(compatResult) {
  if (!compatResult) return null;
  const { totalScore, categories, rawAnalysis } = compatResult;

  const goodPoints = [];
  const cautionPoints = [];
  const talkingPoints = [...(compatResult.managerAdvice || [])];

  // 각 카테고리별 good/caution 수집
  for (const cat of COMPAT_CATEGORIES) {
    const catData = categories[cat.key];
    if (!catData) continue;
    const s = catData.score;
    if (s >= 75) {
      goodPoints.push(`${cat.emoji} ${cat.label}: ${cat.getDesc(s)}`);
    } else if (s < 50) {
      cautionPoints.push(`${cat.emoji} ${cat.label}: ${cat.getDesc(s)}`);
    }
  }

  if (goodPoints.length === 0) goodPoints.push('전반적으로 무난한 궁합이에요.');
  if (cautionPoints.length === 0) cautionPoints.push('특별한 주의사항은 없어요.');

  return { goodPoints, cautionPoints, talkingPoints };
}

// 한글 변환 헬퍼
export function stemToKr(stem) {
  const idx = STEMS.indexOf(stem);
  return idx >= 0 ? STEMS_KR[idx] : stem;
}
export function branchToKr(branch) {
  const idx = BRANCHES.indexOf(branch);
  return idx >= 0 ? BRANCHES_KR[idx] : branch;
}
export function getElement(stem) {
  return STEM_ELEMENT[stem] || BRANCH_ELEMENT[stem] || '';
}
