/* eslint no-irregular-whitespace: 0 */

import { matchesCodeRequirement } from "../kdb/code-types";
import type { ClassMethod, Module, NormalSeason, Subject } from "./subject";
import { getTermCode } from "./subject";
import {
  type TimeslotTable,
  createEmptyTimeslotTable,
  getTimeslotsLength,
  matchesTimeslots,
  timeslotTableToBits,
} from "./timetable";

export interface SearchOptions {
  keyword: string;
  reqA: string;
  reqB: string;
  reqC: string;
  classMethod: ClassMethod | null;
  years: Set<number>;
  season: NormalSeason | null;
  module: Module | null;
  timeslotTable: TimeslotTable;
  excludesBookmark: boolean;
  containsName: boolean;
  containsCode: boolean;
  containsRoom: boolean;
  containsPerson: boolean;
  containsAbstract: boolean;
  containsNote: boolean;
  filter: "all" | "bookmark" | "except-bookmark";
  concentration: boolean;
  negotiable: boolean;
  asneeded: boolean;
  nt: boolean;
  exceptSameName: boolean;
}

export const createSearchOptions = (): SearchOptions => {
  return {
    keyword: "",
    reqA: "null",
    reqB: "null",
    reqC: "null",
    classMethod: null,
    years: new Set(),
    season: null,
    module: null,
    timeslotTable: createEmptyTimeslotTable(),
    excludesBookmark: false,
    containsName: true,
    containsCode: true,
    containsRoom: false,
    containsPerson: false,
    containsAbstract: false,
    containsNote: false,
    filter: "all",
    concentration: false,
    negotiable: false,
    asneeded: false,
    nt: false,
    exceptSameName: false,
  };
};

export const searchSubjects = (
  subjectMap: Record<string, Subject>,
  subjectCodeList: string[],
  searchOptions: SearchOptions,
  bookmarkTimeslotTable: TimeslotTable,
  bookmarksHas: (subjectCode: string) => boolean
) => {
  const subjects: Subject[] = [];
  const nameSet = new Set<string>();
  const enableTimeslotBits = timeslotTableToBits(searchOptions.timeslotTable);
  const disableTimeslotBits = timeslotTableToBits(
    searchOptions.excludesBookmark ? bookmarkTimeslotTable : []
  );

  for (let i = 0; i < subjectCodeList.length; i++) {
    const subject = subjectMap[subjectCodeList[i]];
    if (
      matchesSearchOptions(
        subject,
        searchOptions,
        nameSet,
        enableTimeslotBits,
        disableTimeslotBits,
        bookmarksHas
      )
    ) {
      subjects.push(subject);
      nameSet.add(subject.name);
    }
  }
  return subjects;
};

const matchesSearchOptions = (
  subject: Subject,
  options: SearchOptions,
  codeSet: Set<string>,
  enableTimeslotBits: bigint,
  disableTimeslotBits: bigint,
  bookmarksHas: (subjectCode: string) => boolean
) => {
  // 標準履修年次
  const matchesYear = (() => {
    if (options.years.size === 0) {
      return true;
    }
    if (!subject.year.includes("-")) {
      return [...options.years].some((year) =>
        subject.year.includes(year.toString())
      );
    }
    const minYear = Number.parseInt(subject.year.replace(/\s-\s[1-6]/g, ""));
    const maxYear = Number.parseInt(subject.year.replace(/[1-6]\s-\s/g, ""));
    return [...options.years].some(
      (year) => minYear <= year && year <= maxYear
    );
  })();

  // 要件
  const matchesRequirement = (() => {
    const reqA = options.reqA !== "null" ? options.reqA : null;
    const reqB = options.reqB !== "null" ? options.reqB : null;
    const reqC = options.reqC !== "null" ? options.reqC : null;
    return matchesCodeRequirement(subject.code, reqA, reqB, reqC);
  })();

  // オンライン
  const matchesClassMethod =
    !options.classMethod ||
    subject.classMethods.some((method) => options.classMethod === method);

  // ブックマーク
  const matchesBookmark = (() => {
    const bookmarked = bookmarksHas(subject.code);
    return (
      options.filter === "all" ||
      (options.filter === "bookmark" && bookmarked) ||
      (options.filter === "except-bookmark" && !bookmarked)
    );
  })();

  // 同名の科目を除外
  const matchesSameName = !options.exceptSameName || !codeSet.has(subject.name);

  return (
    matchesKeyword(subject, options) &&
    matchesTerm(subject, options) &&
    matchesTimeslot(
      subject,
      options,
      enableTimeslotBits,
      disableTimeslotBits
    ) &&
    matchesRequirement &&
    matchesBookmark &&
    matchesClassMethod &&
    matchesYear &&
    matchesSameName
  );
};

