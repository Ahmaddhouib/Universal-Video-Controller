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
    function applyActiveTheme(cfg) {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        const themeKey = cfg && cfg.theme || "cyberNeon";
        let activeCol = "#38bdf8";
        let stateCol = "#a855f7";
        if (themeKey === "custom") {
            activeCol = cfg && cfg.activeColor || "#38bdf8";
            stateCol = cfg && cfg.activeStateColor || "#a855f7";
        } else if (THEME_PRESETS[themeKey]) {
            activeCol = THEME_PRESETS[themeKey].activeColor;
            stateCol = THEME_PRESETS[themeKey].activeStateColor;
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
    const currentDomainEl = document.getElementById("currentDomain");
    const siteToggleBtn = document.getElementById("siteToggleBtn");
    const siteToggleText = document.getElementById("siteToggleText");
    const statusDot = document.getElementById("statusDot");
    const domainVideoSub = document.getElementById("domainVideoSub");
    const siteCustomCard = document.getElementById("siteCustomCard");
    const siteInternalNotice = document.getElementById("siteInternalNotice");
    const clearAllSiteRulesBtn = document.getElementById("clearAllSiteRulesBtn");
    const siteStatusBadge = document.getElementById("siteStatusBadge");
    const siteStatusBadgeText = document.getElementById("siteStatusBadgeText");
    const siteSpeedInput = document.getElementById("siteSpeedInput");
    const siteSpeedSub = document.getElementById("siteSpeedSub");
    const siteVolumeInput = document.getElementById("siteVolumeInput");
    const siteVolumeSub = document.getElementById("siteVolumeSub");
    const siteMuteSelect = document.getElementById("siteMuteSelect");
    const siteLoopSelect = document.getElementById("siteLoopSelect");
    const sitePlaySelect = document.getElementById("sitePlaySelect");
    const openSettingsBtn = document.getElementById("openSettingsBtn");
    const openTipBtn = document.getElementById("openTipBtn");
    const rateUsLink = document.getElementById("rateUsLink");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const popupToast = document.getElementById("popupToast");
    let popupToastTimeout = null;
    function showPopupToast(msg) {
        if (!popupToast) return;
        popupToast.textContent = msg;
        popupToast.classList.add("show");
        clearTimeout(popupToastTimeout);
        popupToastTimeout = setTimeout(() => {
            popupToast.classList.remove("show");
        }, 2800);
    }
    const versionTag = document.querySelector(".version-tag");
    if (versionTag && typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.getManifest === "function") {
        try {
            const manifest = chrome.runtime.getManifest();
            if (manifest && manifest.version) {
                versionTag.textContent = `v${manifest.version}`;
            }
        } catch (e) {}
    }
    let tab = null;
    if (typeof chrome !== "undefined" && chrome.tabs && typeof chrome.tabs.query === "function") {
        try {
            const tabs = await chrome.tabs.query({
                active: true,
                currentWindow: true
            });
            tab = tabs && tabs[0];
        } catch (e) {}
    }
    let currentHostname = "";
    function setInputsDisabled(disabled) {
        if (siteSpeedInput) siteSpeedInput.disabled = disabled;
        if (siteVolumeInput) siteVolumeInput.disabled = disabled;
        if (siteMuteSelect) siteMuteSelect.disabled = disabled;
        if (siteLoopSelect) siteLoopSelect.disabled = disabled;
        if (sitePlaySelect) sitePlaySelect.disabled = disabled;
    }
    let isBrowserInternalPage = false;
    if (tab && tab.url && (tab.url.startsWith("http:") || tab.url.startsWith("https:") || tab.url.startsWith("file:"))) {
        try {
            const currentUrl = new URL(tab.url);
            currentHostname = currentUrl.hostname || (currentUrl.protocol === "file:" ? "local_file" : "");
            currentDomainEl.textContent = currentHostname === "local_file" ? "Local Test Page" : currentHostname;
            if (siteInternalNotice) siteInternalNotice.style.display = "none";
            if (siteToggleBtn) siteToggleBtn.style.display = "flex";
            setInputsDisabled(false);
        } catch (e) {
            isBrowserInternalPage = true;
            currentDomainEl.textContent = "Special Page";
            if (siteInternalNotice) siteInternalNotice.style.display = "block";
            if (siteToggleBtn) siteToggleBtn.style.display = "none";
            setInputsDisabled(true);
        }
    } else {
        isBrowserInternalPage = true;
        currentDomainEl.textContent = "Browser Internal Page";
        if (siteToggleBtn) siteToggleBtn.style.display = "none";
        if (siteInternalNotice) siteInternalNotice.style.display = "block";
        setInputsDisabled(true);
    }
    const LAYOUT_PRESETS = {
        qwerty: {
            togglePlay: "Space",
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "KeyM",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: "KeyC",
            shortSkipBackward: "KeyX",
            longSkipForward: "KeyV",
            longSkipBackward: "KeyZ",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT"
        },
        azerty: {
            togglePlay: "Space",
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "Semicolon",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: "KeyC",
            shortSkipBackward: "KeyX",
            longSkipForward: "KeyV",
            longSkipBackward: "KeyZ",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT"
        },
        qwertz: {
            togglePlay: "Space",
            speedUp: "KeyD",
            speedDown: "KeyA",
            resetSpeed: "KeyR",
            volumeUp: "KeyW",
            volumeDown: "KeyS",
            toggleMute: "KeyM",
            toggleFavoriteSpeed: "KeyQ",
            toggleSuperSpeed: "KeyE",
            toggleRepeat: "KeyL",
            shortSkipForward: "KeyC",
            shortSkipBackward: "KeyX",
            longSkipForward: "KeyV",
            longSkipBackward: "KeyY",
            nextVideo: "KeyK",
            prevVideo: "KeyJ",
            frameBackward: "KeyB",
            frameForward: "KeyN",
            popoutVideo: "KeyP",
            forceFullscreen: "KeyF",
            toggleVisibility: "KeyH",
            toggleDeactivate: "KeyT"
        }
    };
    let currentConfig = {};
    try {
        if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
            const storageData = await chrome.storage.sync.get("config");
            currentConfig = storageData && storageData.config || {};
            applyActiveTheme(currentConfig);
        }
        if (currentConfig.keyboardShortcuts) {
            if (!currentConfig.keyboardShortcuts.forceFullscreen) {
                currentConfig.keyboardShortcuts.forceFullscreen = "KeyF";
            }
            if (!currentConfig.keyboardShortcuts.nextVideo) {
                currentConfig.keyboardShortcuts.nextVideo = "KeyK";
            }
            if (!currentConfig.keyboardShortcuts.prevVideo) {
                currentConfig.keyboardShortcuts.prevVideo = "KeyJ";
            }
        }
    } catch (err) {
        console.error("Storage read error:", err);
    }
    if (!currentConfig.layoutDetected) {
        try {
            if (navigator.keyboard && typeof navigator.keyboard.getLayoutMap === "function") {
                const map = await navigator.keyboard.getLayoutMap();
                const qVal = (map.get("KeyQ") || "").toLowerCase();
                const wVal = (map.get("KeyW") || "").toLowerCase();
                const zVal = (map.get("KeyZ") || "").toLowerCase();
                let detected = "qwerty";
                if (qVal === "a" || wVal === "z") detected = "azerty"; else if (zVal === "y") detected = "qwertz"; else {
                    const lang = (navigator.language || "").toLowerCase();
                    if (lang.startsWith("fr")) detected = "azerty"; else if (lang.startsWith("de")) detected = "qwertz";
                }
                currentConfig.keyboardLayout = detected;
                currentConfig.keyboardShortcuts = Object.assign({}, LAYOUT_PRESETS[detected] || LAYOUT_PRESETS.qwerty);
                currentConfig.layoutDetected = true;
                chrome.storage.sync.set({
                    config: currentConfig
                });
            }
        } catch (e) {}
    }
    function getDomainKey() {
        return currentHostname ? currentHostname.toLowerCase().replace(/^www\./, "") : "";
    }
    function getRootDomainKey() {
        if (!currentHostname) return "";
        const parts = currentHostname.toLowerCase().replace(/^www\./, "").split(".");
        if (parts.length >= 2) {
            return parts.slice(-2).join(".");
        }
        return currentHostname.toLowerCase();
    }
    function isDomainExcluded(cfg) {
        if (!cfg || !cfg.excludedDomains || !currentHostname) return false;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        return (cfg.excludedDomains || []).some(d => {
            const norm = String(d).toLowerCase().replace(/^www\./, "");
            return norm === key || norm === hostLower || rootKey && norm === rootKey;
        });
    }
    function getSiteSpeedForHostname(cfg) {
        if (!cfg || !cfg.siteSpeeds || !currentHostname) return null;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        let raw = null;
        if (cfg.siteSpeeds[key] !== void 0) {
            raw = Number(cfg.siteSpeeds[key]);
        } else if (cfg.siteSpeeds["www." + key] !== void 0) {
            raw = Number(cfg.siteSpeeds["www." + key]);
        } else if (cfg.siteSpeeds[hostLower] !== void 0) {
            raw = Number(cfg.siteSpeeds[hostLower]);
        } else if (rootKey && cfg.siteSpeeds[rootKey] !== void 0) {
            raw = Number(cfg.siteSpeeds[rootKey]);
        }
        if (raw !== null && !isNaN(raw) && raw > 0) {
            return Math.min(100, raw);
        }
        return null;
    }
    function getSiteVolumeForHostname(cfg) {
        if (!cfg || !cfg.siteVolumes || !currentHostname) return null;
        const isBoost = cfg.volumeBoostEnabled === true;
        const maxVal = isBoost ? 6 : 1;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        let raw = null;
        if (cfg.siteVolumes[key] !== void 0) {
            raw = Number(cfg.siteVolumes[key]);
        } else if (cfg.siteVolumes["www." + key] !== void 0) {
            raw = Number(cfg.siteVolumes["www." + key]);
        } else if (cfg.siteVolumes[hostLower] !== void 0) {
            raw = Number(cfg.siteVolumes[hostLower]);
        } else if (rootKey && cfg.siteVolumes[rootKey] !== void 0) {
            raw = Number(cfg.siteVolumes[rootKey]);
        }
        if (raw !== null && !isNaN(raw) && raw >= 0) {
            const clamped = Math.min(maxVal, raw);
            return clamped;
        }
        return null;
    }
    function getSiteMuteRuleForHostname(cfg) {
        if (!cfg || !cfg.siteMuteRules || !currentHostname) return null;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        return cfg.siteMuteRules[key] || cfg.siteMuteRules["www." + key] || cfg.siteMuteRules[hostLower] || rootKey && cfg.siteMuteRules[rootKey] || null;
    }
    function getSiteLoopRuleForHostname(cfg) {
        if (!cfg || !cfg.siteLoopRules || !currentHostname) return null;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        return cfg.siteLoopRules[key] || cfg.siteLoopRules["www." + key] || cfg.siteLoopRules[hostLower] || rootKey && cfg.siteLoopRules[rootKey] || null;
    }
    function getSitePlayRuleForHostname(cfg) {
        if (!cfg || !cfg.sitePlayRules || !currentHostname) return null;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        return cfg.sitePlayRules[key] || cfg.sitePlayRules["www." + key] || cfg.sitePlayRules[hostLower] || rootKey && cfg.sitePlayRules[rootKey] || null;
    }
    function updateActiveToggleUI(isActive, animate = true) {
        if (!siteToggleBtn) return;
        if (!animate) {
            siteToggleBtn.classList.add("no-transition");
        } else {
            siteToggleBtn.classList.remove("no-transition");
        }
        if (isActive) {
            siteToggleBtn.classList.add("is-active");
            if (statusDot) statusDot.className = "status-dot";
            if (siteToggleText) siteToggleText.textContent = "Active";
        } else {
            siteToggleBtn.classList.remove("is-active");
            if (statusDot) statusDot.className = "status-dot paused";
            if (siteToggleText) siteToggleText.textContent = "Inactive";
        }
        if (!animate) {
            void siteToggleBtn.offsetHeight;
        }
    }
    function updateExclusionUI(isExcluded) {
        if (isExcluded) {
            if (siteStatusBadge) {
                siteStatusBadge.className = "site-status-badge is-excluded";
            }
            if (siteStatusBadgeText) {
                siteStatusBadgeText.textContent = "Excluded";
            }
        } else {
            if (siteStatusBadge) {
                siteStatusBadge.className = "site-status-badge is-not-excluded";
            }
            if (siteStatusBadgeText) {
                siteStatusBadgeText.textContent = "Not Excluded";
            }
        }
    }
    function updateVideoPresenceUI(videoCount) {
        if (!domainVideoSub) return;
        if (isBrowserInternalPage || !currentHostname) {
            domainVideoSub.style.display = "none";
            return;
        }
        const count = Number(videoCount) || 0;
        if (count <= 0) {
            domainVideoSub.textContent = "No video detected";
            domainVideoSub.style.display = "block";
        } else {
            domainVideoSub.style.display = "none";
        }
    }
    function updateSiteCustomUI(updateInputs = true) {
        const isBoost = currentConfig.volumeBoostEnabled === true;
        const maxVolume = 600;
        const defSpd = currentConfig.defaultSpeed !== void 0 && currentConfig.defaultSpeed !== null ? Number(currentConfig.defaultSpeed) : 1;
        const defVol = currentConfig.defaultVolume !== void 0 && currentConfig.defaultVolume !== null ? currentConfig.defaultVolume : 1;
        const defPct = Math.round(defVol <= 6 ? defVol * 100 : defVol);
        if (siteSpeedInput) {
            siteSpeedInput.placeholder = defSpd.toFixed(2);
        }
        if (siteVolumeInput) {
            siteVolumeInput.max = maxVolume;
            siteVolumeInput.placeholder = String(defPct);
        }
        if (!currentHostname) {
            if (updateInputs) {
                if (siteSpeedInput) siteSpeedInput.value = defSpd.toFixed(2);
                if (siteVolumeInput) siteVolumeInput.value = String(defPct);
            }
            if (siteSpeedSub) siteSpeedSub.textContent = `Default: ${defSpd.toFixed(2)}x`;
            if (siteVolumeSub) siteVolumeSub.textContent = `Default: ${defPct}%`;
            if (clearAllSiteRulesBtn) clearAllSiteRulesBtn.style.display = "none";
            return;
        }
        let speedVal = getSiteSpeedForHostname(currentConfig);
        if (speedVal !== null) {
            if (speedVal > 16) {
                speedVal = 16;
                saveSiteSpeed(16);
            }
            if (updateInputs || document.activeElement !== siteSpeedInput) {
                if (siteSpeedInput) siteSpeedInput.value = speedVal.toFixed(2);
            }
            if (siteSpeedSub) siteSpeedSub.textContent = `Custom: ${speedVal.toFixed(2)}x`;
        } else {
            if (updateInputs || document.activeElement !== siteSpeedInput) {
                if (siteSpeedInput) siteSpeedInput.value = defSpd.toFixed(2);
            }
            if (siteSpeedSub) siteSpeedSub.textContent = `Default: ${defSpd.toFixed(2)}x`;
        }
        const volumeVal = getSiteVolumeForHostname(currentConfig);
        if (volumeVal !== null) {
            let pct = Math.round(volumeVal * 100);
            if (!isBoost && pct > 100) {
                pct = 100;
            }
            if (updateInputs || document.activeElement !== siteVolumeInput) {
                if (siteVolumeInput) siteVolumeInput.value = pct;
            }
            if (siteVolumeSub) siteVolumeSub.textContent = `Custom: ${pct}%${isBoost && pct > 100 ? " (Boost)" : ""}`;
            if (!isBoost && currentConfig.siteVolumes && currentConfig.siteVolumes[getDomainKey()] > 1) {
                saveSiteVolume(1);
            }
        } else {
            if (updateInputs || document.activeElement !== siteVolumeInput) {
                if (siteVolumeInput) siteVolumeInput.value = String(defPct);
            }
            if (siteVolumeSub) siteVolumeSub.textContent = `Default: ${defPct}%`;
        }
        const muteVal = getSiteMuteRuleForHostname(currentConfig);
        if (siteMuteSelect) siteMuteSelect.value = muteVal === "unmute" || muteVal === "mute" ? muteVal : "none";
        const loopVal = getSiteLoopRuleForHostname(currentConfig);
        if (siteLoopSelect) siteLoopSelect.value = loopVal === "loop" || loopVal === "unloop" ? loopVal : "none";
        const playVal = getSitePlayRuleForHostname(currentConfig);
        if (sitePlaySelect) sitePlaySelect.value = playVal === "pause" || playVal === "play" ? playVal : "none";
        const hasAnyCustomRule = speedVal !== null || volumeVal !== null || muteVal !== null || loopVal !== null || playVal !== null;
        if (clearAllSiteRulesBtn) {
            clearAllSiteRulesBtn.style.display = hasAnyCustomRule ? "inline-block" : "none";
        }
    }
    const initialExcluded = isDomainExcluded(currentConfig);
    updateExclusionUI(initialExcluded);
    updateActiveToggleUI(!initialExcluded, false);
    updateVideoPresenceUI(0);
    updateSiteCustomUI(true);
    requestAnimationFrame(() => {
        if (siteToggleBtn) siteToggleBtn.classList.remove("no-transition");
    });
    if (tab && tab.id && currentHostname) {
        try {
            chrome.runtime.sendMessage({
                type: "getTabVideoPresence",
                tabId: tab.id
            }, bgRes => {
                if (!chrome.runtime.lastError && bgRes && bgRes.totalVideos !== void 0) {
                    updateVideoPresenceUI(bgRes.totalVideos);
                }
            });
        } catch (e) {}
        const handleStatusResponse = res => {
            if (chrome.runtime.lastError || !res) {
                return;
            }
            if (res.domain) {
                const resNorm = String(res.domain).toLowerCase().replace(/^www\./, "");
                const curNorm = String(currentHostname).toLowerCase().replace(/^www\./, "");
                if (resNorm !== curNorm && !curNorm.endsWith("." + resNorm) && !resNorm.endsWith("." + curNorm) && resNorm !== "local_file") {
                    return;
                }
            }
            const isExcluded = res.isExcluded !== void 0 ? !!res.isExcluded : isDomainExcluded(currentConfig);
            updateExclusionUI(isExcluded);
            const isActive = res.isActive !== void 0 ? !!res.isActive : res.enabled !== void 0 ? !!res.enabled : !isExcluded;
            updateActiveToggleUI(isActive, false);
            const count = res.videoCount !== void 0 ? Number(res.videoCount) : res.hasVideo ? 1 : 0;
            if (count > 0) {
                updateVideoPresenceUI(count);
            }
        };
        try {
            chrome.tabs.sendMessage(tab.id, {
                type: "getDomainStatus",
                targetDomain: currentHostname
            }, {
                frameId: 0
            }, res => {
                if (chrome.runtime.lastError) {
                    chrome.tabs.sendMessage(tab.id, {
                        type: "getDomainStatus",
                        targetDomain: currentHostname
                    }, handleStatusResponse);
                    return;
                }
                handleStatusResponse(res);
            });
        } catch (e) {
            chrome.tabs.sendMessage(tab.id, {
                type: "getDomainStatus",
                targetDomain: currentHostname
            }, handleStatusResponse);
        }
    } else {
        updateVideoPresenceUI(0);
    }
    async function toggleActiveState() {
        const currentlyActive = siteToggleBtn && siteToggleBtn.classList.contains("is-active");
        const willBeActive = !currentlyActive;
        updateActiveToggleUI(willBeActive, true);
        let list = Array.from(currentConfig.excludedDomains || []);
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        if (willBeActive) {
            list = list.filter(d => {
                const norm = String(d).toLowerCase().replace(/^www\./, "");
                return norm !== key && norm !== hostLower && (!rootKey || norm !== rootKey);
            });
            updateExclusionUI(false);
        } else {
            const isCurrentlyExcluded = list.some(d => {
                const norm = String(d).toLowerCase().replace(/^www\./, "");
                return norm === key || norm === hostLower || rootKey && norm === rootKey;
            });
            if (!isCurrentlyExcluded && (key || hostLower)) {
                list.push(key || hostLower);
            }
            updateExclusionUI(true);
        }
        currentConfig.excludedDomains = list;
        try {
            await chrome.storage.sync.set({
                config: currentConfig
            });
        } catch (e) {}
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: "setDomainStatus",
                enabled: willBeActive
            }, res => {
                if (chrome.runtime.lastError || !res) return;
                if (res.isActive !== void 0) {
                    updateActiveToggleUI(res.isActive, false);
                    if (res.isExcluded !== void 0) {
                        updateExclusionUI(res.isExcluded);
                    }
                }
                if (res.videoCount !== void 0) {
                    updateVideoPresenceUI(res.videoCount);
                }
            });
        }
    }
    async function toggleSiteExclusion() {
        if (!currentHostname) return;
        const storageData = await chrome.storage.sync.get("config");
        const cfg = storageData.config || {};
        let list = Array.from(cfg.excludedDomains || []);
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        const isCurrentlyExcluded = list.some(d => {
            const norm = String(d).toLowerCase().replace(/^www\./, "");
            return norm === key || norm === hostLower || rootKey && norm === rootKey;
        });
        const willBeExcluded = !isCurrentlyExcluded;
        if (willBeExcluded) {
            list.push(key || currentHostname);
        } else {
            list = list.filter(d => {
                const norm = String(d).toLowerCase().replace(/^www\./, "");
                return norm !== key && norm !== hostLower && (!rootKey || norm !== rootKey);
            });
        }
        cfg.excludedDomains = list;
        currentConfig = cfg;
        await chrome.storage.sync.set({
            config: cfg
        });
        updateExclusionUI(willBeExcluded);
        updateActiveToggleUI(!willBeExcluded, true);
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: "setDomainStatus",
                enabled: !willBeExcluded
            }, res => {
                if (chrome.runtime.lastError || !res) return;
                if (res.videoCount !== void 0) {
                    updateVideoPresenceUI(res.videoCount);
                }
            });
        }
    }
    if (siteToggleBtn) siteToggleBtn.addEventListener("click", toggleActiveState);
    async function saveSiteSpeed(speedValue) {
        if (!currentHostname) return;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        const storageData = await chrome.storage.sync.get("config");
        const cfg = storageData.config || {};
        if (!cfg.siteSpeeds) cfg.siteSpeeds = {};
        const isDefault = speedValue === null;
        if (isDefault) {
            delete cfg.siteSpeeds[key];
            delete cfg.siteSpeeds["www." + key];
            delete cfg.siteSpeeds[hostLower];
            if (rootKey) delete cfg.siteSpeeds[rootKey];
        } else {
            cfg.siteSpeeds[key] = Math.max(.1, Math.min(16, speedValue));
        }
        currentConfig = cfg;
        await chrome.storage.sync.set({
            config: cfg
        });
        updateSiteCustomUI(false);
        if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, {
                type: "setSiteSpeed",
                speed: isDefault ? null : speedValue
            }, () => {
                if (chrome.runtime.lastError) {}
            });
        }
    }
    if (siteSpeedInput) {
        const handleSpeedDigitChange = () => {
            if (!currentHostname) return;
            const raw = parseFloat(siteSpeedInput.value);
            if (isNaN(raw) || raw <= 0) return;
            if (raw > 16) {
                siteSpeedInput.value = "16.00";
            }
            const clampedRaw = parseFloat(siteSpeedInput.value);
            const speed = Math.max(.1, Math.min(16, Math.round(clampedRaw * 100) / 100));
            saveSiteSpeed(speed);
        };
        siteSpeedInput.addEventListener("input", handleSpeedDigitChange);
        siteSpeedInput.addEventListener("blur", () => {
            if (!currentHostname) return;
            const raw = parseFloat(siteSpeedInput.value);
            if (isNaN(raw) || raw <= 0) {
                siteSpeedInput.value = "1.00";
                saveSiteSpeed(1);
            } else {
                const speed = Math.max(.1, Math.min(16, Math.round(raw * 100) / 100));
                siteSpeedInput.value = speed.toFixed(2);
                saveSiteSpeed(speed);
            }
            updateSiteCustomUI(true);
        });
        siteSpeedInput.addEventListener("change", () => {
            if (!currentHostname) return;
            const raw = parseFloat(siteSpeedInput.value);
            if (isNaN(raw) || raw <= 0) {
                siteSpeedInput.value = "1.00";
                saveSiteSpeed(1);
            } else {
                const speed = Math.max(.1, Math.min(16, Math.round(raw * 100) / 100));
                siteSpeedInput.value = speed.toFixed(2);
                saveSiteSpeed(speed);
            }
            updateSiteCustomUI(true);
        });
    }
    function promptBoostConfirm(message) {
        return new Promise(resolve => {
            const modal = document.getElementById("boostConfirmModal");
            const msgEl = document.getElementById("boostConfirmModalText");
            const confirmBtn = document.getElementById("boostConfirmBtn");
            const cancelBtn = document.getElementById("boostCancelBtn");
            if (!modal || !confirmBtn || !cancelBtn) {
                resolve(confirm(message || "Setting a volume above 100% requires Volume Boost. Would you like to enable Volume Boost now?"));
                return;
            }
            if (msgEl && message) msgEl.textContent = message;
            modal.style.display = "flex";
            const cleanup = result => {
                modal.style.display = "none";
                confirmBtn.removeEventListener("click", onConfirm);
                cancelBtn.removeEventListener("click", onCancel);
                modal.removeEventListener("click", onBackdropClick);
                window.removeEventListener("keydown", onKeyDown);
                resolve(result);
            };
            const onConfirm = () => cleanup(true);
            const onCancel = () => cleanup(false);
            const onBackdropClick = e => {
                if (e.target === modal) {
                    cleanup(false);
                }
            };
            const onKeyDown = e => {
                if (e.key === "Escape") {
                    cleanup(false);
                }
            };
            confirmBtn.addEventListener("click", onConfirm);
            cancelBtn.addEventListener("click", onCancel);
            modal.addEventListener("click", onBackdropClick);
            window.addEventListener("keydown", onKeyDown);
        });
    }
    async function saveSiteVolume(volumeFraction, enableBoost = false) {
        if (!currentHostname) return;
        const key = getDomainKey();
        const hostLower = currentHostname.toLowerCase();
        const rootKey = getRootDomainKey();
        const storageData = await chrome.storage.sync.get("config");
        const cfg = storageData.config || {};
        if (!cfg.siteVolumes) cfg.siteVolumes = {};
        if (enableBoost) {
            cfg.volumeBoostEnabled = true;
        }
        const isBoost = cfg.volumeBoostEnabled === true;
        const maxFraction = isBoost ? 6 : 1;
        const isDefault = volumeFraction === null;
        if (isDefault) {
            delete cfg.siteVolumes[key];
            delete cfg.siteVolumes["www." + key];
            delete cfg.siteVolumes[hostLower];
            if (rootKey) delete cfg.siteVolumes[rootKey];
        } else {
            const clamped = Math.max(0, Math.min(maxFraction, volumeFraction));
            cfg.siteVolumes[key] = clamped;
        }
        currentConfig = cfg;
        await chrome.storage.sync.set({
            config: cfg
        });
        updateSiteCustomUI(false);
        if (tab && tab.id) {
            const sendVal = isDefault ? null : cfg.siteVolumes ? cfg.siteVolumes[key] : null;
            chrome.tabs.sendMessage(tab.id, {
                type: "setSiteVolume",
                volume: sendVal
            }, () => {
                if (chrome.runtime.lastError) {}
            });
        }
    }
    if (siteVolumeInput) {
        let promptActive = false;
        const handleVolumeDigitChange = () => {
            if (!currentHostname) return;
            const raw = parseFloat(siteVolumeInput.value);
            if (isNaN(raw) || raw < 0) return;
            if (raw > 600) {
                siteVolumeInput.value = 600;
            }
            const isBoost = currentConfig.volumeBoostEnabled === true;
            if (isBoost || raw <= 100) {
                const clampedRaw = parseFloat(siteVolumeInput.value);
                const maxPct = isBoost ? 600 : 100;
                const pct = Math.max(0, Math.min(maxPct, Math.round(clampedRaw)));
                saveSiteVolume(pct / 100);
            }
        };
        const handleVolumeCommit = async () => {
            if (!currentHostname || promptActive) return;
            const raw = parseFloat(siteVolumeInput.value);
            const defVol = currentConfig.defaultVolume !== void 0 && currentConfig.defaultVolume !== null ? currentConfig.defaultVolume : 1;
            const defPct = Math.round(defVol <= 6 ? defVol * 100 : defVol);
            if (isNaN(raw) || raw < 0) {
                siteVolumeInput.value = String(defPct);
                await saveSiteVolume(defVol <= 6 ? defVol : defVol / 100);
                updateSiteCustomUI(true);
                return;
            }
            const pct = Math.max(0, Math.min(600, Math.round(raw)));
            const isBoost = currentConfig.volumeBoostEnabled === true;
            if (pct > 100 && !isBoost) {
                promptActive = true;
                const proceed = await promptBoostConfirm("Setting a volume rule above 100% requires Volume Boost. Would you like to enable Volume Boost now?");
                promptActive = false;
                if (proceed) {
                    currentConfig.volumeBoostEnabled = true;
                    siteVolumeInput.value = pct;
                    await saveSiteVolume(pct / 100, true);
                    showPopupToast(`Volume Boost enabled (${pct}%)`);
                } else {
                    siteVolumeInput.value = 100;
                    await saveSiteVolume(1, false);
                }
            } else {
                const maxPct = isBoost ? 600 : 100;
                const finalPct = Math.max(0, Math.min(maxPct, pct));
                siteVolumeInput.value = finalPct;
                await saveSiteVolume(finalPct / 100);
            }
            updateSiteCustomUI(true);
        };
        siteVolumeInput.addEventListener("input", handleVolumeDigitChange);
        siteVolumeInput.addEventListener("blur", handleVolumeCommit);
        siteVolumeInput.addEventListener("change", handleVolumeCommit);
        siteVolumeInput.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                siteVolumeInput.blur();
            }
        });
    }
    if (siteMuteSelect) {
        siteMuteSelect.addEventListener("change", async () => {
            if (!currentHostname) return;
            const key = getDomainKey();
            const hostLower = currentHostname.toLowerCase();
            const val = siteMuteSelect.value;
            const storageData = await chrome.storage.sync.get("config");
            const cfg = storageData.config || {};
            if (!cfg.siteMuteRules) cfg.siteMuteRules = {};
            if (val === "none") {
                delete cfg.siteMuteRules[key];
                delete cfg.siteMuteRules["www." + key];
                delete cfg.siteMuteRules[hostLower];
            } else {
                cfg.siteMuteRules[key] = val;
            }
            currentConfig = cfg;
            await chrome.storage.sync.set({
                config: cfg
            });
            updateSiteCustomUI(false);
        });
    }
    if (siteLoopSelect) {
        siteLoopSelect.addEventListener("change", async () => {
            if (!currentHostname) return;
            const key = getDomainKey();
            const hostLower = currentHostname.toLowerCase();
            const val = siteLoopSelect.value;
            const storageData = await chrome.storage.sync.get("config");
            const cfg = storageData.config || {};
            if (!cfg.siteLoopRules) cfg.siteLoopRules = {};
            if (val === "none") {
                delete cfg.siteLoopRules[key];
                delete cfg.siteLoopRules["www." + key];
                delete cfg.siteLoopRules[hostLower];
            } else {
                cfg.siteLoopRules[key] = val;
            }
            currentConfig = cfg;
            await chrome.storage.sync.set({
                config: cfg
            });
            updateSiteCustomUI(false);
        });
    }
    if (sitePlaySelect) {
        sitePlaySelect.addEventListener("change", async () => {
            if (!currentHostname) return;
            const key = getDomainKey();
            const hostLower = currentHostname.toLowerCase();
            const val = sitePlaySelect.value;
            const storageData = await chrome.storage.sync.get("config");
            const cfg = storageData.config || {};
            if (!cfg.sitePlayRules) cfg.sitePlayRules = {};
            if (val === "none") {
                delete cfg.sitePlayRules[key];
                delete cfg.sitePlayRules["www." + key];
                delete cfg.sitePlayRules[hostLower];
            } else {
                cfg.sitePlayRules[key] = val;
            }
            currentConfig = cfg;
            await chrome.storage.sync.set({
                config: cfg
            });
            updateSiteCustomUI(false);
        });
    }
    if (clearAllSiteRulesBtn) {
        clearAllSiteRulesBtn.addEventListener("click", async () => {
            if (!currentHostname) return;
            const key = getDomainKey();
            const hostLower = currentHostname.toLowerCase();
            const rootKey = getRootDomainKey();
            const storageData = await chrome.storage.sync.get("config");
            const cfg = storageData.config || {};
            if (cfg.siteSpeeds) {
                delete cfg.siteSpeeds[key];
                delete cfg.siteSpeeds["www." + key];
                delete cfg.siteSpeeds[hostLower];
                if (rootKey) delete cfg.siteSpeeds[rootKey];
            }
            if (cfg.siteVolumes) {
                delete cfg.siteVolumes[key];
                delete cfg.siteVolumes["www." + key];
                delete cfg.siteVolumes[hostLower];
                if (rootKey) delete cfg.siteVolumes[rootKey];
            }
            if (cfg.siteMuteRules) {
                delete cfg.siteMuteRules[key];
                delete cfg.siteMuteRules["www." + key];
                delete cfg.siteMuteRules[hostLower];
                if (rootKey) delete cfg.siteMuteRules[rootKey];
            }
            if (cfg.siteLoopRules) {
                delete cfg.siteLoopRules[key];
                delete cfg.siteLoopRules["www." + key];
                delete cfg.siteLoopRules[hostLower];
                if (rootKey) delete cfg.siteLoopRules[rootKey];
            }
            if (cfg.sitePlayRules) {
                delete cfg.sitePlayRules[key];
                delete cfg.sitePlayRules["www." + key];
                delete cfg.sitePlayRules[hostLower];
                if (rootKey) delete cfg.sitePlayRules[rootKey];
            }
            currentConfig = cfg;
            await chrome.storage.sync.set({
                config: cfg
            });
            updateSiteCustomUI(true);
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, {
                    type: "setSiteSpeed",
                    speed: null
                }, () => {
                    if (chrome.runtime.lastError) {}
                });
                chrome.tabs.sendMessage(tab.id, {
                    type: "setSiteVolume",
                    volume: null
                }, () => {
                    if (chrome.runtime.lastError) {}
                });
            }
        });
    }
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({
                type: "openSettingsPage"
            });
            window.close();
        });
    }
    if (openTipBtn) {
        openTipBtn.addEventListener("click", () => {
            chrome.runtime.sendMessage({
                type: "openTipPage"
            });
            window.close();
        });
    }
    if (rateUsLink) {
        const isFirefoxEnv = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL && chrome.runtime.getURL("").startsWith("moz-extension://") || navigator.userAgent && navigator.userAgent.toLowerCase().includes("firefox");
        const STORE_REVIEW_URL = isFirefoxEnv ? "https://addons.mozilla.org/en-US/firefox/addon/universal-video-controller-ff/" : "https://chromewebstore.google.com/detail/universal-video-controlle/dmepibiilnbbpgchbjdfegbibklhmgdi";
        rateUsLink.href = STORE_REVIEW_URL;
        if (isFirefoxEnv) {
            rateUsLink.title = "Rate us 5 stars on Firefox Add-ons!";
        }
        rateUsLink.addEventListener("click", e => {
            e.preventDefault();
            chrome.tabs.create({
                url: STORE_REVIEW_URL
            });
        });
    }
    function resolveTheme(mode) {
        if (mode === "light") return "light";
        if (mode === "dark") return "dark";
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    function applyUITheme(mode) {
        const effective = mode || currentConfig.uiTheme || "auto";
        const resolved = resolveTheme(effective);
        document.documentElement.setAttribute("data-theme", resolved);
        try {
            localStorage.setItem("gvc_ui_theme", resolved);
        } catch (e) {}
        applyActiveTheme(currentConfig);
    }
    applyUITheme(currentConfig.uiTheme || "auto");
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", async () => {
            const currentResolved = document.documentElement.getAttribute("data-theme") || "dark";
            const nextTheme = currentResolved === "dark" ? "light" : "dark";
            applyUITheme(nextTheme);
            if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync) {
                try {
                    const data = await chrome.storage.sync.get("config");
                    const cfg = data && data.config || {};
                    cfg.uiTheme = nextTheme;
                    await chrome.storage.sync.set({
                        config: cfg
                    });
                } catch (e) {}
            }
        });
    }
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
            if (!currentConfig.uiTheme || currentConfig.uiTheme === "auto") {
                applyUITheme("auto");
            }
        });
    }
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "sync") {
            if (changes.config && changes.config.newValue) {
                const prevBoost = currentConfig.volumeBoostEnabled === true;
                currentConfig = changes.config.newValue;
                const newBoost = currentConfig.volumeBoostEnabled === true;
                if (changes.config.newValue.uiTheme !== void 0) {
                    applyUITheme(changes.config.newValue.uiTheme);
                } else {
                    applyActiveTheme(currentConfig);
                }
                updateExclusionUI(isDomainExcluded(currentConfig));
                updateSiteCustomUI(prevBoost !== newBoost);
            }
        }
    });
    try {
        const manifest = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest ? chrome.runtime.getManifest() : null;
        const versionTag2 = document.getElementById("versionTag");
        if (manifest && manifest.version && versionTag2) {
            versionTag2.textContent = `v${manifest.version}`;
        }
        const checkUpdateBtn = document.getElementById("checkUpdateBtn");
        if (checkUpdateBtn) {
            const isUpdateSupported = typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.requestUpdateCheck === "function";
            if (!isUpdateSupported) {
                checkUpdateBtn.style.display = "none";
            } else {
                let isChecking = false;
                checkUpdateBtn.addEventListener("click", e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isChecking) return;
                    isChecking = true;
                    checkUpdateBtn.classList.add("is-checking");
                    checkUpdateBtn.title = "Checking for updates...";
                    chrome.runtime.requestUpdateCheck((status, details) => {
                        setTimeout(() => {
                            isChecking = false;
                            checkUpdateBtn.classList.remove("is-checking");
                            if (status === "update_available") {
                                const newVer = details && details.version ? `v${details.version}` : "new version";
                                checkUpdateBtn.title = `Update ${newVer} found!`;
                                showPopupToast(`Update ${newVer} found! Downloading...`);
                                setTimeout(() => {
                                    if (typeof chrome !== "undefined" && chrome.runtime && typeof chrome.runtime.reload === "function") {
                                        chrome.runtime.reload();
                                    }
                                }, 1500);
                            } else if (status === "no_update") {
                                checkUpdateBtn.title = "You're on the latest version";
                                showPopupToast("You're on the latest version!");
                                setTimeout(() => {
                                    checkUpdateBtn.title = "Check for updates";
                                }, 2800);
                            } else if (status === "throttled") {
                                checkUpdateBtn.title = "Update check throttled";
                                showPopupToast("Update check throttled. Try again later.");
                                setTimeout(() => {
                                    checkUpdateBtn.title = "Check for updates";
                                }, 2800);
                            } else {
                                checkUpdateBtn.title = "Check for updates";
                                showPopupToast(`Update status: ${status}`);
                            }
                        }, 650);
                    });
                });
            }
        }
    } catch (e) {}
});