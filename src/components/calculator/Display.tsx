interface DisplayProps {
  history: string;
  value: string;
  isError: boolean;
  loading: boolean;
}

export const Display = ({ history, value, isError, loading }: DisplayProps) => {
  const size = value.length > 12 ? "display__value--xs" : value.length > 8 ? "display__value--sm" : "";
  return (
    <div className="display" data-testid="calculator-display">
      <div className="display__history" data-testid="display-history">{history || "\u00A0"}</div>
      <div
        className={`display__value ${size} ${isError ? "display__value--error" : ""} ${loading ? "display__value--loading" : ""}`}
        data-testid="display-value"
      >
        {value}
      </div>
    </div>
  );
};