const matchesKeyword = (subject: Subject, options: SearchOptions) => {
  // 何の条件も設定されていない場合は true
  if (
    !options.containsCode &&
    !options.containsName &&
    !options.containsRoom &&
    !options.containsPerson &&
    !options.containsAbstract &&
    !options.containsNote
  ) {
    return true;
  }

  // 空文字の場合は true
  if (options.keyword === "") {
    return true;
  }

  try {
    const regex = new RegExp(options.keyword, "i");

    // 科目番号は前方一致
    const matchesCode =
      options.containsCode && subject.code.startsWith(options.keyword);

    const matchesName = options.containsName && subject.name.match(regex);
    const matchesRoom = options.containsRoom && subject.room.match(regex);

    // 教員名はスペースを無視して検索
    // すなわち、"情報太郎" または "情報　太郎" で検索した場合も、"情報 太郎" にヒットさせる
    const matchesPerson =
      options.containsPerson &&
      subject.person
        .replace(" ", "")
        .match(new RegExp(options.keyword.replace(/[ 　]/, ""), "i")) != null;

    const matchesAbstract =
      options.containsAbstract && subject.abstract.match(regex);
    const matchesNote = options.containsNote && subject.note.match(regex);

    return (
      matchesCode ||
      matchesName ||
      matchesRoom ||
      matchesPerson ||
      matchesAbstract ||
      matchesNote
    );
  } catch {
    return false;
  }
};

const matchesTerm = (subject: Subject, options: SearchOptions) => {
  const season = options.season;
  const module = options.module;

  // 通年の場合はマッチ
  if (subject.termStr.includes("通年")) {
    return true;
  }

  // 学期、モジュールが両方指定されている場合は組み合わせで検索
  if (season && module) {
    return subject.termCodes.some((codes) =>
      codes.includes(getTermCode(season, module))
    );
  }

  // そうでなければどちらか片方で検索
  const matchesSeason = !season || subject.termStr.includes(season);
  const matchesModule = !module || subject.termStr.includes(module);
  return matchesSeason && matchesModule;
};

const matchesTimeslot = (
  subject: Subject,
  options: SearchOptions,
  enableBits: bigint,
  disableBits: bigint
) => {
  // 除外時限に一致する場合は false
  if (
    options.excludesBookmark &&
    matchesTimeslots(subject.timeslotTableBits, disableBits)
  ) {
    return false;
  }

  // 以下のいずれかの場合は true
  // - 何の条件も設定されていない
  // - 時限が一致する
  // - 集中、横断、随時に一致する
  const isNotSpecified =
    getTimeslotsLength(options.timeslotTable) === 0 &&
    !options.concentration &&
    !options.negotiable &&
    !options.asneeded &&
    !options.nt;
  const matchesSpecial =
    (options.concentration && subject.concentration) ||
    (options.negotiable && subject.negotiable) ||
    (options.asneeded && subject.asneeded) ||
    (options.nt && subject.nt);

  return (
    isNotSpecified ||
    matchesTimeslots(subject.timeslotTableBits, enableBits) ||
    matchesSpecial
  );
};
