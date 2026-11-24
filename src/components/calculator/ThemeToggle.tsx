import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    data-testid="theme-toggle"
    aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    onClick={onToggle}
    className="theme-toggle"
  >
    <span className="theme-toggle__icon">{theme === "light" && <Sun size={16} strokeWidth={2.2} />}</span>
    <span className="theme-toggle__icon">{theme === "dark" && <Moon size={16} strokeWidth={2.2} />}</span>
    <span className={`theme-toggle__thumb theme-toggle__thumb--${theme}`} />
  </button>
);
