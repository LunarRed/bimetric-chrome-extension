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

// Test ambiguous temperature patterns (with space requirement)
const ambiguousPatterns = [
    { regex: /(?:^|\s)(-?\d*\.?\d+)\s*[ºo°](?!\w)/g, unit: '°_metric' }
];

const tempTestStrings = [
    "The temperature is 80º today", // Should match
    "It's 25° outside",             // Should match
    "GPT-4o model",                 // Should NOT match
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
