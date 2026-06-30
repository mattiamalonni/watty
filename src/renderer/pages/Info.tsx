import React from 'react';
import DropletIcon from '../assets/icons/droplet.svg?react';
import GitHubIcon from '../assets/icons/github.svg?react';
import PayPalIcon from '../assets/icons/paypal.svg?react';

export default function Info(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
      <div className="text-accent">
        <DropletIcon width={56} height={56} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-primary text-2xl font-semibold">Watty</h1>
        <p className="text-muted text-sm">Stay hydrated.</p>
        <p className="text-muted mt-1 text-xs">Version {__APP_VERSION__}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <a
          href="https://github.com/mattiamalonni/watty"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:text-accent/80 flex items-center gap-1.5 text-sm transition-opacity"
        >
          <GitHubIcon width={14} height={14} />
          GitHub
        </a>
        <a
          href="https://paypal.me/mattiamalonni"
          target="_blank"
          rel="noreferrer"
          className="bg-accent hover:bg-accent/90 mt-1 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity"
        >
          <PayPalIcon width={14} height={14} />
          Donate
        </a>
      </div>
    </div>
  );
}
