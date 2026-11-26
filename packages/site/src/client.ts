// The docs page's behaviour: the era switcher and the copy buttons. tooling/build-site.ts bundles
// this with Vite and inlines the result at the end of the page.
const root = document.documentElement;
// NeXTSTEP ships in its own file (clio.nextstep.css): the page swaps stylesheets for it.
const sheet = document.getElementById("clio-sheet");
function set(era: string): void {
  root.setAttribute("data-era", ["platinum", "system7", "drawingboard", "nextstep"].indexOf(era) >= 0 ? era : "system6");
  if (sheet) sheet.setAttribute("href", era === "nextstep" ? "dist/clio.nextstep.css" : "dist/clio.css");
}
let era = new URLSearchParams(location.search).get("era");
if (!era) {
  try {
    era = localStorage.getItem("clio-era");
  } catch {}
}
if (era) {
  set(era);
  const input = document.querySelector<HTMLInputElement>(`input[name="era"][value="${root.getAttribute("data-era")}"]`);
  if (input) input.checked = true;
}
document.querySelectorAll<HTMLInputElement>('input[name="era"]').forEach((input) => {
  input.addEventListener("change", () => {
    set(input.value);
    try {
      localStorage.setItem("clio-era", input.value);
    } catch {}
  });
});
document.querySelectorAll<HTMLButtonElement>("button.copy").forEach((button) => {
  button.addEventListener("click", () => {
    const text = document.getElementById(button.getAttribute("data-copy") as string)?.textContent ?? "";
    const done = (): void => {
      button.textContent = "Copied";
      setTimeout(() => {
        button.textContent = "Copy HTML";
      }, 1500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => {});
  });
});
