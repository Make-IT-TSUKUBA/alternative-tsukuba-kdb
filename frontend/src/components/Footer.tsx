import styled from "@emotion/styled";
import React, { useRef } from "react";

import { mobileMedia } from "@/utils/style";
import { type Subject, outputSubjectsToCSV } from "@/utils/subject";

const Wrapper = styled.footer`
  line-height: 1.8;
  text-align: center;
  margin: 16px 0 80px 0;

  ${mobileMedia} {
    line-height: 1.5;
    text-align: left;
    font-size: 14px;
    margin: 8px 20px 90px 20px;
  }

  a {
    color: #666;
    text-decoration: underline;
  }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Slash = styled.span`
  color: #ccc;
  margin: 0 8px;
`;

interface FooterProps {
  filteredSubjects: Subject[];
}

const Footer = React.memo(({ filteredSubjects }: FooterProps) => {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  return (
    <Wrapper>
      <List>
        <li>
          Source code is available on{" "}
          <a href="https://github.com/Make-IT-TSUKUBA/alternative-tsukuba-kdb">
            GitHub
          </a>
          .
        </li>
        <li>
          Contributed by{" "}
          <a href="https://github.com/inaniwaudon">いなにわうどん</a>,{" "}
          <a href="https://github.com/frodo821">frodo821</a>,{" "}
          <a href="https://github.com/eggplants">eggplants</a>,{" "}
          <a href="https://github.com/maru2213">maru2213</a>,{" "}
          <a href="https://github.com/itsu-dev">Itsu</a>,{" "}
          <a href="https://github.com/Mimori256">Mimori256</a> et al.
          <Slash>/</Slash>
          <a
            ref={anchorRef}
            onClick={() =>
              outputSubjectsToCSV(filteredSubjects, anchorRef.current)
            }
          >
            CSV ダウンロード
          </a>
        </li>
      </List>
    </Wrapper>
  );
});

export default Footer;
