const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { TextDecoder, TextEncoder } = require('util');

global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

const { JSDOM, VirtualConsole } = require('jsdom');

const repoRoot = path.join(__dirname, '..');

function findDeclarations(root, selector, mediaPattern = null) {
  const declarations = {};

  root.walkRules(rule => {
    if (rule.selector !== selector) return;

    const parent = rule.parent;
    const insideMatchingMedia =
      parent.type === 'atrule' &&
      parent.name === 'media' &&
      mediaPattern &&
      mediaPattern.test(parent.params);
    const insideRoot = parent.type === 'root' && !mediaPattern;

    if (!insideRoot && !insideMatchingMedia) return;

    rule.walkDecls(decl => {
      declarations[decl.prop] = decl.value;
    });
  });

  return declarations;
}

function loadServiceWorker() {
  const listeners = {};
  class MockHeaders {
    constructor(headers = {}) {
      this.headers = new Map(Object.entries(headers));
    }

    set(key, value) {
      this.headers.set(key, value);
    }
  }

  class MockResponse {
    constructor(body = null, init = {}) {
      this.body = body;
      this.status = init.status || 200;
      this.statusText = init.statusText || '';
      this.headers = new MockHeaders(init.headers);
    }

    clone() {
      return new MockResponse(this.body, {
        status: this.status,
        statusText: this.statusText,
        headers: Object.fromEntries(this.headers.headers),
      });
    }
  }

  const cache = {
    addAll: jest.fn().mockResolvedValue(undefined),
    put: jest.fn().mockResolvedValue(undefined),
    keys: jest.fn().mockResolvedValue([]),
  };

  const context = {
    URL,
    Headers: global.Headers || MockHeaders,
    Response: global.Response || MockResponse,
    fetch: jest.fn(),
    console: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
    self: {
      location: { origin: 'https://explore-scripture.test' },
      skipWaiting: jest.fn(),
      clients: {
        claim: jest.fn().mockResolvedValue(undefined),
        matchAll: jest.fn().mockResolvedValue([]),
      },
      addEventListener: jest.fn((type, handler) => {
        listeners[type] = handler;
      }),
    },
    caches: {
      open: jest.fn().mockResolvedValue(cache),
      keys: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
      match: jest.fn().mockResolvedValue(undefined),
    },
  };

  context.globalThis = context.self;
  vm.createContext(context);
  const swSource = fs.readFileSync(path.join(repoRoot, 'src/sw.js'), 'utf8');
  vm.runInContext(swSource, context);

  return { cache, context, listeners };
}

function loadBaseUpdateScript() {
  const layoutSource = fs.readFileSync(
    path.join(repoRoot, 'src/_includes/layouts/base.njk'),
    'utf8'
  );
  const scriptMatch = layoutSource.match(
    /\/\/ Service worker registration and PWA functionality[\s\S]*?\/\/ Online\/offline status/
  );

  if (!scriptMatch) {
    throw new Error('Unable to locate service worker update script in base layout');
  }

  const exposedScript = scriptMatch[0].replace(
    '// Online/offline status',
    `window.__pwaUpdateApi = {
      showUpdateNotification,
      dismissUpdateNotification,
      updateServiceWorker,
    };`
  );

  const navigationErrors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => {
    navigationErrors.push(error.message);
  });

  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    runScripts: 'outside-only',
    url: 'https://explore-scripture.test/',
    virtualConsole,
  });

  Object.defineProperty(dom.window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      addEventListener: jest.fn(),
      register: jest.fn().mockResolvedValue({ addEventListener: jest.fn() }),
    },
  });

  dom.window.eval(exposedScript);
  return { dom, navigationErrors };
}

describe('PWA update flow', () => {
  test('service worker waits for user confirmation before activating an update', async () => {
    const { context, listeners } = loadServiceWorker();
    const waitUntilPromises = [];

    listeners.install({
      waitUntil: promise => waitUntilPromises.push(promise),
    });

    await Promise.all(waitUntilPromises);

    expect(context.self.skipWaiting).not.toHaveBeenCalled();

    listeners.message({ data: { type: 'SKIP_WAITING' } });

    expect(context.self.skipWaiting).toHaveBeenCalledTimes(1);
  });

  test('update action reloads when the discovered worker is already activated', () => {
    const { dom, navigationErrors } = loadBaseUpdateScript();
    const staleWorkerReference = {
      state: 'activated',
      postMessage: jest.fn(),
    };

    dom.window.newServiceWorker = staleWorkerReference;
    dom.window.__swUpdateAvailable = true;

    dom.window.__pwaUpdateApi.updateServiceWorker();

    expect(staleWorkerReference.postMessage).not.toHaveBeenCalled();
    expect(dom.window.__swWaitingForRefresh).toBe(true);
    expect(navigationErrors).toContain('Not implemented: navigation (except hash changes)');
  });

  test('update banner remains until the user acts instead of auto-dismissing', () => {
    const { dom } = loadBaseUpdateScript();
    dom.window.setTimeout = jest.fn();

    dom.window.__pwaUpdateApi.showUpdateNotification();

    expect(dom.window.document.querySelector('.update-notification')).not.toBeNull();
    expect(dom.window.setTimeout).not.toHaveBeenCalled();
  });

  test('update banner uses compact bottom positioning on mobile', () => {
    const postcss = require('postcss');
    const cssSource = fs.readFileSync(path.join(repoRoot, 'src/styles.css'), 'utf8');
    const cssRoot = postcss.parse(cssSource);

    const baseBanner = findDeclarations(cssRoot, '.update-notification');
    expect(baseBanner.top).toBe('auto');
    expect(baseBanner.bottom).toContain('env(safe-area-inset-bottom)');
    expect(baseBanner.width).toContain('calc(100vw - 2rem)');

    const mobileBanner = findDeclarations(
      cssRoot,
      '.update-notification',
      /max-width:\s*768px/
    );
    expect(mobileBanner.left).toBe('0.75rem');
    expect(mobileBanner.right).toBe('0.75rem');
    expect(mobileBanner.width).toBe('auto');

    const mobileContent = findDeclarations(
      cssRoot,
      '.update-notification .update-content',
      /max-width:\s*768px/
    );
    expect(mobileContent['grid-template-columns']).toBe('minmax(0, 1fr) auto');
    expect(mobileContent.padding).toBe('0.625rem');

    const mobileHidden = findDeclarations(
      cssRoot,
      '.update-notification .update-icon,\n  .update-notification .update-subtitle',
      /max-width:\s*768px/
    );
    expect(mobileHidden.display).toBe('none');
  });
});
