// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ConfigFolderName } from "@microsoft/teamsfx-api";
import fs from "fs-extra";
import path from "path";
import { workspaceUri, isTeamsFxProject } from "../globalVariables";

export function anonymizeFilePaths(stack?: string): string {
  if (!stack) {
    return "";
  }
  const filePathRegex = /\s\(([a-zA-Z]:(\\|\/)([^\\\/\s:]+(\\|\/))+|\/([^\s:\/]+\/)+)/g;
  const redactedErrorMessage = stack.replace(filePathRegex, " (<REDACTED: user-file-path>/");
  return redactedErrorMessage;
}

export async function getProjectRoot(
  folderPath: string,
  folderName: string
): Promise<string | undefined> {
  const projectRoot: string = path.join(folderPath, folderName);
  const projectExists: boolean = await fs.pathExists(projectRoot);
  return projectExists ? projectRoot : undefined;
}
