export type FitScores = { capabilities:number; pastWork:number; capacity:number; demand:number; market:number };
const weights: Record<keyof FitScores, number> = { capabilities:.3, pastWork:.2, capacity:.2, demand:.2, market:.1 };
export function weightedFit(scores: FitScores) { return Math.round(Object.entries(weights).reduce((total,[key]) => total + Math.max(0, Math.min(5, scores[key as keyof FitScores])) * weights[key as keyof FitScores], 0) * 20); }
export function qualifies(employers:number, datedRecent:number, contextPages:number) { return employers >= 2 && datedRecent >= 2 && contextPages >= 1; }
