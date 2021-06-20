const extraGlobals = window;
const supportsAdoptingStyleSheets = window.ShadowRoot &&
  (extraGlobals.ShadyCSS === undefined || extraGlobals.ShadyCSS.nativeShadow) &&
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;
const constructionToken = Symbol();
const styleSheetCache = new Map();
class CSSResult {
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
    if (supportsAdoptingStyleSheets && styleSheet === undefined) {
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
const unsafeCSS = (value) =>
  new CSSResult(
    typeof value === "string" ? value : String(value),
    constructionToken,
  );
const css = (strings, ...values) => {
  const cssText1 = strings.length === 1
    ? strings[0]
    : values.reduce(
      (acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1],
      strings[0],
    );
  return new CSSResult(cssText1, constructionToken);
};
const adoptStyles = (renderRoot, styles) => {
  if (supportsAdoptingStyleSheets) {
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
  return unsafeCSS(cssText1);
};
const getCompatibleStyle = supportsAdoptingStyleSheets
  ? (s) => s
  : (s) => s instanceof CSSStyleSheet ? cssResultFromStyleSheet(s) : s;
const JSCompiler_renameProperty = (prop, _obj) => prop;
const defaultConverter = {
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
const notEqual = (value, old) => {
  return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
  attribute: true,
  type: String,
  converter: defaultConverter,
  reflect: false,
  hasChanged: notEqual,
};
const finalized = "finalized";
class ReactiveElement extends HTMLElement {
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
        elementStyles.unshift(getCompatibleStyle(s));
      }
    } else if (styles !== undefined) {
      elementStyles.push(getCompatibleStyle(styles));
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
    adoptStyles(renderRoot, this.constructor.elementStyles);
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
        defaultConverter.toAttribute;
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
          : null)) ?? defaultConverter.fromAttribute;
      this.__reflectingProperty = propName;
      this[propName] = fromAttribute(value, options.type);
      this.__reflectingProperty = null;
    }
  }
  requestUpdate(name, oldValue, options) {
    let shouldRequestUpdate = true;
    if (name !== undefined) {
      options = options || this.constructor.getPropertyOptions(name);
      const hasChanged = options.hasChanged || notEqual;
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
  ReactiveElement,
});
(globalThis["reactiveElementVersions"] ??= []).push("1.0.0-rc.2");
const legacyPrototypeMethod = (descriptor, proto, name) => {
  Object.defineProperty(proto, name, descriptor);
};
const decorateProperty = ({ finisher, descriptor }) =>
  (protoOrDescriptor, name) => {
    if (name !== undefined) {
      const ctor = protoOrDescriptor.constructor;
      if (descriptor !== undefined) {
        Object.defineProperty(protoOrDescriptor, name, descriptor(name));
      }
      finisher?.(ctor, name);
    } else {
      const key = protoOrDescriptor.originalKey ?? protoOrDescriptor.key;
      const info = descriptor != undefined
        ? {
          kind: "method",
          placement: "prototype",
          key,
          descriptor: descriptor(protoOrDescriptor.key),
        }
        : {
          ...protoOrDescriptor,
          key,
        };
      if (finisher != undefined) {
        info.finisher = function (ctor) {
          finisher(ctor, key);
        };
      }
      return info;
    }
  };
const legacyCustomElement = (tagName, clazz) => {
  window.customElements.define(tagName, clazz);
  return clazz;
};
const standardCustomElement = (tagName, descriptor) => {
  const { kind, elements } = descriptor;
  return {
    kind,
    elements,
    finisher(clazz) {
      window.customElements.define(tagName, clazz);
    },
  };
};
const customElement = (tagName) =>
  (classOrDescriptor) =>
    typeof classOrDescriptor === "function"
      ? legacyCustomElement(tagName, classOrDescriptor)
      : standardCustomElement(tagName, classOrDescriptor);
