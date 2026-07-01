import { app } from 'electron';
import fs from 'fs';
import path from 'path';

export interface AppState {
  lastFiredDaily: string;
  lastFiredWeekly: string;
  lastFiredMonthly: string;
}

const DEFAULT_STATE: AppState = {
  lastFiredDaily: '',
  lastFiredWeekly: '',
  lastFiredMonthly: '',
};

function statePath(): string {
  return path.join(app.getPath('userData'), 'state.json');
}

export function loadState(): AppState {
  try {
    const raw = fs.readFileSync(statePath(), 'utf-8');
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state: AppState): void {
  fs.mkdirSync(path.dirname(statePath()), { recursive: true });
  fs.writeFileSync(statePath(), JSON.stringify(state, null, 2), 'utf-8');
}
