import * as React from "react";
import { useContext } from "react";
import styled from "styled-components";
import Dispatch from "../context/Dispatch";
import { Word } from "../types";
import Modal from "./Modal";

export interface Props {
  notebook: Word[];
  isModalOpen: boolean;
}

const NotebookTable = styled.table`
  width: 100%;
  table-layout: auto;
  border-collapse: collapse;
`;

const NotebookTr = styled.tr`
  border-top: 1px #000 solid;
`;

const NotebookTd = styled.td`
  padding: 8px 4px;
  min-width: 44px;
  vertical-align: top;

  &:last-child {
    width: 44px;
    text-align: center;
  }
`;

const NotebookInfo = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
  background-color: #ccc;
`;

const Notebook: React.FunctionComponent<Props> = (props) => {
  let dispatch = useContext(Dispatch);

  return (
    <Modal
      modalId="manage-notebook"
      title="管理生词本"
      isModalOpen={props.isModalOpen}
    >
      {props.notebook.length !== 0 ? (
        <NotebookTable>
          <tbody>
            {props.notebook.map((word) => (
              <NotebookTr key={word.uuid}>
                <NotebookTd>{word.kana}</NotebookTd>
                <NotebookTd>
                  {word.part} {word.chinese}
                </NotebookTd>
                <NotebookTd>
                  <a
                    href="#"
                    onClick={() =>
                      dispatch({ type: "removeWord", payload: word })
                    }
                  >
                    移除
                  </a>
                </NotebookTd>
              </NotebookTr>
            ))}
          </tbody>
        </NotebookTable>
      ) : (
        <NotebookInfo>
          <h3>空生词本</h3>
          <p>使用保存卡片按钮添加单词至生词本。</p>
        </NotebookInfo>
      )}
    </Modal>
  );
};

export default Notebook;
