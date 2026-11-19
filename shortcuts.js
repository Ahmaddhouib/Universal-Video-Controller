document.addEventListener("DOMContentLoaded", async () => {
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
        desc: "Instantly return playback speed to 1.00x"
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
        desc: "Instantly mute or unmute video"
    }, {
        id: "toggleSuperSpeed",
        title: "Toggle Super Speed",
        desc: "Jump between 1.00x and turbo super speed"
    }, {
        id: "toggleFavoriteSpeed",
        title: "Toggle Favorite Speed",
        desc: "Jump between 1.00x and favorite speed"
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
        desc: "Fullscreen video with active extension controls"
    }, {
        id: "toggleVisibility",
        title: "Show / Hide Video Controls",
        desc: "Hide or show floating Video Controls on page"
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
    const keyboardLayoutSelect = document.getElementById("keyboardLayoutSelect");
    const autoDetectBtn = document.getElementById("autoDetectBtn");
    const shortcutsGrid = document.getElementById("shortcutsGrid");
    const recordingModal = document.getElementById("recordingModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalDesc = document.getElementById("modalDesc");
    const keyPreview = document.getElementById("keyPreview");
    const keyPreviewHint = document.getElementById("keyPreviewHint");
    const cancelModalBtn = document.getElementById("cancelModalBtn");
    const clearModalKeyBtn = document.getElementById("clearModalKeyBtn");
    const resetDefaultsBtn = document.getElementById("resetDefaultsBtn");
    const clearAllBtn = document.getElementById("clearAllBtn");
    const toast = document.getElementById("toast");
    let currentConfig = {};
    let currentShortcuts = {};
    let currentLayout = "qwerty";
    let recordingActionId = null;
    let hardwareLayoutMap = null;
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
    await loadShortcuts();
    async function loadShortcuts() {
        return new Promise(resolve => {
            chrome.storage.sync.get("config", res => {
                if (res && res.config) {
                    currentConfig = res.config;
                    currentLayout = res.config.keyboardLayout || "qwerty";
                    if (currentLayout === "custom" || !LAYOUT_PRESETS[currentLayout]) {
                        const sc = res.config.keyboardShortcuts || {};
                        if (sc.toggleMute === "Semicolon" || sc.speedDown === "KeyA" || (navigator.language || "").toLowerCase().startsWith("fr")) {
                            currentLayout = "azerty";
                        } else if (sc.longSkipBackward === "KeyY" || (navigator.language || "").toLowerCase().startsWith("de")) {
                            currentLayout = "qwertz";
                        } else {
                            currentLayout = "qwerty";
                        }
                    }
                    const defaultPreset = JSON.parse(JSON.stringify(LAYOUT_PRESETS[currentLayout] || LAYOUT_PRESETS.qwerty));
                    currentShortcuts = Object.assign({}, defaultPreset, res.config.keyboardShortcuts || {});
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
                    if (!res.config.shortcutsDefaultsUpdatedV2) {
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
                            res.config.shortcutsDefaultsUpdatedV2 = true;
                            res.config.keyboardShortcuts = currentShortcuts;
                            chrome.storage.sync.set({
                                config: res.config
                            }).catch(() => {});
                        }
                    }
                    if (!res.config.shortcutsDefaultsUpdatedV3) {
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
                        res.config.shortcutsDefaultsUpdatedV3 = true;
                        if (needsSave) {
                            res.config.keyboardShortcuts = currentShortcuts;
                            chrome.storage.sync.set({
                                config: res.config
                            }).catch(() => {});
                        }
                    }
                } else {
                    currentConfig = {};
                    currentLayout = "qwerty";
                    currentShortcuts = JSON.parse(JSON.stringify(LAYOUT_PRESETS.qwerty));
                }
                if (keyboardLayoutSelect) {
                    keyboardLayoutSelect.value = currentLayout;
                }
                renderShortcuts();
                resolve();
            });
        });
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
    function renderShortcuts() {
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
    }
    if (keyboardLayoutSelect) {
        keyboardLayoutSelect.addEventListener("change", async e => {
            const val = e.target.value;
            currentLayout = val;
            if (LAYOUT_PRESETS[val]) {
                currentShortcuts = Object.assign({}, LAYOUT_PRESETS[val]);
            }
            renderShortcuts();
            await saveShortcuts();
            showToast(`Switched to ${val.toUpperCase()} layout!`);
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
            await saveShortcuts();
            showToast(`Detected ${detected.toUpperCase()} keyboard layout!`);
        });
    }
    if (shortcutsGrid) {
        shortcutsGrid.addEventListener("click", async e => {
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
                currentLayout = "custom";
                if (keyboardLayoutSelect) keyboardLayoutSelect.value = "custom";
                renderShortcuts();
                await saveShortcuts();
                const act2 = ACTIONS.find(a => a.id === actionId);
                const displayLabel = formatKeyCode(codeToRemove, currentLayout);
                showToast(act2 ? `Removed ${displayLabel} from ${act2.title}` : "Shortcut key removed");
                return;
            }
            const btn = e.target.closest(".add-key-btn") || e.target.closest(".change-key-btn");
            if (!btn) return;
            recordingActionId = btn.dataset.id;
            const act = ACTIONS.find(a => a.id === recordingActionId);
            if (!act) return;
            if (modalTitle) modalTitle.textContent = `Add Key for: ${act.title}`;
            if (modalDesc) modalDesc.textContent = "Press any key on your keyboard to assign, Backspace or Delete to Clear, or Esc to cancel.";
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
        currentLayout = "custom";
        if (keyboardLayoutSelect) keyboardLayoutSelect.value = "custom";
        if (keyPreview) keyPreview.textContent = "CLEARED";
        if (keyPreviewHint) keyPreviewHint.textContent = "All keys cleared";
        setTimeout(async () => {
            closeModal();
            renderShortcuts();
            await saveShortcuts();
            if (act) {
                showToast(`${act.title} cleared`);
            }
        }, 200);
    }
    function onKeyDownCapture(e) {
        e.preventDefault();
        e.stopPropagation();
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
        currentLayout = "custom";
        if (keyboardLayoutSelect) keyboardLayoutSelect.value = "custom";
        setTimeout(async () => {
            closeModal();
            renderShortcuts();
            await saveShortcuts();
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
    async function saveShortcuts() {
        const updated = {
            ...currentConfig,
            keyboardLayout: currentLayout,
            keyboardShortcuts: currentShortcuts
        };
        await chrome.storage.sync.set({
            config: updated
        });
        currentConfig = updated;
    }
    if (resetDefaultsBtn) {
        resetDefaultsBtn.addEventListener("click", async () => {
            if (confirm("Reset all shortcuts to default layout?")) {
                const preset = LAYOUT_PRESETS[currentLayout] || LAYOUT_PRESETS.qwerty;
                currentShortcuts = JSON.parse(JSON.stringify(preset));
                renderShortcuts();
                await saveShortcuts();
                showToast(`Reset to ${currentLayout.toUpperCase()} shortcuts`);
            }
        });
    }
    if (clearAllBtn) {
        clearAllBtn.addEventListener("click", async () => {
            if (confirm("Clear all keyboard shortcuts?")) {
                ACTIONS.forEach(a => {
                    currentShortcuts[a.id] = [];
                });
                currentLayout = "custom";
                if (keyboardLayoutSelect) keyboardLayoutSelect.value = "custom";
                renderShortcuts();
                await saveShortcuts();
                showToast("All shortcuts cleared");
            }
        });
    }
    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        setTimeout(() => {
            if (toast) toast.classList.remove("show");
        }, 2500);
    }
    try {
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === "sync" && changes.config && changes.config.newValue) {
                if (changes.config.newValue.videoControls !== void 0) {
                    currentConfig.videoControls = changes.config.newValue.videoControls;
                    renderShortcuts();
                }
            }
        });
    } catch (e) {}
    let tabWasHidden = false;
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            tabWasHidden = true;
        } else if (document.visibilityState === "visible" && tabWasHidden) {
            window.location.reload();
        }
    });
});