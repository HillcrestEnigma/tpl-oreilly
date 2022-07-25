export async function isLoggedIn() {
  const resp = await fetch(
    "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/accounts/login-academic-check/",
  );

  return (
    resp.url ==
    "https://learning-oreilly-com.ezproxy.torontopubliclibrary.ca/home/"
  );
}
