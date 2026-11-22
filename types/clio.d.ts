/* clio.js and clio-sounds-panel.js: the globals they define, for TypeScript and
 * editors. Shipped as dist/clio.d.ts. The scripts are not modules: load them with
 * <script src>, then reach them as window.clio and window.clioSoundsPanel. */

/** A rectangle in viewport pixels, as getBoundingClientRect gives one. */
interface ClioRect { left: number; top: number; width: number; height: number }

/** clio.sounds.use()'s options: the eras a set plays for, and an alert list's sound. */
interface ClioSoundsUseOptions { era?: string | string[]; alert?: string }

interface ClioSounds {
  /** Load a sound set or alert list manifest (made by tooling/soundset.py) and decode its sounds. */
  use(url: string, opts?: ClioSoundsUseOptions): Promise<{ name: string | undefined; sounds: number } | null>;
  /** Play an Appearance sound kind ('mnuo', 'btnp', ...) for the element's era, or "alert". */
  play(code: string, el?: Element | null): void;
  beginDrag(code: string, el?: Element | null): void;
  dragMove(): void;
  endDrag(): void;
  muted: boolean;
  /** 0 to 1. */
  volume: number;
  /** The alert sound for an era by name; without a name, the one in use. */
  alertSound(era: string, name?: string): string | null | undefined;
  readonly loaded: {
    sets: { name: string | undefined; eras: string[] | null }[];
    alerts: { name: string | undefined; eras: string[] | null; list: unknown }[];
  };
  /** The 0.11 interface: clio.sounds.alert = "beep.wav", a URL per sound name. */
  [legacyName: string]: unknown;
}

interface ClioApi {
  readonly version: string;
  /** The Finder's zoom rects from one element or rect to another. */
  zoomRects(from: Element | ClioRect, to: Element | ClioRect, opts?: { closing?: boolean }): Promise<void>;
  /** Fold a window to its title bar (WindowShade), or unfold it. */
  collapse(win: Element, on?: boolean): void;
  sounds: ClioSounds;
  play(code: string, el?: Element | null): void;
  /** Draw the era's scroll bars on the scrollers in root; returns the ones claimed. */
  scrollbars(root?: Document | Element): Element[];
  unscroll(el: Element): void;
  refresh(el: Element): void;
  /** Align centred labels again, after a change clio.js cannot see. */
  centre(): void;
}

interface ClioSoundsPanelOptions {
  /** Where the packs' index.json lives; default "packs/". */
  base?: string;
  /** The eras a sound set plays for; default Drawing Board and Platinum. */
  eras?: string | string[] | null;
}

type ClioSoundsPanel = (container: Element, opts?: ClioSoundsPanelOptions) => { destroy(): void };

interface Window {
  clio?: ClioApi;
  clioSoundsPanel?: ClioSoundsPanel;
}
