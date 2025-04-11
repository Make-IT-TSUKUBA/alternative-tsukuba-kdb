import styled from "@emotion/styled";
import { createRef, type RefObject, useEffect, useMemo, useRef } from "react";

import { BottomRow, Star, Td, years, YearSelect } from "../parts";
import type { useBookmark } from "@/utils/useBookmark";
import type { Subject } from "@/utils/subject";
import { shallowShadow } from "@/utils/style";

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
  height: 2lh;
  font-family: inherit;
  padding: 4px;
  border: none;
  border-radius: 4px 8px;
  box-sizing: border-box;
  box-shadow: ${shallowShadow};
  display: block;
`;

interface SubjectTrProps {
  subject: Subject;
  usedBookmark: ReturnType<typeof useBookmark>;
}

const SubjectTr = ({ subject, usedBookmark }: SubjectTrProps) => {
  const {
    memoLength,
    bookmarksHas,
    getBookmarkSubject,
    switchBookmark,
    updateBookmark,
  } = usedBookmark;

  const bookmarkSubject = useMemo(
    () => getBookmarkSubject(subject.code),
    [getBookmarkSubject, subject.code]
  );
  if (!bookmarkSubject) {
    return <></>;
  }

  const isSpring = subject.termStr.includes("春");
  const isAutumn = subject.termStr.includes("秋");
  const isYearRound =
    subject.termStr.includes("通年") || (isSpring && isAutumn);

  return (
    <tr key={subject.code}>
      <Td css={{ verticalAlign: "middle" }}>
        <Season
          data-season={
            isYearRound ? "year-round" : isSpring ? "spring" : "autumn"
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
        {subject.code}（{subject.credit.toFixed(1)} 単位）
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
        </BottomRow>
      </Td>
      <Td>
        {subject.termStr} {subject.timeslotStr}
        <br />
        {subject.classMethods.join(", ")}
      </Td>
      {[...Array(memoLength)].map((_, i) => (
        <Td key={i}>
          <Textarea
            value={bookmarkSubject.memos[i] ?? ""}
            data-index={i}
            onChange={(e) => {
              const memos = [...bookmarkSubject.memos];
              memos[i] = e.currentTarget.value;
              updateBookmark(subject.code, { memos });
            }}
          />
        </Td>
      ))}
    </tr>
  );
};

export default SubjectTr;
