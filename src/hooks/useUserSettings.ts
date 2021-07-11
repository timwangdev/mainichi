import { useEffect, useRef, useContext } from "react";
import Dispatch from "../context/Dispatch";
import { getAllUserSettings, setUserSettings } from "../data";
import { UserSettings } from "../types";

function useUserSettings(userSettings: UserSettings, fetchSettings: boolean) {
  let dispatch = useContext(Dispatch);
  let prevSettings = useRef(null);

  useEffect(
    function getInitSettings() {
      if (!fetchSettings) {
        return;
      }
      (async () => {
        let settings = await getAllUserSettings();
        prevSettings.current = settings;
        dispatch({ type: "initSettings", payload: settings });
      })();
    },
    [fetchSettings]
  );

  useEffect(
    function saveUserSetting() {
      if (
        prevSettings.current == null ||
        Object.keys(userSettings).length === 0 ||
        Object.is(prevSettings.current, userSettings)
      ) {
        return;
      }
      prevSettings.current = userSettings;
      setUserSettings(userSettings);
    },
    [userSettings]
  );
}

export default useUserSettings;
