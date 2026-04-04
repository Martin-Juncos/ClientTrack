import { classNames } from "../../lib/utils/classNames.js";

export function Textarea({ className, invalid = false, ...props }) {
  return (
    <textarea
      className={classNames(
        "min-h-[120px] w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-copy outline-none transition-all duration-300 placeholder:text-subtle focus:border-accent/60 focus:bg-white/10 focus:ring-2 focus:ring-accent/20",
        invalid && "border-danger/60 bg-danger/5 focus:border-danger focus:ring-danger/20",
        className
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
