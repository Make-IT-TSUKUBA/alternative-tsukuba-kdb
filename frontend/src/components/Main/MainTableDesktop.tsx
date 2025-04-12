import styled from "@emotion/styled";

import type { SearchOptions } from "@/utils/search";
import { colorPurple, colorPurpleDark, mobileMedia } from "@/utils/style";
import { type Subject, kdb } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import SubjectTr from "./SubjectTr";
import { BottomTd } from "./parts";

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

  th,
  td {
    text-align: left;
    font-weight: normal;

    &:first-of-type {
      width: 16rem;
    }

    &:nth-of-type(2) {
      width: 5rem;
    }

    &:nth-of-type(3) {
      width: 5rem;
    }

    &:nth-of-type(4) {
      width: 6rem;
    }

    &:nth-of-type(5) {
      width: 6rem;
    }

    &:nth-of-type(6) {
      width: 18rem;
    }
  }
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

const Classrooms = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    opacity: 0.8;
  }
`;

const Plus = styled.span`
  width: 16px;
  height: 16px;
  color: ${colorPurple};
  font-size: 12px;
  font-weight: bold;
  margin-top: 2px;
  border-radius: 50%;
  background: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  span {
    text-box: trim-both cap alphabetic;
  }
`;

interface MainTableDesktopProps {
  subjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setIsImporting: React.Dispatch<React.SetStateAction<boolean>>;
  getClassroom: (subjectCode: string) => string | null;
}

const MainTableDesktop = ({
  subjects,
  hasMore,
  loadingRef,
  usedBookmark,
  setSearchOptions,
  setIsImporting,
  getClassroom,
}: MainTableDesktopProps) => {
  return (
    <Table>
      <thead>
        <tr>
          <Th>科目番号／科目名</Th>
          <Th>単位／年次</Th>
          <Th>学期／時限</Th>
          <Th>担当</Th>
          <Th onClick={() => setIsImporting(true)}>
            <Classrooms>
              実施教室
              <Plus>
                <span>＋</span>
              </Plus>
            </Classrooms>
          </Th>
          <Th>概要</Th>
          <Th>備考</Th>
        </tr>
      </thead>
      <tbody>
        {subjects.map((subject) => (
          <SubjectTr
            subject={subject}
            usedBookmark={usedBookmark}
            setSearchOptions={setSearchOptions}
            getClassroom={getClassroom}
            key={subject.code}
          />
        ))}
        <tr ref={loadingRef}>
          <BottomTd>
            {hasMore
              ? "Loading..."
              : `全 ${kdb?.subjectCodeList.length} 件中 ${subjects.length} 件を表示しました`}
          </BottomTd>
        </tr>
      </tbody>
    </Table>
  );
};

export default MainTableDesktop;
