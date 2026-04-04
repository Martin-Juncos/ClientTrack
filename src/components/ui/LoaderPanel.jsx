export function LoaderPanel({ label = "Cargando...", fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center px-6"
          : "flex min-h-[240px] items-center justify-center"
      }
    >
      <div className="glass-panel flex items-center gap-3 rounded-3xl px-5 py-4">
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
        <span className="text-sm text-subtle">{label}</span>
      </div>
    </div>
  );
}
