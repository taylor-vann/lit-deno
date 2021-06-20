#!/bin/bash

deno run \
    --allow-read \
    --allow-net \
    https://deno.land/std/http/file_server.ts \
    --port=8000