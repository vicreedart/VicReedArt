import { describe, it, expect } from "vitest";
import { assertTargets } from "../scripts/targets.mjs";
import { assertSanityTarget } from "../studio/sanity-target";
import { readFileSync } from "node:fs";
import { parse, type ParseError } from "jsonc-parser";
const account = "96beea4cdf2cb1c69115c88264af1c01";
describe("deployment ownership", () => {
  it("supports authenticated HTTPS checkout URLs without broadening the repository", () => {
    expect(() =>
      assertTargets(
        "https://x-access-token:example-build-credential@github.com/vicreedart/VicReedArt.git/",
        account,
        account,
      ),
    ).not.toThrow();
    expect(() =>
      assertTargets(
        "https://github.com@another-host.test/vicreedart/VicReedArt.git",
        account,
        account,
      ),
    ).toThrow();
  });
  it("accepts the checked-in Cloudflare JSONC configuration and artist account", () => {
    const errors: ParseError[] = [];
    const config = parse(readFileSync("wrangler.jsonc", "utf8"), errors, {
      allowTrailingComma: true,
    });
    expect(errors).toEqual([]);
    expect(() =>
      assertTargets(
        "https://github.com/vicreedart/VicReedArt.git",
        config.account_id,
      ),
    ).not.toThrow();
    expect(config.env.preview.name).toBe("vicreedart-preview");
  });
  it("allows only the agreed repository and account", () =>
    expect(() =>
      assertTargets(
        "https://github.com/vicreedart/VicReedArt.git",
        account,
        account,
      ),
    ).not.toThrow());
  it("refuses a developer-owned repository", () =>
    expect(() =>
      assertTargets(
        "https://github.com/brendanmreed23/VicReedArt.git",
        account,
        account,
      ),
    ).toThrow());
  it("refuses an unrelated repository under the artist account", () =>
    expect(() =>
      assertTargets(
        "https://github.com/vicreedart/Other.git",
        account,
        account,
      ),
    ).toThrow());
  it("refuses a different account in the deployment configuration", () =>
    expect(() =>
      assertTargets(
        "https://github.com/vicreedart/VicReedArt.git",
        "other",
        undefined,
      ),
    ).toThrow());
  it("refuses a conflicting account environment variable", () =>
    expect(() =>
      assertTargets(
        "https://github.com/vicreedart/VicReedArt.git",
        account,
        "other",
      ),
    ).toThrow());
});

describe("Sanity ownership", () => {
  it("allows the artist’s verified project and dataset", () =>
    expect(() => assertSanityTarget("oifmrrva", "production")).not.toThrow());
  it.each([
    ["another-project", "production"],
    ["oifmrrva", "another-dataset"],
    [undefined, undefined],
  ])("refuses unapproved CMS destination %s/%s", (project, dataset) =>
    expect(() => assertSanityTarget(project, dataset)).toThrow(),
  );
});
