// Test the new filtering patterns for time durations and ambiguous temperatures

// Simulate the isTimestampElement function
function isTimestampElement(textNode) {
    // Check if the text node contains timestamp patterns (e.g., "7m ago", "posted 5m", "reposted 10m ago")
    const text = textNode.nodeValue ? textNode.nodeValue.trim() : textNode.trim();
    const timestampPatterns = [
        /^\d+m$/,                           // Standalone: "7m"
        /\b\d+m\s+ago\b/,                   // Time ago: "7m ago"
        /\b(?:posted|reposted|updated|edited|shared|liked|commented|replied)\s+\d+m(?:\s+ago)?\b/,  // Social actions
        /\b(?:last\s+seen|active|online)\s+\d+m(?:\s+ago)?\b/,  // Activity status
        /\b\d+m\s+(?:ago|later|before|after)\b/,  // General time references
        /\bfor\s+(?:[1-9]\d*|0*[1-9]+)m\b/, // "for Xm" patterns (exclude "for 0m")
        /\b(?:[1-9]\d*|0*[1-9]+)m\s+\d+s\b/ // "Xm Xs" minute-second patterns (exclude "0m Xs")
    ];
    
    return timestampPatterns.some(pattern => pattern.test(text));
}

// Test strings for time duration filtering
const timeTestStrings = [
    "Thought for 1m 31s",
    "Completed task for 2m",
    "Processing for 10m before timeout",
    "Posted 5m ago",
    "The distance is 5m", // Should NOT be filtered (this is meters)
    "for 0m test", // Should NOT be filtered (zero case)
    "0m 30s duration", // Should NOT be filtered (zero minutes)
    "Run for 3m 45s",
    "Wait for 5m"
];

console.log("Testing time duration filtering:");
timeTestStrings.forEach(str => {
    const shouldFilter = isTimestampElement({ nodeValue: str });
    console.log(`"${str}" -> ${shouldFilter ? 'FILTER' : 'ALLOW'}`);
});

// Test ambiguous temperature patterns (with space requirement, no 'o')
const ambiguousPatterns = [
    { regex: /(?:^|\s)(-?\d*\.?\d+)\s*[º°](?!\w)/g, unit: '°_metric' }
];

const tempTestStrings = [
    "The temperature is 80º today", // Should match
    "It's 25° outside",             // Should match
    "GPT-4o model",                 // Should NOT match
    "ChatGPT 4o",                   // Should NOT match
    "System-4o version",            // Should NOT match
    "Code-1o implementation",       // Should NOT match
    " 32º test",                    // Should match (starts with space)
    "Test 75° here",                // Should match (space before)
    "Model-5o test"                 // Should NOT match
];

console.log("\nTesting ambiguous temperature patterns:");
tempTestStrings.forEach(str => {
    console.log(`\nTesting: "${str}"`);
    
    ambiguousPatterns.forEach(pattern => {
        pattern.regex.lastIndex = 0; // Reset regex
        const matches = [...str.matchAll(pattern.regex)];
        if (matches.length > 0) {
            console.log(`  Matched: ${matches.map(m => `"${m[0]}" (value: ${m[1]})`).join(', ')}`);
        } else {
            console.log(`  No match`);
        }
    });
});

// Test rotation angle filtering
function containsRotationAngle(text) {
    // Pattern to match degree symbols used for angles/rotations rather than temperatures
    const rotationPatterns = [
        /\b(?:rotat(?:ed?|ing?)|turn(?:ed?|ing?)|spin(?:ning?)?|twist(?:ed?|ing?)|pivot(?:ed?|ing?)|flip(?:ped?|ping?)|tilt(?:ed?|ing?))\s+(?:by\s+)?\d*\.?\d+\s*[º°]/i,  // "rotated 90º", "turned 45°", "tilt by 15°"
        /\b(?:angle|degrees?|rotation|turn|orientation|direction|heading|bearing)\s+(?:of\s+)?\d*\.?\d+\s*[º°]/i,  // "angle of 30º", "rotation 180°"
        /\d*\.?\d+\s*[º°]\s+(?:angle|rotation|turn|clockwise|counterclockwise|counter-clockwise|for\s+\w+)/i,  // "90° angle", "180° rotation", "15° for adjustment"
        /\b(?:at|by)\s+\d*\.?\d+\s*[º°](?!\s*[CF])\b/i  // "at 45º", "by 90°" (but not "at 90ºC")
    ];
    
    return rotationPatterns.some(pattern => pattern.test(text));
}

const rotationTestStrings = [
    "rotated 90º",              // Should be filtered (rotation)
    "turned 45° clockwise",     // Should be filtered (rotation)
    "angle of 30º",             // Should be filtered (rotation)
    "rotate by 180°",           // Should be filtered (rotation)
    "tilt 15° for adjustment",  // Should be filtered (rotation)
    "bearing 275°",             // Should be filtered (rotation)
    "90° angle cut",            // Should be filtered (rotation)
    "The temperature is 80º today",   // Should NOT be filtered (temperature)
    "It's 25° outside",         // Should NOT be filtered (temperature)
    "Set to 90°C",             // Should NOT be filtered (explicit temperature)
    "at 90ºC it melts"         // Should NOT be filtered (explicit temperature with C)
];

console.log("\nTesting rotation angle filtering:");
rotationTestStrings.forEach(str => {
    const isRotation = containsRotationAngle(str);
    console.log(`"${str}" -> ${isRotation ? 'FILTER (rotation)' : 'ALLOW (not rotation)'}`);
});
