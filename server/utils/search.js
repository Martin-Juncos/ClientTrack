function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function createSafeSearchRegex(search) {
  const normalizedSearch = String(search ?? "").trim();

  if (!normalizedSearch) {
    return null;
  }

  return new RegExp(escapeRegex(normalizedSearch), "i");
}
