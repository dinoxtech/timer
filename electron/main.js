const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Create icon at startup
function createAppIcon(color1 = '#667eea', color2 = '#764ba2', mode = 'gradient') {
  const size = 256;
  const buffer = Buffer.alloc(size * size * 4);
  
  // Parse colors
  const parseColor = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 102, g: 126, b: 234 };
  };
  
  const c1 = parseColor(color1);
  const c2 = mode === 'gradient' ? parseColor(color2) : c1;
  
  // Fill with gradient or solid color
  // Note: Buffer format is BGRA on Windows/Linux, not RGBA
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const t = mode === 'gradient' ? (x + y) / (size * 2) : 0;
      buffer[idx] = Math.floor(c1.b + (c2.b - c1.b) * t);      // Blue channel first
      buffer[idx + 1] = Math.floor(c1.g + (c2.g - c1.g) * t);  // Green channel
      buffer[idx + 2] = Math.floor(c1.r + (c2.r - c1.r) * t);  // Red channel last
      buffer[idx + 3] = 255;                                   // Alpha
    }
  }
  
  // Draw clock circle and hands
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 80;
  
  // Circle
  for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
    for (let r = radius - 4; r <= radius + 4; r++) {
      const x = Math.floor(centerX + r * Math.cos(angle));
      const y = Math.floor(centerY + r * Math.sin(angle));
      if (x >= 0 && x < size && y >= 0 && y < size) {
        const idx = (y * size + x) * 4;
        buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = 255;
        buffer[idx + 3] = 230;
      }
    }
  }
  
  // Clock hands and center
  for (let i = -40; i <= 30; i++) {
    for (let w = -4; w <= 4; w++) {
      // Vertical hand
      if (i <= 0) {
        const x = centerX + w;
        const y = centerY + i;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const idx = (y * size + x) * 4;
          buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
        }
      }
      // Diagonal hand
      if (i >= 0) {
        const x = centerX + i;
        const y = centerY + i;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const idx = (y * size + x) * 4;
          buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
        }
      }
    }
  }
  
  // Center dot
  for (let dy = -10; dy <= 10; dy++) {
    for (let dx = -10; dx <= 10; dx++) {
      if (dx * dx + dy * dy <= 100) {
        const x = centerX + dx;
        const y = centerY + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          const idx = (y * size + x) * 4;
          buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
        }
      }
    }
  }
  
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

const appIcon = createAppIcon();

// Disable hardware acceleration to avoid Vulkan warnings
app.disableHardwareAcceleration();

let mainWindow;
let tray;
let isCompact = false;
let updateInterval = null;
let currentTheme = {
  color1: '#667eea',
  color2: '#764ba2',
  mode: 'gradient'
};

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: 420,
    height: 600,
    x: width - 440,
    y: 20,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    },
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: false,
    icon: appIcon
  });
  
  // Set the icon again after window creation to ensure it shows in taskbar
  mainWindow.setIcon(appIcon);

  mainWindow.loadFile('index.html');
  
  // Prevent window from being hidden on minimize
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
  
  // Ensure the window continues to run in the background
  mainWindow.on('hide', () => {
    // Window is hidden but still running
  });
  
  mainWindow.on('show', () => {
    // Window is shown again
    mainWindow.focus();
  });
}

