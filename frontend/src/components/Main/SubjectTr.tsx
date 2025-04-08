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

const Td = styled.td`
  vertical-align: top;
  padding: 4px 8px 4px 0;
  border-bottom: solid 1px #ccc;

  &:nth-of-type(6),
  &:nth-of-type(7) {
    line-height: 1.3em;
    font-size: 0.6rem;
  }
`;

const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

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

const Star = styled.a<{ enabled: boolean }>`
  line-height: 1;
  color: ${(props) => (props.enabled ? colorPurple : "#aaa")};
  font-size: 1.2rem;

  &:hover {
    opacity: 0.8;
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

const YearSelect = styled.select`
  height: 24px;
  text-decoration: none;
  font-size: 14px;
  font-family: inherit;
  margin-left: 8px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  box-shadow: ${shallowShadow};
  display: flex;
  box-sizing: border-box;
  appearance: none;
`;

interface SubjectTrProps {
  subject: Subject;
  bookmarksHas: (subjectCode: string) => boolean;
  switchBookmark: (subjectCode: string) => void;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const SubjectTr = React.memo(
  ({
    subject,
    bookmarksHas,
    switchBookmark,
    setSearchOptions,
  }: SubjectTrProps) => {
    // TODO: 科目区分を科目番号の隣に表示（情報学群 のように）

    return (
      <tr key={subject.code}>
        <Td>
          {subject.code}
          <br />
          {subject.name}
          <br />
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
            {bookmarksHas(subject.code) && (
              <YearSelect>
                {[2021, 2022, 2023, 2024, 2025].map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </YearSelect>
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
          {subject.classMethods.map((method, i, array) => (
            <React.Fragment key={i}>
              {method}
              {i < array.length && <br />}
            </React.Fragment>
          ))}
        </Td>
        <Td>{subject.abstract}</Td>
        <Td>{subject.note}</Td>
      </tr>
    );
  }
);

export default SubjectTr;
