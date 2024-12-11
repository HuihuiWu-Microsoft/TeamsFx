// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { workspaceUri } from "../globalVariables";
import { getV3TeamsAppId } from "./appDefinitionUtils";
import { envUtil } from "@microsoft/teamsfx-core/build/component/utils/envUtil";

export async function getSubscriptionInfoFromEnv(env: string): Promise<string | undefined> {
  const envs = await envUtil.readEnv(workspaceUri!.fsPath, env, false);
  if (envs.isOk() && envs.value) {
    return envs.value["AZURE_SUBSCRIPTION_ID"];
  }
  return undefined;
}

export async function getM365TenantFromEnv(env: string): Promise<string | undefined> {
  const envs = await envUtil.readEnv(workspaceUri!.fsPath, env, false);
  if (envs.isOk() && envs.value) {
    return envs.value["TEAMS_APP_TENANT_ID"];
  }
  return undefined;
}

export async function getResourceGroupNameFromEnv(env: string): Promise<string | undefined> {
  const envs = await envUtil.readEnv(workspaceUri!.fsPath, env, false);
  if (envs.isOk() && envs.value) {
    return envs.value["AZURE_RESOURCE_GROUP_NAME"];
  }
  return undefined;
}

export async function getProvisionSucceedFromEnv(env: string): Promise<boolean | undefined> {
  // If TEAMS_APP_ID is set, it's highly possible that the project is provisioned.
  try {
    const teamsAppId = await getV3TeamsAppId(workspaceUri!.fsPath, env);
    return teamsAppId !== "";
  } catch (error) {
    return false;
  }
}
