import * as React from "react";
import { useContext, useEffect } from "react";
import styled from "styled-components";
import Dispatch from "../context/Dispatch";
import { Word } from "../types";
import Card from "./Card";
import CardAction from "./CardAction";

const saveIcon = require("../../icons/bookmark_o.png");
const savedIcon = require("../../icons/bookmark.png");
const nextIcon = require("../../icons/next.png");

export interface Props {
  word: Word;
  wordSaved: boolean;
  hideHiragana?: boolean;
  hideRomaji?: boolean;
  hideMeaning?: boolean;
}

const ActionBar = styled.div`
  width: 320px;
  height: 64px;
  display: flex;
  align-items: center;
  margin-top: 24px;
`;

const CardStack: React.FunctionComponent<Props> = (props: Props) => {
  let dispatch = useContext(Dispatch);

  return (
    <>
      <Card
        word={props.word}
        hideHiragana={props.hideHiragana}
        hideRomaji={props.hideRomaji}
        hideMeaning={props.hideMeaning}
      />
      <ActionBar>
        {props.wordSaved ? (
          <CardAction
            text="已保存"
            icon={savedIcon}
            onClick={() => dispatch({ type: "removeWord" })}
          />
        ) : (
          <CardAction
            text="保存"
            icon={saveIcon}
            onClick={() => dispatch({ type: "saveWord" })}
          />
        )}
        <CardAction
          text="下一个"
          icon={nextIcon}
          onClick={() => dispatch({ type: "switchNext" })}
        />
      </ActionBar>
    </>
  );
};

export default CardStack;
