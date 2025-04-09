import styled from "@emotion/styled";
import { useEffect, useMemo, useState } from "react";
import { useMedia } from "react-use";

import {
  colorPurpleDark,
  mobileMedia,
  mobileWidth,
  shadow,
} from "@/utils/style";
import { type Subject, kdb } from "@/utils/subject";
import {
  type Timetable,
  daysofweek,
  fillTimetable,
  getTimeslotsLength,
  maxPeriod,
} from "@/utils/timetable";
import type { useBookmark } from "@/utils/useBookmark";
import Header from "./Header";

const Wrapper = styled.div`
  width: 400px;
  position: fixed;
  bottom: 0;
  right: 16px;

  ${mobileMedia} {
    width: calc(100% - 16px * 2);
    max-width: 400px;
    right: 16px;
  }
`;

const TimetableWrapper = styled.div`
  border-radius: 8px;
  box-shadow: ${shadow};
  background: #fff;
  display: flex;
  overflow: hidden;
  transition: margin-bottom 0.5s ease;
  position: relative;
  z-index: 1;

  &[data-closed="true"] {
    margin-bottom: -338px;
  }
`;

const Main = styled.div`
  flex: 1;
  display: flex;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0;
  justify-content: space-between;
  align-items: center;
`;

const PeriodColumn = styled(Column)`
  flex: 32px 0 0;
  font-size: 14px;
  text-align: center;
  box-shadow: ${shadow};
`;

const MainColumn = styled(Column)`
  flex: calc(100% / ${daysofweek.length}) 0 0;
  border-left: solid 1px #ddd;
`;

const Day = styled.div`
  height: 24px;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;

  span {
    text-box: trim-both cap alphabetic;
  }
`;

const Item = styled.div`
  width: 100%;
  height: 50px;
  border-top: solid 1px #eee;
  position: relative;
`;

const PeriodItem = styled(Item)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Time = styled.time`
  color: #999;
  line-height: 11px;
  font-size: 9px;
  margin-bottom: 3px;
  display: block;
`;

const SubjectTile = styled.div<{ background: string; top: number }>`
  width: calc(100% - 3px * 2 - 6px * 2);
  height: calc(100% - 3px * 2 - 4px * 2);
  line-height: 10px;
  font-size: 8px;
  word-break: break-all;
  padding: 4px 6px;
  border-radius: 4px;
  background: ${({ background }) => background};
  overflow: hidden;
  position: absolute;
  top: ${({ top }) => 3 + top}px;
  left: 3px;

  a {
    color: #000;
    text-decoration: none;
  }

  &:hover .close {
    display: block;
  }
`;

const Close = styled.a`
  width: 14px;
  height: 14px;
  line-height: 14px;
  color: #c00;
  font-size: 14px;
  position: absolute;
  top: 2px;
  right: 2px;
  display: none;

  &:hover {
    opacity: 0.6;
  }
`;

const Footer = styled.footer`
  height: 16px;
  line-height: 14px;
  margin: 8px 0 -8px 0;
  padding: 8px 0 18px 0;
  border-radius: 8px;
  box-shadow: ${shadow};
  background: #fff;
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
`;

const Link = styled.a<{ caution?: boolean }>`
  flex-grow: 1;
  height: 16px;
  color: ${({ caution }) => (caution ? "#c00" : colorPurpleDark)};
  text-decoration: none;
  font-size: 13px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    opacity: 0.8;
  }

  &:not(:last-of-type) {
    border-right: solid 1px #eee;
  }

  span {
    text-box: trim-both cap alphabetic;
  }
`;

const times = [
  ["8:40", "9:55"],
  ["10:10", "11:25"],
  ["12:15", "13:30"],
  ["13:45", "15:00"],
  ["15:15", "16:30"],
  ["16:45", "18:00"],
];

interface TimetableProps {
  termCode: number;
  usedBookmark: ReturnType<typeof useBookmark>;
  setTermCode: React.Dispatch<React.SetStateAction<number>>;
}

