export const LOCAL_ANALYSIS_HISTORY_KEY = "cybersaathi-local-analysis-history-v1";
const MAX_LOCAL_ANALYSES = 50;

export function getLocalAnalysisHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCAL_ANALYSIS_HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not read saved checks from this browser.", error);
    return [];
  }
}

export function saveLocalAnalysis(analysis) {
  const record = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    messageType: analysis.messageType,
    level: analysis.level,
    categories: analysis.categories,
    createdAt: new Date().toISOString(),
  };
  const history = [record, ...getLocalAnalysisHistory()].slice(0, MAX_LOCAL_ANALYSES);

  try {
    localStorage.setItem(LOCAL_ANALYSIS_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Could not save this check in browser storage.", error);
    throw new Error("This browser could not save the result. Check that local storage is available and try again.");
  }

  return record;
}
