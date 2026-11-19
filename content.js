(() => {
    if (window.__omniVideoControlLoaded) return;
    window.__omniVideoControlLoaded = true;
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
    const DEFAULT_SUBTITLE_STYLES = Object.freeze({});
    function normalizeSubtitleStyles(raw) {
        return raw || {};
    }
    function saveSubtitleStylesConfig() {}
    function broadcastSubtitleStyles() {}
    function updateNativeSubtitleVisibility() {}
    function hexToRgba(hex, alpha = 1) {
        if (!hex || typeof hex !== "string") return `rgba(255, 255, 255, ${alpha})`;
        let c = hex.replace("#", "").trim();
        if (c.length === 3) c = c.split("").map(x => x + x).join("");
        if (c.length !== 6) return `rgba(255, 255, 255, ${alpha})`;
        const num = parseInt(c, 16);
        if (isNaN(num)) return `rgba(255, 255, 255, ${alpha})`;
        const r = num >> 16 & 255;
        const g = num >> 8 & 255;
        const b = num & 255;
        const a = typeof alpha === "number" && !isNaN(alpha) ? Math.max(0, Math.min(1, alpha)) : 1;
        return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
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
        controlsBarPinned: false,
        defaultHidden: false,
        videoControls: [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ],
        controllerPosition: "topLeft",
        controlsTrigger: "hover",
        controlsFadeInDelay: .2,
        hideControlsDuration: 0,
        volumeBoostEnabled: false,
        backgroundPlay: true,
        holdSpaceSpeedEnabled: true,
        holdSpaceSpeed: 2,
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
    let currentConfig = Object.assign({}, DEFAULT_CONFIG);
    function syncBackgroundPlayState(enabled) {
        try {
            window.dispatchEvent(new CustomEvent("gvc-background-play-toggle", {
                detail: {
                    enabled: !!enabled
                }
            }));
        } catch (e) {}
    }
    let activeControllers = new Map;
    let isGloballyPaused = false;
    let autoReactivateTimer = null;
    let autoReactivateEndTime = 0;
    let selfWriteInProgress = false;
    let isGloballyHidden = false;
    let isControlsForcedGlobal = null;
    let isControlsBarPinnedGlobal = false;
    let hideRestoreTimer = null;
    let isSupportActive = false;
    let supportRestoreTimer = null;
    let activeHoveredCtrl = null;
    let lastHoveredCtrl = null;
    let pointerMoveRaf = null;
    let lastClientX = -1;
    let lastClientY = -1;
    function setSupportActive(active, maxDurationMs = 12e4) {
        if (supportRestoreTimer) {
            clearTimeout(supportRestoreTimer);
            supportRestoreTimer = null;
        }
        isSupportActive = !!active;
        if (isSupportActive) {
            if (document.documentElement) {
                document.documentElement.classList.add("gvc-support-active");
            }
            if (activeHoveredCtrl) {
                activeHoveredCtrl.setHovered(false);
                activeHoveredCtrl = null;
            }
            activeControllers.forEach(ctrl => {
                if (typeof ctrl.closeAllOverlays === "function") ctrl.closeAllOverlays();
                if (typeof ctrl.setSubControlsVisible === "function") ctrl.setSubControlsVisible(false);
                ctrl.updateVisibility();
            });
            const duration = typeof maxDurationMs === "number" && maxDurationMs > 0 ? maxDurationMs : 12e4;
            supportRestoreTimer = setTimeout(() => {
                supportRestoreTimer = null;
                if (isSupportActive) {
                    isSupportActive = false;
                    if (document.documentElement) {
                        document.documentElement.classList.remove("gvc-support-active");
                    }
                    activeControllers.forEach(ctrl => ctrl.updateVisibility());
                    reportVideoPresence();
                }
            }, duration);
        } else {
            if (document.documentElement) {
                document.documentElement.classList.remove("gvc-support-active");
            }
            activeControllers.forEach(ctrl => ctrl.updateVisibility());
            reportVideoPresence();
        }
    }
    try {
        window.__gvcSetSupportActive = setSupportActive;
        window.addEventListener("gvc-support-modal-state", e => {
            const detail = e && e.detail || {};
            setSupportActive(detail.open, detail.duration);
        });
    } catch (e) {}
    const HOLD_BOOST_THRESHOLD_MS = 650;
    const HOLD_CLICK_THRESHOLD_MS = 350;
    const FRAME_HOLD_INTERVAL_MS = 500;
    let superSpeedHoldState = null;
    let favoriteSpeedHoldState = null;
    let spaceHoldState = null;
    let clickHoldState = null;
    let reactivateKeyHoldState = null;
    let frameHoldState = null;
    let shouldSuppressNextClick = false;
    let shouldSuppressNextMouseUp = false;
    let suppressClickTimeout = null;
    let isGlobalPointerDown = false;
    let isGlobalKeyDown = false;
    let isGlobalKeyReverse = false;
    function isHoldReversed() {
        return isGlobalKeyReverse;
    }
    function isAnyHoldActive() {
        return !!(isGlobalPointerDown || isGlobalKeyDown || spaceHoldState && spaceHoldState.isHolding2x || superSpeedHoldState && superSpeedHoldState.isHolding || favoriteSpeedHoldState && favoriteSpeedHoldState.isHolding || clickHoldState && clickHoldState.isHolding || frameHoldState && frameHoldState.interval);
    }
    function isSpeedBoostHoldActive(ctrl) {
        if (spaceHoldState && spaceHoldState.isHolding2x) {
            if (!ctrl || spaceHoldState.controller === ctrl) return true;
        }
        if (superSpeedHoldState && superSpeedHoldState.isHolding) {
            if (!ctrl || superSpeedHoldState.controller === ctrl) return true;
        }
        if (favoriteSpeedHoldState && favoriteSpeedHoldState.isHolding) {
            if (!ctrl || favoriteSpeedHoldState.controller === ctrl) return true;
        }
        if (clickHoldState && clickHoldState.isHolding) {
            if (!ctrl || clickHoldState.controller === ctrl) return true;
        }
        return false;
    }
    function onHoldStateReleased() {
        if (typeof activeControllers === "undefined" || !activeControllers) return;
        for (const ctrl of activeControllers.values()) {
            ctrl._isHUDAtLimit = false;
            if (ctrl.hud && ctrl.hud.classList.contains("active")) {
                const svg = ctrl.hud.querySelector(".hud-icon svg");
                if (svg && svg.classList.contains("is-spinning")) {
                    svg.classList.remove("is-spinning", "reverse");
                    if (ctrl._hudAngle !== void 0) {
                        svg.style.transform = `rotate(${ctrl._hudAngle}deg)`;
                    }
                }
                if (!ctrl.hudTimer && !isSpeedBoostHoldActive(ctrl)) {
                    ctrl.hudTimer = setTimeout(() => {
                        if (ctrl.hud) ctrl.hud.classList.remove("active");
                        ctrl.hudTimer = null;
                    }, 1400);
                }
            }
        }
    }
    function ensureYouTubeSpeedmasterSuppressStyle() {
        if (isGloballyPaused || isDomainExcluded()) return;
        if (currentConfig.holdClickAction === "default") return;
        if (document.getElementById("omni-yt-speedmaster-suppress-style")) return;
        try {
            const style = document.createElement("style");
            style.id = "omni-yt-speedmaster-suppress-style";
            style.textContent = `\n        .ytp-speedmaster-overlay,\n        .ytp-speedmaster,\n        .ytp-speedmaster-user-edu {\n          display: none !important;\n          opacity: 0 !important;\n          visibility: hidden !important;\n          pointer-events: none !important;\n        }\n      `;
            (document.head || document.documentElement).appendChild(style);
        } catch (e) {}
    }
    function restoreYouTubeSpeedmaster() {
        try {
            const styles = document.querySelectorAll("#omni-yt-speedmaster-suppress-style");
            styles.forEach(s => s.remove());
            const overlays = document.querySelectorAll('[class*="ytp-speedmaster"]');
            for (const ov of overlays) {
                if (!ov.classList.contains("html5-video-player")) {
                    ov.style.removeProperty("display");
                    ov.style.removeProperty("opacity");
                    ov.style.removeProperty("visibility");
                    ov.style.removeProperty("pointer-events");
                }
            }
        } catch (_) {}
    }
    function dismissYouTubeSpeedmaster() {
        if (isGloballyPaused || isDomainExcluded()) return;
        if (currentConfig.holdClickAction === "default") return;
        try {
            ensureYouTubeSpeedmasterSuppressStyle();
            const overlays = document.querySelectorAll(".ytp-speedmaster-overlay, .ytp-speedmaster, .ytp-speedmaster-user-edu");
            for (const ov of overlays) {
                ov.style.setProperty("display", "none", "important");
                ov.style.setProperty("opacity", "0", "important");
                ov.style.setProperty("visibility", "hidden", "important");
            }
            const player = document.querySelector("#movie_player, .html5-video-player");
            if (player && typeof player.classList !== "undefined") {
                player.classList.remove("ytp-speedmaster-overlay-active");
            }
        } catch (_) {}
    }
    function startClickHold(e) {
        if (!e || e.button !== void 0 && e.button !== 0) return;
        if (isGloballyPaused || isDomainExcluded()) return;
        const action = currentConfig.holdClickAction;
        if (!action || action === "default") return;
        ensureYouTubeSpeedmasterSuppressStyle();
        if (typeof isInteractiveInputElement === "function" && isInteractiveInputElement(e)) return;
        if (e.target && typeof e.target.closest === "function") {
            if (e.target.closest('.omni-controls-container, .omni-speed-picker, .omni-ctx-menu, .omni-loop-container, .omni-sub-controls, button, input, select, textarea, a, [role="button"], [role="slider"], [role="menuitem"], [role="tab"], .ytp-chrome-bottom, .ytp-chrome-top, .ytp-progress-bar, .ytp-volume-panel, .vjs-control-bar')) {
                return;
            }
        }
        let targetCtrl = null;
        if (typeof findControllerUnderPointer === "function") {
            targetCtrl = findControllerUnderPointer(e.clientX, e.clientY);
        }
        if (!targetCtrl && e.target && typeof activeControllers !== "undefined") {
            for (const [video, ctrl] of activeControllers.entries()) {
                if (!video.isConnected) continue;
                if (e.target === video || typeof e.target.closest === "function" && e.target.closest("video") === video || ctrl.container && ctrl.container.contains(e.target)) {
                    targetCtrl = ctrl;
                    break;
                }
            }
        }
        if (!targetCtrl || !targetCtrl.video || !targetCtrl.video.isConnected) return;
        if (typeof targetCtrl.isPointOverController === "function" && targetCtrl.isPointOverController(e.clientX, e.clientY)) {
            return;
        }
        if (clickHoldState && clickHoldState.timer) {
            clearTimeout(clickHoldState.timer);
            clickHoldState = null;
        }
        let targetSpeed = 2;
        let hudText = "Speed Boost: 2.00x";
        if (action === "boost") {
            targetSpeed = currentConfig.holdSpaceSpeed !== void 0 ? Number(currentConfig.holdSpaceSpeed) || 2 : 2;
            hudText = `Speed Boost: ${targetSpeed.toFixed(2)}x`;
        } else if (action === "favorite") {
            targetSpeed = currentConfig.favoriteSpeed !== void 0 ? Number(currentConfig.favoriteSpeed) || 2 : 2;
            hudText = `Favorite Speed: ${targetSpeed.toFixed(2)}x`;
        } else if (action === "super") {
            targetSpeed = currentConfig.superSpeed !== void 0 ? Number(currentConfig.superSpeed) || 3 : 3;
            hudText = `Super Speed: ${targetSpeed.toFixed(2)}x`;
        }
        const currentRate = targetCtrl.video.playbackRate || 1;
        const wasPaused = targetCtrl.video.paused;
        const timer = setTimeout(() => {
            if (clickHoldState && !clickHoldState.isHolding) {
                clickHoldState.isHolding = true;
                const ctrl = clickHoldState.controller;
                if (ctrl && ctrl.video && ctrl.video.isConnected) {
                    if (ctrl.video.paused) {
                        ctrl.video.play().catch(() => {});
                    }
                    ctrl.setSpeed(clickHoldState.targetSpeed, false, false, false);
                    ctrl.showHUD(clickHoldState.hudText);
                    dismissYouTubeSpeedmaster();
                    try {
                        const ytPlayer = ctrl.video && ctrl.video.closest ? ctrl.video.closest("#movie_player, .html5-video-player") : null;
                        if (ytPlayer) {
                            const cancelEvt = new PointerEvent("pointercancel", {
                                bubbles: false,
                                cancelable: true
                            });
                            cancelEvt._gvcSynthetic = true;
                            ytPlayer.dispatchEvent(cancelEvt);
                        }
                    } catch (_) {}
                }
            }
        }, HOLD_CLICK_THRESHOLD_MS);
        clickHoldState = {
            controller: targetCtrl,
            startTime: Date.now(),
            startX: e.clientX,
            startY: e.clientY,
            previousSpeed: currentRate,
            wasPaused: wasPaused,
            targetSpeed: targetSpeed,
            hudText: hudText,
            timer: timer,
            isHolding: false
        };
    }
    function onGlobalPointerUp(e) {
        if (e && (e.isTrusted === false || e._gvcSynthetic || e._omniSynthetic)) {
            return;
        }
        if (isGlobalPointerDown) {
            isGlobalPointerDown = false;
        }
        if (isGloballyPaused || isDomainExcluded()) {
            clickHoldState = null;
            return;
        }
        if (clickHoldState) {
            if (clickHoldState.timer) {
                clearTimeout(clickHoldState.timer);
                clickHoldState.timer = null;
            }
            const wasHolding = clickHoldState.isHolding;
            const ctrl = clickHoldState.controller;
            const prevSpeed = clickHoldState.previousSpeed;
            const wasPaused = clickHoldState.wasPaused;
            clickHoldState.isHolding = false;
            clickHoldState = null;
            onHoldStateReleased();
            if (wasHolding && ctrl && ctrl.video && ctrl.video.isConnected) {
                ctrl.setSpeed(prevSpeed, true, false, false);
                if (wasPaused) {
                    ctrl.video.pause();
                    ctrl.showHUD("Paused", false, true);
                } else {
                    ctrl.showHUD(`Speed: ${prevSpeed.toFixed(2)}x`, false, true);
                }
                dismissYouTubeSpeedmaster();
                setTimeout(() => {
                    if (ctrl && ctrl.video && ctrl.video.isConnected) {
                        if (Math.abs(ctrl.video.playbackRate - prevSpeed) > .01) {
                            ctrl.setSpeed(prevSpeed, true, false, false);
                        }
                        dismissYouTubeSpeedmaster();
                    }
                }, 50);
                shouldSuppressNextClick = true;
                if (suppressClickTimeout) clearTimeout(suppressClickTimeout);
                suppressClickTimeout = setTimeout(() => {
                    shouldSuppressNextClick = false;
                }, 250);
            }
        } else {
            onHoldStateReleased();
        }
    }
    let lastFsClickTime = 0;
    let lastFsDoubleClickTime = 0;
    function actLikePressingSpace(targetCtrl) {
        if (!targetCtrl || !targetCtrl.video || !targetCtrl.video.isConnected) return;
        if (typeof activeControllers !== "undefined" && activeControllers) {
            for (const [v, ctrl] of activeControllers.entries()) {
                if (v && v !== targetCtrl.video && !v.paused) {
                    try {
                        v.pause();
                    } catch (_) {}
                }
            }
        }
        targetCtrl.togglePlayPause();
    }
    function onGlobalClickCapture(e) {
        if (isGloballyPaused || isDomainExcluded()) {
            shouldSuppressNextClick = false;
            return;
        }
        if (shouldSuppressNextClick) {
            shouldSuppressNextClick = false;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return;
        }
        if (e.button !== void 0 && e.button !== 0) return;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
        const isFs = isForcedFs || !!fsEl;
        if (isFs) {
            if (e.target && typeof e.target.closest === "function") {
                if (e.target.closest('.omni-controls-container, .omni-speed-picker, .omni-ctx-menu, .omni-loop-container, .omni-sub-controls, .omni-controls-bar, .omni-hud, .omni-subtitles-settings-popup, .omni-subtitles-overlay, [class*="omni-"]')) {
                    return;
                }
            }
            let targetCtrl = typeof getActiveTargetController === "function" ? getActiveTargetController() : null;
            if (!targetCtrl && typeof findControllerUnderPointer === "function") {
                targetCtrl = findControllerUnderPointer(e.clientX, e.clientY);
            }
            if (!targetCtrl && typeof activeControllers !== "undefined") {
                for (const ctrl of activeControllers.values()) {
                    if (ctrl && (ctrl._isPageFullscreen || fsEl && typeof isVideoInFullscreen === "function" && isVideoInFullscreen(ctrl.video, fsEl))) {
                        targetCtrl = ctrl;
                        break;
                    }
                }
            }
            if (targetCtrl && targetCtrl.video && targetCtrl.video.isConnected) {
                if (typeof targetCtrl.isPointOverController === "function" && targetCtrl.isPointOverController(e.clientX, e.clientY)) {
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                const isDoubleClick = e.detail && e.detail >= 2 || Date.now() - lastFsClickTime < 300 && lastFsClickTime > 0;
                if (isDoubleClick) {
                    lastFsClickTime = 0;
                    lastFsDoubleClickTime = Date.now();
                    actLikePressingSpace(targetCtrl);
                    targetCtrl.toggleFullscreen();
                    return;
                }
                lastFsClickTime = Date.now();
                actLikePressingSpace(targetCtrl);
            }
        }
    }
    function onGlobalDblClickCapture(e) {
        if (isGloballyPaused || isDomainExcluded()) return;
        if (e.button !== void 0 && e.button !== 0) return;
        if (Date.now() - lastFsDoubleClickTime < 500) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return;
        }
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
        const isFs = isForcedFs || !!fsEl;
        if (!isFs) return;
        if (e.target && typeof e.target.closest === "function") {
            if (e.target.closest('.omni-controls-container, .omni-speed-picker, .omni-ctx-menu, .omni-loop-container, .omni-sub-controls, .omni-controls-bar, .omni-hud, .omni-subtitles-settings-popup, .omni-subtitles-overlay, [class*="omni-"]')) {
                return;
            }
        }
        let targetCtrl = typeof getActiveTargetController === "function" ? getActiveTargetController() : null;
        if (!targetCtrl && typeof findControllerUnderPointer === "function") {
            targetCtrl = findControllerUnderPointer(e.clientX, e.clientY);
        }
        if (!targetCtrl && typeof activeControllers !== "undefined") {
            for (const ctrl of activeControllers.values()) {
                if (ctrl && (ctrl._isPageFullscreen || fsEl && typeof isVideoInFullscreen === "function" && isVideoInFullscreen(ctrl.video, fsEl))) {
                    targetCtrl = ctrl;
                    break;
                }
            }
        }
        if (targetCtrl && targetCtrl.video && targetCtrl.video.isConnected) {
            if (typeof targetCtrl.isPointOverController === "function" && targetCtrl.isPointOverController(e.clientX, e.clientY)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (Date.now() - lastFsDoubleClickTime < 500) {
                return;
            }
            lastFsDoubleClickTime = Date.now();
            if (Date.now() - lastFsClickTime < 400 && lastFsClickTime > 0) {
                actLikePressingSpace(targetCtrl);
            }
            targetCtrl.toggleFullscreen();
        }
    }
    function onGlobalMouseUpCapture(e) {
        if (isGloballyPaused || isDomainExcluded()) {
            shouldSuppressNextMouseUp = false;
            return;
        }
        if (shouldSuppressNextMouseUp) {
            shouldSuppressNextMouseUp = false;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    }
    let lastAudibleVolume = 1;
    let lastUserInteractionTime = 0;
    let lastUserVolumeInteractionTime = 0;
    let observer = null;
    let periodicCleanupInterval = null;
    let isContextCleanedUp = false;
    let pendingUnmuteInteractionSet = false;
    function setupPendingUnmuteOnUserInteraction() {
        if (pendingUnmuteInteractionSet) return;
        pendingUnmuteInteractionSet = true;
        const onFirstUserGesture = () => {
            window.removeEventListener("pointerdown", onFirstUserGesture, true);
            window.removeEventListener("keydown", onFirstUserGesture, true);
            window.removeEventListener("click", onFirstUserGesture, true);
            pendingUnmuteInteractionSet = false;
        };
        window.addEventListener("pointerdown", onFirstUserGesture, {
            capture: true,
            once: true
        });
        window.addEventListener("keydown", onFirstUserGesture, {
            capture: true,
            once: true
        });
        window.addEventListener("click", onFirstUserGesture, {
            capture: true,
            once: true
        });
    }
    function onUserInteraction(e) {
        if (typeof unhideCursor === "function") unhideCursor();
        if (typeof scheduleCursorInactivityTimer === "function" && activeHoveredCtrl) {
            scheduleCursorInactivityTimer();
        }
        const activeBarCtrl = activeHoveredCtrl && activeHoveredCtrl.controlsBar && activeHoveredCtrl.isControlsForced ? activeHoveredCtrl : (() => {
            const t = getActiveTargetController();
            return t && t.controlsBar && t.isControlsForced ? t : null;
        })();
        if (activeBarCtrl) {
            if (activeBarCtrl.controlsBar.classList.contains("hover-hidden")) {
                activeBarCtrl.controlsBar.classList.remove("hover-hidden");
            }
            if (currentConfig.autoHideButtons !== false) {
                activeBarCtrl.scheduleControlsBarAutoHide();
            }
        }
        lastUserInteractionTime = Date.now();
        if (e && e.type === "pointerdown" && (e.button === void 0 || e.button === 0)) {
            if (e.isTrusted === false || e._gvcSynthetic || e._omniSynthetic) return;
            isGlobalPointerDown = true;
            if (isGloballyPaused || isDomainExcluded()) return;
            startClickHold(e);
            if (typeof activeControllers !== "undefined" && activeControllers) {
                for (const ctrl of activeControllers.values()) {
                    if (ctrl.hud && ctrl.hud.classList.contains("active")) {
                        const svg = ctrl.hud.querySelector(".hud-icon svg");
                        if (svg) {
                            svg.classList.remove("is-landing");
                            svg.classList.add("is-spinning");
                        }
                    }
                }
            }
        }
        if (e && e.target && typeof e.target.closest === "function") {
            const volEl = e.target.closest('.ytp-volume-slider, .ytp-volume-panel, .ytp-volume-area, .ytp-mute-button, [aria-label*="volume" i], [aria-label*="mute" i], [aria-label*="unmute" i], [aria-label*="sound" i], [aria-label*="audio" i], [data-a-target*="volume" i], [data-a-target*="mute" i], [data-testid*="volume" i], [data-testid*="mute" i], [data-e2e*="volume" i], .vjs-volume-panel, .vjs-volume-control, .jw-slider-volume, input[type="range"][name*="vol" i], input[type="range"][id*="vol" i], .volume-slider, .volume-bar, [class*="volume-slider" i], [class*="volume-bar" i]');
            if (volEl) {
                lastUserVolumeInteractionTime = Date.now();
            }
            const fsBtn = e.target.closest('.ytp-fullscreen-button, button[data-title-no-tooltip="Full screen"], button[aria-label*="Fullscreen" i], button[aria-label*="Full screen" i], button[title*="Fullscreen" i], button[title*="Full screen" i], [data-testid*="fullscreen" i], button[name*="fullscreen" i], .vjs-fullscreen-control, .plyr__control--fullscreen, .jw-icon-fullscreen, shreddit-fullscreen-button, [class*="fullscreen-button" i], [class*="fullscreen-control" i]');
            if (fsBtn) {
                if (typeof activeControllers !== "undefined" && activeControllers) {
                    activeControllers.forEach(ctrl => {
                        if (ctrl && typeof ctrl.savePreFullscreenControlsState === "function") {
                            ctrl.savePreFullscreenControlsState();
                            if (!ctrl._wasControlsForcedBeforeFs) {
                                ctrl.isControlsForced = false;
                                if (ctrl.controlsBar) {
                                    ctrl.controlsBar.classList.add("hidden");
                                    ctrl.controlsBar.classList.add("hover-hidden");
                                    ctrl.updateControlsBarState();
                                }
                            }
                        }
                    });
                }
            }
        }
        pendingUnmuteInteractionSet = false;
    }
    function getSavedAudibleVolume() {
        if (lastAudibleVolume > 0) return lastAudibleVolume;
        try {
            const stored = parseFloat(sessionStorage.getItem("__omni_site_volume_v2") || sessionStorage.getItem("__omni_site_volume"));
            if (stored > 0 && isFinite(stored)) {
                lastAudibleVolume = Math.min(1, stored);
                return lastAudibleVolume;
            }
        } catch (e) {}
        return 1;
    }
    const audioGraphMap = new WeakMap;
    function getOrCreateAudioGraph(video) {
        if (audioGraphMap.has(video)) {
            return audioGraphMap.get(video);
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        try {
            const audioCtx = new AudioContextClass;
            const sourceNode = audioCtx.createMediaElementSource(video);
            const gainNode = audioCtx.createGain();
            sourceNode.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            const graph = {
                audioCtx: audioCtx,
                sourceNode: sourceNode,
                gainNode: gainNode
            };
            audioGraphMap.set(video, graph);
            return graph;
        } catch (err) {
            return null;
        }
    }
    let pageHasUserGesture = false;
    const pendingResumeGraphs = new Set;
    function hasUserGesture() {
        if (pageHasUserGesture) return true;
        if (typeof navigator !== "undefined" && navigator.userActivation && typeof navigator.userActivation.hasBeenActive === "boolean") {
            if (navigator.userActivation.hasBeenActive) {
                pageHasUserGesture = true;
                return true;
            }
        }
        return false;
    }
    function onPageUserGesture() {
        pageHasUserGesture = true;
        if (pendingResumeGraphs.size > 0) {
            pendingResumeGraphs.forEach(graph => {
                if (graph && graph.audioCtx && graph.audioCtx.state === "suspended") {
                    try {
                        const p = graph.audioCtx.resume();
                        if (p && typeof p.catch === "function") {
                            p.catch(() => {});
                        }
                    } catch (e) {}
                }
            });
            pendingResumeGraphs.clear();
        }
    }
    try {
        window.addEventListener("pointerdown", onPageUserGesture, {
            capture: true,
            passive: true
        });
        window.addEventListener("keydown", onPageUserGesture, {
            capture: true,
            passive: true
        });
        window.addEventListener("touchstart", onPageUserGesture, {
            capture: true,
            passive: true
        });
        window.addEventListener("click", onPageUserGesture, {
            capture: true,
            passive: true
        });
    } catch (e) {}
    function resumeAudioGraph(graph) {
        if (graph && graph.audioCtx && graph.audioCtx.state === "suspended") {
            if (!hasUserGesture()) {
                pendingResumeGraphs.add(graph);
                return;
            }
            try {
                const p = graph.audioCtx.resume();
                if (p && typeof p.catch === "function") {
                    p.catch(() => {});
                }
            } catch (e) {}
        }
    }
    const ICONS = {
        omni: `<svg viewBox="0 0 24 24"><polygon points="8.25,5.5 19.5,12 8.25,18.5" /></svg>`,
        minimize: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" /></svg>`,
        settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
        superspeed: `<svg viewBox="0 0 24 24"><path d="M12 2l-7 12h5v8l7-12h-5z"/></svg>`,
        favorite: `<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
        forwardShort: `<svg viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`,
        forwardLong: `<svg viewBox="0 0 24 24"><path d="M4 18l7.5-6L4 6v12zm8 0l7.5-6L12 6v12zM20 6v12h2V6h-2z"/></svg>`,
        backwardShort: `<svg viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm9-12l-8.5 6 8.5 6V6z"/></svg>`,
        backwardLong: `<svg viewBox="0 0 24 24"><path d="M12 18V6l-7.5 6 7.5 6zm8 0V6l-7.5 6 7.5 6zM2 6v12h2V6H2z"/></svg>`,
        mute: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
        unmute: `<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
        repeat: `<svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`,
        pip: `<svg viewBox="0 0 24 24"><path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/></svg>`,
        plus: `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
        minus: `<svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>`,
        loopSync: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>`,
        speed: `<svg viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.28-10.43zM10.59 15.41a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>`,
        volume: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
        hide: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
        play: `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`,
        pause: `<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`,
        fullscreen: `<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`,
        fullscreenExit: `<svg viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>`,
        lock: `<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>`,
        unlock: `<svg viewBox="0 0 24 24"><path d="M18 8H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-16c2.76 0 5 2.24 5 5v2h-2V6c0-1.66-1.34-3-3-3S9 4.34 9 6h-2c0-2.76 2.24-5 5-5z"/></svg>`,
        progressBar: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="11" width="20" height="2" rx="1"/><circle cx="9" cy="12" r="3.5"/></svg>`
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
    let physicalLayoutMap = null;
    let physicalLayoutDetected = null;
    async function initKeyboardLayout() {
        try {
            if (navigator.keyboard && typeof navigator.keyboard.getLayoutMap === "function") {
                physicalLayoutMap = await navigator.keyboard.getLayoutMap();
                const qVal = (physicalLayoutMap.get("KeyQ") || "").toLowerCase();
                const wVal = (physicalLayoutMap.get("KeyW") || "").toLowerCase();
                if (qVal === "a" || wVal === "z") {
                    physicalLayoutDetected = "azerty";
                } else if (physicalLayoutMap.get("KeyZ") === "y") {
                    physicalLayoutDetected = "qwertz";
                } else if (qVal === "q") {
                    physicalLayoutDetected = "qwerty";
                }
            }
        } catch (e) {}
        if (!physicalLayoutDetected) {
            const lang = (navigator.language || "").toLowerCase();
            if (lang.startsWith("fr")) physicalLayoutDetected = "azerty"; else if (lang.startsWith("de")) physicalLayoutDetected = "qwertz"; else physicalLayoutDetected = "qwerty";
        }
    }
    function formatKeyDisplay(code, layout) {
        if (!code) return "";
        if (physicalLayoutMap && typeof physicalLayoutMap.get === "function") {
            const mappedChar = physicalLayoutMap.get(code);
            if (mappedChar) {
                return mappedChar.toUpperCase();
            }
        }
        let l = (layout || currentConfig.keyboardLayout || physicalLayoutDetected || "qwerty").toLowerCase();
        if (l === "custom" || ![ "qwerty", "azerty", "qwertz" ].includes(l)) {
            l = (physicalLayoutDetected || "qwerty").toLowerCase();
        }
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
    function isExtensionValid() {
        try {
            if (typeof window !== "undefined" && window.__TEST_BENCH__) return true;
            return Boolean(typeof chrome !== "undefined" && chrome.runtime && !!chrome.runtime.id);
        } catch (e) {
            return false;
        }
    }
    function cleanupIfInvalidated() {
        if (isContextCleanedUp) return true;
        if (!isExtensionValid()) {
            isContextCleanedUp = true;
            try {
                if (observer) {
                    observer.disconnect();
                    observer = null;
                }
            } catch (e) {}
            try {
                if (periodicCleanupInterval) {
                    clearInterval(periodicCleanupInterval);
                    periodicCleanupInterval = null;
                }
            } catch (e) {}
            if (autoReactivateTimer) {
                clearTimeout(autoReactivateTimer);
                autoReactivateTimer = null;
                autoReactivateEndTime = 0;
            }
            if (typeof cursorInactivityTimer !== "undefined" && cursorInactivityTimer) {
                clearTimeout(cursorInactivityTimer);
                cursorInactivityTimer = null;
            }
            if (typeof unhideCursor === "function") unhideCursor();
            try {
                window.removeEventListener("keydown", handleKeyboardShortcut, true);
                window.removeEventListener("keyup", handleKeyboardKeyUp, true);
                window.removeEventListener("blur", onWindowBlur);
                window.removeEventListener("pointermove", onGlobalPointerMove, {
                    passive: true
                });
                window.removeEventListener("pointerdown", onUserInteraction, {
                    capture: true,
                    passive: true
                });
                window.removeEventListener("scroll", onGlobalScroll, {
                    capture: true,
                    passive: true
                });
                document.removeEventListener("scroll", onGlobalScroll, {
                    capture: true,
                    passive: true
                });
                document.removeEventListener("mouseleave", onGlobalPointerLeaveDoc, {
                    passive: true
                });
                window.removeEventListener("wheel", onGlobalWheel, true);
                window.removeEventListener("click", onGlobalClickCapture, true);
                window.removeEventListener("dblclick", onGlobalDblClickCapture, true);
            } catch (e) {}
            try {
                activeControllers.forEach(ctrl => ctrl.destroy());
                activeControllers.clear();
                activeHoveredCtrl = null;
            } catch (e) {}
            return true;
        }
        return false;
    }
    function getRootDomain(hostname) {
        if (!hostname) return "";
        const stripped = hostname.toLowerCase().replace(/^www\./, "");
        const parts = stripped.split(".");
        if (parts.length >= 2) {
            return parts.slice(-2).join(".");
        }
        return stripped;
    }
    function isDomainControlsForced() {
        if (window.location.protocol === "chrome-extension:") return false;
        const rules = currentConfig.siteControlsRules;
        if (!rules) return false;
        const list = Array.isArray(rules) ? rules : Object.keys(rules);
        if (list.length === 0) return false;
        const hostname = (window.location.hostname || "").toLowerCase();
        const stripped = hostname.replace(/^www\./, "");
        const rootKey = getRootDomain(hostname);
        const fullHref = (window.location.href || "").toLowerCase();
        return list.some(d => {
            let norm = String(d).toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
            if (!norm) return false;
            if (norm.includes("/")) {
                return fullHref.includes(norm);
            }
            return norm === hostname || norm === stripped || rootKey && norm === rootKey;
        });
    }
    function isDomainExcluded() {
        if (window.location.protocol === "chrome-extension:") return false;
        if (!currentConfig.excludedDomains || !Array.isArray(currentConfig.excludedDomains)) return false;
        const hostname = (window.location.hostname || "").toLowerCase();
        const stripped = hostname.replace(/^www\./, "");
        const rootKey = getRootDomain(hostname);
        return currentConfig.excludedDomains.some(d => {
            const norm = String(d).toLowerCase().replace(/^www\./, "");
            return norm === hostname || norm === stripped || rootKey && norm === rootKey;
        });
    }
    function getDomainSpeed() {
        if (!currentConfig.siteSpeeds || typeof currentConfig.siteSpeeds !== "object") return null;
        const hostname = (window.location.hostname || "").toLowerCase();
        if (!hostname) return null;
        let val = null;
        if (currentConfig.siteSpeeds[hostname] !== void 0) {
            val = Number(currentConfig.siteSpeeds[hostname]);
        } else {
            const stripped = hostname.replace(/^www\./, "");
            if (currentConfig.siteSpeeds[stripped] !== void 0) {
                val = Number(currentConfig.siteSpeeds[stripped]);
            } else {
                const withWww = "www." + stripped;
                if (currentConfig.siteSpeeds[withWww] !== void 0) {
                    val = Number(currentConfig.siteSpeeds[withWww]);
                } else {
                    const rootKey = getRootDomain(hostname);
                    if (rootKey && currentConfig.siteSpeeds[rootKey] !== void 0) {
                        val = Number(currentConfig.siteSpeeds[rootKey]);
                    }
                }
            }
        }
        if (val !== null && !isNaN(val) && val > 0) {
            return Math.min(100, val);
        }
        return null;
    }
    function getDomainVolume() {
        if (!currentConfig.siteVolumes || typeof currentConfig.siteVolumes !== "object") return null;
        const hostname = (window.location.hostname || "").toLowerCase();
        if (!hostname) return null;
        const isBoost = currentConfig.volumeBoostEnabled === true;
        const maxVal = isBoost ? 6 : 1;
        let raw = null;
        if (currentConfig.siteVolumes[hostname] !== void 0) {
            raw = Number(currentConfig.siteVolumes[hostname]);
        } else {
            const stripped = hostname.replace(/^www\./, "");
            if (currentConfig.siteVolumes[stripped] !== void 0) {
                raw = Number(currentConfig.siteVolumes[stripped]);
            } else {
                const withWww = "www." + stripped;
                if (currentConfig.siteVolumes[withWww] !== void 0) {
                    raw = Number(currentConfig.siteVolumes[withWww]);
                } else {
                    const rootKey = getRootDomain(hostname);
                    if (rootKey && currentConfig.siteVolumes[rootKey] !== void 0) {
                        raw = Number(currentConfig.siteVolumes[rootKey]);
                    }
                }
            }
        }
        if (raw !== null && !isNaN(raw) && raw >= 0) {
            const clamped = Math.min(maxVal, raw);
            return clamped;
        }
        return null;
    }
    function getDomainMuteRule() {
        const sVol = getDomainVolume();
        if (sVol !== null && sVol === 0) {
            return "mute";
        }
        if (!currentConfig.siteMuteRules || typeof currentConfig.siteMuteRules !== "object") return null;
        const hostname = (window.location.hostname || "").toLowerCase();
        if (!hostname) return null;
        if (currentConfig.siteMuteRules[hostname] !== void 0) {
            return currentConfig.siteMuteRules[hostname];
        }
        const stripped = hostname.replace(/^www\./, "");
        if (currentConfig.siteMuteRules[stripped] !== void 0) {
            return currentConfig.siteMuteRules[stripped];
        }
        const withWww = "www." + stripped;
        if (currentConfig.siteMuteRules[withWww] !== void 0) {
            return currentConfig.siteMuteRules[withWww];
        }
        const rootKey = getRootDomain(hostname);
        if (rootKey && currentConfig.siteMuteRules[rootKey] !== void 0) {
            return currentConfig.siteMuteRules[rootKey];
        }
        return null;
    }
    function getEffectiveMutePreference() {
        const siteRule = getDomainMuteRule();
        if (siteRule === "unmute" || siteRule === "unmuted") {
            return {
                shouldApply: true,
                muted: false
            };
        }
        if (siteRule === "mute" || siteRule === "muted") {
            return {
                shouldApply: true,
                muted: true
            };
        }
        if (currentConfig.defaultAudioState === "unmute") {
            return {
                shouldApply: true,
                muted: false
            };
        }
        if (currentConfig.defaultAudioState === "mute" || currentConfig.defaultMuted) {
            return {
                shouldApply: true,
                muted: true
            };
        }
        return {
            shouldApply: false
        };
    }
    function getDomainLoopRule() {
        if (!currentConfig.siteLoopRules || typeof currentConfig.siteLoopRules !== "object") return null;
        const hostname = (window.location.hostname || "").toLowerCase();
        if (!hostname) return null;
        if (currentConfig.siteLoopRules[hostname] !== void 0) {
            return currentConfig.siteLoopRules[hostname];
        }
        const stripped = hostname.replace(/^www\./, "");
        if (currentConfig.siteLoopRules[stripped] !== void 0) {
            return currentConfig.siteLoopRules[stripped];
        }
        const withWww = "www." + stripped;
        if (currentConfig.siteLoopRules[withWww] !== void 0) {
            return currentConfig.siteLoopRules[withWww];
        }
        const rootKey = getRootDomain(hostname);
        if (rootKey && currentConfig.siteLoopRules[rootKey] !== void 0) {
            return currentConfig.siteLoopRules[rootKey];
        }
        return null;
    }
    function getDomainPlayRule() {
        if (!currentConfig.sitePlayRules || typeof currentConfig.sitePlayRules !== "object") return null;
        const hostname = (window.location.hostname || "").toLowerCase();
        if (!hostname) return null;
        if (currentConfig.sitePlayRules[hostname] !== void 0) {
            return currentConfig.sitePlayRules[hostname];
        }
        const stripped = hostname.replace(/^www\./, "");
        if (currentConfig.sitePlayRules[stripped] !== void 0) {
            return currentConfig.sitePlayRules[stripped];
        }
        const withWww = "www." + stripped;
        if (currentConfig.sitePlayRules[withWww] !== void 0) {
            return currentConfig.sitePlayRules[withWww];
        }
        const rootKey = getRootDomain(hostname);
        if (rootKey && currentConfig.sitePlayRules[rootKey] !== void 0) {
            return currentConfig.sitePlayRules[rootKey];
        }
        return null;
    }
    function getEffectiveLoopPreference(controller) {
        const host = (window.location.hostname || "").toLowerCase();
        const path = (window.location.pathname || "").toLowerCase();
        const isYouTubeWatch = host.includes("youtube.com") && !path.startsWith("/shorts/") && (!controller || !controller.video || !controller.video.closest || !controller.video.closest("ytd-shorts, #shorts-player, [is-shorts], ytd-reel-video-renderer, ytd-reel-item-renderer"));
        const isInstagramStory = host.includes("instagram.com") && (path.includes("/stories") || path.startsWith("/stories") || controller && controller.video && controller.video.closest && !!controller.video.closest('section._ab37, [aria-label*="Story" i], [aria-label*="Stories" i], [data-story-id], [role="dialog"]'));
        const isFacebookStory = host.includes("facebook.com") && (path.includes("/stories") || path.startsWith("/stories") || controller && controller.video && controller.video.closest && !!controller.video.closest('[aria-label*="Story" i], [aria-label*="Stories" i], [data-pagelet*="Story" i]'));
        if (isYouTubeWatch || isInstagramStory || isFacebookStory) {
            if (currentConfig.defaultLoopState === "loop") return true;
            if (currentConfig.defaultLoopState === "unloop") return false;
            return false;
        }
        const siteRule = getDomainLoopRule();
        if (siteRule === "loop") return true;
        if (siteRule === "unloop") return false;
        if (currentConfig.defaultLoopState === "loop") return true;
        if (currentConfig.defaultLoopState === "unloop") return false;
        return controller && typeof controller.isPlatformDefaultLoop === "function" ? controller.isPlatformDefaultLoop() : false;
    }
    function isVideoLoopingActive(ctrl) {
        if (!ctrl) return false;
        if (ctrl.isLooping) return true;
        if (ctrl.userExplicitlyToggledLoop && ctrl.loopEnabled) return true;
        if (!isAutoScrollShortsActiveForCurrentPage(ctrl)) {
            const domainRule = getDomainLoopRule();
            if (domainRule === "loop") return true;
            if (currentConfig.defaultLoopState === "loop") return true;
        }
        return false;
    }
    let lastGlobalAutoScrollNavTimestamp = 0;
    let lastGlobalScrollNavTime = 0;
    function isAutoScrollShortsActiveForCurrentPage(ctrl) {
        if (!currentConfig.autoScrollShorts) return false;
        const host = (window.location.hostname || "").toLowerCase();
        const path = (window.location.pathname || "").toLowerCase();
        const fullUrl = (window.location.href || "").toLowerCase();
        const presets = currentConfig.autoScrollShortsPresets || {};
        if (presets.youtube !== false && host.includes("youtube.com")) {
            if (path.includes("/shorts/") || path.startsWith("/shorts/")) return true;
            if (ctrl && ctrl.video && ctrl.video.closest && ctrl.video.closest("ytd-shorts, #shorts-player, [is-shorts], ytd-reel-video-renderer, ytd-reel-item-renderer")) {
                return true;
            }
        }
        if (presets.instagram !== false && host.includes("instagram.com")) {
            if (path.includes("/reels/") || path.includes("/reel/") || path.startsWith("/reels") || path.startsWith("/reel")) {
                return true;
            }
        }
        if (presets.facebook !== false && host.includes("facebook.com")) {
            if (path.includes("/reel/") || path.includes("/reels/") || path.startsWith("/reel") || path.startsWith("/reels")) {
                return true;
            }
        }
        if (Array.isArray(currentConfig.autoScrollShortsCustom)) {
            for (const pattern of currentConfig.autoScrollShortsCustom) {
                if (!pattern) continue;
                const p = pattern.trim().toLowerCase();
                if (!p) continue;
                if (fullUrl.includes(p) || host.includes(p) || p.startsWith("/") && path.startsWith(p)) {
                    return true;
                }
            }
        }
        return false;
    }
    function loadConfig() {
        return new Promise(resolve => {
            if (typeof window !== "undefined" && window.__TEST_BENCH__ && (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.sync)) {
                currentConfig = Object.assign({}, DEFAULT_CONFIG);
                resolve(currentConfig);
                return;
            }
            if (cleanupIfInvalidated()) {
                resolve(currentConfig);
                return;
            }
            try {
                chrome.storage.sync.get("config", async res => {
                    if (cleanupIfInvalidated()) {
                        resolve(currentConfig);
                        return;
                    }
                    let saved = res && res.config ? {
                        ...res.config
                    } : {};
                    if (!saved.layoutDetected) {
                        ensurePageFullscreenStyles();
                        await initKeyboardLayout();
                        const detected = physicalLayoutDetected || "qwerty";
                        saved.keyboardLayout = detected;
                        saved.keyboardShortcuts = Object.assign({}, LAYOUT_PRESETS[detected] || LAYOUT_PRESETS.qwerty);
                        saved.layoutDetected = true;
                        selfWriteInProgress = true;
                        try {
                            if (!cleanupIfInvalidated()) {
                                await chrome.storage.sync.set({
                                    config: {
                                        ...DEFAULT_CONFIG,
                                        ...saved
                                    }
                                });
                            }
                        } catch (e) {}
                        selfWriteInProgress = false;
                    }
                    currentConfig = Object.assign({}, DEFAULT_CONFIG, saved);
                    if (currentConfig.keyboardLayout === "custom" || ![ "qwerty", "azerty", "qwertz" ].includes(currentConfig.keyboardLayout)) {
                        const sc = currentConfig.keyboardShortcuts || {};
                        if (sc.toggleMute === "Semicolon" || sc.speedDown === "KeyA" || (navigator.language || "").toLowerCase().startsWith("fr")) {
                            currentConfig.keyboardLayout = "azerty";
                        } else if (sc.longSkipBackward === "KeyY" || (navigator.language || "").toLowerCase().startsWith("de")) {
                            currentConfig.keyboardLayout = "qwertz";
                        } else {
                            currentConfig.keyboardLayout = physicalLayoutDetected || "qwerty";
                        }
                    }
                    const defaultShortcuts = JSON.parse(JSON.stringify(DEFAULT_CONFIG.keyboardShortcuts));
                    currentConfig.keyboardShortcuts = Object.assign({}, defaultShortcuts, saved.keyboardShortcuts || {});
                    if (currentConfig.keyboardShortcuts.forceFullscreen === void 0) {
                        currentConfig.keyboardShortcuts.forceFullscreen = "KeyF";
                    }
                    if (currentConfig.keyboardShortcuts.toggleDeactivate === void 0) {
                        currentConfig.keyboardShortcuts.toggleDeactivate = "KeyT";
                    }
                    if (currentConfig.keyboardShortcuts.nextVideo === void 0) {
                        currentConfig.keyboardShortcuts.nextVideo = "KeyK";
                    }
                    if (currentConfig.keyboardShortcuts.prevVideo === void 0) {
                        currentConfig.keyboardShortcuts.prevVideo = "KeyJ";
                    }
                    if (currentConfig.keyboardShortcuts.toggleVideoControls === void 0) {
                        currentConfig.keyboardShortcuts.toggleVideoControls = "KeyO";
                    }
                    if (!saved.shortcutsDefaultsUpdatedV2) {
                        let needsSave = false;
                        const sc = currentConfig.keyboardShortcuts;
                        if (sc.togglePlay === "Space" || Array.isArray(sc.togglePlay) && sc.togglePlay.length === 1 && sc.togglePlay[0] === "Space") {
                            sc.togglePlay = [ "Space", "Enter", "NumpadEnter" ];
                            needsSave = true;
                        }
                        const ensureKey = (actId, keyToAdd) => {
                            let v = sc[actId];
                            if (!v) {
                                sc[actId] = [ keyToAdd ];
                                needsSave = true;
                            } else if (Array.isArray(v)) {
                                if (!v.includes(keyToAdd)) {
                                    sc[actId] = [ ...v, keyToAdd ];
                                    needsSave = true;
                                }
                            } else if (typeof v === "string") {
                                if (v !== keyToAdd) {
                                    sc[actId] = [ v, keyToAdd ];
                                    needsSave = true;
                                }
                            }
                        };
                        ensureKey("shortSkipForward", "ArrowRight");
                        ensureKey("shortSkipBackward", "ArrowLeft");
                        if (needsSave) {
                            saved.shortcutsDefaultsUpdatedV2 = true;
                            saved.keyboardShortcuts = currentConfig.keyboardShortcuts;
                            selfWriteInProgress = true;
                            try {
                                if (!cleanupIfInvalidated()) {
                                    chrome.storage.sync.set({
                                        config: {
                                            ...DEFAULT_CONFIG,
                                            ...saved
                                        }
                                    });
                                }
                            } catch (e) {}
                            selfWriteInProgress = false;
                        }
                    }
                    if (!saved.shortcutsDefaultsUpdatedV3) {
                        let needsSave = false;
                        const sc = currentConfig.keyboardShortcuts;
                        if (sc) {
                            const removeKey = (actId, keyToRemove, fallbackKey) => {
                                let v = sc[actId];
                                if (Array.isArray(v) && v.includes(keyToRemove)) {
                                    sc[actId] = v.filter(k => k !== keyToRemove);
                                    if (sc[actId].length === 1) sc[actId] = sc[actId][0];
                                    needsSave = true;
                                } else if (v === keyToRemove) {
                                    sc[actId] = fallbackKey;
                                    needsSave = true;
                                }
                            };
                            removeKey("volumeUp", "ArrowUp", "KeyW");
                            removeKey("volumeDown", "ArrowDown", "KeyS");
                        }
                        saved.shortcutsDefaultsUpdatedV3 = true;
                        if (needsSave) {
                            saved.keyboardShortcuts = currentConfig.keyboardShortcuts;
                            selfWriteInProgress = true;
                            try {
                                if (!cleanupIfInvalidated()) {
                                    chrome.storage.sync.set({
                                        config: {
                                            ...DEFAULT_CONFIG,
                                            ...saved
                                        }
                                    });
                                }
                            } catch (e) {}
                            selfWriteInProgress = false;
                        }
                    }
                    if (Array.isArray(currentConfig.siteControlsRules) && currentConfig.siteControlsRules.length === 1 && currentConfig.siteControlsRules[0] === "instagram.com") {
                        currentConfig.siteControlsRules = [];
                    }
                    currentConfig.siteSpeeds = Object.assign({}, DEFAULT_CONFIG.siteSpeeds, saved.siteSpeeds || {});
                    currentConfig.siteVolumes = Object.assign({}, DEFAULT_CONFIG.siteVolumes, saved.siteVolumes || {});
                    currentConfig.siteMuteRules = Object.assign({}, DEFAULT_CONFIG.siteMuteRules, saved.siteMuteRules || {});
                    currentConfig.siteLoopRules = Object.assign({}, DEFAULT_CONFIG.siteLoopRules, saved.siteLoopRules || {});
                    currentConfig.sitePlayRules = Object.assign({}, DEFAULT_CONFIG.sitePlayRules, saved.sitePlayRules || {});
                    currentConfig.defaultVideoState = saved.defaultVideoState || DEFAULT_CONFIG.defaultVideoState || "doNothing";
                    currentConfig.defaultSpeed = saved.defaultSpeed !== void 0 ? Number(saved.defaultSpeed) : 1;
                    currentConfig.defaultVolume = saved.defaultVolume !== void 0 ? saved.defaultVolume : 1;
                    currentConfig.defaultAudioState = saved.defaultAudioState || (saved.defaultMuted ? "mute" : "doNothing");
                    currentConfig.defaultMuted = saved.defaultMuted !== void 0 ? !!saved.defaultMuted : currentConfig.defaultAudioState === "mute";
                    currentConfig.defaultLoopState = saved.defaultLoopState || DEFAULT_CONFIG.defaultLoopState || "doNothing";
                    currentConfig.videoControls = Array.isArray(saved.videoControls) ? [ ...saved.videoControls ] : [ ...DEFAULT_CONFIG.videoControls ];
                    if (!currentConfig.videoControls.includes("hide")) {
                        isGloballyHidden = false;
                    }
                    currentConfig.controllerPosition = saved.controllerPosition === "topRight" ? "topRight" : "topLeft";
                    currentConfig.controlsTrigger = saved.controlsTrigger === "click" ? "click" : "hover";
                    currentConfig.controlsFadeInDelay = saved.controlsFadeInDelay !== void 0 ? parseFloat(saved.controlsFadeInDelay) || .2 : .2;
                    currentConfig.hideControlsDuration = saved.hideControlsDuration !== void 0 ? parseFloat(saved.hideControlsDuration) || 0 : 0;
                    currentConfig.segmentControl1To9 = saved.segmentControl1To9 === "doNothing" ? "doNothing" : "force";
                    currentConfig.scrollWheelAction = saved.scrollWheelAction || DEFAULT_CONFIG.scrollWheelAction || "doNothing";
                    currentConfig.holdClickAction = saved.holdClickAction || DEFAULT_CONFIG.holdClickAction || "boost";
                    currentConfig.hideCursorOnInactivity = saved.hideCursorOnInactivity !== void 0 ? !!saved.hideCursorOnInactivity : true;
                    currentConfig.hideCursorTimeout = saved.hideCursorTimeout !== void 0 ? parseFloat(saved.hideCursorTimeout) || 2.5 : 2.5;
                    currentConfig.deactivateHotkeyMode = saved.deactivateHotkeyMode || DEFAULT_CONFIG.deactivateHotkeyMode || "deactivateOnly";
                    currentConfig.autoReactivateDelay = saved.autoReactivateDelay !== void 0 ? parseFloat(saved.autoReactivateDelay) || 0 : 0;
                    currentConfig.holdToReactivateDelay = saved.holdToReactivateDelay !== void 0 ? parseFloat(saved.holdToReactivateDelay) || 0 : 0;
                    currentConfig.uiTheme = saved.uiTheme || DEFAULT_CONFIG.uiTheme || "auto";
                    currentConfig.autoScrollShorts = saved.autoScrollShorts !== void 0 ? !!saved.autoScrollShorts : false;
                    currentConfig.autoScrollShortsPresets = Object.assign({
                        youtube: true,
                        instagram: true,
                        facebook: true
                    }, saved.autoScrollShortsPresets || {});
                    currentConfig.autoScrollShortsCustom = Array.isArray(saved.autoScrollShortsCustom) ? [ ...saved.autoScrollShortsCustom ] : [];
                    currentConfig.showHotkeyHUD = saved.showHotkeyHUD !== void 0 ? !!saved.showHotkeyHUD : true;
                    currentConfig.glowEnabled = saved.glowEnabled !== void 0 ? saved.glowEnabled !== false : true;
                    currentConfig.holdFavoriteSpeedEnabled = saved.holdFavoriteSpeedEnabled !== void 0 ? !!saved.holdFavoriteSpeedEnabled : true;
                    currentConfig.holdSuperSpeedEnabled = saved.holdSuperSpeedEnabled !== void 0 ? !!saved.holdSuperSpeedEnabled : true;
                    currentConfig.holdSpaceSpeedEnabled = saved.holdSpaceSpeedEnabled !== void 0 ? !!saved.holdSpaceSpeedEnabled : true;
                    if (currentConfig.controlsBarPinned !== void 0) {
                        isControlsBarPinnedGlobal = !!currentConfig.controlsBarPinned;
                    }
                    syncBackgroundPlayState(currentConfig.backgroundPlay !== false);
                    resolve(currentConfig);
                });
            } catch (e) {
                cleanupIfInvalidated();
                resolve(currentConfig);
            }
        });
    }
    try {
        if (isExtensionValid()) {
            chrome.storage.onChanged.addListener((changes, area) => {
                if (cleanupIfInvalidated()) return;
                if (area === "sync" && changes.config && !selfWriteInProgress) {
                    currentConfig = Object.assign({}, DEFAULT_CONFIG, changes.config.newValue);
                    const wasDeactivated = isGloballyPaused || isDomainExcluded();
                    isGloballyPaused = isDomainExcluded();
                    if (isGloballyPaused) {
                        restoreYouTubeSpeedmaster();
                    } else if (currentConfig.holdClickAction !== "default") {
                        ensureYouTubeSpeedmasterSuppressStyle();
                    }
                    if (isGloballyPaused) {
                        restoreYouTubeSpeedmaster();
                        releaseAllHoldStates();
                    } else if (wasDeactivated && !isGloballyPaused) {
                        if (currentConfig.holdClickAction !== "default") {
                            ensureYouTubeSpeedmasterSuppressStyle();
                        }
                    } else if (currentConfig.holdClickAction === "default") {
                        restoreYouTubeSpeedmaster();
                    }
                    currentConfig.keyboardShortcuts = Object.assign({}, DEFAULT_CONFIG.keyboardShortcuts, changes.config.newValue.keyboardShortcuts || {});
                    if (currentConfig.keyboardShortcuts.forceFullscreen === void 0) {
                        currentConfig.keyboardShortcuts.forceFullscreen = "KeyF";
                    }
                    if (currentConfig.keyboardShortcuts.toggleVideoControls === void 0) {
                        currentConfig.keyboardShortcuts.toggleVideoControls = "KeyO";
                    }
                    currentConfig.siteSpeeds = Object.assign({}, changes.config.newValue.siteSpeeds || {});
                    currentConfig.siteVolumes = Object.assign({}, changes.config.newValue.siteVolumes || {});
                    currentConfig.siteMuteRules = Object.assign({}, changes.config.newValue.siteMuteRules || {});
                    currentConfig.siteLoopRules = Object.assign({}, changes.config.newValue.siteLoopRules || {});
                    currentConfig.sitePlayRules = Object.assign({}, changes.config.newValue.sitePlayRules || {});
                    if (changes.config.newValue && changes.config.newValue.siteControlsRules !== void 0) {
                        currentConfig.siteControlsRules = Array.isArray(changes.config.newValue.siteControlsRules) ? [ ...changes.config.newValue.siteControlsRules ] : [];
                        if (isControlsForcedGlobal === null && isDomainControlsForced()) {
                            isControlsForcedGlobal = true;
                        }
                    }
                    if (changes.config.newValue && changes.config.newValue.controlsBarPinned !== void 0) {
                        isControlsBarPinnedGlobal = !!changes.config.newValue.controlsBarPinned;
                        activeControllers.forEach(ctrl => {
                            ctrl.isControlsBarPinned = isControlsBarPinnedGlobal;
                            if (typeof ctrl.updateControlsBarLockState === "function") {
                                ctrl.updateControlsBarLockState();
                            }
                        });
                    }
                    if (changes.config.newValue && changes.config.newValue.showHotkeyHUD !== void 0) {
                        currentConfig.showHotkeyHUD = !!changes.config.newValue.showHotkeyHUD;
                    }
                    if (changes.config.newValue && changes.config.newValue.glowEnabled !== void 0) {
                        currentConfig.glowEnabled = changes.config.newValue.glowEnabled !== false;
                    }
                    if (changes.config.newValue && changes.config.newValue.backgroundPlay !== void 0) {
                        currentConfig.backgroundPlay = changes.config.newValue.backgroundPlay !== false;
                        syncBackgroundPlayState(currentConfig.backgroundPlay);
                    }
                    if (changes.config.newValue && changes.config.newValue.holdClickAction !== void 0) {
                        currentConfig.holdClickAction = changes.config.newValue.holdClickAction;
                    }
                    if (changes.config.newValue && changes.config.newValue.segmentControl1To9 !== void 0) {
                        currentConfig.segmentControl1To9 = changes.config.newValue.segmentControl1To9;
                    }
                    if (changes.config.newValue && changes.config.newValue.hideCursorOnInactivity !== void 0) {
                        currentConfig.hideCursorOnInactivity = !!changes.config.newValue.hideCursorOnInactivity;
                        if (!currentConfig.hideCursorOnInactivity && typeof unhideCursor === "function") {
                            unhideCursor();
                        }
                    }
                    if (changes.config.newValue && changes.config.newValue.hideCursorTimeout !== void 0) {
                        currentConfig.hideCursorTimeout = parseFloat(changes.config.newValue.hideCursorTimeout) || 2.5;
                    }
                    if (changes.config.newValue && changes.config.newValue.holdToReactivateDelay !== void 0) {
                        currentConfig.holdToReactivateDelay = parseFloat(changes.config.newValue.holdToReactivateDelay) || 0;
                    }
                    if (changes.config.newValue && changes.config.newValue.autoReactivateDelay !== void 0) {
                        currentConfig.autoReactivateDelay = parseFloat(changes.config.newValue.autoReactivateDelay) || 0;
                    }
                    if (changes.config.newValue && changes.config.newValue.videoControls !== void 0) {
                        currentConfig.videoControls = Array.isArray(changes.config.newValue.videoControls) ? [ ...changes.config.newValue.videoControls ] : [];
                        if (!currentConfig.videoControls.includes("hide") && isGloballyHidden) {
                            restoreControlsVisibility();
                        }
                    }
                    if (!currentConfig.volumeBoostEnabled) {
                        activeControllers.forEach(ctrl => {
                            if (ctrl && ctrl.getEffectiveVolume() > 1) {
                                ctrl.setEffectiveVolume(1, false);
                            }
                        });
                    }
                    const sVol = getDomainVolume();
                    if (sVol !== null && sVol >= 0) {
                        setAllVideosVolume(sVol, false);
                    } else {
                        activeControllers.forEach(ctrl => {
                            if (ctrl && typeof ctrl.applyEffectiveVolume === "function") {
                                ctrl._userExplicitlyAdjustedNativeVolume = false;
                                ctrl.applyEffectiveVolume(true);
                            }
                        });
                    }
                    if (changes.config.newValue && (changes.config.newValue.autoMinimize !== void 0 || changes.config.newValue.autoMinimizeTimeout !== void 0)) {
                        currentConfig.autoMinimize = changes.config.newValue.autoMinimize !== false;
                        if (changes.config.newValue.autoMinimizeTimeout !== void 0) {
                            currentConfig.autoMinimizeTimeout = changes.config.newValue.autoMinimizeTimeout;
                        }
                        activeControllers.forEach(ctrl => {
                            if (ctrl && ctrl.isAnyOverlayOpen()) {
                                if (currentConfig.autoMinimize && !ctrl.isHoveringAnyOverlay()) {
                                    ctrl.scheduleOverlaysAutoMinimize();
                                } else if (!currentConfig.autoMinimize) {
                                    ctrl.clearOverlaysAutoMinimizeTimer();
                                }
                            }
                        });
                    }
                    const sSpeed = getDomainSpeed();
                    if (sSpeed !== null && sSpeed > 0) {
                        setAllVideosSpeed(sSpeed, false);
                    }
                    activeControllers.forEach(ctrl => ctrl.updateThemeAndConfig());
                    reportVideoPresence();
                }
            });
        }
    } catch (e) {}
    window.addEventListener("omni-live-theme", e => {
        if (e.detail) {
            currentConfig = Object.assign({}, currentConfig, e.detail);
            activeControllers.forEach(ctrl => {
                ctrl.updateThemeAndConfig();
            });
        }
    });
    function toggleSiteDeactivation(initiatingCtrl = null) {
        if (cleanupIfInvalidated()) return false;
        if (autoReactivateTimer) {
            clearTimeout(autoReactivateTimer);
            autoReactivateTimer = null;
            autoReactivateEndTime = 0;
        }
        if (window.location.protocol === "chrome-extension:") return false;
        const hostname = (window.location.hostname || (window.location.protocol === "file:" ? "local_file" : "")).toLowerCase();
        if (!hostname) return false;
        const stripped = hostname.replace(/^www\./, "");
        const rootKey = getRootDomain(hostname);
        let list = Array.from(currentConfig.excludedDomains || []);
        const isCurrentlyExcluded = list.some(d => {
            const norm = String(d).toLowerCase().replace(/^www\./, "");
            return norm === hostname || norm === stripped || rootKey && norm === rootKey;
        });
        let nowActive = false;
        if (isCurrentlyExcluded) {
            list = list.filter(d => {
                const norm = String(d).toLowerCase().replace(/^www\./, "");
                return norm !== hostname && norm !== stripped && (!rootKey || norm !== rootKey);
            });
            isGloballyPaused = false;
            nowActive = true;
            scanVideos();
            if (currentConfig.holdClickAction !== "default") {
                ensureYouTubeSpeedmasterSuppressStyle();
            }
        } else {
            list.push(stripped || hostname);
            isGloballyPaused = true;
            nowActive = false;
            if (activeHoveredCtrl) {
                activeHoveredCtrl.setHovered(false);
                activeHoveredCtrl = null;
            }
            releaseAllHoldStates();
            restoreYouTubeSpeedmaster();
        }
        currentConfig.excludedDomains = list;
        selfWriteInProgress = true;
        try {
            if (!cleanupIfInvalidated()) {
                chrome.storage.sync.get("config", data => {
                    const cfg = data && data.config ? Object.assign({}, data.config) : Object.assign({}, currentConfig);
                    cfg.excludedDomains = list;
                    currentConfig.excludedDomains = list;
                    chrome.storage.sync.set({
                        config: cfg
                    }).finally(() => {
                        selfWriteInProgress = false;
                    });
                });
            } else {
                selfWriteInProgress = false;
            }
        } catch (e) {
            selfWriteInProgress = false;
            cleanupIfInvalidated();
        }
        activeControllers.forEach(ctrl => ctrl.updateVisibility());
        reportVideoPresence();
        const ctrlToNotify = initiatingCtrl || activeHoveredCtrl || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
        if (ctrlToNotify && typeof ctrlToNotify.showHUD === "function") {
            ctrlToNotify.showHUD(nowActive ? "Extension Activated" : "Extension Deactivated");
        }
        return nowActive;
    }
    try {
        if (isExtensionValid()) {
            chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
                if (cleanupIfInvalidated()) return;
                if (!msg) return;
                if (msg.type === "queryVideoPresence") {
                    const count = isGloballyPaused || isDomainExcluded() ? 0 : activeControllers.size;
                    sendResponse({
                        hasVideo: count > 0,
                        videoCount: count
                    });
                    return true;
                } else if (msg.type === "supportModalState") {
                    setSupportActive(msg.open, msg.duration);
                    if (typeof sendResponse === "function") sendResponse({
                        status: "ok"
                    });
                    return;
                } else if (msg.type === "setDomainStatus") {
                    if (autoReactivateTimer) {
                        clearTimeout(autoReactivateTimer);
                        autoReactivateTimer = null;
                        autoReactivateEndTime = 0;
                    }
                    if (reactivateKeyHoldState) {
                        if (reactivateKeyHoldState.timer) clearTimeout(reactivateKeyHoldState.timer);
                        if (reactivateKeyHoldState.hudTimer) clearTimeout(reactivateKeyHoldState.hudTimer);
                        reactivateKeyHoldState = null;
                    }
                    const hostname = (window.location.hostname || (window.location.protocol === "file:" ? "local_file" : "")).toLowerCase();
                    const stripped = hostname.replace(/^www\./, "");
                    const rootKey = getRootDomain(hostname);
                    let list = Array.from(currentConfig.excludedDomains || []);
                    if (msg.enabled) {
                        list = list.filter(d => {
                            const norm = String(d).toLowerCase().replace(/^www\./, "");
                            return norm !== hostname && norm !== stripped && (!rootKey || norm !== rootKey);
                        });
                        isGloballyPaused = false;
                        currentConfig.excludedDomains = list;
                        scanVideos();
                        if (currentConfig.holdClickAction !== "default") {
                            ensureYouTubeSpeedmasterSuppressStyle();
                        }
                    } else {
                        const isCurrentlyExcluded = list.some(d => {
                            const norm = String(d).toLowerCase().replace(/^www\./, "");
                            return norm === hostname || norm === stripped || rootKey && norm === rootKey;
                        });
                        if (!isCurrentlyExcluded && stripped) {
                            list.push(stripped);
                        }
                        isGloballyPaused = true;
                        currentConfig.excludedDomains = list;
                        if (activeHoveredCtrl) {
                            activeHoveredCtrl.setHovered(false);
                            activeHoveredCtrl = null;
                        }
                        releaseAllHoldStates();
                        restoreYouTubeSpeedmaster();
                    }
                    selfWriteInProgress = true;
                    try {
                        if (!cleanupIfInvalidated()) {
                            chrome.storage.sync.get("config", data => {
                                const cfg = data && data.config ? Object.assign({}, data.config) : Object.assign({}, currentConfig);
                                cfg.excludedDomains = list;
                                chrome.storage.sync.set({
                                    config: cfg
                                }).finally(() => {
                                    selfWriteInProgress = false;
                                });
                            });
                        } else {
                            selfWriteInProgress = false;
                        }
                    } catch (e) {
                        selfWriteInProgress = false;
                    }
                    activeControllers.forEach(ctrl => ctrl.updateVisibility());
                    reportVideoPresence();
                    const isExc = isDomainExcluded();
                    const isAct = !isGloballyPaused && !isExc;
                    if (typeof sendResponse === "function") {
                        sendResponse({
                            enabled: isAct,
                            isActive: isAct,
                            isGloballyPaused: isGloballyPaused,
                            isExcluded: isExc,
                            videoCount: activeControllers.size
                        });
                    }
                    return true;
                } else if (msg.type === "toggleDomainStatus") {
                    if (autoReactivateTimer) {
                        clearTimeout(autoReactivateTimer);
                        autoReactivateTimer = null;
                        autoReactivateEndTime = 0;
                    }
                    const nowActive = toggleSiteDeactivation();
                    sendResponse({
                        enabled: nowActive,
                        domain: window.location.hostname
                    });
                } else if (msg.type === "getDomainStatus") {
                    if (window !== window.top) return;
                    const hostname = window.location.hostname || (window.location.protocol === "file:" ? "local_file" : "");
                    let activeVol = 1;
                    let activeSpeed = 1;
                    if (activeControllers.size > 0) {
                        const firstCtrl = activeControllers.values().next().value;
                        if (firstCtrl) {
                            activeVol = firstCtrl.getEffectiveVolume();
                            if (firstCtrl.video && firstCtrl.video.playbackRate) {
                                activeSpeed = firstCtrl.video.playbackRate;
                            }
                        }
                    }
                    const isExcluded = isDomainExcluded();
                    const isDeactivated = isGloballyPaused || isExcluded;
                    sendResponse({
                        enabled: !isDeactivated,
                        isActive: !isDeactivated,
                        isExcluded: isExcluded,
                        domain: hostname,
                        videoCount: activeControllers.size,
                        currentSpeed: activeSpeed,
                        currentVolume: activeVol,
                        isGloballyPaused: isGloballyPaused,
                        isGloballyHidden: isGloballyHidden,
                        siteSpeed: getDomainSpeed(),
                        siteVolume: getDomainVolume()
                    });
                    return true;
                } else if (msg.type === "setSiteSpeed") {
                    const hostname = (window.location.hostname || "").toLowerCase().replace(/^www\./, "");
                    if (!currentConfig.siteSpeeds) currentConfig.siteSpeeds = {};
                    if (msg.speed === null || msg.speed === void 0 || msg.speed === 0 || Math.abs(Number(msg.speed) - 1) < .001) {
                        delete currentConfig.siteSpeeds[hostname];
                        delete currentConfig.siteSpeeds["www." + hostname];
                        delete currentConfig.siteSpeeds[window.location.hostname.toLowerCase()];
                        const rootKey = getRootDomain(hostname);
                        if (rootKey) delete currentConfig.siteSpeeds[rootKey];
                        setAllVideosSpeed(1, false);
                    } else {
                        const val = Math.max(.1, Math.min(100, Number(msg.speed)));
                        currentConfig.siteSpeeds[hostname] = val;
                        setAllVideosSpeed(val, false);
                    }
                    sendResponse({
                        status: "ok",
                        siteSpeed: getDomainSpeed()
                    });
                } else if (msg.type === "setSiteVolume") {
                    const hostname = (window.location.hostname || "").toLowerCase().replace(/^www\./, "");
                    if (!currentConfig.siteVolumes) currentConfig.siteVolumes = {};
                    if (msg.volume === null || msg.volume === void 0) {
                        delete currentConfig.siteVolumes[hostname];
                        delete currentConfig.siteVolumes["www." + hostname];
                        delete currentConfig.siteVolumes[window.location.hostname.toLowerCase()];
                        const rootKey = getRootDomain(hostname);
                        if (rootKey) delete currentConfig.siteVolumes[rootKey];
                        const rawDef = Number(currentConfig.defaultVolume);
                        const defVol = !isNaN(rawDef) && rawDef >= 0 ? rawDef > 6 ? rawDef / 100 : rawDef : 1;
                        const targetVol = Math.max(0, Math.min(currentConfig.volumeBoostEnabled ? 6 : 1, defVol));
                        setAllVideosVolume(targetVol, false);
                    } else {
                        const maxVol = currentConfig.volumeBoostEnabled ? 6 : 1;
                        const val = Math.max(0, Math.min(maxVol, Number(msg.volume)));
                        currentConfig.siteVolumes[hostname] = val;
                        setAllVideosVolume(val, false);
                    }
                    sendResponse({
                        status: "ok",
                        siteVolume: getDomainVolume()
                    });
                } else if (msg.type === "setSpeed") {
                    setAllVideosSpeed(msg.speed, true);
                    sendResponse({
                        status: "ok"
                    });
                } else if (msg.type === "setVolume") {
                    setAllVideosVolume(msg.volume, true);
                    sendResponse({
                        status: "ok"
                    });
                } else if (msg.type === "resetPosition") {
                    activeControllers.forEach(ctrl => ctrl.resetPosition());
                    sendResponse({
                        status: "ok"
                    });
                }
                return true;
            });
        }
    } catch (e) {}
    function setAllVideosSpeed(speed, isManual = true) {
        const val = Math.max(.1, Math.min(16, Number(speed)));
        activeControllers.forEach((ctrl, video) => {
            ctrl._isApplyingSpeed = true;
            try {
                video.playbackRate = val;
            } finally {
                ctrl._isApplyingSpeed = false;
            }
            ctrl.showHUD(`Speed: ${val.toFixed(2)}x`);
            ctrl.updateState();
        });
    }
    function setAllVideosVolume(volume, isManual = false) {
        const maxVol = currentConfig.volumeBoostEnabled ? 6 : 1;
        const val = Math.max(0, Math.min(maxVol, Number(volume)));
        activeControllers.forEach(ctrl => {
            ctrl._userExplicitlyAdjustedNativeVolume = false;
            ctrl.setEffectiveVolume(val, isManual);
        });
    }
    function isVideoInFullscreen(video, fsEl) {
        if (!video) return false;
        if (!fsEl) {
            fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        }
        if (fsEl) {
            if (fsEl === video) return true;
            if (fsEl.contains && fsEl.contains(video)) return true;
            let curr = video;
            while (curr) {
                if (curr === fsEl) return true;
                if (curr.parentElement) {
                    curr = curr.parentElement;
                } else if (curr.parentNode && curr.parentNode.host) {
                    curr = curr.parentNode.host;
                } else if (curr.assignedSlot) {
                    curr = curr.assignedSlot;
                } else if (curr.host) {
                    curr = curr.host;
                } else {
                    break;
                }
                if (fsEl.contains && fsEl.contains(curr)) return true;
            }
            try {
                const vRect = video.getBoundingClientRect();
                const winW = window.innerWidth;
                const winH = window.innerHeight;
                if (vRect && vRect.width >= winW * .45 && vRect.height >= winH * .45) {
                    return true;
                }
            } catch (e) {}
        }
        if (video.classList && video.classList.contains("gvc-page-fullscreen-video")) return true;
        try {
            const vRect = video.getBoundingClientRect();
            const winW = window.innerWidth;
            const winH = window.innerHeight;
            if (vRect && vRect.width > 0 && vRect.height > 0) {
                if (vRect.width >= winW - 14 && vRect.height >= winH - 14) {
                    return true;
                }
                const player = typeof video.closest === "function" ? video.closest('.html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, [class*="player" i]') : null;
                if (player) {
                    const pRect = player.getBoundingClientRect();
                    if (pRect.width >= winW - 14 && pRect.height >= winH - 14) {
                        return true;
                    }
                    if (player.classList && (player.classList.contains("ytp-fullscreen") || player.classList.contains("vjs-fullscreen") || player.classList.contains("jw-flag-fullscreen") || player.classList.contains("plyr--fullscreen-active") || player.classList.contains("is-fullscreen") || player.classList.contains("fullscreen"))) {
                        return true;
                    }
                }
            }
        } catch (e) {}
        return false;
    }
    function getVisibleVideoRect(video) {
        if (!video || !video.isConnected) return null;
        let raw;
        try {
            raw = video.getBoundingClientRect();
        } catch (e) {
            return null;
        }
        if (!raw || raw.width < 20 || raw.height < 20) return null;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const isFullscreen = !!(isVideoInFullscreen(video, fsEl) || video && video.classList && video.classList.contains("gvc-page-fullscreen-video"));
        if (isFullscreen) {
            const contW = fsEl && fsEl.clientWidth || window.innerWidth;
            const contH = fsEl && fsEl.clientHeight || window.innerHeight;
            const left2 = Math.max(0, Math.min(contW, raw.left));
            const top2 = Math.max(0, Math.min(contH, raw.top));
            const right2 = Math.max(left2, Math.min(contW, raw.right));
            const bottom2 = Math.max(top2, Math.min(contH, raw.bottom));
            return {
                left: left2,
                top: top2,
                right: right2,
                bottom: bottom2,
                width: Math.max(0, right2 - left2),
                height: Math.max(0, bottom2 - top2)
            };
        }
        let left = raw.left;
        let top = raw.top;
        let right = raw.right;
        let bottom = raw.bottom;
        let el = video.parentElement || (video.parentNode && video.parentNode.host ? video.parentNode.host : null);
        while (el && el !== document.body && el !== document.documentElement) {
            try {
                const style = window.getComputedStyle(el);
                const ox = style.overflowX;
                const oy = style.overflowY;
                const isClipping = ox !== "visible" && ox !== "" || oy !== "visible" && oy !== "" || style.contain === "paint" || style.contain === "strict";
                if (isClipping) {
                    const pRect = el.getBoundingClientRect();
                    left = Math.max(left, pRect.left);
                    top = Math.max(top, pRect.top);
                    right = Math.min(right, pRect.right);
                    bottom = Math.min(bottom, pRect.bottom);
                }
                const tag = el.tagName ? el.tagName.toLowerCase() : "";
                const isPlayerContainer = el.classList.contains("html5-video-player") || el.classList.contains("ytd-reel-item-renderer") || el.classList.contains("ytd-reel-video-renderer") || el.id === "player-container" || tag === "ytd-reel-item-renderer" || tag === "ytd-reel-video-renderer" || tag === "ytd-shorts" || tag === "ytd-video-preview" || tag === "shreddit-player";
                if (isPlayerContainer) {
                    const pRect = el.getBoundingClientRect();
                    if (pRect.width > 20 && pRect.height > 20) {
                        left = Math.max(left, pRect.left);
                        top = Math.max(top, pRect.top);
                        right = Math.min(right, pRect.right);
                        bottom = Math.min(bottom, pRect.bottom);
                    }
                }
            } catch (err) {}
            el = el.parentElement || (el.parentNode && el.parentNode.host ? el.parentNode.host : null);
        }
        const width = right - left;
        const height = bottom - top;
        if (width < 30 || height < 30) return null;
        return {
            left: left,
            top: top,
            right: right,
            bottom: bottom,
            width: width,
            height: height
        };
    }
    const OMNI_CSS = `\n\n:host {\n  all: initial;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 0;\n  height: 0;\n  z-index: 2147483647;\n  pointer-events: none;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  user-select: none;\n  -webkit-user-select: none;\n}\n\n* {\n  box-sizing: border-box;\n}\n\n.omni-container {\n  position: fixed;\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  pointer-events: auto;\n  z-index: 2147483647;\n  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s;\n  opacity: var(--omni-opacity, 0.90);\n  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.45));\n  visibility: visible;\n  transform: scale(var(--omni-scale, 1.0));\n  transform-origin: top left;\n}\n\n.omni-container::before {\n  display: none;\n  content: "";\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: calc(36px / var(--omni-scale, 1.0));\n  height: calc(36px / var(--omni-scale, 1.0));\n  pointer-events: auto;\n  z-index: 0;\n}\n\n.omni-container.expanded {\n  width: calc(36px / var(--omni-scale, 1.0));\n  min-width: 36px;\n  height: auto;\n  border-radius: 0;\n}\n\n.omni-container.expanded::before {\n  display: block;\n}\n\n.omni-container.position-top-left {\n  transform-origin: top left;\n}\n\n.omni-container.position-top-right {\n  transform-origin: top right;\n}\n\n.omni-container.position-top-right::before {\n  left: auto;\n  right: 0;\n}\n\n.omni-container.hover-hidden {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  visibility: hidden !important;\n  transform: scale(calc(var(--omni-scale, 1.0) * 0.85)) !important;\n}\n\n.omni-container.hidden {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  visibility: hidden !important;\n  transform: scale(calc(var(--omni-scale, 1.0) * 0.85)) !important;\n}\n\n.omni-container.omni-cursor-hidden,\n.omni-container.omni-cursor-hidden * {\n  cursor: none !important;\n}\n\n:host-context(html.omni-cursor-hidden) *,\n:host-context(body.omni-cursor-hidden) * {\n  cursor: none !important;\n}\n\n@keyframes omniPulse {\n  0% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 0 transparent; }\n  50% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55), 0 0 17px var(--omni-active-color, #38bdf8); }\n  100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 0 transparent; }\n}\n\n@keyframes omniPulseHover {\n  0% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 0 transparent; }\n  50% { box-shadow: 0 6px 22px rgba(0, 0, 0, 0.62), 0 0 22px var(--omni-active-color, #38bdf8); }\n  100% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 0 transparent; }\n}\n\n@keyframes omniPulseExpanded {\n  0% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px var(--omni-active-color, #38bdf8); }\n  50% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.55), 0 0 17px var(--omni-active-color, #38bdf8); }\n  100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px var(--omni-active-color, #38bdf8); }\n}\n\n@keyframes omniPulseHoverExpanded {\n  0% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px var(--omni-active-color, #38bdf8); }\n  50% { box-shadow: 0 6px 22px rgba(0, 0, 0, 0.62), 0 0 22px var(--omni-active-color, #38bdf8); }\n  100% { box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px var(--omni-active-color, #38bdf8); }\n}\n\n@keyframes omniSubPulse {\n  0% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 6px currentColor; }\n  50% { box-shadow: 0 3px 14px rgba(0, 0, 0, 0.6), 0 0 16px currentColor; }\n  100% { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 6px currentColor; }\n}\n\n@keyframes omniSubPulseHover {\n  0% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor; }\n  50% { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.65), 0 0 18px currentColor; }\n  100% { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor; }\n}\n\n\n.omni-minimized {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  background: var(--omni-btn-bg, #181926);\n  border: 1.5px solid var(--omni-active-color, #38bdf8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);\n  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s, box-shadow 0.2s;\n  overflow: hidden;\n  position: relative;\n  z-index: 5;\n  pointer-events: auto;\n}\n\n.omni-minimized:hover {\n  transform: scale(1.18);\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6);\n  background: #24273a;\n}\n\n.omni-minimized.omni-pulsing {\n  animation: omniPulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n.omni-minimized.omni-pulsing:hover {\n  animation: omniPulseHover 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n\n.omni-container.expanded .omni-minimized {\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5), 0 0 10px var(--omni-active-color, #38bdf8);\n}\n\n.omni-container.expanded .omni-minimized:hover {\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px var(--omni-active-color, #38bdf8);\n}\n\n.omni-container.expanded .omni-minimized.omni-pulsing {\n  animation: omniPulseExpanded 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n.omni-container.expanded .omni-minimized.omni-pulsing:hover {\n  animation: omniPulseHoverExpanded 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n\n.omni-sub-btn.omni-pulsing {\n  animation: omniSubPulse 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n.omni-sub-btn.omni-pulsing:hover {\n  animation: omniSubPulseHover 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n.omni-minimized svg {\n  width: 16px;\n  height: 16px;\n  fill: var(--omni-active-color, #38bdf8);\n  transform-origin: center;\n  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\n}\n\n.omni-minimized:hover svg {\n  transform: rotate(120deg);\n}\n\n\n.omni-sub-controls {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  margin-top: 8px;\n  padding-bottom: 6px;\n  width: 32px;\n  opacity: 0;\n  visibility: hidden;\n  pointer-events: none;\n  transform-origin: top center;\n  transform: translateY(-20px) scale(0.75);\n  transition: opacity 0.20s cubic-bezier(0.4, 0, 1, 1), transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.22s;\n  position: relative;\n  z-index: 1;\n}\n\n.omni-sub-controls.visible {\n  opacity: 1;\n  visibility: visible;\n  pointer-events: auto;\n  transform-origin: top center;\n  transform: translateY(0) scale(1);\n  transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1), transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.24s;\n}\n\n.omni-container.position-top-right .omni-sub-controls {\n  align-items: center;\n}\n\n.omni-container.position-top-left .omni-sub-controls {\n  align-items: center;\n}\n\n@keyframes omniTriggerFlash {\n  0% { transform: scale(1); filter: brightness(1); }\n  50% { transform: scale(0.92); filter: brightness(1.5) drop-shadow(0 0 10px var(--omni-active-color, #38bdf8)); }\n  100% { transform: scale(1); filter: brightness(1); }\n}\n\n.omni-minimized.trigger-flash {\n  animation: omniTriggerFlash 0.28s ease-out;\n}\n\n\n.omni-sub-btn {\n  width: 26px;\n  height: 26px;\n  border-radius: 50%;\n  background: var(--omni-btn-bg, #181926);\n  border: 1.5px solid var(--omni-controls-color, #38bdf8);\n  color: var(--omni-controls-color, #38bdf8);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  cursor: pointer;\n  padding: 0;\n  outline: none;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5), 0 0 6px color-mix(in srgb, var(--omni-controls-color, #38bdf8) 45%, transparent);\n  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;\n  flex-shrink: 0;\n  line-height: 1;\n  position: relative;\n  box-sizing: border-box;\n}\n\n.omni-sub-btn svg {\n  width: 14px;\n  height: 14px;\n  fill: currentColor;\n  display: block;\n}\n\n.omni-sub-btn[data-control="loop"] svg {\n  fill: none;\n  stroke: currentColor;\n  stroke-width: 2.6;\n}\n\n\n.omni-sub-btn:hover {\n  transform: scale(1.18) translateY(-1px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor;\n  background: #24273a;\n}\n\n.omni-sub-btn[data-control="loop"]:hover {\n  transform: rotate(180deg) scale(1.15);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor;\n}\n\n.omni-sub-btn[data-control="settings"]:hover {\n  transform: rotate(60deg) scale(1.15);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor;\n}\n\n.omni-sub-btn[data-control="speed"]:hover,\n.omni-sub-btn[data-control="volume"]:hover,\n.omni-sub-btn[data-control="pip"]:hover,\n.omni-sub-btn[data-control="progressBar"]:hover {\n  transform: scale(1.18) translateY(-1px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor;\n}\n\n.omni-sub-btn[data-control="hide"]:hover {\n  transform: rotate(180deg) scale(1.15);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6), 0 0 10px currentColor;\n}\n\n@keyframes omniBtnPopGlow {\n  0% { transform: scale(1); }\n  50% { transform: scale(1.22) translateY(-1px); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-active-color, #38bdf8); background: #24273a; }\n  100% { transform: scale(1); }\n}\n\n@keyframes omniBtnSpinLoop {\n  0% { transform: scale(1) rotate(0deg); }\n  50% { transform: scale(1.24) rotate(180deg); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px currentColor; background: #24273a; }\n  100% { transform: scale(1) rotate(360deg); }\n}\n\n@keyframes omniBtnSpin180 {\n  0% { transform: scale(1) rotate(0deg); }\n  50% { transform: scale(1.2) rotate(180deg); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-active-color, #38bdf8); background: #24273a; }\n  100% { transform: scale(1) rotate(0deg); }\n}\n\n@keyframes omniBtnSpinSettings {\n  0% { transform: scale(1) rotate(0deg); }\n  50% { transform: scale(1.2) rotate(60deg); box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-active-color, #38bdf8); background: #24273a; }\n  100% { transform: scale(1) rotate(0deg); }\n}\n\n.omni-sub-btn.trigger-anim {\n  animation: omniBtnPopGlow 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;\n}\n\n.omni-sub-btn[data-control="loop"].trigger-anim {\n  animation: omniBtnSpinLoop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;\n}\n\n.omni-sub-btn[data-control="hide"].trigger-anim {\n  animation: omniBtnSpin180 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;\n}\n\n.omni-sub-btn[data-control="settings"].trigger-anim {\n  animation: omniBtnSpinSettings 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) !important;\n}\n\n\n.omni-sub-btn[data-control="loop"].is-looping,\n.omni-sub-btn[data-control="speed"].is-active,\n.omni-sub-btn[data-control="volume"].is-muted,\n.omni-sub-btn[data-control="pip"].is-active,\n.omni-sub-btn[data-control="progressBar"].is-active,\n.omni-sub-btn.is-looping,\n.omni-sub-btn.is-active,\n.omni-sub-btn.is-muted {\n  border-color: var(--omni-state-color, #a855f7) !important;\n  color: var(--omni-state-color, #a855f7) !important;\n  background: color-mix(in srgb, var(--omni-state-color, #a855f7) 22%, var(--omni-btn-bg, #181926)) !important;\n  box-shadow: 0 0 10px var(--omni-state-color, #a855f7);\n}\n\n.omni-sub-btn[data-control="loop"].is-looping:hover,\n.omni-sub-btn[data-control="speed"].is-active:hover,\n.omni-sub-btn[data-control="volume"].is-muted:hover,\n.omni-sub-btn[data-control="pip"].is-active:hover,\n.omni-sub-btn[data-control="progressBar"].is-active:hover,\n.omni-sub-btn.is-looping:hover,\n.omni-sub-btn.is-active:hover,\n.omni-sub-btn.is-muted:hover {\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-state-color, #a855f7);\n  border-color: var(--omni-state-color, #a855f7) !important;\n  color: var(--omni-state-color, #a855f7) !important;\n  background: color-mix(in srgb, var(--omni-state-color, #a855f7) 32%, var(--omni-btn-bg, #181926)) !important;\n}\n\n\n.omni-sub-btn.is-looping.omni-pulsing,\n.omni-sub-btn.is-active.omni-pulsing,\n.omni-sub-btn.is-muted.omni-pulsing {\n  animation: omniSubPulseActive 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n.omni-sub-btn.is-looping.omni-pulsing:hover,\n.omni-sub-btn.is-active.omni-pulsing:hover,\n.omni-sub-btn.is-muted.omni-pulsing:hover {\n  animation: omniSubPulseActiveHover 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards !important;\n}\n\n@keyframes omniSubPulseActive {\n  0% { box-shadow: 0 0 10px var(--omni-state-color, #a855f7); }\n  50% { box-shadow: 0 2px 14px rgba(0, 0, 0, 0.6), 0 0 18px var(--omni-state-color, #a855f7); }\n  100% { box-shadow: 0 0 10px var(--omni-state-color, #a855f7); }\n}\n\n@keyframes omniSubPulseActiveHover {\n  0% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-state-color, #a855f7); }\n  50% { box-shadow: 0 4px 18px rgba(0, 0, 0, 0.65), 0 0 22px var(--omni-state-color, #a855f7); }\n  100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6), 0 0 14px var(--omni-state-color, #a855f7); }\n}\n\n\n.omni-sub-btn.is-expanded:not(.is-looping):not(.is-active):not(.is-muted) {\n  border-color: var(--omni-controls-color, #38bdf8);\n  background: color-mix(in srgb, var(--omni-controls-color, #38bdf8) 20%, var(--omni-btn-bg, #181926));\n  box-shadow: 0 0 8px var(--omni-controls-color, #38bdf8);\n}\n\n\n.omni-hud {\n  position: fixed;\n  top: 24px;\n  left: 50%;\n  transform: translateX(-50%) translateY(-6px) scale(var(--omni-hud-scale, 1));\n  transform-origin: center top;\n  background: transparent;\n  border: none;\n  color: #ffffff;\n  padding: 0;\n  border-radius: 0;\n  font-size: 14px;\n  font-weight: 700;\n  letter-spacing: 0.3px;\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  box-shadow: none;\n  backdrop-filter: none;\n  -webkit-backdrop-filter: none;\n  pointer-events: none;\n  opacity: 0;\n  text-shadow: 0 0 8px color-mix(in srgb, var(--omni-active-color, #38bdf8) 45%, transparent),\n               0 1px 2px rgba(0, 0, 0, 0.9),\n               0 2px 5px rgba(0, 0, 0, 0.85);\n  transition: opacity 0.25s ease-out, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\n  z-index: 2147483647;\n}\n\n.omni-hud.active {\n  opacity: var(--omni-opacity, 0.95);\n  transform: translateX(-50%) translateY(0) scale(var(--omni-hud-scale, 1));\n}\n\n.omni-hud .hud-icon {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--omni-active-color, #38bdf8) 45%, transparent)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9));\n}\n\n.omni-hud .hud-icon svg {\n  width: 17px;\n  height: 17px;\n  fill: var(--omni-active-color, #38bdf8);\n  transform-origin: center;\n  transform: rotate(0deg);\n  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);\n  will-change: transform;\n}\n\n.omni-hud .hud-icon svg.is-spinning {\n  animation: omniHudTriangleSpin 0.48s linear infinite !important;\n  transition: none !important;\n}\n\n.omni-hud .hud-icon svg.is-spinning.reverse {\n  animation: omniHudTriangleSpinReverse 0.48s linear infinite !important;\n  transition: none !important;\n}\n\n@keyframes omniHudTriangleSpin {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(360deg);\n  }\n}\n\n@keyframes omniHudTriangleSpinReverse {\n  0% {\n    transform: rotate(0deg);\n  }\n  100% {\n    transform: rotate(-360deg);\n  }\n}\n\n\n\n.omni-sub-item {\n  position: relative;\n  width: 26px;\n  height: 26px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n\n.omni-loop-bar,\n.omni-speed-bar,\n.omni-volume-bar {\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n  display: flex;\n  align-items: center;\n  height: 28px;\n  box-sizing: border-box;\n  gap: 6px;\n  background: rgba(24, 25, 38, 0.95);\n  border: 1px solid rgba(255, 255, 255, 0.18);\n  border-radius: 6px;\n  padding: 3px 8px;\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.6);\n  backdrop-filter: blur(10px);\n  -webkit-backdrop-filter: blur(10px);\n  white-space: nowrap;\n  z-index: 2147483647;\n  pointer-events: auto;\n  user-select: none;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\n  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.omni-container.position-top-left .omni-loop-bar,\n.omni-container.position-top-left .omni-speed-bar,\n.omni-container.position-top-left .omni-volume-bar,\n.omni-container:not(.position-top-right) .omni-loop-bar,\n.omni-container:not(.position-top-right) .omni-speed-bar,\n.omni-container:not(.position-top-right) .omni-volume-bar {\n  left: calc(100% + 10px);\n  right: auto;\n  transform-origin: left center;\n}\n\n.omni-container.position-top-right .omni-loop-bar,\n.omni-container.position-top-right .omni-speed-bar,\n.omni-container.position-top-right .omni-volume-bar {\n  right: calc(100% + 10px);\n  left: auto;\n  transform-origin: right center;\n}\n\n.omni-loop-bar.collapsed,\n.omni-speed-bar.collapsed,\n.omni-volume-bar.collapsed {\n  display: none !important;\n}\n\n\n.omni-speed-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 105px;\n  height: 4px;\n  flex-shrink: 0;\n  background: rgba(255, 255, 255, 0.22);\n  border-radius: 2px;\n  outline: none;\n  margin: 0;\n  padding: 0;\n  cursor: pointer;\n}\n\n.omni-speed-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  border: 1.5px solid #ffffff;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  cursor: pointer;\n  transition: transform 0.1s, box-shadow 0.1s;\n}\n\n.omni-speed-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.2);\n  box-shadow: 0 0 8px var(--omni-active-color, #38bdf8);\n}\n\n.omni-speed-slider::-moz-range-thumb {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  border: 1.5px solid #ffffff;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  cursor: pointer;\n}\n\n.omni-speed-readout {\n  color: #ffffff;\n  font-size: 11px;\n  font-weight: 700;\n  min-width: 44px;\n  flex-shrink: 0;\n  text-align: center;\n  font-variant-numeric: tabular-nums;\n  letter-spacing: -0.2px;\n}\n\n.omni-speed-presets {\n  display: flex;\n  align-items: center;\n  flex-shrink: 0;\n  gap: 3px;\n}\n\n.omni-preset-btn {\n  background: rgba(255, 255, 255, 0.1);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 4px;\n  color: #e4e4e7;\n  font-size: 10px;\n  font-weight: 600;\n  padding: 2px 5px;\n  height: 20px;\n  line-height: 14px;\n  box-sizing: border-box;\n  cursor: pointer;\n  transition: all 0.15s ease;\n  user-select: none;\n}\n\n.omni-preset-btn:hover {\n  background: rgba(56, 189, 248, 0.25);\n  border-color: var(--omni-active-color, #38bdf8);\n  color: #ffffff;\n  transform: translateY(-1px);\n}\n\n.omni-preset-btn:active {\n  transform: translateY(0);\n}\n\n.omni-preset-btn.is-active {\n  background: var(--omni-active-color, #38bdf8);\n  border-color: #ffffff;\n  color: #0f111a;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n}\n\n\n.omni-volume-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 105px;\n  height: 4px;\n  flex-shrink: 0;\n  background: rgba(255, 255, 255, 0.22);\n  border-radius: 2px;\n  outline: none;\n  margin: 0;\n  padding: 0;\n  cursor: pointer;\n}\n\n.omni-volume-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  border: 1.5px solid #ffffff;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  cursor: pointer;\n  transition: transform 0.1s, box-shadow 0.1s;\n}\n\n.omni-volume-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.2);\n  box-shadow: 0 0 8px var(--omni-active-color, #38bdf8);\n}\n\n.omni-volume-slider::-moz-range-thumb {\n  width: 12px;\n  height: 12px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  border: 1.5px solid #ffffff;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  cursor: pointer;\n}\n\n.omni-volume-readout {\n  color: #ffffff;\n  font-size: 11px;\n  font-weight: 700;\n  min-width: 44px;\n  flex-shrink: 0;\n  text-align: center;\n  font-variant-numeric: tabular-nums;\n  letter-spacing: -0.2px;\n}\n\n.omni-loop-label {\n  color: #ffffff;\n  font-size: 12px;\n  font-weight: 700;\n  letter-spacing: -0.2px;\n}\n\n.omni-loop-colon {\n  color: #ffffff;\n  font-size: 13px;\n  font-weight: 700;\n  line-height: 1;\n}\n\n.omni-loop-input {\n  width: 26px;\n  height: 20px;\n  background: #ffffff;\n  color: #000000;\n  border: 1px solid #d1d5db;\n  border-radius: 2px;\n  font-size: 12px;\n  font-weight: 700;\n  text-align: center;\n  padding: 0;\n  outline: none;\n  font-family: inherit;\n  -moz-appearance: textfield;\n  appearance: textfield;\n}\n\n.omni-loop-input::-webkit-outer-spin-button,\n.omni-loop-input::-webkit-inner-spin-button {\n  -webkit-appearance: none;\n  appearance: none;\n  margin: 0;\n}\n\n.omni-loop-input:focus {\n  border-color: #3b82f6;\n  box-shadow: 0 0 0 1px #3b82f6;\n}\n\n\n.omni-loop-switch,\n.omni-volume-switch {\n  position: relative;\n  display: inline-block;\n  width: 30px;\n  height: 17px;\n  margin-right: 2px;\n  cursor: pointer;\n  flex-shrink: 0;\n}\n\n.omni-loop-switch input,\n.omni-volume-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n}\n\n.omni-loop-slider,\n.omni-volume-slider-knob {\n  position: absolute;\n  cursor: pointer;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: #4b5563;\n  transition: 0.22s ease;\n  border-radius: 17px;\n}\n\n.omni-loop-slider:before,\n.omni-volume-slider-knob:before {\n  position: absolute;\n  content: "";\n  height: 13px;\n  width: 13px;\n  left: 2px;\n  bottom: 2px;\n  background-color: white;\n  transition: 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);\n  border-radius: 50%;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);\n}\n\n.omni-loop-switch input:checked + .omni-loop-slider {\n  background-color: var(--omni-state-color, #f43f5e);\n  box-shadow: 0 0 6px var(--omni-state-color, #f43f5e);\n}\n\n.omni-volume-switch input:checked + .omni-volume-slider-knob {\n  background-color: var(--omni-state-color, #f43f5e);\n  box-shadow: 0 0 6px var(--omni-state-color, #f43f5e);\n}\n\n.omni-loop-switch input:checked + .omni-loop-slider:before,\n.omni-volume-switch input:checked + .omni-volume-slider-knob:before {\n  transform: translateX(13px);\n}\n\n\n.omni-controls-bar {\n  position: fixed !important;\n  height: 30px;\n  background: var(--omni-btn-bg, rgba(18, 20, 32, 0.90));\n  opacity: var(--omni-opacity, 0.90);\n  transform: scale(var(--omni-scale, 1.0));\n  transform-origin: bottom left;\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  border-radius: 9px;\n  display: flex;\n  align-items: center;\n  padding: 0 8px;\n  gap: 6px;\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.65), 0 0 14px rgba(0, 0, 0, 0.4);\n  z-index: 2147483647;\n  pointer-events: auto;\n  user-select: none;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  transition: opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), left 0.18s ease, width 0.18s ease;\n  box-sizing: border-box;\n}\n\n.omni-controls-bar.hover-hidden {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  visibility: hidden !important;\n  transform: translateY(6px) scale(calc(var(--omni-scale, 1.0) * 0.96)) !important;\n}\n\n.omni-controls-bar.hidden {\n  display: none !important;\n}\n\n.omni-cbar-btn {\n  background: transparent;\n  border: none;\n  padding: 0;\n  width: 24px;\n  height: 24px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 5px;\n  cursor: pointer;\n  color: #e2e8f0;\n  transition: background 0.15s, color 0.15s, transform 0.1s;\n  flex-shrink: 0;\n  position: relative;\n}\n\n.omni-cbar-btn::before {\n  content: "";\n  position: absolute;\n  top: -4px;\n  bottom: -4px;\n  left: -4px;\n  right: -4px;\n  pointer-events: auto;\n}\n\n.omni-cbar-btn svg,\n.omni-cbar-btn svg * {\n  width: 14px;\n  height: 14px;\n  fill: currentColor;\n  transition: fill 0.15s ease;\n  pointer-events: none !important;\n}\n\n.omni-cbar-btn:hover {\n  background: rgba(255, 255, 255, 0.14);\n  color: var(--omni-active-color, #38bdf8);\n  transform: scale(1.08);\n}\n\n.omni-cbar-btn:active {\n  transform: scale(0.96);\n}\n\n.omni-cbar-btn.omni-cbar-cc-btn {\n  opacity: 0.60;\n  transition: opacity 0.15s, background 0.15s, color 0.15s, transform 0.1s;\n}\n\n.omni-cbar-btn.omni-cbar-cc-btn.is-active {\n  opacity: 1;\n  color: var(--omni-active-color, #38bdf8);\n}\n\n.omni-cbar-btn.omni-cbar-cc-btn:hover {\n  opacity: 1;\n  background: rgba(255, 255, 255, 0.14);\n  color: var(--omni-active-color, #38bdf8);\n  transform: scale(1.08);\n}\n\n.omni-controls-bar:not(.no-glow) .omni-cbar-cc-btn.is-active {\n  filter: drop-shadow(0 0 5px var(--omni-active-color, #38bdf8));\n}\n\n.omni-cbar-btn.omni-cbar-cc-settings-btn {\n  opacity: 0.60;\n  transition: opacity 0.15s, background 0.15s, color 0.15s, transform 0.1s;\n}\n\n.omni-cbar-btn.omni-cbar-cc-settings-btn:hover,\n.omni-cbar-btn.omni-cbar-cc-settings-btn.is-open {\n  opacity: 1;\n  background: rgba(255, 255, 255, 0.14);\n  color: var(--omni-active-color, #38bdf8);\n  transform: scale(1.08);\n}\n\n.omni-controls-bar:not(.no-glow) .omni-cbar-cc-settings-btn.is-open {\n  filter: drop-shadow(0 0 5px var(--omni-active-color, #38bdf8));\n}\n\n.omni-cbar-btn.omni-cbar-lock-btn {\n  opacity: 0.65;\n  transition: opacity 0.15s, background 0.15s, color 0.15s, transform 0.1s;\n}\n\n.omni-cbar-btn.omni-cbar-lock-btn.is-active {\n  opacity: 1;\n  color: var(--omni-active-color, #38bdf8);\n}\n\n.omni-cbar-btn.omni-cbar-lock-btn:hover {\n  opacity: 1;\n  background: rgba(255, 255, 255, 0.14);\n  color: var(--omni-active-color, #38bdf8);\n  transform: scale(1.08);\n}\n\n.omni-controls-bar:not(.no-glow) .omni-cbar-lock-btn.is-active {\n  filter: drop-shadow(0 0 5px var(--omni-active-color, #38bdf8));\n}\n\n.omni-cbar-time {\n  font-size: 10.5px;\n  font-weight: 700;\n  color: #f1f5f9;\n  letter-spacing: -0.2px;\n  font-variant-numeric: tabular-nums;\n  white-space: nowrap;\n  user-select: none;\n  flex-shrink: 0;\n}\n\n.omni-cbar-timeline-wrap {\n  flex: 1;\n  min-width: 60px;\n  height: 18px;\n  display: flex;\n  align-items: center;\n  position: relative;\n  cursor: pointer;\n  touch-action: none;\n}\n\n.omni-cbar-timeline-track {\n  width: 100%;\n  height: 3px;\n  background: rgba(255, 255, 255, 0.22);\n  border-radius: 2px;\n  position: relative;\n  transition: height 0.15s ease;\n}\n\n.omni-cbar-timeline-wrap:hover .omni-cbar-timeline-track,\n.omni-cbar-timeline-wrap.scrubbing .omni-cbar-timeline-track {\n  height: 4.5px;\n}\n\n.omni-cbar-buffered {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  background: rgba(255, 255, 255, 0.35);\n  border-radius: 2px;\n  width: 0%;\n  pointer-events: none;\n}\n\n.omni-cbar-progress {\n  position: absolute;\n  top: 0;\n  left: 0;\n  height: 100%;\n  background: var(--omni-active-color, #38bdf8);\n  border-radius: 2px;\n  width: 0%;\n  pointer-events: none;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n}\n\n.omni-cbar-thumb {\n  position: absolute;\n  top: 50%;\n  left: 0%;\n  transform: translate(-50%, -50%) scale(0);\n  width: 9px;\n  height: 9px;\n  border-radius: 50%;\n  background: #ffffff;\n  border: 1.5px solid var(--omni-active-color, #38bdf8);\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  pointer-events: none;\n  transition: transform 0.15s ease;\n}\n\n.omni-cbar-timeline-wrap:hover .omni-cbar-thumb,\n.omni-cbar-timeline-wrap.scrubbing .omni-cbar-thumb {\n  transform: translate(-50%, -50%) scale(1);\n}\n\n.omni-cbar-time-tooltip {\n  position: absolute;\n  bottom: calc(100% + 5px);\n  left: 0;\n  transform: translateX(-50%);\n  background: rgba(15, 17, 26, 0.95);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  color: #ffffff;\n  font-size: 10px;\n  font-weight: 700;\n  padding: 2px 6px;\n  border-radius: 4px;\n  pointer-events: none;\n  opacity: 0;\n  transition: opacity 0.1s ease;\n  white-space: nowrap;\n}\n\n.omni-cbar-timeline-wrap:hover .omni-cbar-time-tooltip {\n  opacity: 1;\n}\n\n.omni-cbar-vol-slider-wrap {\n  width: 0px;\n  overflow: hidden;\n  transition: width 0.2s ease, margin 0.2s ease;\n  display: flex;\n  align-items: center;\n}\n\n.omni-cbar-vol-wrap:hover .omni-cbar-vol-slider-wrap,\n.omni-cbar-vol-wrap.active .omni-cbar-vol-slider-wrap {\n  width: 55px;\n  margin-left: 4px;\n  margin-right: 2px;\n}\n\n.omni-cbar-vol-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 55px;\n  height: 4px;\n  background: rgba(255, 255, 255, 0.25);\n  border-radius: 2px;\n  outline: none;\n  cursor: pointer;\n  margin: 0;\n  padding: 0;\n}\n\n.omni-cbar-vol-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  border: 1.5px solid #ffffff;\n  cursor: pointer;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n}\n\n\n.omni-controls-bar.is-fullscreen {\n  height: 48px !important;\n  border-radius: 12px !important;\n  padding: 0 16px !important;\n  gap: 12px !important;\n  transform: none !important;\n  backdrop-filter: blur(18px) !important;\n  -webkit-backdrop-filter: blur(18px) !important;\n  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.75), 0 0 16px rgba(0, 0, 0, 0.45) !important;\n}\n\n.omni-controls-bar.is-fullscreen.hover-hidden {\n  opacity: 0 !important;\n  pointer-events: none !important;\n  visibility: hidden !important;\n  transform: translateY(10px) !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-btn {\n  width: 34px !important;\n  height: 34px !important;\n  border-radius: 7px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-btn svg,\n.omni-controls-bar.is-fullscreen .omni-cbar-btn svg * {\n  width: 18px !important;\n  height: 18px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-time {\n  font-size: 13.5px !important;\n  font-weight: 700 !important;\n  letter-spacing: 0px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-timeline-wrap {\n  height: 28px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-timeline-track {\n  height: 6px !important;\n  border-radius: 3px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-timeline-wrap:hover .omni-cbar-timeline-track,\n.omni-controls-bar.is-fullscreen .omni-cbar-timeline-wrap.scrubbing .omni-cbar-timeline-track {\n  height: 9px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-buffered,\n.omni-controls-bar.is-fullscreen .omni-cbar-progress {\n  border-radius: 3px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-progress {\n  box-shadow: 0 0 8px var(--omni-active-color, #38bdf8) !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-thumb {\n  width: 14px !important;\n  height: 14px !important;\n  border-width: 2px !important;\n  box-shadow: 0 0 8px var(--omni-active-color, #38bdf8) !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-time-tooltip {\n  font-size: 12px !important;\n  padding: 3px 8px !important;\n  bottom: calc(100% + 8px) !important;\n  border-radius: 5px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-vol-wrap:hover .omni-cbar-vol-slider-wrap,\n.omni-controls-bar.is-fullscreen .omni-cbar-vol-wrap.active .omni-cbar-vol-slider-wrap {\n  width: 75px !important;\n  margin-left: 6px !important;\n  margin-right: 4px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-vol-slider {\n  width: 75px !important;\n  height: 6px !important;\n  border-radius: 3px !important;\n}\n\n.omni-controls-bar.is-fullscreen .omni-cbar-vol-slider::-webkit-slider-thumb {\n  width: 13px !important;\n  height: 13px !important;\n}\n\n.omni-subtitles-overlay.is-fullscreen {\n  bottom: calc(88px + var(--sub-bottom-offset, 0px)) !important;\n}\n\n.omni-subtitles-overlay.is-fullscreen.controls-hidden {\n  bottom: calc(32px + var(--sub-bottom-offset, 0px)) !important;\n}\n\n\n.omni-container.no-glow .omni-minimized,\n.omni-container.no-glow.expanded .omni-minimized {\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5) !important;\n}\n\n.omni-container.no-glow .omni-minimized:hover,\n.omni-container.no-glow.expanded .omni-minimized:hover {\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6) !important;\n}\n\n.omni-container.no-glow .omni-minimized.omni-pulsing,\n.omni-container.no-glow.expanded .omni-minimized.omni-pulsing {\n  animation: none !important;\n  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5) !important;\n}\n\n.omni-container.no-glow .omni-minimized.omni-pulsing:hover,\n.omni-container.no-glow.expanded .omni-minimized.omni-pulsing:hover {\n  animation: none !important;\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6) !important;\n}\n\n.omni-container.no-glow .omni-minimized.trigger-flash {\n  animation: none !important;\n}\n\n.omni-container.no-glow .omni-sub-btn,\n.omni-container.no-glow .omni-sub-btn.is-expanded,\n.omni-container.no-glow .omni-sub-btn[data-control="loop"].is-looping,\n.omni-container.no-glow .omni-sub-btn[data-control="speed"].is-active,\n.omni-container.no-glow .omni-sub-btn[data-control="volume"].is-muted,\n.omni-container.no-glow .omni-sub-btn[data-control="pip"].is-active,\n.omni-container.no-glow .omni-sub-btn[data-control="progressBar"].is-active,\n.omni-container.no-glow .omni-sub-btn.is-looping,\n.omni-container.no-glow .omni-sub-btn.is-active,\n.omni-container.no-glow .omni-sub-btn.is-muted {\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;\n}\n\n.omni-container.no-glow .omni-sub-btn:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="loop"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="speed"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="volume"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="pip"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="progressBar"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="hide"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="settings"]:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="speed"].is-active:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="volume"].is-muted:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="pip"].is-active:hover,\n.omni-container.no-glow .omni-sub-btn[data-control="progressBar"].is-active:hover,\n.omni-container.no-glow .omni-sub-btn.is-looping:hover,\n.omni-container.no-glow .omni-sub-btn.is-active:hover,\n.omni-container.no-glow .omni-sub-btn.is-muted:hover {\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;\n}\n\n.omni-container.no-glow .omni-sub-btn.omni-pulsing,\n.omni-container.no-glow .omni-sub-btn.omni-pulsing:hover,\n.omni-container.no-glow .omni-sub-btn.trigger-anim,\n.omni-container.no-glow .omni-sub-btn[data-control="loop"].trigger-anim,\n.omni-container.no-glow .omni-sub-btn[data-control="hide"].trigger-anim,\n.omni-container.no-glow .omni-sub-btn[data-control="settings"].trigger-anim {\n  animation: none !important;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5) !important;\n}\n\n.omni-container.no-glow .omni-speed-slider::-webkit-slider-thumb,\n.omni-container.no-glow .omni-speed-slider::-webkit-slider-thumb:hover,\n.omni-container.no-glow .omni-speed-slider::-moz-range-thumb,\n.omni-container.no-glow .omni-volume-slider::-webkit-slider-thumb,\n.omni-container.no-glow .omni-volume-slider::-webkit-slider-thumb:hover,\n.omni-container.no-glow .omni-volume-slider::-moz-range-thumb,\n.omni-container.no-glow .omni-loop-switch input:checked + .omni-loop-slider,\n.omni-container.no-glow .omni-volume-switch input:checked + .omni-volume-slider-knob,\n.omni-container.no-glow .omni-preset-btn.is-active,\n.omni-controls-bar.no-glow .omni-cbar-progress,\n.omni-controls-bar.no-glow .omni-cbar-thumb,\n.omni-controls-bar.no-glow .omni-cbar-vol-slider::-webkit-slider-thumb {\n  box-shadow: none !important;\n}\n\n.omni-hud.no-glow {\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9), 0 2px 5px rgba(0, 0, 0, 0.85) !important;\n}\n\n.omni-hud.no-glow .hud-icon {\n  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.9)) !important;\n}\n\n\n.omni-subtitles-host {\n  position: absolute !important;\n  top: 0px !important;\n  left: 0px !important;\n  width: 100% !important;\n  height: 100% !important;\n  pointer-events: none !important;\n  z-index: 2147483645 !important;\n  overflow: hidden !important;\n}\n\n.omni-subtitles-overlay {\n  position: absolute !important;\n  bottom: calc(52px + var(--sub-bottom-offset, 0px)) !important;\n  left: 50% !important;\n  transform: translateX(-50%) !important;\n  z-index: 2147483645 !important;\n  display: flex !important;\n  flex-direction: column !important;\n  align-items: center !important;\n  justify-content: center !important;\n  gap: 4px;\n  max-width: 88% !important;\n  pointer-events: none !important;\n  text-align: center !important;\n  user-select: none !important;\n  width: max-content !important;\n  box-sizing: border-box !important;\n  transition: bottom 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;\n}\n\n.omni-subtitles-overlay.controls-hidden {\n  bottom: calc(24px + var(--sub-bottom-offset, 0px)) !important;\n}\n\n.omni-subtitles-overlay.is-fullscreen {\n  bottom: calc(88px + var(--sub-bottom-offset, 0px)) !important;\n}\n\n.omni-subtitles-overlay.is-fullscreen.controls-hidden {\n  bottom: calc(32px + var(--sub-bottom-offset, 0px)) !important;\n}\n\n.omni-subtitles-overlay.empty,\n.omni-subtitles-overlay.disabled-by-user {\n  display: none !important;\n}\n\n.omni-subtitles-line {\n  display: inline-block;\n  background: var(--sub-bg-color, rgba(8, 9, 15, 0.82));\n  backdrop-filter: blur(4px);\n  -webkit-backdrop-filter: blur(4px);\n  color: var(--sub-text-color, #ffffff);\n  padding: 4px 12px;\n  border-radius: 5px;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n  font-size: var(--sub-font-size, clamp(16px, 2.2vw, 26px));\n  font-weight: 600;\n  line-height: 1.35;\n  letter-spacing: 0.2px;\n  text-shadow: var(--sub-text-shadow, 0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px #000000);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);\n  white-space: pre-wrap;\n  word-break: break-word;\n  box-sizing: border-box;\n}\n\n\n.omni-subtitles-overlay .omni-subtitles-line:nth-last-child(n+3) {\n  display: none !important;\n}\n\n.omni-subtitles-overlay.no-bg .omni-subtitles-line {\n  background: transparent !important;\n  box-shadow: none !important;\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n}\n\n.omni-sub-preview-line.no-bg {\n  background: transparent !important;\n  box-shadow: none !important;\n}\n\n\n.omni-subtitles-settings-popup {\n  position: fixed;\n  bottom: 58px;\n  right: 28px;\n  z-index: 2147483647;\n  width: 300px;\n  max-width: calc(100vw - 32px);\n  max-height: calc(85vh - 70px);\n  overflow-y: auto;\n  overflow-x: hidden;\n  background: color-mix(in srgb, var(--omni-btn-bg, #181926) 94%, transparent);\n  backdrop-filter: blur(16px);\n  -webkit-backdrop-filter: blur(16px);\n  border: 1px solid color-mix(in srgb, var(--omni-active-color, #38bdf8) 22%, rgba(255, 255, 255, 0.14));\n  border-radius: 12px;\n  padding: 14px 16px;\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7), 0 0 16px color-mix(in srgb, var(--omni-active-color, #38bdf8) 12%, transparent);\n  color: #f1f5f9;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n  font-size: 12px;\n  user-select: none;\n  opacity: 1;\n  transform: translateY(0) scale(1);\n  transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);\n  pointer-events: auto;\n  box-sizing: border-box;\n}\n\n.omni-subtitles-settings-popup.no-glow {\n  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7) !important;\n}\n\n.omni-subtitles-settings-popup.is-fullscreen {\n  bottom: 76px;\n  right: 32px;\n}\n\n.omni-sub-setting-row.omni-sub-replace-row {\n  margin-top: 6px;\n  padding-top: 10px;\n  border-top: 1px solid color-mix(in srgb, var(--omni-active-color, #38bdf8) 18%, rgba(255, 255, 255, 0.08));\n}\n\n.omni-sub-toggle-switch {\n  position: relative;\n  display: inline-block;\n  width: 32px;\n  height: 18px;\n  cursor: pointer;\n  flex-shrink: 0;\n}\n\n.omni-sub-toggle-switch input {\n  opacity: 0;\n  width: 0;\n  height: 0;\n  position: absolute;\n}\n\n.omni-sub-toggle-slider {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  background-color: color-mix(in srgb, var(--omni-btn-bg, #181926) 45%, rgba(255, 255, 255, 0.18));\n  border-radius: 18px;\n  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.omni-sub-toggle-slider:before {\n  position: absolute;\n  content: "";\n  height: 12px;\n  width: 12px;\n  left: 3px;\n  bottom: 3px;\n  background-color: #ffffff;\n  border-radius: 50%;\n  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);\n}\n\n.omni-sub-toggle-switch input:checked + .omni-sub-toggle-slider {\n  background-color: var(--omni-active-color, #38bdf8);\n  box-shadow: 0 0 8px color-mix(in srgb, var(--omni-active-color, #38bdf8) 60%, transparent);\n}\n\n.omni-subtitles-settings-popup.no-glow .omni-sub-toggle-switch input:checked + .omni-sub-toggle-slider {\n  box-shadow: none !important;\n}\n\n.omni-sub-toggle-switch input:checked + .omni-sub-toggle-slider:before {\n  transform: translateX(14px);\n}\n\n.omni-sub-hint {\n  font-size: 10.5px;\n  color: #64748b;\n  line-height: 1.25;\n  margin-top: 1px;\n}\n\n.omni-subtitles-settings-popup.collapsed {\n  display: none !important;\n  opacity: 0;\n  pointer-events: none;\n  transform: translateY(8px) scale(0.97);\n}\n\n.omni-subtitles-settings-popup::-webkit-scrollbar {\n  width: 5px;\n}\n\n.omni-subtitles-settings-popup::-webkit-scrollbar-thumb {\n  background: color-mix(in srgb, var(--omni-active-color, #38bdf8) 40%, rgba(255, 255, 255, 0.2));\n  border-radius: 4px;\n}\n\n.omni-sub-settings-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 12px;\n  padding-bottom: 8px;\n  border-bottom: 1px solid color-mix(in srgb, var(--omni-active-color, #38bdf8) 18%, rgba(255, 255, 255, 0.08));\n}\n\n.omni-sub-settings-title {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 13px;\n  font-weight: 600;\n  color: var(--omni-controls-color, #f8fafc);\n  letter-spacing: 0.2px;\n}\n\n.omni-sub-settings-icon {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 18px;\n  height: 18px;\n  color: var(--omni-active-color, #38bdf8);\n}\n\n.omni-sub-settings-icon svg {\n  width: 18px;\n  height: 18px;\n}\n\n.omni-sub-settings-close {\n  background: none;\n  border: none;\n  color: color-mix(in srgb, var(--omni-controls-color, #cbd5e1) 70%, #94a3b8);\n  font-size: 14px;\n  cursor: pointer;\n  padding: 2px 6px;\n  border-radius: 4px;\n  transition: all 0.15s;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.omni-sub-settings-close:hover {\n  background: rgba(255, 255, 255, 0.12);\n  color: #ffffff;\n}\n\n.omni-sub-preview-area {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 48px;\n  padding: 10px 8px;\n  margin-bottom: 12px;\n  background: radial-gradient(circle, color-mix(in srgb, var(--omni-btn-bg, #181926) 65%, rgba(255, 255, 255, 0.08)) 0%, color-mix(in srgb, var(--omni-btn-bg, #181926) 95%, black 5%) 100%);\n  border: 1px dashed color-mix(in srgb, var(--omni-active-color, #38bdf8) 35%, rgba(255, 255, 255, 0.14));\n  border-radius: 8px;\n  text-align: center;\n}\n\n.omni-sub-preview-line {\n  display: inline-block;\n  padding: 4px 10px;\n  border-radius: 5px;\n  font-weight: 600;\n  line-height: 1.35;\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55);\n  transition: all 0.12s ease;\n  word-break: break-word;\n}\n\n.omni-sub-settings-body {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n}\n\n.omni-sub-setting-row {\n  display: flex;\n  flex-direction: column;\n  gap: 5px;\n  transition: opacity 0.2s ease, filter 0.2s ease;\n}\n\n.omni-sub-setting-row.is-disabled {\n  opacity: 0.35 !important;\n  pointer-events: none !important;\n  filter: grayscale(0.85) !important;\n  cursor: not-allowed !important;\n}\n\n.omni-sub-label-row {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 11.5px;\n  color: color-mix(in srgb, var(--omni-controls-color, #cbd5e1) 75%, #94a3b8);\n}\n\n.omni-sub-value {\n  color: var(--omni-active-color, #38bdf8);\n  font-weight: 600;\n  font-size: 11.5px;\n}\n\n.omni-sub-slider {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 100%;\n  height: 4px;\n  background: color-mix(in srgb, var(--omni-btn-bg, #181926) 45%, rgba(255, 255, 255, 0.18));\n  border-radius: 2px;\n  outline: none;\n  cursor: pointer;\n  margin: 3px 0;\n  transition: background 0.15s;\n}\n\n.omni-sub-slider:hover {\n  background: color-mix(in srgb, var(--omni-btn-bg, #181926) 35%, rgba(255, 255, 255, 0.28));\n}\n\n.omni-sub-slider::-webkit-slider-thumb {\n  -webkit-appearance: none;\n  appearance: none;\n  width: 14px;\n  height: 14px;\n  border-radius: 50%;\n  background: var(--omni-active-color, #38bdf8);\n  cursor: pointer;\n  box-shadow: 0 0 6px var(--omni-active-color, #38bdf8);\n  transition: transform 0.12s, box-shadow 0.12s;\n}\n\n.omni-sub-slider::-webkit-slider-thumb:hover {\n  transform: scale(1.18);\n  box-shadow: 0 0 10px var(--omni-active-color, #38bdf8);\n}\n\n.omni-subtitles-settings-popup.no-glow .omni-sub-slider::-webkit-slider-thumb,\n.omni-subtitles-settings-popup.no-glow .omni-sub-slider::-webkit-slider-thumb:hover {\n  box-shadow: none !important;\n}\n\n.omni-sub-swatch-row {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  margin-top: 2px;\n}\n\n.omni-sub-swatch {\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.2);\n  cursor: pointer;\n  outline: none;\n  padding: 0;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);\n  transition: transform 0.12s, border-color 0.15s, box-shadow 0.15s;\n}\n\n.omni-sub-swatch:hover {\n  transform: scale(1.15);\n  border-color: #ffffff;\n}\n\n.omni-sub-swatch.is-selected {\n  border-color: var(--omni-active-color, #38bdf8);\n  transform: scale(1.18);\n  box-shadow: 0 0 8px color-mix(in srgb, var(--omni-active-color, #38bdf8) 75%, transparent);\n}\n\n.omni-subtitles-settings-popup.no-glow .omni-sub-swatch.is-selected {\n  box-shadow: none !important;\n}\n\n.omni-sub-custom-color {\n  position: relative;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 22px;\n  height: 22px;\n  border-radius: 50%;\n  background: linear-gradient(var(--omni-btn-bg, #141a29), var(--omni-btn-bg, #141a29)) padding-box, conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #fbbf24 60deg, #34d399 120deg, #38bdf8 180deg, #818cf8 240deg, #c084fc 300deg, #f43f5e 360deg) border-box;\n  border: 2px solid transparent;\n  color: var(--omni-controls-color, #cbd5e1);\n  cursor: pointer;\n  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);\n  transition: transform 0.15s ease, box-shadow 0.15s ease, color 0.15s ease;\n}\n\n.omni-sub-custom-color:hover {\n  transform: scale(1.15);\n  color: #ffffff;\n  box-shadow: 0 0 8px color-mix(in srgb, var(--omni-active-color, #38bdf8) 60%, transparent);\n}\n\n.omni-sub-custom-color.is-selected {\n  transform: scale(1.18);\n  border-color: var(--omni-active-color, #38bdf8);\n  box-shadow: 0 0 10px var(--omni-active-color, #38bdf8);\n}\n\n.omni-subtitles-settings-popup.no-glow .omni-sub-custom-color:hover,\n.omni-subtitles-settings-popup.no-glow .omni-sub-custom-color.is-selected {\n  box-shadow: none !important;\n}\n\n.omni-sub-custom-color-icon {\n  pointer-events: none;\n  display: block;\n}\n\n.omni-sub-color-input {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  opacity: 0;\n  cursor: pointer;\n  border: none;\n  padding: 0;\n  margin: 0;\n}\n\n.omni-sub-settings-footer {\n  margin-top: 14px;\n  padding-top: 10px;\n  border-top: 1px solid color-mix(in srgb, var(--omni-active-color, #38bdf8) 18%, rgba(255, 255, 255, 0.08));\n  display: flex;\n  justify-content: flex-end;\n}\n\n.omni-sub-reset-btn {\n  background: color-mix(in srgb, var(--omni-btn-bg, #181926) 60%, rgba(255, 255, 255, 0.08));\n  border: 1px solid color-mix(in srgb, var(--omni-active-color, #38bdf8) 25%, rgba(255, 255, 255, 0.12));\n  color: color-mix(in srgb, var(--omni-controls-color, #cbd5e1) 85%, #ffffff);\n  border-radius: 6px;\n  padding: 5px 12px;\n  font-size: 11px;\n  cursor: pointer;\n  transition: all 0.15s;\n}\n\n.omni-sub-reset-btn:hover {\n  background: rgba(239, 68, 68, 0.2);\n  border-color: rgba(239, 68, 68, 0.4);\n  color: #fca5a5;\n}\n\n`;
    class VideoController {
        constructor(video) {
            this.video = video;
            this.isDragging = false;
            this.isHovered = false;
            this.isHovering = false;
            this.isMinimized = currentConfig.autoMinimize;
            this.autoMinimizeTimer = null;
            this.hudTimer = null;
            this.customPosition = null;
            this.isLoopBarOpen = false;
            this.isLooping = false;
            this.isLoopHovering = false;
            this.isSpeedBarOpen = false;
            this.isSpeedHovering = false;
            this.isVolumeBarOpen = false;
            this.isVolumeHovering = false;
            this.isRepeatBtnHovered = false;
            this.isMinBubbleHovered = false;
            this.isSubControlsHovered = false;
            this.isSubControlsVisible = false;
            this._hoverDismissed = false;
            this.controlsBar = null;
            this.isControlsForced = isControlsForcedGlobal !== null ? isControlsForcedGlobal : isDomainControlsForced();
            this.isControlsBarPinned = isControlsBarPinnedGlobal;
            this.cbarLockBtn = null;
            this._wasControlsForcedBeforeFs = null;
            this._wasGlobalForcedBeforeFs = null;
            this._isScrubbing = false;
            this.controlsBarAutoHideTimer = null;
            this.isControlsBarHovered = false;
            this.didDrag = false;
            this.subControlsFadeInTimer = null;
            this.subControlsFadeOutTimer = null;
            this.isBridgeHovered = false;
            this.fadeHoverLeaveTimer = null;
            this.overlaysAutoMinimizeTimer = null;
            this.loopAutoMinimizeTimer = null;
            this.isSliderDragging = false;
            this.autoHideButtonsTimer = null;
            this.userExplicitlyToggledLoop = false;
            this._userToggledMuteOnThisVideo = false;
            this._userExplicitlyAdjustedNativeVolume = false;
            this._shouldStayUnmuted = false;
            this._wasAudibleBeforePause = false;
            this._lastAudibleVolume = this.video.volume > 0 ? this.video.volume : lastAudibleVolume || 1;
            this._lastPauseTime = 0;
            this._muteOverrideAttempts = 0;
            this._lastMuteOverrideReset = Date.now();
            this._userExplicitlyToggledPlay = false;
            this._hasAppliedInitialPlayState = false;
            this._lastVideoSrc = this.video.currentSrc || this.video.src || "";
            this.loopEnabled = false;
            this.init();
        }
        init() {
            this.host = document.createElement("div");
            this.host.className = "omni-shadow-host";
            this.shadow = this.host.attachShadow({
                mode: "open"
            });
            this.loadCSS();
            this.buildDOM();
            this.attachHost();
            this.bindEvents();
            this.initLoopObserver();
            this.updateState();
            this.updateThemeAndConfig();
            this.updatePosition();
            this.applyAutoScrollLoopPolicy();
            if (currentConfig.subtitleStyles && currentConfig.subtitleStyles.replaceSubtitles) {
                updateNativeSubtitleVisibility();
            }
            this.updateSubtitlesButtonState();
            this.container.classList.add("hover-hidden");
            if (currentConfig.defaultHidden || isGloballyHidden || isSupportActive) {
                this.container.classList.add("hidden");
            }
            this.applyEffectiveSpeed(true);
            setTimeout(() => {
                if (this.video && this.video.isConnected) {
                    this.applyEffectiveSpeed();
                }
            }, 100);
            setTimeout(() => {
                if (this.video && this.video.isConnected) {
                    this.applyEffectiveSpeed();
                }
            }, 350);
            this.applyEffectiveVolume(true);
            setTimeout(() => {
                if (this.video && this.video.isConnected) {
                    this.applyEffectiveVolume();
                }
            }, 100);
            setTimeout(() => {
                if (this.video && this.video.isConnected) {
                    this.applyEffectiveVolume();
                }
            }, 350);
            this.applyInitialVideoState();
            setTimeout(() => {
                if (!this._userExplicitlyToggledPlay && this.video && this.video.isConnected) {
                    this.applyInitialVideoState();
                }
            }, 120);
            setTimeout(() => {
                if (!this._userExplicitlyToggledPlay && this.video && this.video.isConnected) {
                    this.applyInitialVideoState();
                }
            }, 350);
            this.applySiteMutePreference();
            setTimeout(() => {
                if (!this._userToggledMuteOnThisVideo && this.video && this.video.isConnected) {
                    this.applySiteMutePreference();
                }
            }, 100);
            setTimeout(() => {
                if (!this._userToggledMuteOnThisVideo && this.video && this.video.isConnected) {
                    this.applySiteMutePreference();
                }
            }, 350);
            setTimeout(() => {
                if (!this.userExplicitlyToggledLoop && this.video && this.video.isConnected) {
                    this.applyAutoScrollLoopPolicy();
                }
            }, 150);
        }
        loadCSS() {
            try {
                const style = document.createElement("style");
                style.textContent = OMNI_CSS;
                this.shadow.appendChild(style);
            } catch (e) {}
        }
        buildDOM() {
            this.container = document.createElement("div");
            this.container.className = "omni-container" + (currentConfig.glowEnabled === false ? " no-glow" : "");
            this.minBubble = document.createElement("div");
            this.minBubble.className = "omni-minimized";
            this.minBubble.innerHTML = ICONS.omni;
            this.minBubble.title = "Universal Video Controller";
            this.loopBar = document.createElement("div");
            this.loopBar.className = "omni-loop-bar collapsed";
            this.loopBar.innerHTML = `\n        <label class="omni-loop-switch" title="Toggle Loop">\n          <input type="checkbox" class="omni-loop-toggle" />\n          <span class="omni-loop-slider"></span>\n        </label>\n        <span class="omni-loop-label">Start:</span>\n        <input type="number" class="omni-loop-input omni-loop-start-m" min="0" max="999" value="0" />\n        <span class="omni-loop-colon">:</span>\n        <input type="number" class="omni-loop-input omni-loop-start-s" min="0" max="59" value="0" />\n        <span class="omni-loop-label" style="margin-left: 4px;">End:</span>\n        <input type="number" class="omni-loop-input omni-loop-end-m" min="0" max="999" value="0" />\n        <span class="omni-loop-colon">:</span>\n        <input type="number" class="omni-loop-input omni-loop-end-s" min="0" max="59" value="0" />\n      `;
            this.startMInput = this.loopBar.querySelector(".omni-loop-start-m");
            this.startSInput = this.loopBar.querySelector(".omni-loop-start-s");
            this.endMInput = this.loopBar.querySelector(".omni-loop-end-m");
            this.endSInput = this.loopBar.querySelector(".omni-loop-end-s");
            this.loopToggle = this.loopBar.querySelector(".omni-loop-toggle");
            if (this.loopToggle) {
                this.loopToggle.checked = this.isLoopActive();
            }
            this.resetLoopInputs();
            this.speedBar = document.createElement("div");
            this.speedBar.className = "omni-speed-bar collapsed";
            this.speedBar.innerHTML = `\n        <div class="omni-speed-presets">\n          <button type="button" class="omni-preset-btn omni-preset-normal" title="Normal Speed (1.0x)">1.0x</button>\n          <button type="button" class="omni-preset-btn omni-preset-fav" title="Favorite Speed">Fav</button>\n          <button type="button" class="omni-preset-btn omni-preset-super" title="Super Speed">Super</button>\n        </div>\n        <input type="range" class="omni-speed-slider" min="0.25" max="16.0" step="0.05" value="1.0" title="Playback Speed" />\n        <span class="omni-speed-readout">1.00x</span>\n      `;
            this.speedSlider = this.speedBar.querySelector(".omni-speed-slider");
            this.speedReadout = this.speedBar.querySelector(".omni-speed-readout");
            this.presetNormalBtn = this.speedBar.querySelector(".omni-preset-normal");
            this.presetFavBtn = this.speedBar.querySelector(".omni-preset-fav");
            this.presetSuperBtn = this.speedBar.querySelector(".omni-preset-super");
            this.volumeBar = document.createElement("div");
            this.volumeBar.className = "omni-volume-bar collapsed";
            const maxVolPct = currentConfig.volumeBoostEnabled ? 600 : 100;
            this.volumeBar.innerHTML = `\n        <label class="omni-volume-switch" title="Toggle Mute (M)">\n          <input type="checkbox" class="omni-volume-toggle" />\n          <span class="omni-volume-slider-knob"></span>\n        </label>\n        <input type="range" class="omni-volume-slider" min="0" max="${maxVolPct}" step="1" value="100" title="Volume" />\n        <span class="omni-volume-readout">100%</span>\n      `;
            this.volumeSlider = this.volumeBar.querySelector(".omni-volume-slider");
            this.volumeReadout = this.volumeBar.querySelector(".omni-volume-readout");
            this.volumeToggle = this.volumeBar.querySelector(".omni-volume-toggle");
            this.subControlsContainer = document.createElement("div");
            this.subControlsContainer.className = "omni-sub-controls";
            this.buildSubControls();
            this.hud = document.createElement("div");
            this.hud.className = "omni-hud" + (currentConfig.glowEnabled === false ? " no-glow" : "");
            this.hud.innerHTML = `<span class="hud-icon">${ICONS.omni}</span><span class="hud-text"></span>`;
            this.container.appendChild(this.minBubble);
            this.container.appendChild(this.subControlsContainer);
            this.shadow.appendChild(this.container);
            this.shadow.appendChild(this.hud);
            this.buildControlsBar();
        }
        formatVideoTime(seconds) {
            if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
            const totalSecs = Math.floor(seconds);
            const hrs = Math.floor(totalSecs / 3600);
            const mins = Math.floor(totalSecs % 3600 / 60);
            const secs = totalSecs % 60;
            const padSecs = String(secs).padStart(2, "0");
            if (hrs > 0) {
                return `${hrs}:${String(mins).padStart(2, "0")}:${padSecs}`;
            }
            return `${mins}:${padSecs}`;
        }
        buildControlsBar() {
            this.controlsBar = document.createElement("div");
            this.controlsBar.className = "omni-controls-bar hover-hidden" + (currentConfig.glowEnabled === false ? " no-glow" : "");
            const shouldForce = isControlsForcedGlobal !== null ? isControlsForcedGlobal : isDomainControlsForced();
            this.isControlsForced = shouldForce;
            if (!shouldForce) {
                this.controlsBar.classList.add("hidden");
            }
            this.cbarPlayBtn = document.createElement("button");
            this.cbarPlayBtn.type = "button";
            this.cbarPlayBtn.className = "omni-cbar-btn omni-cbar-play-btn";
            this.cbarPlayBtn.title = "Play / Pause (Space)";
            this.cbarPlayBtn.innerHTML = ICONS.play;
            this.cbarTime = document.createElement("span");
            this.cbarTime.className = "omni-cbar-time";
            this.cbarTime.textContent = "0:00 / 0:00";
            this.cbarTimelineWrap = document.createElement("div");
            this.cbarTimelineWrap.className = "omni-cbar-timeline-wrap";
            this.cbarTimelineTrack = document.createElement("div");
            this.cbarTimelineTrack.className = "omni-cbar-timeline-track";
            this.cbarBuffered = document.createElement("div");
            this.cbarBuffered.className = "omni-cbar-buffered";
            this.cbarProgress = document.createElement("div");
            this.cbarProgress.className = "omni-cbar-progress";
            this.cbarThumb = document.createElement("div");
            this.cbarThumb.className = "omni-cbar-thumb";
            this.cbarTooltip = document.createElement("div");
            this.cbarTooltip.className = "omni-cbar-time-tooltip";
            this.cbarTooltip.textContent = "0:00";
            this.cbarTimelineTrack.appendChild(this.cbarBuffered);
            this.cbarTimelineTrack.appendChild(this.cbarProgress);
            this.cbarTimelineTrack.appendChild(this.cbarThumb);
            this.cbarTimelineWrap.appendChild(this.cbarTimelineTrack);
            this.cbarTimelineWrap.appendChild(this.cbarTooltip);
            this.cbarHideBtn = document.createElement("button");
            this.cbarHideBtn.type = "button";
            this.cbarHideBtn.className = "omni-cbar-btn omni-cbar-hide-btn";
            this.cbarHideBtn.title = "Hide Progress Bar";
            this.cbarHideBtn.innerHTML = ICONS.hide;
            this.cbarLockBtn = document.createElement("button");
            this.cbarLockBtn.type = "button";
            this.cbarLockBtn.className = "omni-cbar-btn omni-cbar-lock-btn" + (this.isControlsBarPinned ? " is-active" : "");
            this.cbarLockBtn.title = this.isControlsBarPinned ? "Unlock Progress Bar (Auto-Hide)" : "Lock Progress Bar (Keep Visible)";
            this.cbarLockBtn.innerHTML = this.isControlsBarPinned ? ICONS.lock : ICONS.unlock;
            this.cbarFsBtn = document.createElement("button");
            this.cbarFsBtn.type = "button";
            this.cbarFsBtn.className = "omni-cbar-btn omni-cbar-fs-btn";
            this.cbarFsBtn.title = "Fullscreen";
            this.cbarFsBtn.innerHTML = ICONS.fullscreen;
            this.controlsBar.appendChild(this.cbarPlayBtn);
            this.controlsBar.appendChild(this.cbarTime);
            this.controlsBar.appendChild(this.cbarTimelineWrap);
            if (this.cbarCcBtn) this.controlsBar.appendChild(this.cbarCcBtn);
            if (this.cbarCcSettingsBtn) this.controlsBar.appendChild(this.cbarCcSettingsBtn);
            this.controlsBar.appendChild(this.cbarHideBtn);
            this.controlsBar.appendChild(this.cbarLockBtn);
            this.controlsBar.appendChild(this.cbarFsBtn);
            this.shadow.appendChild(this.controlsBar);
            this.bindControlsBarEvents();
            this.updateControlsBarState();
        }
        updateProgressBarButtonState() {
            const isShown = !!(this.isControlsForced && this.controlsBar && !this.controlsBar.classList.contains("hidden"));
            if (this.progressBarBtn) {
                this.progressBarBtn.classList.toggle("is-active", isShown);
            }
            if (this.subButtons && this.subButtons["progressBar"]) {
                this.subButtons["progressBar"].classList.toggle("is-active", isShown);
                this.triggerSubBtnPulse(this.subButtons["progressBar"]);
            }
        }
        updateControlsBarState() {
            if (!this.controlsBar || !this.video) return;
            if (this.cbarPlayBtn) {
                this.cbarPlayBtn.innerHTML = this.video.paused ? ICONS.play : ICONS.pause;
                this.cbarPlayBtn.title = this.video.paused ? "Play (Space)" : "Pause (Space)";
            }
            const cur = this.video.currentTime || 0;
            const dur = this.video.duration;
            const hasDur = dur && isFinite(dur) && dur > 0;
            if (this.cbarTime) {
                if (hasDur) {
                    this.cbarTime.textContent = `${this.formatVideoTime(cur)} / ${this.formatVideoTime(dur)}`;
                } else {
                    this.cbarTime.textContent = this.formatVideoTime(cur);
                }
            }
            if (!this._isScrubbing && hasDur) {
                const pct = Math.max(0, Math.min(100, cur / dur * 100));
                if (this.cbarProgress) this.cbarProgress.style.width = `${pct}%`;
                if (this.cbarThumb) this.cbarThumb.style.left = `${pct}%`;
            }
            if (hasDur && this.video.buffered && this.video.buffered.length > 0 && this.cbarBuffered) {
                try {
                    const bufEnd = this.video.buffered.end(this.video.buffered.length - 1);
                    const bufPct = Math.max(0, Math.min(100, bufEnd / dur * 100));
                    this.cbarBuffered.style.width = `${bufPct}%`;
                } catch (e) {}
            }
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (this.cbarFsBtn) {
                this.cbarFsBtn.innerHTML = isFs ? ICONS.fullscreenExit : ICONS.fullscreen;
                this.cbarFsBtn.title = isFs ? "Exit Fullscreen" : "Fullscreen";
            }
            if (this.controlsBar) {
                this.controlsBar.classList.toggle("is-fullscreen", isFs);
            }
            if (this.subtitlesOverlay) {
                this.subtitlesOverlay.classList.toggle("is-fullscreen", isFs);
            }
            if (this.subtitlesSettingsPopup) {
                this.subtitlesSettingsPopup.classList.toggle("is-fullscreen", isFs);
            }
            this.updateSubtitlesButtonState();
            this.updateProgressBarButtonState();
            if (this.cbarLockBtn) {
                this.cbarLockBtn.innerHTML = this.isControlsBarPinned ? ICONS.lock : ICONS.unlock;
                this.cbarLockBtn.title = this.isControlsBarPinned ? "Unlock Progress Bar (Auto-Hide)" : "Lock Progress Bar (Keep Visible)";
                this.cbarLockBtn.classList.toggle("is-active", !!this.isControlsBarPinned);
            }
        }
        bindControlsBarEvents() {
            if (!this.controlsBar) return;
            this.controlsBar.addEventListener("click", e => e.stopPropagation());
            this.controlsBar.addEventListener("mousedown", e => e.stopPropagation());
            this.controlsBar.addEventListener("pointerdown", e => e.stopPropagation());
            this.cbarPlayBtn.addEventListener("click", e => {
                e.stopPropagation();
                this.togglePlayPause();
            });
            if (this.cbarCcBtn) {
                this.cbarCcBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.toggleSubtitles();
                });
            }
            if (this.cbarCcSettingsBtn) {
                this.cbarCcSettingsBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.toggleSubtitlesSettings();
                });
            }
            this.cbarHideBtn.addEventListener("click", e => {
                e.stopPropagation();
                toggleGlobalControlsBar(this);
            });
            if (this.cbarLockBtn) {
                this.cbarLockBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.toggleControlsBarLock();
                });
            }
            this.cbarFsBtn.addEventListener("click", e => {
                e.stopPropagation();
                this.toggleFullscreen();
            });
            const seekToEvent = e => {
                const dur = this.video.duration;
                if (!dur || !isFinite(dur) || dur <= 0) return;
                const rect = this.cbarTimelineTrack.getBoundingClientRect();
                if (!rect.width) return;
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetTime = ratio * dur;
                try {
                    this.video.currentTime = targetTime;
                } catch (err) {}
                if (this._isScrubbing && !this.video.paused) {
                    try {
                        this.video.pause();
                    } catch (err) {}
                }
                if (this.cbarProgress) this.cbarProgress.style.width = `${ratio * 100}%`;
                if (this.cbarThumb) this.cbarThumb.style.left = `${ratio * 100}%`;
                if (this.cbarTime) this.cbarTime.textContent = `${this.formatVideoTime(targetTime)} / ${this.formatVideoTime(dur)}`;
                if (this.cbarTooltip) {
                    this.cbarTooltip.textContent = this.formatVideoTime(targetTime);
                    this.cbarTooltip.style.left = `${ratio * 100}%`;
                }
            };
            const onScrubPointerMove = e => {
                if (!this._isScrubbing) return;
                if (e.cancelable) e.preventDefault();
                e.stopPropagation();
                if (!this.video.paused) {
                    try {
                        this.video.pause();
                    } catch (err) {}
                }
                seekToEvent(e);
            };
            const onScrubPointerUp = e => {
                if (!this._isScrubbing) return;
                if (e) {
                    e.stopPropagation();
                    if (e.cancelable) e.preventDefault();
                }
                this._isScrubbing = false;
                this.cbarTimelineWrap.classList.remove("scrubbing");
                if (this._cleanupScrubEvents) {
                    this._cleanupScrubEvents();
                    this._cleanupScrubEvents = null;
                }
                this._userExplicitlyToggledPlay = true;
                this._hasAppliedInitialPlayState = true;
                try {
                    const playPromise = this.video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(() => {});
                    }
                } catch (err) {}
                this._wasPlayingBeforeScrub = false;
                this.updateControlsBarState();
                if (this.isControlsBarPinned) {
                    this.clearControlsBarAutoHide();
                } else if (this.isHovered && currentConfig.autoHideButtons !== false) {
                    this.scheduleControlsBarAutoHide();
                } else if (!this.isHovered && !this.isControlsBarHovered) {
                    this.controlsBar.classList.add("hover-hidden");
                }
            };
            this._cleanupScrubEvents = () => {
                window.removeEventListener("pointermove", onScrubPointerMove, {
                    capture: true,
                    passive: false
                });
                window.removeEventListener("pointerup", onScrubPointerUp, {
                    capture: true
                });
                window.removeEventListener("pointercancel", onScrubPointerUp, {
                    capture: true
                });
                window.removeEventListener("mousemove", onScrubPointerMove, {
                    capture: true,
                    passive: false
                });
                window.removeEventListener("mouseup", onScrubPointerUp, {
                    capture: true
                });
            };
            const onScrubStart = e => {
                if (e.button !== void 0 && e.button !== 0) return;
                if (this._isScrubbing) return;
                e.stopPropagation();
                if (e.cancelable) e.preventDefault();
                this._isScrubbing = true;
                this._wasPlayingBeforeScrub = !this.video.paused;
                try {
                    this.video.pause();
                } catch (err) {}
                this.cbarTimelineWrap.classList.add("scrubbing");
                this.clearControlsBarAutoHide();
                seekToEvent(e);
                if (this._cleanupScrubEvents) {
                    this._cleanupScrubEvents();
                }
                window.addEventListener("pointermove", onScrubPointerMove, {
                    capture: true,
                    passive: false
                });
                window.addEventListener("pointerup", onScrubPointerUp, {
                    capture: true
                });
                window.addEventListener("pointercancel", onScrubPointerUp, {
                    capture: true
                });
                window.addEventListener("mousemove", onScrubPointerMove, {
                    capture: true,
                    passive: false
                });
                window.addEventListener("mouseup", onScrubPointerUp, {
                    capture: true
                });
            };
            this.cbarTimelineWrap.addEventListener("pointerdown", onScrubStart);
            this.cbarTimelineWrap.addEventListener("mousedown", onScrubStart);
            this.cbarTimelineWrap.addEventListener("pointermove", e => {
                if (this._isScrubbing) return;
                const dur = this.video.duration;
                if (!dur || !isFinite(dur) || dur <= 0) return;
                const rect = this.cbarTimelineTrack.getBoundingClientRect();
                if (!rect.width) return;
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                if (this.cbarTooltip) {
                    this.cbarTooltip.textContent = this.formatVideoTime(ratio * dur);
                    this.cbarTooltip.style.left = `${ratio * 100}%`;
                }
            });
            this.controlsBar.addEventListener("pointerenter", () => {
                this.isControlsBarHovered = true;
                this.setHovered(true);
                if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false) {
                    this.scheduleControlsBarAutoHide();
                }
            });
            this.controlsBar.addEventListener("pointermove", () => {
                this.isControlsBarHovered = true;
                if (this.controlsBar.classList.contains("hover-hidden")) {
                    this.controlsBar.classList.remove("hover-hidden");
                    this.updatePosition();
                }
                if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false) {
                    this.scheduleControlsBarAutoHide();
                }
            });
            this.controlsBar.addEventListener("pointerleave", () => {
                this.isControlsBarHovered = false;
                if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false && !this._isScrubbing) {
                    this.scheduleControlsBarAutoHide();
                }
            });
        }
        clearControlsBarAutoHide() {
            if (this.controlsBarAutoHideTimer) {
                clearTimeout(this.controlsBarAutoHideTimer);
                this.controlsBarAutoHideTimer = null;
            }
        }
        scheduleControlsBarAutoHide() {
            this.clearControlsBarAutoHide();
            if (this.isControlsBarPinned) return;
            if (currentConfig.autoHideButtons === false) return;
            if (this._isScrubbing) return;
            if (this.isSubtitlesSettingsOpen) return;
            if (!this.controlsBar) return;
            const delay = currentConfig.autoHideButtonsTimeout !== void 0 ? currentConfig.autoHideButtonsTimeout : 2500;
            if (delay <= 0) return;
            this.controlsBarAutoHideTimer = setTimeout(() => {
                this.controlsBarAutoHideTimer = null;
                if (!this._isScrubbing && !this.isControlsBarPinned) {
                    this.controlsBar.classList.add("hover-hidden");
                    this.updateSubtitlesPosition();
                }
            }, delay);
        }
        toggleControlsBarLock() {
            const newState = !this.isControlsBarPinned;
            this.isControlsBarPinned = newState;
            isControlsBarPinnedGlobal = newState;
            currentConfig.controlsBarPinned = newState;
            try {
                if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                    chrome.storage.sync.get("config", data => {
                        const cfg = data && data.config || {};
                        cfg.controlsBarPinned = newState;
                        chrome.storage.sync.set({
                            config: cfg
                        });
                    });
                }
            } catch (e) {}
            activeControllers.forEach(ctrl => {
                ctrl.isControlsBarPinned = newState;
                if (typeof ctrl.updateControlsBarLockState === "function") {
                    ctrl.updateControlsBarLockState();
                }
            });
            this.showHUD(newState ? "Progress Bar: Locked" : "Progress Bar: Unlocked");
        }
        updateControlsBarLockState() {
            if (this.cbarLockBtn) {
                this.cbarLockBtn.innerHTML = this.isControlsBarPinned ? ICONS.lock : ICONS.unlock;
                this.cbarLockBtn.title = this.isControlsBarPinned ? "Unlock Progress Bar (Auto-Hide)" : "Lock Progress Bar (Keep Visible)";
                this.cbarLockBtn.classList.toggle("is-active", !!this.isControlsBarPinned);
            }
            if (this.isControlsBarPinned && this.controlsBar) {
                this.clearControlsBarAutoHide();
                if (this.isControlsForced) {
                    this.controlsBar.classList.remove("hover-hidden");
                }
            } else if (!this.isControlsBarPinned && !this.isHovered && !this.isControlsBarHovered && this.controlsBar) {
                this.controlsBar.classList.add("hover-hidden");
            } else if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false) {
                this.scheduleControlsBarAutoHide();
            }
        }
        toggleControlsBar() {
            toggleGlobalControlsBar(this);
        }
        buildSubControls() {
            if (!this.subControlsContainer) return;
            this.subControlsContainer.innerHTML = "";
            this.subButtons = {};
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            activeControls.forEach(ctrlId => {
                const item = document.createElement("div");
                item.className = `omni-sub-item omni-sub-item-${ctrlId}`;
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = `omni-sub-btn omni-sub-btn-${ctrlId}`;
                btn.dataset.control = ctrlId;
                let title = "";
                let svg = "";
                switch (ctrlId) {
                  case "loop":
                    title = "Loop (L)";
                    svg = ICONS.loopSync;
                    break;

                  case "speed":
                    title = "Speed";
                    svg = ICONS.speed;
                    break;

                  case "volume":
                    title = "Volume";
                    svg = ICONS.volume;
                    break;

                  case "pip":
                    title = "Pop Out (P)";
                    svg = ICONS.pip;
                    break;

                  case "settings":
                    title = "Settings";
                    svg = ICONS.settings;
                    break;

                  case "hide":
                    title = "Hide (H)";
                    svg = ICONS.hide;
                    break;

                  case "progressBar":
                    title = "Toggle Video Progress Bar";
                    svg = ICONS.progressBar;
                    break;
                }
                btn.title = title;
                btn.innerHTML = svg;
                item.appendChild(btn);
                if (ctrlId === "loop") {
                    this.loopBtn = btn;
                    if (this.isLoopActive()) {
                        this.loopBtn.classList.add("is-looping");
                    }
                    if (this.isLoopBarOpen) {
                        this.loopBtn.classList.add("is-expanded");
                    }
                    if (this.loopBar) {
                        item.appendChild(this.loopBar);
                    }
                } else if (ctrlId === "speed") {
                    this.speedBtn = btn;
                    if (this.isSpeedBarOpen) {
                        this.speedBtn.classList.add("is-expanded");
                    }
                    if (this.speedBar) {
                        item.appendChild(this.speedBar);
                    }
                } else if (ctrlId === "volume") {
                    this.volumeBtn = btn;
                    if (this.isVolumeBarOpen) {
                        this.volumeBtn.classList.add("is-expanded");
                    }
                    if (this.volumeBar) {
                        item.appendChild(this.volumeBar);
                    }
                } else if (ctrlId === "pip") {
                    this.pipBtn = btn;
                    const isPoppedOut = !!(document.pictureInPictureElement && document.pictureInPictureElement === this.video || this.video && this.video.webkitPresentationMode === "picture-in-picture");
                    if (isPoppedOut) {
                        btn.classList.add("is-active");
                    }
                } else if (ctrlId === "settings") {
                    this.settingsBtn = btn;
                } else if (ctrlId === "hide") {
                    this.hideBtn = btn;
                }
                this.subControlsContainer.appendChild(item);
                this.subButtons[ctrlId] = btn;
            });
            if (this.isSubControlsVisible) {
                this.subControlsContainer.classList.add("visible");
                if (this.container) this.container.classList.add("expanded");
            } else {
                this.subControlsContainer.classList.remove("visible");
                if (this.container) this.container.classList.remove("expanded");
            }
        }
        triggerPulse() {
            if (currentConfig.glowEnabled === false) return;
            if (!this.minBubble) return;
            if (this.pulseEndTimer) {
                clearTimeout(this.pulseEndTimer);
                this.pulseEndTimer = null;
            }
            this.minBubble.classList.remove("omni-pulsing");
            void this.minBubble.offsetWidth;
            this.minBubble.classList.add("omni-pulsing");
            this.pulseEndTimer = setTimeout(() => {
                this.pulseEndTimer = null;
                if (this.minBubble) this.minBubble.classList.remove("omni-pulsing");
            }, 1250);
        }
        triggerSubBtnPulse(btn) {
            if (currentConfig.glowEnabled === false) return;
            if (!btn) return;
            if (btn._subPulseTimer) {
                clearTimeout(btn._subPulseTimer);
                btn._subPulseTimer = null;
            }
            btn.classList.remove("omni-pulsing");
            void btn.offsetWidth;
            btn.classList.add("omni-pulsing");
            btn._subPulseTimer = setTimeout(() => {
                btn._subPulseTimer = null;
                if (btn) btn.classList.remove("omni-pulsing");
            }, 750);
        }
        setSubControlsVisible(visible) {
            const wasVisible = this.isSubControlsVisible;
            this.isSubControlsVisible = !!visible;
            if (!this.subControlsContainer) return;
            if (this.isSubControlsVisible) {
                this.subControlsContainer.classList.add("visible");
                if (this.container) this.container.classList.add("expanded");
            } else {
                this.subControlsContainer.classList.remove("visible");
                if (this.container) this.container.classList.remove("expanded");
                if (wasVisible && this.container && !this.container.classList.contains("hover-hidden") && !this.container.classList.contains("hidden")) {
                    this.triggerPulse();
                }
            }
            this.updatePosition();
        }
        toggleSubControls() {
            if (this.minBubble) {
                this.minBubble.classList.remove("trigger-flash");
                void this.minBubble.offsetWidth;
                this.minBubble.classList.add("trigger-flash");
                setTimeout(() => {
                    if (this.minBubble) this.minBubble.classList.remove("trigger-flash");
                }, 300);
            }
            if (this.isSubControlsVisible) {
                this.closeAllOverlays();
                this.setSubControlsVisible(false);
                this.clearButtonsAutoHide();
                this.clearSubControlsHoverTimers();
                this._hoverDismissed = true;
            } else {
                this._hoverDismissed = false;
                this.triggerPulse();
                this.setSubControlsVisible(true);
                this.triggerSubControlsAnimation();
                this.scheduleButtonsAutoHide();
            }
        }
        triggerSubControlsAnimation() {
            if (!this.subButtons) return;
            if (this.triggerAnimTimers) {
                this.triggerAnimTimers.forEach(t => clearTimeout(t));
            }
            this.triggerAnimTimers = [];
            const btns = Object.values(this.subButtons);
            btns.forEach((btn, idx) => {
                if (!btn) return;
                btn.classList.remove("trigger-anim");
                void btn.offsetWidth;
                const t = setTimeout(() => {
                    if (btn && this.isSubControlsVisible) btn.classList.add("trigger-anim");
                }, 70 + idx * 35);
                this.triggerAnimTimers.push(t);
            });
            const endTimer = setTimeout(() => {
                btns.forEach(btn => {
                    if (btn) btn.classList.remove("trigger-anim");
                });
            }, 770);
            this.triggerAnimTimers.push(endTimer);
        }
        isAnySubOverlayOpen() {
            return !!(this.isLoopBarOpen || this.isSpeedBarOpen || this.isVolumeBarOpen || typeof this.isAnyLoopInputFocused === "function" && this.isAnyLoopInputFocused());
        }
        clearSubControlsHoverTimers() {
            if (this.subControlsFadeInTimer) {
                clearTimeout(this.subControlsFadeInTimer);
                this.subControlsFadeInTimer = null;
            }
            if (this.subControlsFadeOutTimer) {
                clearTimeout(this.subControlsFadeOutTimer);
                this.subControlsFadeOutTimer = null;
            }
            if (this.triggerAnimTimers) {
                this.triggerAnimTimers.forEach(t => clearTimeout(t));
                this.triggerAnimTimers = null;
            }
        }
        onSubControlsHoverEnter() {
            if (this._hoverDismissed) return;
            if (this.subControlsFadeOutTimer) {
                clearTimeout(this.subControlsFadeOutTimer);
                this.subControlsFadeOutTimer = null;
            }
            if (this.isSubControlsVisible) return;
            if (this.subControlsFadeInTimer) return;
            const rawDelay = parseFloat(currentConfig.controlsFadeInDelay);
            const delay = (!isNaN(rawDelay) && rawDelay >= 0 ? rawDelay : .2) * 1e3;
            if (delay <= 0) {
                this.setSubControlsVisible(true);
                this.triggerSubControlsAnimation();
            } else {
                this.subControlsFadeInTimer = setTimeout(() => {
                    this.subControlsFadeInTimer = null;
                    if (this.isPointerOverController || this.isMinBubbleHovered || this.isSubControlsHovered) {
                        this.setSubControlsVisible(true);
                        this.triggerSubControlsAnimation();
                    }
                }, delay);
            }
        }
        onSubControlsHoverLeave() {
            if (this.subControlsFadeInTimer) {
                clearTimeout(this.subControlsFadeInTimer);
                this.subControlsFadeInTimer = null;
            }
            if (!this.isSubControlsVisible) return;
            if (this.subControlsFadeOutTimer) return;
            this.subControlsFadeOutTimer = setTimeout(() => {
                this.subControlsFadeOutTimer = null;
                if (!this.isPointerOverController && !this.isAnySubOverlayOpen()) {
                    this.setSubControlsVisible(false);
                }
            }, 150);
        }
        attachHost() {
            try {
                if (!this.host) return;
                if (this._isAmbientClone && !this._isPageFullscreen) {
                    if (this.host.parentNode) this.host.remove();
                    return;
                }
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                const isThisVideoInFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
                if (this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video")) {
                    const targetParent = document.body || document.documentElement;
                    if (targetParent && this.host.parentNode !== targetParent) {
                        targetParent.appendChild(this.host);
                    }
                } else if (isThisVideoInFs) {
                    let targetFsContainer = fsEl;
                    if (!fsEl || fsEl === this.video) {
                        targetFsContainer = this.video ? this.video.parentElement || (this.video.parentNode && this.video.parentNode.host ? this.video.parentNode.host : null) || document.body || document.documentElement : document.body;
                    } else if (fsEl === document.documentElement && document.body) {
                        targetFsContainer = document.body;
                    }
                    if (targetFsContainer && this.host.parentNode !== targetFsContainer) {
                        targetFsContainer.appendChild(this.host);
                    }
                } else {
                    const targetParent = document.body || document.documentElement;
                    if (targetParent && this.host.parentNode !== targetParent) {
                        targetParent.appendChild(this.host);
                    }
                }
                this.attachSubtitlesHost();
            } catch (err) {
                try {
                    if (this.host && document.body && this.host.parentNode !== document.body) {
                        document.body.appendChild(this.host);
                    }
                } catch (e) {}
                this.attachSubtitlesHost();
            }
        }
        getEmbeddedSubtitleParent() {
            if (!this.video) return null;
            const isFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (isFs) {
                if (this._fsPlayerContainer && this._fsPlayerContainer.isConnected) return this._fsPlayerContainer;
                if (this._fsPreviewWrapper && this._fsPreviewWrapper.isConnected) return this._fsPreviewWrapper;
                if (this.video.parentElement && this.video.parentElement.isConnected) return this.video.parentElement;
                return document.body || document.documentElement;
            }
            const player = typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, .video-card") : null;
            if (player && player.isConnected) return player;
            if (this.video.parentElement && this.video.parentElement.isConnected) return this.video.parentElement;
            return document.body || document.documentElement;
        }
        attachSubtitlesHost() {
            try {
                if (!this.subtitlesHost) return;
                const targetParent = this.getEmbeddedSubtitleParent();
                if (!targetParent) return;
                if (targetParent !== document.body && targetParent !== document.documentElement) {
                    try {
                        const comp = window.getComputedStyle(targetParent);
                        if (comp.position === "static") {
                            targetParent.style.setProperty("position", "relative", "important");
                        }
                    } catch (e) {}
                }
                if (this.subtitlesHost.parentNode !== targetParent) {
                    targetParent.appendChild(this.subtitlesHost);
                }
            } catch (err) {}
        }
        bindEvents() {
            this._boundRateChange = () => this.onRateChange();
            this._boundVolumeChange = () => this.onVolumeChange();
            this._boundLoadStart = () => {
                const currentSrc = this.video.currentSrc || this.video.src || "";
                this._lastVideoSrc = currentSrc;
                this._userExplicitlyToggledPlay = false;
                this._hasAppliedInitialPlayState = false;
                this._userExplicitlyAdjustedNativeVolume = false;
                this.applyInitialVideoState();
                this.applyEffectiveSpeed();
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveSpeed();
                    }
                }, 80);
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveSpeed();
                    }
                }, 250);
                this.applyEffectiveVolume();
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveVolume();
                    }
                }, 80);
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveVolume();
                    }
                }, 250);
            };
            this._boundPlay = () => {
                if (this._isScrubbing) {
                    try {
                        this.video.pause();
                    } catch (e) {}
                    return;
                }
                const currentSrc = this.video.currentSrc || this.video.src || "";
                if (this._lastVideoSrc && currentSrc && this._lastVideoSrc !== currentSrc) {
                    this.userExplicitlyToggledLoop = false;
                    this._userToggledMuteOnThisVideo = false;
                    this._shouldStayUnmuted = false;
                    this._wasAudibleBeforePause = false;
                    this._lastAudibleVolume = this.video.volume > 0 ? this.video.volume : lastAudibleVolume || 1;
                    this._userExplicitlyToggledPlay = false;
                    this._hasAppliedInitialPlayState = false;
                    this._lastVideoSrc = currentSrc;
                }
                if (lastClientX >= 0 && lastClientY >= 0) {
                    updateHoveredVideo(lastClientX, lastClientY);
                }
                const isNativeLoopPlatform = this.isPlatformDefaultLoop();
                if (isNativeLoopPlatform && this.video.duration && isFinite(this.video.duration) && Math.abs(this.video.currentTime - this.video.duration) < .05) {
                    this.video.currentTime = 0;
                }
                const domainPlayRule = getDomainPlayRule();
                const effectivePlayState = domainPlayRule || currentConfig.defaultVideoState;
                if (!this._hasAppliedInitialPlayState && !this._userExplicitlyToggledPlay && effectivePlayState === "pause") {
                    if (Date.now() - lastUserInteractionTime > 500) {
                        try {
                            this.video.pause();
                            this._hasAppliedInitialPlayState = true;
                        } catch (e) {}
                    }
                }
                if (!this._hasAppliedInitialMediaState) {
                    this._hasAppliedInitialMediaState = true;
                    this.applyEffectiveSpeed();
                    this.applyEffectiveVolume();
                }
                this._boundUpdateState();
            };
            this._boundPlaying = () => {
                if (this._isScrubbing) {
                    try {
                        this.video.pause();
                    } catch (e) {}
                    return;
                }
                if (lastClientX >= 0 && lastClientY >= 0) {
                    updateHoveredVideo(lastClientX, lastClientY);
                }
                if (lastClientX >= 0 && lastClientY >= 0) {
                    updateHoveredVideo(lastClientX, lastClientY);
                }
                followVideoUntilStable(this);
            };
            this._boundEndedCapture = e => {
                if (!isVideoLoopingActive(this)) {
                    if (isAutoScrollShortsActiveForCurrentPage(this)) {
                        e.stopImmediatePropagation();
                        this.checkAndTriggerAutoScroll("ended");
                        return;
                    }
                    const isNativeLoopPlatform = this.isPlatformDefaultLoop();
                    if (isNativeLoopPlatform) {
                        e.stopImmediatePropagation();
                        this.video.pause();
                        if (this.video.duration && isFinite(this.video.duration)) {
                            this.video.currentTime = this.video.duration;
                        }
                    }
                } else if (!this.isLooping) {
                    this.video.currentTime = 0;
                    const p = this.video.play();
                    if (p && typeof p.catch === "function") p.catch(() => {});
                }
            };
            this._boundUpdateState = () => {
                this.updateState();
                this.updatePosition();
            };
            this._boundLoadedMetadata = () => {
                this.updatePosition();
                const currentSrc = this.video.currentSrc || this.video.src || "";
                if (this._lastVideoSrc && currentSrc && this._lastVideoSrc !== currentSrc) {
                    this.userExplicitlyToggledLoop = false;
                    this._userToggledMuteOnThisVideo = false;
                    this._userExplicitlyToggledPlay = false;
                    this._hasAppliedInitialPlayState = false;
                    this._userExplicitlyAdjustedNativeVolume = false;
                }
                this._lastVideoSrc = currentSrc;
                this.updateSubtitlesButtonState();
                if (!this._userExplicitlyToggledPlay) {
                    this.applyInitialVideoState();
                }
                this.applySiteMutePreference();
                this.applyEffectiveSpeed();
                this.applyEffectiveVolume();
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveSpeed();
                        this.applyEffectiveVolume();
                    }
                }, 150);
                setTimeout(() => {
                    if (this.video && this.video.isConnected) {
                        this.applyEffectiveSpeed();
                        this.applyEffectiveVolume();
                    }
                }, 400);
                if (!this.userExplicitlyToggledLoop) {
                    this.applyAutoScrollLoopPolicy();
                }
                if (!this.isLooping && (!this.loopToggle || !this.loopToggle.checked)) {
                    this.resetLoopInputs();
                } else {
                    this.initLoopTimersIfUnset();
                }
                this.updateState();
            };
            this._boundLoopTimeUpdate = () => {
                if (this._isScrubbing) return;
                if (this.isLooping) {
                    const s = this.getLoopStartTime();
                    const e = this.getLoopEndTime();
                    if (e > s && this.video.currentTime >= e) {
                        this.video.currentTime = s;
                    }
                    return;
                }
                const dur = this.video.duration;
                const cur = this.video.currentTime;
                if (isAutoScrollShortsActiveForCurrentPage(this) && !isVideoLoopingActive(this)) {
                    if (dur && isFinite(dur) && dur > .5) {
                        if (cur >= dur - .25 && !this.video.seeking) {
                            this.checkAndTriggerAutoScroll("timeupdate_near_end");
                            return;
                        }
                        if (this._lastReportedTime > dur - .8 && cur < .35 && !this.video.seeking) {
                            this.checkAndTriggerAutoScroll("timeupdate_native_loop_detected");
                            return;
                        }
                    }
                    this._lastReportedTime = cur;
                    return;
                }
                this._lastReportedTime = cur;
                if (!this.isLoopActive() && !isVideoLoopingActive(this)) {
                    const isNativeLoopPlatform = this.isPlatformDefaultLoop();
                    if (isNativeLoopPlatform) {
                        if (dur && isFinite(dur) && dur > .5) {
                            if (cur >= dur - .2 && !this.video.paused && !this.video.seeking) {
                                this.video.pause();
                                this.video.currentTime = dur;
                            }
                        }
                    }
                }
            };
            this.video.addEventListener("ratechange", this._boundRateChange);
            this.video.addEventListener("volumechange", this._boundVolumeChange);
            this.video.addEventListener("play", this._boundPlay);
            this._boundPause = () => {
                this._lastPauseTime = Date.now();
                this._boundUpdateState();
            };
            this.video.addEventListener("pause", this._boundPause);
            this._boundSeeking = () => {
                if (this._isScrubbing) {
                    try {
                        this.video.pause();
                    } catch (e) {}
                }
                this._lastSeekTime = Date.now();
            };
            this.video.addEventListener("seeking", this._boundSeeking);
            this._boundSeeked = () => {
                if (this._isScrubbing) {
                    try {
                        this.video.pause();
                    } catch (e) {}
                }
                this._lastSeekTime = Date.now();
                this._boundUpdateState();
            };
            this.video.addEventListener("seeked", this._boundSeeked);
            this.video.addEventListener("loadstart", this._boundLoadStart);
            this.video.addEventListener("loadedmetadata", this._boundLoadedMetadata);
            this.video.addEventListener("timeupdate", this._boundLoopTimeUpdate);
            this.video.addEventListener("timeupdate", () => {
                if (this.controlsBar && this.isControlsForced) {
                    this.updateControlsBarState();
                }
            });
            this.video.addEventListener("progress", () => {
                if (this.controlsBar && this.isControlsForced) {
                    this.updateControlsBarState();
                }
            });
            this.video.addEventListener("ended", this._boundEndedCapture, true);
            this._boundVideoError = () => {
                const errCode = this.video && this.video.error ? this.video.error.code : 0;
                this.handlePlaybackCorruption(`MediaError code ${errCode}`);
            };
            this.video.addEventListener("error", this._boundVideoError);
            if (this.video.textTracks) {
                this._boundTracksChange = () => {
                    this.updateSubtitlesButtonState();
                    if (currentConfig.subtitleStyles && currentConfig.subtitleStyles.replaceSubtitles) {
                        updateNativeSubtitleVisibility();
                    }
                };
                try {
                    this.video.textTracks.addEventListener("addtrack", this._boundTracksChange);
                    this.video.textTracks.addEventListener("removetrack", this._boundTracksChange);
                    this.video.textTracks.addEventListener("change", this._boundTracksChange);
                } catch (e) {}
            }
            this._boundEnterPiP = () => {
                if (this.pipBtn) this.pipBtn.classList.add("is-active");
                if (this.subButtons && this.subButtons["pip"]) {
                    this.subButtons["pip"].classList.add("is-active");
                }
            };
            this._boundLeavePiP = () => {
                if (this.pipBtn) this.pipBtn.classList.remove("is-active");
                if (this.subButtons && this.subButtons["pip"]) {
                    this.subButtons["pip"].classList.remove("is-active");
                }
            };
            this.video.addEventListener("enterpictureinpicture", this._boundEnterPiP);
            this.video.addEventListener("leavepictureinpicture", this._boundLeavePiP);
            this._boundVideoPointerDown = () => {
                this._userExplicitlyToggledPlay = true;
                this._hasAppliedInitialPlayState = true;
                if (this.controlsBar && this.isControlsForced) {
                    this.controlsBar.classList.remove("hidden");
                    this.controlsBar.classList.remove("hover-hidden");
                    this.updatePosition();
                    if (currentConfig.autoHideButtons !== false) {
                        this.scheduleControlsBarAutoHide();
                    }
                }
            };
            this.video.addEventListener("pointerdown", this._boundVideoPointerDown, {
                passive: true
            });
            this.resizeObserver = new ResizeObserver(() => this.updatePosition());
            this.resizeObserver.observe(this.video);
            if (this.video.parentElement) {
                this.resizeObserver.observe(this.video.parentElement);
            }
            const hostEl = this.video.getRootNode && this.video.getRootNode().host ? this.video.getRootNode().host : null;
            if (hostEl) {
                this.resizeObserver.observe(hostEl);
            }
            const playerContainer = this.video.closest ? this.video.closest(".html5-video-player, #movie_player, #player, .player-container, ytd-watch-flexy") : null;
            if (playerContainer && playerContainer !== this.video.parentElement && playerContainer !== hostEl) {
                this.resizeObserver.observe(playerContainer);
            }
            this._boundUpdatePosition = () => this.updatePosition();
            this._boundFullscreenChange = () => this.onFullscreenChange();
            this.video.addEventListener("resize", this._boundUpdatePosition, {
                passive: true
            });
            window.addEventListener("scroll", this._boundUpdatePosition, {
                capture: true,
                passive: true
            });
            document.addEventListener("scroll", this._boundUpdatePosition, {
                capture: true,
                passive: true
            });
            window.addEventListener("resize", this._boundUpdatePosition, {
                passive: true
            });
            document.addEventListener("fullscreenchange", this._boundFullscreenChange);
            document.addEventListener("webkitfullscreenchange", this._boundFullscreenChange);
            this._boundVideoPointerEnter = () => {
                if (isGloballyPaused || isDomainExcluded()) return;
                if (activeHoveredCtrl && activeHoveredCtrl !== this) {
                    activeHoveredCtrl.setHovered(false);
                }
                this.setHovered(true);
                activeHoveredCtrl = this;
                lastHoveredCtrl = this;
            };
            this.video.addEventListener("pointerenter", this._boundVideoPointerEnter);
            this.minBubble.addEventListener("pointerenter", () => {
                this.isMinBubbleHovered = true;
                this.triggerPulse();
            });
            this.minBubble.addEventListener("animationend", e => {
                if (e.animationName && e.animationName.startsWith("omniPulse")) {
                    this.minBubble.classList.remove("omni-pulsing");
                }
            });
            this.minBubble.addEventListener("click", e => {
                e.stopPropagation();
                if (this.didDrag) {
                    this.didDrag = false;
                    return;
                }
                this.toggleSubControls();
            });
            this._boundOutsideClick = e => {
                if (!this.isSubControlsVisible) return;
                const path = typeof e.composedPath === "function" ? e.composedPath() : [];
                const isInside = this.container && this.container.contains(e.target) || this.host && (e.target === this.host || this.host.contains(e.target)) || path.includes(this.container) || path.includes(this.host);
                if (isInside) return;
                this.closeAllOverlays();
                this.setSubControlsVisible(false);
                this.clearButtonsAutoHide();
                this.clearSubControlsHoverTimers();
                this._hoverDismissed = true;
            };
            document.addEventListener("pointerdown", this._boundOutsideClick, true);
            const onMinBubbleEnter = () => {
                this.isMinBubbleHovered = true;
                this.clearButtonsAutoHide();
                if (currentConfig.controlsTrigger === "hover" && !this._hoverDismissed) {
                    this.onSubControlsHoverEnter();
                }
                this.updateLoopFadeState();
            };
            const onMinBubbleLeave = () => {
                this.isMinBubbleHovered = false;
                if (!this.isSubControlsHovered && !this.isPointerOverController) {
                    this._hoverDismissed = false;
                }
                if (currentConfig.controlsTrigger === "hover" && !this.isPointerOverController) {
                    this.onSubControlsHoverLeave();
                } else if (!this.isPointerOverController && this.isHovered && (this.isSubControlsVisible || currentConfig.autoHideButtons)) {
                    this.scheduleButtonsAutoHide();
                }
                this.updateLoopFadeState();
            };
            this.minBubble.addEventListener("pointerenter", onMinBubbleEnter);
            this.minBubble.addEventListener("pointerleave", onMinBubbleLeave);
            this.minBubble.addEventListener("mouseenter", onMinBubbleEnter);
            this.minBubble.addEventListener("mouseleave", onMinBubbleLeave);
            const onSubControlsEnter = () => {
                this.isSubControlsHovered = true;
                this.clearButtonsAutoHide();
                if (this.isSubControlsVisible && currentConfig.controlsTrigger === "hover" && !this._hoverDismissed) {
                    this.onSubControlsHoverEnter();
                }
            };
            const onSubControlsLeave = () => {
                this.isSubControlsHovered = false;
                if (!this.isMinBubbleHovered && !this.isPointerOverController) {
                    this._hoverDismissed = false;
                }
                if (currentConfig.controlsTrigger === "hover" && !this.isPointerOverController) {
                    this.onSubControlsHoverLeave();
                } else if (!this.isPointerOverController && this.isHovered && this.isSubControlsVisible) {
                    this.scheduleButtonsAutoHide();
                }
            };
            if (this.subControlsContainer) {
                this.subControlsContainer.addEventListener("pointerenter", onSubControlsEnter);
                this.subControlsContainer.addEventListener("pointerleave", onSubControlsLeave);
                this.subControlsContainer.addEventListener("mouseenter", onSubControlsEnter);
                this.subControlsContainer.addEventListener("mouseleave", onSubControlsLeave);
            }
            this.isHovering = false;
            this.isPointerOverController = false;
            const onCtrlEnter = e => {
                this.isHovering = true;
                this.isPointerOverController = true;
                this.setHovered(true);
                activeHoveredCtrl = this;
                lastHoveredCtrl = this;
                if (this.autoMinimizeTimer) {
                    clearTimeout(this.autoMinimizeTimer);
                    this.autoMinimizeTimer = null;
                }
                if (this.isSubControlsVisible && currentConfig.controlsTrigger === "hover" && !this._hoverDismissed) {
                    this.onSubControlsHoverEnter();
                }
            };
            const onCtrlMove = e => {
                this.isHovering = true;
                this.isPointerOverController = true;
            };
            const onCtrlLeave = e => {
                this.isHovering = false;
                this.isPointerOverController = false;
                this.isMinBubbleHovered = false;
                this.isSubControlsHovered = false;
                this._hoverDismissed = false;
                if (currentConfig.controlsTrigger === "hover") {
                    this.onSubControlsHoverLeave();
                }
                const x = e ? e.clientX : -1;
                const y = e ? e.clientY : -1;
                const vRect = getVisibleVideoRect(this.video);
                const isStillOverVideo = vRect && (x >= vRect.left && x <= vRect.right && y >= vRect.top && y <= vRect.bottom);
                const related = e ? e.relatedTarget || e.toElement : null;
                if (!isStillOverVideo && (!related || !isElementAssociatedWithVideo(related, this.video))) {
                    if (!this.isHovered) {
                        this.container.classList.add("hover-hidden");
                    }
                }
            };
            this.container.addEventListener("mouseenter", onCtrlEnter);
            this.container.addEventListener("pointerenter", onCtrlEnter);
            this.container.addEventListener("mousemove", onCtrlMove);
            this.container.addEventListener("pointermove", onCtrlMove);
            this.container.addEventListener("mouseleave", onCtrlLeave);
            this.container.addEventListener("pointerleave", onCtrlLeave);
            if (this.subControlsContainer) {
                this.subControlsContainer.addEventListener("pointerdown", e => {
                    const btn = e.target.closest(".omni-sub-btn");
                    if (btn) this.triggerSubBtnPulse(btn);
                    e.stopPropagation();
                });
                this.subControlsContainer.addEventListener("pointerover", e => {
                    const btn = e.target.closest(".omni-sub-btn");
                    if (btn && (!e.relatedTarget || !btn.contains(e.relatedTarget))) {
                        this.triggerSubBtnPulse(btn);
                    }
                });
                this.subControlsContainer.addEventListener("animationend", e => {
                    if (e.animationName && (e.animationName.startsWith("omniSubPulse") || e.animationName === "omniPulseActive")) {
                        if (e.target && e.target.classList) {
                            e.target.classList.remove("omni-pulsing");
                        }
                    }
                });
                this.subControlsContainer.addEventListener("click", e => {
                    const btn = e.target.closest(".omni-sub-btn");
                    if (!btn) return;
                    this.triggerSubBtnPulse(btn);
                    e.stopPropagation();
                    const ctrlId = btn.dataset.control;
                    if (ctrlId === "loop") {
                        this.toggleLoopBar();
                    } else if (ctrlId === "speed") {
                        this.toggleSpeedBar();
                    } else if (ctrlId === "volume") {
                        this.toggleVolumeBar();
                    } else if (ctrlId === "progressBar") {
                        this.toggleControlsBar();
                    } else {
                        this.handleAction(ctrlId);
                    }
                });
            }
            if (this.loopBar) {
                this.loopBar.addEventListener("click", e => e.stopPropagation());
                this.loopBar.addEventListener("pointerdown", e => e.stopPropagation());
            }
            if (this.loopToggle) {
                this.loopToggle.addEventListener("change", e => {
                    e.stopPropagation();
                    this.onLoopToggleChange();
                });
            }
            const loopInputs = [ this.startMInput, this.startSInput, this.endMInput, this.endSInput ];
            loopInputs.forEach(inp => {
                if (!inp) return;
                const stopAll = e => e.stopPropagation();
                inp.addEventListener("keydown", stopAll);
                inp.addEventListener("keyup", stopAll);
                inp.addEventListener("keypress", stopAll);
                inp.addEventListener("click", stopAll);
                inp.addEventListener("pointerdown", stopAll);
                inp.addEventListener("input", () => {
                    if (this.isLooping) {
                        this.onLoopInputsChanged();
                    }
                });
                inp.addEventListener("change", () => {
                    this.normalizeLoopInputs();
                });
                inp.addEventListener("focus", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
                inp.addEventListener("blur", () => {
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused() && !this.isSliderDragging) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
            });
            const onLoopEnter = () => {
                this.isLoopHovering = true;
                this.isSubControlsHovered = true;
                this.isPointerOverController = true;
                this.clearButtonsAutoHide();
                this.setHovered(true);
                activeHoveredCtrl = this;
                lastHoveredCtrl = this;
                this.clearOverlaysAutoMinimizeTimer();
            };
            const onLoopLeave = () => {
                this.isLoopHovering = false;
                if (this.isHovered) {
                    this.scheduleButtonsAutoHide();
                }
                if (this.isAnyOverlayOpen() && !this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused() && !this.isSliderDragging) {
                    if (currentConfig.autoMinimize) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                }
            };
            if (this.loopBar) {
                this.loopBar.addEventListener("pointerenter", onLoopEnter);
                this.loopBar.addEventListener("pointerleave", onLoopLeave);
                this.loopBar.addEventListener("mouseenter", onLoopEnter);
                this.loopBar.addEventListener("mouseleave", onLoopLeave);
                this.loopBar.addEventListener("pointermove", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
            }
            if (this.speedBar) {
                this.speedBar.addEventListener("click", e => e.stopPropagation());
                this.speedBar.addEventListener("pointerdown", e => e.stopPropagation());
                this.speedBar.addEventListener("mousedown", e => e.stopPropagation());
            }
            if (this.speedSlider) {
                const onSliderUpdate = e => {
                    e.stopPropagation();
                    this.clearOverlaysAutoMinimizeTimer();
                    const rate = parseFloat(this.speedSlider.value);
                    const prevRate = this.video ? this.video.playbackRate || 1 : 1;
                    if (!isNaN(rate) && rate >= .25 && rate <= 16) {
                        this.setSpeed(rate, true, rate < prevRate);
                    }
                };
                this.speedSlider.addEventListener("input", onSliderUpdate);
                this.speedSlider.addEventListener("change", e => {
                    onSliderUpdate(e);
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.speedSlider.addEventListener("pointerdown", e => {
                    e.stopPropagation();
                    this.isSliderDragging = true;
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.speedSlider.addEventListener("pointerup", () => {
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.speedSlider.addEventListener("focus", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.speedSlider.addEventListener("blur", () => {
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.speedSlider.addEventListener("keydown", e => {
                    e.stopPropagation();
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.speedSlider.addEventListener("keyup", e => e.stopPropagation());
            }
            if (this.presetNormalBtn) {
                this.presetNormalBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.setSpeed(1, true);
                    this.clearOverlaysAutoMinimizeTimer();
                    if (!this.isHoveringAnyOverlay()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
            }
            if (this.presetFavBtn) {
                this.presetFavBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.toggleFavoriteSpeed();
                    this.clearOverlaysAutoMinimizeTimer();
                    if (!this.isHoveringAnyOverlay()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
            }
            if (this.presetSuperBtn) {
                this.presetSuperBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.toggleSuperSpeed();
                    this.clearOverlaysAutoMinimizeTimer();
                    if (!this.isHoveringAnyOverlay()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
            }
            const onSpeedEnter = () => {
                this.isSpeedHovering = true;
                this.isSubControlsHovered = true;
                this.isPointerOverController = true;
                this.clearButtonsAutoHide();
                this.setHovered(true);
                activeHoveredCtrl = this;
                lastHoveredCtrl = this;
                this.clearOverlaysAutoMinimizeTimer();
            };
            const onSpeedLeave = () => {
                this.isSpeedHovering = false;
                if (this.isHovered) {
                    this.scheduleButtonsAutoHide();
                }
                if (this.isAnyOverlayOpen() && !this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused() && !this.isSliderDragging) {
                    if (currentConfig.autoMinimize) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                }
            };
            if (this.speedBar) {
                this.speedBar.addEventListener("pointerenter", onSpeedEnter);
                this.speedBar.addEventListener("pointerleave", onSpeedLeave);
                this.speedBar.addEventListener("mouseenter", onSpeedEnter);
                this.speedBar.addEventListener("mouseleave", onSpeedLeave);
                this.speedBar.addEventListener("pointermove", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
            }
            if (this.volumeBar) {
                this.volumeBar.addEventListener("click", e => e.stopPropagation());
                this.volumeBar.addEventListener("pointerdown", e => e.stopPropagation());
                this.volumeBar.addEventListener("mousedown", e => e.stopPropagation());
            }
            if (this.volumeSlider) {
                const onSliderUpdate = e => {
                    e.stopPropagation();
                    this.clearOverlaysAutoMinimizeTimer();
                    const pct = parseInt(this.volumeSlider.value, 10);
                    if (!isNaN(pct)) {
                        const vol = pct / 100;
                        const prevVol = this.getEffectiveVolume();
                        this.setEffectiveVolume(vol, true, vol < prevVol);
                    }
                };
                this.volumeSlider.addEventListener("input", onSliderUpdate);
                this.volumeSlider.addEventListener("change", e => {
                    onSliderUpdate(e);
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.volumeSlider.addEventListener("pointerdown", e => {
                    e.stopPropagation();
                    this.isSliderDragging = true;
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.volumeSlider.addEventListener("pointerup", () => {
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.volumeSlider.addEventListener("focus", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.volumeSlider.addEventListener("blur", () => {
                    this.isSliderDragging = false;
                    if (!this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
                this.volumeSlider.addEventListener("keydown", e => {
                    e.stopPropagation();
                    this.clearOverlaysAutoMinimizeTimer();
                });
                this.volumeSlider.addEventListener("keyup", e => e.stopPropagation());
            }
            if (this.volumeToggle) {
                this.volumeToggle.addEventListener("change", e => {
                    e.stopPropagation();
                    this.toggleMute();
                    this.clearOverlaysAutoMinimizeTimer();
                    if (!this.isHoveringAnyOverlay()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                });
            }
            const onVolumeEnter = () => {
                this.isVolumeHovering = true;
                this.isSubControlsHovered = true;
                this.isPointerOverController = true;
                this.clearButtonsAutoHide();
                this.setHovered(true);
                activeHoveredCtrl = this;
                lastHoveredCtrl = this;
                this.clearOverlaysAutoMinimizeTimer();
            };
            const onVolumeLeave = () => {
                this.isVolumeHovering = false;
                if (this.isHovered) {
                    this.scheduleButtonsAutoHide();
                }
                if (this.isAnyOverlayOpen() && !this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused() && !this.isSliderDragging) {
                    if (currentConfig.autoMinimize) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                }
            };
            if (this.volumeBar) {
                this.volumeBar.addEventListener("pointerenter", onVolumeEnter);
                this.volumeBar.addEventListener("pointerleave", onVolumeLeave);
                this.volumeBar.addEventListener("mouseenter", onVolumeEnter);
                this.volumeBar.addEventListener("mouseleave", onVolumeLeave);
                this.volumeBar.addEventListener("pointermove", () => {
                    this.clearOverlaysAutoMinimizeTimer();
                });
            }
            this.initDragging();
        }
        initDragging() {
            let startX, startY, initX, initY;
            const onPointerDown = e => {
                if (e.target.closest(".omni-sub-btn") || e.target.closest(".omni-loop-input") || e.target.closest(".omni-loop-switch") || e.target.closest(".omni-loop-bar") || e.target.closest(".omni-speed-bar") || e.target.closest(".omni-volume-bar")) return;
                this.didDrag = false;
                this.isDragging = true;
                this.container.classList.add("dragging");
                startX = e.clientX;
                startY = e.clientY;
                const rect = this.container.getBoundingClientRect();
                initX = rect.left;
                initY = rect.top;
                window.addEventListener("pointermove", onPointerMove);
                window.addEventListener("pointerup", onPointerUp);
            };
            const onPointerMove = e => {
                if (!this.isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    this.didDrag = true;
                    if (e.cancelable) e.preventDefault();
                }
                const scale = parseFloat(currentConfig.overlaySize) || 1;
                const pad = Math.round(40 * scale);
                const newX = Math.max(10, Math.min(window.innerWidth - pad, initX + dx));
                const newY = Math.max(10, Math.min(window.innerHeight - pad, initY + dy));
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                this._customPositionWasSetInFs = isVideoInFullscreen(this.video, fsEl);
                this.customPosition = {
                    x: newX,
                    y: newY
                };
                this.container.style.left = `${newX}px`;
                this.container.style.top = `${newY}px`;
                this.container.style.right = "auto";
                this.container.style.bottom = "auto";
            };
            const onPointerUp = () => {
                this.isDragging = false;
                this.container.classList.remove("dragging");
                window.removeEventListener("pointermove", onPointerMove);
                window.removeEventListener("pointerup", onPointerUp);
                setTimeout(() => {
                    this.didDrag = false;
                }, 120);
                if (!this.isHovered && !this.isHovering) {
                    this.container.classList.add("hover-hidden");
                }
            };
            this.minBubble.addEventListener("pointerdown", onPointerDown);
        }
        onFullscreenChange() {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (!fsEl && this._isPageFullscreen) {
                this._enteredWithNativeFs = false;
                this.exitForcedFullscreen();
                return;
            }
            const isFsNow = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (!isFsNow) {
                this.restorePreFullscreenControlsState();
            } else {
                this.savePreFullscreenControlsState();
                if (!this._isPageFullscreen) {
                    if (!this._wasControlsForcedBeforeFs) {
                        this.isControlsForced = false;
                        if (this.controlsBar) {
                            this.controlsBar.classList.add("hidden");
                            this.controlsBar.classList.add("hover-hidden");
                            this.updateControlsBarState();
                        }
                        if (typeof this.updateProgressBarButtonState === "function") {
                            this.updateProgressBarButtonState();
                        }
                    }
                } else {
                    const hasNativeControls = typeof this.hasNativePlayerControls === "function" && this.hasNativePlayerControls();
                    if (!hasNativeControls) {
                        this.isControlsForced = true;
                        if (this.controlsBar) {
                            this.controlsBar.classList.remove("hidden");
                            this.controlsBar.classList.remove("hover-hidden");
                            this.updateControlsBarState();
                            if (currentConfig.autoHideButtons !== false) {
                                this.scheduleControlsBarAutoHide();
                            }
                        }
                        if (typeof this.updateProgressBarButtonState === "function") {
                            this.updateProgressBarButtonState();
                        }
                    } else {
                        if (!this._wasControlsForcedBeforeFs) {
                            this.isControlsForced = false;
                            if (this.controlsBar) {
                                this.controlsBar.classList.add("hidden");
                                this.controlsBar.classList.add("hover-hidden");
                                this.updateControlsBarState();
                            }
                        }
                    }
                }
                if (this._isPageFullscreen && this._fsSavedScroll) {
                    try {
                        window.scrollTo({
                            left: this._fsSavedScroll.x,
                            top: this._fsSavedScroll.y,
                            behavior: "instant"
                        });
                    } catch (e) {
                        window.scrollTo(this._fsSavedScroll.x, this._fsSavedScroll.y);
                    }
                }
            }
            this.attachHost();
            this.updatePosition();
            if (this._fsRafId) {
                cancelAnimationFrame(this._fsRafId);
                this._fsRafId = null;
            }
            const startTime = performance.now();
            const duration = 200;
            const step = () => {
                this.updatePosition();
                if (performance.now() - startTime < duration) {
                    this._fsRafId = requestAnimationFrame(step);
                } else {
                    this.updatePosition();
                    this._fsRafId = null;
                }
            };
            this._fsRafId = requestAnimationFrame(step);
        }
        updatePosition() {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            const fsRect = isFs && fsEl !== this.video && fsEl !== document.documentElement && this.host && this.host.parentNode === fsEl ? fsEl.getBoundingClientRect() : {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
            const rect = getVisibleVideoRect(this.video);
            const scale = currentConfig.overlaySize || 1;
            const margin = 16;
            let mainLeft = 0;
            let mainTop = 0;
            const userScale = parseFloat(currentConfig.overlaySize) || 1;
            const numSubBtns = this.subControlsContainer && this.isSubControlsVisible ? this.subControlsContainer.children.length : 0;
            const unscaledContainerHeight = this.isSubControlsVisible && numSubBtns > 0 ? 32 + numSubBtns * 34 + 6 : 32;
            if (this.customPosition && (!isFs || this._customPositionWasSetInFs)) {
                mainLeft = this.customPosition.x;
                mainTop = this.customPosition.y;
                this.container.style.left = `${this.customPosition.x}px`;
                this.container.style.top = `${this.customPosition.y}px`;
                if (rect && rect.height > 0) {
                    const vBottom = rect.bottom - fsRect.top;
                    const overlayScale = parseFloat(currentConfig.overlaySize) || 1;
                    const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
                    const isBarActive = activeControls.includes("progressBar") || this.isControlsForced !== false && isControlsForcedGlobal !== false || this.controlsBar && !this.controlsBar.classList.contains("hidden");
                    const barActualHeight = (isFs ? 48 : 30) * overlayScale;
                    const barTop = vBottom - (isFs ? 18 : 10) - barActualHeight;
                    const bottomLimit = isBarActive ? barTop - 8 : vBottom - 8;
                    const maxAvailHeight = Math.max(32, bottomLimit - this.customPosition.y);
                    const neededHeight = unscaledContainerHeight * userScale;
                    let effectiveContainerScale = userScale;
                    if (neededHeight > maxAvailHeight && unscaledContainerHeight > 0) {
                        const squishScale = maxAvailHeight / unscaledContainerHeight;
                        effectiveContainerScale = Math.max(.4, Math.min(userScale, squishScale));
                    }
                    if (this.container && this.container.style) {
                        this.container.style.setProperty("--omni-scale", effectiveContainerScale);
                    }
                }
            } else {
                if (!rect || rect.width < 50 || rect.height < 50 || !this.video.isConnected) {
                    this.container.style.display = "none";
                } else {
                    this.container.style.display = "";
                    const vLeft = rect.left - fsRect.left;
                    const vTop = rect.top - fsRect.top;
                    const vRight = rect.right - fsRect.left;
                    const vBottom = rect.bottom - fsRect.top;
                    const vHeight = rect.height;
                    const contWidth = fsRect.width || window.innerWidth;
                    const contHeight = fsRect.height || window.innerHeight;
                    const topMargin = vHeight < 360 ? Math.max(8, Math.min(16, vHeight * .04)) : 16;
                    const targetY = Math.max(8, Math.min(vTop + topMargin, contHeight - 40));
                    const overlayScale = parseFloat(currentConfig.overlaySize) || 1;
                    const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
                    const isBarActive = activeControls.includes("progressBar") || this.isControlsForced !== false && isControlsForcedGlobal !== false || this.controlsBar && !this.controlsBar.classList.contains("hidden");
                    const barActualHeight = (isFs ? 48 : 30) * overlayScale;
                    const barTop = vBottom - (isFs ? 18 : 10) - barActualHeight;
                    const bottomLimit = isBarActive ? barTop - 8 : vBottom - 8;
                    const maxAvailHeight = Math.max(32, bottomLimit - targetY);
                    const neededHeight = unscaledContainerHeight * userScale;
                    let effectiveContainerScale = userScale;
                    if (neededHeight > maxAvailHeight && unscaledContainerHeight > 0) {
                        const squishScale = maxAvailHeight / unscaledContainerHeight;
                        effectiveContainerScale = Math.max(.4, Math.min(userScale, squishScale));
                    }
                    if (this.container && this.container.style) {
                        this.container.style.setProperty("--omni-scale", effectiveContainerScale);
                    }
                    const baseBtnWidth = 32;
                    let targetX;
                    if (currentConfig.controllerPosition === "topRight") {
                        targetX = vRight - baseBtnWidth - topMargin;
                    } else {
                        targetX = vLeft + topMargin;
                    }
                    targetX = Math.max(8, Math.min(targetX, contWidth - baseBtnWidth - 8));
                    mainLeft = targetX;
                    mainTop = targetY;
                    this.container.style.left = `${targetX}px`;
                    this.container.style.top = `${targetY}px`;
                }
            }
            if (this.controlsBar) {
                let vRect = null;
                try {
                    vRect = this.video.getBoundingClientRect();
                } catch (e) {}
                const contW = fsRect.width || window.innerWidth;
                const contH = fsRect.height || window.innerHeight;
                const isTooSmallOrOffscreen = !vRect || vRect.width < 120 || vRect.height < 60 || !this.video.isConnected || !isFs && (vRect.bottom < 40 || vRect.top > contH - 20);
                if (isTooSmallOrOffscreen) {
                    this.controlsBar.style.display = "none";
                } else {
                    this.controlsBar.style.display = "";
                    this.controlsBar.classList.toggle("is-fullscreen", isFs);
                    if (this.subtitlesOverlay) {
                        this.subtitlesOverlay.classList.toggle("is-fullscreen", isFs);
                    }
                    if (this.subtitlesSettingsPopup) {
                        this.subtitlesSettingsPopup.classList.toggle("is-fullscreen", isFs);
                    }
                    const vLeft = vRect.left - fsRect.left;
                    const vBottom = vRect.bottom - fsRect.top;
                    const vRight = vRect.right - fsRect.left;
                    const vWidth = vRect.width;
                    if (isFs) {
                        const fsBarHeight = 48;
                        const fsMarginX = Math.max(16, Math.min(32, Math.round(contW * .02)));
                        const fsMarginBottom = 18;
                        const targetW = Math.max(vWidth, contW);
                        const fullW = Math.max(200, targetW - fsMarginX * 2);
                        let left = fsMarginX;
                        let top = contH - fsBarHeight - fsMarginBottom;
                        if (left < 0) left = 0;
                        if (left + fullW > contW) {
                            left = Math.max(0, (contW - fullW) / 2);
                        }
                        if (top + fsBarHeight > contH - 8) {
                            top = Math.max(0, contH - fsBarHeight - 8);
                        }
                        this.controlsBar.style.left = `${Math.round(left)}px`;
                        this.controlsBar.style.top = `${Math.round(top)}px`;
                        this.controlsBar.style.width = `${Math.round(fullW)}px`;
                    } else {
                        const barHeight = 30;
                        const isInstagram = window.location.hostname.includes("instagram.com") || isDomainControlsForced();
                        const marginR = isInstagram ? 54 : 20;
                        const marginL = 10;
                        const barTop = vBottom - barHeight - 10;
                        const scale2 = parseFloat(currentConfig.overlaySize) || 1;
                        const availWidth = Math.max(140, vWidth - marginL - marginR);
                        const maxAllowed = scale2 > 1 ? availWidth / scale2 : availWidth;
                        const maxW = Math.max(140, Math.min(maxAllowed, 600));
                        let left;
                        if (vWidth <= 720 || isInstagram) {
                            left = vLeft + marginL;
                        } else {
                            left = Math.max(vLeft + marginL, vLeft + (vWidth - maxW) / 2);
                            if (left + maxW > vRight - marginR) {
                                left = Math.max(vLeft + marginL, vRight - marginR - maxW);
                            }
                        }
                        const top = barTop;
                        this.controlsBar.style.left = `${Math.max(4, left)}px`;
                        this.controlsBar.style.top = `${top}px`;
                        this.controlsBar.style.width = `${maxW}px`;
                    }
                }
            }
            if (currentConfig.controllerPosition === "topRight") {
                this.container.classList.add("position-top-right");
                this.container.classList.remove("position-top-left");
            } else {
                this.container.classList.add("position-top-left");
                this.container.classList.remove("position-top-right");
            }
            if (this.hud && this.hud.classList.contains("active")) {
                this.updateHUDPosition();
            }
            this.updateSubtitlesPosition();
            this.updateSubtitlesPopupPosition();
        }
        resetPosition() {
            this.customPosition = null;
            this.updatePosition();
            this.showHUD("Position Reset");
        }
        updateState() {
            const isLoopActive = this.isLoopActive();
            if (this.loopBtn) {
                this.loopBtn.classList.toggle("is-looping", isLoopActive);
            }
            if (this.subButtons && this.subButtons["loop"]) {
                this.subButtons["loop"].classList.toggle("is-looping", isLoopActive);
            }
            if (this.loopToggle) {
                this.loopToggle.checked = isLoopActive;
            }
            const isPoppedOut = !!(document.pictureInPictureElement && document.pictureInPictureElement === this.video || this.video && this.video.webkitPresentationMode === "picture-in-picture");
            if (this.pipBtn) {
                this.pipBtn.classList.toggle("is-active", isPoppedOut);
            }
            if (this.subButtons && this.subButtons["pip"]) {
                this.subButtons["pip"].classList.toggle("is-active", isPoppedOut);
            }
            this.updateSpeedUI();
            this.updateVolumeUI();
            if (this.updateControlsBarState) {
                this.updateControlsBarState();
            }
            this.minBubble.style.display = "flex";
            this.container.classList.remove("is-expanded");
            this.container.classList.add("is-minimized");
        }
        hide() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("hide")) {
                return;
            }
            if (hideRestoreTimer) {
                clearTimeout(hideRestoreTimer);
                hideRestoreTimer = null;
            }
            this.closeAllOverlays();
            this.setSubControlsVisible(false);
            this.container.classList.add("hidden");
            isGloballyHidden = true;
            if (activeHoveredCtrl) {
                activeHoveredCtrl.setHovered(false);
                activeHoveredCtrl = null;
            }
            activeControllers.forEach(ctrl => {
                if (typeof ctrl.closeAllOverlays === "function") ctrl.closeAllOverlays();
                if (typeof ctrl.setSubControlsVisible === "function") ctrl.setSubControlsVisible(false);
                ctrl.updateVisibility();
            });
            this.showHUD("Controls Hidden");
            const duration = parseFloat(currentConfig.hideControlsDuration) || 0;
            if (duration > 0) {
                hideRestoreTimer = setTimeout(() => {
                    hideRestoreTimer = null;
                    if (isGloballyHidden) {
                        restoreControlsVisibility(this);
                    }
                }, duration * 1e3);
            }
        }
        updateVisibility() {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isAnyFs = !!fsEl;
            const isThisVideoInFs = isVideoInFullscreen(this.video, fsEl);
            if (isGloballyPaused || isDomainExcluded() || isGloballyHidden || isSupportActive || isAnyFs && !isThisVideoInFs) {
                this.container.classList.add("hidden");
                if (this.controlsBar) this.controlsBar.classList.add("hidden");
            } else {
                this.container.classList.remove("hidden");
                if (this.controlsBar && this.isControlsForced) {
                    this.controlsBar.classList.remove("hidden");
                }
            }
        }
        updateThemeAndConfig() {
            this.updateVisibility();
            if (currentConfig.showHotkeyHUD === false && this.hud) {
                this.hud.classList.remove("active");
                if (this.hudTimer) {
                    clearTimeout(this.hudTimer);
                    this.hudTimer = null;
                }
            }
            const scale = parseFloat(currentConfig.overlaySize) || 1;
            const opacity = currentConfig.opacity !== void 0 ? parseFloat(currentConfig.opacity) : .9;
            const style = this.host.style;
            style.setProperty("--omni-opacity", opacity);
            style.setProperty("--omni-scale", scale);
            const themePreset = currentConfig.theme && currentConfig.theme !== "custom" && THEME_PRESETS[currentConfig.theme] ? THEME_PRESETS[currentConfig.theme] : null;
            const btnBg = themePreset ? themePreset.buttonBgColor : currentConfig.buttonBgColor || "#181926";
            const activeCol = themePreset ? themePreset.activeColor : currentConfig.activeColor || "#38bdf8";
            const buttonsCol = themePreset ? themePreset.buttonsColor : currentConfig.buttonsColor || "#cbd5e1";
            const stateCol = themePreset ? themePreset.activeStateColor : currentConfig.activeStateColor || "#a855f7";
            style.setProperty("--omni-btn-bg", btnBg);
            style.setProperty("--omni-active-color", activeCol);
            style.setProperty("--omni-controls-color", buttonsCol);
            style.setProperty("--omni-state-color", stateCol);
            if (this.container) {
                this.container.classList.toggle("no-glow", currentConfig.glowEnabled === false);
            }
            if (this.controlsBar) {
                this.controlsBar.classList.toggle("no-glow", currentConfig.glowEnabled === false);
            }
            if (this.hud) {
                this.hud.classList.toggle("no-glow", currentConfig.glowEnabled === false);
            }
            if (this.subtitlesSettingsPopup) {
                this.subtitlesSettingsPopup.classList.toggle("no-glow", currentConfig.glowEnabled === false);
            }
            if (this.container && this.container.style) {
                this.container.style.setProperty("--omni-opacity", opacity);
                this.container.style.setProperty("--omni-scale", scale);
            }
            if (this.controlsBar && this.controlsBar.style) {
                this.controlsBar.style.setProperty("--omni-opacity", opacity);
                this.controlsBar.style.setProperty("--omni-scale", scale);
            }
            if (!currentConfig.volumeBoostEnabled && this.getEffectiveVolume() > 1) {
                this.setEffectiveVolume(1);
            }
            this.buildSubControls();
            if (this.controlsBar) {
                const isForced = isControlsForcedGlobal !== null ? isControlsForcedGlobal : isDomainControlsForced();
                this.isControlsForced = isForced;
                if (isForced) {
                    this.controlsBar.classList.remove("hidden");
                } else {
                    this.controlsBar.classList.add("hidden");
                }
            }
            this.updateState();
            this.updatePosition();
        }
        updateLoopFadeState() {}
        clearButtonsAutoHide() {
            if (this.autoHideButtonsTimer) {
                clearTimeout(this.autoHideButtonsTimer);
                this.autoHideButtonsTimer = null;
            }
        }
        scheduleButtonsAutoHide() {
            this.clearButtonsAutoHide();
            if (currentConfig.autoHideButtons === false) return;
            if (!this.isMinimized) return;
            const delay = currentConfig.autoHideButtonsTimeout !== void 0 ? currentConfig.autoHideButtonsTimeout : 2500;
            if (delay <= 0) return;
            this.autoHideButtonsTimer = setTimeout(() => {
                this.autoHideButtonsTimer = null;
                const shouldKeepVisible = !this.isMinimized || this.isDragging || this.isPointerOverController || this.isMinBubbleHovered || this.isSubControlsHovered || this.isLoopHovering || this.isSpeedHovering || this.isVolumeHovering || this.isBridgeHovered || this.isAnySubOverlayOpen();
                if (shouldKeepVisible) {
                    this.scheduleButtonsAutoHide();
                    return;
                }
                if (this.isHovered) {
                    this.container.classList.add("hover-hidden");
                    if (this.isSubControlsVisible) {
                        this.setSubControlsVisible(false);
                    }
                } else {
                    if (this.isSubControlsVisible) {
                        this.setSubControlsVisible(false);
                    }
                }
            }, delay);
        }
        onPointerActivity() {
            if (!this.isHovered) return;
            this._isPointerActive = true;
            if (this._pointerInactiveTimer) {
                clearTimeout(this._pointerInactiveTimer);
            }
            this._pointerInactiveTimer = setTimeout(() => {
                this._pointerInactiveTimer = null;
                this._isPointerActive = false;
                this.updateSubtitlesPosition();
            }, 2500);
            if (this.isMinimized && this.container.classList.contains("hover-hidden")) {
                this.container.classList.remove("hover-hidden");
                this.updatePosition();
            } else {
                this.updatePosition();
            }
            if (this.controlsBar && this.isControlsForced) {
                if (this.controlsBar.classList.contains("hover-hidden")) {
                    this.controlsBar.classList.remove("hover-hidden");
                    this.updatePosition();
                }
                if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false) {
                    this.scheduleControlsBarAutoHide();
                }
            }
            this.updateSubtitlesPosition();
            this.scheduleButtonsAutoHide();
        }
        setHovered(hovered) {
            this.isHovered = hovered;
            if (hovered) {
                lastHoveredCtrl = this;
                const wasHidden = this.container && this.container.classList.contains("hover-hidden");
                this.container.classList.remove("hover-hidden");
                if (wasHidden) {
                    this.triggerPulse();
                }
                if (this.controlsBar && this.isControlsForced) {
                    this.controlsBar.classList.remove("hidden");
                    this.controlsBar.classList.remove("hover-hidden");
                    this.updatePosition();
                    if (!this.isControlsBarPinned && currentConfig.autoHideButtons !== false) {
                        this.scheduleControlsBarAutoHide();
                    }
                }
                this.updateSubtitlesPosition();
                this.updatePosition();
                this.scheduleButtonsAutoHide();
            } else {
                this._isPointerActive = false;
                if (this._pointerInactiveTimer) {
                    clearTimeout(this._pointerInactiveTimer);
                    this._pointerInactiveTimer = null;
                }
                if (this.controlsBar && !this._isScrubbing && !this.isControlsBarHovered) {
                    if (!this.isControlsBarPinned) {
                        this.controlsBar.classList.add("hover-hidden");
                        if (this.controlsBarAutoHideTimer) {
                            clearTimeout(this.controlsBarAutoHideTimer);
                            this.controlsBarAutoHideTimer = null;
                        }
                    }
                }
                this.updateSubtitlesPosition();
                if (this.isDragging || !this.isMinimized && this.isHovering) {
                    return;
                }
                this.clearButtonsAutoHide();
                this.isPointerOverController = false;
                this.isMinBubbleHovered = false;
                this.isSubControlsHovered = false;
                this.isRepeatBtnHovered = false;
                this.isLoopHovering = false;
                this.isSpeedHovering = false;
                this.isVolumeHovering = false;
                this.isBridgeHovered = false;
                this.clearSubControlsHoverTimers();
                this._hoverDismissed = false;
                if (currentConfig.controlsTrigger === "hover" && !this.isAnySubOverlayOpen()) {
                    this.setSubControlsVisible(false);
                }
                if (this.fadeHoverLeaveTimer) {
                    clearTimeout(this.fadeHoverLeaveTimer);
                    this.fadeHoverLeaveTimer = null;
                }
                this.container.classList.add("hover-hidden");
                if (this.isAnyOverlayOpen() && currentConfig.autoMinimize && !this.isHoveringAnyOverlay() && !this.isAnyOverlayInputFocused()) {
                    this.scheduleOverlaysAutoMinimize();
                }
            }
        }
        isPointOverController(x, y) {
            if (x < 0 || y < 0) return false;
            if (!this.container || !this.container.isConnected) return false;
            if (this.container.classList.contains("hidden") || this.container.classList.contains("hover-hidden")) {
                return false;
            }
            const cRect = this.container.getBoundingClientRect();
            if (x >= cRect.left && x <= cRect.right && y >= cRect.top && y <= cRect.bottom) {
                return true;
            }
            if (this.isLoopBarOpen && this.loopBar && !this.loopBar.classList.contains("collapsed")) {
                const lRect = this.loopBar.getBoundingClientRect();
                if (x >= lRect.left - 4 && x <= lRect.right + 4 && y >= lRect.top - 4 && y <= lRect.bottom + 4) {
                    return true;
                }
            }
            if (this.isSpeedBarOpen && this.speedBar && !this.speedBar.classList.contains("collapsed")) {
                const sRect = this.speedBar.getBoundingClientRect();
                if (x >= sRect.left - 4 && x <= sRect.right + 4 && y >= sRect.top - 4 && y <= sRect.bottom + 4) {
                    return true;
                }
            }
            if (this.isVolumeBarOpen && this.volumeBar && !this.volumeBar.classList.contains("collapsed")) {
                const vRect = this.volumeBar.getBoundingClientRect();
                if (x >= vRect.left - 4 && x <= vRect.right + 4 && y >= vRect.top - 4 && y <= vRect.bottom + 4) {
                    return true;
                }
            }
            if (this.controlsBar && !this.controlsBar.classList.contains("hidden") && !this.controlsBar.classList.contains("hover-hidden")) {
                const cbRect = this.controlsBar.getBoundingClientRect();
                if (x >= cbRect.left - 4 && x <= cbRect.right + 4 && y >= cbRect.top - 4 && y <= cbRect.bottom + 4) {
                    return true;
                }
            }
            return false;
        }
        handleAction(action) {
            switch (action) {
              case "settings":
                if (cleanupIfInvalidated()) return;
                try {
                    chrome.runtime.sendMessage({
                        type: "openSettingsPage"
                    });
                } catch (e) {
                    cleanupIfInvalidated();
                }
                break;

              case "favoriteSpeed":
                this.toggleFavoriteSpeed();
                break;

              case "superspeed":
                this.toggleSuperSpeed();
                break;

              case "forwardShort":
                this.seek(currentConfig.shortSkipDuration || 5);
                break;

              case "forwardLong":
                this.seek(currentConfig.longSkipDuration || 30);
                break;

              case "backwardShort":
                this.seek(-(currentConfig.shortSkipDuration || 5));
                break;

              case "backwardLong":
                this.seek(-(currentConfig.longSkipDuration || 30));
                break;

              case "mute":
                this.toggleMute();
                break;

              case "repeat":
                this.toggleRepeat();
                break;

              case "pip":
                this.togglePiP();
                break;

              case "progressBar":
                this.toggleControlsBar();
                break;

              case "hide":
                this.hide();
                break;

              case "volUp":
                this.adjustVolume(currentConfig.volumeJump || .1);
                break;

              case "volDown":
                this.adjustVolume(-(currentConfig.volumeJump || .1));
                break;

              case "spdUp":
                this.adjustSpeed(currentConfig.speedJump || .25);
                break;

              case "spdDown":
                this.adjustSpeed(-(currentConfig.speedJump || .25));
                break;
            }
        }
        getEffectiveVolume() {
            if (this.effectiveVolume !== void 0) {
                return this.effectiveVolume;
            }
            return this.video ? this.video.volume : 1;
        }
        setEffectiveVolume(targetVol, isManual = true, isReverse = false) {
            this._isApplyingVolume = true;
            try {
                if (isManual) {
                    this._userExplicitlyAdjustedNativeVolume = true;
                }
                const prevVol = this.effectiveVolume !== void 0 ? this.effectiveVolume : this.video ? this.video.volume : 1;
                const maxVol = currentConfig.volumeBoostEnabled ? 6 : 1;
                let newVol = Math.round(targetVol * 100) / 100;
                newVol = Math.max(0, Math.min(maxVol, newVol));
                this.effectiveVolume = newVol;
                if (newVol > 1 && currentConfig.volumeBoostEnabled) {
                    const graph = getOrCreateAudioGraph(this.video);
                    if (graph) {
                        resumeAudioGraph(graph);
                        this.video.volume = 1;
                        if (graph.gainNode) {
                            graph.gainNode.gain.value = this.video.muted ? 0 : newVol;
                        }
                    } else {
                        newVol = 1;
                        this.effectiveVolume = 1;
                        this.video.volume = 1;
                    }
                } else {
                    this.video.volume = newVol;
                    const graph = audioGraphMap.get(this.video);
                    if (graph && graph.gainNode) {
                        graph.gainNode.gain.value = this.video.muted ? 0 : 1;
                    }
                }
                if (isManual && this.video.muted && newVol > 0) {
                    try {
                        const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                        if (nativeMutedSetter) {
                            nativeMutedSetter.call(this.video, false);
                        } else {
                            this.video.muted = false;
                        }
                    } catch (e) {
                        this.video.muted = false;
                    }
                    this.video.defaultMuted = false;
                    this.video.removeAttribute("muted");
                    const graph = audioGraphMap.get(this.video);
                    if (graph && graph.gainNode) {
                        graph.gainNode.gain.value = newVol > 1 ? newVol : 1;
                    }
                }
                if (isManual && newVol > 0) {
                    this._shouldStayUnmuted = true;
                    this._wasAudibleBeforePause = true;
                    this._lastAudibleVolume = Math.min(1, newVol);
                } else if (isManual && newVol === 0) {
                    this._shouldStayUnmuted = false;
                    this._wasAudibleBeforePause = false;
                }
                if (isManual) {
                    this._userConfiguredVolume = newVol;
                    const displayPct = Math.round(newVol * 100);
                    const prevPct = Math.round(prevVol * 100);
                    const hudMsg = newVol > 1 ? `Volume: ${displayPct}% (Boost)` : `Volume: ${displayPct}%`;
                    const isAtLimit = displayPct === 0 || !currentConfig.volumeBoostEnabled && displayPct === 100 || newVol >= maxVol - .005;
                    const volChanged = displayPct !== prevPct;
                    const stopSpin = isAtLimit && !volChanged;
                    this.showHUD(hudMsg, isReverse, stopSpin);
                }
                this.updateState();
            } finally {
                this._isApplyingVolume = false;
            }
        }
        adjustVolume(delta) {
            const current = this.getEffectiveVolume();
            this.setEffectiveVolume(current + delta, true, delta < 0);
        }
        unmuteAndRestoreAudio(reason = "") {
            if (!this.video || !this.video.isConnected) return;
            if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
                return;
            }
            const now = Date.now();
            if (now - (this._lastMuteOverrideReset || 0) > 1e3 || reason.includes("seek") || reason.includes("resume") || reason.includes("pause") || reason.includes("user") || reason.includes("override")) {
                this._muteOverrideAttempts = 0;
                this._lastMuteOverrideReset = now;
            }
            if ((this._muteOverrideAttempts || 0) > 25) return;
            this._muteOverrideAttempts = (this._muteOverrideAttempts || 0) + 1;
            this._isInternalMuteChange = true;
            try {
                const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                if (nativeMutedSetter) {
                    nativeMutedSetter.call(this.video, false);
                } else {
                    this.video.muted = false;
                }
            } catch (e) {
                try {
                    this.video.muted = false;
                } catch (err) {}
            }
            this.video.defaultMuted = false;
            this.video.removeAttribute("muted");
            if (this.video.volume === 0) {
                const audible = this._lastAudibleVolume || lastAudibleVolume || getSavedAudibleVolume() || 1;
                try {
                    const nativeVolSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume")?.set;
                    if (nativeVolSetter) {
                        nativeVolSetter.call(this.video, Math.min(1, audible));
                    } else {
                        this.video.volume = Math.min(1, audible);
                    }
                } catch (e) {
                    this.video.volume = Math.min(1, audible);
                }
            }
            const graph = audioGraphMap.get(this.video);
            if (graph && graph.gainNode) {
                const effective = this.getEffectiveVolume();
                graph.gainNode.gain.value = effective > 1 ? effective : 1;
                resumeAudioGraph(graph);
            }
            if (this.video.muted) {
                try {
                    const container = this.video.closest('article, [role="presentation"], [data-testid="videoComponent"]') || document;
                    const muteSvg = container.querySelector('svg[aria-label="Audio is muted"], svg[aria-label="Audio is unavailable"], [data-e2e="video-sound-button"]');
                    if (muteSvg) {
                        const btn = muteSvg.closest('button, [role="button"]') || muteSvg;
                        btn.click();
                    }
                } catch (e) {}
            }
            this.updateState();
            setTimeout(() => {
                this._isInternalMuteChange = false;
            }, 50);
        }
        _preventPauseRemute() {}
        _preventSeekRemute() {}
        _ensureStaysMutedAfterSeek() {}
        applySiteMutePreference() {
            if (this._userToggledMuteOnThisVideo) return;
            const pref = getEffectiveMutePreference();
            if (!pref || !pref.shouldApply) return;
            this._isInternalMuteChange = true;
            try {
                if (pref.muted) {
                    this._shouldStayUnmuted = false;
                    this._wasAudibleBeforePause = false;
                    if (!this.video.muted) {
                        try {
                            const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                            if (nativeMutedSetter) {
                                nativeMutedSetter.call(this.video, true);
                            } else {
                                this.video.muted = true;
                            }
                        } catch (e) {
                            this.video.muted = true;
                        }
                        this.video.defaultMuted = true;
                        this.video.setAttribute("muted", "");
                        const graph = audioGraphMap.get(this.video);
                        if (graph && graph.gainNode) {
                            graph.gainNode.gain.value = 0;
                        }
                        try {
                            this.video.dispatchEvent(new Event("volumechange", {
                                bubbles: true
                            }));
                        } catch (e) {}
                        this.updateState();
                    }
                } else {
                    if (typeof navigator !== "undefined" && navigator.userActivation && !navigator.userActivation.hasBeenActive) {
                        setupPendingUnmuteOnUserInteraction();
                        return;
                    }
                    this._shouldStayUnmuted = true;
                    this._wasAudibleBeforePause = true;
                    const wasPlaying = !this.video.paused;
                    let stateChanged = false;
                    if (this.video.muted) {
                        try {
                            const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                            if (nativeMutedSetter) {
                                nativeMutedSetter.call(this.video, false);
                            } else {
                                this.video.muted = false;
                            }
                        } catch (e) {
                            this.video.muted = false;
                        }
                        this.video.defaultMuted = false;
                        this.video.removeAttribute("muted");
                        stateChanged = true;
                    }
                    if (this.video.volume === 0) {
                        const audible = this._lastAudibleVolume || getSavedAudibleVolume() || 1;
                        try {
                            const nativeVolSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume")?.set;
                            if (nativeVolSetter) {
                                nativeVolSetter.call(this.video, Math.min(1, audible));
                            } else {
                                this.video.volume = Math.min(1, audible);
                            }
                        } catch (e) {
                            this.video.volume = Math.min(1, audible);
                        }
                        this._lastAudibleVolume = Math.min(1, audible);
                        stateChanged = true;
                    }
                    if (wasPlaying && this.video.paused) {
                        const p = this.video.play();
                        if (p && typeof p.catch === "function") {
                            p.catch(() => {
                                this.video.muted = true;
                                this._shouldStayUnmuted = false;
                                this._wasAudibleBeforePause = false;
                                const p2 = this.video.play();
                                if (p2 && typeof p2.catch === "function") p2.catch(() => {});
                                setupPendingUnmuteOnUserInteraction();
                            });
                        }
                    }
                    const graph = audioGraphMap.get(this.video);
                    if (graph && graph.gainNode) {
                        const effective = this.effectiveVolume && this.effectiveVolume > 1 && currentConfig.volumeBoostEnabled ? this.effectiveVolume : 1;
                        graph.gainNode.gain.value = effective;
                    }
                    if (stateChanged) {
                        try {
                            this.video.dispatchEvent(new Event("volumechange", {
                                bubbles: true
                            }));
                        } catch (e) {}
                        this.updateState();
                    }
                    if (this.video.muted) {
                        try {
                            const container = this.video.closest('article, [role="presentation"], [data-testid="videoComponent"]') || document;
                            const muteSvg = container.querySelector('svg[aria-label="Audio is muted"], svg[aria-label="Audio is unavailable"], [data-e2e="video-sound-button"]');
                            if (muteSvg) {
                                const btn = muteSvg.closest('button, [role="button"]') || muteSvg;
                                btn.click();
                            }
                        } catch (e) {}
                    }
                }
            } finally {
                this._isInternalMuteChange = false;
            }
        }
        toggleMute() {
            if (!this.video) return;
            this._userToggledMuteOnThisVideo = true;
            lastUserVolumeInteractionTime = Date.now();
            const isCurrentlyMuted = !!(this.video.muted || this.video.volume === 0);
            const targetMuted = !isCurrentlyMuted;
            this._shouldStayUnmuted = !targetMuted;
            this._isInternalMuteChange = true;
            try {
                if (!targetMuted) {
                    this._wasAudibleBeforePause = true;
                } else {
                    this._wasAudibleBeforePause = false;
                }
                let siteButtonClicked = false;
                const playerContainer = this.video.closest && this.video.closest('#movie_player, .html5-video-player, ytd-player, ytd-shorts, ytd-reel-video-renderer, article, [role="presentation"], [data-testid="videoComponent"], .vp-video-wrapper, [data-player], .video-card') || null;
                const ytMuteBtn = playerContainer ? playerContainer.querySelector(".ytp-mute-button") : null;
                if (ytMuteBtn) {
                    ytMuteBtn.click();
                    siteButtonClicked = true;
                }
                if (!siteButtonClicked && playerContainer) {
                    if (!targetMuted) {
                        const muteIndicator = playerContainer.querySelector('svg[aria-label="Audio is muted"], svg[aria-label="Audio is unavailable"], [data-e2e="video-sound-button"], button[data-testid="volume"], button[aria-label*="unmute" i], button[title*="unmute" i], button[aria-label*="volume off" i], button[aria-label*="sound off" i]');
                        if (muteIndicator) {
                            const btn = muteIndicator.closest('button, [role="button"]') || muteIndicator;
                            btn.click();
                            siteButtonClicked = true;
                        }
                    } else {
                        const audioIndicator = playerContainer.querySelector('svg[aria-label="Audio is playing"], [data-e2e="video-sound-button"], button[aria-label*="mute" i]:not([aria-label*="unmute" i]), button[title*="mute" i]:not([title*="unmute" i])');
                        if (audioIndicator) {
                            const btn = audioIndicator.closest('button, [role="button"]') || audioIndicator;
                            btn.click();
                            siteButtonClicked = true;
                        }
                    }
                }
                if (!siteButtonClicked) {
                    try {
                        const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                        if (nativeMutedSetter) {
                            nativeMutedSetter.call(this.video, targetMuted);
                        } else {
                            this.video.muted = targetMuted;
                        }
                    } catch (e) {
                        this.video.muted = targetMuted;
                    }
                    if (!targetMuted) {
                        this.video.defaultMuted = false;
                        this.video.removeAttribute("muted");
                        if (this.video.volume === 0) {
                            const audible = this._lastAudibleVolume || getSavedAudibleVolume() || 1;
                            try {
                                const nativeVolSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "volume")?.set;
                                if (nativeVolSetter) {
                                    nativeVolSetter.call(this.video, Math.min(1, audible));
                                } else {
                                    this.video.volume = Math.min(1, audible);
                                }
                            } catch (e) {
                                this.video.volume = Math.min(1, audible);
                            }
                            this._lastAudibleVolume = Math.min(1, audible);
                        }
                    } else {
                        this.video.defaultMuted = true;
                        this.video.setAttribute("muted", "");
                    }
                }
                const graph = audioGraphMap.get(this.video);
                if (graph && graph.gainNode) {
                    if (targetMuted) {
                        graph.gainNode.gain.value = 0;
                    } else {
                        const effective2 = this.getEffectiveVolume();
                        graph.gainNode.gain.value = effective2 > 1 ? effective2 : 1;
                        resumeAudioGraph(graph);
                    }
                }
            } finally {
                setTimeout(() => {
                    this._isInternalMuteChange = false;
                }, 150);
            }
            setTimeout(() => {
                if (this.video && this.video.isConnected) {
                    const currentlyMuted = !!(this.video.muted || this.video.volume === 0);
                    if (currentlyMuted !== targetMuted) {
                        try {
                            const nativeMutedSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "muted")?.set;
                            if (nativeMutedSetter) {
                                nativeMutedSetter.call(this.video, targetMuted);
                            } else {
                                this.video.muted = targetMuted;
                            }
                        } catch (e) {}
                        if (!targetMuted && this.video.volume === 0) {
                            const audible = this._lastAudibleVolume || getSavedAudibleVolume() || 1;
                            try {
                                this.video.volume = Math.min(1, audible);
                            } catch (e) {}
                        }
                        this.updateState();
                    }
                }
            }, 80);
            const effective = this.getEffectiveVolume();
            const pct = Math.round(effective * 100);
            const hudMsg = targetMuted ? "Muted" : currentConfig.volumeBoostEnabled && pct > 100 ? `Volume: ${pct}% (Boost)` : `Volume: ${pct}%`;
            this.showHUD(hudMsg);
            this.updateState();
        }
        adjustSpeed(delta) {
            const currentRate = this.video ? this.video.playbackRate || 1 : 1;
            let newSpeed;
            if (delta > 0 && currentRate <= .105 && Math.abs(delta - .1) > .01) {
                newSpeed = Math.round(delta * 100) / 100;
            } else {
                newSpeed = Math.round((currentRate + delta) * 100) / 100;
            }
            newSpeed = Math.max(.1, Math.min(16, newSpeed));
            this.setSpeed(newSpeed, true, delta < 0);
        }
        applyInitialVideoState() {
            if (!this.video || this._userExplicitlyToggledPlay) return;
            const domainPlayRule = getDomainPlayRule();
            const effectivePlayState = domainPlayRule || currentConfig.defaultVideoState;
            if (effectivePlayState === "pause") {
                if (!this.video.paused) {
                    try {
                        this.video.pause();
                        this._hasAppliedInitialPlayState = true;
                    } catch (e) {}
                }
            } else if (effectivePlayState === "play") {
                if (this.video.paused) {
                    try {
                        const p = this.video.play();
                        if (p && typeof p.catch === "function") p.catch(() => {});
                        this._hasAppliedInitialPlayState = true;
                    } catch (e) {}
                }
            }
        }
        applyEffectiveSpeed(force = false) {
            if (!this.video) return;
            if (!force && this._userConfiguredSpeed !== void 0) {
                return;
            }
            const domainSpeed = getDomainSpeed();
            let targetSpeed = null;
            if (domainSpeed !== null && domainSpeed > 0) {
                targetSpeed = domainSpeed;
            } else if (currentConfig.defaultSpeed !== void 0 && currentConfig.defaultSpeed !== null && !isNaN(currentConfig.defaultSpeed) && Number(currentConfig.defaultSpeed) > 0) {
                targetSpeed = Number(currentConfig.defaultSpeed);
            } else if (force) {
                targetSpeed = 1;
            }
            if (targetSpeed !== null && targetSpeed > 0) {
                if (force || Math.abs(this.video.playbackRate - targetSpeed) > .01) {
                    this._isApplyingSpeed = true;
                    try {
                        const nativeSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate")?.set;
                        if (nativeSetter) {
                            nativeSetter.call(this.video, targetSpeed);
                        } else {
                            this.video.playbackRate = targetSpeed;
                        }
                    } catch (e) {
                        try {
                            this.video.playbackRate = targetSpeed;
                        } catch (err) {}
                    } finally {
                        setTimeout(() => {
                            this._isApplyingSpeed = false;
                        }, 80);
                    }
                    this.updateState();
                }
            }
        }
        applyEffectiveVolume(force = false) {
            if (!this.video) return;
            if (!force && this._userConfiguredVolume !== void 0) {
                return;
            }
            const domainVol = getDomainVolume();
            let targetVol = null;
            if (domainVol !== null && domainVol >= 0) {
                targetVol = domainVol;
            } else if (currentConfig.defaultVolume !== void 0 && currentConfig.defaultVolume !== null && !isNaN(currentConfig.defaultVolume)) {
                const rawDef = Number(currentConfig.defaultVolume);
                const defVol = rawDef > 6 ? rawDef / 100 : rawDef;
                targetVol = Math.max(0, Math.min(currentConfig.volumeBoostEnabled ? 6 : 1, defVol));
            } else if (force) {
                targetVol = 1;
            }
            if (targetVol === null) return;
            const currentVol = this.getEffectiveVolume();
            const expectedVideoVol = Math.min(1, targetVol);
            if (force || Math.abs(currentVol - targetVol) > .02 || Math.abs(this.video.volume - expectedVideoVol) > .02) {
                this.setEffectiveVolume(targetVol, false);
            }
        }
        setSpeed(speed, isManual = true, isReverse = false, showHud = true, stopSpin = false) {
            const prevSpeed = this.video ? this.video.playbackRate || 1 : 1;
            const val = Math.max(.1, Math.min(16, Math.round(Number(speed) * 100) / 100));
            if (isManual) {
                this._userConfiguredSpeed = val;
            }
            this._isApplyingSpeed = true;
            try {
                const nativeSetter = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "playbackRate")?.set;
                if (nativeSetter) {
                    nativeSetter.call(this.video, val);
                } else {
                    this.video.playbackRate = val;
                }
            } catch (e) {
                try {
                    this.video.playbackRate = val;
                } catch (err) {}
            } finally {
                setTimeout(() => {
                    this._isApplyingSpeed = false;
                }, 80);
            }
            const isAtLimit = val <= .105 || val >= 15.995;
            const speedChanged = Math.abs(val - prevSpeed) > .005;
            const effectiveStopSpin = stopSpin || isAtLimit && !speedChanged;
            if (showHud) {
                this.showHUD(`Speed: ${val.toFixed(2)}x`, isReverse, effectiveStopSpin);
            }
            this.updateState();
            dismissYouTubeSpeedmaster();
        }
        toggleSuperSpeed() {
            const target = currentConfig.superSpeed || 2.5;
            if (Math.abs(this.video.playbackRate - target) < .05) {
                this.setSpeed(1);
                this.showHUD("Speed: 1.00x");
            } else {
                this.setSpeed(target);
                this.showHUD(`Super Speed: ${target.toFixed(2)}x`);
            }
        }
        toggleFavoriteSpeed() {
            const target = currentConfig.favoriteSpeed || 1.5;
            if (Math.abs(this.video.playbackRate - target) < .05) {
                this.setSpeed(1);
                this.showHUD("Speed: 1.00x");
            } else {
                this.setSpeed(target);
                this.showHUD(`Favorite Speed: ${target.toFixed(2)}x`);
            }
        }
        isPlatformDefaultLoop() {
            if (!this.video) return false;
            const host = (window.location.hostname || "").toLowerCase();
            const path = (window.location.pathname || "").toLowerCase();
            if (host.includes("youtube.com")) {
                if (path.startsWith("/shorts/") || path.includes("/shorts/")) return true;
                if (this.video.closest && this.video.closest("ytd-shorts, #shorts-player, [is-shorts], ytd-reel-video-renderer, ytd-reel-item-renderer")) {
                    return true;
                }
                return false;
            }
            if (host.includes("instagram.com")) {
                const isStory = path.includes("/stories") || path.startsWith("/stories") || this.video.closest && !!this.video.closest('section._ab37, [aria-label*="Story" i], [aria-label*="Stories" i], [data-story-id], [role="dialog"]');
                if (isStory) {
                    return false;
                }
                const isReel = path.includes("/reels") || path.includes("/reel") || this.video.closest && !!this.video.closest('[data-pagelet*="Reels" i], [aria-label*="Reel" i]');
                if (isReel) {
                    return true;
                }
                return true;
            }
            if (host.includes("facebook.com")) {
                const isStory = path.includes("/stories") || path.startsWith("/stories") || this.video.closest && !!this.video.closest('[aria-label*="Story" i], [aria-label*="Stories" i], [data-pagelet*="Story" i]');
                if (isStory) {
                    return false;
                }
                const isReel = path.includes("/reel") || path.includes("/reels") || this.video.closest && !!this.video.closest('[data-pagelet*="Reels" i]');
                if (isReel) {
                    return true;
                }
                return false;
            }
            if (host.includes("tiktok.com")) {
                return true;
            }
            if (this.video.hasAttribute("loop") && this.video.loop) return true;
            return false;
        }
        isLoopActive() {
            if (this.isLooping) return true;
            return Boolean(this.loopEnabled);
        }
        initLoopObserver() {
            if (this.loopAttributeObserver) return;
            this.loopAttributeObserver = new MutationObserver(() => {
                if (!this.isPlatformDefaultLoop()) {
                    if (!this.isLoopActive() && (this.video.loop || this.video.hasAttribute("loop"))) {
                        this.video.loop = false;
                        this.video.removeAttribute("loop");
                    }
                    return;
                }
                if (isAutoScrollShortsActiveForCurrentPage(this) && !isVideoLoopingActive(this)) {
                    this.loopEnabled = false;
                    if (this.video.loop || this.video.hasAttribute("loop")) {
                        this.video.loop = false;
                        this.video.removeAttribute("loop");
                    }
                    return;
                }
                if (!this.userExplicitlyToggledLoop) {
                    this.applyAutoScrollLoopPolicy();
                } else if (!this.isLoopActive()) {
                    if (this.video.loop || this.video.hasAttribute("loop")) {
                        this.video.loop = false;
                        this.video.removeAttribute("loop");
                    }
                }
            });
            this.loopAttributeObserver.observe(this.video, {
                attributes: true,
                attributeFilter: [ "loop" ]
            });
        }
        getLoopStartTime() {
            const m = Math.max(0, parseInt(this.startMInput.value, 10) || 0);
            const s = Math.max(0, Math.min(59, parseInt(this.startSInput.value, 10) || 0));
            return m * 60 + s;
        }
        getLoopEndTime() {
            const m = Math.max(0, parseInt(this.endMInput.value, 10) || 0);
            const s = Math.max(0, Math.min(59, parseInt(this.endSInput.value, 10) || 0));
            return m * 60 + s;
        }
        resetLoopInputs() {
            if (this.startMInput) this.startMInput.value = 0;
            if (this.startSInput) this.startSInput.value = 0;
            if (this.video && typeof this.video.duration === "number" && !isNaN(this.video.duration) && isFinite(this.video.duration) && this.video.duration > 0) {
                const dur = Math.floor(this.video.duration);
                if (this.endMInput) this.endMInput.value = Math.floor(dur / 60);
                if (this.endSInput) this.endSInput.value = dur % 60;
            } else {
                if (this.endMInput) this.endMInput.value = 0;
                if (this.endSInput) this.endSInput.value = 0;
            }
        }
        initLoopTimersIfUnset() {
            if (!this.video || typeof this.video.duration !== "number" || isNaN(this.video.duration) || !isFinite(this.video.duration) || this.video.duration <= 0) {
                return;
            }
            const currentEnd = this.getLoopEndTime();
            if (currentEnd === 0) {
                const dur = Math.floor(this.video.duration);
                this.endMInput.value = Math.floor(dur / 60);
                this.endSInput.value = dur % 60;
            }
        }
        normalizeLoopInputs() {
            const sM = Math.max(0, parseInt(this.startMInput.value, 10) || 0);
            const sS = Math.max(0, Math.min(59, parseInt(this.startSInput.value, 10) || 0));
            this.startMInput.value = sM;
            this.startSInput.value = sS;
            let eM = Math.max(0, parseInt(this.endMInput.value, 10) || 0);
            let eS = Math.max(0, Math.min(59, parseInt(this.endSInput.value, 10) || 0));
            this.endMInput.value = eM;
            this.endSInput.value = eS;
        }
        onLoopInputsChanged() {
            this.normalizeLoopInputs();
            const s = this.getLoopStartTime();
            const e = this.getLoopEndTime();
            if (this.isLooping && e > s) {
                if (this.video.currentTime < s || this.video.currentTime >= e) {
                    this.video.currentTime = s;
                }
            }
        }
        isAnyOverlayOpen() {
            return !!(this.isLoopBarOpen || this.isSpeedBarOpen || this.isVolumeBarOpen || this.isSubtitlesSettingsOpen);
        }
        isHoveringAnyOverlay() {
            return !!(this.isLoopHovering || this.isSpeedHovering || this.isVolumeHovering || this.isSubtitlesSettingsHovered);
        }
        isAnyOverlayInputFocused() {
            if (!this.shadow) return false;
            const active = this.shadow.activeElement || document.activeElement;
            if (!active) return false;
            if (this.subtitlesSettingsPopup && this.subtitlesSettingsPopup.contains(active)) return true;
            return active === this.startMInput || active === this.startSInput || active === this.endMInput || active === this.endSInput || active === this.speedSlider || active === this.volumeSlider;
        }
        isAnyLoopInputFocused() {
            return this.isAnyOverlayInputFocused();
        }
        clearOverlaysAutoMinimizeTimer() {
            if (this.overlaysAutoMinimizeTimer) {
                clearTimeout(this.overlaysAutoMinimizeTimer);
                this.overlaysAutoMinimizeTimer = null;
            }
            if (this.loopAutoMinimizeTimer) {
                clearTimeout(this.loopAutoMinimizeTimer);
                this.loopAutoMinimizeTimer = null;
            }
        }
        clearLoopAutoMinimizeTimer() {
            this.clearOverlaysAutoMinimizeTimer();
        }
        scheduleOverlaysAutoMinimize() {
            this.clearOverlaysAutoMinimizeTimer();
            if (!currentConfig.autoMinimize || !this.isAnyOverlayOpen()) return;
            const timeout = currentConfig.autoMinimizeTimeout !== void 0 ? currentConfig.autoMinimizeTimeout : 2500;
            this.overlaysAutoMinimizeTimer = setTimeout(() => {
                if (this.isHoveringAnyOverlay() || this.isAnyOverlayInputFocused() || this.isSliderDragging) {
                    if (this.isAnyOverlayOpen()) {
                        this.scheduleOverlaysAutoMinimize();
                    }
                    return;
                }
                this.closeAllOverlays();
            }, timeout);
            this.loopAutoMinimizeTimer = this.overlaysAutoMinimizeTimer;
        }
        scheduleLoopAutoMinimize() {
            this.scheduleOverlaysAutoMinimize();
        }
        closeAllOverlays() {
            this.clearOverlaysAutoMinimizeTimer();
            if (this.isLoopBarOpen) {
                this.setLoopBarOpen(false);
            }
            if (this.isSpeedBarOpen) {
                this.setSpeedBarOpen(false);
            }
            if (this.isVolumeBarOpen) {
                this.setVolumeBarOpen(false);
            }
            if (this.isSubtitlesSettingsOpen) {
                this.setSubtitlesSettingsOpen(false);
            }
        }
        toggleLoopBar() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("loop")) return;
            this.setLoopBarOpen(!this.isLoopBarOpen);
        }
        setLoopBarOpen(open) {
            this.isLoopBarOpen = open;
            if (open) {
                if (this.isSpeedBarOpen) {
                    this.setSpeedBarOpen(false);
                }
                if (this.isVolumeBarOpen) {
                    this.setVolumeBarOpen(false);
                }
                if (this.loopToggle) {
                    this.loopToggle.checked = this.isLoopActive();
                }
                this.initLoopTimersIfUnset();
                this.loopBar.classList.remove("collapsed");
                if (this.loopBtn) {
                    this.loopBtn.classList.add("is-expanded");
                }
                if (!this.isHoveringAnyOverlay()) {
                    this.scheduleOverlaysAutoMinimize();
                }
            } else {
                this.loopBar.classList.add("collapsed");
                if (this.loopBtn) {
                    this.loopBtn.classList.remove("is-expanded");
                }
                if (!this.isAnyOverlayOpen()) {
                    this.clearOverlaysAutoMinimizeTimer();
                }
                if (!this.isLooping && (!this.loopToggle || !this.loopToggle.checked)) {
                    this.resetLoopInputs();
                }
            }
            this.updatePosition();
        }
        toggleSpeedBar() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("speed")) return;
            this.setSpeedBarOpen(!this.isSpeedBarOpen);
        }
        setSpeedBarOpen(open) {
            this.isSpeedBarOpen = open;
            if (open) {
                if (this.isLoopBarOpen) {
                    this.setLoopBarOpen(false);
                }
                if (this.isVolumeBarOpen) {
                    this.setVolumeBarOpen(false);
                }
                if (this.speedBar) this.speedBar.classList.remove("collapsed");
                if (this.speedBtn) {
                    this.speedBtn.classList.add("is-expanded");
                }
                this.updateSpeedUI();
                if (!this.isHoveringAnyOverlay()) {
                    this.scheduleOverlaysAutoMinimize();
                }
            } else {
                if (this.speedBar) this.speedBar.classList.add("collapsed");
                if (this.speedBtn) {
                    this.speedBtn.classList.remove("is-expanded");
                }
                if (!this.isAnyOverlayOpen()) {
                    this.clearOverlaysAutoMinimizeTimer();
                }
            }
            this.updatePosition();
        }
        updateSpeedUI() {
            if (!this.video) return;
            const rate = this.video.playbackRate || 1;
            if (this.speedSlider) {
                this.speedSlider.value = rate;
            }
            if (this.speedReadout) {
                this.speedReadout.textContent = `${rate.toFixed(2)}x`;
            }
            if (this.presetNormalBtn) {
                this.presetNormalBtn.classList.toggle("is-active", Math.abs(rate - 1) < .02);
            }
            if (this.presetFavBtn) {
                const fav = currentConfig.favoriteSpeed || 1.5;
                this.presetFavBtn.classList.toggle("is-active", Math.abs(rate - fav) < .02);
            }
            if (this.presetSuperBtn) {
                const superSpd = currentConfig.superSpeed || 2.5;
                this.presetSuperBtn.classList.toggle("is-active", Math.abs(rate - superSpd) < .02);
            }
            if (this.speedBtn) {
                this.speedBtn.classList.toggle("is-active", Math.abs(rate - 1) >= .02);
            }
        }
        toggleVolumeBar() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("volume")) return;
            this.setVolumeBarOpen(!this.isVolumeBarOpen);
        }
        setVolumeBarOpen(open) {
            this.isVolumeBarOpen = open;
            if (open) {
                if (this.isLoopBarOpen) {
                    this.setLoopBarOpen(false);
                }
                if (this.isSpeedBarOpen) {
                    this.setSpeedBarOpen(false);
                }
                if (this.volumeBar) this.volumeBar.classList.remove("collapsed");
                if (this.volumeBtn) {
                    this.volumeBtn.classList.add("is-expanded");
                }
                this.updateVolumeUI();
                if (!this.isHoveringAnyOverlay()) {
                    this.scheduleOverlaysAutoMinimize();
                }
            } else {
                if (this.volumeBar) this.volumeBar.classList.add("collapsed");
                if (this.volumeBtn) {
                    this.volumeBtn.classList.remove("is-expanded");
                }
                if (!this.isAnyOverlayOpen()) {
                    this.clearOverlaysAutoMinimizeTimer();
                }
            }
            this.updatePosition();
        }
        updateVolumeUI() {
            if (!this.video) return;
            const effective = this.getEffectiveVolume();
            const isMuted = !!(this.video.muted || this.video.volume === 0 || effective === 0);
            const pct = Math.round(effective * 100);
            const maxPct = currentConfig.volumeBoostEnabled ? 600 : 100;
            if (this.volumeSlider) {
                this.volumeSlider.max = maxPct;
                this.volumeSlider.value = isMuted ? 0 : Math.min(maxPct, pct);
            }
            if (this.volumeReadout) {
                if (isMuted) {
                    this.volumeReadout.textContent = "Muted";
                } else {
                    this.volumeReadout.textContent = `${pct}%`;
                }
            }
            if (this.volumeToggle) {
                this.volumeToggle.checked = isMuted;
                if (this.volumeToggle.parentElement) {
                    this.volumeToggle.parentElement.title = isMuted ? "Unmute (M)" : "Mute (M)";
                }
            }
            if (this.volumeBtn) {
                this.volumeBtn.innerHTML = isMuted ? ICONS.unmute : ICONS.volume;
                this.volumeBtn.title = isMuted ? "Unmute (M)" : "Volume (M)";
                this.volumeBtn.classList.toggle("is-muted", isMuted);
            }
        }
        onLoopToggleChange() {
            this.normalizeLoopInputs();
            let s = this.getLoopStartTime();
            let e = this.getLoopEndTime();
            if (this.loopToggle.checked) {
                if (e <= s) {
                    if (this.video.duration && this.video.duration > s) {
                        const dur = Math.floor(this.video.duration);
                        this.endMInput.value = Math.floor(dur / 60);
                        this.endSInput.value = dur % 60;
                        e = this.getLoopEndTime();
                    } else {
                        e = s + 5;
                        this.endMInput.value = Math.floor(e / 60);
                        this.endSInput.value = e % 60;
                    }
                }
                this.isLooping = true;
                this.loopEnabled = true;
                this.userExplicitlyToggledLoop = true;
                if (this.loopBtn) {
                    this.loopBtn.classList.add("is-looping");
                    this.triggerSubBtnPulse(this.loopBtn);
                }
                if (this.subButtons && this.subButtons["loop"]) {
                    this.subButtons["loop"].classList.add("is-looping");
                    this.triggerSubBtnPulse(this.subButtons["loop"]);
                }
                if (this.video.currentTime < s || this.video.currentTime >= e) {
                    this.video.currentTime = s;
                }
                const sStr = `${this.startMInput.value}:${String(this.startSInput.value).padStart(2, "0")}`;
                const eStr = `${this.endMInput.value}:${String(this.endSInput.value).padStart(2, "0")}`;
                const isAutoScroll = isAutoScrollShortsActiveForCurrentPage(this);
                this.showHUD(isAutoScroll ? `Loop: ${sStr} - ${eStr} (Auto-Scroll Paused)` : `Loop: ${sStr} - ${eStr}`);
            } else {
                this.isLooping = false;
                this.loopEnabled = false;
                this.video.loop = false;
                if (this.video.hasAttribute("loop")) this.video.removeAttribute("loop");
                this.userExplicitlyToggledLoop = true;
                if (this.loopBtn) {
                    this.loopBtn.classList.remove("is-looping");
                    this.triggerSubBtnPulse(this.loopBtn);
                }
                if (this.subButtons && this.subButtons["loop"]) {
                    this.subButtons["loop"].classList.remove("is-looping");
                    this.triggerSubBtnPulse(this.subButtons["loop"]);
                }
                const isAutoScroll = isAutoScrollShortsActiveForCurrentPage(this);
                this.showHUD(isAutoScroll ? "Loop: OFF (Auto-Scroll Active)" : "Loop: OFF");
            }
            this.updateState();
        }
        toggleRepeat() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("loop")) return;
            this.userExplicitlyToggledLoop = true;
            const isAutoScroll = isAutoScrollShortsActiveForCurrentPage(this);
            if (this.isLooping) {
                this.isLooping = false;
                if (this.loopToggle) this.loopToggle.checked = false;
                this.loopEnabled = false;
                this.video.loop = false;
                if (this.video.hasAttribute("loop")) this.video.removeAttribute("loop");
                if (!this.isLoopBarOpen) {
                    this.resetLoopInputs();
                }
                this.showHUD(isAutoScroll ? "Loop: OFF (Auto-Scroll Active)" : "Loop: OFF");
            } else {
                const nextState = !this.isLoopActive();
                this.loopEnabled = nextState;
                this.video.loop = nextState;
                if (nextState) {
                    this.video.setAttribute("loop", "");
                } else {
                    if (this.video.hasAttribute("loop")) this.video.removeAttribute("loop");
                }
                if (this.loopToggle) {
                    this.loopToggle.checked = nextState;
                }
                if (nextState) {
                    this.showHUD(isAutoScroll ? "Loop: ON (Auto-Scroll Paused)" : "Loop: ON");
                } else {
                    this.showHUD(isAutoScroll ? "Loop: OFF (Auto-Scroll Active)" : "Loop: OFF");
                }
            }
            this.updateState();
        }
        applyAutoScrollLoopPolicy() {
            if (!this.video || !this.video.isConnected) return;
            if (this.userExplicitlyToggledLoop) {
                return;
            }
            if (isAutoScrollShortsActiveForCurrentPage(this)) {
                if (this.loopEnabled || this.video.loop || this.video.hasAttribute("loop")) {
                    this.loopEnabled = false;
                    this.video.loop = false;
                    if (this.video.hasAttribute("loop")) {
                        this.video.removeAttribute("loop");
                    }
                    if (this.container) {
                        this.updateState();
                    }
                }
            } else {
                const desiredLoop = getEffectiveLoopPreference(this);
                if (this.loopEnabled !== desiredLoop || this.video.loop !== desiredLoop || desiredLoop && !this.video.hasAttribute("loop")) {
                    this.loopEnabled = desiredLoop;
                    this.video.loop = desiredLoop;
                    if (!desiredLoop && this.video.hasAttribute("loop")) {
                        this.video.removeAttribute("loop");
                    } else if (desiredLoop) {
                        this.video.setAttribute("loop", "");
                    }
                    if (this.container) {
                        this.updateState();
                    }
                }
            }
        }
        checkAndTriggerAutoScroll(reason) {
            if (!isAutoScrollShortsActiveForCurrentPage(this)) return;
            if (isVideoLoopingActive(this)) return;
            const now = Date.now();
            if (now - lastGlobalAutoScrollNavTimestamp < 1800) {
                return;
            }
            if (this._lastAutoScrollTrigger && now - this._lastAutoScrollTrigger < 1800) {
                return;
            }
            lastGlobalAutoScrollNavTimestamp = now;
            this._lastAutoScrollTrigger = now;
            try {
                if (this.video && !this.video.paused) {
                    this.video.pause();
                }
            } catch (e) {}
            setTimeout(() => {
                if (!isAutoScrollShortsActiveForCurrentPage(this)) return;
                if (isVideoLoopingActive(this)) return;
                triggerUniversalNextVideo(this.video, this);
            }, 50);
        }
        seek(seconds) {
            if (!this.video) return;
            this._lastSeekTime = Date.now();
            this.video.currentTime = Math.max(0, Math.min(this.video.duration || Infinity, this.video.currentTime + seconds));
            const sign = seconds > 0 ? `+${seconds}s` : `${seconds}s`;
            const isReverse = seconds < 0;
            this.showHUD(`Seek: ${sign}`, isReverse);
        }
        seekToSegment(digit) {
            if (!this.video) return;
            const duration = this.video.duration;
            if (!duration || isNaN(duration) || !isFinite(duration) || duration <= 0) {
                return;
            }
            this._lastSeekTime = Date.now();
            const fraction = digit / 10;
            const prevTime = this.video.currentTime;
            const targetTime = Math.max(0, Math.min(duration, duration * fraction));
            this.video.currentTime = targetTime;
            const percent = digit * 10;
            const isReverse = targetTime < prevTime;
            this.showHUD(`Seek: ${percent}%`, isReverse);
        }
        stepFrame(frames) {
            if (!this.video.paused) {
                this.video.pause();
            }
            const frameDelta = 1 / 30 * frames;
            const targetTime = Math.max(0, Math.min(this.video.duration || Infinity, this.video.currentTime + frameDelta));
            this.video.currentTime = targetTime;
            const label = frames > 0 ? "+1 Frame" : "-1 Frame";
            this.showHUD(`Frame: ${label}`, frames < 0);
        }
        togglePlay() {
            this.togglePlayPause();
        }
        togglePlayPause() {
            this._userExplicitlyToggledPlay = true;
            this._wasPlayingOnCtrlEnter = false;
            this._hasAppliedInitialPlayState = true;
            if (this.video.paused || this.video.ended) {
                this._userRequestedPause = false;
                if (this.video.ended || this.video.duration && isFinite(this.video.duration) && Math.abs(this.video.currentTime - this.video.duration) < .3) {
                    this.video.currentTime = 0;
                }
                const playPromise = this.video.play();
                if (playPromise !== void 0 && typeof playPromise.catch === "function") {
                    playPromise.catch(err => {});
                }
                this.showHUD("Playing");
            } else {
                this._userRequestedPause = true;
                this.video.pause();
                this.showHUD("Paused");
                const v = this.video;
                const ensurePaused = () => {
                    if (v && v.isConnected && !v.paused && this._userExplicitlyToggledPlay) {
                        try {
                            v.pause();
                        } catch (e) {}
                    }
                };
                setTimeout(ensurePaused, 30);
                setTimeout(ensurePaused, 100);
                setTimeout(ensurePaused, 250);
            }
        }
        async togglePiP() {
            const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
            if (!activeControls.includes("pip")) return;
            const updatePipVisual = active => {
                if (this.pipBtn) this.pipBtn.classList.toggle("is-active", active);
                if (this.subButtons && this.subButtons["pip"]) this.subButtons["pip"].classList.toggle("is-active", active);
            };
            try {
                if (document.pictureInPictureElement === this.video) {
                    await document.exitPictureInPicture();
                    updatePipVisual(false);
                    this.showHUD("Pop Out Exited");
                } else if (document.pictureInPictureElement) {
                    try {
                        await document.exitPictureInPicture();
                    } catch (e) {}
                    if (this.video && typeof this.video.requestPictureInPicture === "function") {
                        await this.video.requestPictureInPicture();
                        updatePipVisual(true);
                        this.showHUD("Pop Out");
                    }
                } else {
                    if (this.video && typeof this.video.requestPictureInPicture === "function") {
                        await this.video.requestPictureInPicture();
                        updatePipVisual(true);
                        this.showHUD("Pop Out");
                    } else if (this.video && this.video.webkitSetPresentationMode) {
                        const isPip = this.video.webkitPresentationMode === "picture-in-picture";
                        this.video.webkitSetPresentationMode(isPip ? "inline" : "picture-in-picture");
                        updatePipVisual(!isPip);
                        this.showHUD(isPip ? "Pop Out Exited" : "Pop Out");
                    }
                }
            } catch (err) {
                try {
                    if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                        updatePipVisual(false);
                        this.showHUD("Pop Out Exited");
                    }
                } catch (e2) {}
            }
        }
        findNativeFullscreenButton() {
            if (!this.video) return null;
            const isTikTok = (window.location.hostname || "").includes("tiktok.com");
            if (isTikTok) return null;
            const fsSelectors = '.ytp-fullscreen-button, button[data-title-no-tooltip="Full screen"], button[aria-label*="Fullscreen" i], button[aria-label*="Full screen" i], button[title*="Fullscreen" i], button[title*="Full screen" i], [data-testid*="fullscreen" i], button[name*="fullscreen" i], .vjs-fullscreen-control, .plyr__control--fullscreen, .jw-icon-fullscreen, shreddit-fullscreen-button, .xgplayer-fullscreen, xg-icon.xgplayer-fullscreen, [data-e2e*="fullscreen" i], [class*="xgplayer-fullscreen" i], [class*="fullscreenBtn" i], .xg-icon-fullscreen, div.xgplayer-icon-fullscreen, button[class*="fullscreen" i]';
            try {
                const playerContainer = this.video && typeof this.video.closest === "function" ? this.video.closest('.html5-video-player, [data-player], .player-container, .video-js, .jwplayer, .plyr, shreddit-player, shreddit-player-2, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : null;
                if (playerContainer && typeof playerContainer.querySelector === "function") {
                    const btn = playerContainer.querySelector(fsSelectors);
                    if (btn) return btn;
                }
                const rootNode = this.video && typeof this.video.getRootNode === "function" ? this.video.getRootNode() : null;
                if (rootNode && rootNode !== document && typeof rootNode.querySelector === "function") {
                    const btn = rootNode.querySelector(fsSelectors);
                    if (btn) return btn;
                }
                const hostEl = rootNode && rootNode.host ? rootNode.host : null;
                if (hostEl && typeof hostEl.querySelector === "function") {
                    const btn = hostEl.querySelector(fsSelectors);
                    if (btn) return btn;
                    if (typeof hostEl.closest === "function") {
                        const parentPlayer = hostEl.closest('.html5-video-player, [data-player], .player-container, shreddit-player, shreddit-player-2, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]');
                        if (parentPlayer && typeof parentPlayer.querySelector === "function") {
                            const btn2 = parentPlayer.querySelector(fsSelectors);
                            if (btn2) return btn2;
                        }
                    }
                }
                if (this.video && this.video.parentElement && typeof this.video.parentElement.querySelector === "function") {
                    const btn = this.video.parentElement.querySelector(fsSelectors);
                    if (btn) return btn;
                }
            } catch (err) {
                console.warn("findNativeFullscreenButton error:", err);
            }
            return null;
        }
        hasNativePlayerControls() {
            if (!this.video) return false;
            if (window.__TEST_BENCH__ || window.location && (window.location.pathname.includes("test.html") || window.location.pathname.includes("settings.html"))) {
                return false;
            }
            const isTikTok = (window.location.hostname || "").includes("tiktok.com");
            if (isTikTok) {
                return false;
            }
            try {
                const fsBtn = this.findNativeFullscreenButton();
                if (fsBtn && fsBtn.isConnected) {
                    return true;
                }
            } catch (e) {}
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest('.html5-video-player, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, [class*="player-container" i], [class*="video-player" i], .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : this.video ? this.video.parentElement : null;
                if (player && player !== document.body && player !== document.documentElement) {
                    if (player.classList && player.classList.contains("video-card")) {
                        return false;
                    }
                    const controlsEl = player.querySelector('.ytp-chrome-bottom, .ytp-progress-bar, .vjs-control-bar, .plyr__controls, .jw-controls, .jw-controlbar, .vp-controls, [class*="control-bar" i]:not([class*="omni-"]), [class*="controls-bar" i]:not([class*="omni-"]), [class*="player-controls" i]:not([class*="omni-"])');
                    if (controlsEl && controlsEl.isConnected) {
                        return true;
                    }
                    if (player.classList && (player.classList.contains("ytp-fullscreen") || player.classList.contains("vjs-fullscreen") || player.classList.contains("jw-flag-fullscreen") || player.classList.contains("plyr--fullscreen-active") || player.classList.contains("is-fullscreen") || player.classList.contains("fullscreen"))) {
                        return true;
                    }
                    const controlButtons = player.querySelectorAll('button:not([class*="omni-"]), [role="button"]:not([class*="omni-"]), input[type="range"]:not([class*="omni-"])');
                    if (controlButtons && controlButtons.length >= 2) {
                        return true;
                    }
                }
            } catch (e) {}
            if (this.video.hasAttribute("controls") || this.video.controls === true) {
                return true;
            }
            return false;
        }
        savePreFullscreenControlsState() {
            if (this._wasControlsForcedBeforeFs === void 0 || this._wasControlsForcedBeforeFs === null) {
                const isCurrentlyActive = !!(this.isControlsForced && this.controlsBar && !this.controlsBar.classList.contains("hidden"));
                this._wasControlsForcedBeforeFs = isCurrentlyActive;
                this._wasGlobalForcedBeforeFs = isControlsForcedGlobal;
            }
        }
        restorePreFullscreenControlsState() {
            if (this._wasControlsForcedBeforeFs !== void 0 && this._wasControlsForcedBeforeFs !== null) {
                const restoreState = this._wasControlsForcedBeforeFs;
                const restoreGlobal = this._wasGlobalForcedBeforeFs;
                this._wasControlsForcedBeforeFs = null;
                this._wasGlobalForcedBeforeFs = null;
                isControlsForcedGlobal = restoreGlobal;
                activeControllers.forEach(ctrl => {
                    ctrl.isControlsForced = restoreState;
                    if (ctrl.controlsBar) {
                        if (restoreState) {
                            ctrl.controlsBar.classList.remove("hidden");
                            ctrl.controlsBar.classList.remove("hover-hidden");
                            ctrl.updatePosition();
                            ctrl.updateControlsBarState();
                            if (currentConfig.autoHideButtons !== false) {
                                ctrl.scheduleControlsBarAutoHide();
                            }
                        } else {
                            ctrl.controlsBar.classList.add("hover-hidden");
                            ctrl.controlsBar.classList.add("hidden");
                            if (ctrl.controlsBarAutoHideTimer) {
                                clearTimeout(ctrl.controlsBarAutoHideTimer);
                                ctrl.controlsBarAutoHideTimer = null;
                            }
                        }
                    }
                    if (typeof ctrl.updateProgressBarButtonState === "function") {
                        ctrl.updateProgressBarButtonState();
                    }
                });
            }
        }
        async toggleFullscreen() {
            try {
                ensurePageFullscreenStyles(document);
                const rootNode = this.video && typeof this.video.getRootNode === "function" ? this.video.getRootNode() : null;
                if (rootNode && rootNode !== document) {
                    ensurePageFullscreenStyles(rootNode);
                }
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                const isFullscreen = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video") || document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active") || !!fsEl);
                const nativeFsBtn = this.findNativeFullscreenButton();
                if (isFullscreen) {
                    this._stopCorruptionWatchdog();
                    const activeFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                    if (activeFs) {
                        try {
                            if (document.exitFullscreen) await document.exitFullscreen(); else if (document.webkitExitFullscreen) await document.webkitExitFullscreen(); else if (document.mozCancelFullScreen) await document.mozCancelFullScreen(); else if (document.msExitFullscreen) await document.msExitFullscreen();
                        } catch (e) {}
                    }
                    if (nativeFsBtn && typeof nativeFsBtn.click === "function") {
                        try {
                            nativeFsBtn.click();
                        } catch (e) {}
                    }
                    if (this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video") || document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active")) {
                        try {
                            await this.exitForcedFullscreen();
                        } catch (e) {}
                    }
                    try {
                        if (document.documentElement) document.documentElement.classList.remove("gvc-page-fullscreen-active");
                        if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
                        document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                            try {
                                b.remove();
                            } catch (e) {}
                        });
                        document.querySelectorAll("#gvc-fs-placeholder, [data-gvc-fs-placeholder]").forEach(el => {
                            try {
                                el.remove();
                            } catch (e) {}
                        });
                        document.querySelectorAll(".gvc-page-fullscreen-suppressed").forEach(el => {
                            el.classList.remove("gvc-page-fullscreen-suppressed");
                            el.style.removeProperty("display");
                        });
                        document.querySelectorAll(".gvc-page-fullscreen-ancestor").forEach(el => {
                            el.classList.remove("gvc-page-fullscreen-ancestor");
                        });
                        document.querySelectorAll(".gvc-page-fullscreen-video").forEach(el => {
                            el.classList.remove("gvc-page-fullscreen-video");
                        });
                    } catch (e) {}
                    this.showHUD("Exit Fullscreen");
                    this.restorePreFullscreenControlsState();
                    this.updatePosition();
                    this.updateControlsBarState();
                    return;
                }
                this.savePreFullscreenControlsState();
                const hasNativeControls = typeof this.hasNativePlayerControls === "function" && this.hasNativePlayerControls();
                if (hasNativeControls) {
                    if (nativeFsBtn && typeof nativeFsBtn.click === "function") {
                        try {
                            nativeFsBtn.click();
                            this.showHUD("Fullscreen");
                            this._startCorruptionWatchdog();
                            activeHoveredCtrl = this;
                            lastHoveredCtrl = this;
                            if (!this._wasControlsForcedBeforeFs) {
                                this.isControlsForced = false;
                                if (this.controlsBar) {
                                    this.controlsBar.classList.add("hidden");
                                    this.controlsBar.classList.add("hover-hidden");
                                    this.updateControlsBarState();
                                }
                            }
                            if (typeof this.updateProgressBarButtonState === "function") {
                                this.updateProgressBarButtonState();
                            }
                            this.attachHost();
                            this.updatePosition();
                            setTimeout(() => {
                                try {
                                    if (this.video) {
                                        if (!this.video.hasAttribute("tabindex")) this.video.tabIndex = -1;
                                        this.video.focus({
                                            preventScroll: true
                                        });
                                    }
                                } catch (e) {}
                            }, 80);
                            return;
                        } catch (e) {}
                    }
                    const playerContainer = this.video && typeof this.video.closest === "function" ? this.video.closest('.html5-video-player, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : null;
                    const targetFs = playerContainer || this.video;
                    const req = targetFs ? targetFs.requestFullscreen || targetFs.webkitRequestFullscreen || targetFs.mozRequestFullScreen || targetFs.msRequestFullscreen : null;
                    if (req) {
                        try {
                            await req.call(targetFs);
                            this.showHUD("Fullscreen");
                            this._startCorruptionWatchdog();
                            activeHoveredCtrl = this;
                            lastHoveredCtrl = this;
                            if (!this._wasControlsForcedBeforeFs) {
                                this.isControlsForced = false;
                                if (this.controlsBar) {
                                    this.controlsBar.classList.add("hidden");
                                    this.controlsBar.classList.add("hover-hidden");
                                    this.updateControlsBarState();
                                }
                            }
                            if (typeof this.updateProgressBarButtonState === "function") {
                                this.updateProgressBarButtonState();
                            }
                            this.attachHost();
                            this.updatePosition();
                            return;
                        } catch (e) {}
                    }
                }
                await this.enterForcedFullscreen();
            } catch (err) {
                console.warn("Force fullscreen error:", err);
            }
        }
        async enterForcedFullscreen() {
            try {
                this._subtitlesActiveOnRegularPlayer = this.canFindSubtitlesOnRegularPlayer();
            } catch (e) {}
            ensurePageFullscreenStyles(document);
            const rootNode = this.video && typeof this.video.getRootNode === "function" ? this.video.getRootNode() : null;
            if (rootNode && rootNode !== document) {
                ensurePageFullscreenStyles(rootNode);
            }
            this._subtitlesActiveOnRegularPlayer = this.canFindSubtitlesOnRegularPlayer();
            this._isPageFullscreen = true;
            this.savePreFullscreenControlsState();
            const savedScrollX = window.scrollX || window.pageXOffset || (document.documentElement ? document.documentElement.scrollLeft : 0) || (document.body ? document.body.scrollLeft : 0) || 0;
            const savedScrollY = window.scrollY || window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || (document.body ? document.body.scrollTop : 0) || 0;
            this._fsSavedScroll = {
                x: savedScrollX,
                y: savedScrollY
            };
            if (this._fsScrollBlocker) {
                window.removeEventListener("wheel", this._fsScrollBlocker, {
                    capture: true
                });
                window.removeEventListener("touchmove", this._fsScrollBlocker, {
                    capture: true
                });
            }
            this._fsScrollBlocker = e => {
                if (!this._isPageFullscreen) return;
                if (e.target && e.target.closest && e.target.closest(".omni-subtitles-settings-popup, .omni-custom-select-dropdown")) {
                    return;
                }
                e.preventDefault();
            };
            window.addEventListener("wheel", this._fsScrollBlocker, {
                passive: false,
                capture: true
            });
            window.addEventListener("touchmove", this._fsScrollBlocker, {
                passive: false,
                capture: true
            });
            if (this._fsScrollGuard) {
                window.removeEventListener("scroll", this._fsScrollGuard, {
                    capture: true
                });
            }
            this._fsScrollGuard = () => {
                if (!this._isPageFullscreen || !this._fsSavedScroll) return;
                const curX = window.scrollX || window.pageXOffset || 0;
                const curY = window.scrollY || window.pageYOffset || 0;
                if (Math.abs(curX - this._fsSavedScroll.x) > 2 || Math.abs(curY - this._fsSavedScroll.y) > 2) {
                    try {
                        window.scrollTo({
                            left: this._fsSavedScroll.x,
                            top: this._fsSavedScroll.y,
                            behavior: "instant"
                        });
                    } catch (e) {
                        window.scrollTo(this._fsSavedScroll.x, this._fsSavedScroll.y);
                    }
                }
            };
            window.addEventListener("scroll", this._fsScrollGuard, {
                passive: true,
                capture: true
            });
            if (this.video && !this._fsOrigPause) {
                this._fsOrigPause = this.video.pause;
                const ctrl = this;
                this.video.pause = function(...args) {
                    const isUserGesture = Date.now() - lastUserInteractionTime < 450 || ctrl._userRequestedPause || ctrl._isScrubbing;
                    if (ctrl._isPageFullscreen && !isUserGesture) {
                        return;
                    }
                    return ctrl._fsOrigPause.apply(this, args);
                };
            }
            const hasNativeControls = typeof this.hasNativePlayerControls === "function" && this.hasNativePlayerControls();
            if (!hasNativeControls) {
                this.isControlsForced = true;
                if (this.controlsBar) {
                    this.controlsBar.classList.remove("hidden");
                    this.controlsBar.classList.remove("hover-hidden");
                    this.controlsBar.style.display = "";
                    this.controlsBar.style.visibility = "";
                    this.updateControlsBarState();
                    if (currentConfig.autoHideButtons !== false) {
                        this.scheduleControlsBarAutoHide();
                    }
                }
                if (typeof this.updateProgressBarButtonState === "function") {
                    this.updateProgressBarButtonState();
                }
            } else {
                if (!this._wasControlsForcedBeforeFs) {
                    this.isControlsForced = false;
                    if (this.controlsBar) {
                        this.controlsBar.classList.add("hidden");
                        this.controlsBar.classList.add("hover-hidden");
                        this.updateControlsBarState();
                    }
                }
            }
            let backdrop = document.getElementById("gvc-fullscreen-backdrop");
            if (!backdrop) {
                backdrop = document.createElement("div");
                backdrop.id = "gvc-fullscreen-backdrop";
                (document.body || document.documentElement).appendChild(backdrop);
            }
            backdrop.style.display = "block";
            if (!backdrop._hasGvcListener) {
                backdrop._hasGvcListener = true;
                backdrop.addEventListener("pointerdown", () => {
                    for (const ctrl of activeControllers.values()) {
                        if (ctrl && ctrl._isPageFullscreen) {
                            if (!ctrl.video || ctrl.video.paused || ctrl.video.ended || !ctrl.video.isConnected || ctrl.video.offsetWidth === 0) {
                                ctrl.handlePlaybackCorruption("backdrop click on inactive video");
                            }
                        }
                    }
                });
            }
            this._fsResetAncestors = [];
            this._fsResetInlineStyles = new Map;
            let el = this.video;
            while (el) {
                const parent = el.parentElement || (el.getRootNode && el.getRootNode() !== document ? el.getRootNode().host : null) || el.parentNode;
                if (!parent || parent === document || parent === document.documentElement) break;
                el = parent;
                if (el === document.body) break;
                try {
                    const prev = {
                        position: el.style.position || "",
                        transform: el.style.transform || "",
                        willChange: el.style.willChange || "",
                        contain: el.style.contain || "",
                        perspective: el.style.perspective || "",
                        filter: el.style.filter || "",
                        backdropFilter: el.style.backdropFilter || "",
                        clipPath: el.style.clipPath || "",
                        clip: el.style.clip || "",
                        mask: el.style.mask || "",
                        webkitMask: el.style.webkitMask || "",
                        overflow: el.style.overflow || "",
                        overflowX: el.style.overflowX || "",
                        overflowY: el.style.overflowY || "",
                        contentVisibility: el.style.contentVisibility || "",
                        zIndex: el.style.zIndex || "",
                        marginTop: el.style.marginTop || "",
                        marginLeft: el.style.marginLeft || ""
                    };
                    this._fsResetInlineStyles.set(el, prev);
                    this._fsResetAncestors.push(el);
                    el.classList.add("gvc-page-fullscreen-ancestor");
                    el.style.setProperty("transform", "none", "important");
                    el.style.setProperty("will-change", "none", "important");
                    el.style.setProperty("contain", "none", "important");
                    el.style.setProperty("perspective", "none", "important");
                    el.style.setProperty("filter", "none", "important");
                    el.style.setProperty("backdrop-filter", "none", "important");
                    el.style.setProperty("clip-path", "none", "important");
                    el.style.setProperty("clip", "auto", "important");
                    el.style.setProperty("mask", "none", "important");
                    el.style.setProperty("-webkit-mask", "none", "important");
                    const comp = window.getComputedStyle(el);
                    const isScrollable = el.scrollHeight > el.clientHeight && (comp.overflowY === "auto" || comp.overflowY === "scroll") || el.scrollWidth > el.clientWidth && (comp.overflowX === "auto" || comp.overflowX === "scroll") || el.scrollTop > 0 || el.scrollLeft > 0;
                    if (isScrollable) {
                        prev.savedScrollTop = el.scrollTop;
                        prev.savedScrollLeft = el.scrollLeft;
                    } else {
                        el.style.setProperty("overflow", "visible", "important");
                        el.style.setProperty("overflow-x", "visible", "important");
                        el.style.setProperty("overflow-y", "visible", "important");
                    }
                    el.style.setProperty("content-visibility", "visible", "important");
                    el.style.setProperty("z-index", "2147483640", "important");
                    if (comp.position === "static") {
                        el.style.setProperty("position", "relative", "important");
                    }
                } catch (e) {}
            }
            this._fsSuppressedElements = [];
            const suppressSelectors = [ "#masthead-container", "ytd-masthead", "#guide", "#guide-wrapper", "ytd-guide-renderer", "ytd-mini-guide-renderer", "tp-yt-app-drawer", "ytd-rich-grid-renderer > #header", "#chips-wrapper", "#chips", "ytd-feed-filter-chip-bar-renderer", "yt-related-chip-cloud-renderer", "header", "nav", "aside", '[role="banner"]', '[role="navigation"]', "reddit-header-large", "reddit-sidebar-nav", "#reddit-header", "ytd-video-preview #hover-overlays", "ytd-video-preview .ytp-inline-preview-scrim", "ytd-video-preview .ytp-inline-preview-ui", "ytd-video-preview .ytp-chrome-top", "ytd-video-preview .ytp-chrome-bottom", '[data-e2e*="side-nav" i]', '[data-e2e*="nav" i]', 'div[class*="DivSideNav" i]', 'div[class*="DivHeaderContainer" i]', 'div[class*="DivHeader" i]', 'header[class*="DivHeader" i]', 'div[class*="DivNavWrapper" i]', 'div[class*="DivProfileNav" i]', '[data-e2e="feed-action-item"]', '[class*="DivActionItemContainer" i]', '[class*="DivContentContainer" i]', '[class*="DivDescription" i]', '[class*="DivMusic" i]', '[data-e2e="browse-floting"]', '[class*="DivFloating" i]' ].join(", ");
            const fixedCandidates = document.querySelectorAll(suppressSelectors);
            fixedCandidates.forEach(cand => {
                if (!this._fsResetAncestors.includes(cand) && cand !== this.host && !cand.contains(this.video) && !this.video.contains(cand)) {
                    try {
                        cand.classList.add("gvc-page-fullscreen-suppressed");
                        cand.style.setProperty("display", "none", "important");
                        this._fsSuppressedElements.push(cand);
                    } catch (e) {}
                }
            });
            if (document.documentElement) document.documentElement.classList.add("gvc-page-fullscreen-active");
            if (document.body) document.body.classList.add("gvc-page-fullscreen-active");
            if (this.video && this.video.parentNode) {
                try {
                    if (this._fsPlaceholder) {
                        try {
                            this._fsPlaceholder.remove();
                        } catch (e) {}
                        this._fsPlaceholder = null;
                    }
                    const rect = this.video.getBoundingClientRect();
                    const comp = window.getComputedStyle(this.video);
                    const ph = document.createElement("div");
                    ph.id = "gvc-fs-placeholder";
                    ph.setAttribute("data-gvc-fs-placeholder", "true");
                    const w = rect.width > 0 ? rect.width : this.video.clientWidth || 300;
                    const h = rect.height > 0 ? rect.height : this.video.clientHeight || 400;
                    ph.style.setProperty("display", comp.display === "inline" || comp.display === "inline-block" ? "inline-block" : "block", "important");
                    ph.style.setProperty("width", `${w}px`, "important");
                    ph.style.setProperty("height", `${h}px`, "important");
                    ph.style.setProperty("min-width", `${w}px`, "important");
                    ph.style.setProperty("min-height", `${h}px`, "important");
                    ph.style.setProperty("max-width", comp.maxWidth !== "none" ? comp.maxWidth : `${w}px`, "important");
                    ph.style.setProperty("max-height", comp.maxHeight !== "none" ? comp.maxHeight : `${h}px`, "important");
                    ph.style.setProperty("visibility", "hidden", "important");
                    ph.style.setProperty("pointer-events", "none", "important");
                    ph.style.setProperty("opacity", "0", "important");
                    ph.style.setProperty("margin", comp.margin || "0", "important");
                    ph.style.setProperty("padding", "0", "important");
                    ph.style.setProperty("border", "none", "important");
                    ph.style.setProperty("box-sizing", comp.boxSizing || "border-box", "important");
                    ph.style.setProperty("flex-shrink", "0", "important");
                    this.video.parentNode.insertBefore(ph, this.video);
                    this._fsPlaceholder = ph;
                } catch (phErr) {}
            }
            if (this.video) {
                this._fsVideoInlineStyles = {
                    position: this.video.style.position || "",
                    top: this.video.style.top || "",
                    left: this.video.style.left || "",
                    width: this.video.style.width || "",
                    height: this.video.style.height || "",
                    maxWidth: this.video.style.maxWidth || "",
                    maxHeight: this.video.style.maxHeight || "",
                    minWidth: this.video.style.minWidth || "",
                    minHeight: this.video.style.minHeight || "",
                    zIndex: this.video.style.zIndex || "",
                    background: this.video.style.background || "",
                    objectFit: this.video.style.objectFit || "",
                    margin: this.video.style.margin || "",
                    padding: this.video.style.padding || "",
                    transform: this.video.style.transform || ""
                };
                this.video.classList.add("gvc-page-fullscreen-video");
                this.video.style.setProperty("position", "fixed", "important");
                this.video.style.setProperty("top", "0px", "important");
                this.video.style.setProperty("left", "0px", "important");
                this.video.style.setProperty("width", "100vw", "important");
                this.video.style.setProperty("height", "100vh", "important");
                this.video.style.setProperty("max-width", "100vw", "important");
                this.video.style.setProperty("max-height", "100vh", "important");
                this.video.style.setProperty("min-width", "100vw", "important");
                this.video.style.setProperty("min-height", "100vh", "important");
                this.video.style.setProperty("z-index", "2147483640", "important");
                this.video.style.setProperty("background", "#000000", "important");
                this.video.style.setProperty("object-fit", "contain", "important");
                this.video.style.setProperty("margin", "0", "important");
                this.video.style.setProperty("padding", "0", "important");
                this.video.style.setProperty("transform", "none", "important");
            }
            const hostEl = rootNode && rootNode.host ? rootNode.host : null;
            if (hostEl) {
                hostEl.classList.add("gvc-page-fullscreen-host");
                this._fsHostElement = hostEl;
            }
            const playerContainer = this.video && typeof this.video.closest === "function" ? this.video.closest('.html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, shreddit-player, shreddit-player-2, .video-card, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : null;
            if (playerContainer && playerContainer !== this.video && playerContainer !== hostEl) {
                this._fsPlayerInlineStyles = {
                    position: playerContainer.style.position || "",
                    top: playerContainer.style.top || "",
                    left: playerContainer.style.left || "",
                    width: playerContainer.style.width || "",
                    height: playerContainer.style.height || "",
                    zIndex: playerContainer.style.zIndex || "",
                    background: playerContainer.style.background || ""
                };
                playerContainer.classList.add("gvc-page-fullscreen-player");
                this._fsPlayerContainer = playerContainer;
                playerContainer.style.setProperty("position", "fixed", "important");
                playerContainer.style.setProperty("top", "0px", "important");
                playerContainer.style.setProperty("left", "0px", "important");
                playerContainer.style.setProperty("width", "100vw", "important");
                playerContainer.style.setProperty("height", "100vh", "important");
                playerContainer.style.setProperty("z-index", "2147483640", "important");
            }
            const isTikTok = (window.location.hostname || "").includes("tiktok.com");
            const otherMediaSelector = isTikTok ? 'video, .xgplayer-dynamicbg, [class*="xgplayer-dynamicbg" i]' : "video";
            const allOtherMedia = document.querySelectorAll(otherMediaSelector);
            allOtherMedia.forEach(media => {
                if (media !== this.video && !this.video.contains(media) && !media.contains(this.video)) {
                    try {
                        if (media.tagName === "VIDEO" && !media.paused) {
                            try {
                                media.pause();
                                media._gvcPausedForFs = true;
                            } catch (e) {}
                        }
                        media.classList.add("gvc-page-fullscreen-suppressed");
                        media.style.setProperty("display", "none", "important");
                        this._fsSuppressedElements.push(media);
                    } catch (e) {}
                }
            });
            const previewWrapper = this.video && typeof this.video.closest === "function" ? this.video.closest("ytd-video-preview") : null;
            if (previewWrapper && previewWrapper !== playerContainer && previewWrapper !== hostEl) {
                previewWrapper.classList.add("gvc-page-fullscreen-player");
                this._fsPreviewWrapper = previewWrapper;
                previewWrapper.style.setProperty("position", "fixed", "important");
                previewWrapper.style.setProperty("top", "0px", "important");
                previewWrapper.style.setProperty("left", "0px", "important");
                previewWrapper.style.setProperty("width", "100vw", "important");
                previewWrapper.style.setProperty("height", "100vh", "important");
                previewWrapper.style.setProperty("z-index", "2147483640", "important");
            }
            const rootEl = document.documentElement;
            const requestFs = rootEl.requestFullscreen || rootEl.webkitRequestFullscreen || rootEl.mozRequestFullScreen || rootEl.msRequestFullscreen;
            if (requestFs && !document.fullscreenElement) {
                try {
                    await requestFs.call(rootEl);
                } catch (fsErr) {}
            }
            this._enteredWithNativeFs = !!document.fullscreenElement;
            if (this._fsSavedScroll) {
                try {
                    window.scrollTo({
                        left: this._fsSavedScroll.x,
                        top: this._fsSavedScroll.y,
                        behavior: "instant"
                    });
                } catch (e) {
                    window.scrollTo(this._fsSavedScroll.x, this._fsSavedScroll.y);
                }
            }
            this.attachHost();
            this.setHovered(true);
            if (this.container) {
                this.container.classList.remove("hidden");
                this.container.classList.remove("hover-hidden");
                this.container.style.display = "";
                this.container.style.visibility = "visible";
            }
            activeHoveredCtrl = this;
            lastHoveredCtrl = this;
            this.showHUD("Fullscreen");
            this.updatePosition();
            this.attachSubtitlesHost();
            updateNativeSubtitleVisibility();
            setTimeout(() => {
                try {
                    if (this._isPageFullscreen) {
                        this.attachSubtitlesHost();
                        updateNativeSubtitleVisibility();
                    }
                } catch (e) {}
            }, 150);
            if (this.subtitlesSettingsPopup) {
                this.subtitlesSettingsPopup.classList.add("is-fullscreen");
                this.syncSubtitleSettingsUI();
            }
            try {
                if (this.video) {
                    if (!this.video.hasAttribute("tabindex")) this.video.tabIndex = -1;
                    this.video.focus({
                        preventScroll: true
                    });
                }
            } catch (e) {}
            if (typeof unhideCursor === "function") {
                unhideCursor();
            }
            this._startCorruptionWatchdog();
        }
        async exitForcedFullscreen() {
            this._stopCorruptionWatchdog();
            this._isPageFullscreen = false;
            this._enteredWithNativeFs = false;
            this._subtitlesActiveOnRegularPlayer = void 0;
            if (this._fsOrigPause && this.video) {
                this.video.pause = this._fsOrigPause;
                this._fsOrigPause = null;
            }
            if (this._fsScrollBlocker) {
                window.removeEventListener("wheel", this._fsScrollBlocker, {
                    capture: true
                });
                window.removeEventListener("touchmove", this._fsScrollBlocker, {
                    capture: true
                });
                this._fsScrollBlocker = null;
            }
            if (this._fsScrollGuard) {
                window.removeEventListener("scroll", this._fsScrollGuard, {
                    capture: true
                });
                this._fsScrollGuard = null;
            }
            if (this._fsPlaceholder) {
                try {
                    this._fsPlaceholder.remove();
                } catch (e) {}
                this._fsPlaceholder = null;
            }
            document.querySelectorAll("#gvc-fs-placeholder, [data-gvc-fs-placeholder]").forEach(el => {
                try {
                    el.remove();
                } catch (e) {}
            });
            this.attachSubtitlesHost();
            updateNativeSubtitleVisibility();
            if (this.subtitlesSettingsPopup) {
                this.subtitlesSettingsPopup.classList.remove("is-fullscreen");
                this.syncSubtitleSettingsUI();
            }
            this.restorePreFullscreenControlsState();
            document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                try {
                    b.remove();
                } catch (e) {}
            });
            if (this.video) {
                this.video.classList.remove("gvc-page-fullscreen-video");
                const vProps = [ "position", "top", "left", "width", "height", "max-width", "max-height", "min-width", "min-height", "z-index", "background", "object-fit", "margin", "padding", "transform" ];
                if (this._fsVideoInlineStyles) {
                    vProps.forEach(p => {
                        const camel = p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                        if (this._fsVideoInlineStyles[camel]) {
                            this.video.style.setProperty(p, this._fsVideoInlineStyles[camel]);
                        } else {
                            this.video.style.removeProperty(p);
                        }
                    });
                    this._fsVideoInlineStyles = null;
                } else {
                    vProps.forEach(p => this.video.style.removeProperty(p));
                }
            }
            if (this._fsHostElement) {
                this._fsHostElement.classList.remove("gvc-page-fullscreen-host");
                this._fsHostElement = null;
            }
            if (this._fsPlayerContainer) {
                this._fsPlayerContainer.classList.remove("gvc-page-fullscreen-player");
                const pProps = [ "position", "top", "left", "width", "height", "z-index", "background" ];
                if (this._fsPlayerInlineStyles) {
                    pProps.forEach(p => {
                        const camel = p.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                        if (this._fsPlayerInlineStyles[camel]) {
                            this._fsPlayerContainer.style.setProperty(p, this._fsPlayerInlineStyles[camel]);
                        } else {
                            this._fsPlayerContainer.style.removeProperty(p);
                        }
                    });
                    this._fsPlayerInlineStyles = null;
                } else {
                    pProps.forEach(p => this._fsPlayerContainer.style.removeProperty(p));
                }
                this._fsPlayerContainer = null;
            }
            if (this._fsPreviewWrapper) {
                this._fsPreviewWrapper.classList.remove("gvc-page-fullscreen-player");
                [ "position", "top", "left", "width", "height", "z-index", "background" ].forEach(p => this._fsPreviewWrapper.style.removeProperty(p));
                this._fsPreviewWrapper = null;
            }
            if (document.documentElement) document.documentElement.classList.remove("gvc-page-fullscreen-active");
            if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
            const ancestorProps = [ "position", "transform", "will-change", "contain", "perspective", "filter", "backdrop-filter", "clip-path", "clip", "mask", "-webkit-mask", "overflow", "overflow-x", "overflow-y", "content-visibility", "z-index", "margin-top", "margin-left" ];
            if (this._fsResetAncestors) {
                this._fsResetAncestors.forEach(el => {
                    if (!el) return;
                    try {
                        el.classList.remove("gvc-page-fullscreen-ancestor");
                        if (this._fsResetInlineStyles && this._fsResetInlineStyles.has(el)) {
                            const saved = this._fsResetInlineStyles.get(el);
                            ancestorProps.forEach(prop => {
                                const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                                if (saved[camel]) {
                                    el.style.setProperty(prop, saved[camel]);
                                } else {
                                    el.style.removeProperty(prop);
                                }
                            });
                            if (saved.savedScrollTop !== void 0) el.scrollTop = saved.savedScrollTop;
                            if (saved.savedScrollLeft !== void 0) el.scrollLeft = saved.savedScrollLeft;
                        } else {
                            ancestorProps.forEach(prop => el.style.removeProperty(prop));
                        }
                    } catch (e) {}
                });
                this._fsResetAncestors = [];
                this._fsResetInlineStyles = null;
            }
            if (Array.isArray(this._fsResetStaticPositions)) {
                this._fsResetStaticPositions.forEach(el => {
                    if (el && el.style) el.style.removeProperty("position");
                });
                this._fsResetStaticPositions = [];
            }
            if (this._fsSuppressedElements) {
                this._fsSuppressedElements.forEach(el => {
                    try {
                        el.classList.remove("gvc-page-fullscreen-suppressed");
                        el.style.removeProperty("display");
                    } catch (e) {}
                });
                this._fsSuppressedElements = [];
            }
            try {
                document.querySelectorAll(".gvc-page-fullscreen-suppressed").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-suppressed");
                    el.style.removeProperty("display");
                });
                document.querySelectorAll(".gvc-page-fullscreen-ancestor").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-ancestor");
                });
                document.querySelectorAll(".gvc-page-fullscreen-video").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-video");
                });
                document.querySelectorAll(".gvc-page-fullscreen-player").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-player");
                });
            } catch (e) {}
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (fsEl) {
                try {
                    if (document.exitFullscreen) {
                        await document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        await document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        await document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        await document.msExitFullscreen();
                    }
                } catch (e) {}
            }
            if (typeof unhideCursor === "function") {
                unhideCursor();
            }
            if (this._fsSavedScroll) {
                const {x: x, y: y} = this._fsSavedScroll;
                this._fsSavedScroll = null;
                try {
                    window.scrollTo({
                        left: x,
                        top: y,
                        behavior: "instant"
                    });
                } catch (e) {
                    window.scrollTo(x, y);
                }
            }
            this.attachHost();
            this.showHUD("Exit Fullscreen");
            this.updateControlsBarState();
            this.updatePosition();
            try {
                window.dispatchEvent(new Event("resize"));
            } catch (e) {}
        }
        hasPlayerErrorState() {
            if (!this.video) return false;
            try {
                if (this.video.error) return true;
                const player = typeof this.video.closest === "function" ? this.video.closest('.html5-video-player, ytd-player, .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, [class*="player-container" i], [class*="video-player" i]') : this.video.parentElement || null;
                if (player && player !== document.body && player !== document.documentElement) {
                    if (player.classList && (player.classList.contains("ytp-error") || player.classList.contains("vjs-error") || player.classList.contains("plyr--error") || player.classList.contains("jw-error") || player.classList.contains("is-error") || player.classList.contains("has-error"))) {
                        return true;
                    }
                    const errEl = player.querySelector('.ytp-error, .ytp-error-content, .vjs-error-display, .jw-error-msg, [class*="error-screen" i], [class*="playback-error" i]');
                    if (errEl && errEl.isConnected) {
                        const style = window.getComputedStyle(errEl);
                        if (style && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
                            return true;
                        }
                    }
                }
            } catch (e) {}
            return false;
        }
        handlePlaybackCorruption(reason = "unknown") {
            const isCurrentlyFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video") || document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active") || document.fullscreenElement);
            if (!isCurrentlyFs) {
                return;
            }
            console.warn(`[GVC] Playback failure / quit detected (${reason}). Auto-quitting fullscreen.`);
            this._stopCorruptionWatchdog();
            try {
                this.exitForcedFullscreen();
            } catch (err) {}
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (fsEl) {
                try {
                    if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen(); else if (document.mozCancelFullScreen) document.mozCancelFullScreen(); else if (document.msExitFullscreen) document.msExitFullscreen();
                } catch (e) {}
            }
            try {
                if (document.documentElement) document.documentElement.classList.remove("gvc-page-fullscreen-active");
                if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
                document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                    try {
                        b.remove();
                    } catch (e) {}
                });
                document.querySelectorAll("#gvc-fs-placeholder, [data-gvc-fs-placeholder]").forEach(el => {
                    try {
                        el.remove();
                    } catch (e) {}
                });
                document.querySelectorAll(".gvc-page-fullscreen-suppressed").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-suppressed");
                    el.style.removeProperty("display");
                });
                document.querySelectorAll(".gvc-page-fullscreen-ancestor").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-ancestor");
                });
                document.querySelectorAll(".gvc-page-fullscreen-video").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-video");
                    el.style.removeProperty("position");
                    el.style.removeProperty("top");
                    el.style.removeProperty("left");
                    el.style.removeProperty("width");
                    el.style.removeProperty("height");
                    el.style.removeProperty("z-index");
                });
            } catch (e) {}
            if (typeof unhideCursor === "function") unhideCursor();
            const isQuit = reason && (reason.includes("quit") || reason.includes("dismissed") || reason.includes("collapsed") || reason.includes("inactive"));
            const hudMsg = isQuit ? "Playback Ended - Exited Fullscreen" : "Playback Corrupted - Exited Fullscreen";
            this.showHUD(hudMsg);
        }
        _startCorruptionWatchdog() {
            this._stopCorruptionWatchdog();
            this._fsEnterTime = Date.now();
            this._fsInitialTime = this.video ? this.video.currentTime : 0;
            this._userExplicitlyToggledPlay = false;
            this._fsCorruptionWatchdog = setInterval(() => {
                if (!this._isPageFullscreen && !document.fullscreenElement) {
                    this._stopCorruptionWatchdog();
                    return;
                }
                if (!this.video || !this.video.isConnected) {
                    this.handlePlaybackCorruption("video detached from DOM");
                    return;
                }
                if (this.video.error) {
                    this.handlePlaybackCorruption(`MediaError code ${this.video.error.code}`);
                    return;
                }
                if (this.hasPlayerErrorState()) {
                    this.handlePlaybackCorruption("player error state detected");
                    return;
                }
                try {
                    const vRect = this.video.getBoundingClientRect();
                    if (vRect.width === 0 && vRect.height === 0 && (!this.video.getClientRects || this.video.getClientRects().length === 0)) {
                        this.handlePlaybackCorruption("video collapsed to 0x0");
                        return;
                    }
                    if (this.video.hidden || this.video.style.display === "none" || this.video.style.visibility === "hidden") {
                        this.handlePlaybackCorruption("video hidden by site");
                        return;
                    }
                    const previewWidget = typeof this.video.closest === "function" ? this.video.closest('ytd-video-preview, [class*="inline-preview"], .video-card') : null;
                    if (previewWidget) {
                        if (previewWidget.hasAttribute("hidden") || previewWidget.style.display === "none" || previewWidget.offsetWidth === 0) {
                            this.handlePlaybackCorruption("preview player dismissed by site");
                            return;
                        }
                    }
                } catch (e) {}
                try {
                    const isFeedVideo = !!(this.video && typeof this.video.closest === "function" && this.video.closest('ytd-video-preview, ytd-rich-grid-media, ytd-rich-item-renderer, ytd-compact-video-renderer, shreddit-post, [data-testid*="tweet"], .video-card'));
                    const elapsed = Date.now() - (this._fsEnterTime || 0);
                    if (isFeedVideo && elapsed >= 450 && elapsed <= 3500) {
                        if (this.video.paused && !this._userExplicitlyToggledPlay) {
                            this.handlePlaybackCorruption("hover-to-play video quit playback");
                            return;
                        }
                    }
                } catch (e) {}
            }, 300);
        }
        _stopCorruptionWatchdog() {
            if (this._fsCorruptionWatchdog) {
                clearInterval(this._fsCorruptionWatchdog);
                this._fsCorruptionWatchdog = null;
            }
        }
        cleanSubtitleText(text) {
            if (!text) return "";
            return text.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
        }
        startSubtitleMirroring() {
            if (this.subtitlesOverlay) {
                this.subtitlesOverlay.classList.remove("disabled-by-user");
                this.subtitlesOverlay.style.display = "";
            }
            this.attachSubtitlesHost();
            if (this._subObserver || this._subPollInterval) return;
            this.updateSubtitlesPosition();
            this._boundCueChange = () => {
                if (this._subRaf) cancelAnimationFrame(this._subRaf);
                this._subRaf = requestAnimationFrame(() => this.checkSubtitles());
            };
            if (this.video && this.video.textTracks) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    try {
                        this.video.textTracks[i].addEventListener("cuechange", this._boundCueChange);
                    } catch (e) {}
                }
                try {
                    this.video.textTracks.addEventListener("change", this._boundCueChange);
                    this.video.textTracks.addEventListener("addtrack", this._boundCueChange);
                } catch (e) {}
            }
            const player = (this.video ? this.video.closest(".html5-video-player, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player") : null) || (this.video ? this.video.parentElement : null) || document.body;
            this._lastSubtitleText = "";
            this.checkSubtitles();
            try {
                this._subObserver = new MutationObserver(() => {
                    if (this._subRaf) cancelAnimationFrame(this._subRaf);
                    this._subRaf = requestAnimationFrame(() => this.checkSubtitles());
                });
                this._subObserver.observe(player, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            } catch (e) {}
            this._subPollInterval = setInterval(() => this.checkSubtitles(), 200);
        }
        checkSubtitles() {
            if (this._userSubtitlesExplicitlyDisabled) {
                if (this.subtitlesOverlay) {
                    this.subtitlesOverlay.textContent = "";
                    this.subtitlesOverlay.classList.add("empty");
                    this.subtitlesOverlay.style.display = "none";
                }
                return;
            }
            const isPreview = !!(this.video && typeof this.video.closest === "function" && this.video.closest("ytd-video-preview, .thumb-container, .preview-container"));
            if (isPreview) {
                if (this.subtitlesOverlay && !this.subtitlesOverlay.classList.contains("empty")) {
                    this.subtitlesOverlay.textContent = "";
                    this.subtitlesOverlay.classList.add("empty");
                    this.subtitlesOverlay.style.display = "none";
                    this._lastSubtitleText = "";
                }
                return;
            }
            const isFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            const replaceEnabled = !!(currentConfig.subtitleStyles && currentConfig.subtitleStyles.replaceSubtitles);
            const isTestBench = !!(window.__TEST_BENCH__ || window.location && (window.location.pathname.includes("test.html") || window.location.pathname.includes("settings.html")));
            const isFsAutoReplace = isFs && typeof this.shouldAutoReplaceSubtitlesInFullscreen === "function" && this.shouldAutoReplaceSubtitlesInFullscreen();
            const shouldMirror = replaceEnabled || isTestBench || isFsAutoReplace;
            if (!shouldMirror) {
                if (this.subtitlesOverlay && !this.subtitlesOverlay.classList.contains("empty")) {
                    this.subtitlesOverlay.textContent = "";
                    this.subtitlesOverlay.classList.add("empty");
                    this.subtitlesOverlay.style.display = "none";
                    this._lastSubtitleText = "";
                }
                return;
            }
            this.updateSubtitlesPosition();
            const text = this.extractCurrentSubtitles();
            if (text !== this._lastSubtitleText) {
                this._lastSubtitleText = text;
                this.renderSubtitles(text);
                this.updateSubtitlesButtonState();
            }
        }
        extractCurrentSubtitles() {
            if (!this.video) return "";
            try {
                const ytContainer = (this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview") : null) || document;
                if (ytContainer && typeof ytContainer.querySelector === "function") {
                    const captionWindow = ytContainer.querySelector(".caption-window, .ytp-caption-window-container");
                    const targetContainer = captionWindow || ytContainer;
                    if (targetContainer) {
                        const style = window.getComputedStyle(targetContainer);
                        if (style.display !== "none" && style.visibility !== "hidden") {
                            const visualLines = targetContainer.querySelectorAll(".caption-visual-line");
                            if (visualLines.length > 0) {
                                const lines = [];
                                visualLines.forEach(vl => {
                                    const t = this.cleanSubtitleText(vl.textContent || "");
                                    if (t) lines.push(t);
                                });
                                if (lines.length > 0) return lines.join("\n");
                            }
                            const segments = targetContainer.querySelectorAll(".ytp-caption-segment");
                            if (segments.length > 0) {
                                const lines = [];
                                segments.forEach(seg => {
                                    const t = this.cleanSubtitleText(seg.textContent || "");
                                    if (t) lines.push(t);
                                });
                                if (lines.length > 0) return lines.join("\n");
                            }
                            const rawText = this.cleanSubtitleText(targetContainer.textContent || "");
                            if (rawText) return rawText;
                        }
                    }
                }
            } catch (e) {}
            try {
                const player = (this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player") : null) || (this.video ? this.video.parentElement : null) || document;
                if (player && typeof player.querySelector === "function") {
                    const vjs = player.querySelector(".vjs-text-track-display");
                    if (vjs) {
                        try {
                            if (window.getComputedStyle(vjs).display !== "none") {
                                const t = this.cleanSubtitleText(vjs.textContent || "");
                                if (t) return t;
                            }
                        } catch (e) {}
                    }
                    const plyr = player.querySelector(".plyr__captions");
                    if (plyr) {
                        try {
                            if (window.getComputedStyle(plyr).display !== "none") {
                                const t = this.cleanSubtitleText(plyr.textContent || "");
                                if (t) return t;
                            }
                        } catch (e) {}
                    }
                    const jw = player.querySelector(".jw-captions, .jw-text-track-cue");
                    if (jw) {
                        try {
                            if (window.getComputedStyle(jw).display !== "none") {
                                const t = this.cleanSubtitleText(jw.textContent || "");
                                if (t) return t;
                            }
                        } catch (e) {}
                    }
                    const twitch = player.querySelector(".player-captions-container");
                    if (twitch) {
                        try {
                            if (window.getComputedStyle(twitch).display !== "none") {
                                const t = this.cleanSubtitleText(twitch.textContent || "");
                                if (t) return t;
                            }
                        } catch (e) {}
                    }
                    const generic = player.querySelector('[class*="caption-window"], [class*="captions-display"], [class*="subtitle-display"], [class*="player-captions-text"]');
                    if (generic) {
                        try {
                            if (window.getComputedStyle(generic).display !== "none") {
                                const t = this.cleanSubtitleText(generic.textContent || "");
                                if (t) return t;
                            }
                        } catch (e) {}
                    }
                }
            } catch (e) {}
            if (this.video && this.video.textTracks && this.video.textTracks.length > 0) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    const track = this.video.textTracks[i];
                    if (track && (track.mode === "showing" || track.mode === "hidden")) {
                        if (track.activeCues && track.activeCues.length > 0) {
                            const cueLines = [];
                            for (let j = 0; j < track.activeCues.length; j++) {
                                const cue = track.activeCues[j];
                                if (cue && cue.text) {
                                    const cleaned = this.cleanSubtitleText(cue.text);
                                    if (cleaned) cueLines.push(cleaned);
                                }
                            }
                            if (cueLines.length > 0) return cueLines.join("\n");
                        }
                    }
                }
            }
            return "";
        }
        renderSubtitles(text) {
            if (!this.subtitlesOverlay) return;
            if (!text || !text.trim()) {
                this.subtitlesOverlay.classList.add("empty");
                this.subtitlesOverlay.innerHTML = "";
                this.subtitlesOverlay.style.display = "none";
                return;
            }
            const rawLines = text.split("\n").map(l => l.trim()).filter(Boolean);
            if (rawLines.length === 0) {
                this.subtitlesOverlay.classList.add("empty");
                this.subtitlesOverlay.innerHTML = "";
                this.subtitlesOverlay.style.display = "none";
                return;
            }
            const deduped = [];
            rawLines.forEach(l => {
                if (deduped.length === 0 || deduped[deduped.length - 1] !== l) {
                    deduped.push(l);
                }
            });
            const displayLines = deduped.slice(-2);
            this.subtitlesOverlay.innerHTML = "";
            displayLines.forEach(line => {
                const el = document.createElement("div");
                el.className = "omni-subtitles-line";
                el.textContent = line;
                this.subtitlesOverlay.appendChild(el);
            });
            this.subtitlesOverlay.classList.remove("empty");
            this.subtitlesOverlay.style.display = "";
        }
        ensurePlayerClassObserver() {
            if (this._playerClassObserver) return;
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, .video-js, .jwplayer, .plyr, .vimeo-player") : this.video ? this.video.parentElement : null;
                if (player && player !== document.body && player !== document.documentElement) {
                    this._playerClassObserver = new MutationObserver(() => {
                        this.updateSubtitlesPosition();
                    });
                    this._playerClassObserver.observe(player, {
                        attributes: true,
                        attributeFilter: [ "class" ]
                    });
                }
            } catch (e) {}
        }
        updateSubtitlesPosition() {
            if (!this.subtitlesOverlay) return;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            this.subtitlesOverlay.classList.toggle("is-fullscreen", isFs);
            this.ensurePlayerClassObserver();
            let isControlsShowing = false;
            if (this.controlsBar && this.isControlsForced) {
                isControlsShowing = !this.controlsBar.classList.contains("hidden") && !this.controlsBar.classList.contains("hover-hidden");
            } else {
                try {
                    const ytPlayer = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview") : null;
                    if (ytPlayer) {
                        isControlsShowing = !ytPlayer.classList.contains("ytp-autohide");
                    } else {
                        const vjs = this.video && typeof this.video.closest === "function" ? this.video.closest(".video-js") : null;
                        if (vjs) {
                            isControlsShowing = vjs.classList.contains("vjs-user-active") || !vjs.classList.contains("vjs-user-inactive");
                        } else {
                            const plyr = this.video && typeof this.video.closest === "function" ? this.video.closest(".plyr") : null;
                            if (plyr) {
                                isControlsShowing = !plyr.classList.contains("plyr--hide-controls");
                            } else {
                                const jw = this.video && typeof this.video.closest === "function" ? this.video.closest(".jwplayer") : null;
                                if (jw) {
                                    isControlsShowing = !jw.classList.contains("jw-flag-user-inactive") && !jw.classList.contains("jw-state-idle");
                                } else {
                                    isControlsShowing = !!this._isPointerActive;
                                }
                            }
                        }
                    }
                } catch (e) {
                    isControlsShowing = false;
                }
            }
            if (this._isScrubbing || this.isControlsBarHovered) {
                isControlsShowing = true;
            }
            this.subtitlesOverlay.classList.toggle("controls-hidden", !isControlsShowing);
            this.attachSubtitlesHost();
        }
        updateSubtitlesPopupPosition() {
            if (!this.subtitlesSettingsPopup || !this.isSubtitlesSettingsOpen) return;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (isFs) {
                this.subtitlesSettingsPopup.style.left = "";
                this.subtitlesSettingsPopup.style.right = "32px";
                this.subtitlesSettingsPopup.style.bottom = "120px";
                this.subtitlesSettingsPopup.style.top = "";
            } else if (this.cbarCcSettingsBtn) {
                try {
                    const btnRect = this.cbarCcSettingsBtn.getBoundingClientRect();
                    const popW = 300;
                    let left = btnRect.right - popW;
                    if (left < 10) left = 10;
                    if (left + popW > window.innerWidth - 10) left = window.innerWidth - popW - 10;
                    const bottom = window.innerHeight - btnRect.top + 8;
                    this.subtitlesSettingsPopup.style.left = `${Math.round(left)}px`;
                    this.subtitlesSettingsPopup.style.right = "auto";
                    this.subtitlesSettingsPopup.style.bottom = `${Math.max(10, Math.round(bottom))}px`;
                    this.subtitlesSettingsPopup.style.top = "auto";
                } catch (e) {}
            }
        }
        stopSubtitleMirroring() {
            if (this._playerClassObserver) {
                this._playerClassObserver.disconnect();
                this._playerClassObserver = null;
            }
            if (this._pointerInactiveTimer) {
                clearTimeout(this._pointerInactiveTimer);
                this._pointerInactiveTimer = null;
            }
            this._isPointerActive = false;
            if (this._subObserver) {
                this._subObserver.disconnect();
                this._subObserver = null;
            }
            if (this._subPollInterval) {
                clearInterval(this._subPollInterval);
                this._subPollInterval = null;
            }
            if (this._subRaf) {
                cancelAnimationFrame(this._subRaf);
                this._subRaf = null;
            }
            if (this.video && this.video.textTracks && this._boundCueChange) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    try {
                        this.video.textTracks[i].removeEventListener("cuechange", this._boundCueChange);
                    } catch (e) {}
                }
                try {
                    this.video.textTracks.removeEventListener("change", this._boundCueChange);
                    this.video.textTracks.removeEventListener("addtrack", this._boundCueChange);
                } catch (e) {}
            }
            this._boundCueChange = null;
            this._lastSubtitleText = "";
            this.renderSubtitles("");
        }
        findPlatformSubtitlesButton() {
            if (!this.video) return null;
            const selectors = [ ".ytp-subtitles-button", 'ytd-video-preview [aria-label*="caption" i]', 'ytd-video-preview [aria-label*="subtitle" i]', "ytd-video-preview button", 'button[aria-label*="caption" i]', 'button[aria-label*="subtitle" i]', 'button[title*="caption" i]', 'button[title*="subtitle" i]', '[aria-label*="closed caption" i]', '[aria-label*="cc" i]', ".vjs-subs-caps-button", '[data-plyr="captions"]', ".jw-icon-cc" ];
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player") : this.video ? this.video.parentElement : null;
                if (player && typeof player.querySelector === "function") {
                    for (const sel of selectors) {
                        try {
                            const btn = player.querySelector(sel);
                            if (btn) return btn;
                        } catch (e) {}
                    }
                }
                if (window.location.hostname.includes("youtube.com")) {
                    try {
                        const ytBtn = document.querySelector('.ytp-subtitles-button, ytd-video-preview button[aria-label*="caption" i]');
                        if (ytBtn) return ytBtn;
                    } catch (e) {}
                }
            } catch (err) {}
            return null;
        }
        hasSubtitles() {
            if (!this.video) return false;
            if (this._lastSubtitleText && this._lastSubtitleText.trim().length > 0) {
                return true;
            }
            const platformBtn = this.findPlatformSubtitlesButton();
            if (platformBtn) {
                return true;
            }
            if (this.video.textTracks && this.video.textTracks.length > 0) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    const track = this.video.textTracks[i];
                    if (track && (track.kind === "subtitles" || track.kind === "captions" || !track.kind)) {
                        return true;
                    }
                }
            }
            try {
                const tracks = this.video.querySelectorAll ? this.video.querySelectorAll("track") : [];
                if (tracks.length > 0) {
                    for (let i = 0; i < tracks.length; i++) {
                        const kind = (tracks[i].getAttribute("kind") || "subtitles").toLowerCase();
                        if (kind === "subtitles" || kind === "captions") return true;
                    }
                }
            } catch (e) {}
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player") : this.video ? this.video.parentElement : null;
                if (player && typeof player.querySelector === "function") {
                    const captionEl = player.querySelector(".ytp-caption-window-container, .caption-window, .vjs-text-track-display, .plyr__captions, .jw-captions");
                    if (captionEl && (captionEl.children.length > 0 || captionEl.textContent && captionEl.textContent.trim().length > 0)) {
                        return true;
                    }
                }
            } catch (e) {}
            return false;
        }
        isSubtitlesActive() {
            if (this._userSubtitlesExplicitlyDisabled) return false;
            if (this._userSubtitlesExplicitlyEnabled) return true;
            const platformBtn = this.findPlatformSubtitlesButton();
            if (platformBtn) {
                if (platformBtn.hasAttribute("aria-pressed")) {
                    return platformBtn.getAttribute("aria-pressed") === "true";
                }
                if (platformBtn.classList.contains("vjs-active") || platformBtn.classList.contains("active") || platformBtn.classList.contains("plyr__control--pressed")) {
                    return true;
                }
            }
            if (this.video && this.video.textTracks && this.video.textTracks.length > 0) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    if (this.video.textTracks[i].mode === "showing") return true;
                }
            }
            if (this.subtitlesOverlay && !this.subtitlesOverlay.classList.contains("empty") && this.subtitlesOverlay.style.display !== "none") {
                return true;
            }
            return false;
        }
        canFindSubtitlesOnRegularPlayer() {
            if (!this.video) return false;
            if (this._userSubtitlesExplicitlyDisabled) return false;
            if (this._userSubtitlesExplicitlyEnabled) return true;
            const isFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (isFs && this._subtitlesActiveOnRegularPlayer !== void 0) {
                return !!this._subtitlesActiveOnRegularPlayer;
            }
            const platformBtn = this.findPlatformSubtitlesButton();
            if (platformBtn) {
                if (platformBtn.getAttribute("aria-pressed") === "true" || platformBtn.getAttribute("aria-checked") === "true") {
                    return true;
                }
                if (platformBtn.classList.contains("vjs-active") || platformBtn.classList.contains("active") || platformBtn.classList.contains("plyr__control--pressed")) {
                    return true;
                }
            }
            if (this.video.textTracks && this.video.textTracks.length > 0) {
                for (let i = 0; i < this.video.textTracks.length; i++) {
                    const trk = this.video.textTracks[i];
                    if (trk && (trk.kind === "subtitles" || trk.kind === "captions" || !trk.kind)) {
                        if (trk.mode === "showing") return true;
                        if (trk.cues && trk.cues.length > 0 && !this._userSubtitlesExplicitlyDisabled) return true;
                    }
                }
            }
            try {
                const tracks = this.video.querySelectorAll ? this.video.querySelectorAll("track") : [];
                if (tracks.length > 0) {
                    for (let i = 0; i < tracks.length; i++) {
                        const kind = (tracks[i].getAttribute("kind") || "subtitles").toLowerCase();
                        if (kind === "subtitles" || kind === "captions") {
                            if (tracks[i].hasAttribute("default") || tracks[i].track && tracks[i].track.mode === "showing") return true;
                        }
                    }
                }
            } catch (e) {}
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player") : this.video ? this.video.parentElement : null;
                if (player && typeof player.querySelector === "function") {
                    const captionEl = player.querySelector(".ytp-caption-window-container, .caption-window, .vjs-text-track-display, .plyr__captions, .jw-captions");
                    if (captionEl && (captionEl.children.length > 0 || captionEl.textContent && captionEl.textContent.trim().length > 0)) {
                        return true;
                    }
                }
            } catch (e) {}
            if (this.cbarCcBtn && this.cbarCcBtn.classList.contains("is-active")) {
                return true;
            }
            return false;
        }
        canFindSubtitlesInFullscreen() {
            if (!this.video) return false;
            const isForcedFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isNativeFs = !!(fsEl && (typeof isVideoInFullscreen === "function" ? isVideoInFullscreen(this.video, fsEl) : fsEl === this.video || fsEl.contains && fsEl.contains(this.video)));
            if (!isForcedFs && !isNativeFs) return false;
            if (isNativeFs && !isForcedFs) {
                const platformBtn = this.findPlatformSubtitlesButton();
                if (platformBtn) {
                    const isPressed = platformBtn.getAttribute("aria-pressed") === "true" || platformBtn.getAttribute("aria-checked") === "true" || platformBtn.classList.contains("ytp-button-active") || platformBtn.classList.contains("vjs-active") || platformBtn.classList.contains("active");
                    if (isPressed) return true;
                }
                const player2 = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, .video-card") : this.video ? this.video.parentElement : null;
                const searchRoots = [];
                if (this._fsPlayerContainer && this._fsPlayerContainer.isConnected) searchRoots.push(this._fsPlayerContainer);
                if (player2 && player2.isConnected && !searchRoots.includes(player2)) searchRoots.push(player2);
                if (fsEl && !searchRoots.includes(fsEl)) searchRoots.push(fsEl);
                if (!searchRoots.includes(document)) searchRoots.push(document);
                const captionSelectors = [ ".ytp-caption-window-container", ".caption-window", ".vjs-text-track-display", ".plyr__captions", ".jw-captions", ".player-captions-container", '[class*="caption-window"]', '[class*="captions-display"]', '[class*="subtitle-display"]' ];
                for (const root of searchRoots) {
                    if (!root || typeof root.querySelectorAll !== "function") continue;
                    for (const sel of captionSelectors) {
                        try {
                            const cand = root.querySelector(sel);
                            if (!cand || !cand.isConnected) continue;
                            const style = window.getComputedStyle(cand);
                            if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") continue;
                            if (parseFloat(style.opacity || "1") === 0) continue;
                            if (cand.children.length > 0 || cand.textContent && cand.textContent.trim().length > 0) {
                                return true;
                            }
                        } catch (e) {}
                    }
                }
                if (this.video.textTracks && this.video.textTracks.length > 0) {
                    for (let i = 0; i < this.video.textTracks.length; i++) {
                        if (this.video.textTracks[i].mode === "showing") return true;
                    }
                }
                return false;
            }
            const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player, .video-card") : this.video ? this.video.parentElement : null;
            if (player) {
                const captionSelectors = [ ".ytp-caption-window-container", ".caption-window", ".vjs-text-track-display", ".plyr__captions", ".jw-captions", ".player-captions-container" ];
                for (const sel of captionSelectors) {
                    try {
                        const cand = player.querySelector(sel);
                        if (!cand || !cand.isConnected) continue;
                        if (cand.classList.contains("gvc-page-fullscreen-suppressed") || cand.closest && cand.closest(".gvc-page-fullscreen-suppressed")) continue;
                        const style = window.getComputedStyle(cand);
                        if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse") continue;
                        if (parseFloat(style.opacity || "1") === 0) continue;
                        if (cand.children.length > 0 || cand.textContent && cand.textContent.trim().length > 0) {
                            return true;
                        }
                    } catch (e) {}
                }
            }
            return false;
        }
        shouldAutoReplaceSubtitlesInFullscreen() {
            const isFs = !!(this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            if (!isFs) return false;
            if (this._userSubtitlesExplicitlyDisabled) return false;
            if (currentConfig.subtitleStyles && currentConfig.subtitleStyles.replaceSubtitles) {
                return true;
            }
            if (window.__TEST_BENCH__ || window.location && (window.location.pathname.includes("test.html") || window.location.pathname.includes("settings.html"))) {
                return true;
            }
            const canFindOnRegular = this.canFindSubtitlesOnRegularPlayer();
            if (!canFindOnRegular) return false;
            const canFindOnFs = this.canFindSubtitlesInFullscreen();
            if (canFindOnFs) return false;
            return true;
        }
        updateSubtitlesButtonState() {
            if (!this._isPageFullscreen && !(this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"))) {
                try {
                    this._subtitlesActiveOnRegularPlayer = this.canFindSubtitlesOnRegularPlayer();
                } catch (e) {}
            }
            if (!this.cbarCcBtn) return;
            const hasSubs = this.hasSubtitles();
            if (!hasSubs) {
                this.cbarCcBtn.style.display = "none";
                if (this.cbarCcSettingsBtn) this.cbarCcSettingsBtn.style.display = "none";
                if (this.isSubtitlesSettingsOpen) this.setSubtitlesSettingsOpen(false);
                return;
            }
            this.cbarCcBtn.style.display = "flex";
            if (this.cbarCcSettingsBtn) this.cbarCcSettingsBtn.style.display = "flex";
            const isActive = this.isSubtitlesActive();
            this.cbarCcBtn.classList.toggle("is-active", isActive);
            this.cbarCcBtn.title = isActive ? "Disable Subtitles (CC)" : "Enable Subtitles (CC)";
            if (isActive && currentConfig.subtitleStyles && currentConfig.subtitleStyles.replaceSubtitles && !this._userSubtitlesExplicitlyDisabled && !this._subPollInterval) {
                this.startSubtitleMirroring();
            }
        }
        toggleSubtitlesSettings() {
            if (!this.subtitlesSettingsPopup) {
                this.buildSubtitlesSettingsPopup();
            }
            this.setSubtitlesSettingsOpen(!this.isSubtitlesSettingsOpen);
        }
        setSubtitlesSettingsOpen(open) {
            this.isSubtitlesSettingsOpen = !!open;
            if (!this.subtitlesSettingsPopup) return;
            if (this.isSubtitlesSettingsOpen) {
                this.closeAllOverlays();
                this.isSubtitlesSettingsOpen = true;
                this.clearControlsBarAutoHide();
                this.subtitlesSettingsPopup.classList.remove("collapsed");
                if (this.cbarCcSettingsBtn) this.cbarCcSettingsBtn.classList.add("is-open");
                this.updateSubtitlesPopupPosition();
                this.syncSubtitleSettingsUI();
                this.applySubtitleStyles();
            } else {
                this.subtitlesSettingsPopup.classList.add("collapsed");
                if (this.cbarCcSettingsBtn) this.cbarCcSettingsBtn.classList.remove("is-open");
                if (currentConfig.autoHideButtons !== false && !this._isScrubbing) {
                    this.scheduleControlsBarAutoHide();
                }
            }
        }
        buildSubtitlesSettingsPopup() {
            if (this.subtitlesSettingsPopup) return;
            this.subtitlesSettingsPopup = document.createElement("div");
            this.subtitlesSettingsPopup.className = "omni-subtitles-settings-popup collapsed";
            const isFs = !!(this.controlsBar && this.controlsBar.classList.contains("is-fullscreen"));
            if (isFs) this.subtitlesSettingsPopup.classList.add("is-fullscreen");
            if (currentConfig.glowEnabled === false) this.subtitlesSettingsPopup.classList.add("no-glow");
            this.subtitlesSettingsPopup.innerHTML = `\n        <div class="omni-sub-settings-header">\n          <div class="omni-sub-settings-title">\n            <span class="omni-sub-settings-icon">${ICONS.subtitlesSettings}</span>\n            <span>Subtitle Settings</span>\n          </div>\n          <button type="button" class="omni-sub-settings-close" title="Close (Esc)">✕</button>\n        </div>\n        \n        <div class="omni-sub-preview-area">\n          <div class="omni-sub-preview-line">Sample Subtitles • Aperçu</div>\n        </div>\n\n        <div class="omni-sub-settings-body">\n          <div class="omni-sub-setting-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Font Size</span>\n              <span class="omni-sub-value" data-val="fontSize">100%</span>\n            </div>\n            <input type="range" class="omni-sub-slider" data-key="fontSize" min="50" max="200" step="5" value="100" />\n          </div>\n\n          <div class="omni-sub-setting-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Subtitle Color</span>\n            </div>\n            <div class="omni-sub-swatch-row" data-key="textColor">\n              <button type="button" class="omni-sub-swatch" data-color="#ffffff" style="background:#ffffff;" title="White"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#fef08a" style="background:#fef08a;" title="Yellow"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#38bdf8" style="background:#38bdf8;" title="Cyan"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#4ade80" style="background:#4ade80;" title="Green"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#f472b6" style="background:#f472b6;" title="Pink"></button>\n              <label class="omni-sub-custom-color" title="Custom Subtitle Color">\n                <input type="color" class="omni-sub-color-input" data-key="textColor" value="#ffffff" />\n                <svg class="omni-sub-custom-color-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">\n                  <path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.13-3.13a1 1 0 0 0 0-1.41zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/>\n                </svg>\n              </label>\n            </div>\n          </div>\n\n          <div class="omni-sub-setting-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Subtitle Opacity</span>\n              <span class="omni-sub-value" data-val="textOpacity">100%</span>\n            </div>\n            <input type="range" class="omni-sub-slider" data-key="textOpacity" min="15" max="100" step="5" value="100" />\n          </div>\n\n          <div class="omni-sub-setting-row omni-sub-remove-bg-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label" style="font-weight:600; color:#f8fafc;">Remove Background</span>\n              <label class="omni-sub-toggle-switch" title="Remove background box behind subtitles">\n                <input type="checkbox" class="omni-sub-remove-bg-toggle" checked />\n                <span class="omni-sub-toggle-slider"></span>\n              </label>\n            </div>\n          </div>\n\n          <div class="omni-sub-setting-row" data-row="bgColor">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Background Color</span>\n            </div>\n            <div class="omni-sub-swatch-row" data-key="bgColor">\n              <button type="button" class="omni-sub-swatch" data-color="#08090f" style="background:#08090f;" title="Dark Slate"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#000000" style="background:#000000;" title="Black"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#0f172a" style="background:#0f172a;" title="Navy"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#1e293b" style="background:#1e293b;" title="Charcoal"></button>\n              <button type="button" class="omni-sub-swatch" data-color="#450a0a" style="background:#450a0a;" title="Burgundy"></button>\n              <label class="omni-sub-custom-color" title="Custom Background Color">\n                <input type="color" class="omni-sub-color-input" data-key="bgColor" value="#08090f" />\n                <svg class="omni-sub-custom-color-icon" viewBox="0 0 24 24" width="12" height="12" fill="currentColor">\n                  <path d="M20.71 5.63l-2.34-2.34a1 1 0 0 0-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.13-3.13a1 1 0 0 0 0-1.41zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/>\n                </svg>\n              </label>\n            </div>\n          </div>\n\n          <div class="omni-sub-setting-row" data-row="bgOpacity">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Background Opacity</span>\n              <span class="omni-sub-value" data-val="bgOpacity">82%</span>\n            </div>\n            <input type="range" class="omni-sub-slider" data-key="bgOpacity" min="0" max="100" step="5" value="82" />\n          </div>\n\n          <div class="omni-sub-setting-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label">Vertical Position</span>\n              <span class="omni-sub-value" data-val="bottomOffset">Default</span>\n            </div>\n            <input type="range" class="omni-sub-slider" data-key="bottomOffset" min="-20" max="240" step="5" value="0" />\n          </div>\n\n          <div class="omni-sub-setting-row omni-sub-replace-row">\n            <div class="omni-sub-label-row">\n              <span class="omni-sub-label" style="font-weight:600; color:#f8fafc;">Replace Subtitles</span>\n              <label class="omni-sub-toggle-switch" title="Replace native website subtitles with custom subtitles">\n                <input type="checkbox" class="omni-sub-replace-toggle" />\n                <span class="omni-sub-toggle-slider"></span>\n              </label>\n            </div>\n            <span class="omni-sub-hint">Use custom subtitles instead of native player captions</span>\n          </div>\n        </div>\n\n        <div class="omni-sub-settings-footer">\n          <button type="button" class="omni-sub-reset-btn">Reset to Defaults</button>\n        </div>\n      `;
            this.shadow.appendChild(this.subtitlesSettingsPopup);
            this.bindSubtitlesSettingsEvents();
            this.syncSubtitleSettingsUI();
        }
        bindSubtitlesSettingsEvents() {
            if (!this.subtitlesSettingsPopup) return;
            this.subtitlesSettingsPopup.addEventListener("click", e => e.stopPropagation());
            this.subtitlesSettingsPopup.addEventListener("mousedown", e => e.stopPropagation());
            this.subtitlesSettingsPopup.addEventListener("pointerdown", e => e.stopPropagation());
            this.subtitlesSettingsPopup.addEventListener("pointerenter", () => {
                this.isSubtitlesSettingsHovered = true;
            });
            this.subtitlesSettingsPopup.addEventListener("pointerleave", () => {
                this.isSubtitlesSettingsHovered = false;
            });
            const closeBtn = this.subtitlesSettingsPopup.querySelector(".omni-sub-settings-close");
            if (closeBtn) {
                closeBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    this.setSubtitlesSettingsOpen(false);
                });
            }
            const removeBgToggle = this.subtitlesSettingsPopup.querySelector(".omni-sub-remove-bg-toggle");
            if (removeBgToggle) {
                removeBgToggle.addEventListener("change", e => {
                    e.stopPropagation();
                    currentConfig.subtitleStyles.removeBg = !!e.target.checked;
                    currentConfig.subtitleStyles._removeBgExplicit = true;
                    this.syncSubtitleSettingsUI();
                    this.applySubtitleStyles();
                    broadcastSubtitleStyles(currentConfig.subtitleStyles);
                    this.saveSubtitleStylesDebounced();
                    this.showHUD(e.target.checked ? "Subtitle Background: Removed" : "Subtitle Background: Enabled");
                });
            }
            const replaceToggle = this.subtitlesSettingsPopup.querySelector(".omni-sub-replace-toggle");
            if (replaceToggle) {
                replaceToggle.addEventListener("change", e => {
                    e.stopPropagation();
                    currentConfig.subtitleStyles.replaceSubtitles = !!e.target.checked;
                    updateNativeSubtitleVisibility();
                    broadcastSubtitleStyles(currentConfig.subtitleStyles);
                    this.saveSubtitleStylesDebounced();
                    this.showHUD(e.target.checked ? "Replace Subtitles: On" : "Replace Subtitles: Off");
                });
            }
            const sliders = this.subtitlesSettingsPopup.querySelectorAll(".omni-sub-slider");
            sliders.forEach(slider => {
                slider.addEventListener("input", e => {
                    const key = slider.dataset.key;
                    const rawVal = parseFloat(e.target.value);
                    if (key === "fontSize") {
                        currentConfig.subtitleStyles.fontSize = Math.round(rawVal);
                    } else if (key === "textOpacity") {
                        currentConfig.subtitleStyles.textOpacity = Math.round(rawVal) / 100;
                    } else if (key === "bgOpacity") {
                        currentConfig.subtitleStyles.bgOpacity = Math.round(rawVal) / 100;
                    } else if (key === "bottomOffset") {
                        currentConfig.subtitleStyles.bottomOffset = Math.round(rawVal);
                    }
                    this.syncSubtitleSettingsUI();
                    this.applySubtitleStyles();
                    broadcastSubtitleStyles(currentConfig.subtitleStyles);
                    this.saveSubtitleStylesDebounced();
                });
            });
            const swatchRows = this.subtitlesSettingsPopup.querySelectorAll(".omni-sub-swatch-row");
            swatchRows.forEach(row => {
                const key = row.dataset.key;
                row.querySelectorAll(".omni-sub-swatch").forEach(swatch => {
                    swatch.addEventListener("click", e => {
                        e.stopPropagation();
                        const color = swatch.dataset.color;
                        if (key === "textColor") {
                            currentConfig.subtitleStyles.textColor = color;
                        } else if (key === "bgColor") {
                            currentConfig.subtitleStyles.bgColor = color;
                        }
                        this.syncSubtitleSettingsUI();
                        this.applySubtitleStyles();
                        broadcastSubtitleStyles(currentConfig.subtitleStyles);
                        this.saveSubtitleStylesDebounced();
                    });
                });
                const colorInput = row.querySelector(".omni-sub-color-input");
                if (colorInput) {
                    colorInput.addEventListener("input", e => {
                        const color = e.target.value;
                        if (key === "textColor") {
                            currentConfig.subtitleStyles.textColor = color;
                        } else if (key === "bgColor") {
                            currentConfig.subtitleStyles.bgColor = color;
                        }
                        this.syncSubtitleSettingsUI();
                        this.applySubtitleStyles();
                        broadcastSubtitleStyles(currentConfig.subtitleStyles);
                        this.saveSubtitleStylesDebounced();
                    });
                }
            });
            const resetBtn = this.subtitlesSettingsPopup.querySelector(".omni-sub-reset-btn");
            if (resetBtn) {
                resetBtn.addEventListener("click", e => {
                    e.stopPropagation();
                    currentConfig.subtitleStyles = Object.assign({}, DEFAULT_SUBTITLE_STYLES);
                    this.syncSubtitleSettingsUI();
                    this.applySubtitleStyles();
                    broadcastSubtitleStyles(currentConfig.subtitleStyles);
                    this.saveSubtitleStylesDebounced();
                });
            }
            if (!this._boundSubSettingsOutsideClick) {
                this._boundSubSettingsOutsideClick = e => {
                    if (!this.isSubtitlesSettingsOpen) return;
                    const path = e.composedPath ? e.composedPath() : [];
                    if (this.subtitlesSettingsPopup && path.includes(this.subtitlesSettingsPopup)) return;
                    if (this.cbarCcSettingsBtn && path.includes(this.cbarCcSettingsBtn)) return;
                    this.setSubtitlesSettingsOpen(false);
                };
                document.addEventListener("pointerdown", this._boundSubSettingsOutsideClick, true);
            }
            if (!this._boundSubSettingsKeyDown) {
                this._boundSubSettingsKeyDown = e => {
                    if (e.key === "Escape" && this.isSubtitlesSettingsOpen) {
                        e.stopPropagation();
                        this.setSubtitlesSettingsOpen(false);
                    }
                };
                document.addEventListener("keydown", this._boundSubSettingsKeyDown, true);
            }
        }
        saveSubtitleStylesDebounced() {
            if (this._saveSubtitleTimer) clearTimeout(this._saveSubtitleTimer);
            this._saveSubtitleTimer = setTimeout(() => {
                saveSubtitleStylesConfig();
            }, 350);
        }
        syncSubtitleSettingsUI() {
            if (!this.subtitlesSettingsPopup) return;
            const s = Object.assign({}, DEFAULT_SUBTITLE_STYLES, currentConfig.subtitleStyles);
            const replaceToggle = this.subtitlesSettingsPopup.querySelector(".omni-sub-replace-toggle");
            if (replaceToggle) {
                replaceToggle.checked = !!s.replaceSubtitles;
            }
            const fontSlider = this.subtitlesSettingsPopup.querySelector('.omni-sub-slider[data-key="fontSize"]');
            const fontVal = this.subtitlesSettingsPopup.querySelector('.omni-sub-value[data-val="fontSize"]');
            const fontPercent = typeof s.fontSize === "number" && s.fontSize >= 50 && s.fontSize <= 200 ? Math.round(s.fontSize) : 100;
            if (fontSlider) fontSlider.value = fontPercent;
            if (fontVal) fontVal.textContent = `${fontPercent}%`;
            const textSwatches = this.subtitlesSettingsPopup.querySelectorAll('.omni-sub-swatch-row[data-key="textColor"] .omni-sub-swatch');
            let matchedText = false;
            textSwatches.forEach(sw => {
                const isMatch = (sw.getAttribute("data-color") || "").toLowerCase() === (s.textColor || "#ffffff").toLowerCase();
                sw.classList.toggle("is-selected", isMatch);
                if (isMatch) matchedText = true;
            });
            const textColorCustom = this.subtitlesSettingsPopup.querySelector('.omni-sub-swatch-row[data-key="textColor"] .omni-sub-custom-color');
            const textColorInput = this.subtitlesSettingsPopup.querySelector('.omni-sub-color-input[data-key="textColor"]');
            if (textColorInput) textColorInput.value = s.textColor || "#ffffff";
            if (textColorCustom) {
                textColorCustom.classList.toggle("is-selected", !matchedText);
                textColorCustom.style.color = !matchedText && s.textColor ? s.textColor : "";
            }
            const textOpSlider = this.subtitlesSettingsPopup.querySelector('.omni-sub-slider[data-key="textOpacity"]');
            const textOpVal = this.subtitlesSettingsPopup.querySelector('.omni-sub-value[data-val="textOpacity"]');
            const textOpPct = Math.round((s.textOpacity !== void 0 ? s.textOpacity : 1) * 100);
            if (textOpSlider) textOpSlider.value = textOpPct;
            if (textOpVal) textOpVal.textContent = `${textOpPct}%`;
            const isBgRemoved = s.removeBg !== void 0 ? !!s.removeBg : true;
            const removeBgToggle = this.subtitlesSettingsPopup.querySelector(".omni-sub-remove-bg-toggle");
            if (removeBgToggle) {
                removeBgToggle.checked = isBgRemoved;
            }
            const bgColorRow = this.subtitlesSettingsPopup.querySelector('.omni-sub-setting-row[data-row="bgColor"]');
            const bgOpacityRow = this.subtitlesSettingsPopup.querySelector('.omni-sub-setting-row[data-row="bgOpacity"]');
            const bgOpacitySlider = this.subtitlesSettingsPopup.querySelector('.omni-sub-slider[data-key="bgOpacity"]');
            if (bgColorRow) bgColorRow.classList.toggle("is-disabled", isBgRemoved);
            if (bgOpacityRow) bgOpacityRow.classList.toggle("is-disabled", isBgRemoved);
            if (bgOpacitySlider) bgOpacitySlider.disabled = isBgRemoved;
            const bgSwatches = this.subtitlesSettingsPopup.querySelectorAll('.omni-sub-swatch-row[data-key="bgColor"] .omni-sub-swatch');
            let matchedBg = false;
            bgSwatches.forEach(sw => {
                const isMatch = (sw.getAttribute("data-color") || "").toLowerCase() === (s.bgColor || "#08090f").toLowerCase();
                sw.classList.toggle("is-selected", isMatch);
                if (isMatch) matchedBg = true;
            });
            const bgColorCustom = this.subtitlesSettingsPopup.querySelector('.omni-sub-swatch-row[data-key="bgColor"] .omni-sub-custom-color');
            const bgColorInput = this.subtitlesSettingsPopup.querySelector('.omni-sub-color-input[data-key="bgColor"]');
            if (bgColorInput) bgColorInput.value = s.bgColor || "#08090f";
            if (bgColorCustom) {
                bgColorCustom.classList.toggle("is-selected", !matchedBg);
                bgColorCustom.style.color = !matchedBg && s.bgColor ? s.bgColor : "";
            }
            const bgOpSlider = this.subtitlesSettingsPopup.querySelector('.omni-sub-slider[data-key="bgOpacity"]');
            const bgOpVal = this.subtitlesSettingsPopup.querySelector('.omni-sub-value[data-val="bgOpacity"]');
            const bgOpPct = Math.round((s.bgOpacity !== void 0 ? s.bgOpacity : .82) * 100);
            if (bgOpSlider) bgOpSlider.value = bgOpPct;
            if (bgOpVal) bgOpVal.textContent = `${bgOpPct}%`;
            const posSlider = this.subtitlesSettingsPopup.querySelector('.omni-sub-slider[data-key="bottomOffset"]');
            const posVal = this.subtitlesSettingsPopup.querySelector('.omni-sub-value[data-val="bottomOffset"]');
            if (posSlider) posSlider.value = s.bottomOffset || 0;
            if (posVal) {
                const off = s.bottomOffset || 0;
                posVal.textContent = off === 0 ? "Default" : off > 0 ? `+${off}px` : `${off}px`;
            }
            this.updateSubtitlePreviewLine();
        }
        updateSubtitlePreviewLine() {
            if (!this.subtitlesSettingsPopup) return;
            const previewLine = this.subtitlesSettingsPopup.querySelector(".omni-sub-preview-line");
            if (!previewLine) return;
            const s = Object.assign({}, DEFAULT_SUBTITLE_STYLES, currentConfig.subtitleStyles);
            const textRgba = hexToRgba(s.textColor || "#ffffff", s.textOpacity !== void 0 ? s.textOpacity : 1);
            const bgRgba = s.removeBg ? "transparent" : hexToRgba(s.bgColor || "#08090f", s.bgOpacity !== void 0 ? s.bgOpacity : .82);
            const shadowVal = "0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px #000000";
            const fontPercent = typeof s.fontSize === "number" && s.fontSize >= 50 && s.fontSize <= 200 ? Math.round(s.fontSize) : 100;
            const scale = fontPercent / 100;
            previewLine.style.fontSize = `${Math.round(18 * scale)}px`;
            previewLine.style.color = textRgba;
            previewLine.style.backgroundColor = bgRgba;
            previewLine.style.textShadow = shadowVal;
            previewLine.classList.toggle("no-bg", !!s.removeBg);
        }
        applySubtitleStyles(styles = currentConfig.subtitleStyles) {
            if (!this.subtitlesOverlay) return;
            const s = Object.assign({}, DEFAULT_SUBTITLE_STYLES, styles);
            const textRgba = hexToRgba(s.textColor || "#ffffff", s.textOpacity !== void 0 ? s.textOpacity : 1);
            const bgRgba = s.removeBg ? "transparent" : hexToRgba(s.bgColor || "#08090f", s.bgOpacity !== void 0 ? s.bgOpacity : .82);
            const shadowVal = "0 1px 3px rgba(0, 0, 0, 0.9), 0 0 2px #000000";
            const fontPercent = typeof s.fontSize === "number" && s.fontSize >= 50 && s.fontSize <= 200 ? Math.round(s.fontSize) : 100;
            const scale = fontPercent / 100;
            this.subtitlesOverlay.style.setProperty("--sub-font-size", `calc(clamp(16px, 2.2vw, 26px) * ${scale})`);
            this.subtitlesOverlay.style.setProperty("--sub-text-color", textRgba);
            this.subtitlesOverlay.style.setProperty("--sub-bg-color", bgRgba);
            this.subtitlesOverlay.style.setProperty("--sub-text-shadow", shadowVal);
            this.subtitlesOverlay.style.setProperty("--sub-bottom-offset", `${s.bottomOffset || 0}px`);
            this.subtitlesOverlay.classList.toggle("no-bg", !!s.removeBg);
        }
        toggleSubtitles() {
            const isCurrentlyActive = this.isSubtitlesActive();
            const newState = !isCurrentlyActive;
            this.setSubtitlesEnabled(newState);
        }
        setSubtitlesEnabled(enable) {
            this._userSubtitlesExplicitlyDisabled = !enable;
            this._userSubtitlesExplicitlyEnabled = enable;
            const platformBtn = this.findPlatformSubtitlesButton();
            if (platformBtn) {
                const isPlatformOn = platformBtn.getAttribute("aria-pressed") === "true" || platformBtn.classList.contains("vjs-active") || platformBtn.classList.contains("active") || platformBtn.classList.contains("plyr__control--pressed");
                if (enable && !isPlatformOn || !enable && isPlatformOn) {
                    try {
                        platformBtn.click();
                    } catch (e) {}
                }
            }
            try {
                const player = this.video && typeof this.video.closest === "function" ? this.video.closest(".html5-video-player, ytd-video-preview, [data-player], .player-container, .video-js, .jwplayer, .plyr, .vimeo-player, shreddit-player") : (this.video ? this.video.parentElement : null) || document;
                if (player && typeof player.querySelectorAll === "function") {
                    const captionEls = player.querySelectorAll(".ytp-caption-window-container, .caption-window, .vjs-text-track-display, .plyr__captions, .jw-captions");
                    captionEls.forEach(el => {
                        if (!enable) {
                            el.style.setProperty("display", "none", "important");
                        } else {
                            el.style.removeProperty("display");
                        }
                    });
                }
            } catch (e) {}
            if (this.video && this.video.textTracks && this.video.textTracks.length > 0) {
                if (!enable) {
                    this._savedShowingTrackIndices = [];
                    for (let i = 0; i < this.video.textTracks.length; i++) {
                        const track = this.video.textTracks[i];
                        if (track.mode === "showing") {
                            this._savedShowingTrackIndices.push(i);
                            try {
                                track.mode = "hidden";
                            } catch (e) {}
                        }
                    }
                } else {
                    let restored = false;
                    if (Array.isArray(this._savedShowingTrackIndices) && this._savedShowingTrackIndices.length > 0) {
                        this._savedShowingTrackIndices.forEach(idx => {
                            const track = this.video.textTracks[idx];
                            if (track) {
                                try {
                                    track.mode = "showing";
                                    restored = true;
                                } catch (e) {}
                            }
                        });
                    }
                    if (!restored && this.video.textTracks.length > 0) {
                        try {
                            this.video.textTracks[0].mode = "showing";
                        } catch (e) {}
                    }
                }
            }
            if (this.subtitlesOverlay) {
                if (!enable) {
                    this.subtitlesOverlay.classList.add("disabled-by-user");
                    this.subtitlesOverlay.style.display = "none";
                    this.subtitlesOverlay.textContent = "";
                    this._lastSubtitleText = "";
                } else {
                    this.subtitlesOverlay.classList.remove("disabled-by-user");
                    this.subtitlesOverlay.style.display = "";
                    this.checkSubtitles();
                }
            }
            this.updateSubtitlesButtonState();
            updateNativeSubtitleVisibility();
            this.showHUD(enable ? "Subtitles: On" : "Subtitles: Off");
        }
        nextVideo() {
            triggerUniversalNextVideo(this.video, this);
        }
        previousVideo() {
            triggerUniversalPrevVideo(this.video, this);
        }
        onRateChange() {
            if (this._isApplyingSpeed) return;
            if (!this.video) return;
            if (clickHoldState && clickHoldState.isHolding && clickHoldState.controller === this) {
                if (Math.abs(this.video.playbackRate - clickHoldState.targetSpeed) > .01) {
                    this.setSpeed(clickHoldState.targetSpeed, false, false, false);
                    return;
                }
            }
            if (spaceHoldState && spaceHoldState.isHolding2x && spaceHoldState.controller === this) {
                const targetHoldSpeed = currentConfig.holdSpaceSpeed !== void 0 ? Number(currentConfig.holdSpaceSpeed) || 2 : 2;
                if (Math.abs(this.video.playbackRate - targetHoldSpeed) > .01) {
                    this.setSpeed(targetHoldSpeed, false, false, false);
                    return;
                }
            }
            this.updateState();
        }
        onVolumeChange() {
            if (this._isInternalMuteChange || this._isApplyingVolume) {
                this.updateState();
                return;
            }
            if (!this.video) return;
            if (this.video.volume < 1) {
                this.effectiveVolume = this.video.volume;
            } else if (this.effectiveVolume === void 0 || this.effectiveVolume <= 1) {
                this.effectiveVolume = this.video.volume;
            }
            const graph = audioGraphMap.get(this.video);
            if (graph && graph.gainNode) {
                if (this.video.muted) {
                    graph.gainNode.gain.value = 0;
                } else if (this.effectiveVolume && this.effectiveVolume > 1 && currentConfig.volumeBoostEnabled) {
                    graph.gainNode.gain.value = this.effectiveVolume;
                } else {
                    graph.gainNode.gain.value = 1;
                }
            }
            this.updateState();
        }
        updateHUDPosition() {
            if (!this.hud || !this.hud.classList.contains("active")) return;
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isFs = !!(isVideoInFullscreen(this.video, fsEl) || this._isPageFullscreen || this.video && this.video.classList && this.video.classList.contains("gvc-page-fullscreen-video"));
            const fsRect = isFs && fsEl !== this.video && fsEl !== document.documentElement && this.host && this.host.parentNode === fsEl ? fsEl.getBoundingClientRect() : {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
            const rect = getVisibleVideoRect(this.video) || (this.video ? this.video.getBoundingClientRect() : null);
            const contWidth = fsRect.width || window.innerWidth;
            const contHeight = fsRect.height || window.innerHeight;
            if (!rect || rect.width < 50 || rect.height < 50 || rect.bottom < 10 || rect.top > contHeight - 10) {
                this.hud.style.visibility = "hidden";
                return;
            }
            this.hud.style.visibility = "";
            const vLeft = rect.left - fsRect.left;
            const vTop = rect.top - fsRect.top;
            const vWidth = rect.width;
            const vHeight = rect.height;
            let hudScale = 1;
            if (!isFs && vWidth > 0 && vHeight > 0 && (vWidth < 520 || vHeight < 300)) {
                const ratioW = vWidth / 520;
                const ratioH = vHeight / 300;
                hudScale = Math.max(.62, Math.min(1, Math.min(ratioW, ratioH)));
            }
            this.hud.style.setProperty("--omni-hud-scale", hudScale.toFixed(3));
            let left = Math.round(vLeft + vWidth / 2);
            if (isFs || left < 60 || left > contWidth - 60) {
                left = Math.round(contWidth / 2);
            }
            const topMargin = Math.max(8, Math.round(20 * hudScale));
            const top = isFs ? Math.max(24, Math.round(vTop + 24)) : Math.round(vTop + topMargin);
            this.hud.style.left = `${left}px`;
            this.hud.style.top = `${top}px`;
        }
        showHUD(text, isReverse = false, stopSpin = false) {
            if (currentConfig.showHotkeyHUD === false) {
                if (this.hud) {
                    this.hud.classList.remove("active");
                }
                if (this.hudTimer) {
                    clearTimeout(this.hudTimer);
                    this.hudTimer = null;
                }
                return;
            }
            const hudText = this.hud.querySelector(".hud-text");
            if (hudText) hudText.textContent = text;
            this.hud.classList.add("active");
            this.updateHUDPosition();
            const iconSvg = this.hud.querySelector(".hud-icon svg");
            if (iconSvg) {
                const isHolding = typeof isAnyHoldActive === "function" && isAnyHoldActive();
                const shouldReverse = isReverse || isHolding && (typeof isHoldReversed === "function" ? isHoldReversed() : false);
                this._isHUDAtLimit = !!stopSpin;
                if (isHolding && !stopSpin) {
                    iconSvg.classList.remove("reverse");
                    if (shouldReverse) {
                        iconSvg.classList.add("reverse");
                        this._lastHUDWasReverse = true;
                    } else {
                        this._lastHUDWasReverse = false;
                    }
                    iconSvg.classList.add("is-spinning");
                } else {
                    iconSvg.classList.remove("is-spinning", "reverse", "is-landing");
                    if (!stopSpin) {
                        if (this._hudAngle === void 0) this._hudAngle = 0;
                        this._hudAngle += shouldReverse ? -120 : 120;
                        this._lastHUDWasReverse = shouldReverse;
                        iconSvg.style.transform = `rotate(${this._hudAngle}deg)`;
                    } else {
                        if (this._hudAngle === void 0) this._hudAngle = 0;
                        iconSvg.style.transform = `rotate(${this._hudAngle}deg)`;
                    }
                }
            }
            if (this.hudTimer) {
                clearTimeout(this.hudTimer);
                this.hudTimer = null;
            }
            const keepOnHold = currentConfig.persistentSpeedBoostHUD !== false && isSpeedBoostHoldActive(this);
            if (!keepOnHold) {
                this.hudTimer = setTimeout(() => {
                    this.hud.classList.remove("active");
                    setTimeout(() => {
                        if (!this.hud.classList.contains("active")) {
                            const isStillHolding = typeof isAnyHoldActive === "function" && isAnyHoldActive();
                            if (!isStillHolding && iconSvg) {
                                iconSvg.classList.remove("is-spinning", "reverse");
                                if (this._hudAngle) {
                                    iconSvg.style.transition = "none";
                                    this._hudAngle = (this._hudAngle % 360 + 360) % 360;
                                    iconSvg.style.transform = `rotate(${this._hudAngle}deg)`;
                                    void iconSvg.offsetWidth;
                                    iconSvg.style.transition = "";
                                }
                            }
                        }
                    }, 320);
                }, 1400);
            }
        }
        destroy() {
            this._stopCorruptionWatchdog();
            if (this._boundVideoError && this.video) {
                try {
                    this.video.removeEventListener("error", this._boundVideoError);
                } catch (e) {}
                this._boundVideoError = null;
            }
            if (this._isPageFullscreen) {
                this.exitForcedFullscreen();
            }
            this.stopSubtitleMirroring();
            if (this.video && this.video.textTracks && this._boundTracksChange) {
                try {
                    this.video.textTracks.removeEventListener("addtrack", this._boundTracksChange);
                    this.video.textTracks.removeEventListener("removetrack", this._boundTracksChange);
                    this.video.textTracks.removeEventListener("change", this._boundTracksChange);
                } catch (e) {}
                this._boundTracksChange = null;
            }
            if (this._cleanupScrubEvents) {
                this._cleanupScrubEvents();
                this._cleanupScrubEvents = null;
            }
            if (this._fsRafId) {
                cancelAnimationFrame(this._fsRafId);
                this._fsRafId = null;
            }
            if (activeHoveredCtrl === this) {
                activeHoveredCtrl = null;
            }
            if (lastHoveredCtrl === this) {
                lastHoveredCtrl = null;
            }
            if (this.resizeObserver) this.resizeObserver.disconnect();
            if (this._boundUpdatePosition) {
                window.removeEventListener("scroll", this._boundUpdatePosition, {
                    capture: true
                });
                document.removeEventListener("scroll", this._boundUpdatePosition, {
                    capture: true
                });
                window.removeEventListener("resize", this._boundUpdatePosition);
                if (this.video) {
                    this.video.removeEventListener("resize", this._boundUpdatePosition);
                }
            }
            if (this._boundFullscreenChange) {
                document.removeEventListener("fullscreenchange", this._boundFullscreenChange);
                document.removeEventListener("webkitfullscreenchange", this._boundFullscreenChange);
            }
            if (this._boundOutsideClick) {
                document.removeEventListener("pointerdown", this._boundOutsideClick, true);
                this._boundOutsideClick = null;
            }
            if (this._boundSubSettingsOutsideClick) {
                document.removeEventListener("pointerdown", this._boundSubSettingsOutsideClick, true);
                this._boundSubSettingsOutsideClick = null;
            }
            if (this._boundSubSettingsKeyDown) {
                document.removeEventListener("keydown", this._boundSubSettingsKeyDown, true);
                this._boundSubSettingsKeyDown = null;
            }
            if (this._saveSubtitleTimer) {
                clearTimeout(this._saveSubtitleTimer);
                this._saveSubtitleTimer = null;
            }
            if (this._boundVideoPointerEnter) {
                this.video.removeEventListener("pointerenter", this._boundVideoPointerEnter);
            }
            if (this._boundEndedCapture) {
                this.video.removeEventListener("ended", this._boundEndedCapture, true);
            }
            if (this._boundVideoPointerDown) {
                this.video.removeEventListener("pointerdown", this._boundVideoPointerDown);
            }
            if (this._boundLoadStart) {
                this.video.removeEventListener("loadstart", this._boundLoadStart);
            }
            if (this._boundPlay) {
                this.video.removeEventListener("play", this._boundPlay);
            }
            if (this._boundPlaying) {
                this.video.removeEventListener("playing", this._boundPlaying);
            }
            if (this._boundRateChange) this.video.removeEventListener("ratechange", this._boundRateChange);
            if (this._boundVolumeChange) this.video.removeEventListener("volumechange", this._boundVolumeChange);
            if (this._boundPause) {
                this.video.removeEventListener("pause", this._boundPause);
            }
            if (this._boundSeeking && this.video) {
                this.video.removeEventListener("seeking", this._boundSeeking);
            }
            if (this._boundSeeked && this.video) {
                this.video.removeEventListener("seeked", this._boundSeeked);
            }
            if (this._boundUpdateState) {
                this.video.removeEventListener("play", this._boundUpdateState);
                this.video.removeEventListener("pause", this._boundUpdateState);
            }
            if (this._boundLoadedMetadata) {
                this.video.removeEventListener("loadedmetadata", this._boundLoadedMetadata);
            }
            if (this._boundLoopTimeUpdate) {
                this.video.removeEventListener("timeupdate", this._boundLoopTimeUpdate);
            }
            if (this.loopAttributeObserver) {
                this.loopAttributeObserver.disconnect();
                this.loopAttributeObserver = null;
            }
            if (spaceHoldState && spaceHoldState.controller === this) {
                if (spaceHoldState.timer) clearTimeout(spaceHoldState.timer);
                spaceHoldState = null;
            }
            if (clickHoldState && clickHoldState.controller === this) {
                if (clickHoldState.timer) clearTimeout(clickHoldState.timer);
                clickHoldState = null;
            }
            if (this.autoMinimizeTimer) clearTimeout(this.autoMinimizeTimer);
            if (this.pulseEndTimer) {
                clearTimeout(this.pulseEndTimer);
                this.pulseEndTimer = null;
            }
            if (this.autoHideButtonsTimer) clearTimeout(this.autoHideButtonsTimer);
            if (this.overlaysAutoMinimizeTimer) clearTimeout(this.overlaysAutoMinimizeTimer);
            if (this.loopAutoMinimizeTimer) clearTimeout(this.loopAutoMinimizeTimer);
            if (this.fadeHoverLeaveTimer) clearTimeout(this.fadeHoverLeaveTimer);
            if (this.hudTimer) clearTimeout(this.hudTimer);
            this.clearSubControlsHoverTimers();
            if (this._boundEnterPiP && this.video) {
                this.video.removeEventListener("enterpictureinpicture", this._boundEnterPiP);
            }
            if (this._boundLeavePiP && this.video) {
                this.video.removeEventListener("leavepictureinpicture", this._boundLeavePiP);
            }
            if (this.subtitlesHost && this.subtitlesHost.parentNode) {
                this.subtitlesHost.parentNode.removeChild(this.subtitlesHost);
            }
            if (this.host && this.host.parentNode) {
                this.host.parentNode.removeChild(this.host);
            }
        }
    }
    let reportVideoPresenceTimer = null;
    function reportVideoPresence() {
        if (reportVideoPresenceTimer) clearTimeout(reportVideoPresenceTimer);
        reportVideoPresenceTimer = setTimeout(() => {
            reportVideoPresenceTimer = null;
            if (cleanupIfInvalidated()) return;
            const count = isGloballyPaused || isDomainExcluded() ? 0 : activeControllers.size;
            try {
                if (isExtensionValid()) {
                    chrome.runtime.sendMessage({
                        type: "videoPresence",
                        hasVideo: count > 0,
                        videoCount: count
                    }, () => {
                        if (chrome.runtime && chrome.runtime.lastError) {}
                    });
                }
            } catch (e) {}
        }, 60);
    }
    function isAmbientOrDecorativeVideo(video) {
        if (!video) return false;
        const hostname = window.location.hostname || "";
        if (!hostname.includes("tiktok.com")) return false;
        try {
            if (video.classList && video.classList.contains("xgplayer-dynamicbg")) return true;
            if (video.closest && video.closest(".xgplayer-dynamicbg")) return true;
        } catch (e) {}
        return false;
    }
    function attachToVideo(video) {
        if (cleanupIfInvalidated()) return;
        if (activeControllers.has(video)) return;
        try {
            const ctrl = new VideoController(video);
            if (isAmbientOrDecorativeVideo(video)) {
                ctrl._isAmbientClone = true;
            }
            activeControllers.set(video, ctrl);
            reportVideoPresence();
            const checkRemoval = () => {
                if (!video.isConnected) {
                    if (activeHoveredCtrl === ctrl) activeHoveredCtrl = null;
                    if (lastHoveredCtrl === ctrl) lastHoveredCtrl = null;
                    ctrl.destroy();
                    activeControllers.delete(video);
                    reportVideoPresence();
                }
            };
            video.addEventListener("emptied", checkRemoval);
        } catch (e) {
            cleanupIfInvalidated();
        }
    }
    function cleanupVideo(video) {
        const ctrl = activeControllers.get(video);
        if (ctrl) {
            if (activeHoveredCtrl === ctrl) activeHoveredCtrl = null;
            if (lastHoveredCtrl === ctrl) lastHoveredCtrl = null;
            ctrl.destroy();
            activeControllers.delete(video);
            reportVideoPresence();
        }
    }
    const observedShadowRoots = new WeakSet;
    function observeShadowRoot(shadowRoot) {
        if (!shadowRoot || observedShadowRoots.has(shadowRoot)) return;
        observedShadowRoots.add(shadowRoot);
        try {
            const shadowObs = new MutationObserver(mutations => {
                if (cleanupIfInvalidated()) return;
                if (isGloballyPaused || isDomainExcluded()) return;
                for (const m of mutations) {
                    for (const node of m.removedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            findAllVideos(node).forEach(v => cleanupVideo(v));
                        }
                    }
                    for (const node of m.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            findAllVideos(node).forEach(v => attachToVideo(v));
                        }
                    }
                }
                reportVideoPresence();
            });
            shadowObs.observe(shadowRoot, {
                childList: true,
                subtree: true
            });
        } catch (e) {}
    }
    function findAllVideos(root = document) {
        const results = [];
        if (!root) return results;
        function walk(node) {
            if (!node) return;
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === "VIDEO") {
                    results.push(node);
                }
                if (node.shadowRoot) {
                    observeShadowRoot(node.shadowRoot);
                    walk(node.shadowRoot);
                }
            }
            if (node.children) {
                for (let i = 0; i < node.children.length; i++) {
                    walk(node.children[i]);
                }
            }
        }
        walk(root);
        return results;
    }
    function scanVideos() {
        if (cleanupIfInvalidated()) return;
        if (isGloballyPaused || isDomainExcluded()) {
            reportVideoPresence();
            return;
        }
        const videos = findAllVideos(document);
        videos.forEach(v => attachToVideo(v));
        reportVideoPresence();
    }
    observer = new MutationObserver(mutations => {
        if (cleanupIfInvalidated()) return;
        for (const m of mutations) {
            for (const node of m.removedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    findAllVideos(node).forEach(v => cleanupVideo(v));
                }
            }
            if (isGloballyPaused || isDomainExcluded()) continue;
            for (const node of m.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    findAllVideos(node).forEach(v => attachToVideo(v));
                }
            }
        }
        reportVideoPresence();
    });
    function isElementAssociatedWithVideo(el, video) {
        if (!el || !video) return false;
        if (el === video) return true;
        if (video.contains && video.contains(el)) return true;
        if (el.contains && el.contains(video)) return true;
        const parent = video.parentElement || (video.parentNode && video.parentNode.host ? video.parentNode.host : null);
        if (parent && (el === parent || parent.contains && parent.contains(el))) {
            return true;
        }
        const host = video.getRootNode && video.getRootNode().host ? video.getRootNode().host : null;
        if (host && (el === host || host.contains && host.contains(el))) {
            return true;
        }
        if (video.getRootNode && el.getRootNode && video.getRootNode() === el.getRootNode() && video.getRootNode() !== document) {
            return true;
        }
        const playerContainer = video.closest ? video.closest('#movie_player, .html5-video-player, ytd-player, .vp-video-wrapper, [data-player], .video-card, [role="main"], [data-pagelet*="Reels"], .player, .video-player, .video-container, .preview-container, .thumb-container, .video-wrap, shreddit-player, shreddit-player-2, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : null;
        if (playerContainer && (el === playerContainer || playerContainer.contains && playerContainer.contains(el))) {
            return true;
        }
        try {
            const vRect = video.getBoundingClientRect();
            const eRect = el.getBoundingClientRect();
            if (vRect.width > 20 && vRect.height > 20 && eRect.width > 20 && eRect.height > 20) {
                const overlapX = Math.max(0, Math.min(vRect.right, eRect.right) - Math.max(vRect.left, eRect.left));
                const overlapY = Math.max(0, Math.min(vRect.bottom, eRect.bottom) - Math.max(vRect.top, eRect.top));
                if (overlapX * overlapY > Math.min(vRect.width * vRect.height, eRect.width * eRect.height) * .4) {
                    return true;
                }
            }
        } catch (e) {}
        return false;
    }
    function findControllerUnderPointer(clientX, clientY) {
        if (clientX < 0 || clientY < 0) return null;
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
        if (fsEl || isForcedFs) {
            for (const [video, ctrl] of activeControllers.entries()) {
                if (!video.isConnected) continue;
                if (ctrl && (ctrl._isPageFullscreen || isVideoInFullscreen(video, fsEl))) {
                    return ctrl;
                }
            }
        }
        let bestContainerCtrl = null;
        let bestContainerArea = -1;
        let bestContainerPlaying = false;
        for (const [video, ctrl] of activeControllers.entries()) {
            if (!video.isConnected || ctrl._isAmbientClone) continue;
            const vArea = getViewportIntersectionArea(video);
            if (vArea <= 0) continue;
            const isOverCtrl = ctrl.isPointOverController(clientX, clientY);
            if (isOverCtrl) {
                const isPlaying = !video.paused && video.currentTime > 0;
                if (!bestContainerCtrl) {
                    bestContainerCtrl = ctrl;
                    bestContainerArea = vArea;
                    bestContainerPlaying = isPlaying;
                } else if (isPlaying && !bestContainerPlaying) {
                    bestContainerCtrl = ctrl;
                    bestContainerArea = vArea;
                    bestContainerPlaying = isPlaying;
                } else if (isPlaying === bestContainerPlaying && vArea > bestContainerArea) {
                    bestContainerCtrl = ctrl;
                    bestContainerArea = vArea;
                }
            }
        }
        if (bestContainerCtrl) {
            return bestContainerCtrl;
        }
        const matching = [];
        for (const [video, ctrl] of activeControllers.entries()) {
            if (!video.isConnected || ctrl._isAmbientClone) continue;
            const vRect = getVisibleVideoRect(video);
            if (!vRect) continue;
            if (clientX >= vRect.left && clientX <= vRect.right && clientY >= vRect.top && clientY <= vRect.bottom) {
                const isPlaying = !video.paused && video.currentTime > 0;
                const visibleArea = getViewportIntersectionArea(video);
                matching.push({
                    ctrl: ctrl,
                    video: video,
                    isPlaying: isPlaying,
                    visibleArea: visibleArea,
                    vRect: vRect
                });
            }
        }
        if (matching.length === 0) return null;
        if (matching.length === 1) return matching[0].ctrl;
        matching.sort((a, b) => {
            if (a.isPlaying !== b.isPlaying) {
                return a.isPlaying ? -1 : 1;
            }
            if (Math.abs(a.visibleArea - b.visibleArea) > 500) {
                return b.visibleArea - a.visibleArea;
            }
            return 0;
        });
        try {
            const topElements = document.elementsFromPoint(clientX, clientY);
            for (const el of topElements) {
                if (!el || el.tagName === "BODY" || el.tagName === "HTML" || el.getAttribute("role") === "main") continue;
                for (const m of matching) {
                    if (m.video === el || m.video.contains(el) || el.contains && el.contains(m.video) && m.video.parentElement === el) {
                        return m.ctrl;
                    }
                }
            }
        } catch (e) {}
        return matching[0].ctrl;
    }
    function updateHoveredVideo(clientX, clientY) {
        if (clientX < 0 || clientY < 0) return;
        lastClientX = clientX;
        lastClientY = clientY;
        for (const ctrl of activeControllers.values()) {
            if (ctrl && ctrl._isPageFullscreen) {
                if (activeHoveredCtrl && activeHoveredCtrl !== ctrl) {
                    activeHoveredCtrl.setHovered(false);
                }
                ctrl.setHovered(true);
                activeHoveredCtrl = ctrl;
                lastHoveredCtrl = ctrl;
                ctrl.onPointerActivity();
                ctrl.updatePosition();
                return;
            }
        }
        if (isGloballyPaused || isDomainExcluded() || isGloballyHidden || isSupportActive) {
            if (activeHoveredCtrl) {
                activeHoveredCtrl.setHovered(false);
                activeHoveredCtrl = null;
            }
            return;
        }
        const candidate = findControllerUnderPointer(clientX, clientY);
        if (candidate !== activeHoveredCtrl) {
            if (activeHoveredCtrl && activeHoveredCtrl !== candidate) {
                activeHoveredCtrl.setHovered(false);
            }
            if (candidate) {
                candidate.setHovered(true);
                followVideoUntilStable(candidate);
                lastHoveredCtrl = candidate;
                if (candidate.video && document.activeElement !== candidate.video) {
                    const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                    const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
                    if (fsEl || isForcedFs) {
                        const act = document.activeElement;
                        const isActInput = act && (act.tagName === "INPUT" || act.tagName === "TEXTAREA" || act.isContentEditable);
                        if (!isActInput) {
                            try {
                                if (!candidate.video.hasAttribute("tabindex")) candidate.video.tabIndex = -1;
                                candidate.video.focus({
                                    preventScroll: true
                                });
                            } catch (err) {}
                        }
                    }
                }
            }
            activeHoveredCtrl = candidate;
        } else if (candidate) {
            lastHoveredCtrl = candidate;
            candidate.onPointerActivity();
            candidate.updatePosition();
            if (candidate.video && document.activeElement !== candidate.video) {
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
                if (fsEl || isForcedFs) {
                    const act = document.activeElement;
                    const isActInput = act && (act.tagName === "INPUT" || act.tagName === "TEXTAREA" || act.isContentEditable);
                    if (!isActInput) {
                        try {
                            if (!candidate.video.hasAttribute("tabindex")) candidate.video.tabIndex = -1;
                            candidate.video.focus({
                                preventScroll: true
                            });
                        } catch (err) {}
                    }
                }
            }
        }
    }
    function toggleGlobalControlsBar(initiatingCtrl = null) {
        const activeCtrl = initiatingCtrl || (typeof targetController !== "undefined" && targetController && targetController.container && targetController.container.isConnected ? targetController : null) || getActiveTargetController() || activeHoveredCtrl || lastHoveredCtrl;
        let currentIsActive = false;
        if (activeCtrl && activeCtrl.controlsBar) {
            currentIsActive = activeCtrl.isControlsForced && !activeCtrl.controlsBar.classList.contains("hidden");
        } else if (isControlsForcedGlobal !== null) {
            currentIsActive = isControlsForcedGlobal;
        } else {
            currentIsActive = isDomainControlsForced();
        }
        const newState = !currentIsActive;
        isControlsForcedGlobal = newState;
        activeControllers.forEach(ctrl => {
            ctrl.isControlsForced = newState;
            if (ctrl.controlsBar) {
                if (newState) {
                    ctrl.controlsBar.classList.remove("hidden");
                    ctrl.controlsBar.classList.remove("hover-hidden");
                    ctrl.updatePosition();
                    ctrl.updateControlsBarState();
                    if (ctrl.isControlsBarPinned) {
                        ctrl.clearControlsBarAutoHide();
                    } else {
                        ctrl.scheduleControlsBarAutoHide();
                    }
                } else {
                    ctrl.controlsBar.classList.add("hover-hidden");
                    ctrl.controlsBar.classList.add("hidden");
                    if (ctrl.controlsBarAutoHideTimer) {
                        clearTimeout(ctrl.controlsBarAutoHideTimer);
                        ctrl.controlsBarAutoHideTimer = null;
                    }
                }
            }
            if (typeof ctrl.updateProgressBarButtonState === "function") {
                ctrl.updateProgressBarButtonState();
            }
        });
        const notifyCtrl = initiatingCtrl || activeCtrl || (typeof targetController !== "undefined" && targetController && targetController.container && targetController.container.isConnected ? targetController : null) || (activeHoveredCtrl && activeHoveredCtrl.container && activeHoveredCtrl.container.isConnected ? activeHoveredCtrl : null) || (lastHoveredCtrl && lastHoveredCtrl.container && lastHoveredCtrl.container.isConnected ? lastHoveredCtrl : null) || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
        if (notifyCtrl && typeof notifyCtrl.showHUD === "function") {
            notifyCtrl.showHUD(newState ? "Video Progress Bar: ON" : "Video Progress Bar: OFF");
        }
    }
    function restoreControlsVisibility(targetCtrl = null) {
        if (hideRestoreTimer) {
            clearTimeout(hideRestoreTimer);
            hideRestoreTimer = null;
        }
        isGloballyHidden = false;
        activeControllers.forEach(ctrl => {
            ctrl.updateVisibility();
            if (ctrl.container) {
                ctrl.container.classList.remove("hover-hidden");
            }
            ctrl.updatePosition();
            ctrl.scheduleButtonsAutoHide();
        });
        let candidate = null;
        if (typeof lastClientX === "number" && typeof lastClientY === "number" && lastClientX >= 0 && lastClientY >= 0) {
            candidate = findControllerUnderPointer(lastClientX, lastClientY);
        }
        const preferred = candidate || (targetCtrl && targetCtrl.container && targetCtrl.container.isConnected ? targetCtrl : null) || (activeHoveredCtrl && activeHoveredCtrl.container && activeHoveredCtrl.container.isConnected ? activeHoveredCtrl : null) || (lastHoveredCtrl && lastHoveredCtrl.container && lastHoveredCtrl.container.isConnected ? lastHoveredCtrl : null) || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
        if (preferred) {
            preferred.setHovered(true);
            activeHoveredCtrl = preferred;
            lastHoveredCtrl = preferred;
            if (typeof preferred.showHUD === "function") {
                preferred.showHUD("Controls Restored");
            }
        }
    }
    let cursorInactivityTimer = null;
    let isCursorCurrentlyHidden = false;
    function ensurePageFullscreenStyles(targetRoot) {
        const root = targetRoot || document;
        if (!root) return;
        const styleId = "omni-page-fullscreen-style";
        const isShadow = typeof ShadowRoot !== "undefined" && root instanceof ShadowRoot;
        try {
            let style = root.getElementById ? root.getElementById(styleId) : root.querySelector && root.querySelector("#" + styleId);
            if (!style) {
                style = document.createElement("style");
                style.id = styleId;
                (isShadow ? root : document.head || document.documentElement).appendChild(style);
            }
            if (isShadow) {
                style.textContent = `\n          :host(.gvc-page-fullscreen-host) {\n            position: fixed !important;\n            top: 0 !important;\n            left: 0 !important;\n            width: 100vw !important;\n            height: 100vh !important;\n            max-width: 100vw !important;\n            max-height: 100vh !important;\n            z-index: 2147483640 !important;\n            background: #000000 !important;\n            margin: 0 !important;\n            padding: 0 !important;\n            border: none !important;\n            box-shadow: none !important;\n            transform: none !important;\n          }\n          .gvc-page-fullscreen-video {\n            position: fixed !important;\n            top: 0 !important;\n            left: 0 !important;\n            width: 100vw !important;\n            height: 100vh !important;\n            max-width: 100vw !important;\n            max-height: 100vh !important;\n            min-width: 100vw !important;\n            min-height: 100vh !important;\n            z-index: 2147483640 !important;\n            background: #000000 !important;\n            object-fit: contain !important;\n            margin: 0 !important;\n            padding: 0 !important;\n            border: none !important;\n            box-shadow: none !important;\n            transform: none !important;\n          }\n          .gvc-page-fullscreen-ancestor {\n            transform: none !important;\n            filter: none !important;\n            contain: none !important;\n            perspective: none !important;\n            clip-path: none !important;\n            clip: auto !important;\n            mask: none !important;\n            -webkit-mask: none !important;\n            will-change: none !important;\n            backdrop-filter: none !important;\n            content-visibility: visible !important;\n            z-index: 2147483640 !important;\n          }\n        `;
                return;
            }
            style.textContent = `\n        html.gvc-page-fullscreen-active,\n        body.gvc-page-fullscreen-active {\n          scrollbar-width: none !important;\n          -ms-overflow-style: none !important;\n          overscroll-behavior: none !important;\n          background: #000000 !important;\n          background-color: #000000 !important;\n        }\n        html.gvc-page-fullscreen-active::-webkit-scrollbar,\n        body.gvc-page-fullscreen-active::-webkit-scrollbar {\n          display: none !important;\n          width: 0 !important;\n          height: 0 !important;\n        }\n        #gvc-fullscreen-backdrop {\n          display: none !important;\n        }\n        html.gvc-page-fullscreen-active #gvc-fullscreen-backdrop {\n          display: block !important;\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100vw !important;\n          height: 100vh !important;\n          background: #000000 !important;\n          background-color: #000000 !important;\n          z-index: 2147483630 !important;\n          pointer-events: none !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          border: none !important;\n        }\n        .gvc-page-fullscreen-host {\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100vw !important;\n          height: 100vh !important;\n          max-width: 100vw !important;\n          max-height: 100vh !important;\n          z-index: 2147483640 !important;\n          background: #000000 !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          border: none !important;\n          box-shadow: none !important;\n          transform: none !important;\n        }\n        .gvc-page-fullscreen-video {\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100vw !important;\n          height: 100vh !important;\n          max-width: 100vw !important;\n          max-height: 100vh !important;\n          min-width: 100vw !important;\n          min-height: 100vh !important;\n          z-index: 2147483640 !important;\n          background: #000000 !important;\n          object-fit: contain !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          border: none !important;\n          box-shadow: none !important;\n          transform: none !important;\n        }\n        .gvc-page-fullscreen-ancestor {\n          transform: none !important;\n          filter: none !important;\n          contain: none !important;\n          perspective: none !important;\n          clip-path: none !important;\n          clip: auto !important;\n          mask: none !important;\n          -webkit-mask: none !important;\n          will-change: none !important;\n          backdrop-filter: none !important;\n          content-visibility: visible !important;\n          z-index: 2147483640 !important;\n        }\n        .gvc-page-fullscreen-player {\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100vw !important;\n          height: 100vh !important;\n          max-width: 100vw !important;\n          max-height: 100vh !important;\n          z-index: 2147483640 !important;\n          background: transparent !important;\n          margin: 0 !important;\n          padding: 0 !important;\n          border: none !important;\n          box-shadow: none !important;\n          transform: none !important;\n        }\n        .gvc-page-fullscreen-suppressed {\n          display: none !important;\n          z-index: 0 !important;\n          visibility: hidden !important;\n          pointer-events: none !important;\n          opacity: 0 !important;\n        }\n        html.gvc-page-fullscreen-active ytd-page-manager,\n        html.gvc-page-fullscreen-active ytd-browse,\n        html.gvc-page-fullscreen-active ytd-rich-grid-renderer {\n          margin: 0 !important;\n          padding: 0 !important;\n        }\n        html.gvc-page-fullscreen-active:not(.omni-cursor-hidden) *,\n        body.gvc-page-fullscreen-active:not(.omni-cursor-hidden) * {\n          cursor: auto !important;\n        }\n        html.gvc-page-fullscreen-active .omni-shadow-host,\n        body.gvc-page-fullscreen-active .omni-shadow-host,\n        :fullscreen .omni-shadow-host,\n        :-webkit-full-screen .omni-shadow-host {\n          position: fixed !important;\n          top: 0 !important;\n          left: 0 !important;\n          width: 100vw !important;\n          height: 100vh !important;\n          z-index: 2147483647 !important;\n          pointer-events: none !important;\n        }\n        .omni-shadow-host {\n          position: absolute !important;\n          top: 0 !important;\n          left: 0 !important;\n          z-index: 2147483647 !important;\n          pointer-events: none !important;\n        }\n        .omni-subtitles-host {\n          position: absolute !important;\n          top: 0px !important;\n          left: 0px !important;\n          width: 100% !important;\n          height: 100% !important;\n          pointer-events: none !important;\n          z-index: 2147483645 !important;\n          overflow: hidden !important;\n        }\n        html.gvc-page-fullscreen-active #masthead-container,\n        html.gvc-page-fullscreen-active #guide,\n        html.gvc-page-fullscreen-active ytd-masthead,\n        html.gvc-page-fullscreen-active tp-yt-app-drawer,\n        html.gvc-page-fullscreen-active #guide-wrapper,\n        html.gvc-page-fullscreen-active ytd-guide-renderer,\n        html.gvc-page-fullscreen-active #chips-wrapper,\n        html.gvc-page-fullscreen-active #chips,\n        html.gvc-page-fullscreen-active ytd-mini-guide-renderer,\n        html.gvc-page-fullscreen-active yt-related-chip-cloud-renderer,\n        html.gvc-page-fullscreen-active ytd-feed-filter-chip-bar-renderer,\n        html.gvc-page-fullscreen-active ytd-rich-grid-renderer > #header,\n        html.gvc-page-fullscreen-active ytd-video-preview #hover-overlays,\n        html.gvc-page-fullscreen-active ytd-video-preview .ytp-inline-preview-scrim,\n        html.gvc-page-fullscreen-active ytd-video-preview .ytp-inline-preview-ui,\n        html.gvc-page-fullscreen-active ytd-video-preview .ytp-chrome-top,\n        html.gvc-page-fullscreen-active ytd-video-preview .ytp-chrome-bottom,\n        html.gvc-page-fullscreen-active reddit-header-large,\n        html.gvc-page-fullscreen-active reddit-sidebar-nav,\n        html.gvc-page-fullscreen-active #reddit-header {\n          display: none !important;\n          visibility: hidden !important;\n          pointer-events: none !important;\n          opacity: 0 !important;\n          z-index: 0 !important;\n        }\n        html.gvc-replace-subtitles .ytp-caption-window-container,\n        html.gvc-replace-subtitles .caption-window,\n        html.gvc-replace-subtitles .ytp-caption-segment,\n        html.gvc-replace-subtitles .caption-visual-line,\n        html.gvc-replace-subtitles .vjs-text-track-display,\n        html.gvc-replace-subtitles .jw-captions,\n        html.gvc-replace-subtitles .jw-text-track-container,\n        html.gvc-replace-subtitles .plyr__captions,\n        html.gvc-replace-subtitles .player-captions-container {\n          opacity: 0 !important;\n          visibility: hidden !important;\n          pointer-events: none !important;\n        }\n        html.gvc-replace-subtitles video::cue {\n          opacity: 0 !important;\n          visibility: hidden !important;\n          color: transparent !important;\n          background: transparent !important;\n        }\n      `;
            (document.head || document.documentElement).appendChild(style);
        } catch (e) {}
    }
    function ensureCursorHideStyle() {
        if (document.getElementById("omni-cursor-hide-style")) return;
        try {
            const style = document.createElement("style");
            style.id = "omni-cursor-hide-style";
            style.textContent = `\n        html.omni-cursor-hidden,\n        html.omni-cursor-hidden *,\n        body.omni-cursor-hidden,\n        body.omni-cursor-hidden *,\n        :fullscreen.omni-cursor-hidden,\n        :fullscreen.omni-cursor-hidden *,\n        :-webkit-full-screen.omni-cursor-hidden,\n        :-webkit-full-screen.omni-cursor-hidden * {\n          cursor: none !important;\n        }\n      `;
            (document.head || document.documentElement).appendChild(style);
        } catch (e) {}
    }
    function unhideCursor() {
        if (isCursorCurrentlyHidden) {
            isCursorCurrentlyHidden = false;
            document.documentElement.classList.remove("omni-cursor-hidden");
            if (document.body) document.body.classList.remove("omni-cursor-hidden");
            activeControllers.forEach(ctrl => {
                if (ctrl && ctrl.container) ctrl.container.classList.remove("omni-cursor-hidden");
                if (ctrl && typeof ctrl.updateSubtitlesPosition === "function") ctrl.updateSubtitlesPosition();
            });
        }
    }
    function hideCursor() {
        if (isCursorCurrentlyHidden) return;
        if (!currentConfig.hideCursorOnInactivity) return;
        if (!activeHoveredCtrl) return;
        if (activeHoveredCtrl.isSliderDragging || activeHoveredCtrl.isDragging) return;
        if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) return;
        ensureCursorHideStyle();
        isCursorCurrentlyHidden = true;
        document.documentElement.classList.add("omni-cursor-hidden");
        if (document.body) document.body.classList.add("omni-cursor-hidden");
        activeControllers.forEach(ctrl => {
            if (ctrl && ctrl.container) ctrl.container.classList.add("omni-cursor-hidden");
            if (ctrl && typeof ctrl.updateSubtitlesPosition === "function") ctrl.updateSubtitlesPosition();
        });
    }
    function scheduleCursorInactivityTimer() {
        if (cursorInactivityTimer) {
            clearTimeout(cursorInactivityTimer);
            cursorInactivityTimer = null;
        }
        if (!currentConfig.hideCursorOnInactivity) return;
        if (!activeHoveredCtrl) return;
        const timeoutSec = typeof currentConfig.hideCursorTimeout === "number" && currentConfig.hideCursorTimeout > 0 ? currentConfig.hideCursorTimeout : parseFloat(currentConfig.hideCursorTimeout) || 2.5;
        const timeoutMs = Math.max(500, Math.round(timeoutSec * 1e3));
        cursorInactivityTimer = setTimeout(() => {
            if (activeHoveredCtrl && !activeHoveredCtrl.isSliderDragging && !activeHoveredCtrl.isDragging) {
                hideCursor();
            }
        }, timeoutMs);
    }
    function onGlobalPointerMove(e) {
        if (clickHoldState && !clickHoldState.isHolding) {
            const dist = Math.hypot(e.clientX - clickHoldState.startX, e.clientY - clickHoldState.startY);
            if (dist > 15) {
                if (clickHoldState.timer) clearTimeout(clickHoldState.timer);
                clickHoldState = null;
            }
        }
        if (isCursorCurrentlyHidden) {
            unhideCursor();
        }
        const x = e.clientX;
        const y = e.clientY;
        if (window === window.top) {
            const fs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (fs && fs.tagName === "IFRAME") {
                if (document.activeElement !== fs) {
                    try {
                        fs.focus({
                            preventScroll: true
                        });
                    } catch (err) {}
                }
            }
        }
        if (pointerMoveRaf) return;
        pointerMoveRaf = requestAnimationFrame(() => {
            pointerMoveRaf = null;
            updateHoveredVideo(x, y);
            if (activeHoveredCtrl) {
                scheduleCursorInactivityTimer();
            } else {
                if (cursorInactivityTimer) {
                    clearTimeout(cursorInactivityTimer);
                    cursorInactivityTimer = null;
                }
                unhideCursor();
            }
        });
    }
    function onGlobalScroll() {
        unhideCursor();
        activeControllers.forEach(ctrl => {
            ctrl.updatePosition();
        });
        if (activeHoveredCtrl) {
            scheduleCursorInactivityTimer();
        }
        if (lastClientX >= 0 && lastClientY >= 0) {
            if (pointerMoveRaf) return;
            pointerMoveRaf = requestAnimationFrame(() => {
                pointerMoveRaf = null;
                updateHoveredVideo(lastClientX, lastClientY);
                if (activeHoveredCtrl) {
                    scheduleCursorInactivityTimer();
                } else {
                    if (cursorInactivityTimer) {
                        clearTimeout(cursorInactivityTimer);
                        cursorInactivityTimer = null;
                    }
                    unhideCursor();
                }
            });
        }
    }
    function onGlobalPointerLeaveDoc(e) {
        if (cursorInactivityTimer) {
            clearTimeout(cursorInactivityTimer);
            cursorInactivityTimer = null;
        }
        unhideCursor();
        if (!e.relatedTarget && !e.toElement) {
            if (activeHoveredCtrl && !activeHoveredCtrl.isDragging && (activeHoveredCtrl.isMinimized || !activeHoveredCtrl.isHovering)) {
                activeHoveredCtrl.isBridgeHovered = false;
                activeHoveredCtrl.setHovered(false);
                activeHoveredCtrl = null;
            }
            lastClientX = -1;
            lastClientY = -1;
        }
    }
    let wheelDeltaAccumulator = 0;
    let wheelResetTimer = null;
    function onGlobalWheel(e) {
        if (isGloballyPaused || isDomainExcluded()) return;
        const action = currentConfig.scrollWheelAction;
        if (!action || action === "doNothing") return;
        if (e.deltaY === 0) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (isInteractiveInputElement(e)) return;
        if (e.target && typeof e.target.closest === "function") {
            if (e.target.closest(".omni-speed-picker, .omni-ctx-menu, .omni-loop-container, .omni-sub-controls")) {
                return;
            }
        }
        const clientX = e.clientX;
        const clientY = e.clientY;
        lastClientX = clientX;
        lastClientY = clientY;
        let targetCtrl = findControllerUnderPointer(clientX, clientY);
        if (!targetCtrl && e.target) {
            for (const [video, ctrl] of activeControllers.entries()) {
                if (!video.isConnected) continue;
                if (e.target === video || typeof e.target.closest === "function" && e.target.closest("video") === video || ctrl.container && ctrl.container.contains(e.target)) {
                    targetCtrl = ctrl;
                    break;
                }
            }
        }
        if (!targetCtrl) return;
        e.preventDefault();
        e.stopPropagation();
        const pixelDelta = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * 800 : e.deltaY;
        if (Math.sign(pixelDelta) !== Math.sign(wheelDeltaAccumulator)) {
            wheelDeltaAccumulator = 0;
        }
        wheelDeltaAccumulator += pixelDelta;
        if (wheelResetTimer) clearTimeout(wheelResetTimer);
        wheelResetTimer = setTimeout(() => {
            wheelDeltaAccumulator = 0;
        }, 250);
        if (Math.abs(wheelDeltaAccumulator) >= 40) {
            const direction = wheelDeltaAccumulator < 0 ? 1 : -1;
            wheelDeltaAccumulator = 0;
            if (action === "volume") {
                const jump = currentConfig.volumeJump || .1;
                targetCtrl.adjustVolume(direction > 0 ? jump : -jump);
            } else if (action === "speed") {
                const jump = currentConfig.speedJump || .25;
                targetCtrl.adjustSpeed(direction > 0 ? jump : -jump);
            }
        }
    }
    function isInteractiveInputElement(e) {
        const target = e.target;
        if (target) {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const isForcedFs = document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active") || document.body && document.body.classList.contains("gvc-page-fullscreen-active");
            if (fsEl || isForcedFs) {
                if (target.closest && target.closest(".omni-subtitles-settings-popup")) {
                    const tag2 = target.tagName;
                    if (tag2 === "INPUT" || tag2 === "TEXTAREA") return true;
                }
                if (target.tagName === "BUTTON" || target.getAttribute && target.getAttribute("role") === "button") {
                    try {
                        if (typeof target.blur === "function") target.blur();
                    } catch (err) {}
                    return false;
                }
                if (fsEl && fsEl !== document.documentElement && fsEl !== document.body && !fsEl.contains(target)) {
                    try {
                        if (typeof target.blur === "function") target.blur();
                    } catch (err) {}
                    return false;
                }
                if (fsEl === document.documentElement || fsEl === document.body) {
                    const tag2 = target.tagName;
                    if (tag2 === "INPUT" || tag2 === "TEXTAREA" || target.isContentEditable) {
                        const rect = target.getBoundingClientRect ? target.getBoundingClientRect() : null;
                        if (target.offsetParent === null || !rect || rect.width <= 0 || rect.height <= 0 || rect.bottom < 0 || rect.top > window.innerHeight) {
                            try {
                                if (typeof target.blur === "function") target.blur();
                            } catch (err) {}
                            return false;
                        }
                    }
                }
                if (isForcedFs) {
                    if (target.closest && target.closest(".gvc-page-fullscreen-suppressed")) {
                        try {
                            if (typeof target.blur === "function") target.blur();
                        } catch (err) {}
                        return false;
                    }
                    if (target.offsetParent === null) {
                        try {
                            if (typeof target.blur === "function") target.blur();
                        } catch (err) {}
                        return false;
                    }
                }
            }
            if (target.isContentEditable) return true;
            const tag = target.tagName;
            if (tag === "TEXTAREA") return true;
            if (tag === "INPUT") {
                const type = (target.type || "text").toLowerCase();
                const nonTextTypes = [ "range", "button", "checkbox", "radio", "submit", "reset", "file", "image", "color" ];
                if (!nonTextTypes.includes(type)) {
                    return true;
                }
            }
            if (tag === "SELECT") return true;
            if (typeof target.closest === "function") {
                if (target.closest("video, .html5-video-player, #movie_player, .vp-video-wrapper, [data-player], .video-card")) {
                    if (tag === "INPUT") {
                        const type = (target.type || "text").toLowerCase();
                        const textTypes = [ "text", "search", "password", "email", "url", "tel", "number" ];
                        return textTypes.includes(type);
                    }
                    return false;
                }
                if (target.closest('textarea, select, [contenteditable="true"], [contenteditable=""], [role="textbox"], [role="searchbox"]')) {
                    return true;
                }
                const closestInput = target.closest("input");
                if (closestInput) {
                    const type = (closestInput.type || "text").toLowerCase();
                    const nonTextTypes = [ "range", "button", "checkbox", "radio", "submit", "reset", "file", "image", "color" ];
                    if (!nonTextTypes.includes(type)) return true;
                }
            }
        }
        if (e.composedPath && typeof e.composedPath === "function") {
            const path = e.composedPath();
            for (let i = 0; i < path.length; i++) {
                const el = path[i];
                if (el && el.nodeType === 1) {
                    if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
                        return true;
                    }
                    if (el.tagName === "INPUT") {
                        const type = (el.type || "text").toLowerCase();
                        const nonTextTypes = [ "range", "button", "checkbox", "radio", "submit", "reset", "file", "image", "color" ];
                        if (!nonTextTypes.includes(type)) return true;
                    }
                    const role = el.getAttribute ? el.getAttribute("role") : null;
                    if (role === "textbox" || role === "searchbox") {
                        if (el.closest && el.closest("video, .html5-video-player, #movie_player, .vp-video-wrapper, [data-player], .video-card")) {
                            continue;
                        }
                        return true;
                    }
                }
            }
        }
        return false;
    }
    function getViewportIntersectionArea(el) {
        if (!el || !el.isConnected) return 0;
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth || document.documentElement.clientWidth;
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const visibleWidth = Math.max(0, Math.min(rect.right, vw) - Math.max(rect.left, 0));
        const visibleHeight = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0));
        return visibleWidth * visibleHeight;
    }
    const activeFollowRafs = new WeakMap;
    function followVideoUntilStable(ctrl) {
        if (!ctrl || !ctrl.video || !ctrl.video.isConnected) return;
        const existingRaf = activeFollowRafs.get(ctrl);
        if (existingRaf) {
            cancelAnimationFrame(existingRaf);
            activeFollowRafs.delete(ctrl);
        }
        let lastTop = null;
        let lastLeft = null;
        let lastWidth = null;
        let lastHeight = null;
        let stableFrames = 0;
        let totalFrames = 0;
        const maxFrames = 90;
        function step() {
            if (!ctrl.video || !ctrl.video.isConnected) {
                activeFollowRafs.delete(ctrl);
                return;
            }
            const rect = getVisibleVideoRect(ctrl.video);
            if (rect) {
                ctrl.updatePosition();
                if (lastTop !== null && Math.abs(rect.top - lastTop) < .5 && Math.abs(rect.left - lastLeft) < .5 && Math.abs(rect.width - lastWidth) < .5 && Math.abs(rect.height - lastHeight) < .5) {
                    stableFrames++;
                    if (stableFrames >= 6) {
                        ctrl.updatePosition();
                        activeFollowRafs.delete(ctrl);
                        return;
                    }
                } else {
                    stableFrames = 0;
                    lastTop = rect.top;
                    lastLeft = rect.left;
                    lastWidth = rect.width;
                    lastHeight = rect.height;
                }
            }
            totalFrames++;
            if (totalFrames < maxFrames) {
                const id2 = requestAnimationFrame(step);
                activeFollowRafs.set(ctrl, id2);
            } else {
                ctrl.updatePosition();
                activeFollowRafs.delete(ctrl);
            }
        }
        const id = requestAnimationFrame(step);
        activeFollowRafs.set(ctrl, id);
    }
    function scheduleHoverCheckAfterNavigation() {
        if (activeHoveredCtrl) {
            followVideoUntilStable(activeHoveredCtrl);
        }
        const delays = [ 50, 120, 220, 350, 500, 750 ];
        delays.forEach(delay => {
            setTimeout(() => {
                if (lastClientX >= 0 && lastClientY >= 0) {
                    updateHoveredVideo(lastClientX, lastClientY);
                }
                if (activeHoveredCtrl) {
                    activeHoveredCtrl.updatePosition();
                    followVideoUntilStable(activeHoveredCtrl);
                }
            }, delay);
        });
    }
    function getActiveTargetController() {
        for (const ctrl of activeControllers.values()) {
            if (ctrl && (ctrl._isPageFullscreen || ctrl.video && ctrl.video.classList && ctrl.video.classList.contains("gvc-page-fullscreen-video"))) {
                return ctrl;
            }
        }
        const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (fsEl) {
            if (fsEl !== document.documentElement && fsEl !== document.body) {
                const directCtrl = activeControllers.get(fsEl);
                if (directCtrl && directCtrl.video && directCtrl.video.isConnected) {
                    return directCtrl;
                }
                for (const [v, ctrl] of activeControllers.entries()) {
                    if (v.isConnected && (v === fsEl || fsEl.contains && fsEl.contains(v))) {
                        return ctrl;
                    }
                }
            }
            let bestFsCtrl = null;
            let bestFsScore = -1;
            for (const [v, ctrl] of activeControllers.entries()) {
                if (!v.isConnected || ctrl._isAmbientClone) continue;
                let score = 0;
                if (ctrl._isPageFullscreen || v.classList && v.classList.contains("gvc-page-fullscreen-video")) {
                    score += 1e4;
                }
                if (!v.paused && v.currentTime > 0) {
                    score += 5e3;
                }
                try {
                    const vRect = v.getBoundingClientRect();
                    if (vRect) {
                        if (vRect.width >= window.innerWidth * .75 && vRect.height >= window.innerHeight * .75) {
                            score += 3e3;
                        }
                        score += Math.min(2e3, vRect.width * vRect.height / 1e3);
                    }
                } catch (e) {}
                if (ctrl === activeHoveredCtrl || ctrl === lastHoveredCtrl) {
                    score += 500;
                }
                if (score > bestFsScore) {
                    bestFsScore = score;
                    bestFsCtrl = ctrl;
                }
            }
            if (bestFsCtrl && bestFsScore > 0) {
                return bestFsCtrl;
            }
        }
        let underPointer = null;
        if (lastClientX >= 0 && lastClientY >= 0) {
            underPointer = findControllerUnderPointer(lastClientX, lastClientY);
            if (underPointer && underPointer.video && underPointer.video.isConnected) {
                if (underPointer !== activeHoveredCtrl) {
                    if (activeHoveredCtrl) activeHoveredCtrl.setHovered(false);
                    underPointer.setHovered(true);
                    activeHoveredCtrl = underPointer;
                    followVideoUntilStable(underPointer);
                }
                lastHoveredCtrl = underPointer;
                underPointer.updatePosition();
                return underPointer;
            }
        }
        let bestPlayingVisible = null;
        let bestPlayingAny = null;
        let bestVisibleArea = 0;
        let bestVisibleCtrl = null;
        for (const [v, ctrl] of activeControllers.entries()) {
            if (!v.isConnected || ctrl._isAmbientClone) continue;
            const area = getViewportIntersectionArea(v);
            const isPlaying = !v.paused && v.currentTime > 0;
            if (isPlaying) {
                if (!bestPlayingAny) {
                    bestPlayingAny = ctrl;
                }
                if (area > 0) {
                    if (!bestPlayingVisible || area > bestPlayingVisible.area) {
                        bestPlayingVisible = {
                            ctrl: ctrl,
                            area: area
                        };
                    }
                }
            }
            if (area > bestVisibleArea) {
                bestVisibleArea = area;
                bestVisibleCtrl = ctrl;
            }
        }
        const isShortFormFeed = (window.location.hostname || "").includes("tiktok.com") || (window.location.hostname || "").includes("instagram.com") || (window.location.hostname || "").includes("youtube.com") && (window.location.pathname || "").startsWith("/shorts");
        if (isShortFormFeed && bestPlayingVisible) {
            lastHoveredCtrl = bestPlayingVisible.ctrl;
            return bestPlayingVisible.ctrl;
        }
        if (activeHoveredCtrl && activeHoveredCtrl.video && activeHoveredCtrl.video.isConnected) {
            if (getViewportIntersectionArea(activeHoveredCtrl.video) > 0) {
                lastHoveredCtrl = activeHoveredCtrl;
                return activeHoveredCtrl;
            } else {
                activeHoveredCtrl = null;
            }
        }
        if (lastHoveredCtrl && lastHoveredCtrl.video && lastHoveredCtrl.video.isConnected && !lastHoveredCtrl._isAmbientClone) {
            const lastArea = getViewportIntersectionArea(lastHoveredCtrl.video);
            const lastPlaying = !lastHoveredCtrl.video.paused && lastHoveredCtrl.video.currentTime > 0;
            if (bestPlayingVisible && (!lastPlaying || lastArea <= 0) && bestPlayingVisible.ctrl !== lastHoveredCtrl) {
                lastHoveredCtrl = bestPlayingVisible.ctrl;
                return bestPlayingVisible.ctrl;
            }
            if (lastArea > 0 || !bestPlayingVisible) {
                return lastHoveredCtrl;
            }
        }
        if (document.activeElement) {
            if (document.activeElement.tagName === "VIDEO") {
                const ctrl = activeControllers.get(document.activeElement);
                if (ctrl && ctrl.video && ctrl.video.isConnected && !ctrl._isAmbientClone) {
                    lastHoveredCtrl = ctrl;
                    return ctrl;
                }
            }
            for (const [v, ctrl] of activeControllers.entries()) {
                if (!v.isConnected || ctrl._isAmbientClone) continue;
                if (v === document.activeElement || v.contains && v.contains(document.activeElement)) {
                    lastHoveredCtrl = ctrl;
                    return ctrl;
                }
                const hostEl = v.getRootNode && v.getRootNode().host ? v.getRootNode().host : null;
                if (hostEl && (hostEl === document.activeElement || hostEl.contains && hostEl.contains(document.activeElement))) {
                    lastHoveredCtrl = ctrl;
                    return ctrl;
                }
                const playerContainer = v.closest ? v.closest('#movie_player, .html5-video-player, ytd-player, .vp-video-wrapper, [data-player], .video-card, [role="main"], [data-pagelet*="Reels"], shreddit-player, shreddit-player-2, .xgplayer, .xgplayer-container, [class*="DivPlayerContainer"], [class*="DivVideoWrapper"], [class*="DivVideoContainer"], [data-e2e="browse-video"]') : null;
                if (playerContainer && playerContainer.contains(document.activeElement)) {
                    lastHoveredCtrl = ctrl;
                    return ctrl;
                }
            }
        }
        if (bestPlayingVisible) {
            return bestPlayingVisible.ctrl;
        }
        if (bestPlayingAny) {
            return bestPlayingAny;
        }
        if (bestVisibleCtrl && bestVisibleArea > 0) {
            return bestVisibleCtrl;
        }
        if (activeControllers.size > 0) {
            for (const [v, ctrl] of activeControllers.entries()) {
                if (v && v.isConnected && !ctrl._isAmbientClone) return ctrl;
            }
        }
        const allVideos = findAllVideos(document);
        for (const anyVideo of allVideos) {
            if (isAmbientOrDecorativeVideo(anyVideo)) continue;
            attachToVideo(anyVideo);
            const ctrl = activeControllers.get(anyVideo);
            if (ctrl && !ctrl._isAmbientClone) return ctrl;
        }
        return null;
    }
    const activeInterceptedKeys = new Set;
    function stopShortcutEvent(e) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === "function") {
            e.stopImmediatePropagation();
        }
    }
    function findScrollableAncestor(el) {
        if (!el) return null;
        let curr = el.parentElement;
        while (curr && curr !== document.body && curr !== document.documentElement) {
            try {
                const style = window.getComputedStyle(curr);
                const overflowY = style.overflowY || "";
                if ((overflowY === "auto" || overflowY === "scroll" || overflowY === "hidden") && curr.scrollHeight > curr.clientHeight && curr.clientHeight > 150) {
                    return curr;
                }
            } catch (e) {}
            curr = curr.parentElement;
        }
        return null;
    }
    function triggerUniversalShortFormNav(direction = "down", videoElement = null, ctrl = null) {
        const now = Date.now();
        if (now - lastGlobalScrollNavTime < 1e3) {
            return;
        }
        lastGlobalScrollNavTime = now;
        const isDown = direction === "down";
        const video = videoElement || (ctrl ? ctrl.video : null);
        const key = isDown ? "ArrowDown" : "ArrowUp";
        const code = isDown ? "ArrowDown" : "ArrowUp";
        const keyCode = isDown ? 40 : 38;
        const eventInit = {
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window
        };
        let active = document.activeElement;
        if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
            active.blur();
            active = null;
        }
        const target = video && video.isConnected ? video : active && active !== document.body ? active : document.body || document.documentElement || window;
        try {
            if (target && typeof target.dispatchEvent === "function") {
                target.dispatchEvent(new KeyboardEvent("keydown", eventInit));
            }
        } catch (e) {}
        setTimeout(() => {
            try {
                if (target && typeof target.dispatchEvent === "function") {
                    target.dispatchEvent(new KeyboardEvent("keyup", eventInit));
                }
            } catch (e) {}
        }, 100);
        if (ctrl) {
            ctrl.showHUD(isDown ? "Next Video" : "Previous Video");
        }
    }
    function triggerUniversalNextVideo(currentVideo, ctrl) {
        const host = (window.location.hostname || "").toLowerCase();
        const path = (window.location.pathname || "").toLowerCase();
        const isYouTube = host.includes("youtube.com");
        const isShorts = isYouTube && (path.includes("/shorts/") || currentVideo && currentVideo.closest && currentVideo.closest("ytd-shorts, #shorts-player, [is-shorts], ytd-reel-video-renderer"));
        const isTikTok = host.includes("tiktok.com");
        const isInstagramReels = host.includes("instagram.com") && (path.includes("/reel") || path.includes("/reels"));
        const isFacebookReels = host.includes("facebook.com") && (path.includes("/reel") || path.includes("/reels"));
        if (isShorts || isTikTok || isInstagramReels || isFacebookReels || isAutoScrollShortsActiveForCurrentPage(ctrl)) {
            triggerUniversalShortFormNav("down", currentVideo, ctrl);
            return;
        }
        if (isYouTube) {
            const ytNextBtn = document.querySelector(".ytp-next-button") || document.querySelector("a.ytp-next-button");
            if (ytNextBtn && ytNextBtn.getAttribute("aria-disabled") !== "true") {
                ytNextBtn.click();
                if (ctrl) ctrl.showHUD("Next Video");
                return;
            }
            const ytPlayer = document.querySelector("#movie_player") || currentVideo;
            if (ytPlayer) {
                ytPlayer.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "N",
                    code: "KeyN",
                    keyCode: 78,
                    which: 78,
                    shiftKey: true,
                    bubbles: true
                }));
                if (ctrl) ctrl.showHUD("Next Video");
                return;
            }
        }
        const genericNextSelectors = [ ".ytp-next-button", '[data-uia="next-episode-seamless-button"]', '[data-uia="control-next"]', ".vjs-next-button", ".jw-icon-next", '.plyr__controls [data-plyr="fast-forward"]', 'button[aria-label*="next" i]', 'button[title*="next" i]', 'a[aria-label*="next" i]', 'a[title*="next" i]', '[data-action="next"]', ".next-video-button", ".btn-next" ];
        for (const sel of genericNextSelectors) {
            const el = document.querySelector(sel);
            if (el && !el.disabled && el.getAttribute("aria-disabled") !== "true" && el.offsetParent !== null) {
                el.click();
                if (ctrl) ctrl.showHUD("Next Video");
                return;
            }
        }
        const videos = Array.from(document.querySelectorAll("video")).filter(v => v.isConnected && v.offsetWidth > 0 && v.offsetHeight > 0);
        if (videos.length > 1) {
            const currentIndex = currentVideo ? videos.indexOf(currentVideo) : -1;
            if (currentIndex !== -1 && currentIndex < videos.length - 1) {
                const nextVid = videos[currentIndex + 1];
                try {
                    if (currentVideo) currentVideo.pause();
                    nextVid.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    nextVid.play().catch(() => {});
                    if (ctrl) ctrl.showHUD("Next Video");
                    return;
                } catch (e) {}
            } else if (currentIndex === -1 && videos.length > 0) {
                try {
                    videos[0].scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    videos[0].play().catch(() => {});
                    if (ctrl) ctrl.showHUD("Next Video");
                    return;
                } catch (e) {}
            }
        }
        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: "MediaTrackNext",
            code: "MediaTrackNext",
            bubbles: true
        }));
        if (currentVideo && currentVideo.duration && isFinite(currentVideo.duration)) {
            currentVideo.currentTime = Math.max(0, currentVideo.duration - .2);
            if (ctrl) ctrl.showHUD("Next Video");
        }
    }
    function triggerUniversalPrevVideo(currentVideo, ctrl) {
        const host = (window.location.hostname || "").toLowerCase();
        const path = (window.location.pathname || "").toLowerCase();
        const isYouTube = host.includes("youtube.com");
        const isShorts = isYouTube && (path.includes("/shorts/") || currentVideo && currentVideo.closest && currentVideo.closest("ytd-shorts, #shorts-player, [is-shorts], ytd-reel-video-renderer"));
        const isTikTok = host.includes("tiktok.com");
        const isInstagramReels = host.includes("instagram.com") && (path.includes("/reel") || path.includes("/reels"));
        const isFacebookReels = host.includes("facebook.com") && (path.includes("/reel") || path.includes("/reels"));
        if (isShorts || isTikTok || isInstagramReels || isFacebookReels || isAutoScrollShortsActiveForCurrentPage(ctrl)) {
            triggerUniversalShortFormNav("up", currentVideo, ctrl);
            return;
        }
        if (isYouTube) {
            const ytPrevBtn = document.querySelector(".ytp-prev-button") || document.querySelector("a.ytp-prev-button");
            if (ytPrevBtn && ytPrevBtn.getAttribute("aria-disabled") !== "true") {
                ytPrevBtn.click();
                if (ctrl) ctrl.showHUD("Previous Video");
                return;
            }
            const ytPlayer = document.querySelector("#movie_player") || currentVideo;
            if (ytPlayer) {
                ytPlayer.dispatchEvent(new KeyboardEvent("keydown", {
                    key: "P",
                    code: "KeyP",
                    keyCode: 80,
                    which: 80,
                    shiftKey: true,
                    bubbles: true
                }));
            }
        }
        const genericPrevSelectors = [ ".ytp-prev-button", '[data-uia="control-prev"]', ".vjs-prev-button", ".jw-icon-prev", '.plyr__controls [data-plyr="rewind"]', 'button[aria-label*="previous" i]', 'button[aria-label*="prev" i]', 'button[title*="previous" i]', 'button[title*="prev" i]', 'a[aria-label*="previous" i]', 'a[aria-label*="prev" i]', 'a[title*="previous" i]', 'a[title*="prev" i]', '[data-action="prev"]', ".prev-video-button", ".btn-prev" ];
        for (const sel of genericPrevSelectors) {
            const el = document.querySelector(sel);
            if (el && !el.disabled && el.getAttribute("aria-disabled") !== "true" && el.offsetParent !== null) {
                el.click();
                if (ctrl) ctrl.showHUD("Previous Video");
                return;
            }
        }
        const videos = Array.from(document.querySelectorAll("video")).filter(v => v.isConnected && v.offsetWidth > 0 && v.offsetHeight > 0);
        if (videos.length > 1) {
            const currentIndex = currentVideo ? videos.indexOf(currentVideo) : -1;
            if (currentIndex > 0) {
                const prevVid = videos[currentIndex - 1];
                try {
                    if (currentVideo) currentVideo.pause();
                    prevVid.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });
                    prevVid.play().catch(() => {});
                    if (ctrl) ctrl.showHUD("Previous Video");
                    return;
                } catch (e) {}
            }
        }
        document.dispatchEvent(new KeyboardEvent("keydown", {
            key: "MediaTrackPrevious",
            code: "MediaTrackPrevious",
            bubbles: true
        }));
        if (currentVideo && currentVideo.currentTime > 3) {
            currentVideo.currentTime = 0;
            if (ctrl) ctrl.showHUD("Restarted Video");
            return;
        }
        if (window.history.length > 1) {
            if (ctrl) ctrl.showHUD("Previous Video");
            window.history.back();
        } else if (currentVideo) {
            currentVideo.currentTime = 0;
            if (ctrl) ctrl.showHUD("Restarted Video");
        }
    }
    function isSpaceKey(code, e) {
        if (code === "Space" || code === "Spacebar") return true;
        if (e && (e.key === " " || e.key === "Spacebar" || e.keyCode === 32 || e.which === 32)) return true;
        return false;
    }
    function isAnyFullscreenActive() {
        if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) return true;
        if (document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active")) return true;
        if (document.body && document.body.classList.contains("gvc-page-fullscreen-active")) return true;
        if (typeof activeControllers !== "undefined" && activeControllers) {
            for (const ctrl of activeControllers.values()) {
                if (ctrl && (ctrl._isPageFullscreen || ctrl.video && ctrl.video.classList && ctrl.video.classList.contains("gvc-page-fullscreen-video"))) {
                    return true;
                }
            }
        }
        return false;
    }
    const ACTION_TO_CONTROL_MAP = {
        toggleVisibility: "hide",
        toggleRepeat: "loop",
        popoutVideo: "pip",
        speedUp: "speed",
        speedDown: "speed",
        resetSpeed: "speed",
        toggleFavoriteSpeed: "speed",
        toggleSuperSpeed: "speed",
        volumeUp: "volume",
        volumeDown: "volume",
        toggleMute: "volume",
        toggleVideoControls: "progressBar"
    };
    function isControlActiveForAction(action) {
        if (!action) return false;
        const requiredControl = ACTION_TO_CONTROL_MAP[action];
        if (!requiredControl) return true;
        const activeControls = Array.isArray(currentConfig.videoControls) ? currentConfig.videoControls : DEFAULT_CONFIG.videoControls || [ "loop", "speed", "volume", "pip", "progressBar", "hide", "settings" ];
        return activeControls.includes(requiredControl);
    }
    function matchKeyToAction(actionVal, code, e, isPlayCheck, isFsCheck) {
        if (actionVal === void 0 || actionVal === null) return false;
        let list;
        if (Array.isArray(actionVal)) {
            list = actionVal;
        } else if (typeof actionVal === "string" && actionVal.length > 0) {
            list = [ actionVal ];
        } else {
            return false;
        }
        for (let i = 0; i < list.length; i++) {
            const k = list[i];
            if (!k) continue;
            if (code && code === k) return true;
            if (isPlayCheck && k === "Space" && isSpaceKey(code, e)) return true;
            if (isFsCheck && k === "KeyF" && (code === "KeyF" || e && (e.key === "f" || e.key === "F"))) return true;
        }
        return false;
    }
    function getMatchingHotkeyAction(code, shortcuts, e) {
        if (!code && !e) return null;
        const sc = shortcuts || currentConfig.keyboardShortcuts || {};
        const playPauseKey = sc.togglePlay !== void 0 ? sc.togglePlay : "Space";
        if (matchKeyToAction(playPauseKey, code, e, true, false)) return "togglePlay";
        const deactivateKey = sc.toggleDeactivate !== void 0 ? sc.toggleDeactivate : "KeyT";
        if (matchKeyToAction(deactivateKey, code, e, false, false)) return "toggleDeactivate";
        if (matchKeyToAction(sc.speedUp, code, e, false, false)) return "speedUp";
        if (matchKeyToAction(sc.speedDown, code, e, false, false)) return "speedDown";
        if (matchKeyToAction(sc.resetSpeed, code, e, false, false)) return "resetSpeed";
        if (matchKeyToAction(sc.volumeUp, code, e, false, false)) return "volumeUp";
        if (matchKeyToAction(sc.volumeDown, code, e, false, false)) return "volumeDown";
        if (matchKeyToAction(sc.toggleMute, code, e, false, false)) return "toggleMute";
        if (matchKeyToAction(sc.toggleFavoriteSpeed, code, e, false, false)) return "toggleFavoriteSpeed";
        if (matchKeyToAction(sc.toggleSuperSpeed, code, e, false, false)) return "toggleSuperSpeed";
        if (matchKeyToAction(sc.toggleRepeat, code, e, false, false)) return "toggleRepeat";
        if (matchKeyToAction(sc.shortSkipForward, code, e, false, false)) return "shortSkipForward";
        if (matchKeyToAction(sc.shortSkipBackward, code, e, false, false)) return "shortSkipBackward";
        if (matchKeyToAction(sc.longSkipForward, code, e, false, false)) return "longSkipForward";
        if (matchKeyToAction(sc.longSkipBackward, code, e, false, false)) return "longSkipBackward";
        if (matchKeyToAction(sc.nextVideo, code, e, false, false)) return "nextVideo";
        if (matchKeyToAction(sc.prevVideo, code, e, false, false)) return "prevVideo";
        if (matchKeyToAction(sc.frameForward, code, e, false, false)) return "frameForward";
        if (matchKeyToAction(sc.frameBackward, code, e, false, false)) return "frameBackward";
        if (matchKeyToAction(sc.popoutVideo, code, e, false, false)) return "popoutVideo";
        const fsKey = sc.forceFullscreen !== void 0 ? sc.forceFullscreen : "KeyF";
        if (matchKeyToAction(fsKey, code, e, false, true)) return "forceFullscreen";
        if (matchKeyToAction(sc.toggleSubtitles, code, e, false, false)) return "toggleSubtitles";
        if (matchKeyToAction(sc.toggleVisibility, code, e, false, false)) return "toggleVisibility";
        if (matchKeyToAction(sc.toggleVideoControls, code, e, false, false)) return "toggleVideoControls";
        return null;
    }
    function handleKeyboardShortcut(e) {
        if (cleanupIfInvalidated()) return;
        if (!e.isTrusted) return;
        lastUserInteractionTime = Date.now();
        if (e.key === "Escape" || e.code === "Escape") {
            let didExit = false;
            for (const ctrl of activeControllers.values()) {
                if (ctrl) {
                    ctrl._stopCorruptionWatchdog();
                    if (ctrl._isPageFullscreen) {
                        ctrl.exitForcedFullscreen();
                        didExit = true;
                    }
                }
            }
            if (document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active")) {
                document.documentElement.classList.remove("gvc-page-fullscreen-active");
                if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
                document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                    try {
                        b.remove();
                    } catch (e2) {}
                });
                document.querySelectorAll("#gvc-fs-placeholder, [data-gvc-fs-placeholder]").forEach(el => {
                    try {
                        el.remove();
                    } catch (e2) {}
                });
                document.querySelectorAll(".gvc-page-fullscreen-suppressed").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-suppressed");
                    el.style.removeProperty("display");
                });
                document.querySelectorAll(".gvc-page-fullscreen-ancestor").forEach(el => {
                    el.classList.remove("gvc-page-fullscreen-ancestor");
                });
                if (document.fullscreenElement) {
                    try {
                        document.exitFullscreen();
                    } catch (e2) {}
                }
                didExit = true;
            }
            if (didExit && !document.fullscreenElement) {
                stopShortcutEvent(e);
                return;
            }
        }
        if (document.querySelector(".recording-modal.active") || document.querySelector("#recordingModal.active")) return;
        if (typeof unhideCursor === "function") unhideCursor();
        if (typeof scheduleCursorInactivityTimer === "function" && activeHoveredCtrl) {
            scheduleCursorInactivityTimer();
        }
        const activeBarCtrl = activeHoveredCtrl && activeHoveredCtrl.controlsBar && activeHoveredCtrl.isControlsForced ? activeHoveredCtrl : (() => {
            const t = getActiveTargetController();
            return t && t.controlsBar && t.isControlsForced ? t : null;
        })();
        if (activeBarCtrl) {
            if (activeBarCtrl.controlsBar.classList.contains("hover-hidden")) {
                activeBarCtrl.controlsBar.classList.remove("hover-hidden");
            }
            if (currentConfig.autoHideButtons !== false) {
                activeBarCtrl.scheduleControlsBarAutoHide();
            }
        }
        if (isInteractiveInputElement(e)) {
            return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) {
            return;
        }
        if (e.code === "KeyQ" && e.key && e.key.toLowerCase() === "a") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyW" && e.key && e.key.toLowerCase() === "z") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyA" && e.key && e.key.toLowerCase() === "q") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyZ" && e.key && e.key.toLowerCase() === "w") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "Semicolon" && e.key && e.key.toLowerCase() === "m") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyM" && e.key === ",") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyW" && e.key && e.key.toLowerCase() === "z") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        } else if (e.code === "KeyA" && e.key && e.key.toLowerCase() === "q") {
            currentConfig.keyboardLayout = "azerty";
            physicalLayoutDetected = "azerty";
        }
        const shortcuts = currentConfig.keyboardShortcuts || {};
        const code = e.code || (isSpaceKey(null, e) ? "Space" : "");
        let action = getMatchingHotkeyAction(code, shortcuts, e);
        if (!action && (code === "KeyF" || e && (e.key === "f" || e.key === "F")) && isAnyFullscreenActive()) {
            action = "forceFullscreen";
        }
        if (action && !isControlActiveForAction(action)) {
            action = null;
        }
        let digitMatch = null;
        if (code.startsWith("Digit")) {
            const d = parseInt(code.slice(5), 10);
            if (d >= 0 && d <= 9) digitMatch = d;
        } else if (code.startsWith("Numpad")) {
            const d = parseInt(code.slice(6), 10);
            if (d >= 0 && d <= 9) digitMatch = d;
        } else if (e.key && e.key.length === 1 && e.key >= "0" && e.key <= "9") {
            digitMatch = parseInt(e.key, 10);
        }
        if (digitMatch !== null && e.shiftKey && e.key !== String(digitMatch)) {
            digitMatch = null;
        }
        const isSegmentForced = currentConfig.segmentControl1To9 === "force";
        const isSegmentHandled = !action && digitMatch !== null && isSegmentForced;
        if (!action && !isSegmentHandled) {
            if (code === "ArrowDown" || code === "ArrowUp" || code === "PageDown" || code === "PageUp" || code === "KeyJ" || code === "KeyK") {
                scheduleHoverCheckAfterNavigation();
            }
            return;
        }
        if (action === "toggleDeactivate") {
            const isCurrentlyDeactivated = isGloballyPaused || isDomainExcluded();
            const delay = parseFloat(currentConfig.autoReactivateDelay) || 0;
            const holdToReactivate = parseFloat(currentConfig.holdToReactivateDelay) || 0;
            if (autoReactivateTimer !== null) {
                return;
            }
            if (isCurrentlyDeactivated && currentConfig.deactivateHotkeyMode !== "deactivateOnly" && holdToReactivate > 0) {
                if (e.repeat) {
                    if (reactivateKeyHoldState && reactivateKeyHoldState.hudShown) {
                        stopShortcutEvent(e);
                    }
                    return;
                }
                if (reactivateKeyHoldState) {
                    if (reactivateKeyHoldState.timer) clearTimeout(reactivateKeyHoldState.timer);
                    if (reactivateKeyHoldState.hudTimer) clearTimeout(reactivateKeyHoldState.hudTimer);
                }
                const targetController4 = getActiveTargetController();
                const hudTimer = setTimeout(() => {
                    if (reactivateKeyHoldState && !reactivateKeyHoldState.triggered) {
                        reactivateKeyHoldState.hudShown = true;
                        const notifyCtrl = targetController4 || activeHoveredCtrl || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                        if (notifyCtrl && typeof notifyCtrl.showHUD === "function") {
                            notifyCtrl.showHUD(`Hold to Reactivate (${holdToReactivate}s)...`);
                        }
                    }
                }, 200);
                const timer = setTimeout(() => {
                    if (reactivateKeyHoldState) {
                        reactivateKeyHoldState.triggered = true;
                        isGloballyPaused = false;
                        const hostname = (window.location.hostname || (window.location.protocol === "file:" ? "local_file" : "")).toLowerCase();
                        const stripped = hostname.replace(/^www\./, "");
                        const rootKey = getRootDomain(hostname);
                        let list = Array.from(currentConfig.excludedDomains || []);
                        list = list.filter(d => {
                            const norm = String(d).toLowerCase().replace(/^www\./, "");
                            return norm !== hostname && norm !== stripped && (!rootKey || norm !== rootKey);
                        });
                        currentConfig.excludedDomains = list;
                        try {
                            chrome.storage.sync.set({
                                config: currentConfig
                            });
                        } catch (err) {}
                        scanVideos();
                        activeControllers.forEach(ctrl => ctrl.updateVisibility());
                        reportVideoPresence();
                        if (currentConfig.holdClickAction !== "default") {
                            ensureYouTubeSpeedmasterSuppressStyle();
                        }
                        const notify = targetController4 || activeHoveredCtrl || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                        if (notify && typeof notify.showHUD === "function") {
                            notify.showHUD("Extension Reactivated");
                        }
                    }
                }, holdToReactivate * 1e3);
                reactivateKeyHoldState = {
                    code: code,
                    startTime: Date.now(),
                    timer: timer,
                    hudTimer: hudTimer,
                    hudShown: false,
                    triggered: false
                };
                return;
            }
            if (currentConfig.deactivateHotkeyMode === "deactivateOnly" && isCurrentlyDeactivated) {
                return;
            }
            const targetController3 = getActiveTargetController();
            if (!isCurrentlyDeactivated && currentConfig.deactivateHotkeyMode === "toggle" && delay > 0) {
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                if (e.repeat) return;
                isGloballyPaused = true;
                if (activeHoveredCtrl) {
                    activeHoveredCtrl.setHovered(false);
                    activeHoveredCtrl = null;
                }
                releaseAllHoldStates();
                restoreYouTubeSpeedmaster();
                activeControllers.forEach(ctrl => ctrl.updateVisibility());
                reportVideoPresence();
                const ctrlToNotify = targetController3 || activeHoveredCtrl || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                if (ctrlToNotify && typeof ctrlToNotify.showHUD === "function") {
                    ctrlToNotify.showHUD(`Extension Deactivated (${delay}s)`);
                }
                autoReactivateEndTime = Date.now() + delay * 1e3;
                autoReactivateTimer = setTimeout(() => {
                    autoReactivateTimer = null;
                    autoReactivateEndTime = 0;
                    isGloballyPaused = false;
                    scanVideos();
                    activeControllers.forEach(ctrl => ctrl.updateVisibility());
                    reportVideoPresence();
                    if (currentConfig.holdClickAction !== "default") {
                        ensureYouTubeSpeedmasterSuppressStyle();
                    }
                    const notify = activeHoveredCtrl || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                    if (notify && typeof notify.showHUD === "function") {
                        notify.showHUD("Extension Reactivated");
                    }
                }, delay * 1e3);
                return;
            }
            stopShortcutEvent(e);
            activeInterceptedKeys.add(code);
            if (e.repeat) return;
            toggleSiteDeactivation(targetController3);
            return;
        }
        if (isGloballyPaused || isDomainExcluded()) {
            return;
        }
        if (e.repeat) {
            isGlobalKeyDown = true;
            if (action === "speedDown" || action === "volumeDown" || action === "shortSkipBackward" || action === "longSkipBackward" || action === "frameBackward") {
                isGlobalKeyReverse = true;
            } else if (action === "speedUp" || action === "volumeUp" || action === "shortSkipForward" || action === "longSkipForward" || action === "frameForward" || action === "togglePlay" || action === "toggleSuperSpeed" || action === "toggleFavoriteSpeed") {
                isGlobalKeyReverse = false;
            }
            if (typeof activeControllers !== "undefined" && activeControllers) {
                for (const ctrl of activeControllers.values()) {
                    if (ctrl.hud && ctrl.hud.classList.contains("active")) {
                        if (ctrl._isHUDAtLimit) {
                            continue;
                        }
                        const svg = ctrl.hud.querySelector(".hud-icon svg");
                        if (svg) {
                            svg.classList.remove("is-landing");
                            svg.classList.add("is-spinning");
                            if (isGlobalKeyReverse) {
                                svg.classList.add("reverse");
                                ctrl._lastHUDWasReverse = true;
                            } else {
                                svg.classList.remove("reverse");
                                ctrl._lastHUDWasReverse = false;
                            }
                        }
                    }
                }
            }
        }
        if (isSegmentHandled) {
            stopShortcutEvent(e);
            activeInterceptedKeys.add(code);
            if (e.repeat) return;
            let targetController3 = getActiveTargetController();
            if (!targetController3 || !targetController3.video || !targetController3.video.isConnected) {
                scanVideos();
                targetController3 = getActiveTargetController();
            }
            if (targetController3 && targetController3.video) {
                targetController3.seekToSegment(digitMatch);
            }
            return;
        }
        let targetController2 = getActiveTargetController();
        if (!targetController2 || !targetController2.video || !targetController2.video.isConnected) {
            scanVideos();
            targetController2 = getActiveTargetController();
        }
        if (!targetController2 || !targetController2.video) {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            const root = fsEl && fsEl !== document.documentElement && fsEl !== document.body ? fsEl : document;
            const anyVid = root.querySelector ? root.querySelector("video") : null;
            if (anyVid) {
                scanVideos();
                targetController2 = activeControllers.get(anyVid) || getActiveTargetController();
            }
        }
        if (!targetController2 || !targetController2.video) {
            if (action === "nextVideo") {
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                if (e.repeat) return;
                triggerUniversalNextVideo(null, null);
                return;
            }
            if (action === "prevVideo") {
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                if (e.repeat) return;
                triggerUniversalPrevVideo(null, null);
                return;
            }
            if (action === "forceFullscreen") {
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                const ctrl = getActiveTargetController() || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                if (ctrl) {
                    ctrl.toggleFullscreen();
                } else if (isAnyFullscreenActive()) {
                    const activeFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                    if (activeFs) {
                        try {
                            if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
                        } catch (err) {}
                    }
                    for (const c of activeControllers.values()) {
                        if (c && c._isPageFullscreen) {
                            try {
                                c.exitForcedFullscreen();
                            } catch (err) {}
                        }
                    }
                    if (document.documentElement) document.documentElement.classList.remove("gvc-page-fullscreen-active");
                    if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
                    document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                        try {
                            b.remove();
                        } catch (e2) {}
                    });
                } else {
                    const allVids = findAllVideos(document);
                    const v = allVids.length > 0 ? allVids[0] : null;
                    if (v) {
                        const req = v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen;
                        if (req) req.call(v).catch(() => {});
                    }
                }
                return;
            }
            if (action === "toggleVideoControls") {
                if (!isControlActiveForAction(action)) return;
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                if (e.repeat) return;
                toggleGlobalControlsBar();
                return;
            }
            if (action === "toggleSubtitles") {
                stopShortcutEvent(e);
                activeInterceptedKeys.add(code);
                if (e.repeat) return;
                const ctrl = getActiveTargetController() || (activeControllers.size > 0 ? activeControllers.values().next().value : null);
                if (ctrl) ctrl.toggleSubtitles();
                return;
            }
            if (action && !isInteractiveInputElement(e)) {
                let targetIframe = null;
                const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                if (fsEl && fsEl.tagName === "IFRAME") {
                    targetIframe = fsEl;
                } else if (lastClientX >= 0 && lastClientY >= 0) {
                    const el = document.elementFromPoint(lastClientX, lastClientY);
                    if (el && el.tagName === "IFRAME") targetIframe = el;
                }
                if (!targetIframe) {
                    const iframes = document.querySelectorAll("iframe");
                    if (iframes.length === 1) targetIframe = iframes[0];
                }
                if (targetIframe && targetIframe.contentWindow) {
                    stopShortcutEvent(e);
                    try {
                        targetIframe.focus({
                            preventScroll: true
                        });
                    } catch (err) {}
                    try {
                        targetIframe.contentWindow.postMessage({
                            type: "gvc_forward_shortcut",
                            action: action,
                            code: code,
                            key: e.key,
                            shiftKey: e.shiftKey,
                            repeat: e.repeat
                        }, "*");
                    } catch (err) {}
                    return;
                }
            }
            if (isSpaceKey(code, e)) {
                stopShortcutEvent(e);
            }
            return;
        }
        if (!isControlActiveForAction(action)) {
            return;
        }
        stopShortcutEvent(e);
        activeInterceptedKeys.add(code);
        executeShortcutAction(action, targetController2, e, code);
    }
    function executeShortcutAction(action, targetController2, e, code) {
        if (!targetController2 || !targetController2.video) return;
        switch (action) {
          case "togglePlay":
            if (!currentConfig.holdSpaceSpeedEnabled || code !== "Space" && !isSpaceKey(code, e)) {
                if (!e.repeat) {
                    targetController2.togglePlayPause();
                }
                break;
            }
            const targetHoldSpeed = currentConfig.holdSpaceSpeed !== void 0 ? Number(currentConfig.holdSpaceSpeed) || 2 : 2;
            if (!e.repeat) {
                if (spaceHoldState && spaceHoldState.timer) {
                    clearTimeout(spaceHoldState.timer);
                }
                const currentRate = targetController2.video.playbackRate || 1;
                const wasPaused = targetController2.video.paused;
                const timer = setTimeout(() => {
                    if (spaceHoldState && !spaceHoldState.isHolding2x) {
                        spaceHoldState.isHolding2x = true;
                        const ctrl = spaceHoldState.controller || targetController2;
                        if (ctrl && ctrl.video && ctrl.video.isConnected) {
                            if (ctrl.video.paused) {
                                ctrl.video.play().catch(() => {});
                            }
                            ctrl.setSpeed(targetHoldSpeed, false);
                            ctrl.showHUD(`Speed Boost: ${targetHoldSpeed.toFixed(2)}x`);
                        }
                    }
                }, HOLD_BOOST_THRESHOLD_MS);
                spaceHoldState = {
                    code: code,
                    startTime: Date.now(),
                    previousSpeed: currentRate,
                    wasPaused: wasPaused,
                    controller: targetController2,
                    timer: timer,
                    isHolding2x: false
                };
            } else if (spaceHoldState) {
                if (!spaceHoldState.isHolding2x && Date.now() - spaceHoldState.startTime >= HOLD_BOOST_THRESHOLD_MS) {
                    if (spaceHoldState.timer) {
                        clearTimeout(spaceHoldState.timer);
                        spaceHoldState.timer = null;
                    }
                    spaceHoldState.isHolding2x = true;
                    const ctrl = spaceHoldState.controller || targetController2;
                    if (ctrl && ctrl.video && ctrl.video.isConnected) {
                        if (ctrl.video.paused) {
                            ctrl.video.play().catch(() => {});
                        }
                        ctrl.setSpeed(targetHoldSpeed, false);
                        ctrl.showHUD(`Speed Boost: ${targetHoldSpeed.toFixed(2)}x`);
                    }
                }
            }
            break;

          case "speedUp":
            isGlobalKeyReverse = false;
            targetController2.adjustSpeed(currentConfig.speedJump || .25);
            break;

          case "speedDown":
            isGlobalKeyReverse = true;
            targetController2.adjustSpeed(-(currentConfig.speedJump || .25));
            break;

          case "resetSpeed":
            isGlobalKeyReverse = false;
            targetController2.setSpeed(1);
            break;

          case "volumeUp":
            isGlobalKeyReverse = false;
            targetController2.adjustVolume(currentConfig.volumeJump || .1);
            break;

          case "volumeDown":
            isGlobalKeyReverse = true;
            targetController2.adjustVolume(-(currentConfig.volumeJump || .1));
            break;

          case "toggleMute":
            if (e.repeat) return;
            targetController2.toggleMute();
            break;

          case "toggleFavoriteSpeed":
            {
                const isHoldEnabled = currentConfig.holdFavoriteSpeedEnabled !== false;
                const targetFav = currentConfig.favoriteSpeed || 1.5;
                if (!e.repeat) {
                    if (favoriteSpeedHoldState && favoriteSpeedHoldState.timer) {
                        clearTimeout(favoriteSpeedHoldState.timer);
                    }
                    const currentRate = targetController2.video.playbackRate || 1;
                    const wasPaused = targetController2.video.paused;
                    let timer = null;
                    if (isHoldEnabled) {
                        timer = setTimeout(() => {
                            if (favoriteSpeedHoldState && !favoriteSpeedHoldState.isHolding) {
                                favoriteSpeedHoldState.isHolding = true;
                                const ctrl = favoriteSpeedHoldState.controller || targetController2;
                                if (ctrl && ctrl.video && ctrl.video.isConnected) {
                                    if (ctrl.video.paused) {
                                        ctrl.video.play().catch(() => {});
                                    }
                                    ctrl.setSpeed(targetFav, false);
                                    ctrl.showHUD(`Favorite Speed: ${targetFav.toFixed(2)}x`);
                                }
                            }
                        }, HOLD_BOOST_THRESHOLD_MS);
                    }
                    favoriteSpeedHoldState = {
                        code: code,
                        startTime: Date.now(),
                        previousSpeed: currentRate,
                        wasPaused: wasPaused,
                        controller: targetController2,
                        timer: timer,
                        isHolding: false,
                        repeated: false
                    };
                } else if (favoriteSpeedHoldState) {
                    favoriteSpeedHoldState.repeated = true;
                    if (isHoldEnabled && !favoriteSpeedHoldState.isHolding && Date.now() - favoriteSpeedHoldState.startTime >= HOLD_BOOST_THRESHOLD_MS) {
                        if (favoriteSpeedHoldState.timer) {
                            clearTimeout(favoriteSpeedHoldState.timer);
                            favoriteSpeedHoldState.timer = null;
                        }
                        favoriteSpeedHoldState.isHolding = true;
                        const ctrl = favoriteSpeedHoldState.controller || targetController2;
                        if (ctrl && ctrl.video && ctrl.video.isConnected) {
                            if (ctrl.video.paused) {
                                ctrl.video.play().catch(() => {});
                            }
                            ctrl.setSpeed(targetFav, false);
                            ctrl.showHUD(`Favorite Speed: ${targetFav.toFixed(2)}x`);
                        }
                    }
                }
                break;
            }

          case "toggleSuperSpeed":
            {
                const isHoldEnabled = currentConfig.holdSuperSpeedEnabled !== false;
                const targetSuper = currentConfig.superSpeed || 2.5;
                if (!e.repeat) {
                    if (superSpeedHoldState && superSpeedHoldState.timer) {
                        clearTimeout(superSpeedHoldState.timer);
                    }
                    const currentRate = targetController2.video.playbackRate || 1;
                    const wasPaused = targetController2.video.paused;
                    let timer = null;
                    if (isHoldEnabled) {
                        timer = setTimeout(() => {
                            if (superSpeedHoldState && !superSpeedHoldState.isHolding) {
                                superSpeedHoldState.isHolding = true;
                                const ctrl = superSpeedHoldState.controller || targetController2;
                                if (ctrl && ctrl.video && ctrl.video.isConnected) {
                                    if (ctrl.video.paused) {
                                        ctrl.video.play().catch(() => {});
                                    }
                                    ctrl.setSpeed(targetSuper, false);
                                    ctrl.showHUD(`Super Speed: ${targetSuper.toFixed(2)}x`);
                                }
                            }
                        }, HOLD_BOOST_THRESHOLD_MS);
                    }
                    superSpeedHoldState = {
                        code: code,
                        startTime: Date.now(),
                        previousSpeed: currentRate,
                        wasPaused: wasPaused,
                        controller: targetController2,
                        timer: timer,
                        isHolding: false,
                        repeated: false
                    };
                } else if (superSpeedHoldState) {
                    superSpeedHoldState.repeated = true;
                    if (isHoldEnabled && !superSpeedHoldState.isHolding && Date.now() - superSpeedHoldState.startTime >= HOLD_BOOST_THRESHOLD_MS) {
                        if (superSpeedHoldState.timer) {
                            clearTimeout(superSpeedHoldState.timer);
                            superSpeedHoldState.timer = null;
                        }
                        superSpeedHoldState.isHolding = true;
                        const ctrl = superSpeedHoldState.controller || targetController2;
                        if (ctrl && ctrl.video && ctrl.video.isConnected) {
                            if (ctrl.video.paused) {
                                ctrl.video.play().catch(() => {});
                            }
                            ctrl.setSpeed(targetSuper, false);
                            ctrl.showHUD(`Super Speed: ${targetSuper.toFixed(2)}x`);
                        }
                    }
                }
                break;
            }

          case "toggleRepeat":
            targetController2.toggleRepeat();
            break;

          case "shortSkipForward":
            isGlobalKeyReverse = false;
            targetController2.seek(currentConfig.shortSkipDuration || 5);
            break;

          case "shortSkipBackward":
            isGlobalKeyReverse = true;
            targetController2.seek(-(currentConfig.shortSkipDuration || 5));
            break;

          case "longSkipForward":
            isGlobalKeyReverse = false;
            targetController2.seek(currentConfig.longSkipDuration || 30);
            break;

          case "longSkipBackward":
            isGlobalKeyReverse = true;
            targetController2.seek(-(currentConfig.longSkipDuration || 30));
            break;

          case "nextVideo":
            if (e.repeat) return;
            targetController2.nextVideo();
            scheduleHoverCheckAfterNavigation();
            break;

          case "prevVideo":
            if (e.repeat) return;
            targetController2.previousVideo();
            scheduleHoverCheckAfterNavigation();
            break;

          case "frameForward":
          case "frameBackward":
            {
                const dir = action === "frameForward" ? 1 : -1;
                isGlobalKeyReverse = dir === -1;
                if (e.repeat) return;
                if (frameHoldState && frameHoldState.interval) {
                    clearInterval(frameHoldState.interval);
                    frameHoldState = null;
                }
                targetController2.stepFrame(dir);
                const interval = setInterval(() => {
                    if (frameHoldState && frameHoldState.controller && frameHoldState.controller.video && frameHoldState.controller.video.isConnected) {
                        frameHoldState.controller.stepFrame(dir);
                    } else {
                        if (frameHoldState && frameHoldState.interval) {
                            clearInterval(frameHoldState.interval);
                        }
                        frameHoldState = null;
                    }
                }, FRAME_HOLD_INTERVAL_MS);
                frameHoldState = {
                    code: code,
                    action: action,
                    interval: interval,
                    controller: targetController2
                };
                break;
            }

          case "popoutVideo":
            targetController2.togglePiP();
            break;

          case "forceFullscreen":
            targetController2.toggleFullscreen();
            break;

          case "toggleSubtitles":
            targetController2.toggleSubtitles();
            break;

          case "toggleVideoControls":
            if (!isControlActiveForAction("toggleVideoControls")) break;
            toggleGlobalControlsBar(targetController2);
            break;

          case "toggleVisibility":
            if (!isControlActiveForAction("toggleVisibility")) break;
            if (hideRestoreTimer) {
                clearTimeout(hideRestoreTimer);
                hideRestoreTimer = null;
            }
            if (isGloballyHidden) {
                restoreControlsVisibility(targetController2);
            } else {
                isGloballyHidden = true;
                if (activeHoveredCtrl) {
                    activeHoveredCtrl.setHovered(false);
                    activeHoveredCtrl = null;
                }
                activeControllers.forEach(ctrl => {
                    if (typeof ctrl.closeAllOverlays === "function") ctrl.closeAllOverlays();
                    if (typeof ctrl.setSubControlsVisible === "function") ctrl.setSubControlsVisible(false);
                    ctrl.updateVisibility();
                });
                targetController2.showHUD("Controls Hidden");
                const duration = parseFloat(currentConfig.hideControlsDuration) || 0;
                if (duration > 0 && !currentConfig.defaultHidden) {
                    hideRestoreTimer = setTimeout(() => {
                        hideRestoreTimer = null;
                        if (isGloballyHidden) {
                            restoreControlsVisibility(targetController2);
                        }
                    }, duration * 1e3);
                }
            }
            break;
        }
    }
    function handleKeyboardKeyUp(e) {
        if (cleanupIfInvalidated()) return;
        if (!e.isTrusted && !e.isForwarded) return;
        if (document.querySelector(".recording-modal.active") || document.querySelector("#recordingModal.active")) return;
        if (isInteractiveInputElement(e)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const code = e.code || (isSpaceKey(null, e) ? "Space" : "");
        const shortcuts = currentConfig.keyboardShortcuts || {};
        if (window === window.top) {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            let targetIframe = fsEl && fsEl.tagName === "IFRAME" ? fsEl : null;
            if (!targetIframe && lastClientX >= 0 && lastClientY >= 0) {
                const el = document.elementFromPoint(lastClientX, lastClientY);
                if (el && el.tagName === "IFRAME") targetIframe = el;
            }
            if (!targetIframe) {
                const iframes = document.querySelectorAll("iframe");
                if (iframes.length === 1) targetIframe = iframes[0];
            }
            if (targetIframe && targetIframe.contentWindow) {
                try {
                    targetIframe.contentWindow.postMessage({
                        type: "gvc_forward_shortcut_keyup",
                        code: code
                    }, "*");
                } catch (err) {}
            }
        }
        if (isGloballyPaused || isDomainExcluded()) {
            const deactivateKey2 = shortcuts.toggleDeactivate !== void 0 ? shortcuts.toggleDeactivate : "KeyT";
            if (reactivateKeyHoldState && (matchKeyToAction(deactivateKey2, code, e, false, false) || !deactivateKey2 && code === "KeyT" || reactivateKeyHoldState.code && code === reactivateKeyHoldState.code)) {
                if (reactivateKeyHoldState.timer) {
                    clearTimeout(reactivateKeyHoldState.timer);
                    reactivateKeyHoldState.timer = null;
                }
                if (reactivateKeyHoldState.hudTimer) {
                    clearTimeout(reactivateKeyHoldState.hudTimer);
                    reactivateKeyHoldState.hudTimer = null;
                }
                if (reactivateKeyHoldState.triggered || reactivateKeyHoldState.hudShown) {
                    stopShortcutEvent(e);
                }
                reactivateKeyHoldState = null;
            }
            activeInterceptedKeys.clear();
            isGlobalKeyDown = false;
            onHoldStateReleased();
            isGlobalKeyReverse = false;
            return;
        }
        const playKey = shortcuts.togglePlay !== void 0 ? shortcuts.togglePlay : "Space";
        const isPlaySpaceAssigned = matchKeyToAction(playKey, "Space", null, false, false);
        const isSpaceRelease = isPlaySpaceAssigned && isSpaceKey(code, e) || spaceHoldState && (code === spaceHoldState.code || isSpaceKey(spaceHoldState.code, null));
        const isIntercepted = activeInterceptedKeys.has(code) || isSpaceRelease && activeInterceptedKeys.has("Space");
        activeInterceptedKeys.delete(code);
        if (isSpaceRelease) activeInterceptedKeys.delete("Space");
        if (isIntercepted || isPlaySpaceAssigned && isSpaceRelease) {
            stopShortcutEvent(e);
        }
        if (spaceHoldState && (isSpaceRelease || code === spaceHoldState.code || isPlaySpaceAssigned && code === "Space" || matchKeyToAction(playKey, code, e, true, false))) {
            if (spaceHoldState.timer) {
                clearTimeout(spaceHoldState.timer);
                spaceHoldState.timer = null;
            }
            const holdTime = Date.now() - spaceHoldState.startTime;
            const ctrl = spaceHoldState.controller;
            const prevSpeed = spaceHoldState.previousSpeed;
            const wasHolding = spaceHoldState.isHolding2x || holdTime >= HOLD_BOOST_THRESHOLD_MS;
            if (ctrl && ctrl.video && ctrl.video.isConnected) {
                if (wasHolding) {
                    spaceHoldState.isHolding2x = false;
                    ctrl.setSpeed(prevSpeed, true, false, false);
                    dismissYouTubeSpeedmaster();
                    if (spaceHoldState.wasPaused) {
                        ctrl.video.pause();
                        ctrl.showHUD("Paused", false, true);
                    } else {
                        ctrl.showHUD(`Speed: ${prevSpeed.toFixed(2)}x`, false, true);
                    }
                    setTimeout(() => {
                        if (ctrl && ctrl.video && ctrl.video.isConnected) {
                            if (Math.abs(ctrl.video.playbackRate - prevSpeed) > .01) {
                                ctrl.setSpeed(prevSpeed, true, false, false);
                            }
                            dismissYouTubeSpeedmaster();
                        }
                    }, 50);
                } else {
                    ctrl.togglePlayPause();
                }
            }
            spaceHoldState = null;
        }
        if (superSpeedHoldState && (code === superSpeedHoldState.code || matchKeyToAction(shortcuts.toggleSuperSpeed, code, e, false, false))) {
            if (superSpeedHoldState.timer) {
                clearTimeout(superSpeedHoldState.timer);
                superSpeedHoldState.timer = null;
            }
            const holdTime = Date.now() - superSpeedHoldState.startTime;
            const ctrl = superSpeedHoldState.controller;
            const prevSpeed = superSpeedHoldState.previousSpeed;
            const isHoldEnabled = currentConfig.holdSuperSpeedEnabled !== false;
            const wasHolding = superSpeedHoldState.isHolding || isHoldEnabled && holdTime >= HOLD_BOOST_THRESHOLD_MS;
            if (ctrl && ctrl.video && ctrl.video.isConnected) {
                if (wasHolding) {
                    superSpeedHoldState.isHolding = false;
                    ctrl.setSpeed(prevSpeed, true, false, false);
                    if (superSpeedHoldState.wasPaused) {
                        ctrl.video.pause();
                        ctrl.showHUD("Paused", false, true);
                    } else {
                        ctrl.showHUD(`Speed: ${prevSpeed.toFixed(2)}x`, false, true);
                    }
                } else if (!isHoldEnabled || holdTime < HOLD_BOOST_THRESHOLD_MS) {
                    ctrl.toggleSuperSpeed();
                }
            }
            superSpeedHoldState = null;
        }
        if (favoriteSpeedHoldState && (code === favoriteSpeedHoldState.code || matchKeyToAction(shortcuts.toggleFavoriteSpeed, code, e, false, false))) {
            if (favoriteSpeedHoldState.timer) {
                clearTimeout(favoriteSpeedHoldState.timer);
                favoriteSpeedHoldState.timer = null;
            }
            const holdTime = Date.now() - favoriteSpeedHoldState.startTime;
            const ctrl = favoriteSpeedHoldState.controller;
            const prevSpeed = favoriteSpeedHoldState.previousSpeed;
            const isHoldEnabled = currentConfig.holdFavoriteSpeedEnabled !== false;
            const wasHolding = favoriteSpeedHoldState.isHolding || isHoldEnabled && holdTime >= HOLD_BOOST_THRESHOLD_MS;
            if (ctrl && ctrl.video && ctrl.video.isConnected) {
                if (wasHolding) {
                    favoriteSpeedHoldState.isHolding = false;
                    ctrl.setSpeed(prevSpeed, true, false, false);
                    if (favoriteSpeedHoldState.wasPaused) {
                        ctrl.video.pause();
                        ctrl.showHUD("Paused", false, true);
                    } else {
                        ctrl.showHUD(`Speed: ${prevSpeed.toFixed(2)}x`, false, true);
                    }
                } else if (!isHoldEnabled || holdTime < HOLD_BOOST_THRESHOLD_MS) {
                    ctrl.toggleFavoriteSpeed();
                }
            }
            favoriteSpeedHoldState = null;
        }
        if (frameHoldState && (code === frameHoldState.code || matchKeyToAction(shortcuts.frameForward, code, e, false, false) || matchKeyToAction(shortcuts.frameBackward, code, e, false, false))) {
            if (frameHoldState.interval) {
                clearInterval(frameHoldState.interval);
            }
            frameHoldState = null;
        }
        const deactivateKey = shortcuts.toggleDeactivate !== void 0 ? shortcuts.toggleDeactivate : "KeyT";
        if (reactivateKeyHoldState && (code === reactivateKeyHoldState.code || matchKeyToAction(deactivateKey, code, e, false, false))) {
            if (reactivateKeyHoldState.timer) {
                clearTimeout(reactivateKeyHoldState.timer);
                reactivateKeyHoldState.timer = null;
            }
            if (reactivateKeyHoldState.hudTimer) {
                clearTimeout(reactivateKeyHoldState.hudTimer);
                reactivateKeyHoldState.hudTimer = null;
            }
            if (reactivateKeyHoldState.triggered || reactivateKeyHoldState.hudShown) {
                stopShortcutEvent(e);
            }
            reactivateKeyHoldState = null;
        }
        isGlobalKeyDown = false;
        onHoldStateReleased();
        isGlobalKeyReverse = false;
    }
    function handleKeyboardKeyPress(e) {
        if (cleanupIfInvalidated()) return;
        if (!e.isTrusted) return;
        if (document.querySelector(".recording-modal.active") || document.querySelector("#recordingModal.active")) return;
        if (isInteractiveInputElement(e)) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (isGloballyPaused || isDomainExcluded()) return;
        if (activeControllers.size === 0) return;
        const playKey = currentConfig.keyboardShortcuts && currentConfig.keyboardShortcuts.togglePlay !== void 0 ? currentConfig.keyboardShortcuts.togglePlay : "Space";
        if (matchKeyToAction(playKey, e.code, e, true, false) || activeInterceptedKeys.has(e.code) || getMatchingHotkeyAction(e.code, null, e)) {
            stopShortcutEvent(e);
            return;
        }
    }
    function releaseAllHoldStates() {
        isGlobalPointerDown = false;
        isGlobalKeyDown = false;
        isGlobalKeyReverse = false;
        onHoldStateReleased();
        activeInterceptedKeys.clear();
        if (spaceHoldState && spaceHoldState.controller) {
            if (spaceHoldState.timer) clearTimeout(spaceHoldState.timer);
            const ctrl = spaceHoldState.controller;
            if (ctrl.video && ctrl.video.isConnected && spaceHoldState.isHolding2x) {
                ctrl.setSpeed(spaceHoldState.previousSpeed, true, false, false);
                if (spaceHoldState.wasPaused) {
                    ctrl.video.pause();
                }
            }
            spaceHoldState = null;
        }
        if (superSpeedHoldState && superSpeedHoldState.controller) {
            if (superSpeedHoldState.timer) clearTimeout(superSpeedHoldState.timer);
            const ctrl = superSpeedHoldState.controller;
            if (ctrl.video && ctrl.video.isConnected && superSpeedHoldState.isHolding) {
                ctrl.setSpeed(superSpeedHoldState.previousSpeed, true, false, false);
                if (superSpeedHoldState.wasPaused) {
                    ctrl.video.pause();
                }
            }
            superSpeedHoldState = null;
        }
        if (favoriteSpeedHoldState && favoriteSpeedHoldState.controller) {
            if (favoriteSpeedHoldState.timer) clearTimeout(favoriteSpeedHoldState.timer);
            const ctrl = favoriteSpeedHoldState.controller;
            if (ctrl.video && ctrl.video.isConnected && favoriteSpeedHoldState.isHolding) {
                ctrl.setSpeed(favoriteSpeedHoldState.previousSpeed, true, false, false);
                if (favoriteSpeedHoldState.wasPaused) {
                    ctrl.video.pause();
                }
            }
            favoriteSpeedHoldState = null;
        }
        if (clickHoldState && clickHoldState.controller) {
            if (clickHoldState.timer) clearTimeout(clickHoldState.timer);
            const ctrl = clickHoldState.controller;
            if (ctrl.video && ctrl.video.isConnected && clickHoldState.isHolding) {
                ctrl.setSpeed(clickHoldState.previousSpeed, true, false, false);
                if (clickHoldState.wasPaused) {
                    ctrl.video.pause();
                }
            }
            clickHoldState = null;
            dismissYouTubeSpeedmaster();
        }
        if (reactivateKeyHoldState) {
            if (reactivateKeyHoldState.timer) clearTimeout(reactivateKeyHoldState.timer);
            if (reactivateKeyHoldState.hudTimer) clearTimeout(reactivateKeyHoldState.hudTimer);
            reactivateKeyHoldState = null;
        }
        if (frameHoldState) {
            if (frameHoldState.interval) clearInterval(frameHoldState.interval);
            frameHoldState = null;
        }
    }
    function onWindowBlur() {
        if (typeof cursorInactivityTimer !== "undefined" && cursorInactivityTimer) {
            clearTimeout(cursorInactivityTimer);
            cursorInactivityTimer = null;
        }
        if (typeof unhideCursor === "function") unhideCursor();
        releaseAllHoldStates();
    }
    function onGlobalPointerOver(e) {
        if (cleanupIfInvalidated()) return;
        if (window === window.top && e && e.target && e.target.tagName === "IFRAME") {
            const act = document.activeElement;
            const isActInput = act && (act.tagName === "INPUT" || act.tagName === "TEXTAREA" || act.isContentEditable);
            if (!isActInput && document.activeElement !== e.target) {
                try {
                    e.target.focus({
                        preventScroll: true
                    });
                } catch (err) {}
            }
        }
    }
    function onCrossFrameMessage(ev) {
        if (!ev || !ev.data) return;
        if (ev.data.type === "gvc_forward_shortcut") {
            if (isGloballyPaused || isDomainExcluded()) return;
            const fwdAction = ev.data.action;
            if (!fwdAction) return;
            let target = getActiveTargetController();
            if (!target || !target.video || !target.video.isConnected) {
                scanVideos();
                target = getActiveTargetController();
            }
            if (!target || !target.video) {
                if (activeControllers.size > 0) target = activeControllers.values().next().value;
            }
            if (target && target.video) {
                try {
                    if (!target.video.hasAttribute("tabindex")) target.video.tabIndex = -1;
                    target.video.focus({
                        preventScroll: true
                    });
                } catch (err) {}
                executeShortcutAction(fwdAction, target, {
                    code: ev.data.code,
                    key: ev.data.key,
                    repeat: ev.data.repeat,
                    shiftKey: ev.data.shiftKey,
                    isTrusted: false,
                    isForwarded: true,
                    stopPropagation: () => {},
                    preventDefault: () => {}
                }, ev.data.code);
            }
        } else if (ev.data.type === "gvc_forward_shortcut_keyup") {
            if (isGloballyPaused || isDomainExcluded()) return;
            handleKeyboardKeyUp({
                code: ev.data.code,
                isTrusted: false,
                isForwarded: true,
                stopPropagation: () => {},
                preventDefault: () => {}
            });
        }
    }
    async function start() {
        if (cleanupIfInvalidated()) return;
        window.addEventListener("keydown", handleKeyboardShortcut, true);
        window.addEventListener("keyup", handleKeyboardKeyUp, true);
        window.addEventListener("keypress", handleKeyboardKeyPress, true);
        document.addEventListener("keydown", handleKeyboardShortcut, true);
        document.addEventListener("keyup", handleKeyboardKeyUp, true);
        document.addEventListener("keypress", handleKeyboardKeyPress, true);
        window.addEventListener("blur", onWindowBlur);
        window.addEventListener("message", onCrossFrameMessage);
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) releaseAllHoldStates();
        });
        window.addEventListener("pointermove", onGlobalPointerMove, {
            passive: true
        });
        window.addEventListener("pointerover", onGlobalPointerOver, {
            passive: true
        });
        window.addEventListener("pointerdown", onUserInteraction, {
            capture: true,
            passive: true
        });
        window.addEventListener("pointerup", onGlobalPointerUp, {
            capture: true,
            passive: false
        });
        window.addEventListener("pointercancel", onGlobalPointerUp, {
            capture: true,
            passive: false
        });
        window.addEventListener("mouseup", onGlobalPointerUp, {
            capture: true,
            passive: false
        });
        window.addEventListener("mouseup", onGlobalMouseUpCapture, true);
        window.addEventListener("click", onGlobalClickCapture, true);
        window.addEventListener("dblclick", onGlobalDblClickCapture, true);
        window.addEventListener("scroll", onGlobalScroll, {
            capture: true,
            passive: true
        });
        document.addEventListener("scroll", onGlobalScroll, {
            capture: true,
            passive: true
        });
        document.addEventListener("mouseleave", onGlobalPointerLeaveDoc, {
            passive: true
        });
        window.addEventListener("wheel", onGlobalWheel, {
            capture: true,
            passive: false
        });
        document.addEventListener("transitionend", () => {
            if (activeHoveredCtrl) activeHoveredCtrl.updatePosition();
        }, {
            passive: true
        });
        document.addEventListener("animationend", () => {
            if (activeHoveredCtrl) activeHoveredCtrl.updatePosition();
        }, {
            passive: true
        });
        await initKeyboardLayout();
        await loadConfig();
        if (cleanupIfInvalidated()) return;
        isGloballyPaused = isDomainExcluded();
        if (currentConfig.defaultHidden) {
            isGloballyHidden = true;
        }
        if (isControlsForcedGlobal === null && isDomainControlsForced()) {
            isControlsForcedGlobal = true;
        }
        scanVideos();
        if (document.body) {
            if (observer) observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                if (cleanupIfInvalidated()) return;
                if (observer && document.body) {
                    observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                }
                scanVideos();
            });
        }
        const onGlobalFullscreen = () => {
            const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
            if (fsEl) {
                scanVideos();
                if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA" || document.activeElement.isContentEditable || document.activeElement.tagName === "BUTTON" || document.activeElement.getAttribute && document.activeElement.getAttribute("role") === "button")) {
                    if (!fsEl.contains(document.activeElement) || document.activeElement.offsetParent === null || document.activeElement.tagName === "BUTTON" || document.activeElement.getAttribute && document.activeElement.getAttribute("role") === "button") {
                        try {
                            document.activeElement.blur();
                        } catch (e) {}
                    }
                }
                if (fsEl.tagName === "IFRAME") {
                    try {
                        fsEl.focus({
                            preventScroll: true
                        });
                    } catch (e) {}
                }
                for (const [v, ctrl] of activeControllers.entries()) {
                    if (v.isConnected && isVideoInFullscreen(v, fsEl)) {
                        activeHoveredCtrl = ctrl;
                        lastHoveredCtrl = ctrl;
                        try {
                            if (v && !v.hasAttribute("tabindex")) v.tabIndex = -1;
                            v.focus({
                                preventScroll: true
                            });
                        } catch (e) {}
                        if (!ctrl._isPageFullscreen && !ctrl._wasControlsForcedBeforeFs) {
                            ctrl.isControlsForced = false;
                            if (ctrl.controlsBar) {
                                ctrl.controlsBar.classList.add("hidden");
                                ctrl.controlsBar.classList.add("hover-hidden");
                                ctrl.updateControlsBarState();
                            }
                            if (typeof ctrl.updateProgressBarButtonState === "function") {
                                ctrl.updateProgressBarButtonState();
                            }
                        }
                        break;
                    }
                }
                [ 50, 150, 300, 600 ].forEach(delay => {
                    setTimeout(() => {
                        const curFs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
                        if (curFs) {
                            if (curFs.tagName === "IFRAME") {
                                try {
                                    curFs.focus({
                                        preventScroll: true
                                    });
                                } catch (e) {}
                            } else {
                                for (const [v, ctrl] of activeControllers.entries()) {
                                    if (v.isConnected && isVideoInFullscreen(v, curFs)) {
                                        if (document.activeElement && (document.activeElement.tagName === "BUTTON" || document.activeElement.getAttribute && document.activeElement.getAttribute("role") === "button")) {
                                            try {
                                                document.activeElement.blur();
                                            } catch (e) {}
                                        }
                                        if (document.activeElement !== v) {
                                            try {
                                                if (!v.hasAttribute("tabindex")) v.tabIndex = -1;
                                                v.focus({
                                                    preventScroll: true
                                                });
                                            } catch (e) {}
                                        }
                                        break;
                                    }
                                }
                            }
                        }
                    }, delay);
                });
            }
            if (!fsEl) {
                activeControllers.forEach(ctrl => {
                    if (ctrl) {
                        ctrl._stopCorruptionWatchdog();
                        if (ctrl._isPageFullscreen) {
                            ctrl.exitForcedFullscreen();
                        }
                    }
                });
                if (document.documentElement && document.documentElement.classList.contains("gvc-page-fullscreen-active")) {
                    document.documentElement.classList.remove("gvc-page-fullscreen-active");
                    if (document.body) document.body.classList.remove("gvc-page-fullscreen-active");
                    document.querySelectorAll("#gvc-fullscreen-backdrop").forEach(b => {
                        try {
                            b.remove();
                        } catch (e) {}
                    });
                    document.querySelectorAll("#gvc-fs-placeholder, [data-gvc-fs-placeholder]").forEach(el => {
                        try {
                            el.remove();
                        } catch (e) {}
                    });
                    document.querySelectorAll(".gvc-page-fullscreen-suppressed").forEach(el => {
                        el.classList.remove("gvc-page-fullscreen-suppressed");
                        el.style.removeProperty("display");
                    });
                    document.querySelectorAll(".gvc-page-fullscreen-ancestor").forEach(el => {
                        el.classList.remove("gvc-page-fullscreen-ancestor");
                    });
                }
            }
        };
        document.addEventListener("fullscreenchange", onGlobalFullscreen);
        document.addEventListener("webkitfullscreenchange", onGlobalFullscreen);
        let lastObservedUrl = window.location.href;
        const onSPANavigation = () => {
            if (cleanupIfInvalidated()) return;
            scanVideos();
            if (getDomainSpeed() !== null) {
                activeControllers.forEach(ctrl => {
                    if (ctrl && typeof ctrl.applyEffectiveSpeed === "function") {
                        ctrl.applyEffectiveSpeed(true);
                    }
                });
            }
            if (getDomainVolume() !== null) {
                activeControllers.forEach(ctrl => {
                    if (ctrl && typeof ctrl.applyEffectiveVolume === "function") {
                        ctrl.applyEffectiveVolume(true);
                    }
                });
            }
            activeControllers.forEach(ctrl => {
                if (ctrl && typeof ctrl.applyAutoScrollLoopPolicy === "function") {
                    ctrl.applyAutoScrollLoopPolicy();
                    setTimeout(() => {
                        if (ctrl && typeof ctrl.applyAutoScrollLoopPolicy === "function") {
                            ctrl.applyAutoScrollLoopPolicy();
                        }
                    }, 250);
                }
            });
            reportVideoPresence();
        };
        window.addEventListener("yt-navigate-finish", onSPANavigation);
        window.addEventListener("popstate", onSPANavigation);
        window.addEventListener("hashchange", onSPANavigation);
        periodicCleanupInterval = setInterval(() => {
            if (cleanupIfInvalidated()) return;
            if (window.location.href !== lastObservedUrl) {
                lastObservedUrl = window.location.href;
                onSPANavigation();
            }
            for (const [video, ctrl] of activeControllers.entries()) {
                if (!video.isConnected) {
                    if (activeHoveredCtrl === ctrl) activeHoveredCtrl = null;
                    if (lastHoveredCtrl === ctrl) lastHoveredCtrl = null;
                    ctrl.destroy();
                    activeControllers.delete(video);
                }
            }
            if (!isGloballyPaused && !isDomainExcluded()) {
                scanVideos();
            }
            reportVideoPresence();
        }, 2500);
        try {
            const initTipModalObserver = () => {
                const tipModalEl = document.getElementById("tipModal");
                if (tipModalEl) {
                    if (tipModalEl.classList.contains("active")) {
                        setSupportActive(true, 12e4);
                    }
                    const tipObserver = new MutationObserver(() => {
                        const isActive = tipModalEl.classList.contains("active");
                        setSupportActive(isActive, 12e4);
                    });
                    tipObserver.observe(tipModalEl, {
                        attributes: true,
                        attributeFilter: [ "class" ]
                    });
                }
            };
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", initTipModalObserver);
            } else {
                initTipModalObserver();
            }
        } catch (e) {}
    }
    start();
})();