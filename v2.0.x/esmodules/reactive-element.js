const extraGlobals = window;
const supportsAdoptingStyleSheets1 = window.ShadowRoot &&
  (extraGlobals.ShadyCSS === undefined || extraGlobals.ShadyCSS.nativeShadow) &&
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;
const constructionToken = Symbol();
const styleSheetCache = new Map();
class CSSResult1 {
  _$cssResult$ = true;
  cssText;
  constructor(cssText, safeToken) {
    if (safeToken !== constructionToken) {
      throw new Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead.",
      );
    }
    this.cssText = cssText;
  }
  get styleSheet() {
    let styleSheet = styleSheetCache.get(this.cssText);
    if (supportsAdoptingStyleSheets1 && styleSheet === undefined) {
      styleSheetCache.set(this.cssText, styleSheet = new CSSStyleSheet());
      styleSheet.replaceSync(this.cssText);
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
}
const textFromCSSResult = (value) => {
  if (value._$cssResult$ === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(
      `Value passed to 'css' function must be a 'css' function result: ` +
        `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` +
        `to ensure page security.`,
    );
  }
};
const unsafeCSS1 = (value) =>
  new CSSResult1(
    typeof value === "string" ? value : String(value),
    constructionToken,
  );
const css1 = (strings, ...values) => {
  const cssText1 = strings.length === 1
    ? strings[0]
    : values.reduce(
      (acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1],
      strings[0],
    );
  return new CSSResult1(cssText1, constructionToken);
};
const adoptStyles1 = (renderRoot, styles) => {
  if (supportsAdoptingStyleSheets1) {
    renderRoot.adoptedStyleSheets = styles.map((s) =>
      s instanceof CSSStyleSheet ? s : s.styleSheet
    );
  } else {
    styles.forEach((s) => {
      const style = document.createElement("style");
      style.textContent = s.cssText;
      renderRoot.appendChild(style);
    });
  }
};
const cssResultFromStyleSheet = (sheet) => {
  let cssText1 = "";
  for (const rule of sheet.cssRules) {
    cssText1 += rule.cssText;
  }
  return unsafeCSS1(cssText1);
};
const getCompatibleStyle1 = supportsAdoptingStyleSheets1
  ? (s) => s
  : (s) => s instanceof CSSStyleSheet ? cssResultFromStyleSheet(s) : s;
export { supportsAdoptingStyleSheets1 as supportsAdoptingStyleSheets };
export { CSSResult1 as CSSResult };
export { unsafeCSS1 as unsafeCSS };
export { css1 as css };
export { adoptStyles1 as adoptStyles };
export { getCompatibleStyle1 as getCompatibleStyle };
const JSCompiler_renameProperty = (prop, _obj) => prop;
const defaultConverter1 = {
  toAttribute(value, type) {
    switch (type) {
      case Boolean:
        value = value ? "" : null;
        break;
      case Object:
      case Array:
        value = value == null ? value : JSON.stringify(value);
        break;
    }
    return value;
  },
  fromAttribute(value, type) {
    let fromValue = value;
    switch (type) {
      case Boolean:
        fromValue = value !== null;
        break;
      case Number:
        fromValue = value === null ? null : Number(value);
        break;
      case Object:
      case Array:
        try {
          fromValue = JSON.parse(value);
        } catch (e) {
          fromValue = null;
        }
        break;
    }
    return fromValue;
  },
};
const notEqual1 = (value, old) => {
  return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter1,
  reflect: false,
  hasChanged: notEqual1,
};
const finalized = "finalized";
class ReactiveElement1 extends HTMLElement {
  static enabledWarnings;
  static enableWarning;
  static disableWarning;
  static addInitializer(initializer) {
    this._initializers ??= [];
    this._initializers.push(initializer);
  }
  static _initializers;
  static __attributeToPropertyMap;
  static [finalized] = true;
  static elementProperties = new Map();
  static properties;
  static elementStyles = [];
  static styles;
  static get observedAttributes() {
    this.finalize();
    const attributes = [];
    this.elementProperties.forEach((v, p) => {
      const attr = this.__attributeNameForProperty(p, v);
      if (attr !== undefined) {
        this.__attributeToPropertyMap.set(attr, p);
        attributes.push(attr);
      }
    });
    return attributes;
  }
  static createProperty(name, options = defaultPropertyDeclaration) {
    if (options.state) {
      options.attribute = false;
    }
    this.finalize();
    this.elementProperties.set(name, options);
    if (!options.noAccessor && !this.prototype.hasOwnProperty(name)) {
      const key = typeof name === "symbol" ? Symbol() : `__${name}`;
      const descriptor = this.getPropertyDescriptor(name, key, options);
      if (descriptor !== undefined) {
        Object.defineProperty(this.prototype, name, descriptor);
      }
    }
  }
  static getPropertyDescriptor(name, key, options) {
    return {
      get() {
        return this[key];
      },
      set(value) {
        const oldValue = this[name];
        this[key] = value;
        this.requestUpdate(name, oldValue, options);
      },
      configurable: true,
      enumerable: true,
    };
  }
  static getPropertyOptions(name) {
    return this.elementProperties.get(name) || defaultPropertyDeclaration;
  }
  static finalize() {
    if (this.hasOwnProperty(finalized)) {
      return false;
    }
    this[finalized] = true;
    const superCtor = Object.getPrototypeOf(this);
    superCtor.finalize();
    this.elementProperties = new Map(superCtor.elementProperties);
    this.__attributeToPropertyMap = new Map();
    if (this.hasOwnProperty(JSCompiler_renameProperty("properties", this))) {
      const props = this.properties;
      const propKeys = [
        ...Object.getOwnPropertyNames(props),
        ...Object.getOwnPropertySymbols(props),
      ];
      for (const p of propKeys) {
        this.createProperty(p, props[p]);
      }
    }
    this.elementStyles = this.finalizeStyles(this.styles);
    return true;
  }
  static shadowRootOptions = {
    mode: "open",
  };
  static finalizeStyles(styles) {
    const elementStyles = [];
    if (Array.isArray(styles)) {
      const set = new Set(styles.flat(Infinity).reverse());
      for (const s of set) {
        elementStyles.unshift(getCompatibleStyle1(s));
      }
    } else if (styles !== undefined) {
      elementStyles.push(getCompatibleStyle1(styles));
    }
    return elementStyles;
  }
  renderRoot;
  static __attributeNameForProperty(name, options) {
    const attribute = options.attribute;
    return attribute === false
      ? undefined
      : typeof attribute === "string"
      ? attribute
      : typeof name === "string"
      ? name.toLowerCase()
      : undefined;
  }
  __instanceProperties = new Map();
  __updatePromise;
  __pendingConnectionPromise = undefined;
  __enableConnection = undefined;
  isUpdatePending = false;
  hasUpdated = false;
  _$changedProperties;
  __reflectingProperties;
  __reflectingProperty = null;
  __controllers;
  constructor() {
    super();
    this._initialize();
  }
  _initialize() {
    this.__updatePromise = new Promise((res) => this.enableUpdating = res);
    this._$changedProperties = new Map();
    this.__saveInstanceProperties();
    this.requestUpdate();
    this.constructor._initializers?.forEach((i) => i(this));
  }
  addController(controller) {
    (this.__controllers ??= []).push(controller);
    if (this.renderRoot !== undefined && this.isConnected) {
      controller.hostConnected?.();
    }
  }
  removeController(controller) {
    this.__controllers?.splice(this.__controllers.indexOf(controller) >>> 0, 1);
  }
  __saveInstanceProperties() {
    this.constructor.elementProperties.forEach((_v, p) => {
      if (this.hasOwnProperty(p)) {
        this.__instanceProperties.set(p, this[p]);
        delete this[p];
      }
    });
  }
  createRenderRoot() {
    const renderRoot = this.shadowRoot ??
      this.attachShadow(this.constructor.shadowRootOptions);
    adoptStyles1(renderRoot, this.constructor.elementStyles);
    return renderRoot;
  }
  connectedCallback() {
    if (this.renderRoot === undefined) {
      this.renderRoot = this.createRenderRoot();
    }
    this.enableUpdating(true);
    this.__controllers?.forEach((c) => c.hostConnected?.());
    if (this.__enableConnection) {
      this.__enableConnection();
      this.__pendingConnectionPromise = this.__enableConnection = undefined;
    }
  }
  enableUpdating(_requestedUpdate) {
  }
  disconnectedCallback() {
    this.__controllers?.forEach((c) => c.hostDisconnected?.());
    this.__pendingConnectionPromise = new Promise((r) =>
      this.__enableConnection = r
    );
  }
  attributeChangedCallback(name, _old, value) {
    this._$attributeToProperty(name, value);
  }
  __propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
    const attr = this.constructor.__attributeNameForProperty(name, options);
    if (attr !== undefined && options.reflect === true) {
      const toAttribute = options.converter?.toAttribute ??
        defaultConverter1.toAttribute;
      const attrValue = toAttribute(value, options.type);
      this.__reflectingProperty = name;
      if (attrValue == null) {
        this.removeAttribute(attr);
      } else {
        this.setAttribute(attr, attrValue);
      }
      this.__reflectingProperty = null;
    }
  }
  _$attributeToProperty(name, value) {
    const ctor = this.constructor;
    const propName = ctor.__attributeToPropertyMap.get(name);
    if (propName !== undefined && this.__reflectingProperty !== propName) {
      const options = ctor.getPropertyOptions(propName);
      const converter = options.converter;
      const fromAttribute =
        (converter?.fromAttribute ?? (typeof converter === "function"
          ? converter
          : null)) ?? defaultConverter1.fromAttribute;
      this.__reflectingProperty = propName;
      this[propName] = fromAttribute(value, options.type);
      this.__reflectingProperty = null;
    }
  }
  requestUpdate(name, oldValue, options) {
    let shouldRequestUpdate = true;
    if (name !== undefined) {
      options = options || this.constructor.getPropertyOptions(name);
      const hasChanged = options.hasChanged || notEqual1;
      if (hasChanged(this[name], oldValue)) {
        if (!this._$changedProperties.has(name)) {
          this._$changedProperties.set(name, oldValue);
        }
        if (options.reflect === true && this.__reflectingProperty !== name) {
          if (this.__reflectingProperties === undefined) {
            this.__reflectingProperties = new Map();
          }
          this.__reflectingProperties.set(name, options);
        }
      } else {
        shouldRequestUpdate = false;
      }
    }
    if (!this.isUpdatePending && shouldRequestUpdate) {
      this.__updatePromise = this.__enqueueUpdate();
    }
    return;
  }
  async __enqueueUpdate() {
    this.isUpdatePending = true;
    try {
      await this.__updatePromise;
      while (this.__pendingConnectionPromise) {
        await this.__pendingConnectionPromise;
      }
    } catch (e) {
      Promise.reject(e);
    }
    const result = this.performUpdate();
    if (result != null) {
      await result;
    }
    return !this.isUpdatePending;
  }
  performUpdate() {
    if (!this.isUpdatePending) {
      return;
    }
    if (!this.hasUpdated) {
    }
    if (this.__instanceProperties) {
      this.__instanceProperties.forEach((v, p) => this[p] = v);
      this.__instanceProperties = undefined;
    }
    let shouldUpdate = false;
    const changedProperties = this._$changedProperties;
    try {
      shouldUpdate = this.shouldUpdate(changedProperties);
      if (shouldUpdate) {
        this.willUpdate(changedProperties);
        this.__controllers?.forEach((c) => c.hostUpdate?.());
        this.update(changedProperties);
      } else {
        this.__markUpdated();
      }
    } catch (e) {
      shouldUpdate = false;
      this.__markUpdated();
      throw e;
    }
    if (shouldUpdate) {
      this._$didUpdate(changedProperties);
    }
  }
  willUpdate(_changedProperties) {
  }
  _$didUpdate(changedProperties) {
    this.__controllers?.forEach((c) => c.hostUpdated?.());
    if (!this.hasUpdated) {
      this.hasUpdated = true;
      this.firstUpdated(changedProperties);
    }
    this.updated(changedProperties);
  }
  __markUpdated() {
    this._$changedProperties = new Map();
    this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this.__updatePromise;
  }
  shouldUpdate(_changedProperties) {
    return true;
  }
  update(_changedProperties) {
    if (this.__reflectingProperties !== undefined) {
      this.__reflectingProperties.forEach((v, k) =>
        this.__propertyToAttribute(k, this[k], v)
      );
      this.__reflectingProperties = undefined;
    }
    this.__markUpdated();
  }
  updated(_changedProperties) {
  }
  firstUpdated(_changedProperties) {
  }
}
globalThis["reactiveElementPlatformSupport"]?.({
  ReactiveElement: ReactiveElement1,
});
(globalThis["reactiveElementVersions"] ??= []).push("1.0.0-rc.2");
export { defaultConverter1 as defaultConverter };
export { notEqual1 as notEqual };
export { ReactiveElement1 as ReactiveElement };
