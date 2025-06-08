# Test Files

This directory contains test files for the Bimetric Unit Converter Chrome extension.

## Files

### `test.html`
A test HTML page with various temperature units and measurements for testing the extension's conversion functionality. Load this page in Chrome with the extension enabled to test:
- Explicit temperature conversions (°C, °F)
- Ambiguous temperature conversions (°, º, o)
- Other unit conversions (length, weight, volume)
- Edge cases and filtering

### `debug-test.js`
A Node.js script for testing regex patterns used in the extension. Run with:
```bash
node tests/debug-test.js
```

This script tests:
- Temperature regex patterns
- Unicode degree symbol matching
- Conversion function accuracy
- Pattern matching edge cases

## Usage

To test the extension:
1. Load the extension in Chrome (Developer mode)
2. Open `test.html` in Chrome
3. Use the extension popup to test conversions
4. Run `debug-test.js` to verify regex patterns work correctly
