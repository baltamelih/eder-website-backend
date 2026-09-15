(() => {
  "use strict";

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const isAuthPath =
    /^(\/login|\/register|\/forgot-password|\/reset-password)(\/|$)/.test(path);

  window.__EDER_AUTH_BOOTSTRAP_LOADED__ = true;
  window.__EDER_AUTH_BOOTSTRAP_PATH__ = path;

  if (!isAuthPath) return;

  // Exact stale-child guard for React DOM commits on auth pages.
  if (!window.__EDER_AUTH_REMOVECHILD_GUARD__) {
    const nativeRemoveChild = Node.prototype.removeChild;

    function ederSafeRemoveChild(child) {
      if (child instanceof Node && child.parentNode !== this) {
        window.__EDER_AUTH_STALE_REMOVE_COUNT__ =
          (window.__EDER_AUTH_STALE_REMOVE_COUNT__ || 0) + 1;
        return child;
      }
      return nativeRemoveChild.call(this, child);
    }

    Object.defineProperty(ederSafeRemoveChild, "__ederAuthGuard", {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false,
    });

    Node.prototype.removeChild = ederSafeRemoveChild;
    window.__EDER_AUTH_REMOVECHILD_GUARD__ = true;
  }

  // Auth links should start a clean document instead of carrying a mutated
  // public-page DOM into the auth route.
  if (!window.__EDER_AUTH_HARD_NAV_EXTERNAL__) {
    const isAuthHref = (value) => {
      try {
        const url = new URL(value, window.location.href);
        return (
          url.origin === window.location.origin &&
          /^(\/login|\/register|\/forgot-password|\/reset-password)(\/|$)/.test(
            url.pathname
          )
        );
      } catch {
        return false;
      }
    };

    document.addEventListener(
      "click",
      (event) => {
        const target =
          event.target instanceof Element
            ? event.target.closest("a[href]")
            : null;

        if (!target || !isAuthHref(target.href)) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.assign(target.href);
      },
      true
    );

    window.__EDER_AUTH_HARD_NAV_EXTERNAL__ = true;
  }
})();
