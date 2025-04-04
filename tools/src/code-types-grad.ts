import path from "node:path";
import { Command } from "commander";

import { CodeTypeGeneartor } from "./code-types-generator";

class CodeTypeGradGeneartor extends CodeTypeGeneartor {
  protected getRequirements(src: string) {
    const name = path.basename(src, path.extname(src));

    // 全角括弧を置換
    const [large, mid, small]: (string | undefined)[] = name
      .replaceAll("(", "（")
      .replaceAll(")", "）")
      .replaceAll(/\*\*.+?\*\*/g, "")
      .split("_");

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
      "../frontend/src/kdb/code-types-grad.json"
    );
  program.parse(process.argv);
  const options = program.opts();

  try {
    const generator = new CodeTypeGradGeneartor();
    generator.generate(options.dst, options.json);
  } catch (e) {
    console.error(e);
  }
})();
