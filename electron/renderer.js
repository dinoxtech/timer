const { ipcRenderer } = require('electron');

// Settings management
const settings = {
    language: localStorage.getItem('language') || 'uk',
    theme: localStorage.getItem('theme') || 'default',
    closeBehavior: localStorage.getItem('closeBehavior') || 'tray',
    customColors: JSON.parse(localStorage.getItem('customColors') || '{"color1": "#667eea", "color2": "#764ba2", "textColor": "#ffffff", "mode": "gradient"}'),
    notificationVolume: parseInt(localStorage.getItem('notificationVolume')) || 50
};

// Translations
const translations = {
    uk: {
        timer: 'Таймер',
        stopwatch: 'Секундомір',
        settings: 'Налаштування',
        about: 'Довідка',
        menu: 'Меню',
        language: 'Мова',
        theme: 'Тема',
        notificationSound: 'Звук сповіщення',
        volume: 'Гучність',
        testSound: 'Тест звуку',
        closeBehavior: 'Дія кнопки закриття',
        minimizeToTray: 'Згорнути в трей',
        quitApp: 'Закрити програму',
        gradient: 'Градієнт',
        solid: 'Однотонний',
        color1: 'Колір 1:',
        color2: 'Колір 2:',
        textColor: 'Колір тексту:',
        apply: 'Застосувати',
        start: 'СТАРТ',
        stop: 'СТОП',
        reset: 'СКИНУТИ',
        lap: 'КОЛО',
        laps: 'Кола',
        lapNumber: 'Коло',
        standard: 'Стандартні',
        favorites: 'Улюблені',
        custom: 'Власний',
        set: 'Встановити',
        save: 'Зберегти',
        sec: 'сек',
        min: 'хв',
        hr: 'год',
        timeUp: 'Час вийшов!',
        aboutDeveloper: 'Про розробника',
        softwareDevelopment: 'Розробка програмного забезпечення',
        website: 'Веб-сайт:',
        copyright: 'Авторські права',
        allRightsReserved: 'Всі права захищені.',
        thanks: 'Подяки',
        notificationMusic: 'Музика сповіщення:',
        hedwigsTheme: 'Мелодія "Hedwig\'s Theme" з фільму Harry Potter',
        composer: 'Композитор:',
        educationalPurposes: 'Використовується виключно в освітніх цілях',
        technologies: 'Технології',
        builtWith: 'Створено з використанням Electron, HTML5, CSS3 та JavaScript',
        version: 'Версія'
    },
    en: {
        timer: 'Timer',
        stopwatch: 'Stopwatch',
        settings: 'Settings',
        about: 'About',
        menu: 'Menu',
        language: 'Language',
        theme: 'Theme',
        notificationSound: 'Notification Sound',
        volume: 'Volume',
        testSound: 'Test Sound',
        closeBehavior: 'Close button action',
        minimizeToTray: 'Minimize to tray',
        quitApp: 'Quit application',
        gradient: 'Gradient',
        solid: 'Solid',
        color1: 'Color 1:',
        color2: 'Color 2:',
        textColor: 'Text Color:',
        apply: 'Apply',
        start: 'START',
        stop: 'STOP',
        reset: 'RESET',
        lap: 'LAP',
        laps: 'Laps',
        lapNumber: 'Lap',
        standard: 'Standard',
        favorites: 'Favorites',
        custom: 'Custom',
        set: 'Set',
        save: 'Save',
        sec: 'sec',
        min: 'min',
        hr: 'hr',
        timeUp: 'Time\'s up!',
        aboutDeveloper: 'About Developer',
        softwareDevelopment: 'Software Development',
        website: 'Website:',
        copyright: 'Copyright',
        allRightsReserved: 'All rights reserved.',
        thanks: 'Thanks',
        notificationMusic: 'Notification Music:',
        hedwigsTheme: '"Hedwig\'s Theme" from Harry Potter',
        composer: 'Composer:',
        educationalPurposes: 'Used for educational purposes only',
        technologies: 'Technologies',
        builtWith: 'Built with Electron, HTML5, CSS3 and JavaScript',
        version: 'Version'
    }
};

// Theme definitions - VERIFIED CORRECT COLORS
const themes = {
    default: { color1: '#667eea', color2: '#764ba2' },  // Purple gradient
    ocean: { color1: '#2E3192', color2: '#1BFFFF' },    // Dark blue to cyan
    sunset: { color1: '#FA8BFF', color2: '#2BD2FF' },   // Pink to light blue  
    forest: { color1: '#134E5E', color2: '#71B280' },   // Dark green to light green
    fire: { color1: '#F2994A', color2: '#F2C94C' },     // Orange to yellow
    night: { color1: '#0F2027', color2: '#2C5364' },    // Dark blue gradient
    cherry: { color1: '#EB3349', color2: '#F45C43' },   // Red to orange-red
    mint: { color1: '#00CDAC', color2: '#8DDAD5' },     // Teal to light teal
    royal: { color1: '#141E30', color2: '#243B55' },    // Navy blue gradient
    cosmic: { color1: '#FF0099', color2: '#493240' }    // Pink to purple
};

