/**
 * SIH NER Smart Logistics Platform - Weather Risk Evaluator
 * Evaluates OpenWeather metrics against mountainous monsoon thresholds
 */

export function calculateWeatherRisk(weatherData) {
  if (!weatherData) {
    return { riskScore: 30, riskTier: 'Moderate', factors: ['Default regional monsoon estimate'] };
  }

  let risk = 15; // baseline hill terrain risk
  const factors = [];

  // Rainfall impact (highest weight for hill road landslides and mudflows)
  const rain = weatherData.rainfall_mm || 0;
  if (rain > 20) {
    risk += 45;
    factors.push(`Torrential downpour (${rain}mm) - high landslide triggering hazard`);
  } else if (rain > 8) {
    risk += 30;
    factors.push(`Heavy continuous rainfall (${rain}mm) - reduced visibility & traction`);
  } else if (rain > 2) {
    risk += 15;
    factors.push(`Moderate rainfall (${rain}mm) - wet highway conditions`);
  }

  // Wind speed impact
  const wind = weatherData.wind_speed_ms || 0;
  if (wind > 15) {
    risk += 25;
    factors.push(`Gale winds (${wind} m/s) - risk of falling trees/rocks`);
  } else if (wind > 9) {
    risk += 12;
    factors.push(`Strong mountain gusts (${wind} m/s)`);
  }

  // Weather condition string check
  const condition = (weatherData.condition || '').toLowerCase();
  if (condition.includes('thunderstorm') || condition.includes('squall')) {
    risk += 25;
    factors.push('Active thunderstorm / severe convective weather');
  } else if (condition.includes('fog') || condition.includes('mist')) {
    risk += 18;
    factors.push('Dense hill fog - severe reduction in stopping sight distance');
  } else if (condition.includes('rain') || condition.includes('drizzle')) {
    risk += 8;
  }

  const finalScore = Math.min(100, Math.max(10, Math.round(risk)));

  let riskTier = 'Safe';
  let badgeClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
  if (finalScore >= 70) {
    riskTier = 'Critical';
    badgeClass = 'text-red-400 bg-red-950/40 border-red-800';
  } else if (finalScore >= 50) {
    riskTier = 'Risky';
    badgeClass = 'text-orange-400 bg-orange-950/40 border-orange-800';
  } else if (finalScore >= 30) {
    riskTier = 'Moderate';
    badgeClass = 'text-amber-400 bg-amber-950/40 border-amber-800';
  }

  return {
    riskScore: finalScore,
    riskTier,
    badgeClass,
    factors: factors.length > 0 ? factors : ['Favorable atmospheric conditions along mountain pass']
  };
}
