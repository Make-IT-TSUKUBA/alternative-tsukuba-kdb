import { useCallback, useEffect, useMemo, useState } from "react";
import { kdb } from "./subject";
import { createEmptyTimeslotTable } from "./timetable";

const BOOKMARK_KEY = "kdb_bookmarks";

const getBookmarks = () => {
  const value = localStorage.getItem(BOOKMARK_KEY);
  const array =
    value !== null
      ? decodeURIComponent(value)
          .split(",")
          .filter((code) => code !== "")
      : [];
  return new Set(array);
};

const localStorageBookmarks = getBookmarks();

const saveBookmarks = (bookmarks: Set<string>) => {
  const value = [...bookmarks].join(",");
  localStorage.setItem(BOOKMARK_KEY, encodeURIComponent(value));
};

export const useBookmark = (
  timetableTermCode: number,
  setTimetableTermCode: React.Dispatch<React.SetStateAction<number>>
) => {
  const [bookmarks, setBookmarks] = useState(localStorageBookmarks);

  const bookmarkTimeslotTable = useMemo(() => {
    const table = createEmptyTimeslotTable();
    for (const code of bookmarks) {
      const subject = kdb.subjectMap[code];
      if (!subject) {
        continue;
      }
      const termIndex = subject.termCodes.findIndex((codes) =>
        codes.includes(timetableTermCode)
      );
      if (termIndex === -1) {
        continue;
      }
      const subjectTable = subject.timeslotTables[termIndex];
      for (let day = 0; day < table.length; day++) {
        for (let period = 0; period < table[day].length; period++) {
          // 科目がコマを含めば追加
          if (subjectTable[day][period]) {
            table[day][period] = true;
          }
        }
      }
    }
    return table;
  }, [bookmarks, timetableTermCode]);

  const switchBookmark = useCallback(
    (subjectCode: string) => {
      const newBookmarks = structuredClone(bookmarks);
      if (newBookmarks.has(subjectCode)) {
        newBookmarks.delete(subjectCode);
      } else {
        newBookmarks.add(subjectCode);
        const subject = kdb.subjectMap[subjectCode];
        if (subject) {
          const termCode = subject.termCodes[0]?.[0];
          if (termCode !== undefined) {
            setTimetableTermCode(termCode);
          }
        }
      }
      setBookmarks(newBookmarks);
      saveBookmarks(newBookmarks);
    },
    [bookmarks, setTimetableTermCode]
  );

  const clearBookmarks = useCallback(() => {
    const ok = window.confirm(
      "すべてのお気に入りの科目が削除されます。よろしいですか？"
    );
    if (ok) {
      localStorage.removeItem(BOOKMARK_KEY);
      setBookmarks(new Set());
    }
  }, []);

  const exportToTwinte = useCallback(() => {
    // cf. https://github.com/twin-te/twinte-front/pull/529
    const baseUrl = "https://app.twinte.net/import?codes=";
    window.open(baseUrl + [...bookmarks].join(","));
  }, [bookmarks]);

  return {
    bookmarks,
    bookmarkTimeslotTable,
    switchBookmark,
    clearBookmarks,
    exportToTwinte,
  };
};
