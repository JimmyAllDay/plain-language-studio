import type { AnalysisResult } from "../core/analysis";

type Props = {
	data: AnalysisResult;
};

export default function StatsPanel({ data }: Props) {
	return (
		<aside
			id="stats-panel"
			className="w-64 shrink-0 bg-slate-50 dark:bg-slate-900 p-4 h-screen overflow-y-auto"
		>
			<h2 className="font-semibold text-lg mb-2">Readability</h2>
			<p className="mb-4">Grade {data.readabilityGrade}</p>

			<h3 className="font-medium mb-1">Words: {data.wordCount}</h3>

			<ul className="space-y-2 text-sm">
				<li className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-2 rounded">
					{data.longSentences} long sentences
				</li>
				<li className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-3 py-2 rounded">
					{data.adverbCount} adverbs
				</li>
				<li className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-2 rounded">
					{data.passiveVoiceSentences} passive sentences
				</li>
			</ul>
		</aside>
	);
}
