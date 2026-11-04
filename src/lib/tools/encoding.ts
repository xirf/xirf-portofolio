/** UTF-8 safe Base64 / Base64URL helpers. */

export function bytesToBase64(bytes: Uint8Array, urlSafe = false, pad = true): string {
	let bin = "";
	const CHUNK = 0x8000;
	for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
	let out = btoa(bin);
	if (urlSafe) out = out.replace(/\+/g, "-").replace(/\//g, "_");
	if (!pad) out = out.replace(/=+$/, "");
	return out;
}

export function base64ToBytes(input: string): Uint8Array {
	let s = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
	if (s.startsWith("data:")) s = s.slice(s.indexOf(",") + 1);
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s)) throw new Error("Contains characters that are not valid Base64");
	if (s.length % 4 === 1) throw new Error("Invalid length for Base64 input");
	s += "===".slice((s.length + 3) % 4);
	const bin = atob(s);
	return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

export const encodeUtf8 = (s: string) => new TextEncoder().encode(s);

/** Decodes UTF-8, returning null if the bytes are not valid UTF-8 text. */
export function decodeUtf8(bytes: Uint8Array): string | null {
	try {
		return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
	} catch {
		return null;
	}
}

export function bytesToHex(bytes: Uint8Array, sep = ""): string {
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(sep);
}

export function hexToBytes(hex: string): Uint8Array {
	const clean = hex.replace(/^0x/i, "").replace(/[\s:-]/g, "");
	if (clean.length % 2 || /[^0-9a-f]/i.test(clean)) throw new Error("Invalid hex string");
	return Uint8Array.from(clean.match(/../g) ?? [], (h) => parseInt(h, 16));
}

export function formatBytes(n: number): string {
	if (n < 1024) return `${n} B`;
	const units = ["KB", "MB", "GB"];
	let v = n;
	let u = -1;
	do {
		v /= 1024;
		u++;
	} while (v >= 1024 && u < units.length - 1);
	return `${v.toFixed(v < 10 ? 2 : 1)} ${units[u]}`;
}
