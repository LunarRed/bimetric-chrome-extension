# Build Instructions

This document explains how to build and package the Bimetric Chrome Extension for distribution.

## Build Scripts

The project includes multiple build options:

### 1. Shell Script (Recommended for Unix/macOS)
```bash
./build.sh
```

### 2. Node.js Script (Cross-platform)
```bash
node build.js
```

### 3. Make Commands (Convenience wrapper)
```bash
make build        # Build everything
make build-zip    # ZIP only (Chrome Web Store)
make build-crx    # CRX only (manual distribution)
make clean        # Clean dist/ folder
```

### 4. NPM Scripts
```bash
npm run build           # Build everything
npm run build:zip       # ZIP only
npm run build:crx       # CRX only
```

## Output Files

All build outputs are created in the `dist/` directory:

- **`bimetric-inline-converter-{version}.zip`** - For Chrome Web Store submission
- **`bimetric-inline-converter-{version}.crx`** - For manual installation/distribution

The version number is automatically extracted from `src/manifest.json`.

## Requirements

### For ZIP File Creation
- No additional requirements (works with shell script or Node.js)

### For CRX File Creation
- Google Chrome or Chromium installed
- Private key file: `keys/bimetric-inline-converter.pem`

### For Node.js Script
- Node.js 12+ 
- Dependencies: `archiver`, `chalk` (auto-installed)

## File Structure

```
bimetric-chrome-extension/
├── build.sh              # Shell build script
├── build.js              # Node.js build script  
├── package.json          # Node.js dependencies and scripts
├── Makefile              # Make commands
├── src/                  # Extension source files
│   ├── manifest.json     # Extension manifest (contains version)
│   ├── content.js
│   ├── popup.html
│   ├── popup.js
│   ├── popup-styles.css
│   ├── styles.css
│   └── icons/
├── keys/
│   └── bimetric-inline-converter.pem  # Private key for CRX signing
└── dist/                 # Build outputs (created automatically)
    ├── bimetric-inline-converter-1.3.2.zip
    └── bimetric-inline-converter-1.3.2.crx
```

## Chrome Web Store Submission

1. Build the ZIP file:
   ```bash
   ./build.sh
   # or
   make build-zip
   ```

2. Upload `dist/bimetric-inline-converter-{version}.zip` to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

3. Fill out the store listing information

4. Submit for review

## Manual Distribution

1. Build the CRX file:
   ```bash
   ./build.sh
   # or  
   make build-crx
   ```

2. Distribute `dist/bimetric-inline-converter-{version}.crx`

3. Users can install by:
   - Dragging the CRX file to `chrome://extensions/`
   - Or using Developer mode → "Load unpacked" with the unzipped extension

## Version Management

The build scripts automatically read the version from `src/manifest.json`:

```json
{
  "version": "1.3.2"
}
```

To release a new version:
1. Update the version in `src/manifest.json`
2. Update the version history in `README.md`
3. Run the build script
4. The output files will include the new version number

## Troubleshooting

### CRX Creation Fails
- Ensure Chrome/Chromium is installed and accessible
- Verify the private key exists at `keys/bimetric-inline-converter.pem`
- Try building ZIP-only: `make build-zip`

### Permission Errors
- Make scripts executable: `chmod +x build.sh build.js`
- Check file permissions in `src/` directory

### Node.js Dependencies
- Install dependencies: `npm install` or `make install`
- Ensure Node.js version 12 or higher

## Security Notes

- The private key (`keys/bimetric-inline-converter.pem`) should be kept secure
- Do not commit the private key to public repositories
- The CRX file is signed with this key for authenticity
- ZIP files for the Chrome Web Store don't require the private key
