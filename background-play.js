(function() {
    "use strict";
    if (window.__GVC_BG_PLAY_INJECTED__) return;
    window.__GVC_BG_PLAY_INJECTED__ = true;
    let isEnabled = true;
    window.addEventListener("gvc-background-play-toggle", e => {
        if (e && e.detail && typeof e.detail.enabled === "boolean") {
            isEnabled = e.detail.enabled;
        }
    });
    let lastUserGesture = Date.now();
    const onGesture = () => {
        lastUserGesture = Date.now();
    };
    [ "pointerdown", "mousedown", "keydown", "click", "touchstart" ].forEach(evt => {
        window.addEventListener(evt, onGesture, {
            capture: true,
            passive: true
        });
    });
    const nativeVisibilityStateDesc = Object.getOwnPropertyDescriptor(Document.prototype, "visibilityState");
    const nativeHiddenDesc = Object.getOwnPropertyDescriptor(Document.prototype, "hidden");
    const origHasFocus = Document.prototype.hasFocus;
    const origPause = HTMLMediaElement.prototype.pause;
    try {
        Object.defineProperty(Document.prototype, "visibilityState", {
            get() {
                if (!isEnabled) {
                    return nativeVisibilityStateDesc && nativeVisibilityStateDesc.get ? nativeVisibilityStateDesc.get.call(this) : "visible";
                }
                return "visible";
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}
    try {
        Object.defineProperty(document, "visibilityState", {
            get() {
                if (!isEnabled) {
                    return nativeVisibilityStateDesc && nativeVisibilityStateDesc.get ? nativeVisibilityStateDesc.get.call(document) : "visible";
                }
                return "visible";
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}
    try {
        Object.defineProperty(Document.prototype, "hidden", {
            get() {
                if (!isEnabled) {
                    return nativeHiddenDesc && nativeHiddenDesc.get ? nativeHiddenDesc.get.call(this) : false;
                }
                return false;
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}
    try {
        Object.defineProperty(document, "hidden", {
            get() {
                if (!isEnabled) {
                    return nativeHiddenDesc && nativeHiddenDesc.get ? nativeHiddenDesc.get.call(document) : false;
                }
                return false;
            },
            configurable: true,
            enumerable: true
        });
    } catch (e) {}
    try {
        Document.prototype.hasFocus = function() {
            if (!isEnabled) {
                return origHasFocus.apply(this, arguments);
            }
            return true;
        };
    } catch (e) {}
    const suppressVisibilityEvent = e => {
        if (!isEnabled) return;
        e.stopImmediatePropagation();
        if (typeof e.preventDefault === "function") e.preventDefault();
    };
    window.addEventListener("visibilitychange", suppressVisibilityEvent, true);
    document.addEventListener("visibilitychange", suppressVisibilityEvent, true);
    window.addEventListener("webkitvisibilitychange", suppressVisibilityEvent, true);
    document.addEventListener("webkitvisibilitychange", suppressVisibilityEvent, true);
    window.addEventListener("blur", e => {
        if (!isEnabled) return;
        if (e.target === window || e.target === document) {
            e.stopImmediatePropagation();
        }
    }, true);
    try {
        HTMLMediaElement.prototype.pause = function(...args) {
            if (isEnabled) {
                const isActuallyHidden = nativeHiddenDesc && nativeHiddenDesc.get ? nativeHiddenDesc.get.call(document) : false;
                const isActuallyUnfocused = origHasFocus ? !origHasFocus.call(document) : false;
                const isRecentUserGesture = Date.now() - lastUserGesture < 500;
                if ((isActuallyHidden || isActuallyUnfocused) && !isRecentUserGesture) {
                    return;
                }
            }
            return origPause.apply(this, args);
        };
    } catch (e) {}
})();