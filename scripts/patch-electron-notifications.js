#!/usr/bin/env node
/**
 * Patches the local Electron.app so that macOS Notification Center works in dev:
 *
 * 1. Sets NSUserNotificationAlertStyle = alert  (alerts stay until dismissed)
 * 2. Sets CFBundleIdentifier = com.watty.app    (matches production app ID)
 * 3. Ad-hoc code-signs Electron.app             (required for UNUserNotificationCenter
 *    to show the permission dialog — unsigned apps are silently denied)
 *
 * Run automatically via the `postinstall` npm hook.
 * After first run: open System Settings → Notifications → Watty and enable alerts.
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

// Ad-hoc sign the Electron.app so macOS shows the notification permission dialog.
// Unsigned apps get UNErrorCodeNotificationsNotAllowed without any prompt.
const appPath = path.join(__dirname, '../node_modules/electron/dist/Electron.app');
try {
  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'pipe' });
  console.log('[patch-electron-notifications] Ad-hoc signed Electron.app');
  patched = true;
} catch (e) {
  console.warn('[patch-electron-notifications] codesign failed:', e.message);
}

if (!patched) {
  console.log('[patch-electron-notifications] Already patched, nothing to do.');
}
