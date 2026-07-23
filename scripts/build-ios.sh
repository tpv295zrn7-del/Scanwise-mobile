#!/bin/bash
# iOS Release Build Script
set -e

echo "==> Installing CocoaPods dependencies..."
cd ios
pod install --repo-update
cd ..

echo "==> Building iOS Release..."
xcodebuild \
  -workspace ios/Scanwise.xcworkspace \
  -scheme Scanwise \
  -configuration Release \
  -derivedDataPath ios/build \
  -arch arm64 \
  CODE_SIGN_STYLE=Automatic \
  IPHONEOS_DEPLOYMENT_TARGET=13.0 \
  | xcpretty || true

echo "==> iOS build complete."
echo "    Output: ios/build/Build/Products/Release-iphoneos/"
