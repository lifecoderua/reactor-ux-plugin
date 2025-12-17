// Prevent original 'w'/'s' key handlers registered by the original page.
// This must run in the page context.

const script = document.createElement('script');
script.textContent = `(() => {
  if (window.__reactorUxWsBlockInstalled) return;
  window.__reactorUxWsBlockInstalled = true;

  const originalAdd = EventTarget.prototype.addEventListener;
  const originalRemove = EventTarget.prototype.removeEventListener;
  const wrapped = new WeakMap();

  const shouldWrap = (target, type) => {
    return (target === window || target === document)
      && type === 'keydown';
  };

  const isWSKeyEvent = (event) => {
    if (!event) return false;
    return event.code === 'KeyW'
      || event.code === 'KeyS'
      || event.key === 'w'
      || event.key === 's'
      || event.key === 'W'
      || event.key === 'S';
  };

  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (!shouldWrap(this, type) || !listener) {
      return originalAdd.call(this, type, listener, options);
    }

    const existing = wrapped.get(listener);
    if (existing) {
      return originalAdd.call(this, type, existing, options);
    }

    const wrappedListener = function(event) {
      if (isWSKeyEvent(event)) {
        return;
      }
      if (typeof listener === 'function') {
        return listener.call(this, event);
      }
      if (listener && typeof listener.handleEvent === 'function') {
        return listener.handleEvent.call(listener, event);
      }
    };

    wrapped.set(listener, wrappedListener);
    return originalAdd.call(this, type, wrappedListener, options);
  };

  EventTarget.prototype.removeEventListener = function(type, listener, options) {
    if (!shouldWrap(this, type) || !listener) {
      return originalRemove.call(this, type, listener, options);
    }

    const maybeWrapped = wrapped.get(listener) || listener;
    return originalRemove.call(this, type, maybeWrapped, options);
  };
})();`;

(document.documentElement || document.head).appendChild(script);
script.remove();
