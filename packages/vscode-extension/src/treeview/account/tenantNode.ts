// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as vscode from "vscode";

import { getSideloadingStatus } from "@microsoft/teamsfx-core";
import { checkSideloadingCallback } from "../../handlers/accounts/checkAccessCallback";
import { TelemetryTriggerFrom } from "../../telemetry/extTelemetryEvents";
import { localize } from "../../utils/localizeUtils";
import { DynamicNode } from "../dynamicNode";
import { errorIcon, infoIcon, passIcon } from "./common";
import { listAllTenants } from "@microsoft/teamsfx-core/build/common/tools";

enum ContextValues {
  Normal = "tenant",
}

export class TenantNode extends DynamicNode {
  constructor(
    private eventEmitter: vscode.EventEmitter<DynamicNode | undefined | void>,
    public token: string,
    public tid: string
  ) {
    super("", vscode.TreeItemCollapsibleState.None);
    this.contextValue = ContextValues.Normal;
  }

  public override getChildren(): vscode.ProviderResult<DynamicNode[]> {
    return null;
  }

  public override async getTreeItem(): Promise<vscode.TreeItem> {
    if (this.token != "" && this.tid) {
      const tenants = await listAllTenants(this.token);
      for (const tenant of tenants) {
        if (tenant.tenantId === this.tid && tenant.displayName && tenant.defaultDomain) {
          this.label = `${tenant.displayName as string} (${tenant.defaultDomain as string})`;
          this.tooltip = `Current tenant is ${tenant.displayName as string} (${
            tenant.defaultDomain as string
          })`;
        }
      }
    }
    return this;
  }
}
