async function isLoggedIn() {
  const resp = await fetch(
    "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/accounts/login-academic-check/"
  );

  return (
    resp.url ==
    "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/home"
  );
}

async function login() {
  if (await isLoggedIn()) {
    return;
  }

  const { userId: userId, password: password } = await chrome.storage.local.get(
    ["userId", "password"]
  );

  let resp = await fetch("https://ezproxy.torontopubliclibrary.ca/login", {
    body: `url=https%3A%2F%2Fwww.oreilly.com%2Flibrary%2Fview%2Ftemporary-access%2F&user=${userId}&pass=${password}`,
    method: "POST",
  });

  if (!resp.redirected) {
    throw Error("Invalid user id or password");
  } else if (
    resp.url !=
    "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/home/"
  ) {
    const emailLocalPartAlphabet =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const emailLocalPart = [...crypto.getRandomValues(new Uint8Array(64))]
      .map((e) => emailLocalPartAlphabet[e % emailLocalPartAlphabet.length])
      .join("")
      .toString();

    resp = await fetch(
      "https://www-oreilly-com.ezproxy.torontopubliclibrary.ca/api/v1/account-summary-by-network/",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json = await resp.json();

    resp = await fetch(
      "https://www-oreilly-com.ezproxy.torontopubliclibrary.ca/api/v1/registration/academic/",
      {
        body: JSON.stringify({
          account_identifier: json.identifier,
          ar: true,
          email: `${emailLocalPart}@${json.identifier}.com`,
          signature: "",
          timestamp: "",
        }),
        headers: {
          "Content-Type": "application/json",
        },
        referrer:
          "https://www-oreilly-com.ezproxy.torontopubliclibrary.ca/library-access/",
        method: "POST",
      }
    );
  }
}

function translateURL(url: URL, host?: string) {
  if (host === undefined) {
    host = url.host;
  }

  host = host.replace(/\./g, "-");

  return `${url.protocol}//${host}.ezproxy.torontopubliclibrary.ca${url.pathname}`;
}

function translateLoginURL(url: URL) {
  return translateURL(
    new URL(url.searchParams.get("qurl")!),
    "learning.oreilly.com"
  );
}

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     (async (details) => {
//       try {
//         await login();
//       } catch (e) {
//         if (e.message == "Invalid user id or password") {
//           return;
//         }
//       }

//       chrome.tabs.update(details.tabId, {
//         url: translateLoginURL(new URL(details.url)),
//       });
//     })(details);
//   },
//   {
//     urls: ["https://login.ezproxy.torontopubliclibrary.ca/login*"],
//     types: ["main_frame"],
//   }
// );

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await login();
  } catch (e) {
    if (e.message == "Invalid user id or password") {
      chrome.runtime.openOptionsPage();

      return;
    }

    throw e;
  }

  if (tab.url?.includes(".ezproxy.torontopubliclibrary.ca/login")) {
    chrome.tabs.update({ url: translateLoginURL(new URL(tab.url)) });
  } else {
    chrome.tabs.create({
      url: "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/home/",
    });
  }
});
