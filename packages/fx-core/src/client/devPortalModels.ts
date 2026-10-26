// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { validate as isUuid } from "uuid";

/** Developer Portal drafts can contain null or incomplete manifest sections. */
export interface DraftApplicationManifest {
  id?: string | null;
  manifestVersion?: string | null;
  version?: string | null;
  name?: { short?: string | null; full?: string | null } | null;
  description?: { short?: string | null; full?: string | null } | null;
  developer?: {
    name?: string | null;
    websiteUrl?: string | null;
    privacyUrl?: string | null;
    termsOfUseUrl?: string | null;
    mpnId?: string | null;
  } | null;
  icons?: { color?: string | null; outline?: string | null } | null;
  bots?: { botId?: string | null; scopes?: string[] | null }[] | null;
  staticTabs?:
    | {
        entityId?: string | null;
        name?: string | null;
        contentUrl?: string | null;
        websiteUrl?: string | null;
        scopes?: string[] | null;
        context?: string[] | null;
      }[]
    | null;
  configurableTabs?:
    | {
        configurationUrl?: string | null;
        scopes?: string[] | null;
        context?: string[] | null;
        canUpdateConfiguration?: boolean | null;
        supportedSharePointHosts?: string[] | null;
      }[]
    | null;
  composeExtensions?:
    | {
        botId?: string | null;
        composeExtensionType?: string | null;
      }[]
    | null;
  connectors?: { connectorId?: string | null; scopes?: string[] | null }[] | null;
  meetingExtensionDefinition?: {
    scenes?: Record<string, unknown>[] | null;
    supportsStreaming?: boolean | null;
    supportsAnonymousGuestUsers?: boolean | null;
  } | null;
  activities?: {
    activityTypes?:
      | {
          type?: string | null;
          description?: string | null;
          templateText?: string | null;
        }[]
      | null;
  } | null;
  supportsChannelFeatures?: string | null;
  webApplicationInfo?: { id?: string | null; resource?: string | null } | null;
  copilotAgents?: {
    declarativeAgents?: { id?: string | null; file?: string | null }[] | null;
    customEngineAgents?: { id?: string | null; type?: string | null }[] | null;
  } | null;
}

export interface AppUserPayload {
  aadId: string;
  tenantId: string;
  role: string;
}

/** Native /v1.0/apps detail response; timestamps are only available on list summaries. */
export interface AppResponse {
  appId: string;
  appProfile: {
    appAccessControl?: { appUsers?: AppUserPayload[] | null } | null;
    appMetadata?: {
      ownerAadId?: string | null;
      updatedByAadId?: string | null;
      source?: string | number | null;
      appType?: string | number | null;
      appPublishInfos?: unknown[] | null;
    } | null;
    appDetails?: { applicationManifest?: DraftApplicationManifest | null } | null;
  } | null;
}

export interface AppSummary {
  appId: string;
  appName?: string | null;
  appVersion?: string | null;
  appExternalId?: string | null;
  updatedAt?: string | null;
  updatedByAadId?: string | null;
  colorIconPath?: string | null;
  outlineIconPath?: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullishString(value: unknown): value is string | null | undefined {
  return value === undefined || value === null || typeof value === "string";
}

// Validate only the envelope; consumers enforce their required nested fields.
export function hasValidAppResponse(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.appId === "string" &&
    isUuid(value.appId) &&
    (value.appProfile === null || isRecord(value.appProfile))
  );
}

export function isAppSummary(value: unknown): value is AppSummary {
  return (
    isRecord(value) &&
    typeof value.appId === "string" &&
    isUuid(value.appId) &&
    [
      "appName",
      "appVersion",
      "appExternalId",
      "updatedAt",
      "updatedByAadId",
      "colorIconPath",
      "outlineIconPath",
    ].every((key) => isNullishString(value[key]))
  );
}
