import "@testing-library/jest-dom";

// Mock ESM-only dependency that Jest (CommonJS) struggles to load.
jest.mock("text-readability", () => {
	return {
		__esModule: true,
		default: {
			fleschKincaidGrade: (text: string) => {
				const wordCount = text.split(/\s+/).filter(Boolean).length;
				return Math.max(0, Math.round(wordCount / 10));
			},
			fleschReadingEase: (text: string) => 100 - Math.min(100, text.length / 5),
			smogIndex: () => 7,
			gunningFog: () => 10,
		},
	};
});
