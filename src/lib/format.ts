// Display formats from UI-PROMPT.md: dd/MM/yyyy, HH:mm, 1.000.000 ₫.

const pad = (n: number) => String(n).padStart(2, "0");

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${formatDate(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatMoney(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} ₫`;
}

/** "2026-10" -> "T10/2026" */
export function formatMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `T${m}/${y}`;
}

/** Whole days from now until `iso`; negative when past. */
export function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
