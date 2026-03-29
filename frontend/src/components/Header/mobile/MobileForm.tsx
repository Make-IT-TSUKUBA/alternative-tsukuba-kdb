import styled from "@emotion/styled";
import React from "react";

import { createSearchOptions, type SearchOptions } from "@/utils/search";
import {
  colorPurpleDark,
  colorPurpleGradient,
  shallowShadow,
} from "@/utils/style";
import {
  classMethods,
  kdb,
  type Module,
  modules,
  type NormalSeason,
  normalSeasons,
} from "@/utils/subject";
import type { TimeslotTable } from "@/utils/timetable";
import {
  Form,
  keywordContainOptions,
  MainButtonAnchor,
  rounded,
  roundedHeightExceptInput,
  SubButtonAnchor,
} from "../header-parts";
import Requirements from "../Requirements";
import TimeslotsSelection from "../TimeslotsSelection";
import { Headline } from "./parts";

const Wrapper = styled(Form)`
  font-size: 15px;
  gap: 16px;
`;

const SubWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Line = styled.div<{ right?: boolean }>`
  display: flex;
  justify-content: ${({ right }) => (right ? "flex-end" : "space-between")};
  align-items: center;
`;

const Input = styled.input`
  ${rounded}

  width: 100%;
  height: 40px;
  line-height: 40px;
  position: relative;
  background: #fff;
  z-index: 1;
`;

const ModuleSelect = styled.select`
  ${rounded}
  ${roundedHeightExceptInput}
  color: #000;
  background: #fff;
`;

const Right = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const CheckButtonWrapper = styled.div`
  flex: 1;
  display: flex;
  border-radius: 4px;
  background: ${colorPurpleGradient};
  box-shadow: ${shallowShadow};
  overflow: hidden;

  &[data-keyword="true"] {
    margin-top: -12px;
    height: 38px;

    button {
      padding-top: 11px;
    }
  }
`;

const CheckButton = styled.button`
  flex-grow: 1;
  height: 27px;
  line-height: 27px;
  color: ${colorPurpleDark};
  font-size: 14px;
  padding: 0px 4px 1px 4px;
  border: none;
  box-sizing: content-box;
  background: transparent;

  &[data-selected="true"] {
    color: #fff;
    background: ${colorPurpleDark};
  }

  &:not(:last-of-type) {
    border-right: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

const Update = styled.div`
  color: #666;
  font-size: 12px;

  a {
    color: #666;
    text-decoration-color: #ccc;
    text-underline-offset: 4px;
    margin: 0 4px;
  }
