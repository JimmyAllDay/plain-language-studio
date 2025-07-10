import { useEffect, useRef } from "react";
import { type AnalysisResult, analyzeText } from "../core/analysis";
import { buildHighlightedHtml } from "../core/highlightHtml";
import { computeHighlights } from "../core/highlights";

// Detect worker support once to avoid re-evaluating in every render.
const hasWorkerSupport = typeof Worker !== "undefined";

interface Props {
	onAnalysis: (res: AnalysisResult) => void;
	highlightsEnabled?: boolean;
}

function getCaretOffset(root: HTMLElement): number {
	const sel = window.getSelection?.();
	if (!sel || sel.rangeCount === 0 || !sel.anchorNode) return 0;
	const range = sel.getRangeAt(0).cloneRange();
	range.selectNodeContents(root);
	range.setEnd(sel.anchorNode, sel.anchorOffset);
	return range.toString().length;
}

function setCaretOffset(root: HTMLElement, offset: number) {
	const range = document.createRange();
	const sel = window.getSelection();
	if (!sel) return;

	let charIndex = 0;
	let found = false;
	function traverse(node: Node) {
		if (found) return;
		if (node.nodeType === Node.TEXT_NODE) {
			const nextChar = charIndex + (node as Text).data.length;
			if (offset <= nextChar) {
				range.setStart(node, offset - charIndex);
				range.collapse(true);
				found = true;
			}
			charIndex = nextChar;
		} else if (node.nodeName === "BR") {
			if (charIndex === offset) {
				range.setStartBefore(node);
				range.collapse(true);
				found = true;
			}
			charIndex += 1;
		} else {
			node.childNodes.forEach(traverse);
		}
	}
	traverse(root);
	sel.removeAllRanges();
	sel.addRange(range);
}

