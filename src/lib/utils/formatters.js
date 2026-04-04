import { getCatalogLabel, institutionTypes, interestLevels, opportunityStates, priorityOptions, solutionTypes, taskStatuses } from "@shared/catalogs.js";

export function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date));
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value));
}

export const formatInstitutionType = (value) => getCatalogLabel(institutionTypes, value);
export const formatOpportunityState = (value) => getCatalogLabel(opportunityStates, value);
export const formatSolutionType = (value) => getCatalogLabel(solutionTypes, value);
export const formatPriority = (value) => getCatalogLabel(priorityOptions, value);
export const formatInterest = (value) => getCatalogLabel(interestLevels, value);
export const formatTaskStatus = (value) => getCatalogLabel(taskStatuses, value);