function createTray() {
  try {
    // Try different icon paths
    let iconPath = path.join(__dirname, 'assets', 'icon.png');
    let trayIcon;
    
    // First try to load the main icon
    if (fs.existsSync(iconPath)) {
      trayIcon = nativeImage.createFromPath(iconPath);
      // Resize icon for tray
      if (!trayIcon.isEmpty()) {
        trayIcon = trayIcon.resize({ width: 16, height: 16 });
      }
    }
    
    // If main icon doesn't work, try SVG
    if (!trayIcon || trayIcon.isEmpty()) {
      iconPath = path.join(__dirname, 'assets', 'icon.svg');
      if (fs.existsSync(iconPath)) {
        // For SVG, we need to read and convert differently
        // Electron doesn't support SVG directly in tray, so we'll use PNG fallback
        iconPath = path.join(__dirname, 'assets', 'icon.png');
        if (fs.existsSync(iconPath)) {
          trayIcon = nativeImage.createFromPath(iconPath);
          if (!trayIcon.isEmpty()) {
            trayIcon = trayIcon.resize({ width: 16, height: 16 });
          }
        }
      }
    }
    
    // If still no icon, create one with default theme
    if (!trayIcon || trayIcon.isEmpty()) {
      trayIcon = createTrayIcon();
    }
    
    tray = new Tray(trayIcon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Показати таймер',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Компактний режим',
        type: 'checkbox',
        checked: false,
        click: (menuItem) => {
          toggleCompactMode(menuItem.checked);
        }
      },
      { type: 'separator' },
      {
        label: 'Вихід',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    
    tray.setToolTip('DinoxTech Timer');
    tray.setContextMenu(contextMenu);
    
    // Track menu open/close events
    tray.on('right-click', () => {
      trayMenuOpen = true;
    });
    
    // Menu closes when clicking outside or selecting an item
    tray.on('click', () => {
      trayMenuOpen = false;
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    });
    
    // Also close menu tracking when window focus changes
    app.on('browser-window-blur', () => {
      setTimeout(() => {
        trayMenuOpen = false;
      }, 100);
    });
    
    // Start updating tray tooltip with timer info
    startTrayUpdate();
  } catch (error) {
    console.error('Error creating tray:', error);
  }
}

function toggleCompactMode(compact) {
  isCompact = compact;
  
  // Get current window position before resizing
  const currentPosition = mainWindow.getPosition();
  const currentX = currentPosition[0];
  const currentY = currentPosition[1];
  
  if (compact) {
    mainWindow.setSize(400, 80);
    // Keep the window at the same position
    mainWindow.setPosition(currentX, currentY);
    mainWindow.setResizable(false);
  } else {
    mainWindow.setSize(420, 600);
    // Keep the window at the same position
    mainWindow.setPosition(currentX, currentY);
    mainWindow.setResizable(false);
  }
  
  // Send message to renderer after window resizes
  setTimeout(() => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('toggle-compact', compact);
    }
  }, 100);
}

// Function to create tray icon (same as app icon but smaller)
function createTrayIcon(color1 = '#667eea', color2 = '#764ba2', mode = 'gradient') {
  const size = 24; // Increased size for better visibility
  const buffer = Buffer.alloc(size * size * 4);
  
  // Parse colors
  const parseColor = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 102, g: 126, b: 234 };
  };
  
  const c1 = parseColor(color1);
  const c2 = mode === 'gradient' ? parseColor(color2) : c1;
  
  // For small tray icon, use primary color for better theme representation
  // Using average makes themes look washed out and can appear inverted
  let bgR = c1.r;
  let bgG = c1.g;
  let bgB = c1.b;
  
  console.log(`Tray icon colors - Input: ${color1}, ${color2} | RGB in tray: rgb(${bgR}, ${bgG}, ${bgB}) | HEX: #${bgR.toString(16).padStart(2,'0')}${bgG.toString(16).padStart(2,'0')}${bgB.toString(16).padStart(2,'0')}`)
  
  // Fill with solid background color
  // Note: Buffer format is BGRA on Windows/Linux, not RGBA
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      buffer[idx] = bgB;      // Blue channel first
      buffer[idx + 1] = bgG;  // Green channel
      buffer[idx + 2] = bgR;  // Red channel last
      buffer[idx + 3] = 255;  // Alpha
    }
  }
  
  // Draw clock circle (smaller version)
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = 8; // Adjusted for 24px icon
  
  // Circle outline
  for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
    const x = Math.floor(centerX + radius * Math.cos(angle));
    const y = Math.floor(centerY + radius * Math.sin(angle));
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = 255;
      buffer[idx + 3] = 255;
    }
  }
  
  // Clock hands - simplified for small size
  // Vertical hand (12 o'clock)
  for (let i = -3; i <= 0; i++) {
    const x = centerX;
    const y = centerY + i;
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
    }
  }
  
  // Horizontal hand (3 o'clock) 
  for (let i = 0; i <= 2; i++) {
    const x = centerX + i;
    const y = centerY;
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
    }
  }
  
  // Center dot
  const idx = (centerY * size + centerX) * 4;
  buffer[idx] = buffer[idx + 1] = buffer[idx + 2] = buffer[idx + 3] = 255;
  
  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size
  });
}

