// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('mode');
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');
    const settingsToggle = document.getElementById('settingsToggle');
    const settingsContent = document.getElementById('settingsContent');
    const settingsCaret = document.getElementById('settingsCaret');
    const autoConvertToggle = document.getElementById('autoConvert');
    const toggleBg = document.querySelector('.toggle-bg');
    const toggleDot = document.querySelector('.toggle-dot');
    const notificationDurationSelect = document.getElementById('notificationDuration');
    const notificationSizeSelect = document.getElementById('notificationSize');

    // Load saved settings
    chrome.storage.sync.get(['conversionMode', 'autoConvert', 'settingsExpanded', 'notificationDuration', 'notificationSize'], (result) => {
        // Set conversion mode
        if (result.conversionMode) {
            modeSelect.value = result.conversionMode;
        } else {
            // Set default to metric_to_imperial if no mode is saved
            modeSelect.value = 'metric_to_imperial';
            chrome.storage.sync.set({ conversionMode: 'metric_to_imperial' });
        }

        // Set auto-convert toggle (defaults to true)
        const autoConvert = result.autoConvert !== undefined ? result.autoConvert : true;
        autoConvertToggle.checked = autoConvert;
        updateToggleVisual(autoConvert);

        // Set notification duration (defaults to 4 seconds)
        const notificationDuration = result.notificationDuration !== undefined ? result.notificationDuration : 4;
        notificationDurationSelect.value = notificationDuration;

        // Set notification size (defaults to normal)
        const notificationSize = result.notificationSize !== undefined ? result.notificationSize : 'normal';
        notificationSizeSelect.value = notificationSize;

        // Set settings expansion state (expanded first time, then collapsed)
        const settingsExpanded = result.settingsExpanded !== undefined ? result.settingsExpanded : true;
        updateSettingsVisibility(settingsExpanded);
        
        // Mark that settings have been shown at least once
        if (result.settingsExpanded === undefined) {
            chrome.storage.sync.set({ settingsExpanded: false });
        }
    });

    // Settings toggle functionality
    settingsToggle.addEventListener('click', () => {
        const isExpanded = !settingsContent.classList.contains('settings-collapsed');
        const newState = !isExpanded;
        updateSettingsVisibility(newState);
        chrome.storage.sync.set({ settingsExpanded: newState });
    });

    // Auto-convert toggle functionality
    const handleToggleClick = (e) => {
        e.preventDefault();
        const newState = !autoConvertToggle.checked;
        autoConvertToggle.checked = newState;
        updateToggleVisual(newState);
        chrome.storage.sync.set({ autoConvert: newState });
    };

    toggleBg.addEventListener('click', handleToggleClick);

    // Notification duration change handler
    notificationDurationSelect.addEventListener('change', () => {
        const duration = parseInt(notificationDurationSelect.value);
        chrome.storage.sync.set({ notificationDuration: duration });
    });

    // Notification size change handler
    notificationSizeSelect.addEventListener('change', () => {
        const size = notificationSizeSelect.value;
        chrome.storage.sync.set({ notificationSize: size });
    });

    function updateToggleVisual(isActive) {
        if (isActive) {
            toggleBg.classList.add('active');
            toggleDot.classList.add('active');
        } else {
            toggleBg.classList.remove('active');
            toggleDot.classList.remove('active');
        }
    }

    function updateSettingsVisibility(isExpanded) {
        if (isExpanded) {
            settingsContent.classList.remove('settings-collapsed');
            settingsContent.classList.add('settings-expanded');
            settingsCaret.innerHTML = '&#9650;'; // Up arrow
        } else {
            settingsContent.classList.add('settings-collapsed');
            settingsContent.classList.remove('settings-expanded');
            settingsCaret.innerHTML = '&#9660;'; // Down arrow
        }
    }

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
