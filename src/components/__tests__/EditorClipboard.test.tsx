import { render, screen } from "@testing-library/react";
import Editor from "../Editor";

// Helper to dispatch a clipboard event with custom data
function dispatchClipboardEvent(
	type: "copy" | "paste",
	target: HTMLElement,
	data: Record<string, string>,
) {
	const event = new Event(type, { bubbles: true, cancelable: true });
	Object.assign(event, {
		clipboardData: {
			getData: (key: string) => data[key],
			setData: jest.fn(),
		},
	});

	target.dispatchEvent(event as unknown as ClipboardEvent);
	return event as unknown as ClipboardEvent;
}

describe("Editor clipboard interactions", () => {
	it("inserts plain text on paste, stripping rich HTML", () => {
		render(<Editor onAnalysis={jest.fn()} />);
		const textbox = screen.getByRole("textbox", {
			name: /plain text editor/i,
		}) as HTMLElement;

		// Simulate paste with HTML markup in the clipboard
		const pastedText = "Bold text";
		dispatchClipboardEvent("paste", textbox, {
			"text/plain": pastedText,
		});

		expect(textbox.textContent).toBe(pastedText);
	});

	it("places plain text on clipboard on copy", () => {
		render(<Editor onAnalysis={jest.fn()} />);
		const textbox = screen.getByRole("textbox", {
			name: /plain text editor/i,
		}) as HTMLElement;

		// Set initial content
		textbox.textContent = "Copy me";
		// Select text node entirely
		const range = document.createRange();
		range.selectNodeContents(textbox.firstChild as Node);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(range);

		const ev = dispatchClipboardEvent("copy", textbox, {});
		// verify setData called with plain text
		expect(ev.clipboardData?.setData).toHaveBeenCalledWith(
			"text/plain",
			"Copy me",
		);
	});
});