// Function to update tray tooltip with current timer/stopwatch
let lastMode = null; // Track the last mode to avoid unnecessary icon updates
let trayMenuOpen = false; // Track if tray menu is open

function startTrayUpdate() {
  if (updateInterval) clearInterval(updateInterval);
  
  updateInterval = setInterval(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript(`
        (() => {
          const state = window.timerState || {};
          const mode = state.mode || 'timer';
          let time = '00:00:00';
          let status = '';
          
          if (mode === 'timer') {
            const remaining = state.timerRemaining || 0;
            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            const seconds = Math.floor(remaining % 60);
            time = String(hours).padStart(2, '0') + ':' + 
                   String(minutes).padStart(2, '0') + ':' + 
                   String(seconds).padStart(2, '0');
            status = state.timerRunning ? '▶ Таймер: ' : '⏸ Таймер: ';
          } else {
            const elapsed = state.stopwatchElapsed || 0;
            const totalSeconds = elapsed / 1000;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);
            time = String(hours).padStart(2, '0') + ':' + 
                   String(minutes).padStart(2, '0') + ':' + 
                   String(seconds).padStart(2, '0');
            status = state.stopwatchRunning ? '▶ Секундомір: ' : '⏸ Секундомір: ';
          }
          
          return {
            tooltip: 'DinoxTech Timer\\n' + status + time,
            mode: mode
          };
        })()
      `).then(result => {
        if (tray && !tray.isDestroyed()) {
          // Update tooltip
          tray.setToolTip(result.tooltip || 'DinoxTech Timer');
          
          // Icon stays the same regardless of mode - no need to update based on mode
        }
      }).catch(() => {
        // Ignore errors
      });
    }
  }, 1000);
}

app.whenReady().then(() => {
  createWindow();
  createTray();
}).catch(error => {
  console.error('App initialization error:', error);
});

app.on('window-all-closed', () => {
  if (updateInterval) clearInterval(updateInterval);
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.on('toggle-compact', (event, compact) => {
  toggleCompactMode(compact);
  
  // Update tray menu - rebuild it to avoid reference errors
  if (tray && !tray.isDestroyed()) {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Показати таймер',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      {
        label: 'Компактний режим',
        type: 'checkbox',
        checked: compact,
        click: (menuItem) => {
          toggleCompactMode(menuItem.checked);
        }
      },
      { type: 'separator' },
      {
        label: 'Вихід',
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);
    tray.setContextMenu(contextMenu);
  }
});

ipcMain.on('window-drag', (event, { x, y }) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      const currentPosition = mainWindow.getPosition();
      mainWindow.setPosition(currentPosition[0] + x, currentPosition[1] + y);
    } catch (error) {
      console.error('Error moving window:', error);
    }
  }
});

ipcMain.on('minimize-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('close-window', () => {
  // Default behavior - minimize to tray
  if (mainWindow) {
    mainWindow.hide();
  }
});

ipcMain.on('quit-app', () => {
  // Force quit the app
  app.isQuitting = true;
  app.quit();
});

ipcMain.on('update-close-behavior', (event, behavior) => {
  // Store close behavior preference (handled in renderer)
  // This is just for reference if needed in main process
});

ipcMain.on('show-window', () => {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  }
});

// Handle theme updates
ipcMain.on('update-theme', (event, themeData) => {
  console.log('=====================================');
  console.log('THEME UPDATE RECEIVED:');
  console.log('  Color1:', themeData.color1);
  console.log('  Color2:', themeData.color2);
  console.log('  Mode:', themeData.mode);
  console.log('=====================================');
  currentTheme = themeData;
  
  // Update app icon
  const newAppIcon = createAppIcon(themeData.color1, themeData.color2, themeData.mode);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setIcon(newAppIcon);
  }
  
  // Update tray icon with new color
  if (tray && !tray.isDestroyed()) {
    console.log('Updating tray icon with colors:', themeData.color1, themeData.color2);
    tray.setImage(createTrayIcon(themeData.color1, themeData.color2, themeData.mode));
  }
});