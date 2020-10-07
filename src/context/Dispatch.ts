import { createContext, Dispatch } from "react";
import { Action } from "../types";

const Dispatch = createContext<Dispatch<Action>>(null);

export default Dispatch;
