# Lit-Deno

Lit-Deno is a fork of [Lit](https://lit.dev/) for [Deno](https://deno.land/).

It is not officially supported by the Lit project. (yet? give it a star!)

## Get Started

```Typescript
import { LitElement } from "https://raw.githubusercontent.com/taylor-vann/lit-deno/main/v2.0.x/lit.ts";
```

Visit the [lit dev docs](https://lit.dev/docs/) to learn how to build applications with Lit.

## Why Deno?

[Lit](https://lit.dev/) is developed in Typescript. It's a small and fast framework to generate and maintain DOM content.

In 2021, the variety of frontend frameworks in the Deno ecosystem is less than spectacular. Mainly being aleph.js. 

[Lit](https://lit.dev/) is well suited to the Deno philosophy, providing a fast and secure codebase with a small footprint.

It's collection of utilities giving developers the ability to create webcomponents and reusable parts of an application.

## Goals

Lit-Deno treats [Lit](https://lit.dev/) as a source of truth. Code is altered as minimally as possible.

Accordingly, there are no mutations to core code outside of a select few typings.

## Current Stopgaps

There are vast and wild differences between NodeJS and Deno for tests and cli tools.

In an effort to deviate as little as possible from [the original repository](https://github.com/lit/lit/), Lit-Deno does not currently fork tests or command line tools.

Command line tools are on the horizon though :)

## Contributions

Lit-Deno will not accept contributions.

Please direct contributions towards the Lit library.

Do not post Lit-Deno issues in the original Lit repository. Post them here.

## IMPORTANT DISCLOSURE

Lit-Deno supports every licence and engineering decision made by [Lit](https://lit.dev/) and follows the same code of conduct.

## LICENCE

Lit-Deno is released under the same licence as the [Lit licence](https://github.com/lit/lit/blob/main/LICENSE):

BSD 3-Clause License



