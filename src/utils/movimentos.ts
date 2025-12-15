// src/utils/movimentos.ts

export function normalizeAmount(v: number | string): number {
  const n =
    typeof v === "number"
      ? v
      : Number(String(v).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

/**
 * Converte "dd/MM/yyyy" -> epoch(ms).
 * Usa meio-dia para reduzir efeitos de timezone/DST.
 */
export function dateStringToEpochMs(dateStr: string): number {
  const parts = String(dateStr || "").split("/").map((p) => p.trim());
  const d = Number(parts[0]);
  const m = Number(parts[1]);
  const y = Number(parts[2]);

  if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return Date.now();

  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  const ms = dt.getTime();
  return Number.isFinite(ms) ? ms : Date.now();
}
