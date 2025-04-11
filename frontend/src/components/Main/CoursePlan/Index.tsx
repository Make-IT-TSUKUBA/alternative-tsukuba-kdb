import styled from "@emotion/styled";
import React, { useMemo } from "react";

import { colorPurple, colorPurpleDark, mobileMedia } from "@/utils/style";
import type { Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomTd } from "../parts";
import SubjectTr from "./SubjectTr";

const Wrapper = styled.div`
  width: 100%;
  overflow-x: scroll;
`;

const Table = styled.table`
  max-width: 200%;
  vertical-align: middle;
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

    input {
      width: 100%;
      color: #fff;
      border: none;
      border-bottom: solid 1px rgba(255, 255, 255, 0.2);
      background: transparent;
    }
  }

  th,
  td {
    text-align: left;
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

const Description = styled.div`
  line-height: 1.5;
  font-size: 14px;
  margin-top: 16px;

  p {
    margin: 0;
  }

  p + p {
    margin-top: 8px;
  }
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
    memoHeaders,
    memoLength,
    memoTotals,
    memoSlashLineCredits,
    getBookmarkSubject,
    updateMemoHeaders,
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
              : 1,
      );
    }
    return record;
  }, [subjects, getBookmarkSubject]);

  return (
    <Wrapper>
      <Table>
        <colgroup>
          <col css={{ width: "4em", minWidth: "4em" }} />
          <col css={{ width: "20em", minWidth: "20em" }} />
          <col css={{ width: "12em", minWidth: "12em" }} />
          <col css={{ width: "12em", minWidth: "12em" }} />
          {[...Array(memoLength)].map((_, i) => (
            <col
              css={{
                width: `calc((1100px - 4em - 20em - 12em - 12em) / ${memoLength})`,
                minWidth: `calc((1100px - 4em - 20em - 12em - 12em) / ${memoLength})`,
              }}
              key={i}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            <Th />
            <Th>科目番号／科目名／単位</Th>
            <Th />
            <Th>実施形態</Th>
            {[...Array(memoLength)].map((_, i) => (
              <Th key={i}>
                <input
                  type="text"
                  value={memoHeaders[i] ?? ""}
                  onChange={(e) => {
                    const newHeaders = [...memoHeaders];
                    newHeaders[i] = e.target.value;
                    updateMemoHeaders(newHeaders);
                  }}
                />
              </Th>
            ))}
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
              {subjects.map((subject) => (
                <SubjectTr
                  subject={subject}
                  usedBookmark={usedBookmark}
                  key={subject.code}
                />
              ))}
            </React.Fragment>
          ))}
          <tr>
            <BottomTd colSpan={4}>
              計 {totalCredits} 単位
              <br />
              {Object.entries(memoSlashLineCredits).map(
                ([key, credits], i, array) => (
                  <React.Fragment key={key}>
                    {key}：{credits} 単位
                    {i < array.length - 1 && <br />}
                  </React.Fragment>
                ),
              )}
            </BottomTd>
            {[...Array(memoLength)].map((_, i) => (
              <BottomTd key={i}>{memoTotals[i]}</BottomTd>
            ))}
          </tr>
        </tbody>
      </Table>
      <Description>
        <p>
          「TA」にチェックを入れると，時間割には反映されますが，単位数からは除外されます．
        </p>
        <p>
          右側のテキストボックスはメモ用にお使いください．
          <br />
          数値を入力した場合，フッタに列の合計値が表示されます．
          <br />
          また，「/必修」のように行がスラッシュから始まる場合，その行を含む科目の単位数の合計値が表示されます．
        </p>
      </Description>
    </Wrapper>
  );
};

export default CoursePlan;
