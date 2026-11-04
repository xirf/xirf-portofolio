/** Unicode inspection: invisible characters, confusables and statistics. */

export interface CharInfo {
	char: string;
	cp: number;
	hex: string; // U+XXXX
	name: string;
	kind: "invisible" | "space" | "confusable" | "control" | "bidi" | "normal";
}

/** Code points that render as nothing (or as ordinary-looking space) but change the bytes. */
const SPECIAL: Record<number, [string, CharInfo["kind"]]> = {
	0x00a0: ["NO-BREAK SPACE", "space"],
	0x1680: ["OGHAM SPACE MARK", "space"],
	0x2000: ["EN QUAD", "space"],
	0x2001: ["EM QUAD", "space"],
	0x2002: ["EN SPACE", "space"],
	0x2003: ["EM SPACE", "space"],
	0x2004: ["THREE-PER-EM SPACE", "space"],
	0x2005: ["FOUR-PER-EM SPACE", "space"],
	0x2006: ["SIX-PER-EM SPACE", "space"],
	0x2007: ["FIGURE SPACE", "space"],
	0x2008: ["PUNCTUATION SPACE", "space"],
	0x2009: ["THIN SPACE", "space"],
	0x200a: ["HAIR SPACE", "space"],
	0x202f: ["NARROW NO-BREAK SPACE", "space"],
	0x205f: ["MEDIUM MATHEMATICAL SPACE", "space"],
	0x3000: ["IDEOGRAPHIC SPACE", "space"],
	0x00ad: ["SOFT HYPHEN", "invisible"],
	0x034f: ["COMBINING GRAPHEME JOINER", "invisible"],
	0x061c: ["ARABIC LETTER MARK", "bidi"],
	0x115f: ["HANGUL CHOSEONG FILLER", "invisible"],
	0x1160: ["HANGUL JUNGSEONG FILLER", "invisible"],
	0x17b4: ["KHMER VOWEL INHERENT AQ", "invisible"],
	0x17b5: ["KHMER VOWEL INHERENT AA", "invisible"],
	0x180e: ["MONGOLIAN VOWEL SEPARATOR", "invisible"],
	0x200b: ["ZERO WIDTH SPACE", "invisible"],
	0x200c: ["ZERO WIDTH NON-JOINER", "invisible"],
	0x200d: ["ZERO WIDTH JOINER", "invisible"],
	0x200e: ["LEFT-TO-RIGHT MARK", "bidi"],
	0x200f: ["RIGHT-TO-LEFT MARK", "bidi"],
	0x2028: ["LINE SEPARATOR", "invisible"],
	0x2029: ["PARAGRAPH SEPARATOR", "invisible"],
	0x202a: ["LEFT-TO-RIGHT EMBEDDING", "bidi"],
	0x202b: ["RIGHT-TO-LEFT EMBEDDING", "bidi"],
	0x202c: ["POP DIRECTIONAL FORMATTING", "bidi"],
	0x202d: ["LEFT-TO-RIGHT OVERRIDE", "bidi"],
	0x202e: ["RIGHT-TO-LEFT OVERRIDE", "bidi"],
	0x2060: ["WORD JOINER", "invisible"],
	0x2061: ["FUNCTION APPLICATION", "invisible"],
	0x2062: ["INVISIBLE TIMES", "invisible"],
	0x2063: ["INVISIBLE SEPARATOR", "invisible"],
	0x2064: ["INVISIBLE PLUS", "invisible"],
	0x2066: ["LEFT-TO-RIGHT ISOLATE", "bidi"],
	0x2067: ["RIGHT-TO-LEFT ISOLATE", "bidi"],
	0x2068: ["FIRST STRONG ISOLATE", "bidi"],
	0x2069: ["POP DIRECTIONAL ISOLATE", "bidi"],
	0x3164: ["HANGUL FILLER", "invisible"],
	0xfeff: ["ZERO WIDTH NO-BREAK SPACE (BOM)", "invisible"],
	0xffa0: ["HALFWIDTH HANGUL FILLER", "invisible"],
	0xfffc: ["OBJECT REPLACEMENT CHARACTER", "invisible"],
};

/** Common Cyrillic/Greek letters that look identical to Latin ones. */
const CONFUSABLES: Record<string, string> = {
	"а": "a", "е": "e", "о": "o", "р": "p", "с": "c", "у": "y", "х": "x", "і": "i", "ј": "j", "ѕ": "s", "һ": "h", "ԁ": "d", "ԛ": "q", "ԝ": "w",
	"А": "A", "В": "B", "Е": "E", "К": "K", "М": "M", "Н": "H", "О": "O", "Р": "P", "С": "C", "Т": "T", "Х": "X", "І": "I", "Ј": "J", "Ѕ": "S",
	"α": "a", "ο": "o", "ν": "v", "ρ": "p", "Α": "A", "Β": "B", "Ε": "E", "Ζ": "Z", "Η": "H", "Ι": "I", "Κ": "K", "Μ": "M", "Ν": "N", "Ο": "O", "Ρ": "P", "Τ": "T", "Υ": "Y", "Χ": "X",
	"ℓ": "l", "ꓲ": "I", "ı": "i", "ɡ": "g", "ɑ": "a", "‐": "-", "‑": "-", "‒": "-", "–": "-", "—": "-", "−": "-", "＇": "'", "‘": "'", "’": "'", "“": '"', "”": '"', "；": ";", "：": ":", "，": ",",
};

