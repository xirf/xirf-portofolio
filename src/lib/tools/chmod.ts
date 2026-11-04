/** Unix permission bits ↔ octal ↔ symbolic. */

export const WHO = ["owner", "group", "others"] as const;
export const WHAT = ["read", "write", "execute"] as const;

export interface Mode {
	bits: boolean[][]; // [who][what]
	setuid: boolean;
	setgid: boolean;
	sticky: boolean;
}

export function toOctal(m: Mode): string {
	const special = (m.setuid ? 4 : 0) + (m.setgid ? 2 : 0) + (m.sticky ? 1 : 0);
	const digits = m.bits.map((b) => (b[0] ? 4 : 0) + (b[1] ? 2 : 0) + (b[2] ? 1 : 0)).join("");
	return special ? special + digits : digits;
}

export function toSymbolic(m: Mode): string {
	const sp = [m.setuid, m.setgid, m.sticky];
	return m.bits
		.map((b, i) => {
			const x = b[2];
			const special = sp[i];
			const exec = special ? (i === 2 ? (x ? "t" : "T") : x ? "s" : "S") : x ? "x" : "-";
			return (b[0] ? "r" : "-") + (b[1] ? "w" : "-") + exec;
		})
		.join("");
}

export function fromOctal(s: string): Mode {
	const t = s.trim().replace(/^0o/i, "");
	if (!/^[0-7]{3,4}$/.test(t)) throw new Error("Use 3 or 4 octal digits, e.g. 755 or 2775");
	const d = t.padStart(4, "0").split("").map(Number);
	return {
		setuid: !!(d[0] & 4),
		setgid: !!(d[0] & 2),
		sticky: !!(d[0] & 1),
		bits: d.slice(1).map((n) => [!!(n & 4), !!(n & 2), !!(n & 1)]),
	};
}

export function fromSymbolic(s: string): Mode {
	let t = s.trim();
	if (t.length === 10) t = t.slice(1); // drop file type char from `ls -l`
	if (!/^([r-][w-][xsS-]){2}[r-][w-][xtT-]$/.test(t)) throw new Error("Use 9 characters like rwxr-xr-x");
	const groups = [t.slice(0, 3), t.slice(3, 6), t.slice(6, 9)];
	return {
		bits: groups.map((g) => [g[0] === "r", g[1] === "w", /[xst]/.test(g[2])]),
		setuid: /[sS]/.test(groups[0][2]),
		setgid: /[sS]/.test(groups[1][2]),
		sticky: /[tT]/.test(groups[2][2]),
	};
}

/** chmod-style symbolic command, e.g. u=rwx,g=rx,o=rx */
export function toChmodSymbolic(m: Mode): string {
	return m.bits
		.map((b, i) => {
			let p = (b[0] ? "r" : "") + (b[1] ? "w" : "") + (b[2] ? "x" : "");
			if ((i === 0 && m.setuid) || (i === 1 && m.setgid)) p += "s";
			if (i === 2 && m.sticky) p += "t";
			return `${"ugo"[i]}=${p}`;
		})
		.join(",");
}

export function describe(m: Mode): string[] {
	const out = m.bits.map((b, i) => {
		const can = WHAT.filter((_, j) => b[j]);
		return `${WHO[i][0].toUpperCase() + WHO[i].slice(1)} can ${can.length ? can.join(", ") : "do nothing"}`;
	});
	if (m.setuid) out.push("Runs as the file owner (setuid)");
	if (m.setgid) out.push("Runs as the group / new files inherit the directory group (setgid)");
	if (m.sticky) out.push("In directories, only owners can delete their files (sticky)");
	if (m.bits[2][1]) out.push("⚠ World-writable: anyone on the system can modify this");
	return out;
}