const standardProperty = (options, element) => {
  if (
    element.kind === "method" && element.descriptor &&
    !("value" in element.descriptor)
  ) {
    return {
      ...element,
      finisher(clazz) {
        clazz.createProperty(element.key, options);
      },
    };
  } else {
    return {
      kind: "field",
      key: Symbol(),
      placement: "own",
      descriptor: {},
      originalKey: element.key,
      initializer() {
        if (typeof element.initializer === "function") {
          this[element.key] = element.initializer.call(this);
        }
      },
      finisher(clazz) {
        clazz.createProperty(element.key, options);
      },
    };
  }
};
const legacyProperty = (options, proto, name) => {
  proto.constructor.createProperty(name, options);
};
const extraGlobals1 = window;
const wrap =
  true && extraGlobals1.ShadyDOM?.inUse &&
    extraGlobals1.ShadyDOM?.noPatch === true
    ? extraGlobals1.ShadyDOM.wrap
    : (node) => node;
const trustedTypes = globalThis.trustedTypes;
const policy = trustedTypes
  ? trustedTypes.createPolicy("lit-html", {
    createHTML: (s) => s,
  })
  : undefined;
const identityFunction = (value) => value;
const noopSanitizer = (_node, _name, _type) => identityFunction;
const setSanitizer = (newSanitizer) => {
  if (!true) {
    return;
  }
  if (sanitizerFactoryInternal !== noopSanitizer) {
    throw new Error(
      `Attempted to overwrite existing lit-html security policy.` +
        ` setSanitizeDOMValueFactory should be called at most once.`,
    );
  }
  sanitizerFactoryInternal = newSanitizer;
};
const _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
  sanitizerFactoryInternal = noopSanitizer;
};
const createSanitizer = (node, name, type) => {
  return sanitizerFactoryInternal(node, name, type);
};
const boundAttributeSuffix = "$lit$";
const marker = `lit$${String(Math.random()).slice(9)}$`;
const markerMatch = "?" + marker;
const nodeMarker = `<${markerMatch}>`;
const d = document;
const createMarker = (v = "") => d.createComment(v);
const isPrimitive = (value) =>
  value === null || typeof value != "object" && typeof value != "function";
const isArray = Array.isArray;
const isIterable = (value) =>
  isArray(value) || typeof value?.[Symbol.iterator] === "function";
const SPACE_CHAR = `[ \t\n\\r]`;
const ATTR_VALUE_CHAR = `[^ \t\n\\r"'\`<>=]`;
const NAME_CHAR = `[^\\s"'>=/]`;
const textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
const TAG_NAME = 2;
const commentEndRegex = /-->/g;
const comment2EndRegex = />/g;
const tagEndRegex = new RegExp(
  `>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`,
  "g",
);
const ATTRIBUTE_NAME = 1;
const SPACES_AND_EQUALS = 2;
const QUOTE_CHAR = 3;
const singleQuoteAttrEndRegex = /'/g;
const doubleQuoteAttrEndRegex = /"/g;
const rawTextElement = /^(?:script|style|textarea)$/i;
const tag = (_$litType$) =>
  (strings, ...values) => ({
    _$litType$,
    strings,
    values,
  });
