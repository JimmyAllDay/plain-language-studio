import { Eclipse, WholeWord } from "lucide-react";
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
		<div className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b dark:border-slate-700">
			<div className="flex items-center">
				<h1 className="text-2xl font-bold py-2 pl-8 pr-3 text-slate-900 dark:text-slate-100">
					Plain Language Studio
				</h1>
				<WholeWord className="w-10 h-10 mb-[3px]" />
			</div>
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
				<Eclipse width={30} height={30} />
			</Button>
		</div>
	);
}
