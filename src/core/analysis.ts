export interface AnalysisResult {
	wordCount: number;
	sentenceCount: number;
	/** Number of sentences moderately long (warning level) */
	mediumSentences: number;
	longSentences: number;
	adverbCount: number;
	/** Number of sentences likely written in passive voice */
	passiveVoiceSentences: number;
	/** Flesch–Kincaid Grade Level (approximate, 1 decimal place) */
	readabilityGrade: number;
}

/**
 * Simple text analysis extracting basic counts and rule detections.
 * NOTE: implementation is heuristic and English-centric; it will evolve.
 */
export function analyzeText(text: string): AnalysisResult {
	const sentences = splitSentences(text);
	const words = getWords(text);

	const mediumSentences = sentences.filter(
		(s) => getWords(s).length > 12,
	).length;
	const longSentences = sentences.filter((s) => getWords(s).length > 17).length;
	const adverbCount = (text.match(/\b\w+ly\b/gi) ?? []).length;

	// passive voice – heuristic: form of "to be" followed by a verb that looks like a past participle and optionally "by"
	const passiveVoiceRegex =
		/\b(am|is|are|was|were|be|been|being)\b\s+\w+(ed|en|wn)?\b(?:\s+by\b)?/i;
	const passiveVoiceSentences = sentences.filter((s) =>
		passiveVoiceRegex.test(s),
	).length;

	const syllableCount = words.reduce((sum, w) => sum + countSyllables(w), 0);
	const wordsPerSentence =
		sentences.length === 0 ? 0 : words.length / sentences.length;
	const syllablesPerWord =
		words.length === 0 ? 0 : syllableCount / words.length;
	// Flesch–Kincaid Grade Level
	// Clamp to 0 so we never report negative grade levels.
	const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
	const readabilityGrade = Number(Math.max(0, rawGrade).toFixed(1));

	return {
		wordCount: words.length,
		sentenceCount: sentences.length,
		mediumSentences,
		longSentences,
		adverbCount,
		passiveVoiceSentences,
		readabilityGrade,
	};
}

function splitSentences(text: string): string[] {
	// naive split on punctuation followed by space
	return text
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

// very rough syllable counting: count vowel groups, subtract silent 'e' endings, ensure min 1
function countSyllables(word: string): number {
	const lower = word.toLowerCase();
	if (lower.length <= 3) return 1; // short words heuristic

	// remove non-alphabetic chars
	const cleaned = lower.replace(/[^a-z]/g, "");
	if (!cleaned) return 1;

	// remove trailing "e"
	const withoutTrailingE = cleaned.replace(/e$/i, "");

	// count vowel groups
	const groups = withoutTrailingE.match(/[aeiouy]{1,2}/g);
	return Math.max(1, groups ? groups.length : 1);
}

// Shared regex to match words including internal apostrophes (e.g. "James's", "can't").
const wordRegex = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g;

/** Return an array of words detected in the text using `wordRegex`. */
function getWords(text: string): string[] {
	return text.match(wordRegex) ?? [];
}
