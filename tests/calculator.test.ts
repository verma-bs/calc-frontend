import { afterEach, describe, expect, it, vi } from "vitest";
import { calculate, CALCULATE_ENDPOINT } from "../src/api/calculator";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("calculate API client", () => {
	it("posts the infix expression and returns the numeric result", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ result: 3 }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(calculate("1+2")).resolves.toEqual({ result: 3 });
		expect(fetchMock).toHaveBeenCalledWith(CALCULATE_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ expression: "1+2" }),
		});
	});

	it("returns the API error message for a rejected calculation", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ error: "division by zero" }), { status: 422 }),
		));

		await expect(calculate("1/0")).resolves.toEqual({
			result: null,
			error: "division by zero",
		});
	});

	it("uses a status-based message when an HTTP error has no API message", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
			new Response(JSON.stringify({}), { status: 503 }),
		));

		await expect(calculate("1+2")).resolves.toEqual({
			result: null,
			error: "Calculation failed (503)",
		});
	});

	it.each([null, "3", Number.POSITIVE_INFINITY])(
		"rejects an invalid success result (%s)",
		async (result) => {
			vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
				new Response(JSON.stringify({ result }), { status: 200 }),
			));

			await expect(calculate("1+2")).resolves.toEqual({
				result: null,
				error: "Calculator service returned an invalid result",
			});
		},
	);

	it("gracefully handles an unreadable JSON response", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
			new Response("not json", { status: 200 }),
		));

		await expect(calculate("1+2")).resolves.toEqual({
			result: null,
			error: "Unable to reach calculator service",
		});
	});

	it("gracefully handles a network failure", async () => {
		vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

		await expect(calculate("1+2")).resolves.toEqual({
			result: null,
			error: "Unable to reach calculator service",
		});
	});
});
