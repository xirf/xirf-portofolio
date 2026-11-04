/** Myers O(ND) diff over arbitrary token arrays, plus line/char helpers. */

export type Op = "equal" | "insert" | "delete";
export interface Edit<T> {
	op: Op;
	items: T[];
}

export function diffTokens<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean = (x, y) => x === y): Edit<T>[] {
	// Trim common prefix/suffix first; it's cheap and makes typical diffs tiny.
	let start = 0;
	while (start < a.length && start < b.length && eq(a[start], b[start])) start++;
	let endA = a.length;
	let endB = b.length;
	while (endA > start && endB > start && eq(a[endA - 1], b[endB - 1])) {
		endA--;
		endB--;
	}
	const A = a.slice(start, endA);
	const B = b.slice(start, endB);
	const N = A.length;
	const M = B.length;
	const max = N + M;
	const v = new Int32Array(2 * max + 2);
	const trace: Int32Array[] = [];
	let found = N === 0 && M === 0;
	for (let d = 0; d <= max && !found; d++) {
		trace.push(v.slice());
		for (let k = -d; k <= d; k += 2) {
			let x = k === -d || (k !== d && v[max + k - 1] < v[max + k + 1]) ? v[max + k + 1] : v[max + k - 1] + 1;
			let y = x - k;
			while (x < N && y < M && eq(A[x], B[y])) {
				x++;
				y++;
			}
			v[max + k] = x;
			if (x >= N && y >= M) {
				found = true;
				break;
			}
		}
	}
	// Backtrack to build the script.
	const script: { op: Op; item: T }[] = [];
	let x = N;
	let y = M;
	for (let d = trace.length - 1; d >= 0 && (x > 0 || y > 0); d--) {
		const vd = trace[d];
		const k = x - y;
		const prevK = k === -d || (k !== d && vd[max + k - 1] < vd[max + k + 1]) ? k + 1 : k - 1;
		const prevX = vd[max + prevK];
		const prevY = prevX - prevK;
		while (x > prevX && y > prevY) script.push({ op: "equal", item: A[--x] }), y--;
		if (d > 0) {
			if (x === prevX) script.push({ op: "insert", item: B[--y] });
			else script.push({ op: "delete", item: A[--x] });
		}
	}
	script.reverse();

	const edits: Edit<T>[] = [];
	const push = (op: Op, item: T) => {
		const last = edits[edits.length - 1];
		if (last && last.op === op) last.items.push(item);
		else edits.push({ op, items: [item] });
	};
	a.slice(0, start).forEach((t) => push("equal", t));
	script.forEach((s) => push(s.op, s.item));
	a.slice(endA).forEach((t) => push("equal", t));
	return edits;
}

export interface DiffOptions {
	ignoreWhitespace?: boolean;
	ignoreCase?: boolean;
}

export type Row =
	| { type: "equal"; left: string; right: string; ln: number; rn: number }
	| { type: "delete"; left: string; ln: number }
	| { type: "insert"; right: string; rn: number }
	| { type: "change"; left: string; right: string; ln: number; rn: number; leftParts: Edit<string>[]; rightParts: Edit<string>[] };

const normalize = (s: string, o: DiffOptions) => {
	let r = s;
	if (o.ignoreWhitespace) r = r.replace(/\s+/g, " ").trim();
	if (o.ignoreCase) r = r.toLowerCase();
	return r;
};

/** Splits into words, whitespace runs and punctuation for readable inline highlights. */
export function wordTokens(s: string): string[] {
	return s.match(/\w+|\s+|[^\w\s]/gu) ?? [];
}

