/**
 * A strict JSON parser that reports precise error positions (line/column)
 * consistently across browsers, and flags numbers that lose precision.
 */

export interface JsonError {
	message: string;
	offset: number;
	line: number;
	column: number;
}

export type ParseResult = { ok: true; value: unknown; lossyNumbers: string[] } | { ok: false; error: JsonError };

export function locate(text: string, offset: number) {
	let line = 1;
	let col = 1;
	for (let i = 0; i < offset && i < text.length; i++) {
		if (text[i] === "\n") {
			line++;
			col = 1;
		} else col++;
	}
	return { line, column: col };
}

class Fail extends Error {
	constructor(
		message: string,
		public offset: number,
	) {
		super(message);
	}
}

export function parseJson(text: string): ParseResult {
	let i = 0;
	const lossy: string[] = [];

	const describe = (ch: string | undefined) =>
		ch === undefined ? "end of input" : JSON.stringify(ch);

	const ws = () => {
		while (i < text.length) {
			const c = text.charCodeAt(i);
			if (c === 32 || c === 9 || c === 10 || c === 13) i++;
			else break;
		}
	};

	const value = (): unknown => {
		ws();
		const ch = text[i];
		if (ch === "{") return object();
		if (ch === "[") return array();
		if (ch === '"') return string();
		if (ch === "-" || (ch >= "0" && ch <= "9")) return number();
		if (text.startsWith("true", i)) return (i += 4), true;
		if (text.startsWith("false", i)) return (i += 5), false;
		if (text.startsWith("null", i)) return (i += 4), null;
		if (ch === "'") throw new Fail("Strings must use double quotes", i);
		if (text.startsWith("undefined", i) || text.startsWith("NaN", i) || text.startsWith("Infinity", i))
			throw new Fail("Not a valid JSON value (undefined, NaN and Infinity are JavaScript only)", i);
		throw new Fail(`Unexpected ${describe(ch)}, expected a value`, i);
	};

	const object = () => {
		const out: Record<string, unknown> = {};
		i++; // {
		ws();
		if (text[i] === "}") return i++, out;
		for (;;) {
			ws();
			if (text[i] !== '"') {
				if (text[i] === "}") throw new Fail("Trailing comma before }", i);
				throw new Fail(`Expected a double-quoted property name, got ${describe(text[i])}`, i);
			}
			const key = string();
			ws();
			if (text[i] !== ":") throw new Fail(`Expected ':' after property name, got ${describe(text[i])}`, i);
			i++;
			out[key] = value();
			ws();
			if (text[i] === ",") {
				i++;
				continue;
			}
			if (text[i] === "}") return i++, out;
			throw new Fail(`Expected ',' or '}' after property value, got ${describe(text[i])}`, i);
		}
	};

	const array = () => {
		const out: unknown[] = [];
		i++; // [
		ws();
		if (text[i] === "]") return i++, out;
		for (;;) {
			ws();
			if (text[i] === "]") throw new Fail("Trailing comma before ]", i);
			out.push(value());
			ws();
			if (text[i] === ",") {
				i++;
				continue;
			}
			if (text[i] === "]") return i++, out;
			throw new Fail(`Expected ',' or ']' after array element, got ${describe(text[i])}`, i);
		}
	};

	const string = () => {
		const start = i;
		i++; // "
		let out = "";
		for (;;) {
			const ch = text[i];
			if (ch === undefined) throw new Fail("Unterminated string", start);
			if (ch === '"') return i++, out;
			if (ch === "\\") {
				const esc = text[i + 1];
				const map: Record<string, string> = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
				if (esc in map) {
					out += map[esc];
					i += 2;
				} else if (esc === "u") {
					const hex = text.slice(i + 2, i + 6);
					if (!/^[0-9a-fA-F]{4}$/.test(hex)) throw new Fail("Invalid \\u escape, expected 4 hex digits", i);
					out += String.fromCharCode(parseInt(hex, 16));
					i += 6;
				} else throw new Fail(`Invalid escape sequence \\${esc ?? ""}`, i);
				continue;
			}
			if (ch.charCodeAt(0) < 0x20) throw new Fail("Unescaped control character in string (use \\n, \\t…)", i);
			out += ch;
			i++;
		}
	};

	const number = () => {
		const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i, i + 400));
		if (!m) throw new Fail("Invalid number", i);
		if (/^-?0\d/.test(text.slice(i, i + 3))) throw new Fail("Numbers cannot have leading zeros", i);
		const raw = m[0];
		i += raw.length;
		const n = Number(raw);
		if (!m[2] && !m[3] && !Number.isSafeInteger(n)) lossy.push(raw);
		return n;
	};

	try {
		const v = value();
		ws();
		if (i < text.length) throw new Fail(`Unexpected ${describe(text[i])} after the end of the JSON value`, i);
		return { ok: true, value: v, lossyNumbers: lossy };
	} catch (e) {
		if (e instanceof Fail) {
			return { ok: false, error: { message: e.message, offset: e.offset, ...locate(text, e.offset) } };
		}
		throw e;
	}
}

export function sortKeysDeep(v: unknown): unknown {
	if (Array.isArray(v)) return v.map(sortKeysDeep);
	if (v && typeof v === "object") {
		return Object.fromEntries(
			Object.keys(v as object)
				.sort((a, b) => a.localeCompare(b))
				.map((k) => [k, sortKeysDeep((v as Record<string, unknown>)[k])]),
		);
	}
	return v;
}

export function jsonStats(v: unknown) {
	let keys = 0;
	let values = 0;
	let depth = 0;
	const walk = (x: unknown, d: number) => {
		depth = Math.max(depth, d);
		if (Array.isArray(x)) x.forEach((y) => walk(y, d + 1));
		else if (x && typeof x === "object") {
			for (const [, y] of Object.entries(x)) {
				keys++;
				walk(y, d + 1);
			}
		} else values++;
	};
	walk(v, 0);
	return { keys, values, depth };
}

/** Context lines around an error with a caret pointing at the column. */
export function errorSnippet(text: string, line: number, column: number, context = 2): string {
	const lines = text.split("\n");
	const from = Math.max(0, line - 1 - context);
	const to = Math.min(lines.length, line + context);
	const width = String(to).length;
	const out: string[] = [];
	for (let n = from; n < to; n++) {
		out.push(`${String(n + 1).padStart(width)} │ ${lines[n]}`);
		if (n === line - 1) out.push(`${" ".repeat(width)} │ ${" ".repeat(Math.max(0, column - 1))}^`);
	}
	return out.join("\n");
}
