import { useEffect, useId } from "react";
import { Button } from "./Button.jsx";

export function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
  error = ""
}) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) {
        event.preventDefault();
        onCancel?.();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [loading, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="glass-panel w-full max-w-lg rounded-[28px] border border-white/10 bg-panel/95 p-6 shadow-2xl"
      >
        <div className="space-y-3">
          <h2 id={titleId} className="text-xl font-semibold text-white">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm leading-6 text-subtle">
            {description}
          </p>
        </div>

        {error ? (
          <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} autoFocus>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Eliminando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
