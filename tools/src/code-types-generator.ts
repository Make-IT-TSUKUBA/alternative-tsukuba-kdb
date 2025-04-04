import fs from "node:fs";
import path from "node:path";
import { globSync } from "glob";
import { parse } from "csv-parse/sync";
import YAML from "yaml";

type MidCodeType = { [key: string]: string[] } | string;
type LargeCodeType = Record<string, (MidCodeType | string)[]> | string;
export type CodeType = {
  types: LargeCodeType[];
};

type Codes = string[];
type SmallCodeArray = { name: string; children: Codes }[];
type MidCodeArray = { name: string; children: SmallCodeArray | Codes }[];
type CodeArray = {
  name: string;
  children: MidCodeArray | Codes;
}[];

export abstract class CodeTypeGeneartor {
  protected dic: Record<string, string[]> = {};
  protected array: CodeArray = [];
  protected processed: Set<string> = new Set();

  generate(dst: string, json: string) {
    // ファイル名をキーにした辞書を作成
    const csvList = globSync(path.join(dst, "*.csv"));
    for (const src of csvList) {
      const key = this.getDictKey(this.getRequirements(src));
      this.dic[key] = CodeTypeGeneartor.parseCsv(src);
    }

    const txt = fs.readFileSync("./src/undergrad.txt", "utf-8");
    const yaml = YAML.parse(txt);
    const larges: LargeCodeType[] = yaml.types;

    // 大分類
    for (const large of larges) {
      if (typeof large === "string") {
        this.addCodes(large);
        continue;
      }
      // 中分類
      const [largeKey, mids] = Object.entries(large)[0];
      for (const mid of mids) {
        if (typeof mid === "string") {
          this.addCodes(largeKey, mid);
          continue;
        }
        // 小分類
        const [midKey, smalls] = Object.entries(mid)[0];
        for (const small of smalls) {
          this.addCodes(largeKey, midKey, small);
        }
      }
    }

    // 未処理のキーを検出
    const unprocessed = Object.keys(this.dic).filter(
      (key) => !this.processed.has(key)
    );
    if (unprocessed.length > 0) {
      throw new Error(`There are unprocessed keys: ${unprocessed.join(", ")}`);
    }

    fs.writeFileSync(json, JSON.stringify(this.array, null, 2), "utf-8");
  }

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

    // 科目番号のみを抽出
    const codes: string[] = [];
    for (const row of rows) {
      const code = row[0];
      if (code?.match(/^[A-Z0-9]+$/)) {
        codes.push(code);
      }
    }
    return codes;
  }

  protected abstract getRequirements(src: string): string[];

  protected getDictKey(requirements: (string | undefined)[]) {
    return requirements.filter((x) => x).join("_");
  }

  /**
   * 自身の CSV 以外で、科目コードがユニークかどうかを判定する
   */
  protected isUniqueCode(currentCode: string, csvName: string) {
    return Object.entries(this.dic).every(
      ([name, codes]) =>
        name === csvName || !codes.some((code) => code.startsWith(currentCode))
    );
  }

  protected addCodes(large: string, mid?: string, small?: string) {
    const key = this.getDictKey([large, mid, small]);
    const codes = this.getUniqueCodes(key);
    this.processed.add(key);

    // 配列にキーが存在しない場合は追加
    const findOrCreateItem = <T extends { name: string; children: unknown[] }>(
      array: T[],
      name: string
    ): T => {
      const item = array.find((a) => a.name === name);
      if (item) {
        return item;
      }
      const newItem = { name, children: [] } as unknown as T;
      array.push(newItem);
      return newItem;
    };

    // 大分類
    const largeItem = findOrCreateItem(this.array, large);
    // 中分類が存在しない場合は科目番号を追加して終了
    if (!mid) {
      largeItem.children = codes;
      return;
    }

    // 中分類
    const midItem = findOrCreateItem(largeItem.children as MidCodeArray, mid);
    // 小分類が存在しない場合は科目番号を追加して終了
    if (!small) {
      midItem.children = codes;
      return;
    }

    // 小分類
    const smallItem = findOrCreateItem(midItem.children as MidCodeArray, small);
    smallItem.children = codes;
  }

  protected getUniqueCodes(key: string) {
    const codes = this.dic[key];
    if (!codes) {
      throw new Error(`${key} is not found`);
    }
    const codeLength = codes[0].length;

    // 科目コード長ごとのコードの Set を作成
    const lengthToCodes: Set<string>[] = [];
    for (let i = 0; i < codeLength; i++) {
      lengthToCodes[i] = new Set();
    }
    for (const code of codes) {
      this.addUniqueCodeToDict(code, lengthToCodes, key);
    }

    // 科目コード長の昇順に出力
    const allCodes: string[] = [];
    for (let i = 0; i < codeLength; i++) {
      if (lengthToCodes[i].size > 0) {
        allCodes.push(...lengthToCodes[i]);
      }
    }
    return allCodes;
  }

  protected addUniqueCodeToDict(
    code: string,
    lengthToCodes: Set<string>[],
    csvName: string
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
}
