import { Fragment } from "react";
import { getPart } from "../logic/parts";
import ComponentIcon from "./ComponentIcon";

/**
 * Text din lecții cu mici desene în rând, ca elevul să recunoască ce vede pe masă:
 *   {+} {-} {A} {B} {C} {W}  → bulinele bornelor, cu aceleași culori ca pe schemă
 *   {battery-9v}, {led-red}…  → iconița piesei din catalog
 * Paragrafele se despart printr-un rând gol.
 */

const TERMINAL_TOKENS: Record<string, { label: string; kind: string; name: string }> = {
  "+": { label: "+", kind: "plus", name: "borna plus" },
  "-": { label: "−", kind: "minus", name: "borna minus" },
  A: { label: "A", kind: "neutral", name: "borna A" },
  B: { label: "B", kind: "neutral", name: "borna B" },
  C: { label: "C", kind: "neutral", name: "borna C" },
  W: { label: "W", kind: "neutral", name: "borna W" },
};

const TOKEN = /\{([^{}]+)\}/g;

/** Marcajele dintr-un text care nu trimit nicăieri (pentru teste). */
export function unknownRichTokens(text: string): string[] {
  return [...text.matchAll(TOKEN)].map((m) => m[1]).filter((t) => !TERMINAL_TOKENS[t] && !getPart(t));
}

function renderInline(text: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const token = m[1];
    const terminal = TERMINAL_TOKENS[token];
    const part = terminal ? undefined : getPart(token);
    if (terminal) {
      out.push(
        <span
          key={at}
          className={`circuit-inline-terminal circuit-inline-terminal--${terminal.kind}`}
          role="img"
          aria-label={terminal.name}
        >
          {terminal.label}
        </span>,
      );
    } else if (part) {
      out.push(
        <span key={at} className="circuit-inline-icon" aria-hidden="true">
          <ComponentIcon part={part} />
        </span>,
      );
    } else {
      out.push(m[0]);
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Același text, fără desene (ex. pentru titluri sau etichete de accesibilitate). */
export function plainRichText(text: string): string {
  return text.replace(TOKEN, (_, token: string) => TERMINAL_TOKENS[token]?.label ?? "").replace(/\s+/g, " ").trim();
}

export function RichInline({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <Fragment key={i}>
          <p>{renderInline(p)}</p>
        </Fragment>
      ))}
    </>
  );
}
