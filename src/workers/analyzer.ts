/// <reference lib="webworker" />

// This worker receives raw text from the main thread, runs the heavy analysis
// logic, and posts the results back. Off-loading this keeps the UI responsive
// while typing large documents.

import { type AnalysisResult, analyzeText } from "../core/analysis";
import { type Highlight, computeHighlights } from "../core/highlights";

interface OutgoingMessage {
	id?: number;
	result: AnalysisResult;
	highlights: Highlight[];
}

// Maintain a copy of the current document so we can apply incremental patches.
let currentText = "";

// Utility to apply patch
function applyPatch(start: number, end: number, insert: string) {
	currentText = currentText.slice(0, start) + insert + currentText.slice(end);
}

type IncomingMessage =
	| { id?: number; text: string } // full text replacement
	| { id?: number; start: number; end: number; insert: string }; // incremental diff

self.onmessage = (e: MessageEvent<IncomingMessage>): void => {
	const data = e.data;

	if ("text" in data) {
		// full replacement
		currentText = data.text;
	} else {
		const { start, end, insert } = data;
		applyPatch(start, end, insert);
	}

	const result = analyzeText(currentText);
	const highlights = computeHighlights(currentText);

	const payload: OutgoingMessage = { id: data.id, result, highlights };
	(self as DedicatedWorkerGlobalScope).postMessage(payload);
};
