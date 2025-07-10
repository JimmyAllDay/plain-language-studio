declare module "text-readability" {
	interface Readability {
		fleschKincaidGrade(text: string): number;
		fleschReadingEase(text: string): number;
		smogIndex(text: string): number;
		gunningFog(text: string): number;
	}
	const readability: Readability;
	export default readability;
}
