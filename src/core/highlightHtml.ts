import type { Highlight } from "./highlights";

// Map highlight type to Tailwind classes
const typeClassMap: Record<Highlight["type"], string> = {
	adverb: "bg-amber-200 dark:bg-amber-800 relative z-20",
	"long-sentence": "bg-red-200 dark:bg-red-800",
	"long-warning": "bg-orange-200 dark:bg-orange-800",
	passive: "bg-indigo-200 dark:bg-indigo-800",
	"long-passive": "bg-purple-300 dark:bg-purple-800",
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

	// Build start/end events for nested rendering
	interface Event {
		pos: number;
		type: "start" | "end";
		hl: Highlight;
	}
	const events: Event[] = [];
	for (const hl of highlights) {
		events.push({ pos: hl.start, type: "start", hl });
		events.push({ pos: hl.end, type: "end", hl });
	}
	// sort by position. At the same position, end events first then start to close before open
	events.sort((a, b) => {
		if (a.pos !== b.pos) return a.pos - b.pos;
		if (a.type === b.type) return 0;
		return a.type === "end" ? -1 : 1; // end before start when equal pos
	});

	let html = "";
	let cursor = 0;
	const openStack: Highlight[] = [];

	function renderSegment(segmentText: string) {
		if (segmentText.length === 0) return;
		// open tags
		for (const hl of openStack) {
			html += `<span class="${typeClassMap[hl.type]}">`;
		}
		html += nl2br(escapeHtml(segmentText));
		// close tags
		for (let i = openStack.length - 1; i >= 0; i--) {
			html += "</span>";
		}
	}

	for (const ev of events) {
		if (ev.pos > cursor) {
			// output segment between cursor and ev.pos with current openStack
			renderSegment(text.slice(cursor, ev.pos));
			cursor = ev.pos;
		}

		if (ev.type === "end") {
			// remove highlight from stack
			const idx = openStack.findIndex((h) => h === ev.hl);
			if (idx !== -1) openStack.splice(idx, 1);
		} else {
			openStack.push(ev.hl);
		}
	}

	if (cursor < text.length) {
		renderSegment(text.slice(cursor));
	}

	return html;
}
