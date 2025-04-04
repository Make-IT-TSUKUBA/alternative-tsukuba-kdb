import path from "node:path";
import { Command } from "commander";

import { CodeTypeGeneartor } from "./code-types-generator";

class CodeTypeUndergradGeneartor extends CodeTypeGeneartor {
  protected getRequirements(src: string) {
    const name = path.basename(src, path.extname(src));

    // 全角括弧を置換
    let [large, mid, small]: (string | undefined)[] = name
      .replaceAll("(", "（")
      .replaceAll(")", "）")
      .replaceAll(/\*\*.+?\*\*/g, "")
      .split("_");

    // 基礎科目の大分類は消去
    if (large === "基礎科目（共通科目等）") {
      large = mid;
      mid = small;
      small = undefined;
    }

    // 小分類の置換
    const categoryMap = {
      教職: {
        "養護実習（2012-）": "養護実習",
      },
      "専門基礎科目・専門科目": {
        "専門導入科目（事前登録対象）": {
          "複数クラスで開講する専門導入科目（数学・物理・化学）（事前登録対象）":
            "複数クラスで開講する専門導入科目（数学・物理・化学）",
        },
        "人文・文化学群": {
          "人文・文化学群学群コアカリキュラム": "学群コアカリキュラム",
          "人文・文化学群グローバル科目群": "グローバル科目群",
          "人文・文化学群インターンシップ": "インターンシップ",
        },
        "社会・国際学群": {
          "社会・国際学群グローバル科目群": "グローバル科目群",
        },
        人間学群: {
          "人間学群学群コア・カリキュラム（専門基礎科目）":
            "学群コア・カリキュラム（専門基礎科目）",
        },
        理工学群: {
          理工学群学群共通科目: "学群共通科目",
          "理工学群学群共通科目（数学）": "学群共通科目（数学）",
          理工学群その他: "その他",
        },
        情報学群: {
          情報学群学群共通: "学群共通科目",
        },
        医学群: {},
        体育専門学群: {
          "体育専門学群（平成25年度以降入学者対象）専門科目": "専門科目",
          "体育専門学群（平成25年度以降入学者対象）専門基礎科目":
            "専門基礎科目",
        },
        芸術専門学群: {},
        "学際サイエンス・デザイン専門学群": {},
      },
    };
    if (categoryMap[large]?.[mid]?.[small]) {
      small = categoryMap[large][mid][small];
    }

    return [large, mid, small].flatMap((x) => (x ? [x] : []));
  }
}

(() => {
  const program = new Command();
  program
    .option("-d, --dst <dst>", "Destination directory", "dst")
    .option(
      "-j, --json <json>",
      "JSON output file",
      "../frontend/src/kdb/code-types-undergrad.json"
    );
  program.parse(process.argv);
  const options = program.opts();

  const generator = new CodeTypeUndergradGeneartor();
  generator.generate(options.dst, options.json);
})();
