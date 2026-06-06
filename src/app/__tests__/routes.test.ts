import { describe, it, expect } from "vitest";
import { algorithmsList } from "../../data/algorithms_content";

describe("Route validation checks", () => {
  it("every module ID is a valid URL slug", () => {
    for (const mod of algorithmsList) {
      expect(mod.id).toMatch(/^[a-z0-9-]+$/);
      expect(mod.id.length).toBeGreaterThan(0);
      expect(mod.id.length).toBeLessThan(100);
    }
  });

  it("no two modules share the same ID", () => {
    const ids = algorithmsList.map(m => m.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });
});
