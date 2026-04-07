import { useEffect, useState } from "react";
import { HiXMark } from "react-icons/hi2";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { Button } from "../ui/Button.jsx";
import { classNames } from "../../lib/utils/classNames.js";

const navigation = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/instituciones", label: "Instituciones" },
  { to: "/oportunidades", label: "Oportunidades" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/seguimientos", label: "Seguimientos" },
  { to: "/actividad", label: "Actividad" }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const initials =
    user?.name
      ?.split(" ")
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") ?? "CT";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-mesh text-copy">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:grid-cols-[280px,1fr] lg:px-6">
        <aside className="glass-panel hidden rounded-[32px] p-6 lg:flex lg:flex-col">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-accent/80">ClientTrack</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Control comercial</h1>
            <p className="mt-2 text-sm leading-6 text-subtle">
              Una vista clara del pipeline, el contexto y el proximo movimiento.
            </p>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-2">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                end={item.exact}
                to={item.to}
                className={({ isActive }) =>
                  classNames(
                    "rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                    isActive
                      ? "bg-accent/15 text-white shadow-glow ring-1 ring-accent/20"
                      : "text-subtle hover:bg-white/5 hover:text-copy"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="glass-panel mt-8 rounded-[28px] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-sm font-semibold text-accent">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-subtle">{user?.email}</p>
              </div>
            </div>
            <Button className="mt-4 w-full" variant="secondary" onClick={logout}>
              Cerrar sesion
            </Button>
          </div>
        </aside>

        <main className="space-y-6">
          <header className="glass-panel relative rounded-[28px] px-5 py-4 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-accent/80">ClientTrack</p>
                <p className="text-sm text-subtle">{user?.name}</p>
              </div>
              <Button
                aria-expanded={isMobileMenuOpen}
                aria-label={isMobileMenuOpen ? "Cerrar menu" : "Abrir menu"}
                className="h-12 w-12 rounded-2xl px-0"
                variant="secondary"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                {isMobileMenuOpen ? (
                  <HiXMark className="h-7 w-7 text-copy" strokeWidth={2.4} />
                ) : (
                  <span className="flex flex-col items-center justify-center gap-[3px] text-copy">
                    <span className="block h-[2.5px] w-5 rounded-full bg-current" />
                    <span className="block h-[2.5px] w-5 rounded-full bg-current" />
                    <span className="block h-[2.5px] w-5 rounded-full bg-current" />
                  </span>
                )}
              </Button>
            </div>

            {isMobileMenuOpen ? (
              <div className="absolute inset-x-3 top-[calc(100%+0.75rem)] z-20 rounded-[28px] border border-white/10 bg-[#0b1324] p-3 shadow-2xl">
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.to}
                      end={item.exact}
                      to={item.to}
                      className={({ isActive }) =>
                        classNames(
                          "rounded-2xl px-4 py-3 text-sm transition-all duration-300",
                          isActive
                            ? "bg-accent/15 text-white shadow-glow ring-1 ring-accent/20"
                            : "text-subtle hover:bg-white/5 hover:text-copy"
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </nav>

                <div className="mt-3 border-t border-white/10 pt-3">
                  <Button className="w-full" variant="secondary" onClick={logout}>
                    Cerrar sesion
                  </Button>
                </div>
              </div>
            ) : null}
          </header>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
