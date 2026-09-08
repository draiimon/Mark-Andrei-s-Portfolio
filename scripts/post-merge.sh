#!/bin/bash
set -e
pnpm install --frozen-lockfile
# Pulling application code must not mutate the existing database schema.
