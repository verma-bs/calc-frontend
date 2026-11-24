import { ReactNode } from "react";

export type KeyVariant = "number" | "function" | "operator";

interface CalcKeyProps {
  label: ReactNode;
  variant: KeyVariant;
  onPress: () => void;
  testId: string;
  active?: boolean;
  ariaLabel?: string;
}

export const CalcKey = ({ label, variant, onPress, testId, active, ariaLabel }: CalcKeyProps) => (
  <button
    type="button"
    data-testid={testId}
    aria-label={ariaLabel}
    onClick={onPress}
    className={`calc-key calc-key--${variant}${active ? " calc-key--active" : ""}`}
  >
    {label}
  </button>
);
