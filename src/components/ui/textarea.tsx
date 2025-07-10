import clsx from "clsx";
import { type TextareaHTMLAttributes, forwardRef } from "react";

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={clsx(
					// Base styles borrowed from shadcn/ui textarea component
					"flex min-h-[120px] w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950/30 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-50 dark:placeholder:text-slate-400 dark:focus:ring-slate-300/30",
					className,
				)}
				{...props}
			/>
		);
	},
);

Textarea.displayName = "Textarea";
