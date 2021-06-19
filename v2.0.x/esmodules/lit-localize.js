const _str = (strings, ...values) => ({
  strTag: true,
  strings,
  values,
});
const str1 = _str;
const isStrTagged1 = (val) => typeof val !== "string" && "strTag" in val;
const joinStringsAndValues1 = (strings, values, valueOrder) => {
  let concat = strings[0];
  for (let i = 1; i < strings.length; i++) {
    concat += values[valueOrder ? valueOrder[i - 1] : i - 1];
    concat += strings[i];
  }
  return concat;
};
export { str1 as str };
export { isStrTagged1 as isStrTagged };
export { joinStringsAndValues1 as joinStringsAndValues };
const defaultMsg = (template) =>
  isStrTagged1(template)
    ? joinStringsAndValues1(template.strings, template.values)
    : template;
const hl = [];
for (let i = 0; i < 256; i++) {
  hl[i] = (i >> 4 & 15).toString(16) + (i & 15).toString(16);
}
function fnv1a64(str2) {
  let t0 = 0,
    v0 = 8997,
    t1 = 0,
    v1 = 33826,
    t2 = 0,
    v2 = 40164,
    t3 = 0,
    v3 = 52210;
  for (let i1 = 0; i1 < str2.length; i1++) {
    v0 ^= str2.charCodeAt(i1);
    t0 = v0 * 435;
    t1 = v1 * 435;
    t2 = v2 * 435;
    t3 = v3 * 435;
    t2 += v0 << 8;
    t3 += v1 << 8;
    t1 += t0 >>> 16;
    v0 = t0 & 65535;
    t2 += t1 >>> 16;
    v1 = t1 & 65535;
    v3 = t3 + (t2 >>> 16) & 65535;
    v2 = t2 & 65535;
  }
  return hl[v3 >> 8] + hl[v3 & 255] + hl[v2 >> 8] + hl[v2 & 255] + hl[v1 >> 8] +
    hl[v1 & 255] + hl[v0 >> 8] + hl[v0 & 255];
}
const HASH_DELIMITER = "\x1e";
const HTML_PREFIX = "h";
const STRING_PREFIX = "s";
function generateMsgId(strings, isHtmlTagged) {
  return (isHtmlTagged ? HTML_PREFIX : STRING_PREFIX) +
    fnv1a64(
      typeof strings === "string" ? strings : strings.join(HASH_DELIMITER),
    );
}
class Deferred {
  promise;
  _resolve;
  _reject;
  settled = false;
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }
  resolve(value) {
    this.settled = true;
    this._resolve(value);
  }
  reject(error) {
    this.settled = true;
    this._reject(error);
  }
}
const LOCALE_STATUS_EVENT1 = "lit-localize-status";
export { LOCALE_STATUS_EVENT1 as LOCALE_STATUS_EVENT };
class LocalizeController {
  host;
  constructor(host) {
    this.host = host;
  }
  __litLocalizeEventHandler = (event) => {
    if (event.detail.status === "ready") {
      this.host.requestUpdate();
    }
  };
  hostConnected() {
    window.addEventListener(
      LOCALE_STATUS_EVENT1,
      this.__litLocalizeEventHandler,
    );
  }
  hostDisconnected() {
    window.removeEventListener(
      LOCALE_STATUS_EVENT1,
      this.__litLocalizeEventHandler,
    );
  }
}
const _updateWhenLocaleChanges = (host1) =>
  host1.addController(new LocalizeController(host1));
const updateWhenLocaleChanges1 = _updateWhenLocaleChanges;
export { updateWhenLocaleChanges1 as updateWhenLocaleChanges };
const _localized = () =>
  (classOrDescriptor) =>
    typeof classOrDescriptor === "function"
      ? legacyLocalized(classOrDescriptor)
      : standardLocalized(classOrDescriptor);
