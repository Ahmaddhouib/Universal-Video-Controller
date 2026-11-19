const DEFAULT_CONFIG = {
    speedJump: .25,
    volumeJump: .1,
    favoriteSpeed: 1.5,
    holdFavoriteSpeedEnabled: true,
    superSpeed: 2.5,
    holdSuperSpeedEnabled: true,
    holdSpaceSpeedEnabled: true,
    holdSpaceSpeed: 2,
    persistentSpeedBoostHUD: true,
    shortSkipDuration: 5,
    longSkipDuration: 10,
    theme: "cyberNeon",
    buttonBgColor: "#181926",
    activeColor: "#38bdf8",
    buttonsColor: "#cbd5e1",
    activeStateColor: "#a855f7",
    opacity: .9,
    overlaySize: 1,
    glowEnabled: true,
    showHotkeyHUD: true,
    autoMinimize: true,
    autoMinimizeTimeout: 2500,
    autoHideButtons: true,
    autoHideButtonsTimeout: 2500,
    defaultHidden: false,
    videoControls: [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ],
    controllerPosition: "topLeft",
    controlsTrigger: "hover",
    controlsFadeInDelay: .2,
    hideControlsDuration: 0,
    volumeBoostEnabled: false,
    backgroundPlay: true,
    excludedDomains: [],
    siteSpeeds: {},
    siteVolumes: {},
    defaultSpeed: 1,
    defaultVolume: 1,
    defaultVideoState: "doNothing",
    defaultAudioState: "doNothing",
    defaultMuted: false,
    siteMuteRules: {},
    defaultLoopState: "doNothing",
    siteLoopRules: {},
    sitePlayRules: {},
    segmentControl1To9: "force",
    scrollWheelAction: "doNothing",
    holdClickAction: "boost",
    deactivateHotkeyMode: "deactivateOnly",
    autoReactivateDelay: 0,
    holdToReactivateDelay: 0,
    siteControlsRules: [],
    hideCursorOnInactivity: true,
    hideCursorTimeout: 2.5,
    autoScrollShorts: false,
    autoScrollShortsPresets: {
        youtube: true,
        instagram: true,
        facebook: true
    },
    autoScrollShortsCustom: [],
    dismissedSettingsReloadTip: false,
    dismissedPopupReloadTip: false,
    uiTheme: "auto",
    keyboardLayout: "qwerty",
    keyboardShortcuts: {
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

chrome.runtime.onInstalled.addListener(async details => {
    try {
        const existing = await chrome.storage.sync.get("config");
        let initCfg = existing.config ? {
            ...existing.config
        } : {
            ...DEFAULT_CONFIG
        };
        if (!initCfg.layoutDetected) {
            const lang = (navigator.language || "").toLowerCase();
            if (lang.startsWith("fr")) {
                initCfg.keyboardLayout = "azerty";
                initCfg.keyboardShortcuts = Object.assign({}, LAYOUT_PRESETS.azerty);
            } else if (lang.startsWith("de")) {
                initCfg.keyboardLayout = "qwertz";
                initCfg.keyboardShortcuts = Object.assign({}, LAYOUT_PRESETS.qwertz);
            }
        }
        const merged = Object.assign({}, DEFAULT_CONFIG, initCfg);
        if (!Array.isArray(merged.videoControls) || merged.videoControls.length === 0) {
            merged.videoControls = [ ...DEFAULT_CONFIG.videoControls ];
        } else {
            if (!merged.videoControls.includes("progressBar")) {
                const pipIdx = merged.videoControls.indexOf("pip");
                if (pipIdx !== -1) {
                    merged.videoControls.splice(pipIdx + 1, 0, "progressBar");
                } else {
                    merged.videoControls.push("progressBar");
                }
            }
            const settingsIdx = merged.videoControls.indexOf("settings");
            const hideIdx = merged.videoControls.indexOf("hide");
            if (settingsIdx !== -1 && hideIdx !== -1 && settingsIdx < hideIdx) {
                merged.videoControls.splice(settingsIdx, 1);
                merged.videoControls.push("settings");
            }
        }
        if (merged.controllerPosition !== "topLeft" && merged.controllerPosition !== "topRight") {
            merged.controllerPosition = DEFAULT_CONFIG.controllerPosition;
        }
        if (merged.controlsTrigger !== "hover" && merged.controlsTrigger !== "click") {
            merged.controlsTrigger = DEFAULT_CONFIG.controlsTrigger;
        }
        if (typeof merged.controlsFadeInDelay !== "number" || isNaN(merged.controlsFadeInDelay)) {
            merged.controlsFadeInDelay = DEFAULT_CONFIG.controlsFadeInDelay;
        }
        if (typeof merged.hideControlsDuration !== "number" || isNaN(merged.hideControlsDuration)) {
            merged.hideControlsDuration = DEFAULT_CONFIG.hideControlsDuration;
        } else {
            merged.hideControlsDuration = Math.max(0, Math.min(60, merged.hideControlsDuration));
        }
        if (typeof merged.hideCursorOnInactivity !== "boolean") {
            merged.hideCursorOnInactivity = DEFAULT_CONFIG.hideCursorOnInactivity;
        }
        if (typeof merged.hideCursorTimeout !== "number" || isNaN(merged.hideCursorTimeout)) {
            merged.hideCursorTimeout = DEFAULT_CONFIG.hideCursorTimeout;
        }
        if (typeof merged.persistentSpeedBoostHUD !== "boolean") {
            merged.persistentSpeedBoostHUD = DEFAULT_CONFIG.persistentSpeedBoostHUD;
        }
        if (merged.segmentControl1To9 !== "force" && merged.segmentControl1To9 !== "doNothing") {
            merged.segmentControl1To9 = DEFAULT_CONFIG.segmentControl1To9;
        }
        if (![ "default", "boost", "favorite", "super" ].includes(merged.holdClickAction)) {
            merged.holdClickAction = DEFAULT_CONFIG.holdClickAction;
        }
        if (typeof merged.autoReactivateDelay !== "number" || isNaN(merged.autoReactivateDelay)) {
            merged.autoReactivateDelay = 0;
        } else {
            merged.autoReactivateDelay = Math.max(0, Math.min(60, merged.autoReactivateDelay));
        }
        if (typeof merged.holdToReactivateDelay !== "number" || isNaN(merged.holdToReactivateDelay)) {
            merged.holdToReactivateDelay = 0;
        } else {
            merged.holdToReactivateDelay = Math.max(0, Math.min(60, merged.holdToReactivateDelay));
        }
        if (typeof merged.showHotkeyHUD !== "boolean") {
            merged.showHotkeyHUD = DEFAULT_CONFIG.showHotkeyHUD;
        }
        if (typeof merged.defaultMuted !== "boolean") {
            merged.defaultMuted = merged.defaultAudioState === "mute";
        }
        if (Array.isArray(merged.siteControlsRules) && merged.siteControlsRules.length === 1 && merged.siteControlsRules[0] === "instagram.com") {
            merged.siteControlsRules = [];
        } else if (!Array.isArray(merged.siteControlsRules)) {
            merged.siteControlsRules = [];
        }
        delete merged.showPlusMinusButtons;
        delete merged.tooltipsEnabled;
        delete merged.loopUnderWidget;
        delete merged.loopOverlayEnabled;
        merged.keyboardShortcuts = Object.assign({}, DEFAULT_CONFIG.keyboardShortcuts, initCfg.keyboardShortcuts || {});
        if (!merged.keyboardShortcuts.forceFullscreen) {
            merged.keyboardShortcuts.forceFullscreen = "KeyF";
        }
        if (merged.glowEnabled === void 0) {
            merged.glowEnabled = true;
        }
        if (merged.deactivateHotkeyMode === void 0) {
            merged.deactivateHotkeyMode = "deactivateOnly";
        }
        if (merged.keyboardShortcuts.toggleDeactivate === void 0) {
            merged.keyboardShortcuts.toggleDeactivate = "KeyT";
        }
        if (merged.keyboardShortcuts.nextVideo === void 0) {
            merged.keyboardShortcuts.nextVideo = "KeyK";
        }
        if (merged.keyboardShortcuts.prevVideo === void 0) {
            merged.keyboardShortcuts.prevVideo = "KeyJ";
        }
        if (!merged.keyboardShortcuts.toggleVideoControls) {
            merged.keyboardShortcuts.toggleVideoControls = "KeyO";
        }
        await chrome.storage.sync.set({
            config: merged
        });
    } catch (err) {
        console.error("Failed to initialize Universal Video Controller settings:", err);
    }
});

const ICONS_ACTIVE = {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    64: "icons/icon64.png",
    128: "icons/icon128.png"
};

const ICONS_GRAY = {
    16: "icons/icon16_gray.png",
    32: "icons/icon32_gray.png",
    48: "icons/icon48_gray.png",
    64: "icons/icon64_gray.png",
    128: "icons/icon128_gray.png"
};

const tabVideoCounts = new Map;

function setTabVideoIcon(tabId, hasVideo) {
    const numericTabId = Number(tabId);
    if (!numericTabId || isNaN(numericTabId)) return;
    const actionApi = typeof chrome !== "undefined" && chrome.action ? chrome.action : typeof browser !== "undefined" && browser.action ? browser.action : null;
    if (!actionApi || typeof actionApi.setIcon !== "function") return;
    try {
        actionApi.setIcon({
            tabId: numericTabId,
            path: hasVideo ? ICONS_ACTIVE : ICONS_GRAY
        }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {}
        });
    } catch (e) {}
}

function updateTabVideoPresence(tabId, frameId, videoCount) {
    const numericTabId = Number(tabId);
    if (!numericTabId || isNaN(numericTabId)) return;
    let frameMap = tabVideoCounts.get(numericTabId);
    if (!frameMap) {
        frameMap = new Map;
        tabVideoCounts.set(numericTabId, frameMap);
    }
    frameMap.set(frameId !== void 0 ? frameId : 0, videoCount || 0);
    let totalVideos = 0;
    for (const count of frameMap.values()) {
        totalVideos += count;
    }
    setTabVideoIcon(numericTabId, totalVideos > 0);
}

if (typeof chrome !== "undefined" && chrome.tabs) {
    if (chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
            if (changeInfo.status === "loading") {
                tabVideoCounts.delete(tabId);
                setTabVideoIcon(tabId, false);
            }
        });
    }
    if (chrome.tabs.onActivated) {
        chrome.tabs.onActivated.addListener(({tabId: tabId}) => {
            const frameMap = tabVideoCounts.get(tabId);
            if (frameMap) {
                let totalVideos = 0;
                for (const count of frameMap.values()) totalVideos += count;
                setTabVideoIcon(tabId, totalVideos > 0);
            } else {
                try {
                    chrome.tabs.sendMessage(tabId, {
                        type: "queryVideoPresence"
                    }, res => {
                        if (chrome.runtime && chrome.runtime.lastError) return;
                        if (res && res.videoCount !== void 0) {
                            updateTabVideoPresence(tabId, 0, res.videoCount);
                        }
                    });
                } catch (e) {}
            }
        });
    }
    if (chrome.tabs.onRemoved) {
        chrome.tabs.onRemoved.addListener(tabId => {
            tabVideoCounts.delete(tabId);
        });
    }
}

