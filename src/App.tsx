import { WholeWord } from "lucide-react";
import { useCallback, useState } from "react";
import Editor from "./components/Editor";
import StatsPanel from "./components/StatsPanel";
import Toolbar from "./components/Toolbar";
import type { AnalysisResult } from "./core/analysis";

export default function App() {
	const [analysis, setAnalysis] = useState<AnalysisResult>({
		wordCount: 0,
		sentenceCount: 0,
		mediumSentences: 0,
		longSentences: 0,
		adverbCount: 0,
		passiveVoiceSentences: 0,
		readabilityGrade: 0,
		readingEase: 0,
		smogIndex: 0,
		gunningFog: 0,
	});

	const handleAnalysis = useCallback((res: AnalysisResult) => {
		setAnalysis(res);
	}, []);

	const [showHighlights, setShowHighlights] = useState(true);

	return (
		<div className="flex flex-col h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
			<Toolbar
				highlightsEnabled={showHighlights}
				onToggleHighlights={() => setShowHighlights((prev) => !prev)}
			/>
			<div className="flex flex-1 overflow-hidden">
				<main className="flex-1 overflow-auto p-4 prose dark:prose-invert max-w-none">
					<Editor
						onAnalysis={handleAnalysis}
						highlightsEnabled={showHighlights}
					/>
				</main>
				<StatsPanel data={analysis} />
			</div>
		</div>
	);
}
