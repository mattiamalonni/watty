import { app, Menu, nativeImage, Tray } from 'electron'
import path from 'path'
import { checkForUpdatesManually } from './updater'
import { showWindow } from './window'

let tray: Tray | null = null

function getTrayIcon(): Electron.NativeImage {
  // In production, use bundled resource; in dev use resources/ directory
  const iconName = 'iconTemplate.png'
  const resourcesPath = app.isPackaged
    ? path.join(process.resourcesPath, iconName)
    : path.join(__dirname, '../../resources', iconName)

  try {
    const img = nativeImage.createFromPath(resourcesPath)
    img.setTemplateImage(true)
    return img
  } catch {
    // Fallback: small transparent image
    return nativeImage.createEmpty()
  }
}

export function createTray(): Tray {
  tray = new Tray(getTrayIcon())
  tray.setToolTip('Watty - Stay Hydrated')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Settings',
      click: () => showWindow('settings')
    },
    {
      label: 'Show Reports',
      click: () => showWindow('reports')
    },
    { type: 'separator' },
    {
      label: 'Check for Updates…',
      click: () => checkForUpdatesManually()
    },
    { type: 'separator' },
    {
      label: 'Quit Watty',
      role: 'quit',
      accelerator: 'CmdOrCtrl+Q'
    }
  ])

  tray.setContextMenu(contextMenu)

  // Left-click also shows context menu on macOS
  tray.on('click', () => {
    tray?.popUpContextMenu()
  })

  return tray
}

export function getTray(): Tray | null {
  return tray
}
