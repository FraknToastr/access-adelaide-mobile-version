#!/usr/bin/env bash
set -euo pipefail

# Run from a normal WSL terminal. The Codex session mounts .git read-only.
project_root="$(cd -- "${BASH_SOURCE[0]%/*}/.." && pwd -P)"
cd -- "$project_root"
remote_url="https://github.com/FraknToastr/access-adelaide-mobile-version.git"
target_branch="${1:-main}"
git_cmd(){ rtk proxy git "$@"; }

if ! command -v rtk >/dev/null 2>&1; then
  printf '%s\n' 'rtk is required; run this in your configured WSL terminal.' >&2
  exit 1
fi
if [[ -d .git && ! -w .git ]]; then
  printf '%s\n' 'The .git directory is read-only in this session. Run this script from your normal WSL terminal.' >&2
  exit 1
fi
git_cmd check-ref-format --branch "$target_branch" >/dev/null

if git_cmd rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  actual_root="$(git_cmd rev-parse --show-toplevel)"
  if [[ "$actual_root" != "$project_root" ]]; then
    printf '%s\n' 'This folder belongs to a different parent repository; stopping without changing it.' >&2
    exit 1
  fi
else
  git_cmd init -b "$target_branch"
fi

if git_cmd remote get-url origin >/dev/null 2>&1; then
  existing_origin="$(git_cmd remote get-url origin)"
  if [[ "$existing_origin" != "$remote_url" && "$existing_origin" != "${remote_url%.git}" && "$existing_origin" != "git@github.com:FraknToastr/access-adelaide-mobile-version.git" ]]; then
    printf '%s\n' 'An unexpected origin is already configured; stopping without replacing it.' >&2
    exit 1
  fi
else
  git_cmd remote add origin "$remote_url"
fi

git_cmd fetch origin
if ! git_cmd rev-parse --verify HEAD >/dev/null 2>&1; then
  git_cmd symbolic-ref HEAD "refs/heads/$target_branch"
  if git_cmd show-ref --verify --quiet "refs/remotes/origin/$target_branch"; then
    git_cmd reset --mixed "origin/$target_branch"
  else
    git_cmd reset --mixed origin/main
  fi
else
  current_branch="$(git_cmd branch --show-current)"
  if [[ "$current_branch" != "$target_branch" ]]; then
    if git_cmd show-ref --verify --quiet "refs/heads/$target_branch"; then
      printf '%s\n' 'The target branch already exists locally. Switch to it and rerun this script.' >&2
      exit 1
    fi
    git_cmd switch -c "$target_branch"
  fi
fi

git_cmd config pull.rebase true
git_cmd config fetch.prune true
git_cmd config push.default simple

# Explicit source allowlist excludes credentials and local handoff archives.
source_paths=(
  .gitignore AGENTS.md README.md ACCESSIBILITY.md VALIDATION.md
  index.html version.json app.js support-ui.js map-engine.js platform-guide.js data.js
  mock_points.geojson icon.svg styles.css ui-controls.js ui-controls.css
  setup-shortcuts.css toolbar.css map-controls.css press-hints.js press-hints.css
  routing-engine.js routing-data.js routing.css data standalone
  scripts vendor "User review update 1.md"
)
rtk proxy node scripts/check-ui-contracts.cjs
rtk proxy node scripts/build-standalone.cjs --check
git_cmd add --all -- "${source_paths[@]}"
if ! git_cmd diff --cached --quiet; then
  git_cmd diff --cached --stat
  git_cmd commit -m "Track modular Access Adelaide workspace"
fi

git_cmd push --set-upstream origin "$target_branch"
git_cmd status --short --branch
printf '\n%s\n' 'Workspace connected and pushed. Use git pull --rebase and git push on this tracked branch.'
