import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstitutionDetailPage } from "../src/pages/InstitutionDetailPage.jsx";

const mockState = vi.hoisted(() => ({
  navigate: vi.fn(),
  getInstitutionById: vi.fn(),
  removeInstitution: vi.fn(),
  listOpportunities: vi.fn()
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockState.navigate
  };
});

vi.mock("../src/lib/api/institutionsApi.js", () => ({
  institutionsApi: {
    getById: mockState.getInstitutionById,
    remove: mockState.removeInstitution
  }
}));

vi.mock("../src/lib/api/opportunitiesApi.js", () => ({
  opportunitiesApi: {
    list: mockState.listOpportunities
  }
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/instituciones/inst-1"]}>
      <Routes>
        <Route path="/instituciones/:id" element={<InstitutionDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("InstitutionDetailPage", () => {
  beforeEach(() => {
    mockState.navigate.mockReset();
    mockState.getInstitutionById.mockReset();
    mockState.removeInstitution.mockReset();
    mockState.listOpportunities.mockReset();

    mockState.getInstitutionById.mockResolvedValue({
      _id: "inst-1",
      name: "Clinica Central",
      type: "clinic",
      responsibleId: { name: "Admin Uno" },
      city: "Cordoba",
      leadSource: "Referido",
      primaryContact: {
        _id: "contact-1",
        firstName: "Ana",
        lastName: "Lopez",
        role: "Directora",
        email: "ana@example.com",
        phone: "123456"
      },
      additionalContacts: [],
      socials: {},
      notes: "Cuenta clave."
    });
    mockState.listOpportunities.mockResolvedValue([
      {
        _id: "opp-1",
        solutionType: "appointment_system",
        status: "new_lead"
      }
    ]);
    mockState.removeInstitution.mockResolvedValue({ id: "inst-1" });
  });

  it("abre el modal de borrado con el impacto asociado", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Clinica Central" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar institucion" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/1 oportunidad asociada/i)).toBeInTheDocument();
  });

  it("cierra el modal sin borrar al cancelar", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Clinica Central" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog", { name: "Eliminar institucion" })).not.toBeInTheDocument();
    expect(mockState.removeInstitution).not.toHaveBeenCalled();
  });

  it("confirma el borrado y navega al listado", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Clinica Central" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar institucion" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar institucion" }));

    await waitFor(() => {
      expect(mockState.removeInstitution).toHaveBeenCalledWith("inst-1");
    });
    expect(mockState.navigate).toHaveBeenCalledWith("/instituciones");
  });

  it("mantiene el modal abierto y muestra el error si falla el borrado", async () => {
    mockState.removeInstitution.mockRejectedValueOnce(new Error("No se pudo borrar la institucion"));

    renderPage();

    expect(await screen.findByRole("heading", { name: "Clinica Central" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar institucion" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar institucion" }));

    expect(await within(dialog).findByText("No se pudo borrar la institucion")).toBeInTheDocument();
    expect(mockState.navigate).not.toHaveBeenCalled();
  });

  it("muestra un acceso directo a WhatsApp para el contacto principal", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: "Clinica Central" })).toBeInTheDocument();

    const whatsappLink = screen.getByRole("link", { name: /WhatsApp/i });
    expect(whatsappLink).toHaveAttribute("href", "https://wa.me/123456");
    expect(whatsappLink).toHaveAttribute("target", "_blank");
  });
});
