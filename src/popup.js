// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('mode');
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Load the saved mode from chrome.storage
    chrome.storage.sync.get(['conversionMode'], (result) => {
        if (result.conversionMode) {
            modeSelect.value = result.conversionMode;
        }
    });

    // Save the mode when the user changes the selection
    modeSelect.addEventListener('change', () => {
        const mode = modeSelect.value;
        chrome.storage.sync.set({ conversionMode: mode });
    });

    // Send a message to the content script to perform conversion
    convertBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "convert",
                    mode: modeSelect.value
                });
            }
        });
        window.close(); // Close the popup after clicking
    });

    // Send a message to the content script to reset the page
    resetBtn.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "reset"
                });
            }
        });
        window.close(); // Close the popup after clicking
    });
});
