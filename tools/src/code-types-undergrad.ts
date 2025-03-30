import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import { globSync } from "glob";

import { CodeTypeGeneartor } from "./code-types-generator";

class CodeTypeUndergradGeneartor extends CodeTypeGeneartor {
	generate(dst: string, json: string) {
		// ファイル名をキーにした辞書を作成
		const csvList = globSync(path.join(dst, "*.csv"));
		for (const csvName of csvList) {
			this.dic[csvName] = CodeTypeGeneartor.parseCsv(csvName);
		}

		const output: Record<
			string,
			string[] |
			Record<string, string[] | Record<string, string[]>>
		> = {};

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

			const [large, mid, small] = path
				.basename(csvName, path.extname(csvName))
				.split("_")
				.map((a) => a.replaceAll("(", "（").replaceAll(")", "）").replace(/\*\*.+?\*\*/, ""));

			if (!output[large]) {
				output[large] = {};
			}
			// 小分類がある場合 [大分類][中分類][小分類] をキーとする
			if (small) {
				if (!output[large][mid]) {
					output[large][mid] = {};
				}
				(output[large][mid] as Record<string, string[]>)[small] = allCodes;
			}
			// 小分類がない場合 [大分類][中分類] をキーとする
			else {
				output[large][mid] = allCodes;
			}
		}

		// 基礎科目以下の中分類を大分類に移す
		for (const [key, value] of Object.entries(output["基礎科目（共通科目等）"])) {
			output[key] = value;
		}
		delete output["基礎科目（共通科目等）"];
		
		// 全学群対象

		// 専門導入科目（事前登録対象）
		const map = {
			"複数クラスで開講する専門導入科目（数学・物理・化学）（事前登録対象）": "複数クラスで開講する専門導入科目（数学・物理・化学）",
		}

		// 人文・文化学群
		const map = {
			"人文・文化学群学群コアカリキュラム": "コアカリキュラム",
			"人文・文化学群グローバル科目群": "グローバル科目群",
			"人文・文化学群インターンシップ": "インターンシップ",
		}

		// 人間学群
		const map = {
			"人間学群学群コア・カリキュラム（専門基礎科目）": "コア・カリキュラム（専門基礎科目）"
		}

		// 社会・国際学群
		const map = {
			"社会・国際学群グローバル科目群": "グローバル科目群"
		}

		// 理工学群
		const map = {
			"理工学群学群共通科目": "学群共通科目",
			"理工学群学群共通科目（数学）": "共通科目（数学）",
			"理工学群その他": "その他"
		}

		// 情報学群
		const map = {
			"情報学群学群共通": "共通科目",
		}

		// 医学群
		// 芸術専門学群

		// 体育専門学群
		const map = {
			"体育専門学群（平成25年度以降入学者対象）専門科目": "専門科目",
			"体育専門学群（平成25年度以降入学者対象）専門基礎科目": "専門基礎科目",
		}

		// 学際サイエンス・デザイン専門学群

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
			"./code-types-undergrad.json",
			//"../src/kdb/code-types-undergrad.json",
		);
	program.parse(process.argv);
	const options = program.opts();

	try {
		const generator = new CodeTypeUndergradGeneartor();
		generator.generate(options.dst, options.json);
	} catch (e) {
		console.error(e);
	}
})();
