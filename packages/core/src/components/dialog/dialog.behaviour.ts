import { controlSound } from "../../runtime/sounds.ts";
import { CANCEL, DEFAULT, TICK, optedOut } from "../../runtime/shared.ts";

/* ---- Default and cancel buttons from the keyboard ----------------------- */
// Return or Enter is the default button; Esc and Cmd-. are Cancel. The button
// shows pressed for 8 ticks first, as the Dialog Manager flashes it.
const DIALOG = ".modal-dialog, .alert-box, .standard-dialog, .modeless-dialog, .window.movable-modal, dialog, [role=dialog], [role=alertdialog]";

const flash = (button: HTMLElement) => {
  const had = button.classList.contains("active");
  button.classList.add("active");
  controlSound(button, "p");
  setTimeout(() => { if (!had) button.classList.remove("active"); controlSound(button, "r"); button.click(); }, 8 * TICK);
};

export function install(): void {
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.isComposing || e.repeat) return;
    const enter = (e.key === "Enter") && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
    const cancel = e.key === "Escape" || (e.key === "." && (e.metaKey || e.ctrlKey));
    if (!enter && !cancel) return;
    const focus = document.activeElement instanceof Element ? document.activeElement : null;
    const scope = (focus && focus.closest(DIALOG)) || [...document.querySelectorAll("dialog[open]")].pop();
    if (!scope || optedOut(scope)) return;
    if (enter && focus && (focus.matches("textarea, button, select, [role=button], [contenteditable], a[href], summary") || (focus as HTMLElement).isContentEditable)) return;
    const button = scope.querySelector<HTMLElement>(enter ? DEFAULT : CANCEL);
    if (!button) return;
    e.preventDefault();
    flash(button);
  });
}