`;

const specialOptions = [
  ["集中", "concentration"],
  ["応談", "negotiable"],
  ["随時", "asneeded"],
  ["NT", "nt"],
] as const;

interface DesktopHeaderProps {
  searchOptions: SearchOptions;
  bookmarkTimeslotTable: TimeslotTable;
  displaysTimeslotSelection: boolean;
  setSearchOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplaysTimeslotSelection: React.Dispatch<React.SetStateAction<boolean>>;
}

const MobileForm = ({
  searchOptions,
  bookmarkTimeslotTable,
  displaysTimeslotSelection,
  setSearchOptions,
  setDisplaysTimeslotSelection,
}: DesktopHeaderProps) => {
  const clear = () => {
    setSearchOptions(createSearchOptions());
  };

  return (
    <Wrapper>
      <div>
        <Input
          value={searchOptions.keyword}
          type="text"
          placeholder="科目番号は前方一致、その他は正規表現に対応"
          onChange={(e) =>
            setSearchOptions({ ...searchOptions, keyword: e.target.value })
          }
        />
        <CheckButtonWrapper data-keyword="true">
          {keywordContainOptions.map(([label, value]) => (
            <CheckButton
              data-selected={searchOptions[value]}
              onClick={() =>
                setSearchOptions((prev) => ({
                  ...searchOptions,
                  [value]: !prev[value],
                }))
              }
              key={value}
            >
              {label}
            </CheckButton>
          ))}
        </CheckButtonWrapper>
      </div>
      <Line>
        <Headline>要件</Headline>
        <Requirements options={searchOptions} setOptions={setSearchOptions} />
      </Line>
      <SubWrapper>
        <Line>
          <Headline>コマ</Headline>
          <Right>
            <ModuleSelect
              value={
                !searchOptions.season || !searchOptions.module
                  ? "null"
                  : `${searchOptions.season}${searchOptions.module}`
              }
              onChange={(e) =>
                setSearchOptions((prev) => ({
                  ...prev,
                  season:
                    e.target.value !== "null"
                      ? (e.target.value[0] as NormalSeason)
                      : null,
                  module:
                    e.target.value !== "null"
                      ? (e.target.value[1] as Module)
                      : null,
                }))
              }
            >
              <option value="null">全モジュール</option>
              {normalSeasons.map((season) => (
                <React.Fragment key={season}>
                  {modules.map((module) => (
                    <option
                      value={`${season}${module}`}
                      key={`${season}${module}`}
                    >
                      {`${season} ${module}`}
                    </option>
                  ))}
                </React.Fragment>
              ))}
            </ModuleSelect>
            <SubButtonAnchor
              style={{ flexGrow: 1 }}
              onClick={() => setDisplaysTimeslotSelection(true)}
            >
              <span>曜日・時限を選択</span>
            </SubButtonAnchor>
          </Right>
        </Line>
        <Line>
          <CheckButtonWrapper>
            {specialOptions.map(([label, value]) => (
              <CheckButton
                data-selected={searchOptions[value]}
                key={value}
                onClick={() =>
                  setSearchOptions((prev) => ({
                    ...searchOptions,
                    [value]: !prev[value],
                  }))
                }
              >
                {label}
              </CheckButton>
            ))}
            <CheckButton
              data-selected={searchOptions.filter === "bookmark"}
              onClick={() =>
                setSearchOptions((prev) => ({
                  ...searchOptions,
                  filter: prev.filter === "bookmark" ? "all" : "bookmark",
                }))
              }
            >
              ★
            </CheckButton>
            <CheckButton
              data-selected={searchOptions.exceptSameName}
              onClick={() =>
                setSearchOptions((prev) => ({
                  ...searchOptions,
                  exceptSameName: !prev.exceptSameName,
                }))
              }
            >
              同名科目を除外
            </CheckButton>
          </CheckButtonWrapper>
          <TimeslotsSelection
            options={searchOptions}
            displays={displaysTimeslotSelection}
            bookmarkTimeslotTable={bookmarkTimeslotTable}
            setOptions={setSearchOptions}
            setDisplays={setDisplaysTimeslotSelection}
          />
        </Line>
      </SubWrapper>
      <SubWrapper>
        <Line>
          <Headline>形態</Headline>
          <CheckButtonWrapper>
            {(
              [
                ["指定なし", null],
                ...classMethods.map((method) => [method, method]),
              ] as const
            ).map((method) => (
              <CheckButton
                data-selected={searchOptions.classMethod === method[1]}
                onClick={() =>
                  setSearchOptions({
                    ...searchOptions,
                    classMethod: method[1],
                  })
                }
                key={method[1]}
              >
                {method[0]}
              </CheckButton>
            ))}
          </CheckButtonWrapper>
        </Line>
        <Line>
          <Headline>年次</Headline>
          <CheckButtonWrapper>
            {[...Array(6)].map((_, i) => (
              <CheckButton
                data-selected={searchOptions.years.has(i + 1)}
                onClick={() => {
                  const newYears = new Set(searchOptions.years);
                  if (!searchOptions.years.has(i + 1)) {
                    newYears.add(i + 1);
                  } else {
                    newYears.delete(i + 1);
                  }
                  setSearchOptions({
                    ...searchOptions,
                    years: newYears,
                  });
                }}
                key={i}
              >
                {i + 1}
              </CheckButton>
            ))}
          </CheckButtonWrapper>
        </Line>
      </SubWrapper>
      <SubWrapper>
        <Line right={true}>
          <SubButtonAnchor href="#" onClick={clear}>
            <span>条件をクリア</span>
          </SubButtonAnchor>
          <MainButtonAnchor href="#" style={{ marginLeft: "8px" }}>
            <span>検索</span>
          </MainButtonAnchor>
        </Line>
        <Line right={true}>
          <Update>
            <span>{kdb.updated}</span> 時点での
            <a
              href="https://kdb.tsukuba.ac.jp/"
              target="_blank"
              rel="noreferrer"
            >
              筑波大学 KdB
            </a>
            のデータに基づきます
          </Update>
        </Line>
      </SubWrapper>
    </Wrapper>
  );
};

export default MobileForm;
