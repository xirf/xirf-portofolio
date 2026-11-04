/**
 * Builds regular expressions from examples.
 *
 * Each example is split into runs of the same character kind ("2024-01-15" →
 * 4 digits, "-", 2 digits, "-", 2 digits). Examples are aligned against each
 * other (LCS), so parts that only some examples have become optional. Several
 * levels of generality are rendered, and every candidate is checked against the
 * examples that must and must not match. Only candidates that pass are offered.
 */

export type Quant = "smart" | "tight" | "open";

interface GenOptions {
	/** 0: [a-z] / [A-Z] / \d apart · 1: letters merged · 2: \w */
	level: 0 | 1 | 2;
	/** Keep text that is identical in every example as a literal. */
	literals: boolean;
	quant: Quant;
	/** Treat different punctuation characters as one class, e.g. [-/.] */
	mergePunct: boolean;
	/** Treat 0-9a-f as one class (hashes, colors, ids). */
	hex?: boolean;
}

interface Tok {
	key: string;
	text: string;
}

interface Col {
	key: string;
	texts: (string | null)[];
}

const isDigit = (c: string) => c >= "0" && c <= "9";
const isLetter = (c: string) => /\p{L}/u.test(c);
const isSpace = (c: string) => /\s/.test(c);

function charKey(c: string, o: GenOptions): string {
	if (isSpace(c)) return "s";
	if (o.hex && /[0-9a-fA-F]/.test(c)) return "h";
	if (o.level === 2 && (isDigit(c) || isLetter(c) || c === "_")) return "w";
	if (isDigit(c)) return "d";
	if (isLetter(c)) {
		if (o.level === 1) return "a";
		if (c !== c.toLowerCase()) return "u";
		if (c !== c.toUpperCase()) return "l";
		return "a"; // letters without case (CJK, Arabic…)
	}
	return o.mergePunct ? "p" : "p:" + c;
}

export function tokenize(s: string, o: GenOptions): Tok[] {
	const out: Tok[] = [];
	for (const c of Array.from(s)) {
		const key = charKey(c, o);
		const last = out[out.length - 1];
		if (last && last.key === key) last.text += c;
		else out.push({ key, text: c });
	}
	return out;
}

/** Progressive LCS alignment of token sequences into columns. */
export function align(seqs: Tok[][]): Col[] {
	let cols: Col[] = seqs[0].map((t) => ({ key: t.key, texts: [t.text] }));
	for (let i = 1; i < seqs.length; i++) {
		const seq = seqs[i];
		const n = cols.length;
		const m = seq.length;
		// Weighted LCS: lining up the same punctuation ("@", ".", "-") matters more
		// than lining up two runs of letters.
		// Columns shared by more examples weigh more, so "@" in every email beats a "." only one has.
		const kw = (k: string) => (k.startsWith("p") ? 4 : k === "s" ? 2 : 1);
		const weights = cols.map((c) => kw(c.key) * c.texts.filter((t) => t !== null).length);
		const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
		for (let a = n - 1; a >= 0; a--)
			for (let b = m - 1; b >= 0; b--)
				dp[a][b] = Math.max(dp[a + 1][b], dp[a][b + 1], cols[a].key === seq[b].key ? dp[a + 1][b + 1] + weights[a] : -1);
		const next: Col[] = [];
		let a = 0;
		let b = 0;
		const absent = () => Array<string | null>(i).fill(null);
		while (a < n || b < m) {
			if (a < n && b < m && cols[a].key === seq[b].key && dp[a][b] === dp[a + 1][b + 1] + weights[a]) {
				next.push({ key: cols[a].key, texts: [...cols[a].texts, seq[b].text] });
				a++;
				b++;
			} else if (b >= m || (a < n && dp[a + 1][b] >= dp[a][b + 1])) {
				next.push({ key: cols[a].key, texts: [...cols[a].texts, null] });
				a++;
			} else {
				next.push({ key: seq[b].key, texts: [...absent(), seq[b].text] });
				b++;
			}
		}
		cols = next;
	}
	return cols;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const escapeClass = (c: string) => (/[\]\\^-]/.test(c) ? "\\" + c : c);
const isAscii = (s: string) => /^[\x00-\x7f]*$/.test(s);

