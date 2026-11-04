export interface Searchable {
	slug: string;
	name: string;
	description: string;
	category: string;
	keywords: string[];
}

/**
 * Tiny ranked search: every whitespace-separated term has to appear somewhere,
 * hits in the name and at word starts are ranked higher. Returns slugs in order.
 */
export function searchTools<T extends Searchable>(items: T[], query: string): T[] {
	const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!terms.length) return items;
	const scored: { item: T; score: number }[] = [];
	for (const item of items) {
		const name = item.name.toLowerCase();
		const slug = item.slug.toLowerCase();
		const keywords = item.keywords.join(" ").toLowerCase();
		const rest = `${item.description} ${item.category}`.toLowerCase();
		let score = 0;
		let ok = true;
		for (const t of terms) {
			let s = 0;
			if (name.startsWith(t) || slug.startsWith(t)) s = 10;
			else if (new RegExp(`\\b${escapeRe(t)}`).test(name)) s = 8;
			else if (name.includes(t) || slug.includes(t)) s = 6;
			else if (new RegExp(`\\b${escapeRe(t)}`).test(keywords)) s = 5;
			else if (keywords.includes(t)) s = 3;
			else if (rest.includes(t)) s = 1;
			if (!s) {
				ok = false;
				break;
			}
			score += s;
		}
		if (ok) scored.push({ item, score });
	}
	return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}

function escapeRe(s: string) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const RECENT_KEY = "tools:recent";

export function getRecent(): string[] {
	try {
		return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
	} catch {
		return [];
	}
}

export function pushRecent(slug: string) {
	try {
		const list = [slug, ...getRecent().filter((s) => s !== slug)].slice(0, 4);
		localStorage.setItem(RECENT_KEY, JSON.stringify(list));
	} catch {
		/* storage unavailable */
	}
}
