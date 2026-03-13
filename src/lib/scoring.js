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

export function scoreMember(form, weights, thresholds) {
  const weightMap = Object.fromEntries(weights.map((item) => [item.key, item.weight]));
  const wealth = Math.min(98, 55 + form.financial / 900 + form.realEstate * 12 + (form.income > 10000 ? 6 : 0));
  const appearance = Math.min(97, 62 + (form.height > 165 ? 8 : 4) + (form.bodyType.includes('슬림') ? 10 : 6) + 12);
  const career = Math.min(96, 60 + (form.job.includes('대기업') ? 18 : 10) + (form.income > 10000 ? 10 : 6));
  const family = Math.min(90, form.family.includes('안정') ? 80 : 72);
  const bonus = 82;
  const overall = Number(((wealth * weightMap.wealth + career * weightMap.career + appearance * weightMap.appearance + family * weightMap.family + bonus * weightMap.bonus) / 100).toFixed(1));
  return {
    overallScore: overall,
    categories: {
      overall: { score: overall, ...buildPercentile(overall, thresholds) },
      wealth: { score: Number(wealth.toFixed(1)), ...buildPercentile(wealth, thresholds) },
      appearance: { score: Number(appearance.toFixed(1)), ...buildPercentile(appearance, thresholds) },
      family: { score: Number(family.toFixed(1)), ...buildPercentile(family, thresholds) },
      career: { score: Number(career.toFixed(1)), ...buildPercentile(career, thresholds) },
    },
  };
}
