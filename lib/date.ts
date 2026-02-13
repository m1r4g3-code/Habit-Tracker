export const getLogicDate = (date: Date = new Date()): string => {
  const adjusted = new Date(date);
  // If before 6am, it counts as previous day
  if (adjusted.getHours() < 6) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return adjusted.toISOString().split('T')[0];
};

export const getTodayKey = (): string => {
  return getLogicDate();
};