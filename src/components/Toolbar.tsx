import { Button } from "./ui/button";

interface Props {
	highlightsEnabled: boolean;
	onToggleHighlights: () => void;
}

export default function Toolbar({
	highlightsEnabled,
	onToggleHighlights,
}: Props) {
	return (
		<div className="flex gap-2 items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b dark:border-slate-700">
			<Button
				variant="secondary"
				onClick={onToggleHighlights}
				className="ml-auto"
			>
				{highlightsEnabled ? "Hide Highlights" : "Show Highlights"}
			</Button>
			<Button
				variant="icon"
				aria-label="Toggle dark mode"
				onClick={() => {
					const html = document.documentElement;
					const isDark = html.classList.contains("dark");
					html.classList.toggle("dark", !isDark);
				}}
			>
				{document.documentElement.classList.contains("dark") ? "☀️" : "🌙"}
			</Button>
		</div>
	);
}
