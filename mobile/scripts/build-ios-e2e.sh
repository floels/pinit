#!/usr/bin/env bash
#
# Builds the app for the iOS Simulator so Detox can drive it.
#
# Usage: scripts/build-ios-e2e.sh <Debug|Release>
#
# `expo prebuild` runs only when `ios/` is absent, because it costs about 35
# seconds and the generated project stays valid between runs. Delete `ios/`
# after a change to app.json or to the Expo dependencies.

set -euo pipefail

CONFIGURATION="${1:-Release}"
MOBILE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "${MOBILE_ROOT}"

if [ ! -d ios ]; then
  echo "No ios/ directory. Running expo prebuild..."
  npx expo prebuild -p ios
fi

xcodebuild \
  -workspace ios/pinit.xcworkspace \
  -scheme pinit \
  -configuration "${CONFIGURATION}" \
  -sdk iphonesimulator \
  -derivedDataPath ios/build \
  -quiet
