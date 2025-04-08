import styled from "@emotion/styled";

import type { SearchOptions } from "@/utils/search";
import { colorPurpleDark, mobileMedia } from "@/utils/style";
import { type Subject, kdb } from "@/utils/subject";
import type { useBookmark } from "@/utils/useBookmark";
import SubjectTr from "./SubjectTr";

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

const LoadingTd = styled.td`
  padding-top: 4px;
`;

interface MainTableDesktopProps {
  subjects: Subject[];
  filteredSubjects: Subject[];
  hasMore: boolean;
  loadingRef: React.RefObject<HTMLTableRowElement | null>;
  usedBookmark: ReturnType<typeof useBookmark>;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const MainTableDesktop = ({
  subjects,
  filteredSubjects,
  hasMore,
  loadingRef,
  usedBookmark,
  setSearchOptions,
}: MainTableDesktopProps) => {
  return (
    <Table>
      <thead>
        <tr>
          <Th>科目番号／科目名</Th>
          <Th>単位／年次</Th>
          <Th>学期／時限</Th>
          <Th>担当</Th>
          <Th>実施形態</Th>
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
            key={subject.code}
          />
        ))}
        <tr ref={loadingRef}>
          <LoadingTd>
            {hasMore
              ? "Loading..."
              : `全 ${kdb?.subjectCodeList.length} 件中 ${filteredSubjects.length} 件を表示しました`}
          </LoadingTd>
        </tr>
      </tbody>
    </Table>
  );
};

export default MainTableDesktop;
