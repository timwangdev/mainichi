import styled from "styled-components";

const Overlay = styled.div<{ isShown: boolean }>`
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  background-color: ${(props) => props.theme.overlayBg};
  pointer-events: ${(props) => (props.isShown ? "auto" : "none")};
  opacity: ${(props) => (props.isShown ? 0.6 : 0)};
  transition: opacity 0.4s ease;
  z-index: 100;
`;

export default Overlay;