// State management
const state = {
    mode: 'timer',
    timer: {
        duration: 300,
        remaining: 300,
        isRunning: false,
        preset: '5 хв',
        intervalId: null
    },
    stopwatch: {
        startTime: null,
        elapsed: 0,
        isRunning: false,
        intervalId: null,
        laps: []
    },
    favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
    isCompact: false
};

// Function to open external links
function openExternal(url) {
    const { shell } = require('electron');
    shell.openExternal(url);
    return false;
}

// DOM Elements
const elements = {
    // Views
    normalView: document.getElementById('normalView'),
    compactView: document.getElementById('compactView'),
    
    // Mode tabs
    modeTabs: document.querySelectorAll('.tab-btn[data-mode]'),
    modeContents: {
        timer: document.getElementById('timerView'),
        stopwatch: document.getElementById('stopwatchView'),
        settings: document.getElementById('settingsView'),
        about: document.getElementById('aboutView')
    },
    
    // Timer elements
    timerDisplay: document.getElementById('timerDisplay'),
    timerStartStop: document.getElementById('timerStartStop'),
    timerReset: document.getElementById('timerReset'),
    presetLabel: document.getElementById('presetLabel'),
    progressRing: document.getElementById('progressRing'),
    
    // Stopwatch elements
    stopwatchDisplay: document.getElementById('stopwatchDisplay'),
    millisecondsDisplay: document.getElementById('millisecondsDisplay'),
    stopwatchStartStop: document.getElementById('stopwatchStartStop'),
    stopwatchLap: document.getElementById('stopwatchLap'),
    stopwatchReset: document.getElementById('stopwatchReset'),
    lapsList: document.getElementById('lapsList'),
    
    // Preset tabs
    presetTabs: document.querySelectorAll('.preset-tab-btn'),
    presetContents: {
        standard: document.getElementById('standardPresets'),
        favorites: document.getElementById('favoritesPresets'),
        custom: document.getElementById('customPreset')
    },
    
    // Custom time inputs
    hoursInput: document.getElementById('hoursInput'),
    minutesInput: document.getElementById('minutesInput'),
    secondsInput: document.getElementById('secondsInput'),
    setCustomTime: document.getElementById('setCustomTime'),
    saveCustomTime: document.getElementById('saveCustomTime'),
    
    // Compact view
    compactTime: document.getElementById('compactTime'),
    compactPreset: document.getElementById('compactPreset'),
    compactStartStop: document.getElementById('compactStartStop'),
    compactReset: document.getElementById('compactReset'),
    compactModeIndicator: document.getElementById('compactModeIndicator'),
    
    // Controls
    compactBtn: document.getElementById('compactBtn'),
    expandBtn: document.getElementById('expandBtn'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    
    // Notification
    notification: document.getElementById('notification')
};

// Initialize
function init() {
    // Clear any corrupted theme data
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme && !themes[storedTheme] && storedTheme !== 'custom') {
        console.warn('Corrupted theme in localStorage:', storedTheme);
        localStorage.removeItem('theme');
        settings.theme = 'default';
    }
    
    loadSettings();
    applyTheme(settings.theme);
    applyLanguage(settings.language);
    setupEventListeners();
    updateDisplay();
    loadFavorites();
    setupDragRegion();
    
    // Send initial language to main process for tray menu
    ipcRenderer.send('update-language', settings.language);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Settings functions
function loadSettings() {
    // Apply saved settings
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === settings.language);
    });
    
    const themeBtns = document.querySelectorAll('.theme-btn');
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === settings.theme);
    });
    
    const closeBehaviorInputs = document.querySelectorAll('input[name="closeBehavior"]');
    closeBehaviorInputs.forEach(input => {
        input.checked = input.value === settings.closeBehavior;
    });
    
    // Set custom color pickers
    document.getElementById('colorPicker1').value = settings.customColors.color1;
    document.getElementById('colorPicker2').value = settings.customColors.color2;
    document.getElementById('textColorPicker').value = settings.customColors.textColor || '#ffffff';
    
    // Set color mode
    const colorModeInputs = document.querySelectorAll('input[name="colorMode"]');
    colorModeInputs.forEach(input => {
        input.checked = input.value === (settings.customColors.mode || 'gradient');
    });
    
    // Set volume slider
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    if (volumeSlider && volumeValue) {
        volumeSlider.value = settings.notificationVolume;
        volumeValue.textContent = settings.notificationVolume + '%';
    }
}

