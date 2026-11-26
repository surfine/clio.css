// clio.css 2.0.0 host contract: dist/contract.js's eras, components and token names.
declare const contract: {
  "version": "2.0.0",
  "eras": [
    "system6",
    "system7",
    "drawingboard",
    "platinum",
    "nextstep"
  ],
  "components": [
    {
      "id": "window",
      "selectors": [
        ".window",
        ".window.inactive",
        ".title-bar",
        ".title-bar > .title",
        ".title-bar > .close",
        ".title-bar > .resize",
        ".title-bar > .shade",
        ".details-bar",
        ".window-pane",
        ".status-bar",
        ".separator",
        ".inactive-title-bar"
      ],
      "aliases": {
        "system.css": [
          ".title-bar button.close",
          ".title-bar button.resize",
          ".inactive-title-bar",
          ".window-pane",
          ".details-bar",
          ".separator"
        ],
        "AI System 6": [
          ".close-box",
          ".resize-box",
          ".shade-box",
          ".title-bar h1",
          ".title-bar h2"
        ]
      },
      "tokens": [
        "--clio-window-bg",
        "--clio-window-border",
        "--clio-window-shadow",
        "--clio-titlebar-height",
        "--clio-titlebar-bg",
        "--clio-box-size",
        "--clio-box-inset",
        "--clio-box-isolation",
        "--clio-pane-bg"
      ]
    },
    {
      "id": "menu",
      "selectors": [
        ".menu-bar",
        "[role=menubar]",
        ".menu",
        "[role=menu]",
        ".menu > li",
        "li.separator",
        "li.checked",
        "li.disabled",
        "kbd"
      ],
      "aliases": {
        "system.css": [
          "ul[role=menu-bar]",
          "[role=menu-item]",
          "li.divider"
        ]
      },
      "tokens": [
        "--clio-menubar-height",
        "--clio-menubar-bg",
        "--clio-menu-bg",
        "--clio-menu-shadow",
        "--clio-menu-item-height",
        "--clio-menu-item-active-bg",
        "--clio-menu-separator"
      ]
    },
    {
      "id": "button",
      "selectors": [
        "button",
        ".btn",
        ".default",
        ".btn-default",
        "button:active",
        "button.active",
        "button:disabled",
        "input[type=submit]"
      ],
      "aliases": {
        "system.css": [
          ".btn",
          ".btn-default",
          ".standard-button"
        ],
        "AI System 6": [
          ".btn.default"
        ]
      },
      "tokens": [
        "--clio-button-bg",
        "--clio-button-border",
        "--clio-button-radius",
        "--clio-button-shadow",
        "--clio-button-active-bg",
        "--clio-button-default-width",
        "--clio-button-default-radius",
        "--clio-control-height"
      ]
    },
    {
      "id": "checkbox",
      "selectors": [
        "input[type=checkbox]",
        "label > input[type=checkbox]",
        ".field-row"
      ],
      "aliases": {},
      "tokens": [
        "--clio-check-size",
        "--clio-check-bg",
        "--clio-check-border",
        "--clio-check-shadow",
        "--clio-check-mark"
      ]
    },
    {
      "id": "radio",
      "selectors": [
        "input[type=radio]"
      ],
      "aliases": {},
      "tokens": [
        "--clio-radio-size",
        "--clio-radio-off",
        "--clio-radio-on"
      ]
    },
    {
      "id": "text-field",
      "selectors": [
        "input[type=text]",
        "input[type=search]",
        "input[type=email]",
        "input[type=password]",
        "input[type=number]",
        "textarea"
      ],
      "aliases": {},
      "tokens": [
        "--clio-field-bg",
        "--clio-field-border",
        "--clio-field-shadow",
        "--clio-field-padding",
        "--clio-field-height",
        "--clio-caret-height"
      ]
    },
    {
      "id": "select",
      "selectors": [
        "select",
        "select[multiple]",
        "select[size]"
      ],
      "aliases": {},
      "tokens": [
        "--clio-popup-bg",
        "--clio-popup-border",
        "--clio-popup-shadow",
        "--clio-popup-arrow"
      ]
    },
    {
      "id": "listbox",
      "selectors": [
        ".listbox",
        "[role=listbox]",
        "[role=option]",
        "[aria-selected=true]",
        ".selected"
      ],
      "aliases": {},
      "tokens": [
        "--clio-list-bg",
        "--clio-list-border",
        "--clio-list-shadow",
        "--clio-list-row",
        "--clio-selection-bg",
        "--clio-selection-fg"
      ]
    },
    {
      "id": "scrollbar",
      "selectors": [
        ".window-pane",
        ".clio-scroll",
        "html.clio-scrollbars",
        "::-webkit-scrollbar"
      ],
      "aliases": {},
      "tokens": [
        "--clio-scrollbar-size",
        "--clio-scrollbar-track",
        "--clio-scrollbar-thumb-bg",
        "--clio-scrollbar-button-bg"
      ]
    },
    {
      "id": "dialog",
      "selectors": [
        ".modal-dialog",
        ".alert-box",
        ".standard-dialog",
        ".modeless-dialog",
        ".alert-icon",
        ".dialog-buttons"
      ],
      "aliases": {
        "system.css": [
          ".modal-dialog",
          ".alert-box",
          ".standard-dialog",
          ".outer-border",
          ".inner-border",
          ".modal-contents"
        ]
      },
      "tokens": [
        "--clio-dialog-bg",
        "--clio-modal-border",
        "--clio-modal-frame",
        "--clio-plain-dialog-shadow"
      ]
    },
    {
      "id": "fieldset",
      "selectors": [
        "fieldset",
        "legend"
      ],
      "aliases": {},
      "tokens": [
        "--clio-group-border",
        "--clio-group-shadow"
      ]
    },
    {
      "id": "progress",
      "selectors": [
        "progress"
      ],
      "aliases": {},
      "tokens": [
        "--clio-progress-height",
        "--clio-progress-bg",
        "--clio-progress-fill",
        "--clio-progress-shadow"
      ]
    },
    {
      "id": "tabs",
      "selectors": [
        "[role=tablist]",
        "[role=tab]",
        "[aria-selected=true]",
        "[role=tabpanel]",
        ".tabs",
        ".tab-panel"
      ],
      "aliases": {},
      "tokens": [
        "--clio-tab-height",
        "--clio-tab-panel-bg",
        "--clio-tab-panel-border"
      ]
    },
    {
      "id": "control-strip",
      "selectors": [
        ".control-strip",
        ".control-strip.is-collapsed",
        ".control-strip-scroll",
        ".control-strip-scroll-back",
        ".control-strip-scroll-forward",
        ".control-strip-modules",
        ".control-strip-module-track",
        ".control-strip-module",
        ".control-strip-handle"
      ],
      "aliases": {},
      "tokens": [
        "--clio-strip-height",
        "--clio-strip-bg",
        "--clio-strip-line",
        "--clio-strip-cell-shadow",
        "--clio-strip-sunken-shadow",
        "--clio-strip-pressed-bg",
        "--clio-strip-pressed-shadow",
        "--clio-strip-module-width",
        "--clio-strip-handle"
      ]
    },
    {
      "id": "desktop",
      "selectors": [
        ".desktop",
        ".icon",
        ".icon > img",
        ".icon > figcaption",
        ".icon.selected"
      ],
      "aliases": {},
      "tokens": [
        "--clio-desktop",
        "--clio-label-bg",
        "--clio-label-selected-bg",
        "--clio-icon-selected-filter"
      ]
    },
    {
      "id": "disclosure",
      "selectors": [
        ".disclosure",
        ".disclosure[aria-expanded=true]",
        "details > summary",
        "details[open] > summary"
      ],
      "aliases": {},
      "tokens": [
        "--clio-disclosure-size",
        "--clio-art-disclosure",
        "--clio-art-disclosure-open"
      ]
    },
    {
      "id": "list-view",
      "selectors": [
        ".list-view",
        ".list-view th[aria-sort]",
        ".list-view th.sort-direction",
        ".list-view td.sorted"
      ],
      "aliases": {},
      "tokens": [
        "--clio-list-view-row",
        "--clio-list-view-header-height",
        "--clio-list-view-sorted-bg"
      ]
    },
    {
      "id": "slider",
      "selectors": [
        "input[type=range]",
        "input[type=range].ticks"
      ],
      "aliases": {},
      "tokens": [
        "--clio-slider-height",
        "--clio-art-slider-track",
        "--clio-art-slider-thumb",
        "--clio-slider-tick-count"
      ]
    },
    {
      "id": "little-arrows",
      "selectors": [
        ".little-arrows",
        ".little-arrows > .up",
        ".little-arrows > .down",
        ".little-arrows[aria-disabled=true]"
      ],
      "aliases": {},
      "tokens": [
        "--clio-little-arrows-width",
        "--clio-little-arrows-height",
        "--clio-art-little-arrows"
      ]
    },
    {
      "id": "bevel-button",
      "selectors": [
        ".bevel",
        ".bevel.menu",
        ".bevel[aria-pressed=true]",
        ".bevel:active"
      ],
      "aliases": {},
      "tokens": [
        "--clio-art-bevel",
        "--clio-art-bevel-held",
        "--clio-bevel-slice"
      ]
    },
    {
      "id": "chasing-arrows",
      "selectors": [
        ".chasing-arrows"
      ],
      "aliases": {},
      "tokens": [
        "--clio-art-chasing-arrows",
        "--clio-chasing-arrows-frames"
      ]
    },
    {
      "id": "help-button",
      "selectors": [
        ".help-button"
      ],
      "aliases": {},
      "tokens": [
        "--clio-art-help-button"
      ]
    },
    {
      "id": "image-well",
      "selectors": [
        ".image-well"
      ],
      "aliases": {},
      "tokens": [
        "--clio-image-well-bg",
        "--clio-field-border",
        "--clio-field-shadow"
      ]
    },
    {
      "id": "balloon",
      "selectors": [
        ".balloon"
      ],
      "aliases": {},
      "tokens": [
        "--clio-art-balloon",
        "--clio-art-balloon-tail"
      ]
    },
    {
      "id": "rounded-window",
      "selectors": [
        ".rounded-window",
        ".rounded-window.inactive",
        ".rounded-title",
        ".rounded-title > .close",
        ".rounded-title > h2"
      ],
      "aliases": {},
      "tokens": [
        "--clio-rounded-bg",
        "--clio-art-rdoc-mask-tl",
        "--clio-art-rdoc-frame-tl"
      ]
    },
    {
      "id": "side-utility-window",
      "selectors": [
        ".window.utility.side",
        ".window.utility.side.inactive"
      ],
      "aliases": {},
      "tokens": []
    },
    {
      "id": "placard",
      "selectors": [
        ".placard",
        ".placard[aria-disabled=true]"
      ],
      "aliases": {},
      "tokens": []
    },
    {
      "id": "split-bar",
      "selectors": [
        ".split-view",
        ".split-bar",
        ".split-line"
      ],
      "aliases": {},
      "tokens": [
        "--clio-split-bar-height",
        "--clio-split-line-1",
        "--clio-split-bg",
        "--clio-split-ink"
      ]
    },
    {
      "id": "browser",
      "selectors": [
        ".browser",
        ".browser > .listbox",
        ".browser .branch"
      ],
      "aliases": {},
      "tokens": [
        "--clio-browser-column",
        "--clio-browser-row"
      ],
      "eras": [
        "nextstep"
      ]
    },
    {
      "id": "pull-down",
      "selectors": [
        ".pull-down"
      ],
      "aliases": {},
      "tokens": [
        "--clio-button-bg"
      ],
      "eras": [
        "nextstep"
      ]
    },
    {
      "id": "dock",
      "selectors": [
        ".dock",
        ".dock > li",
        ".dock > .not-running"
      ],
      "aliases": {},
      "tokens": [
        "--clio-dock-tile",
        "--clio-dock-tile-bg"
      ],
      "eras": [
        "nextstep"
      ]
    },
    {
      "id": "typography",
      "selectors": [
        ".clio",
        ".text",
        ".heading",
        ".display",
        "[data-era=system6]",
        "[data-era=platinum]"
      ],
      "aliases": {},
      "tokens": [
        "--clio-ink",
        "--clio-paper",
        "--clio-font-chrome",
        "--clio-font-text",
        "--clio-font-display",
        "--clio-font-cjk",
        "--clio-font-size",
        "--clio-selection-bg",
        "--clio-focus-outline"
      ]
    }
  ],
  "tokens": {
    system6: {
      "--clio-ink": string;
      "--clio-paper": string;
      "--clio-face": string;
      "--clio-disabled": string;
      "--clio-disabled-dither": string;
      "--clio-disabled-fill": string;
      "--clio-popup-disabled-mask": string;
      "--clio-popup-disabled-fg": string;
      "--clio-selection-bg": string;
      "--clio-selection-fg": string;
      "--clio-font-chrome": string;
      "--clio-font-text": string;
      "--clio-font-small": string;
      "--clio-text-smoothing": string;
      "--clio-text-smoothing-moz": string;
      "--clio-font-mono": string;
      "--clio-font-display": string;
      "--clio-font-size": string;
      "--clio-font-smoothing": string;
      "--clio-font-size-small": string;
      "--clio-chrome-weight": string;
      "--clio-font-stretch-text": string;
      "--clio-font-stretch-title": string;
      "--clio-line": string;
      "--clio-border": string;
      "--clio-radius": string;
      "--clio-control-height": string;
      "--clio-field-height": string;
      "--clio-caret-height": string;
      "--clio-caret-ticks": string;
      "--clio-row-height": string;
      "--clio-gap": string;
      "--clio-focus-outline": string;
      "--clio-focus-offset": string;
      "--clio-desktop": string;
      "--clio-window-bg": string;
      "--clio-pane-bg": string;
      "--clio-window-border": string;
      "--clio-window-shadow": string;
      "--clio-window-padding": string;
      "--clio-titlebar-height": string;
      "--clio-titlebar-margin": string;
      "--clio-titlebar-padding": string;
      "--clio-titlebar-border": string;
      "--clio-titlebar-row": string;
      "--clio-titlebar-stripe": string;
      "--clio-titlebar-bg": string;
      "--clio-titlebar-inactive-bg": string;
      "--clio-title-font-size": string;
      "--clio-title-bg": string;
      "--clio-title-fg": string;
      "--clio-title-inactive-fg": string;
      "--clio-title-padding": string;
      "--clio-titlebar-slot": string;
      "--clio-titlebar-shade-slot": string;
      "--clio-shade-display": string;
      "--clio-box-size": string;
      "--clio-box-inset": string;
      "--clio-box-isolation": string;
      "--clio-menubar-height": string;
      "--clio-menubar-bg": string;
      "--clio-menubar-border": string;
      "--clio-menubar-shadow": string;
      "--clio-menubar-padding": string;
      "--clio-menu-title-padding": string;
      "--clio-menu-title-inset": string;
      "--clio-menu-title-active-bg": string;
      "--clio-menu-title-active-fg": string;
      "--clio-menu-title-active-shadow": string;
      "--clio-menu-bg": string;
      "--clio-menu-border": string;
      "--clio-menu-border-top-width": string;
      "--clio-menu-shadow": string;
      "--clio-menu-item-height": string;
      "--clio-menu-item-padding": string;
      "--clio-menu-item-weight": string;
      "--clio-menu-item-active-bg": string;
      "--clio-menu-item-active-fg": string;
      "--clio-menu-item-active-shadow": string;
      "--clio-menu-separator": string;
      "--clio-menu-separator-height": string;
      "--clio-button-bg": string;
      "--clio-button-fg": string;
      "--clio-button-border": string;
      "--clio-button-radius": string;
      "--clio-button-frame": string;
      "--clio-button-frame-held": string;
      "--clio-button-frame-slice": string;
      "--clio-ring-frame": string;
      "--clio-ring-frame-slice": string;
      "--clio-popup-frame": string;
      "--clio-popup-frame-slice": string;
      "--clio-button-shadow": string;
      "--clio-button-padding": string;
      "--clio-button-min-width": string;
      "--clio-button-weight": string;
      "--clio-button-active-bg": string;
      "--clio-button-active-fg": string;
      "--clio-button-active-shadow": string;
      "--clio-button-default-gap": string;
      "--clio-button-default-width": string;
      "--clio-button-default-radius": string;
      "--clio-button-disabled-fg": string;
      "--clio-button-disabled-border": string;
      "--clio-check-size": string;
      "--clio-check-bg": string;
      "--clio-check-border": string;
      "--clio-check-shadow": string;
      "--clio-check-mark": string;
      "--clio-check-mark-origin": string;
      "--clio-check-pressed-border-width": string;
      "--clio-radio-size": string;
      "--clio-radio-off": string;
      "--clio-radio-on": string;
      "--clio-radio-pressed": string;
      "--clio-radio-pressed-on": string;
      "--clio-field-bg": string;
      "--clio-field-border": string;
      "--clio-field-shadow": string;
      "--clio-field-padding": string;
      "--clio-field-focus-shadow": string;
      "--clio-field-focus-outline": string;
      "--clio-popup-bg": string;
      "--clio-popup-border": string;
      "--clio-popup-radius": string;
      "--clio-popup-shadow": string;
      "--clio-popup-height": string;
      "--clio-popup-padding": string;
      "--clio-popup-arrow": string;
      "--clio-popup-weight": string;
      "--clio-scrollbar-size": string;
      "--clio-scrollbar-track": string;
      "--clio-scrollbar-thumb-length": string;
      "--clio-scrollbar-thumb-tracking": string;
      "--clio-scrollbar-thumb-overlap": string;
      "--clio-scrollbar-thumb-after": string;
      "--clio-scrollbar-repeat-delay": string;
      "--clio-menu-sticky": string;
      "--clio-drag-outline-width": string;
      "--clio-drag-outline-extra": string;
      "--clio-zoom-count": string;
      "--clio-zoom-steps": string;
      "--clio-zoom-ratio": string;
      "--clio-zoom-offset": string;
      "--clio-zoom-keep": string;
      "--clio-drag-outline-shadow-inset": string;
      "--clio-scrollbar-ghost": string;
      "--clio-scrollbar-ghost-blend": string;
      "--clio-scrollbar-thumb-inset": string;
      "--clio-scrollbar-track-shadow": string;
      "--clio-scrollbar-thumb-bg": string;
      "--clio-scrollbar-thumb-border": string;
      "--clio-scrollbar-thumb-shadow": string;
      "--clio-scrollbar-button-bg": string;
      "--clio-scrollbar-button-shadow": string;
      "--clio-scrollbar-button-bevel": string;
      "--clio-scrollbar-up": string;
      "--clio-scrollbar-up-on": string;
      "--clio-scrollbar-down": string;
      "--clio-scrollbar-down-on": string;
      "--clio-scrollbar-left": string;
      "--clio-scrollbar-left-on": string;
      "--clio-scrollbar-right": string;
      "--clio-scrollbar-right-on": string;
      "--clio-dialog-bg": string;
      "--clio-modal-border": string;
      "--clio-modal-frame": string;
      "--clio-modal-padding": string;
      "--clio-plain-dialog-border": string;
      "--clio-plain-dialog-shadow": string;
      "--clio-details-bg": string;
      "--clio-details-border": string;
      "--clio-details-font-size": string;
      "--clio-details-height": string;
      "--clio-details-padding": string;
      "--clio-scrollbar-corner": string;
      "--clio-list-bg": string;
      "--clio-list-border": string;
      "--clio-list-shadow": string;
      "--clio-list-row": string;
      "--clio-group-border": string;
      "--clio-group-shadow": string;
      "--clio-group-bg": string;
      "--clio-progress-height": string;
      "--clio-progress-bg": string;
      "--clio-progress-border": string;
      "--clio-progress-shadow": string;
      "--clio-progress-fill": string;
      "--clio-tab-height": string;
      "--clio-tab-bg": string;
      "--clio-tab-active-bg": string;
      "--clio-tab-panel-bg": string;
      "--clio-tab-panel-border": string;
      "--clio-label-bg": string;
      "--clio-label-fg": string;
      "--clio-label-selected-bg": string;
      "--clio-label-selected-fg": string;
      "--clio-strip-height": string;
      "--clio-strip-bg": string;
      "--clio-strip-line": string;
      "--clio-strip-cell-shadow": string;
      "--clio-strip-sunken-shadow": string;
      "--clio-strip-sunken-lines": string;
      "--clio-strip-pressed-bg": string;
      "--clio-strip-pressed-shadow": string;
      "--clio-strip-cap-width": string;
      "--clio-strip-scroll-width": string;
      "--clio-strip-module-width": string;
      "--clio-strip-icon-inset": string;
      "--clio-strip-menu-top": string;
      "--clio-strip-menu-inset": string;
      "--clio-strip-handle-width": string;
      "--clio-strip-tab-width": string;
      "--clio-strip-cap": string;
      "--clio-strip-back": string;
      "--clio-strip-forward": string;
      "--clio-strip-menu": string;
      "--clio-strip-handle": string;
      "--clio-strip-tab": string;
      "--clio-art-s6-check": string;
      "--clio-art-s6-radio": string;
      "--clio-art-s6-radio-focus": string;
      "--clio-art-s6-radio-dot": string;
      "--clio-art-s6-submenu": string;
      "--clio-art-s6-submenu-on": string;
      "--clio-art-s6-desktop": string;
      "--clio-art-s6-up": string;
      "--clio-art-s6-up-on": string;
      "--clio-art-s6-down": string;
      "--clio-art-s6-down-on": string;
      "--clio-art-s6-left": string;
      "--clio-art-s6-left-on": string;
      "--clio-art-s6-right": string;
      "--clio-art-s6-right-on": string;
      "--clio-art-s6-burst": string;
      "--clio-art-s6-ltgray": string;
      "--clio-art-s6-grow": string;
      "--clio-art-s6-dkgray": string;
      "--clio-art-s6-menucheck": string;
      "--clio-disclosure-size": string;
      "--clio-disclosure-gap": string;
      "--clio-art-disclosure": string;
      "--clio-art-disclosure-open": string;
      "--clio-list-view-bg": string;
      "--clio-list-view-row": string;
      "--clio-list-view-header-height": string;
      "--clio-list-view-header-padding": string;
      "--clio-list-view-header-bg": string;
      "--clio-list-view-sorted-header-bg": string;
      "--clio-list-view-sorted-decoration": string;
      "--clio-list-view-sorted-bg": string;
      "--clio-list-view-sort-width": string;
      "--clio-slider-height": string;
      "--clio-slider-track-height": string;
      "--clio-slider-track-top": string;
      "--clio-slider-track-slice": string;
      "--clio-slider-track-slice-n": string;
      "--clio-slider-thumb-width": string;
      "--clio-slider-thumb-height": string;
      "--clio-art-slider-track": string;
      "--clio-art-slider-thumb": string;
      "--clio-slider-tick-gap": string;
      "--clio-slider-tick-count": string;
      "--clio-slider-tick-offset": string;
      "--clio-slider-tick-run": string;
      "--clio-slider-tick-light": string;
      "--clio-slider-tick-ink": string;
      "--clio-slider-tick-shade": string;
      "--clio-little-arrows-width": string;
      "--clio-little-arrows-height": string;
      "--clio-art-little-arrows": string;
      "--clio-art-little-arrows-up": string;
      "--clio-art-little-arrows-down": string;
      "--clio-art-little-arrows-disabled": string;
      "--clio-bevel-min": string;
      "--clio-bevel-padding": string;
      "--clio-bevel-slice": string;
      "--clio-bevel-slice-n": string;
      "--clio-art-bevel": string;
      "--clio-art-bevel-held": string;
      "--clio-art-bevel-menu-arrow": string;
      "--clio-bevel-arrow-right": string;
      "--clio-bevel-arrow-bottom": string;
      "--clio-bevel-arrow-width": string;
      "--clio-bevel-arrow-height": string;
      "--clio-art-chasing-arrows": string;
      "--clio-chasing-arrows-frames": string;
      "--clio-separator-height": string;
      "--clio-separator-margin": string;
      "--clio-separator-bg": string;
      "--clio-art-help-button": string;
      "--clio-image-well-bg": string;
      "--clio-utility-titlebar-height": string;
      "--clio-utility-titlebar-row": string;
      "--clio-utility-box-size": string;
      "--clio-utility-slot": string;
      "--clio-utility-title-size": string;
      "--clio-art-balloon": string;
      "--clio-art-balloon-tail": string;
      "--clio-art-menu-scroll-down": string;
      "--clio-art-menu-scroll-up": string;
      "--clio-menu-scroll-left": string;
      "--clio-art-frame-s6-button": string;
      "--clio-art-frame-s6-button-held": string;
      "--clio-art-frame-s6-ring": string;
      "--clio-art-frame-p9-button": string;
      "--clio-art-frame-p9-button-held": string;
      "--clio-art-frame-p9-ring": string;
      "--clio-art-frame-p9-button-disabled": string;
      "--clio-art-frame-p9-popup": string;
      "--clio-art-frame-p9-popup-open": string;
      "--clio-art-frame-p9-popup-disabled": string;
      "--clio-art-s6-gray50": string;
      "--clio-art-s6-menucheck-on": string;
      "--clio-art-s6-strip-cap": string;
      "--clio-art-s6-strip-back": string;
      "--clio-art-s6-strip-forward": string;
      "--clio-art-s6-strip-menu": string;
      "--clio-art-s6-strip-handle": string;
      "--clio-art-s6-strip-tab": string;
      "--clio-art-rdoc-mask-tl": string;
      "--clio-art-rdoc-frame-tl": string;
      "--clio-art-rdoc-mask-tr": string;
      "--clio-art-rdoc-frame-tr": string;
      "--clio-art-rdoc-mask-bl": string;
      "--clio-art-rdoc-frame-bl": string;
      "--clio-art-rdoc-mask-br": string;
      "--clio-art-rdoc-frame-br": string;
      "--clio-art-p9-strip-cap": string;
      "--clio-art-s7-strip-cap": string;
      "--clio-art-p9-strip-back": string;
      "--clio-art-p9-strip-forward": string;
      "--clio-art-p9-strip-menu": string;
      "--clio-art-p9-strip-handle": string;
      "--clio-art-p9-strip-tab": string;
    };
    system7: {
      "--clio-ink": string;
      "--clio-paper": string;
      "--clio-face": string;
      "--clio-disabled": string;
      "--clio-disabled-dither": string;
      "--clio-disabled-fill": string;
      "--clio-popup-disabled-mask": string;
      "--clio-popup-disabled-fg": string;
      "--clio-selection-bg": string;
      "--clio-selection-fg": string;
      "--clio-font-chrome": string;
      "--clio-font-text": string;
      "--clio-font-small": string;
      "--clio-text-smoothing": string;
      "--clio-text-smoothing-moz": string;
      "--clio-font-mono": string;
      "--clio-font-display": string;
      "--clio-font-size": string;
      "--clio-font-smoothing": string;
      "--clio-font-size-small": string;
      "--clio-chrome-weight": string;
      "--clio-font-stretch-text": string;
      "--clio-font-stretch-title": string;
      "--clio-line": string;
      "--clio-border": string;
      "--clio-radius": string;
      "--clio-control-height": string;
      "--clio-field-height": string;
      "--clio-caret-height": string;
      "--clio-caret-ticks": string;
      "--clio-row-height": string;
      "--clio-gap": string;
      "--clio-focus-outline": string;
      "--clio-focus-offset": string;
      "--clio-desktop": string;
      "--clio-window-bg": string;
      "--clio-pane-bg": string;
      "--clio-window-border": string;
      "--clio-window-shadow": string;
      "--clio-window-padding": string;
      "--clio-titlebar-height": string;
      "--clio-titlebar-margin": string;
      "--clio-titlebar-padding": string;
      "--clio-titlebar-border": string;
      "--clio-titlebar-row": string;
      "--clio-titlebar-stripe": string;
      "--clio-titlebar-bg": string;
      "--clio-titlebar-inactive-bg": string;
      "--clio-title-font-size": string;
      "--clio-title-bg": string;
      "--clio-title-fg": string;
      "--clio-title-inactive-fg": string;
      "--clio-title-padding": string;
      "--clio-titlebar-slot": string;
      "--clio-titlebar-shade-slot": string;
      "--clio-shade-display": string;
      "--clio-box-size": string;
      "--clio-box-inset": string;
      "--clio-box-isolation": string;
      "--clio-menubar-height": string;
      "--clio-menubar-bg": string;
      "--clio-menubar-border": string;
      "--clio-menubar-shadow": string;
      "--clio-menubar-padding": string;
      "--clio-menu-title-padding": string;
      "--clio-menu-title-inset": string;
      "--clio-menu-title-active-bg": string;
      "--clio-menu-title-active-fg": string;
      "--clio-menu-title-active-shadow": string;
      "--clio-menu-bg": string;
      "--clio-menu-border": string;
      "--clio-menu-border-top-width": string;
      "--clio-menu-shadow": string;
      "--clio-menu-item-height": string;
      "--clio-menu-item-padding": string;
      "--clio-menu-item-weight": string;
      "--clio-menu-item-active-bg": string;
      "--clio-menu-item-active-fg": string;
      "--clio-menu-item-active-shadow": string;
      "--clio-menu-separator": string;
      "--clio-menu-separator-height": string;
      "--clio-button-bg": string;
      "--clio-button-fg": string;
      "--clio-button-border": string;
      "--clio-button-radius": string;
      "--clio-button-frame": string;
      "--clio-button-frame-held": string;
      "--clio-button-frame-slice": string;
      "--clio-ring-frame": string;
      "--clio-ring-frame-slice": string;
      "--clio-popup-frame": string;
      "--clio-popup-frame-slice": string;
      "--clio-button-shadow": string;
      "--clio-button-padding": string;
      "--clio-button-min-width": string;
      "--clio-button-weight": string;
      "--clio-button-active-bg": string;
      "--clio-button-active-fg": string;
      "--clio-button-active-shadow": string;
      "--clio-button-default-gap": string;
      "--clio-button-default-width": string;
      "--clio-button-default-radius": string;
      "--clio-button-disabled-fg": string;
      "--clio-button-disabled-border": string;
      "--clio-check-size": string;
      "--clio-check-bg": string;
      "--clio-check-border": string;
      "--clio-check-shadow": string;
      "--clio-check-mark": string;
      "--clio-check-mark-origin": string;
      "--clio-check-pressed-border-width": string;
      "--clio-radio-size": string;
      "--clio-radio-off": string;
      "--clio-radio-on": string;
      "--clio-radio-pressed": string;
      "--clio-radio-pressed-on": string;
      "--clio-field-bg": string;
      "--clio-field-border": string;
      "--clio-field-shadow": string;
      "--clio-field-padding": string;
      "--clio-field-focus-shadow": string;
      "--clio-field-focus-outline": string;
      "--clio-popup-bg": string;
      "--clio-popup-border": string;
      "--clio-popup-radius": string;
      "--clio-popup-shadow": string;
      "--clio-popup-height": string;
      "--clio-popup-padding": string;
      "--clio-popup-arrow": string;
      "--clio-popup-weight": string;
      "--clio-scrollbar-size": string;
      "--clio-scrollbar-track": string;
      "--clio-scrollbar-thumb-length": string;
      "--clio-scrollbar-thumb-tracking": string;
      "--clio-scrollbar-thumb-overlap": string;
      "--clio-scrollbar-thumb-after": string;
      "--clio-scrollbar-repeat-delay": string;
      "--clio-menu-sticky": string;
      "--clio-drag-outline-width": string;
      "--clio-drag-outline-extra": string;
      "--clio-zoom-count": string;
      "--clio-zoom-steps": string;
      "--clio-zoom-ratio": string;
      "--clio-zoom-offset": string;
      "--clio-zoom-keep": string;
      "--clio-drag-outline-shadow-inset": string;
      "--clio-scrollbar-ghost": string;
      "--clio-scrollbar-ghost-blend": string;
      "--clio-scrollbar-thumb-inset": string;
      "--clio-scrollbar-track-shadow": string;
      "--clio-scrollbar-thumb-bg": string;
      "--clio-scrollbar-thumb-border": string;
      "--clio-scrollbar-thumb-shadow": string;
      "--clio-scrollbar-button-bg": string;
      "--clio-scrollbar-button-shadow": string;
      "--clio-scrollbar-button-bevel": string;
      "--clio-scrollbar-up": string;
      "--clio-scrollbar-up-on": string;
      "--clio-scrollbar-down": string;
      "--clio-scrollbar-down-on": string;
      "--clio-scrollbar-left": string;
      "--clio-scrollbar-left-on": string;
      "--clio-scrollbar-right": string;
      "--clio-scrollbar-right-on": string;
      "--clio-dialog-bg": string;
      "--clio-modal-border": string;
      "--clio-modal-frame": string;
      "--clio-modal-padding": string;
      "--clio-plain-dialog-border": string;
      "--clio-plain-dialog-shadow": string;
      "--clio-details-bg": string;
      "--clio-details-border": string;
      "--clio-details-font-size": string;
      "--clio-details-height": string;
      "--clio-details-padding": string;
      "--clio-scrollbar-corner": string;
      "--clio-list-bg": string;
      "--clio-list-border": string;
      "--clio-list-shadow": string;
      "--clio-list-row": string;
      "--clio-group-border": string;
      "--clio-group-shadow": string;
      "--clio-group-bg": string;
      "--clio-progress-height": string;
      "--clio-progress-bg": string;
      "--clio-progress-border": string;
      "--clio-progress-shadow": string;
      "--clio-progress-fill": string;
      "--clio-tab-height": string;
      "--clio-tab-bg": string;
      "--clio-tab-active-bg": string;
      "--clio-tab-panel-bg": string;
      "--clio-tab-panel-border": string;
      "--clio-label-bg": string;
      "--clio-label-fg": string;
      "--clio-label-selected-bg": string;
      "--clio-label-selected-fg": string;
      "--clio-strip-height": string;
      "--clio-strip-bg": string;
      "--clio-strip-line": string;
      "--clio-strip-cell-shadow": string;
      "--clio-strip-sunken-shadow": string;
      "--clio-strip-sunken-lines": string;
      "--clio-strip-pressed-bg": string;
      "--clio-strip-pressed-shadow": string;
      "--clio-strip-cap-width": string;
      "--clio-strip-scroll-width": string;
      "--clio-strip-module-width": string;
      "--clio-strip-icon-inset": string;
      "--clio-strip-menu-top": string;
      "--clio-strip-menu-inset": string;
      "--clio-strip-handle-width": string;
      "--clio-strip-tab-width": string;
      "--clio-strip-cap": string;
      "--clio-strip-back": string;
      "--clio-strip-forward": string;
      "--clio-strip-menu": string;
      "--clio-strip-handle": string;
      "--clio-strip-tab": string;
      "--clio-art-s6-check": string;
      "--clio-art-s6-radio": string;
      "--clio-art-s6-radio-focus": string;
      "--clio-art-s6-radio-dot": string;
      "--clio-art-s6-submenu": string;
      "--clio-art-s6-submenu-on": string;
      "--clio-art-s6-desktop": string;
      "--clio-art-s6-up": string;
      "--clio-art-s6-up-on": string;
      "--clio-art-s6-down": string;
      "--clio-art-s6-down-on": string;
      "--clio-art-s6-left": string;
      "--clio-art-s6-left-on": string;
      "--clio-art-s6-right": string;
      "--clio-art-s6-right-on": string;
      "--clio-art-s6-burst": string;
      "--clio-art-s6-ltgray": string;
      "--clio-art-s6-grow": string;
      "--clio-art-s6-dkgray": string;
      "--clio-art-s6-menucheck": string;
      "--clio-disclosure-size": string;
      "--clio-disclosure-gap": string;
      "--clio-art-disclosure": string;
      "--clio-art-disclosure-open": string;
      "--clio-list-view-bg": string;
      "--clio-list-view-row": string;
      "--clio-list-view-header-height": string;
      "--clio-list-view-header-padding": string;
      "--clio-list-view-header-bg": string;
      "--clio-list-view-sorted-header-bg": string;
      "--clio-list-view-sorted-decoration": string;
      "--clio-list-view-sorted-bg": string;
      "--clio-list-view-sort-width": string;
      "--clio-slider-height": string;
      "--clio-slider-track-height": string;
      "--clio-slider-track-top": string;
      "--clio-slider-track-slice": string;
      "--clio-slider-track-slice-n": string;
      "--clio-slider-thumb-width": string;
      "--clio-slider-thumb-height": string;
      "--clio-art-slider-track": string;
      "--clio-art-slider-thumb": string;
      "--clio-slider-tick-gap": string;
      "--clio-slider-tick-count": string;
      "--clio-slider-tick-offset": string;
      "--clio-slider-tick-run": string;
      "--clio-slider-tick-light": string;
      "--clio-slider-tick-ink": string;
      "--clio-slider-tick-shade": string;
      "--clio-little-arrows-width": string;
      "--clio-little-arrows-height": string;
      "--clio-art-little-arrows": string;
      "--clio-art-little-arrows-up": string;
      "--clio-art-little-arrows-down": string;
      "--clio-art-little-arrows-disabled": string;
      "--clio-bevel-min": string;
      "--clio-bevel-padding": string;
      "--clio-bevel-slice": string;
      "--clio-bevel-slice-n": string;
      "--clio-art-bevel": string;
      "--clio-art-bevel-held": string;
      "--clio-art-bevel-menu-arrow": string;
      "--clio-bevel-arrow-right": string;
      "--clio-bevel-arrow-bottom": string;
      "--clio-bevel-arrow-width": string;
      "--clio-bevel-arrow-height": string;
      "--clio-art-chasing-arrows": string;
      "--clio-chasing-arrows-frames": string;
      "--clio-separator-height": string;
      "--clio-separator-margin": string;
      "--clio-separator-bg": string;
      "--clio-art-help-button": string;
      "--clio-image-well-bg": string;
      "--clio-utility-titlebar-height": string;
      "--clio-utility-titlebar-row": string;
      "--clio-utility-box-size": string;
      "--clio-utility-slot": string;
      "--clio-utility-title-size": string;
      "--clio-art-balloon": string;
      "--clio-art-balloon-tail": string;
      "--clio-art-menu-scroll-down": string;
      "--clio-art-menu-scroll-up": string;
      "--clio-menu-scroll-left": string;
      "--clio-art-frame-s6-button": string;
      "--clio-art-frame-s6-button-held": string;
      "--clio-art-frame-s6-ring": string;
      "--clio-art-frame-p9-button": string;
      "--clio-art-frame-p9-button-held": string;
      "--clio-art-frame-p9-ring": string;
      "--clio-art-frame-p9-button-disabled": string;
      "--clio-art-frame-p9-popup": string;
      "--clio-art-frame-p9-popup-open": string;
      "--clio-art-frame-p9-popup-disabled": string;
      "--clio-art-s6-gray50": string;
      "--clio-art-s6-menucheck-on": string;
      "--clio-art-s6-strip-cap": string;
      "--clio-art-s6-strip-back": string;
      "--clio-art-s6-strip-forward": string;
      "--clio-art-s6-strip-menu": string;
      "--clio-art-s6-strip-handle": string;
      "--clio-art-s6-strip-tab": string;
      "--clio-art-rdoc-mask-tl": string;
      "--clio-art-rdoc-frame-tl": string;
      "--clio-art-rdoc-mask-tr": string;
      "--clio-art-rdoc-frame-tr": string;
      "--clio-art-rdoc-mask-bl": string;
      "--clio-art-rdoc-frame-bl": string;
      "--clio-art-rdoc-mask-br": string;
      "--clio-art-rdoc-frame-br": string;
      "--clio-art-p9-strip-cap": string;
      "--clio-art-s7-strip-cap": string;
      "--clio-art-p9-strip-back": string;
      "--clio-art-p9-strip-forward": string;
      "--clio-art-p9-strip-menu": string;
      "--clio-art-p9-strip-handle": string;
      "--clio-art-p9-strip-tab": string;
      "--clio-scrollbar-thumb-bg-horizontal": string;
      "--clio-scrollbar-thumb-color": string;
      "--clio-scrollbar-track-color": string;
      "--clio-art-s7-up": string;
      "--clio-art-s7-down": string;
      "--clio-art-s7-left": string;
      "--clio-art-s7-right": string;
      "--clio-art-s7-grow": string;
      "--clio-art-s7-grip-v": string;
      "--clio-art-s7-grip-h": string;
    };
    drawingboard: {
      "--clio-ink": string;
      "--clio-paper": string;
      "--clio-face": string;
      "--clio-disabled": string;
      "--clio-disabled-dither": string;
      "--clio-disabled-fill": string;
      "--clio-popup-disabled-mask": string;
      "--clio-popup-disabled-fg": string;
      "--clio-selection-bg": string;
      "--clio-selection-fg": string;
      "--clio-font-chrome": string;
      "--clio-font-text": string;
      "--clio-font-small": string;
      "--clio-text-smoothing": string;
      "--clio-text-smoothing-moz": string;
      "--clio-font-mono": string;
      "--clio-font-display": string;
      "--clio-font-size": string;
      "--clio-font-smoothing": string;
      "--clio-font-size-small": string;
      "--clio-chrome-weight": string;
      "--clio-font-stretch-text": string;
      "--clio-font-stretch-title": string;
      "--clio-line": string;
      "--clio-border": string;
      "--clio-radius": string;
      "--clio-control-height": string;
      "--clio-field-height": string;
      "--clio-caret-height": string;
      "--clio-caret-ticks": string;
      "--clio-row-height": string;
      "--clio-gap": string;
      "--clio-focus-outline": string;
      "--clio-focus-offset": string;
      "--clio-desktop": string;
      "--clio-window-bg": string;
      "--clio-pane-bg": string;
      "--clio-window-border": string;
      "--clio-window-shadow": string;
      "--clio-window-padding": string;
      "--clio-titlebar-height": string;
      "--clio-titlebar-margin": string;
      "--clio-titlebar-padding": string;
      "--clio-titlebar-border": string;
      "--clio-titlebar-row": string;
      "--clio-titlebar-stripe": string;
      "--clio-titlebar-bg": string;
      "--clio-titlebar-inactive-bg": string;
      "--clio-title-font-size": string;
      "--clio-title-bg": string;
      "--clio-title-fg": string;
      "--clio-title-inactive-fg": string;
      "--clio-title-padding": string;
      "--clio-titlebar-slot": string;
      "--clio-titlebar-shade-slot": string;
      "--clio-shade-display": string;
      "--clio-box-size": string;
      "--clio-box-inset": string;
      "--clio-box-isolation": string;
      "--clio-menubar-height": string;
      "--clio-menubar-bg": string;
      "--clio-menubar-border": string;
      "--clio-menubar-shadow": string;
      "--clio-menubar-padding": string;
      "--clio-menu-title-padding": string;
      "--clio-menu-title-inset": string;
      "--clio-menu-title-active-bg": string;
      "--clio-menu-title-active-fg": string;
      "--clio-menu-title-active-shadow": string;
      "--clio-menu-bg": string;
      "--clio-menu-border": string;
      "--clio-menu-border-top-width": string;
      "--clio-menu-shadow": string;
      "--clio-menu-item-height": string;
      "--clio-menu-item-padding": string;
      "--clio-menu-item-weight": string;
      "--clio-menu-item-active-bg": string;
      "--clio-menu-item-active-fg": string;
      "--clio-menu-item-active-shadow": string;
      "--clio-menu-separator": string;
      "--clio-menu-separator-height": string;
      "--clio-button-bg": string;
      "--clio-button-fg": string;
      "--clio-button-border": string;
      "--clio-button-radius": string;
      "--clio-button-frame": string;
      "--clio-button-frame-held": string;
      "--clio-button-frame-slice": string;
      "--clio-ring-frame": string;
      "--clio-ring-frame-slice": string;
      "--clio-popup-frame": string;
      "--clio-popup-frame-slice": string;
      "--clio-button-shadow": string;
      "--clio-button-padding": string;
      "--clio-button-min-width": string;
      "--clio-button-weight": string;
      "--clio-button-active-bg": string;
      "--clio-button-active-fg": string;
      "--clio-button-active-shadow": string;
      "--clio-button-default-gap": string;
      "--clio-button-default-width": string;
      "--clio-button-default-radius": string;
      "--clio-button-disabled-fg": string;
      "--clio-button-disabled-border": string;
      "--clio-check-size": string;
      "--clio-check-bg": string;
      "--clio-check-border": string;
      "--clio-check-shadow": string;
      "--clio-check-mark": string;
      "--clio-check-mark-origin": string;
      "--clio-check-pressed-border-width": string;
      "--clio-radio-size": string;
      "--clio-radio-off": string;
      "--clio-radio-on": string;
      "--clio-radio-pressed": string;
      "--clio-radio-pressed-on": string;
      "--clio-field-bg": string;
      "--clio-field-border": string;
      "--clio-field-shadow": string;
      "--clio-field-padding": string;
      "--clio-field-focus-shadow": string;
      "--clio-field-focus-outline": string;
      "--clio-popup-bg": string;
      "--clio-popup-border": string;
      "--clio-popup-radius": string;
      "--clio-popup-shadow": string;
      "--clio-popup-height": string;
      "--clio-popup-padding": string;
      "--clio-popup-arrow": string;
      "--clio-popup-weight": string;
      "--clio-scrollbar-size": string;
      "--clio-scrollbar-track": string;
      "--clio-scrollbar-thumb-length": string;
      "--clio-scrollbar-thumb-tracking": string;
      "--clio-scrollbar-thumb-overlap": string;
      "--clio-scrollbar-thumb-after": string;
      "--clio-scrollbar-repeat-delay": string;
      "--clio-menu-sticky": string;
      "--clio-drag-outline-width": string;
      "--clio-drag-outline-extra": string;
      "--clio-zoom-count": string;
      "--clio-zoom-steps": string;
      "--clio-zoom-ratio": string;
      "--clio-zoom-offset": string;
      "--clio-zoom-keep": string;
      "--clio-drag-outline-shadow-inset": string;
      "--clio-scrollbar-ghost": string;
      "--clio-scrollbar-ghost-blend": string;
      "--clio-scrollbar-thumb-inset": string;
      "--clio-scrollbar-track-shadow": string;
      "--clio-scrollbar-thumb-bg": string;
      "--clio-scrollbar-thumb-border": string;
      "--clio-scrollbar-thumb-shadow": string;
      "--clio-scrollbar-button-bg": string;
      "--clio-scrollbar-button-shadow": string;
      "--clio-scrollbar-button-bevel": string;
      "--clio-scrollbar-up": string;
      "--clio-scrollbar-up-on": string;
      "--clio-scrollbar-down": string;
      "--clio-scrollbar-down-on": string;
      "--clio-scrollbar-left": string;
      "--clio-scrollbar-left-on": string;
      "--clio-scrollbar-right": string;
      "--clio-scrollbar-right-on": string;
      "--clio-dialog-bg": string;
      "--clio-modal-border": string;
      "--clio-modal-frame": string;
      "--clio-modal-padding": string;
      "--clio-plain-dialog-border": string;
      "--clio-plain-dialog-shadow": string;
      "--clio-details-bg": string;
      "--clio-details-border": string;
      "--clio-details-font-size": string;
      "--clio-details-height": string;
      "--clio-details-padding": string;
      "--clio-scrollbar-corner": string;
      "--clio-list-bg": string;
      "--clio-list-border": string;
      "--clio-list-shadow": string;
      "--clio-list-row": string;
      "--clio-group-border": string;
      "--clio-group-shadow": string;
      "--clio-group-bg": string;
      "--clio-progress-height": string;
      "--clio-progress-bg": string;
      "--clio-progress-border": string;
      "--clio-progress-shadow": string;
      "--clio-progress-fill": string;
      "--clio-tab-height": string;
      "--clio-tab-bg": string;
      "--clio-tab-active-bg": string;
      "--clio-tab-panel-bg": string;
      "--clio-tab-panel-border": string;
      "--clio-label-bg": string;
      "--clio-label-fg": string;
      "--clio-label-selected-bg": string;
      "--clio-label-selected-fg": string;
      "--clio-strip-height": string;
      "--clio-strip-bg": string;
      "--clio-strip-line": string;
      "--clio-strip-cell-shadow": string;
      "--clio-strip-sunken-shadow": string;
      "--clio-strip-sunken-lines": string;
      "--clio-strip-pressed-bg": string;
      "--clio-strip-pressed-shadow": string;
      "--clio-strip-cap-width": string;
      "--clio-strip-scroll-width": string;
      "--clio-strip-module-width": string;
      "--clio-strip-icon-inset": string;
      "--clio-strip-menu-top": string;
      "--clio-strip-menu-inset": string;
      "--clio-strip-handle-width": string;
      "--clio-strip-tab-width": string;
      "--clio-strip-cap": string;
      "--clio-strip-back": string;
      "--clio-strip-forward": string;
      "--clio-strip-menu": string;
      "--clio-strip-handle": string;
      "--clio-strip-tab": string;
      "--clio-art-s6-check": string;
      "--clio-art-s6-radio": string;
      "--clio-art-s6-radio-focus": string;
      "--clio-art-s6-radio-dot": string;
      "--clio-art-s6-submenu": string;
      "--clio-art-s6-submenu-on": string;
      "--clio-art-s6-desktop": string;
      "--clio-art-s6-up": string;
      "--clio-art-s6-up-on": string;
      "--clio-art-s6-down": string;
      "--clio-art-s6-down-on": string;
      "--clio-art-s6-left": string;
      "--clio-art-s6-left-on": string;
      "--clio-art-s6-right": string;
      "--clio-art-s6-right-on": string;
      "--clio-art-s6-burst": string;
      "--clio-art-s6-ltgray": string;
      "--clio-art-s6-grow": string;
      "--clio-art-s6-dkgray": string;
      "--clio-art-s6-menucheck": string;
      "--clio-disclosure-size": string;
      "--clio-disclosure-gap": string;
      "--clio-art-disclosure": string;
      "--clio-art-disclosure-open": string;
      "--clio-list-view-bg": string;
      "--clio-list-view-row": string;
      "--clio-list-view-header-height": string;
      "--clio-list-view-header-padding": string;
      "--clio-list-view-header-bg": string;
      "--clio-list-view-sorted-header-bg": string;
      "--clio-list-view-sorted-decoration": string;
      "--clio-list-view-sorted-bg": string;
      "--clio-list-view-sort-width": string;
      "--clio-slider-height": string;
      "--clio-slider-track-height": string;
      "--clio-slider-track-top": string;
      "--clio-slider-track-slice": string;
      "--clio-slider-track-slice-n": string;
      "--clio-slider-thumb-width": string;
      "--clio-slider-thumb-height": string;
      "--clio-art-slider-track": string;
      "--clio-art-slider-thumb": string;
      "--clio-slider-tick-gap": string;
      "--clio-slider-tick-count": string;
      "--clio-slider-tick-offset": string;
      "--clio-slider-tick-run": string;
      "--clio-slider-tick-light": string;
      "--clio-slider-tick-ink": string;
      "--clio-slider-tick-shade": string;
      "--clio-little-arrows-width": string;
      "--clio-little-arrows-height": string;
      "--clio-art-little-arrows": string;
      "--clio-art-little-arrows-up": string;
      "--clio-art-little-arrows-down": string;
      "--clio-art-little-arrows-disabled": string;
      "--clio-bevel-min": string;
      "--clio-bevel-padding": string;
      "--clio-bevel-slice": string;
      "--clio-bevel-slice-n": string;
      "--clio-art-bevel": string;
      "--clio-art-bevel-held": string;
      "--clio-art-bevel-menu-arrow": string;
      "--clio-bevel-arrow-right": string;
      "--clio-bevel-arrow-bottom": string;
      "--clio-bevel-arrow-width": string;
      "--clio-bevel-arrow-height": string;
      "--clio-art-chasing-arrows": string;
      "--clio-chasing-arrows-frames": string;
      "--clio-separator-height": string;
      "--clio-separator-margin": string;
      "--clio-separator-bg": string;
      "--clio-art-help-button": string;
      "--clio-image-well-bg": string;
      "--clio-utility-titlebar-height": string;
      "--clio-utility-titlebar-row": string;
      "--clio-utility-box-size": string;
      "--clio-utility-slot": string;
      "--clio-utility-title-size": string;
      "--clio-art-balloon": string;
      "--clio-art-balloon-tail": string;
      "--clio-art-menu-scroll-down": string;
      "--clio-art-menu-scroll-up": string;
      "--clio-menu-scroll-left": string;
      "--clio-art-frame-s6-button": string;
      "--clio-art-frame-s6-button-held": string;
      "--clio-art-frame-s6-ring": string;
      "--clio-art-frame-p9-button": string;
      "--clio-art-frame-p9-button-held": string;
      "--clio-art-frame-p9-ring": string;
      "--clio-art-frame-p9-button-disabled": string;
      "--clio-art-frame-p9-popup": string;
      "--clio-art-frame-p9-popup-open": string;
      "--clio-art-frame-p9-popup-disabled": string;
      "--clio-art-s6-gray50": string;
      "--clio-art-s6-menucheck-on": string;
      "--clio-art-s6-strip-cap": string;
      "--clio-art-s6-strip-back": string;
      "--clio-art-s6-strip-forward": string;
      "--clio-art-s6-strip-menu": string;
      "--clio-art-s6-strip-handle": string;
      "--clio-art-s6-strip-tab": string;
      "--clio-art-rdoc-mask-tl": string;
      "--clio-art-rdoc-frame-tl": string;
      "--clio-art-rdoc-mask-tr": string;
      "--clio-art-rdoc-frame-tr": string;
      "--clio-art-rdoc-mask-bl": string;
      "--clio-art-rdoc-frame-bl": string;
      "--clio-art-rdoc-mask-br": string;
      "--clio-art-rdoc-frame-br": string;
      "--clio-art-p9-strip-cap": string;
      "--clio-art-s7-strip-cap": string;
      "--clio-art-p9-strip-back": string;
      "--clio-art-p9-strip-forward": string;
      "--clio-art-p9-strip-menu": string;
      "--clio-art-p9-strip-handle": string;
      "--clio-art-p9-strip-tab": string;
      "--clio-p9-bevel": string;
      "--clio-button-frame-disabled": string;
      "--clio-font-window-title": string;
      "--clio-font-button": string;
      "--clio-focus-ring-colour": string;
      "--clio-focus-ring": string;
      "--clio-list-focus-shadow": string;
      "--clio-scrollbar-button-bevel-on": string;
      "--clio-scrollbar-thumb-bg-horizontal": string;
      "--clio-scrollbar-thumb-color": string;
      "--clio-scrollbar-track-color": string;
      "--clio-details-shadow": string;
      "--clio-art-p9-group-dots": string;
      "--clio-icon-selected-filter": string;
      "--clio-art-p-dropdown": string;
      "--clio-art-p-dropdown-off": string;
      "--clio-art-p-check": string;
      "--clio-art-p-submenu": string;
      "--clio-art-p-submenu-on": string;
      "--clio-art-p-up": string;
      "--clio-art-p-up-off": string;
      "--clio-art-p-down": string;
      "--clio-art-p-down-off": string;
      "--clio-art-p-left": string;
      "--clio-art-p-left-off": string;
      "--clio-art-p-right": string;
      "--clio-art-p-right-off": string;
      "--clio-art-p-grip-v": string;
      "--clio-art-p-grip-h": string;
      "--clio-art-p-tab-selected": string;
      "--clio-art-p-tab": string;
      "--clio-art-p-tab-pressed": string;
      "--clio-art-p9-check": string;
      "--clio-art-p9-check-overhang": string;
      "--clio-art-p9-radio-on": string;
      "--clio-art-p9-radio": string;
      "--clio-art-p9-radio-pressed": string;
      "--clio-art-p9-checkbox-pressed": string;
      "--clio-art-p9-box-face": string;
      "--clio-art-p9-progress-pole": string;
      "--clio-art-p9-submenu": string;
      "--clio-art-p9-submenu-on": string;
      "--clio-art-p9-dropdown": string;
      "--clio-art-p9-dropdown-off": string;
      "--clio-art-p9-menucheck": string;
      "--clio-art-p9-popup-open-arrows": string;
      "--clio-cursor-arrow": string;
      "--clio-drag-outline-extra-y": string;
      "--clio-drag-outline-margin": string;
      "--clio-db-outline-tl": string;
      "--clio-db-outline-tr": string;
      "--clio-db-outline-bl": string;
      "--clio-db-outline-br": string;
      "--clio-db-phase": string;
      "--clio-art-db-close": string;
      "--clio-art-db-close-on": string;
      "--clio-art-db-collapse": string;
      "--clio-art-db-collapse-on": string;
      "--clio-art-db-zoom": string;
      "--clio-art-db-zoom-on": string;
      "--clio-art-db-check": string;
      "--clio-art-db-check-on": string;
      "--clio-art-db-check-mixed": string;
      "--clio-art-db-check-pressed": string;
      "--clio-art-db-check-on-pressed": string;
      "--clio-art-db-check-disabled": string;
      "--clio-art-db-check-on-disabled": string;
      "--clio-art-db-radio": string;
      "--clio-art-db-radio-on": string;
      "--clio-art-db-radio-on-pressed": string;
      "--clio-art-db-radio-disabled": string;
      "--clio-art-db-radio-on-disabled": string;
      "--clio-art-db-up": string;
      "--clio-art-db-up-on": string;
      "--clio-art-db-up-off": string;
      "--clio-art-db-down": string;
      "--clio-art-db-down-on": string;
      "--clio-art-db-down-off": string;
      "--clio-art-db-left": string;
      "--clio-art-db-left-on": string;
      "--clio-art-db-left-off": string;
      "--clio-art-db-right": string;
      "--clio-art-db-right-on": string;
      "--clio-art-db-right-off": string;
      "--clio-art-db-popup-arrow": string;
      "--clio-art-db-popup-arrow-off": string;
      "--clio-art-db-submenu": string;
      "--clio-art-db-menucheck": string;
      "--clio-art-db-grow": string;
      "--clio-art-db-popup-corner": string;
      "--clio-art-db-popup-corner-off": string;
      "--clio-art-db-button-corner": string;
      "--clio-art-db-btn-tl": string;
      "--clio-art-db-btn-tr": string;
      "--clio-art-db-btn-br": string;
      "--clio-art-db-btn-br-held": string;
      "--clio-art-db-btn-bl": string;
      "--clio-art-db-progress-arrows": string;
      "--clio-art-db-def-tl": string;
      "--clio-art-db-def-tr": string;
      "--clio-art-db-def-br": string;
      "--clio-art-db-def-bl": string;
      "--clio-art-db-thumb-left": string;
      "--clio-art-db-thumb-right": string;
      "--clio-art-db-thumb-hgrip": string;
      "--clio-art-db-thumb-hstretch": string;
      "--clio-art-db-thumb-top": string;
      "--clio-art-db-thumb-bottom": string;
      "--clio-art-db-thumb-vgrip": string;
      "--clio-art-db-thumb-vstretch": string;
      "--clio-art-db-tab": string;
      "--clio-art-db-tab-selected": string;
      "--clio-art-db-tab-pressed": string;
      "--clio-art-db-menu-underline-left": string;
      "--clio-art-db-menu-underline": string;
      "--clio-art-db-menu-underline-right": string;
      "--clio-art-db-title-underline-left": string;
      "--clio-art-db-title-underline": string;
      "--clio-art-db-title-underline-right": string;
      "--clio-art-db-menu-underline-tiled": string;
      "--clio-art-db-title-underline-tiled": string;
    };
    platinum: {
      "--clio-ink": string;
      "--clio-paper": string;
      "--clio-face": string;
      "--clio-disabled": string;
      "--clio-disabled-dither": string;
      "--clio-disabled-fill": string;
      "--clio-popup-disabled-mask": string;
      "--clio-popup-disabled-fg": string;
      "--clio-selection-bg": string;
      "--clio-selection-fg": string;
      "--clio-font-chrome": string;
      "--clio-font-text": string;
      "--clio-font-small": string;
      "--clio-text-smoothing": string;
      "--clio-text-smoothing-moz": string;
      "--clio-font-mono": string;
      "--clio-font-display": string;
      "--clio-font-size": string;
      "--clio-font-smoothing": string;
      "--clio-font-size-small": string;
      "--clio-chrome-weight": string;
      "--clio-font-stretch-text": string;
      "--clio-font-stretch-title": string;
      "--clio-line": string;
      "--clio-border": string;
      "--clio-radius": string;
      "--clio-control-height": string;
      "--clio-field-height": string;
      "--clio-caret-height": string;
      "--clio-caret-ticks": string;
      "--clio-row-height": string;
      "--clio-gap": string;
      "--clio-focus-outline": string;
      "--clio-focus-offset": string;
      "--clio-desktop": string;
      "--clio-window-bg": string;
      "--clio-pane-bg": string;
      "--clio-window-border": string;
      "--clio-window-shadow": string;
      "--clio-window-padding": string;
      "--clio-titlebar-height": string;
      "--clio-titlebar-margin": string;
      "--clio-titlebar-padding": string;
      "--clio-titlebar-border": string;
      "--clio-titlebar-row": string;
      "--clio-titlebar-stripe": string;
      "--clio-titlebar-bg": string;
      "--clio-titlebar-inactive-bg": string;
      "--clio-title-font-size": string;
      "--clio-title-bg": string;
      "--clio-title-fg": string;
      "--clio-title-inactive-fg": string;
      "--clio-title-padding": string;
      "--clio-titlebar-slot": string;
      "--clio-titlebar-shade-slot": string;
      "--clio-shade-display": string;
      "--clio-box-size": string;
      "--clio-box-inset": string;
      "--clio-box-isolation": string;
      "--clio-menubar-height": string;
      "--clio-menubar-bg": string;
      "--clio-menubar-border": string;
      "--clio-menubar-shadow": string;
      "--clio-menubar-padding": string;
      "--clio-menu-title-padding": string;
      "--clio-menu-title-inset": string;
      "--clio-menu-title-active-bg": string;
      "--clio-menu-title-active-fg": string;
      "--clio-menu-title-active-shadow": string;
      "--clio-menu-bg": string;
      "--clio-menu-border": string;
      "--clio-menu-border-top-width": string;
      "--clio-menu-shadow": string;
      "--clio-menu-item-height": string;
      "--clio-menu-item-padding": string;
      "--clio-menu-item-weight": string;
      "--clio-menu-item-active-bg": string;
      "--clio-menu-item-active-fg": string;
      "--clio-menu-item-active-shadow": string;
      "--clio-menu-separator": string;
      "--clio-menu-separator-height": string;
      "--clio-button-bg": string;
      "--clio-button-fg": string;
      "--clio-button-border": string;
      "--clio-button-radius": string;
      "--clio-button-frame": string;
      "--clio-button-frame-held": string;
      "--clio-button-frame-slice": string;
      "--clio-ring-frame": string;
      "--clio-ring-frame-slice": string;
      "--clio-popup-frame": string;
      "--clio-popup-frame-slice": string;
      "--clio-button-shadow": string;
      "--clio-button-padding": string;
      "--clio-button-min-width": string;
      "--clio-button-weight": string;
      "--clio-button-active-bg": string;
      "--clio-button-active-fg": string;
      "--clio-button-active-shadow": string;
      "--clio-button-default-gap": string;
      "--clio-button-default-width": string;
      "--clio-button-default-radius": string;
      "--clio-button-disabled-fg": string;
      "--clio-button-disabled-border": string;
      "--clio-check-size": string;
      "--clio-check-bg": string;
      "--clio-check-border": string;
      "--clio-check-shadow": string;
      "--clio-check-mark": string;
      "--clio-check-mark-origin": string;
      "--clio-check-pressed-border-width": string;
      "--clio-radio-size": string;
      "--clio-radio-off": string;
      "--clio-radio-on": string;
      "--clio-radio-pressed": string;
      "--clio-radio-pressed-on": string;
      "--clio-field-bg": string;
      "--clio-field-border": string;
      "--clio-field-shadow": string;
      "--clio-field-padding": string;
      "--clio-field-focus-shadow": string;
      "--clio-field-focus-outline": string;
      "--clio-popup-bg": string;
      "--clio-popup-border": string;
      "--clio-popup-radius": string;
      "--clio-popup-shadow": string;
      "--clio-popup-height": string;
      "--clio-popup-padding": string;
      "--clio-popup-arrow": string;
      "--clio-popup-weight": string;
      "--clio-scrollbar-size": string;
      "--clio-scrollbar-track": string;
      "--clio-scrollbar-thumb-length": string;
      "--clio-scrollbar-thumb-tracking": string;
      "--clio-scrollbar-thumb-overlap": string;
      "--clio-scrollbar-thumb-after": string;
      "--clio-scrollbar-repeat-delay": string;
      "--clio-menu-sticky": string;
      "--clio-drag-outline-width": string;
      "--clio-drag-outline-extra": string;
      "--clio-zoom-count": string;
      "--clio-zoom-steps": string;
      "--clio-zoom-ratio": string;
      "--clio-zoom-offset": string;
      "--clio-zoom-keep": string;
      "--clio-drag-outline-shadow-inset": string;
      "--clio-scrollbar-ghost": string;
      "--clio-scrollbar-ghost-blend": string;
      "--clio-scrollbar-thumb-inset": string;
      "--clio-scrollbar-track-shadow": string;
      "--clio-scrollbar-thumb-bg": string;
      "--clio-scrollbar-thumb-border": string;
      "--clio-scrollbar-thumb-shadow": string;
      "--clio-scrollbar-button-bg": string;
      "--clio-scrollbar-button-shadow": string;
      "--clio-scrollbar-button-bevel": string;
      "--clio-scrollbar-up": string;
      "--clio-scrollbar-up-on": string;
      "--clio-scrollbar-down": string;
      "--clio-scrollbar-down-on": string;
      "--clio-scrollbar-left": string;
      "--clio-scrollbar-left-on": string;
      "--clio-scrollbar-right": string;
      "--clio-scrollbar-right-on": string;
      "--clio-dialog-bg": string;
      "--clio-modal-border": string;
      "--clio-modal-frame": string;
      "--clio-modal-padding": string;
      "--clio-plain-dialog-border": string;
      "--clio-plain-dialog-shadow": string;
      "--clio-details-bg": string;
      "--clio-details-border": string;
      "--clio-details-font-size": string;
      "--clio-details-height": string;
      "--clio-details-padding": string;
      "--clio-scrollbar-corner": string;
      "--clio-list-bg": string;
      "--clio-list-border": string;
      "--clio-list-shadow": string;
      "--clio-list-row": string;
      "--clio-group-border": string;
      "--clio-group-shadow": string;
      "--clio-group-bg": string;
      "--clio-progress-height": string;
      "--clio-progress-bg": string;
      "--clio-progress-border": string;
      "--clio-progress-shadow": string;
      "--clio-progress-fill": string;
      "--clio-tab-height": string;
      "--clio-tab-bg": string;
      "--clio-tab-active-bg": string;
      "--clio-tab-panel-bg": string;
      "--clio-tab-panel-border": string;
      "--clio-label-bg": string;
      "--clio-label-fg": string;
      "--clio-label-selected-bg": string;
      "--clio-label-selected-fg": string;
      "--clio-strip-height": string;
      "--clio-strip-bg": string;
      "--clio-strip-line": string;
      "--clio-strip-cell-shadow": string;
      "--clio-strip-sunken-shadow": string;
      "--clio-strip-sunken-lines": string;
      "--clio-strip-pressed-bg": string;
      "--clio-strip-pressed-shadow": string;
      "--clio-strip-cap-width": string;
      "--clio-strip-scroll-width": string;
      "--clio-strip-module-width": string;
      "--clio-strip-icon-inset": string;
      "--clio-strip-menu-top": string;
      "--clio-strip-menu-inset": string;
      "--clio-strip-handle-width": string;
      "--clio-strip-tab-width": string;
      "--clio-strip-cap": string;
      "--clio-strip-back": string;
      "--clio-strip-forward": string;
      "--clio-strip-menu": string;
      "--clio-strip-handle": string;
      "--clio-strip-tab": string;
      "--clio-art-s6-check": string;
      "--clio-art-s6-radio": string;
      "--clio-art-s6-radio-focus": string;
      "--clio-art-s6-radio-dot": string;
      "--clio-art-s6-submenu": string;
      "--clio-art-s6-submenu-on": string;
      "--clio-art-s6-desktop": string;
      "--clio-art-s6-up": string;
      "--clio-art-s6-up-on": string;
      "--clio-art-s6-down": string;
      "--clio-art-s6-down-on": string;
      "--clio-art-s6-left": string;
      "--clio-art-s6-left-on": string;
      "--clio-art-s6-right": string;
      "--clio-art-s6-right-on": string;
      "--clio-art-s6-burst": string;
      "--clio-art-s6-ltgray": string;
      "--clio-art-s6-grow": string;
      "--clio-art-s6-dkgray": string;
      "--clio-art-s6-menucheck": string;
      "--clio-disclosure-size": string;
      "--clio-disclosure-gap": string;
      "--clio-art-disclosure": string;
      "--clio-art-disclosure-open": string;
      "--clio-list-view-bg": string;
      "--clio-list-view-row": string;
      "--clio-list-view-header-height": string;
      "--clio-list-view-header-padding": string;
      "--clio-list-view-header-bg": string;
      "--clio-list-view-sorted-header-bg": string;
      "--clio-list-view-sorted-decoration": string;
      "--clio-list-view-sorted-bg": string;
      "--clio-list-view-sort-width": string;
      "--clio-slider-height": string;
      "--clio-slider-track-height": string;
      "--clio-slider-track-top": string;
      "--clio-slider-track-slice": string;
      "--clio-slider-track-slice-n": string;
      "--clio-slider-thumb-width": string;
      "--clio-slider-thumb-height": string;
      "--clio-art-slider-track": string;
      "--clio-art-slider-thumb": string;
      "--clio-slider-tick-gap": string;
      "--clio-slider-tick-count": string;
      "--clio-slider-tick-offset": string;
      "--clio-slider-tick-run": string;
      "--clio-slider-tick-light": string;
      "--clio-slider-tick-ink": string;
      "--clio-slider-tick-shade": string;
      "--clio-little-arrows-width": string;
      "--clio-little-arrows-height": string;
      "--clio-art-little-arrows": string;
      "--clio-art-little-arrows-up": string;
      "--clio-art-little-arrows-down": string;
      "--clio-art-little-arrows-disabled": string;
      "--clio-bevel-min": string;
      "--clio-bevel-padding": string;
      "--clio-bevel-slice": string;
      "--clio-bevel-slice-n": string;
      "--clio-art-bevel": string;
      "--clio-art-bevel-held": string;
      "--clio-art-bevel-menu-arrow": string;
      "--clio-bevel-arrow-right": string;
      "--clio-bevel-arrow-bottom": string;
      "--clio-bevel-arrow-width": string;
      "--clio-bevel-arrow-height": string;
      "--clio-art-chasing-arrows": string;
      "--clio-chasing-arrows-frames": string;
      "--clio-separator-height": string;
      "--clio-separator-margin": string;
      "--clio-separator-bg": string;
      "--clio-art-help-button": string;
      "--clio-image-well-bg": string;
      "--clio-utility-titlebar-height": string;
      "--clio-utility-titlebar-row": string;
      "--clio-utility-box-size": string;
      "--clio-utility-slot": string;
      "--clio-utility-title-size": string;
      "--clio-art-balloon": string;
      "--clio-art-balloon-tail": string;
      "--clio-art-menu-scroll-down": string;
      "--clio-art-menu-scroll-up": string;
      "--clio-menu-scroll-left": string;
      "--clio-art-frame-s6-button": string;
      "--clio-art-frame-s6-button-held": string;
      "--clio-art-frame-s6-ring": string;
      "--clio-art-frame-p9-button": string;
      "--clio-art-frame-p9-button-held": string;
      "--clio-art-frame-p9-ring": string;
      "--clio-art-frame-p9-button-disabled": string;
      "--clio-art-frame-p9-popup": string;
      "--clio-art-frame-p9-popup-open": string;
      "--clio-art-frame-p9-popup-disabled": string;
      "--clio-art-s6-gray50": string;
      "--clio-art-s6-menucheck-on": string;
      "--clio-art-s6-strip-cap": string;
      "--clio-art-s6-strip-back": string;
      "--clio-art-s6-strip-forward": string;
      "--clio-art-s6-strip-menu": string;
      "--clio-art-s6-strip-handle": string;
      "--clio-art-s6-strip-tab": string;
      "--clio-art-rdoc-mask-tl": string;
      "--clio-art-rdoc-frame-tl": string;
      "--clio-art-rdoc-mask-tr": string;
      "--clio-art-rdoc-frame-tr": string;
      "--clio-art-rdoc-mask-bl": string;
      "--clio-art-rdoc-frame-bl": string;
      "--clio-art-rdoc-mask-br": string;
      "--clio-art-rdoc-frame-br": string;
      "--clio-art-p9-strip-cap": string;
      "--clio-art-s7-strip-cap": string;
      "--clio-art-p9-strip-back": string;
      "--clio-art-p9-strip-forward": string;
      "--clio-art-p9-strip-menu": string;
      "--clio-art-p9-strip-handle": string;
      "--clio-art-p9-strip-tab": string;
      "--clio-p9-bevel": string;
      "--clio-button-frame-disabled": string;
      "--clio-font-window-title": string;
      "--clio-font-button": string;
      "--clio-focus-ring-colour": string;
      "--clio-focus-ring": string;
      "--clio-list-focus-shadow": string;
      "--clio-scrollbar-button-bevel-on": string;
      "--clio-scrollbar-thumb-bg-horizontal": string;
      "--clio-scrollbar-thumb-color": string;
      "--clio-scrollbar-track-color": string;
      "--clio-details-shadow": string;
      "--clio-art-p9-group-dots": string;
      "--clio-icon-selected-filter": string;
      "--clio-art-p-dropdown": string;
      "--clio-art-p-dropdown-off": string;
      "--clio-art-p-check": string;
      "--clio-art-p-submenu": string;
      "--clio-art-p-submenu-on": string;
      "--clio-art-p-up": string;
      "--clio-art-p-up-off": string;
      "--clio-art-p-down": string;
      "--clio-art-p-down-off": string;
      "--clio-art-p-left": string;
      "--clio-art-p-left-off": string;
      "--clio-art-p-right": string;
      "--clio-art-p-right-off": string;
      "--clio-art-p-grip-v": string;
      "--clio-art-p-grip-h": string;
      "--clio-art-p-tab-selected": string;
      "--clio-art-p-tab": string;
      "--clio-art-p-tab-pressed": string;
      "--clio-art-p9-check": string;
      "--clio-art-p9-check-overhang": string;
      "--clio-art-p9-radio-on": string;
      "--clio-art-p9-radio": string;
      "--clio-art-p9-radio-pressed": string;
      "--clio-art-p9-checkbox-pressed": string;
      "--clio-art-p9-box-face": string;
      "--clio-art-p9-progress-pole": string;
      "--clio-art-p9-submenu": string;
      "--clio-art-p9-submenu-on": string;
      "--clio-art-p9-dropdown": string;
      "--clio-art-p9-dropdown-off": string;
      "--clio-art-p9-menucheck": string;
      "--clio-art-p9-popup-open-arrows": string;
    };
    nextstep: {
      "--clio-ink": string;
      "--clio-paper": string;
      "--clio-face": string;
      "--clio-disabled": string;
      "--clio-disabled-dither": string;
      "--clio-disabled-fill": string;
      "--clio-popup-disabled-mask": string;
      "--clio-popup-disabled-fg": string;
      "--clio-selection-bg": string;
      "--clio-selection-fg": string;
      "--clio-font-chrome": string;
      "--clio-font-text": string;
      "--clio-font-small": string;
      "--clio-text-smoothing": string;
      "--clio-text-smoothing-moz": string;
      "--clio-font-mono": string;
      "--clio-font-display": string;
      "--clio-font-size": string;
      "--clio-font-smoothing": string;
      "--clio-font-size-small": string;
      "--clio-chrome-weight": string;
      "--clio-font-stretch-text": string;
      "--clio-font-stretch-title": string;
      "--clio-line": string;
      "--clio-border": string;
      "--clio-radius": string;
      "--clio-control-height": string;
      "--clio-field-height": string;
      "--clio-caret-height": string;
      "--clio-caret-ticks": string;
      "--clio-row-height": string;
      "--clio-gap": string;
      "--clio-focus-outline": string;
      "--clio-focus-offset": string;
      "--clio-desktop": string;
      "--clio-window-bg": string;
      "--clio-pane-bg": string;
      "--clio-window-border": string;
      "--clio-window-shadow": string;
      "--clio-window-padding": string;
      "--clio-titlebar-height": string;
      "--clio-titlebar-margin": string;
      "--clio-titlebar-padding": string;
      "--clio-titlebar-border": string;
      "--clio-titlebar-row": string;
      "--clio-titlebar-stripe": string;
      "--clio-titlebar-bg": string;
      "--clio-titlebar-inactive-bg": string;
      "--clio-title-font-size": string;
      "--clio-title-bg": string;
      "--clio-title-fg": string;
      "--clio-title-inactive-fg": string;
      "--clio-title-padding": string;
      "--clio-titlebar-slot": string;
      "--clio-titlebar-shade-slot": string;
      "--clio-shade-display": string;
      "--clio-box-size": string;
      "--clio-box-inset": string;
      "--clio-box-isolation": string;
      "--clio-menubar-height": string;
      "--clio-menubar-bg": string;
      "--clio-menubar-border": string;
      "--clio-menubar-shadow": string;
      "--clio-menubar-padding": string;
      "--clio-menu-title-padding": string;
      "--clio-menu-title-inset": string;
      "--clio-menu-title-active-bg": string;
      "--clio-menu-title-active-fg": string;
      "--clio-menu-title-active-shadow": string;
      "--clio-menu-bg": string;
      "--clio-menu-border": string;
      "--clio-menu-border-top-width": string;
      "--clio-menu-shadow": string;
      "--clio-menu-item-height": string;
      "--clio-menu-item-padding": string;
      "--clio-menu-item-weight": string;
      "--clio-menu-item-active-bg": string;
      "--clio-menu-item-active-fg": string;
      "--clio-menu-item-active-shadow": string;
      "--clio-menu-separator": string;
      "--clio-menu-separator-height": string;
      "--clio-button-bg": string;
      "--clio-button-fg": string;
      "--clio-button-border": string;
      "--clio-button-radius": string;
      "--clio-button-frame": string;
      "--clio-button-frame-held": string;
      "--clio-button-frame-slice": string;
      "--clio-ring-frame": string;
      "--clio-ring-frame-slice": string;
      "--clio-popup-frame": string;
      "--clio-popup-frame-slice": string;
      "--clio-button-shadow": string;
      "--clio-button-padding": string;
      "--clio-button-min-width": string;
      "--clio-button-weight": string;
      "--clio-button-active-bg": string;
      "--clio-button-active-fg": string;
      "--clio-button-active-shadow": string;
      "--clio-button-default-gap": string;
      "--clio-button-default-width": string;
      "--clio-button-default-radius": string;
      "--clio-button-disabled-fg": string;
      "--clio-button-disabled-border": string;
      "--clio-check-size": string;
      "--clio-check-bg": string;
      "--clio-check-border": string;
      "--clio-check-shadow": string;
      "--clio-check-mark": string;
      "--clio-check-mark-origin": string;
      "--clio-check-pressed-border-width": string;
      "--clio-radio-size": string;
      "--clio-radio-off": string;
      "--clio-radio-on": string;
      "--clio-radio-pressed": string;
      "--clio-radio-pressed-on": string;
      "--clio-field-bg": string;
      "--clio-field-border": string;
      "--clio-field-shadow": string;
      "--clio-field-padding": string;
      "--clio-field-focus-shadow": string;
      "--clio-field-focus-outline": string;
      "--clio-popup-bg": string;
      "--clio-popup-border": string;
      "--clio-popup-radius": string;
      "--clio-popup-shadow": string;
      "--clio-popup-height": string;
      "--clio-popup-padding": string;
      "--clio-popup-arrow": string;
      "--clio-popup-weight": string;
      "--clio-scrollbar-size": string;
      "--clio-scrollbar-track": string;
      "--clio-scrollbar-thumb-length": string;
      "--clio-scrollbar-thumb-tracking": string;
      "--clio-scrollbar-thumb-overlap": string;
      "--clio-scrollbar-thumb-after": string;
      "--clio-scrollbar-repeat-delay": string;
      "--clio-menu-sticky": string;
      "--clio-drag-outline-width": string;
      "--clio-drag-outline-extra": string;
      "--clio-zoom-count": string;
      "--clio-zoom-steps": string;
      "--clio-zoom-ratio": string;
      "--clio-zoom-offset": string;
      "--clio-zoom-keep": string;
      "--clio-drag-outline-shadow-inset": string;
      "--clio-scrollbar-ghost": string;
      "--clio-scrollbar-ghost-blend": string;
      "--clio-scrollbar-thumb-inset": string;
      "--clio-scrollbar-track-shadow": string;
      "--clio-scrollbar-thumb-bg": string;
      "--clio-scrollbar-thumb-border": string;
      "--clio-scrollbar-thumb-shadow": string;
      "--clio-scrollbar-button-bg": string;
      "--clio-scrollbar-button-shadow": string;
      "--clio-scrollbar-button-bevel": string;
      "--clio-scrollbar-up": string;
      "--clio-scrollbar-up-on": string;
      "--clio-scrollbar-down": string;
      "--clio-scrollbar-down-on": string;
      "--clio-scrollbar-left": string;
      "--clio-scrollbar-left-on": string;
      "--clio-scrollbar-right": string;
      "--clio-scrollbar-right-on": string;
      "--clio-dialog-bg": string;
      "--clio-modal-border": string;
      "--clio-modal-frame": string;
      "--clio-modal-padding": string;
      "--clio-plain-dialog-border": string;
      "--clio-plain-dialog-shadow": string;
      "--clio-details-bg": string;
      "--clio-details-border": string;
      "--clio-details-font-size": string;
      "--clio-details-height": string;
      "--clio-details-padding": string;
      "--clio-scrollbar-corner": string;
      "--clio-list-bg": string;
      "--clio-list-border": string;
      "--clio-list-shadow": string;
      "--clio-list-row": string;
      "--clio-group-border": string;
      "--clio-group-shadow": string;
      "--clio-group-bg": string;
      "--clio-progress-height": string;
      "--clio-progress-bg": string;
      "--clio-progress-border": string;
      "--clio-progress-shadow": string;
      "--clio-progress-fill": string;
      "--clio-tab-height": string;
      "--clio-tab-bg": string;
      "--clio-tab-active-bg": string;
      "--clio-tab-panel-bg": string;
      "--clio-tab-panel-border": string;
      "--clio-label-bg": string;
      "--clio-label-fg": string;
      "--clio-label-selected-bg": string;
      "--clio-label-selected-fg": string;
      "--clio-strip-height": string;
      "--clio-strip-bg": string;
      "--clio-strip-line": string;
      "--clio-strip-cell-shadow": string;
      "--clio-strip-sunken-shadow": string;
      "--clio-strip-sunken-lines": string;
      "--clio-strip-pressed-bg": string;
      "--clio-strip-pressed-shadow": string;
      "--clio-strip-cap-width": string;
      "--clio-strip-scroll-width": string;
      "--clio-strip-module-width": string;
      "--clio-strip-icon-inset": string;
      "--clio-strip-menu-top": string;
      "--clio-strip-menu-inset": string;
      "--clio-strip-handle-width": string;
      "--clio-strip-tab-width": string;
      "--clio-strip-cap": string;
      "--clio-strip-back": string;
      "--clio-strip-forward": string;
      "--clio-strip-menu": string;
      "--clio-strip-handle": string;
      "--clio-strip-tab": string;
      "--clio-art-s6-check": string;
      "--clio-art-s6-radio": string;
      "--clio-art-s6-radio-focus": string;
      "--clio-art-s6-radio-dot": string;
      "--clio-art-s6-submenu": string;
      "--clio-art-s6-submenu-on": string;
      "--clio-art-s6-desktop": string;
      "--clio-art-s6-up": string;
      "--clio-art-s6-up-on": string;
      "--clio-art-s6-down": string;
      "--clio-art-s6-down-on": string;
      "--clio-art-s6-left": string;
      "--clio-art-s6-left-on": string;
      "--clio-art-s6-right": string;
      "--clio-art-s6-right-on": string;
      "--clio-art-s6-burst": string;
      "--clio-art-s6-ltgray": string;
      "--clio-art-s6-grow": string;
      "--clio-art-s6-dkgray": string;
      "--clio-art-s6-menucheck": string;
      "--clio-disclosure-size": string;
      "--clio-disclosure-gap": string;
      "--clio-art-disclosure": string;
      "--clio-art-disclosure-open": string;
      "--clio-list-view-bg": string;
      "--clio-list-view-row": string;
      "--clio-list-view-header-height": string;
      "--clio-list-view-header-padding": string;
      "--clio-list-view-header-bg": string;
      "--clio-list-view-sorted-header-bg": string;
      "--clio-list-view-sorted-decoration": string;
      "--clio-list-view-sorted-bg": string;
      "--clio-list-view-sort-width": string;
      "--clio-slider-height": string;
      "--clio-slider-track-height": string;
      "--clio-slider-track-top": string;
      "--clio-slider-track-slice": string;
      "--clio-slider-track-slice-n": string;
      "--clio-slider-thumb-width": string;
      "--clio-slider-thumb-height": string;
      "--clio-art-slider-track": string;
      "--clio-art-slider-thumb": string;
      "--clio-slider-tick-gap": string;
      "--clio-slider-tick-count": string;
      "--clio-slider-tick-offset": string;
      "--clio-slider-tick-run": string;
      "--clio-slider-tick-light": string;
      "--clio-slider-tick-ink": string;
      "--clio-slider-tick-shade": string;
      "--clio-little-arrows-width": string;
      "--clio-little-arrows-height": string;
      "--clio-art-little-arrows": string;
      "--clio-art-little-arrows-up": string;
      "--clio-art-little-arrows-down": string;
      "--clio-art-little-arrows-disabled": string;
      "--clio-bevel-min": string;
      "--clio-bevel-padding": string;
      "--clio-bevel-slice": string;
      "--clio-bevel-slice-n": string;
      "--clio-art-bevel": string;
      "--clio-art-bevel-held": string;
      "--clio-art-bevel-menu-arrow": string;
      "--clio-bevel-arrow-right": string;
      "--clio-bevel-arrow-bottom": string;
      "--clio-bevel-arrow-width": string;
      "--clio-bevel-arrow-height": string;
      "--clio-art-chasing-arrows": string;
      "--clio-chasing-arrows-frames": string;
      "--clio-separator-height": string;
      "--clio-separator-margin": string;
      "--clio-separator-bg": string;
      "--clio-art-help-button": string;
      "--clio-image-well-bg": string;
      "--clio-utility-titlebar-height": string;
      "--clio-utility-titlebar-row": string;
      "--clio-utility-box-size": string;
      "--clio-utility-slot": string;
      "--clio-utility-title-size": string;
      "--clio-art-balloon": string;
      "--clio-art-balloon-tail": string;
      "--clio-art-menu-scroll-down": string;
      "--clio-art-menu-scroll-up": string;
      "--clio-menu-scroll-left": string;
      "--clio-art-frame-s6-button": string;
      "--clio-art-frame-s6-button-held": string;
      "--clio-art-frame-s6-ring": string;
      "--clio-art-frame-p9-button": string;
      "--clio-art-frame-p9-button-held": string;
      "--clio-art-frame-p9-ring": string;
      "--clio-art-frame-p9-button-disabled": string;
      "--clio-art-frame-p9-popup": string;
      "--clio-art-frame-p9-popup-open": string;
      "--clio-art-frame-p9-popup-disabled": string;
      "--clio-art-s6-gray50": string;
      "--clio-art-s6-menucheck-on": string;
      "--clio-art-s6-strip-cap": string;
      "--clio-art-s6-strip-back": string;
      "--clio-art-s6-strip-forward": string;
      "--clio-art-s6-strip-menu": string;
      "--clio-art-s6-strip-handle": string;
      "--clio-art-s6-strip-tab": string;
      "--clio-art-rdoc-mask-tl": string;
      "--clio-art-rdoc-frame-tl": string;
      "--clio-art-rdoc-mask-tr": string;
      "--clio-art-rdoc-frame-tr": string;
      "--clio-art-rdoc-mask-bl": string;
      "--clio-art-rdoc-frame-bl": string;
      "--clio-art-rdoc-mask-br": string;
      "--clio-art-rdoc-frame-br": string;
      "--clio-art-p9-strip-cap": string;
      "--clio-art-s7-strip-cap": string;
      "--clio-art-p9-strip-back": string;
      "--clio-art-p9-strip-forward": string;
      "--clio-art-p9-strip-menu": string;
      "--clio-art-p9-strip-handle": string;
      "--clio-art-p9-strip-tab": string;
      "--clio-nx-dark": string;
      "--clio-nx-light": string;
      "--clio-font-window-title": string;
      "--clio-title-weight": string;
      "--clio-titlebar-light": string;
      "--clio-titlebar-main-bg": string;
      "--clio-titlebar-main-light": string;
      "--clio-titlebar-main-shade": string;
      "--clio-titlebar-inactive-light": string;
      "--clio-titlebar-shade": string;
      "--clio-tb-light": string;
      "--clio-resizebar-height": string;
      "--clio-menubar-width": string;
      "--clio-menu-title-height": string;
      "--clio-menu-cell": string;
      "--clio-menubar-orientation": string;
      "--clio-bevel": string;
      "--clio-bevel-in": string;
      "--clio-button-on-bg": string;
      "--clio-button-on-shadow": string;
      "--clio-scrollbar-arrow-length": string;
      "--clio-scrollbar-arrow-gap": string;
      "--clio-nx-lane": string;
      "--clio-scrollbar-side": string;
      "--clio-scrollbar-arrows": string;
      "--clio-scrollbar-thumb-color": string;
      "--clio-scrollbar-track-color": string;
      "--clio-icon-selected-filter": string;
      "--clio-browser-column": string;
      "--clio-browser-row": string;
      "--clio-dock-tile": string;
      "--clio-dock-tile-bg": string;
      "--clio-art-nx-miniaturize": string;
      "--clio-art-nx-close": string;
      "--clio-art-nx-close-held": string;
      "--clio-art-nx-close-edited": string;
      "--clio-art-nx-submenu": string;
      "--clio-art-nx-submenu-lit": string;
      "--clio-art-nx-popup-mark": string;
      "--clio-art-nx-dimple": string;
      "--clio-art-nx-arrow-up": string;
      "--clio-art-nx-lane": string;
      "--clio-art-nx-check": string;
      "--clio-art-nx-switch": string;
      "--clio-art-nx-return": string;
      "--clio-art-nx-dock-dots": string;
      "--clio-art-nx-slider-knob": string;
      "--clio-art-nx-radio": string;
      "--clio-art-nx-radio-on": string;
      "--clio-art-nx-arrow-up-held": string;
      "--clio-art-nx-arrow-right": string;
      "--clio-art-nx-arrow-right-held": string;
      "--clio-art-nx-arrow-down": string;
      "--clio-art-nx-arrow-down-held": string;
      "--clio-art-nx-arrow-left": string;
      "--clio-art-nx-arrow-left-held": string;
      "--clio-art-nx-miniaturize-held": string;
    };
  }
};
export default contract;
