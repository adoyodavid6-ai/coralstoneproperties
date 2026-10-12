import { describe, expect, it } from "vitest";
import { validateSocialUrl } from "./social";

describe("validateSocialUrl", () => {
  it("allows blank (not set yet)", () => {
    expect(validateSocialUrl("tiktok", "  ")).toEqual({ url: "" });
  });

  it("accepts https links on the platform's domain, including subdomains", () => {
    expect(validateSocialUrl("tiktok", "https://www.tiktok.com/@coralstones")).toEqual({
      url: "https://www.tiktok.com/@coralstones",
    });
    expect(validateSocialUrl("youtube", "https://youtu.be/abc")).toHaveProperty("url");
    expect(validateSocialUrl("linkedin", "https://ke.linkedin.com/company/x")).toHaveProperty("url");
  });

  it("rejects other domains, look-alike domains, http and non-URLs", () => {
    expect(validateSocialUrl("instagram", "https://example.com/coralstones")).toHaveProperty("error");
    expect(validateSocialUrl("instagram", "https://notinstagram.com/x")).toHaveProperty("error");
    expect(validateSocialUrl("youtube", "http://www.youtube.com/@x")).toHaveProperty("error");
    expect(validateSocialUrl("tiktok", "@coralstones")).toHaveProperty("error");
    expect(validateSocialUrl("linkedin", "javascript:alert(1)")).toHaveProperty("error");
  });
});