function saveSettings() {
    localStorage.setItem('language', settings.language);
    localStorage.setItem('theme', settings.theme);
    localStorage.setItem('closeBehavior', settings.closeBehavior);
    localStorage.setItem('customColors', JSON.stringify(settings.customColors));
    localStorage.setItem('notificationVolume', settings.notificationVolume);
}

function applyLanguage(lang) {
    settings.language = lang;
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
    
    // Update preset labels based on language
    updatePresetLabels();
    saveSettings();
    
    // Notify main process about language change for tray menu
    ipcRenderer.send('update-language', lang);
}

function updatePresetLabels() {
    const lang = settings.language;
    const t = translations[lang];
    
    // Update standard preset buttons
    const presetBtns = document.querySelectorAll('.preset-btn[data-time]');
    presetBtns.forEach(btn => {
        const time = parseInt(btn.dataset.time);
        if (time < 60) {
            btn.textContent = `${time} ${t.sec}`;
        } else if (time < 3600) {
            btn.textContent = `${time / 60} ${t.min}`;
        } else {
            btn.textContent = `${time / 3600} ${t.hr}`;
        }
    });
    
    // Preset tab labels are handled by data-i18n attributes
}

function applyTheme(themeName) {
    settings.theme = themeName;
    let colors;
    let textColor = '#ffffff';
    
    console.log('=====================================');
    console.log('APPLYING THEME:', themeName);
    
    if (themeName === 'custom') {
        colors = settings.customColors;
        textColor = settings.customColors.textColor || '#ffffff';
        
        // Show custom colors section when custom theme is selected
        document.getElementById('customColorsSection').classList.add('show');
    } else {
        colors = themes[themeName] || themes.default;
        console.log('Theme definition colors:', colors);
        document.getElementById('customColorsSection').classList.remove('show');
    }
    
    // Apply background based on mode
    let background;
    if (themeName === 'custom' && settings.customColors.mode === 'solid') {
        background = colors.color1;
    } else {
        background = `linear-gradient(135deg, ${colors.color1} 0%, ${colors.color2} 100%)`;
    }
    
    document.querySelector('.app').style.background = background;
    document.querySelector('.compact-view').style.background = background;
    
    // Apply text color and contrast
    applyTextContrast(colors.color1, textColor);
    
    // Send theme colors to main process for icon updates
    const themeData = {
        mode: (themeName === 'custom' && settings.customColors.mode === 'solid') ? 'solid' : 'gradient',
        color1: colors.color1,
        color2: colors.color2
    };
    console.log('SENDING TO MAIN PROCESS:');
    console.log('  Theme Name:', themeName);
    console.log('  Color1:', themeData.color1);
    console.log('  Color2:', themeData.color2);
    console.log('=====================================');
    ipcRenderer.send('update-theme', themeData);
    
    saveSettings();
}

// Function to detect if background needs light or dark text
function getLuminance(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance;
}

function applyTextContrast(bgColor, textColor) {
    const app = document.querySelector('.app');
    
    // Apply custom text color if using custom theme
    if (settings.theme === 'custom') {
        document.documentElement.style.setProperty('--text-color', textColor);
        
        // Update all text elements with custom color
        const textElements = [
            '.title', '.tab-btn', '.time-display', '.preset-label',
            '.btn-text', '.preset-btn', '.custom-btn', '.lang-btn',
            '.radio-label span', '.settings-section h3', '.settings-section p',
            '.about-section h3', '.about-section p', '.about-section strong',
            '.about-section a', '.about-logo h2', '.version', '.copyright-note',
            '.app-icon', '.laps-header', '.lap-item', '.color-input-group label',
            '.compact-time', '.compact-preset', '.volume-control label', 
            '.volume-value', '.test-sound-btn', '.test-sound-btn span',
            '.apply-custom-btn', '.custom-preview span', '.preset-tab-btn',
            '.time-input-group span', '.milliseconds'
        ];
        
        const style = document.createElement('style');
        style.id = 'custom-text-color';
        const existingStyle = document.getElementById('custom-text-color');
        if (existingStyle) existingStyle.remove();
        
        style.textContent = textElements.map(selector => 
            `${selector} { color: ${textColor} !important; }`
        ).join('\n');
        
        document.head.appendChild(style);
    } else {
        // Auto-detect contrast for preset themes
        const luminance = getLuminance(bgColor);
        
        if (luminance > 0.6) {
            app.classList.add('dark-text');
        } else {
            app.classList.remove('dark-text');
        }
        
        // Remove custom text color styles
        const customStyle = document.getElementById('custom-text-color');
        if (customStyle) customStyle.remove();
    }
}

