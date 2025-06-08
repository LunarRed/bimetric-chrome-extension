#!/usr/bin/env node

/**
 * Bimetric Chrome Extension Build Script (Node.js version)
 * Creates both .crx (packed) and .zip (web store) versions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

class ExtensionBuilder {
    constructor() {
        this.projectRoot = __dirname;
        this.srcDir = path.join(this.projectRoot, 'src');
        this.keysDir = path.join(this.projectRoot, 'keys');
        this.distDir = path.join(this.projectRoot, 'dist');
        this.manifestFile = path.join(this.srcDir, 'manifest.json');
        this.privateKey = path.join(this.keysDir, 'bimetric-inline-converter.pem');
        
        this.version = null;
        this.args = process.argv.slice(2);
        this.zipOnly = this.args.includes('--zip-only');
        this.crxOnly = this.args.includes('--crx-only');
    }

    checkRequirements() {
        colorLog('blue', '🔧 Bimetric Chrome Extension Build Script (Node.js)');
        console.log('='.repeat(55));

        // Check manifest.json
        if (!fs.existsSync(this.manifestFile)) {
            colorLog('red', `❌ Error: manifest.json not found at ${this.manifestFile}`);
            process.exit(1);
        }

        // Check private key for CRX creation
        if (!this.zipOnly && !fs.existsSync(this.privateKey)) {
            colorLog('red', `❌ Error: Private key not found at ${this.privateKey}`);
            colorLog('yellow', '💡 Use --zip-only flag to build only ZIP file');
            process.exit(1);
        }

        // Extract version
        try {
            const manifest = JSON.parse(fs.readFileSync(this.manifestFile, 'utf8'));
            this.version = manifest.version;
            
            if (!this.version) {
                throw new Error('Version not found in manifest');
            }
            
            colorLog('yellow', `📦 Building version: ${this.version}`);
        } catch (error) {
            colorLog('red', `❌ Error reading manifest.json: ${error.message}`);
            process.exit(1);
        }

        // Create dist directory
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir, { recursive: true });
        }
    }

    async createZipFile() {
        return new Promise((resolve, reject) => {
            const zipFile = path.join(this.distDir, `bimetric-inline-converter-${this.version}.zip`);
            
            // Remove existing ZIP file
            if (fs.existsSync(zipFile)) {
                fs.unlinkSync(zipFile);
                colorLog('yellow', '🗑️  Removed existing ZIP file');
            }

            colorLog('blue', '📦 Creating ZIP file for Chrome Web Store...');

            const output = fs.createWriteStream(zipFile);
            const archive = archiver('zip', { zlib: { level: 9 } });

            output.on('close', () => {
                const size = formatBytes(archive.pointer());
                colorLog('green', `✅ ZIP file created: ${path.basename(zipFile)} (${size})`);
                resolve(zipFile);
            });

            archive.on('error', (err) => {
                colorLog('red', `❌ Error creating ZIP file: ${err.message}`);
                reject(err);
            });

            archive.pipe(output);

            // Add all files from src directory
            archive.directory(this.srcDir, false);

            archive.finalize();
        });
    }

    createCrxFile() {
        const crxFile = path.join(this.distDir, `bimetric-inline-converter-${this.version}.crx`);
        
        // Remove existing CRX file
        if (fs.existsSync(crxFile)) {
            fs.unlinkSync(crxFile);
            colorLog('yellow', '🗑️  Removed existing CRX file');
        }

        colorLog('blue', '📦 Creating CRX file (packed extension)...');

        // Find Chrome executable
        const possibleChromePaths = [
            'google-chrome',
            'chromium',
            '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            '/Applications/Chromium.app/Contents/MacOS/Chromium',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ];

        let chromePath = null;
        for (const path of possibleChromePaths) {
            try {
                if (path.includes('/') || path.includes('\\')) {
                    // Absolute path - check if file exists
                    if (fs.existsSync(path)) {
                        chromePath = path;
                        break;
                    }
                } else {
                    // Command - check if available in PATH
                    execSync(`which ${path}`, { stdio: 'ignore' });
                    chromePath = path;
                    break;
                }
            } catch (error) {
                // Continue to next path
            }
        }

        if (!chromePath) {
            colorLog('yellow', '⚠️  Warning: Chrome not found. Skipping CRX file creation.');
            colorLog('yellow', '   Install Google Chrome or Chromium to enable CRX packaging.');
            return null;
        }

        try {
            // Use Chrome to pack the extension
            const cmd = `"${chromePath}" --pack-extension="${this.srcDir}" --pack-extension-key="${this.privateKey}" --no-message-box`;
            execSync(cmd, { stdio: 'ignore' });

            // Chrome creates the CRX in the parent directory of src/, move it to dist/
            const generatedCrx = path.join(this.projectRoot, 'src.crx');
            if (fs.existsSync(generatedCrx)) {
                fs.renameSync(generatedCrx, crxFile);
                const stats = fs.statSync(crxFile);
                const size = formatBytes(stats.size);
                colorLog('green', `✅ CRX file created: ${path.basename(crxFile)} (${size})`);
                return crxFile;
            } else {
                colorLog('yellow', '⚠️  Warning: Could not create CRX file. Chrome may not be properly configured.');
                return null;
            }
        } catch (error) {
            colorLog('yellow', `⚠️  Warning: Failed to create CRX file: ${error.message}`);
            return null;
        }
    }

    async build() {
        this.checkRequirements();

        const results = {
            zip: null,
            crx: null
        };

        try {
            // Create ZIP file (unless crx-only)
            if (!this.crxOnly) {
                results.zip = await this.createZipFile();
            }

            // Create CRX file (unless zip-only)
            if (!this.zipOnly) {
                results.crx = this.createCrxFile();
            }

            // Display results
            console.log('');
            colorLog('green', '🎉 Build completed successfully!');
            console.log('='.repeat(55));
            colorLog('blue', `📁 Output directory: ${this.distDir}`);

            if (results.zip) {
                colorLog('green', `📦 ZIP file: ${path.basename(results.zip)}`);
            }

            if (results.crx) {
                colorLog('green', `📦 CRX file: ${path.basename(results.crx)}`);
            }

            console.log('');
            colorLog('blue', '📋 Next steps:');
            console.log('• Upload ZIP file to Chrome Web Store Developer Dashboard');
            console.log('• Distribute CRX file for manual installation (if created)');
            console.log('• Test the packaged extension before publishing');

        } catch (error) {
            colorLog('red', `❌ Build failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Check if required dependencies are installed
try {
    require('archiver');
} catch (error) {
    console.log('Installing required dependencies...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('Dependencies installed successfully!');
        console.log('');
    } catch (installError) {
        colorLog('red', '❌ Failed to install dependencies. Please run: npm install');
        process.exit(1);
    }
}

// Run the builder
const builder = new ExtensionBuilder();
builder.build().catch(error => {
    colorLog('red', `❌ Unexpected error: ${error.message}`);
    process.exit(1);
});
