import { Link } from "react-router-dom";
import { classNames } from "../../lib/utils/classNames.js";
import { Card } from "./Card.jsx";

export function StatCard({ label, value, hint, to }) {
  const content = (
    <>
      <div className="absolute -right-10 top-0 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <p className="text-xs uppercase tracking-[0.28em] text-subtle">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <strong className="text-3xl font-semibold text-white">{value}</strong>
        {hint ? <span className="text-xs text-subtle">{hint}</span> : null}
      </div>
    </>
  );

  return (
    <Card
      className={classNames(
        "relative overflow-hidden",
        to ? "p-0 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-glow" : ""
      )}
    >
      {to ? (
        <Link
          to={to}
          className="block rounded-[28px] p-5 focus:outline-none focus:ring-2 focus:ring-accent/60 md:p-6"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </Card>
  );
}
