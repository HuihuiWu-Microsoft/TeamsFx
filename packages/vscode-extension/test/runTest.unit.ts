// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

"use strict";

import * as path from "path";
import { runTests } from "vscode-test";
import { instrument } from "./coverage";

import { testWorkspace } from "./globalVaribles";

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../");
    const extensionTestsPath = path.resolve(__dirname, "../../out-cov/test/index.unit");
    instrument();
    process.env["GENERATE_COVERAGE"] = "1";
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath: extensionTestsPath,
      launchArgs: ["--disable-extensions"],
    });
  } catch (err) {
    console.error("Failed to run tests");
    process.exit(1);
  }
}

main();
