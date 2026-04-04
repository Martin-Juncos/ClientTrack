import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  getOptions: vi.fn(),
  listInstitutions: vi.fn()
}));

vi.mock("../src/lib/api/metaApi.js", () => ({
  metaApi: {
    getOptions: mockState.getOptions
  }
}));

vi.mock("../src/lib/api/institutionsApi.js", () => ({
  institutionsApi: {
    list: mockState.listInstitutions
  }
}));

describe("InstitutionsPage", () => {
  beforeEach(() => {
    vi.resetModules();
    mockState.getOptions.mockReset();
    mockState.listInstitutions.mockReset();
  });

  it("muestra un error recuperable si falla metadata y permite reintentar", async () => {
    mockState.getOptions
      .mockRejectedValueOnce(new Error("Meta fuera de linea"))
      .mockResolvedValueOnce({
        users: [
          {
            id: "user-1",
            name: "Admin Uno",
            email: "admin1@example.com"
          }
        ],
        catalogs: {
          institutionTypes: [{ value: "clinic", label: "Clinica" }]
        }
      });
    mockState.listInstitutions.mockResolvedValue([]);

    const { InstitutionsPage } = await import("../src/pages/InstitutionsPage.jsx");

    render(
      <MemoryRouter>
        <InstitutionsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Meta fuera de linea/i)).toBeInTheDocument();
    expect(mockState.listInstitutions).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

    await waitFor(() => expect(mockState.listInstitutions).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Instituciones")).toBeInTheDocument();
  });
});
