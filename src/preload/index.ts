import { contextBridge, ipcRenderer } from 'electron';
import type { DailySummary, DrinkEvent } from '../main/db';
import type { Prefs } from '../main/prefs';

const api = {
  prefs: {
    get: (): Promise<Prefs> => ipcRenderer.invoke('prefs:get'),
    set: (prefs: Prefs): Promise<void> => ipcRenderer.invoke('prefs:set', prefs),
    reset: (): Promise<{ reset: boolean }> => ipcRenderer.invoke('prefs:reset'),
  },
  events: {
    getDaily: (date: string): Promise<DrinkEvent[]> => ipcRenderer.invoke('events:getDaily', date),
    getWeekly: (weekOffset: number = 0): Promise<DailySummary[]> => ipcRenderer.invoke('events:getWeekly', weekOffset),
    getMonthly: (monthOffset: number = 0): Promise<DailySummary[]> => ipcRenderer.invoke('events:getMonthly', monthOffset),
    getEarliestEventDate: (): Promise<string | null> => ipcRenderer.invoke('events:getEarliestEventDate'),
    log: (type: 'drink' | 'snooze' | 'missed'): Promise<void> => ipcRenderer.invoke('events:log', type),
    deleteAll: (): Promise<{ deleted: boolean }> => ipcRenderer.invoke('events:deleteAll'),
  },
  testNotification: (): Promise<void> => ipcRenderer.invoke('notification:test'),
  onNavigate: (callback: (payload: { page: 'settings' | 'reports'; tab?: 'day' | 'week' | 'month' }) => void): (() => void) => {
    const handler = (
      _: Electron.IpcRendererEvent,
      payload: { page: 'settings' | 'reports'; tab?: 'day' | 'week' | 'month' },
    ): void => callback(payload);
    ipcRenderer.on('navigate', handler);
    return () => ipcRenderer.removeListener('navigate', handler);
  },
  onNavigateMonth: (callback: (offset: number) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, payload: { offset: number }): void => callback(payload.offset);
    ipcRenderer.on('navigate:month', handler);
    return () => ipcRenderer.removeListener('navigate:month', handler);
  },
};

contextBridge.exposeInMainWorld('watty', api);

export type WattyAPI = typeof api;
