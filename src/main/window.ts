import { is } from '@electron-toolkit/utils';
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';

let win: BrowserWindow | null = null;
let isQuitting = false;

app.on('before-quit', () => {
  isQuitting = true;
});

export function createWindow(): BrowserWindow {
  win = new BrowserWindow({
    width: 820,
    height: 580,
    minWidth: 680,
    minHeight: 480,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 14 },
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    transparent: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.on('close', (e) => {
    if (isQuitting) return; // allow app to quit
    e.preventDefault();
    win?.hide();
    app.dock?.hide();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'));
  }

  return win;
}

export function showWindow(page: 'settings' | 'reports' | 'info' = 'settings', tab?: 'day' | 'week' | 'month'): void {
  if (!win) createWindow();
  const w = win;
  if (!w) return;
  w.webContents.send('navigate', { page, tab });
  if (!w.isVisible()) {
    app.dock?.show();
    w.show();
  }
  w.focus();
}

export function showMonthReport(offset: number): void {
  if (!win) createWindow();
  const w = win;
  if (!w) return;
  w.webContents.send('navigate:month', { offset });
  if (!w.isVisible()) {
    app.dock?.show();
    w.show();
  }
  w.focus();
}

export function getWindow(): BrowserWindow | null {
  return win;
}
