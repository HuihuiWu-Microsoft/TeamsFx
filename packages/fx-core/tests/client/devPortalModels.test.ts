// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import type { TeamsManifest } from "@microsoft/teamsfx-api";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { AppResponse } from "../../src/client/devPortalModels";
import { getAppCapabilities, getAppManifestId } from "../../src/component/utils/appInfo";

type DraftManifest = NonNullable<
  NonNullable<NonNullable<AppResponse["appProfile"]>["appDetails"]>["applicationManifest"]
>;

describe("shared Developer Portal manifest types", () => {
  it("AC-05: derives draft fields from every supported manifest version", () => {
    expectTypeOf<TeamsManifest>().toExtend<DraftManifest>();
    expectTypeOf<{
      manifestVersion: "1.30";
      name: { short: null };
      bots: [{ botId: null }];
      copilotAgents: { declarativeAgents: [{ file: null }] };
    }>().toExtend<DraftManifest>();
    expectTypeOf<{ manifestVersion: "unsupported" }>().not.toExtend<DraftManifest>();
    expectTypeOf<{
      manifestVersion: "1.30";
      supportsChannelFeatures: "invalid";
    }>().not.toExtend<DraftManifest>();
    expectTypeOf<{ name: { short: number } }>().not.toExtend<DraftManifest>();
  });

  it("AC-05: reads incomplete and nullable nested drafts without requiring a complete manifest", () => {
    const app: AppResponse = {
      appId: "11111111-1111-4111-8111-111111111111",
      appProfile: {
        appDetails: {
          applicationManifest: {
            id: "22222222-2222-4222-8222-222222222222",
            manifestVersion: "1.30",
            name: { short: null },
            bots: [{ botId: null, scopes: null }],
            activities: { activityTypes: [{ description: null }] },
            meetingExtensionDefinition: null,
            supportsChannelFeatures: "tier1",
          },
        },
      },
    };
    expect(getAppManifestId(app)).toBe("22222222-2222-4222-8222-222222222222");
    expect(getAppCapabilities(app)).toMatchObject({
      appName: undefined,
      bots: [{ botId: null, scopes: null }],
      activities: { activityTypes: [{ description: null }] },
      meetingExtensionDefinition: undefined,
      supportsChannelFeatures: "tier1",
    });
  });

  it("AC-05: older draft versions omit capabilities introduced by later schemas", () => {
    const app: AppResponse = {
      appId: "11111111-1111-4111-8111-111111111111",
      appProfile: {
        appDetails: {
          applicationManifest: {
            manifestVersion: "1.0",
            name: { short: "Older app" },
          },
        },
      },
    };
    expect(getAppCapabilities(app)).toMatchObject({
      appName: "Older app",
      activities: undefined,
      meetingExtensionDefinition: undefined,
      supportsChannelFeatures: undefined,
    });
  });
});
