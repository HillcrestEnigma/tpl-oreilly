const userIdInputElem = <HTMLInputElement>document.getElementById("userId")!;
const passwordInputElem = <HTMLInputElement>(
  document.getElementById("password")!
);
const statusElem = document.getElementById("status")!;

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get({ userId: "", password: "" }, function (items) {
    userIdInputElem.value = items.userId;
    passwordInputElem.value = items.password;
  });
});

document.getElementById("save")!.addEventListener("click", () => {
  chrome.storage.local.set(
    {
      userId: userIdInputElem.value,
      password: passwordInputElem.value,
    },
    function () {
      statusElem.textContent = "Options saved.";
      setTimeout(() => {
        statusElem.textContent = "";
      }, 1500);
    }
  );
});
