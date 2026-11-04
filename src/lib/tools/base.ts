/** Arbitrary-precision integer parsing/formatting across bases using BigInt. */

export const BASES = { bin: 2, oct: 8, dec: 10, hex: 16 } as const;
export type BaseKey = keyof typeof BASES;

const PREFIX: Record<string, number> = { "0b": 2, "0o": 8, "0x": 16 };

/** Parses an integer in the given radix. Accepts _ and space separators and 0x/0b/0o prefixes. */
export function parseBig(input: string, radix: number): bigint {
	let s = input.trim().replace(/[_\s,]/g, "").toLowerCase();
	let neg = false;
	if (s.startsWith("-")) {
		neg = true;
		s = s.slice(1);
	} else if (s.startsWith("+")) s = s.slice(1);
	const p = s.slice(0, 2);
	if (PREFIX[p]) {
		radix = PREFIX[p];
		s = s.slice(2);
	}
	if (!s) throw new Error("Empty number");
	const digits = "0123456789abcdefghijklmnopqrstuvwxyz".slice(0, radix);
	let n = 0n;
	const r = BigInt(radix);
	for (const ch of s) {
		const d = digits.indexOf(ch);
		if (d === -1) throw new Error(`"${ch}" is not a valid base-${radix} digit`);
		n = n * r + BigInt(d);
	}
	return neg ? -n : n;
}

export function formatBig(n: bigint, radix: number, group = 0): string {
	const neg = n < 0n;
	let s = (neg ? -n : n).toString(radix);
	if (group > 0) s = groupDigits(s, group);
	return (neg ? "-" : "") + s;
}

export function groupDigits(s: string, size: number, sep = " "): string {
	const out: string[] = [];
	for (let i = s.length; i > 0; i -= size) out.unshift(s.slice(Math.max(0, i - size), i));
	return out.join(sep);
}

/** Two's complement bit pattern of n in `width` bits, or null if it doesn't fit. */
export function toTwos(n: bigint, width: number): string | null {
	const w = BigInt(width);
	const min = -(1n << (w - 1n));
	const maxUnsigned = (1n << w) - 1n;
	if (n < min || n > maxUnsigned) return null;
	const u = n < 0n ? (1n << w) + n : n;
	return u.toString(2).padStart(width, "0");
}

/** Interprets a bit pattern as signed (two's complement) and unsigned. */
export function fromBits(bits: string) {
	const unsigned = BigInt("0b" + (bits || "0"));
	const w = BigInt(bits.length);
	const signed = bits[0] === "1" ? unsigned - (1n << w) : unsigned;
	return { unsigned, signed };
}

export function bitLength(n: bigint): number {
	if (n < 0n) n = -n;
	return n === 0n ? 1 : n.toString(2).length;
}
