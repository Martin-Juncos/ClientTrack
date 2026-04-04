import { describe, expect, it } from "vitest";
import { setValueAtPath } from "../src/lib/utils/objectPaths.js";

describe("setValueAtPath", () => {
  it("actualiza rutas anidadas sin mutar el objeto original", () => {
    const original = {
      socials: {
        linkedin: ""
      }
    };

    const updated = setValueAtPath(original, "socials.linkedin", "https://linkedin.com/company/demo");

    expect(updated.socials.linkedin).toBe("https://linkedin.com/company/demo");
    expect(original.socials.linkedin).toBe("");
  });
});
