import { bytesToHex } from "./encoding";

/* MD5 (RFC 1321). Web Crypto doesn't ship it, but people still need it for checksums. */
const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21];
const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0);

export function md5(data: Uint8Array): Uint8Array {
	const bitLen = data.length * 8;
	const padded = new Uint8Array(((data.length + 8) >> 6) * 64 + 64);
	padded.set(data);
	padded[data.length] = 0x80;
	const view = new DataView(padded.buffer);
	view.setUint32(padded.length - 8, bitLen >>> 0, true);
	view.setUint32(padded.length - 4, Math.floor(bitLen / 2 ** 32), true);

	let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
	const M = new Uint32Array(16);
	for (let off = 0; off < padded.length; off += 64) {
		for (let j = 0; j < 16; j++) M[j] = view.getUint32(off + j * 4, true);
		let A = a0, B = b0, C = c0, D = d0;
		for (let i = 0; i < 64; i++) {
			let F: number, g: number;
			if (i < 16) { F = (B & C) | (~B & D); g = i; }
			else if (i < 32) { F = (D & B) | (~D & C); g = (5 * i + 1) % 16; }
			else if (i < 48) { F = B ^ C ^ D; g = (3 * i + 5) % 16; }
			else { F = C ^ (B | ~D); g = (7 * i) % 16; }
			F = (F + A + K[i] + M[g]) >>> 0;
			A = D; D = C; C = B;
			B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0;
		}
		a0 = (a0 + A) >>> 0; b0 = (b0 + B) >>> 0; c0 = (c0 + C) >>> 0; d0 = (d0 + D) >>> 0;
	}
	const out = new Uint8Array(16);
	const ov = new DataView(out.buffer);
	[a0, b0, c0, d0].forEach((v, i) => ov.setUint32(i * 4, v, true));
	return out;
}

/** HMAC-MD5 (RFC 2104), since Web Crypto has no MD5. */
export function hmacMd5(key: Uint8Array, data: Uint8Array): Uint8Array {
	if (key.length > 64) key = md5(key);
	const k = new Uint8Array(64);
	k.set(key);
	const ipad = k.map((b) => b ^ 0x36);
	const opad = k.map((b) => b ^ 0x5c);
	const inner = new Uint8Array(64 + data.length);
	inner.set(ipad);
	inner.set(data, 64);
	const outer = new Uint8Array(64 + 16);
	outer.set(opad);
	outer.set(md5(inner), 64);
	return md5(outer);
}

let CRC_TABLE: Uint32Array | undefined;
export function crc32(data: Uint8Array): number {
	if (!CRC_TABLE) {
		CRC_TABLE = new Uint32Array(256);
		for (let n = 0; n < 256; n++) {
			let c = n;
			for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
			CRC_TABLE[n] = c >>> 0;
		}
	}
	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i++) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}

export const ALGORITHMS = ["MD5", "SHA-1", "SHA-256", "SHA-384", "SHA-512", "CRC32"] as const;
export type Algorithm = (typeof ALGORITHMS)[number];

export async function digest(alg: Algorithm, data: Uint8Array, key?: Uint8Array): Promise<Uint8Array> {
	if (alg === "CRC32") {
		const v = crc32(data);
		return new Uint8Array([v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255]);
	}
	if (alg === "MD5") return key ? hmacMd5(key, data) : md5(data);
	if (key) {
		const k = await crypto.subtle.importKey("raw", key as BufferSource, { name: "HMAC", hash: alg }, false, ["sign"]);
		return new Uint8Array(await crypto.subtle.sign("HMAC", k, data as BufferSource));
	}
	return new Uint8Array(await crypto.subtle.digest(alg, data as BufferSource));
}

export async function digestHex(alg: Algorithm, data: Uint8Array, key?: Uint8Array) {
	return bytesToHex(await digest(alg, data, key));
}
