/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { _installMsgImplementation } from "../lit-localize.ts";
import { generateMsgId } from "../internal/id-generation.ts";
import { Deferred } from "../internal/deferred.ts";
import { LOCALE_STATUS_EVENT } from "../internal/locale-status-event.ts";
import { joinStringsAndValues } from "../internal/str-tag.ts";
import { defaultMsg } from "../internal/default-msg.ts";

import type { TemplateResult } from "../../lit-element/index.ts";
import type { LocaleStatusEventDetail } from "../internal/locale-status-event.ts";
import type {
  LocaleModule,
  MsgFn,
  MsgOptions,
  TemplateLike,
  TemplateMap,
} from "../internal/types.ts";

/**
 * Configuration parameters for lit-localize when in runtime mode.
 */
export interface RuntimeConfiguration {
  /**
   * Required locale code in which source templates in this project are written,
   * and the initial active locale.
   */
  sourceLocale: string;

  /**
   * Required locale codes that are supported by this project. Should not
   * include the `sourceLocale` code.
   */
  targetLocales: Iterable<string>;

  /**
   * Required function that returns a promise of the localized templates for the
   * given locale code. For security, this function will only ever be called
   * with a `locale` that is contained by `targetLocales`.
   */
  loadLocale: (locale: string) => Promise<LocaleModule>;
}

/**
 * Dispatch a "lit-localize-status" event to `window` with the given detail.
 */
function dispatchStatusEvent(detail: LocaleStatusEventDetail) {
  window.dispatchEvent(new CustomEvent(LOCALE_STATUS_EVENT, { detail }));
}

let activeLocale = "";
let loadingLocale: string | undefined;
let sourceLocale: string | undefined;
let validLocales: Set<string> | undefined;
let loadLocale: ((locale: string) => Promise<LocaleModule>) | undefined;
let templates: TemplateMap | undefined;
let loading = new Deferred<void>();
// The loading promise must be initially resolved, because that's what we should
// return if the user immediately calls setLocale(sourceLocale).
loading.resolve();
let requestId = 0;

/**
 * Set configuration parameters for lit-localize when in runtime mode. Returns
 * an object with functions:
 *
 * - `getLocale`: Return the active locale code.
 * - `setLocale`: Set the active locale code.
 *
 * Throws if called more than once.
 */
export const configureLocalization:
  & ((config: RuntimeConfiguration) => {
    getLocale: typeof getLocale;
    setLocale: typeof setLocale;
  })
  & {
    _LIT_LOCALIZE_CONFIGURE_LOCALIZATION_?: never;
  } = (config: RuntimeConfiguration) => {
    _installMsgImplementation(runtimeMsg as MsgFn);
    activeLocale = sourceLocale = config.sourceLocale;
    validLocales = new Set(config.targetLocales);
    validLocales.add(config.sourceLocale);
    loadLocale = config.loadLocale;
    return { getLocale, setLocale };
  };

/**
 * Return the active locale code.
 */
const getLocale: (() => string) & {
  _LIT_LOCALIZE_GET_LOCALE_?: never;
} = () => {
  return activeLocale;
};

/**
 * Set the active locale code, and begin loading templates for that locale using
 * the `loadLocale` function that was passed to `configureLocalization`. Returns
 * a promise that resolves when the next locale is ready to be rendered.
 *
 * Note that if a second call to `setLocale` is made while the first requested
 * locale is still loading, then the second call takes precedence, and the
 * promise returned from the first call will resolve when second locale is
 * ready. If you need to know whether a particular locale was loaded, check
 * `getLocale` after the promise resolves.
 *
 * Throws if the given locale is not contained by the configured `sourceLocale`
 * or `targetLocales`.
 */
const setLocale: ((newLocale: string) => Promise<void>) & {
  _LIT_LOCALIZE_SET_LOCALE_?: never;
} = (newLocale: string) => {
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
  dispatchStatusEvent({ status: "loading", loadingLocale: newLocale });
  const localePromise: Promise<Partial<LocaleModule>> =
    newLocale === sourceLocale
      ? // We could switch to the source locale synchronously, but we prefer to
      // queue it on a microtask so that switching locales is consistently
      // asynchronous.
        Promise.resolve({ templates: undefined })
      : loadLocale(newLocale);
  localePromise.then(
    (mod) => {
      if (requestId === thisRequestId) {
        activeLocale = newLocale;
        loadingLocale = undefined;
        templates = mod.templates;
        dispatchStatusEvent({ status: "ready", readyLocale: newLocale });
        loading.resolve();
      }
      // Else another locale was requested in the meantime. Don't resolve or
      // reject, because the newer load call is going to use the same promise.
      // Note the user can call getLocale() after the promise resolves if they
      // need to check if the locale is still the one they expected to load.
    },
    (err) => {
      if (requestId === thisRequestId) {
        dispatchStatusEvent({
          status: "error",
          errorLocale: newLocale,
          errorMessage: err.toString(),
        });
        loading.reject(err);
      }
    },
  );
  return loading.promise;
};

function runtimeMsg(
  template: TemplateLike,
  options?: MsgOptions,
): string | TemplateResult {
  if (templates) {
    const id = options?.id ?? generateId(template);
    const localized = templates[id];
    if (localized) {
      if (typeof localized === "string") {
        // E.g. "Hello World!"
        return localized;
      } else if ("strTag" in localized) {
        // E.g. str`Hello ${name}!`
        //
        // Localized templates have ${number} in place of real template
        // expressions. They can't have real template values, because the
        // variable scope would be wrong. The number tells us the index of the
        // source value to substitute in its place, because expressions can be
        // moved to a different position during translation.
        return joinStringsAndValues(
          localized.strings,
          // Cast `template` because its type wasn't automatically narrowed (but
          // we know it must be the same type as `localized`).
          (template as TemplateResult).values,
          localized.values as number[],
        );
      } else {
        // E.g. html`Hello <b>${name}</b>!`
        //
        // We have to keep our own mapping of expression ordering because we do
        // an in-place update of `values`, and otherwise we'd lose ordering for
        // subsequent renders.
        let order = expressionOrders.get(localized);
        if (order === undefined) {
          order = localized.values as number[];
          expressionOrders.set(localized, order);
        }
        // Cast `localized.values` because it's readonly.
        (
          localized as {
            values: TemplateResult["values"];
          }
        ).values = order.map((i) => (template as TemplateResult).values[i]);
        return localized;
      }
    }
  }
  return defaultMsg(template);
}

const expressionOrders = new WeakMap<TemplateResult, number[]>();

const hashCache = new Map<TemplateStringsArray | string, string>();

function generateId(template: TemplateLike): string {
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
