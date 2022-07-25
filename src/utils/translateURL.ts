export function translateURL(url: URL, host?: string) {
  if (host === undefined) {
    host = url.host;
  }

  host = host.replace(/\./g, "-");

  return `${url.protocol}//${host}.ezproxy.torontopubliclibrary.ca${url.pathname}`;
}

export function translateLoginURL(url: URL) {
  return translateURL(
    new URL(url.searchParams.get("qurl")!),
    "learning.oreilly.com",
  );
}
