import fs from "node:fs";
import path from "node:path";

import { KdbDownloader } from "./downloader";

const TMP_DIR = path.resolve("tmp");
const DST_DIR = path.resolve("dst");

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(DST_DIR, { recursive: true });

class KdbGradDownloader extends KdbDownloader {
  async download() {
    await this.init();

    // 大学院共通科目を選択
    await this.selectThenNavigation("#hierarchy1", "10401");

    // 2 階層目を選択
    const hierarchy2Options = (await this.getOptionValues("#hierarchy2")).slice(
      1
    );
    for (const hierarchy2Value of hierarchy2Options) {
      await this.selectThenNavigation("#hierarchy2", hierarchy2Value);
      const hierarchy2Text = await this.getSelectedOptionText("#hierarchy2");

      // 3 階層目を選択
      const hierarchy3Options = (
        await this.getOptionValues("#hierarchy3")
      ).slice(1);
      for (const hierarchy3Value of hierarchy3Options) {
        await this.selectThenNavigation("#hierarchy3", hierarchy3Value);
        const hierarchy3Text = await this.getSelectedOptionText("#hierarchy3");
        const filename = `${hierarchy2Text}_${hierarchy3Text}.csv`;
        await this.csvDownload(filename, false);
      }
    }

    await this.browser.close();
  }
}

(async () => {
  const downloader = new KdbGradDownloader();
  await downloader.download();
})();
