import { useEffect, Dispatch, useRef } from "react";
import { migrateDb } from "../data";
import { Action } from "../types";

function useInitDb(dispatch: Dispatch<Action>) {
  useEffect(function getInitSettings() {
    (async () => {
      await migrateDb();
      dispatch({ type: "initDb" });
    })();
  }, []);
}

export default useInitDb;
