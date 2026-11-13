import TextareaAutosize from "react-textarea-autosize";
import type { TextareaAutosizeProps } from "react-textarea-autosize";
import type { Ref } from "react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps extends TextareaAutosizeProps {
  error?: string | boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  error,
  ref,
  minRows = 4,
  ...props
}: TextareaProps) {
  return (
    <TextareaAutosize
      ref={ref}
      minRows={minRows}
      aria-invalid={error ? true : undefined}
      className={twMerge(
        "border border-border outline-none transition-colors resize-none",
        "focus:border-primary",
        "disabled:cursor-not-allowed",
        error && "border-danger focus:border-danger",
        className,
      )}
      {...props}
    />
  );
}
