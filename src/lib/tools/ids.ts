/** UUID v4/v7, ULID and NanoID generation + inspection. */

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");

function formatUuid(b: Uint8Array) {
	const h = hex(b);
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function uuidv4(): string {
	const b = crypto.getRandomValues(new Uint8Array(16));
	b[6] = (b[6] & 0x0f) | 0x40;
	b[8] = (b[8] & 0x3f) | 0x80;
	return formatUuid(b);
}

let lastV7 = { ms: -1, seq: 0 };
/** UUID v7 (RFC 9562): 48-bit unix ms + 12-bit counter for monotonicity within a millisecond. */
export function uuidv7(now = Date.now()): string {
	const b = crypto.getRandomValues(new Uint8Array(16));
	let seq: number;
	if (now <= lastV7.ms) {
		now = lastV7.ms;
		seq = lastV7.seq + 1;
		if (seq > 0xfff) {
			now++;
			seq = 0;
		}
	} else seq = ((b[6] & 0x07) << 8) | b[7]; // random start below 0x800, leaving headroom
	lastV7 = { ms: now, seq };
	for (let i = 5; i >= 0; i--) {
		b[i] = now % 256;
		now = Math.floor(now / 256);
	}
	b[6] = 0x70 | (seq >> 8);
	b[7] = seq & 0xff;
	b[8] = (b[8] & 0x3f) | 0x80;
	return formatUuid(b);
}

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function ulid(now = Date.now()): string {
	let time = "";
	for (let i = 0; i < 10; i++) {
		time = CROCKFORD[now % 32] + time;
		now = Math.floor(now / 32);
	}
	const rnd = crypto.getRandomValues(new Uint8Array(16));
	let r = "";
	for (let i = 0; i < 16; i++) r += CROCKFORD[rnd[i] & 31];
	return time + r;
}

export const NANO_ALPHABET = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyrict";

export function nanoid(size = 21, alphabet = NANO_ALPHABET): string {
	return randomString(size, alphabet);
}

/** Uniform random string via rejection sampling (no modulo bias). */
export function randomString(size: number, alphabet: string): string {
	const chars = Array.from(alphabet);
	const n = chars.length;
	if (n < 2) throw new Error("Alphabet needs at least 2 characters");
	const mask = (2 << Math.floor(Math.log2(n - 1))) - 1;
	const step = Math.ceil((1.6 * mask * size) / n);
	let out = "";
	while (out.length < size) {
		const bytes = crypto.getRandomValues(new Uint16Array(step));
		for (let i = 0; i < step && out.length < size; i++) {
			const idx = bytes[i] & mask;
			if (idx < n) out += chars[idx];
		}
	}
	// `out.length` counts UTF-16 units; for multi-unit alphabets trim by code points.
	return Array.from(out).slice(0, size).join("");
}

export interface IdInfo {
	type: string;
	version?: number;
	variant?: string;
	timestamp?: Date;
	notes: string[];
}

export function inspectId(raw: string): IdInfo | null {
	const s = raw.trim();
	const u = s.replace(/^urn:uuid:/i, "").replace(/[{}]/g, "").toLowerCase();
	if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/.test(u)) {
		const h = u.replace(/-/g, "");
		if (/^0+$/.test(h)) return { type: "UUID", notes: ["Nil UUID (all zeros)"] };
		if (/^f+$/.test(h)) return { type: "UUID", notes: ["Max UUID (all ones)"] };
		const version = parseInt(h[12], 16);
		const v = parseInt(h[16], 16);
		const variant = v < 8 ? "NCS (reserved)" : v < 12 ? "RFC 9562" : v < 14 ? "Microsoft (reserved)" : "Future (reserved)";
		const info: IdInfo = { type: "UUID", version, variant, notes: [] };
		if (version === 7) info.timestamp = new Date(parseInt(h.slice(0, 12), 16));
		if (version === 1 || version === 6) {
			// 60-bit count of 100ns intervals since 1582-10-15
			const ts = version === 1 ? h.slice(13, 16) + h.slice(8, 12) + h.slice(0, 8) : h.slice(0, 12) + h.slice(13, 16);
			const t = BigInt("0x" + ts);
			info.timestamp = new Date(Number((t - 122192928000000000n) / 10000n));
			info.notes.push(`Node / MAC: ${h.slice(20).match(/../g)!.join(":")}`);
		}
		const desc: Record<number, string> = {
			1: "Time-based with MAC address",
			3: "Name-based, MD5",
			4: "Random",
			5: "Name-based, SHA-1",
			6: "Time-based, reordered for sorting",
			7: "Unix time-ordered, sortable",
			8: "Custom / vendor specific",
		};
		info.notes.unshift(desc[version] ?? "Unknown version");
		return info;
	}
	if (/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(s)) {
		let t = 0;
		for (const c of s.slice(0, 10).toUpperCase()) t = t * 32 + CROCKFORD.indexOf(c);
		return { type: "ULID", timestamp: new Date(t), notes: ["48-bit ms timestamp + 80 bits randomness"] };
	}
	return null;
}
