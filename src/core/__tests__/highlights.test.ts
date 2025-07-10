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
});
