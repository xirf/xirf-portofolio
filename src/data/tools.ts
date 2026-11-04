export type ToolCategory =
	| "Data"
	| "Encoding"
	| "Crypto"
	| "Time"
	| "Text"
	| "Web"
	| "Reference";

export interface Tool {
	/** URL slug: /tools/{slug} */
	slug: string;
	name: string;
	/** One-liner shown on cards. */
	description: string;
	/** Longer intro shown on the tool page and used for SEO. */
	summary: string;
	category: ToolCategory;
	/** Solar duotone icon class (see https://icon-sets.iconify.design/solar/) */
	icon: string;
	/** Extra words that should match in search. */
	keywords: string[];
	/** Tool keeps its input in the URL hash so it can be shared. */
	shareable?: boolean;
	isNew?: boolean;
}

export const categories: { name: ToolCategory; description: string }[] = [
	{ name: "Data", description: "Shape, validate and convert structured data" },
	{ name: "Encoding", description: "Encode, decode and inspect payloads" },
	{ name: "Crypto", description: "Hashes, IDs and secrets" },
	{ name: "Time", description: "Timestamps and schedules" },
	{ name: "Text", description: "Search, compare and inspect text" },
	{ name: "Web", description: "Colors, motion and the browser" },
	{ name: "Reference", description: "Things you always end up googling" },
];

