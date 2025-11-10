export function suggestRebalance(current: Record<string, number>, target: Record<string, number>) {
  const suggestions = [];

  for (const coin in current) {
    const currentPct = current[coin];
    const targetPct = target[coin] || 0;
    const delta = currentPct - targetPct;

    if (delta > 0) {
      suggestions.push({ from: coin, amount: delta });
    }
  }

  return suggestions;
}