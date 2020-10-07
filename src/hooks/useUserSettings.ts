import { useEffect, Dispatch, useRef } from "react";
import { getAllUserSettings, setUserSettings } from "../data";
import { Action, UserSettings } from "../types";

function useUserSettings(
  userSettings: UserSettings,
  dispatch: Dispatch<Action>
) {
  let prevSettings = useRef(null);

  useEffect(function getInitSettings() {
    (async () => {
      let settings = await getAllUserSettings();
      prevSettings.current = settings;
      dispatch({ type: "initSettings", payload: settings });
    })();
  }, []);

  useEffect(
    function saveUserSetting() {
      if (
        prevSettings.current == null &&
        Object.keys(userSettings).length === 0 &&
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
