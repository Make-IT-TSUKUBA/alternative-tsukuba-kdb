import styled from "@emotion/styled";

import type { SearchOptions } from "@/utils/search";
import {
  colorPurple,
  colorPurpleDark,
  mobileMedia,
  shallowShadow,
} from "@/utils/style";
import { type Subject, kdb } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import {} from "./SubjectTr";
import { BottomRow, Star, Td, YearSelect, years } from "./parts";
import React, { useMemo } from "react";

const Table = styled.table`
  width: 100%;
  font-size: 14px;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
  overflow-x: scroll;

  ${mobileMedia} {
    display: none;
  }

  th {
    font-weight: bold;
  }

  th,
  td {
    text-align: left;

    &:first-of-type {
      width: 16rem;
    }

    &:nth-of-type(2) {
      width: 14rem;
    }

    &:nth-of-type(3) {
      width: 5rem;
    }

    &:nth-of-type(4) {
      width: 6rem;
    }

    &:nth-of-type(5) {
    }
  }
`;

const YearTd = styled.td`
  font-weight: bold;
  padding: 16px 0 4px 0;
  border-bottom: 3px solid ${colorPurple};
`;

const Th = styled.th`
  height: 16px;
  color: #fff;
  padding: 4px 0 6px 0;
  background: ${colorPurpleDark};

  &:first-of-type {
    padding-left: 8px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  &:last-of-type {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`;

const Textarea = styled.textarea`
  font-family: inherit;
  border: none;
  border-radius: 4px;
  box-shadow: ${shallowShadow};
  display: block;
`;

const LoadingTd = styled.td`
  padding-top: 4px;
`;

interface CoursePlanProps {
  subjects: Subject[];
  filteredSubjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const CoursePlan = ({
  subjects,
  filteredSubjects,
  hasMore,
  loadingRef,
  usedBookmark,
  setSearchOptions,
}: CoursePlanProps) => {
  const {
    totalCredits,
    bookmarksHas,
    getBookmarkSubject,
    switchBookmark,
    updateBookmark,
  } = usedBookmark;

  const yearSubjects = useMemo(() => {
    const record: Record<number, Subject[]> = {};
    for (const subject of filteredSubjects) {
      const bookmark = getBookmarkSubject(subject.code);
      if (bookmark) {
        if (!record[bookmark.year]) {
          record[bookmark.year] = [];
        }
        record[bookmark.year].push(subject);
      }
    }
    return record;
  }, [filteredSubjects, getBookmarkSubject]);

  return (
    <Table>
      <thead>
        <tr>
          <Th>科目番号／科目名</Th>
          <Th />
          <Th>単位／年次</Th>
          <Th>実施形態</Th>
          <Th>メモ</Th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(yearSubjects).map(([key, subjects]) => (
          <React.Fragment key={key}>
            <tr>
              <YearTd>{key} 年度</YearTd>
            </tr>
            {subjects.map((subject) => {
              const bookmarkSubject = getBookmarkSubject(subject.code);

              return (
                <tr key={subject.code}>
                  <Td>
                    {subject.code}
                    <br />
                    {subject.name}
                  </Td>
                  <Td css={{ verticalAlign: "middle" }}>
                    <BottomRow>
                      <Star
                        enabled={bookmarksHas(subject.code)}
                        onClick={() => switchBookmark(subject.code)}
                      >
                        ★
                      </Star>
                      {bookmarkSubject && (
                        <>
                          <YearSelect
                            value={bookmarkSubject.year}
                            onChange={(e) =>
                              updateBookmark(subject.code, {
                                year: Number.parseInt(e.currentTarget.value),
                              })
                            }
                          >
                            {years.map((year) => (
                              <option key={year}>{year}</option>
                            ))}
                          </YearSelect>
                          <label>
                            <input
                              type="checkbox"
                              checked={bookmarkSubject.ta}
                              onChange={(e) =>
                                updateBookmark(subject.code, {
                                  ta: e.currentTarget.checked,
                                })
                              }
                            />{" "}
                            TA
                          </label>
                        </>
                      )}
                    </BottomRow>
                  </Td>
                  <Td>
                    {subject.credit.toFixed(1)} 単位
                    <br />
                    {subject.year} 年次
                  </Td>
                  <Td>
                    {subject.termStr} {subject.timeslotStr}
                    <br />
                    {subject.classMethods.join(", ")}
                  </Td>
                  <Td>
                    <Textarea />
                  </Td>
                </tr>
              );
            })}
          </React.Fragment>
        ))}
        <tr>計 {totalCredits} 単位</tr>
      </tbody>
    </Table>
  );
};

export default CoursePlan;
