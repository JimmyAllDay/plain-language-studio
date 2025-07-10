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
			<Button variant="secondary">File</Button>
			<Button variant="secondary" onClick={onToggleHighlights}>
				{highlightsEnabled ? "Hide Highlights" : "Show Highlights"}
			</Button>
			<Button variant="secondary">Fix Grammar</Button>
			<Button variant="secondary">Rewrite</Button>
			<div className="ml-auto flex gap-2 items-center">
				<Button variant="outline">Write</Button>
				<Button variant="default">Edit</Button>
			</div>
		</div>
	);
}
