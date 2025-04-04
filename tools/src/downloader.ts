import fs from "node:fs";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import { globSync } from "glob";
import iconv from "iconv-lite";
import puppeteer, { type Browser, type Page } from "puppeteer";

const KDB_URL = "https://kdb.tsukuba.ac.jp/";
const TMP_DIR = path.resolve("tmp");
const DST_DIR = path.resolve("dst");

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(DST_DIR, { recursive: true });

export class KdbDownloader {
  protected browser: Browser = null!;
  protected page: Page = null!;

  protected async init() {
    // Puppeteer を起動
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();

    // KdB にアクセス
    await this.page.goto(KDB_URL);
  }

  protected async csvDownload(filename: string, skipExisting: boolean) {
    const dstCsv = path.join(DST_DIR, filename);
    if (skipExisting && fs.existsSync(dstCsv)) {
      console.log(`Skipped: ${dstCsv}`);
      return;
    }

    // 検索
    await this.click("検索");

    // CSV をダウンロード
    const cdpSession = await this.browser.target().createCDPSession();
    const tmp = path.resolve(TMP_DIR);
    await cdpSession.send("Browser.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: tmp,
      eventsEnabled: true,
    });
    await this.page.select("#outputFormat", "0");
    await this.click("科目一覧ダウンロード", false);

    const succeeds = await this.waitForDownload(10);
    if (!succeeds) {
      console.log(`Download failed: ${filename}`);
      return false;
    }

    // CSV をリネーム
    await setTimeout(2000);
    const downloadedFiles = globSync(path.join(TMP_DIR, "*.csv"));
    if (downloadedFiles.length > 0) {
      const tmpCsv = downloadedFiles[0];

      // Shift_JIS から変換
      const data = fs.readFileSync(tmpCsv);
      const buf = Buffer.from(data);
      const str = iconv.decode(buf, "Shift_JIS");
      fs.writeFileSync(dstCsv, str, { encoding: "utf-8" });
      fs.unlinkSync(tmpCsv);
      console.log(`Saved: ${dstCsv}`);
    }
  }

  protected async selectThenNavigation(selector: string, value: string) {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: ["load", "networkidle2"] }),
      this.page.select(selector, value),
    ]);
  }

  protected async getOptionValues(selector: string) {
    return await this.page.$$eval(`${selector} option`, (options) =>
      options.map((o) => o.value)
    );
  }

  protected async getSelectedOptionText(selector: string) {
    return await this.page.$eval(
      `${selector} option:checked`,
      (el) => el.textContent?.trim() || ""
    );
  }

  private async click(value: string, navigation = true) {
    const button = await this.page.$(`input[type="button"][value="${value}"]`);
    if (button) {
      const array: Promise<unknown>[] = [button.click()];
      if (navigation) {
        array.push(
          this.page.waitForNavigation({ waitUntil: ["load", "networkidle2"] })
        );
      }
      await Promise.all(array);
    }
  }

  /**
   * .crdownload ファイルが削除されるまで待機する
   */
  private async waitForDownload(timeoutSecond: number) {
    let second = timeoutSecond;
    let succeeds = false;
    while (second > 0) {
      const downloading = globSync(path.join(TMP_DIR, "*.crdownload"));
      if (downloading.length === 0) {
        succeeds = true;
        break;
      }
      await setTimeout(1000);
      second--;
    }
    return succeeds;
  }
}
