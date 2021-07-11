import { useEffect, useContext } from "react";
import Dispatch from "../context/Dispatch";
import { migrateDb } from "../data";

function useInitDb() {
  let dispatch = useContext(Dispatch);
  useEffect(function getInitSettings() {
    (async () => {
      await migrateDb();
      dispatch({ type: "initDb" });
    })();
  }, []);
}

export default useInitDb;
