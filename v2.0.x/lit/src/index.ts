/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Although these are re-exported from lit-element.ts, we add
// them here to effectively pre-fetch them and avoid the extra
// waterfall when loading the lit package unbundled
import "../../reactive-element/src/reactive-element.ts";
import "../../lit-html/src/lit-html.ts";

export * from "../../lit-element/src/lit-element.ts";
