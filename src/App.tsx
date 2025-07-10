import { useCallback, useState } from "react";
import Editor from "./components/Editor";
import StatsPanel from "./components/StatsPanel";
import type { AnalysisResult } from "./core/analysis";

export default function App() {
	const [analysis, setAnalysis] = useState<AnalysisResult>({
		wordCount: 0,
		sentenceCount: 0,
		longSentences: 0,
		adverbCount: 0,
		passiveVoiceSentences: 0,
		readabilityGrade: 0,
	});

	const handleAnalysis = useCallback((res: AnalysisResult) => {
		setAnalysis(res);
	}, []);

	return (
		<div className="flex flex-col h-screen">
			<h1 className="text-2xl font-bold">Plain Language Studio</h1>
			<div className="flex flex-1 overflow-hidden">
				<main className="flex-1 overflow-auto p-4 prose dark:prose-invert max-w-none">
					<Editor onAnalysis={handleAnalysis} />
				</main>
				<StatsPanel data={analysis} />
			</div>
		</div>
	);
}