try {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {
            if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: "queryVideoPresence"
                }, res => {
                    if (chrome.runtime && chrome.runtime.lastError) return;
                    if (res && res.videoCount !== void 0) {
                        updateTabVideoPresence(tabs[0].id, 0, res.videoCount);
                    }
                });
            }
        });
    }
} catch (e) {}

function openOrFocusPage(pageName, hash = "", messageToTab = null) {
    const baseUrl = chrome.runtime.getURL(`${pageName}.html`);
    const fullUrl = hash ? `${baseUrl}${hash}` : baseUrl;
    chrome.tabs.query({}, tabs => {
        const existing = tabs && tabs.find(t => t.url && t.url.startsWith(baseUrl));
        if (existing) {
            const updateInfo = {
                active: true
            };
            if (hash) {
                updateInfo.url = fullUrl;
            }
            chrome.tabs.update(existing.id, updateInfo, () => {
                if (existing.windowId) {
                    chrome.windows.update(existing.windowId, {
                        focused: true
                    });
                }
                if (messageToTab) {
                    chrome.tabs.sendMessage(existing.id, messageToTab, () => {
                        if (chrome.runtime.lastError) {}
                    });
                }
            });
        } else {
            chrome.tabs.create({
                url: fullUrl
            });
        }
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || !message.type) return;
    switch (message.type) {
      case "videoPresence":
        if (sender && sender.tab && sender.tab.id) {
            const count = message.videoCount !== void 0 ? Number(message.videoCount) : message.hasVideo ? 1 : 0;
            updateTabVideoPresence(sender.tab.id, sender.frameId, count);
        }
        sendResponse({
            status: "ok"
        });
        break;

      case "getTabVideoPresence":
        {
            const tabId = message.tabId;
            let totalVideos = 0;
            if (tabId && tabVideoCounts.has(Number(tabId))) {
                const frameMap = tabVideoCounts.get(Number(tabId));
                if (frameMap) {
                    for (const count of frameMap.values()) totalVideos += count;
                }
            }
            sendResponse({
                totalVideos: totalVideos
            });
            break;
        }

      case "openSettingsPage":
        openOrFocusPage("settings");
        sendResponse({
            status: "ok"
        });
        break;

      case "openTipPage":
        openOrFocusPage("settings", "#tip", {
            type: "openTipModal"
        });
        sendResponse({
            status: "ok"
        });
        break;

      case "openShortcutsPage":
        openOrFocusPage("settings");
        sendResponse({
            status: "ok"
        });
        break;

      case "getDefaultConfig":
        sendResponse({
            config: DEFAULT_CONFIG
        });
        break;

      case "supportModalState":
        chrome.tabs.query({}, tabs => {
            if (!tabs) return;
            tabs.forEach(t => {
                if (t && t.id) {
                    chrome.tabs.sendMessage(t.id, {
                        type: "supportModalState",
                        open: message.open,
                        duration: message.duration
                    }, () => {
                        if (chrome.runtime.lastError) {}
                    });
                }
            });
        });
        sendResponse({
            status: "ok"
        });
        break;

      default:
        break;
    }
    return true;
});