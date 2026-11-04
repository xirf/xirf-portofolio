import { randomString } from "./ids";

export const SETS = {
	lower: "abcdefghijklmnopqrstuvwxyz",
	upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	digits: "0123456789",
	symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
} as const;

export const AMBIGUOUS = "Il1O0o|`'\"";

export interface PasswordOptions {
	length: number;
	lower: boolean;
	upper: boolean;
	digits: boolean;
	symbols: boolean;
	excludeAmbiguous: boolean;
	custom?: string;
}

export function buildAlphabet(o: PasswordOptions): string {
	let a = o.custom ?? "";
	if (o.lower) a += SETS.lower;
	if (o.upper) a += SETS.upper;
	if (o.digits) a += SETS.digits;
	if (o.symbols) a += SETS.symbols;
	if (o.excludeAmbiguous) a = Array.from(a).filter((c) => !AMBIGUOUS.includes(c)).join("");
	return Array.from(new Set(Array.from(a))).join("");
}

/** Generates a password that contains at least one char of each selected set. */
export function generatePassword(o: PasswordOptions): string {
	const alphabet = buildAlphabet(o);
	if (alphabet.length < 2) throw new Error("Pick at least one character set");
	const required = (["lower", "upper", "digits", "symbols"] as const)
		.filter((k) => o[k])
		.map((k) => Array.from(SETS[k]).filter((c) => alphabet.includes(c)).join(""))
		.filter(Boolean);
	for (let attempt = 0; attempt < 100; attempt++) {
		const pw = randomString(o.length, alphabet);
		if (o.length < required.length || required.every((set) => Array.from(pw).some((c) => set.includes(c)))) return pw;
	}
	return randomString(o.length, alphabet);
}

export function entropyBits(length: number, alphabetSize: number): number {
	return alphabetSize < 2 ? 0 : length * Math.log2(alphabetSize);
}

/** Rough offline brute-force time at 1e11 guesses/s (a GPU rig against a fast hash). */
export function crackTime(bits: number, guessesPerSecond = 1e11): string {
	const seconds = 2 ** (bits - 1) / guessesPerSecond;
	if (seconds < 1) return "instantly";
	const units: [number, string][] = [
		[60, "seconds"],
		[60, "minutes"],
		[24, "hours"],
		[365, "days"],
		[1000, "years"],
		[1000, "thousand years"],
		[1000, "million years"],
		[1000, "billion years"],
	];
	let v = seconds;
	for (const [size, name] of units) {
		if (v < size) return `${v < 10 ? v.toFixed(1) : Math.round(v).toLocaleString()} ${name}`;
		v /= size;
	}
	return "way longer than the age of the universe";
}

export function strengthLabel(bits: number): { label: string; level: 0 | 1 | 2 | 3 | 4 } {
	if (bits < 40) return { label: "Very weak", level: 0 };
	if (bits < 60) return { label: "Weak", level: 1 };
	if (bits < 80) return { label: "Reasonable", level: 2 };
	if (bits < 110) return { label: "Strong", level: 3 };
	return { label: "Overkill (in a good way)", level: 4 };
}
