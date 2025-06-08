# Bimetric Chrome Extension Makefile

.PHONY: help build build-zip build-crx clean install test

# Default target
help:
	@echo "Bimetric Chrome Extension Build Commands"
	@echo "========================================"
	@echo ""
	@echo "Available targets:"
	@echo "  build      - Build both ZIP and CRX files"
	@echo "  build-zip  - Build only ZIP file (for Chrome Web Store)"
	@echo "  build-crx  - Build only CRX file (for manual distribution)"
	@echo "  install    - Install Node.js dependencies"
	@echo "  clean      - Remove build artifacts"
	@echo "  test       - Run extension tests"
	@echo ""
	@echo "Examples:"
	@echo "  make build      # Build everything"
	@echo "  make build-zip  # Web Store package only"
	@echo "  make clean      # Clean up dist/ folder"

# Install dependencies
install:
	@echo "Installing Node.js dependencies..."
	npm install

# Build everything (default method using shell script)
build:
	@echo "Building extension using shell script..."
	./build.sh

# Build using Node.js script
build-node:
	@echo "Building extension using Node.js script..."
	node build.js

# Build only ZIP file
build-zip:
	@echo "Building ZIP file only..."
	node build.js --zip-only

# Build only CRX file  
build-crx:
	@echo "Building CRX file only..."
	node build.js --crx-only

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	@echo "✅ Cleaned dist/ directory"

# Run tests
test:
	@echo "Running extension tests..."
	@if [ -f "tests/debug-test.js" ]; then \
		node tests/debug-test.js; \
	else \
		echo "No test files found"; \
	fi
	@echo "💡 Open tests/test.html in Chrome to test manually"

# Show current version
version:
	@echo "Current version:"
	@grep '"version"' src/manifest.json | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/'
