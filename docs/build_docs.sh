#!/bin/bash

deno bundle \
    --config ../v2.0.x/tsconfig.json \
    ./scripts/deno_element.ts \
    ./bundle/deno_element.js 