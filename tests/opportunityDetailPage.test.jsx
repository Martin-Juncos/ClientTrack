import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpportunityDetailPage } from "../src/pages/OpportunityDetailPage.jsx";

const mockState = vi.hoisted(() => ({
  navigate: vi.fn(),
  getOpportunityById: vi.fn(),
  removeOpportunity: vi.fn(),
  listInteractions: vi.fn(),
  createInteraction: vi.fn(),
  deleteInteraction: vi.fn(),
  listTasks: vi.fn(),
  createTask: vi.fn(),
  deleteTask: vi.fn(),
  updateTask: vi.fn(),
  meta: {
    data: {
      users: [{ id: "user-1", name: "Admin Uno" }],
      catalogs: {
        interactionTypes: [{ value: "call", label: "Llamada" }],
        priorityOptions: [{ value: "high", label: "Alta" }],
        taskStatuses: [{ value: "pending", label: "Pendiente" }]
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

vi.mock("../src/lib/api/opportunitiesApi.js", () => ({
  opportunitiesApi: {
    getById: mockState.getOpportunityById,
    remove: mockState.removeOpportunity
  }
}));

vi.mock("../src/lib/api/interactionsApi.js", () => ({
  interactionsApi: {
    list: mockState.listInteractions,
    create: mockState.createInteraction,
    remove: mockState.deleteInteraction
  }
}));

vi.mock("../src/lib/api/tasksApi.js", () => ({
  tasksApi: {
    list: mockState.listTasks,
    create: mockState.createTask,
    remove: mockState.deleteTask,
    update: mockState.updateTask
  }
}));

vi.mock("../src/modules/opportunities/InteractionsTimeline.jsx", () => ({
  InteractionsTimeline: () => <div>Interactions timeline</div>
}));

vi.mock("../src/modules/tasks/TaskComposer.jsx", () => ({
  TaskComposer: () => <div>Task composer</div>
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/oportunidades/opp-1"]}>
      <Routes>
        <Route path="/oportunidades/:id" element={<OpportunityDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OpportunityDetailPage", () => {
  beforeEach(() => {
    mockState.navigate.mockReset();
    mockState.getOpportunityById.mockReset();
    mockState.removeOpportunity.mockReset();
    mockState.listInteractions.mockReset();
    mockState.createInteraction.mockReset();
    mockState.deleteInteraction.mockReset();
    mockState.listTasks.mockReset();
    mockState.createTask.mockReset();
    mockState.deleteTask.mockReset();
    mockState.updateTask.mockReset();
    mockState.meta.reload.mockReset();

    mockState.getOpportunityById.mockResolvedValue({
      _id: "opp-1",
      solutionType: "appointment_system",
      status: "new_lead",
      priority: "high",
      interestLevel: "warm",
      estimatedBudget: 150000,
      winProbability: 55,
      nextActionSnapshot: { title: "Llamar" },
      needSummary: "Necesita ordenar agenda.",
      objections: "Presupuesto acotado.",
      responsibleId: { _id: "user-1", name: "Admin Uno" },
      institutionId: {
        _id: "inst-1",
        name: "Clinica Central",
        primaryContact: {
          _id: "contact-1",
          firstName: "Ana",
          lastName: "Lopez",
          role: "Directora",
          email: "ana@example.com",
          phone: "123456"
        },
        additionalContacts: []
      }
    });
    mockState.listInteractions.mockResolvedValue([]);
    mockState.listTasks.mockResolvedValue([]);
    mockState.removeOpportunity.mockResolvedValue({ id: "opp-1" });
  });

  it("abre el modal de borrado de oportunidad", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: /Clinica Central/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar oportunidad" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/interacciones y seguimientos asociados/i)).toBeInTheDocument();
  });

  it("cancela el borrado sin llamar a la API", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: /Clinica Central/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog", { name: "Eliminar oportunidad" })).not.toBeInTheDocument();
    expect(mockState.removeOpportunity).not.toHaveBeenCalled();
  });

  it("confirma el borrado y vuelve al listado", async () => {
    renderPage();

    expect(await screen.findByRole("heading", { name: /Clinica Central/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar oportunidad" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar oportunidad" }));

    await waitFor(() => {
      expect(mockState.removeOpportunity).toHaveBeenCalledWith("opp-1");
    });
    expect(mockState.navigate).toHaveBeenCalledWith("/oportunidades");
  });

  it("muestra el error inline si la eliminacion falla", async () => {
    mockState.removeOpportunity.mockRejectedValueOnce(new Error("No se pudo borrar la oportunidad"));

    renderPage();

    expect(await screen.findByRole("heading", { name: /Clinica Central/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));

    const dialog = screen.getByRole("dialog", { name: "Eliminar oportunidad" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Eliminar oportunidad" }));

    expect(await within(dialog).findByText("No se pudo borrar la oportunidad")).toBeInTheDocument();
    expect(mockState.navigate).not.toHaveBeenCalled();
  });
});
