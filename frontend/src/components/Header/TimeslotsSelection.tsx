import styled from "@emotion/styled";
import React, { useEffect } from "react";

import type { SearchOptions } from "@/utils/search";
import {
  colorPurpleDark,
  mobileMedia,
  shadow,
  shallowShadow,
} from "@/utils/style";
import { daysofweek, maxPeriod, type TimeslotTable } from "@/utils/timetable";

const Wrapper = styled.div`
  width: 180px;
  padding: 4px 12px 6px 10px;
  font-size: 15px;
  border-radius: 8px;
  box-shadow: ${shadow}
  box-sizing: border-box;
  background: rgba(255,255,255,0.9);
  transition: opacity 0.2s ease;
  position: absolute;
  top: 140px;
  left: 478px;

  &[data-displays="false"] {
    opacity: 0;
    pointer-events: none;
    user-select: none;
  }

	${mobileMedia} {
		top: 158px;
		left: auto;
		right: 0px;
	}
`;

const ButtonWrapper = styled.div`
  margin-top: 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Row = styled.div`
  height: 20px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
  justify-content: space-between;
  align-items: center;
`;

const Day = styled.div`
  flex: 20px 0 0;
  text-align: center;
`;

const Time = styled.div`
  text-align: right;
  margin-right: 4px;
  flex-grow: 1;
`;

const Description = styled.div`
  text-align: center;
  font-size: 12px;
  margin-top: 4px;
`;

const Button = styled.button<{ state: "disabled" | "selected" | "none" }>`
  flex: 20px 0 0;
  height: 20px;
  margin: 0;
  padding: 0;
  background: ${({ state }) =>
    state === "disabled"
      ? "#ccc"
      : state === "selected"
        ? colorPurpleDark
        : "#fff"};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: ${shallowShadow};
  appearance: none;
  transition: background 0.2s ease, box-shadow 0.2s ease, margin 0.2s ease;
`;

const Label = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface TimeslotsSelectionProps {
  options: SearchOptions;
  displays: boolean;
  bookmarkTimeslotTable: TimeslotTable;
  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
  setDisplays: React.Dispatch<React.SetStateAction<boolean>>;
}

const TimeslotsSelection = ({
  options,
  displays,
  bookmarkTimeslotTable,
  setOptions,
  setDisplays,
}: TimeslotsSelectionProps) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const [startTimeslot, setStartTimeslot] = React.useState<{
    day: number;
    time: number;
  } | null>(null);
  const [startTimeslotTable, setStartTimeslotTable] =
    React.useState<TimeslotTable | null>(null);
  const [tempTimeslotTable, setTempTimeslotTable] =
    React.useState<TimeslotTable | null>(null);

  const update = (day: number, time: number, updates: boolean) => {
    if (!startTimeslot || !startTimeslotTable) {
      return;
    }
    const newTimeslotTable = structuredClone(startTimeslotTable);

    // 選択範囲を反転
    for (
      let dayi = Math.min(startTimeslot.day, day);
      dayi <= Math.max(startTimeslot.day, day);
      dayi++
    ) {
      for (
        let timei = Math.min(startTimeslot.time, time);
        timei <= Math.max(startTimeslot.time, time);
        timei++
      ) {
        newTimeslotTable[dayi][timei] = !startTimeslotTable[dayi][timei];
      }
    }

    // updates が true の場合のみ、実際の検索条件を更新
    if (updates) {
      setOptions({ ...options, timeslotTable: newTimeslotTable });
    } else {
      setTempTimeslotTable(newTimeslotTable);
    }
  };

  const onMouseDown = (day: number, time: number) => {
    setStartTimeslot({ day, time });
    setStartTimeslotTable(options.timeslotTable);
  };

  const onMouseMove = (day: number, time: number) => {
    update(day, time, false);
  };

  const onMouseUp = (day: number, time: number) => {
    update(day, time, true);
    setStartTimeslot(null);
    setStartTimeslotTable(null);
    setTempTimeslotTable(null);
  };

  useEffect(() => {
    const documentClickHandler = (e: MouseEvent) => {
      if (
        !wrapperRef.current ||
        wrapperRef.current.contains(e.target as HTMLElement)
      ) {
        return;
      }
      setDisplays(false);
      e.stopPropagation();
    };

    if (displays) {
      setTimeout(() => {
        document.body.addEventListener("click", documentClickHandler);
      }, 500);
    }
    return () =>
      document.body.removeEventListener("click", documentClickHandler);
  }, [displays, setDisplays]);

  return (
    <Wrapper data-displays={displays} ref={wrapperRef}>
      <Row>
        <Time />
        {daysofweek.map((day) => (
          <Day key={day}>{day}</Day>
        ))}
      </Row>
      <ButtonWrapper>
        {[...Array(maxPeriod)].map((_, time) => (
          <React.Fragment key={time}>
            <Row>
              <Time>{time + 1}</Time>
              {daysofweek.map((day, i) => (
                <Button
                  onMouseDown={() => onMouseDown(i, time)}
                  onMouseMove={() => onMouseMove(i, time)}
                  onMouseUp={() => onMouseUp(i, time)}
                  state={
                    options.excludesBookmark && bookmarkTimeslotTable[i][time]
                      ? "disabled"
                      : (tempTimeslotTable ?? options.timeslotTable)[i][time]
                        ? "selected"
                        : "none"
                  }
                  key={day}
                />
              ))}
            </Row>
          </React.Fragment>
        ))}
      </ButtonWrapper>
      <Description>ドラッグで複数選択</Description>
      <Label>
        <input
          type="checkbox"
          checked={options.excludesBookmark}
          onChange={(e) =>
            setOptions({ ...options, excludesBookmark: e.target.checked })
          }
        />
        ブックマークを除外
      </Label>
    </Wrapper>
  );
};

export default TimeslotsSelection;
