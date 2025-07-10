import type { Highlight } from "./highlights";

// Map highlight type to Tailwind classes
const typeClassMap: Record<Highlight["type"], string> = {
	adverb: "bg-amber-200 dark:bg-amber-800",
};

const escapeHtml = (text: string): string =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

const nl2br = (text: string) => text.replace(/\n/g, "<br>");

export function buildHighlightedHtml(
	text: string,
	highlights: Highlight[],
): string {
	if (highlights.length === 0) return nl2br(escapeHtml(text));

	const sorted = [...highlights].sort((a, b) => a.start - b.start);
	let html = "";
	let cursor = 0;
	for (const h of sorted) {
		if (cursor < h.start)
			html += nl2br(escapeHtml(text.slice(cursor, h.start)));
		const segment = escapeHtml(text.slice(h.start, h.end));
		html += `<span class="${typeClassMap[h.type]}">${nl2br(segment)}</span>`;
		cursor = h.end;
	}
	if (cursor < text.length) html += nl2br(escapeHtml(text.slice(cursor)));
	return html;
}
