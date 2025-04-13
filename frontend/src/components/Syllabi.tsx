import styled from "@emotion/styled";

import { colorPurpleDark, shadow } from "@/utils/style";
import { kdb } from "@/utils/subject";
import { useEffect, useState } from "react";

const Wrapper = styled.div`
  width: 400px;
  height: calc(100% - 16px);
  line-height: 1.5;
  font-size: 14px;
  border-radius: 8px 8px 0 0;
  box-shadow: ${shadow};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  overflow: hidden;

  position: fixed;
  bottom: 0;
  right: 16px;

  h2 {
    color: ${colorPurpleDark};
    font-size: 14px;
    margin: 20px 0 8px 0;
    padding-bottom: 4px;
    border-bottom: solid 1px hsla(270, 100%, 40%, 0.2);

    &:before {
      content: "";
      margin-left: -8px;
      padding-left: 8px;
    }
  }

  #summary-heading-summary-contents h2 {
    margin-top: 0;
  }

  p {
    margin: 0;
  }

  table {
    margin: 8px 0;
  }
`;

const Header = styled.div`
  padding: 16px 20px 12px 20px;
  border-top: solid 6px hsla(270, 100%, 40%, 0.7);
`;

const H1 = styled.h1`
  font-size: 20px;
  font-weight: normal;
  margin: 0 0 4px 0;
`;

const Description = styled.div`
  margin: 0;
`;

const SyllabusLink = styled.a`
  color: #666;
  text-decoration-color: #ccc;
  text-underline-offset: 4px;
  display: block;
  text-align: right;
`;

const Close = styled.a`
  color: #999;
  font-size: 20px;
  position: absolute;
  top: 12px;
  right: 16px;

  &:hover {
    opacity: 0.8;
  }
`;

const Content = styled.div`
  padding: 0 20px 16px 20px;
  flex-grow: 1;
  overflow-y: scroll;
`;

interface SyllabiProps {
  subjectCode: string | null;
  setSubjectCode: React.Dispatch<React.SetStateAction<string | null>>;
}

const Syllabi = ({ subjectCode, setSubjectCode }: SyllabiProps) => {
  const [content, setContent] = useState("");

  const subject = kdb.subjectMap[subjectCode as string];

  useEffect(() => {
    (async () => {
      if (!subjectCode) {
        return;
      }

      const response = await fetch(
        `https://kdb-backend.yokohama.dev/syllabi/${subjectCode}`,
      );
      let data = await response.text();

      // 不要な要素を除去
      data = data
        .replace(/<head>.+?<\/head>/gms, "")
        .replace(/<script.*?>.+?<\/script>/gms, "")
        .replace(/<style.*?>.+?<\/style>/gms, "");

      // 不要なテキストを除去
      data = data
        .replace(/<h1.*?>.+?<\/h1>/ms, "")
        .replace(/<h2.*?>シラバス参照<\/h2>/ms, "")
        .replace(/<div id="credit-grade-assignments">.+?<\/div>/ms, "")
        .replace(/<table.*?>.+?<\/table>/ms, "");
      console.log(data);

      setContent(data);
    })();
  }, [subjectCode]);

  if (!subjectCode || !subject) {
    return <></>;
  }

  return (
    <Wrapper>
      <Header>
        <H1>{subject.name}</H1>
        <Description>
          {subject.code} / {subject.credit} 単位、{subject.year} 年次、
          {subject.termStr} {subject.timeslotStr}
          <br />
          {subject.person.split(",").join("、")}
        </Description>
        <SyllabusLink
          href={subject.syllabusHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          公式シラバスで参照
        </SyllabusLink>
        <Close onClick={() => setSubjectCode(null)}>×</Close>
      </Header>
      {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
      <Content dangerouslySetInnerHTML={{ __html: content }}></Content>
    </Wrapper>
  );
};

export default Syllabi;