const localized1 = _localized;
const standardLocalized = ({ kind, elements }) => {
  return {
    kind,
    elements,
    finisher(clazz) {
      clazz.addInitializer(updateWhenLocaleChanges1);
    },
  };
};
const legacyLocalized = (clazz) => {
  clazz.addInitializer(updateWhenLocaleChanges1);
  return clazz;
};
export { localized1 as localized };
function dispatchStatusEvent(detail) {
  window.dispatchEvent(
    new CustomEvent(LOCALE_STATUS_EVENT1, {
      detail,
    }),
  );
}
let msg1 = defaultMsg;
let installed = false;
function _installMsgImplementation1(impl) {
  if (installed) {
    throw new Error("lit-localize can only be configured once");
  }
  msg1 = impl;
  installed = true;
}
export { _installMsgImplementation1 as _installMsgImplementation };
const configureTransformLocalization = (config) => {
  _installMsgImplementation1(defaultMsg);
  const sourceLocale = config.sourceLocale;
  return {
    getLocale: () => sourceLocale,
  };
};
let activeLocale = "";
let loadingLocale;
let sourceLocale;
let validLocales;
let loadLocale;
let templates;
let loading = new Deferred();
loading.resolve();
let requestId = 0;
const configureLocalization = (config) => {
  _installMsgImplementation1(runtimeMsg);
  activeLocale = sourceLocale = config.sourceLocale;
  validLocales = new Set(config.targetLocales);
  validLocales.add(config.sourceLocale);
  loadLocale = config.loadLocale;
  return {
    getLocale,
    setLocale,
  };
};
const getLocale = () => {
  return activeLocale;
};
const setLocale = (newLocale) => {
  if (newLocale === (loadingLocale ?? activeLocale)) {
    return loading.promise;
  }
  if (!validLocales || !loadLocale) {
    throw new Error("Internal error");
  }
  if (!validLocales.has(newLocale)) {
    throw new Error("Invalid locale code");
  }
  requestId++;
  const thisRequestId = requestId;
  loadingLocale = newLocale;
  if (loading.settled) {
    loading = new Deferred();
  }
  dispatchStatusEvent({
    status: "loading",
    loadingLocale: newLocale,
  });
  const localePromise = newLocale === sourceLocale
    ? Promise.resolve({
      templates: undefined,
    })
    : loadLocale(newLocale);
  localePromise.then((mod) => {
    if (requestId === thisRequestId) {
      activeLocale = newLocale;
      loadingLocale = undefined;
      templates = mod.templates;
      dispatchStatusEvent({
        status: "ready",
        readyLocale: newLocale,
      });
      loading.resolve();
    }
  }, (err) => {
    if (requestId === thisRequestId) {
      dispatchStatusEvent({
        status: "error",
        errorLocale: newLocale,
        errorMessage: err.toString(),
      });
      loading.reject(err);
    }
  });
  return loading.promise;
};
function runtimeMsg(template, options) {
  if (templates) {
    const id = options?.id ?? generateId(template);
    const localized2 = templates[id];
    if (localized2) {
      if (typeof localized2 === "string") {
        return localized2;
      } else if ("strTag" in localized2) {
        return joinStringsAndValues1(
          localized2.strings,
          template.values,
          localized2.values,
        );
      } else {
        let order = expressionOrders.get(localized2);
        if (order === undefined) {
          order = localized2.values;
          expressionOrders.set(localized2, order);
        }
        localized2.values = order.map((i1) => template.values[i1]);
        return localized2;
      }
    }
  }
  return defaultMsg(template);
}
const expressionOrders = new WeakMap();
const hashCache = new Map();
function generateId(template) {
  const strings = typeof template === "string" ? template : template.strings;
  let id = hashCache.get(strings);
  if (id === undefined) {
    id = generateMsgId(
      strings,
      typeof template !== "string" && !("strTag" in template),
    );
    hashCache.set(strings, id);
  }
  return id;
}
export { msg1 as msg };
