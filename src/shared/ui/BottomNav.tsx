import { NavLink } from 'react-router-dom';

import { ArchiveIcon, HistoryIcon, ProfileIcon, TodayIcon } from './icons';

const items = [
  { to: '/', label: '오늘', icon: TodayIcon, end: true },
  { to: '/picks', label: '지난 Pick', icon: ArchiveIcon },
  { to: '/history', label: '내 기록', icon: HistoryIcon },
  { to: '/profile', label: '프로필', icon: ProfileIcon },
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      {items.map(({ to, label, icon: MenuIcon, ...item }) => (
        <NavLink
          key={to}
          to={to}
          end={'end' in item ? item.end : false}
          className={({ isActive }) => `bottom-nav__item${isActive ? ' is-active' : ''}`}
        >
          <MenuIcon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
