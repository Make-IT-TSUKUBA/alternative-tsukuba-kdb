import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { kdb, type Subject } from "./subject";
import {
  createEmptyTimeslotTable,
  fillTimetable,
  getTimeslotsLength,
} from "./timetable";

const BOOKMARK_KEY = "kdb_bookmarks";
const BOOKMARKS_VERSION = 1;
const CURRENT_YEAR = 2025;

const bookmarkSubjectSchema = z.object({
  year: z.number(),
  ta: z.boolean(),
});

const bookmarksSchema = z.object({
  version: z.literal(BOOKMARKS_VERSION),
  subjects: z.record(z.string(), bookmarkSubjectSchema),
});

type BookmarkSubject = z.infer<typeof bookmarkSubjectSchema>;
type Bookmarks = z.infer<typeof bookmarksSchema>;

const createEmptyBookmarkSubject = (): BookmarkSubject => {
  return { year: CURRENT_YEAR, ta: false };
};

const createEmptyBookmarks = (): Bookmarks => {
  return { version: BOOKMARKS_VERSION, subjects: {} };
};

const getBookmarks = (): Bookmarks => {
  const value = localStorage.getItem(BOOKMARK_KEY);
  if (value === null) {
    return createEmptyBookmarks();
  }

  try {
    const result = bookmarksSchema.safeParse(JSON.parse(value));
    return result.success ? result.data : createEmptyBookmarks();
  } catch {
    // pass
  }

  try {
    // 古いバージョンのデータ（科目番号カンマ区切り）を読み込む
    const array =
      value !== null
        ? decodeURIComponent(value)
            .split(",")
            .filter((code) => code !== "")
        : [];
    const bookmarks: Bookmarks = createEmptyBookmarks();
    for (const item of array) {
      bookmarks.subjects[item] = createEmptyBookmarkSubject();
    }
    return bookmarks;
  } catch {
    return createEmptyBookmarks();
  }
};

const saveBookmarks = (bookmarks: Bookmarks) => {
  localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
};

export const useBookmark = (
  timetableTermCode: number,
  setTimetableTermCode: React.Dispatch<React.SetStateAction<number>>
) => {
  const [bookmarks, setBookmarks] = useState<Bookmarks>(createEmptyBookmarks());

  // 全タームを通した単位数の合計
  const totalCredits = useMemo(() => {
    let credits = 0;
    for (const code of Object.keys(bookmarks.subjects)) {
      const subject = kdb.subjectMap[code];
      if (subject) {
        credits += subject.credit;
      }
    }
    return credits;
  }, [bookmarks]);

  const [
    bookmarkTimeslotTable, // 現在のタームの TimeslotTable
    bookmarkSubjectTable, // 現在のタームの時間割
    currentCredits, // 現在のタームの単位数
    currentTimeslots, // 現在のタームのコマ数
  ] = useMemo(() => {
    const table = createEmptyTimeslotTable();
    const subjectTable = fillTimetable<Subject[]>([]);
    let credits = 0;
    let timeslots = 0;

    for (const code of Object.keys(bookmarks.subjects)) {
      const subject = kdb.subjectMap[code];
      if (!subject) {
        continue;
      }

      // タームコードを含むグループを探索
      const termIndex = subject.termCodes.findIndex((codes) =>
        codes.includes(timetableTermCode)
      );
      if (termIndex === -1) {
        continue;
      }
      const subjectTimeslotTable = subject.timeslotTables[termIndex];
      for (let day = 0; day < table.length; day++) {
        for (let period = 0; period < table[day].length; period++) {
          // 科目がコマを含めば追加
          if (subjectTimeslotTable[day][period]) {
            table[day][period] = true;
            subjectTable[day][period].push(subject);
          }
        }
      }
      credits += subject.credit;
      timeslots += getTimeslotsLength(subjectTimeslotTable);
    }
    return [table, subjectTable, credits, timeslots];
  }, [bookmarks, timetableTermCode]);

  const bookmarksHas = useCallback(
    (subjectCode: string) => subjectCode in bookmarks.subjects,
    [bookmarks]
  );

  const switchBookmark = (subjectCode: string) => {
    const newBookmarks = structuredClone(bookmarks);
    if (subjectCode in newBookmarks.subjects) {
      delete newBookmarks.subjects[subjectCode];
    } else {
      const subject = kdb.subjectMap[subjectCode];
      if (!subject) {
        return;
      }
      newBookmarks.subjects[subjectCode] = createEmptyBookmarkSubject();
      const termCode = subject.termCodes[0]?.[0];
      if (termCode !== undefined) {
        setTimetableTermCode(termCode);
      }
    }
    setBookmarks(newBookmarks);
    saveBookmarks(newBookmarks);
  };

  const clearBookmarks = () => {
    const ok = window.confirm(
      "すべてのお気に入りの科目が削除されます。よろしいですか？"
    );
    if (ok) {
      localStorage.removeItem(BOOKMARK_KEY);
      setBookmarks(createEmptyBookmarks());
    }
  };

  const exportToTwinte = () => {
    // cf. https://github.com/twin-te/twinte-front/pull/529
    const baseUrl = "https://app.twinte.net/import?codes=";
    const codes = Object.keys(bookmarks.subjects);
    window.open(baseUrl + codes.join(","));
  };

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  return {
    bookmarkTimeslotTable,
    bookmarkSubjectTable,
    totalCredits,
    currentCredits,
    currentTimeslots,
    bookmarksHas,
    switchBookmark,
    clearBookmarks,
    exportToTwinte,
  };
};
