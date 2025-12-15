//src/utils.ts
export const monthKey = (isoDate: string) => isoDate.slice(0, 7); // YYYY-MM
export const todayISO = () => new Date().toISOString().slice(0, 10);
