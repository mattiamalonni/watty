import React, { useEffect, useState } from 'react'
import ChartBarIcon from './assets/icons/chart-bar.svg?react'
import GearIcon from './assets/icons/gear.svg?react'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

type Page = 'settings' | 'reports'

function NavItem({
  icon,
  label,
  active,
  onClick
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}): React.JSX.Element {
  return (
    <div
      className={`no-drag flex items-center gap-2 px-3 py-2 rounded-lg mx-2 my-px text-sm font-medium cursor-pointer transition-all duration-100 ${
        active
          ? 'bg-accent text-white'
          : 'text-nav hover:bg-nav-hover hover:text-primary'
      }`}
      onClick={onClick}
    >
      <span className="w-5 flex items-center justify-center shrink-0">{icon}</span>
      {label}
    </div>
  )
}

export default function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>('settings')

  useEffect(() => {
    const unsubscribe = window.watty.onNavigate((p) => setPage(p))
    return unsubscribe
  }, [])

  return (
    <div className="flex h-screen overflow-hidden rounded-[10px]">
      {/* Sidebar — transparent so vibrancy shows through */}
      <nav
        className="drag flex flex-col shrink-0 pt-12 pb-4 border-r border-separator"
        style={{ width: 'var(--sidebar-width)', background: 'transparent' }}
      >
        <div className="no-drag text-xs font-semibold text-muted uppercase tracking-wider px-3.5 pb-2.5">
          Watty
        </div>
        <NavItem icon={<GearIcon width={16} height={16} />} label="Settings" active={page === 'settings'} onClick={() => setPage('settings')} />
        <NavItem icon={<ChartBarIcon width={16} height={16} />} label="Reports" active={page === 'reports'} onClick={() => setPage('reports')} />
      </nav>

      {/* Content — semi-opaque overlay over vibrancy */}
      <main
        className="no-drag flex-1 overflow-y-auto px-7 pt-8 pb-6"
        style={{ background: 'var(--content-bg)' }}
      >
        {page === 'settings' && <Settings />}
        {page === 'reports' && <Reports />}
      </main>
    </div>
  )
}
