import { describe, expect, test } from "bun:test";
import { parseJson, sortKeysDeep } from "../json";
import { jsonToTs } from "../json-to-ts";
import { formatBig, parseBig, toTwos, fromBits } from "../base";
import { base64ToBytes, bytesToBase64, decodeUtf8, encodeUtf8 } from "../encoding";
import { decodeJwt, signHmac, verifyHmac } from "../jwt";
import { crc32, digestHex, md5, hmacMd5 } from "../hash";
import { bytesToHex } from "../encoding";
import { inspectId, ulid, uuidv4, uuidv7, randomString } from "../ids";
import { buildAlphabet, generatePassword, SETS } from "../password";
import { describeCron, nextRuns, parseCron } from "../cron";
import { diffLines, diffTokens, unifiedPatch } from "../diff";
import { CASES, clean, inspect, splitWords, stats } from "../text";
import { contrast, parseColor, rgbToOklch, toHex, toHslString, scale } from "../color";
import { fromOctal, fromSymbolic, toOctal, toSymbolic } from "../chmod";
import { detectUnit, parseInput } from "../time";
import { searchTools } from "../search";
import { tools } from "../../../data/tools";

describe("json", () => {
	test("parses valid JSON", () => {
		const r = parseJson('{"a": [1, 2, {"b": null}], "c": "\\u00e9\\n"}');
		expect(r.ok && r.value).toEqual({ a: [1, 2, { b: null }], c: "é\n" });
	});
	test("reports line and column", () => {
		const r = parseJson('{\n  "a": 1,\n  "b": 2,\n}');
		expect(r.ok).toBe(false);
		if (!r.ok) {
			expect(r.error.line).toBe(4);
			expect(r.error.column).toBe(1);
			expect(r.error.message).toContain("Trailing comma");
		}
	});
	test("flags single quotes, leading zeros and lossy integers", () => {
		expect(parseJson("{'a': 1}").ok).toBe(false);
		expect(parseJson("[01]").ok).toBe(false);
		const r = parseJson("[9007199254740993]");
		expect(r.ok && r.lossyNumbers).toEqual(["9007199254740993"]);
	});
	test("sorts keys recursively", () => {
		expect(JSON.stringify(sortKeysDeep({ b: 1, a: { d: 1, c: 2 } }))).toBe('{"a":{"c":2,"d":1},"b":1}');
	});
});

describe("json-to-ts", () => {
	test("merges array element shapes into optional fields", () => {
		const ts = jsonToTs({ users: [{ id: 1, name: "a" }, { id: 2, email: "x" }], ok: true });
		expect(ts).toContain("export interface Root {");
		expect(ts).toContain("users: User[];");
		expect(ts).toContain("name?: string;");
		expect(ts).toContain("email?: string;");
		expect(ts).toContain("id: number;");
	});
	test("handles unions, empty arrays and odd keys", () => {
		const ts = jsonToTs({ "a-b": [1, "x"], e: [], n: null });
		expect(ts).toContain('"a-b": Array<number | string>;');
		expect(ts).toContain("e: unknown[];");
		expect(ts).toContain("n: unknown | null;");
	});
	test("reuses identical shapes", () => {
		const ts = jsonToTs({ a: { x: 1 }, b: { x: 2 } });
		expect(ts.match(/interface/g)?.length).toBe(2);
	});
});

describe("base", () => {
	test("parses with prefixes and separators", () => {
		expect(parseBig("0xff", 10)).toBe(255n);
		expect(parseBig("1111_0000", 2)).toBe(240n);
		expect(formatBig(2n ** 64n, 16)).toBe("10000000000000000");
		expect(() => parseBig("12", 2)).toThrow();
	});
	test("two's complement", () => {
		expect(toTwos(-1n, 8)).toBe("11111111");
		expect(toTwos(128n, 8)).toBe("10000000");
		expect(toTwos(256n, 8)).toBeNull();
		expect(fromBits("11111110").signed).toBe(-2n);
	});
});

