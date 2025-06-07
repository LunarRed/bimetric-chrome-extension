// content.js

// --- Conversion Logic ---

const conversions = {
    // Metric to Imperial
    mm: (val) => ({ value: val / 25.4, unit: 'in' }),
    cm: (val) => ({ value: val / 2.54, unit: 'in' }),
    m: (val) => ({ value: val * 3.281, unit: 'ft' }),
    km: (val) => ({ value: val / 1.609, unit: 'mi' }),
    g: (val) => ({ value: val / 28.35, unit: 'oz' }),
    kg: (val) => ({ value: val * 2.205, unit: 'lb' }),
    ml: (val) => ({ value: val / 29.574, unit: 'fl oz' }),
    l: (val) => ({ value: val / 3.785, unit: 'gal' }),
    '°c': (val) => ({ value: (val * 9/5) + 32, unit: '°F' }),

    // Imperial to Metric
    in: (val) => ({ value: val * 25.4, unit: 'mm' }),
    ft: (val) => ({ value: val / 3.281, unit: 'm' }),
    yd: (val) => ({ value: val / 1.094, unit: 'm' }),
    mi: (val) => ({ value: val * 1.609, unit: 'km' }),
    oz: (val) => ({ value: val * 28.35, unit: 'g' }),
    lb: (val) => ({ value: val / 2.205, unit: 'kg' }),
    'fl oz': (val) => ({ value: val * 29.574, unit: 'ml' }),
    gal: (val) => ({ value: val * 3.785, unit: 'l' }),
    '°f': (val) => ({ value: (val - 32) * 5/9, unit: '°C' }),
};

// --- Regex Definitions ---

