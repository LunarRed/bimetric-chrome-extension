#!/bin/bash

# Bimetric Chrome Extension Build Script
# Creates both .crx (packed) and .zip (web store) versions

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Bimetric Chrome Extension Build Script${NC}"
echo "=============================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Paths
SRC_DIR="$PROJECT_ROOT/src"
KEYS_DIR="$PROJECT_ROOT/keys"
DIST_DIR="$PROJECT_ROOT/dist"
MANIFEST_FILE="$SRC_DIR/manifest.json"
PRIVATE_KEY="$KEYS_DIR/bimetric-inline-converter.pem"

# Check if required files exist
if [ ! -f "$MANIFEST_FILE" ]; then
    echo -e "${RED}❌ Error: manifest.json not found at $MANIFEST_FILE${NC}"
    exit 1
fi

if [ ! -f "$PRIVATE_KEY" ]; then
    echo -e "${RED}❌ Error: Private key not found at $PRIVATE_KEY${NC}"
    exit 1
fi

# Extract version from manifest.json
VERSION=$(grep '"version"' "$MANIFEST_FILE" | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')

if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ Error: Could not extract version from manifest.json${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Building version: $VERSION${NC}"

# Create dist directory
mkdir -p "$DIST_DIR"

# File names
CRX_FILE="$DIST_DIR/bimetric-inline-converter-$VERSION.crx"
ZIP_FILE="$DIST_DIR/bimetric-inline-converter-$VERSION.zip"

# Clean previous builds
if [ -f "$CRX_FILE" ]; then
    rm "$CRX_FILE"
    echo -e "${YELLOW}🗑️  Removed existing CRX file${NC}"
fi

if [ -f "$ZIP_FILE" ]; then
    rm "$ZIP_FILE"
    echo -e "${YELLOW}🗑️  Removed existing ZIP file${NC}"
fi

# Check if Chrome is installed (for CRX creation)
CHROME_PATH=""
if command -v google-chrome >/dev/null 2>&1; then
    CHROME_PATH="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
    CHROME_PATH="chromium"
elif [ -f "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -f "/Applications/Chromium.app/Contents/MacOS/Chromium" ]; then
    CHROME_PATH="/Applications/Chromium.app/Contents/MacOS/Chromium"
fi

# Create ZIP file for Chrome Web Store
echo -e "${BLUE}📦 Creating ZIP file for Chrome Web Store...${NC}"
cd "$SRC_DIR"
zip -r "$ZIP_FILE" . -x "*.DS_Store" "*.git*" "node_modules/*" "*.log"
cd "$PROJECT_ROOT"
echo -e "${GREEN}✅ ZIP file created: $(basename "$ZIP_FILE")${NC}"

# Create CRX file (packed extension)
if [ -n "$CHROME_PATH" ]; then
    echo -e "${BLUE}📦 Creating CRX file (packed extension)...${NC}"
    
    # Use Chrome to pack the extension
    "$CHROME_PATH" --pack-extension="$SRC_DIR" --pack-extension-key="$PRIVATE_KEY" --no-message-box >/dev/null 2>&1
    
    # Chrome creates the CRX in the parent directory of src/, move it to dist/
    GENERATED_CRX="$PROJECT_ROOT/src.crx"
    if [ -f "$GENERATED_CRX" ]; then
        mv "$GENERATED_CRX" "$CRX_FILE"
        echo -e "${GREEN}✅ CRX file created: $(basename "$CRX_FILE")${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Could not create CRX file. Chrome may not be properly configured.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Warning: Chrome not found. Skipping CRX file creation.${NC}"
    echo -e "${YELLOW}   Install Google Chrome or Chromium to enable CRX packaging.${NC}"
fi

# Display results
echo ""
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo "=============================================="
echo -e "${BLUE}📁 Output directory: $DIST_DIR${NC}"

if [ -f "$ZIP_FILE" ]; then
    echo -e "${GREEN}📦 ZIP file: $(basename "$ZIP_FILE") ($(du -h "$ZIP_FILE" | cut -f1))${NC}"
fi

if [ -f "$CRX_FILE" ]; then
    echo -e "${GREEN}📦 CRX file: $(basename "$CRX_FILE") ($(du -h "$CRX_FILE" | cut -f1))${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "• Upload ZIP file to Chrome Web Store Developer Dashboard"
echo "• Distribute CRX file for manual installation (if created)"
echo "• Test the packaged extension before publishing"
