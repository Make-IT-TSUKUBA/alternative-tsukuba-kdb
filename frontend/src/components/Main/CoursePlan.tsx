import styled from "@emotion/styled";
import React, { useMemo } from "react";

import {
  colorPurple,
  colorPurpleDark,
  mobileMedia,
  shallowShadow,
} from "@/utils/style";
import type { Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomRow, BottomTd, Star, Td, YearSelect, years } from "./parts";

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

    &:nth-of-type(1) {
      width: 3rem;
    }

    &:nth-of-type(2) {
      width: 18rem;
    }

    &:nth-of-type(3) {
      width: 10rem;
    }

    &:nth-of-type(4) {
      width: 6rem;
    }

    &:nth-of-type(5) {
      width: 10rem;
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

const Season = styled.div`
  padding: 4px 0;
  text-align: center;
  border-radius: 4px;

  &[data-season="year-round"] {
    background: #f0f0f0;
  }
  &[data-season="spring"] {
    background: #ffe6f7;
  }
  &[data-season="autumn"] {
    background: #ffedd6;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  font-family: inherit;
  border: none;
  border-radius: 4px;
  box-shadow: ${shallowShadow};
  display: block;
`;

interface CoursePlanProps {
  subjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
}

const CoursePlan = ({ subjects, usedBookmark }: CoursePlanProps) => {
  const {
    yearCredits,
    totalCredits,
    bookmarksHas,
    getBookmarkSubject,
    switchBookmark,
    updateBookmark,
  } = usedBookmark;

  const yearSubjects = useMemo(() => {
    // 年度毎に集計
    const record: Record<number, Subject[]> = {};
    for (const subject of subjects) {
      const bookmark = getBookmarkSubject(subject.code);
      if (bookmark) {
        if (!record[bookmark.year]) {
          record[bookmark.year] = [];
        }
        record[bookmark.year].push(subject);
      }
    }

    // 年度毎にソート
    for (const year in record) {
      record[year].sort((a, b) =>
        a.termStr.includes("通年")
          ? -1
          : a.termStr.includes("春") && !b.termStr.includes("春")
          ? -1
          : a.termStr < b.termStr
          ? -1
          : 1
      );
    }
    return record;
  }, [subjects, getBookmarkSubject]);

  return (
    <Table>
      <thead>
        <tr>
          <Th />
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
              <YearTd colSpan={2}>
                {key} 年度（{yearCredits[Number.parseInt(key)] ?? 0} 単位）
              </YearTd>
            </tr>
            {subjects.map((subject) => {
              const bookmarkSubject = getBookmarkSubject(subject.code);
              const isSpring = subject.termStr.includes("春");
              const isAutumn = subject.termStr.includes("秋");
              const isYearRound =
                subject.termStr.includes("通年") || (isSpring && isAutumn);

              return (
                <tr key={subject.code}>
                  <Td css={{ verticalAlign: "middle" }}>
                    <Season
                      data-season={
                        isYearRound
                          ? "year-round"
                          : isSpring
                          ? "spring"
                          : "autumn"
                      }
                    >
                      {isYearRound ? (
                        "通年"
                      ) : (
                        <>
                          {isSpring && "春"}
                          {isAutumn && "秋"}
                        </>
                      )}
                    </Season>
                  </Td>
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
        <tr>
          <BottomTd colSpan={5}>計 {totalCredits} 単位</BottomTd>
          <br />：
        </tr>
      </tbody>
    </Table>
  );
};

export default CoursePlan;
