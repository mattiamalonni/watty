import { app, Notification } from 'electron';
import type { UpdateInfo } from 'electron-updater';
import { autoUpdater } from 'electron-updater';

const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

export function initUpdater(): void {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-downloaded', () => {
    new Notification({
      title: 'Watty update ready',
      body: 'A new version has been downloaded and will be installed on next restart.',
    }).show();
  });

  autoUpdater.on('error', (err) => {
    console.error('[updater] error:', err.message);
  });

  // Check on startup (after a short delay to avoid blocking launch)
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {
      /* offline or no release */
    });
  }, 10_000);

  // Periodic check
  setInterval(() => {
    autoUpdater.checkForUpdates().catch(() => {});
  }, CHECK_INTERVAL_MS);
}

export function checkForUpdatesManually(): void {
  const cleanup = (): void => {
    autoUpdater.removeListener('update-available', onAvailable);
    autoUpdater.removeListener('update-not-available', onNotAvailable);
    autoUpdater.removeListener('error', onError);
  };

  const onAvailable = (info: UpdateInfo): void => {
    cleanup();
    new Notification({
      title: 'Update available',
      body: `Version ${info.version} is downloading in background…`,
    }).show();
  };

  const onNotAvailable = (): void => {
    cleanup();
    new Notification({
      title: "You're up to date!",
      body: `Watty ${app.getVersion()} is the latest version.`,
    }).show();
  };

  const onError = (err: Error): void => {
    cleanup();
    new Notification({
      title: 'Update check failed',
      body: err?.message ?? 'Could not reach update server.',
    }).show();
  };

  autoUpdater.once('update-available', onAvailable);
  autoUpdater.once('update-not-available', onNotAvailable);
  autoUpdater.once('error', onError);

  autoUpdater.checkForUpdates().catch((err: Error) => {
    cleanup();
    new Notification({
      title: 'Update check failed',
      body: err?.message ?? 'Could not reach update server.',
    }).show();
  });
}

export { app };
