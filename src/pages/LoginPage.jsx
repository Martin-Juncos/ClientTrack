import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { Button } from "../components/ui/Button.jsx";
import { Card } from "../components/ui/Card.jsx";
import { FormField } from "../components/ui/FormField.jsx";
import { Input } from "../components/ui/Input.jsx";

export function LoginPage() {
  const { isAuthenticated, login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (status === "authenticated" || isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <section className="glass-panel hidden rounded-[36px] p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-accent/80">ClientTrack</p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-white">
              Seguimiento comercial con contexto, claridad y proxima accion.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-subtle">
              Un centro de control premium para ordenar oportunidades, registrar cada conversacion y mover el pipeline con precision.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Historial comercial completo",
              "Pipeline visual y accionable",
              "Seguimientos sin fugas"
            ].map((feature) => (
              <div key={feature} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-subtle">
                {feature}
              </div>
            ))}
          </div>
        </section>

        <Card className="flex items-center justify-center rounded-[36px] p-8 sm:p-10">
          <div className="w-full max-w-md space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.36em] text-accent/80">Acceso privado</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Inicia sesion</h2>
              <p className="mt-2 text-sm text-subtle">
                Solo los dos administradores internos pueden acceder a ClientTrack.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <FormField label="Email">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </FormField>
              <FormField label="Contrasena">
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  required
                />
              </FormField>
              {error ? <p className="text-sm text-danger">{error}</p> : null}
              <Button className="w-full" size="lg" type="submit" disabled={submitting}>
                {submitting ? "Ingresando..." : "Entrar a ClientTrack"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
