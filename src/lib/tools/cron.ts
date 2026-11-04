/**
 * Standard 5-field cron (minute hour day-of-month month day-of-week):
 * parsing, plain-English descriptions and next-run computation.
 * Supports *, lists, ranges, steps, ?, month/day names, 7 = Sunday and @macros.
 */

export const MACROS: Record<string, string> = {
	"@yearly": "0 0 1 1 *",
	"@annually": "0 0 1 1 *",
	"@monthly": "0 0 1 * *",
	"@weekly": "0 0 * * 0",
	"@daily": "0 0 * * *",
	"@midnight": "0 0 * * *",
	"@hourly": "0 * * * *",
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface FieldSpec {
	name: string;
	min: number;
	max: number;
	names?: string[];
}

export const FIELDS: FieldSpec[] = [
	{ name: "minute", min: 0, max: 59 },
	{ name: "hour", min: 0, max: 23 },
	{ name: "day of month", min: 1, max: 31 },
	{ name: "month", min: 1, max: 12, names: MONTHS.map((m) => m.slice(0, 3).toUpperCase()) },
	{ name: "day of week", min: 0, max: 7, names: DAYS.map((d) => d.slice(0, 3).toUpperCase()) },
];

type Part = { kind: "any"; step: number } | { kind: "range"; from: number; to: number; step: number } | { kind: "value"; value: number };

export interface Field {
	raw: string;
	parts: Part[];
	values: Set<number>;
	restricted: boolean; // false when the field is * or ?
}

export interface Cron {
	expression: string;
	fields: Field[]; // minute, hour, dom, month, dow
}

export class CronError extends Error {
	constructor(
		message: string,
		public field?: number,
	) {
		super(message);
	}
}

function parseNumber(s: string, spec: FieldSpec, idx: number): number {
	const upper = s.toUpperCase();
	if (spec.names) {
		const i = spec.names.indexOf(upper);
		if (i !== -1) return spec.name === "month" ? i + 1 : i;
	}
	if (!/^\d+$/.test(s)) throw new CronError(`"${s}" is not a valid ${spec.name}`, idx);
	const n = Number(s);
	if (n < spec.min || n > spec.max) throw new CronError(`${spec.name} must be between ${spec.min} and ${spec.max}, got ${n}`, idx);
	return n;
}

function parseField(raw: string, idx: number): Field {
	const spec = FIELDS[idx];
	const parts: Part[] = [];
	const values = new Set<number>();
	for (const piece of raw.split(",")) {
		if (!piece) throw new CronError(`Empty list item in ${spec.name}`, idx);
		const [base, stepStr, extra] = piece.split("/");
		if (extra !== undefined) throw new CronError(`Too many "/" in ${spec.name}`, idx);
		let step = 1;
		if (stepStr !== undefined) {
			if (!/^\d+$/.test(stepStr) || Number(stepStr) === 0) throw new CronError(`Invalid step "${stepStr}" in ${spec.name}`, idx);
			step = Number(stepStr);
		}
		let from: number;
		let to: number;
		if (base === "*" || base === "?") {
			from = spec.min;
			to = spec.name === "day of week" ? 6 : spec.max;
			parts.push({ kind: "any", step });
		} else if (base.includes("-")) {
			const [a, b] = base.split("-");
			from = parseNumber(a, spec, idx);
			to = parseNumber(b, spec, idx);
			if (from > to) throw new CronError(`Range ${base} in ${spec.name} goes backwards`, idx);
			parts.push({ kind: "range", from, to, step });
		} else {
			from = parseNumber(base, spec, idx);
			// "5/15" means "from 5, every 15" up to the max.
			to = stepStr !== undefined ? spec.max : from;
			parts.push(stepStr !== undefined ? { kind: "range", from, to, step } : { kind: "value", value: from });
		}
		for (let v = from; v <= to; v += step) values.add(spec.name === "day of week" && v === 7 ? 0 : v);
	}
	const restricted = !(parts.length === 1 && parts[0].kind === "any" && parts[0].step === 1);
	return { raw, parts, values, restricted };
}

export function parseCron(expression: string): Cron {
	const trimmed = expression.trim().replace(/\s+/g, " ");
	if (!trimmed) throw new CronError("Enter a cron expression");
	const expanded = MACROS[trimmed.toLowerCase()] ?? trimmed;
	if (expanded.startsWith("@")) {
		if (expanded.toLowerCase() === "@reboot") throw new CronError("@reboot runs once at startup and has no schedule");
		throw new CronError(`Unknown macro ${expanded}`);
	}
	const raw = expanded.split(" ");
	if (raw.length === 6) throw new CronError("6 fields given. This tool reads standard 5-field cron; drop the seconds (or year) field.");
	if (raw.length !== 5) throw new CronError(`Expected 5 fields (minute hour day month weekday), got ${raw.length}`);
	return { expression: trimmed, fields: raw.map((r, i) => parseField(r, i)) };
}

/* ------------------------------------------------------------------------ */
/* Next runs                                                                 */
/* ------------------------------------------------------------------------ */

function dayMatches(c: Cron, dom: number, dow: number): boolean {
	const [, , fDom, , fDow] = c.fields;
	const domOk = fDom.values.has(dom);
	const dowOk = fDow.values.has(dow);
	// Vixie cron: if both are restricted, either one may match.
	if (fDom.restricted && fDow.restricted) return domOk || dowOk;
	return domOk && dowOk;
}

export function nextRuns(c: Cron, from: Date, count = 10, utc = false): Date[] {
	const g = utc
		? { Y: "getUTCFullYear", M: "getUTCMonth", D: "getUTCDate", d: "getUTCDay", h: "getUTCHours", m: "getUTCMinutes" }
		: { Y: "getFullYear", M: "getMonth", D: "getDate", d: "getDay", h: "getHours", m: "getMinutes" };
	const get = (t: Date, k: keyof typeof g) => (t as any)[g[k]]() as number;
	const make = (Y: number, M: number, D: number, h = 0, m = 0) => (utc ? new Date(Date.UTC(Y, M, D, h, m)) : new Date(Y, M, D, h, m));

	const [fMin, fHour, , fMonth] = c.fields;
	const out: Date[] = [];
	let t = new Date(from.getTime());
	t.setSeconds(0, 0);
	t = new Date(t.getTime() + 60_000);
	const limit = from.getTime() + 8 * 366 * 864e5; // give up after ~8 years (e.g. Feb 30)

	while (out.length < count && t.getTime() < limit) {
		const Y = get(t, "Y"), M = get(t, "M"), D = get(t, "D"), h = get(t, "h");
		if (!fMonth.values.has(M + 1)) {
			t = make(Y, M + 1, 1);
			continue;
		}
		if (!dayMatches(c, D, get(t, "d"))) {
			t = make(Y, M, D + 1);
			continue;
		}
		if (!fHour.values.has(h)) {
			t = make(Y, M, D, h + 1);
			// DST gaps can make local "h + 1" land on the same hour; always move forward.
			continue;
		}
		if (!fMin.values.has(get(t, "m"))) {
			t = new Date(t.getTime() + 60_000);
			continue;
		}
		out.push(t);
		t = new Date(t.getTime() + 60_000);
	}
	return out;
}

/* ------------------------------------------------------------------------ */
/* Plain English                                                             */
/* ------------------------------------------------------------------------ */

const pad = (n: number) => String(n).padStart(2, "0");

function ordinal(n: number) {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function list(items: string[]): string {
	if (items.length <= 1) return items.join("");
	return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

function label(idx: number, v: number): string {
	if (idx === 3) return MONTHS[v - 1];
	if (idx === 4) return DAYS[v % 7];
	if (idx === 2) return ordinal(v);
	if (idx === 1) return `${pad(v)}:00`;
	return String(v);
}

/** Compact phrase for one list item, e.g. "5", "10 through 20", "every 15th from 0 through 30". */
function partText(p: Part, idx: number): string {
	if (p.kind === "value") return label(idx, p.value);
	if (p.kind === "any") return `every ${ordinal(p.step)}`;
	const range = `${label(idx, p.from)} through ${label(idx, p.to)}`;
	return p.step === 1 ? range : `every ${ordinal(p.step)} from ${range}`;
}

const listText = (f: Field, idx: number) => list(f.parts.map((p) => partText(p, idx)));
const only = (f: Field) => (f.parts.length === 1 ? f.parts[0] : null);
const allValues = (f: Field) => f.parts.every((p) => p.kind === "value");

function minuteText(f: Field): string {
	const p = only(f);
	if (!f.restricted) return "Every minute";
	if (p?.kind === "any") return `Every ${p.step} minutes`;
	if (p?.kind === "value") return `At minute ${p.value}`;
	if (p?.kind === "range")
		return p.step === 1 ? `Every minute from minute ${p.from} through ${p.to}` : `Every ${p.step} minutes from minute ${p.from} through ${p.to}`;
	return `At minutes ${listText(f, 0)}`;
}

function hourText(f: Field, minuteIsPoint: boolean): string {
	const p = only(f);
	const joiner = minuteIsPoint ? "past" : "of";
	if (!f.restricted) return minuteIsPoint ? " past every hour" : "";
	if (p?.kind === "any") return ` ${joiner} every ${ordinal(p.step)} hour`;
	if (p?.kind === "range" && p.step === 1) return ` between ${pad(p.from)}:00 and ${pad(p.to)}:59`;
	if (p?.kind === "range") return ` ${joiner} every ${ordinal(p.step)} hour from ${pad(p.from)}:00 through ${pad(p.to)}:00`;
	if (allValues(f)) {
		const hours = [...f.values].sort((a, b) => a - b).map((h) => `${pad(h)}:00`);
		return ` during the ${list(hours)} hour${hours.length > 1 ? "s" : ""}`;
	}
	return ` during hours ${listText(f, 1)}`;
}

function domText(f: Field): string {
	const p = only(f);
	if (p?.kind === "any") return `every ${p.step} days of the month starting on the 1st`;
	return `on the ${listText(f, 2)} of the month`;
}

function monthText(f: Field): string {
	const p = only(f);
	if (p?.kind === "any") return `every ${p.step} months`;
	if (p?.kind === "range" && p.step > 1) return `every ${p.step} months from ${MONTHS[p.from - 1]} through ${MONTHS[p.to - 1]}`;
	return `in ${listText(f, 3)}`;
}

export function describeCron(c: Cron): string {
	const [fMin, fHour, fDom, fMonth, fDow] = c.fields;
	let time: string;

	if (allValues(fMin) && allValues(fHour) && fMin.values.size * fHour.values.size <= 6) {
		const times: string[] = [];
		for (const h of [...fHour.values].sort((a, b) => a - b))
			for (const m of [...fMin.values].sort((a, b) => a - b)) times.push(`${pad(h)}:${pad(m)}`);
		time = `At ${list(times)}`;
	} else {
		time = minuteText(fMin) + hourText(fHour, fMin.restricted && allValues(fMin));
	}

	const extras: string[] = [];
	const dom = fDom.restricted ? domText(fDom) : "";
	const dow = fDow.restricted ? `on ${listText(fDow, 4)}` : "";
	if (dom && dow) extras.push(`${dom}, or ${dow.replace(/^on /, "on any ")}`);
	else if (dom || dow) extras.push(dom || dow);
	if (fMonth.restricted) extras.push(monthText(fMonth));

	return [time, ...extras].join(", ");
}

export function fieldSummary(c: Cron) {
	return c.fields.map((f, i) => ({
		name: FIELDS[i].name,
		raw: f.raw,
		values: f.restricted ? [...f.values].sort((a, b) => a - b) : null,
	}));
}