const patterns = {
    metric_to_imperial: [
        // Dimension patterns (process these first)
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(mm|millimeters?)\b/gi, unit: 'mm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(mm|millimeters?)\b/gi, unit: 'mm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(cm|centimeters?)\b/gi, unit: 'cm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(cm|centimeters?)\b/gi, unit: 'cm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(m|meters?)\b/gi, unit: 'm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(m|meters?)\b/gi, unit: 'm', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(km|kilometers?)\b/gi, unit: 'km', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(km|kilometers?)\b/gi, unit: 'km', isDimension: true },
        
        // Regular single unit patterns
        { regex: /(\d*\.?\d+)\s*(mm|millimeters?)\b/gi, unit: 'mm' },
        { regex: /(\d*\.?\d+)\s*(cm|centimeters?)\b/gi, unit: 'cm' },
        { regex: /(\d*\.?\d+)\s*(m|meters?)\b/gi, unit: 'm' },
        { regex: /(\d*\.?\d+)\s*(km|kilometers?)\b/gi, unit: 'km' },
        { regex: /(\d*\.?\d+)\s*(g|grams?)\b/gi, unit: 'g' },
        { regex: /(\d*\.?\d+)\s*(kg|kilograms?)\b/gi, unit: 'kg' },
        { regex: /(\d*\.?\d+)\s*(ml|milliliters?)\b/gi, unit: 'ml' },
        { regex: /(\d*\.?\d+)\s*(l|liters?)\b/gi, unit: 'l' },
        { regex: /(-?\d*\.?\d+)\s*°\s*[cC]\b/g, unit: '°c' }
    ],
    imperial_to_metric: [
        // Dimension patterns (process these first)
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(in|inch|inches|")\b/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(in|inch|inches|")\b/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(ft|foot|feet|')\b/gi, unit: 'ft', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(ft|foot|feet|')\b/gi, unit: 'ft', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(yd|yards?)\b/gi, unit: 'yd', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(yd|yards?)\b/gi, unit: 'yd', isDimension: true },
        
        // Regular single unit patterns
        { regex: /(\d*\.?\d+)\s*(in|inch|inches|")\b/gi, unit: 'in' },
        { regex: /(\d*\.?\d+)\s*(ft|foot|feet|')\b/gi, unit: 'ft' },
        { regex: /(\d*\.?\d+)\s*(yd|yards?)\b/gi, unit: 'yd' },
        { regex: /(\d*\.?\d+)\s*(mi|miles?)\b/gi, unit: 'mi' },
        { regex: /(\d*\.?\d+)\s*(oz|ounces?)\b/gi, unit: 'oz' },
        { regex: /(\d*\.?\d+)\s*(lb|lbs|pounds?)\b/gi, unit: 'lb' },
        { regex: /(\d*\.?\d+)\s*(fl oz|fluid ounces?)\b/gi, unit: 'fl oz' },
        { regex: /(\d*\.?\d+)\s*(gal|gallons?)\b/gi, unit: 'gal' },
        { regex: /(-?\d*\.?\d+)\s*°\s*[fF]\b/g, unit: '°f' }
    ]
};

const MARK_TAG_CLASS = 'unit-converter-highlight';

// --- DOM Manipulation ---

function performConversion(mode) {
    if (mode === 'off') return;
    
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    const nodesToProcess = [];
    
    // First, collect all text nodes to avoid issues with live DOM modification
    while (textNode = walker.nextNode()) {
        if (textNode.parentElement.closest(`.${MARK_TAG_CLASS}, script, style, noscript`)) {
            continue;
        }
        nodesToProcess.push(textNode);
    }

    let conversionsCount = 0;

    // Separate dimension patterns from regular patterns
    const dimensionPatterns = patterns[mode].filter(p => p.isDimension);
    const regularPatterns = patterns[mode].filter(p => !p.isDimension);

    // Process collected nodes
    for (const node of nodesToProcess) {
        let content = node.nodeValue;
        let hasChanged = false;

        // First, identify and mark all dimension pattern locations to avoid double processing
        const dimensionLocations = [];
        dimensionPatterns.forEach(p => {
            const regex = new RegExp(p.regex.source, p.regex.flags);
            let match;
            while ((match = regex.exec(content)) !== null) {
                dimensionLocations.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    pattern: p
                });
                if (!p.regex.global) break;
            }
        });

        // Sort dimension locations by start position
        dimensionLocations.sort((a, b) => a.start - b.start);

        // Process dimension patterns first
        dimensionPatterns.forEach(p => {
            content = content.replace(p.regex, (match, ...args) => {
                const conversionFn = conversions[p.unit.toLowerCase()];
                if (!conversionFn) return match;

                // Handle dimension patterns: "A x B unit" or "A x B x C unit"
                const unitStr = args[args.length - 3]; // Unit is always 3rd from end
                const values = [];
                
                // Extract all numeric values (excluding unit, offset, and string)
                for (let i = 0; i < args.length - 3; i++) {
                    if (args[i] !== undefined) {
                        const val = parseFloat(args[i]);
                        if (!isNaN(val)) {
                            values.push(val);
                        }
                    }
                }
                
                if (values.length === 0) return match;
                
                // Convert all values
                const convertedValues = values.map(val => {
                    const { value: convertedValue, unit: convertedUnit } = conversionFn(val);
                    return {
                        original: val,
                        converted: Number(convertedValue.toFixed(2)),
                        unit: convertedUnit
                    };
                });
                
                // Build the converted dimension string
                const convertedDimStr = convertedValues.map(v => v.converted).join(' x ') + ' ' + convertedValues[0].unit;
                
                hasChanged = true;
                conversionsCount++;
                return `${match} <mark class="${MARK_TAG_CLASS}">(${convertedDimStr})</mark>`;
            });
        });

        // Then, process regular patterns but skip any that overlap with dimension locations
        regularPatterns.forEach(p => {
            const originalContent = node.nodeValue; // Use original content for position checking
            
            content = content.replace(p.regex, (match, ...args) => {
                const offset = args[args.length - 2];
                const matchEnd = offset + match.length;
                
                // Check if this match overlaps with any dimension pattern location
                const overlapsWithDimension = dimensionLocations.some(dim => {
                    return (offset >= dim.start && offset < dim.end) || 
                           (matchEnd > dim.start && matchEnd <= dim.end) ||
                           (offset < dim.start && matchEnd > dim.end);
                });
                
                if (overlapsWithDimension) {
                    return match; // Skip this match as it overlaps with a dimension pattern
                }
                
                const conversionFn = conversions[p.unit.toLowerCase()];
                if (!conversionFn) return match;

                // Handle regular single value patterns
                const valueStr = args[0];
                const originalValue = parseFloat(valueStr);
                if (isNaN(originalValue)) return match;
                
                const { value: convertedValue, unit: convertedUnit } = conversionFn(originalValue);
                const formattedValue = Number(convertedValue.toFixed(2));
                
                hasChanged = true;
                conversionsCount++;
                return `${match} <mark class="${MARK_TAG_CLASS}">(${formattedValue} ${convertedUnit})</mark>`;
            });
        });

        if (hasChanged) {
            const newElement = document.createElement('span');
            newElement.innerHTML = content;
            node.parentNode.replaceChild(newElement, node);
        }
    }

    // Show notification banner if conversions were made
    if (conversionsCount > 0) {
        showConversionNotification(mode);
    }

    return conversionsCount;
}

function resetConversions() {
    const marks = document.querySelectorAll(`.${MARK_TAG_CLASS}`);
    marks.forEach(mark => {
        // The space is added before the mark, so we remove the mark and the preceding space.
        const parent = mark.parentNode;
        const previousSibling = mark.previousSibling;
        
        if (parent) {
             // Remove the <mark> tag itself
            mark.remove();
             // Clean up potential empty <span> tags left behind
            if (parent.tagName === 'SPAN' && parent.innerHTML.trim() === '') {
                parent.remove();
            } else if(previousSibling && previousSibling.nodeType === Node.TEXT_NODE && previousSibling.textContent.endsWith(' ')) {
                // remove the space before the mark
                previousSibling.textContent = previousSibling.textContent.slice(0, -1);
            }
        }
    });
    // This will normalize text nodes, merging adjacent ones.
    document.body.normalize();
}

// --- Notification Banner ---

function showConversionNotification(mode) {
    // Remove any existing notification
    const existingNotification = document.getElementById('bimetric-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.id = 'bimetric-notification';
    notification.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #10b981;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        max-width: 280px;
        animation: slideInRight 0.3s ease-out;
    `;

    // Add icon
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/icon48.png');
    icon.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';
    notification.appendChild(icon);

    // Add text based on conversion mode
    const text = document.createElement('span');
    if (mode === 'metric_to_imperial') {
        text.textContent = 'Metric units found and converted.';
    } else {
        text.textContent = 'Imperial units found and converted.';
    }
    notification.appendChild(text);

    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 4000);
}

// --- Auto-conversion on page load ---

function autoConvertOnLoad() {
    chrome.storage.sync.get(['conversionMode', 'autoConvert'], (result) => {
        const autoConvert = result.autoConvert !== undefined ? result.autoConvert : true;
        
        // Only auto-convert if the setting is enabled
        if (autoConvert) {
            const mode = result.conversionMode || 'metric_to_imperial';
            // Wait a bit for page to fully load
            setTimeout(() => {
                performConversion(mode);
            }, 1000);
        }
    });
}

// Run auto-conversion when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoConvertOnLoad);
} else {
    autoConvertOnLoad();
}


// --- Event Listener ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convert") {
        // Reset first to avoid duplicate conversions
        resetConversions();
        const conversionsCount = performConversion(request.mode);
        sendResponse({status: "conversion done", count: conversionsCount});
    } else if (request.action === "reset") {
        resetConversions();
        sendResponse({status: "reset done"});
    }
    return true; // Indicates an asynchronous response
});
