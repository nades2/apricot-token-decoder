import { describe, it, expect } from "vitest";
import { diffPayloads, countDifferences } from "../diff";

describe("diffPayloads", () => {
  const a = { iss: "x", sub: "user-42", scope: "openid profile", email: "j@x.com" };
  const b = { iss: "x", sub: "user-99", scope: "openid profile email", roles: ["admin"] };
  const rows = diffPayloads(a, b);
  it("compte les différences", () => {
    expect(countDifferences(rows)).toBe(4);
  });
  it("repère changed/added/removed/same", () => {
    const byPath = Object.fromEntries(rows.map((r) => [r.path, r.status]));
    expect(byPath.sub).toBe("changed");
    expect(byPath.roles).toBe("added");
    expect(byPath.email).toBe("removed");
    expect(byPath.iss).toBe("same");
  });
});