export const tools: Tool[] = [
	{
		slug: "json",
		name: "JSON Formatter",
		description: "Format, minify, validate and sort JSON with exact error locations.",
		summary:
			"Paste JSON to pretty-print it, minify it or sort keys recursively. Invalid input points at the exact line and column that broke, so you are not left counting brackets.",
		category: "Data",
		icon: "i-solar-code-file-bold-duotone",
		keywords: ["json", "prettify", "beautify", "minify", "validate", "lint", "sort keys"],
		shareable: true,
	},
	{
		slug: "json-to-ts",
		name: "JSON to TypeScript",
		description: "Turn a JSON sample into TypeScript interfaces, merging array shapes.",
		summary:
			"Generates named interfaces from a JSON sample. Objects inside arrays are merged into one shape, so keys that only appear sometimes become optional instead of producing a union of near-identical types.",
		category: "Data",
		icon: "i-solar-programming-bold-duotone",
		keywords: ["typescript", "types", "interface", "json", "schema", "codegen", "quicktype"],
		shareable: true,
		isNew: true,
	},
	{
		slug: "base-converter",
		name: "Number Base Converter",
		description: "Binary, octal, decimal and hex with arbitrary precision and a bit view.",
		summary:
			"Convert integers between bases using BigInt, so there is no precision loss past 2^53. Pick a bit width to see two's complement and toggle individual bits.",
		category: "Data",
		icon: "i-solar-cpu-bold-duotone",
		keywords: ["binary", "hex", "hexadecimal", "octal", "decimal", "radix", "bits", "twos complement"],
		shareable: true,
	},
	{
		slug: "base64",
		name: "Base64",
		description: "Encode and decode Base64 / Base64URL for text and files, UTF-8 safe.",
		summary:
			"Encode or decode Base64 and its URL-safe variant. Text is handled as UTF-8 (so emoji survive), and files can be dropped in to get a data URL.",
		category: "Encoding",
		icon: "i-solar-square-transfer-horizontal-bold-duotone",
		keywords: ["base64", "base64url", "encode", "decode", "data url", "atob", "btoa"],
		shareable: true,
	},
	{
		slug: "url",
		name: "URL Inspector",
		description: "Encode/decode components and break URLs into editable query params.",
		summary:
			"Paste a URL to break it into protocol, host, path, hash and an editable table of query parameters, then rebuild it. Also does plain percent-encoding and decoding.",
		category: "Encoding",
		icon: "i-solar-link-round-angle-bold-duotone",
		keywords: ["url", "uri", "encode", "decode", "query string", "params", "percent encoding"],
		shareable: true,
	},
	{
		slug: "jwt",
		name: "JWT Debugger",
		description: "Decode JSON Web Tokens, read claims as dates and verify HMAC signatures.",
		summary:
			"Decodes the header and payload of a JWT, explains standard claims and tells you whether it has expired. HS256/384/512 signatures can be verified with a secret using Web Crypto. The token never leaves this tab.",
		category: "Encoding",
		icon: "i-solar-shield-keyhole-bold-duotone",
		keywords: ["jwt", "json web token", "decode", "verify", "hs256", "bearer", "auth", "claims"],
	},
	{
		slug: "hash",
		name: "Hash Generator",
		description: "MD5, SHA-1, SHA-2 and CRC32 for text or files, plus HMAC.",
		summary:
			"Computes MD5, SHA-1, SHA-256, SHA-384, SHA-512 and CRC32 of text or a file all at once. Add a key to get HMACs instead. Paste an expected hash to check which one matches.",
		category: "Crypto",
		icon: "i-solar-hashtag-square-bold-duotone",
		keywords: ["hash", "md5", "sha1", "sha256", "sha512", "crc32", "checksum", "hmac", "digest"],
	},
	{
		slug: "uuid",
		name: "UUID & ID Generator",
		description: "UUID v4/v7, ULID and NanoID in bulk, plus an inspector for existing IDs.",
		summary:
			"Generate random or time-ordered identifiers in bulk. Paste an existing UUID or ULID to see its version, variant and embedded timestamp.",
		category: "Crypto",
		icon: "i-solar-shuffle-bold-duotone",
		keywords: ["uuid", "guid", "ulid", "nanoid", "v4", "v7", "identifier", "random id"],
	},
	{
		slug: "password",
		name: "Password Generator",
		description: "Cryptographically random passwords and tokens with entropy estimates.",
		summary:
			"Generate passwords, API keys and hex tokens using crypto.getRandomValues with rejection sampling, so every character is equally likely. Shows the entropy in bits and roughly how long a brute force would take.",
		category: "Crypto",
		icon: "i-solar-password-minimalistic-input-bold-duotone",
		keywords: ["password", "generator", "random", "secret", "token", "api key", "entropy"],
	},
	{
		slug: "timestamp",
		name: "Timestamp Converter",
		description: "Unix epoch ↔ human dates across timezones, with a live clock.",
		summary:
			"Paste a Unix timestamp (seconds, milliseconds, micro or nano, detected automatically) or any date string. See it as ISO 8601, RFC 2822, relative time and in several timezones at once.",
		category: "Time",
		icon: "i-solar-clock-circle-bold-duotone",
		keywords: ["unix", "epoch", "timestamp", "date", "time", "timezone", "iso 8601", "utc"],
		shareable: true,
	},
	{
		slug: "cron",
		name: "Cron Explainer",
		description: "Read cron expressions in plain English and preview the next runs.",
		summary:
			"Type a cron expression to get a plain-English description and the next scheduled runs in your local time. Supports ranges, steps, lists, month/day names and macros like @daily.",
		category: "Time",
		icon: "i-solar-alarm-bold-duotone",
		keywords: ["cron", "crontab", "schedule", "job", "next run", "explain", "expression"],
		shareable: true,
	},
	{
		slug: "regex",
		name: "Regex Tester",
		description: "Live match highlighting, capture groups and replace preview.",
		summary:
			"Test JavaScript regular expressions against your text with live highlighting. Inspect every match and its numbered or named groups, and preview what a replacement produces.",
		category: "Text",
		icon: "i-solar-magnifer-bug-bold-duotone",
		keywords: ["regex", "regexp", "regular expression", "match", "replace", "capture group", "test"],
		shareable: true,
	},
	{
		slug: "regex-builder",
		name: "Regex Builder",
		description: "Highlight what should match and what shouldn't. Get the regex.",
		summary:
			"Build a regular expression from examples instead of syntax. Highlight the parts of a text you want to capture, or list values that should and shouldn't match, and you get a pattern that is checked against every example, plus stricter and looser alternatives to pick from.",
		category: "Text",
		icon: "i-solar-magic-stick-3-bold-duotone",
		keywords: ["regex", "regexp", "generator", "builder", "from examples", "extract", "pattern", "infer", "learn"],
		shareable: true,
		isNew: true,
	},
	{
		slug: "diff",
		name: "Text Diff",
		description: "Compare two texts line by line with in-line character highlights.",
		summary:
			"Compare two versions of a text. Changed lines are paired up and the exact characters that differ are highlighted. Optionally ignore whitespace or case.",
		category: "Text",
		icon: "i-solar-documents-bold-duotone",
		keywords: ["diff", "compare", "difference", "patch", "changes", "merge"],
		shareable: true,
	},
	{
		slug: "text-inspector",
		name: "Text Inspector",
		description: "Find invisible characters, homoglyphs and odd whitespace. Counts too.",
		summary:
			"Reveals what is really in a string: zero-width spaces, non-breaking spaces, bidi overrides, lookalike letters from other scripts, and every code point. Also counts characters, words, lines and UTF-8 bytes.",
		category: "Text",
		icon: "i-solar-scanner-bold-duotone",
		keywords: ["invisible", "zero width", "unicode", "homoglyph", "whitespace", "character count", "word count", "bytes"],
		isNew: true,
	},
	{
		slug: "case",
		name: "Case Converter",
		description: "camelCase, snake_case, kebab-case and friends, all at once.",
		summary:
			"Converts text into every common naming convention at once. It understands existing boundaries, so XMLHttpRequest becomes xml_http_request rather than x_m_l_http_request.",
		category: "Text",
		icon: "i-solar-text-bold-duotone",
		keywords: ["case", "camel", "snake", "kebab", "pascal", "constant", "title", "slug", "naming"],
	},
	{
		slug: "color",
		name: "Color Converter",
		description: "HEX, RGB, HSL and OKLCH with WCAG contrast and a generated scale.",
		summary:
			"Convert any CSS color between HEX, RGB, HSL and OKLCH. Check WCAG contrast against another color and generate a perceptually even 50–950 scale you can paste into a Tailwind or UnoCSS config.",
		category: "Web",
		icon: "i-solar-palette-round-bold-duotone",
		keywords: ["color", "colour", "hex", "rgb", "hsl", "oklch", "contrast", "wcag", "palette", "tailwind"],
		shareable: true,
	},
	{
		slug: "cubic-bezier",
		name: "Easing Editor",
		description: "Drag handles to design a cubic-bezier() curve and preview the motion.",
		summary:
			"Design CSS easing curves by dragging the control points. Compare the motion against a linear reference and start from well-known presets.",
		category: "Web",
		icon: "i-solar-graph-new-bold-duotone",
		keywords: ["cubic bezier", "easing", "animation", "transition", "timing function", "css", "motion"],
		shareable: true,
		isNew: true,
	},
	{
		slug: "chmod",
		name: "Chmod Calculator",
		description: "Unix permissions as checkboxes, octal and symbolic notation.",
		summary:
			"Toggle read, write and execute for owner, group and others, or type 755 or rwxr-xr-x, and get the other notations along with the command to run. Covers setuid, setgid and the sticky bit.",
		category: "Reference",
		icon: "i-solar-lock-keyhole-minimalistic-bold-duotone",
		keywords: ["chmod", "permissions", "unix", "linux", "octal", "rwx", "file mode", "umask"],
		shareable: true,
	},
	{
		slug: "http-status",
		name: "HTTP Status Codes",
		description: "Every status code you will meet, searchable, with when to use it.",
		summary:
			"A searchable reference of HTTP status codes with short guidance on when to use each one and how it differs from the codes people confuse it with.",
		category: "Reference",
		icon: "i-solar-server-path-bold-duotone",
		keywords: ["http", "status", "code", "404", "500", "rest", "api", "response"],
	},
];

export const toolBySlug = (slug: string) => tools.find((t) => t.slug === slug);
