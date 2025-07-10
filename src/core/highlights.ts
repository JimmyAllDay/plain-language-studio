export type HighlightType = "adverb";

export interface Highlight {
	start: number; // inclusive index in text
	end: number; // exclusive index
	type: HighlightType;
}

/**
 * Compute highlight ranges for a given text. Currently highlights:
 *  - adverbs ending in -ly
 */
export function computeHighlights(text: string): Highlight[] {
	const highlights: Highlight[] = [];
	const adverbRegex = /\b\w+ly\b/gi;
	let match: RegExpExecArray | null;
	while ((match = adverbRegex.exec(text)) !== null) {
		highlights.push({
			start: match.index,
			end: match.index + match[0].length,
			type: "adverb",
		});
	}
	return highlights;
}
