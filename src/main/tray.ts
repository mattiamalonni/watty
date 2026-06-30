import { app, Menu, nativeImage, Tray } from 'electron';
import path from 'path';
import { getDailyEvents, logEvent } from './db';
import { loadPrefs } from './prefs';
import { restartTimer } from './timer';
import { checkForUpdatesManually } from './updater';
import { showWindow } from './window';

let tray: Tray | null = null;

function getResourceIcon(iconName: string, template = false): Electron.NativeImage {
  const resourcesPath = app.isPackaged
    ? path.join(process.resourcesPath, iconName)
    : path.join(__dirname, '../../resources', iconName);
  try {
    const img = nativeImage.createFromPath(resourcesPath);
    if (template) img.setTemplateImage(true);
    return img;
  } catch {
    return nativeImage.createEmpty();
  }
}

export function createTray(): Tray {
  tray = new Tray(getResourceIcon('iconTemplate.png', true));
  tray.setToolTip('Watty - Stay Hydrated');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'I Drank',
      icon: getResourceIcon('dropletTemplate.png'),
      click: () => {
        logEvent('drink');
        restartTimer();
        refreshTrayTitle();
      },
    },
    { type: 'separator' },
    {
      label: 'Show Reports',
      click: () => showWindow('reports'),
    },
    {
      label: 'Open Settings',
      click: () => showWindow('settings'),
    },
    { type: 'separator' },
    {
      label: 'Check for Updates…',
      click: () => checkForUpdatesManually(),
    },
    { type: 'separator' },
    {
      label: 'Quit Watty',
      role: 'quit',
      accelerator: 'CmdOrCtrl+Q',
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Left-click also shows context menu on macOS
  tray.on('click', () => {
    tray?.popUpContextMenu();
  });

  refreshTrayTitle();

  return tray;
}

export function refreshTrayTitle(): void {
  if (!tray) return;
  const prefs = loadPrefs();
  if (!prefs.showDrinkCount) {
    tray.setTitle('');
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const events = getDailyEvents(today);
  const count = events.filter((e) => e.type === 'drink').length;
  tray.setTitle(String(count));
}

export function getTray(): Tray | null {
  return tray;
}
