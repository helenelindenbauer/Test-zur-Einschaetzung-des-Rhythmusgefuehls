// ============================================================
// TEST-1-BERECHNUNGEN: Beat-Zeitpunkte, relative Phase, SI_ARV/SI_LRV/SI_ENT
// ============================================================
// (Formeln wie in der Musical-Tapping-Test-Besprechung hergeleitet)

// Erzeugt die Beat-Zeitpunkte für ein Stück mit festem Tempo (kein Rubato).
function generateBeatTimes(bpm, durationSec) {
  const interval = 60 / bpm; // Sekunden zwischen zwei Vierteln
  const beats = [];
  for (let t = 0; t <= durationSec; t += interval) {
    beats.push(Number(t.toFixed(4)));
  }
  return beats;
}

// Relative Phase eines einzelnen Taps gegenüber dem nächstgelegenen Beat,
// in Grad zwischen -180° (zu früh, Mitte) und +180° (zu spät, Mitte).
function relativePhase(tapTime, beatTimes) {
  let i = beatTimes.findIndex(b => b > tapTime) - 1;
  if (i < 0) i = 0;
  if (i >= beatTimes.length - 1) i = beatTimes.length - 2;

  const prevBeat = beatTimes[i];
  const nextBeat = beatTimes[i + 1];
  const interval = nextBeat - prevBeat;

  const distToPrev = tapTime - prevBeat;
  const distToNext = nextBeat - tapTime;
  const nearestBeat = distToPrev <= distToNext ? prevBeat : nextBeat;

  const diffSeconds = tapTime - nearestBeat;
  return (diffSeconds / interval) * 360;
}

// SI_ARV (Accuracy), SI_LRV (Konsistenz), SI_ENT (Konsistenz, entropiebasiert)
// aus einer Liste von relativen Phasen (Grad).
function computeSynchronizationIndices(phasesDeg) {
  const n = phasesDeg.length;
  if (n === 0) return null;

  let sumCos = 0, sumSin = 0;
  phasesDeg.forEach(theta => {
    const rad = theta * Math.PI / 180;
    sumCos += Math.cos(rad);
    sumSin += Math.sin(rad);
  });

  const Rx = sumCos / n;
  const Ry = sumSin / n;

  const SI_LRV = Math.sqrt(Rx * Rx + Ry * Ry);
  const SI_ARV = Math.atan2(Ry, Rx) * 180 / Math.PI;

  const binSize = 5;
  const numBins = 360 / binSize;
  const bins = new Array(numBins).fill(0);
  phasesDeg.forEach(theta => {
    let idx = Math.floor((theta + 180) / binSize);
    idx = Math.max(0, Math.min(numBins - 1, idx));
    bins[idx]++;
  });

  const probs = bins.map(count => count / n).filter(p => p > 0);
  const SE = -probs.reduce((sum, p) => sum + p * Math.log(p), 0);
  const SI_ENT = 1 - SE / Math.log(numBins);

  return { SI_ARV, SI_LRV, SI_ENT, n };
}

// Phase 2 (Sync-Tapping): Taps gegen die Beat-Zeitpunkte des Stücks bewerten
function scorePhase2(taps, beatTimes, phase1End, phase2End) {
  const relevantBeats = beatTimes.filter(b => b >= phase1End && b <= phase2End);
  const phases = taps.map(tap => relativePhase(tap, relevantBeats));
  return computeSynchronizationIndices(phases);
}

// Phase 3 (Continuation ohne Musik): Inter-Tap-Intervalle, Tempo-Drift
function scorePhase3(taps, targetInterval) {
  const sorted = [...taps].sort((a, b) => a - b);
  if (sorted.length < 2) return null;

  const ITIs = [];
  for (let i = 1; i < sorted.length; i++) {
    ITIs.push(sorted[i] - sorted[i - 1]);
  }

  const meanITI = ITIs.reduce((a, b) => a + b, 0) / ITIs.length;
  const variance = ITIs.reduce((a, b) => a + (b - meanITI) ** 2, 0) / ITIs.length;
  const sdITI = Math.sqrt(variance);
  const cv = sdITI / meanITI;

  const n = ITIs.length;
  const xMean = (n - 1) / 2;
  let num = 0, den = 0;
  ITIs.forEach((y, x) => {
    num += (x - xMean) * (y - meanITI);
    den += (x - xMean) ** 2;
  });
  const slope = num / den;

  const tempoAccuracy = meanITI - targetInterval;

  return { meanITI, sdITI, cv, slope, tempoAccuracy, n };
}