interface Rendered {
	re: string;
	explain: string;
	unicode: boolean;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

function renderCol(col: Col, o: GenOptions): Rendered {
	const present = col.texts.filter((t): t is string => t !== null);
	const allSame = present.every((t) => t === present[0]);
	const ascii = present.every(isAscii);

	if (col.key.startsWith("p:") || (o.literals && present.length >= 2 && allSame)) {
		if (allSame) return { re: escapeRe(present[0]), explain: `"${present[0]}"`, unicode: !ascii };
	}

	const lens = present.map((t) => Array.from(t).length);
	const min = Math.min(...lens);
	const max = Math.max(...lens);
	let quant: string;
	let count: string;
	// "smart": fixed-length digit fields stay exact ({4} for a year), words of
	// letters only stay exact when they're short codes seen several times (INV, id).
	const wordy = col.key !== "d" && col.key !== "h" && col.key !== "s" && !col.key.startsWith("p");
	const keepExact = min === max && (max === 1 || !wordy || (present.length >= 2 && max <= 3));
	if (o.quant === "open" || (o.quant === "smart" && !keepExact)) {
		quant = "+";
		count = "1+";
	} else if (min === max) {
		quant = min === 1 ? "" : `{${min}}`;
		count = String(min);
	} else {
		quant = `{${min},${max}}`;
		count = `${min}–${max}`;
	}

	let cls: string;
	let what: string;
	switch (col.key) {
		case "d":
			cls = "\\d";
			what = "digit";
			break;
		case "l":
			cls = ascii ? "[a-z]" : "\\p{Ll}";
			what = "lowercase letter";
			break;
		case "u":
			cls = ascii ? "[A-Z]" : "\\p{Lu}";
			what = "uppercase letter";
			break;
		case "a":
			cls = ascii ? "[a-zA-Z]" : "\\p{L}";
			what = "letter";
			break;
		case "w":
			cls = ascii ? "\\w" : "[\\p{L}\\p{N}_]";
			what = "word character";
			break;
		case "h":
			cls = present.every((t) => t === t.toLowerCase()) ? "[0-9a-f]" : present.every((t) => t === t.toUpperCase()) ? "[0-9A-F]" : "[0-9a-fA-F]";
			what = "hex digit";
			break;
		case "s": {
			const onlySpaces = present.every((t) => /^ +$/.test(t));
			cls = onlySpaces ? " " : "\\s";
			what = onlySpaces ? "space" : "whitespace character";
			break;
		}
		default: {
			// merged punctuation, or a literal punctuation column whose texts differ in length
			const chars = [...new Set(present.flatMap((t) => Array.from(t)))];
			cls = chars.length === 1 ? escapeRe(chars[0]) : `[${chars.map(escapeClass).join("")}]`;
			what = chars.length === 1 ? `"${chars[0]}"` : `one of ${chars.join(" ")}`;
			return { re: cls + quant, explain: `${count} × ${what}`, unicode: !ascii };
		}
	}
	return { re: cls + quant, explain: `${count} ${count === "1" ? what : what + "s"}`, unicode: cls.includes("\\p") };
}

/** Renders aligned columns. Consecutive optional columns with the same presence are grouped. */
export function renderColumns(cols: Col[], o: GenOptions): { body: string; explain: string[]; unicode: boolean } {
	const mask = (c: Col) => c.texts.map((t) => (t === null ? "0" : "1")).join("");
	let body = "";
	const explain: string[] = [];
	let unicode = false;
	for (let i = 0; i < cols.length; ) {
		const m = mask(cols[i]);
		const optional = m.includes("0");
		let j = i + 1;
		if (optional) while (j < cols.length && mask(cols[j]) === m) j++;
		const parts = cols.slice(i, j).map((c) => renderCol(c, o));
		unicode ||= parts.some((p) => p.unicode);
		const re = parts.map((p) => p.re).join("");
		if (optional) {
			body += `(?:${re})?`;
			explain.push(`optional: ${parts.map((p) => p.explain).join(" + ")}`);
		} else {
			body += re;
			explain.push(...parts.map((p) => p.explain));
		}
		i = j;
	}
	return { body, explain, unicode };
}

export interface Candidate {
	pattern: string; // without slashes
	flags: string;
	label: string;
	explain: string[];
}

function fromExamples(examples: string[], o: GenOptions) {
	return renderColumns(
		align(examples.map((e) => tokenize(e, o))),
		o,
	);
}

const looksHex = (examples: string[]) => examples.some((e) => /[0-9][a-f]|[a-f][0-9]/i.test(e));
const configsFor = (examples: string[]) => CONFIGS.filter((c) => !c.o.hex || looksHex(examples));

const CONFIGS: { o: GenOptions; label: string }[] = [
	{ o: { level: 0, literals: true, quant: "smart", mergePunct: false }, label: "Keeps shared text" },
	{ o: { level: 0, literals: false, quant: "smart", mergePunct: false }, label: "Character types" },
	{ o: { level: 1, literals: false, quant: "smart", mergePunct: false }, label: "Any letter case" },
	{ o: { level: 2, literals: false, quant: "smart", mergePunct: false }, label: "Letters and digits mixed" },
	{ o: { level: 2, literals: false, quant: "smart", mergePunct: false, hex: true }, label: "Hex digits" },
	{ o: { level: 0, literals: true, quant: "tight", mergePunct: false }, label: "Exact lengths" },
	{ o: { level: 0, literals: false, quant: "tight", mergePunct: false }, label: "Exact lengths, no shared text" },
	{ o: { level: 0, literals: false, quant: "smart", mergePunct: true }, label: "Any separator" },
	{ o: { level: 1, literals: false, quant: "open", mergePunct: true }, label: "Loose" },
	{ o: { level: 2, literals: false, quant: "open", mergePunct: true }, label: "Very loose" },
];

/** Groups examples by shape and alternates them, e.g. two phone number formats. */
function grouped(examples: string[]): Candidate | null {
	const o = CONFIGS[0].o;
	const groups = new Map<string, string[]>();
	for (const e of examples) {
		const shape = tokenize(e, o)
			.map((t) => t.key)
			.join(" ");
		groups.set(shape, [...(groups.get(shape) ?? []), e]);
	}
	if (groups.size < 2 || groups.size > 6) return null;
	const parts = [...groups.values()].map((g) => fromExamples(g, o));
	return {
		pattern: `(?:${parts.map((p) => p.body).join("|")})`,
		flags: parts.some((p) => p.unicode) ? "u" : "",
		label: `One branch per format (${groups.size})`,
		explain: parts.map((p, i) => `format ${i + 1}: ${p.explain.join(" · ")}`),
	};
}

function literalList(examples: string[]): Candidate {
	const uniq = [...new Set(examples)].sort((a, b) => b.length - a.length);
	return {
		pattern: uniq.length === 1 ? escapeRe(uniq[0]) : `(?:${uniq.map(escapeRe).join("|")})`,
		flags: isAscii(uniq.join("")) ? "" : "u",
		label: "Exactly these values",
		explain: ["only the listed examples"],
	};
}

function dedupe(list: Candidate[]): Candidate[] {
	const seen = new Set<string>();
	return list.filter((c) => {
		const k = c.pattern + "/" + c.flags;
		if (seen.has(k)) return false;
		seen.add(k);
		return true;
	});
}

function compile(c: Candidate, extra = ""): RegExp | null {
	try {
		return new RegExp(c.pattern, [...new Set(c.flags + extra)].join(""));
	} catch {
		return null;
	}
}

/* ------------------------------------------------------------------------ */
/* Mode 1: whole values                                                      */
/* ------------------------------------------------------------------------ */

export interface WholeResult extends Candidate {
	failures: { positive: string[]; negative: string[] };
	valid: boolean;
}

export function buildWhole(positives: string[], negatives: string[]): WholeResult[] {
	const pos = positives.filter((s) => s.length);
	if (!pos.length) return [];
	const raw: Candidate[] = [];
	const add = (body: string, flags: string, label: string, explain: string[]) =>
		raw.push({ pattern: `^${body}$`, flags, label, explain });
	configsFor(pos).forEach(({ o, label }, i) => {
		const r = fromExamples(pos, o);
		add(r.body, r.unicode ? "u" : "", label, r.explain);
		if (i === 3) {
			const g = grouped(pos);
			if (g) add(g.pattern, g.flags, g.label, g.explain);
		}
	});
	const lit = literalList(pos);
	add(lit.pattern, lit.flags, lit.label, lit.explain);

	return dedupe(raw).map((c) => {
		const re = compile(c);
		const failures = {
			positive: re ? pos.filter((p) => !re.test(p)) : pos,
			negative: re ? negatives.filter((n) => n.length && re.test(n)) : [],
		};
		return { ...c, failures, valid: !failures.positive.length && !failures.negative.length };
	});
}

/* ------------------------------------------------------------------------ */
/* Mode 2: find in text                                                      */
/* ------------------------------------------------------------------------ */

export interface Range {
	start: number;
	end: number;
}

export interface FindResult extends Candidate {
	matches: Range[];
	missed: Range[]; // examples not matched exactly
	hitNegatives: Range[]; // forbidden ranges that got matched
	extras: Range[]; // other matches, not marked either way
	valid: boolean;
}

const overlaps = (a: Range, b: Range) => a.start < b.end && b.start < a.end;

function commonSuffix(list: string[]): string {
	if (!list.length) return "";
	let s = list[0];
	for (const t of list.slice(1)) {
		let i = 0;
		while (i < s.length && i < t.length && s[s.length - 1 - i] === t[t.length - 1 - i]) i++;
		s = s.slice(s.length - i);
	}
	return s;
}

function commonPrefix(list: string[]): string {
	if (!list.length) return "";
	let s = list[0];
	for (const t of list.slice(1)) {
		let i = 0;
		while (i < s.length && i < t.length && s[i] === t[i]) i++;
		s = s.slice(0, i);
	}
	return s;
}

const wordish = (c: string | undefined) => !!c && /[\p{L}\p{N}_]/u.test(c);

export function buildFind(text: string, positives: Range[], negatives: Range[]): FindResult[] {
	if (!positives.length) return [];
	const examples = positives.map((r) => text.slice(r.start, r.end));
	const firstChars = examples.map((e) => e[0]);
	const lastChars = examples.map((e) => e[e.length - 1]);
	// \b only makes sense when the edge is a word character in every example.
	// Punctuation that appears *inside* the examples (". + @" in emails). A match
	// shouldn't start or stop in the middle of a token made of those, otherwise
	// "budi.santoso@x.com" would yield "santoso@x.com". A trailing "." before a
	// space still counts as the end, so sentence-final punctuation is fine.
	const inner = [...new Set(examples.join("").replace(/[\p{L}\p{N}_\s]/gu, ""))].map(escapeClass).join("");
	const startB = !firstChars.every(wordish) ? "" : inner ? `(?<!\\w[${inner}]*)` : "\\b";
	const endB = !lastChars.every(wordish) ? "" : inner ? `(?![${inner}]*\\w)` : "\\b";

	// Shared context right before / after every example, on the same line.
	const before = commonSuffix(positives.map((r) => text.slice(Math.max(0, r.start - 24), r.start).split("\n").pop()!));
	const after = commonPrefix(positives.map((r) => text.slice(r.end, r.end + 24).split("\n")[0]));
	const trimBefore = before;
	const contexts: [string, string, string][] = [["", "", ""]];
	if (trimBefore) contexts.push([`(?<=${escapeRe(trimBefore)})`, "", `after "${trimBefore}"`]);
	if (after) contexts.push(["", `(?=${escapeRe(after)})`, `before "${after}"`]);
	if (trimBefore && after) contexts.push([`(?<=${escapeRe(trimBefore)})`, `(?=${escapeRe(after)})`, `between "${trimBefore}" and "${after}"`]);

	const raw: Candidate[] = [];
	for (const [lb, la, ctx] of contexts) {
		for (const { o, label } of configsFor(examples)) {
			const r = fromExamples(examples, o);
			const flags = r.unicode ? "u" : "";
			raw.push({ pattern: `${lb}${startB}${r.body}${endB}${la}`, flags, label: ctx ? `${label}, ${ctx}` : label, explain: ctx ? [...r.explain, ctx] : r.explain });
			if (startB || endB) raw.push({ pattern: `${lb}${r.body}${la}`, flags, label: `${label}, can start mid-word${ctx ? ", " + ctx : ""}`, explain: r.explain });
		}
		const g = grouped(examples);
		if (g) raw.push({ ...g, pattern: `${lb}${startB}${g.pattern}${endB}${la}`, label: ctx ? `${g.label}, ${ctx}` : g.label });
	}
	const lit = literalList(examples);
	raw.push({ ...lit, pattern: `${startB}${lit.pattern}${endB}` });

	return dedupe(raw).map((c) => {
		const re = compile(c, "g");
		const matches: Range[] = [];
		if (re) {
			for (const m of text.matchAll(re)) {
				matches.push({ start: m.index!, end: m.index! + m[0].length });
				if (matches.length > 5000) break;
			}
		}
		const exact = new Set(matches.map((m) => `${m.start}:${m.end}`));
		const missed = positives.filter((p) => !exact.has(`${p.start}:${p.end}`));
		const hitNegatives = negatives.filter((n) => matches.some((m) => overlaps(m, n)));
		const extras = matches.filter((m) => !positives.some((p) => p.start === m.start && p.end === m.end) && m.end > m.start);
		return { ...c, matches, missed, hitNegatives, extras, valid: !missed.length && !hitNegatives.length };
	});
}
