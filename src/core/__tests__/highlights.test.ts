import { computeHighlights } from "../highlights";

describe("computeHighlights", () => {
	it("finds adverbs ending in -ly", () => {
		const text = "She quickly and quietly ran.";
		const hl = computeHighlights(text);
		const words = hl.map((h) => text.slice(h.start, h.end));
		expect(words).toEqual(expect.arrayContaining(["quickly", "quietly"]));
	});

	it("returns empty array when no adverbs", () => {
		const hl = computeHighlights("Run fast.");
		expect(hl).toHaveLength(0);
	});

	it("highlights long sentences (>20 words)", () => {
		const text =
			"This single sentence intentionally contains more than twenty words to ensure that our highlighting engine marks it as a long sentence, which should aid readability checks.";
		const hl = computeHighlights(text);
		const longHls = hl.filter((h) => h.type === "long-sentence");
		expect(longHls).toHaveLength(1);
	});

	it("highlights warning sentences (>10 words)", () => {
		const text =
			"This sentence contains just enough words to trigger the orange warning highlight.";
		const hl = computeHighlights(text);
		const warning = hl.find((h) => h.type === "long-warning");
		expect(warning).toBeDefined();
	});

	it("highlights passive voice sentences", () => {
		const text = "The ball was thrown by John. John kicked the ball.";
		const hl = computeHighlights(text);
		const passiveHls = hl.filter((h) => h.type === "passive");
		expect(passiveHls).toHaveLength(1);
	});

	it("highlights long sentence without terminal punctuation", () => {
		const text =
			"Many readers find it challenging when writers craft extremely lengthy statements that continue without pause or punctuation and stretch far beyond the recommended limit";
		const hl = computeHighlights(text);
		const longHl = hl.find((h) => h.type === "long-sentence");
		expect(longHl).toBeDefined();
	});
});
