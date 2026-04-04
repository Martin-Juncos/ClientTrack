export function FormField({ label, hint, error, children }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-copy">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : hint ? <span className="text-xs text-subtle">{hint}</span> : null}
    </label>
  );
}