function setupSettingsListeners() {
    // Dropdown menu
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        dropdownMenu.classList.remove('show');
    });
    
    // Dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            switchMode(item.dataset.mode);
            dropdownMenu.classList.remove('show');
        });
    });
    
    // Language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyLanguage(btn.dataset.lang);
        });
    });
    
    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.type !== 'color') {
                const selectedTheme = btn.dataset.theme;
                console.log('BUTTON CLICKED: Theme =', selectedTheme);
                console.log('Theme colors should be:', themes[selectedTheme]);
                
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyTheme(selectedTheme);
            }
        });
    });
    
    // Color mode toggle
    document.querySelectorAll('input[name="colorMode"]').forEach(input => {
        input.addEventListener('change', () => {
            settings.customColors.mode = input.value;
            const color2Group = document.getElementById('color2Group');
            if (input.value === 'solid') {
                color2Group.style.display = 'none';
            } else {
                color2Group.style.display = 'flex';
            }
            updateCustomPreview();
        });
    });
    
    // Set initial state for color mode
    const currentMode = settings.customColors.mode || 'gradient';
    const color2Group = document.getElementById('color2Group');
    if (currentMode === 'solid') {
        color2Group.style.display = 'none';
    } else {
        color2Group.style.display = 'flex';
    }
    
    // Apply custom colors button
    document.getElementById('applyCustomColors').addEventListener('click', () => {
        settings.customColors.color1 = document.getElementById('colorPicker1').value;
        settings.customColors.color2 = document.getElementById('colorPicker2').value;
        settings.customColors.textColor = document.getElementById('textColorPicker').value;
        
        // Make sure custom theme is selected
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.theme-btn[data-theme="custom"]').classList.add('active');
        
        applyTheme('custom');
        updateCustomPreview();
    });
    
    // Close behavior
    document.querySelectorAll('input[name="closeBehavior"]').forEach(input => {
        input.addEventListener('change', () => {
            settings.closeBehavior = input.value;
            saveSettings();
            // Send to main process
            ipcRenderer.send('update-close-behavior', settings.closeBehavior);
        });
    });
    
    // Volume control
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const testSoundBtn = document.getElementById('testSoundBtn');
    
    if (volumeSlider && volumeValue) {
        volumeSlider.addEventListener('input', () => {
            settings.notificationVolume = parseInt(volumeSlider.value);
            volumeValue.textContent = settings.notificationVolume + '%';
            saveSettings();
        });
    }
    
    if (testSoundBtn) {
        testSoundBtn.addEventListener('click', () => {
            playNotificationSound();
        });
    }
}

function updateCustomPreview() {
    const preview = document.querySelector('.custom-preview');
    let background;
    
    if (settings.customColors.mode === 'solid') {
        background = settings.customColors.color1;
    } else {
        background = `linear-gradient(135deg, ${settings.customColors.color1} 0%, ${settings.customColors.color2} 100%)`;
    }
    
    preview.style.background = background;
    preview.querySelector('span').style.display = 'none';
}

// Event Listeners
function setupEventListeners() {
    // Mode tabs
    elements.modeTabs.forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });
    
    // Settings listeners
    setupSettingsListeners();
    
    // Preset tabs
    elements.presetTabs.forEach(tab => {
        tab.addEventListener('click', () => switchPresetTab(tab.dataset.tab));
    });
    
    // Timer controls
    elements.timerStartStop.addEventListener('click', toggleTimer);
    elements.timerReset.addEventListener('click', resetTimer);
    
    // Stopwatch controls
    elements.stopwatchStartStop.addEventListener('click', toggleStopwatch);
    elements.stopwatchLap.addEventListener('click', addLap);
    elements.stopwatchReset.addEventListener('click', resetStopwatch);
    
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => setTimerDuration(parseInt(btn.dataset.time), btn.textContent));
    });
    
    // Custom time
    elements.setCustomTime.addEventListener('click', setCustomTime);
    elements.saveCustomTime.addEventListener('click', saveCustomTime);
    
    // Compact controls
    elements.compactStartStop.addEventListener('click', () => {
        if (state.mode === 'timer') toggleTimer();
        else toggleStopwatch();
    });
    
    elements.compactReset.addEventListener('click', () => {
        if (state.mode === 'timer') resetTimer();
        else resetStopwatch();
    });
    
    // Window controls
    elements.compactBtn.addEventListener('click', () => toggleCompactMode(true));
    elements.expandBtn.addEventListener('click', () => toggleCompactMode(false));
    elements.minimizeBtn.addEventListener('click', () => ipcRenderer.send('minimize-window'));
    elements.closeBtn.addEventListener('click', () => {
        if (settings.closeBehavior === 'quit') {
            ipcRenderer.send('quit-app');
        } else {
            ipcRenderer.send('close-window');
        }
    });
    
    // Input validation
    [elements.hoursInput, elements.minutesInput, elements.secondsInput].forEach(input => {
        input.addEventListener('input', (e) => {
            const max = input === elements.hoursInput ? 99 : 59;
            if (e.target.value > max) e.target.value = max;
            if (e.target.value < 0) e.target.value = 0;
        });
    });
}

