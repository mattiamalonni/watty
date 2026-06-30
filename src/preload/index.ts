import { contextBridge, ipcRenderer } from 'electron'
import type { DailySummary, DrinkEvent } from '../main/db'
import type { Prefs } from '../main/prefs'

const api = {
  prefs: {
    get: (): Promise<Prefs> => ipcRenderer.invoke('prefs:get'),
    set: (prefs: Prefs): Promise<void> => ipcRenderer.invoke('prefs:set', prefs)
  },
  events: {
    getDaily: (date: string): Promise<DrinkEvent[]> =>
      ipcRenderer.invoke('events:getDaily', date),
    getWeekly: (): Promise<DailySummary[]> =>
      ipcRenderer.invoke('events:getWeekly'),
    log: (type: 'drink' | 'snooze' | 'missed'): Promise<void> =>
      ipcRenderer.invoke('events:log', type)
  },
  onNavigate: (callback: (page: 'settings' | 'reports') => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, page: 'settings' | 'reports'): void =>
      callback(page)
    ipcRenderer.on('navigate', handler)
    return () => ipcRenderer.removeListener('navigate', handler)
  }
}

contextBridge.exposeInMainWorld('watty', api)

export type WattyAPI = typeof api
