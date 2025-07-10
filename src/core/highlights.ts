export type HighlightType =
	| "adverb"
	| "long-sentence"
	| "passive"
	| "long-warning"
	| "long-passive";

export interface Highlight {
	start: number; // inclusive index in text
	end: number; // exclusive index
	type: HighlightType;
}

// Regex reused for passive voice detection (same heuristic as analysis.ts)
const passiveVoiceRegex =
	/\b(am|is|are|was|were|be|been|being)\b\s+\w+(ed|en|wn)?\b(?:\s+by\b)?/i;

/**
 * Compute highlight ranges for a given text. Currently highlights:
 *  - adverbs ending in -ly
 */
export function computeHighlights(text: string): Highlight[] {
	const highlights: Highlight[] = [];

	// 1. Detect adverbs (ends with -ly)
	const adverbRegex = /\b\w+ly\b/gi;
	for (const match of text.matchAll(adverbRegex)) {
		if (typeof match.index === "number") {
			highlights.push({
				start: match.index,
				end: match.index + match[0].length,
				type: "adverb",
			});
		}
	}

	// 2. Detect sentences for long-sentence & passive-voice highlighting
	// Greedy until punctuation (. ! ?) OR end of string to account for unfinished sentences while typing
	const sentenceRegex = /[^.!?]+(?:[.!?]|$)/g;
	let sentenceMatch: RegExpExecArray | null = sentenceRegex.exec(text);
	while (sentenceMatch) {
		const sentence = sentenceMatch[0];
		const start = sentenceMatch.index;
		const end = start + sentence.length;
		const wordCount = (sentence.match(/\b\w+\b/g) ?? []).length;

		const isLongWarning = wordCount > 10;
		const isLong = wordCount > 15;
		const isPassive = passiveVoiceRegex.test(sentence);

		if (isLong || isPassive || isLongWarning) {
			let type: HighlightType;
			if (isLong && isPassive) {
				type = "long-passive";
			} else if (isLong) {
				type = "long-sentence";
			} else if (isLongWarning) {
				type = "long-warning";
			} else {
				type = "passive";
			}
			highlights.push({ start, end, type });
		}

		sentenceMatch = sentenceRegex.exec(text);
	}

	return highlights;
}
