import * as React from "react";
import { useContext } from "react";
import styled from "styled-components";
import Dispatch from "../context/Dispatch";
import { UserSettings } from "../types";

export interface Props {
  isOpened: boolean;
  userSettings: UserSettings;
  isNotebookEnabled: boolean;
}

const USER_SETTINGS_TITLES = {
  hideRomaji: "隐藏罗马音",
  hideHiragana: "隐藏平假名(*)",
  hideMeaning: "隐藏翻译",
  autoplaySound: "自动播放读音",
};

const LIBRARY_OPTIONS = {
  book1: [1, "新标准日本语初级(N4-N5)"],
  book2: [2, "新标准日本语中级(N2-N3)"],
  book3: [3, "新标准日本语高级(N1)"],
  notebook: [0, "生词库(保存的单词)"],
};

const Panel = styled.div<{ isOpened: boolean }>`
  width: 240px;
  background: #fff;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  transform: ${(props) =>
    props.isOpened ? "translateX(0)" : "translateX(-240px)"};
  transition: transform 0.4s ease;
  overflow-y: auto;
  z-index: 1000;
`;

const Title = styled.h2`
  padding: 0 8px;
`;

const UserSettingList = styled.ul`
  padding: 0;
  margin: 1em 0;
`;

const UserSettingListItem = styled.li<{ isActive: boolean }>`
  list-style: none;
  font-size: 1.4em;
  cursor: pointer;
  padding: 8px;

  &:hover {
    background-color: #ccc;
  }

  ${(props) =>
    props.isActive &&
    `
    &:after {
      content: "✓";
      font-weight: 700;
      position: absolute;
      right: 12px;
    }`}
`;

const LibrarySelectTitle = styled.h3`
  padding: 0 8px;
`;

const LibrarySelect = styled.div`
  padding: 8px 4px;
`;

const PanelLink = styled.a`
  display: block;
  color: #222;
  font-size: 0.8em;
  padding: 6px 8px;
`;

const SidePanel: React.FunctionComponent<Props> = (props) => {
  let dispatch = useContext(Dispatch);
  let checkedValue =
    props.userSettings.wordLibrary != null ? props.userSettings.wordLibrary : 1;
  return (
    <Panel isOpened={props.isOpened}>
      <Title>偏好设置</Title>
      <UserSettingList>
        {Object.entries(USER_SETTINGS_TITLES).map(([key, title]) => (
          <UserSettingListItem
            key={key}
            onClick={() =>
              dispatch({
                type: "changeUserSetting",
                payload: { [key]: !Boolean(props.userSettings[key]) },
              })
            }
            isActive={Boolean(props.userSettings[key])}
          >
            {title}
          </UserSettingListItem>
        ))}
      </UserSettingList>
      <hr />
      <LibrarySelectTitle>词库选择</LibrarySelectTitle>
      {Object.entries(LIBRARY_OPTIONS).map(([key, [value, title]]) => (
        <LibrarySelect key={key}>
          <input
            type="radio"
            id={key}
            name="library"
            onChange={(ev) => {
              if (ev.target.checked) {
                dispatch({
                  type: "changeUserSetting",
                  payload: { wordLibrary: value },
                });
              }
            }}
            disabled={value === 0 && !props.isNotebookEnabled}
            checked={checkedValue === value}
          />
          <label htmlFor={key}>{title}</label>
        </LibrarySelect>
      ))}
      <PanelLink href="#" onClick={() => dispatch({ type: 'openNotebook' })}>管理生词本...</PanelLink>
      <PanelLink
        href="https://github.com/timwangdev/mainichi/issues/new"
        target="_blank"
      >
        报告错误...
      </PanelLink>
      <PanelLink>
        {chrome && chrome.runtime && chrome.runtime.getManifest
          ? chrome.runtime.getManifest().version
          : 'TEST_BUILD'}
      </PanelLink>
    </Panel>
  );
};

export default SidePanel;
