import { describe, expect, it } from "vitest";
import { parseConfirmLink } from "./authRecovery";

describe("parseConfirmLink", () => {
  it("acceptă linkurile de confirmare și resetare", () => {
    expect(parseConfirmLink("?token_hash=abc&type=signup")).toEqual({
      tokenHash: "abc",
      type: "signup",
    });
    expect(parseConfirmLink("?type=recovery&token_hash=xyz")).toEqual({
      tokenHash: "xyz",
      type: "recovery",
    });
  });

  it("respinge linkuri incomplete sau cu alt tip", () => {
    expect(parseConfirmLink("")).toBeNull();
    expect(parseConfirmLink("?type=signup")).toBeNull();
    expect(parseConfirmLink("?token_hash=abc")).toBeNull();
    expect(parseConfirmLink("?token_hash=abc&type=magiclink")).toBeNull();
    expect(parseConfirmLink("?token_hash=%20&type=recovery")).toBeNull();
  });
});
