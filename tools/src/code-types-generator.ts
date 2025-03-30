import fs from "node:fs";
import { parse } from "csv-parse/sync";

export class CodeTypeGeneartor {
	protected dic: Record<string, string[]> = {};

	protected static parseCsv(csvName: string) {
		const str = fs.readFileSync(csvName, "utf-8");
		const rawRows = str.split("\n");
		const newRows: string[] = [];

		for (let i = 0; i < rawRows.length; i++) {
			// 末尾のスペースを削除
			let newRow = rawRows[i].trim();

			// エスケープされていないダブルクォーテーションをエスケープ
			// 1. 文中: " → ""
			newRow = newRow.replace(/(?<!(^|[,"]))"(?!($|[,"]))/g, "$1\u{f0000}$2");

			// 2. 先頭
			// - ","" → ","""
			// - 行頭"" → 行頭"""
			newRow = newRow.replace(/(",|^)""(?!($|,|"))/g, ',$1"\u{f0000}$2');

			// 3. 末尾
			// - ""," → ""","
			// - ""行末 → """行末
			// 除外ケース：,"",
			newRow = newRow.replace(/(?<!(",|"))""(,"|$)/g, '$1\u{f0000}"$2,');

			newRow = newRow.replace(/\u{f0000}/gu, '""');

			if (newRow.length > 1) {
				newRows.push(newRow);
			}
		}

		const rows = parse(newRows.join("\n"), {
			delimiter: ",",
			relax_column_count: true,
		});
		const codes: string[] = [];

		for (const row of rows) {
			const code = row[0];
			if (code?.match(/^[A-Z0-9]+$/)) {
				codes.push(code);
			}
		}
		return codes;
	}

	protected addCode(
		code: string,
		lengthToCodes: Set<string>[],
		csvName: string,
	) {
		// 処理中の分類に限定される科目コードの最短桁数を探索
		for (let i = 0; i < code.length; i++) {
			const sliced = code.slice(0, i + 1);
			if (this.isUniqueCode(sliced, csvName)) {
				lengthToCodes[i].add(sliced);
				return;
			}
		}

		// 複数の分類で共有をしているため、ユニークにならない科目コードが存在する。その場合は追加
		lengthToCodes[code.length - 1].add(code);
	}

	/**
	 * 自身の CSV 以外で、科目コードがユニークかどうかを判定する
	 */
	protected isUniqueCode(currentCode: string, csvName: string) {
		return Object.entries(this.dic).every(
			([name, codes]) =>
				name === csvName || !codes.some((code) => code.startsWith(currentCode)),
		);
	}
}
