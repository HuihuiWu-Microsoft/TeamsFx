// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { AppResponse } from "../../client/devPortalModels";
import { AppDefinition } from "../driver/teamsApp/interfaces/appdefinitions/appDefinition";

/** App response from either the legacy or current Developer Portal API. */
export type DevPortalAppResponse = AppDefinition | AppResponse;

export function getAppResourceId(app: DevPortalAppResponse): string | undefined {
  return "appProfile" in app ? app.appId : app.teamsAppId;
}

export function getAppManifestId(app: DevPortalAppResponse): string | undefined {
  return "appProfile" in app
    ? (app.appProfile?.appDetails?.applicationManifest?.id ?? undefined)
    : (app.appId ?? app.teamsAppId);
}

// Capability questions need a small common view, not a legacy response conversion.
export function getAppCapabilities(app?: DevPortalAppResponse) {
  if (app && "appProfile" in app) {
    const manifest = app.appProfile?.appDetails?.applicationManifest;
    return {
      appName: manifest?.name?.short ?? undefined,
      bots: manifest?.bots ?? undefined,
      staticTabs: manifest?.staticTabs ?? undefined,
      configurableTabs: manifest?.configurableTabs ?? undefined,
      messagingExtensions: manifest?.composeExtensions ?? undefined,
      meetingExtensionDefinition: manifest?.meetingExtensionDefinition ?? undefined,
      connectors: manifest?.connectors ?? undefined,
      activities: manifest?.activities ?? undefined,
      supportsChannelFeatures: manifest?.supportsChannelFeatures ?? undefined,
    };
  }
  return {
    appName: app?.appName,
    bots: app?.bots,
    staticTabs: app?.staticTabs,
    configurableTabs: app?.configurableTabs,
    messagingExtensions: app?.messagingExtensions,
    meetingExtensionDefinition: app?.meetingExtensionDefinition,
    connectors: app?.connectors,
    activities: app?.activities,
    supportsChannelFeatures: app?.supportsChannelFeatures,
  };
}
