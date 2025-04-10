import codeTypesGrad from "./code-types-grad.json";
import codeTypesUndergrad from "./code-types-undergrad.json";

type Codes = string[];
export type SmallCodeArray = { name: string; children: Codes }[];
export type MidCodeArray = { name: string; children: SmallCodeArray | Codes }[];
export type CodeArray = {
  name: string;
  children: MidCodeArray | Codes;
}[];

type SmallCodeMap = Record<string, { codes: Codes }>;
type MidCodeMap = Record<string, { codes: Codes; small: SmallCodeMap }>;
type CodeMap = Record<string, { codes: Codes; mid: MidCodeMap }>;

// 科目番号の配列
export const allCodeTypes = (() => {
  // 学群
  const undergrad = codeTypesUndergrad as unknown as CodeArray;
  const grad = codeTypesGrad as unknown as MidCodeArray;
  return [...undergrad, { name: "大学院開設授業科目一覧", children: grad }];
})();

// 科目番号のマップ
export const allCodeMap: CodeMap = (() => {
  const map: CodeMap = {};

  // 大分類
  for (const large of allCodeTypes) {
    map[large.name] = { codes: [], mid: {} };
    const largeMap = map[large.name];

    // 中分類が存在しない場合
    if (typeof large.children[0] === "string") {
      largeMap.codes = large.children as Codes;
      continue;
    }
    // 中分類
    for (const mid of large.children as MidCodeArray) {
      largeMap.mid[mid.name] = { codes: [], small: {} };
      const midMap = largeMap.mid[mid.name];

      // 小分類が存在しない場合
      if (typeof mid.children[0] === "string") {
        midMap.codes = mid.children as Codes;
        largeMap.codes.push(...(mid.children as Codes));
        continue;
      }
      // 小分類
      for (const small of mid.children as SmallCodeArray) {
        midMap.small[small.name] = { codes: small.children };
        largeMap.codes.push(...small.children);
        midMap.codes.push(...small.children);
      }
    }
  }
  return map;
})();

/**
 * 指定された科目番号が指定された要件を満たすかどうかを返す
 * @param code 科目番号
 * @param reqA 大分類
 * @param reqB 中分類
 * @param reqC 小分類
 * @returns 指定された番号が指定された要件を満たすかどうか
 */
export const matchesCodeRequirement = (
  code: string,
  reqA: string | null,
  reqB: string | null,
  reqC: string | null,
) => {
  // 指定なし
  if (reqA === null) {
    return true;
  }
  // 大分類
  if (reqB === null) {
    return allCodeMap[reqA]?.codes.some((c) => code.startsWith(c));
  }
  // 中分類
  if (reqC === null) {
    return allCodeMap[reqA]?.mid[reqB]?.codes.some((c) => code.startsWith(c));
  }
  // 小分類
  return allCodeMap[reqA]?.mid[reqB]?.small[reqC]?.codes.some((c) =>
    code.startsWith(c),
  );
};
