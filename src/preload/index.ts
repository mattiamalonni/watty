import { contextBridge, ipcRenderer } from 'electron';
import type { DailySummary, DrinkEvent } from '../main/db';
import type { Prefs } from '../main/prefs';

const api = {
  prefs: {
    get: (): Promise<Prefs> => ipcRenderer.invoke('prefs:get'),
    set: (prefs: Prefs): Promise<void> => ipcRenderer.invoke('prefs:set', prefs),
  },
  events: {
    getDaily: (date: string): Promise<DrinkEvent[]> => ipcRenderer.invoke('events:getDaily', date),
    getWeekly: (weekOffset: number = 0): Promise<DailySummary[]> => ipcRenderer.invoke('events:getWeekly', weekOffset),
    getEarliestEventDate: (): Promise<string | null> => ipcRenderer.invoke('events:getEarliestEventDate'),
    log: (type: 'drink' | 'snooze' | 'missed'): Promise<void> => ipcRenderer.invoke('events:log', type),
    deleteAll: (): Promise<{ deleted: boolean }> => ipcRenderer.invoke('events:deleteAll'),
  },
  onNavigate: (callback: (payload: { page: 'settings' | 'reports'; tab?: 'today' | 'week' }) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: { page: 'settings' | 'reports'; tab?: 'today' | 'week' }): void =>
      callback(payload);
    ipcRenderer.on('navigate', handler);
    return () => ipcRenderer.removeListener('navigate', handler);
  },
};

contextBridge.exposeInMainWorld('watty', api);

export type WattyAPI = typeof api;
