import { html, LitElement } from "../../v2.0.x/lit.ts";
import { customElement } from "../../v2.0.x/lit-element/decorators.ts";

@customElement("deno-element")
class DenoElement extends LitElement {
  render() {
    return html`
      <p>Hello world!</p>
      <p>I hope y'all make some amazing projects with Deno and Lit!</p>
      <p><3</p>
    `;
  }
}

export { DenoElement };
