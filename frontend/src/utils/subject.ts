import kdbGradData from "@/kdb/kdb-grad.json";
import kdbData from "@/kdb/kdb.json";
import type { KdbData } from "../kdb/kdb";
import {
  type TimeslotTable,
  createTimeslotTable,
  timeslotTableToBits,
} from "./timetable";

// 現在の日付から年度を取得する場合、未公開のシラバスを参照してしまう可能性があるため、手動で年度を更新する。
// シラバスは毎年 4 月上旬に更新される。
export const CURRENT_YEAR = 2025;

const allSeasons = ["春", "夏", "秋", "冬"] as const;
export const normalSeasons = ["春", "秋"] as const;
export const modules = ["A", "B", "C"] as const;
export const classMethods = ["対面", "オンデマンド", "同時双方向"] as const;

export type AllSeason = (typeof allSeasons)[number];
export type NormalSeason = (typeof normalSeasons)[number];
export type Module = (typeof modules)[number];
export type ClassMethod = (typeof classMethods)[number];

const isAllSeason = (char: string): char is AllSeason =>
  (allSeasons as readonly string[]).includes(char);

const isNormalSeason = (char: string): char is NormalSeason =>
  (normalSeasons as readonly string[]).includes(char);

const isModule = (char: string): char is Module =>
  (modules as readonly string[]).includes(char);

export const getTermCode = (season: NormalSeason, module: Module) =>
  (season === "春" ? 0 : 3) + (module === "A" ? 0 : module === "B" ? 1 : 2);

export class Subject {
  private _code: string;
  private _name: string;
  private _credit: number;
  private _termCodes: number[][] = [];
  private _timeslotTables: TimeslotTable[] = [];
  // timeslotTables のビット列の論理積（検索用）
  private _timeslotTableBits = 0n;
  year: string;
  termStr: string;
  timeslotStr: string;
  room: string;
  person: string;
  abstract: string;
  note: string;
  classMethods: ClassMethod[];
  concentration = false;
  negotiable = false;
  asneeded = false;
  nt = false;

  constructor(line: KdbData["subject"][0]) {
    this._code = line[0];
    this._name = line[1];

    this._credit = Number.parseFloat(line[3]);
    if (Number.isNaN(this._credit)) {
      this._credit = 0;
    }
    this.year = line[4];
    this.termStr = line[5];
    this.timeslotStr = line[6];
    this.room = line[7];
    this.person = line[8];
    this.abstract = line[9];
    this.note = line[10];

    this._termCodes = Subject.parseTerm(this.termStr);

    // 時限
    // タームとコマのグループ長は稀に一致しない場合がある
    // タームのグループが 1 つしかない場合は、すべてのコマを統合
    const tempTimeslotStr =
      this._termCodes.length === 1
        ? this.timeslotStr.replace(/ /g, ",")
        : this.timeslotStr;

    // グループ毎に処理
    const termStrArray = tempTimeslotStr.split(" ");
    for (const str of termStrArray) {
      this._timeslotTables.push(createTimeslotTable(str));
      this.concentration ||= str.includes("集中");
      this.negotiable ||= str.includes("応談");
      this.asneeded ||= str.includes("随時");
      this.nt ||= str.includes("NT");
    }
    for (const table of this._timeslotTables) {
      this._timeslotTableBits |= timeslotTableToBits(table);
    }

    // コマのグループが 1 つしかない場合は、すべてのタームを統合
    if (this._timeslotTables.length === 1) {
      this._termCodes = [[...new Set(this._termCodes.flat())]];
    }

    this.classMethods = classMethods.filter((it) => this.note.indexOf(it) > -1);
  }

  get code() {
    return this._code;
  }

  get name() {
    return this._name;
  }

  get credit() {
    return this._credit;
  }

  get termCodes() {
    return this._termCodes;
  }

  get timeslotTables() {
    return this._timeslotTables;
  }

  get timeslotTableBits() {
    return this._timeslotTableBits;
  }

  get syllabusHref() {
    return `https://kdb.tsukuba.ac.jp/syllabi/${CURRENT_YEAR}/${this.code}/jpn`;
  }

