// Test the regex patterns for ambiguous temperatures (FINAL VERSION)
// Also test new filtering patterns

// Test patterns - using the fixed regex without word boundary issues
const patterns = [
    { regex: /(?:^|\s)(-?\d*\.?\d+)\s*[ºo°](?!\w)/g, unit: '°_metric' }, // Updated pattern
    { regex: /(-?\d*\.?\d+)\s*°\s*[cC]\b/g, unit: '°c' },
    { regex: /(-?\d*\.?\d+)\s*°\s*[fF]\b/g, unit: '°f' }
];

// Test strings
const testStrings = [
    "The temperature is 80º today",
    "It's 25° outside", 
    "Set to 100o degrees",
    "Water boils at 100°C",
    "Room temp: 72°F",
    "Negative temp: -10°",
    "Edge case: 32º vs 32°F",
    "GPT-4o model",  // Should NOT match with new pattern
    "System-4o version"  // Should NOT match with new pattern
];

console.log("Testing regex patterns:");

testStrings.forEach(str => {
    console.log(`\nTesting: "${str}"`);
    
    patterns.forEach(pattern => {
        pattern.regex.lastIndex = 0; // Reset regex
        const matches = [...str.matchAll(pattern.regex)];
        if (matches.length > 0) {
            console.log(`  Matched by ${pattern.unit}:`, matches.map(m => m[0]));
        }
    });
});

// Test the conversion functions
const conversions = {
    '°_metric': (val) => ({ value: (val * 9/5) + 32, unit: '°F' }),
    '°_imperial': (val) => ({ value: (val - 32) * 5/9, unit: '°C' })
};

console.log("\nTesting conversions:");
console.log("25°C → °F:", conversions['°_metric'](25));
console.log("77°F → °C:", conversions['°_imperial'](77));
