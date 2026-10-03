type WordPart = "co" | "lab" | "me";

interface ColabMeWordPartProps {
  part: WordPart;
  className?: string;
  title?: string;
  muted?: boolean;
}

const LABELS: Record<WordPart, string> = {
  co: "Co",
  lab: "lab",
  me: "Me",
};

const PARTS: WordPart[] = ["co", "lab", "me"];

/**
 * Fragment stilizat din wordmark-ul ColabMe (Co / lab / Me), colorat via CSS mask.
 */
export default function ColabMeWordPart({
  part,
  className = "",
  title,
  muted = false,
}: ColabMeWordPartProps) {
  const label = title ?? LABELS[part];
  return (
    <span
      className={`colabme-part colabme-part--${part}${muted ? " colabme-part--muted" : ""} ${className}`.trim()}
      role={muted ? undefined : "img"}
      aria-hidden={muted || undefined}
      aria-label={muted ? undefined : label}
      title={muted ? undefined : label}
    />
  );
}

interface ColabMeLogoFocusProps {
  active: WordPart;
  className?: string;
}

/**
 * Logo ColabMe complet, cu un singur segment activ și restul dark grey.
 */
export function ColabMeLogoFocus({
  active,
  className = "",
}: ColabMeLogoFocusProps) {
  return (
    <p
      className={`colabme-logo-focus ${className}`.trim()}
      aria-label={`ColabMe — ${LABELS[active]}`}
    >
      {PARTS.map((part) => (
        <ColabMeWordPart
          key={part}
          part={part}
          muted={part !== active}
          className="colabme-part--focus"
        />
      ))}
    </p>
  );
}
