/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

interface ShadyCSS {
  nativeCss: boolean;
  nativeShadow: boolean;
  styleElement(host: Element, overrideProps?: { [key: string]: string }): void;
  styleSubtree(host: Element, overrideProps?: { [key: string]: string }): void;
  getComputedStyleValue(element: Element, property: string): string;
  ApplyShim: object;
  prepareTemplateDom(template: Element, elementName: string): void;
  prepareTemplateStyles(template: Element, elementName: string): void;
  ScopingShim:
    | undefined
    | {
      prepareAdoptedCssText(
        cssTextArray: string[],
        elementName: string,
      ): void;
    };
}

interface ShadyDOM {
  inUse: boolean;
  flush: () => void;
  noPatch: boolean | string;
  wrap: (node: Node) => Node;
}

type LitExtendedWindow = Window & {
  ShadyCSS?: ShadyCSS;
  ShadyDOM?: ShadyDOM;

  reactiveElementPlatformSupport: (options: { [index: string]: any }) => void;

  litElementPlatformSupport: (options: { [index: string]: any }) => void;

  litHtmlPlatformSupport: (template: unknown, childPart: unknown) => void;
};

/* The following types are added for suppor in Deno */
export type TrustedHTML = string;

interface TrustedHTMLPolicy {
  createHTML: (s: string) => TrustedHTML;
}

interface TrustedTypesPolicy {
  createPolicy: (s: string, policy: TrustedHTMLPolicy) => TrustedHTMLPolicy;
  emptyScript: string;
}

interface LitDenoWindow extends Window {
  trustedTypes: TrustedTypesPolicy;
}
/* */

export type LitExtraGlobals =
  & typeof globalThis
  & LitExtendedWindow
  & LitDenoWindow; // suport types for deno

export type LitShadowRoot = ShadowRoot & {
  adoptedStyleSheets: CSSStyleSheet[];
};

export type LitCSSStyleSheet = CSSStyleSheet & {
  replaceSync(cssText: string): void;
  replace(cssText: string): Promise<unknown>;
};
