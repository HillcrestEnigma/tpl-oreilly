import { checkCredentials, loginCredentials } from "../utils";

const userIdInputElem = <HTMLInputElement>document.getElementById("userId")!;
const passwordInputElem = <HTMLInputElement>(
  document.getElementById("password")!
);
const saveButtonElem = <HTMLButtonElement>document.getElementById("save")!;
const errorElem = document.getElementById("error")!;

document.addEventListener("DOMContentLoaded", async () => {
  const credentials = await chrome.storage.local.get({
    userId: "",
    password: "",
  });

  userIdInputElem.value = credentials.userId;
  passwordInputElem.value = credentials.password;

  updateLoginStatus(credentials);
});

saveButtonElem!.addEventListener("click", async () => {
  const credentials = {
    userId: userIdInputElem.value,
    password: passwordInputElem.value,
  };

  await chrome.storage.local.set(credentials);

  errorElem.innerText = "";
  saveButtonElem.textContent = "Saved";
  saveButtonElem.disabled = true;

  setTimeout(() => {
    saveButtonElem.textContent = "Save";
    saveButtonElem.disabled = false;
  }, 1500);

  updateLoginStatus(credentials);
});

async function updateLoginStatus(credentials: loginCredentials) {
  if (
    (credentials.userId == "" && credentials.password == "") ||
    (await checkCredentials(credentials))
  ) {
    errorElem.innerText = "";
  } else {
    errorElem.innerText = "Invalid user id or password";
  }
}
