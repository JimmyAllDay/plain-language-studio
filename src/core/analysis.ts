import readability from "text-readability";

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
	/** Flesch Reading Ease score (0–100, higher is easier) */
	readingEase: number;
	/** SMOG index */
	smogIndex: number;
	/** Gunning Fog index */
	gunningFog: number;
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

	// Use library for more accurate Flesch–Kincaid Grade Level
	const readabilityGradeRaw = readability.fleschKincaidGrade(text);
	const readabilityGrade = Number(Math.max(0, readabilityGradeRaw).toFixed(1));

	const readingEase = Number(readability.fleschReadingEase(text).toFixed(1));
	const smogIndex = Number(readability.smogIndex(text).toFixed(1));
	const gunningFog = Number(readability.gunningFog(text).toFixed(1));

	return {
		wordCount: words.length,
		sentenceCount: sentences.length,
		mediumSentences,
		longSentences,
		adverbCount,
		passiveVoiceSentences,
		readabilityGrade,
		readingEase,
		smogIndex,
		gunningFog,
	};
}

function splitSentences(text: string): string[] {
	// naive split on punctuation followed by space
	return text
		.split(/(?<=[.!?])\s+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

// removed legacy countSyllables helper; accuracy now provided by text-readability

// Shared regex to match words including internal apostrophes (e.g. "James's", "can't").
const wordRegex = /[A-Za-z0-9]+(?:'[A-Za-z0-9]+)*/g;

/** Return an array of words detected in the text using `wordRegex`. */
function getWords(text: string): string[] {
	return text.match(wordRegex) ?? [];
}
