import { css, html, LitElement, customElement } from "./deps.ts";

@customElement("deno-element")
class DenoElement extends LitElement {
  static styles = [css`
    .green_text {
      color: green;
    }

    .blue_text {
      color: blue;
    }

    .red_text {
      color: red;
    }
  `];

  render() {
    return html`
      <p>Hello world!</p>
      <p>
        I hope y'all make some amazing projects with
        <span class="green_text">Deno</span> and
        <span class="blue_text">Lit</span>!
      </p>
      <p class="red_text"><3</p>
    `;
  }
}

export { DenoElement };
