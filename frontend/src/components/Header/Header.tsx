import styled from "@emotion/styled";
import React, { useState } from "react";

import type { SearchOptions } from "@/utils/search";
import { mobileMedia, mobileWidth } from "@/utils/style";
import type { TimeslotTable } from "@/utils/timetable";
import { useMedia } from "react-use";
import DesktopForm from "./desktop/DesktopForm";
import MobileForm from "./mobile/MobileForm";

const Wrapper = styled.header`
  width: 100%;
  background: linear-gradient(
    90deg,
    rgba(242, 230, 255, 0.95),
    rgba(255, 255, 255, 0.95) 250px
  );
`;

const Content = styled.div`
  width: 1100px;
  margin: auto;
  padding: 10px 1rem 12px 1rem;
  position: relative;

  ${mobileMedia} {
    width: calc(100% - 2rem);
  }
`;

interface HeaderProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  displaysPlan: boolean;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplaysPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = React.memo(
  ({
    searchOptions,
    bookmarkTimeslotTable,
    displaysPlan,
    setSearchOptions,
    setDisplaysPlan,
  }: HeaderProps) => {
    const [displaysTimeslotSelection, setDisplaysTimeslotSelection] =
      useState(false);

    const isMobile = useMedia(`(width < ${mobileWidth})`);

    return (
      <Wrapper>
        <Content>
          {isMobile ? (
            <MobileForm
              searchOptions={searchOptions}
              bookmarkTimeslotTable={bookmarkTimeslotTable}
              displaysTimeslotSelection={displaysTimeslotSelection}
              setSearchOptions={setSearchOptions}
              setDisplaysTimeslotSelection={setDisplaysTimeslotSelection}
            />
          ) : (
            <DesktopForm
              searchOptions={searchOptions}
              bookmarkTimeslotTable={bookmarkTimeslotTable}
              displaysTimeslotSelection={displaysTimeslotSelection}
              displaysPlan={displaysPlan}
              setSearchOptions={setSearchOptions}
              setDisplaysTimeslotSelection={setDisplaysTimeslotSelection}
              setDisplaysPlan={setDisplaysPlan}
            />
          )}
        </Content>
      </Wrapper>
    );
  }
);

export default Header;
