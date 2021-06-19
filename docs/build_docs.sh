#!/bin/bash

# deno cache --reload ./scripts/deno_element.ts

deno bundle \
    --config ../v2.0.x/tsconfig.json \
    ./scripts/deno_element.ts \
    ./bundled/deno_element.js 