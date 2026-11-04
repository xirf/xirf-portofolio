import { base64ToBytes, bytesToBase64, decodeUtf8 } from "./encoding";

export interface DecodedJwt {
	header: Record<string, unknown>;
	payload: unknown;
	signature: string;
	parts: [string, string, string];
}

export function decodeJwt(token: string): DecodedJwt {
	const parts = token.trim().replace(/^Bearer\s+/i, "").split(".");
	if (parts.length === 5) throw new Error("This looks like an encrypted JWE (5 parts). Only signed JWS tokens can be decoded here.");
	if (parts.length !== 3) throw new Error(`A JWT has 3 dot-separated parts, this has ${parts.length}.`);
	const part = (s: string, name: string) => {
		let text: string | null;
		try {
			text = decodeUtf8(base64ToBytes(s));
		} catch {
			throw new Error(`The ${name} is not valid Base64URL.`);
		}
		if (text === null) throw new Error(`The ${name} is not valid UTF-8.`);
		try {
			return JSON.parse(text);
		} catch {
			throw new Error(`The ${name} is not valid JSON.`);
		}
	};
	const header = part(parts[0], "header");
	if (!header || typeof header !== "object") throw new Error("The header must be a JSON object.");
	return { header, payload: part(parts[1], "payload"), signature: parts[2], parts: parts as [string, string, string] };
}

export const CLAIMS: Record<string, string> = {
	iss: "Issuer: who created and signed the token",
	sub: "Subject: who the token is about, usually a user id",
	aud: "Audience: who the token is intended for",
	exp: "Expiration time",
	nbf: "Not valid before",
	iat: "Issued at",
	jti: "JWT ID: unique identifier, useful to prevent replay",
	azp: "Authorized party: the client the token was issued to",
	scope: "Space-separated permissions granted",
	sid: "Session id",
	nonce: "Value used to associate a client session with an ID token",
	alg: "Signing algorithm",
	typ: "Token type",
	kid: "Key id: which key signed the token",
	cty: "Content type",
};

export const TIME_CLAIMS = new Set(["exp", "nbf", "iat", "auth_time", "updated_at"]);

const HMAC: Record<string, string> = { HS256: "SHA-256", HS384: "SHA-384", HS512: "SHA-512" };

export function isHmac(alg: unknown): alg is string {
	return typeof alg === "string" && alg in HMAC;
}

export async function verifyHmac(token: string, secret: Uint8Array, alg: string): Promise<boolean> {
	const [h, p, s] = token.trim().replace(/^Bearer\s+/i, "").split(".");
	const key = await crypto.subtle.importKey("raw", secret as BufferSource, { name: "HMAC", hash: HMAC[alg] }, false, ["sign"]);
	const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${h}.${p}`)));
	return bytesToBase64(sig, true, false) === s;
}

export async function signHmac(header: object, payload: unknown, secret: Uint8Array, alg: string): Promise<string> {
	const enc = (o: unknown) => bytesToBase64(new TextEncoder().encode(JSON.stringify(o)), true, false);
	const data = `${enc(header)}.${enc(payload)}`;
	const key = await crypto.subtle.importKey("raw", secret as BufferSource, { name: "HMAC", hash: HMAC[alg] }, false, ["sign"]);
	const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
	return `${data}.${bytesToBase64(sig, true, false)}`;
}
