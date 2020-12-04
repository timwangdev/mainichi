import { createGlobalStyle } from "styled-components";
import { Theme } from "../utils/theme";

const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  body * {
    box-sizing: border-box;
  }
  body {
    height: 100vh;
    width: 100vw;
    margin: 0;
    font-size: 100%;
    font-family: ${(props) => props.theme.zhFont} ;
    background-color: ${(props) => props.theme.bodyBg} ;
  }
  p {
    margin: 0;
    word-break: break-all; 
  }
  #app-root {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
  }
  #modal-root {
    position: absolute;
    pointer-events: none;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  #modal-root > div {
    display: flex;
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
  }
`;

export default GlobalStyle;
