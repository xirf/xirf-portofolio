/**
 * Small client-side helpers shared by every tool page.
 *
 * The site uses Astro's <ClientRouter />, so bundled scripts only execute once
 * per session. Tools therefore initialise on `astro:page-load` (fires on the
 * first load and after every client-side navigation) and tear down on
 * `astro:before-swap`.
 */

type Cleanup = void | (() => void);

export function mountTool(id: string, init: (root: HTMLElement) => Cleanup) {
	let cleanup: Cleanup;
	const run = () => {
		const root = document.querySelector<HTMLElement>(`[data-tool="${id}"]`);
		if (!root || root.dataset.mounted) return;
		root.dataset.mounted = "true";
		cleanup = init(root);
	};
	document.addEventListener("astro:page-load", run);
	document.addEventListener("astro:before-swap", () => {
		if (typeof cleanup === "function") cleanup();
		cleanup = undefined;
	});
}

/** querySelector that throws when the element is missing, scoped to a root. */
export function $<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
	const el = root.querySelector<T>(selector);
	if (!el) throw new Error(`Missing element: ${selector}`);
	return el;
}

export function $$<T extends Element = HTMLElement>(root: ParentNode, selector: string): T[] {
	return Array.from(root.querySelectorAll<T>(selector));
}

export function debounce<A extends unknown[]>(fn: (...args: A) => void, ms = 150) {
	let t: ReturnType<typeof setTimeout> | undefined;
	return (...args: A) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), ms);
	};
}

export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function toast(message: string) {
	const el = document.getElementById("tool-toast");
	if (!el) return;
	el.textContent = message;
	el.dataset.show = "true";
	clearTimeout((el as any)._t);
	(el as any)._t = setTimeout(() => (el.dataset.show = "false"), 1600);
}

export async function copyText(text: string, label = "Copied to clipboard") {
	try {
		await navigator.clipboard.writeText(text);
	} catch {
		// Fallback for insecure contexts / older browsers.
		const ta = document.createElement("textarea");
		ta.value = text;
		ta.style.position = "fixed";
		ta.style.opacity = "0";
		document.body.appendChild(ta);
		ta.select();
		document.execCommand("copy");
		ta.remove();
	}
	toast(label);
}

export function downloadText(filename: string, text: string, type = "text/plain") {
	const url = URL.createObjectURL(new Blob([text], { type }));
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ------------------------------------------------------------------------ */
/* Shareable state in the URL hash                                           */
/* ------------------------------------------------------------------------ */

const MAX_HASH = 6000;

function bytesToB64url(bytes: Uint8Array): string {
	let bin = "";
	for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(s: string): Uint8Array {
	const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
	const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
	return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipeThrough(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
	const res = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(stream));
	return new Uint8Array(await res.arrayBuffer());
}

export async function encodeState(state: unknown): Promise<string> {
	const raw = new TextEncoder().encode(JSON.stringify(state));
	if (typeof CompressionStream !== "undefined") {
		const z = await pipeThrough(raw, new CompressionStream("deflate-raw"));
		return "z" + bytesToB64url(z);
	}
	return "j" + bytesToB64url(raw);
}

export async function decodeState<T>(s: string): Promise<T | null> {
	try {
		let bytes = b64urlToBytes(s.slice(1));
		if (s[0] === "z") bytes = await pipeThrough(bytes, new DecompressionStream("deflate-raw"));
		return JSON.parse(new TextDecoder().decode(bytes)) as T;
	} catch {
		return null;
	}
}

/**
 * Keeps a tool's state in `#s=...` so the current URL can be shared.
 * Calls `apply` once with the decoded state (if any) and returns `save`,
 * which should be called whenever the state changes.
 */
export function hashState<T>(read: () => T, apply: (s: Partial<T>) => void) {
	const match = location.hash.match(/^#s=(.+)$/);
	const ready = match
		? decodeState<T>(match[1]).then((s) => {
				if (s) apply(s);
			})
		: Promise.resolve();

	const save = debounce(async () => {
		const encoded = await encodeState(read());
		const url = new URL(location.href);
		url.hash = encoded.length > MAX_HASH ? "" : "s=" + encoded;
		// Keep Astro's router state so back/forward keep working.
		history.replaceState(history.state, "", url);
		const btn = document.getElementById("tool-share");
		if (btn) btn.toggleAttribute("disabled", encoded.length > MAX_HASH);
	}, 300);

	return { ready, save };
}
