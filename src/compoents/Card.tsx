import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled, { keyframes, css } from "styled-components";
import Dispatch from "../context/Dispatch";
import { Word } from "../types";
import { getNextColor, getRandomColor } from "../utils/color";

const speakerIcon = require("../../icons/speaker.png");

export interface Props {
  word: Word;
  hideHiragana?: boolean;
  hideRomaji?: boolean;
  hideMeaning?: boolean;
}

const CardSection = styled.section<{ bgColor: string }>`
  display: flex;
  align-items: center;
  height: fit-content;
  min-height: 256px;
  width: 380px;
  margin: 16px;
  position: relative;
  background-color: ${(props) => props.bgColor};
  border-radius: 8px;
  box-shadow: ${(props) => props.theme.shadowColor} 2px 2px 8px 2px;
  z-index: 10;
`;

const TextBox = styled.div`
  padding: 32px 36px;
  width: 100%;
  color: #222;
  border-radius: 8px;
`;

const Title = styled.h1<{ hideHiragana?: boolean }>`
  font-family: ${(props) => props.theme.jpFont};
  font-size: 2.4em;
  margin: 0;

  & rt {
    visibility: ${(props) => (props.hideHiragana ? "hidden" : "visible")};
  }

  ${TextBox}:hover & rt {
    visibility: visible;
  }
`;

const Pronunciation = styled.p`
  cursor: pointer;
  font-size: 1.4em;
  padding-top: 0.4em;
`;

const SpeakerIcon = styled.span`
  margin-right: 0.2em;
  margin-bottom: -0.1em;
  display: inline-block;
  width: 24px;
  height: 24px;
  background-image: url(${speakerIcon});
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
`;

const Romaji = styled.span<{ hide?: boolean }>`
  text-transform: lowercase;
  visibility: ${(props) => (props.hide ? "hidden" : "visible")};

  ${TextBox}:hover & {
    visibility: visible;
  }
`;

const Divider = styled.div`
  margin-top: 0.8em;
  border-top: 1px solid #000;
`;

const Meaning = styled.p<{ hide?: boolean }>`
  font-size: 1.4em;
  padding-top: 0.6em;
  visibility: ${(props) => (props.hide ? "hidden" : "visible")};

  ${TextBox}:hover & {
    visibility: visible;
  }
`;

const Card: React.FunctionComponent<Props> = (props) => {
  let cardRef = useRef<HTMLElement>(null);
  let dispatch = useContext(Dispatch);
  let [bgColor, setBgColor] = useState(getRandomColor());

  let { word } = props;

  useEffect(() => {
    setBgColor(getNextColor());
  }, [word.uuid]);

  return (
    <CardSection ref={cardRef} bgColor={bgColor}>
      <TextBox>
        <Title
          hideHiragana={props.hideHiragana}
          dangerouslySetInnerHTML={{ __html: word.furigana }}
        />
        <Pronunciation
          onClick={() => dispatch({ type: "playSound", payload: word.sound })}
        >
          <SpeakerIcon />
          <Romaji hide={props.hideRomaji}>{word.romaji}</Romaji>
        </Pronunciation>
        <Divider />
        <Meaning hide={props.hideMeaning}>
          <span>{word.part}</span> <span>{word.chinese}</span>
        </Meaning>
      </TextBox>
    </CardSection>
  );
};

export default Card;
