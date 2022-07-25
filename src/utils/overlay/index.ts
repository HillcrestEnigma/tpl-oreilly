import overlayStyle from "bundle-text:./style.css";

export async function showOverlay(tabId: number) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      let overlay = document.getElementById("tplo-overlay");

      if (overlay == undefined) {
        overlay = document.createElement("div");
        overlay.id = "tplo-overlay";
        document.body.appendChild(overlay);
      }
    },
  });

  await chrome.scripting.insertCSS({
    target: { tabId },
    css: overlayStyle,
  });
}

export async function hideOverlay(tabId: number) {
  await chrome.scripting.removeCSS({
    target: { tabId },
    css: overlayStyle,
  });
}
