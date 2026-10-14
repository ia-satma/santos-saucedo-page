#!/bin/bash
set -euo pipefail

# Installing dependencies and changing a database are intentionally separate.
# A Git merge must never run a schema mutation against whichever DATABASE_URL
# happens to be present in the workspace or deployment.
npm ci
npm run check
