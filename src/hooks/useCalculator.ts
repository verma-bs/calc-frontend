import { useCallback, useEffect, useRef, useState } from "react";
import { calculate, CalculateResponse, Operator } from "@/api/calculator";

interface CalcState {
  nums: string[];
  ops: Operator[];
  justEvaluated: boolean;
}

const initial: CalcState = { nums: ["0"], ops: [], justEvaluated: false };
const infixOperators: Record<Operator, string> = {
  "+": "+",
  "-": "-",
  "×": "*",
  "÷": "/",
  "^": "^",
};

export const opLabel = (op: Operator) => (op === "-" ? "−" : op);

export const formatNumber = (raw: string): string => {
  if (raw === "" || raw === "-") return raw || "0";
  const neg = raw.startsWith("-");
  const [int, dec] = raw.replace("-", "").split(".");
  const grouped = Number(int).toLocaleString("en-US");
  return `${neg ? "-" : ""}${grouped}${dec !== undefined ? "." + dec : ""}`;
};

const toRaw = (n: number) => (Math.abs(n) >= 1e15 || (n !== 0 && Math.abs(n) < 1e-9) ? n.toExponential(6).replace(/\.?0+e/, "e") : String(n));
const fmt = (n: number) => { const r = toRaw(n); return r.includes("e") ? r : formatNumber(r); };

// After "=", continue from the result (or start fresh when result is null).
const fromResult = (p: CalcState, result: number | null): CalcState => {
  if (!p.justEvaluated) return p;
  return result !== null ? { nums: [toRaw(result)], ops: [], justEvaluated: false } : initial;
};

const editCurrent = (fn: (cur: string | undefined) => string | null) => (prev: CalcState): CalcState => {
  const p = fromResult(prev, null);
  const hasCurrent = p.nums.length > p.ops.length;
  const next = fn(hasCurrent ? p.nums[p.nums.length - 1] : undefined);
  if (next === null) return p;
  const nums = hasCurrent ? [...p.nums.slice(0, -1), next] : [...p.nums, next];
  return { ...p, nums };
};

export function useCalculator() {
  const [s, setS] = useState<CalcState>(initial);
  const [res, setRes] = useState<CalculateResponse>({ result: 0 });
  const [loading, setLoading] = useState(false);
  const resRef = useRef(res);
  resRef.current = res;

  useEffect(() => {
    if (s.nums.length <= s.ops.length) {
      setLoading(false);
      return;
    }

    const numbers = s.nums.map(Number);
    const operators = s.ops.slice(0, numbers.length - 1);
    if (operators.length === 0) {
      setRes({ result: numbers[0] });
      setLoading(false);
      return;
    }
    const expression = s.nums
      .slice(0, operators.length + 1)
      .map((number, index) => `${number}${operators[index] ? infixOperators[operators[index]] : ""}`)
      .join("");

    let cancelled = false;
    setLoading(true);
    const timeout = window.setTimeout(() => {
      calculate(expression).then((r) => {
        if (cancelled) return;
        setRes(r);
        setLoading(false);
      });
    }, 150);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [s.nums, s.ops]);

  const inputDigit = useCallback((d: string) => {
    setS(editCurrent((cur) => (cur === undefined || cur === "0" ? d : cur.replace(/[-.]/g, "").length >= 15 ? null : cur + d)));
  }, []);

  const inputDot = useCallback(() => {
    setS((prev) => {
      const p = fromResult(prev, resRef.current.result);
      const hasCurrent = p.nums.length > p.ops.length;
      const current = hasCurrent ? p.nums[p.nums.length - 1] : undefined;
      const next = current === undefined ? "0." : current.includes(".") || current.includes("e") ? null : current + ".";
      if (next === null) return p;
      const nums = hasCurrent ? [...p.nums.slice(0, -1), next] : [...p.nums, next];
      return { ...p, nums };
    });
  }, []);

  const clear = useCallback(() => setS(initial), []);

  const backspace = useCallback(() => {
    setS((p) => {
      const current = fromResult(p, resRef.current.result);
      if (current.nums.length === current.ops.length) {
        return { ...current, ops: current.ops.slice(0, -1) };
      }
      const value = current.nums[current.nums.length - 1].slice(0, -1);
      if (value !== "" && value !== "-") {
        return { ...current, nums: [...current.nums.slice(0, -1), value] };
      }
      return current.nums.length === 1
        ? initial
        : { ...current, nums: current.nums.slice(0, -1) };
    });
  }, []);

  const percent = useCallback(() => {
    setS((prev) => {
      const p = fromResult(prev, resRef.current.result);
      if (p.nums.length === p.ops.length) return p;
      const cur = Number(p.nums[p.nums.length - 1]);
      return { ...p, nums: [...p.nums.slice(0, -1), toRaw(parseFloat((cur / 100).toPrecision(12)))] };
    });
  }, []);

  const chooseOperator = useCallback((op: Operator) => {
    setS((prev) => {
      if (prev.justEvaluated && resRef.current.result === null) return prev;
      const p = fromResult(prev, resRef.current.result);
      if (p.nums.length === p.ops.length) return { ...p, ops: [...p.ops.slice(0, -1), op] };
      return { ...p, ops: [...p.ops, op] };
    });
  }, []);

  const equals = useCallback(() => {
    setS((p) => {
      if (p.justEvaluated || p.ops.length === 0) return p;
      const ops = p.nums.length === p.ops.length ? p.ops.slice(0, -1) : p.ops;
      return { ...p, ops, justEvaluated: true };
    });
  }, []);

  const expression = s.nums.length === 1 && s.nums[0] === "0" && s.ops.length === 0
    ? ""
    : s.nums.map((n, i) => `${n.includes("e") ? n : formatNumber(n)}${s.ops[i] ? opLabel(s.ops[i]) : ""}`).join("");
  const history = s.justEvaluated ? "" : expression;
  const display = res.result === null ? res.error ?? "Error" : fmt(res.result);
  const activeOp = s.nums.length === s.ops.length ? s.ops[s.ops.length - 1] : null;

  return { display, history, activeOp, isError: res.result === null, evaluated: s.justEvaluated, loading, inputDigit, inputDot, clear, backspace, percent, chooseOperator, equals };
}
