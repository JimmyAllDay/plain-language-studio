import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "secondary" | "outline";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: Variant;
}

export function Button({ variant = "default", className, ...rest }: Props) {
	const base = "text-sm font-medium px-3 py-1.5 rounded-md transition-colors";
	const styles: Record<Variant, string> = {
		default: "bg-blue-600 text-white hover:bg-blue-700",
		secondary:
			"bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600",
		outline:
			"border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700",
	};
	return (
		<button className={clsx(base, styles[variant], className)} {...rest} />
	);
}
