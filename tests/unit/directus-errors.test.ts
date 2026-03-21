import { describe, it, expect } from "vitest";
import {
  classifyDirectusError,
  type DirectusErrorInfo,
} from "@/lib/services/directus/errors";

describe("classifyDirectusError", () => {
  // -----------------------------------------------------------------------
  // HTTP Status Code Classification
  // -----------------------------------------------------------------------

  describe("HTTP status code errors", () => {
    it("classifies 401 as authentication_error", () => {
      const result = classifyDirectusError({ status: 401 });
      expect(result.type).toBe("authentication_error");
      expect(result.statusCode).toBe(401);
    });

    it("classifies 403 as authentication_error", () => {
      const result = classifyDirectusError({ status: 403 });
      expect(result.type).toBe("authentication_error");
      expect(result.statusCode).toBe(403);
    });

    it("classifies 404 as not_found", () => {
      const result = classifyDirectusError({ status: 404 });
      expect(result.type).toBe("not_found");
      expect(result.statusCode).toBe(404);
    });

    it("classifies 400 as validation_error", () => {
      const result = classifyDirectusError({ status: 400 });
      expect(result.type).toBe("validation_error");
      expect(result.statusCode).toBe(400);
    });

    it("classifies 422 as validation_error", () => {
      const result = classifyDirectusError({ status: 422 });
      expect(result.type).toBe("validation_error");
      expect(result.statusCode).toBe(422);
    });

    it("classifies 500 as server_error", () => {
      const result = classifyDirectusError({ status: 500 });
      expect(result.type).toBe("server_error");
      expect(result.statusCode).toBe(500);
    });

    it("classifies 502 as server_error", () => {
      const result = classifyDirectusError({ status: 502 });
      expect(result.type).toBe("server_error");
      expect(result.statusCode).toBe(502);
    });

    it("reads statusCode property as fallback", () => {
      const result = classifyDirectusError({ statusCode: 404 });
      expect(result.type).toBe("not_found");
    });

    it("preserves the original error object", () => {
      const original = { status: 500, message: "Internal Server Error" };
      const result = classifyDirectusError(original);
      expect(result.originalError).toBe(original);
    });
  });

  // -----------------------------------------------------------------------
  // Network Error Classification
  // -----------------------------------------------------------------------

  describe("network errors", () => {
    it("classifies ECONNREFUSED as network_error", () => {
      const result = classifyDirectusError(
        new Error("connect ECONNREFUSED 127.0.0.1:8055")
      );
      expect(result.type).toBe("network_error");
      expect(result.message).toContain("ECONNREFUSED");
    });

    it("classifies ETIMEDOUT as network_error", () => {
      const result = classifyDirectusError(new Error("connect ETIMEDOUT"));
      expect(result.type).toBe("network_error");
    });

    it("classifies fetch errors as network_error", () => {
      const result = classifyDirectusError(new Error("fetch failed"));
      expect(result.type).toBe("network_error");
    });

    it("classifies generic network errors as network_error", () => {
      const result = classifyDirectusError(new Error("network error"));
      expect(result.type).toBe("network_error");
    });
  });

  // -----------------------------------------------------------------------
  // Unknown Error Classification
  // -----------------------------------------------------------------------

  describe("unknown errors", () => {
    it("classifies plain Error as unknown_error", () => {
      const result = classifyDirectusError(new Error("Something went wrong"));
      expect(result.type).toBe("unknown_error");
      expect(result.message).toBe("Something went wrong");
    });

    it("classifies non-Error objects as unknown_error", () => {
      const result = classifyDirectusError("string error");
      expect(result.type).toBe("unknown_error");
      expect(result.message).toBe("Unknown error occurred");
    });

    it("classifies null as unknown_error", () => {
      const result = classifyDirectusError(null);
      expect(result.type).toBe("unknown_error");
    });

    it("classifies undefined as unknown_error", () => {
      const result = classifyDirectusError(undefined);
      expect(result.type).toBe("unknown_error");
    });
  });

  // -----------------------------------------------------------------------
  // Return Shape
  // -----------------------------------------------------------------------

  describe("return shape", () => {
    it("always returns type, message, and originalError", () => {
      const error = new Error("test");
      const result: DirectusErrorInfo = classifyDirectusError(error);

      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("message");
      expect(result).toHaveProperty("originalError");
    });

    it("includes statusCode only for HTTP errors", () => {
      const httpResult = classifyDirectusError({ status: 500 });
      expect(httpResult.statusCode).toBe(500);

      const networkResult = classifyDirectusError(new Error("ECONNREFUSED"));
      expect(networkResult.statusCode).toBeUndefined();
    });
  });
});
