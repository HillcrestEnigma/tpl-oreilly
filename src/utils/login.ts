import { Mutex } from "async-mutex";
import { isLoggedIn } from ".";

const loginMutex = new Mutex();

export interface loginCredentials {
  userId?: string;
  password?: string;
}

export interface loginOptions {
  checkLogin?: boolean;
  openOptionsPage?: boolean;
  throwOnInvalidLogin?: boolean;
  credentialsOverride?: loginCredentials;
  callback?: () => any;
}

export async function login({
  checkLogin = true,
  openOptionsPage = true,
  throwOnInvalidLogin = true,
  credentialsOverride,
  callback = () => {},
}: loginOptions): Promise<boolean> {
  if (loginMutex.isLocked()) return false;
  const releaseMutex = await loginMutex.acquire();

  try {
    if (checkLogin && (await isLoggedIn())) return false;

    const credentials = {
      ...(await chrome.storage.local.get(["userId", "password"])),
      ...credentialsOverride,
    };

    let resp = await fetch("https://ezproxy.torontopubliclibrary.ca/login", {
      body: `user=${credentials.userId}&pass=${credentials.password}`,
      method: "POST",
    });

    if (!resp.redirected) {
      if (openOptionsPage) chrome.runtime.openOptionsPage();
      if (throwOnInvalidLogin) throw Error("Invalid user id or password");
      else return false;
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
        },
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
        },
      );
    }

    await callback();
  } finally {
    releaseMutex();
  }

  return true;
}
