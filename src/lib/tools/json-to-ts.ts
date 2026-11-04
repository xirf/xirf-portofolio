/**
 * Infers TypeScript declarations from a JSON sample.
 *
 * Objects found in the same array are merged into one shape: keys missing from
 * some elements become optional, and differing value types become unions.
 */

type Shape =
	| { kind: "primitive"; name: "string" | "number" | "boolean" | "null" }
	| { kind: "unknown" }
	| { kind: "array"; item: Shape }
	| { kind: "object"; fields: Map<string, { shape: Shape; optional: boolean }>; hint: string }
	| { kind: "union"; members: Shape[] };

export interface JsonToTsOptions {
	rootName?: string;
	useType?: boolean; // `type X = {}` instead of `interface X {}`
	readonly?: boolean;
	exportDecl?: boolean;
	optionalNulls?: boolean; // null values become optional `?: T | null`
}

function infer(v: unknown, hint: string): Shape {
	if (v === null) return { kind: "primitive", name: "null" };
	if (Array.isArray(v)) {
		if (!v.length) return { kind: "array", item: { kind: "unknown" } };
		return { kind: "array", item: v.map((x) => infer(x, singular(hint))).reduce(merge) };
	}
	switch (typeof v) {
		case "string":
			return { kind: "primitive", name: "string" };
		case "number":
			return { kind: "primitive", name: "number" };
		case "boolean":
			return { kind: "primitive", name: "boolean" };
		case "object": {
			const fields = new Map<string, { shape: Shape; optional: boolean }>();
			for (const [k, x] of Object.entries(v as object)) fields.set(k, { shape: infer(x, k), optional: false });
			return { kind: "object", fields, hint };
		}
	}
	return { kind: "unknown" };
}

function members(s: Shape): Shape[] {
	return s.kind === "union" ? s.members : [s];
}

function sameKind(a: Shape, b: Shape) {
	if (a.kind !== b.kind) return false;
	if (a.kind === "primitive" && b.kind === "primitive") return a.name === b.name;
	return true;
}

export function merge(a: Shape, b: Shape): Shape {
	if (a.kind === "unknown") return b;
	if (b.kind === "unknown") return a;
	const out: Shape[] = [...members(a)];
	for (const m of members(b)) {
		const idx = out.findIndex((x) => sameKind(x, m));
		if (idx === -1) out.push(m);
		else out[idx] = mergeSame(out[idx], m);
	}
	return out.length === 1 ? out[0] : { kind: "union", members: out };
}

function mergeSame(a: Shape, b: Shape): Shape {
	if (a.kind === "array" && b.kind === "array") return { kind: "array", item: merge(a.item, b.item) };
	if (a.kind === "object" && b.kind === "object") {
		const fields = new Map<string, { shape: Shape; optional: boolean }>();
		for (const [k, fa] of a.fields) {
			const fb = b.fields.get(k);
			fields.set(k, fb ? { shape: merge(fa.shape, fb.shape), optional: fa.optional || fb.optional } : { ...fa, optional: true });
		}
		for (const [k, fb] of b.fields) if (!a.fields.has(k)) fields.set(k, { ...fb, optional: true });
		return { kind: "object", fields, hint: a.hint };
	}
	return a;
}

export function pascal(s: string): string {
	const words = s
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.split(/[^A-Za-z0-9]+/)
		.filter(Boolean);
	let out = words.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
	if (!out) out = "Item";
	if (/^\d/.test(out)) out = "_" + out;
	return out;
}

function singular(s: string): string {
	if (/ies$/i.test(s)) return s.slice(0, -3) + "y";
	if (/(ss|us|is)$/i.test(s)) return s;
	if (/(x|ch|sh|ses)es$/i.test(s)) return s.slice(0, -2);
	if (/s$/i.test(s) && s.length > 1) return s.slice(0, -1);
	return s + "Item";
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function jsonToTs(value: unknown, opts: JsonToTsOptions = {}): string {
	const { rootName = "Root", useType = false, readonly = false, exportDecl = true, optionalNulls = false } = opts;
	const decls: string[] = [];
	const used = new Map<string, string>(); // structural key -> name
	const names = new Set<string>();

	const uniqueName = (base: string) => {
		let name = pascal(base);
		let n = 2;
		while (names.has(name)) name = pascal(base) + n++;
		names.add(name);
		return name;
	};

	const emit = (s: Shape): string => {
		switch (s.kind) {
			case "primitive":
				return s.name;
			case "unknown":
				return "unknown";
			case "array": {
				const inner = emit(s.item);
				return /[|& ]/.test(inner) ? `Array<${inner}>` : `${inner}[]`;
			}
			case "union":
				return s.members.map(emit).join(" | ");
			case "object": {
				const ro = readonly ? "readonly " : "";
				const lines: string[] = [];
				for (const [k, f] of s.fields) {
					const key = IDENT.test(k) ? k : JSON.stringify(k);
					let type = emit(f.shape);
					const isNull = f.shape.kind === "primitive" && f.shape.name === "null";
					const hasNull = members(f.shape).some((m) => m.kind === "primitive" && m.name === "null");
					const optional = f.optional || (optionalNulls && hasNull);
					if (isNull) type = "unknown | null"; // only ever saw null, real type unknown
					lines.push(`  ${ro}${key}${optional ? "?" : ""}: ${type};`);
				}
				const body = lines.length ? `{\n${lines.join("\n")}\n}` : "Record<string, unknown>";
				const existing = used.get(body);
				if (existing) return existing;
				const name = uniqueName(s.hint);
				used.set(body, name);
				const ex = exportDecl ? "export " : "";
				decls.push(useType || !lines.length ? `${ex}type ${name} = ${body};` : `${ex}interface ${name} ${body}`);
				return name;
			}
		}
	};

	const root = infer(value, rootName);
	const top = emit(root);
	if (root.kind !== "object") {
		const ex = exportDecl ? "export " : "";
		decls.push(`${ex}type ${uniqueName(rootName)} = ${top};`);
	}
	// Dependencies are emitted first; show the root at the top for readability.
	return decls.reverse().join("\n\n") + "\n";
}
