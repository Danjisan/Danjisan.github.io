import { describe, expect, it } from "vitest";
import {
  describeAuthError,
  isAlreadyRegistered,
  isEmailNotConfirmed,
} from "./authErrors";

describe("authErrors", () => {
  it("recunoaște contul neconfirmat după cod sau mesaj", () => {
    expect(isEmailNotConfirmed({ code: "email_not_confirmed" })).toBe(true);
    expect(isEmailNotConfirmed({ message: "Email not confirmed" })).toBe(true);
    expect(isEmailNotConfirmed({ code: "invalid_credentials" })).toBe(false);
  });

  it("recunoaște emailul deja înregistrat", () => {
    expect(isAlreadyRegistered({ code: "user_already_exists" })).toBe(true);
    expect(isAlreadyRegistered({ message: "User already registered" })).toBe(true);
    expect(isAlreadyRegistered({ code: "weak_password" })).toBe(false);
  });

  it("la login nu dezvăluie dacă emailul există", () => {
    expect(describeAuthError({ code: "invalid_credentials" }, "login")).toBe(
      "Email sau parolă incorecte.",
    );
    expect(describeAuthError({ code: "user_not_found" }, "login")).toBe(
      "Email sau parolă incorecte.",
    );
  });

  it("traduce erorile frecvente", () => {
    expect(describeAuthError({ status: 429 }, "signup")).toMatch(/Prea multe/);
    expect(
      describeAuthError({ code: "over_email_send_rate_limit" }, "resend"),
    ).toMatch(/Prea multe/);
    expect(describeAuthError({ code: "weak_password" }, "signup")).toMatch(
      /prea slabă/,
    );
    expect(
      describeAuthError({ code: "email_address_invalid" }, "signup"),
    ).toMatch(/nu e validă/);
    expect(
      describeAuthError({ name: "AuthRetryableFetchError" }, "login"),
    ).toMatch(/conecta/);
  });

  it("are un mesaj implicit în română", () => {
    expect(describeAuthError({ message: "Something odd" }, "signup")).toBe(
      "Nu am putut crea contul. Încearcă din nou.",
    );
  });
});
