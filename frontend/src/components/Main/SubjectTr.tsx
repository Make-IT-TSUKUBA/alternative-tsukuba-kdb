import styled from "@emotion/styled";
import React from "react";

import type { SearchOptions } from "@/utils/search";
import {
  colorPurple,
  colorPurpleDark,
  colorPurpleGradient,
  shallowShadow,
} from "@/utils/style";
import type { Subject } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import { BottomRow, Star, Td, YearSelect, years } from "./parts";

const Link = styled.a`
  height: 24px;
  color: ${colorPurpleDark};
  text-align: center;
  text-decoration: none;
  font-size: 13px;
  margin: 4px 0;
  padding: 0 6px 0 6px;
  border-radius: 12px;
  box-shadow: ${shallowShadow};
  background: ${colorPurpleGradient};
  display: inline-flex;
  align-items: center;

  &:hover {
    color: #fff;
    background: ${colorPurple};
  }

  span {
    text-box: trim-both cap alphabetic;
  }
`;

const Anchor = styled.a`
  color: #666;
  text-decoration-color: #ddd;
  text-underline-offset: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const ClassMethods = styled.div`
  line-height: 1.4;
`;

const Classrooms = styled.div`
  line-height: 1.2;
  color: #666;
  font-size: 12px;
  margin-top: 2px;
`;

interface SubjectTrProps {
  subject: Subject;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  getClassroom: (subjectCode: string) => string | null;
}

const SubjectTr = React.memo(
  ({
    subject,
    usedBookmark,
    setSearchOptions,
    getClassroom,
  }: SubjectTrProps) => {
    const { bookmarksHas, getBookmarkSubject, switchBookmark, updateBookmark } =
      usedBookmark;

    const bookmarkSubject = getBookmarkSubject(subject.code);
    const classrooms = getClassroom(subject.code)?.split(",") ?? [];

    // TODO: 科目区分を科目番号の隣に表示（情報学群 のように）

    return (
      <tr key={subject.code}>
        <Td>
          {subject.code}
          <br />
          {subject.name}
          <BottomRow>
            <Link href={subject.syllabusHref} target="_blank">
              <span>シラバス</span>
            </Link>
            {/*TODO: <Link href="">
							<span>ポップアップ</span>
						</Link>*/}
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
          {subject.termStr}
          <br />
          {subject.timeslotStr}
        </Td>
        <Td>
          {subject.person.split(",").map((person, i, array) => (
            <React.Fragment key={i}>
              <Anchor
                href="#"
                onClick={() =>
                  setSearchOptions((prev) => ({
                    ...prev,
                    keyword: person,
                    containsPerson: true,
                  }))
                }
              >
                {person}
              </Anchor>
              {i < array.length && <br />}
            </React.Fragment>
          ))}
        </Td>
        <Td>
          <ClassMethods>
            {subject.classMethods.map((method, i, array) => (
              <React.Fragment key={i}>
                {method}
                {i < array.length && <br />}
              </React.Fragment>
            ))}
          </ClassMethods>
          <Classrooms>
            {classrooms.map((classroom, i, array) => (
              <React.Fragment key={i}>
                {classroom}
                {i < array.length && <br />}
              </React.Fragment>
            ))}
          </Classrooms>
        </Td>
        <Td>{subject.abstract}</Td>
        <Td>{subject.note}</Td>
      </tr>
    );
  },
);

export default SubjectTr;