// Drag functionality
function setupDragRegion() {
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    
    // Setup for normal drag region
    const dragRegion = document.querySelector('.drag-region');
    const compactDragRegion = document.querySelector('.compact-drag-region');
    
    // Get the device pixel ratio for proper scaling on HiDPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Function to handle drag start
    const handleDragStart = (e) => {
        isDragging = true;
        initialX = e.screenX;  // Use screenX instead of clientX for better accuracy
        initialY = e.screenY;  // Use screenY instead of clientY for better accuracy
        e.preventDefault();    // Prevent text selection during drag
    };
    
    // Add event listeners to both drag regions
    dragRegion.addEventListener('mousedown', handleDragStart);
    compactDragRegion.addEventListener('mousedown', handleDragStart);
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Calculate movement delta using screen coordinates
        currentX = e.screenX - initialX;
        currentY = e.screenY - initialY;
        
        // Only send drag event if there's actual movement
        if (currentX !== 0 || currentY !== 0) {
            ipcRenderer.send('window-drag', { x: currentX, y: currentY });
        }
        
        initialX = e.screenX;
        initialY = e.screenY;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Prevent drag ghost image
    dragRegion.addEventListener('dragstart', (e) => e.preventDefault());
    compactDragRegion.addEventListener('dragstart', (e) => e.preventDefault());
}

// Mode switching
function switchMode(mode) {
    // Don't update state.mode for settings/about
    if (mode === 'timer' || mode === 'stopwatch') {
        state.mode = mode;
        // Update compact indicator
        elements.compactModeIndicator.textContent = mode === 'timer' ? 'T' : 'S';
    }
    
    // Update tabs
    elements.modeTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    // Update content
    Object.keys(elements.modeContents).forEach(key => {
        if (elements.modeContents[key]) {
            elements.modeContents[key].classList.toggle('active', key === mode);
        }
    });
    
    updateDisplay();
}

// Preset tab switching
function switchPresetTab(tab) {
    elements.presetTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tab);
    });
    
    Object.keys(elements.presetContents).forEach(key => {
        elements.presetContents[key].classList.toggle('active', key === tab);
    });
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Timer functions
function toggleTimer() {
    if (state.timer.isRunning) {
        stopTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (state.timer.remaining <= 0) {
        state.timer.remaining = state.timer.duration;
    }
    
    state.timer.isRunning = true;
    state.timer.intervalId = setInterval(() => {
        state.timer.remaining -= 0.1;
        
        if (state.timer.remaining <= 0) {
            state.timer.remaining = 0;
            stopTimer();
            showNotification();
        }
        
        updateDisplay();
        updateProgress();
    }, 100);
    
    updateControls();
}

function stopTimer() {
    state.timer.isRunning = false;
    if (state.timer.intervalId) {
        clearInterval(state.timer.intervalId);
        state.timer.intervalId = null;
    }
    updateControls();
}

function resetTimer() {
    stopTimer();
    state.timer.remaining = state.timer.duration;
    updateDisplay();
    updateProgress();
}

function setTimerDuration(seconds, label) {
    state.timer.duration = seconds;
    state.timer.remaining = seconds;
    state.timer.preset = label;
    elements.presetLabel.textContent = label;
    elements.compactPreset.textContent = label;
    updateDisplay();
    updateProgress();
}

// Stopwatch functions
function toggleStopwatch() {
    if (state.stopwatch.isRunning) {
        stopStopwatch();
    } else {
        startStopwatch();
    }
}

function startStopwatch() {
    if (!state.stopwatch.startTime) {
        state.stopwatch.startTime = Date.now() - state.stopwatch.elapsed;
    }
    
    state.stopwatch.isRunning = true;
    state.stopwatch.intervalId = setInterval(() => {
        state.stopwatch.elapsed = Date.now() - state.stopwatch.startTime;
        updateDisplay();
    }, 10);
    
    updateControls();
}

function stopStopwatch() {
    state.stopwatch.isRunning = false;
    if (state.stopwatch.intervalId) {
        clearInterval(state.stopwatch.intervalId);
        state.stopwatch.intervalId = null;
    }
    updateControls();
}

function resetStopwatch() {
    stopStopwatch();
    state.stopwatch.startTime = null;
    state.stopwatch.elapsed = 0;
    state.stopwatch.laps = [];
    updateDisplay();
    updateLaps();
}

function addLap() {
    if (!state.stopwatch.isRunning) return;
    
    const lapTime = state.stopwatch.elapsed;
    state.stopwatch.laps.unshift({
        number: state.stopwatch.laps.length + 1,
        time: lapTime
    });
    
    updateLaps();
}

// Custom time
function setCustomTime() {
    const hours = parseInt(elements.hoursInput.value || 0);
    const minutes = parseInt(elements.minutesInput.value || 0);
    const seconds = parseInt(elements.secondsInput.value || 0);
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
        const label = formatCustomLabel(hours, minutes, seconds);
        setTimerDuration(totalSeconds, label);
    }
}

