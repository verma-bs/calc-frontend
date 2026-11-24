export type Operator = "+" | "-" | "×" | "÷" | "^";

export interface CalculateResponse {
  result: number | null;
  error?: string;
}

export const CALCULATE_ENDPOINT = "/api/v1/calculate";

export async function calculate(expression: string): Promise<CalculateResponse> {
  try {
    const response = await fetch(CALCULATE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expression }),
    });
    const payload = await response.json() as { result?: unknown; error?: unknown };

    if (!response.ok) {
      return {
        result: null,
        error: typeof payload.error === "string" ? payload.error : `Calculation failed (${response.status})`,
      };
    }
    if (typeof payload.result !== "number" || !Number.isFinite(payload.result)) {
      return { result: null, error: "Calculator service returned an invalid result" };
    }
    return { result: payload.result };
  } catch {
    return { result: null, error: "Unable to reach calculator service" };
  }
}
