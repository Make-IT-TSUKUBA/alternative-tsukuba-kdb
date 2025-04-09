import { shadow } from "@/utils/style";
import { modules, normalSeasons } from "@/utils/subject";
import styled from "@emotion/styled";

const Wrapper = styled.header`
  height: 24px;
  line-height: 24px;
  color: #fff;
  margin-bottom: -14px;
  padding: 6px 12px 20px 12px;
  border-radius: 8px;
  box-shadow: ${shadow};
  background: hsla(270, 100%, 30%, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: space-between;
  align-items: end;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const TermName = styled.div`
  width: 56px;
  text-align: center;
  font-size: 20px;
`;

const Details = styled.div`
  line-height: 18px;
  font-size: 14px;
  margin-left: 16px;
`;

const Move = styled.a`
  line-height: 22px;
  font-size: 18px;

  &[data-prev] {
    margin-left: -8px;
  }

  &[data-next] {
    margin-right: -10px;
  }

  &[data-disabled="true"] {
    cursor: auto;
    opacity: 0.2;
  }

  &:hover {
    opacity: 0.6;
  }
`;

const Close = styled.a<{ opened: boolean }>`
  line-height: ${({ opened }) => (opened ? 10 : 32)}px;
  color: #fff;
  font-size: 20px;

  &:hover {
    opacity: 0.6;
  }
`;

interface HeaderProps {
  opened: boolean;
  termCode: number;
  currentCredits: number;
  currentTimeslots: number;
  totalYearCredits: number;
  setOpened: React.Dispatch<React.SetStateAction<boolean>>;
  setTermCode: React.Dispatch<React.SetStateAction<number>>;
}

const Header = ({
  opened,
  termCode,
  currentCredits,
  currentTimeslots,
  totalYearCredits,
  setOpened,
  setTermCode,
}: HeaderProps) => {
  const moveBefore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTermCode((prev) => {
      if (prev - 1 >= 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  const moveAfter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTermCode((prev) => {
      if (prev + 1 < normalSeasons.length * modules.length) {
        return prev + 1;
      }
      return prev;
    });
  };

  return (
    <Wrapper onClick={() => setOpened((prev) => !prev)}>
      <Left>
        <Move
          data-prev="true"
          onClick={moveBefore}
          data-disabled={termCode - 1 < 0}
        >
          〈
        </Move>
        <TermName>
          {normalSeasons[Math.floor(termCode / modules.length)]}{" "}
          {modules[termCode % 3]}
        </TermName>
        <Move
          data-next="true"
          data-disabled={termCode + 1 >= normalSeasons.length * modules.length}
          onClick={moveAfter}
        >
          〉
        </Move>
        <Details>
          {currentCredits.toFixed(1)} 単位、{currentTimeslots} コマ（通年{" "}
          {totalYearCredits.toFixed(1)} 単位）
        </Details>
      </Left>
      <Close opened={opened}>{opened ? "﹀" : "︿"}</Close>
    </Wrapper>
  );
};

export default Header;
