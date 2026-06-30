#!/usr/bin/env node
/**
 * Patches the local Electron.app Info.plist so that macOS Notification Center
 * shows notifications during development (unsigned, dev-mode runs).
 *
 * - Sets NSUserNotificationAlertStyle = alert  (makes banners appear as alerts)
 * - Sets CFBundleIdentifier = com.watty.app    (matches the production app ID)
 *
 * Run automatically via the `postinstall` npm hook.
 */

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const plistPath = path.join(__dirname, '../node_modules/electron/dist/Electron.app/Contents/Info.plist');

if (!fs.existsSync(plistPath)) {
  console.log('[patch-electron-notifications] Electron.app not found, skipping.');
  process.exit(0);
}

function plistRead(key) {
  try {
    return execFileSync('defaults', ['read', plistPath, key], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function plistWrite(key, type, value) {
  execFileSync('defaults', ['write', plistPath, key, `-${type}`, value]);
}

const alertStyle = plistRead('NSUserNotificationAlertStyle');
const bundleId = plistRead('CFBundleIdentifier');

let patched = false;

if (alertStyle !== 'alert') {
  plistWrite('NSUserNotificationAlertStyle', 'string', 'alert');
  console.log('[patch-electron-notifications] Set NSUserNotificationAlertStyle = alert');
  patched = true;
}

if (bundleId !== 'com.watty.app') {
  plistWrite('CFBundleIdentifier', 'string', 'com.watty.app');
  console.log('[patch-electron-notifications] Set CFBundleIdentifier = com.watty.app');
  patched = true;
}

if (!patched) {
  console.log('[patch-electron-notifications] Already patched, nothing to do.');
}
