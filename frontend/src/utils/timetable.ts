// 用語定義
// 曜日：月曜日から日曜日までの 7 日間
// 時限：授業の時間帯を表す単位
// コマ（Timeslot）：特定の曜日と時限の組み合わせから構成される、授業の 1 コマ
// 時間割（Timetable）：曜日 × 時限 のテーブル
// TimeslotTable：コマの有無を表すテーブル

export const daysofweek: readonly string[] = [
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
];
// 最大時限数
export const maxPeriod = 6;

// 二次元配列（[曜日][時限]）として表現
export type Timetable<T> = T[][];
export type TimeslotTable = Timetable<boolean>;

/**
 * filled で埋められた時間割（月–日 × 6限まで）を作成する
 */
export const fillTimetable = <T>(filled: T): T[][] => {
  const table = new Array(daysofweek.length);
  for (let day = 0; day < daysofweek.length; day++) {
    table[day] = new Array(maxPeriod);
    for (let period = 0; period < maxPeriod; period++) {
      table[day][period] = structuredClone(filled);
    }
  }
  return table;
};

/**
 * 時限を表す文字列をパースして、時間割を作成する
 */
export const createTimeslotTable = (value: string): TimeslotTable => {
  const table = fillTimetable(false);
  let dayArray: number[] = [];

  // ｛曜日 + 数字（ハイフン含む）｝がコンマ区切りで繰り返される
  // コンマで分割
  // TODO: check
  const slotStrArray = (value as string).split(",");
  for (const slotStr of slotStrArray) {
    // 曜日を取得
    const dayStr = slotStr.replace(/[0-9\\-]/g, "");
    const days = dayStr
      .split("・")
      .filter((day) => daysofweek.includes(day))
      .map((day) => daysofweek.indexOf(day));
    if (days.length > 0) {
      dayArray = days;
    }

    // 時限を取得
    const periodArray: number[] = [];
    const periodStr = slotStr.replace(/[^0-9\\-]/g, "");

    // - が含まれる場合は範囲選択
    if (periodStr.indexOf("-") > -1) {
      const periodStrArray = periodStr.split("-");
      const startPeriod = Number(periodStrArray[0]);
      const endPeriod = Number(periodStrArray[1]);
      for (
        let k = Math.max(startPeriod, 0);
        k <= Math.min(endPeriod, maxPeriod);
        k++
      ) {
        periodArray.push(k);
      }
    } else {
      periodArray.push(Number(periodStr));
    }

    if (periodStr.length > 0) {
      for (const day of dayArray) {
        for (const period of periodArray) {
          table[day][period - 1] = true;
        }
      }
    }
  }
  return table;
};

/**
 * 空の TimeslotTable を作成する
 */
export const createEmptyTimeslotTable = (): TimeslotTable => {
  return fillTimetable(false);
};

/**
 * 時間割から合計コマ数を算出する
 */
export const getTimeslotsLength = (table: TimeslotTable) => {
  let sum = 0;
  for (let day = 0; day < table.length; day++) {
    for (let period = 0; period < table[day].length; period++) {
      if (table[day][period]) {
        sum++;
      }
    }
  }
  return sum;
};

/**
 * 時間割を空にする
 */
export const clearTimeslotTable = (table: TimeslotTable) => {
  for (let day = 0; day < table.length; day++) {
    for (let period = 0; period < table[day].length; period++) {
      table[day][period] = false;
    }
  }
};

/**
 * 2 つの時間割のコマが重なっているかどうかを、ビット列を用いて判定する
 */
export const matchesTimeslots = (a: bigint, b: bigint) => {
  return (a & b) !== 0n;
};

/**
 * TimeslotTable をビット列に変換する
 */
export const timeslotTableToBits = (table: TimeslotTable) => {
  // 7 * 6 = 42 bit なのでオーバーフローしない
  let bits = 0n;
  for (let day = 0; day < table.length; day++) {
    for (let period = 0; period < table[day].length; period++) {
      // 稀に undefined が入ることがある。undefined の場合は 0 を入れる
      bits = (bits << 1n) | (table[day][period] === true ? 1n : 0n);
    }
  }
  return bits;
};
