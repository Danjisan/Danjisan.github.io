interface CircuitFailureBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export default function CircuitFailureBanner({ message, onDismiss }: CircuitFailureBannerProps) {
  if (!message) return null;

  return (
    <div className="circuit-failure-banner" role="alert">
      <p>{message}</p>
      <button type="button" className="circuit-failure-banner-dismiss" onClick={onDismiss}>
        Am înțeles
      </button>
    </div>
  );
}
