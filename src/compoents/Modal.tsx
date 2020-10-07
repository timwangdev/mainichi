import * as React from "react";
import { useEffect, useRef, useContext } from "react";
import * as ReactDOM from "react-dom";
import styled from "styled-components";
import Dispatch from "../context/Dispatch";

const closeIcon = require("../../icons/close.png");

export interface Props {
  modalId: string;
  title: string;
  isModalOpen: boolean;
}

const $modalRoot = document.getElementById("modal-root");

const ModalContainer = styled.div`
  width: 480px;
  height: 540px;
  display: flex;
  position: relative;
  pointer-events: auto;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  opacity: 1;
  transition: all 0.3s ease;
  box-shadow: #2c2c2c 2px 2px 8px 2px;
  z-index: 1000;

  .hide > & {
    display: none;
  }

  .willHide > & {
    opacity: 0;
    transform: translateY(60px);
  }

  .willShow > & {
    opacity: 0;
    transform: translateY(60px);
  }
`;

const ModalTitle = styled.h2`
  flex: 0;
  padding-left: 1em;
  margin-top: 14px;
`;

const ModelContent = styled.div`
  flex: 1;
  padding: 12px;
  overflow-y: scroll;
`;

const ModalClose = styled.div`
  width: 36px;
  height: 36px;
  position: absolute;
  top: 12px;
  right: 12px;
  background-image: url(${closeIcon});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  cursor: pointer;
`;

const Modal: React.FunctionComponent<Props> = (props) => {
  let dispatch = useContext(Dispatch);

  let el = useRef<HTMLElement>(document.createElement("div"));

  function transistionListener() {
    if (el.current.classList.contains("willHide")) {
      el.current.classList.add("hide");
      el.current.classList.remove("willHide");
    }
  }

  useEffect(
    function addListener() {
      el.current.addEventListener("transitionend", transistionListener);
      return () => {
        el.current.removeEventListener("transitionend", transistionListener);
      };
    },
    [el.current]
  );

  useEffect(
    function toggelModel() {
      let prev = Array.from($modalRoot.children).find(
        (el) => el.id === props.modalId
      ) as HTMLElement;
      if (prev) {
        el.current = prev;
      } else {
        el.current.id = props.modalId;
        $modalRoot.appendChild(el.current);
      }

      if (!props.isModalOpen) {
        el.current.classList.add("willHide");
        return;
      }

      el.current.classList.remove("willHide", "hide");
      el.current.classList.add("willShow");
      requestAnimationFrame(() => el.current.classList.remove("willShow"));
    },
    [props.isModalOpen]
  );

  return ReactDOM.createPortal(
    <ModalContainer>
      <ModalTitle>{props.title}</ModalTitle>
      <ModalClose onClick={() => dispatch({ type: "closeModal" })} />
      <ModelContent>{props.isModalOpen && props.children}</ModelContent>
    </ModalContainer>,
    el.current
  );
};

export default Modal;
