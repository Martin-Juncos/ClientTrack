import { describe, expect, it } from "vitest";
import { createSafeSearchRegex } from "../server/utils/search.js";

describe("createSafeSearchRegex", () => {
  it("escapa metacaracteres y no altera la semantica de busqueda literal", () => {
    const regex = createSafeSearchRegex(".*");

    expect(regex.test("texto con .* literal")).toBe(true);
    expect(regex.test("texto con comodin")).toBe(false);
  });

  it("tolera patrones invalidos sin romper la construccion del regex", () => {
    const regex = createSafeSearchRegex("[");

    expect(regex.test("[")).toBe(true);
    expect(regex.test("otra cosa")).toBe(false);
  });
});
