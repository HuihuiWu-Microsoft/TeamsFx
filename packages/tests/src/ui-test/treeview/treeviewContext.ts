/**
 * @author Helly Zhang <v-helzha@microsoft.com>
 */
import * as path from "path";
import * as fs from "fs-extra";
import { expect } from "chai";
import {
  ActivityBar,
  By,
  EditorView,
  InputBox,
  VSBrowser,
  WebView,
} from "vscode-extension-tester";
import { TestContext } from "../testContext";
import { CommandPaletteCommands, Extension, Timeout } from "../../constants";
import {
  execCommandIfExist,
  ensureExtensionActivated,
} from "../../vscodeOperation";
import { getScreenshotName } from "../../utils/nameUtil";

export class TreeViewTestContext extends TestContext {
  public testName: string;

  constructor(testName: string) {
    super(testName);
    this.testName = testName;
  }

  public async before() {
    await fs.ensureDir(this.testRootFolder);
    await VSBrowser.instance.waitForWorkbench();
    await VSBrowser.instance.driver.sleep(Timeout.reloadWindow);
    await VSBrowser.instance.takeScreenshot(getScreenshotName("before"));
    await ensureExtensionActivated();
  }
  public async after() {
    await VSBrowser.instance.takeScreenshot(getScreenshotName("after"));
  }
}

export async function createSampleProject(
  sample: string,
  testRootFolder?: string
): Promise<void> {
  const driver = VSBrowser.instance.driver;
  if (!testRootFolder) {
    testRootFolder = path.resolve(__dirname, "../../../resource/");
  }
  console.log("create sample: ", sample, ". folder: ", testRootFolder);
  await new EditorView().closeAllEditors();
  await execCommandIfExist(
    CommandPaletteCommands.SamplesCommand,
    Timeout.webView
  );
  await driver.sleep(Timeout.shortTimeLoading);
  const webView = new WebView();
  await webView.switchToFrame();
  let foundSample = false;
  console.log("finding sample...");
  const elements = await webView.findWebElements(
    By.xpath('//div[@class="sample-gallery"]/div[@class="sample-stack"]/div')
  );
  for (const element of elements) {
    const sampleItem = await element.findElement(By.css("h3"));
    const SampleItemName = await sampleItem.getText();
    if (SampleItemName === sample) {
      foundSample = true;
      await element.click();
      break;
    }
  }
  if (!foundSample) {
    throw new Error(`Not found sample ${sample}`);
  }
  const button = await webView.findWebElement(
    By.xpath('.//vscode-button[contains(text(),"Create")]')
  );
  await button.click();
  await driver.sleep(Timeout.shortTimeWait);
  await webView.switchBack();
  const input = await InputBox.create();
  await input.selectQuickPick("Browse...");
  // Input folder path
  do {
    // input may be auto-corrected to other value, so set until it's fixed
    await input.setText(testRootFolder);
    await driver.sleep(Timeout.input);
  } while ((await input.getText()) !== testRootFolder);
  await input.confirm();
  await driver.sleep(Timeout.reloadWindow);
  console.log("create sample done");
}

export async function checkSectionContent(
  expectedSectionName: string,
  expectedSectionItems: string[]
): Promise<boolean> {
  const driver = VSBrowser.instance.driver;
  const activityBar = new ActivityBar();
  const view = await activityBar.getViewControl(Extension.displayName);
  let includeContent = false;
  if (view) {
    const extensionView = await view.openView();
    // await driver.sleep(Timeout.longTimeWait);
    // const extensionContent = extensionView.getContent();
    const sections = await extensionView.findElements(
      By.className("split-view-view")
    );
    for (const section of sections) {
      const sectionTitle = await section
        .findElement(By.css(".title"))
        .getText();
      if (sectionTitle.toUpperCase() === expectedSectionName) {
        console.log(`Found tree view section ${expectedSectionName}`);
        const item = await section.findElement(By.css(".pane-body"));
        const itemContent = await item?.getText();
        for (const item of expectedSectionItems) {
          if (!itemContent.includes(item)) {
            includeContent = false;
            break;
          } else {
            console.log(
              `Found tree view item ${item} in section ${expectedSectionName}`
            );
          }
        }
        includeContent = true;
        break;
      }
    }
  }
  return includeContent;
}

export async function validateEditorOpened(editorName: string) {
  const openedEditors = await new EditorView().getOpenEditorTitles();
  let previewOpened = false;
  for (const openedEditor of openedEditors) {
    if (openedEditor.includes(editorName)) {
      previewOpened = true;
      break;
    }
  }
  expect(previewOpened, `${editorName} is not opened`).equal(true);
}

export async function zipAppPackage(env = "dev") {
  await execCommandIfExist(
    CommandPaletteCommands.BuildTeamsPackageCommand,
    Timeout.webView
  );
  const driver = VSBrowser.instance.driver;
  await driver.sleep(Timeout.input);
  const input = await InputBox.create();
  await input.selectQuickPick("manifest.json");
  await driver.sleep(Timeout.input);
  await input.selectQuickPick(env);
  await driver.sleep(Timeout.input);
}
