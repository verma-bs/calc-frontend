import { Delete } from "lucide-react";
import { ReactNode } from "react";
import { Operator } from "@/api/calculator";
import { CalcKey, KeyVariant } from "./CalcKey";
import { useCalculator } from "@/hooks/useCalculator";

type Calc = ReturnType<typeof useCalculator>;

interface KeyDef {
  label: ReactNode;
  variant: KeyVariant;
  testId: string;
  action: () => void;
  op?: Operator;
  aria?: string;
}

const Exponent = () => (
  <span className="exp-label">x<sup>y</sup></span>
);

export const Keypad = ({ calc }: { calc: Calc }) => {
  const d = (n: string): KeyDef => ({ label: n, variant: "number", testId: `key-${n}`, action: () => calc.inputDigit(n) });
  const o = (op: Operator, label: ReactNode, testId: string, aria: string): KeyDef => ({ label, variant: op === "^" ? "function" : "operator", testId, op, aria, action: () => calc.chooseOperator(op) });

  const keys: KeyDef[] = [
    { label: "AC", variant: "function", testId: "key-clear", action: calc.clear, aria: "Clear" },
    o("^", <Exponent />, "key-exponent", "Exponent"),
    { label: "%", variant: "function", testId: "key-percent", action: calc.percent, aria: "Percent" },
    o("÷", "÷", "key-divide", "Divide"),
    d("7"), d("8"), d("9"), o("×", "×", "key-multiply", "Multiply"),
    d("4"), d("5"), d("6"), o("-", "−", "key-subtract", "Subtract"),
    d("1"), d("2"), d("3"), o("+", "+", "key-add", "Add"),
    { label: ".", variant: "number", testId: "key-decimal", action: calc.inputDot, aria: "Decimal" },
    d("0"),
    { label: <Delete size={22} strokeWidth={1.8} />, variant: "number", testId: "key-backspace", action: calc.backspace, aria: "Backspace" },
    { label: "=", variant: "operator", testId: "key-equals", action: calc.equals, aria: "Equals" },
  ];

  return (
    <div className="keypad" data-testid="calculator-keypad">
      {keys.map((k) => (
        <CalcKey key={k.testId} label={k.label} variant={k.variant} testId={k.testId} onPress={k.action} ariaLabel={k.aria} active={!!k.op && calc.activeOp === k.op} />
      ))}
    </div>
  );
};
