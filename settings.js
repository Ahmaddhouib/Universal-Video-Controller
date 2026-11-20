document.addEventListener("DOMContentLoaded", async () => {
    const THEME_PRESETS = {
        cyberNeon: {
            buttonBgColor: "#181926",
            activeColor: "#38bdf8",
            buttonsColor: "#cbd5e1",
            activeStateColor: "#a855f7"
        },
        deepAmethyst: {
            buttonBgColor: "#1e162d",
            activeColor: "#c084fc",
            buttonsColor: "#e9d5ff",
            activeStateColor: "#ec4899"
        },
        emeraldWave: {
            buttonBgColor: "#0f1f1a",
            activeColor: "#34d399",
            buttonsColor: "#a7f3d0",
            activeStateColor: "#facc15"
        },
        goldenSunset: {
            buttonBgColor: "#201412",
            activeColor: "#facc15",
            buttonsColor: "#fed7aa",
            activeStateColor: "#f43f5e"
        },
        sunsetBlaze: {
            buttonBgColor: "#201412",
            activeColor: "#facc15",
            buttonsColor: "#fed7aa",
            activeStateColor: "#f43f5e"
        },
        monochrome: {
            buttonBgColor: "#18181b",
            activeColor: "#a7a7a9",
            buttonsColor: "#71717a",
            activeStateColor: "#ffffff"
        }
    };
    const THEME_ALPHAS = [ .06, .08, .1, .12, .14, .15, .16, .18, .2, .22, .24, .25, .28, .3, .32, .35, .4, .45, .5, .6 ];
    function hexToRgba(hex, alpha) {
        if (!hex || typeof hex !== "string") return `rgba(56, 189, 248, ${alpha})`;
        const clean = hex.replace("#", "");
        if (clean.length === 3) {
            const r = parseInt(clean[0] + clean[0], 16);
            const g = parseInt(clean[1] + clean[1], 16);
            const b = parseInt(clean[2] + clean[2], 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } else if (clean.length === 6) {
            const r = parseInt(clean.substring(0, 2), 16);
            const g = parseInt(clean.substring(2, 4), 16);
            const b = parseInt(clean.substring(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return `rgba(56, 189, 248, ${alpha})`;
    }
    function applyActiveTheme(themeKey) {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        let activeCol = "#38bdf8";
        let stateCol = "#a855f7";
        if (themeKey === "custom") {
            const colInput = document.getElementById("activeColor");
            const stInput = document.getElementById("activeStateColor");
            activeCol = colInput && colInput.value || typeof currentConfig !== "undefined" && currentConfig && currentConfig.activeColor || "#38bdf8";
            stateCol = stInput && stInput.value || typeof currentConfig !== "undefined" && currentConfig && currentConfig.activeStateColor || "#a855f7";
        } else if (THEME_PRESETS[themeKey]) {
            const p = THEME_PRESETS[themeKey];
            activeCol = p.activeColor;
            stateCol = p.activeStateColor;
        }
        if (isLight && themeKey === "monochrome") {
            activeCol = "#52525b";
        }
        document.documentElement.style.setProperty("--accent-cyan", activeCol);
        document.documentElement.style.setProperty("--border-focus", hexToRgba(activeCol, .4));
        document.documentElement.style.setProperty("--theme-active-glow", hexToRgba(activeCol, .35));
        document.documentElement.style.setProperty("--theme-active-color", activeCol);
        document.documentElement.style.setProperty("--theme-state-color", stateCol);
        THEME_ALPHAS.forEach(a => {
            const key = `--theme-accent-${Math.round(a * 100).toString().padStart(2, "0")}`;
            document.documentElement.style.setProperty(key, hexToRgba(activeCol, a));
        });
        try {
            localStorage.setItem("gvc_active_color", activeCol);
            localStorage.setItem("gvc_theme_name", themeKey);
            if (stateCol) localStorage.setItem("gvc_state_color", stateCol);
        } catch (e) {}
    }
    const ACTIONS = [ {
        id: "togglePlay",
        title: "Play / Pause",
        desc: "Toggle video playback or hold Space for speed boost"
    }, {
        id: "speedUp",
        title: "Speed Up",
        desc: "Increase playback speed by jump step"
    }, {
        id: "speedDown",
        title: "Speed Down",
        desc: "Decrease playback speed by jump step"
    }, {
        id: "resetSpeed",
        title: "Reset Speed",
        desc: "Return playback speed to 1.00x"
    }, {
        id: "volumeUp",
        title: "Volume Up",
        desc: "Increase volume by jump step"
    }, {
        id: "volumeDown",
        title: "Volume Down",
        desc: "Decrease volume by jump step"
    }, {
        id: "toggleMute",
        title: "Toggle Mute",
        desc: "Mute or unmute video"
    }, {
        id: "toggleSuperSpeed",
        title: "Toggle Super Speed",
        desc: "Jump to super speed"
    }, {
        id: "toggleFavoriteSpeed",
        title: "Toggle Favorite Speed",
        desc: "Jump to favorite speed"
    }, {
        id: "toggleRepeat",
        title: "Toggle Loop",
        desc: "Repeat current video continuously"
    }, {
        id: "shortSkipForward",
        title: "Short Skip Forward",
        desc: "Jump forward by short skip duration"
    }, {
        id: "shortSkipBackward",
        title: "Short Skip Backward",
        desc: "Rewind by short skip duration"
    }, {
        id: "longSkipForward",
        title: "Long Skip Forward",
        desc: "Jump forward by long skip duration"
    }, {
        id: "longSkipBackward",
        title: "Long Skip Backward",
        desc: "Rewind by long skip duration"
    }, {
        id: "nextVideo",
        title: "Next Video",
        desc: "Jump to next video or playlist track"
    }, {
        id: "prevVideo",
        title: "Previous Video",
        desc: "Jump to previous video or playlist track"
    }, {
        id: "frameBackward",
        title: "Frame Backward",
        desc: "Step backward one single video frame"
    }, {
        id: "frameForward",
        title: "Frame Forward",
        desc: "Step forward one single video frame"
    }, {
        id: "popoutVideo",
        title: "Pop Out",
        desc: "Float video in native OS pop out window"
    }, {
        id: "forceFullscreen",
        title: "Force Fullscreen",
        desc: "Fullscreen any video"
    }, {
        id: "toggleVisibility",
        title: "Show / Hide Video Controls",
        desc: "Show or hide floating Video Controls on page"
    }, {
        id: "toggleVideoControls",
        title: "Show / Hide Video Progress Bar",
        desc: "Hide or show modern floating video progress bar"
    }, {
        id: "toggleDeactivate",
        title: "Deactivate Extension",
        desc: "Disable or enable extension on current website"
    } ];
    const ACTION_TO_CONTROL_MAP = {
        toggleVisibility: {
            control: "hide",
            label: "Hide"
        },
        toggleRepeat: {
            control: "loop",
            label: "Loop"
        },
        popoutVideo: {
            control: "pip",
            label: "Pop Out"
        },
        speedUp: {
            control: "speed",
            label: "Speed"
        },
        speedDown: {
            control: "speed",
            label: "Speed"
        },
        resetSpeed: {
            control: "speed",
            label: "Speed"
        },
        toggleFavoriteSpeed: {
            control: "speed",
            label: "Speed"
        },
        toggleSuperSpeed: {
            control: "speed",
            label: "Speed"
        },
        volumeUp: {
            control: "volume",
            label: "Volume"
        },
        volumeDown: {
            control: "volume",
            label: "Volume"
        },
        toggleMute: {
            control: "volume",
            label: "Volume"
        },
        toggleVideoControls: {
            control: "progressBar",
            label: "Progress Bar"
        }
    };
    const LAYOUT_PRESETS = {
        qwerty: {
            togglePlay: [ "Space", "Enter", "NumpadEnter" ],
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "KeyM",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: [ "KeyC", "ArrowRight" ],
            shortSkipBackward: [ "KeyX", "ArrowLeft" ],
            longSkipForward: "KeyV",
            longSkipBackward: "KeyZ",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT",
            toggleVideoControls: "KeyO"
        },
        azerty: {
            togglePlay: [ "Space", "Enter", "NumpadEnter" ],
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "Semicolon",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: [ "KeyC", "ArrowRight" ],
            shortSkipBackward: [ "KeyX", "ArrowLeft" ],
            longSkipForward: "KeyV",
            longSkipBackward: "KeyZ",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT",
            toggleVideoControls: "KeyO"
        },
        qwertz: {
            togglePlay: [ "Space", "Enter", "NumpadEnter" ],
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "KeyM",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: [ "KeyC", "ArrowRight" ],
            shortSkipBackward: [ "KeyX", "ArrowLeft" ],
            longSkipForward: "KeyV",
            longSkipBackward: "KeyY",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT",
            toggleVideoControls: "KeyO"
        }
    };
    const RESERVED_CODES = [ "Escape", "Tab", "ControlLeft", "ControlRight", "AltLeft", "AltRight", "MetaLeft", "MetaRight", "ShiftLeft", "ShiftRight", "CapsLock", "MediaTrackPrevious", "MediaTrackNext", "MediaPlayPause", "MediaStop" ];
    const CONTROLS_META = {
        loop: {
            id: "loop",
            name: "Loop",
            desc: "Loop video or specific time intervals",
            icon: '<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>'
        },
        speed: {
            id: "speed",
            name: "Speed",
            desc: "Playback rate slider, fast presets, and turbo",
            icon: '<svg viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.28-10.43zM10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>'
        },
        volume: {
            id: "volume",
            name: "Volume",
            desc: "Audio level slider, boost, and mute toggle",
            icon: '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>'
        },
        pip: {
            id: "pip",
            name: "Pop Out",
            desc: "Instant Pop Out mode for the active video",
            icon: '<svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>'
        },
        settings: {
            id: "settings",
            name: "Settings",
            desc: "Quick access to options and appearance settings",
            icon: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>'
        },
        hide: {
            id: "hide",
            name: "Hide",
            desc: "Hide controller button and Video Controls temporarily or indefinitely",
            icon: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>'
        },
        progressBar: {
            id: "progressBar",
            name: "Progress Bar",
            desc: "Floating video progress bar and timeline scrubber",
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="11" width="20" height="2" rx="1"/><circle cx="9" cy="12" r="3.5"/></svg>'
        }
    };
    const ALL_CONTROLS_KEYS = [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
    const themeCards = document.querySelectorAll(".theme-card");
    const customColorsWrap = document.getElementById("customColorsWrap");
    const buttonBgColorInput = document.getElementById("buttonBgColor");
    const activeColorInput = document.getElementById("activeColor");
    const buttonsColorInput = document.getElementById("buttonsColor");
    const activeStateColorInput = document.getElementById("activeStateColor");
    const speedJumpSelect = document.getElementById("speedJump");
    const volumeJumpSelect = document.getElementById("volumeJump");
    const favoriteSpeedInput = document.getElementById("favoriteSpeed");
    const holdFavoriteSpeedSwitch = document.getElementById("holdFavoriteSpeedEnabled");
    const superSpeedInput = document.getElementById("superSpeed");
    const holdSuperSpeedSwitch = document.getElementById("holdSuperSpeedEnabled");
    const holdSpaceSpeedSwitch = document.getElementById("holdSpaceSpeedEnabled");
    const holdSpaceSpeedRow = document.getElementById("holdSpaceSpeedRow");
    const holdSpaceSpeedInput = document.getElementById("holdSpaceSpeed");
    const persistentSpeedBoostHUDSwitch = document.getElementById("persistentSpeedBoostHUD");
    const persistentSpeedBoostHUDRow = document.getElementById("persistentSpeedBoostHUDRow");
    const shortSkipInput = document.getElementById("shortSkipDuration");
    const longSkipInput = document.getElementById("longSkipDuration");
    const autoMinimizeSwitch = document.getElementById("autoMinimize");
    const autoMinimizeRow = document.getElementById("autoMinimizeRow");
    const autoMinimizeTimeoutInput = document.getElementById("autoMinimizeTimeout");
    const autoHideButtonsSwitch = document.getElementById("autoHideButtons");
    const autoHideButtonsRow = document.getElementById("autoHideButtonsRow");
    const autoHideButtonsTimeoutInput = document.getElementById("autoHideButtonsTimeout");
    const hideCursorOnInactivitySwitch = document.getElementById("hideCursorOnInactivity");
    const hideCursorTimeoutRow = document.getElementById("hideCursorTimeoutRow");
    const hideCursorTimeoutInput = document.getElementById("hideCursorTimeout");
    const showHotkeyHUDSwitch = document.getElementById("showHotkeyHUD");
    const defaultHiddenSwitch = document.getElementById("defaultHidden");
    const defaultSpeedInput = document.getElementById("defaultSpeed");
    const defaultVolumeInput = document.getElementById("defaultVolume");
    const videoControlsListEl = document.getElementById("videoControlsList");
    const controllerPositionSelect = document.getElementById("controllerPosition");
    const controlsTriggerSelect = document.getElementById("controlsTrigger");
    const controlsFadeInDelayRow = document.getElementById("controlsFadeInDelayRow");
    const controlsFadeInDelayInput = document.getElementById("controlsFadeInDelay");
    const hideControlsDurationRow = document.getElementById("hideControlsDurationRow");
    const hideControlsDurationInput = document.getElementById("hideControlsDuration");
    function updateHideControlsDurationState() {
        if (!hideControlsDurationInput) return;
        const isStartHidden = defaultHiddenSwitch ? defaultHiddenSwitch.checked : false;
        hideControlsDurationInput.disabled = isStartHidden;
        if (hideControlsDurationRow) {
            hideControlsDurationRow.classList.toggle("is-disabled", isStartHidden);
        }
    }
    function updateControlsFadeInDelayState() {
        if (!controlsFadeInDelayRow) return;
        const isClick = controlsTriggerSelect ? controlsTriggerSelect.value === "click" : false;
        controlsFadeInDelayRow.style.display = "";
        controlsFadeInDelayRow.classList.toggle("is-disabled", isClick);
        if (controlsFadeInDelayInput) {
            controlsFadeInDelayInput.disabled = isClick;
        }
    }
    function updateAutoMinimizeState() {
        const isEnabled = autoMinimizeSwitch ? autoMinimizeSwitch.checked : true;
        if (autoMinimizeRow) {
            autoMinimizeRow.style.display = "";
            autoMinimizeRow.classList.toggle("is-disabled", !isEnabled);
        }
        if (autoMinimizeTimeoutInput) {
            autoMinimizeTimeoutInput.disabled = !isEnabled;
        }
    }
    function updateAutoHideButtonsState() {
        const isEnabled = autoHideButtonsSwitch ? autoHideButtonsSwitch.checked : true;
        if (autoHideButtonsRow) {
            autoHideButtonsRow.style.display = "";
            autoHideButtonsRow.classList.toggle("is-disabled", !isEnabled);
        }
        if (autoHideButtonsTimeoutInput) {
            autoHideButtonsTimeoutInput.disabled = !isEnabled;
        }
    }
    function updateHideCursorOnInactivityState() {
        const isEnabled = hideCursorOnInactivitySwitch ? hideCursorOnInactivitySwitch.checked : true;
        if (hideCursorTimeoutRow) {
            hideCursorTimeoutRow.style.display = "";
            hideCursorTimeoutRow.classList.toggle("is-disabled", !isEnabled);
        }
        if (hideCursorTimeoutInput) {
            hideCursorTimeoutInput.disabled = !isEnabled;
        }
    }
    function updatePersistentSpeedBoostHUDState() {
        const isHUDActive = showHotkeyHUDSwitch ? showHotkeyHUDSwitch.checked : true;
        const isSpaceBoostOn = holdSpaceSpeedSwitch ? holdSpaceSpeedSwitch.checked : true;
        const isFavoriteBoostOn = holdFavoriteSpeedSwitch ? holdFavoriteSpeedSwitch.checked : true;
        const isSuperBoostOn = holdSuperSpeedSwitch ? holdSuperSpeedSwitch.checked : true;
        const anyHoldBoostActive = isSpaceBoostOn || isFavoriteBoostOn || isSuperBoostOn;
        const isEnabled = isHUDActive && anyHoldBoostActive;
        if (persistentSpeedBoostHUDRow) {
            persistentSpeedBoostHUDRow.classList.toggle("is-disabled", !isEnabled);
        }
        if (persistentSpeedBoostHUDSwitch) {
            persistentSpeedBoostHUDSwitch.disabled = !isEnabled;
        }
    }
    function updateHoldSpaceSpeedState() {
        const isEnabled = holdSpaceSpeedSwitch ? holdSpaceSpeedSwitch.checked : true;
        if (holdSpaceSpeedRow) {
            holdSpaceSpeedRow.style.display = "";
            holdSpaceSpeedRow.classList.toggle("is-disabled", !isEnabled);
        }
        if (holdSpaceSpeedInput) {
            holdSpaceSpeedInput.disabled = !isEnabled;
        }
    }
    const volumeBoostSwitch = document.getElementById("volumeBoostEnabled");
    const defaultVideoStateSelect = document.getElementById("defaultVideoState");
    const defaultMutedCheckbox = document.getElementById("defaultMuted");
    function updateDefaultMuteLabel(isMuted) {
        const textEl = document.getElementById("defaultMuteText");
        if (textEl) textEl.textContent = isMuted ? "Muted" : "Mute";
    }
    const defaultLoopStateSelect = document.getElementById("defaultLoopState");
    const segmentControl1To9Select = document.getElementById("segmentControl1To9");
    const backgroundPlaySwitch = document.getElementById("backgroundPlay");
    const scrollWheelActionSelect = document.getElementById("scrollWheelAction");
    const holdClickActionSelect = document.getElementById("holdClickAction");
    const deactivateHotkeyModeSelect = document.getElementById("deactivateHotkeyMode");
    const autoReactivateRow = document.getElementById("autoReactivateRow");
    const autoReactivateDelayInput = document.getElementById("autoReactivateDelay");
    const holdToReactivateRow = document.getElementById("holdToReactivateRow");
    const holdToReactivateDelayInput = document.getElementById("holdToReactivateDelay");
    const uiThemeSelect = document.getElementById("uiTheme");
    const headerThemeToggleBtn = document.getElementById("headerThemeToggleBtn");
    const opacityInput = document.getElementById("opacity");
    const opacityVal = document.getElementById("opacityVal");
    const overlaySizeInput = document.getElementById("overlaySize");
    const glowEnabledSwitch = document.getElementById("glowEnabled");
    const overlaySizeVal = document.getElementById("overlaySizeVal");
    const domainListEl = document.getElementById("domainList");
    const newDomainInput = document.getElementById("newDomainInput");
    const addDomainBtn = document.getElementById("addDomainBtn");
    const controlsDomainListEl = document.getElementById("controlsDomainList");
    const newControlsDomainInput = document.getElementById("newControlsDomainInput");
    const addControlsDomainBtn = document.getElementById("addControlsDomainBtn");
    const siteSpeedListEl = document.getElementById("siteSpeedList");
    const newSiteSpeedDomain = document.getElementById("newSiteSpeedDomain");
    const newSiteSpeedValue = document.getElementById("newSiteSpeedValue");
    const addSiteSpeedBtn = document.getElementById("addSiteSpeedBtn");
    const siteVolumeListEl = document.getElementById("siteVolumeList");
    const newSiteVolumeDomain = document.getElementById("newSiteVolumeDomain");
    const newSiteVolumeValue = document.getElementById("newSiteVolumeValue");
    const addSiteVolumeBtn = document.getElementById("addSiteVolumeBtn");
    const newSiteVolumeMuted = document.getElementById("newSiteVolumeMuted");
    const newSiteVolumeMuteText = document.getElementById("newSiteVolumeMuteText");
    const siteLoopListEl = document.getElementById("siteLoopList");
    const newSiteLoopDomain = document.getElementById("newSiteLoopDomain");
    const newSiteLoopMode = document.getElementById("newSiteLoopMode");
    const addSiteLoopBtn = document.getElementById("addSiteLoopBtn");
    const sitePlayListEl = document.getElementById("sitePlayList");
    const newSitePlayDomain = document.getElementById("newSitePlayDomain");
    const newSitePlayMode = document.getElementById("newSitePlayMode");
    const addSitePlayBtn = document.getElementById("addSitePlayBtn");
    const autoScrollShortsSwitch = document.getElementById("autoScrollShorts");
    const autoScrollPresetsListEl = document.getElementById("autoScrollPresetsList");
    const newAutoScrollPattern = document.getElementById("newAutoScrollPattern");
    const addAutoScrollBtn = document.getElementById("addAutoScrollBtn");
    const autoScrollCustomListEl = document.getElementById("autoScrollCustomList");
    function syncReactivateInputsState(changedSource = null) {
        if (!deactivateHotkeyModeSelect || !autoReactivateRow || !holdToReactivateRow) return;
        const isToggle = deactivateHotkeyModeSelect.value === "toggle";
        let autoVal = autoReactivateDelayInput ? parseFloat(autoReactivateDelayInput.value) || 0 : 0;
        let holdVal = holdToReactivateDelayInput ? parseFloat(holdToReactivateDelayInput.value) || 0 : 0;
        if (changedSource === "auto" && autoVal > 0) {
            if (holdToReactivateDelayInput) {
                holdToReactivateDelayInput.value = 0;
                holdVal = 0;
            }
        } else if (changedSource === "hold" && holdVal > 0) {
            if (autoReactivateDelayInput) {
                autoReactivateDelayInput.value = 0;
                autoVal = 0;
            }
        }
        if (!isToggle) {
            autoReactivateRow.classList.add("is-disabled");
            if (autoReactivateDelayInput) autoReactivateDelayInput.disabled = true;
            holdToReactivateRow.classList.add("is-disabled");
            if (holdToReactivateDelayInput) holdToReactivateDelayInput.disabled = true;
            return;
        }
        if (autoVal > 0) {
            autoReactivateRow.classList.remove("is-disabled");
            if (autoReactivateDelayInput) autoReactivateDelayInput.disabled = false;
            holdToReactivateRow.classList.add("is-disabled");
            if (holdToReactivateDelayInput) holdToReactivateDelayInput.disabled = true;
        } else if (holdVal > 0) {
            holdToReactivateRow.classList.remove("is-disabled");
            if (holdToReactivateDelayInput) holdToReactivateDelayInput.disabled = false;
            autoReactivateRow.classList.add("is-disabled");
            if (autoReactivateDelayInput) autoReactivateDelayInput.disabled = true;
        } else {
            autoReactivateRow.classList.remove("is-disabled");
            holdToReactivateRow.classList.remove("is-disabled");
            if (autoReactivateDelayInput) autoReactivateDelayInput.disabled = false;
            if (holdToReactivateDelayInput) holdToReactivateDelayInput.disabled = false;
        }
    }
    const settingsReloadTip = document.getElementById("settingsReloadTip");
    const dismissSettingsReloadTipBtn = document.getElementById("dismissSettingsReloadTipBtn");
    if (settingsReloadTip) {
        try {
            if (localStorage.getItem("gvc_dismissed_settings_reload_tip") === "true") {
                settingsReloadTip.style.display = "none";
            }
        } catch (e) {}
    }
    if (dismissSettingsReloadTipBtn && settingsReloadTip) {
        dismissSettingsReloadTipBtn.addEventListener("click", async () => {
            settingsReloadTip.style.opacity = "0";
            settingsReloadTip.style.transform = "translateY(-4px)";
            setTimeout(() => {
                settingsReloadTip.style.display = "none";
            }, 200);
            try {
                localStorage.setItem("gvc_dismissed_settings_reload_tip", "true");
            } catch (e) {}
            document.documentElement.classList.add("hide-settings-reload-tip");
            currentConfig.dismissedSettingsReloadTip = true;
            try {
                await chrome.storage.sync.set({
                    config: currentConfig,
                    dismissedSettingsReloadTip: true
                });
            } catch (e) {}
        });
    }
    const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
    const resetDefaultsBottomBtn = document.getElementById("resetDefaultsBottomBtn");
    const toast = document.getElementById("toast");
    let autoSaveTimer = null;
    function scheduleAutoSave(delay = 400, toastMsg = null) {
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            saveSettings(toastMsg);
        }, delay);
    }
    function triggerAutoSave(toastMsg = null) {
        clearTimeout(autoSaveTimer);
        return saveSettings(toastMsg);
    }
    const keyboardLayoutSelect = document.getElementById("keyboardLayoutSelect");
    const autoDetectBtn = document.getElementById("autoDetectBtn");
    const shortcutsGrid = document.getElementById("shortcutsGrid");
    const resetShortcutsBtn = document.getElementById("resetShortcutsBtn");
    const clearAllShortcutsBtn = document.getElementById("clearAllShortcutsBtn");
    const recordingModal = document.getElementById("recordingModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const keyPreview = document.getElementById("keyPreview");
    const keyPreviewHint = document.getElementById("keyPreviewHint");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const clearModalKeyBtn = document.getElementById("clearModalKeyBtn");
    const previewVideo = document.getElementById("previewVideo");
    const previewPlayBtn = document.getElementById("previewPlayBtn");
    const previewTime = document.getElementById("previewTime");
    let currentConfig = {};
    let currentTheme = "cyberNeon";
    let excludedDomains = [];
    let siteControlsRules = [];
    let siteSpeeds = {};
    let siteVolumes = {};
    let siteMuteRules = {};
    let siteLoopRules = {};
    let sitePlayRules = {};
    const AUTO_SCROLL_PRESET_ITEMS = [ {
        id: "youtube",
        name: "YouTube Shorts",
        pattern: "youtube.com/shorts/"
    }, {
        id: "instagram",
        name: "Instagram Reels",
        pattern: "instagram.com/reels/"
    }, {
        id: "facebook",
        name: "Facebook Reels",
        pattern: "facebook.com/reel/"
    } ];
    let autoScrollShortsPresets = {
        youtube: true,
        instagram: true,
        facebook: true
    };
    let autoScrollShortsCustom = [];
    let currentShortcuts = {};
    let currentLayout = "qwerty";
    let recordingActionId = null;
    let hardwareLayoutMap = null;
    setupPreviewVideo();
    await loadSettings();
    async function loadSettings() {
        return new Promise(resolve => {
            if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync) {
                currentConfig = {
                    theme: "cyberNeon",
                    videoControls: [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ],
                    controllerPosition: "topLeft",
                    controlsTrigger: "hover",
                    controlsFadeInDelay: .2,
                    hideControlsDuration: 0,
                    opacity: .9,
                    overlaySize: 1,
                    glowEnabled: true,
                    showHotkeyHUD: true,
                    autoMinimize: true,
                    autoMinimizeTimeout: 2500,
                    autoHideButtons: true,
                    autoHideButtonsTimeout: 2500,
                    hideCursorOnInactivity: true,
                    hideCursorTimeout: 2.5,
                    segmentControl1To9: "force",
                    holdClickAction: "boost",
                    keyboardLayout: "qwerty",
                    keyboardShortcuts: Object.assign({}, LAYOUT_PRESETS.qwerty),
                    layoutDetected: true
                };
                applyConfigToUI(currentConfig);
                resolve();
                return;
            }
            chrome.storage.sync.get("config", async res => {
                if (res && res.config) {
                    currentConfig = res.config;
                } else {
                    currentConfig = {};
                }
                if (!currentConfig.layoutDetected) {
                    const detected = await detectLayout();
                    currentConfig.keyboardLayout = detected;
                    currentConfig.keyboardShortcuts = Object.assign({}, LAYOUT_PRESETS[detected] || LAYOUT_PRESETS.qwerty);
                    currentConfig.layoutDetected = true;
                    await chrome.storage.sync.set({
                        config: currentConfig
                    });
                }
                applyConfigToUI(currentConfig);
                resolve();
            });
        });
    }
    function applyConfigToUI(cfg) {
        if (cfg.dismissedSettingsReloadTip && settingsReloadTip) {
            settingsReloadTip.style.display = "none";
            try {
                localStorage.setItem("gvc_dismissed_settings_reload_tip", "true");
            } catch (e) {}
            document.documentElement.classList.add("hide-settings-reload-tip");
        }
        currentTheme = cfg.theme || "cyberNeon";
        highlightTheme(currentTheme);
        if (currentTheme === "custom") {
            if (buttonBgColorInput) buttonBgColorInput.value = cfg.buttonBgColor || "#181926";
            if (activeColorInput) activeColorInput.value = cfg.activeColor || "#38bdf8";
            if (buttonsColorInput) buttonsColorInput.value = cfg.buttonsColor || "#cbd5e1";
            if (activeStateColorInput) activeStateColorInput.value = cfg.activeStateColor || "#a855f7";
        }
        if (speedJumpSelect) speedJumpSelect.value = cfg.speedJump || "0.25";
        if (volumeJumpSelect) volumeJumpSelect.value = cfg.volumeJump || "0.1";
        if (favoriteSpeedInput) favoriteSpeedInput.value = cfg.favoriteSpeed !== void 0 ? cfg.favoriteSpeed : 1.5;
        if (holdFavoriteSpeedSwitch) {
            holdFavoriteSpeedSwitch.checked = cfg.holdFavoriteSpeedEnabled !== false;
            const favHoldDesc = document.getElementById("favoriteSpeedHoldDesc");
            if (favHoldDesc) favHoldDesc.style.display = holdFavoriteSpeedSwitch.checked ? "inline" : "none";
        }
        if (superSpeedInput) superSpeedInput.value = cfg.superSpeed !== void 0 ? cfg.superSpeed : 2.5;
        if (holdSuperSpeedSwitch) {
            holdSuperSpeedSwitch.checked = cfg.holdSuperSpeedEnabled !== false;
            const superHoldDesc = document.getElementById("superSpeedHoldDesc");
            if (superHoldDesc) superHoldDesc.style.display = holdSuperSpeedSwitch.checked ? "inline" : "none";
        }
        if (holdSpaceSpeedSwitch) {
            holdSpaceSpeedSwitch.checked = cfg.holdSpaceSpeedEnabled !== false;
        }
        if (holdSpaceSpeedInput) {
            holdSpaceSpeedInput.value = cfg.holdSpaceSpeed !== void 0 ? cfg.holdSpaceSpeed : 2;
        }
        updateHoldSpaceSpeedState();
        if (persistentSpeedBoostHUDSwitch) {
            persistentSpeedBoostHUDSwitch.checked = cfg.persistentSpeedBoostHUD !== false;
        }
        if (shortSkipInput) shortSkipInput.value = cfg.shortSkipDuration !== void 0 ? cfg.shortSkipDuration : 5;
        if (longSkipInput) longSkipInput.value = cfg.longSkipDuration !== void 0 ? cfg.longSkipDuration : 10;
        if (autoMinimizeSwitch) autoMinimizeSwitch.checked = cfg.autoMinimize !== false;
        if (autoMinimizeTimeoutInput) autoMinimizeTimeoutInput.value = (cfg.autoMinimizeTimeout !== void 0 ? cfg.autoMinimizeTimeout : 2500) / 1e3;
        updateAutoMinimizeState();
        if (autoHideButtonsSwitch) autoHideButtonsSwitch.checked = cfg.autoHideButtons !== false;
        if (autoHideButtonsTimeoutInput) autoHideButtonsTimeoutInput.value = (cfg.autoHideButtonsTimeout !== void 0 ? cfg.autoHideButtonsTimeout : 2500) / 1e3;
        updateAutoHideButtonsState();
        if (hideCursorOnInactivitySwitch) hideCursorOnInactivitySwitch.checked = cfg.hideCursorOnInactivity !== false;
        if (hideCursorTimeoutInput) hideCursorTimeoutInput.value = cfg.hideCursorTimeout !== void 0 ? cfg.hideCursorTimeout : 2.5;
        updateHideCursorOnInactivityState();
        if (showHotkeyHUDSwitch) showHotkeyHUDSwitch.checked = cfg.showHotkeyHUD !== false;
        updatePersistentSpeedBoostHUDState();
        if (glowEnabledSwitch) glowEnabledSwitch.checked = cfg.glowEnabled !== false;
        if (backgroundPlaySwitch) backgroundPlaySwitch.checked = cfg.backgroundPlay !== false;
        if (defaultHiddenSwitch) defaultHiddenSwitch.checked = !!cfg.defaultHidden;
        updateHideControlsDurationState();
        if (defaultSpeedInput) {
            const spd = cfg.defaultSpeed !== void 0 ? cfg.defaultSpeed : 1;
            defaultSpeedInput.value = parseFloat(spd).toFixed(2);
        }
        if (defaultVolumeInput) {
            const isBoost = cfg.volumeBoostEnabled === true;
            defaultVolumeInput.max = isBoost ? "600" : "100";
            const vol = cfg.defaultVolume !== void 0 ? cfg.defaultVolume : 1;
            const pct = Math.round(vol <= 6 ? vol * 100 : vol);
            defaultVolumeInput.value = isBoost ? Math.min(600, Math.max(0, pct)) : Math.min(100, Math.max(0, pct));
        }
        if (volumeBoostSwitch) volumeBoostSwitch.checked = cfg.volumeBoostEnabled === true;
        if (newSiteVolumeValue) {
            newSiteVolumeValue.max = "600";
        }
        if (controllerPositionSelect) {
            controllerPositionSelect.value = cfg.controllerPosition === "topRight" ? "topRight" : "topLeft";
        }
        if (controlsTriggerSelect) {
            controlsTriggerSelect.value = cfg.controlsTrigger === "click" ? "click" : "hover";
        }
        if (controlsFadeInDelayInput) {
            controlsFadeInDelayInput.value = cfg.controlsFadeInDelay !== void 0 ? cfg.controlsFadeInDelay : .2;
        }
        updateControlsFadeInDelayState();
        if (hideControlsDurationInput) {
            hideControlsDurationInput.value = cfg.hideControlsDuration !== void 0 ? cfg.hideControlsDuration : 0;
        }
        renderVideoControlsList();
        if (opacityInput) opacityInput.value = cfg.opacity !== void 0 ? cfg.opacity : .9;
        if (opacityVal) opacityVal.textContent = `${Math.round((cfg.opacity !== void 0 ? cfg.opacity : .9) * 100)}%`;
        if (overlaySizeInput) overlaySizeInput.value = cfg.overlaySize !== void 0 ? cfg.overlaySize : 1;
        if (overlaySizeVal) overlaySizeVal.textContent = `${Math.round((cfg.overlaySize !== void 0 ? cfg.overlaySize : 1) * 100)}%`;
        excludedDomains = Array.from(cfg.excludedDomains || []);
        renderExcludedDomains();
        siteControlsRules = Array.isArray(cfg.siteControlsRules) ? Array.from(cfg.siteControlsRules) : [];
        if (siteControlsRules.length === 1 && siteControlsRules[0] === "instagram.com") {
            siteControlsRules = [];
        }
        renderControlsRules();
        siteSpeeds = Object.assign({}, cfg.siteSpeeds || {});
        Object.keys(siteSpeeds).forEach(d => {
            if (Number(siteSpeeds[d]) > 16) siteSpeeds[d] = 16;
        });
        renderSiteSpeeds();
        siteVolumes = Object.assign({}, cfg.siteVolumes || {});
        renderSiteVolumes();
        if (defaultVideoStateSelect) {
            defaultVideoStateSelect.value = cfg.defaultVideoState || "doNothing";
        }
        const isMuted = cfg.defaultMuted === true || cfg.defaultAudioState === "mute" || cfg.defaultVolume !== void 0 && Number(cfg.defaultVolume) === 0;
        if (defaultMutedCheckbox) {
            defaultMutedCheckbox.checked = isMuted;
            updateDefaultMuteLabel(isMuted);
        }
        if (isMuted && defaultVolumeInput) {
            defaultVolumeInput.value = "0";
        }
        siteMuteRules = Object.assign({}, cfg.siteMuteRules || {});
        Object.entries(siteMuteRules).forEach(([domain, mode]) => {
            if (mode === "mute" || mode === "muted") {
                siteVolumes[domain] = 0;
            }
        });
        renderSiteVolumes();
        if (defaultLoopStateSelect) {
            defaultLoopStateSelect.value = cfg.defaultLoopState || "doNothing";
        }
        siteLoopRules = Object.assign({}, cfg.siteLoopRules || {});
        renderSiteLoopRules();
        sitePlayRules = Object.assign({}, cfg.sitePlayRules || {});
        renderSitePlayRules();
        if (autoScrollShortsSwitch) {
            autoScrollShortsSwitch.checked = !!cfg.autoScrollShorts;
        }
        autoScrollShortsPresets = Object.assign({
            youtube: true,
            instagram: true,
            facebook: true
        }, cfg.autoScrollShortsPresets || {});
        renderAutoScrollPresets();
        autoScrollShortsCustom = Array.isArray(cfg.autoScrollShortsCustom) ? [ ...cfg.autoScrollShortsCustom ] : [];
        renderAutoScrollCustomList();
        if (segmentControl1To9Select) {
            segmentControl1To9Select.value = cfg.segmentControl1To9 === "doNothing" ? "doNothing" : "force";
        }
        if (scrollWheelActionSelect) {
            scrollWheelActionSelect.value = cfg.scrollWheelAction || "doNothing";
        }
        if (holdClickActionSelect) {
            holdClickActionSelect.value = cfg.holdClickAction || "boost";
        }
        if (deactivateHotkeyModeSelect) {
            deactivateHotkeyModeSelect.value = cfg.deactivateHotkeyMode || "deactivateOnly";
        }
        if (autoReactivateDelayInput) {
            autoReactivateDelayInput.value = cfg.autoReactivateDelay !== void 0 ? cfg.autoReactivateDelay : 0;
        }
        if (holdToReactivateDelayInput) {
            holdToReactivateDelayInput.value = cfg.holdToReactivateDelay !== void 0 ? cfg.holdToReactivateDelay : 0;
        }
        syncReactivateInputsState();
        applyUITheme(cfg.uiTheme || "auto");
        currentLayout = cfg.keyboardLayout || "qwerty";
        if (currentLayout === "custom" || !LAYOUT_PRESETS[currentLayout]) {
            const sc = cfg.keyboardShortcuts || {};
            if (sc.toggleMute === "Semicolon" || sc.speedDown === "KeyA" || (navigator.language || "").toLowerCase().startsWith("fr")) {
                currentLayout = "azerty";
            } else if (sc.longSkipBackward === "KeyY" || (navigator.language || "").toLowerCase().startsWith("de")) {
                currentLayout = "qwertz";
            } else {
                currentLayout = "qwerty";
            }
        }
        if (keyboardLayoutSelect) {
            keyboardLayoutSelect.value = currentLayout;
        }
        const defaultPreset = JSON.parse(JSON.stringify(LAYOUT_PRESETS[currentLayout] || LAYOUT_PRESETS.qwerty));
        currentShortcuts = Object.assign({}, defaultPreset, cfg.keyboardShortcuts || {});
        if (currentShortcuts.forceFullscreen === void 0) {
            currentShortcuts.forceFullscreen = "KeyF";
        }
        if (currentShortcuts.toggleDeactivate === void 0) {
            currentShortcuts.toggleDeactivate = "KeyT";
        }
        if (currentShortcuts.nextVideo === void 0) {
            currentShortcuts.nextVideo = "KeyK";
        }
        if (currentShortcuts.prevVideo === void 0) {
            currentShortcuts.prevVideo = "KeyJ";
        }
        if (currentShortcuts.toggleVideoControls === void 0) {
            currentShortcuts.toggleVideoControls = "KeyO";
        }
        if (!cfg.shortcutsDefaultsUpdatedV2) {
            let needsSave = false;
            const playKeys = getKeysForAction("togglePlay", currentShortcuts);
            if (playKeys.length === 1 && playKeys[0] === "Space") {
                currentShortcuts.togglePlay = [ "Space", "Enter", "NumpadEnter" ];
                needsSave = true;
            }
            const ensureKey = (actId, keyToAdd) => {
                const keys = getKeysForAction(actId, currentShortcuts);
                if (!keys.includes(keyToAdd)) {
                    currentShortcuts[actId] = [ ...keys, keyToAdd ];
                    needsSave = true;
                }
            };
            ensureKey("shortSkipForward", "ArrowRight");
            ensureKey("shortSkipBackward", "ArrowLeft");
            if (needsSave) {
                cfg.shortcutsDefaultsUpdatedV2 = true;
                cfg.keyboardShortcuts = currentShortcuts;
                if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                    chrome.storage.sync.set({
                        config: cfg
                    }).catch(() => {});
                }
            }
        }
        if (!cfg.shortcutsDefaultsUpdatedV3) {
            let needsSave = false;
            const removeKey = (actId, keyToRemove, fallbackKey) => {
                let v = currentShortcuts[actId];
                if (Array.isArray(v) && v.includes(keyToRemove)) {
                    currentShortcuts[actId] = v.filter(k => k !== keyToRemove);
                    if (currentShortcuts[actId].length === 1) currentShortcuts[actId] = currentShortcuts[actId][0];
                    needsSave = true;
                } else if (v === keyToRemove) {
                    currentShortcuts[actId] = fallbackKey;
                    needsSave = true;
                }
            };
            removeKey("volumeUp", "ArrowUp", "KeyW");
            removeKey("volumeDown", "ArrowDown", "KeyS");
            cfg.shortcutsDefaultsUpdatedV3 = true;
            if (needsSave) {
                cfg.keyboardShortcuts = currentShortcuts;
                if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                    chrome.storage.sync.set({
                        config: cfg
                    }).catch(() => {});
                }
            }
        }
        renderShortcuts();
        notifyLiveTheme();
    }
    function highlightTheme(themeKey) {
        if (themeKey === "sunsetBlaze") themeKey = "goldenSunset";
        themeCards.forEach(card => {
            if (card.dataset.theme === themeKey) {
                card.classList.add("active");
            } else {
                card.classList.remove("active");
            }
        });
        if (themeKey === "custom") {
            if (customColorsWrap) customColorsWrap.style.display = "grid";
        } else {
            if (customColorsWrap) customColorsWrap.style.display = "none";
            if (THEME_PRESETS[themeKey]) {
                const p = THEME_PRESETS[themeKey];
                if (buttonBgColorInput) buttonBgColorInput.value = p.buttonBgColor;
                if (activeColorInput) activeColorInput.value = p.activeColor;
                if (buttonsColorInput) buttonsColorInput.value = p.buttonsColor;
                if (activeStateColorInput) activeStateColorInput.value = p.activeStateColor;
            }
        }
        applyActiveTheme(themeKey);
    }
    function notifyLiveTheme() {
        const draft = {
            theme: currentTheme,
            buttonBgColor: buttonBgColorInput ? buttonBgColorInput.value : "#181926",
            activeColor: activeColorInput ? activeColorInput.value : "#38bdf8",
            buttonsColor: buttonsColorInput ? buttonsColorInput.value : "#cbd5e1",
            activeStateColor: activeStateColorInput ? activeStateColorInput.value : "#a855f7",
            opacity: opacityInput ? parseFloat(opacityInput.value) : .9,
            overlaySize: overlaySizeInput ? parseFloat(overlaySizeInput.value) : 1,
            glowEnabled: glowEnabledSwitch ? glowEnabledSwitch.checked : currentConfig.glowEnabled !== false,
            showHotkeyHUD: showHotkeyHUDSwitch ? showHotkeyHUDSwitch.checked : true,
            videoControls: Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ],
            controllerPosition: controllerPositionSelect ? controllerPositionSelect.value : currentConfig.controllerPosition || "topLeft",
            controlsTrigger: controlsTriggerSelect ? controlsTriggerSelect.value : currentConfig.controlsTrigger || "hover",
            controlsFadeInDelay: controlsFadeInDelayInput ? Math.max(0, Math.min(2, parseFloat(controlsFadeInDelayInput.value) || .2)) : currentConfig.controlsFadeInDelay !== void 0 ? currentConfig.controlsFadeInDelay : .2,
            hideControlsDuration: hideControlsDurationInput ? Math.max(0, Math.min(60, parseFloat(hideControlsDurationInput.value) || 0)) : currentConfig.hideControlsDuration !== void 0 ? currentConfig.hideControlsDuration : 0
        };
        window.dispatchEvent(new CustomEvent("omni-live-theme", {
            detail: draft
        }));
    }
    themeCards.forEach(card => {
        card.addEventListener("click", () => {
            currentTheme = card.dataset.theme;
            highlightTheme(currentTheme);
            notifyLiveTheme();
            triggerAutoSave();
        });
    });
    [ buttonBgColorInput, activeColorInput, buttonsColorInput, activeStateColorInput ].forEach(inp => {
        if (inp) {
            inp.addEventListener("input", () => {
                currentTheme = "custom";
                highlightTheme("custom");
                notifyLiveTheme();
                scheduleAutoSave(300);
            });
            inp.addEventListener("change", () => {
                triggerAutoSave();
            });
        }
    });
    if (opacityInput) {
        opacityInput.addEventListener("input", e => {
            if (opacityVal) opacityVal.textContent = `${Math.round(e.target.value * 100)}%`;
            notifyLiveTheme();
            scheduleAutoSave(200);
        });
        opacityInput.addEventListener("change", () => {
            triggerAutoSave();
        });
    }
    if (overlaySizeInput) {
        overlaySizeInput.addEventListener("input", e => {
            if (overlaySizeVal) overlaySizeVal.textContent = `${Math.round(e.target.value * 100)}%`;
            notifyLiveTheme();
            scheduleAutoSave(200);
        });
        overlaySizeInput.addEventListener("change", () => {
            triggerAutoSave();
        });
    }
    if (controllerPositionSelect) {
        controllerPositionSelect.addEventListener("change", () => {
            notifyLiveTheme();
            triggerAutoSave(`Controller Position set to: ${controllerPositionSelect.options[controllerPositionSelect.selectedIndex].text}`);
        });
    }
    if (controlsTriggerSelect) {
        controlsTriggerSelect.addEventListener("change", () => {
            updateControlsFadeInDelayState();
            notifyLiveTheme();
            triggerAutoSave(`Controls Trigger set to: ${controlsTriggerSelect.options[controlsTriggerSelect.selectedIndex].text}`);
        });
    }
    if (controlsFadeInDelayInput) {
        controlsFadeInDelayInput.addEventListener("input", () => scheduleAutoSave(400));
        controlsFadeInDelayInput.addEventListener("change", () => {
            triggerAutoSave(`Controls Fade-In Delay set to: ${controlsFadeInDelayInput.value}s`);
        });
    }
    if (hideControlsDurationInput) {
        hideControlsDurationInput.addEventListener("input", () => scheduleAutoSave(400));
        hideControlsDurationInput.addEventListener("change", () => {
            triggerAutoSave(`Hide Controls Duration set to: ${hideControlsDurationInput.value}s`);
        });
    }
    if (holdFavoriteSpeedSwitch) {
        holdFavoriteSpeedSwitch.addEventListener("change", () => {
            const val = holdFavoriteSpeedSwitch.checked;
            const favHoldDesc = document.getElementById("favoriteSpeedHoldDesc");
            if (favHoldDesc) favHoldDesc.style.display = val ? "inline" : "none";
            updatePersistentSpeedBoostHUDState();
            triggerAutoSave(val ? "Hold to Boost Favorite Speed enabled" : "Hold to Boost Favorite Speed disabled");
        });
    }
    if (holdSuperSpeedSwitch) {
        holdSuperSpeedSwitch.addEventListener("change", () => {
            const val = holdSuperSpeedSwitch.checked;
            const superHoldDesc = document.getElementById("superSpeedHoldDesc");
            if (superHoldDesc) superHoldDesc.style.display = val ? "inline" : "none";
            updatePersistentSpeedBoostHUDState();
            triggerAutoSave(val ? "Hold to Boost Super Speed enabled" : "Hold to Boost Super Speed disabled");
        });
    }
    if (holdSpaceSpeedSwitch) {
        holdSpaceSpeedSwitch.addEventListener("change", () => {
            updateHoldSpaceSpeedState();
            updatePersistentSpeedBoostHUDState();
            triggerAutoSave(holdSpaceSpeedSwitch.checked ? "Hold Space for Speed Boost enabled" : "Hold Space for Speed Boost disabled");
        });
    }
    if (persistentSpeedBoostHUDSwitch) {
        persistentSpeedBoostHUDSwitch.addEventListener("change", () => {
            triggerAutoSave(persistentSpeedBoostHUDSwitch.checked ? "Keep HUD while holding speed enabled" : "Keep HUD while holding speed disabled");
        });
    }
    if (autoMinimizeSwitch) {
        autoMinimizeSwitch.addEventListener("change", () => {
            updateAutoMinimizeState();
            triggerAutoSave(autoMinimizeSwitch.checked ? "Auto-Minimize Video Controls enabled" : "Auto-Minimize Video Controls disabled");
        });
    }
    if (autoHideButtonsSwitch) {
        autoHideButtonsSwitch.addEventListener("change", () => {
            updateAutoHideButtonsState();
            triggerAutoSave(autoHideButtonsSwitch.checked ? "Auto-Hide Controls enabled" : "Auto-Hide Controls disabled");
        });
    }
    if (hideCursorOnInactivitySwitch) {
        hideCursorOnInactivitySwitch.addEventListener("change", () => {
            updateHideCursorOnInactivityState();
            triggerAutoSave(hideCursorOnInactivitySwitch.checked ? "Auto-Hide Cursor enabled" : "Auto-Hide Cursor disabled");
        });
    }
    if (hideCursorTimeoutInput) {
        hideCursorTimeoutInput.addEventListener("change", () => {
            triggerAutoSave(`Cursor Inactivity Delay set to: ${hideCursorTimeoutInput.value}s`);
        });
    }
    if (volumeBoostSwitch) {
        volumeBoostSwitch.addEventListener("change", () => {
            const isBoost = volumeBoostSwitch.checked;
            if (!isBoost) {
                const hasBoostedSiteRules = siteVolumes && Object.values(siteVolumes).some(v => Number(v) > 1);
                const hasBoostedDefault = defaultVolumeInput && parseFloat(defaultVolumeInput.value) > 100;
                if (hasBoostedSiteRules || hasBoostedDefault) {
                    const proceed = confirm("Disabling Volume Boost will reset all volume rules above 100% back to 100%. Would you like to proceed?");
                    if (!proceed) {
                        volumeBoostSwitch.checked = true;
                        return;
                    }
                }
                if (defaultVolumeInput) {
                    defaultVolumeInput.max = "100";
                    if (parseFloat(defaultVolumeInput.value) > 100) {
                        defaultVolumeInput.value = "100";
                    }
                }
                if (siteVolumes) {
                    Object.keys(siteVolumes).forEach(domain => {
                        if (siteVolumes[domain] > 1) {
                            siteVolumes[domain] = 1;
                        }
                    });
                    renderSiteVolumes();
                }
                triggerAutoSave("Volume Boost disabled (rules clamped to 100%)");
            } else {
                if (defaultVolumeInput) {
                    defaultVolumeInput.max = "600";
                }
                triggerAutoSave("Volume Boost enabled (up to 600%)");
            }
        });
    }
    function renderControlsRules() {
        if (!controlsDomainListEl) return;
        controlsDomainListEl.innerHTML = "";
        if (!siteControlsRules || siteControlsRules.length === 0) {
            controlsDomainListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        siteControlsRules.forEach((domain, idx) => {
            const li = document.createElement("li");
            li.className = "domain-item";
            li.innerHTML = `\n        <span>${domain}</span>\n        <button class="domain-delete-btn" data-idx="${idx}" title="Remove">&times;</button>\n      `;
            controlsDomainListEl.appendChild(li);
        });
    }
    if (controlsDomainListEl) {
        controlsDomainListEl.addEventListener("click", e => {
            if (e.target.classList.contains("domain-delete-btn")) {
                const idx = parseInt(e.target.dataset.idx, 10);
                siteControlsRules.splice(idx, 1);
                renderControlsRules();
                triggerAutoSave("Website progress bar rule removed");
            }
        });
    }
    if (addControlsDomainBtn && newControlsDomainInput) {
        addControlsDomainBtn.addEventListener("click", () => {
            let val = newControlsDomainInput.value.trim().toLowerCase();
            if (!val) return;
            val = val.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            if (!siteControlsRules.includes(val)) {
                siteControlsRules.push(val);
                renderControlsRules();
                newControlsDomainInput.value = "";
                triggerAutoSave(`Progress bar enabled for ${val}`);
            }
        });
        newControlsDomainInput.addEventListener("keydown", e => {
            if (e.key === "Enter") addControlsDomainBtn.click();
        });
    }
    function renderExcludedDomains() {
        if (!domainListEl) return;
        domainListEl.innerHTML = "";
        if (excludedDomains.length === 0) {
            domainListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No excluded websites.</li>';
            return;
        }
        excludedDomains.forEach((domain, idx) => {
            const li = document.createElement("li");
            li.className = "domain-item";
            li.innerHTML = `\n        <span>${domain}</span>\n        <button class="domain-delete-btn" data-idx="${idx}" title="Remove">&times;</button>\n      `;
            domainListEl.appendChild(li);
        });
    }
    if (domainListEl) {
        domainListEl.addEventListener("click", e => {
            if (e.target.classList.contains("domain-delete-btn")) {
                const idx = parseInt(e.target.dataset.idx, 10);
                excludedDomains.splice(idx, 1);
                renderExcludedDomains();
                triggerAutoSave();
            }
        });
    }
    if (addDomainBtn && newDomainInput) {
        addDomainBtn.addEventListener("click", () => {
            let val = newDomainInput.value.trim().toLowerCase();
            if (!val) return;
            val = val.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
            if (!excludedDomains.includes(val)) {
                excludedDomains.push(val);
                renderExcludedDomains();
                newDomainInput.value = "";
                triggerAutoSave();
            }
        });
        newDomainInput.addEventListener("keydown", e => {
            if (e.key === "Enter") addDomainBtn.click();
        });
    }
    let draggedControlIdx = null;
    function getOrderedControlsList() {
        const active = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
        const activeSet = new Set(active);
        const result = [];
        active.forEach(id => {
            if (CONTROLS_META[id]) result.push({
                id: id,
                enabled: true
            });
        });
        ALL_CONTROLS_KEYS.forEach(id => {
            if (!activeSet.has(id)) {
                result.push({
                    id: id,
                    enabled: false
                });
            }
        });
        return result;
    }
    function renderVideoControlsList() {
        if (!videoControlsListEl) return;
        videoControlsListEl.innerHTML = "";
        const list = getOrderedControlsList();
        list.forEach((ctrl, idx) => {
            const meta = CONTROLS_META[ctrl.id];
            if (!meta) return;
            const item = document.createElement("div");
            item.className = "video-control-item";
            item.draggable = true;
            item.dataset.id = ctrl.id;
            item.dataset.index = String(idx);
            item.innerHTML = `\n        <div class="video-control-left">\n          <div class="video-control-drag-handle" title="Drag to reorder">\n            <svg viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" fill="currentColor"/></svg>\n          </div>\n          <div class="video-control-order-btns">\n            <button type="button" class="video-control-order-btn order-up" data-idx="${idx}" title="Move up" ${idx === 0 ? 'disabled style="opacity:0.3;cursor:default;"' : ""}>▲</button>\n            <button type="button" class="video-control-order-btn order-down" data-idx="${idx}" title="Move down" ${idx === list.length - 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ""}>▼</button>\n          </div>\n          <div class="video-control-icon">\n            ${meta.icon}\n          </div>\n          <div class="video-control-details">\n            <div class="video-control-name-row">\n              <span class="video-control-name">${meta.name}</span>\n              <span class="video-control-badge ${ctrl.enabled ? "" : "removed"}">${ctrl.enabled ? "Enabled" : "Removed"}</span>\n            </div>\n            <span class="video-control-desc">${meta.desc}</span>\n          </div>\n        </div>\n        <div class="video-control-right">\n          <label class="switch">\n            <input type="checkbox" class="video-control-toggle" data-id="${ctrl.id}" ${ctrl.enabled ? "checked" : ""} />\n            <span class="slider"></span>\n          </label>\n        </div>\n      `;
            videoControlsListEl.appendChild(item);
        });
        attachVideoControlsEvents();
    }
    function attachVideoControlsEvents() {
        if (!videoControlsListEl) return;
        videoControlsListEl.querySelectorAll(".video-control-order-btn").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx, 10);
                const isUp = btn.classList.contains("order-up");
                const list = getOrderedControlsList();
                const targetIdx = isUp ? idx - 1 : idx + 1;
                if (targetIdx < 0 || targetIdx >= list.length) return;
                const temp = list[idx];
                list[idx] = list[targetIdx];
                list[targetIdx] = temp;
                currentConfig.videoControls = list.filter(c => c.enabled).map(c => c.id);
                renderVideoControlsList();
                renderShortcuts();
                notifyLiveTheme();
                triggerAutoSave("Video Controls reordered");
            });
        });
        videoControlsListEl.querySelectorAll(".video-control-toggle").forEach(toggle => {
            toggle.addEventListener("change", () => {
                const id = toggle.dataset.id;
                const list = getOrderedControlsList();
                const item = list.find(c => c.id === id);
                if (item) item.enabled = toggle.checked;
                currentConfig.videoControls = list.filter(c => c.enabled).map(c => c.id);
                renderVideoControlsList();
                renderShortcuts();
                notifyLiveTheme();
                const meta = CONTROLS_META[id];
                triggerAutoSave(toggle.checked ? `${meta ? meta.name : id} added to Video Controls` : `${meta ? meta.name : id} removed from Video Controls`);
            });
        });
        const items = videoControlsListEl.querySelectorAll(".video-control-item");
        items.forEach(item => {
            item.addEventListener("dragstart", e => {
                draggedControlIdx = parseInt(item.dataset.index, 10);
                item.classList.add("is-dragging");
                e.dataTransfer.effectAllowed = "move";
            });
            item.addEventListener("dragend", () => {
                item.classList.remove("is-dragging");
                draggedControlIdx = null;
            });
            item.addEventListener("dragover", e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
            });
            item.addEventListener("drop", e => {
                e.preventDefault();
                const targetIndex = parseInt(item.dataset.index, 10);
                if (draggedControlIdx === null || draggedControlIdx === targetIndex) return;
                const list = getOrderedControlsList();
                const [moved] = list.splice(draggedControlIdx, 1);
                list.splice(targetIndex, 0, moved);
                currentConfig.videoControls = list.filter(c => c.enabled).map(c => c.id);
                renderVideoControlsList();
                renderShortcuts();
                notifyLiveTheme();
                triggerAutoSave("Video Controls reordered");
            });
        });
    }
    function renderSiteSpeeds() {
        if (!siteSpeedListEl) return;
        siteSpeedListEl.innerHTML = "";
        const entries = Object.entries(siteSpeeds);
        if (entries.length === 0) {
            siteSpeedListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        entries.forEach(([domain, speed]) => {
            const li = document.createElement("li");
            li.className = "site-speed-item";
            li.innerHTML = `\n        <span>${domain}</span>\n        <div class="site-speed-right">\n          <span class="site-speed-badge">${Number(speed).toFixed(2)}x</span>\n          <button class="site-speed-delete-btn" data-domain="${domain}" title="Remove">&times;</button>\n        </div>\n      `;
            siteSpeedListEl.appendChild(li);
        });
    }
    if (siteSpeedListEl) {
        siteSpeedListEl.addEventListener("click", e => {
            if (e.target.classList.contains("site-speed-delete-btn")) {
                const domain = e.target.dataset.domain;
                delete siteSpeeds[domain];
                renderSiteSpeeds();
                triggerAutoSave();
            }
        });
    }
    if (addSiteSpeedBtn) {
        addSiteSpeedBtn.addEventListener("click", () => {
            if (!newSiteSpeedDomain || !newSiteSpeedValue) return;
            let domain = newSiteSpeedDomain.value.trim().toLowerCase();
            if (!domain) return;
            domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
            const rawSpeed = parseFloat(newSiteSpeedValue.value);
            const speed = Math.max(.1, Math.min(16, isNaN(rawSpeed) ? 1 : Math.round(rawSpeed * 100) / 100));
            siteSpeeds[domain] = speed;
            renderSiteSpeeds();
            newSiteSpeedDomain.value = "";
            newSiteSpeedValue.value = "1.50";
            triggerAutoSave();
        });
    }
    if (newSiteSpeedValue) {
        newSiteSpeedValue.addEventListener("input", () => {
            const raw = parseFloat(newSiteSpeedValue.value);
            if (!isNaN(raw) && raw > 16) {
                newSiteSpeedValue.value = "16.00";
            }
        });
    }
    if (newSiteSpeedDomain && addSiteSpeedBtn) {
        newSiteSpeedDomain.addEventListener("keydown", e => {
            if (e.key === "Enter") addSiteSpeedBtn.click();
        });
    }
    if (newSiteSpeedValue && addSiteSpeedBtn) {
        newSiteSpeedValue.addEventListener("keydown", e => {
            if (e.key === "Enter") addSiteSpeedBtn.click();
        });
    }
    function updateSiteVolumeMuteLabel(isMuted) {
        if (newSiteVolumeMuteText) {
            newSiteVolumeMuteText.textContent = isMuted ? "Muted" : "Mute";
        }
    }
    function renderSiteVolumes() {
        if (!siteVolumeListEl) return;
        siteVolumeListEl.innerHTML = "";
        const entries = Object.entries(siteVolumes);
        if (entries.length === 0) {
            siteVolumeListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        entries.forEach(([domain, volume]) => {
            const li = document.createElement("li");
            li.className = "site-volume-item";
            const pct = Math.round(Number(volume) * 100);
            const isBoost = pct > 100;
            const isMuted = pct === 0 || siteMuteRules && (siteMuteRules[domain] === "mute" || siteMuteRules[domain] === "muted");
            let badgeClass = "normal";
            let badgeLabel = `${pct}%`;
            if (isMuted) {
                badgeClass = "muted";
                badgeLabel = "Muted (0%)";
            } else if (isBoost) {
                badgeClass = "boost";
                badgeLabel = `${pct}% (Boost)`;
            }
            li.innerHTML = `\n        <span>${domain}</span>\n        <div class="site-volume-right">\n          <span class="site-volume-badge ${badgeClass}">${badgeLabel}</span>\n          <button class="site-volume-delete-btn" data-domain="${domain}" title="Remove">&times;</button>\n        </div>\n      `;
            siteVolumeListEl.appendChild(li);
        });
    }
    if (siteVolumeListEl) {
        siteVolumeListEl.addEventListener("click", e => {
            if (e.target.classList.contains("site-volume-delete-btn")) {
                const domain = e.target.dataset.domain;
                delete siteVolumes[domain];
                if (siteMuteRules) delete siteMuteRules[domain];
                renderSiteVolumes();
                triggerAutoSave();
            }
        });
    }
    if (newSiteVolumeMuted) {
        newSiteVolumeMuted.addEventListener("change", () => {
            const isMuted = newSiteVolumeMuted.checked;
            updateSiteVolumeMuteLabel(isMuted);
            if (isMuted) {
                if (newSiteVolumeValue) newSiteVolumeValue.value = "0";
            } else {
                if (newSiteVolumeValue && newSiteVolumeValue.value === "0") {
                    newSiteVolumeValue.value = "100";
                }
            }
        });
    }
    if (addSiteVolumeBtn) {
        addSiteVolumeBtn.addEventListener("click", () => {
            let domain = newSiteVolumeDomain.value.trim().toLowerCase();
            if (!domain) return;
            domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
            const isMuted = newSiteVolumeMuted && newSiteVolumeMuted.checked || newSiteVolumeValue && parseFloat(newSiteVolumeValue.value) === 0;
            if (isMuted) {
                siteVolumes[domain] = 0;
                siteMuteRules[domain] = "mute";
            } else {
                let rawVal = parseFloat(newSiteVolumeValue.value);
                if (isNaN(rawVal) || rawVal < 0) rawVal = 100;
                rawVal = Math.min(600, rawVal);
                const isBoost = volumeBoostSwitch && volumeBoostSwitch.checked;
                if (rawVal > 100 && !isBoost) {
                    const proceed = confirm("Setting a volume rule above 100% requires Volume Boost. Would you like to enable Volume Boost now?");
                    if (proceed) {
                        if (volumeBoostSwitch) volumeBoostSwitch.checked = true;
                        if (defaultVolumeInput) defaultVolumeInput.max = "600";
                    } else {
                        rawVal = 100;
                    }
                }
                siteVolumes[domain] = Math.round(rawVal) / 100;
                delete siteMuteRules[domain];
            }
            renderSiteVolumes();
            newSiteVolumeDomain.value = "";
            newSiteVolumeValue.value = "100";
            if (newSiteVolumeMuted) {
                newSiteVolumeMuted.checked = false;
                updateSiteVolumeMuteLabel(false);
            }
            triggerAutoSave();
        });
    }
    if (newSiteVolumeDomain) {
        newSiteVolumeDomain.addEventListener("keydown", e => {
            if (e.key === "Enter") addSiteVolumeBtn.click();
        });
    }
    if (newSiteVolumeValue) {
        newSiteVolumeValue.addEventListener("input", () => {
            const raw = parseFloat(newSiteVolumeValue.value);
            if (raw === 0 && newSiteVolumeMuted && !newSiteVolumeMuted.checked) {
                newSiteVolumeMuted.checked = true;
                updateSiteVolumeMuteLabel(true);
            } else if (raw > 0 && newSiteVolumeMuted && newSiteVolumeMuted.checked) {
                newSiteVolumeMuted.checked = false;
                updateSiteVolumeMuteLabel(false);
            }
            if (!isNaN(raw) && raw > 600) {
                newSiteVolumeValue.value = 600;
            }
        });
        newSiteVolumeValue.addEventListener("blur", () => {
            const raw = parseFloat(newSiteVolumeValue.value);
            if (isNaN(raw) || raw < 0) {
                newSiteVolumeValue.value = "100";
                if (newSiteVolumeMuted) {
                    newSiteVolumeMuted.checked = false;
                    updateSiteVolumeMuteLabel(false);
                }
            } else if (raw > 600) {
                newSiteVolumeValue.value = 600;
            }
        });
        newSiteVolumeValue.addEventListener("keydown", e => {
            if (e.key === "Enter") addSiteVolumeBtn.click();
        });
    }
    function renderSiteLoopRules() {
        if (!siteLoopListEl) return;
        siteLoopListEl.innerHTML = "";
        const entries = Object.entries(siteLoopRules);
        if (entries.length === 0) {
            siteLoopListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        entries.forEach(([domain, mode]) => {
            const li = document.createElement("li");
            li.className = "site-loop-item";
            const isLoop = mode === "loop";
            const badgeLabel = isLoop ? "Loop" : "Don't Loop";
            const badgeClass = isLoop ? "loop" : "unloop";
            li.innerHTML = `\n        <span>${domain}</span>\n        <div class="site-loop-right">\n          <span class="site-loop-badge ${badgeClass}">${badgeLabel}</span>\n          <button class="site-loop-delete-btn" data-domain="${domain}" title="Remove">&times;</button>\n        </div>\n      `;
            siteLoopListEl.appendChild(li);
        });
    }
    if (siteLoopListEl) {
        siteLoopListEl.addEventListener("click", e => {
            if (e.target.classList.contains("site-loop-delete-btn")) {
                const domain = e.target.dataset.domain;
                delete siteLoopRules[domain];
                renderSiteLoopRules();
                triggerAutoSave();
            }
        });
    }
    if (addSiteLoopBtn) {
        addSiteLoopBtn.addEventListener("click", () => {
            let domain = newSiteLoopDomain.value.trim().toLowerCase();
            if (!domain) return;
            domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
            const mode = newSiteLoopMode && newSiteLoopMode.value || "loop";
            siteLoopRules[domain] = mode;
            renderSiteLoopRules();
            newSiteLoopDomain.value = "";
            triggerAutoSave();
        });
    }
    if (newSiteLoopDomain) {
        newSiteLoopDomain.addEventListener("keydown", e => {
            if (e.key === "Enter") addSiteLoopBtn.click();
        });
    }
    function renderSitePlayRules() {
        if (!sitePlayListEl) return;
        sitePlayListEl.innerHTML = "";
        const entries = Object.entries(sitePlayRules);
        if (entries.length === 0) {
            sitePlayListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        entries.forEach(([domain, mode]) => {
            const isPlay = mode === "play";
            const label = isPlay ? "Always Play" : "Always Pause";
            const badgeClass = isPlay ? "play" : "pause";
            const li = document.createElement("li");
            li.className = "site-play-item";
            li.innerHTML = `\n        <span class="site-domain" title="${domain}">${domain}</span>\n        <div class="site-play-right">\n          <span class="site-play-badge ${badgeClass}">${label}</span>\n          <button class="site-play-delete-btn" data-domain="${domain}" title="Remove">&times;</button>\n        </div>\n      `;
            sitePlayListEl.appendChild(li);
        });
    }
    if (sitePlayListEl) {
        sitePlayListEl.addEventListener("click", e => {
            if (e.target.classList.contains("site-play-delete-btn")) {
                const domain = e.target.dataset.domain;
                delete sitePlayRules[domain];
                renderSitePlayRules();
                triggerAutoSave();
            }
        });
    }
    if (addSitePlayBtn) {
        addSitePlayBtn.addEventListener("click", () => {
            let domain = newSitePlayDomain.value.trim().toLowerCase();
            if (!domain) return;
            domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
            const mode = newSitePlayMode && newSitePlayMode.value || "pause";
            sitePlayRules[domain] = mode;
            renderSitePlayRules();
            newSitePlayDomain.value = "";
            triggerAutoSave();
        });
    }
    if (newSitePlayDomain) {
        newSitePlayDomain.addEventListener("keydown", e => {
            if (e.key === "Enter") addSitePlayBtn.click();
        });
    }
    function renderAutoScrollPresets() {
        if (!autoScrollPresetsListEl) return;
        autoScrollPresetsListEl.innerHTML = "";
        AUTO_SCROLL_PRESET_ITEMS.forEach(p => {
            const isChecked = autoScrollShortsPresets[p.id] !== false;
            const item = document.createElement("div");
            item.className = "auto-scroll-preset-item";
            item.innerHTML = `\n        <div class="auto-scroll-preset-info">\n          <span class="auto-scroll-preset-name">${p.name}</span>\n          <span class="auto-scroll-preset-pattern"><code>${p.pattern}</code></span>\n        </div>\n        <label class="switch">\n          <input type="checkbox" class="auto-scroll-preset-toggle" data-preset-id="${p.id}" ${isChecked ? "checked" : ""} />\n          <span class="slider"></span>\n        </label>\n      `;
            autoScrollPresetsListEl.appendChild(item);
        });
    }
    function renderAutoScrollCustomList() {
        if (!autoScrollCustomListEl) return;
        autoScrollCustomListEl.innerHTML = "";
        if (autoScrollShortsCustom.length === 0) {
            autoScrollCustomListEl.innerHTML = '<li style="font-size:12px;color:var(--text-dim);font-style:italic;">No custom websites configured.</li>';
            return;
        }
        autoScrollShortsCustom.forEach((pat, index) => {
            const li = document.createElement("li");
            li.className = "auto-scroll-custom-item";
            li.innerHTML = `\n        <span><code>${pat}</code></span>\n        <button class="auto-scroll-delete-btn" data-index="${index}" title="Remove">&times;</button>\n      `;
            autoScrollCustomListEl.appendChild(li);
        });
    }
    if (autoScrollShortsSwitch) {
        autoScrollShortsSwitch.addEventListener("change", () => {
            triggerAutoSave(autoScrollShortsSwitch.checked ? "Auto-Scroll Short Form Content enabled" : "Auto-Scroll Short Form Content disabled");
        });
    }
    if (autoScrollPresetsListEl) {
        autoScrollPresetsListEl.addEventListener("change", e => {
            const toggle = e.target.closest(".auto-scroll-preset-toggle");
            if (toggle) {
                const pid = toggle.dataset.presetId;
                autoScrollShortsPresets[pid] = toggle.checked;
                triggerAutoSave();
            }
        });
    }
    if (addAutoScrollBtn && newAutoScrollPattern) {
        addAutoScrollBtn.addEventListener("click", () => {
            let val = newAutoScrollPattern.value.trim().toLowerCase();
            if (!val) return;
            val = val.replace(/^https?:\/\//, "").replace(/^www\./, "");
            if (val && !autoScrollShortsCustom.includes(val)) {
                autoScrollShortsCustom.push(val);
                renderAutoScrollCustomList();
                newAutoScrollPattern.value = "";
                triggerAutoSave();
            }
        });
        newAutoScrollPattern.addEventListener("keydown", e => {
            if (e.key === "Enter") addAutoScrollBtn.click();
        });
    }
    if (autoScrollCustomListEl) {
        autoScrollCustomListEl.addEventListener("click", e => {
            if (e.target.classList.contains("auto-scroll-delete-btn")) {
                const idx = parseInt(e.target.dataset.index, 10);
                if (!isNaN(idx) && idx >= 0 && idx < autoScrollShortsCustom.length) {
                    autoScrollShortsCustom.splice(idx, 1);
                    renderAutoScrollCustomList();
                    triggerAutoSave();
                }
            }
        });
    }
    async function saveSettings(customToastMsg = null) {
        const updated = {
            ...currentConfig,
            theme: currentTheme,
            buttonBgColor: buttonBgColorInput ? buttonBgColorInput.value : currentConfig.buttonBgColor || "#181926",
            activeColor: activeColorInput ? activeColorInput.value : currentConfig.activeColor || "#38bdf8",
            buttonsColor: buttonsColorInput ? buttonsColorInput.value : currentConfig.buttonsColor || "#cbd5e1",
            activeStateColor: activeStateColorInput ? activeStateColorInput.value : currentConfig.activeStateColor || "#a855f7",
            speedJump: speedJumpSelect ? parseFloat(speedJumpSelect.value) : currentConfig.speedJump || .25,
            volumeJump: volumeJumpSelect ? parseFloat(volumeJumpSelect.value) : currentConfig.volumeJump || .1,
            favoriteSpeed: favoriteSpeedInput ? parseFloat(favoriteSpeedInput.value) : currentConfig.favoriteSpeed !== void 0 ? currentConfig.favoriteSpeed : 1.5,
            holdFavoriteSpeedEnabled: holdFavoriteSpeedSwitch ? holdFavoriteSpeedSwitch.checked : true,
            superSpeed: superSpeedInput ? parseFloat(superSpeedInput.value) : currentConfig.superSpeed !== void 0 ? currentConfig.superSpeed : 2.5,
            holdSuperSpeedEnabled: holdSuperSpeedSwitch ? holdSuperSpeedSwitch.checked : true,
            holdSpaceSpeedEnabled: holdSpaceSpeedSwitch ? holdSpaceSpeedSwitch.checked : true,
            holdSpaceSpeed: holdSpaceSpeedInput ? parseFloat(holdSpaceSpeedInput.value) || 2 : 2,
            persistentSpeedBoostHUD: persistentSpeedBoostHUDSwitch ? persistentSpeedBoostHUDSwitch.checked : true,
            shortSkipDuration: shortSkipInput ? parseInt(shortSkipInput.value, 10) : currentConfig.shortSkipDuration || 5,
            longSkipDuration: longSkipInput ? parseInt(longSkipInput.value, 10) : currentConfig.longSkipDuration || 10,
            autoMinimize: autoMinimizeSwitch ? autoMinimizeSwitch.checked : currentConfig.autoMinimize !== false,
            autoMinimizeTimeout: autoMinimizeTimeoutInput ? Math.round(parseFloat(autoMinimizeTimeoutInput.value) * 1e3) : currentConfig.autoMinimizeTimeout !== void 0 ? currentConfig.autoMinimizeTimeout : 2500,
            autoHideButtons: autoHideButtonsSwitch ? autoHideButtonsSwitch.checked : currentConfig.autoHideButtons !== false,
            autoHideButtonsTimeout: autoHideButtonsTimeoutInput ? Math.round(parseFloat(autoHideButtonsTimeoutInput.value) * 1e3) : currentConfig.autoHideButtonsTimeout !== void 0 ? currentConfig.autoHideButtonsTimeout : 2500,
            hideCursorOnInactivity: hideCursorOnInactivitySwitch ? hideCursorOnInactivitySwitch.checked : true,
            hideCursorTimeout: hideCursorTimeoutInput ? Math.max(.5, Math.min(30, parseFloat(hideCursorTimeoutInput.value) || 2.5)) : currentConfig.hideCursorTimeout !== void 0 ? currentConfig.hideCursorTimeout : 2.5,
            showHotkeyHUD: showHotkeyHUDSwitch ? showHotkeyHUDSwitch.checked : currentConfig.showHotkeyHUD !== false,
            defaultHidden: defaultHiddenSwitch ? defaultHiddenSwitch.checked : !!currentConfig.defaultHidden,
            defaultSpeed: defaultSpeedInput ? Math.max(.1, Math.min(16, parseFloat(defaultSpeedInput.value) || 1)) : currentConfig.defaultSpeed !== void 0 ? currentConfig.defaultSpeed : 1,
            defaultVolume: defaultVolumeInput ? Math.max(0, Math.min(volumeBoostSwitch && volumeBoostSwitch.checked ? 600 : 100, parseFloat(defaultVolumeInput.value) || 100)) / 100 : currentConfig.defaultVolume !== void 0 ? currentConfig.defaultVolume : 1,
            videoControls: Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ],
            controllerPosition: controllerPositionSelect ? controllerPositionSelect.value : currentConfig.controllerPosition || "topLeft",
            controlsTrigger: controlsTriggerSelect ? controlsTriggerSelect.value : currentConfig.controlsTrigger || "hover",
            controlsFadeInDelay: controlsFadeInDelayInput ? Math.max(0, Math.min(2, parseFloat(controlsFadeInDelayInput.value) || .2)) : currentConfig.controlsFadeInDelay !== void 0 ? currentConfig.controlsFadeInDelay : .2,
            hideControlsDuration: hideControlsDurationInput ? Math.max(0, Math.min(60, parseFloat(hideControlsDurationInput.value) || 0)) : currentConfig.hideControlsDuration !== void 0 ? currentConfig.hideControlsDuration : 0,
            volumeBoostEnabled: volumeBoostSwitch ? volumeBoostSwitch.checked : false,
            backgroundPlay: backgroundPlaySwitch ? backgroundPlaySwitch.checked : true,
            opacity: opacityInput ? parseFloat(opacityInput.value) : currentConfig.opacity !== void 0 ? currentConfig.opacity : .9,
            overlaySize: overlaySizeInput ? parseFloat(overlaySizeInput.value) : currentConfig.overlaySize !== void 0 ? currentConfig.overlaySize : 1,
            glowEnabled: glowEnabledSwitch ? glowEnabledSwitch.checked : currentConfig.glowEnabled !== false,
            excludedDomains: excludedDomains,
            siteControlsRules: siteControlsRules,
            siteSpeeds: siteSpeeds,
            siteVolumes: siteVolumes,
            defaultVideoState: defaultVideoStateSelect ? defaultVideoStateSelect.value : "doNothing",
            defaultMuted: defaultMutedCheckbox ? defaultMutedCheckbox.checked : false,
            defaultAudioState: defaultMutedCheckbox && defaultMutedCheckbox.checked ? "mute" : "doNothing",
            siteMuteRules: siteMuteRules,
            defaultLoopState: defaultLoopStateSelect ? defaultLoopStateSelect.value : "doNothing",
            siteLoopRules: siteLoopRules,
            sitePlayRules: sitePlayRules,
            autoScrollShorts: autoScrollShortsSwitch ? autoScrollShortsSwitch.checked : false,
            autoScrollShortsPresets: autoScrollShortsPresets,
            autoScrollShortsCustom: autoScrollShortsCustom,
            segmentControl1To9: segmentControl1To9Select ? segmentControl1To9Select.value : "force",
            scrollWheelAction: scrollWheelActionSelect ? scrollWheelActionSelect.value : "doNothing",
            holdClickAction: holdClickActionSelect ? holdClickActionSelect.value : "boost",
            deactivateHotkeyMode: deactivateHotkeyModeSelect ? deactivateHotkeyModeSelect.value : currentConfig.deactivateHotkeyMode || "deactivateOnly",
            autoReactivateDelay: autoReactivateDelayInput ? Math.max(0, Math.min(60, parseFloat(autoReactivateDelayInput.value) || 0)) : currentConfig.autoReactivateDelay !== void 0 ? currentConfig.autoReactivateDelay : 0,
            holdToReactivateDelay: holdToReactivateDelayInput ? Math.max(0, Math.min(60, parseFloat(holdToReactivateDelayInput.value) || 0)) : currentConfig.holdToReactivateDelay !== void 0 ? currentConfig.holdToReactivateDelay : 0,
            dismissedSettingsReloadTip: currentConfig.dismissedSettingsReloadTip !== void 0 ? currentConfig.dismissedSettingsReloadTip : localStorage.getItem("gvc_dismissed_settings_reload_tip") === "true",
            dismissedPopupReloadTip: currentConfig.dismissedPopupReloadTip !== void 0 ? currentConfig.dismissedPopupReloadTip : localStorage.getItem("gvc_dismissed_popup_reload_tip") === "true",
            uiTheme: uiThemeSelect ? uiThemeSelect.value : currentConfig.uiTheme || "auto",
            keyboardLayout: currentLayout,
            keyboardShortcuts: currentShortcuts,
            layoutDetected: true
        };
        try {
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                await chrome.storage.sync.set({
                    config: updated
                });
            }
        } catch (e) {}
        currentConfig = updated;
        if (customToastMsg) {
            showToast(customToastMsg);
        }
    }
    if (defaultSpeedInput) {
        defaultSpeedInput.addEventListener("input", () => scheduleAutoSave(400));
        defaultSpeedInput.addEventListener("blur", () => {
            let val = parseFloat(defaultSpeedInput.value);
            if (isNaN(val) || val < .1) val = 1; else if (val > 16) val = 16;
            defaultSpeedInput.value = val.toFixed(2);
            triggerAutoSave();
        });
        defaultSpeedInput.addEventListener("change", () => {
            let val = parseFloat(defaultSpeedInput.value);
            if (isNaN(val) || val < .1) val = 1; else if (val > 16) val = 16;
            defaultSpeedInput.value = val.toFixed(2);
            triggerAutoSave(`Default Video Speed set to ${val.toFixed(2)}x`);
        });
        defaultSpeedInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                defaultSpeedInput.blur();
            }
        });
    }
    if (defaultVolumeInput) {
        defaultVolumeInput.addEventListener("input", () => {
            const curVal = parseFloat(defaultVolumeInput.value);
            if (curVal === 0 && defaultMutedCheckbox && !defaultMutedCheckbox.checked) {
                defaultMutedCheckbox.checked = true;
                updateDefaultMuteLabel(true);
            } else if (curVal > 0 && defaultMutedCheckbox && defaultMutedCheckbox.checked) {
                defaultMutedCheckbox.checked = false;
                updateDefaultMuteLabel(false);
            }
            const raw = parseFloat(defaultVolumeInput.value);
            if (!isNaN(raw) && raw > 600) {
                defaultVolumeInput.value = 600;
            }
        });
        let defaultVolumePrompting = false;
        const handleDefaultVolumeCommit = () => {
            if (defaultVolumePrompting) return;
            let raw = parseFloat(defaultVolumeInput.value);
            if (isNaN(raw) || raw < 0) {
                defaultVolumeInput.value = defaultMutedCheckbox && defaultMutedCheckbox.checked ? "0" : "100";
                raw = defaultMutedCheckbox && defaultMutedCheckbox.checked ? 0 : 100;
            } else if (raw > 600) {
                defaultVolumeInput.value = "600";
                raw = 600;
            }
            const isBoost = volumeBoostSwitch && volumeBoostSwitch.checked;
            if (raw > 100 && !isBoost) {
                defaultVolumePrompting = true;
                const proceed = confirm("Setting Default Volume above 100% requires Volume Boost. Would you like to enable Volume Boost now?");
                defaultVolumePrompting = false;
                if (proceed) {
                    if (volumeBoostSwitch) volumeBoostSwitch.checked = true;
                    defaultVolumeInput.max = "600";
                    triggerAutoSave("Volume Boost enabled (up to 600%)");
                    return;
                } else {
                    defaultVolumeInput.value = "100";
                    defaultVolumeInput.max = "100";
                }
            }
            triggerAutoSave(`Default Volume set to ${defaultVolumeInput.value}%`);
        };
        defaultVolumeInput.addEventListener("blur", handleDefaultVolumeCommit);
        defaultVolumeInput.addEventListener("change", handleDefaultVolumeCommit);
        defaultVolumeInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                defaultVolumeInput.blur();
            }
        });
    }
    if (defaultVideoStateSelect) {
        defaultVideoStateSelect.addEventListener("change", () => {
            const label = defaultVideoStateSelect.options[defaultVideoStateSelect.selectedIndex].text;
            triggerAutoSave(`Default Video State set to: ${label}`);
        });
    }
    if (defaultMutedCheckbox) {
        defaultMutedCheckbox.addEventListener("change", () => {
            const isMuted = defaultMutedCheckbox.checked;
            updateDefaultMuteLabel(isMuted);
            if (defaultVolumeInput) {
                if (isMuted) {
                    defaultVolumeInput.value = "0";
                } else if (parseFloat(defaultVolumeInput.value) === 0) {
                    defaultVolumeInput.value = "100";
                }
            }
            triggerAutoSave(isMuted ? "Default Audio set to Muted" : "Default Audio Mute disabled");
        });
    }
    if (defaultLoopStateSelect) {
        defaultLoopStateSelect.addEventListener("change", () => {
            const label = defaultLoopStateSelect.options[defaultLoopStateSelect.selectedIndex].text;
            triggerAutoSave(`Default Loop State set to: ${label}`);
        });
    }
    if (scrollWheelActionSelect) {
        scrollWheelActionSelect.addEventListener("change", () => {
            const label = scrollWheelActionSelect.options[scrollWheelActionSelect.selectedIndex].text;
            triggerAutoSave(`Scroll Wheel Action set to: ${label}`);
        });
    }
    if (holdClickActionSelect) {
        holdClickActionSelect.addEventListener("change", () => {
            const label = holdClickActionSelect.options[holdClickActionSelect.selectedIndex].text;
            triggerAutoSave(`Hold Click Action set to: ${label}`);
        });
    }
    if (segmentControl1To9Select) {
        segmentControl1To9Select.addEventListener("change", () => {
            const label = segmentControl1To9Select.options[segmentControl1To9Select.selectedIndex].text;
            triggerAutoSave(`Number Keys 0-9 set to: ${label}`);
        });
    }
    if (deactivateHotkeyModeSelect) {
        deactivateHotkeyModeSelect.addEventListener("change", () => {
            const label = deactivateHotkeyModeSelect.options[deactivateHotkeyModeSelect.selectedIndex].text;
            syncReactivateInputsState();
            triggerAutoSave(`Deactivation Hotkey set to: ${label}`);
        });
    }
    if (autoReactivateDelayInput) {
        const onAutoReactivateChange = () => {
            let val = parseFloat(autoReactivateDelayInput.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 60) val = 60;
            syncReactivateInputsState("auto");
            triggerAutoSave(val > 0 ? `Auto-reactivate timer set to ${val}s` : "Auto-reactivate timer turned off");
        };
        autoReactivateDelayInput.addEventListener("input", onAutoReactivateChange);
        autoReactivateDelayInput.addEventListener("change", onAutoReactivateChange);
    }
    if (holdToReactivateDelayInput) {
        const onHoldReactivateChange = () => {
            let val = parseFloat(holdToReactivateDelayInput.value);
            if (isNaN(val) || val < 0) val = 0;
            if (val > 60) val = 60;
            syncReactivateInputsState("hold");
            triggerAutoSave(val > 0 ? `Hold to reactivate timer set to ${val}s` : "Hold to reactivate timer turned off");
        };
        holdToReactivateDelayInput.addEventListener("input", onHoldReactivateChange);
        holdToReactivateDelayInput.addEventListener("change", onHoldReactivateChange);
    }
    if (speedJumpSelect) {
        speedJumpSelect.addEventListener("change", () => {
            triggerAutoSave();
        });
    }
    if (volumeJumpSelect) {
        volumeJumpSelect.addEventListener("change", () => {
            triggerAutoSave();
        });
    }
    [ favoriteSpeedInput, superSpeedInput, shortSkipInput, longSkipInput, autoMinimizeTimeoutInput, autoHideButtonsTimeoutInput, hideCursorTimeoutInput, hideControlsDurationInput, controlsFadeInDelayInput ].forEach(inp => {
        if (inp) {
            inp.addEventListener("input", () => scheduleAutoSave(400));
            inp.addEventListener("change", () => triggerAutoSave());
        }
    });
    if (holdSpaceSpeedInput) {
        holdSpaceSpeedInput.addEventListener("input", () => scheduleAutoSave(400));
        holdSpaceSpeedInput.addEventListener("change", () => triggerAutoSave());
    }
    if (showHotkeyHUDSwitch) {
        showHotkeyHUDSwitch.addEventListener("change", () => {
            updatePersistentSpeedBoostHUDState();
            notifyLiveTheme();
            triggerAutoSave(showHotkeyHUDSwitch.checked ? "Hotkey HUD notifications enabled" : "Hotkey HUD notifications disabled");
        });
    }
    if (glowEnabledSwitch) {
        glowEnabledSwitch.addEventListener("change", () => {
            notifyLiveTheme();
            triggerAutoSave(glowEnabledSwitch.checked ? "Controller & Controls & Hotkey HUD Notifications Glow enabled" : "Controller & Controls & Hotkey HUD Notifications Glow disabled");
        });
    }
    if (backgroundPlaySwitch) {
        backgroundPlaySwitch.addEventListener("change", () => {
            triggerAutoSave(backgroundPlaySwitch.checked ? "Background Playback enabled" : "Background Playback disabled");
        });
    }
    if (defaultHiddenSwitch) {
        defaultHiddenSwitch.addEventListener("change", () => {
            updateHideControlsDurationState();
            triggerAutoSave(defaultHiddenSwitch.checked ? "Start Hidden enabled" : "Start Hidden disabled");
        });
    }
    const handleResetDefaults = () => {
        if (confirm("Reset all settings to default values? This will remove any rules set in website customizations.")) {
            chrome.runtime.sendMessage({
                type: "getDefaultConfig"
            }, async res => {
                if (res && res.config) {
                    const detected = await detectLayout();
                    const wasSettingsTipDismissed = currentConfig.dismissedSettingsReloadTip || localStorage.getItem("gvc_dismissed_settings_reload_tip") === "true";
                    const wasPopupTipDismissed = currentConfig.dismissedPopupReloadTip || localStorage.getItem("gvc_dismissed_popup_reload_tip") === "true";
                    const cfg = {
                        ...res.config,
                        dismissedSettingsReloadTip: wasSettingsTipDismissed,
                        dismissedPopupReloadTip: wasPopupTipDismissed,
                        keyboardLayout: detected,
                        keyboardShortcuts: JSON.parse(JSON.stringify(LAYOUT_PRESETS[detected] || LAYOUT_PRESETS.qwerty)),
                        layoutDetected: true
                    };
                    await chrome.storage.sync.set({
                        config: cfg
                    });
                    currentConfig = cfg;
                    applyConfigToUI(currentConfig);
                    showToast("Reset to default settings!");
                }
            });
        }
    };
    if (resetDefaultsBtn) resetDefaultsBtn.addEventListener("click", handleResetDefaults);
    if (resetDefaultsBottomBtn) resetDefaultsBottomBtn.addEventListener("click", handleResetDefaults);
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            if (toast) toast.classList.remove("show");
        }, 2500);
    }
    async function detectLayout() {
        try {
            if (navigator.keyboard && typeof navigator.keyboard.getLayoutMap === "function") {
                const map = await navigator.keyboard.getLayoutMap();
                hardwareLayoutMap = map;
                const qVal = (map.get("KeyQ") || "").toLowerCase();
                const wVal = (map.get("KeyW") || "").toLowerCase();
                const zVal = (map.get("KeyZ") || "").toLowerCase();
                if (qVal === "a" || wVal === "z") {
                    return "azerty";
                }
                if (zVal === "y") {
                    return "qwertz";
                }
                return "qwerty";
            }
        } catch (e) {
            console.warn("Keyboard API getLayoutMap unavailable:", e);
        }
        const lang = (navigator.language || "").toLowerCase();
        if (lang.startsWith("fr")) return "azerty";
        if (lang.startsWith("de")) return "qwertz";
        return "qwerty";
    }
    function formatKeyCode(code, layout = currentLayout) {
        if (!code) return "NONE";
        const l = (layout || "qwerty").toLowerCase();
        if (l === "azerty") {
            if (code === "KeyW") return "Z";
            if (code === "KeyA") return "Q";
            if (code === "KeyQ") return "A";
            if (code === "KeyZ") return "W";
            if (code === "Semicolon") return "M";
            if (code === "KeyM") return ",";
            if (code === "Comma") return ";";
            if (code === "Period") return ":";
            if (code === "Slash") return "!";
            if (code === "Quote") return "ù";
            if (code === "BracketLeft") return "^";
            if (code === "BracketRight") return "$";
            if (code === "Backslash") return "*";
            if (code === "Backquote") return "²";
            if (code === "Minus") return ")";
            if (code === "Equal") return "=";
        } else if (l === "qwertz") {
            if (code === "KeyZ") return "Y";
            if (code === "KeyY") return "Z";
            if (code === "Minus") return "ß";
        } else {
            try {
                if (hardwareLayoutMap && typeof hardwareLayoutMap.get === "function") {
                    const mapped = hardwareLayoutMap.get(code);
                    if (mapped) return mapped.toUpperCase();
                }
            } catch (e) {}
        }
        if (code.startsWith("Key")) return code.slice(3);
        if (code.startsWith("Digit")) return code.slice(5);
        if (code === "ArrowUp") return "↑";
        if (code === "ArrowDown") return "↓";
        if (code === "ArrowLeft") return "←";
        if (code === "ArrowRight") return "→";
        if (code === "Space") return "Space";
        if (code === "Enter") return "Enter";
        if (code === "NumpadEnter") return "Numpad Enter";
        if (code === "BracketLeft") return "[";
        if (code === "BracketRight") return "]";
        if (code === "Semicolon") return ";";
        if (code === "Quote") return "'";
        if (code === "Comma") return ",";
        if (code === "Period") return ".";
        if (code === "Slash") return "/";
        if (code === "Minus") return "-";
        if (code === "Equal") return "=";
        if (code === "Backquote") return "`";
        if (code === "Backslash") return "\\";
        return code;
    }
    function getKeysForAction(actionId, shortcuts) {
        const sc = shortcuts || currentShortcuts || {};
        let val = sc[actionId];
        if (val === void 0) {
            if (typeof DEFAULT_CONFIG !== "undefined" && DEFAULT_CONFIG && DEFAULT_CONFIG.keyboardShortcuts) {
                val = DEFAULT_CONFIG.keyboardShortcuts[actionId];
            }
        }
        if (Array.isArray(val)) {
            return val.filter(k => typeof k === "string" && k.length > 0);
        }
        if (typeof val === "string" && val.trim().length > 0) {
            return [ val.trim() ];
        }
        return [];
    }
    function formatActionKeysForDesc(actionId, layout) {
        const keys = getKeysForAction(actionId, currentShortcuts);
        if (!keys || keys.length === 0) return "None";
        return keys.map(k => formatKeyCode(k, layout || currentLayout)).join(" / ");
    }
    function updateDynamicTips() {
        const displayPlayPauseKey = formatActionKeysForDesc("togglePlay", currentLayout);
        const tipPlayPauseEl = document.getElementById("tipPlayPauseKey");
        if (tipPlayPauseEl) tipPlayPauseEl.textContent = displayPlayPauseKey;
        const tipPlayPauseHoldEl = document.getElementById("tipPlayPauseKeyHold");
        if (tipPlayPauseHoldEl) tipPlayPauseHoldEl.textContent = displayPlayPauseKey;
        const descSpaceSpeedEl = document.getElementById("spaceSpeedKeyDesc");
        if (descSpaceSpeedEl) descSpaceSpeedEl.textContent = displayPlayPauseKey;
        const descSpaceSpeedValEl = document.getElementById("spaceSpeedKeyDescVal");
        if (descSpaceSpeedValEl) descSpaceSpeedValEl.textContent = displayPlayPauseKey;
        const displaySuperKey = formatActionKeysForDesc("toggleSuperSpeed", currentLayout);
        const tipSuperEl = document.getElementById("tipSuperSpeedKey");
        if (tipSuperEl) tipSuperEl.textContent = displaySuperKey;
        const descSuperEl = document.getElementById("superSpeedKeyDesc");
        if (descSuperEl) descSuperEl.textContent = displaySuperKey;
        const descSuperHoldEl = document.getElementById("superSpeedHoldKeyDesc");
        if (descSuperHoldEl) descSuperHoldEl.textContent = displaySuperKey;
        const displayFavKey = formatActionKeysForDesc("toggleFavoriteSpeed", currentLayout);
        const tipFavEl = document.getElementById("tipFavoriteSpeedKey");
        if (tipFavEl) tipFavEl.textContent = displayFavKey;
        const descFavEl = document.getElementById("favoriteSpeedKeyDesc");
        if (descFavEl) descFavEl.textContent = displayFavKey;
        const descFavHoldEl = document.getElementById("favoriteSpeedHoldKeyDesc");
        if (descFavHoldEl) descFavHoldEl.textContent = displayFavKey;
        const displayHideKey = formatActionKeysForDesc("toggleVisibility", currentLayout);
        const tipHideEl = document.getElementById("tipHideKey");
        if (tipHideEl) tipHideEl.textContent = displayHideKey;
        const descHideEl = document.getElementById("startHiddenKeyDesc");
        if (descHideEl) descHideEl.textContent = displayHideKey;
        const descAutoRestoreHideEl = document.getElementById("autoRestoreHideKeyDesc");
        if (descAutoRestoreHideEl) descAutoRestoreHideEl.textContent = displayHideKey;
        const displayPbarKey = formatActionKeysForDesc("toggleVideoControls", currentLayout);
        const tipPbarEl = document.getElementById("tipProgressBarKey");
        if (tipPbarEl) tipPbarEl.textContent = displayPbarKey;
        const displayDeactivateKey = formatActionKeysForDesc("toggleDeactivate", currentLayout);
        const tipDeactivateEl = document.getElementById("tipDeactivateKey");
        if (tipDeactivateEl) tipDeactivateEl.textContent = displayDeactivateKey;
        const descDeactivateEl = document.getElementById("deactivateKeyDesc");
        if (descDeactivateEl) descDeactivateEl.textContent = displayDeactivateKey;
        const descAutoReactivateEl = document.getElementById("autoReactivateKeyDesc");
        if (descAutoReactivateEl) descAutoReactivateEl.textContent = displayDeactivateKey;
        const descAutoReactivateEl2 = document.getElementById("autoReactivateKeyDesc2");
        if (descAutoReactivateEl2) descAutoReactivateEl2.textContent = displayDeactivateKey;
        const descHoldReactivateEl = document.getElementById("holdReactivateKeyDesc");
        if (descHoldReactivateEl) descHoldReactivateEl.textContent = displayDeactivateKey;
        const descHoldReactivateEl2 = document.getElementById("holdReactivateKeyDesc2");
        if (descHoldReactivateEl2) descHoldReactivateEl2.textContent = displayDeactivateKey;
        const displayFrameBwdKey = formatActionKeysForDesc("frameBackward", currentLayout);
        const tipFrameBwdEl = document.getElementById("tipFrameBackwardKey");
        if (tipFrameBwdEl) tipFrameBwdEl.textContent = displayFrameBwdKey;
        const displayFrameFwdKey = formatActionKeysForDesc("frameForward", currentLayout);
        const tipFrameFwdEl = document.getElementById("tipFrameForwardKey");
        if (tipFrameFwdEl) tipFrameFwdEl.textContent = displayFrameFwdKey;
        const shortFwdEl = document.getElementById("shortSkipFwdKeyDesc");
        if (shortFwdEl) shortFwdEl.textContent = formatActionKeysForDesc("shortSkipForward", currentLayout);
        const shortBwdEl = document.getElementById("shortSkipBwdKeyDesc");
        if (shortBwdEl) shortBwdEl.textContent = formatActionKeysForDesc("shortSkipBackward", currentLayout);
        const longFwdEl = document.getElementById("longSkipFwdKeyDesc");
        if (longFwdEl) longFwdEl.textContent = formatActionKeysForDesc("longSkipForward", currentLayout);
        const longBwdEl = document.getElementById("longSkipBwdKeyDesc");
        if (longBwdEl) longBwdEl.textContent = formatActionKeysForDesc("longSkipBackward", currentLayout);
    }
    function renderShortcuts() {
        if (!shortcutsGrid) return;
        shortcutsGrid.innerHTML = "";
        const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
        ACTIONS.forEach(act => {
            const keys = getKeysForAction(act.id, currentShortcuts);
            const isNone = keys.length === 0;
            const controlMeta = ACTION_TO_CONTROL_MAP[act.id];
            const isControlDisabled = controlMeta && !activeControls.includes(controlMeta.control);
            let playKeyLabel = "Space";
            if (keys.length > 0) {
                playKeyLabel = keys.map(k => formatKeyCode(k, currentLayout)).join(" / ");
            }
            const actDesc = act.id === "togglePlay" ? `Toggle video playback or hold ${playKeyLabel} for speed boost` : act.desc;
            const row = document.createElement("div");
            row.className = `shortcut-row${isControlDisabled ? " control-disabled" : ""}`;
            const badgesHtml = isNone ? `<div class="key-badge-item is-empty"><span class="key-badge empty">None</span></div>` : keys.map(k => `\n            <div class="key-badge-item" data-code="${k}" data-id="${act.id}">\n              <span class="key-badge">${formatKeyCode(k, currentLayout)}</span>\n              <button type="button" class="remove-key-btn" data-id="${act.id}" data-code="${k}" title="Remove ${formatKeyCode(k, currentLayout)}" aria-label="Remove key"><svg viewBox="0 0 12 12" width="8" height="8" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="2.5" y1="2.5" x2="9.5" y2="9.5"></line><line x1="9.5" y1="2.5" x2="2.5" y2="9.5"></line></svg></button>\n            </div>\n          `).join("");
            row.innerHTML = `\n        <div class="action-info">\n          <div class="action-title-wrap">\n            <span class="action-title">${act.title}</span>\n            ${isControlDisabled ? `<span class="control-disabled-badge" title="This control is currently disabled in Video Controls">Disabled in Video Controls</span>` : ""}\n          </div>\n          <span class="action-desc">${actDesc}</span>\n        </div>\n        <div class="key-badge-wrap">\n          <div class="key-badges-list">\n            ${badgesHtml}\n          </div>\n          <button type="button" class="add-key-btn change-key-btn" data-id="${act.id}">Add Key</button>\n        </div>\n      `;
            shortcutsGrid.appendChild(row);
        });
        updateDynamicTips();
    }
    if (keyboardLayoutSelect) {
        keyboardLayoutSelect.addEventListener("change", e => {
            const val = e.target.value;
            currentLayout = val;
            if (LAYOUT_PRESETS[val]) {
                currentShortcuts = Object.assign({}, LAYOUT_PRESETS[val]);
            }
            renderShortcuts();
            triggerAutoSave(`Switched to ${val.toUpperCase()} layout!`);
        });
    }
    if (autoDetectBtn) {
        autoDetectBtn.addEventListener("click", async () => {
            autoDetectBtn.textContent = "Detecting...";
            const detected = await detectLayout();
            currentLayout = detected;
            if (keyboardLayoutSelect) {
                keyboardLayoutSelect.value = detected;
            }
            if (LAYOUT_PRESETS[detected]) {
                currentShortcuts = Object.assign({}, LAYOUT_PRESETS[detected]);
            }
            renderShortcuts();
            autoDetectBtn.textContent = "Auto-Detect Layout";
            triggerAutoSave(`Detected ${detected.toUpperCase()} keyboard layout!`);
        });
    }
    if (shortcutsGrid) {
        shortcutsGrid.addEventListener("click", e => {
            const removeBtn = e.target.closest(".remove-key-btn");
            if (removeBtn) {
                e.stopPropagation();
                e.preventDefault();
                const actionId = removeBtn.dataset.id;
                const codeToRemove = removeBtn.dataset.code;
                if (!actionId || !codeToRemove) return;
                const currentKeys = getKeysForAction(actionId, currentShortcuts);
                const updatedKeys = currentKeys.filter(k => k !== codeToRemove);
                currentShortcuts[actionId] = updatedKeys;
                renderShortcuts();
                const act2 = ACTIONS.find(a => a.id === actionId);
                const displayLabel = formatKeyCode(codeToRemove, currentLayout);
                triggerAutoSave(act2 ? `Removed ${displayLabel} from ${act2.title}` : "Shortcut key removed");
                return;
            }
            const btn = e.target.closest(".add-key-btn") || e.target.closest(".change-key-btn");
            if (!btn) return;
            recordingActionId = btn.dataset.id;
            const act = ACTIONS.find(a => a.id === recordingActionId);
            if (!act) return;
            if (modalTitle) modalTitle.textContent = `Add Key for: ${act.title}`;
            if (modalDesc) modalDesc.textContent = "Press any key on your keyboard to assign, Backspace or Delete to Clear, or Esc to cancel. Please do not use preset shortcuts";
            if (keyPreview) {
                keyPreview.textContent = "Listening...";
                keyPreview.classList.remove("conflict");
            }
            if (keyPreviewHint) keyPreviewHint.textContent = "";
            if (recordingModal) recordingModal.classList.add("active");
            window.addEventListener("keydown", onKeyDownCapture, true);
        });
    }
    function chooseNoneKey() {
        if (!recordingActionId) return;
        const targetActionId = recordingActionId;
        recordingActionId = null;
        const act = ACTIONS.find(a => a.id === targetActionId);
        currentShortcuts[targetActionId] = [];
        if (keyPreview) keyPreview.textContent = "CLEARED";
        if (keyPreviewHint) keyPreviewHint.textContent = "All keys cleared";
        setTimeout(() => {
            closeModal();
            renderShortcuts();
            triggerAutoSave(act ? `${act.title} cleared` : "Shortcut cleared");
        }, 200);
    }
    function onKeyDownCapture(e) {
        if (!e.isTrusted) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.code === "Escape") {
            closeModal();
            return;
        }
        if (e.code === "Backspace" || e.code === "Delete") {
            chooseNoneKey();
            return;
        }
        if (RESERVED_CODES.includes(e.code)) {
            if (keyPreview) {
                keyPreview.classList.remove("conflict");
                void keyPreview.offsetWidth;
                keyPreview.classList.add("conflict");
                keyPreview.textContent = "Key not allowed";
            }
            if (keyPreviewHint) keyPreviewHint.textContent = "Reserved browser/system key";
            return;
        }
        const newCode = e.code;
        const targetActionId = recordingActionId;
        if (!targetActionId) return;
        if (e.code === "KeyQ" && (e.key === "a" || e.key === "A")) {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "KeyW" && (e.key === "z" || e.key === "Z")) {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "KeyA" && (e.key === "q" || e.key === "Q")) {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "KeyZ" && (e.key === "w" || e.key === "W")) {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "Semicolon" && (e.key === "m" || e.key === "M")) {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "KeyM" && e.key === ",") {
            currentLayout = "azerty";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "azerty";
        } else if (e.code === "KeyY" && (e.key === "z" || e.key === "Z")) {
            currentLayout = "qwertz";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "qwertz";
        } else if (e.code === "KeyZ" && (e.key === "y" || e.key === "Y")) {
            currentLayout = "qwertz";
            if (keyboardLayoutSelect) keyboardLayoutSelect.value = "qwertz";
        }
        const displayLabel = formatKeyCode(newCode, currentLayout);
        if (keyPreviewHint) {
            if (displayLabel !== newCode) {
                keyPreviewHint.textContent = `Physical Key: ${newCode} (${currentLayout.toUpperCase()}: ${displayLabel})`;
            } else {
                keyPreviewHint.textContent = `Key Code: ${newCode}`;
            }
        }
        const currentKeys = getKeysForAction(targetActionId, currentShortcuts);
        if (currentKeys.includes(newCode)) {
            if (keyPreview) {
                keyPreview.classList.remove("conflict");
                void keyPreview.offsetWidth;
                keyPreview.classList.add("conflict");
                keyPreview.textContent = `${displayLabel} (ALREADY ADDED)`;
            }
            if (keyPreviewHint) {
                keyPreviewHint.textContent = "This key is already assigned to this action";
            }
            showToast("Key already assigned to this action!");
            return;
        }
        const conflictAction = ACTIONS.find(a => {
            if (a.id === targetActionId) return false;
            const otherKeys = getKeysForAction(a.id, currentShortcuts);
            return otherKeys.includes(newCode);
        });
        if (conflictAction) {
            if (keyPreview) {
                keyPreview.classList.remove("conflict");
                void keyPreview.offsetWidth;
                keyPreview.classList.add("conflict");
                keyPreview.textContent = `${displayLabel} (IN USE)`;
            }
            if (keyPreviewHint) {
                keyPreviewHint.textContent = `Already assigned to: ${conflictAction.title}`;
            }
            showToast(`Key already assigned to ${conflictAction.title}!`);
            return;
        }
        recordingActionId = null;
        if (keyPreview) {
            keyPreview.classList.remove("conflict");
            keyPreview.textContent = displayLabel;
        }
        if (keyPreviewHint) {
            if (displayLabel !== newCode) {
                keyPreviewHint.textContent = `Physical Key: ${newCode} (${currentLayout.toUpperCase()}: ${displayLabel})`;
            } else {
                keyPreviewHint.textContent = `Key Code: ${newCode}`;
            }
        }
        currentShortcuts[targetActionId] = [ ...currentKeys, newCode ];
        setTimeout(() => {
            closeModal();
            renderShortcuts();
            triggerAutoSave();
        }, 200);
    }
    function closeModal() {
        if (recordingModal) recordingModal.classList.remove("active");
        if (keyPreview) keyPreview.classList.remove("conflict");
        window.removeEventListener("keydown", onKeyDownCapture, true);
        recordingActionId = null;
    }
    if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeModal);
    if (clearModalKeyBtn) {
        clearModalKeyBtn.addEventListener("click", e => {
            e.stopPropagation();
            chooseNoneKey();
        });
    }
    if (resetShortcutsBtn) {
        resetShortcutsBtn.addEventListener("click", () => {
            if (confirm("Reset shortcuts to active layout preset?")) {
                const preset = LAYOUT_PRESETS[currentLayout] || LAYOUT_PRESETS.qwerty;
                currentShortcuts = JSON.parse(JSON.stringify(preset));
                renderShortcuts();
                triggerAutoSave(`Reset to ${currentLayout.toUpperCase()} shortcuts`);
            }
        });
    }
    if (clearAllShortcutsBtn) {
        clearAllShortcutsBtn.addEventListener("click", () => {
            if (confirm("Clear all keyboard shortcuts?")) {
                ACTIONS.forEach(a => {
                    currentShortcuts[a.id] = [];
                });
                renderShortcuts();
                triggerAutoSave("All shortcuts cleared");
            }
        });
    }
    function setupPreviewVideo() {
        if (!previewVideo) return;
        const resolved = document.documentElement.getAttribute("data-theme") || "dark";
        const target = resolved === "light" ? "demo-light.webm" : "demo.webm";
        const currentSrc = previewVideo.getAttribute("src") || previewVideo.currentSrc || "";
        if (!currentSrc || !currentSrc.endsWith(target)) {
            previewVideo.src = target;
        }
        previewVideo.play().catch(() => {});
        function updateTime() {
            if (!previewVideo) return;
            const cur = previewVideo.currentTime || 0;
            const sec = Math.floor(cur % 60);
            const min = Math.floor(cur / 60);
            if (previewTime) {
                previewTime.textContent = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
            }
        }
        previewVideo.addEventListener("timeupdate", updateTime);
        previewVideo.addEventListener("play", () => {
            if (previewPlayBtn) previewPlayBtn.textContent = "Pause";
        });
        previewVideo.addEventListener("pause", () => {
            if (previewPlayBtn) previewPlayBtn.textContent = "Play";
        });
        if (previewPlayBtn) {
            previewPlayBtn.addEventListener("click", () => {
                if (!previewVideo) return;
                if (previewVideo.paused) {
                    previewVideo.play().catch(() => {});
                } else {
                    previewVideo.pause();
                }
            });
        }
    }
    const copyCryptoButtons = document.querySelectorAll(".copy-crypto-btn");
    copyCryptoButtons.forEach(btn => {
        btn.addEventListener("click", async e => {
            e.stopPropagation();
            const address = btn.dataset.address;
            const coin = btn.dataset.coin || "Address";
            if (!address) return;
            try {
                await navigator.clipboard.writeText(address);
                const originalText = btn.innerHTML;
                btn.innerHTML = `<svg viewBox="0 0 24 24" class="copy-svg"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg> Copied! Thank you so much!`;
                btn.classList.add("copied");
                showToast(`Copied ${coin} address to clipboard!`);
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove("copied");
                }, 2e3);
            } catch (err) {
                showToast("Failed to copy to clipboard");
            }
        });
    });
    const cryptoAddresses = document.querySelectorAll(".crypto-address");
    cryptoAddresses.forEach(addrEl => {
        addrEl.addEventListener("click", () => {
            const row = addrEl.closest(".crypto-row");
            if (row) {
                const copyBtn = row.querySelector(".copy-crypto-btn");
                if (copyBtn) copyBtn.click();
            }
        });
    });
    const cryptoCollapseToggle = document.getElementById("cryptoCollapseToggle");
    const cryptoCollapsibleWrapper = document.getElementById("cryptoCollapsibleWrapper");
    const cryptoListContainer = document.getElementById("cryptoListContainer");
    const cryptoToggleStatus = document.getElementById("cryptoToggleStatus");
    if (cryptoCollapseToggle && cryptoCollapsibleWrapper && cryptoListContainer) {
        cryptoCollapseToggle.addEventListener("click", () => {
            const isExpanded = cryptoCollapsibleWrapper.classList.toggle("expanded");
            cryptoCollapseToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
            cryptoListContainer.setAttribute("aria-hidden", isExpanded ? "false" : "true");
            if (cryptoToggleStatus) {
                cryptoToggleStatus.textContent = isExpanded ? "Hide" : "Show";
            }
            if (isExpanded) {
                cryptoListContainer.style.maxHeight = Math.max(cryptoListContainer.scrollHeight + 50, 600) + "px";
                cryptoListContainer.style.opacity = "1";
            } else {
                cryptoListContainer.style.maxHeight = "0px";
                cryptoListContainer.style.opacity = "0";
            }
        });
    }
    const customizationsCollapseToggle = document.getElementById("customizationsCollapseToggle");
    const websiteCustomizationsSection = document.getElementById("websiteCustomizationsSection");
    const customizationsCollapseBody = document.getElementById("customizationsCollapseBody");
    const customizationsToggleStatus = document.getElementById("customizationsToggleStatus");
    if (customizationsCollapseToggle && websiteCustomizationsSection && customizationsCollapseBody) {
        customizationsCollapseToggle.addEventListener("click", () => {
            const isExpanded = websiteCustomizationsSection.classList.toggle("expanded");
            customizationsCollapseToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
            customizationsCollapseBody.setAttribute("aria-hidden", isExpanded ? "false" : "true");
            if (customizationsToggleStatus) {
                customizationsToggleStatus.textContent = isExpanded ? "Hide" : "Show";
            }
        });
    }
    const patreonsCollapseToggle = document.getElementById("patreonsCollapseToggle");
    const patreonsSection = document.getElementById("patreonsSection");
    const patreonsCollapseBody = document.getElementById("patreonsCollapseBody");
    const patreonsToggleStatus = document.getElementById("patreonsToggleStatus");
    if (patreonsCollapseToggle && patreonsSection && patreonsCollapseBody) {
        patreonsCollapseToggle.addEventListener("click", () => {
            const isExpanded = patreonsSection.classList.toggle("expanded");
            patreonsCollapseToggle.setAttribute("aria-expanded", isExpanded ? "true" : "false");
            patreonsCollapseBody.setAttribute("aria-hidden", isExpanded ? "false" : "true");
            if (patreonsToggleStatus) {
                patreonsToggleStatus.textContent = isExpanded ? "Hide" : "Show";
            }
        });
    }
    const isFirefoxEnv = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL && chrome.runtime.getURL("").startsWith("moz-extension://") || navigator.userAgent && navigator.userAgent.toLowerCase().includes("firefox");
    const STORE_REVIEW_URL = isFirefoxEnv ? "https://addons.mozilla.org/en-US/firefox/addon/universal-video-controller-ff/" : "https://chromewebstore.google.com/detail/universal-video-controlle/dmepibiilnbbpgchbjdfegbibklhmgdi";
    const STORE_NAME = isFirefoxEnv ? "Firefox Add-ons" : "Chrome Web Store";
    const storeReviewLinks = document.querySelectorAll('a[href*="chromewebstore.google.com"], a[href*="addons.mozilla.org"]');
    storeReviewLinks.forEach(link => {
        link.href = STORE_REVIEW_URL;
        if (link.title && link.title.includes("Chrome Web Store")) {
            link.title = `Rate us 5 stars on ${STORE_NAME}`;
        }
    });
    const topRateBanner = document.querySelector(".top-rate-banner");
    if (topRateBanner) {
        if (topRateBanner.title && topRateBanner.title.includes("Chrome Web Store")) {
            topRateBanner.title = `Rate us 5 stars on ${STORE_NAME}`;
        }
        topRateBanner.addEventListener("click", e => {
            if (e.target.closest("a")) {
                return;
            }
            window.open(STORE_REVIEW_URL, "_blank", "noopener,noreferrer");
        });
    }
    const tipModal = document.getElementById("tipModal");
    const closeTipModalBtn = document.getElementById("closeTipModalBtn");
    const allTipOpenButtons = document.querySelectorAll("#openTipModalBtn, #openTipModalBottomBtn, #footerOpenTipModalBtn, .header-coffee-link, .footer-tip-btn");
    function openTipModal() {
        if (!tipModal) return;
        tipModal.classList.add("active");
        document.body.style.overflow = "hidden";
        if (document.documentElement) {
            document.documentElement.classList.add("gvc-support-active");
        }
        const previewVideo2 = document.getElementById("previewVideo");
        if (previewVideo2 && !previewVideo2.paused) {
            try {
                previewVideo2.pause();
            } catch (e) {}
        }
        if (typeof window.__gvcSetSupportActive === "function") {
            window.__gvcSetSupportActive(true, 12e4);
        }
        try {
            window.dispatchEvent(new CustomEvent("gvc-support-modal-state", {
                detail: {
                    open: true,
                    duration: 12e4
                }
            }));
        } catch (e) {}
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
            try {
                chrome.runtime.sendMessage({
                    type: "supportModalState",
                    open: true,
                    duration: 12e4
                });
            } catch (e) {}
        }
        if (window.location.hash !== "#tip" && window.location.hash !== "#coffeeSection") {
            try {
                history.replaceState(null, document.title, window.location.pathname + window.location.search + "#tip");
            } catch (e) {}
        }
    }
    function closeTipModal() {
        if (!tipModal) return;
        tipModal.classList.remove("active");
        document.body.style.overflow = "";
        if (document.documentElement) {
            document.documentElement.classList.remove("gvc-support-active");
        }
        if (typeof window.__gvcSetSupportActive === "function") {
            window.__gvcSetSupportActive(false);
        }
        try {
            window.dispatchEvent(new CustomEvent("gvc-support-modal-state", {
                detail: {
                    open: false
                }
            }));
        } catch (e) {}
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage) {
            try {
                chrome.runtime.sendMessage({
                    type: "supportModalState",
                    open: false
                });
            } catch (e) {}
        }
        if (window.location.hash === "#tip" || window.location.hash === "#coffeeSection") {
            try {
                history.replaceState(null, document.title, window.location.pathname + window.location.search);
            } catch (e) {}
        }
    }
    allTipOpenButtons.forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            openTipModal();
        });
    });
    if (closeTipModalBtn) {
        closeTipModalBtn.addEventListener("click", () => {
            closeTipModal();
        });
    }
    if (tipModal) {
        tipModal.addEventListener("click", e => {
            if (e.target === tipModal) {
                closeTipModal();
            }
        });
    }
    window.addEventListener("keydown", e => {
        if (e.key === "Escape" && tipModal && tipModal.classList.contains("active")) {
            closeTipModal();
        }
    });
    if (window.location.hash === "#tip" || window.location.hash === "#coffeeSection") {
        openTipModal();
    }
    window.addEventListener("hashchange", () => {
        if (window.location.hash === "#tip" || window.location.hash === "#coffeeSection") {
            openTipModal();
        }
    });
    window.addEventListener("focus", () => {
        if (window.location.hash === "#tip" || window.location.hash === "#coffeeSection") {
            openTipModal();
        }
    });
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (!message) return;
            if (message.type === "openTipModal") {
                openTipModal();
                if (typeof sendResponse === "function") {
                    sendResponse({
                        status: "ok"
                    });
                }
            }
        });
    }
    let tabWasHidden = false;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            tabWasHidden = true;
        } else if (document.visibilityState === "visible" && tabWasHidden) {
            window.location.reload();
        }
    });
    function resolveTheme(mode) {
        if (mode === "light") return "light";
        if (mode === "dark") return "dark";
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    function updatePreviewVideoTheme(resolvedTheme) {
        if (!previewVideo) return;
        const targetName = resolvedTheme === "light" ? "demo-light.webm" : "demo.webm";
        const currentSrc = previewVideo.currentSrc || previewVideo.src || "";
        if (!currentSrc.endsWith(targetName)) {
            const wasPlaying = !previewVideo.paused && !previewVideo.ended;
            const curTime = previewVideo.currentTime || 0;
            previewVideo.src = targetName;
            if (curTime > 0) {
                previewVideo.addEventListener("loadedmetadata", () => {
                    try {
                        previewVideo.currentTime = curTime;
                    } catch (e) {}
                }, {
                    once: true
                });
            }
            if (wasPlaying) {
                previewVideo.play().catch(() => {});
            }
        }
    }
    function applyUITheme(mode) {
        const effectiveMode = mode || "auto";
        const resolved = resolveTheme(effectiveMode);
        document.documentElement.setAttribute("data-theme", resolved);
        if (uiThemeSelect && uiThemeSelect.value !== effectiveMode) {
            uiThemeSelect.value = effectiveMode;
        }
        applyActiveTheme(currentTheme);
        updatePreviewVideoTheme(resolved);
    }
    if (uiThemeSelect) {
        uiThemeSelect.addEventListener("change", async () => {
            const chosen = uiThemeSelect.value;
            applyUITheme(chosen);
            currentConfig.uiTheme = chosen;
            try {
                if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                    await chrome.storage.sync.set({
                        config: currentConfig
                    });
                }
            } catch (e) {}
        });
    }
    if (headerThemeToggleBtn) {
        headerThemeToggleBtn.addEventListener("click", async () => {
            const currentResolved = document.documentElement.getAttribute("data-theme") || "dark";
            const nextTheme = currentResolved === "dark" ? "light" : "dark";
            applyUITheme(nextTheme);
            currentConfig.uiTheme = nextTheme;
            if (uiThemeSelect) uiThemeSelect.value = nextTheme;
            try {
                if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                    await chrome.storage.sync.set({
                        config: currentConfig
                    });
                }
            } catch (e) {}
            showToast(`Switched to ${nextTheme === "light" ? "Light" : "Dark"} theme`);
        });
    }
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
            if (!currentConfig.uiTheme || currentConfig.uiTheme === "auto") {
                applyUITheme("auto");
            }
        });
    }
    try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
            chrome.storage.onChanged.addListener((changes, area) => {
                if (area === "sync" && changes.config && changes.config.newValue) {
                    if (changes.config.newValue.uiTheme !== void 0) {
                        currentConfig.uiTheme = changes.config.newValue.uiTheme;
                        applyUITheme(changes.config.newValue.uiTheme);
                    }
                }
            });
        }
    } catch (e) {}
    const headerIssuesWrap = document.getElementById("headerIssuesWrap");
    const headerIssuesBtn = document.getElementById("headerIssuesBtn");
    const headerIssuesDropdown = document.getElementById("headerIssuesDropdown");
    const closeIssuesBtn = document.getElementById("closeIssuesBtn");
    const copyIssuesEmailBtn = document.getElementById("copyIssuesEmailBtn");
    const copyIssuesBtnText = document.getElementById("copyIssuesBtnText");
    const issuesEmailLink = document.getElementById("issuesEmailLink");
    function openIssuesDropdown() {
        if (!headerIssuesWrap) return;
        headerIssuesWrap.classList.add("is-open");
        if (headerIssuesBtn) headerIssuesBtn.setAttribute("aria-expanded", "true");
    }
    function closeIssuesDropdown() {
        if (!headerIssuesWrap) return;
        headerIssuesWrap.classList.remove("is-open");
        if (headerIssuesBtn) headerIssuesBtn.setAttribute("aria-expanded", "false");
    }
    function toggleIssuesDropdown() {
        if (!headerIssuesWrap) return;
        if (headerIssuesWrap.classList.contains("is-open")) {
            closeIssuesDropdown();
        } else {
            openIssuesDropdown();
        }
    }
    if (headerIssuesBtn) {
        headerIssuesBtn.addEventListener("click", e => {
            e.stopPropagation();
            toggleIssuesDropdown();
        });
    }
    if (headerIssuesDropdown) {
        headerIssuesDropdown.addEventListener("click", e => {
            e.stopPropagation();
        });
    }
    if (closeIssuesBtn) {
        closeIssuesBtn.addEventListener("click", e => {
            e.stopPropagation();
            closeIssuesDropdown();
        });
    }
    async function copyIssuesEmail() {
        const email = "UniversalVideoController@gmail.com";
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const temp = document.createElement("textarea");
                temp.value = email;
                temp.style.position = "fixed";
                temp.style.opacity = "0";
                document.body.appendChild(temp);
                temp.select();
                document.execCommand("copy");
                document.body.removeChild(temp);
            }
            if (copyIssuesBtnText) copyIssuesBtnText.textContent = "Copied!";
            if (copyIssuesEmailBtn) copyIssuesEmailBtn.classList.add("copied");
            showToast("Email copied to clipboard!");
            setTimeout(() => {
                if (copyIssuesBtnText) copyIssuesBtnText.textContent = "Copy";
                if (copyIssuesEmailBtn) copyIssuesEmailBtn.classList.remove("copied");
            }, 2e3);
        } catch (err) {
            showToast("UniversalVideoController@gmail.com");
        }
    }
    if (copyIssuesEmailBtn) {
        copyIssuesEmailBtn.addEventListener("click", e => {
            e.stopPropagation();
            copyIssuesEmail();
        });
    }
    if (issuesEmailLink) {
        issuesEmailLink.addEventListener("click", e => {
            copyIssuesEmail();
        });
    }
    document.addEventListener("click", e => {
        if (headerIssuesWrap && headerIssuesWrap.classList.contains("is-open")) {
            if (!headerIssuesWrap.contains(e.target)) {
                closeIssuesDropdown();
            }
        }
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && headerIssuesWrap && headerIssuesWrap.classList.contains("is-open")) {
            closeIssuesDropdown();
        }
    });
});