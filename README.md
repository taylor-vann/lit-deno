# Lit-Deno

Lit-Deno is a fork of [Lit](https://lit.dev/) for [Deno](https://deno.land/).

This is _NOT_ an officially supported Lit project ... yet? Let's get some stars
shining!

## Why Deno?

[Lit](https://lit.dev/) is a fast and secure codebase with a light footprint,
providing feature-rich templating in the browser.

[Lit](https://lit.dev/) is developed in Typescript and leverages modern browser
featrues to create webcomponents and reusable parts of an application.

Lit + Deno can help engineers create amazing sites without NodeJS-esque bundlers
like webpack or rollup.

## Get Started

Import Lit and create and declare your custom elements.

```Typescript
import {
  customElement,
  html,
  LitElement,
} from "https://raw.githubusercontent.com/taylor-vann/lit-deno/main/v2.0.x/lit.ts";

@customElement("my-deno-element")
class MyDenoElement extends LitElement {
  render() {
    return html`
      <p>Hello world!</p>
      <p>Lit + Deno = <3</p>
    `;
  }
}

export { MyDenoElement };
```

Checkout the [docs](https://github.com/taylor-vann/lit-deno/tree/main/docs) for
a similar [example](https://taylor-vann.github.io/lit-deno/) of using Lit with
Deno.

And don't forget to visit the [lit docs](https://lit.dev/docs/) to learn more
about the features Lit provides out of the box.

## What about CSS?

Lit has [extensive tooling](https://lit.dev/docs/components/styles/) for styles.

Try [SheetCake](https://github.com/taylor-vann/sheetcake) with Lit if a more
modular approach is required.

## Goals

Lit-Deno considers [Lit](https://lit.dev/) a source of truth. Code is altered as
minimally as possible.

There are no mutations to Lit's core code outside of a select few typings and
organizational structures.

## Stopgaps

In an effort to deviate as little as possible from
[the original repository](https://github.com/lit/lit/), Lit-Deno does not
currently fork tests or command line tools.

Command line tools are on the horizon though :)

## Disclosure

Lit-Deno supports the licencing and engineering decisions made by the
[Lit](https://lit.dev/) team and follows the same code of conduct.

## License

Lit-Deno is released under the same licence as the
[Lit licence](https://github.com/lit/lit/blob/main/LICENSE):

BSD 3-Clause License
