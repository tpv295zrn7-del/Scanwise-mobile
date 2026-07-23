#!/bin/bash
# Keystore Generation Script for Android Release Signing
# Usage: KEYSTORE_PASS=<pass> KEY_PASS=<pass> ./scripts/generate-keystore.sh
set -e

KEYSTORE_DIR="android/app/keystore"
KEYSTORE_FILE="$KEYSTORE_DIR/scanwise.keystore"

if [ -z "$KEYSTORE_PASS" ] || [ -z "$KEY_PASS" ]; then
  echo "ERROR: KEYSTORE_PASS and KEY_PASS environment variables must be set."
  echo "Usage: KEYSTORE_PASS=mypass KEY_PASS=mypass ./scripts/generate-keystore.sh"
  exit 1
fi

mkdir -p "$KEYSTORE_DIR"

echo "==> Generating keystore at $KEYSTORE_FILE ..."
keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias scanwise \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10950 \
  -storepass "$KEYSTORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=ScanWise, OU=Mobile, O=ScanWise, L=Unknown, ST=Unknown, C=US"

echo "==> Keystore generated: $KEYSTORE_FILE"
echo "    IMPORTANT: Keep this file secure and backed up. Do NOT commit it to version control."
