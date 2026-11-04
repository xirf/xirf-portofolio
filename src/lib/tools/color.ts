/** Color parsing and conversion: HEX, RGB, HSL, OKLab/OKLCH, plus WCAG contrast. */

export interface RGBA {
	r: number; // 0..255 (may be fractional)
	g: number;
	b: number;
	a: number; // 0..1
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;

function num(s: string, scale = 1, percentScale = 1): number {
	s = s.trim();
	if (s === "none") return 0;
	if (s.endsWith("%")) return (parseFloat(s) / 100) * percentScale;
	const n = parseFloat(s);
	if (Number.isNaN(n)) throw new Error(`Invalid number "${s}"`);
	return n * scale;
}

function hue(s: string): number {
	s = s.trim();
	const n = parseFloat(s);
	if (s.endsWith("rad")) return (n * 180) / Math.PI;
	if (s.endsWith("turn")) return n * 360;
	if (s.endsWith("grad")) return n * 0.9;
	return n;
}

function args(inner: string): { parts: string[]; alpha?: string } {
	const [main, alpha] = inner.split("/");
	const parts = main.trim().split(/[\s,]+/).filter(Boolean);
	if (!alpha && parts.length === 4) return { parts: parts.slice(0, 3), alpha: parts[3] };
	return { parts, alpha: alpha?.trim() };
}

export function parseColor(input: string): RGBA | null {
	const s = input.trim().toLowerCase();
	if (!s) return null;
	let m = /^#?([0-9a-f]{3,8})$/.exec(s);
	if (m && [3, 4, 6, 8].includes(m[1].length)) {
		let h = m[1];
		if (h.length <= 4) h = [...h].map((c) => c + c).join("");
		return {
			r: parseInt(h.slice(0, 2), 16),
			g: parseInt(h.slice(2, 4), 16),
			b: parseInt(h.slice(4, 6), 16),
			a: h.length === 8 ? round(parseInt(h.slice(6, 8), 16) / 255, 3) : 1,
		};
	}
	m = /^(rgba?|hsla?|oklch|oklab|hwb)\((.*)\)$/.exec(s);
	if (!m) return null;
	try {
		const { parts, alpha } = args(m[2]);
		if (parts.length !== 3) return null;
		const a = alpha === undefined ? 1 : clamp(num(alpha, 1, 1));
		switch (m[1]) {
			case "rgb":
			case "rgba":
				return { r: clamp(num(parts[0], 1, 255), 0, 255), g: clamp(num(parts[1], 1, 255), 0, 255), b: clamp(num(parts[2], 1, 255), 0, 255), a };
			case "hsl":
			case "hsla":
				return { ...hslToRgb(hue(parts[0]), num(parts[1], 0.01, 1), num(parts[2], 0.01, 1)), a };
			case "hwb": {
				const w = num(parts[1], 0.01, 1);
				const bl = num(parts[2], 0.01, 1);
				const base = hslToRgb(hue(parts[0]), 1, 0.5);
				const k = w + bl >= 1 ? null : 1 - w - bl;
				const f = (c: number) => (k === null ? (w / (w + bl)) * 255 : c * k + w * 255);
				return { r: f(base.r), g: f(base.g), b: f(base.b), a };
			}
			case "oklch":
				return { ...oklchToRgb({ l: num(parts[0], 1, 1), c: num(parts[1], 1, 0.4), h: hue(parts[2]) }), a };
			case "oklab": {
				const lab = { l: num(parts[0], 1, 1), a: num(parts[1], 1, 0.4), b: num(parts[2], 1, 0.4) };
				return { ...linearToRgb(oklabToLinear(lab)), a };
			}
		}
	} catch {
		return null;
	}
	return null;
}

/* sRGB <-> HSL */
export function hslToRgb(h: number, s: number, l: number) {
	h = ((h % 360) + 360) % 360;
	s = clamp(s);
	l = clamp(l);
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
	return { r: f(0) * 255, g: f(8) * 255, b: f(4) * 255 };
}

export function rgbToHsl({ r, g, b }: RGBA) {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const l = (max + min) / 2;
	const d = max - min;
	let h = 0;
	let s = 0;
	if (d) {
		s = d / (1 - Math.abs(2 * l - 1));
		if (max === r) h = ((g - b) / d) % 6;
		else if (max === g) h = (b - r) / d + 2;
		else h = (r - g) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	return { h, s, l };
}

/* sRGB <-> linear <-> OKLab <-> OKLCH (Björn Ottosson) */
const toLinear = (c: number) => {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const fromLinear = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function rgbToOklab({ r, g, b }: RGBA) {
	const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
	const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
	const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
	const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
	return {
		l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	};
}

function oklabToLinear({ l: L, a, b }: { l: number; a: number; b: number }) {
	const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
	return {
		r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	};
}

function linearToRgb(c: { r: number; g: number; b: number }) {
	return { r: clamp(fromLinear(c.r), 0, 255), g: clamp(fromLinear(c.g), 0, 255), b: clamp(fromLinear(c.b), 0, 255) };
}

export function rgbToOklch(c: RGBA) {
	const { l, a, b } = rgbToOklab(c);
	const C = Math.sqrt(a * a + b * b);
	let h = (Math.atan2(b, a) * 180) / Math.PI;
	if (h < 0) h += 360;
	return { l, c: C, h: C < 1e-4 ? 0 : h };
}

function oklchToLinear({ l, c, h }: { l: number; c: number; h: number }) {
	const r = (h * Math.PI) / 180;
	return oklabToLinear({ l, a: c * Math.cos(r), b: c * Math.sin(r) });
}

export function inGamut(lch: { l: number; c: number; h: number }) {
	const { r, g, b } = oklchToLinear(lch);
	const e = 1e-4;
	return [r, g, b].every((v) => v >= -e && v <= 1 + e);
}

/** OKLCH → sRGB, reducing chroma until the color fits in sRGB (CSS Color 4 style). */
export function oklchToRgb(lch: { l: number; c: number; h: number }) {
	let { c } = lch;
	if (!inGamut(lch)) {
		let lo = 0;
		let hi = c;
		while (hi - lo > 1e-4) {
			const mid = (lo + hi) / 2;
			if (inGamut({ ...lch, c: mid })) lo = mid;
			else hi = mid;
		}
		c = lo;
	}
	return linearToRgb(oklchToLinear({ ...lch, c }));
}

/* Formatting */
const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");

export function toHex(c: RGBA) {
	return "#" + hex2(c.r) + hex2(c.g) + hex2(c.b) + (c.a < 1 ? hex2(c.a * 255) : "");
}
export function toRgbString(c: RGBA) {
	const [r, g, b] = [c.r, c.g, c.b].map((v) => Math.round(v));
	return c.a < 1 ? `rgb(${r} ${g} ${b} / ${round(c.a, 3)})` : `rgb(${r} ${g} ${b})`;
}
export function toHslString(c: RGBA) {
	const { h, s, l } = rgbToHsl(c);
	const body = `${round(h, 1)} ${round(s * 100, 1)}% ${round(l * 100, 1)}%`;
	return c.a < 1 ? `hsl(${body} / ${round(c.a, 3)})` : `hsl(${body})`;
}
export function toOklchString(c: RGBA) {
	const { l, c: C, h } = rgbToOklch(c);
	const body = `${round(l * 100, 2)}% ${round(C, 4)} ${round(h, 2)}`;
	return c.a < 1 ? `oklch(${body} / ${round(c.a, 3)})` : `oklch(${body})`;
}

/* WCAG 2.x contrast */
export function luminance(c: RGBA) {
	return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b);
}
export function contrast(a: RGBA, b: RGBA) {
	const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
	return (x + 0.05) / (y + 0.05);
}

/** Composites a translucent color over an opaque background. */
export function over(fg: RGBA, bg: RGBA): RGBA {
	return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 };
}

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const SCALE_L = [0.975, 0.935, 0.88, 0.81, 0.72, 0.63, 0.55, 0.47, 0.4, 0.33, 0.26];

/** A Tailwind-like 50–950 scale with the input color anchored at its nearest step. */
export function scale(base: RGBA) {
	const lch = rgbToOklch(base);
	const anchor = SCALE_L.reduce((best, l, i) => (Math.abs(l - lch.l) < Math.abs(SCALE_L[best] - lch.l) ? i : best), 0);
	const shift = lch.l - SCALE_L[anchor];
	return SCALE_STEPS.map((step, i) => {
		// Spread the shift so the anchor is exact and the ends stay put.
		const t = i <= anchor ? (anchor ? i / anchor : 1) : (SCALE_L.length - 1 - i) / (SCALE_L.length - 1 - anchor);
		const l = clamp(SCALE_L[i] + shift * t);
		// Chroma tapers towards very light and very dark ends.
		const taper = Math.min(1, 1 - Math.abs(l - 0.6) ** 2 * 1.8);
		const rgb = i === anchor ? base : { ...oklchToRgb({ l, c: lch.c * Math.max(0.15, taper), h: lch.h }), a: 1 };
		return { step, color: { ...rgb, a: 1 } as RGBA, anchor: i === anchor };
	});
}
