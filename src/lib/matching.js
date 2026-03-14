/*
 * ── 형평성 매칭 시스템 (Equity Matching) ──
 *
 * 종합점수 gap 기반 매칭 형평성 분석 + 정산 비율 추천
 */

export const MATCH_GAP_TIERS = [
  { max: 3,  key: 'balanced', label: '균형 매칭', color: 'emerald', mySplit: 50, theirSplit: 50 },
  { max: 8,  key: 'slight',   label: '소폭 차이', color: 'amber',   mySplit: 45, theirSplit: 55 },
  { max: 15, key: 'moderate', label: '상향 매칭', color: 'orange',  mySplit: 40, theirSplit: 60 },
  { max: Infinity, key: 'major', label: '대폭 상향', color: 'rose', mySplit: 35, theirSplit: 65 },
];

/**
 * 두 점수 간 gap 분석 + 추천 정산 비율 반환
 * @param {number} myScore - 내 회원 종합점수
 * @param {number} candidateScore - 상대 후보 종합점수
 * @returns {{ gap, absGap, direction, tier, label, color, mySplit, theirSplit }}
 */
export function computeMatchGap(myScore, candidateScore) {
  const gap = candidateScore - myScore;          // 양수 = 상향, 음수 = 하향
  const absGap = Math.abs(gap);
  const tier = MATCH_GAP_TIERS.find((t) => absGap <= t.max);

  const direction = absGap <= 3 ? '균형' : gap > 0 ? '상향' : '하향';

  // 상향 매칭 시 내쪽 불리 / 하향 매칭 시 내쪽 유리 (비율 반전)
  let mySplit = tier.mySplit;
  let theirSplit = tier.theirSplit;
  if (gap < 0 && absGap > 3) {
    // 내가 높음 → 내쪽이 유리
    mySplit = tier.theirSplit;
    theirSplit = tier.mySplit;
  }

  return {
    gap,
    absGap,
    direction,
    tier: tier.key,
    label: tier.label,
    color: tier.color,
    mySplit,
    theirSplit,
  };
}

/**
 * gap 오름차순 정렬 비교 함수 (균형 매칭순)
 */
export function sortByGapAsc(myScore) {
  return (a, b) => Math.abs(a.matchScore - myScore) - Math.abs(b.matchScore - myScore);
}
