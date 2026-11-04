/** Timestamp parsing helpers. */

export type Unit = "s" | "ms" | "us" | "ns";

/** Guess the unit of a numeric epoch value by its magnitude. */
export function detectUnit(n: number): Unit {
	const a = Math.abs(n);
	if (a < 1e11) return "s"; // up to year 5138 in seconds
	if (a < 1e14) return "ms";
	if (a < 1e17) return "us";
	return "ns";
}

export const UNIT_LABEL: Record<Unit, string> = { s: "seconds", ms: "milliseconds", us: "microseconds", ns: "nanoseconds" };

export function parseInput(input: string, forced?: Unit): { date: Date; unit?: Unit } | null {
	const s = input.trim();
	if (!s) return null;
	if (/^-?\d+(\.\d+)?$/.test(s)) {
		const n = Number(s);
		const unit = forced ?? detectUnit(n);
		const ms = unit === "s" ? n * 1000 : unit === "ms" ? n : unit === "us" ? n / 1000 : n / 1e6;
		const date = new Date(ms);
		return Number.isNaN(date.getTime()) ? null : { date, unit };
	}
	const lower = s.toLowerCase();
	if (lower === "now") return { date: new Date() };
	if (lower === "today") {
		const d = new Date();
		d.setHours(0, 0, 0, 0);
		return { date: d };
	}
	const date = new Date(s);
	return Number.isNaN(date.getTime()) ? null : { date };
}

export function relative(date: Date, now = new Date()): string {
	const diff = (date.getTime() - now.getTime()) / 1000;
	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	const units: [Intl.RelativeTimeFormatUnit, number][] = [
		["year", 31536000],
		["month", 2592000],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60],
		["second", 1],
	];
	for (const [u, sec] of units) if (Math.abs(diff) >= sec || u === "second") return rtf.format(Math.round(diff / sec), u);
	return "";
}

export function isoWeek(d: Date): number {
	const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const day = t.getUTCDay() || 7;
	t.setUTCDate(t.getUTCDate() + 4 - day);
	const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
	return Math.ceil(((t.getTime() - y.getTime()) / 864e5 + 1) / 7);
}

export function dayOfYear(d: Date): number {
	return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
}

/** Formats a date in a given IANA zone as "YYYY-MM-DD HH:mm:ss" plus the offset. */
export function inZone(d: Date, timeZone: string) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
		timeZoneName: "shortOffset",
	}).formatToParts(d);
	const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
	return { text: `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`, offset: get("timeZoneName") };
}
