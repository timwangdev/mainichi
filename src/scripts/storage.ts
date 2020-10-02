const storage = localStorage;

const USER_SETTINGS = 'user_settings';

export interface UserSettings {
    hide_pronunciation?: boolean;
    hide_hiragana?: boolean;
    hide_part?: boolean;
    hide_meaning?: boolean;
    autoplay_sound?: boolean;
}

const default_settings: UserSettings = {
    hide_pronunciation: false,
    hide_hiragana: false,
    hide_part: false,
    hide_meaning: false,
    autoplay_sound: false
}

export function getAllUserSettings(): UserSettings {
    let objStr = storage.getItem(USER_SETTINGS);
    if (!objStr) return default_settings;
    return JSON.parse(objStr);
}

export function setUserSetting(key: keyof UserSettings, value: boolean) {
    let settings = { ...getAllUserSettings(), ...{ [key]: value } };
    storage.setItem(USER_SETTINGS, JSON.stringify(settings));
}