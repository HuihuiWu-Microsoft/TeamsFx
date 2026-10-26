// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { afterEach, describe, expect, it, vi } from "vitest";
import { FeatureFlagName } from "../../src/common/featureFlags";
import { getAppIdEnvName, resolveAppResourceId } from "../../src/component/utils/appIdentity";
import { Validator } from "../../src/component/configManager/validator";

const resourceId = "11111111-1111-4111-8111-111111111111";
const manifestId = "22222222-2222-4222-8222-222222222222";

afterEach(() => vi.unstubAllEnvs());

describe("DP identity compatibility", () => {
  it("AC-03: falls back to the legacy ID without modifying environment state", () => {
    const env = { APP_ID: "", TEAMS_APP_ID: resourceId };
    expect(resolveAppResourceId(env)._unsafeUnwrap()).toBe(resourceId);
    expect(env).toEqual({ APP_ID: "", TEAMS_APP_ID: resourceId });
  });

  it("AC-04: honors custom mappings then canonical precedence", () => {
    const env = { CUSTOM_ID: manifestId, APP_ID: resourceId, TEAMS_APP_ID: manifestId };
    expect(resolveAppResourceId(env, "CUSTOM_ID")._unsafeUnwrap()).toBe(manifestId);
    expect(resolveAppResourceId(env)._unsafeUnwrap()).toBe(resourceId);
    expect(getAppIdEnvName({ appId: "CUSTOM_ID" })).toBe("CUSTOM_ID");
    expect(getAppIdEnvName({ teamsAppId: "LEGACY_CUSTOM" })).toBe("LEGACY_CUSTOM");
  });

  it("AC-04: does not hide an invalid selected ID with a valid fallback", () => {
    expect(resolveAppResourceId({ APP_ID: "invalid", TEAMS_APP_ID: resourceId }).isErr()).toBe(
      true
    );
  });

  it("AC-15: rejects split-ID state with the new API disabled", () => {
    vi.stubEnv(FeatureFlagName.NewDeveloperPortalApis, "false");
    const result = resolveAppResourceId({ APP_ID: resourceId, APP_MANIFEST_ID: manifestId });
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.message).toContain("TEAMSFX_NEW_DP_APIS");
  });

  it("AC-17: never uses the manifest as a missing split-ID resource", () => {
    vi.stubEnv(FeatureFlagName.NewDeveloperPortalApis, "true");
    expect(
      resolveAppResourceId({ APP_MANIFEST_ID: manifestId }, undefined, manifestId).isErr()
    ).toBe(true);
    expect(resolveAppResourceId({}, undefined, manifestId)._unsafeUnwrap()).toBe(manifestId);
    expect(
      resolveAppResourceId(
        { APP_ID: resourceId, APP_MANIFEST_ID: manifestId },
        undefined,
        manifestId
      )._unsafeUnwrap()
    ).toBe(resourceId);
  });
});

describe("teamsApp/create schema compatibility", () => {
  const validator = new Validator();
  for (const version of validator.supportedVersions()) {
    it(`AC-01: accepts either output key and rejects ambiguity in ${version}`, () => {
      const document = (output: Record<string, string>) => ({
        version,
        provision: [
          { uses: "teamsApp/create", with: { name: "example" }, writeToEnvironmentFile: output },
        ],
      });
      expect(validator.validate(document({ appId: "APP_ID" }), version)).toBe(true);
      expect(validator.validate(document({ teamsAppId: "TEAMS_APP_ID" }), version)).toBe(true);
      expect(
        validator.validate(document({ appId: "APP_ID", teamsAppId: "TEAMS_APP_ID" }), version)
      ).toBe(false);
      expect(validator.validate(document({}), version)).toBe(false);
    });
  }
});
