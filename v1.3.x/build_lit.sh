deno bundle --config ./tsconfig.json ./lit-html/src/lit-html.ts ./lit-html/dist/lit-html.js
deno bundle --config ./tsconfig.json ./reactive-element/src/reactive-element.ts ./reactive-element/dist/reactive-element.js

deno bundle --config ./tsconfig.json ./lit-element/src/index.ts ./lit-element/dist/index.js
deno bundle --config ./tsconfig.json ./lit/src/index.ts ./lit/dist/index.js

deno bundle --config ./tsconfig.json ./localize/src/lit-localize.ts ./localize/dist/lit-localize.js