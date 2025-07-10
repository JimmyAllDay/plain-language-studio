import { analyzeText } from "../analysis";

const sample =
	"This is a short sentence. This sentence, however, is considerably longer to test long sentence detection.";
const longSentenceSample =
	"This single sentence is intentionally written with more than twenty words so that the analysis engine will classify it as a long sentence according to the rule.";

describe("analyzeText", () => {
	it("counts words and sentences", () => {
		const res = analyzeText(sample);
		expect(res.wordCount).toBe(16);
		expect(res.sentenceCount).toBe(2);
	});

	it("detects long sentences (>20 words)", () => {
		const res = analyzeText(longSentenceSample);
		expect(res.longSentences).toBe(1);
	});

	it("detects adverbs ending in -ly", () => {
		const res = analyzeText("Swiftly quickly slowly.");
		expect(res.adverbCount).toBe(3);
	});

	it("detects passive voice sentences", () => {
		const res = analyzeText(
			"The ball was thrown by John. John kicked the ball.",
		);
		expect(res.passiveVoiceSentences).toBe(1);
	});

	it("computes a readability grade level", () => {
		const res = analyzeText("The quick brown fox jumps over the lazy dog.");
		expect(res.readabilityGrade).toBeGreaterThanOrEqual(0);
	});

	it("counts words with apostrophes correctly", () => {
		const res = analyzeText("James's cat can't find its toy.");
		expect(res.wordCount).toBe(6);
	});
});
