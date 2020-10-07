const HAS_CHROME_STORAGE = chrome && chrome.storage && chrome.storage.sync;

export function getItem(key: string) {
  if (!HAS_CHROME_STORAGE) {
    let output = localStorage.getItem(key);
    return Promise.resolve(output ? JSON.parse(output) : null);
  }
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, (items) => {
      resolve(items[key]);
    });
  });
}

export function setItem(key: string, value: any) {
  if (!HAS_CHROME_STORAGE) {
    localStorage.setItem(key, JSON.stringify(value));
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, resolve);
  });
}
