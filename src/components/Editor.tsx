import { useEffect, useRef } from "react";
import { type AnalysisResult, analyzeText } from "../core/analysis";
import { buildHighlightedHtml } from "../core/highlightHtml";
import { computeHighlights } from "../core/highlights";

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

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		onAnalysis(analyzeText(""));

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

			// Update analysis & highlights immediately
			onAnalysis(analyzeText(newText));
			const html = buildHighlightedHtml(
				newText,
				highlightsEnabled ? computeHighlights(newText) : [],
			);
			el.innerHTML = html;
			setCaretOffset(el, caret + text.length);
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
			onAnalysis(analyzeText(text));
			const html = buildHighlightedHtml(
				text,
				highlightsEnabled ? computeHighlights(text) : [],
			);
			if (ref.current.innerHTML !== html) {
				ref.current.innerHTML = html;
				setCaretOffset(ref.current, caret);
			}
		};

		const schedule = () => {
			if (pending !== null) window.clearTimeout(pending);
			pending = window.setTimeout(process, 150);
		};

		el.addEventListener("input", schedule);
		el.addEventListener("paste", handlePaste);
		el.addEventListener("copy", handleCopy);
		return () => {
			el.removeEventListener("input", schedule);
			el.removeEventListener("paste", handlePaste);
			el.removeEventListener("copy", handleCopy);
			if (pending !== null) window.clearTimeout(pending);
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