const html2 = tag(1);
const noChange = Symbol.for("lit-noChange");
const nothing = Symbol.for("lit-nothing");
const templateCache = new WeakMap();
const render = (value, container, options) => {
  const partOwnerNode = options?.renderBefore ?? container;
  let part = partOwnerNode._$litPart$;
  if (part === undefined) {
    if (true && options?.clearContainerForLit2MigrationOnly === true) {
      container.childNodes.forEach((c) => c.remove());
    }
    const endNode = options?.renderBefore ?? null;
    partOwnerNode._$litPart$ = part = new ChildPart(
      container.insertBefore(createMarker(), endNode),
      endNode,
      undefined,
      options,
    );
  }
  part._$setValue(value);
  return part;
};
if (true) {
  render.setSanitizer = setSanitizer;
  render.createSanitizer = createSanitizer;
}
const walker = d.createTreeWalker(d, 129, null, false);
let sanitizerFactoryInternal = noopSanitizer;
const getTemplateHtml = (strings, type) => {
  const l = strings.length - 1;
  const attrNames = [];
  let html1 = type === 2 ? "<svg>" : "";
  let rawTextEndRegex;
  let regex = textEndRegex;
  for (let i = 0; i < l; i++) {
    const s = strings[i];
    let attrNameEndIndex = -1;
    let attrName;
    let lastIndex = 0;
    let match;
    while (lastIndex < s.length) {
      regex.lastIndex = lastIndex;
      match = regex.exec(s);
      if (match === null) {
        break;
      }
      lastIndex = regex.lastIndex;
      if (regex === textEndRegex) {
        if (match[1] === "!--") {
          regex = commentEndRegex;
        } else if (match[1] !== undefined) {
          regex = comment2EndRegex;
        } else if (match[2] !== undefined) {
          if (rawTextElement.test(match[2])) {
            rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, "g");
          }
          regex = tagEndRegex;
        } else if (match[3] !== undefined) {
          regex = tagEndRegex;
        }
      } else if (regex === tagEndRegex) {
        if (match[0] === ">") {
          regex = rawTextEndRegex ?? textEndRegex;
          attrNameEndIndex = -1;
        } else if (match[1] === undefined) {
          attrNameEndIndex = -2;
        } else {
          attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
          attrName = match[ATTRIBUTE_NAME];
          regex = match[QUOTE_CHAR] === undefined
            ? tagEndRegex
            : match[QUOTE_CHAR] === '"'
            ? doubleQuoteAttrEndRegex
            : singleQuoteAttrEndRegex;
        }
      } else if (
        regex === doubleQuoteAttrEndRegex || regex === singleQuoteAttrEndRegex
      ) {
        regex = tagEndRegex;
      } else if (regex === commentEndRegex || regex === comment2EndRegex) {
        regex = textEndRegex;
      } else {
        regex = tagEndRegex;
        rawTextEndRegex = undefined;
      }
    }
    const end = regex === tagEndRegex && strings[i + 1].startsWith("/>")
      ? " "
      : "";
    html1 += regex === textEndRegex
      ? s + nodeMarker
      : attrNameEndIndex >= 0
      ? (attrNames.push(attrName),
        s.slice(0, attrNameEndIndex) + boundAttributeSuffix +
        s.slice(attrNameEndIndex)) + marker + end
      : s + marker +
        (attrNameEndIndex === -2 ? (attrNames.push(undefined), i) : end);
  }
  const htmlResult = html1 + (strings[l] || "<?>") +
    (type === 2 ? "</svg>" : "");
  return [
    policy !== undefined ? policy.createHTML(htmlResult) : htmlResult,
    attrNames,
  ];
};
class Template {
  el;
  parts = [];
  constructor({ strings: strings1, _$litType$: type1 }, options1) {
    let node1;
    let nodeIndex = 0;
    let attrNameIndex = 0;
    const partCount = strings1.length - 1;
    const parts = this.parts;
    const [html1, attrNames] = getTemplateHtml(strings1, type1);
    this.el = Template.createElement(html1, options1);
    walker.currentNode = this.el.content;
    if (type1 === 2) {
      const content = this.el.content;
      const svgElement = content.firstChild;
      svgElement.remove();
      content.append(...svgElement.childNodes);
    }
    while ((node1 = walker.nextNode()) !== null && parts.length < partCount) {
      if (node1.nodeType === 1) {
        if (node1.hasAttributes()) {
          const attrsToRemove = [];
          for (const name of node1.getAttributeNames()) {
            if (
              name.endsWith(boundAttributeSuffix) || name.startsWith(marker)
            ) {
              const realName = attrNames[attrNameIndex++];
              attrsToRemove.push(name);
              if (realName !== undefined) {
                const value = node1.getAttribute(
                  realName.toLowerCase() + boundAttributeSuffix,
                );
                const statics = value.split(marker);
                const m = /([.?@])?(.*)/.exec(realName);
                parts.push({
                  type: 1,
                  index: nodeIndex,
                  name: m[2],
                  strings: statics,
                  ctor: m[1] === "." ? PropertyPart : m[1] === "?"
                    ? BooleanAttributePart
                    : m[1] === "@"
                    ? EventPart
                    : AttributePart,
                });
              } else {
                parts.push({
                  type: 6,
                  index: nodeIndex,
                });
              }
            }
          }
          for (const name1 of attrsToRemove) {
            node1.removeAttribute(name1);
          }
        }
        if (rawTextElement.test(node1.tagName)) {
          const strings1 = node1.textContent.split(marker);
          const lastIndex = strings1.length - 1;
          if (lastIndex > 0) {
            node1.textContent = trustedTypes ? trustedTypes.emptyScript : "";
            for (let i = 0; i < lastIndex; i++) {
              node1.append(strings1[i], createMarker());
              walker.nextNode();
              parts.push({
                type: 2,
                index: ++nodeIndex,
              });
            }
            node1.append(strings1[lastIndex], createMarker());
          }
        }
      } else if (node1.nodeType === 8) {
        const data = node1.data;
        if (data === markerMatch) {
          parts.push({
            type: 2,
            index: nodeIndex,
          });
        } else {
          let i = -1;
          while ((i = node1.data.indexOf(marker, i + 1)) !== -1) {
            parts.push({
              type: 7,
              index: nodeIndex,
            });
            i += marker.length - 1;
          }
        }
      }
      nodeIndex++;
    }
  }
  static createElement(html, _options) {
    const el = d.createElement("template");
    el.innerHTML = html;
    return el;
  }
}
function resolveDirective(part, value, parent = part, attributeIndex) {
  if (value === noChange) {
    return value;
  }
  let currentDirective = attributeIndex !== undefined
    ? parent.__directives?.[attributeIndex]
    : parent.__directive;
  const nextDirectiveConstructor = isPrimitive(value)
    ? undefined
    : value._$litDirective$;
  if (currentDirective?.constructor !== nextDirectiveConstructor) {
    currentDirective?._$setDirectiveConnected?.(false);
    if (nextDirectiveConstructor === undefined) {
      currentDirective = undefined;
    } else {
      currentDirective = new nextDirectiveConstructor(part);
      currentDirective._$initialize(part, parent, attributeIndex);
    }
    if (attributeIndex !== undefined) {
      (parent.__directives ??= [])[attributeIndex] = currentDirective;
    } else {
      parent.__directive = currentDirective;
    }
  }
  if (currentDirective !== undefined) {
    value = resolveDirective(
      part,
      currentDirective._$resolve(part, value.values),
      currentDirective,
      attributeIndex,
    );
  }
  return value;
}
class TemplateInstance {
  _$template;
  _parts = [];
  _$parent;
  _$disconnectableChildren = undefined;
  constructor(template, parent) {
    this._$template = template;
    this._$parent = parent;
  }
  _clone(options) {
    const { el: { content }, parts: parts1 } = this._$template;
    const fragment = (options?.creationScope ?? d).importNode(content, true);
    walker.currentNode = fragment;
    let node1 = walker.nextNode();
    let nodeIndex1 = 0;
    let partIndex = 0;
    let templatePart = parts1[0];
    while (templatePart !== undefined) {
      if (nodeIndex1 === templatePart.index) {
        let part;
        if (templatePart.type === 2) {
          part = new ChildPart(node1, node1.nextSibling, this, options);
        } else if (templatePart.type === 1) {
          part = new templatePart.ctor(
            node1,
            templatePart.name,
            templatePart.strings,
            this,
            options,
          );
        } else if (templatePart.type === 6) {
          part = new ElementPart(node1, this, options);
        }
        this._parts.push(part);
        templatePart = parts1[++partIndex];
      }
      if (nodeIndex1 !== templatePart?.index) {
        node1 = walker.nextNode();
        nodeIndex1++;
      }
    }
    return fragment;
  }
  _update(values) {
    let i = 0;
    for (const part of this._parts) {
      if (part !== undefined) {
        if (part.strings !== undefined) {
          part._$setValue(values, part, i);
          i += part.strings.length - 2;
        } else {
          part._$setValue(values[i]);
        }
      }
      i++;
    }
  }
}
class ChildPart {
  type = 2;
  options;
  _$committedValue;
  __directive;
  _$startNode;
  _$endNode;
  _textSanitizer;
  _$parent;
  _$disconnectableChildren = undefined;
  constructor(startNode, endNode, parent1, options2) {
    this._$startNode = startNode;
    this._$endNode = endNode;
    this._$parent = parent1;
    this.options = options2;
    if (true) {
      this._textSanitizer = undefined;
    }
  }
  setConnected(isConnected) {
    this._$setChildPartConnected?.(isConnected);
  }
  get parentNode() {
    return wrap(this._$startNode).parentNode;
  }
  get startNode() {
    return this._$startNode;
  }
  get endNode() {
    return this._$endNode;
  }
  _$setValue(value, directiveParent = this) {
    value = resolveDirective(this, value, directiveParent);
    if (isPrimitive(value)) {
      if (value === nothing || value == null || value === "") {
        if (this._$committedValue !== nothing) {
          this._$clear();
        }
        this._$committedValue = nothing;
      } else if (value !== this._$committedValue && value !== noChange) {
        this._commitText(value);
      }
    } else if (value._$litType$ !== undefined) {
      this._commitTemplateResult(value);
    } else if (value.nodeType !== undefined) {
      this._commitNode(value);
    } else if (isIterable(value)) {
      this._commitIterable(value);
    } else {
      this._commitText(value);
    }
  }
  _insert(node, ref = this._$endNode) {
    return wrap(wrap(this._$startNode).parentNode).insertBefore(node, ref);
  }
  _commitNode(value) {
    if (this._$committedValue !== value) {
      this._$clear();
      if (true && sanitizerFactoryInternal !== noopSanitizer) {
        const parentNodeName = this._$startNode.parentNode?.nodeName;
        if (parentNodeName === "STYLE" || parentNodeName === "SCRIPT") {
          this._insert(
            new Text(
              "/* lit-html will not write " +
                "TemplateResults to scripts and styles */",
            ),
          );
          return;
        }
      }
      this._$committedValue = this._insert(value);
    }
  }
  _commitText(value) {
    const node2 = wrap(this._$startNode).nextSibling;
    if (
      node2 !== null && node2.nodeType === 3 && (this._$endNode === null
        ? wrap(node2).nextSibling === null
        : node2 === wrap(this._$endNode).previousSibling)
    ) {
      if (true) {
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(node2, "data", "property");
        }
        value = this._textSanitizer(value);
      }
      node2.data = value;
    } else {
      if (true) {
        const textNode = document.createTextNode("");
        this._commitNode(textNode);
        if (this._textSanitizer === undefined) {
          this._textSanitizer = createSanitizer(textNode, "data", "property");
        }
        value = this._textSanitizer(value);
        textNode.data = value;
      } else {
        this._commitNode(d.createTextNode(value));
      }
    }
    this._$committedValue = value;
  }
  _commitTemplateResult(result) {
    const { values, _$litType$ } = result;
    const template1 = typeof _$litType$ === "number"
      ? this._$getTemplate(result)
      : (_$litType$.el === undefined &&
        (_$litType$.el = Template.createElement(_$litType$.h, this.options)),
        _$litType$);
    if (this._$committedValue?._$template === template1) {
      this._$committedValue._update(values);
    } else {
      const instance = new TemplateInstance(template1, this);
      const fragment = instance._clone(this.options);
      instance._update(values);
      this._commitNode(fragment);
      this._$committedValue = instance;
    }
  }
  _$getTemplate(result) {
    let template1 = templateCache.get(result.strings);
    if (template1 === undefined) {
      templateCache.set(result.strings, template1 = new Template(result));
    }
    return template1;
  }
  _commitIterable(value) {
    if (!isArray(this._$committedValue)) {
      this._$committedValue = [];
      this._$clear();
    }
    const itemParts = this._$committedValue;
    let partIndex = 0;
    let itemPart;
    for (const item of value) {
      if (partIndex === itemParts.length) {
        itemParts.push(
          itemPart = new ChildPart(
            this._insert(createMarker()),
            this._insert(createMarker()),
            this,
            this.options,
          ),
        );
      } else {
        itemPart = itemParts[partIndex];
      }
      itemPart._$setValue(item);
      partIndex++;
    }
    if (partIndex < itemParts.length) {
      this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
      itemParts.length = partIndex;
    }
  }
  _$clear(start = wrap(this._$startNode).nextSibling, from) {
    this._$setChildPartConnected?.(false, true, from);
    while (start && start !== this._$endNode) {
      const n = wrap(start).nextSibling;
      wrap(start).remove();
      start = n;
    }
  }
}
class AttributePart {
  type = 1;
  element;
  name;
  options;
  strings;
  _$committedValue = nothing;
  __directives;
  _$parent;
  _$disconnectableChildren = undefined;
  _sanitizer;
  _setDirectiveConnected = undefined;
  get tagName() {
    return this.element.tagName;
  }
  constructor(element1, name, strings2, parent2, options3) {
    this.element = element1;
    this.name = name;
    this._$parent = parent2;
    this.options = options3;
    if (strings2.length > 2 || strings2[0] !== "" || strings2[1] !== "") {
      this._$committedValue = new Array(strings2.length - 1).fill(nothing);
      this.strings = strings2;
    } else {
      this._$committedValue = nothing;
    }
    if (true) {
      this._sanitizer = undefined;
    }
  }
  _$setValue(value, directiveParent = this, valueIndex, noCommit) {
    const strings3 = this.strings;
    let change = false;
    if (strings3 === undefined) {
      value = resolveDirective(this, value, directiveParent, 0);
      change = !isPrimitive(value) ||
        value !== this._$committedValue && value !== noChange;
      if (change) {
        this._$committedValue = value;
      }
    } else {
      const values = value;
      value = strings3[0];
      let i, v;
      for (i = 0; i < strings3.length - 1; i++) {
        v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
        if (v === noChange) {
          v = this._$committedValue[i];
        }
        change ||= !isPrimitive(v) || v !== this._$committedValue[i];
        if (v === nothing) {
          value = nothing;
        } else if (value !== nothing) {
          value += (v ?? "") + strings3[i + 1];
        }
        this._$committedValue[i] = v;
      }
    }
    if (change && !noCommit) {
      this._commitValue(value);
    }
  }
  _commitValue(value) {
    if (value === nothing) {
      wrap(this.element).removeAttribute(this.name);
    } else {
      if (true) {
        if (this._sanitizer === undefined) {
          this._sanitizer = sanitizerFactoryInternal(
            this.element,
            this.name,
            "attribute",
          );
        }
        value = this._sanitizer(value ?? "");
      }
      wrap(this.element).setAttribute(this.name, value ?? "");
    }
  }
}
class PropertyPart extends AttributePart {
  type = 3;
  _commitValue(value) {
    if (true) {
      if (this._sanitizer === undefined) {
        this._sanitizer = sanitizerFactoryInternal(
          this.element,
          this.name,
          "property",
        );
      }
      value = this._sanitizer(value);
    }
    this.element[this.name] = value === nothing ? undefined : value;
  }
}
class BooleanAttributePart extends AttributePart {
  type = 4;
  _commitValue(value) {
    if (value && value !== nothing) {
      wrap(this.element).setAttribute(this.name, "");
    } else {
      wrap(this.element).removeAttribute(this.name);
    }
  }
}
class EventPart extends AttributePart {
  type = 5;
  _$setValue(newListener, directiveParent = this) {
    newListener = resolveDirective(this, newListener, directiveParent, 0) ??
      nothing;
    if (newListener === noChange) {
      return;
    }
    const oldListener = this._$committedValue;
    const shouldRemoveListener =
      newListener === nothing && oldListener !== nothing ||
      newListener.capture !== oldListener.capture ||
      newListener.once !== oldListener.once ||
      newListener.passive !== oldListener.passive;
    const shouldAddListener = newListener !== nothing &&
      (oldListener === nothing || shouldRemoveListener);
    if (shouldRemoveListener) {
      this.element.removeEventListener(this.name, this, oldListener);
    }
    if (shouldAddListener) {
      this.element.addEventListener(this.name, this, newListener);
    }
    this._$committedValue = newListener;
  }
  handleEvent(event) {
    if (typeof this._$committedValue === "function") {
      this._$committedValue.call(this.options?.host ?? this.element, event);
    } else {
      this._$committedValue.handleEvent(event);
    }
  }
}
class ElementPart {
  element;
  type = 6;
  __directive;
  _$committedValue;
  _$parent;
  _$disconnectableChildren = undefined;
  _setDirectiveConnected = undefined;
  options;
  constructor(element2, parent3, options4) {
    this.element = element2;
    this._$parent = parent3;
    this.options = options4;
  }
  _$setValue(value) {
    resolveDirective(this, value);
  }
}
globalThis["litHtmlPlatformSupport"]?.(Template, ChildPart);
(globalThis["litHtmlVersions"] ??= []).push("2.0.0-rc.3");
(globalThis["litElementVersions"] ??= []).push("3.0.0-rc.2");
class LitElement extends ReactiveElement {
  static ["finalized"] = true;
  static _$litElement$ = true;
  renderOptions = {
    host: this,
  };
  __childPart = undefined;
  createRenderRoot() {
    const renderRoot = super.createRenderRoot();
    this.renderOptions.renderBefore ??= renderRoot.firstChild;
    return renderRoot;
  }
  update(changedProperties) {
    const value = this.render();
    super.update(changedProperties);
    this.__childPart = render(value, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback();
    this.__childPart?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.__childPart?.setConnected(false);
  }
  render() {
    return noChange;
  }
}
globalThis["litElementHydrateSupport"]?.({
  LitElement,
});
globalThis["litElementPlatformSupport"]?.({
  LitElement,
});
if (true) {
  LitElement["finalize"] = function () {
    const finalized1 = ReactiveElement.finalize.call(this);
    if (!finalized1) {
      return false;
    }
    const warnRemoved = (obj, name1) => {
      if (obj[name1] !== undefined) {
        console.warn(
          `\`${name1}\` is implemented. It ` +
            `has been removed from this version of LitElement. `,
        );
      }
    };
    [
      `render`,
      `getStyles`,
    ].forEach((name1) => warnRemoved(this, name1));
    [
      `adoptStyles`,
    ].forEach((name1) => warnRemoved(this.prototype, name1));
    return true;
  };
}
var _class;
var _dec = customElement("deno-element");
let DenoElement2 = _class =
  _dec(
    (_class = class DenoElement1 extends LitElement {
      static styles = [
        css
          `\n    .green_text {\n      color: green;\n    }\n\n    .blue_text {\n      color: blue;\n    }\n\n    .red_text {\n      color: red;\n    }\n  `,
      ];
      render() {
        return html2
          `\n      <p>Hello world :)</p>\n      <p>\n        I hope y'all make some amazing projects with\n        <span class="green_text">Deno</span> and\n        <span class="blue_text">Lit</span>!\n      </p>\n      <p>best!</p>\n      <p>Brian Taylor Vann <span class="red_text"><3</span></p>\n    `;
      }
    }) || _class,
  ) || _class;
export { DenoElement2 as DenoElement };