export function diffLines(left: string, right: string, opts: DiffOptions = {}): Row[] {
	const a = left.split(/\r?\n/);
	const b = right.split(/\r?\n/);
	const edits = diffTokens(a, b, (x, y) => normalize(x, opts) === normalize(y, opts));
	const rows: Row[] = [];
	let ln = 1;
	let rn = 1;
	for (let i = 0; i < edits.length; i++) {
		const e = edits[i];
		if (e.op === "equal") {
			// Equal under normalisation; show both sides as they really are.
			for (let k = 0; k < e.items.length; k++) rows.push({ type: "equal", left: a[ln - 1], right: b[rn - 1], ln: ln++, rn: rn++ });
			continue;
		}
		// Pair a delete block with a following insert block as "changes".
		const dels = e.op === "delete" ? e.items : [];
		const next = edits[i + 1];
		const ins = e.op === "insert" ? e.items : next?.op === "insert" ? next.items : [];
		if (e.op === "delete" && next?.op === "insert") i++;
		const pairs = Math.min(dels.length, ins.length);
		for (let j = 0; j < pairs; j++) {
			const l = dels[j];
			const r = ins[j];
			const parts = diffTokens(wordTokens(l), wordTokens(r));
			rows.push({
				type: "change",
				left: l,
				right: r,
				ln: ln++,
				rn: rn++,
				leftParts: parts.filter((p) => p.op !== "insert"),
				rightParts: parts.filter((p) => p.op !== "delete"),
			});
		}
		for (let j = pairs; j < dels.length; j++) rows.push({ type: "delete", left: dels[j], ln: ln++ });
		for (let j = pairs; j < ins.length; j++) rows.push({ type: "insert", right: ins[j], rn: rn++ });
	}
	return rows;
}

export function unifiedPatch(rows: Row[], context = 3, names = ["a", "b"]): string {
	const out = [`--- ${names[0]}`, `+++ ${names[1]}`];
	const lines: { prefix: string; text: string; ln?: number; rn?: number; changed: boolean }[] = [];
	for (const r of rows) {
		if (r.type === "equal") lines.push({ prefix: " ", text: r.left, ln: r.ln, rn: r.rn, changed: false });
		else if (r.type === "delete") lines.push({ prefix: "-", text: r.left, ln: r.ln, changed: true });
		else if (r.type === "insert") lines.push({ prefix: "+", text: r.right, rn: r.rn, changed: true });
		else {
			lines.push({ prefix: "-", text: r.left, ln: r.ln, changed: true });
			lines.push({ prefix: "+", text: r.right, rn: r.rn, changed: true });
		}
	}
	// Reorder so all '-' of a change block come before '+' (standard patch layout).
	const ordered: typeof lines = [];
	for (let i = 0; i < lines.length; ) {
		if (!lines[i].changed) {
			ordered.push(lines[i++]);
			continue;
		}
		const block: typeof lines = [];
		while (i < lines.length && lines[i].changed) block.push(lines[i++]);
		ordered.push(...block.filter((l) => l.prefix === "-"), ...block.filter((l) => l.prefix === "+"));
	}
	let i = 0;
	while (i < ordered.length) {
		if (!ordered[i].changed) {
			i++;
			continue;
		}
		let s = Math.max(0, i - context);
		let e = i;
		// Extend hunk while changes are within 2*context of each other.
		for (;;) {
			while (e < ordered.length && ordered[e].changed) e++;
			let gap = e;
			while (gap < ordered.length && !ordered[gap].changed && gap - e < context * 2) gap++;
			if (gap < ordered.length && ordered[gap].changed) e = gap;
			else break;
		}
		const end = Math.min(ordered.length, e + context);
		const hunk = ordered.slice(s, end);
		const oldStart = hunk.find((l) => l.ln)?.ln ?? 0;
		const newStart = hunk.find((l) => l.rn)?.rn ?? 0;
		const oldLen = hunk.filter((l) => l.prefix !== "+").length;
		const newLen = hunk.filter((l) => l.prefix !== "-").length;
		out.push(`@@ -${oldStart},${oldLen} +${newStart},${newLen} @@`);
		hunk.forEach((l) => out.push(l.prefix + l.text));
		i = end;
		s = end;
	}
	return out.join("\n") + "\n";
}
