/**
 * SIH NER Smart Logistics Platform - Rule-Based Route Health Score Calculator
 * 
 * IMPORTANT:
 * This is NOT Machine Learning.
 * It is a transparent, deterministic rule-based operational scoring model.
 * Label prominently: "Route Health Score (Rule-Based, NOT ML)"
 * 
 * Score Scale:
 *   80 – 100 : Safe
 *   60 – 79  : Moderate
 *   40 – 59  : Risky
 *   0  – 39  : Critical
 */

export function calculateRouteHealthScore({
  roadConditionScore = 80, // 0 to 100
  weatherRiskScore = 20,   // 0 to 100
  incidentCount = 0,       // integer count
  incidentSeverity = 0     // 0: none, 1: Low, 2: Moderate, 3: High, 4: Critical
}) {
  // Baseline starts from road condition
  let score = roadConditionScore * 0.45;

  // Weather risk deduction (up to 25 points deduction)
  const weatherDeduction = (weatherRiskScore / 100.0) * 25.0;
  score -= weatherDeduction;

  // Incident count deduction (10 points per incident)
  const countDeduction = Math.min(incidentCount * 10.0, 30.0);
  score -= countDeduction;

  // Incident severity deduction (up to 30 points)
  // 1: -5, 2: -12, 3: -22, 4: -32
  const severityMap = { 0: 0, 1: 5, 2: 12, 3: 22, 4: 32 };
  const severityDeduction = severityMap[incidentSeverity] || 0;
  score -= severityDeduction;

  // Base constant buffer to normalize to 0-100
  score += 35;

  // Bound to 0 - 100
  const finalScore = Math.max(5, Math.min(100, Math.round(score)));

  let tier = 'Safe';
  let badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
  let hexColor = '#22c55e';

  if (finalScore < 40) {
    tier = 'Critical';
    badgeColor = 'bg-red-500/20 text-red-400 border-red-500/40';
    hexColor = '#ef4444';
  } else if (finalScore < 60) {
    tier = 'Risky';
    badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
    hexColor = '#f97316';
  } else if (finalScore < 80) {
    tier = 'Moderate';
    badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    hexColor = '#eab308';
  }

  return {
    score: finalScore,
    tier,
    badgeColor,
    hexColor,
    isML: false,
    label: 'Route Health Score',
    breakdown: {
      roadConditionContribution: Math.round(roadConditionScore * 0.45),
      weatherPenalty: Math.round(weatherDeduction),
      incidentCountPenalty: Math.round(countDeduction),
      incidentSeverityPenalty: severityDeduction
    }
  };
}

export function getHealthTier(score) {
  if (score >= 80) return { tier: 'Safe', color: '#22c55e', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-800' };
  if (score >= 60) return { tier: 'Moderate', color: '#eab308', badge: 'bg-amber-950/60 text-amber-400 border-amber-800' };
  if (score >= 40) return { tier: 'Risky', color: '#f97316', badge: 'bg-orange-950/60 text-orange-400 border-orange-800' };
  return { tier: 'Critical', color: '#ef4444', badge: 'bg-red-950/60 text-red-400 border-red-800' };
}
