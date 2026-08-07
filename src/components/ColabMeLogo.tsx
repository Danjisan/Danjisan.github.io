interface ColabMeLogoProps {
  className?: string;
  title?: string;
}

/**
 * Logo wordmark pe fond alb → colorat via CSS mask (orice culoare / gradient).
 */
export default function ColabMeLogo({
  className = "",
  title = "ColabMe",
}: ColabMeLogoProps) {
  return (
    <span
      className={`colabme-logo ${className}`.trim()}
      role="img"
      aria-label={title}
      title={title}
    />
  );
}
