export type Period = "week" | "month" | "year";

export async function getRevenue(period: Period, date?: string) {
  const params = new URLSearchParams();
  params.set("period", period);
  if (date) params.set("date", date);
  const res = await fetch(`/api/v1/reports/revenue?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load report: ${res.status}`);
  return res.json();
}
