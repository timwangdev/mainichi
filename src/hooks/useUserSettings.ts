import { useEffect, Dispatch, useRef } from "react";
import { getAllUserSettings, setUserSettings } from "../data";
import { Action, UserSettings } from "../types";

function useUserSettings(
  userSettings: UserSettings,
  fetchSettings: boolean,
  dispatch: Dispatch<Action>
) {
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
