#!/bin/bash
# Android Release Build Script
set -e

echo "==> Building Android Release APK..."
cd android
./gradlew assembleRelease
cd ..

echo "==> Android build complete."
echo "    Output: android/app/build/outputs/apk/release/app-release.apk"
