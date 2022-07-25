import { translateLoginURL, login, showOverlay, hideOverlay } from "./utils";

chrome.webRequest.onResponseStarted.addListener(
  (details) => {
    (async (details) => {
      await showOverlay(details.tabId);

      const loginStatus = await login({
        checkLogin: false,
        throwOnInvalidLogin: false,
        callback: async () => {
          await chrome.tabs.reload(details.tabId);
        },
      });

      if (!loginStatus) await hideOverlay(details.tabId);
    })(details);
  },
  {
    urls: ["https://*.ezproxy.torontopubliclibrary.ca/login*"],
  },
);

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url!.includes("ezproxy.torontopubliclibrary.ca"))
    await showOverlay(tab.id!);

  const loginStatus = await login({
    checkLogin: false,
    throwOnInvalidLogin: false,
    callback: async () => {
      if (tab.url!.includes("ezproxy.torontopubliclibrary.ca/login")) {
        await chrome.tabs.update(tab.id!, {
          url: translateLoginURL(new URL(tab.url!)),
        });
      } else if (
        tab.url!.includes("-oreilly-com.ezproxy.torontopubliclibrary.ca")
      ) {
        await chrome.tabs.reload(tab.id!);
      } else {
        await chrome.tabs.create({
          url: "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/home/",
        });
      }
    },
  });

  if (!loginStatus) await hideOverlay(tab.id!);
});
