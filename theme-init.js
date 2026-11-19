(function() {
    try {
        let hexToRgbaEarly2 = function(hex, alpha) {
            if (!hex || typeof hex !== "string") return "rgba(56, 189, 248, " + alpha + ")";
            const clean = hex.replace("#", "");
            if (clean.length === 3) {
                const r = parseInt(clean[0] + clean[0], 16);
                const g = parseInt(clean[1] + clean[1], 16);
                const b = parseInt(clean[2] + clean[2], 16);
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
            } else if (clean.length === 6) {
                const r = parseInt(clean.substring(0, 2), 16);
                const g = parseInt(clean.substring(2, 4), 16);
                const b = parseInt(clean.substring(4, 6), 16);
                return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
            }
            return "rgba(56, 189, 248, " + alpha + ")";
        }, setAccentCssVarsEarly2 = function(activeCol, stateCol) {
            if (!activeCol) return;
            document.documentElement.style.setProperty("--accent-cyan", activeCol);
            document.documentElement.style.setProperty("--border-focus", hexToRgbaEarly2(activeCol, .4));
            document.documentElement.style.setProperty("--theme-active-glow", hexToRgbaEarly2(activeCol, .35));
            document.documentElement.style.setProperty("--theme-active-color", activeCol);
            if (stateCol) {
                document.documentElement.style.setProperty("--theme-state-color", stateCol);
            }
            THEME_ALPHAS.forEach(a => {
                const key = "--theme-accent-" + Math.round(a * 100).toString().padStart(2, "0");
                document.documentElement.style.setProperty(key, hexToRgbaEarly2(activeCol, a));
            });
        };
        var hexToRgbaEarly = hexToRgbaEarly2, setAccentCssVarsEarly = setAccentCssVarsEarly2;
        const THEME_ALPHAS = [ .06, .08, .1, .12, .14, .15, .16, .18, .2, .22, .24, .25, .28, .3, .32, .35, .4, .45, .5, .6 ];
        const saved = localStorage.getItem("gvc_ui_theme");
        const prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        let initial = "dark";
        if (saved === "light" || saved === "dark") {
            initial = saved;
        } else {
            initial = prefersLight ? "light" : "dark";
        }
        document.documentElement.setAttribute("data-theme", initial);
        const savedActiveColor = localStorage.getItem("gvc_active_color");
        const savedStateColor = localStorage.getItem("gvc_state_color") || "#a855f7";
        if (savedActiveColor) {
            setAccentCssVarsEarly2(savedActiveColor, savedStateColor);
        }
        if (localStorage.getItem("gvc_dismissed_popup_reload_tip") === "true") {
            document.documentElement.classList.add("hide-popup-reload-tip");
        }
        if (localStorage.getItem("gvc_dismissed_settings_reload_tip") === "true") {
            document.documentElement.classList.add("hide-settings-reload-tip");
        }
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get([ "config", "dismissedPopupReloadTip", "dismissedSettingsReloadTip" ], data => {
                const cfg = data && data.config || {};
                const t = cfg.uiTheme || "auto";
                const resolved = t === "auto" ? prefersLight ? "light" : "dark" : t;
                document.documentElement.setAttribute("data-theme", resolved);
                try {
                    localStorage.setItem("gvc_ui_theme", resolved);
                } catch (e) {}
                const THEME_PRESETS_EARLY = {
                    cyberNeon: "#38bdf8",
                    deepAmethyst: "#c084fc",
                    emeraldWave: "#34d399",
                    goldenSunset: "#facc15",
                    sunsetBlaze: "#facc15",
                    monochrome: "#a7a7a9"
                };
                const THEME_STATE_PRESETS_EARLY = {
                    cyberNeon: "#a855f7",
                    deepAmethyst: "#ec4899",
                    emeraldWave: "#facc15",
                    goldenSunset: "#f43f5e",
                    sunsetBlaze: "#f43f5e",
                    monochrome: "#ffffff"
                };
                const thKey = cfg.theme || "cyberNeon";
                let col = THEME_PRESETS_EARLY[thKey] || cfg.activeColor || "#38bdf8";
                let sCol = THEME_STATE_PRESETS_EARLY[thKey] || cfg.activeStateColor || "#a855f7";
                if (resolved === "light" && thKey === "monochrome") col = "#52525b";
                setAccentCssVarsEarly2(col, sCol);
                try {
                    localStorage.setItem("gvc_active_color", col);
                    localStorage.setItem("gvc_state_color", sCol);
                } catch (e) {}
                if (cfg.dismissedPopupReloadTip || data && data.dismissedPopupReloadTip) {
                    document.documentElement.classList.add("hide-popup-reload-tip");
                    try {
                        localStorage.setItem("gvc_dismissed_popup_reload_tip", "true");
                    } catch (e) {}
                }
                if (cfg.dismissedSettingsReloadTip || data && data.dismissedSettingsReloadTip) {
                    document.documentElement.classList.add("hide-settings-reload-tip");
                    try {
                        localStorage.setItem("gvc_dismissed_settings_reload_tip", "true");
                    } catch (e) {}
                }
            });
        }
    } catch (e) {}
})();