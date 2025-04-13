import { Global, css } from "@emotion/react";
import { useEffect, useState } from "react";

import Footer from "./components/Footer";
import Header from "./components/Header/Header";
import Main from "./components/Main/Main";
import Syllabi from "./components/Syllabi";
import Timetable from "./components/Timetable/Index";
import {
  type SearchOptions,
  createSearchOptions,
  searchSubjects,
} from "./utils/search";
import { type Subject, kdb } from "./utils/subject";
import { useBookmark } from "./utils/useBookmark";
import { useClassroom } from "./utils/useClassroom";

const globalStyle = css`
  html,
  body {
    margin: 0;
    padding: 0;
    -webkit-text-size-adjust: 100%;
    background: #fff;
  }

  a {
    cursor: pointer;
  }

  * {
    font-family: "Noto Sans JP", sans-serif;
  }

  @font-face {
    font-family: "Noto Sans JP";
    font-weight: 400;
    font-display: swap;
    src: url("./NotoSansJP-Regular.ttf");
  }

  @font-face {
    font-family: "Noto Sans JP";
    font-weight: 700;
    font-display: swap;
    src: url("./NotoSansJP-Bold.ttf");
  }
`;

const App = () => {
  const [searchOptions, setSearchOptions] = useState<SearchOptions>(
    createSearchOptions(),
  );
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [timetableTermCode, setTimetableTermCode] = useState(0);
  const [displaysPlan, setDisplaysPlan] = useState(false);
  const [syllabiSubjectCode, setSyllabiSubjectCode] = useState<string | null>(
    null,
  );

  const usedBookmark = useBookmark(timetableTermCode, setTimetableTermCode);
  const { bookmarkTimeslotTable, bookmarksHas } = usedBookmark;

  const usedClassroom = useClassroom();

  // debounce 時間
  const DEBOUNCE_TIME = 100;

  useEffect(() => {
    // 履修計画の画面ではブックマークに登録された全科目を表示
    const planSearchOptions = createSearchOptions();
    planSearchOptions.filter = "bookmark";
    const options = displaysPlan ? planSearchOptions : searchOptions;

    const timer = setTimeout(() => {
      // 検索結果を更新
      const subjects = searchSubjects(
        kdb.subjectMap,
        kdb.subjectCodeList,
        options,
        bookmarkTimeslotTable,
        bookmarksHas,
      );
      setFilteredSubjects(subjects);
    }, DEBOUNCE_TIME);

    return () => {
      clearTimeout(timer);
    };
  }, [searchOptions, bookmarkTimeslotTable, displaysPlan, bookmarksHas]);

  return (
    <>
      <Global styles={globalStyle} />
      <Header
        searchOptions={searchOptions}
        bookmarkTimeslotTable={usedBookmark.bookmarkTimeslotTable}
        displaysPlan={displaysPlan}
        setSearchOptions={setSearchOptions}
        setDisplaysPlan={setDisplaysPlan}
      />
      <Main
        filteredSubjects={filteredSubjects}
        displaysPlan={displaysPlan}
        usedBookmark={usedBookmark}
        usedClassroom={usedClassroom}
        setSearchOptions={setSearchOptions}
        setSyllabiSubjectCode={setSyllabiSubjectCode}
      />
      <Footer filteredSubjects={filteredSubjects} />
      <Timetable
        termCode={timetableTermCode}
        usedBookmark={usedBookmark}
        setTermCode={setTimetableTermCode}
      />
      <Syllabi
        subjectCode={syllabiSubjectCode}
        setSubjectCode={setSyllabiSubjectCode}
      />
    </>
  );
};

export default App;
