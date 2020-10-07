import * as React from "react";
import { useContext } from "react";
import styled from "styled-components";
import Dispatch from "../context/Dispatch";

const menuIcon = require("../../icons/menu_w.png");
const closeIcon = require("../../icons/close_w.png");

export interface Props {
  isActive: boolean;
}

const MenuToggleBtn = styled.div<{ isActive: boolean }>`
  width: 44px;
  height: 44px;
  position: absolute;
  top: 15px;
  left: 15px;
  cursor: pointer;
  background-image: ${(props) =>
    props.isActive ? `url(${closeIcon})` : `url(${menuIcon})`};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: ${(props) =>
    props.isActive ? "translateX(240px)" : "translateX(0)"};
  transition: all 0.4s ease;
  z-index: 1000;
`;

const MenuToggle: React.FunctionComponent<Props> = (props) => {
  let dispatch = useContext(Dispatch);
  return (
    <MenuToggleBtn
      isActive={props.isActive}
      onClick={() => dispatch({ type: "toggleMenu" })}
    />
  );
};

export default MenuToggle;