describe("base64", () => {
	test("utf-8 roundtrip and url-safe", () => {
		const b = bytesToBase64(encodeUtf8("héllo 👋"));
		expect(b).toBe("aMOpbGxvIPCfkYs=");
		expect(decodeUtf8(base64ToBytes(b))).toBe("héllo 👋");
		expect(bytesToBase64(new Uint8Array([251, 255]), true, false)).toBe("-_8");
		expect(base64ToBytes("-_8")).toEqual(new Uint8Array([251, 255]));
	});
	test("rejects garbage", () => {
		expect(() => base64ToBytes("ab$d")).toThrow();
	});
});

describe("jwt", () => {
	const token =
		"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
	test("decodes", () => {
		const d = decodeJwt(token);
		expect(d.header).toEqual({ alg: "HS256", typ: "JWT" });
		expect(d.payload).toEqual({ sub: "1234567890", name: "John Doe", iat: 1516239022 });
	});
	test("verifies jwt.io example", async () => {
		expect(await verifyHmac(token, encodeUtf8("your-256-bit-secret"), "HS256")).toBe(true);
		expect(await verifyHmac(token, encodeUtf8("nope"), "HS256")).toBe(false);
	});
	test("sign roundtrip", async () => {
		const t = await signHmac({ alg: "HS512", typ: "JWT" }, { a: 1 }, encodeUtf8("k"), "HS512");
		expect(await verifyHmac(t, encodeUtf8("k"), "HS512")).toBe(true);
	});
	test("errors are friendly", () => {
		expect(() => decodeJwt("abc")).toThrow(/3 dot-separated/);
	});
});

