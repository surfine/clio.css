/* Appearance > Sound, as a reusable panel. Draws a sound track menu and the
   four sound class boxes. Keeps the choice in localStorage; clio.js plays. */
(function () {
    "use strict";
    var KEY = "clio-sounds-panel";
    var CLASSES = ["menus", "windows", "controls", "finder"];
    var LABELS = { menus: "Menus", windows: "Windows", controls: "Controls", finder: "Finder" };
    var ERAS = ["drawingboard", "platinum"];
    var count = 0;
    function sounds() {
        return window.clio && window.clio.sounds ? window.clio.sounds : null;
    }
    function readSaved() {
        try {
            var raw = window.localStorage.getItem(KEY);
            var v = raw ? JSON.parse(raw) : null;
            if (!v || typeof v !== "object")
                return null;
            var track = typeof v.track === "string" && v.track ? v.track : "none";
            var list = Array.isArray(v.classes) ? v.classes : CLASSES;
            var classes = CLASSES.filter(function (name) { return list.indexOf(name) >= 0; });
            return { track: track, classes: classes };
        }
        catch (err) {
            return null;
        }
    }
    function save(state) {
        try {
            window.localStorage.setItem(KEY, JSON.stringify({ track: state.track, classes: state.classes }));
        }
        catch (err) { }
    }
    function paint(classes) {
        var on = CLASSES.filter(function (name) { return classes.indexOf(name) >= 0; });
        document.documentElement.setAttribute("data-clio-sounds", on.length ? on.join(" ") : "none");
    }
    window.clioSoundsPanel = function (container, opts) {
        if (!container)
            throw new Error("clioSoundsPanel needs a container");
        opts = opts || {};
        var base = typeof opts.base === "string" && opts.base ? opts.base : "packs/";
        if (base.charAt(base.length - 1) !== "/")
            base += "/";
        var eras = opts.eras == null ? ERAS.slice() : [].concat(opts.eras);
        var saved = readSaved();
        var state = saved
            ? { track: saved.track, classes: saved.classes }
            : { track: "none", classes: CLASSES.slice() };
        var used = new Set();
        var boxes = {};
        var handlers = {};
        var destroyed = false;
        var loadToken = 0;
        var index = null;
        var id = ++count;
        var root = document.createElement("div");
        var trailer = document.createElement("label");
        trailer.setAttribute("for", "clio-sounds-track-" + id);
        trailer.textContent = "Sound track:";
        var select = document.createElement("select");
        select.id = "clio-sounds-track-" + id;
        var none = document.createElement("option");
        none.value = "none";
        none.textContent = "None";
        select.appendChild(none);
        var row = document.createElement("p");
        row.appendChild(trailer);
        row.appendChild(document.createTextNode(" "));
        row.appendChild(select);
        root.appendChild(row);
        // As Mac OS 9's Appearance > Sound: a heading, then one box per line.
        var group = document.createElement("fieldset");
        var legend = document.createElement("legend");
        legend.textContent = "Play sound effects for:";
        group.appendChild(legend);
        CLASSES.forEach(function (name) {
            var line = document.createElement("div");
            var label = document.createElement("label");
            var box = document.createElement("input");
            box.type = "checkbox";
            box.value = name;
            label.appendChild(box);
            label.appendChild(document.createTextNode(" " + LABELS[name]));
            line.appendChild(label);
            group.appendChild(line);
            boxes[name] = box;
            box.checked = state.classes.indexOf(name) >= 0;
        });
        root.appendChild(group);
        container.appendChild(root);
        paint(state.classes);
        var api = sounds();
        if (api)
            api.muted = true;
        async function load(url, eraOpt) {
            if (!url || used.has(url))
                return;
            if (!sounds())
                return;
            used.add(url);
            try {
                if (eraOpt)
                    await window.clio.sounds.use(url, { era: eraOpt });
                else
                    await window.clio.sounds.use(url);
            }
            catch (err) {
                used.delete(url);
            }
        }
        async function applyTrack() {
            var mine = ++loadToken;
            if (state.track === "none" || !index) {
                if (sounds() && state.track === "none")
                    window.clio.sounds.muted = true;
                return;
            }
            var sets = Array.isArray(index.sets) ? index.sets : [];
            var set = null;
            for (var i = 0; i < sets.length; i++) {
                if (sets[i] && String(sets[i].slug) === state.track) {
                    set = sets[i];
                    break;
                }
            }
            if (!set)
                return;
            if (sounds())
                window.clio.sounds.muted = false;
            await load(base + set.manifest, eras);
            if (mine !== loadToken || destroyed)
                return;
            var alerts = index.alerts && typeof index.alerts === "object" ? index.alerts : {};
            var keys = Object.keys(alerts);
            for (var k = 0; k < keys.length; k++) {
                if (mine !== loadToken || destroyed)
                    return;
                var entry = alerts[keys[k]];
                if (entry && entry.manifest)
                    await load(base + entry.manifest);
            }
        }
        async function start() {
            try {
                var res = await fetch(base + "index.json");
                index = await res.json();
            }
            catch (err) {
                index = null;
            }
            if (destroyed || !index)
                return;
            var sets = Array.isArray(index.sets) ? index.sets : [];
            sets.forEach(function (set) {
                if (!set || !set.slug)
                    return;
                var option = document.createElement("option");
                option.value = String(set.slug);
                option.textContent = set.name == null ? String(set.slug) : String(set.name);
                select.appendChild(option);
            });
            var known = false;
            for (var i = 0; i < sets.length; i++) {
                if (sets[i] && String(sets[i].slug) === state.track) {
                    known = true;
                    break;
                }
            }
            if (state.track !== "none" && !known) {
                state.track = "none";
                save(state);
                var sound = sounds();
                if (sound)
                    sound.muted = true;
            }
            select.value = state.track;
            if (state.track !== "none")
                await applyTrack();
        }
        function onTrack() {
            state.track = select.value || "none";
            save(state);
            if (state.track === "none") {
                loadToken++;
                var sound = sounds();
                if (sound)
                    sound.muted = true;
                return;
            }
            applyTrack();
        }
        function onClass() {
            state.classes = CLASSES.filter(function (name) { return boxes[name].checked; });
            paint(state.classes);
            save(state);
        }
        select.addEventListener("change", onTrack);
        CLASSES.forEach(function (name) {
            handlers[name] = function () { onClass(); };
            boxes[name].addEventListener("change", handlers[name]);
        });
        start();
        return {
            destroy() {
                destroyed = true;
                loadToken++;
                select.removeEventListener("change", onTrack);
                CLASSES.forEach(function (name) {
                    boxes[name].removeEventListener("change", handlers[name]);
                });
                if (root.parentNode)
                    root.parentNode.removeChild(root);
            },
        };
    };
})();
