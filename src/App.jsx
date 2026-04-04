import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { ProtectedRoute } from "./components/layout/ProtectedRoute.jsx";
import { LoaderPanel } from "./components/ui/LoaderPanel.jsx";

const LoginPage = lazy(() => import("./pages/LoginPage.jsx").then((module) => ({ default: module.LoginPage })));
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage.jsx").then((module) => ({ default: module.DashboardPage }))
);
const InstitutionsPage = lazy(() =>
  import("./pages/InstitutionsPage.jsx").then((module) => ({ default: module.InstitutionsPage }))
);
const InstitutionFormPage = lazy(() =>
  import("./pages/InstitutionFormPage.jsx").then((module) => ({ default: module.InstitutionFormPage }))
);
const InstitutionDetailPage = lazy(() =>
  import("./pages/InstitutionDetailPage.jsx").then((module) => ({ default: module.InstitutionDetailPage }))
);
const OpportunitiesPage = lazy(() =>
  import("./pages/OpportunitiesPage.jsx").then((module) => ({ default: module.OpportunitiesPage }))
);
const OpportunityFormPage = lazy(() =>
  import("./pages/OpportunityFormPage.jsx").then((module) => ({ default: module.OpportunityFormPage }))
);
const OpportunityDetailPage = lazy(() =>
  import("./pages/OpportunityDetailPage.jsx").then((module) => ({ default: module.OpportunityDetailPage }))
);
const KanbanPage = lazy(() => import("./pages/KanbanPage.jsx").then((module) => ({ default: module.KanbanPage })));
const TasksPage = lazy(() => import("./pages/TasksPage.jsx").then((module) => ({ default: module.TasksPage })));
const ActivityPage = lazy(() =>
  import("./pages/ActivityPage.jsx").then((module) => ({ default: module.ActivityPage }))
);

function RouteLoader() {
  return <LoaderPanel label="Cargando modulo..." />;
}

function withSuspense(element) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={withSuspense(<LoginPage />)} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route index element={withSuspense(<DashboardPage />)} />
            <Route path="instituciones" element={withSuspense(<InstitutionsPage />)} />
            <Route path="instituciones/nueva" element={withSuspense(<InstitutionFormPage mode="create" />)} />
            <Route path="instituciones/:id" element={withSuspense(<InstitutionDetailPage />)} />
            <Route path="instituciones/:id/editar" element={withSuspense(<InstitutionFormPage mode="edit" />)} />
            <Route path="oportunidades" element={withSuspense(<OpportunitiesPage />)} />
            <Route path="oportunidades/nueva" element={withSuspense(<OpportunityFormPage mode="create" />)} />
            <Route path="oportunidades/:id" element={withSuspense(<OpportunityDetailPage />)} />
            <Route path="oportunidades/:id/editar" element={withSuspense(<OpportunityFormPage mode="edit" />)} />
            <Route path="pipeline" element={withSuspense(<KanbanPage />)} />
            <Route path="seguimientos" element={withSuspense(<TasksPage />)} />
            <Route path="actividad" element={withSuspense(<ActivityPage />)} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
