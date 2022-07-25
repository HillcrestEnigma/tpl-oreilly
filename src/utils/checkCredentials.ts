import { loginCredentials } from ".";

export async function checkCredentials(
  credentialsOverride: loginCredentials,
): Promise<boolean> {
  const credentials = {
    ...(await chrome.storage.local.get({
      userId: "",
      password: "",
    })),
    ...credentialsOverride,
  };

  const resp = await fetch(
    "https://login.ezproxy.torontopubliclibrary.ca/login",
    {
      body: `user=${credentials.userId}&pass=${credentials.password}`,
      method: "POST",
      credentials: "omit",
    },
  );

  return resp.redirected;
}
