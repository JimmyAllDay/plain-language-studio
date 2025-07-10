import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Editor from "../Editor";

describe("Editor component", () => {
	it("renders a contenteditable textbox", () => {
		render(<Editor onAnalysis={jest.fn()} />);
		const textbox = screen.getByRole("textbox", {
			name: /plain text editor/i,
		});
		expect(textbox).toBeInTheDocument();
	});

	it("updates value when user types", async () => {
		render(<Editor onAnalysis={jest.fn()} />);
		const textbox = screen.getByRole("textbox", {
			name: /plain text editor/i,
		});
		await userEvent.type(textbox, "Hello world");
		expect(textbox.textContent).toBe("Hello world");
	});
});