function saveCustomTime() {
    const hours = parseInt(elements.hoursInput.value || 0);
    const minutes = parseInt(elements.minutesInput.value || 0);
    const seconds = parseInt(elements.secondsInput.value || 0);
    
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    
    if (totalSeconds > 0) {
        const label = formatCustomLabel(hours, minutes, seconds);
        state.favorites.push({ seconds: totalSeconds, label });
        saveFavorites();
        loadFavorites();
        
        // Clear inputs
        elements.hoursInput.value = '';
        elements.minutesInput.value = '';
        elements.secondsInput.value = '';
    }
}

function formatCustomLabel(hours, minutes, seconds) {
    const t = translations[settings.language];
    const parts = [];
    if (hours > 0) parts.push(`${hours} ${t.hr}`);
    if (minutes > 0) parts.push(`${minutes} ${t.min}`);
    if (seconds > 0) parts.push(`${seconds} ${t.sec}`);
    return parts.join(' ') || `0 ${t.sec}`;
}

// Favorites
function loadFavorites() {
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = '';
    
    state.favorites.forEach((fav, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'favorite-preset';
        
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = fav.label;
        btn.onclick = () => setTimerDuration(fav.seconds, fav.label);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-favorite';
        deleteBtn.textContent = '✕';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteFavorite(index);
        };
        
        wrapper.appendChild(btn);
        wrapper.appendChild(deleteBtn);
        grid.appendChild(wrapper);
    });
}

function deleteFavorite(index) {
    state.favorites.splice(index, 1);
    saveFavorites();
    loadFavorites();
}

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(state.favorites));
}

