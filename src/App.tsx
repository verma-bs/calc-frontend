import { useEffect, useState } from "react";
import "@/App.css";
import { Display } from "@/components/calculator/Display";
import { Keypad } from "@/components/calculator/Keypad";
import { ThemeToggle } from "@/components/calculator/ThemeToggle";
import { useCalculator } from "@/hooks/useCalculator";
import { Operator } from "@/api/calculator";

type Theme = "light" | "dark";

const KEY_OPS: Record<string, Operator> = { "+": "+", "-": "-", "*": "×", "/": "÷", "^": "^" };

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("calc-theme") as Theme) || "dark");
  const calc = useCalculator();

  useEffect(() => localStorage.setItem("calc-theme", theme), [theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) calc.inputDigit(e.key);
      else if (e.key === ".") calc.inputDot();
      else if (KEY_OPS[e.key]) calc.chooseOperator(KEY_OPS[e.key]);
      else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); calc.equals(); }
      else if (e.key === "Backspace") calc.backspace();
      else if (e.key === "Escape") calc.clear();
      else if (e.key === "%") calc.percent();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [calc]);

  return (
    <main className={`calc-app theme-${theme}`} data-testid="calculator-app">
      <div className="calc-shell">
        <div className="calc-top">
          <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
        </div>
        <Display history={calc.history} value={calc.display} isError={calc.isError} loading={calc.loading} />
        <Keypad calc={calc} />
        <div className="home-indicator" />
      </div>
    </main>
  );
}
