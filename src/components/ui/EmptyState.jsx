export function EmptyState({ title, description }) {
  return (
    <div className="glass-panel rounded-[28px] border border-dashed border-white/10 p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-subtle">{description}</p>
    </div>
  );
}