const CONTROL_NAMES: Record<number, string> = { 0: "NULL", 7: "BELL", 8: "BACKSPACE", 9: "TAB", 10: "LINE FEED", 11: "VERTICAL TAB", 12: "FORM FEED", 13: "CARRIAGE RETURN", 27: "ESCAPE", 127: "DELETE" };

export const hexCp = (cp: number) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

export function classify(char: string): CharInfo {
	const cp = char.codePointAt(0)!;
	const hex = hexCp(cp);
	if (SPECIAL[cp]) return { char, cp, hex, name: SPECIAL[cp][0], kind: SPECIAL[cp][1] };
	if (cp >= 0xe0000 && cp <= 0xe007f) return { char, cp, hex, name: "TAG CHARACTER (can hide text)", kind: "invisible" };
	if (cp >= 0xfe00 && cp <= 0xfe0f) return { char, cp, hex, name: `VARIATION SELECTOR-${cp - 0xfe00 + 1}`, kind: "invisible" };
	if (cp < 32 || (cp >= 127 && cp < 160)) {
		const kind = cp === 9 || cp === 10 || cp === 13 ? "normal" : "control";
		return { char, cp, hex, name: CONTROL_NAMES[cp] ?? "CONTROL CHARACTER", kind };
	}
	if (CONFUSABLES[char]) return { char, cp, hex, name: `Looks like "${CONFUSABLES[char]}"`, kind: "confusable" };
	return { char, cp, hex, name: "", kind: "normal" };
}

export function inspect(text: string) {
	const chars = Array.from(text).map(classify);
	const findings = new Map<number, { info: CharInfo; count: number }>();
	for (const c of chars) {
		if (c.kind === "normal") continue;
		const f = findings.get(c.cp);
		if (f) f.count++;
		else findings.set(c.cp, { info: c, count: 1 });
	}
	return { chars, findings: [...findings.values()] };
}

/** Removes invisible/bidi/control chars and normalises odd spaces & confusables. */
export function clean(text: string, { confusables = true } = {}): string {
	return Array.from(text)
		.map((ch) => {
			const c = classify(ch);
			if (c.kind === "invisible" || c.kind === "bidi" || c.kind === "control") return "";
			if (c.kind === "space") return " ";
			if (c.kind === "confusable" && confusables) return CONFUSABLES[ch];
			return ch;
		})
		.join("");
}

export function stats(text: string) {
	const graphemes =
		typeof Intl !== "undefined" && "Segmenter" in Intl
			? [...new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text)].length
			: Array.from(text).length;
	const words = text.trim() ? (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length : 0;
	const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
	const sentences = (text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? []).length;
	const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
	return {
		graphemes,
		codePoints: Array.from(text).length,
		utf16: text.length,
		bytes: new TextEncoder().encode(text).length,
		words,
		lines,
		sentences,
		paragraphs,
		readingMinutes: words / 230,
	};
}

/* ------------------------------------------------------------------------ */
/* Case conversion                                                           */
/* ------------------------------------------------------------------------ */

/** Splits identifiers and prose into words: "XMLHttpRequest2Go" → ["XML","Http","Request","2","Go"]. */
export function splitWords(input: string): string[] {
	return (
		input
			.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2")
			.replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2")
			.replace(/(\p{L})(\p{N})/gu, "$1 $2")
			.match(/[\p{L}\p{N}]+/gu) ?? []
	);
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
const SMALL = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "the", "to", "up", "via", "vs", "from", "into", "with", "per"]);

export const CASES: { id: string; name: string; fn: (w: string[], raw: string) => string }[] = [
	{ id: "camel", name: "camelCase", fn: (w) => w.map((x, i) => (i ? cap(x) : x.toLowerCase())).join("") },
	{ id: "pascal", name: "PascalCase", fn: (w) => w.map(cap).join("") },
	{ id: "snake", name: "snake_case", fn: (w) => w.join("_").toLowerCase() },
	{ id: "constant", name: "CONSTANT_CASE", fn: (w) => w.join("_").toUpperCase() },
	{ id: "kebab", name: "kebab-case", fn: (w) => w.join("-").toLowerCase() },
	{ id: "cobol", name: "COBOL-CASE", fn: (w) => w.join("-").toUpperCase() },
	{ id: "dot", name: "dot.case", fn: (w) => w.join(".").toLowerCase() },
	{ id: "path", name: "path/case", fn: (w) => w.join("/").toLowerCase() },
	{ id: "train", name: "Train-Case", fn: (w) => w.map(cap).join("-") },
	{ id: "title", name: "Title Case", fn: (w) => w.map((x, i) => (i && i < w.length - 1 && SMALL.has(x.toLowerCase()) ? x.toLowerCase() : cap(x))).join(" ") },
	{ id: "sentence", name: "Sentence case", fn: (w) => w.map((x, i) => (i ? x.toLowerCase() : cap(x))).join(" ") },
	{ id: "lower", name: "lower case", fn: (w) => w.join(" ").toLowerCase() },
	{ id: "upper", name: "UPPER CASE", fn: (w) => w.join(" ").toUpperCase() },
	{
		id: "slug",
		name: "url-slug",
		fn: (_w, raw) =>
			splitWords(raw.normalize("NFKD").replace(/[̀-ͯ]/g, ""))
				.join("-")
				.toLowerCase(),
	},
	{ id: "alternating", name: "aLtErNaTiNg", fn: (_w, raw) => Array.from(raw).map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join("") },
];