export default function Editor({
	onAnalysis,
	highlightsEnabled = true,
}: Props) {
	const ref = useRef<HTMLDivElement>(null);

	// Keep a singleton worker instance for this component lifecycle.
	const workerRef = useRef<Worker | null>(null);
	const prevTextRef = useRef<string>("");

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		// Lazily create the worker once when the component mounts (if supported)
		if (hasWorkerSupport && !workerRef.current) {
			try {
				const isTestEnv =
					typeof (globalThis as { jest?: unknown }).jest !== "undefined";
				if (isTestEnv) {
					// Simpler path to keep Jest (CommonJS) happy — no import.meta.
					workerRef.current = new Worker("/src/workers/analyzer.ts", {
						type: "module",
					});
				} else {
					// Use Vite's worker bundling but avoid a literal `import.meta` so Jest CommonJS
					// doesn't choke. We generate it via `eval`, which the bundler still optimizes.
					const importMetaUrl = eval("import.meta.url") as string;
					const workerUrl = new URL(
						"../workers/analyzer.ts",
						/* @vite-ignore */ importMetaUrl,
					);
					workerRef.current = new Worker(workerUrl, { type: "module" });
				}
			} catch (err) {
				console.error(
					"Failed to create worker, falling back to main thread",
					err,
				);
				workerRef.current = null;
			}

			// Forward the computed analysis result back to the parent.
			if (workerRef.current)
				workerRef.current.onmessage = (
					e: MessageEvent<{
						result: AnalysisResult;
						highlights: ReturnType<typeof computeHighlights>;
					}>,
				) => {
					const { result, highlights } = e.data;
					onAnalysis(result);
					const elCurrent = ref.current;
					if (!elCurrent) return;
					const caret = getCaretOffset(elCurrent);

					const html = buildHighlightedHtml(
						prevTextRef.current,
						highlightsEnabled ? highlights : [],
					);
					if (elCurrent.innerHTML !== html) {
						elCurrent.innerHTML = html;
						setCaretOffset(elCurrent, caret);
					}
				};
		}

		// Provide an initial empty analysis so the sidebar isn't blank.
		if (!hasWorkerSupport) {
			onAnalysis(analyzeText(""));
			prevTextRef.current = "";
		} else {
			workerRef.current?.postMessage({ text: "" });
			prevTextRef.current = "";
		}

		// --- Clipboard handlers ---
		// Ensure pasted content is inserted as plain text and copied content excludes highlight markup.
		const handlePaste = (e: ClipboardEvent) => {
			e.preventDefault();
			const text = e.clipboardData?.getData("text/plain") ?? "";
			if (!text) return;

			// Preserve caret position, build new plain text string, and re-render with highlights.
			const caret = getCaretOffset(el);
			const currentText = el.innerText || el.textContent || "";
			const newText =
				currentText.slice(0, caret) + text + currentText.slice(caret);

			if (workerRef.current) {
				workerRef.current.postMessage({ text: newText });
				prevTextRef.current = newText;
			} else {
				// Fallback: compute in main thread
				onAnalysis(analyzeText(newText));
				const html = buildHighlightedHtml(
					newText,
					highlightsEnabled ? computeHighlights(newText) : [],
				);
				el.innerHTML = html;
				setCaretOffset(el, caret + text.length);
			}
		};

		const handleCopy = (e: ClipboardEvent) => {
			const sel = window.getSelection?.();
			if (!sel) return;
			const text = sel.toString();
			if (!text) return;
			e.preventDefault();
			e.clipboardData?.setData("text/plain", text);
		};

		let pending: number | null = null;

		const process = () => {
			if (!ref.current) return;
			const caret = getCaretOffset(ref.current);
			const text = ref.current.innerText;

			if (workerRef.current) {
				// Compute diff against previous text to send as incremental patch.
				const prev = prevTextRef.current;
				if (prev === "") {
					workerRef.current.postMessage({ text });
				} else {
					// Simple diff algorithm (prefix/suffix trim)
					let start = 0;
					while (
						start < prev.length &&
						start < text.length &&
						prev[start] === text[start]
					) {
						start++;
					}
					let prevEnd = prev.length - 1;
					let newEnd = text.length - 1;
					while (
						prevEnd >= start &&
						newEnd >= start &&
						prev[prevEnd] === text[newEnd]
					) {
						prevEnd--;
						newEnd--;
					}
					const end = prevEnd + 1; // slice end index in previous text
					const insert = text.slice(start, newEnd + 1);
					workerRef.current.postMessage({ start, end, insert });
				}

				prevTextRef.current = text;
			} else {
				// Fallback path: compute everything in main thread
				onAnalysis(analyzeText(text));
				const html = buildHighlightedHtml(
					text,
					highlightsEnabled ? computeHighlights(text) : [],
				);
				if (ref.current.innerHTML !== html) {
					ref.current.innerHTML = html;
					setCaretOffset(ref.current, caret);
				}
			}
		};

		const schedule = () => {
			if (pending !== null) window.clearTimeout(pending);
			const base = 100;
			const extra = Math.min((prevTextRef.current.length / 1000) * 50, 400);
			pending = window.setTimeout(process, base + extra);
		};

		el.addEventListener("input", schedule);
		el.addEventListener("paste", handlePaste);
		el.addEventListener("copy", handleCopy);
		return () => {
			el.removeEventListener("input", schedule);
			el.removeEventListener("paste", handlePaste);
			el.removeEventListener("copy", handleCopy);
			if (pending !== null) window.clearTimeout(pending);

			// Terminate the worker when the component unmounts.
			workerRef.current?.terminate();
		};
	}, [onAnalysis, highlightsEnabled]);

	return (
		<div
			tabIndex={0}
			ref={ref}
			contentEditable
			spellCheck
			role="textbox"
			aria-multiline="true"
			aria-label="Plain text editor"
			aria-describedby="stats-panel"
			className="h-full w-full outline-none p-4 whitespace-pre-wrap break-words bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50"
			data-placeholder="Start typing here..."
		/>
	);
}
