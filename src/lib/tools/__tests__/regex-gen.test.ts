import { describe, expect, test } from "bun:test";
import { buildFind, buildWhole } from "../regex-gen";

const best = (pos: string[], neg: string[] = []) => buildWhole(pos, neg).find((c) => c.valid)!;

describe("regex builder: whole values", () => {
	test("dates keep fixed digit counts", () => {
		expect(best(["2024-01-15", "1999-12-31"]).pattern).toBe("^\\d{4}-\\d{2}-\\d{2}$");
	});
	test("shared prefix stays literal and negatives are respected", () => {
		const c = best(["INV-2024-0042", "INV-2023-1187"], ["inv-2024-0042", "INV-24-0042"]);
		expect(c.pattern).toBe("^INV-\\d{4}-\\d{4}$");
	});
	test("emails align on @ and optional parts", () => {
		const c = best(["hello@andka.id", "support@example.co.uk", "first.last@mail.org"]);
		expect(c.pattern).toBe("^[a-z]+(?:\\.[a-z]+)?@[a-z]+\\.[a-z]+(?:\\.[a-z]+)?$");
	});
	test("hex colors", () => {
		expect(best(["#fff", "#3b82f6"], ["#ggg", "3b82f6"]).pattern).toBe("^#[0-9a-f]+$");
	});
	test("capitalised words", () => {
		expect(best(["Hello", "World"], ["hello"]).pattern).toBe("^[A-Z][a-z]+$");
	});
	test("every valid candidate really is valid", () => {
		const pos = ["+62 812-3456-7890", "0812-3456-7890"];
		const neg = ["812", "phone"];
		for (const c of buildWhole(pos, neg).filter((c) => c.valid)) {
			const re = new RegExp(c.pattern, c.flags);
			for (const p of pos) expect(re.test(p)).toBe(true);
			for (const n of neg) expect(re.test(n)).toBe(false);
		}
	});
	test("falls back to an exact list when nothing else separates", () => {
		const r = buildWhole(["abc"], ["abd", "abcd", "xyz"]);
		expect(r.filter((c) => c.valid).map((c) => c.pattern)).toContain("^abc$");
	});
});

describe("regex builder: find in text", () => {
	const text = "Order #10023 shipped on 2026-03-14\nOrder #10024 total $20.50\nTicket #88 reopened";
	const at = (s: string) => ({ start: text.indexOf(s), end: text.indexOf(s) + s.length });
	test("finds all selections exactly", () => {
		const c = buildFind(text, [at("10023"), at("10024")], []).find((c) => c.valid)!;
		expect(c.pattern).toBe("\\b\\d{5}\\b");
		expect(c.extras).toHaveLength(0);
	});
	test("uses surrounding context to exclude a negative", () => {
		const c = buildFind(text, [at("10023"), at("88")], [at("2026")]).find((c) => c.valid)!;
		expect(c.pattern).toBe("(?<= #)\\b\\d+\\b");
		expect(c.extras.map((e) => text.slice(e.start, e.end))).toEqual(["10024"]);
	});
	test("never matches half of a dotted token", () => {
		const t = "mail hello@andka.id or budi.santoso@gmail.com.";
		const at2 = (s: string) => ({ start: t.indexOf(s), end: t.indexOf(s) + s.length });
		const c = buildFind(t, [at2("hello@andka.id")], []).find((c) => c.valid)!;
		const found = c.matches.map((m) => t.slice(m.start, m.end));
		expect(found).not.toContain("santoso@gmail.com");
		const c2 = buildFind(t, [at2("hello@andka.id"), at2("budi.santoso@gmail.com")], []).find((c) => c.valid)!;
		expect(c2.matches.map((m) => t.slice(m.start, m.end))).toEqual(["hello@andka.id", "budi.santoso@gmail.com"]);
	});
});
