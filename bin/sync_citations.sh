#!/bin/bash
# ---------------------------------------------------------------------------
# Auto-sync Google Scholar citations for ningbioinfo.github.io
#
# Runs LOCALLY (your home IP), because Google Scholar blocks GitHub Actions'
# datacenter IPs. Scrapes Scholar -> updates _data/citations.yml -> commits ->
# pushes. GitHub Pages then rebuilds the site automatically.
#
# Scheduled by the LaunchAgent: ~/Library/LaunchAgents/com.ningliu.scholar-sync.plist
# Logs to: bin/sync_citations.log
# Run manually any time with:  bash bin/sync_citations.sh
# ---------------------------------------------------------------------------
set -uo pipefail

# Repo root = the parent of this script's bin/ directory (self-locating, so the
# script works from the ~/Documents copy or the dedicated ~/.scholar-sync clone).
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/.." && pwd)"
PYTHON="/Users/a1692215/miniconda3/bin/python3"
LOG="$REPO/bin/sync_citations.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

cd "$REPO" || { log "ERROR: repo not found at $REPO"; exit 1; }

log "=== sync start (repo: $REPO) ==="

# Stay current with any changes pushed from the editing copy before we modify.
git pull --rebase --autostash origin main >> "$LOG" 2>&1 || log "WARN: git pull failed; continuing."

# 1. Refresh the data file from Google Scholar (writes _data/citations.yml)
if ! "$PYTHON" bin/update_citations_local.py >> "$LOG" 2>&1; then
  log "ERROR: scrape failed (Scholar may have rate-limited); leaving data unchanged."
  exit 1
fi

# 2. Commit + push only if the data actually changed
if git diff --quiet -- _data/citations.yml; then
  log "No change in citations.yml; nothing to push."
  log "=== sync end (no-op) ==="
  exit 0
fi

git add _data/citations.yml
if git commit -q -m "Auto-update Google Scholar citations ($(date '+%Y-%m-%d'))" >> "$LOG" 2>&1; then
  if git push origin main >> "$LOG" 2>&1; then
    log "Pushed updated citations. GitHub Pages will rebuild."
    log "=== sync end (updated) ==="
  else
    log "ERROR: git push failed."
    exit 1
  fi
else
  log "ERROR: git commit failed."
  exit 1
fi
