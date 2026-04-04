import { classNames } from "../../lib/utils/classNames.js";

export function Card({ className, children }) {
  return (
    <section
      className={classNames(
        "glass-panel rounded-[28px] border border-white/10 p-5 md:p-6",
        className
      )}
    >
      {children}
    </section>
  );
}
