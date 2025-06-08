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
    
    // Acceleration conversions
    'm/s²': (val) => ({ value: val * 3.281, unit: 'ft/s²' }),
    'm/s^2': (val) => ({ value: val * 3.281, unit: 'ft/s²' }),
    'm/s2': (val) => ({ value: val * 3.281, unit: 'ft/s²' }),

    // Imperial to Metric with smart unit scaling
    in: (val) => {
        const mm = val * 25.4;
        if (mm >= 1000) {
            return { value: mm / 10, unit: 'cm' }; // Convert to cm if >= 1000mm
        }
        return { value: mm, unit: 'mm' };
    },
    ft: (val) => {
        const m = val / 3.281;
        if (m >= 1000) {
            return { value: m / 1000, unit: 'km' }; // Convert to km if >= 1000m
        }
        return { value: m, unit: 'm' };
    },
    yd: (val) => {
        const m = val / 1.094;
        if (m >= 1000) {
            return { value: m / 1000, unit: 'km' }; // Convert to km if >= 1000m
        }
        return { value: m, unit: 'm' };
    },
    mi: (val) => ({ value: val * 1.609, unit: 'km' }),
    oz: (val) => {
        const g = val * 28.35;
        if (g >= 1000) {
            return { value: g / 1000, unit: 'kg' }; // Convert to kg if >= 1000g
        }
        return { value: g, unit: 'g' };
    },
    lb: (val) => ({ value: val / 2.205, unit: 'kg' }),
    'fl oz': (val) => {
        const ml = val * 29.574;
        if (ml >= 1000) {
            return { value: ml / 1000, unit: 'l' }; // Convert to l if >= 1000ml
        }
        return { value: ml, unit: 'ml' };
    },
    gal: (val) => ({ value: val * 3.785, unit: 'l' }),
    '°f': (val) => ({ value: (val - 32) * 5/9, unit: '°C' }),
    
    // Imperial to Metric acceleration conversions
    'ft/s²': (val) => ({ value: val / 3.281, unit: 'm/s²' }),
    'ft/s^2': (val) => ({ value: val / 3.281, unit: 'm/s²' }),
    'ft/s2': (val) => ({ value: val / 3.281, unit: 'm/s²' }),
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
        // Acceleration patterns (must come before generic "m" pattern)
        { regex: /(\d*\.?\d+)\s*m\/s²\b/gi, unit: 'm/s²' },
        { regex: /(\d*\.?\d+)\s*m\/s\^2\b/gi, unit: 'm/s^2' },
        { regex: /(\d*\.?\d+)\s*m\/s2\b/gi, unit: 'm/s2' },
        
        // Length patterns
        { regex: /(\d*\.?\d+)\s*(mm|millimeters?)\b/gi, unit: 'mm' },
        { regex: /(\d*\.?\d+)\s*(cm|centimeters?)\b/gi, unit: 'cm' },
        { regex: /(\d*\.?\d+)\s*(m|meters?)(?!\s*\/s)\b/gi, unit: 'm' },
        { regex: /(\d*\.?\d+)\s*(km|kilometers?)\b/gi, unit: 'km' },
        { regex: /(\d*\.?\d+)\s*(g|grams?)\b/gi, unit: 'g' },
        { regex: /(\d*\.?\d+)\s*(kg|kilograms?)\b/gi, unit: 'kg' },
        { regex: /(\d*\.?\d+)\s*(ml|milliliters?)\b/gi, unit: 'ml' },
        { regex: /(\d*\.?\d+)\s*(l|liters?)\b/gi, unit: 'l' },
        { regex: /(-?\d*\.?\d+)\s*°\s*[cC]\b/g, unit: '°c' }
    ],
    imperial_to_metric: [
        // Dimension patterns (process these first)
        // Quote-based dimension patterns for mixed formats like 'H X W X D'
        { regex: /(\d*\.?\d+)"\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)"\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)"\s*[A-Z]/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)"\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)"\s*[A-Z]/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)'\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)'\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)'\s*[A-Z]/gi, unit: 'ft', isDimension: true },
        { regex: /(\d*\.?\d+)'\s*[A-Z]\s*[Xx]\s*(\d*\.?\d+)'\s*[A-Z]/gi, unit: 'ft', isDimension: true },
        
        // Standard dimension patterns
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(in|inch|inches)\b/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(in|inch|inches)\b/gi, unit: 'in', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(ft|foot|feet)\b/gi, unit: 'ft', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(ft|foot|feet)\b/gi, unit: 'ft', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(yd|yards?)\b/gi, unit: 'yd', isDimension: true },
        { regex: /(\d*\.?\d+)\s*x\s*(\d*\.?\d+)\s*(yd|yards?)\b/gi, unit: 'yd', isDimension: true },
        
        // Regular single unit patterns
        // Acceleration patterns (must come before generic "ft" pattern)
        { regex: /(\d*\.?\d+)\s*ft\/s²\b/gi, unit: 'ft/s²' },
        { regex: /(\d*\.?\d+)\s*ft\/s\^2\b/gi, unit: 'ft/s^2' },
        { regex: /(\d*\.?\d+)\s*ft\/s2\b/gi, unit: 'ft/s2' },
        
        // Quote-based patterns - handle quotes directly after numbers
        { regex: /(\d*\.?\d+)"/g, unit: 'in' },  // Double quote " = inches
        { regex: /(\d*\.?\d+)'(?!")/g, unit: 'ft' }, // Single quote ' = feet (but not if followed by ")
        { regex: /(\d*\.?\d+)\s*(in|inch|inches)\b/gi, unit: 'in' },
        { regex: /(\d*\.?\d+)\s*(ft|foot|feet)(?!\s*\/s)\b/gi, unit: 'ft' },
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

// --- Helper Functions ---

function isTimestampElement(textNode) {
    // Check if the text node contains timestamp patterns (e.g., "7m ago", "posted 5m", "reposted 10m ago")
    const text = textNode.nodeValue.trim();
    const timestampPatterns = [
        /^\d+m$/,                           // Standalone: "7m"
        /\b\d+m\s+ago\b/,                   // Time ago: "7m ago"
        /\b(?:posted|reposted|updated|edited|shared|liked|commented|replied)\s+\d+m(?:\s+ago)?\b/,  // Social actions
        /\b(?:last\s+seen|active|online)\s+\d+m(?:\s+ago)?\b/,  // Activity status
        /\b\d+m\s+(?:ago|later|before|after)\b/  // General time references
    ];
    
    return timestampPatterns.some(pattern => pattern.test(text));
}

// Check if text contains "M" representing millions (e.g., "$5M", "10M people", "€2M")
function containsMillionsSuffix(text) {
    // Pattern to match numbers followed by "M" in financial/statistical contexts
    // Covers: currency + numbers + M, or numbers + M + common descriptive words
    const millionsPatterns = [
        /[$€£¥₹₽¢]\s*\d+\.?\d*\s*M\b/i,  // Currency symbols: $5M, €10M, £2.5M
        /\d+\.?\d*\s*M\s+(?:people|users|dollars|euros|pounds|viewers|subscribers|followers|inhabitants|residents|population|budget|revenue|profit|sales|market|cap|valuation|funding|investment|votes|shares|downloads|views|members|employees|customers|visitors|students|records|accounts)\b/i,  // Common contexts
        /\b(?:worth|valued?|budget|revenue|profit|sales|market|funding|investment)\s+[$€£¥₹₽¢]?\s*\d+\.?\d*\s*M\b/i  // Financial contexts before the amount
    ];
    
    return millionsPatterns.some(pattern => pattern.test(text));
}

// Function to handle HTML split acceleration patterns like "9.8 m/s" + <sup>2</sup>
function processAccelerationSplitPatterns(mode) {
    if (mode === 'off') return 0;
    
    let conversionsCount = 0;
    
    // Look for all <sup> elements containing "2"
    const supElements = document.querySelectorAll('sup');
    
    supElements.forEach(supElement => {
        if (supElement.textContent.trim() === '2') {
            // Check if this sup element is preceded by "m/s" or "ft/s" pattern
            let prevNode = supElement.previousSibling;
            
            // Go back through previous siblings to find text nodes
            while (prevNode && prevNode.nodeType !== Node.TEXT_NODE) {
                prevNode = prevNode.previousSibling;
            }
            
            if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
                const text = prevNode.nodeValue;
                
                // Check for metric pattern (m/s) when in metric_to_imperial mode
                if (mode === 'metric_to_imperial') {
                    const metricMatch = text.match(/(.*?)(\d+\.?\d*)\s*m\/s\s*$/);
                    if (metricMatch) {
                        const value = parseFloat(metricMatch[2]);
                        if (!isNaN(value) && value !== 0) {
                            const conversionFn = conversions['m/s²'];
                            if (conversionFn) {
                                const { value: convertedValue, unit: convertedUnit } = conversionFn(value);
                                const formattedValue = Number(convertedValue.toFixed(2));
                                
                                // Create the conversion mark
                                const conversionMark = document.createElement('mark');
                                conversionMark.className = MARK_TAG_CLASS;
                                conversionMark.textContent = `(${formattedValue} ${convertedUnit})`;
                                
                                // Insert the conversion mark right after the <sup> element
                                supElement.parentNode.insertBefore(conversionMark, supElement.nextSibling);
                                
                                conversionsCount++;
                            }
                        }
                    }
                }
                
                // Check for imperial pattern (ft/s) when in imperial_to_metric mode
                if (mode === 'imperial_to_metric') {
                    const imperialMatch = text.match(/(.*?)(\d+\.?\d*)\s*ft\/s\s*$/);
                    if (imperialMatch) {
                        const value = parseFloat(imperialMatch[2]);
                        if (!isNaN(value) && value !== 0) {
                            const conversionFn = conversions['ft/s²'];
                            if (conversionFn) {
                                const { value: convertedValue, unit: convertedUnit } = conversionFn(value);
                                const formattedValue = Number(convertedValue.toFixed(2));
                                
                                // Create the conversion mark
                                const conversionMark = document.createElement('mark');
                                conversionMark.className = MARK_TAG_CLASS;
                                conversionMark.textContent = `(${formattedValue} ${convertedUnit})`;
                                
                                // Insert the conversion mark right after the <sup> element
                                supElement.parentNode.insertBefore(conversionMark, supElement.nextSibling);
                                
                                conversionsCount++;
                            }
                        }
                    }
                }
            }
        }
    });
    
    return conversionsCount;
}

// --- DOM Manipulation ---

function performConversion(mode) {
    if (mode === 'off') return;
    
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    const nodesToProcess = [];
    
    // First, collect all text nodes to avoid issues with live DOM modification
    while (textNode = walker.nextNode()) {
        if (textNode.parentElement.closest(`.${MARK_TAG_CLASS}, script, style, noscript, a`)) {
            continue;
        }
        // Skip timestamp elements (e.g., "1m", "41m" for social media timestamps)
        if (isTimestampElement(textNode)) {
            continue;
        }
        // Skip text containing capital "M" representing millions (e.g., "$5M", "10M people")
        if (containsMillionsSuffix(textNode.nodeValue)) {
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

                // Handle different dimension pattern formats
                const values = [];
                
                // For quote-based patterns like "1.125" H X 10.25" W X 10.25" D"
                if (match.includes('"') && match.includes(' X ')) {
                    // Extract all numeric values from the match
                    for (let i = 0; i < args.length - 2; i++) {
                        if (args[i] !== undefined && args[i] !== "") {
                            const val = parseFloat(args[i]);
                            // Skip zero values except for temperature units
                            if (!isNaN(val) && (val !== 0 || ['°c', '°f'].includes(p.unit.toLowerCase()))) {
                                values.push(val);
                            }
                        }
                    }
                } else {
                    // Standard dimension patterns: "A x B unit" or "A x B x C unit"
                    // Extract all numeric values (excluding unit, offset, and string)
                    for (let i = 0; i < args.length - 3; i++) {
                        if (args[i] !== undefined) {
                            const val = parseFloat(args[i]);
                            // Skip zero values except for temperature units
                            if (!isNaN(val) && (val !== 0 || ['°c', '°f'].includes(p.unit.toLowerCase()))) {
                                values.push(val);
                            }
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
                // Skip zero values except for temperature units
                if (isNaN(originalValue) || (originalValue === 0 && !['°c', '°f'].includes(p.unit.toLowerCase()))) return match;
                
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

    // Process HTML split acceleration patterns (e.g., "9.8 m/s" + <sup>2</sup>)
    conversionsCount += processAccelerationSplitPatterns(mode);

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
    // Get notification settings from storage
    chrome.storage.sync.get(['notificationDuration', 'notificationSize'], (result) => {
        const duration = (result.notificationDuration !== undefined ? result.notificationDuration : 4) * 1000; // Convert to milliseconds
        const size = result.notificationSize !== undefined ? result.notificationSize : 'normal';
        
        // Remove any existing notification
        const existingNotification = document.getElementById('bimetric-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'bimetric-notification';
        
        // Base styles
        let baseStyles = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(16, 185, 129, 0.8);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Size-specific styles
        if (size === 'smaller') {
            baseStyles += `
                padding: 8px 12px;
                font-size: 12px;
                max-width: 260px;
                white-space: nowrap;
            `;
        } else {
            baseStyles += `
                padding: 12px 16px;
                font-size: 14px;
                max-width: 280px;
            `;
        }
        
        notification.style.cssText = baseStyles;

        // Add icon
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('icons/icon48.png');
        if (size === 'smaller') {
            icon.style.cssText = 'width: 16px; height: 16px; flex-shrink: 0;';
        } else {
            icon.style.cssText = 'width: 20px; height: 20px; flex-shrink: 0;';
        }
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

        // Auto-remove after specified duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    });
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
