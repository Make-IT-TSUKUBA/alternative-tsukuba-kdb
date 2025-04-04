import fs from "node:fs";
import path from "node:path";

import { KdbDownloader } from "./downloader";

const TMP_DIR = path.resolve("tmp");
const DST_DIR = path.resolve("dst");

fs.mkdirSync(TMP_DIR, { recursive: true });
fs.mkdirSync(DST_DIR, { recursive: true });

class KdbUndergradDownloader extends KdbDownloader {
  async download(skipExisting = false) {
    await this.init();

    // 大学院共通科目を選択
    await this.selectThenNavigation("#hierarchy1", "10400");

    // 2 階層目（大分類）を選択
    const hierarchy2Options = (await this.getOptionValues("#hierarchy2")).slice(
      1
    );
    for (const hierarchy2Value of hierarchy2Options) {
      await this.selectThenNavigation("#hierarchy2", hierarchy2Value);
      const hierarchy2Text = await this.getSelectedOptionText("#hierarchy2");

      // 3 階層目（中分類）を選択
      const hierarchy3Options = (
        await this.getOptionValues("#hierarchy3")
      ).slice(1);

      // 3 階層目がない場合がある
      if (hierarchy3Options.length === 0) {
        const filename = `${hierarchy2Text}.csv`;
        await this.csvDownload(filename, skipExisting);
        continue;
      }

      for (const hierarchy3Value of hierarchy3Options) {
        await this.selectThenNavigation("#hierarchy3", hierarchy3Value);
        const hierarchy3Text = await this.getSelectedOptionText("#hierarchy3");

        // 4 階層目（小分類）を選択
        const hierarchy4Options = (
          await this.getOptionValues("#hierarchy4")
        ).slice(1);

        // 4 階層目がない場合がある
        if (hierarchy4Options.length === 0) {
          const filename = `${hierarchy2Text}_${hierarchy3Text}.csv`;
          await this.csvDownload(filename, skipExisting);
          continue;
        }

        for (const hierarchy4Value of hierarchy4Options) {
          await this.selectThenNavigation("#hierarchy4", hierarchy4Value);
          const hierarchy4Text = await this.getSelectedOptionText(
            "#hierarchy4"
          );
          const filename = `${hierarchy2Text}_${hierarchy3Text}_${hierarchy4Text}.csv`;
          await this.csvDownload(filename, skipExisting);
        }
      }
    }

    await this.browser.close();
  }
}

(async () => {
  const downloader = new KdbUndergradDownloader();
  await downloader.download(true);
})();