  private static parseTerm(termStr: string) {
    // タームコード
    // - 春 A-C: 0-2
    // - 秋 A-C: 3-5
    // - 春季、夏季、秋季、冬季休業中: 6-9
    const termCodes: number[][] = [];
    let season: AllSeason | null = null;

    // 初めにスペースで分割
    const termGroups = termStr.split(" ");
    for (const groupStr of termGroups) {
      // ほとんどの科目にて、タームコードのグループはコマのグループと一致する
      const group: number[] = [];
      const charArray = Array.from(groupStr);

      for (let i = 0; i < charArray.length; i++) {
        const char = charArray[i];
        const nextChar = charArray[i + 1];

        // 通年の場合は春 A-C，秋A-C を入れる
        if (char === "通" && nextChar === "年") {
          group.push(0, 1, 2, 3, 4, 5);
          continue;
        }
        // 季節が出現した場合、以降のタームはその季節として扱う
        if (isAllSeason(char)) {
          season = char;
        }
        if (season) {
          // ABC ターム
          if (isModule(char) && isNormalSeason(season)) {
            const no = getTermCode(season, char);
            group.push(no);
          }
          // 休業中
          if (char === "休") {
            group.push(allSeasons.indexOf(season) + 6);
          }
        }
      }
      termCodes.push(group);
    }
    return termCodes;
  }
}

export const kdb = (() => {
  const subjectMap: { [key: string]: Subject } = {};
  const subjectCodeList: string[] = [];

  const allSubjects = [
    ...(kdbData as KdbData).subject,
    ...(kdbGradData as KdbData).subject,
  ];
  for (const line of allSubjects) {
    const subject = new Subject(line);
    subjectMap[subject.code] = subject;
    subjectCodeList.push(subject.code);
  }
  return {
    subjectMap,
    subjectCodeList,
    updated: kdbData.updated,
  };
})();

// 一度に表示する件数
export const ONCE_COUNT = 50;

// 高速化のため、初回表示時のみフィルタされてない科目を表示
export const initialSubjects = kdb.subjectCodeList
  .slice(0, ONCE_COUNT)
  .map((code) => kdb.subjectMap[code]);

// UTF-8（BOM 付き）の CSV ファイルに出力
export const outputSubjectsToCSV = (
  subjects: Subject[],
  a: HTMLAnchorElement | null,
) => {
  const escaped = /,|\r?\n|\r|"/;
  const e = /"/g;

  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const rows = [
    [
      "科目番号",
      "科目名",
      "単位数",
      "年次",
      "ターム",
      "曜日・時限",
      "担当",
      "実施形態",
      "概要",
      "備考",
    ],
  ];
  for (const subject of subjects) {
    rows.push([
      subject.code,
      subject.name,
      subject.credit.toFixed(1),
      subject.year,
      subject.termStr,
      subject.timeslotStr,
      subject.person,
      subject.classMethods.join(","),
      subject.abstract,
      subject.note,
    ]);
  }

  // エスケープ
  const csvRows: string[] = [];
  for (const row of rows) {
    csvRows.push(
      row
        .map((field) =>
          escaped.test(field) ? `"${field.replace(e, '""')}"` : field,
        )
        .join(",")
        .replace('\n",', '",'),
    );
  }

  // kdb_YYYYMMDDhhmmdd.csv
  const dateString = (() => {
    const date = new Date();
    const Y = date.getFullYear();
    const M = `${date.getMonth() + 1}`.padStart(2, "0");
    const D = `${date.getDate()}`.padStart(2, "0");
    const h = `${date.getHours()}`.padStart(2, "0");
    const m = `${date.getMinutes()}`.padStart(2, "0");
    const d = `${date.getSeconds()}`.padStart(2, "0");
    return Y + M + D + h + m + d;
  })();
  const filename = `kdb_${dateString}.csv`;

  // Blob のリンクを生成
  const blob = new Blob([bom, csvRows.join("\n")], { type: "text/csv" });
  if (a) {
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
  }
};
