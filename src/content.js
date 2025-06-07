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

    // Process collected nodes
    for (const node of nodesToProcess) {
        let content = node.nodeValue;
        let hasChanged = false;

        patterns[mode].forEach(p => {
            content = content.replace(p.regex, (match, valueStr, unitStr) => {
                const originalValue = parseFloat(valueStr);
                if (isNaN(originalValue)) return match;
                
                const conversionFn = conversions[p.unit.toLowerCase()];
                if (!conversionFn) return match;

                const { value: convertedValue, unit: convertedUnit } = conversionFn(originalValue);
                const formattedValue = Number(convertedValue.toFixed(2));
                
                hasChanged = true;
                return `${match} <mark class="${MARK_TAG_CLASS}">(${formattedValue} ${convertedUnit})</mark>`;
            });
        });

        if (hasChanged) {
            const newElement = document.createElement('span');
            newElement.innerHTML = content;
            node.parentNode.replaceChild(newElement, node);
        }
    }
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


// --- Event Listener ---

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "convert") {
        // Reset first to avoid duplicate conversions
        resetConversions();
        performConversion(request.mode);
        sendResponse({status: "conversion done"});
    } else if (request.action === "reset") {
        resetConversions();
        sendResponse({status: "reset done"});
    }
    return true; // Indicates an asynchronous response
});
