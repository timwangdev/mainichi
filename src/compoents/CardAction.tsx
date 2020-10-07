import * as React from "react";
import styled from "styled-components";

export interface Props {
  text: string;
  icon: string;
  onClick: () => void;
}

const Wrapper = styled.div`
  display: flex;
  margin: 0 1em;
  flex: 1;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  filter: invert(50%);
  transition: filter 0.2s ease;

  &:hover {
    filter: invert(80%);
  }
`;

const Icon = styled.div<{ name: string }>`
  width: 40px;
  height: 40px;
  margin: 0 8px;
  background-image: url(${(props) => props.name});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

const Text = styled.span`
  color: #000;
  font-size: 1.2em;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CardAction: React.FunctionComponent<Props> = (props) => {
  return (
    <Wrapper onClick={props.onClick}>
      <Icon name={props.icon} />
      <Text>{props.text}</Text>
    </Wrapper>
  );
};

export default CardAction;
