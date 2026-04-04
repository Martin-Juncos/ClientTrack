import { Card } from "./Card.jsx";
import { Button } from "./Button.jsx";

export function ErrorState({
  title = "No pudimos cargar esta vista",
  message = "Intenta nuevamente en unos segundos.",
  actionLabel = "Reintentar",
  onAction
}) {
  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="text-sm text-danger">{message}</p>
      </div>
      {onAction ? (
        <div>
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
