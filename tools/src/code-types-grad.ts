import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { globSync } from "glob";

import { CodeTypeGeneartor } from "./code-types-generator";

class CodeTypeGradGeneartor extends CodeTypeGeneartor {
	generate(dst: string, json: string) {
		// ファイル名をキーにした辞書を作成
		const csvList = globSync(path.join(dst, "*.csv"));
		for (const csvName of csvList) {
			this.dic[csvName] = CodeTypeGeneartor.parseCsv(csvName);
		}

		const output: Record<string, Record<string, string[]>> = {};

		for (const [csvName, codes] of Object.entries(this.dic)) {
			if (codes.length === 0) {
				continue;
			}
			const codeLength = codes[0].length;

			const lengthToCodes: Set<string>[] = [];
			for (let i = 0; i < codeLength; i++) {
				lengthToCodes[i] = new Set();
			}

			for (const code of codes) {
				this.addCode(code, lengthToCodes, csvName);
			}

			// 科目コード長の昇順に出力
			const allCodes: string[] = [];
			for (let i = 0; i < codeLength; i++) {
				if (lengthToCodes[i].size > 0) {
					allCodes.push(...lengthToCodes[i]);
				}
			}

			// [大分類][中分類] をキーとする
			const [large, mid] = path
				.basename(csvName, path.extname(csvName))
				.split("_");
			if (!output[large]) {
				output[large] = {};
			}
			output[large][mid] = allCodes;
		}

		fs.writeFileSync(json, JSON.stringify(output, null, 2), "utf-8");
	}
}

(() => {
	const program = new Command();
	program
		.option("-d, --dst <dst>", "Destination directory", "dst")
		.option(
			"-j, --json <json>",
			"JSON output file",
			"../src/kdb/code-types-grad.json",
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