const TimetableElement = ({
  usedBookmark,
  termCode,
  setTermCode,
}: TimetableProps) => {
  const { bookmarks, switchBookmark, clearBookmarks, exportToTwinte } =
    usedBookmark;

  const isMobile = useMedia(`(width < ${mobileWidth})`);

  const [opened, setOpened] = useState(!isMobile);
  const [timetable, setTimetable] = useState<Timetable<Subject[]>>(
    fillTimetable<Subject[]>([]),
  );
  const [currentCredits, setCurrentCredits] = useState(0);
  const [currentTimeslots, setCurrentTimeslots] = useState(0);

  // 全タームを通した単位数の合計
  const totalCredits = useMemo(() => {
    let credits = 0;
    for (const bookmark of bookmarks) {
      const subject = kdb.subjectMap[bookmark];
      if (subject) {
        credits += subject.credit;
      }
    }
    return credits;
  }, [bookmarks]);

  const getColor = (subject: Subject, no: number) => {
    // 実施形態と重なりで色を決定
    const isFaceToFace = subject.classMethods.includes("対面");
    const isOndemand = subject.classMethods.includes("オンデマンド");
    const isInteractive = subject.classMethods.includes("同時双方向");

    const isOnlyFaceToFace = isFaceToFace && !isOndemand && !isInteractive;
    const isOnlyOnline = !isFaceToFace && (isOndemand || isInteractive);
    const baseH = isOnlyFaceToFace ? 320 : isOnlyOnline ? 200 : 260;
    const h = baseH;
    const s = 100 - no * 40;
    return `hsla(${h}, ${s}%, 90%, 1.0)`;
  };

  useEffect(() => {
    const table = fillTimetable<Subject[]>([]);
    let credits = 0;
    let timeslots = 0;

    for (const bookmark of bookmarks) {
      const subject = kdb.subjectMap[bookmark];
      if (!subject) {
        continue;
      }

      // タームコードを含むグループを探索
      const termIndex = subject.termCodes.findIndex((codes) =>
        codes.includes(termCode),
      );
      if (termIndex === -1) {
        continue;
      }
      const subjectTable = subject.timeslotTables[termIndex];
      for (let day = 0; day < table.length; day++) {
        for (let period = 0; period < table[day].length; period++) {
          // 科目がコマを含めば追加
          if (subjectTable[day][period]) {
            table[day][period].push(subject);
          }
        }
      }
      credits += subject.credit;
      timeslots += getTimeslotsLength(subjectTable);
    }
    setTimetable(table);
    setCurrentCredits(credits);
    setCurrentTimeslots(timeslots);
  }, [bookmarks, termCode]);

  return (
    <Wrapper>
      <Header
        opened={opened}
        termCode={termCode}
        currentCredits={currentCredits}
        currentTimeslots={currentTimeslots}
        totalCredits={totalCredits}
        setOpened={setOpened}
        setTermCode={setTermCode}
      />
      <TimetableWrapper data-closed={!opened}>
        <PeriodColumn>
          <Day />
          {[...Array(maxPeriod)].map((_, i) => (
            <PeriodItem key={i}>
              {i + 1}
              <Time>
                {times[i][0]}
                <br />
                {times[i][1]}
              </Time>
            </PeriodItem>
          ))}
        </PeriodColumn>
        <Main>
          {daysofweek.map((day, dayi) => (
            <MainColumn key={day}>
              <Day>
                <span>{day}</span>
              </Day>
              {[...Array(maxPeriod)].map((_, period) => (
                <Item key={period}>
                  {timetable[dayi][period].map((subject, subjecti) => (
                    <SubjectTile
                      background={getColor(subject, subjecti)}
                      top={subjecti * 2}
                      key={subject.code}
                    >
                      <a
                        href={subject.syllabusHref}
                        target="_blank"
                        rel="nofollow noopener noreferrer"
                      >
                        {subject.code}
                        <br />
                        {subject.name}
                      </a>
                      <Close
                        className="close"
                        onClick={() => switchBookmark(subject.code)}
                      >
                        ✕
                      </Close>
                    </SubjectTile>
                  ))}
                </Item>
              ))}
            </MainColumn>
          ))}
        </Main>
      </TimetableWrapper>
      <Footer>
        <Link onClick={exportToTwinte}>
          <span>Twin:te にエクスポート</span>
        </Link>
        {/*<Link>
          <span>画像に保存</span>
        </Link>*/}
        <Link caution={true} onClick={clearBookmarks}>
          <span>すべて削除</span>
        </Link>
      </Footer>
    </Wrapper>
  );
};

export default TimetableElement;
