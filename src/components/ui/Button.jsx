import { classNames } from "../../lib/utils/classNames.js";

const variants = {
  primary: "bg-accent/90 text-slate-950 hover:bg-accent shadow-glow",
  secondary: "bg-panel text-copy hover:bg-panel/80 border border-white/10",
  ghost: "bg-transparent text-subtle hover:bg-white/5 hover:text-copy"
};

export function Button({
  as: Component = "button",
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base"
  };

  return (
    <Component
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
