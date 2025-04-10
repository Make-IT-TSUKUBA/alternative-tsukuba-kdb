import styled from "@emotion/styled";

import {
  type MidCodeArray,
  type SmallCodeArray,
  allCodeTypes,
} from "@/kdb/code-types";
import type { SearchOptions } from "@/utils/search";
import { useMemo } from "react";
import { rounded, roundedHeightExceptInput } from "./header-parts";

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  gap: 8px;
  justify-content: space-between;
`;

const Select = styled.select`
  ${rounded}
  ${roundedHeightExceptInput}
  width: calc((100% - 16px) / 3);
  color: #000;
  background: #fff;
`;

interface RequirementsProps {
  options: SearchOptions;
  setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>;
}

const Requirements = ({ options, setOptions }: RequirementsProps) => {
  const typesA = Object.values(allCodeTypes).map((type) => type.name);

  const typesB = useMemo(() => {
    const mid = allCodeTypes.find(
      (type) => type.name === options.reqA,
    )?.children;
    if (!mid || mid.length === 0 || typeof mid[0] === "string") {
      return [];
    }
    return (mid as MidCodeArray).map((type) => type.name);
  }, [options.reqA]);

  const typesC = useMemo(() => {
    const mid = allCodeTypes.find(
      (type) => type.name === options.reqA,
    )?.children;
    if (!mid || mid.length === 0 || typeof mid[0] === "string") {
      return [];
    }
    const small = (mid as MidCodeArray).find(
      (type) => type.name === options.reqB,
    )?.children;
    if (!small || small.length === 0 || typeof small[0] === "string") {
      return [];
    }
    return (small as SmallCodeArray).map((type) => type.name);
  }, [options.reqA, options.reqB]);

  return (
    <Wrapper>
      <Select
        value={options.reqA}
        onChange={(e) =>
          setOptions({
            ...options,
            reqA: e.target.value,
            reqB: "null",
            reqC: "null",
          })
        }
      >
        <option value="null">指定なし</option>
        {typesA.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </Select>
      <Select
        value={options.reqB}
        onChange={(e) =>
          setOptions({ ...options, reqB: e.target.value, reqC: "null" })
        }
      >
        <option value="null">{typesB.length > 0 ? "指定なし" : ""}</option>
        {typesB.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </Select>
      <Select
        value={options.reqC}
        onChange={(e) => setOptions({ ...options, reqC: e.target.value })}
      >
        <option value="null">{typesC.length > 0 ? "指定なし" : ""}</option>
        {typesC.map((key) => (
          <option value={key} key={key}>
            {key}
          </option>
        ))}
      </Select>
    </Wrapper>
  );
};

export default Requirements;
