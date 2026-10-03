type WordPart = "co" | "lab" | "me";

interface ColabMeWordPartProps {
  part: WordPart;
  className?: string;
  title?: string;
}

const LABELS: Record<WordPart, string> = {
  co: "Co",
  lab: "lab",
  me: "Me",
};

/**
 * Fragment stilizat din wordmark-ul ColabMe (Co / lab / Me), colorat via CSS mask.
 */
export default function ColabMeWordPart({
  part,
  className = "",
  title,
}: ColabMeWordPartProps) {
  const label = title ?? LABELS[part];
  return (
    <span
      className={`colabme-part colabme-part--${part} ${className}`.trim()}
      role="img"
      aria-label={label}
      title={label}
    />
  );
}
