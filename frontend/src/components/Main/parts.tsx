import styled from "@emotion/styled";

import { colorPurple, shallowShadow } from "@/utils/style";
import { CURRENT_YEAR } from "@/utils/subject";

export const years = [...Array(9)].map((_, i) => CURRENT_YEAR + i - 4);

export const Td = styled.td`
  vertical-align: top;
  padding: 4px 8px 4px 0;
  border-bottom: solid 1px #ccc;

  &:nth-of-type(6),
  &:nth-of-type(7) {
    line-height: 1.3em;
    font-size: 0.6rem;
  }
`;

export const BottomRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Star = styled.a<{ enabled: boolean }>`
  line-height: 1;
  color: ${(props) => (props.enabled ? colorPurple : "#aaa")};
  font-size: 1.2rem;

  &:hover {
    opacity: 0.8;
  }
`;

export const YearSelect = styled.select`
  height: 24px;
  text-decoration: none;
  font-size: 14px;
  font-family: inherit;
  margin-left: 8px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  box-shadow: ${shallowShadow};
  display: flex;
  box-sizing: border-box;
  appearance: none;
`;

export const BottomTd = styled.td`
  padding-top: 8px;
`;
