import styled from "@emotion/styled";
import React from "react";

import type { SearchOptions } from "@/utils/search";
import { colorPurple, inputSize } from "@/utils/style";
import { classMethods, kdb } from "@/utils/subject";
import {
  type TimeslotTable,
  daysofweek,
  getTimeslotsLength,
} from "@/utils/timetable";
import TimeslotsSelection from "../TimeslotsSelection";
import {
  Form,
  MainButtonAnchor,
  SubButtonAnchor,
  rounded,
  roundedHeightExceptInput,
} from "../header-parts";
import { KeywordOptions } from "./KeywordOptions";
import SecondLine from "./SecondLine";
import ThirdLine from "./ThirdLine";
import { Headline, Left, Line, Options, desktopButtonAnchor } from "./parts";

const Wrapper = styled(Form)`
  gap: 6px;
`;

const Input = styled.input`
  ${rounded}
  ${roundedHeightExceptInput}
  width: ${inputSize};
  background: #fff;
`;

const Period = styled.div`
  width: ${inputSize};
  font-size: 15px;
  display: flex;
  gap: 10px;
`;

const Day = styled.span`
  color: ${colorPurple};
  margin-right: 2px;
`;

const Update = styled.div`
  color: #666;
  font-size: 14px;

  a {
    color: #666;
    text-decoration-color: #ccc;
    text-underline-offset: 4px;
    margin: 0 4px;
  }
`;

interface DesktopFormProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  displaysTimeslotSelection: boolean;
  displaysPlan: boolean;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplaysTimeslotSelection: React.Dispatch<React.SetStateAction<boolean>>;
  setDisplaysPlan: React.Dispatch<React.SetStateAction<boolean>>;
}

const DesktopForm = ({
  searchOptions,
  bookmarkTimeslotTable,
  displaysTimeslotSelection,
  displaysPlan,
  setSearchOptions,
  setDisplaysTimeslotSelection,
  setDisplaysPlan,
}: DesktopFormProps) => {
  return (
    <Wrapper>
      <Line thin={false}>
        <Headline>キーワード</Headline>
        <Input
          value={searchOptions.keyword}
          type="text"
          placeholder="科目番号は前方一致、その他は正規表現に対応"
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, keyword: e.target.value })
          }
        />
        <MainButtonAnchor href="#" css={desktopButtonAnchor}>
          <span>検索</span>
        </MainButtonAnchor>
        <KeywordOptions options={searchOptions} setOptions={setSearchOptions} />
      </Line>
      <SecondLine options={searchOptions} setOptions={setSearchOptions} />
      <ThirdLine options={searchOptions} setOptions={setSearchOptions} />
      <Line thin={true}>
        <Headline>曜日・時限</Headline>
        <Left>
          <Period>
            {displaysTimeslotSelection
              ? "カレンダーをクリックして曜日・時限を選択"
              : getTimeslotsLength(searchOptions.timeslotTable) > 0
                ? searchOptions.timeslotTable.map(
                    (day, dayi) =>
                      day.reduce((prev, value) => prev + (value ? 1 : 0), 0) >
                        0 && (
                        <div key={dayi}>
                          <Day>{daysofweek[dayi]}</Day>
                          {day.map(
                            (slot, period) =>
                              slot && (
                                <React.Fragment key={period}>
                                  {period + 1}
                                </React.Fragment>
                              ),
                          )}
                        </div>
                      ),
                  )
                : "指定なし"}
          </Period>
          <SubButtonAnchor
            css={desktopButtonAnchor}
            onClick={() => setDisplaysTimeslotSelection(true)}
          >
            <span>選択</span>
          </SubButtonAnchor>
        </Left>
        <label>
          <input
            type="checkbox"
            checked={searchOptions.exceptSameName}
            onChange={(e) =>
              setSearchOptions({
                ...searchOptions,
                exceptSameName: e.target.checked,
              })
            }
          />
          同名の科目を除外
        </label>
        <TimeslotsSelection
          options={searchOptions}
          displays={displaysTimeslotSelection}
          bookmarkTimeslotTable={bookmarkTimeslotTable}
          setOptions={setSearchOptions}
          setDisplays={setDisplaysTimeslotSelection}
        />
      </Line>
      <Line thin={true}>
        <Headline>実施形態</Headline>
        <label>
          <input
            type="radio"
            name="online"
            value="null"
            checked={searchOptions.classMethod === null}
            onChange={() =>
              setSearchOptions({ ...searchOptions, classMethod: null })
            }
          />
          ―
        </label>
        {classMethods.map((method) => (
          <label key={method}>
            <input
              type="radio"
              name="online"
              checked={searchOptions.classMethod === method}
              onChange={() =>
                setSearchOptions({
                  ...searchOptions,
                  classMethod: method,
                })
              }
            />
            {method}
          </label>
        ))}
      </Line>
      <Line thin={true}>
        <Headline>標準履修年次</Headline>
        <Left>
          <Options css={{ width: inputSize }}>
            {[...Array(6)].map((_, i) => (
              <label key={i}>
                <input
                  type="checkbox"
                  checked={searchOptions.years.has(i + 1)}
                  onChange={(e) => {
                    const newYears = new Set(searchOptions.years);
                    if (e.currentTarget.checked) {
                      newYears.add(i + 1);
                    } else {
                      newYears.delete(i + 1);
                    }
                    setSearchOptions({
                      ...searchOptions,
                      years: newYears,
                    });
                  }}
                />{" "}
                {i + 1}
              </label>
            ))}
          </Options>
          <SubButtonAnchor
            css={desktopButtonAnchor}
            onClick={() => setDisplaysPlan((prev) => !prev)}
          >
            <span>{displaysPlan ? "× 履修計画" : "履修計画"}</span>
          </SubButtonAnchor>
        </Left>
        <Update>
          <span>{kdb.updated}</span> 時点での
          <a href="https://kdb.tsukuba.ac.jp/" target="_blank" rel="noreferrer">
            筑波大学 KdB
          </a>
          のデータに基づきます
        </Update>
      </Line>
    </Wrapper>
  );
};

export default DesktopForm;