// Display updates
function updateDisplay() {
    if (state.mode === 'timer') {
        const time = formatTime(state.timer.remaining);
        elements.timerDisplay.textContent = time;
        elements.compactTime.textContent = time;
        
        // Warning state
        const isWarning = state.timer.remaining > 0 && state.timer.remaining <= 10;
        elements.timerDisplay.classList.toggle('warning', isWarning);
    } else {
        const time = formatTime(state.stopwatch.elapsed / 1000);
        const ms = formatMilliseconds(state.stopwatch.elapsed);
        
        elements.stopwatchDisplay.textContent = time;
        elements.millisecondsDisplay.textContent = ms;
        elements.compactTime.textContent = time;
        elements.compactPreset.textContent = '';
    }
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function formatMilliseconds(ms) {
    return `.${String(Math.floor(ms % 1000)).padStart(3, '0')}`;
}

function pad(num) {
    return String(num).padStart(2, '0');
}

function updateProgress() {
    if (state.mode === 'timer') {
        const progress = state.timer.duration > 0 
            ? (state.timer.duration - state.timer.remaining) / state.timer.duration 
            : 0;
        const offset = 565.48 * (1 - progress);
        elements.progressRing.style.strokeDashoffset = offset;
    }
}

function updateLaps() {
    elements.lapsList.innerHTML = '';
    
    state.stopwatch.laps.forEach(lap => {
        const div = document.createElement('div');
        div.className = 'lap-item';
        div.innerHTML = `
            <span>${translations[settings.language].lapNumber} ${lap.number}</span>
            <span>${formatTime(lap.time / 1000)}${formatMilliseconds(lap.time)}</span>
        `;
        elements.lapsList.appendChild(div);
    });
}

function updateControls() {
    const t = translations[settings.language];
    
    // Timer controls
    if (state.timer.isRunning) {
        elements.timerStartStop.innerHTML = `<span class="btn-icon">⏸</span><span class="btn-text">${t.stop}</span>`;
        elements.timerStartStop.classList.remove('start-btn');
        elements.timerStartStop.classList.add('stop-btn');
    } else {
        elements.timerStartStop.innerHTML = `<span class="btn-icon">▶</span><span class="btn-text">${t.start}</span>`;
        elements.timerStartStop.classList.add('start-btn');
        elements.timerStartStop.classList.remove('stop-btn');
    }
    
    // Stopwatch controls
    if (state.stopwatch.isRunning) {
        elements.stopwatchStartStop.innerHTML = `<span class="btn-icon">⏸</span><span class="btn-text">${t.stop}</span>`;
        elements.stopwatchStartStop.classList.remove('start-btn');
        elements.stopwatchStartStop.classList.add('stop-btn');
        elements.stopwatchLap.disabled = false;
    } else {
        elements.stopwatchStartStop.innerHTML = `<span class="btn-icon">▶</span><span class="btn-text">${t.start}</span>`;
        elements.stopwatchStartStop.classList.add('start-btn');
        elements.stopwatchStartStop.classList.remove('stop-btn');
        elements.stopwatchLap.disabled = true;
    }
    
    // Compact controls
    const isRunning = state.mode === 'timer' ? state.timer.isRunning : state.stopwatch.isRunning;
    if (isRunning) {
        elements.compactStartStop.textContent = '⏸';
        elements.compactStartStop.classList.remove('start');
        elements.compactStartStop.classList.add('stop');
    } else {
        elements.compactStartStop.textContent = '▶';
        elements.compactStartStop.classList.add('start');
        elements.compactStartStop.classList.remove('stop');
    }
}

// Compact mode
function toggleCompactMode(compact, fromIPC = false) {
    state.isCompact = compact;
    
    if (compact) {
        elements.normalView.style.display = 'none';
        elements.compactView.classList.add('active');
        elements.compactView.style.display = 'flex';
        document.querySelector('.title-bar').style.display = 'none';
        
        // Set exact dimensions and prevent overflow
        const app = document.querySelector('.app');
        const body = document.body;
        
        app.style.height = '50px';
        app.style.width = '290px';
        app.style.maxWidth = '290px';
        app.style.maxHeight = '50px';
        app.style.overflow = 'hidden';
        app.classList.add('compact-mode');
        
        // Also constrain body to prevent invisible click areas
        body.style.width = '290px';
        body.style.height = '50px';
        body.style.maxWidth = '290px';
        body.style.maxHeight = '50px';
        body.style.overflow = 'hidden';
        body.classList.add('compact-mode');
    } else {
        elements.normalView.style.display = 'flex';
        elements.compactView.classList.remove('active');
        elements.compactView.style.display = 'none';
        document.querySelector('.title-bar').style.display = 'flex';
        
        // Restore normal dimensions
        const app = document.querySelector('.app');
        const body = document.body;
        
        app.style.height = '100vh';
        app.style.width = '100%';
        app.style.maxWidth = '';
        app.style.maxHeight = '';
        app.style.overflow = '';
        app.classList.remove('compact-mode');
        
        // Restore body dimensions
        body.style.width = '';
        body.style.height = '';
        body.style.maxWidth = '';
        body.style.maxHeight = '';
        body.style.overflow = '';
        body.classList.remove('compact-mode');
    }
    
    // Update compact controls based on current state
    updateControls();
    updateDisplay();
    
    // Only send IPC if not initiated by IPC message
    if (!fromIPC) {
        ipcRenderer.send('toggle-compact', compact);
    }
}

// Notification
function showNotification() {
    // Show in-app notification with translation
    const notificationText = elements.notification.querySelector('.notification-text');
    if (notificationText) {
        notificationText.textContent = translations[settings.language].timeUp;
    }
    elements.notification.classList.add('show');
    
    // Show system notification
    if (Notification.permission === 'granted') {
        const notification = new Notification('DinoxTech Timer', {
            body: `${translations[settings.language].timeUp} ⏰`,
            icon: 'assets/icon.png',
            silent: false
        });
        
        notification.onclick = () => {
            ipcRenderer.send('show-window');
        };
        
        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }
    
    // Play a more pleasant notification sound (bell/chime sound)
    playNotificationSound();
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, 3000);
}

