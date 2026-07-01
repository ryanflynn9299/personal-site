import {
  sanitizeSVG,
  isValidSVG,
  getSVGTrustLevel,
  sanitizeSVGByTrustLevel,
  SVGTrustLevel,
} from "../../lib/site/svg-security";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("SVG Security Utilities", () => {
  const safeSVG =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="50" cy="50" r="40" fill="red"/>' +
    "</svg>";

  const evilScriptSVG =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<script>alert("XSS")</sc' +
    "ript>" +
    '<circle cx="50" cy="50" r="40" fill="red"/>' +
    "</svg>";

  const evilStyleSVG =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    '<style>@import "http://evil.com/xss.css";</style>' +
    '<circle cx="50" cy="50" r="40" fill="red"/>' +
    "</svg>";

  const evilHandlersSVG =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" onload="alert(\'XSS\')">' +
    '<circle cx="50" cy="50" r="40" fill="red" onclick="malicious()"/>' +
    "</svg>";

  const evilHrefSVG =
    '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
    "<a href=\"javascript:alert('XSS')\"><text>Click Me</text></a>" +
    "<image xlink:href=\"javascript:alert('XSS')\"/>" +
    "</svg>";

  describe("isValidSVG", () => {
    it("should return true for a safe SVG", () => {
      expect(isValidSVG(safeSVG)).toBe(true);
    });

    it("should return false for missing or invalid SVG wrappers", () => {
      expect(isValidSVG("<div>Not an SVG</div>")).toBe(false);
      expect(isValidSVG("")).toBe(false);
      expect(isValidSVG(null as unknown as string)).toBe(false);
    });

    it("should return false for dangerous patterns", () => {
      expect(isValidSVG(evilScriptSVG)).toBe(false);
      expect(isValidSVG(evilHandlersSVG)).toBe(false);
      expect(isValidSVG(evilHrefSVG)).toBe(false);
      expect(isValidSVG("<svg><iframe src='x'/></svg>")).toBe(false);
    });
  });

  describe("sanitizeSVG", () => {
    it("should keep safe SVGs mostly unchanged", () => {
      const result = sanitizeSVG(safeSVG);
      expect(result).not.toBeNull();
      expect(result).toContain("<circle cx=");
    });

    it("should remove <script> tags when required", () => {
      const result = sanitizeSVG(evilScriptSVG);
      expect(result).not.toContain("<script>");
      expect(result).toContain("<circle"); // rest is left intact
    });

    it("should remove <style> tags by default", () => {
      const result = sanitizeSVG(evilStyleSVG);
      expect(result).not.toContain("<style>");
    });

    it("should remove inline event handlers", () => {
      const result = sanitizeSVG(evilHandlersSVG);
      expect(result).not.toContain("onload=");
      expect(result).not.toContain("onclick=");
      expect(result).toContain('fill="red"');
    });

    it("should remove javascript protocol hrefs", () => {
      const result = sanitizeSVG(evilHrefSVG);
      expect(result).not.toContain("javascript:");
    });

    it("should respect options to keep certain elements (e.g. style)", () => {
      const result = sanitizeSVG(evilStyleSVG, { removeStyles: false });
      expect(result).toContain("<style>");
    });
  });

  describe("getSVGTrustLevel", () => {
    beforeEach(() => {
      // Stub window for browser context check
      (global as unknown as { window: unknown }).window = {
        location: { origin: "https://www.ryanflynn.org" },
      };
    });

    afterEach(() => {
      delete (global as unknown as { window?: unknown }).window;
    });

    it("should return TRUSTED for local files starting with /", () => {
      expect(getSVGTrustLevel("/images/logo.svg")).toBe(SVGTrustLevel.TRUSTED);
    });

    it("should return TRUSTED for same-origin URLs", () => {
      expect(getSVGTrustLevel("https://www.ryanflynn.org/logo.svg")).toBe(
        SVGTrustLevel.TRUSTED
      );
    });

    it("should return UNTRUSTED for external sources", () => {
      expect(getSVGTrustLevel("https://malicious.com/virus.svg")).toBe(
        SVGTrustLevel.UNTRUSTED
      );
    });

    it("should handle invalid URLs as untrusted when not local", () => {
      expect(getSVGTrustLevel("javascript:alert(1)")).toBe(
        SVGTrustLevel.UNTRUSTED
      );
    });
  });

  describe("sanitizeSVGByTrustLevel", () => {
    it("should not sanitize if TRUSTED and valid", () => {
      const result = sanitizeSVGByTrustLevel(safeSVG, SVGTrustLevel.TRUSTED);
      expect(result).toBe(safeSVG);
    });

    it("should return null if TRUSTED but horribly invalid", () => {
      const result = sanitizeSVGByTrustLevel(
        evilScriptSVG,
        SVGTrustLevel.TRUSTED
      );
      expect(result).toBeNull();
    });

    it("should selectively sanitize VALIDATED sources", () => {
      const result = sanitizeSVGByTrustLevel(
        evilStyleSVG,
        SVGTrustLevel.VALIDATED
      );
      expect(result).toContain("<style>");
    });

    it("should ruthlessly sanitize UNTRUSTED sources", () => {
      const result = sanitizeSVGByTrustLevel(
        evilStyleSVG,
        SVGTrustLevel.UNTRUSTED
      );
      expect(result).not.toContain("<style>");

      const result2 = sanitizeSVGByTrustLevel(
        evilHandlersSVG,
        SVGTrustLevel.UNTRUSTED
      );
      expect(result2).not.toContain("onclick=");
    });
  });
});
