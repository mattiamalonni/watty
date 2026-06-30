import React, { useEffect, useState } from 'react';
import ChartBarIcon from './assets/icons/chart-bar.svg?react';
import GearIcon from './assets/icons/gear.svg?react';
import Reports from './pages/reports';
import Settings from './pages/Settings';

type Page = 'settings' | 'reports';

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div
      className={`no-drag mx-2 my-px flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-100 ${
        active ? 'bg-accent text-white' : 'text-nav hover:bg-nav-hover hover:text-primary'
      }`}
      onClick={onClick}
    >
      <span className="flex w-5 shrink-0 items-center justify-center">{icon}</span>
      {label}
    </div>
  );
}

export default function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>('settings');
  const [reportTab, setReportTab] = useState<'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const unsubscribe = window.watty.onNavigate(({ page: p, tab }) => {
      setPage(p);
      if (tab) setReportTab(tab);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="flex h-screen overflow-hidden rounded-[10px]">
      {/* Sidebar — transparent so vibrancy shows through */}
      <nav
        className="drag border-separator flex shrink-0 flex-col border-r pt-12 pb-4"
        style={{ width: 'var(--sidebar-width)', background: 'transparent' }}
      >
        <div className="no-drag text-muted px-3.5 pb-2.5 text-xs font-semibold tracking-wider uppercase">Watty</div>
        <NavItem
          icon={<ChartBarIcon width={16} height={16} />}
          label="Reports"
          active={page === 'reports'}
          onClick={() => setPage('reports')}
        />
        <NavItem
          icon={<GearIcon width={16} height={16} />}
          label="Settings"
          active={page === 'settings'}
          onClick={() => setPage('settings')}
        />
      </nav>

      {/* Content — semi-opaque overlay over vibrancy */}
      <main className="no-drag flex-1 overflow-y-auto px-7 pt-8 pb-6" style={{ background: 'var(--content-bg)' }}>
        {page === 'settings' && <Settings />}
        {page === 'reports' && <Reports tab={reportTab} onTabChange={setReportTab} />}
      </main>
    </div>
  );
}
