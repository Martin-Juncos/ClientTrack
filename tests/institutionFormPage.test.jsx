import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InstitutionFormPage } from "../src/pages/InstitutionFormPage.jsx";

const mockState = vi.hoisted(() => ({
  navigate: vi.fn(),
  getInstitutionById: vi.fn(),
  createInstitution: vi.fn(),
  updateInstitution: vi.fn(),
  meta: {
    data: {
      users: [{ id: "user-1", name: "Admin Uno" }],
      catalogs: {
        institutionTypes: [{ value: "clinic", label: "Clinica" }]
      }
    },
    loading: false,
    error: null,
    reload: vi.fn()
  }
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockState.navigate
  };
});

vi.mock("../src/hooks/useMetaOptions.js", () => ({
  useMetaOptions: () => mockState.meta
}));

vi.mock("../src/lib/api/institutionsApi.js", () => ({
  institutionsApi: {
    getById: mockState.getInstitutionById,
    create: mockState.createInstitution,
    update: mockState.updateInstitution
  }
}));

vi.mock("../src/modules/institutions/InstitutionForm.jsx", () => ({
  InstitutionForm: ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <button type="submit">{submitLabel}</button>
    </form>
  )
}));

function renderCreatePage() {
  return render(
    <MemoryRouter initialEntries={["/instituciones/nueva"]}>
      <Routes>
        <Route path="/instituciones/nueva" element={<InstitutionFormPage mode="create" />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderEditPage() {
  return render(
    <MemoryRouter initialEntries={["/instituciones/inst-1/editar"]}>
      <Routes>
        <Route path="/instituciones/:id/editar" element={<InstitutionFormPage mode="edit" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("InstitutionFormPage", () => {
  beforeEach(() => {
    mockState.navigate.mockReset();
    mockState.getInstitutionById.mockReset();
    mockState.createInstitution.mockReset();
    mockState.updateInstitution.mockReset();
    mockState.meta.reload.mockReset();

    mockState.getInstitutionById.mockResolvedValue({
      _id: "inst-1",
      name: "Clinica Central",
      type: "clinic",
      responsibleId: "user-1",
      city: "",
      province: "",
      phone: "",
      address: "",
      leadSource: "",
      notes: "",
      socials: {},
      primaryContact: {
        _id: "contact-1",
        firstName: "Ana",
        lastName: "",
        role: "",
        phone: "",
        email: ""
      },
      additionalContacts: []
    });
    mockState.createInstitution.mockResolvedValue({ id: "inst-1" });
    mockState.updateInstitution.mockResolvedValue({ id: "inst-1" });
  });

  it("vuelve al listado despues de crear una institucion", async () => {
    renderCreatePage();

    fireEvent.click(screen.getByRole("button", { name: "Crear institucion" }));

    await waitFor(() => {
      expect(mockState.createInstitution).toHaveBeenCalledTimes(1);
    });
    expect(mockState.navigate).toHaveBeenCalledWith("/instituciones");
  });

  it("vuelve al listado despues de guardar cambios en una institucion", async () => {
    renderEditPage();

    await waitFor(() => {
      expect(mockState.getInstitutionById).toHaveBeenCalledWith("inst-1");
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() => {
      expect(mockState.updateInstitution).toHaveBeenCalledWith("inst-1", expect.any(Object));
    });
    expect(mockState.navigate).toHaveBeenCalledWith("/instituciones");
  });
});