// Pleasant notification sound - Harry Potter bell theme (справжні дзвіночки)
function playNotificationSound() {
    // Create audio context for better sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Правильна мелодія Гаррі Поттера (Hedwig's Theme) - перші 8 нот (швидший темп)
    const speedFactor = 0.7; // Прискорення мелодії
    const notes = [
        { freq: 493.88, time: 0, duration: 0.35 },       // B4
        { freq: 659.25, time: 0.35, duration: 0.5 },     // E5 (довша)
        { freq: 783.99, time: 0.85, duration: 0.18 },    // G5  
        { freq: 739.99, time: 1.03, duration: 0.35 },    // F#5
        { freq: 659.25, time: 1.38, duration: 0.7 },     // E5 (довга)
        { freq: 987.77, time: 2.08, duration: 0.35 },    // B5
        { freq: 880.00, time: 2.43, duration: 1.0 },     // A5 (довга)
        { freq: 739.99, time: 3.43, duration: 1.0 },     // F#5 (довга)
    ];
    
    // Справжній звук дзвіночків (glockenspiel/celesta) - покращений
    const volumeMultiplier = settings.notificationVolume / 100;
    
    notes.forEach(note => {
        // Основний тон - чистий дзвін
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Синусоїда для чистого дзвону
        oscillator.type = 'sine';
        oscillator.frequency.value = note.freq;
        
        // Миттєва атака та швидке затухання як у дзвіночків
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        gainNode.gain.linearRampToValueAtTime(0.5 * volumeMultiplier, audioContext.currentTime + note.time + 0.002); // Гучніше і різкіше
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration + 0.8);
        
        oscillator.start(audioContext.currentTime + note.time);
        oscillator.stop(audioContext.currentTime + note.time + note.duration + 0.8);
        
        // Перший обертон для яскравості (октава)
        const overtone1 = audioContext.createOscillator();
        const overtoneGain1 = audioContext.createGain();
        
        overtone1.connect(overtoneGain1);
        overtoneGain1.connect(audioContext.destination);
        
        overtone1.type = 'sine';
        overtone1.frequency.value = note.freq * 2; // Октава
        
        overtoneGain1.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        overtoneGain1.gain.linearRampToValueAtTime(0.3 * volumeMultiplier, audioContext.currentTime + note.time + 0.001);
        overtoneGain1.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration * 0.4);
        
        overtone1.start(audioContext.currentTime + note.time);
        overtone1.stop(audioContext.currentTime + note.time + note.duration * 0.4);
        
        // Другий обертон (металевий дзвін)
        const overtone2 = audioContext.createOscillator();
        const overtoneGain2 = audioContext.createGain();
        
        overtone2.connect(overtoneGain2);
        overtoneGain2.connect(audioContext.destination);
        
        overtone2.type = 'sine';
        overtone2.frequency.value = note.freq * 2.76; // Характерний обертон celesta
        
        overtoneGain2.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        overtoneGain2.gain.linearRampToValueAtTime(0.25 * volumeMultiplier, audioContext.currentTime + note.time + 0.001);
        overtoneGain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration * 0.3);
        
        overtone2.start(audioContext.currentTime + note.time);
        overtone2.stop(audioContext.currentTime + note.time + note.duration * 0.3);
        
        // Третій обертон для блискучого звуку
        const overtone3 = audioContext.createOscillator();
        const overtoneGain3 = audioContext.createGain();
        
        overtone3.connect(overtoneGain3);
        overtoneGain3.connect(audioContext.destination);
        
        overtone3.type = 'sine';
        overtone3.frequency.value = note.freq * 5.4; // Високий обертон
        
        overtoneGain3.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        overtoneGain3.gain.linearRampToValueAtTime(0.15 * volumeMultiplier, audioContext.currentTime + note.time + 0.001);
        overtoneGain3.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration * 0.15);
        
        overtone3.start(audioContext.currentTime + note.time);
        overtone3.stop(audioContext.currentTime + note.time + note.duration * 0.15);
        
        // Четвертий обертон для кришталевого звуку
        const overtone4 = audioContext.createOscillator();
        const overtoneGain4 = audioContext.createGain();
        
        overtone4.connect(overtoneGain4);
        overtoneGain4.connect(audioContext.destination);
        
        overtone4.type = 'sine';
        overtone4.frequency.value = note.freq * 8.5; // Дуже високий обертон
        
        overtoneGain4.gain.setValueAtTime(0, audioContext.currentTime + note.time);
        overtoneGain4.gain.linearRampToValueAtTime(0.08 * volumeMultiplier, audioContext.currentTime + note.time + 0.001);
        overtoneGain4.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + note.time + note.duration * 0.1);
        
        overtone4.start(audioContext.currentTime + note.time);
        overtone4.stop(audioContext.currentTime + note.time + note.duration * 0.1);
    });
}

// IPC listeners
ipcRenderer.on('toggle-compact', (event, compact) => {
    toggleCompactMode(compact, true);
});

// Initialize app
init();

// Expose state to main process for tray tooltip updates
window.timerState = {
    mode: state.mode,
    timerRemaining: state.timer.remaining,
    timerRunning: state.timer.isRunning,
    stopwatchElapsed: state.stopwatch.elapsed,
    stopwatchRunning: state.stopwatch.isRunning
};

// Update exposed state periodically
setInterval(() => {
    window.timerState = {
        mode: state.mode,
        timerRemaining: state.timer.remaining,
        timerRunning: state.timer.isRunning,
        stopwatchElapsed: state.stopwatch.elapsed,
        stopwatchRunning: state.stopwatch.isRunning
    };
}, 100);