describe("hash", () => {
	test("md5 vectors", () => {
		expect(bytesToHex(md5(encodeUtf8("")))).toBe("d41d8cd98f00b204e9800998ecf8427e");
		expect(bytesToHex(md5(encodeUtf8("The quick brown fox jumps over the lazy dog")))).toBe("9e107d9d372bb6826bd81d3542a419d6");
		expect(bytesToHex(md5(encodeUtf8("a".repeat(1000))))).toBe("cabe45dcc9ae5b66ba86600cca6b8ba8");
	});
	test("hmac-md5", () => {
		expect(bytesToHex(hmacMd5(encodeUtf8("key"), encodeUtf8("The quick brown fox jumps over the lazy dog")))).toBe("80070713463e7749b90c2dc24911e275");
	});
	test("crc32 and sha", async () => {
		expect(crc32(encodeUtf8("123456789")).toString(16)).toBe("cbf43926");
		expect(await digestHex("SHA-256", encodeUtf8("abc"))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
		expect(await digestHex("CRC32", encodeUtf8("123456789"))).toBe("cbf43926");
	});
});

describe("ids", () => {
	test("uuid formats", () => {
		expect(uuidv4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		const v7 = uuidv7(1700000000000);
		expect(v7).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
		expect(inspectId(v7)?.timestamp?.getTime()).toBe(1700000000000);
	});
	test("uuid v7 is monotonic within a millisecond", () => {
		const ids = Array.from({ length: 50 }, () => uuidv7(1800000000000));
		expect([...ids].sort()).toEqual(ids);
	});
	test("ulid roundtrip", () => {
		const id = ulid(1700000000000);
		expect(id).toHaveLength(26);
		expect(inspectId(id)?.timestamp?.getTime()).toBe(1700000000000);
	});
	test("uuid v1 timestamp", () => {
		const info = inspectId("c232ab00-9414-11ec-b3c8-9f6bdeced846");
		expect(info?.version).toBe(1);
		expect(info?.timestamp?.toISOString()).toBe("2022-02-22T19:22:22.000Z");
	});
	test("randomString respects alphabet", () => {
		const s = randomString(500, "abc");
		expect(s).toMatch(/^[abc]{500}$/);
	});
});

describe("password", () => {
	test("contains every selected set", () => {
		for (let i = 0; i < 20; i++) {
			const pw = generatePassword({ length: 8, lower: true, upper: true, digits: true, symbols: true, excludeAmbiguous: false });
			expect(pw).toHaveLength(8);
			for (const set of Object.values(SETS)) expect([...pw].some((c) => set.includes(c))).toBe(true);
		}
	});
	test("excludes ambiguous", () => {
		const a = buildAlphabet({ length: 1, lower: true, upper: true, digits: true, symbols: false, excludeAmbiguous: true });
		expect(a).not.toMatch(/[Il1O0o]/);
	});
});

describe("cron", () => {
	const d = (e: string) => describeCron(parseCron(e));
	test("descriptions", () => {
		expect(d("* * * * *")).toBe("Every minute");
		expect(d("*/5 * * * *")).toBe("Every 5 minutes");
		expect(d("30 9 * * 1-5")).toBe("At 09:30, on Monday through Friday");
		expect(d("0 9,12,18 * * *")).toBe("At 09:00, 12:00 and 18:00");
		expect(d("@monthly")).toBe("At 00:00, on the 1st of the month");
		expect(d("*/15 9-17 * * mon-fri")).toBe("Every 15 minutes between 09:00 and 17:59, on Monday through Friday");
		expect(d("0 12 * JAN,JUL *")).toBe("At 12:00, in January and July");
	});
	test("errors", () => {
		expect(() => parseCron("* * *")).toThrow(/Expected 5 fields/);
		expect(() => parseCron("60 * * * *")).toThrow(/between 0 and 59/);
		expect(() => parseCron("* * * * * *")).toThrow(/6 fields/);
	});
	test("next runs (UTC)", () => {
		const from = new Date("2026-11-04T10:07:00Z");
		const iso = (e: string, n = 3) => nextRuns(parseCron(e), from, n, true).map((x) => x.toISOString());
		expect(iso("*/15 * * * *")).toEqual(["2026-11-04T10:15:00.000Z", "2026-11-04T10:30:00.000Z", "2026-11-04T10:45:00.000Z"]);
		expect(iso("0 0 29 2 *", 1)).toEqual(["2028-02-29T00:00:00.000Z"]);
		expect(iso("0 9 * * 0", 1)).toEqual(["2026-11-08T09:00:00.000Z"]);
		expect(iso("0 9 * * 7", 1)).toEqual(["2026-11-08T09:00:00.000Z"]);
		// dom OR dow when both are restricted
		expect(iso("0 0 1 * 5", 2)).toEqual(["2026-11-06T00:00:00.000Z", "2026-11-13T00:00:00.000Z"]);
		expect(iso("0 0 31 2 *", 1)).toEqual([]);
	});
});

describe("diff", () => {
	test("token diff", () => {
		const e = diffTokens("abcabba".split(""), "cbabac".split(""));
		const a = e.filter((x) => x.op !== "insert").flatMap((x) => x.items).join("");
		const b = e.filter((x) => x.op !== "delete").flatMap((x) => x.items).join("");
		expect(a).toBe("abcabba");
		expect(b).toBe("cbabac");
		expect(e.filter((x) => x.op !== "equal").reduce((n, x) => n + x.items.length, 0)).toBe(5);
	});
	test("line rows pair changes", () => {
		const rows = diffLines("a\nb\nc", "a\nB\nc\nd");
		expect(rows.map((r) => r.type)).toEqual(["equal", "change", "equal", "insert"]);
	});
	test("ignore case/whitespace", () => {
		const rows = diffLines("Hello  World", "hello world", { ignoreCase: true, ignoreWhitespace: true });
		expect(rows.map((r) => r.type)).toEqual(["equal"]);
	});
	test("unified patch", () => {
		const p = unifiedPatch(diffLines("a\nb\nc", "a\nx\nc"));
		expect(p).toBe("--- a\n+++ b\n@@ -1,3 +1,3 @@\n a\n-b\n+x\n c\n");
	});
});

describe("text", () => {
	test("finds invisible and confusable characters", () => {
		const r = inspect("pаypal​.com ");
		const names = r.findings.map((f) => f.info.kind).sort();
		expect(names).toEqual(["confusable", "invisible", "space"]);
		expect(clean("pаypal​.com ")).toBe("paypal.com ");
	});
	test("stats", () => {
		const s = stats("Hello world.\nThis is 👨‍👩‍👧 fun!");
		expect(s.words).toBe(5);
		expect(s.lines).toBe(2);
		expect(s.graphemes).toBeLessThan(s.codePoints);
	});
	test("case conversion", () => {
		expect(splitWords("XMLHttpRequest")).toEqual(["XML", "Http", "Request"]);
		const words = splitWords("user_id from XMLHttpRequest");
		const by = Object.fromEntries(CASES.map((c) => [c.id, c.fn(words, "user_id from XMLHttpRequest")]));
		expect(by.camel).toBe("userIdFromXmlHttpRequest");
		expect(by.snake).toBe("user_id_from_xml_http_request");
		expect(by.constant).toBe("USER_ID_FROM_XML_HTTP_REQUEST");
		expect(by.kebab).toBe("user-id-from-xml-http-request");
		expect(by.title).toBe("User Id from Xml Http Request");
		expect(CASES.find((c) => c.id === "slug")!.fn([], "Héllo Wörld!")).toBe("hello-world");
	});
});

describe("color", () => {
	test("parse and format", () => {
		expect(toHex(parseColor("rgb(255 0 0)")!)).toBe("#ff0000");
		expect(toHex(parseColor("#0f08")!)).toBe("#00ff0088");
		expect(toHex(parseColor("hsl(120 100% 25%)")!)).toBe("#008000");
		expect(toHslString(parseColor("#ff0000")!)).toBe("hsl(0 100% 50%)");
		expect(parseColor("nope")).toBeNull();
	});
	test("oklch roundtrip", () => {
		const red = rgbToOklch(parseColor("#ff0000")!);
		expect(red.l).toBeCloseTo(0.628, 3);
		expect(red.c).toBeCloseTo(0.2577, 3);
		expect(red.h).toBeCloseTo(29.23, 1);
		expect(toHex(parseColor("oklch(62.8% 0.2577 29.23)")!)).toBe("#ff0000");
	});
	test("contrast", () => {
		expect(contrast(parseColor("#000")!, parseColor("#fff")!)).toBeCloseTo(21, 5);
		expect(contrast(parseColor("#777")!, parseColor("#fff")!)).toBeCloseTo(4.48, 2);
	});
	test("scale has 11 steps getting darker, input anchored", () => {
		const s = scale(parseColor("#3b82f6")!);
		expect(s).toHaveLength(11);
		expect(s.filter((x) => x.anchor)).toHaveLength(1);
		const ls = s.map((x) => rgbToOklch(x.color).l);
		for (let i = 1; i < ls.length; i++) expect(ls[i]).toBeLessThan(ls[i - 1]);
	});
});

describe("chmod", () => {
	test("conversions", () => {
		expect(toSymbolic(fromOctal("755"))).toBe("rwxr-xr-x");
		expect(toOctal(fromSymbolic("rw-r--r--"))).toBe("644");
		expect(toSymbolic(fromOctal("4755"))).toBe("rwsr-xr-x");
		expect(toSymbolic(fromOctal("1777"))).toBe("rwxrwxrwt");
		expect(toOctal(fromSymbolic("drwxrwsr-x"))).toBe("2775");
	});
});

describe("time", () => {
	test("unit detection", () => {
		expect(detectUnit(1700000000)).toBe("s");
		expect(detectUnit(1700000000000)).toBe("ms");
		expect(detectUnit(1700000000000000)).toBe("us");
		expect(detectUnit(1.7e18)).toBe("ns");
		expect(parseInput("1700000000")?.date.toISOString()).toBe("2023-11-14T22:13:20.000Z");
		expect(parseInput("2024-01-01T00:00:00Z")?.date.getTime()).toBe(1704067200000);
		expect(parseInput("garbage")).toBeNull();
	});
});

describe("registry", () => {
	test("slugs are unique and url-safe", () => {
		const slugs = tools.map((t) => t.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
		for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
	});
	test("search ranks name matches first", () => {
		expect(searchTools(tools, "jwt")[0].slug).toBe("jwt");
		expect(searchTools(tools, "sha256")[0].slug).toBe("hash");
		expect(searchTools(tools, "epoch")[0].slug).toBe("timestamp");
		expect(searchTools(tools, "zzzz")).toHaveLength(0);
	});
});
