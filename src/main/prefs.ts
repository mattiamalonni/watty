import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import type { Prefs } from '../utils/prefs';
import { DEFAULT_PREFS } from '../utils/prefs';

export type { Prefs } from '../utils/prefs';

function prefsPath(): string {
  return path.join(app.getPath('userData'), 'prefs.json');
}

export function loadPrefs(): Prefs {
  try {
    const raw = fs.readFileSync(prefsPath(), 'utf-8');
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function savePrefs(prefs: Prefs): void {
  fs.mkdirSync(path.dirname(prefsPath()), { recursive: true });
  fs.writeFileSync(prefsPath(), JSON.stringify(prefs, null, 2), 'utf-8');
  app.setLoginItemSettings({ openAtLogin: prefs.launchAtLogin });
}
