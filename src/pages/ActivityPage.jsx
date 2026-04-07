import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { LoaderPanel } from "../components/ui/LoaderPanel.jsx";
import { ErrorState } from "../components/ui/ErrorState.jsx";
import { ActivityFeed } from "../modules/activity/ActivityFeed.jsx";
import { activityApi } from "../lib/api/activityApi.js";

export function ActivityPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function loadActivity() {
    try {
      setError("");
      const response = await activityApi.getRecent();
      setData(response);
    } catch (currentError) {
      setError(currentError.message);
    }
  }

  useEffect(() => {
    loadActivity();
  }, []);

  if (!data && !error) {
    return <LoaderPanel label="Cargando actividad reciente..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Pulse del sistema"
        title="Actividad reciente"
        description="Mira rapidamente que se movio y quien intervino en el CRM."
      />
      {error ? <ErrorState message={error} onAction={loadActivity} /> : <ActivityFeed items={data.feed} />}
    </div>
  );
}
