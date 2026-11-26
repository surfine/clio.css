// Helpers and types more than one part of clio.js needs.
export type Pt = { x: number; y: number };
export type Ctl = HTMLElement & { disabled?: boolean };

export const TICK = 1000 / 60;
export const OFF = "data-clio-off";
export const optedOut = (el: Element) => !!el.closest('[data-clio-js="off"]');
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const DEFAULT = ".default:not(:disabled), .btn-default:not(:disabled), [data-clio-default]:not(:disabled)";
export const CANCEL = "[data-clio-cancel]:not(:disabled), button[value=cancel]:not(:disabled), .cancel:not(:disabled)";
export const ALERT = ".alert-box, [role=alertdialog]";
export const isUtility = (el: Element) => !!el.closest(".window.utility");
export const px = (v: string) => parseFloat(v) || 0;
export const make = (cls: string, parent: Element) => { const d = document.createElement("div"); d.className = cls; parent.appendChild(d); return d; };
